// ==========================================
// WORKER GOEON - NOTIFICATIONS PUSH
// ==========================================
//
// Seul code serveur du site. Le reste de GoEon est statique et servi tel quel
// par Cloudflare : ce Worker ne reçoit que les adresses /api/... (règle
// "run_worker_first" de wrangler.jsonc), plus le réveil du Cron chaque minute.
// Il est exclu des fichiers publics par .assetsignore.
//
// Pas de npm, pas de build : le chiffrement Web Push (RFC 8291) et la
// signature VAPID (RFC 8292) sont écrits avec WebCrypto, disponible nativement.
//
// Ce dont il a besoin dans Cloudflare (Workers > goeon > Paramètres) :
//   - un espace KV relié sous le nom ABONNES (id dans wrangler.jsonc)
//   - deux secrets : VAPID_PUBLIC et VAPID_PRIVATE (ou CLE_PRIVEE : le
//     tableau de bord a refusé d'enregistrer VAPID_PRIVATE le 21/11)
//
// Source unique des envois : evenements.json (et annonces.json pour les
// mises à jour du site), lus directement dans les fichiers du site.

// 1. RÉGLAGES GÉNÉRAUX
// ------------------------------------------
const HEURE_MATIN = 8;          // résumé du jour, à 8h00
const HEURE_VEILLE = 20;        // veille d'un jour de weekend, à 20h00
const AVANCE_MIN = 2;           // « 2 minutes avant le début »
const CALME_DEBUT = 22;         // aucun « avant » ni « fin » entre 22h…
const CALME_FIN = 7;            // … et 7h (un Lundi Dynamax commence à 5h)
const FENETRE_MIN = 10;         // un envoi raté par le Cron se rattrape pendant 10 minutes
const PAR_PASSAGE = 40;         // envois maximum par minute (limite de 50 requêtes du plan gratuit)
const CONTACT = 'mailto:contact@goeon.fr';

// Durée de vie d'une notification chez Google/Apple/Mozilla si le téléphone
// est éteint : au-delà, elle est jetée plutôt qu'affichée en retard.
const TTL = { avant: 300, fin: 1800, matin: 4 * 3600, veille: 12 * 3600, maj: 2 * 86400, test: 600 };

const REGLAGES_DEFAUT = { matin: true, avant: true, fin: false, veille: true, jours: 'tous', maj: true };

// 2. POINT D'ENTRÉE
// ------------------------------------------
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    try {
      return await api(request, url, env);
    } catch (e) {
      console.error('API :', e && e.stack || e);
      return json({ erreur: 'Erreur interne' }, 500);
    }
  },

  async scheduled(controller, env, ctx) {
    ctx.waitUntil(tourDeCron(env, controller.scheduledTime || Date.now()));
  }
};

// 3. API (appelée par la page Notifications.html, script.js §25)
// ------------------------------------------
async function api(request, url, env) {
  const route = url.pathname.replace(/\/+$/, '');

  if (route === '/api/cle' && request.method === 'GET') {
    return json({ cle: env.VAPID_PUBLIC || null });
  }
  if (request.method !== 'POST') return json({ erreur: 'Méthode non autorisée' }, 405);

  let corps;
  try { corps = await request.json(); } catch { return json({ erreur: 'Corps illisible' }, 400); }

  if (route === '/api/abonnement') {
    const ab = abonnementValide(corps && corps.abonnement);
    if (!ab) return json({ erreur: 'Abonnement invalide' }, 400);
    const reglages = reglagesValides(corps.reglages);
    const cle = await cleAbonne(ab.endpoint);
    // Les réglages vont aussi dans les métadonnées : le Cron les lit avec la
    // liste des clés, sans ouvrir chaque fiche.
    await env.ABONNES.put(cle, JSON.stringify({ abonnement: ab, reglages, maj: Date.now() }), { metadata: reglages });
    return json({ ok: true, reglages });
  }

  if (route === '/api/desabonnement') {
    if (!corps || typeof corps.endpoint !== 'string') return json({ erreur: 'Adresse manquante' }, 400);
    await env.ABONNES.delete(await cleAbonne(corps.endpoint));
    return json({ ok: true });
  }

  if (route === '/api/test') {
    if (!corps || typeof corps.endpoint !== 'string') return json({ erreur: 'Adresse manquante' }, 400);
    const cle = await cleAbonne(corps.endpoint);
    const fiche = await env.ABONNES.get(cle, 'json');
    if (!fiche) return json({ erreur: 'Abonnement inconnu' }, 404);
    // Un test par minute au plus, pour qu'un double-clic n'en envoie pas dix.
    if (fiche.dernierTest && Date.now() - fiche.dernierTest < 60000) return json({ erreur: 'Patientez une minute entre deux tests' }, 429);
    fiche.dernierTest = Date.now();
    await env.ABONNES.put(cle, JSON.stringify(fiche), { metadata: fiche.reglages });
    const statut = await envoyer(env, fiche.abonnement, {
      titre: 'GoEon',
      texte: 'Les notifications fonctionnent !',
      url: '/Notifications.html',
      tag: 'test'
    }, TTL.test, 'normal');
    if (statut === 404 || statut === 410) await env.ABONNES.delete(cle);
    return json({ ok: statut >= 200 && statut < 300, statut });
  }

  return json({ erreur: 'Adresse inconnue' }, 404);
}

function abonnementValide(ab) {
  if (!ab || typeof ab.endpoint !== 'string' || !ab.keys) return null;
  if (!/^https:\/\//.test(ab.endpoint) || ab.endpoint.length > 1000) return null;
  const { p256dh, auth } = ab.keys;
  if (typeof p256dh !== 'string' || typeof auth !== 'string') return null;
  if (!/^[A-Za-z0-9_-]+={0,2}$/.test(p256dh) || !/^[A-Za-z0-9_-]+={0,2}$/.test(auth)) return null;
  return { endpoint: ab.endpoint, keys: { p256dh, auth } };
}

function reglagesValides(r) {
  r = r || {};
  const out = {};
  for (const k of ['matin', 'avant', 'fin', 'veille', 'maj']) out[k] = k in r ? r[k] === true : REGLAGES_DEFAUT[k];
  out.jours = r.jours === 'weekend' ? 'weekend' : 'tous';
  return out;
}

async function cleAbonne(endpoint) {
  const h = new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(endpoint)));
  return 'abo:' + [...h.slice(0, 16)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}

// 4. HEURE DE PARIS
// ------------------------------------------
// Le Worker tourne en UTC. Toutes les heures de evenements.json sont des
// heures de Paris : on les convertit en instant UTC, changement d'heure
// compris (UTC+1 l'hiver, UTC+2 l'été).
const FORMAT_PARIS = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Paris', hourCycle: 'h23',
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', weekday: 'short'
});

function partiesParis(t) {
  const p = {};
  for (const x of FORMAT_PARIS.formatToParts(new Date(t))) p[x.type] = x.value;
  return { an: +p.year, mois: +p.month, jour: +p.day, h: +p.hour, mi: +p.minute, js: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday) };
}

function decalageParis(t) {
  const p = partiesParis(t);
  return Math.round((Date.UTC(p.an, p.mois - 1, p.jour, p.h, p.mi) - Math.floor(t / 60000) * 60000) / 60000);
}

function parisVersUTC(an, mois, jour, h = 0, mi = 0) {
  const naif = Date.UTC(an, mois - 1, jour, h, mi);
  let t = naif - decalageParis(naif) * 60000;
  const d2 = decalageParis(t);
  if (naif - d2 * 60000 !== t) t = naif - d2 * 60000;
  return t;
}

// "2026-11-21" ou "2026-11-21T14:00" → instant UTC
function lireDate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/.exec(s || '');
  if (!m) return null;
  return parisVersUTC(+m[1], +m[2], +m[3], m[4] ? +m[4] : 0, m[5] ? +m[5] : 0);
}

const jourISO = p => p.an + '-' + String(p.mois).padStart(2, '0') + '-' + String(p.jour).padStart(2, '0');
const ajouterJours = (iso, n) => { const [a, m, j] = iso.split('-').map(Number); return new Date(Date.UTC(a, m - 1, j + n)).toISOString().slice(0, 10); };
const jourSemaine = iso => { const [a, m, j] = iso.split('-').map(Number); return new Date(Date.UTC(a, m - 1, j)).getUTCDay(); };
const estWeekend = iso => { const d = jourSemaine(iso); return d === 0 || d === 6; };
const NOMS_JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

function heureTexte(t) {
  const p = partiesParis(t);
  return p.h + 'h' + (p.mi ? String(p.mi).padStart(2, '0') : '');
}
function dateTexte(t) {
  const p = partiesParis(t);
  return String(p.jour).padStart(2, '0') + '/' + String(p.mois).padStart(2, '0');
}
function enHeuresCalmes(t) {
  const h = partiesParis(t).h;
  return h >= CALME_DEBUT || h < CALME_FIN;
}

// 5. LECTURE DE evenements.json
// ------------------------------------------
// Chaque entrée devient un « créneau » : un titre, un jour, et si possible
// une heure de début et de fin. Les entrées pas encore officielles (« ??? »)
// sont ignorées : le site ne notifie que ce que Scopely a annoncé.
// Les rotations de raids (clé "raids") ne sont pas des évènements : elles
// ne déclenchent rien.

// "18h - 19h" → [18:00, 19:00] ; "10h" → [10:00, null] ; "10h30 - 12h" accepté
function lireHeures(s) {
  if (typeof s !== 'string') return null;
  const m = /^\s*(\d{1,2})h(\d{2})?\s*(?:-\s*(\d{1,2})h(\d{2})?)?\s*$/.exec(s);
  if (!m) return null;
  return { debut: [+m[1], +(m[2] || 0)], fin: m[3] ? [+m[3], +(m[4] || 0)] : null };
}

const nonOfficiel = (...textes) => textes.some(t => typeof t === 'string' && t.includes('???'));

function lireCreneaux(donnees) {
  const vus = new Map();
  for (const mois of (donnees && donnees.mois) || []) {
    for (const e of mois.evenements || []) {
      if (nonOfficiel(e.nom)) continue;
      const debut = lireDate(e.debut), fin = lireDate(e.fin);
      if (debut == null) continue;
      const id = 'ev|' + e.nom + '|' + e.debut;
      vus.set(id, { id, long: true, titre: e.nom, debut, fin, jour: jourISO(partiesParis(debut)), page: e.page || null });
    }
    for (const q of mois.quotidiens || []) {
      if (nonOfficiel(q.court, q.long, q.heures)) continue;
      const premier = q.debut, dernier = q.fin || q.debut;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(premier || '')) continue;
      // Bloc commun à deux évènements du même jour (CD + retour d'un
      // légendaire…) : sa clé facultative "creneaux" donne à chacun son nom
      // et ses heures, pour qu'ils aient chacun leurs notifications. Le
      // calendrier (§19) ignore cette clé.
      // "creneaux": [{ "nom": "Community Day Scalpion", "heures": "14h - 17h" }, …]
      const parties = Array.isArray(q.creneaux) && q.creneaux.length
        ? q.creneaux.filter(c => c && c.nom && !nonOfficiel(c.nom, c.heures))
        : [{ nom: q.long || q.court, heures: q.heures }];
      for (let j = premier, n = 0; j <= dernier && n < 31; j = ajouterJours(j, 1), n++) {
        const [a, m, d] = j.split('-').map(Number);
        for (const partie of parties) {
          const h = lireHeures(partie.heures);
          const id = 'q|' + (q.categorie || '') + '|' + partie.nom + '|' + j;
          vus.set(id, {
            id, long: false,
            titre: partie.nom,
            heures: h ? partie.heures.replace(/\s*-\s*/, ' - ') : null,
            debut: h ? parisVersUTC(a, m, d, h.debut[0], h.debut[1]) : null,
            fin: h && h.fin ? parisVersUTC(a, m, d, h.fin[0], h.fin[1]) : null,
            jour: j,
            page: q.page || null
          });
        }
      }
    }
  }
  return [...vus.values()];
}

// 6. CALCUL DES MOMENTS D'ENVOI
// ------------------------------------------
// Un « moment » = une notification à envoyer à un instant donné, à tous les
// abonnés qui l'ont demandée. Son id sert à ne jamais l'envoyer deux fois.

const lienPage = c => '/' + (c.page || 'Calendrier.html');

// Lignes du résumé d'un jour (matin et veille), triées par heure.
// « debut » marque le début d'un évènement long : cette ligne saute du
// résumé du matin pour ceux qui reçoivent déjà le « 2 minutes avant ».
function lignesDuJour(creneaux, jour) {
  const lignes = [];
  for (const c of creneaux) {
    if (c.long) {
      if (c.jour === jour) lignes.push({ t: c.debut, x: 'Début : ' + c.titre + ' à ' + heureTexte(c.debut), debut: true });
      if (c.fin != null && jourISO(partiesParis(c.fin)) === jour) lignes.push({ t: c.fin, x: 'Fin : ' + c.titre + ' à ' + heureTexte(c.fin) });
    } else if (c.jour === jour) {
      lignes.push({ t: c.debut != null ? c.debut : lireDate(jour), x: c.titre + (c.heures ? ' : ' + c.heures : '') });
    }
  }
  return lignes.sort((a, b) => a.t - b.t);
}

function calculerMoments(creneaux, annonces, depuis, jusqua) {
  const moments = [];
  const dans = t => t != null && t > depuis && t <= jusqua;

  for (const c of creneaux) {
    // 2 minutes avant le début
    const tAvant = c.debut != null ? c.debut - AVANCE_MIN * 60000 : null;
    if (dans(tAvant) && !enHeuresCalmes(c.debut)) {
      moments.push({
        id: 'avant|' + c.id, type: 'avant', t: tAvant, weekend: estWeekend(c.jour),
        message: {
          titre: c.titre,
          texte: c.long
            ? 'Commence dans ' + AVANCE_MIN + ' minutes' + (c.fin != null ? ', jusqu\'au ' + dateTexte(c.fin) + ' à ' + heureTexte(c.fin) : '')
            : 'Commence dans ' + AVANCE_MIN + ' minutes' + (c.heures ? ' (' + c.heures + ')' : ''),
          url: lienPage(c), tag: 'avant-' + c.id
        }
      });
    }
    // À la fin : seulement les gros évènements sur plusieurs jours. La fin
    // d'une Heure de Raid ou d'un Lundi Dynamax n'apporte rien (décidé par
    // Cam le 21/11).
    if (c.long && dans(c.fin) && !enHeuresCalmes(c.fin)) {
      moments.push({
        id: 'fin|' + c.id, type: 'fin', t: c.fin, weekend: estWeekend(jourISO(partiesParis(c.fin))),
        message: { titre: c.titre, texte: 'C\'est terminé !', url: lienPage(c), tag: 'fin-' + c.id }
      });
    }
  }

  // Résumé du matin et veille du weekend : un par jour concerné
  const jours = new Set();
  for (let t = depuis; t <= jusqua + 86400000; t += 3600000) jours.add(jourISO(partiesParis(t)));
  for (const jour of jours) {
    const [a, m, d] = jour.split('-').map(Number);
    const tMatin = parisVersUTC(a, m, d, HEURE_MATIN, 0);
    if (dans(tMatin)) {
      const lignes = lignesDuJour(creneaux, jour);
      const sansDebuts = lignes.filter(l => !l.debut);
      const message = l => ({ titre: 'Aujourd\'hui sur Pokémon Go', texte: l.map(x => x.x).join('\n'), url: '/Calendrier.html', tag: 'matin-' + jour });
      if (lignes.length) moments.push({
        id: 'matin|' + jour, type: 'matin', t: tMatin, weekend: estWeekend(jour),
        message: message(lignes),
        // Version pour les abonnés au « 2 minutes avant » : sans les débuts
        // d'évènements longs, qu'ils recevront à l'heure (pas de doublon).
        // null = rien d'autre ce jour-là, on ne leur envoie pas de résumé.
        messageAvecAvant: sansDebuts.length ? message(sansDebuts) : null
      });
    }
    // La veille au soir d'un samedi ou d'un dimanche (donc vendredi et samedi à 20h)
    const lendemain = ajouterJours(jour, 1);
    const tVeille = parisVersUTC(a, m, d, HEURE_VEILLE, 0);
    if (estWeekend(lendemain) && dans(tVeille)) {
      const lignes = lignesDuJour(creneaux, lendemain);
      if (lignes.length) moments.push({
        id: 'veille|' + lendemain, type: 'veille', t: tVeille, weekend: true,
        message: { titre: 'Demain, ' + NOMS_JOURS[jourSemaine(lendemain)], texte: lignes.map(l => l.x).join('\n'), url: '/Calendrier.html', tag: 'veille-' + lendemain }
      });
    }
  }

  // Mises à jour du site (annonces.json), envoyées à la date indiquée
  for (const an of (annonces && annonces.annonces) || []) {
    if (!an || !an.id || !an.titre) continue;
    const t = lireDate(an.date);
    if (!dans(t)) continue;
    moments.push({
      id: 'maj|' + an.id, type: 'maj', t, weekend: true,
      message: { titre: an.titre, texte: an.texte || '', url: '/' + (an.page || 'index.html'), tag: 'maj-' + an.id }
    });
  }

  return moments.sort((a, b) => a.t - b.t);
}

function veut(reglages, moment) {
  const r = reglages || REGLAGES_DEFAUT;
  if (moment.type === 'maj') return r.maj === true;
  if (r[moment.type] !== true) return false;
  return r.jours !== 'weekend' || moment.weekend;
}

// 7. LE CRON (chaque minute)
// ------------------------------------------
// Chaque minute : on regarde ce qui tombe dans les 10 dernières minutes.
// Un moment déjà fini est marqué « envoi:<id> = fini » dans KV. Au-delà de
// PAR_PASSAGE abonnés, l'envoi se poursuit à la minute suivante, à partir du
// dernier abonné servi (les clés KV sont listées dans l'ordre alphabétique).
async function lireFichier(env, nom) {
  const r = await env.ASSETS.fetch(new Request('https://goeon.fr/' + nom));
  if (!r.ok) return null;
  try { return await r.json(); } catch { return null; }
}

async function tourDeCron(env, maintenant) {
  const [evenements, annonces] = await Promise.all([lireFichier(env, 'evenements.json'), lireFichier(env, 'annonces.json')]);
  if (!evenements) { console.error('Cron : evenements.json illisible'); return; }

  const moments = calculerMoments(lireCreneaux(evenements), annonces, maintenant - FENETRE_MIN * 60000, maintenant);
  if (!moments.length) return;

  let budget = PAR_PASSAGE;
  let abonnes = null; // listés une seule fois par passage, et seulement s'il y a quelque chose à envoyer

  for (const moment of moments) {
    if (budget <= 0) break;
    const cleEnvoi = 'envoi:' + moment.id;
    const etat = await env.ABONNES.get(cleEnvoi);
    if (etat === 'fini') continue;

    if (!abonnes) abonnes = await listerAbonnes(env);
    const reste = abonnes.filter(a => veut(a.reglages, moment) && (!etat || a.cle > etat));
    const lot = reste.slice(0, budget);
    budget -= lot.length;

    await Promise.all(lot.map(async a => {
      const msg = messagePour(a.reglages, moment);
      if (!msg) return;
      const fiche = await env.ABONNES.get(a.cle, 'json');
      if (!fiche) return;
      const statut = await envoyer(env, fiche.abonnement, msg, TTL[moment.type], moment.type === 'avant' ? 'high' : 'normal');
      // 404/410 : le navigateur a retiré l'abonnement (appli désinstallée…)
      if (statut === 404 || statut === 410) await env.ABONNES.delete(a.cle);
    }));

    const fini = lot.length === reste.length;
    await env.ABONNES.put(cleEnvoi, fini ? 'fini' : lot[lot.length - 1].cle, { expirationTtl: 3 * 86400 });
    console.log('Envoi', moment.id, ':', lot.length, 'notification(s)', fini ? '' : '(suite à la minute suivante)');
  }
}

function messagePour(reglages, moment) {
  if ('messageAvecAvant' in moment && reglages && reglages.avant === true) return moment.messageAvecAvant;
  return moment.message;
}

async function listerAbonnes(env) {
  const out = [];
  let curseur;
  do {
    const page = await env.ABONNES.list({ prefix: 'abo:', cursor: curseur });
    for (const k of page.keys) out.push({ cle: k.name, reglages: k.metadata });
    curseur = page.list_complete ? null : page.cursor;
  } while (curseur);
  return out.sort((a, b) => (a.cle < b.cle ? -1 : 1));
}

// 8. ENVOI WEB PUSH (chiffrement RFC 8291 + VAPID RFC 8292)
// ------------------------------------------
const enc = new TextEncoder();

function b64uVersOctets(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/').replace(/=+$/, '');
  const bin = atob(s + '==='.slice((s.length + 3) % 4));
  return Uint8Array.from(bin, c => c.charCodeAt(0));
}
function octetsVersB64u(o) {
  o = new Uint8Array(o);
  let bin = '';
  for (let i = 0; i < o.length; i++) bin += String.fromCharCode(o[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function concat(...parts) {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let i = 0;
  for (const p of parts) { out.set(p, i); i += p.length; }
  return out;
}

async function hkdf(sel, ikm, info, longueur) {
  const cle = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt: sel, info }, cle, longueur * 8));
}

async function chiffrer(abonnement, texte) {
  const cleNavigateur = b64uVersOctets(abonnement.keys.p256dh);
  const auth = b64uVersOctets(abonnement.keys.auth);

  const locale = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const clePubLocale = new Uint8Array(await crypto.subtle.exportKey('raw', locale.publicKey));
  const pubNavigateur = await crypto.subtle.importKey('raw', cleNavigateur, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const secret = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: pubNavigateur }, locale.privateKey, 256));

  const ikm = await hkdf(auth, secret, concat(enc.encode('WebPush: info\0'), cleNavigateur, clePubLocale), 32);
  const sel = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(sel, ikm, enc.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(sel, ikm, enc.encode('Content-Encoding: nonce\0'), 12);

  const cleAes = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const chiffre = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, cleAes, concat(enc.encode(texte), new Uint8Array([2]))));

  // En-tête aes128gcm : sel (16) | taille d'enregistrement (4) | longueur de clé (1) | clé publique (65)
  const entete = new Uint8Array(21);
  entete.set(sel, 0);
  new DataView(entete.buffer).setUint32(16, 4096);
  entete[20] = clePubLocale.length;
  return concat(entete, clePubLocale, chiffre);
}

const jetons = new Map(); // un jeton VAPID par service de push, réutilisé ~12h

async function enteteVapid(env, endpoint) {
  const aud = new URL(endpoint).origin;
  const memo = jetons.get(aud);
  if (memo && memo.exp - 3600 > Date.now() / 1000) return memo.entete;

  const pub = b64uVersOctets(env.VAPID_PUBLIC);
  const jwk = { kty: 'EC', crv: 'P-256', x: octetsVersB64u(pub.slice(1, 33)), y: octetsVersB64u(pub.slice(33, 65)), d: env.VAPID_PRIVATE || env.CLE_PRIVEE, ext: true };
  const cle = await crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);

  const exp = Math.floor(Date.now() / 1000) + 12 * 3600;
  const tete = octetsVersB64u(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const charge = octetsVersB64u(enc.encode(JSON.stringify({ aud, exp, sub: CONTACT })));
  const signature = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, cle, enc.encode(tete + '.' + charge));
  const entete = 'vapid t=' + tete + '.' + charge + '.' + octetsVersB64u(signature) + ', k=' + env.VAPID_PUBLIC;
  jetons.set(aud, { exp, entete });
  return entete;
}

async function envoyer(env, abonnement, message, ttl, urgence) {
  try {
    const corps = await chiffrer(abonnement, JSON.stringify(message));
    const r = await fetch(abonnement.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': await enteteVapid(env, abonnement.endpoint),
        'Content-Encoding': 'aes128gcm',
        'Content-Type': 'application/octet-stream',
        'TTL': String(ttl),
        'Urgency': urgence
      },
      body: corps
    });
    if (r.status >= 400) console.error('Push refusé', r.status, await r.text().catch(() => ''));
    return r.status;
  } catch (e) {
    console.error('Push en échec :', e && e.message || e);
    return 0;
  }
}

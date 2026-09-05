// ==========================================
// LOGIQUE GLOBALE DU SITE GOEON
// ==========================================

// 1. ASPIRATION DE LA BARRE DE NAVIGATION CENTRALISÉE
fetch('navbar.html')
  .then(response => {
    if (!response.ok) throw new Error('navbar.html introuvable (HTTP ' + response.status + ')');
    return response.text();
  })
  .then(data => {
    document.getElementById('nav-placeholder').innerHTML = data;
    
    // Ajouter l'icône après le texte GoEon
    // (innerHTML est synchrone : le logo existe immédiatement)
    const logo = document.querySelector('.nav-logo');
    if (logo) {
      const icon = document.createElement('img');
      icon.src = 'Images/Icone.png';
      icon.alt = 'GoEon';
      icon.style.cssText = 'width:46px; height:46px; object-fit:contain; vertical-align:middle; margin-left:-2px;';
      logo.appendChild(icon);
    }

    gererPageActive();
    gererMenuMobile();
    gererModeSombre();
    gererDropdowns();
    initJohannEffect();
    gererLiensMorts();
  })
  .catch(error => console.error("Erreur lors du chargement de la navbar :", error));


// 2. GESTION DE L'ONGLET ACTIF (ALLUMER EN JAUNE ÉQUILIBRÉ)
function gererPageActive() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinksList = document.querySelectorAll('.nav-links a');
  
  navLinksList.forEach(link => {
    const href = link.getAttribute('href');
    
    // 1. Si le lien direct correspond exactement à la page actuelle
    if (href === currentPage) {
      link.classList.add('active');
    }
    
    // 2. Si c'est un menu déroulant, on vérifie s'il contient la page actuelle
    const parentDropdown = link.closest('.dropdown');
    if (parentDropdown) {
      // On cherche si la page actuelle est listée dans le sous-menu de ce dropdown
      const subLink = parentDropdown.querySelector(`.dropdown-menu a[href="${currentPage}"]`);
      
      // Si on trouve le lien dans ce sous-menu, on allume le titre du dropdown parent
      if (subLink) {
        const dropdownToggle = parentDropdown.querySelector('.dropdown-toggle');
        if (dropdownToggle) {
          dropdownToggle.classList.add('active');
        }
      }
    }
  });
}


// 3. GESTION DU MENU MOBILE ET DES CLICS SUR LES DROPDOWNS
function gererMenuMobile() {
  const menuToggleBtn = document.querySelector('.menu-toggle');
  const navLinksContainer = document.querySelector('.nav-links');
  
  if (menuToggleBtn && navLinksContainer) {
    // Ouverture/Fermeture du menu burger global
    menuToggleBtn.addEventListener('click', () => {
      const ouvert = navLinksContainer.classList.toggle('active');
      menuToggleBtn.classList.toggle('open');
      menuToggleBtn.setAttribute('aria-expanded', ouvert);
    });
  }

  // GESTION DU CLIC SUR LES MENUS DÉROULANTS (Surtout pour Mobile)
  const dropdowns = document.querySelectorAll('.dropdown');

  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle') || dropdown.querySelector('a');
    
    if (toggle) {
      toggle.addEventListener('click', (e) => {
        e.preventDefault(); // Empêche le saut en haut de page (le lien pointe vers #)

        // Navbar en mode mobile (breakpoint navbar : 960px, voir navbar.css)
        if (window.innerWidth <= 960) {
          // Ferme les autres dropdowns ouverts pour faire propre
          dropdowns.forEach(other => {
            if (other !== dropdown) {
              other.classList.remove('open');
              const autreToggle = other.querySelector('.dropdown-toggle');
              if (autreToggle) autreToggle.setAttribute('aria-expanded', 'false');
            }
          });

          // Alterne l'ouverture du dropdown cliqué
          const ouvert = dropdown.classList.toggle('open');
          toggle.setAttribute('aria-expanded', ouvert);
        }
      });
    }
  });
}


// 4. LOGIQUE DU MODE SOMBRE
// Met à jour icônes (Noctali/Mentali), textes et titres des 2 boutons thème
function appliquerAffichageTheme(sombre) {
  const icone = sombre ? 'Images/Mentali_icon.png' : 'Images/Noctali_icon.png';
  const libelle = sombre ? 'Mode Clair' : 'Mode Sombre';

  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.title = sombre ? "Activer le mode clair" : "Activer le mode sombre";
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) themeIcon.src = icone;
    const text = toggleBtn.querySelector('.theme-text');
    if (text) text.textContent = libelle;
  }

  const themeIconMobile = document.getElementById('theme-icon-mobile');
  const themeTextMobile = document.querySelector('.theme-text-mobile');
  if (themeIconMobile) themeIconMobile.src = icone;
  if (themeTextMobile) themeTextMobile.textContent = libelle;
}

function basculerTheme() {
  const sombre = document.body.classList.toggle('dark-mode');
  appliquerAffichageTheme(sombre);
  localStorage.setItem('theme', sombre ? 'dark' : 'light');
}

function gererModeSombre() {
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    appliquerAffichageTheme(true);
  }

  const toggleBtn = document.getElementById('theme-toggle');
  const toggleMobile = document.getElementById('theme-toggle-mobile');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => { basculerTheme(); });
  }

  if (toggleMobile) {
    toggleMobile.addEventListener('click', () => { basculerTheme(); });
  }
}


// 5. CLIC SUR L'ÉMOJI SHINY -> DÉCLENCHE LE CLIC SUR L'IMAGE POKÉMON (JOHANN-EFFECT)
function initJohannEffect() {
  document.querySelectorAll('.emoji-shiny').forEach(emoji => {
    emoji.addEventListener('click', (e) => {
      // Niveau carte : couvre les badges dans l'image ET en coin de case (page Rocket)
      const carte = emoji.closest('.pokemon-card, .research-reward-item');
      if (carte) {
        const cardImg = carte.querySelector('.pokemon-img');
        if (cardImg) {
          cardImg.click(); 
        }
      }
    });
  });
}

// 6. BASCULE SHINY : CLIC SUR L'IMAGE -> VERSION CHROMATIQUE
// (centralisé ici — les pages ne doivent PLUS avoir leur propre copie de ce script)
function initShinyToggle() {
  document.querySelectorAll('.pokemon-img[data-shiny]').forEach(img => {
    if (img.dataset.shinyBound) return; // garde anti-double-liaison
    img.dataset.shinyBound = '1';
    const srcNormale = img.src;
    const srcShiny = img.getAttribute('data-shiny');
    img.addEventListener('click', () => {
      const carte = img.closest('.pokemon-card, .research-reward-item');
      const emoji = carte ? carte.querySelector('.emoji-shiny') : null;
      // Si le badge shiny est masqué (pokemon.css), le clic est désactivé
      if (emoji && window.getComputedStyle(emoji).display === 'none') return;
      const estNormale = new URL(img.src, window.location.href).pathname === new URL(srcNormale, window.location.href).pathname;
      img.src = estNormale ? srcShiny : srcNormale;
      img.classList.toggle('shiny-active', estNormale);
      if (emoji) emoji.classList.toggle('shiny-active', estNormale);
    });
  });
}
initShinyToggle();


// 7. BOUTONS DES PAGES TOP (builds alternatifs)
// (centralisé ici — les pages Top ne doivent PLUS avoir leur propre copie)
function toggleBuild(divId, btnId, targetSpanId = null, activeHtml = '', normalHtml = '') {
  const btn = document.getElementById(btnId);
  const div = document.getElementById(divId);
  const arrow = btn.querySelector('.arrow-indicator');
  const targetSpan = targetSpanId ? document.getElementById(targetSpanId) : null;
  const ouvert = !div.classList.contains('open');
  div.classList.toggle('open', ouvert);
  btn.classList.toggle('active', ouvert);      // les couleurs vivent dans top.css (.btn-X.active)
  btn.setAttribute('aria-expanded', ouvert);
  arrow.innerHTML = ouvert ? '\u25b2' : '\u25bc';
  if (targetSpan) targetSpan.innerHTML = ouvert ? activeHtml : normalHtml;
}

function toggleAltImm(immId, altId, iconId = null) {
  const imm = document.getElementById(immId);
  const alt = document.getElementById(altId);
  const icon = iconId ? document.getElementById(iconId) : null;
  const isOpen = alt.style.display !== 'none';
  if (!isOpen) {
    imm.style.textDecoration = 'line-through';
    imm.style.color = 'var(--text-muet)';
    imm.style.fontWeight = 'normal';
    alt.style.display = 'inline';
    if (icon) icon.style.display = 'none';
  } else {
    imm.style.textDecoration = 'none';
    imm.style.color = '';
    imm.style.fontWeight = 'bold';
    alt.style.display = 'none';
    if (icon) icon.style.display = '';
  }
}

// 8. BANDEAUX REPLIABLES (accueil : PWA/légende — pages Top : intro)
function toggleBanner(btn, contentId, arrowId) {
  const content = document.getElementById(contentId);
  const arrow = document.getElementById(arrowId);
  content.classList.toggle('open');
  const isOpen = content.classList.contains('open');
  arrow.textContent = isOpen ? '▴' : '▾';
  btn.setAttribute('aria-expanded', isOpen);
}


// 9. FERME LE MENU BURGER AUTOMATIQUEMENT AU SCROLL
window.addEventListener('scroll', () => {
  const navLinks = document.querySelector('.nav-links');
  const menuToggle = document.querySelector('.menu-toggle');
  
  if (navLinks && navLinks.classList.contains('active')) {
    navLinks.classList.remove('active');
    if (menuToggle) {
      menuToggle.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  }
});

// 10. GESTION DES DROPDOWNS AU CLIC (mobile uniquement)
function gererDropdowns() {
  // Fermer les dropdowns en cliquant ailleurs (mobile uniquement)
  document.addEventListener('click', (e) => {
    if (window.innerWidth > 960) return;
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown.open').forEach(d => {
        d.classList.remove('open');
        const toggle = d.querySelector('.dropdown-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      });
    }
  });
}

// 11. LIENS MORTS DE LA NAVBAR → TOOLTIP "DISPONIBLE PROCHAINEMENT"
function gererLiensMorts() {
  // Tooltip partagé : réutilise celui de la page s'il existe (index.html), sinon le crée
  // (le style vit dans navbar.css, chargée sur toutes les pages)
  let tooltip = document.getElementById('coming-soon-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'coming-soon-tooltip';
    tooltip.className = 'coming-soon-tooltip';
    tooltip.textContent = 'Disponible prochainement !';
    document.body.appendChild(tooltip);
  }

  document.querySelectorAll('.dropdown-menu a[href="#"], a.lien-a-venir').forEach(lien => {
    lien.addEventListener('click', (e) => {
      e.preventDefault();
      // Pas de tooltip pour les entrées informatives ("Aucun évènement annoncé")
      if (lien.textContent.trim().startsWith('Aucun')) return;
      afficherComingSoon(e, 20);
    });
  });
}

// 11 bis. AFFICHAGE DU TOOLTIP "DISPONIBLE PROCHAINEMENT"
// decalageY : 20 sous le curseur (navbar), -45 au-dessus (cartes de l'accueil)
function afficherComingSoon(e, decalageY) {
  const tooltip = document.getElementById('coming-soon-tooltip');
  if (!tooltip) return;

  // Repli si l'évènement n'a pas de coordonnées (activation au clavier)
  let x = e.pageX;
  let y = e.pageY;
  if (!x && !y && e.currentTarget && e.currentTarget.getBoundingClientRect) {
    const rect = e.currentTarget.getBoundingClientRect();
    x = rect.left + rect.width / 2 + window.scrollX;
    y = rect.top + rect.height / 2 + window.scrollY;
  }

  const marge = 8;
  const largeurTooltip = tooltip.offsetWidth;
  const maxGauche = document.documentElement.clientWidth - largeurTooltip - marge;
  let gauche = x - largeurTooltip / 2;
  gauche = Math.max(marge, Math.min(gauche, maxGauche + window.scrollX));
  tooltip.style.left = gauche + 'px';
  tooltip.style.top = (y + decalageY) + 'px';
  tooltip.classList.add('visible');
  clearTimeout(tooltip.timerComingSoon);
  tooltip.timerComingSoon = setTimeout(() => tooltip.classList.remove('visible'), 1800);
}

// SERVICE WORKER
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .catch(err => console.log('SW error:', err));
  });
}

// 12. BOUTON "SIGNALER UNE ERREUR"
(function() {
  const btn = document.createElement('a');
  btn.href = 'https://docs.google.com/forms/d/e/1FAIpQLSeF7TSueQlUEUiCcHYQDHrtU2GXipDznBt4zobpT5ZcqnspHg/viewform';
  btn.target = '_blank';
  btn.id = 'btn-signaler';
  btn.innerHTML = '<span class="signaler-texte">⚠️ Signaler une erreur</span>';
  btn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: var(--bg-carte);
    color: var(--text-secondaire);
    border: 1px solid var(--border-carte);
    border-radius: 20px;
    padding: 8px 14px;
    font-family: 'Poppins', sans-serif;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    z-index: 9999;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    transition: background 0.2s, transform 0.2s;
  `;

  // Masquage sur mobile via media query
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 960px) {
      #btn-signaler { display: none !important; }
    }
  `;
  document.head.appendChild(style);
  btn.addEventListener('mouseenter', () => btn.style.transform = 'translateY(-2px)');
  btn.addEventListener('mouseleave', () => btn.style.transform = 'translateY(0)');
  document.body.appendChild(btn);
})();

// 13. BOUTON "RETOUR EN HAUT"
(function() {
  const btn = document.createElement('button');
  btn.id = 'btn-retour-haut';
  btn.setAttribute('aria-label', 'Retour en haut de page');
  btn.title = 'Retour en haut';
  btn.textContent = '\u2191';

  const style = document.createElement('style');
  style.textContent = `
    #btn-retour-haut {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--bg-carte);
      color: var(--text-secondaire);
      border: 1px solid var(--border-carte);
      font-size: 20px;
      font-family: 'Poppins', sans-serif;
      cursor: pointer;
      z-index: 9998;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s, transform 0.2s;
    }
    #btn-retour-haut.visible { opacity: 1; pointer-events: auto; }
    #btn-retour-haut:hover { transform: translateY(-2px); }
    @media (min-width: 769px) {
      #btn-retour-haut { bottom: 70px; } /* au-dessus du bouton Signaler */
    }
  `;
  document.head.appendChild(style);

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });
})();

// 14. BARRE DE NAVIGATION DES TYPES (pages Top uniquement)
// Pour activer un nouveau type : remplacer null par le nom de la page
// (ex. page: 'TopGlace.html') — la barre se met à jour sur toutes les pages.
(function() {
  const conteneur = document.querySelector('.ranking-container');
  if (!conteneur) return; // pas une page Top
  const titre = conteneur.querySelector('h1');
  if (!titre) return;

  const TYPES_TOP = [
    { nom: 'Acier',    icone: 'Acier',    page: 'TopAcier.html' },
    { nom: 'Combat',   icone: 'Combat',   page: 'TopCombat.html' },
    { nom: 'Dragon',   icone: 'Dragon',   page: 'TopDragon.html' },
    { nom: 'Eau',      icone: 'Eau',      page: 'TopEau.html' },
    { nom: 'Électrik', icone: 'Electrik', page: 'TopElectrik.html' },
    { nom: 'Fée',      icone: 'Fee',      page: 'TopFee.html' },
    { nom: 'Feu',      icone: 'Feu',      page: 'TopFeu.html' },
    { nom: 'Glace',    icone: 'Glace',    page: 'TopGlace.html' },
    { nom: 'Insecte',  icone: 'Insecte',  page: 'TopInsecte.html' },
    { nom: 'Plante',   icone: 'Plante',   page: 'TopPlante.html' },
    { nom: 'Poison',   icone: 'Poison',   page: 'TopPoison.html' },
    { nom: 'Psy',      icone: 'Psy',      page: 'TopPsy.html' },
    { nom: 'Roche',    icone: 'Roche',    page: 'TopRoche.html' },
    { nom: 'Sol',      icone: 'Sol',      page: 'TopSol.html' },
    { nom: 'Spectre',  icone: 'Spectre',  page: 'TopSpectre.html' },
    { nom: 'Ténèbres', icone: 'Tenebres', page: 'TopTenebres.html' },
    { nom: 'Vol',      icone: 'Vol',      page: 'TopVol.html' }
  ];

  const pageActuelle = window.location.pathname.split('/').pop();
  const nav = document.createElement('nav');
  nav.className = 'type-nav';
  nav.setAttribute('aria-label', 'Navigation entre les classements par type');

  TYPES_TOP.forEach(t => {
    const lien = document.createElement('a');
    lien.className = 'type-nav-item';
    if (t.page) {
      lien.href = t.page;
      lien.title = t.nom;
      if (t.page === pageActuelle) {
        lien.classList.add('type-nav-current');
        lien.setAttribute('aria-current', 'page');
      }
    } else {
      lien.href = '#';
      lien.title = t.nom + ' — à venir';
      lien.classList.add('type-nav-disabled', 'lien-a-venir'); // tooltip "Disponible prochainement"
    }
    const img = document.createElement('img');
    img.src = 'Images/' + t.icone + '.webp';
    img.alt = t.nom;
    lien.appendChild(img);
    nav.appendChild(lien);
  });

  titre.insertAdjacentElement('afterend', nav);
})();

// 15. PAGE D'ACCUEIL (index.html)
function switchTab(os, btn) {
  document.getElementById('pwa-android').classList.toggle('active', os === 'android');
  document.getElementById('pwa-ios').classList.toggle('active', os === 'ios');
  document.querySelectorAll('.pwa-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
}

function showComingSoon(e) {
  e.preventDefault();
  afficherComingSoon(e, -45);
}

// 16. PAGE OPTIPM (OptiPM.html)
// Menu déroulant des PM du Passe du mois + recalcul du tableau.
// Ne s'exécute que si la page contient le menu.
var PM_STOCK_MAX_J2 = 710;   // au-delà, le plafond de 1500 bloque la marche du Jour J
var PM_STOCK_MIN_J2 = 380;   // en dessous, taper une Source la vide d'office et bouleverse l'ordre
var PM_COUT_COMBAT  = 800;   // coût d'un Combat Gigamax
var PM_PASSE_MAX    = 2500;  // Passe payant : 3 × (100 + 400) au rangs 19/49/74, + (200 + 800) au rang 86
var PM_PASSE_PAS    = 100;

function pmLignes() {
  return Array.prototype.slice.call(document.querySelectorAll('.pm-timeline tr[data-delta]'));
}

function pmPasse() {
  return parseInt(document.getElementById('pm-passe').value, 10) || 0;
}

function pmDelta(ligne, passe) {
  return ligne.dataset.role === 'passe' ? passe : parseInt(ligne.dataset.delta, 10);
}

// 1160 → « 1 160 » (espace insécable)
function pmFormat(nombre) {
  return String(nombre).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
}

// Revenus de la séquence hors Passe du mois (3 620 PM)
function pmRevenusFixes() {
  var total = 0;
  pmLignes().forEach(function (ligne) {
    var delta = parseInt(ligne.dataset.delta, 10);
    if (ligne.dataset.role !== 'passe' && delta > 0) total += delta;
  });
  return total;
}

function pmNbCombats(passe) {
  var maximum = pmLignes().filter(function (ligne) {
    return parseInt(ligne.dataset.delta, 10) < 0;
  }).length;
  return Math.min(maximum, Math.floor((PM_STOCK_MAX_J2 + pmRevenusFixes() + passe) / PM_COUT_COMBAT));
}

// Stock à viser en fin de J-2, jamais sous le plancher
function pmDepart(passe) {
  return Math.max(PM_STOCK_MIN_J2, pmNbCombats(passe) * PM_COUT_COMBAT - pmRevenusFixes() - passe);
}

function remplitPmSelect() {
  var select = document.getElementById('pm-passe');
  var choisi = pmPasse();
  var html = '';

  for (var pm = 0; pm <= PM_PASSE_MAX; pm += PM_PASSE_PAS) {
    html += '<option value="' + pm + '"' + (pm === choisi ? ' selected' : '') + '>'
          + pmFormat(pm) + ' PM → ' + pmNbCombats(pm) + ' Combats</option>';
  }
  select.innerHTML = html;
}

function updatePmTable() {
  var passe     = pmPasse();
  var nbCombats = pmNbCombats(passe);
  var mini      = pmDepart(passe);
  var maxi      = PM_STOCK_MAX_J2;
  var combat    = 0;

  document.querySelectorAll('.pm-passe-montant').forEach(function (el) {
    el.textContent = pmFormat(passe);
  });

  pmLignes().forEach(function (ligne) {
    var cellule    = ligne.querySelector('td:last-child');
    var delta      = pmDelta(ligne, passe);
    var impossible = ligne.dataset.role === 'passe'
      ? passe === 0
      : delta < 0 && ++combat > nbCombats;

    ligne.classList.toggle('pm-struck', impossible);

    if (impossible) {
      cellule.textContent = '-';
      return;
    }

    mini += delta;
    maxi += delta;

    cellule.textContent = ligne.dataset.format === 'entre'
      ? 'Entre ' + pmFormat(mini) + ' et ' + pmFormat(maxi) + ' PM'
      : pmFormat(mini) + ' – ' + pmFormat(maxi) + ' PM';
  });
}

// Garde : la section 16 ne s'exécute que sur OptiPM.html
if (document.getElementById('pm-passe')) {
  remplitPmSelect();
  updatePmTable();
}


// 17. SÉPARATEUR DE RANGÉE DANS LES GRILLES DE RÉCOMPENSES
// Insère un <hr class="research-rangee-sep"> toutes les 6 récompenses pour
// matérialiser les rangées sur mobile. Récupérée du script inline de
// TachesEtude.html le 1er août 2026. Sans effet sous 7 items.
// Ne s'exécute que si la page contient une grille.
function insererSeparateurRangee() {
  document.querySelectorAll('.research-rewards').forEach(grid => {
    grid.querySelectorAll('.research-rangee-sep').forEach(s => s.remove());
    const items = grid.querySelectorAll('.research-reward-item');
    const total = items.length;
    for (let i = 5; i < total - 1; i += 6) {
      const hr = document.createElement('hr');
      hr.className = 'research-rangee-sep';
      items[i].insertAdjacentElement('afterend', hr);
    }
  });
}

if (document.querySelector('.research-rewards')) {
  insererSeparateurRangee();
  window.addEventListener('resize', insererSeparateurRangee);
}

// 18. BADGE D'ÉVÈNEMENT AUTOMATIQUE (accueil)
// Chaque carte d'évènement porte data-debut et data-fin ; le script en déduit
// le badge à afficher. Rien avant le début, « En cours ! » pendant, « Terminé »
// après. Plus aucun badge écrit en dur dans index.html.
//
// Format OBLIGATOIRE : "AAAA-MM-JJTHH:MM". La partie horaire n'est pas
// facultative : sans elle, JavaScript lit la date en UTC et non en heure
// locale, ce qui décalerait la bascule de deux heures en été.
//
// Pas de conversion de fuseau ici, et c'est voulu : les évènements Pokémon GO
// se jouent à l'heure locale de chaque joueur, donc l'heure du navigateur est
// exactement la bonne référence.
//
// Une date illisible laisse la carte intacte plutôt que d'afficher un faux
// badge. Relecture toutes les minutes : un onglet ouvert à cheval sur le début
// d'un évènement bascule tout seul.

function majBadgesEvenements() {
  const maintenant = Date.now();

  document.querySelectorAll('.home-card[data-debut][data-fin]').forEach(carte => {
    const debut = new Date(carte.dataset.debut).getTime();
    const fin   = new Date(carte.dataset.fin).getTime();
    if (isNaN(debut) || isNaN(fin) || debut > fin) return;

    carte.querySelectorAll('.badge-en-cours, .badge-termine').forEach(b => b.remove());
    carte.classList.remove('event-en-cours', 'event-termine');

    let classe = null;
    if (maintenant >= debut && maintenant <= fin) classe = 'en-cours';
    else if (maintenant > fin)                    classe = 'termine';
    if (!classe) return;

    carte.classList.add('event-' + classe);
    const badge = document.createElement('span');
    badge.className = 'badge-' + classe;
    badge.textContent = (classe === 'en-cours') ? 'En cours !' : 'Terminé';
    carte.prepend(badge);
  });
}

if (document.querySelector('.home-card[data-debut]')) {
  majBadgesEvenements();
  setInterval(majBadgesEvenements, 60000);
}

// 19. PAGE CALENDRIER (Calendrier.html)
// Le calendrier n'est pas une grille 7x5 mais quatre pistes verticales qui
// partagent les memes lignes de grille : evenement long, jour, raids,
// evenement quotidien. C'est ce qui permet de lire d'un coup d'oeil qu'un
// evenement chevauche un Community Day, ce qu'une grille classique cache.
//
// Source unique : evenements.json, lu au chargement. Rien n'est ecrit en dur
// dans Calendrier.html, qui ne contient que des conteneurs vides.
//
// Les pistes affichent des SPRITES, pas du texte : un sprite de 28px tient
// dans une ligne de hauteur fixe la ou "Dynamax Oiseaux de Kanto" ne tient
// pas. C'est ce qui rend possible l'alignement uniforme du mois. Le nom
// complet et les bonus s'ouvrent dans le panneau de detail, au clic.
//
// Quand un sprite manque encore dans Images/, l'entree n'a pas de cle "img"
// (ou pas de "sprites") et le script retombe sur le libelle court. On
// n'invente jamais un nom de fichier : le manuel l'interdit, et une image
// cassee est pire qu'un mot.
//
// Les rotations de Raids ne sont pas affichees telles qu'elles sont saisies :
// elles se chevauchent (un Mega peut arriver en cours de semaine) et se
// trouent. Le script calcule donc, pour chaque jour, l'ensemble des Raids
// actifs, puis fusionne les jours consecutifs identiques. Une saisie qui
// deborde ou qui s'imbrique se rend correctement sans traitement particulier.
//
// Les Raids Obscurs sont volontairement absents de la piste : ils tiennent le
// mois entier et n'apportent rien a la lecture verticale. Ils restent lisibles
// dans le panneau de detail.
//
// Format de date : "AAAA-MM-JJ" pour les raids, "AAAA-MM-JJTHH:MM" pour les
// evenements, comme en section 18.

(function () {
  const grille = document.getElementById('cal-grille');
  if (!grille) return;

  const elMois   = document.getElementById('cal-mois-libelle');
  const elNotes  = document.getElementById('cal-notes');
  const elDetail = document.getElementById('cal-detail');
  const btnPrec  = document.getElementById('cal-prec');
  const btnSuiv  = document.getElementById('cal-suiv');

  const JOURS = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];
  const JOURS_LONGS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
  const MOIS_LONGS  = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                       'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'décembre'];

  let donnees = null;
  let indexMois = 0;

  // "2026-09-07" ou "2026-09-07T18:00" -> Date locale.
  // On decoupe a la main plutot que de passer par new Date(chaine) : sur la
  // forme courte, JavaScript lirait la date en UTC et decalerait le jour.
  function versDate(chaine) {
    const parts = String(chaine).split('T');
    const [a, m, j] = parts[0].split('-').map(Number);
    let h = 0, mn = 0;
    if (parts[1]) {
      const hm = parts[1].split(':').map(Number);
      h = hm[0] || 0;
      mn = hm[1] || 0;
    }
    return new Date(a, m - 1, j, h, mn);
  }

  // "2026-08-31T10:00" -> "lundi 31 aout à 10h". Sans annee, conformement
  // aux conventions du site ; l'heure n'apparait que si la chaine en porte
  // une, et les minutes seulement si elles ne sont pas nulles.
  function dateLongue(chaine) {
    const d = versDate(chaine);
    let texte = JOURS_LONGS[(d.getDay() + 6) % 7] + ' ' + d.getDate() + ' ' + MOIS_LONGS[d.getMonth()];
    if (String(chaine).indexOf('T') !== -1) {
      texte += ' à ' + d.getHours() + 'h'
             + (d.getMinutes() ? String(d.getMinutes()).padStart(2, '0') : '');
    }
    return texte;
  }

  // Le vert "Bon" n'est pas une donnee du calendrier : il vit dans
  // pokemon.css, qui cible .pk-<slug> .pokemon-name. On se contente de
  // poser les memes classes, et la couleur suit sans rien saisir ici.
  // Le slug est le nom de base, sans accent et sans le prefixe Mega,
  // puisque c'est ainsi que pokemon.css les declare.
  function slugPokemon(nom) {
    return String(nom)
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/^mega-?/, '')
      .replace(/[^a-z0-9]/g, '');
  }

  function nomHtml(p) {
    let h = '<span class="pk-' + slugPokemon(p.nom) + '">'
          + '<span class="pokemon-name">' + echapper(p.nom) + '</span></span>';
    if (p.forme) h += ' <em class="cal-forme">' + echapper(p.forme) + '</em>';
    return h;
  }

  // Enumeration a la francaise : virgules, puis "&" devant le dernier.
  function joindre(parts) {
    if (parts.length <= 1) return parts.join('');
    return parts.slice(0, -1).join(', ') + ' & ' + parts[parts.length - 1];
  }

  function listeNoms(liste) {
    return joindre(liste.map(nomHtml));
  }

  function memeJour(d1, d2) {
    return d1.getFullYear() === d2.getFullYear()
        && d1.getMonth()    === d2.getMonth()
        && d1.getDate()     === d2.getDate();
  }

  // Numero de jour dans le mois affiche, borne aux limites du mois : un
  // evenement qui commence le mois precedent demarre visuellement au 1er.
  function borner(date, annee, mois, nbJours) {
    if (date.getFullYear() < annee || (date.getFullYear() === annee && date.getMonth() < mois)) return 1;
    if (date.getFullYear() > annee || (date.getFullYear() === annee && date.getMonth() > mois)) return nbJours;
    return date.getDate();
  }

  function echapper(t) {
    const d = document.createElement('div');
    d.textContent = t;
    return d.innerHTML;
  }

  // Rangee de sprites, ou libelle de repli si aucune image n'est disponible.
  function rangeeSprites(fichiers, replis) {
    if (fichiers && fichiers.length) {
      return '<div class="cal-sprites">' + fichiers
        .map(f => '<img src="Images/' + f + '" alt="" loading="lazy">')
        .join('') + '</div>';
    }
    return '<span class="cal-repli">' + echapper(replis) + '</span>';
  }

  // Taille de sprite d'un segment de Raids. Deux contraintes se croisent :
  // la largeur (98px pour N sprites cote a cote) et la hauteur (60*D-2
  // pixels pour D jours, moins 10 d'ecart entre rangees et 4 de marges,
  // divises par les deux rangees). On prend la plus petite, arrondie a
  // la classe inferieure. Un segment d'un jour tombe donc a 22px, ce qui
  // est son maximum physique, tandis qu'une rotation de sept jours monte
  // a 56px au lieu de laisser un grand vide.
  const PALIERS = [22, 28, 36, 44, 56];
  const ECARTS  = [10, 16, 24, 32, 40];

  function palier(valeur, table) {
    let choisi = table[0];
    table.forEach(p => { if (p <= valeur) choisi = p; });
    return choisi;
  }

  function largeurDispo(n) { return (98 - 8 - (n - 1) * 2) / n; }

  // Taille en deux rangees empilees : la hauteur d'un segment de D jours
  // vaut 60*D-2, moins l'ecart entre rangees et les marges, divisee par 2.
  function tailleEmpilee(nbMax, jours) {
    return palier(Math.min(largeurDispo(nbMax), 30 * jours - 13), PALIERS);
  }

  // Taille sur une rangee unique : toute la hauteur pour un seul niveau,
  // mais tous les Pokemon se partagent la largeur.
  function tailleFusionnee(total, jours) {
    return palier(Math.min(largeurDispo(total), 60 * jours - 6), PALIERS);
  }

  // L'ecart entre legendaires et megas grandit avec la duree : un segment
  // de sept jours a de la hauteur a occuper, un segment d'un jour non.
  function classeEcart(jours) {
    return 'cal-ec-' + palier(10 + (jours - 1) * 6, ECARTS);
  }

  // Rangee ou chaque Pokemon porte le nom de sa zone, empiles.
  function rangeeRegions(liste) {
    return liste.map(p =>
      '<span class="cal-raids-region">' +
        '<span class="cal-raids-zone">' + echapper(p.region) + '</span>' +
        (p.img
          ? '<span class="cal-sprites"><img src="Images/' + p.img + '" alt="" loading="lazy"></span>'
          : '<span class="cal-repli">' + echapper(p.nom) + '</span>') +
      '</span>'
    ).join('');
  }

  function bloc(colonne, ligne, portee, classes, html) {
    const d = document.createElement('div');
    d.className = classes;
    d.style.gridColumn = colonne;
    d.style.gridRow = ligne + ' / span ' + portee;
    d.innerHTML = html;
    return d;
  }

  function fermerDetail() {
    elDetail.classList.remove('cal-detail-ouvert');
    elDetail.innerHTML = '';
  }

  function afficherDetail(titre, heures, lignes, page) {
    let html = '<button type="button" class="cal-detail-fermer" aria-label="Fermer">×</button>'
             + '<h3>' + echapper(titre) + '</h3>';
    if (heures) html += '<p class="cal-detail-heures">' + echapper(heures) + '</p>';
    lignes.forEach(l => { if (l) html += '<p>' + l + '</p>'; });
    if (page) html += '<p><a href="' + page + '">Voir la page de l\'Évènement</a></p>';
    elDetail.innerHTML = html;
    elDetail.classList.add('cal-detail-ouvert');
    elDetail.querySelector('.cal-detail-fermer').addEventListener('click', fermerDetail);
  }

  // Le panneau flotte au-dessus de la grille : on le ferme a la touche
  // Echap et au clic hors de lui, sans quoi il resterait a l'ecran.
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') fermerDetail();
  });

  document.addEventListener('click', e => {
    if (!elDetail.classList.contains('cal-detail-ouvert')) return;
    if (elDetail.contains(e.target)) return;
    if (e.target.closest('.cal-bloc, .cal-raids')) return;
    fermerDetail();
  });

  function rendre() {
    const mois = donnees.mois[indexMois];
    const [annee, numMois] = mois.cle.split('-').map(Number);
    const m = numMois - 1;
    const nbJours = new Date(annee, numMois, 0).getDate();
    const aujourdhui = new Date();

    elMois.textContent = mois.libelle;
    btnPrec.disabled = (indexMois === 0);
    btnSuiv.disabled = (indexMois >= donnees.mois.length - 1);

    elNotes.innerHTML = (mois.notes || []).map(n => '<p>' + echapper(n) + '</p>').join('');
    elNotes.style.display = (mois.notes && mois.notes.length) ? '' : 'none';

    fermerDetail();

    grille.innerHTML = '';

    // Ligne 1 : en-tetes de pistes. La colonne des jours n'en porte pas,
    // son contenu se lit seul.
    [['Évènements', 'evenements'], null, ['Raids', 'raids'], ['Quotidien', 'quotidien']]
      .forEach((h, i) => {
        if (!h) return;
        const e = document.createElement('div');
        e.className = 'cal-entete cal-entete-' + h[1];
        e.style.gridColumn = i + 1;
        e.style.gridRow = '1';
        e.textContent = h[0];
        grille.appendChild(e);
      });

    // Piste 1 : evenements longs. Les jours occupent les lignes 2 a N+1.
    (mois.evenements || []).forEach(ev => {
      const d1 = borner(versDate(ev.debut), annee, m, nbJours);
      const d2 = borner(versDate(ev.fin),   annee, m, nbJours);
      const el = bloc(1, d1 + 1, d2 - d1 + 1, 'cal-bloc cal-cat-evenement',
        '<span class="cal-evt-nom">' + echapper(ev.nom) + '</span>');
      el.addEventListener('click', () => afficherDetail(
        ev.nom, null,
        ['Du ' + dateLongue(ev.debut) + ' au ' + dateLongue(ev.fin)],
        ev.page
      ));
      grille.appendChild(el);
    });

    // Piste 2 : les jours
    for (let j = 1; j <= nbJours; j++) {
      const date = new Date(annee, m, j);
      const idx = (date.getDay() + 6) % 7;
      let cls = 'cal-jour';
      if (idx === 5) cls += ' cal-jour-samedi';
      if (memeJour(date, aujourdhui)) cls += ' cal-jour-aujourdhui';
      grille.appendChild(bloc(2, j + 1, 1, cls,
        '<span class="cal-jour-lettre">' + JOURS[idx] + '</span>' +
        '<span class="cal-jour-num">' + j + '</span>'));
    }

    // Piste 3 : raids, recalcules jour par jour puis fusionnes
    const parJour = [];
    for (let j = 1; j <= nbJours; j++) {
      const date = new Date(annee, m, j);
      const actifs = { legendaire: [], mega: [], obscur: [] };
      (mois.raids || []).forEach(r => {
        if (!actifs[r.categorie]) return;
        if (date >= versDate(r.debut) && date <= versDate(r.fin)) {
          r.pokemon.forEach(p => {
            if (!actifs[r.categorie].some(x => x.nom === p.nom)) actifs[r.categorie].push(p);
          });
        }
      });
      parJour.push(actifs);
    }

    const signature = a => JSON.stringify([a.legendaire.map(p => p.nom), a.mega.map(p => p.nom)]);

    let j = 1;
    while (j <= nbJours) {
      const cle = signature(parJour[j - 1]);
      let fin = j;
      while (fin < nbJours && signature(parJour[fin]) === cle) fin++;

      const a = parJour[j - 1];
      if (a.legendaire.length || a.mega.length) {
        const jours = fin - j + 1;
        const regionalise = a.legendaire.some(p => p.region);

        // En mode regionalise les legendaires sont empiles, pas cote a
        // cote : seuls les megas contraignent alors la largeur.
        const nbMax = Math.max(regionalise ? 1 : a.legendaire.length, a.mega.length, 1);
        const total = a.legendaire.length + a.mega.length;

        // Sur un segment court, mettre tout le monde sur une seule rangee
        // donne parfois des sprites plus grands que de les empiler. C'est
        // le cas du 30 septembre : Xerneas et Mega-Empiflor passent de 22
        // a 44px en se placant cote a cote.
        const fusion = !regionalise
                    && a.legendaire.length && a.mega.length
                    && tailleFusionnee(total, jours) > tailleEmpilee(nbMax, jours);

        const taille = fusion ? tailleFusionnee(total, jours) : tailleEmpilee(nbMax, jours);

        let html = '';
        if (fusion) {
          html = '<span class="cal-sprites">'
               + a.legendaire.concat(a.mega).map(p => p.img
                   ? '<img src="Images/' + p.img + '" alt="" loading="lazy">'
                   : '<span class="cal-repli">' + echapper(p.nom) + '</span>').join('')
               + '</span>';
        } else {
          if (a.legendaire.length) {
            html += regionalise
              ? rangeeRegions(a.legendaire)
              : rangeeSprites(a.legendaire.filter(p => p.img).map(p => p.img),
                              a.legendaire.map(p => p.nom).join(', '));
          }
          if (a.mega.length) {
            html += '<span class="cal-raids-megas">'
                  + rangeeSprites(a.mega.filter(p => p.img).map(p => p.img),
                                  a.mega.map(p => p.nom).join(', '))
                  + '</span>';
          }
        }

        const dSeg = j, fSeg = fin;
        const el = bloc(3, j + 1, jours,
          'cal-raids cal-sp-' + taille + ' ' + classeEcart(jours), html);
        el.addEventListener('click', () => {
          const dtD = new Date(annee, m, dSeg);
          const dtF = new Date(annee, m, fSeg);
          const jourTexte = d => JOURS_LONGS[(d.getDay() + 6) % 7] + ' ' + d.getDate();
          const titre = (dSeg === fSeg)
            ? 'Raids du ' + jourTexte(dtD)
            : 'Raids du ' + jourTexte(dtD) + ' au ' + jourTexte(dtF);
          const obscurs = parJour[dSeg - 1].obscur;
          afficherDetail(titre, 'De 6h à 21h44', [
            a.legendaire.length
              ? 'Légendaires : ' + (regionalise
                  ? joindre(a.legendaire.map(p => nomHtml(p) + ' en ' + echapper(p.region)))
                  : listeNoms(a.legendaire))
              : null,
            a.mega.length  ? 'Méga-Raids : ' + listeNoms(a.mega) : null,
            obscurs.length ? 'Obscurs : ' + listeNoms(obscurs)   : null
          ]);
        });
        grille.appendChild(el);
      }
      j = fin + 1;
    }

    // Piste 4 : evenements quotidiens, horaire au-dessus du sprite
    (mois.quotidiens || []).forEach(q => {
      const d1 = borner(versDate(q.debut), annee, m, nbJours);
      const d2 = q.fin ? borner(versDate(q.fin), annee, m, nbJours) : d1;
      const lignes = q.lignes || (q.heures ? [q.heures] : []);
      const html = (lignes.length
                     ? '<span class="cal-libelle">' + lignes.map(echapper).join('<br>') + '</span>'
                     : '')
                 + rangeeSprites(q.sprites, q.court);
      const el = bloc(4, d1 + 1, d2 - d1 + 1, 'cal-bloc cal-cat-' + q.categorie, html);
      el.addEventListener('click', () => afficherDetail(
        q.long, q.heures, [q.bonus ? 'Bonus : ' + q.bonus : null], q.page
      ));
      grille.appendChild(el);
    });
  }

  fetch('evenements.json')
    .then(r => {
      if (!r.ok) throw new Error('reponse ' + r.status);
      return r.json();
    })
    .then(d => {
      donnees = d;
      if (!donnees.mois || !donnees.mois.length) throw new Error('aucun mois');
      // On ouvre sur le mois en cours s'il est present, sinon sur le premier.
      const maintenant = new Date();
      const cleActuelle = maintenant.getFullYear() + '-' + String(maintenant.getMonth() + 1).padStart(2, '0');
      const trouve = donnees.mois.findIndex(x => x.cle === cleActuelle);
      indexMois = (trouve >= 0) ? trouve : 0;
      rendre();
    })
    .catch(() => {
      elMois.textContent = 'Calendrier indisponible';
      grille.innerHTML = '';
      elNotes.innerHTML = '<p>Les données du calendrier n\'ont pas pu être chargées. Réessayez plus tard.</p>';
    });

  btnPrec.addEventListener('click', () => { if (indexMois > 0) { indexMois--; rendre(); } });
  btnSuiv.addEventListener('click', () => { if (donnees && indexMois < donnees.mois.length - 1) { indexMois++; rendre(); } });
})();

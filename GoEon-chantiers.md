# GoEon — Chantiers

*Mis à jour le 17 août 2026. Ce fichier bouge souvent ; le manuel de fabrication (`GoEon-conventions.md`) presque jamais.*

## Datés

- **EN RETARD — 10 août 2026, 20h : fin de Braises Arctiques.** Sur `index.html` : retirer `event-en-cours`, le `<span class="badge-en-cours">`, puis la carte de l'évènement. Sur `BraisesArctiques.html` : retirer le sous-titre « Nouveau Shiny ! » de Frissonille. *Vérifié le 17/08 : rien n'est fait, le site affiche encore « En cours ! ».*
- **EN RETARD — 16 août 2026 : Journée Communauté Goupilou.** Goupilou et Roublenard deviennent **Shiny, et non « Bon »**. Décommenter leur ligne `emoji-shiny` dans `pokemon.css`, puis retirer les trois `nouveau-shiny` de `CDGoupilou.html`. Les commentaires datés sont déjà posés. *Vérifié le 17/08 : les deux lignes sont toujours commentées et les trois `nouveau-shiny` toujours en place.*

- **25–30 août 2026 — Championnats XP.** `ChampionnatsXP.html` est en place et lié depuis `index.html`. Reste à activer le lien navbar et la section `script.js` §14 le moment venu.

## Migration Netlify → Cloudflare Pages

*Décision du 17 août 2026. Motif : Netlify gratuit = 300 crédits/mois, 15 par déploiement et 20 par Go servi — soit ~20 publications mensuelles, et mise en pause du site une fois le quota épuisé. Cloudflare Pages : 500 builds/mois, bande passante et requêtes illimitées, et le site reste en ligne même si la limite de builds est atteinte.*

1. **Pousser les fichiers en attente sur `dev`** (voir en fin de fichier).
2. **Acheter `goeon.com`** sur Cloudflare Registrar (~10 $/an au prix du registre, pas de tarif promotionnel ni de hausse au renouvellement ; protection WHOIS incluse). Libre au 17/08. **Répondre au mail de vérification ICANN** sous 15 jours, sinon suspension.
3. **Créer le projet Pages** : Workers & Pages → Create → Pages → Connect to Git → `camritto2/GoEon`. Branche de production : **`main`** — à vérifier, Cloudflare propose par défaut la branche par défaut du dépôt.
4. **Build** : commande de build **vide**, dossier de sortie **`/`**. Aucun framework à sélectionner.
5. **Désactiver les déploiements de prévisualisation** — sinon `dev` devient publiquement consultable et chaque push sur `dev` consomme un build.
6. **Rattacher `goeon.com`** : Custom domains → Set up a domain. DNS automatique puisque le domaine est chez Cloudflare.
7. **Bannière d'annonce sur le site Netlify** pendant 3–4 semaines : « GoEon déménage sur goeon.com, pensez à réinstaller l'application ». Une bannière, pas une redirection : une PWA installée qui suit une redirection hors scope se comporte comme un simple raccourci navigateur.
8. **Couper Netlify.**

Le workflow ne change pas : `dev` reste la branche de travail poussée quotidiennement, `git push origin dev:main` déclenche la publication.

**Sensibilité à la casse.** Cloudflare Pages distingue majuscules et minuscules dans les chemins, contrairement à Netlify : toute référence `images/` au lieu de `Images/` renverra un 404. Audit du 17/08 sur les 764 références du site : 4 erreurs de casse, corrigées.

**Aucune dépendance Netlify** (audité le 17/08) : pas de `netlify.toml`, `_redirects` ni `_headers`, aucun formulaire, aucune fonction serveur, aucun chemin absolu, aucune occurrence de « netlify » dans le code. Un seul appel réseau, `fetch('navbar.html')`, en relatif.

**Coût de l'attente.** Passer de `.netlify.app` à un domaine propre oblige les utilisateurs ayant installé la PWA à la réinstaller : l'identité d'une PWA tient à son origine. Ce coût croît avec le nombre d'installations, et deviendra bien plus lourd une fois les abonnements push en place, eux aussi liés à l'origine.

## Notifications push

*Sorti de « Écarté » le 17 août 2026 : Cloudflare lève le blocage, qui était l'absence de brique serveur.*

**Architecture**, entièrement dans le palier gratuit : un Worker pour l'envoi, KV pour stocker les abonnements, Cron Triggers pour la planification. Plus une paire de clés VAPID et les handlers `push` / `notificationclick` dans `service-worker.js`.

**Source de vérité : `evenements.json`**, à créer et versionner. Un seul fichier pour trois usages — affichage des pages, bascule automatique par date, notifications. Champs minimum : `debut`, `fin`, `importance` (majeur / mineur), `titre`, `lien`.

**Réglages utilisateur** — un choix exclusif plus deux cases indépendantes, pour éviter les doublons :

- *Notifications d'évènements* (choix unique) : tous même les petits / seulement les majeurs / aucune
- *Résumé quotidien* (case) : un message le matin listant ce qui commence dans la journée
- *Nouveautés du site* (case)

Les préférences se stockent à côté de l'abonnement dans KV, le Worker filtre à l'envoi. Aucun réabonnement lors d'un changement de réglage.

**Deux intensités**, portées par `importance` : notification normale pour les évènements majeurs, `silent: true` pour le reste — elle s'affiche et met à jour la pastille sans faire vibrer l'appareil.

**Piège à éviter.** Un push reçu sans notification affichée déclenche le message générique « Ce site a été mis à jour en arrière-plan », imposé par Chrome. Pour un simple rafraîchissement de données, ne pas utiliser le push : mise à jour à l'ouverture de l'app, ou Periodic Background Sync.

**Fuseau horaire.** Les Cron Triggers tournent en UTC : prévoir le passage heure d'été / heure d'hiver, sinon le résumé quotidien partira une heure trop tôt la moitié de l'année.

**Périmètre décidé** : uniquement les utilisateurs ayant installé la PWA. Détection par `window.matchMedia('(display-mode: standalone)')` ; le bouton d'activation ne s'affiche pas ailleurs.

**Prérequis** : migration terminée et domaine en place — les abonnements sont liés à l'origine et seraient tous perdus lors d'un changement d'adresse.

## Contenu

- **Bascule automatique par date.** Mettre les états « à venir / en cours / terminé » dans le HTML avec les bornes en attributs `data-`, et laisser `script.js` choisir selon `Date.now()`. Supprime la plupart des publications d'entretien : plus besoin d'un déploiement pour annoncer le début d'un évènement puis d'un autre pour sa fin. `new Date('2026-08-25T10:00:00')` sans `Z` se résout dans le fuseau de l'appareil, ce qui est le comportement voulu pour Pokémon GO. Brique commune avec `Calendrier.html` et les notifications.
- **`Calendrier.html`** — calendrier des évènements récurrents du mois (Heures Vedette, Heures de Raid, journées d'Étude Limitée, bonus du week-end), une trentaine d'entrées mensuelles. Page complète d'abord, puis éventuellement un aperçu « cette semaine » sur l'accueil. **En attente de la référence Google Sheets de Cam.** Structure de données à arbitrer avec `evenements.json` : une seule source si possible.
- **Audit des blocs « Bon » de `pokemon.css` contre les 17 Top.** Les classements sont figés : c'est le moment de passer les blocs verts au crible pour repérer ceux qu'aucun classement ne justifie plus, ainsi que les pré-évolutions qui les suivent.
- **ChefRocket** : ajouter Cliff, Arlo et Giovanni. Puis chantier séparation Sbires/Chefs, avant activation navbar et accueil.
- **MeilleursPokemon.html** (Règles Générales) : à créer. Ensuite, remplacer les `lien-a-venir` des 17 pages Top, activer la carte d'accueil et le lien navbar.
- **SEO / Open Graph** : meta description et og:tags, priorité aux pages Top. Attend l'image 1200×630 de Cam.
- Et tellement plus qui se trouve pour le moment dans la tête de Cam !

## Dette technique

- **`regionaux.html`** — page inachevée : un `<script>` inline, des styles inline, et **39 images référencées absentes de `Images/`** (Kangourex, Tauros et ses formes, Tropius, Plumeline, Sancoki, Flabébé, les singes de Unys…). Sera reprise entièrement.
- **`TopTenebres.html`** — `Cacturne.png` et `Pandarbare.png` sont référencés mais absents de `Images/`. Anormal sur une page terminée : l'audit croisé portait sur les réciprocités, pas sur l'existence des fichiers.
- **Styles inline** — il en reste sur une poignée de pages, presque tous des marges sur des `<p>` dans un `intro-rules`. **Décision de Cam : on corrige page par page, au moment où chaque page est retravaillée.** Pas de passe globale.

## Écarté

- **Badging API en canal autonome** — `navigator.setAppBadge()` ne peut pas poser de pastille sur une application fermée : il faut un push pour réveiller le service worker, et Chrome impose alors l'affichage d'une notification. La pastille est donc une **conséquence** d'une notification, obtenue proprement via `silent: true`, jamais un mécanisme indépendant. Vérifié le 17/08 : `script.js` ne contient ni `setAppBadge` ni `DERNIERE_NOUVEAUTE`.
- **Application native (Capacitor ou équivalent)** — écarté le 17 août 2026. Techniquement simple puisque le site est statique et sans étape de build, mais : 99 $/an pour le compte développeur Apple, un Mac obligatoire pour compiler, plusieurs jours de validation à chaque mise à jour — l'inverse du besoin — et surtout un risque réel de retrait pour usage de la propriété intellectuelle Pokémon, bien plus élevé sur un store que sur le web. Le seul gain restant serait la visibilité sur les stores : notifications, hors-ligne et icône sur l'écran d'accueil sont déjà couverts par la PWA.

---

## À pousser sur `dev`

*`dev` date du 09/08 à 21h34. Fichiers corrigés le 17/08 en attente :*

- **`service-worker.js`** — deux chemins d'icônes `images/` corrigés en `Images/`. **Correction critique** : `cache.addAll` échoue en bloc dès qu'un seul fichier renvoie 404, ce qui empêche l'installation du service worker, donc le mode hors-ligne.
- **`regionaux.html`** — `Crefollet.png` et `Crehelf.png` corrigés. Les 39 autres références minuscules pointent vers des fichiers inexistants et relèvent de la reprise complète de la page.
- **`GoEon-chantiers.md`** — ce fichier.

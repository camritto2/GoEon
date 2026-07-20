# GoEon — Conventions & Décisions
*Document de passation — rédigé le 18 juillet 2026, à l'issue du grand refactor.*
*À fournir à toute nouvelle conversation Claude reprenant le rôle d'audit/référence, avec les fichiers frais du dépôt Git (source de vérité).*

---

## 1. Le projet

GoEon : site de ressources Pokémon GO francophone. HTML/CSS/JS pur, mobile-first, hébergé sur Netlify via Git. Développeur solo (Cam), perfectionniste du pixel. Workflow : validation explicite de chaque modification, livraison de fichiers complets téléchargeables, commits groupés logiques.

**Répartition des conversations Claude** : des conversations "génératrices" créent les pages (Top, évènements) à partir d'un prompt type + page modèle ; une conversation "référente" audite, corrige et fait les activations. Ce document permet à n'importe quelle conversation de devenir référente.

## 2. Architecture des fichiers

- **navbar.css** — ⭐ TOUTES les variables CSS (`:root` + `body.dark-mode`) : couleurs de base ET accents (`--accent-bleu #29b6f6`, `--accent-violet #8b5cf6`, `--accent-or #F4D995`, `--accent-vert-bon #16a34a`, `--text-astuce`, `--bg-bandeau-tache #e8f4fd/#1a2e3d`). Contient aussi l'`@import` Poppins **300;500;600;700;800** (ne jamais réduire cette liste !) et les styles navbar.
- **global.css** — base commune : cartes Pokémon (`pokemon-card`), grilles (`pokemon-grid-6` uniquement — les variantes grid-5/grid-auto/2-colonnes ont été supprimées comme code mort), système research-* (TachesEtude, Rocket), encadrés `intro-rules` (+ règle `.intro-rules p`), classes `.texte-vert`, `.badge-costume`/`.badge-gigamax`, `.stats-note` (8px mobile/10px desktop), `.category-title`, cursor shiny global.
- **pokemon.css** — source de vérité shiny/tiers : `.pk-nomdupokemon` sur la carte pilote la couleur du nom (vert = Bon) ET la visibilité du badge shiny (`.emoji-shiny { display: inline }`). Défaut : badges masqués. Formes : suffixes `-a` (Alola), `-g` (Galar), `-h` (Hisui).
- **top.css** — pages Top uniquement : cartes fandom-card, 18 palettes `.btn-X` + `.btn-X.active` (couleurs d'état ouvert), barre `.type-nav`, intro repliable, `.arrow-indicator`, `.top-title` (margin 15/20).
- **rocket.css** — page ChefRocket (layout 1/3, bandeaux chefs, counters verts). Versionné `?v=N` par tradition d'une autre conversation (inoffensif, incohérent avec le reste — toléré avec humour).
- **index.css** — accueil (héros, grilles de cartes/types, bandeaux repliables PWA/légende, tooltip).
- **script.js** — ⭐ TOUTE la logique, 14 sections numérotées : 1 fetch navbar, 2 onglet actif, 3 menu mobile, 4 mode sombre, 5 Johann-Effect (clic badge → clic image ; scope `.pokemon-card, .research-reward-item`), 6 initShinyToggle (bascule shiny centralisée, garde anti-double-liaison, garde-fou visibilité badge), 7 toggleBuild/toggleAltImm (pages Top), 8 toggleBanner (bandeaux repliables), 9 fermeture menu au scroll, 10 dropdowns mobile, 11 liens morts → tooltip (navbar `a[href="#"]` des menus + `a.lien-a-venir` partout), 12 bouton Signaler, 13 bouton Retour en haut, 14 barre des types (config `TYPES_TOP` : une ligne par type, `page: null` = grisé+tooltip).
- **service-worker.js** — réseau d'abord ; cache runtime filtré (GET + http + response.ok) ; fallback navigation hors-ligne → index ; `CACHE_NAME` volontairement non versionné.

## 3. Décisions actées (et leurs raisons)

- **Breakpoints** : site = 769px ; **navbar = 960/961px** (ses liens desktop exigent ~1000px — tenté à 769, cassé en demi-fenêtre, revenu à 960 documenté). Les valeurs 960 existent aussi dans script.js : synchroniser si changement.
- **theme-color : `#29b6f6` PARTOUT, jamais la couleur du type.** Décision réitérée 5+ fois — les conversations génératrices récidivent systématiquement, l'audit doit TOUJOURS vérifier ce point.
- **Graisses navbar : 300 explicite** (rendu "historique" — les 500 d'origine s'affichaient en 300 quand seuls 300/700/800 étaient chargés ; Cam préfère ce rendu). Signaler-link : 700. Logo mobile : 600.
- **Cache-busting : `script.js?v=3`** sur toutes les pages (v3 = ère post-centralisation). Pas de ?v sur les CSS (sauf rocket.css, tradition).
- **Titres** : un seul `<h1>` par page ; catégories en `<h2 class="category-title tier-X">`. Titres d'onglet : `GoEon - Nom` (tiret court).
- **Puces d'intro Top** : colorées comme leur ligne (`bullet legend-blue/cyan/red`), puce Legacy neutre.
- **Icônes désactivées** : `cursor: not-allowed` + tooltip "Disponible prochainement !" au clic.
- **Boutons de build** : `toggleBuild('xxx-details', 'toggle-xxx-btn')` SANS couleurs (elles vivent dans `.btn-X.active`) + `aria-expanded="false"` initial. Méga-Gardevoir : palette psy standard (le rose historique était un bug).
- **Alignements pixel** : technique du "fantôme structurel" (sous-titre `&nbsp;` de Duralugon sur dynamax, "+" des counters Rocket) plutôt que marges magiques.
- **Dates** : sans année ("Depuis le mercredi 1er juillet, 6h - ..."). Évènements : tiret long "—" toléré.
- **Team Go Rocket** : navbar/accueil restent "prochainement" jusqu'à la séparation Sbires/Chefs.

## 4. Conventions de contenu

- **Images** : `NomSansAccents.png`, shiny = `NomS.png`, formes AVANT le S (`GoupixAS.png`). Suffixes : A/G/H/M (Alola/Galar/Hisui/Méga). ⚠️ `GorythmicG.png` = Gigamax (collision avec Galar — préférer `Gmax` à l'avenir).
- **Badges** : shiny = `emoji-shiny` dans `div.badges` (visibilité par pokemon.css) ; Obscur = `badge-obscur-icon` ; costume/Gigamax = `emoji-costume` (18px mobile/26px desktop, ombre, toujours visible). ⚠️ NE JAMAIS réutiliser la classe `emoji-shiny` pour un autre badge (écouteur de clic Johann-Effect !).
- **Shiny boosté** (évènements) : badge entouré de `<span class="shiny-boost-circle">` (cercle doré 1px, or vif en dark, scintille via `:has(.shiny-active)` quand le shiny est affiché) + sous-titre `pokemon-subtitle` "Shiny boosté !".
- **Nouveau shiny annoncé** (pas encore actif dans le jeu) : classe `nouveau-shiny` sur le badge de la page d'évènement UNIQUEMENT (sélecteur `img.emoji-shiny.nouveau-shiny` (0,2,1) — bat les masquages pokemon.css (0,2,0)). ⚠️ Ne jamais poser `shiny-active` en statique : le script la retire au clic. Dans pokemon.css : préparer la ligne emoji-shiny EN COMMENTAIRE avec la date d'activation (pattern "commentaire daté", cf. Frissonille → 4 août 2026).
- **Ordre dans une carte** : nom → sous-titre (`pokemon-subtitle`, son margin-top -6px est fait pour coller au nom) → séparateur → types → stats. Jamais le sous-titre après les stats.
- **Cartes Top** : `mega-card` + `pokemon-name-mega` (rouge #e53e3e), `pokemon-name-legendary` (bleu #3b82f6), `pokemon-name-rare` (cyan #06b6d4), `pokemon-name-normal`. Les Méga s'ajoutent aux 25 (d'où 27-29 cartes). Chaque carte : `div.card-badges` après le nom, même vide.
- **Cartes contenu** : structure stricte pokemon-card > image-container(badges+img) > card-content(h2.pokemon-name...). `data-shiny` + badge toujours présents dans le HTML, pokemon.css décide.

## 5. Checklist d'audit d'une nouvelle page Top

1. theme-color = #29b6f6 (LE point récidiviste)
2. script.js?v=3 ; pas de lien Google Fonts ; icon-192 ; un seul h1
3. Zéro script inline ; zéro couleur dans les onclick ; cohérence appels/divs/boutons toggleBuild ; ids toggleAltImm existants
4. aria-expanded sur boutons de build + intro ; arrow-indicator sans style inline
5. Styles inline = uniquement les display:none fonctionnels
6. Intro repliable complète ; puces colorées ; lien Règles Générales en `lien-a-venir`
7. Paires shiny (regex `NomX.png`/`NomXS.png`) ; alt sur toutes les images ; pas d'ID dupliqué
8. Classes btn-* toutes parmi les 18

**Puis les 3 activations** : (a) script.js section 14, ligne du type → `page: 'TopX.html'` ; (b) navbar.html, lien du menu ; (c) index.html, carte du type (retirer `disabled` + onclick, href). Rappeler à Cam : vérifier les images + relire la méta.

## 6. Chantiers en attente

- **6 types restants** : Psy, Roche, Sol, Spectre, Ténèbres, Vol (barre : 11/17 actifs).
- **ChefRocket** : ajouter Cliff & Arlo (empiler dans `.rocket-list`) ; puis chantier séparation Sbires/Chefs (2 pages ? onglets ? menu navbar double ?) avant activation navbar/accueil.
- **MeilleursPokemon.html** (Règles Générales) : à créer ; ensuite remplacer les `lien-a-venir` des 11+ pages Top + activer carte accueil + lien navbar.
- **SEO/Open Graph** : meta description + og:tags (priorité pages Top) ; attend l'image 1200×630 de Cam.
- **📅 4 août 2026** : décommenter la ligne shiny de Frissonille dans pokemon.css (commentaire daté sur place) + retirer la classe `nouveau-shiny` de sa carte sur BraisesArctiques si souhaité.
- **Fil de l'eau évènements** : classe pour les `margin-bottom:10px` avant les titres "Bonus" ; classe `passe-go-intro` non définie (Braises) ; inline `color: var(--text-principal)` du Pikachu costumé (créer `nom-neutre` si le motif revient).

## 7. Prompt type pour conversation génératrice (Top)

Joindre : la page Top la plus récente + top.css + script.js (versions du dépôt). Règles clés du prompt : modèle joint fait foi (ignorer la mémoire) ; theme-color #29b6f6 strict ; toggleBuild sans couleurs + aria ; zéro inline (sauf display:none) ; livraison de LA SEULE page (activations gérées ailleurs) ; auto-vérification finale. Version complète du prompt : voir la conversation du refactor ou reconstruire depuis la checklist §5.

## 8. Leçons durement apprises

- **Fragment CSS orphelin** = lignes de déclarations flottant hors de tout sélecteur (copier-coller raté). Le navigateur avale LA RÈGLE SUIVANTE en se resynchronisant → symptôme trompeur : la règle d'après disparaît (ex. `.card-content` perdu = tout le contenu des cartes désaligné à gauche). Audit : chercher les `}` orphelins et déclarations hors bloc après chaque fusion manuelle.
- **Discipline de livraison** : reprendre TOUS les fichiers d'un lot livré, même ceux qui semblent inchangés — un fichier corrigé peut voyager dans le même lot qu'un autre.
- **Égalité de spécificité** : à (0,2,0) égal, c'est l'ordre de chargement qui tranche (navbar → global → pokemon → page). Pour battre pokemon.css depuis global.css, viser (0,2,1)+ (ex. préfixe `img.`).
- **Conversations génératrices** : récidive systématique du theme-color thématique (6+ fois) — l'audit doit toujours le vérifier en premier.

## 9. Historique express du refactor (pour contexte)

Session de juillet 2026 : audit complet du site ; centralisation shiny/builds/bandeaux dans script.js ; suppression du code mort (`:not()` grilles, grid-5/auto, zoom shiny, règles fantômes) ; variables d'accent créées puis rapatriées dans navbar.css ; ~10 coquilles de fichiers shiny corrigées (Artikodin, Forgerette, Poussifeu, Flamiaou, Tortipouss...) ; faux shinies retirés (Shifours, Wushours, Craparoi) ; service worker sécurisé ; barre des types créée ; refactor .active des 127 boutons Top ; navbar fusionnée après conflit de versions (leçon : règle 8 du prompt).

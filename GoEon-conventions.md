# GoEon — Conventions & Décisions

*Version 2.1 — 31 juillet 2026 (révision du soir). Remplace la v1 du 18 juillet (qui ne couvrait que les pages Top).*
*Chaque affirmation de ce document a été vérifiée sur les fichiers du dépôt à cette date.*

> **Règle n°1 pour toute conversation Claude reprenant ce projet : ne jamais travailler de mémoire.**
> Demander à Cam les fichiers concernés (HTML, CSS, JS) avant toute modification ou tout audit.
> Ce document dit ce qui *devrait* être vrai ; seuls les fichiers du dépôt disent ce qui *est* vrai.

---

## 1. Le projet

GoEon : site de ressources Pokémon GO francophone. HTML/CSS/JS pur, mobile-first, hébergé sur Netlify via Git. Développeur solo (Cam), perfectionniste du pixel.

**Workflow** : Cam fournit les données (il ne demande jamais de recherche — les classements, les rotations et les infos d'évènement viennent de lui, du blog officiel ou de Discord). Claude propose, Cam valide point par point, Claude livre des **fichiers complets téléchargeables** — jamais de fragments, jamais de fichier « ajouts » intermédiaire. Commits groupés logiques.

**Répartition des conversations** : des conversations « génératrices » créent les pages à partir d'un prompt type + une page modèle ; une conversation « référente » audite, corrige et fait les activations. Ce document permet à n'importe quelle conversation de devenir référente.

**Ligne éditoriale** : contenu de sources officielles uniquement, jamais de datamine — l'objectif long terme inclut une éventuelle candidature ambassadeur auprès de Niantic.

---

## 2. Architecture des fichiers

### CSS (ordre de chargement : navbar → global → pokemon → page)

**`navbar.css`** — ⭐ TOUTES les variables CSS (`:root` + `body.dark-mode`), y compris les accents : `--accent-bleu #29b6f6`, `--accent-violet #8b5cf6`, `--accent-or #F4D995`, `--accent-vert-bon #16a34a`, `--text-astuce`, `--bg-bandeau-tache`, `--bg-gigamax`. Contient l'`@import` Poppins **300;500;600;700;800** (ne jamais réduire cette liste), les styles navbar, et le tooltip `.coming-soon-tooltip` (partagé avec la nav des types et les cartes de l'accueil).

**`global.css`** — base commune à toutes les pages de contenu :
- cartes Pokémon (`pokemon-card` > `image-container` > `card-content`), grille `pokemon-grid-6` (seule variante existante)
- système `research-*` (TachesEtude, Rocket, évènements)
- badges : `emoji-shiny`, `emoji-costume`, `shiny-boost-circle`, `img.emoji-shiny.nouveau-shiny`
- encadrés `intro-rules` / `passe-go-deluxe-intro`, `section-sous-titre`, `texte-vert`, `category-title`, `footnote-ref`, `stats-note`
- puces d'intro : **`bullet`** (rapatriée de `top.css` le 01/08/2026 — 9 pages hors Top l'utilisaient sans charger ce fichier) et **`intro-sous-item`** (sous-puce `◦`, retrait 22 px)
- difficulté des raids : `raid-difficulty`, `diff-bubble` + `diff-1` à `diff-5`
- **`section-nav`** (barre de sections collante des pages évènement) — centralisée ici le 31/07/2026
- animation `twinkle`

**`pokemon.css`** — source de vérité shiny/tiers. ~702 classes `.pk-nomsansaccents` posées sur la carte : elles pilotent la couleur du nom (vert `#16a34a` = « Bon ») **et** la visibilité du badge shiny (`.emoji-shiny { display: inline }`). Défaut : badges masqués. Formes : suffixes `-a` (Alola), `-g` (Galar), `-h` (Hisui).

**`top.css`** — pages Top uniquement : `fandom-card`, les **18** palettes `.btn-X` + `.btn-X.active`, `.type-nav`, intro repliable, `.arrow-indicator`, `.badge-obscur`, `.top-title`.

**`optipm.css`** — page OptiPM uniquement : classes `pm-*` (timeline, tableaux, menu du Passe). Extraite du bloc `<style>` local le 01/08/2026.

**`rocket.css`** — page ChefRocket (layout 1/3, bandeaux chefs, counters verts). Versionné `?v=N` par tradition d'une autre conversation ; incohérent avec le reste, toléré.

**`index.css`** — accueil : héros, section Nouveautés (`news-*`), cartes de la grille (`home-card` + les 13 couleurs), grille des types, bandeaux repliables PWA/légende.

### JS

**`script.js`** — ⭐ TOUTE la logique, en **16 sections numérotées** :

| # | Rôle |
|---|------|
| 1 | Fetch de `navbar.html` + injection du logo, puis appel des initialisations |
| 2 | Onglet actif (`gererPageActive`) |
| 3 | Menu mobile + clic sur les dropdowns |
| 4 | Mode sombre — `appliquerAffichageTheme(sombre)` / `basculerTheme()` / `gererModeSombre()` |
| 5 | Johann-Effect : clic badge → clic image (scope `.pokemon-card, .research-reward-item`) |
| 6 | `initShinyToggle` — bascule shiny centralisée, garde anti-double-liaison, garde-fou visibilité |
| 7 | `toggleBuild` / `toggleAltImm` (pages Top) |
| 8 | `toggleBanner` (bandeaux repliables) |
| 9 | Fermeture du menu au scroll |
| 10 | Fermeture des dropdowns au clic extérieur (mobile) |
| 11 | Liens morts → tooltip (`.dropdown-menu a[href="#"]` + `a.lien-a-venir`) |
| 11 bis | `afficherComingSoon(e, decalageY)` — 20 sous le curseur (navbar), −45 au-dessus (cartes accueil) |
| 12 | Bouton « Signaler une erreur » |
| 13 | Bouton « Retour en haut » |
| 14 | Barre des types (config `TYPES_TOP`, `page: null` = grisé + tooltip) |
| 15 | Accueil : `switchTab`, `showComingSoon` |
| 16 | OptiPM : menu déroulant des PM du Passe + recalcul du tableau (garde `if (document.getElementById('pm-passe'))`) |

L'enregistrement du service worker se trouve entre les sections 11 bis et 12.

**`service-worker.js`** — réseau d'abord ; cache runtime filtré (GET + http + `response.ok`) ; fallback navigation hors-ligne → index ; `CACHE_NAME` volontairement non versionné.

---

## 3. Décisions actées (et leurs raisons)

- **Breakpoints** : site = 769px ; **navbar = 960/961px** (ses liens desktop exigent ~1000px ; tenté à 769, cassé en demi-fenêtre, revenu à 960). Trois occurrences de `960` dans `script.js` : synchroniser si changement.
- **`theme-color: #29b6f6` PARTOUT, jamais la couleur du type.** Décision réitérée 6+ fois — les conversations génératrices récidivent systématiquement. **Premier point à vérifier dans tout audit.**
- **Cache-busting inutile** : le service worker est en réseau-d'abord sur Netlify, les suffixes `?v=` n'apportent rien. Les pages portent encore `script.js?v=3` (héritage inoffensif, à retirer au fil de l'eau).
- **Graisses navbar : 300 explicite** (rendu « historique » que Cam préfère). Signaler-link : 700. Logo mobile : 600.
- **Titres** : un seul `<h1>` par page ; catégories en `<h2 class="category-title tier-X">`. Titre d'onglet : `GoEon - Nom` (tiret court).
- **Aucun emoji dans les titres de section.** Récidive corrigée plusieurs fois.
- **Zéro script inline, zéro style inline** (sauf `display:none` fonctionnels). Tout le CSS va dans les fichiers partagés. Trois exceptions documentées, cf. §8.
- **Alignements pixel** : technique du « fantôme structurel » (sous-titre `&nbsp;`, « + » des counters Rocket) plutôt que des marges magiques.
- **Dates** : sans année (« Depuis le mercredi 1er juillet, 6h - … »). Évènements : tiret long « — » toléré.
- **Icônes désactivées** : `cursor: not-allowed` + tooltip « Disponible prochainement ! » au clic.
- **Team Go Rocket** : navbar/accueil restent « prochainement » jusqu'à la séparation Sbires/Chefs.

---

## 4. Conventions de contenu

### Images

- **Dossier `Images/` avec un I majuscule** — c'est le vrai nom sur le disque. La quasi-totalité des pages écrit encore `images/` en minuscule (héritage : Netlify est insensible à la casse, donc rien n'a jamais cassé en production). **Migration progressive décidée le 1er août 2026** : on passe à `Images/` sur chaque page qu'on touche, sans campagne dédiée. Ne jamais « corriger » vers la minuscule.
- `NomSansAccents.png`, shiny = `NomS.png`, formes **avant** le S (`GoupixAS.png`).
- Suffixes : **A** Alola, **G** Galar *et* Gigamax, **H** Hisui, **M** Méga, **P** Primo (`GroudonP.png`), **C** / **T** formes spéciales, **B** / **N** fusions Kyurem.
- La collision Galar/Gigamax sur `G` est **assumée** : aucun Gigamax de Galar n'existe. Si le cas survenait, ce serait `GG`.
- **L'extension suit le fichier source** (`.png` ou `.webp` selon ce que Cam a trouvé). Aucune règle : ne jamais « corriger » une extension sans demander — erreur déjà commise sur Shaymin et sur l'œuf d'Éclosion.
- Exceptions de nommage constatées : `Ho-Oh.png` (avec tiret), `NigirigonR.png`, `TritosorR.png`.
  Le suffixe **R** apparait maintenant deux fois, sur deux Pokémon multi-formes dont une seule image représente l'ensemble. À surveiller : c'est peut-être une convention qui s'ignore plutôt que deux exceptions.
- Zarbi : classe `pk-zarbi`, libellé complet (« Zarbi B », pas « Lettre B »).

### Badges

- **Shiny** : `emoji-shiny` dans `div.badges`. Visibilité pilotée par `pokemon.css`. 14px mobile / 22px desktop ; 10px / 20px dans `research-image-container`.
  ⚠️ **NE JAMAIS réutiliser la classe `emoji-shiny` pour un autre badge** — elle porte l'écouteur de clic du Johann-Effect.
- **Costume / Gigamax** : `emoji-costume`. 18px mobile / 26px desktop, 10px / 20px en contexte research. Ombre portée, pas d'inversion en mode sombre, toujours visible.
  *(Les classes `badge-costume` et `badge-gigamax` mentionnées dans la v1 n'ont jamais existé dans le CSS — oubli de nettoyage.)*
- **Obscur** : `badge-obscur-icon`. **N'a aujourd'hui aucune règle de base** : seul `rocket.css` le dimensionne (12/18px), pour son layout dense. À créer dans `global.css` à 14/22px pour s'aligner sur le shiny voisin quand il apparaîtra sur les cartes de raid.
- **Shiny boosté** (évènements) : badge entouré de `<span class="shiny-boost-circle">` — cercle doré 1px, or vif en dark, scintille via `:has(.shiny-active)` quand le shiny est affiché. Accompagné du sous-titre `pokemon-subtitle` « Shiny boosté ! ».
- **Nouveau shiny annoncé** (pas encore actif en jeu) : classe `nouveau-shiny` sur le badge, **page d'évènement uniquement**. Le sélecteur `img.emoji-shiny.nouveau-shiny` (0,2,1) bat les masquages de `pokemon.css` (0,2,0).
  ⚠️ Ne jamais poser `shiny-active` en statique : le script la retire au premier clic.
  Dans `pokemon.css`, préparer la ligne `emoji-shiny` **en commentaire avec la date d'activation** — pattern « commentaire daté », cf. Frissonille (4 août 2026).

### Cartes

- **Ordre strict** : nom → sous-titre (`pokemon-subtitle`, son `margin-top: -6px` est fait pour coller au nom) → séparateur → types → stats. Jamais le sous-titre après les stats.
- **Structure** : `pokemon-card` > `image-container` (badges + img) > `card-content` (`h2.pokemon-name`…). `data-shiny` et le badge sont **toujours** présents dans le HTML ; c'est `pokemon.css` qui décide de l'affichage.
- **Séparateur « + » entre deux cartes** (pattern CoucheOzone) : une div flex de 24px, bold, centrée.

### Formats de texte

- **Rangs Méga : « Méga 1 », « Méga 2 » — jamais « M1 »**, y compris dans le `card-rank` des pages Top. La règle avait dérivé : 9 pages sur 13 étaient passées à `M1` (35 occurrences). **Les 14 pages Top ont été harmonisées le 31 juillet 2026.** À noter : `M1` reste l'abréviation de travail de Cam quand il transmet un classement, ce n'est pas ce qui doit être écrit dans le HTML.
- Fourchettes : tiret demi-cadratin espacé « – ».
- Billets : « Nom / X € » avec espace insécable après la barre.
- « Bien-œufs-reux » s'écrit avec la ligature œ.
- Accents circonflexes retirés dans les noms de formes affichés (Déchainé, Enchainé).

---

## 5. Pages Top[Type]

### Conventions propres

- **Aucune classe `pk-`** sur ces pages : elles sont réservées aux pages évènement et contenu.
- Couleurs de nom : `pokemon-name-mega` (rouge `#e53e3e`), `pokemon-name-legendary` (bleu `#3b82f6`), `pokemon-name-rare` (**cyan `#06b6d4`, exclusif à ces pages**), `pokemon-name-normal`.
- Les Méga s'ajoutent aux 25 → 27 à 30 cartes selon le type. **Placées exactement où Cam les positionne**, jamais regroupées.
- Chaque carte porte un `div.card-badges` après le nom, même vide.
- Boutons de build : `toggleBuild('xxx-details', 'toggle-xxx-btn')` **sans couleur** (elles vivent dans `.btn-X.active`) + `aria-expanded="false"` initial.
- **Bascule d'attaque immédiate — la logique, souvent mal comprise.** La face avant d'une page Top[X] porte la meilleure attaque immédiate *pour jouer le Pokémon en type X*. Le bouton « Également Top Y » ouvre le build bi-type ; la bascule affiche alors la meilleure attaque **dans l'absolu**, celle qu'on prend pour couvrir les deux types ou frapper un type neutre. **S'il n'y a pas de bascule sur une carte à bouton, c'est que l'attaque de la face avant est déjà la meilleure dans l'absolu** — ce n'est pas un oubli, et parler de l'autre attaque n'aurait aucun intérêt.
  Exemple canonique, Éthernatos : Draco-Queue sur `TopDragon` **sans bascule** (elle est déjà la meilleure des deux), Direct Toxik sur `TopPoison` **barré au profit de Draco-Queue** au clic. Autre cas, Noadkoko d'Alola : Draco-Queue sans bascule sur `TopDragon`, Balle Graine barrée au profit de Draco-Queue sur `TopPlante`.
  Mise en œuvre : `toggleAltImm('id-imm', 'id-imm-alt')` + un `<span>` masqué pour l'alternative. Si l'attaque de la face avant porte une icône de type, lui donner un id et le passer en 3e argument pour qu'elle disparaisse au clic.
- `<span class="footnote-ref">` se place **après** le nom d'attaque et l'indicateur Legacy, mais **avant** l'icône de type.
- Puces d'intro colorées comme leur ligne (`bullet legend-blue/cyan/red`), puce Legacy neutre.

### Checklist d'audit

1. `theme-color` = `#29b6f6` — **le point récidiviste**
2. Pas de lien Google Fonts ; `icon-192` ; un seul `<h1>`
3. Zéro script inline ; zéro couleur dans les `onclick` ; cohérence appels / divs / boutons `toggleBuild` ; ids `toggleAltImm` existants
4. `aria-expanded` sur les boutons de build et l'intro ; `arrow-indicator` sans style inline
5. Styles inline = uniquement les `display:none` fonctionnels
6. Intro repliable complète ; puces colorées ; lien Règles Générales en `lien-a-venir`
7. Paires shiny (`NomX.png` / `NomXS.png`) ; `alt` sur toutes les images ; pas d'ID dupliqué
8. Classes `btn-*` toutes parmi les 18

### Les 2 activations

(a) `script.js` section 14, ligne du type → `page: 'TopX.html'` · (b) `index.html`, carte du type (retirer `disabled` + `onclick`, poser le `href`) **et** une entrée dans la section Nouveautés.

⚠️ La v1 mentionnait une troisième activation dans `navbar.html` : **elle n'existe plus.** La navbar ne contient aucun lien par type, seulement « Meilleurs Pokémon » → `index.html#types`.
Puis rappeler à Cam : vérifier les images, relire la méta.

---

## 6. Pages Évènement

### Structure type

`h1` → `raids-date` → `astuce-shiny` (si des shinies sont cliquables) → `section-nav` (si ≥ 4 sections) → `intro-rules` d'introduction → les sections.

Ordre de sections observé : Pokémon à l'honneur → Bonus → Nouveaux Pokémon → Pokémon Sauvages → Raids → Tâches d'Étude → Attaques Spéciales → Passe Go / Ticket Payant → Infos Supplémentaires. Toutes optionnelles.

### Conventions propres

- **Couleur des noms** : vert via la classe `pk-` pour les bons Pokémon, noir par défaut pour les autres. **Le cyan est interdit ici** — il appartient aux pages Top.
- **Pokémon costumé qui ne peut pas évoluer** : pas de classe `pk-` (elle colorerait le nom en vert), et il faut forcer `style="display: inline-block;"` sur le badge shiny. S'il porte quand même un `pk-`, neutraliser le nom avec `style="color: var(--text-principal);"`.
  → *Le motif est revenu 3 fois ; une classe `nom-neutre` serait justifiée (cf. §10).*
- **`section-nav`** : `<nav class="section-nav">` avec un `<a href="#ancre">` par section, et l'`id` correspondant posé sur le `h2.category-title`. Le CSS est dans `global.css` depuis le 31/07 — **ne plus jamais le recopier dans un bloc `<style>`**.
- **`section-sous-titre`** pour les sous-titres de section. La classe `event-sous-titre` est **dépréciée** (elle survit dans `global.css`, candidate à la suppression).
- **Tâches d'étude** : un seul `research-card` quand plusieurs tâches partagent la même récompense, séparées par `<br>`.
- `research-sep` (`<hr>`) est `display: none` global : le forcer en inline quand un sous-titre `research-reward-form` a besoin d'un séparateur visible avant la valeur PC.
- Les séparateurs de rangée `research-rangee-sep` sont insérés par une fonction JS **encore recopiée à la main** depuis `TachesEtude.html` (cf. §10).

### Checklist d'audit

1. `theme-color` = `#29b6f6`
2. Un seul `<h1>` ; `icon-192` ; pas de lien Google Fonts
3. Aucun bloc `<style>` (sauf exception justifiée et commentée)
4. `section-nav` : chaque `href="#x"` a son `id="x"` sur un `h2`
5. Pas de cyan ; les `pk-` ne servent qu'aux bons Pokémon
6. Badges : `emoji-shiny` jamais détourné ; `emoji-costume` pour costume/Gigamax ; `shiny-boost-circle` uniquement dans un `div.badges`, jamais en ligne dans du texte
7. `nouveau-shiny` accompagné d'un commentaire daté dans `pokemon.css`
8. Tous les Pokémon de la page ont leur classe dans `pokemon.css`
9. Pas d'emoji dans les titres de section
10. Dates cohérentes avec l'accueil et la navbar

### Activations

`index.html` (carte d'évènement + couleur, section Nouveautés) et `navbar.html` (« À venir » / « En cours »). Retirer les évènements terminés des deux.

---

## 7. Accueil, navigation et pages ressource

- **`index.html`** : héros, Nouveautés, cartes d'évènements, grille des types, bandeaux PWA/légende.
- **Cartes d'évènement** : une classe couleur par évènement (13 existantes : yellow, purple, blue, green, orange, grey, red, violet, gold, brown, teal, staross, pink), toujours **déclarée en clair ET en mode sombre**. `min-height: 70px` sur `.event-label`, `margin-top: auto` sur `.event-date` pour aligner les dates. Badge vert « En cours ! » via `.event-en-cours` + `.badge-en-cours`.
- **Nouveautés** : `news-group` daté au format `JJ/MM`, un `news-items li` par entrée. Mettre à jour à chaque livraison de contenu.
- **Ancres** : `scroll-margin-top: 70px` sur `.home-section` et `.type-grid`. Les liens navbar « À venir » et « Meilleurs Pokémon » pointent directement sur `index.html#evenements` et `index.html#types` (l'ancre `#types` est sur la `.type-grid`, pas sur la section, pour dépasser le titre).
- **Menu mobile** : `max-height: calc(100vh - 60px)` + `overflow-y: auto` + `overscroll-behavior: contain` (le scroll interne ne referme plus le menu).
- **Pages ressource** (`raids`, `raids_obscurs`, `oeufs`, `dynamax`, `metamorph`, `boost_poussiere`, `TachesEtude`, `OptiPM`) : mêmes conventions de cartes et de badges. `OptiPM` a son propre jeu de classes `pm-*`, désormais dans `optipm.css` (extrait du `<style>` local le 01/08/2026).
- **Difficulté des raids** : `raid-difficulty-label` (« Dresseurs Nécessaires ») + `raid-difficulty` contenant des `diff-bubble diff-1…5` (rouge → orange → jaune → vert clair → vert foncé, texte blanc unifié par `text-shadow`). Un Méga typique utilise 1/3/4/5, un Légendaire les cinq.

---

## 8. Exceptions documentées

Trois entorses assumées à la règle « aucun CSS hors des fichiers partagés » :

1. **`TerresSauvages2026.html`** — bloc `<style>` désactivant l'animation du badge shiny (`animation: none !important`), parce que le clic y affiche le **Gigamax** et non le shiny : l'animation induirait le lecteur en erreur. Commenté sur place.
2. **`script.js` sections 12 et 13** — les boutons « Signaler » et « Retour en haut » sont construits en JS et injectent leur propre `<style>`. Historique ; fonctionne ; à rapatrier dans `global.css` un jour.
3. **`rocket.css?v=N`** — seul fichier CSS versionné, tradition d'une autre conversation.

---

## 9. Leçons durement apprises

- **Fragment CSS orphelin** = déclarations flottant hors de tout sélecteur (copier-coller raté). Le navigateur avale **la règle suivante** en se resynchronisant → symptôme trompeur : c'est la règle d'après qui disparaît (ex. `.card-content` perdu = tout le contenu des cartes désaligné à gauche). Après toute fusion manuelle : vérifier l'équilibre des accolades et chercher les déclarations hors bloc.
- **Discipline de livraison** : reprendre TOUS les fichiers d'un lot livré, même ceux qui semblent inchangés — un fichier corrigé peut voyager dans le même lot qu'un autre.
- **Égalité de spécificité** : à (0,2,0) égal, c'est l'ordre de chargement qui tranche. Pour battre `pokemon.css` depuis `global.css`, viser (0,2,1)+ (ex. préfixe `img.`).
- **Conversations génératrices** : récidive systématique du `theme-color` thématique. L'audit le vérifie **en premier**.
- **Ne jamais corriger une extension d'image** de sa propre initiative (`.png` ↔ `.webp`) : Cam prend les fichiers là où il les trouve.
- **Ne jamais deviner un nom de fichier** à partir d'une description orale (`HoOh` vs `Ho-Oh`) : demander.
- **Réécrire un bloc `<script>` par regex emporte le suivant.** Un `.*` entre `<script>` et `</script>` est gourmand : il capture jusqu'au **dernier** `</script>` de la page et avale donc le `<script src="script.js">` final. Symptôme : la navbar disparaît alors que le HTML semble intact. Après toute réécriture de script : vérifier que `script.js` est toujours appelé en fin de fichier. (Erreur commise le 1er août sur `OptiPM.html`.)
- **Le code dit la vérité, pas la mémoire.** Ce document a contenu pendant deux semaines des classes qui n'existaient pas.

---

## 10. Chantiers en attente

### Daté

- **📅 4 août 2026** — décommenter la ligne shiny de Frissonille dans `pokemon.css` (commentaire daté sur place, ~ligne 1044) + retirer `nouveau-shiny` de sa carte sur `BraisesArctiques.html` si souhaité.
- **📅 16 août 2026** — Journée Communauté Goupilou. Goupilou et Roublenard deviennent **Shiny, et non « Bon »** (la v2 de ce document disait « Bon + Shiny », c'était faux). Décommenter la ligne `emoji-shiny` de `pk-goupilou` et de `pk-roublenard` dans `pokemon.css`, puis retirer les trois `nouveau-shiny` de `CDGoupilou.html`. ✅ Les deux commentaires datés sont posés depuis le 31 juillet, `pk-roublenard` a été créée à cette occasion.
- **Demain (rotation raids)** — poser le badge Obscur sur `raids_obscurs.html` (il n'y en a aujourd'hui **aucun**) + créer la règle de base `badge-obscur-icon` dans `global.css` à 14/22px.

### Contenu

- **3 types Top restants** : Spectre, Ténèbres, Vol. (`TopSol` livrée et activée le 31 juillet.)
- **ChefRocket** : ajouter Cliff & Arlo (empiler dans `.rocket-list`) ; puis chantier séparation Sbires/Chefs avant activation navbar/accueil.
- **MeilleursPokemon.html** (Règles Générales) : à créer ; ensuite remplacer les `lien-a-venir` des 13 pages Top + activer la carte d'accueil + le lien navbar.
- **`OptiPM.html` est considérée comme terminée** (1er août 2026). Le Passe payant est couvert par le menu déroulant ; le ticket d'évènement et l'Étude Ambassadeur sont traités par deux lignes « Optionnel » en fin de tableau. Plus de « versions à venir ».
- **SEO / Open Graph** : meta description + og:tags (priorité pages Top) ; attend l'image 1200×630 de Cam.

### Dette technique

- **`research-rangee-sep`** : la fonction JS est recopiée à la main de page en page → à verser dans `script.js`.
- **Classe `nom-neutre`** à créer : le motif `style="color: var(--text-principal);"` sur un `pokemon-name` est apparu au moins 3 fois (Pikachu costumé, Méga-Staross, Passe Premium).
- **`event-sous-titre`** toujours déclarée dans `global.css` alors qu'elle est dépréciée → vérifier qu'aucune page ne l'utilise, puis supprimer.
- **Couleurs en dur** : `#29b6f6`, `#16a34a`, `#06b6d4` écrits une douzaine de fois dans `index.css`, `top.css` et `global.css` alors que `--accent-bleu` et `--accent-vert-bon` existent.
- **`script.js?v=3`** sur toutes les pages : inutile, à retirer au fil de l'eau.
- **Marges avant les titres « Bonus »** : `margin-bottom:10px` inline récurrent → mérite une classe.

### Écarté

- **Notifications par pastille (Badging API)** — étudié le 31/07/2026, **abandonné**. `setAppBadge` n'est pas implémenté par Chrome sur Android, et sur iOS la pastille exige que l'utilisateur ait accordé la permission de notifications. La pastille n'est pas un mécanisme autonome : c'est une conséquence des notifications push.
- **Notifications push** — possibles techniquement (Android et iOS ≥ 16.4, PWA installée pour iOS), mais nécessitent une brique serveur : clés VAPID, stockage des abonnements, déclencheur d'envoi. Incompatible avec le site 100 % statique en l'état. Deux chemins si le sujet revient : Netlify Functions + stockage, ou un service tiers type OneSignal.

---

## 11. Prompt type — conversation génératrice (page Top)

Joindre : la page Top la plus récente + `top.css` + `script.js` (versions du dépôt).

Règles clés à rappeler dans le prompt :
1. Le modèle joint fait foi — **ignorer la mémoire**.
2. `theme-color: #29b6f6` strict.
3. `toggleBuild` sans couleurs + `aria-expanded`.
4. Zéro inline, sauf `display:none`.
5. Aucune classe `pk-` sur une page Top.
6. Livrer **la seule page** demandée : les activations sont gérées ailleurs.
7. Ne jamais inventer un nom de fichier image ni corriger une extension.
8. Auto-vérification finale sur la checklist §5.

---

## 12. Historique express

**Juillet 2026 — le grand refactor** : audit complet du site ; centralisation shiny / builds / bandeaux dans `script.js` ; suppression du code mort ; variables d'accent rapatriées dans `navbar.css` ; ~10 coquilles de fichiers shiny corrigées ; faux shinies retirés (Shifours, Wushours, Craparoi) ; service worker sécurisé ; barre des types créée ; refactor `.active` des 127 boutons Top ; navbar fusionnée après conflit de versions.

**Seconde quinzaine de juillet** : une douzaine de pages d'évènement (DixiemeAnniversaire, CoucheOzone, GorythmicGigamax, BraisesArctiques, EclosionFeuGlace, FestivalAquatique, MegaStaross, CDGoupilou, CitySafariMarseille, GoFestMegaFinale, TerresSauvages2026) ; pages ressource `OptiPM.html` ; 8 pages Top supplémentaires (Psy, Feu, Glace, Insecte, Plante, Poison, Roche, Sol) ; système `shiny-boost-circle` ; rectangles de difficulté des raids ; section Nouveautés de l'accueil.

**1er août 2026** : refonte de l'interaction d'`OptiPM.html` — les deux cases à cocher (Passe récupéré / Ambassadeur) remplacées par un menu déroulant de 26 entrées (0 à 2 500 PM par pas de 100, libellés « X PM → Y Combats »), tableau entièrement recalculé par un moteur `data-delta` au lieu de valeurs figées `data-default`/`data-variant` ; lignes 7 et 8 ajoutées ; Ambassadeur et ticket payant devenus deux lignes « Optionnel » ; bloc Règles Générales complété (plafond de stockage, sous-puces) ; page passée à `Images/`. Le mécanisme a été validé par simulation Python contre les deux schémas de référence de Cam avant écriture. Page considérée comme terminée. Dans la foulée : `optipm.css` créée, JS versé en section 16 de `script.js` (OptiPM n'a plus ni `<style>` ni `<script>` inline), et `.bullet` rapatriée de `top.css` vers `global.css` — elle manquait à 9 pages hors Top, soit ~98 puces sans leur marge.

**31 juillet 2026 (soir)** : `TopSol.html` (30 cartes, 5 Méga) livrée et activée ; 12 entrées ajoutées ou modifiées dans `pokemon.css` (709 classes) ; commentaires datés du 16 août posés pour Goupilou et Roublenard ; **harmonisation des rangs Méga sur les 9 pages Top qui utilisaient `M1`** ; pages `TaxiVolant`, `DixiemeAnniversaire` et `CoucheOzone` constatées supprimées du dépôt ; ce document corrigé sur cinq points.

**31 juillet 2026** : audit des 7 fichiers partagés ; `section-nav` centralisée dans `global.css` (6 pages, blocs strictement identiques) + correction du bug d'ancre (`scroll-margin-top`) ; Badging API étudié puis écarté ; refonte de ce document.

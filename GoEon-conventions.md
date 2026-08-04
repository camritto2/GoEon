# GoEon — Conventions & Décisions

*Version 2.7 — 4 août 2026 (soir). Livraison de `TopVol.html` : les **17** classements par type sont complets.*
*Chaque affirmation de ce document a été vérifiée sur les fichiers du dépôt à cette date.*

> **Règle n°1 pour toute conversation Claude reprenant ce projet : ne jamais travailler de mémoire.**
> Demander à Cam les fichiers concernés (HTML, CSS, JS) avant toute modification ou tout audit.
> Ce document dit ce qui *devrait* être vrai ; seuls les fichiers du dépôt disent ce qui *est* vrai.

---

## 1. Le projet

GoEon : site de ressources Pokémon GO francophone. HTML/CSS/JS pur, mobile-first, hébergé sur Netlify via Git. Développeur solo (Cam), perfectionniste du pixel.

**Workflow** : Cam fournit les données (il ne demande jamais de recherche — les classements, les rotations et les infos d'évènement viennent de lui, du blog officiel ou de Discord). Claude propose, Cam valide point par point, Claude livre des **fichiers complets téléchargeables** — jamais de fragments, jamais de fichier « ajouts » intermédiaire. Commits groupés logiques.

**Répartition des conversations** : il n'y en a plus. Chaque conversation crée la page, l'audite, la corrige et fait les activations. Ce document est ce qui le permet — il se lit en entier au début d'une session, avant toute lecture de fichier.

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
- puces d'intro : **`bullet`** et **`intro-sous-item`** (sous-puce `◦`, retrait 22 px)
- difficulté des raids : `raid-difficulty`, `diff-bubble` + `diff-1` à `diff-5`
- **`section-nav`** (barre de sections collante des pages évènement)
- animation `twinkle`

**`pokemon.css`** — source de vérité shiny/tiers. Classes `.pk-nomsansaccents` posées sur la carte : elles pilotent la couleur du nom (vert `--accent-vert-bon` = « Bon ») **et** la visibilité du badge shiny (`.emoji-shiny { display: inline }`). Défaut : badges masqués. Formes : suffixes `-a` (Alola), `-g` (Galar), `-h` (Hisui).

**`top.css`** — pages Top uniquement : `fandom-card`, les **18** palettes `.btn-X` + `.btn-X.active`, `.type-nav`, intro repliable, `.arrow-indicator`, `.badge-obscur`, `.top-title`.

**`optipm.css`** — page OptiPM uniquement : classes `pm-*` (timeline, tableaux, menu du Passe).

**`rocket.css`** — page ChefRocket (layout 1/3, bandeaux chefs, counters verts). Seul fichier CSS versionné `?v=N` : incohérent avec le reste, toléré.

**`index.css`** — accueil : héros, section Nouveautés (`news-*`), cartes de la grille (`home-card` + les 13 couleurs), grille des types, bandeaux repliables PWA/légende.

### JS

**`script.js`** — ⭐ TOUTE la logique, en **17 sections numérotées** :

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
| 17 | `insererSeparateurRangee` — un `<hr class="research-rangee-sep">` toutes les 6 récompenses (garde `if (document.querySelector('.research-rewards'))`) |

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

- **Dossier `Images/` avec un I majuscule** — c'est le vrai nom sur le disque. Héritage : Netlify est insensible à la casse, donc rien n'a jamais cassé en production. Ne jamais « corriger » vers la minuscule.
- **La règle vaut aussi pour les noms de fichiers.** Les icônes de type s'appellent `Spectre.webp`, `Feu.webp`, `Psy.webp`… avec une majuscule, alors que toutes les pages les écrivaient en minuscule. Quand on migre une page, on reprend la casse réelle du disque, pas seulement celle du dossier.
- **Méthode de migration** : construire la table des fichiers réels de `Images/`, réécrire chaque `src`/`href` vers le nom exact, et **ne rien remplacer** si le nom n'existe pas tel quel — le signaler à Cam. Aucune extension n'est jamais devinée.
- **Migration terminée le 1er août 2026** : la totalité du site est en `Images/` avec la casse réelle — 3 639 chemins au total, HTML, `script.js`, `navbar.html`, `manifest.json` et `service-worker.js` compris. La section 14 de `script.js` construit `'Images/' + t.icone + '.webp'` : les valeurs `icone` de `TYPES_TOP` sont donc capitalisées (`'Spectre'`, pas `'spectre'`). Seuls restent en minuscule les chemins dont le fichier **n'existe pas sur le disque** (voir §10).
- `NomSansAccents.png`, shiny = `NomS.png`, formes **avant** le S (`GoupixAS.png`).
- Suffixes : **A** Alola, **G** Galar *et* Gigamax, **H** Hisui, **M** Méga, **P** Primo (`GroudonP.png`), **C** / **T** formes spéciales, **B** / **N** fusions Kyurem.
- La collision Galar/Gigamax sur `G` est **assumée** : aucun Gigamax de Galar n'existe. Si le cas survenait, ce serait `GG`.
- **L'extension suit le fichier source** (`.png` ou `.webp` selon ce que Cam a trouvé). Aucune règle : ne jamais « corriger » une extension sans demander — erreur déjà commise sur Shaymin et sur l'œuf d'Éclosion.
- Exceptions de nommage constatées : `Ho-Oh.png` (avec tiret), `NigirigonR.png`, `TritosorR.png`.
  Le suffixe **R** reste **deux exceptions isolées, pas une convention** — tranché le 2 août 2026. Polthégeist et Théffroyable sont eux aussi multi-formes, mais leurs fichiers s'appellent `Polthegeist.png` et `Theffroyable.png`, sans suffixe. Ne pas généraliser le `R` : demander à Cam au cas par cas.
- Zarbi : classe `pk-zarbi`, libellé complet (« Zarbi B », pas « Lettre B »).

### Le statut « Bon » suit les classements, pas les stats

Le vert `--accent-vert-bon` de `pokemon.css` signifie **« ce Pokémon figure dans un Top »**, pas « ce Pokémon est bon dans l'absolu ». Trois conséquences :

- Quand un Pokémon **sort** d'un classement, vérifier s'il figure encore dans un autre Top. Si non, le repasser en `/* Nom — Normal / Shiny */` et supprimer ses deux lignes de couleur.
- **La règle remonte aux pré-évolutions.** Elles sont vertes parce que leur évolution l'est ; elles perdent le vert en même temps qu'elle.
- Un Pokémon qui **entre** dans un Top alors qu'il figurait déjà dans un autre n'a besoin de rien (cas de Cancrelove, déjà Bon via le Top Insecte).

Détail d'écriture : les blocs Bon écrivent `.emoji-shiny  {` avec **deux** espaces, les blocs Normal `.emoji-shiny {` avec **une**. Respecter l'espacement du bloc d'arrivée lors d'une conversion.

### Deux classes utilitaires (créées le 1er août 2026)

- **`nom-neutre`** — annule le vert « Bon » de `pokemon.css` sur une page donnée. Déclarée dans `global.css` en **deux** sélecteurs, tous deux en spécificité **(0,2,1) obligatoire** puisque `pokemon.css` charge après et pèse (0,2,0) : `h2.pokemon-name.nom-neutre` pour les cartes normales et `span.research-reward-name.nom-neutre` pour les cartes d'étude (ajouté le 4 août 2026 — la classe ne fonctionnait pas en contexte research). Un seul usage aujourd'hui : Pikachu costumé sur `BraisesArctiques.html`, en carte research.
  ⚠️ Avant de poser cette classe, **vérifier que le Pokémon est réellement « Bon » dans `pokemon.css`**. Quatre des cinq styles inline d'origine ne servaient à rien (Psykokwak et Staross sont « Normal ») ou masquaient à tort un vert légitime (Lokhlass).
- **`intro-item-fin`** — `margin-bottom: 10px` sur le dernier item d'un groupe, pour dégager le sous-titre `<strong>` qui suit dans les listes de Passe Go.

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
  ⚠️ **Le `-6px` ne vaut que pour un nom tenant sur une ligne.** `pokemon-name` centre son texte dans un `min-height: 3.2em`, soit deux lignes réservées ; sur un nom court la moitié basse est vide et le sous-titre vient s'y loger. Sur un nom qui passe à la ligne, il n'y a plus de mou et le sous-titre mord sur la seconde ligne. Constaté le 4 août sur « Darumarond de Galar » — **seul cas du site** d'un nom assez long avec un sous-titre. Non corrigé : le piège dort dans `global.css` pour le prochain.
- **Structure** : `pokemon-card` > `image-container` (badges + img) > `card-content` (`h2.pokemon-name`…). `data-shiny` et le badge sont **toujours** présents dans le HTML ; c'est `pokemon.css` qui décide de l'affichage.
- **Séparateur « + » entre deux cartes** (pattern CoucheOzone) : une div flex de 24px, bold, centrée.

### Formats de texte

- **Rangs Méga : « Méga 1 », « Méga 2 » — jamais « M1 »**, y compris dans le `card-rank` des pages Top. La règle avait dérivé : 9 pages sur 13 étaient passées à `M1` (35 occurrences). **Les 14 pages Top ont été harmonisées le 31 juillet 2026.** À noter : `M1` reste l'abréviation de travail de Cam quand il transmet un classement, ce n'est pas ce qui doit être écrit dans le HTML.
- Fourchettes : tiret demi-cadratin espacé « – ».
- Billets : « Nom / X € » avec espace insécable après la barre.
- La ligature œ est obligatoire : « Bien-œufs-reux », « Nœud Herbe ». (7 occurrences corrigées sur `TopPlante` et 1 sur `TopPoison` le 2 août 2026.)
- Accents circonflexes retirés dans les noms de formes affichés (Déchainé, Enchainé).
- **Cout d'une 2e Attaque Chargée : « N Bonbons », jamais le nom de l'espèce.** Trois cartes écrivaient « 100 Bonbons Zacian », « 75 Bonbons Terhal », « 75 Bonbons Riolu » ; corrigées le 3 août 2026. Les 224 blocs de cout du site sont désormais uniformes.

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
- **`toggleAltImm`, 3e argument** : si la face avant porte une icône de type, lui donner un id et le passer en 3e argument. L'icône disparait au clic **même quand l'attaque révélée est du même type** (Malvalame, Courrousinge) — décision du 1er août. Reste non tranché : faut-il donner sa propre icône à l'attaque révélée quand elle est hors-type ? `TopPoison` (Nidoking) le fait, le reste du site non.
- **Le bouton « Également Top Y » n'existe que si le Pokémon figure vraiment dans le Top Y.** Sinon on retire bouton et build, en laissant `<div class="card-button"></div>` et `<div class="card-build"></div>` vides. Le piège classique : une forme Méga est au Top Y sans que la forme de base y soit, ou l'inverse — vérifier la carte, pas l'espèce.
  **Une exception assumée depuis le 2 août : Méga-Mewtwo X.** Il n'est pas au Top Psy (c'est Méga-Mewtwo Y qui y figure), mais Frappe Psy reste sa meilleure Attaque Psy et l'information a été jugée utile. Le bouton et le build sont donc conservés, avec une `build-note` — « Méga-Mewtwo Y est Top Psy. » — qui lève l'ambigüité au déploiement. Le libellé du bouton reste court : il n'a **pas** été allongé, faute de place sur une carte mobile.
  **Contre-exemple, tranché le 3 août : Méga-Métalosse.** Il portait un bouton « Également Top Psy » alors qu'il ne figure pas dans `TopPsy` (seul Métalosse y est). Aucune information utile ne le justifiait : bouton et build **retirés**. L'exception Méga-Mewtwo X reste donc unique, et se justifie par l'intérêt de l'information, pas par la simple existence d'une attaque hors-type.
- **Pas de bloc « Cout » quand il n'y a pas de 2e Attaque Chargée.** Le build se réduit alors à la ligne `2e Attaque Chargée : -`, sans `<hr>` ni `attack-cost-container`. Invariant vérifiable : `nombre de builds − cartes sans 2e attaque = nombre de blocs de cout`.
- **L'absence de 2e attaque s'écrit avec un tiret court `-`**, jamais un tiret long `—`.
- **Quand le `-` s'explique par la supériorité de l'attaque de face**, le même `footnote-ref` se pose **deux fois** : sur l'Attaque Chargée de la face avant *et* sur le tiret, avec une `card-note` unique. Modèles : Necrozma Crinière du Couchant (`TopPsy`), Forgelina (`TopFée`), Cobaltium (`TopAcier` et `TopCombat` depuis le 3 août). Une attaque de face hors-type porte en plus son icône de type, placée **après** le renvoi.
- **Attaques toujours Legacy, sur toutes les pages** : Végé-Attaque, Rafale Feu, Hydroblast. Si on en trouve une sans `L`, c'est un oubli.
- `<span class="footnote-ref">` se place **après** le nom d'attaque et l'indicateur Legacy, mais **avant** l'icône de type. Ordre strict : `nom` → `legacy-indicator` → `footnote-ref` → icône.
- **Deux classes de note, à ne pas confondre.** `card-note` s'affiche en permanence sous la carte : elle sert aux renvois posés sur la face avant. `build-note` vit **à l'intérieur du build** et n'apparait qu'au déploiement : elle sert aux renvois posés sur la 2e Attaque Chargée. Un audit qui ne cherche que `card-note` conclura à tort que des notes manquent.
- **Invariant croisé des bascules.** Pour un Pokémon présent sur plusieurs pages Top, chaque page implique une « meilleure attaque immédiate absolue » : l'attaque révélée s'il y a une bascule, celle de la face avant sinon. **Toutes les pages doivent impliquer la même.** Deux pages sans bascule affichant deux attaques différentes, ou deux bascules pointant l'une vers l'autre, sont contradictoires par construction.
- **Les formes Apex sont en cyan** (`pokemon-name-rare`), pas en bleu : elles relèvent du « obtenu une ou deux fois dans le jeu » de l'intro. Vérifié sur Lugia Apex (`TopPsy`, `TopVol`) et Ho-Oh Apex (`TopFeu`, `TopVol`). Le bleu légendaire reste pour la forme de base, qui coexiste souvent sur la même page.
- **Une icône de type accompagne toute attaque hors-type de la face avant**, immédiate comme chargée — pas seulement celles portées par une bascule. Sur `TopVol` : Crocs Feu (Drattak), Vent Féérique (Amovénus), Coupe Psycho (Artikodin de Galar), Balayage (Électhor de Galar), Éclair (Électhor), Extrasenseur (Lugia), Rafale Feu (Dracaufeu).
- **Numérotation des renvois.** Séquentielle dans l'ordre des cartes. Un numéro se **réutilise tel quel entre la forme Méga et la forme de base d'une même espèce** (Rayquaza et Draco Ascension, Dracaufeu et Rafale Feu). En revanche **deux espèces différentes gardent deux numéros distincts, même si le texte est mot pour mot identique** — `TopPsy` porte la même phrase en 4 et en 8, `TopVol` en 7 et en 8. Ne pas « factoriser ».
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
9. Aucun `images/` en minuscule ; casse des fichiers conforme au disque
10. Aucun bloc « Cout » sans 2e attaque ; aucun tiret long
11. Ordre `legacy-indicator` puis `footnote-ref` ; aucun renvoi sans texte (chercher **`card-note` ET `build-note`**)
12. Croisé avec les autres pages Top : bascules cohérentes, Legacy identique, réciprocité des boutons, mêmes badge Obscur / couleur de nom / libellé de forme / cout / image

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
- **`research-reward-form`** est le sous-titre des cartes d'étude : italique 8px, gris secondaire, aucune bordure. `text-align: center` lui a été ajouté le 4 août 2026 — `research-reward-item` est un flex en colonne avec `align-items: stretch`, sans quoi le texte reste calé à gauche sous une image centrée. **Ne pas utiliser `research-note` à sa place** : elle porte un `border-top` pointillé, elle est faite pour une note de bas de carte. Elle n'est utilisée nulle part.
- **Cartes du Passe Go** : le rang n'est **pas** un `pokemon-subtitle`, c'est un bandeau `passe-go-rank` en **premier enfant** de `.pokemon-card`, avant `.image-container` — même principe que `research-task`, même fond `--bg-bandeau-tache`, même `border-radius: 16px 16px 0 0`. Le PC va en `passe-go-pc` (avec `boost-value` pour le chiffre), pas en `pokemon-stats`/`stat-range`. Deux règles desktop `.pokemon-card:has(.passe-go-rank)` confirment cette structure.
  ⚠️ **`passe-go-rank` s'écrit en `<div>`, jamais en `<p>`** : `.pokemon-card` a `overflow: hidden`, donc la marge par défaut d'un `<p>` ne peut pas s'échapper et décolle le bandeau du haut de la carte. Un `margin: 0` a été ajouté à la classe le 4 août pour blinder le cas. `passe-go-pc`, elle, déclare sa propre marge et est bien un `<p>`.
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

`index.html` uniquement : carte d'évènement + classe couleur, et entrée dans la section Nouveautés. Retirer la carte quand l'évènement est terminé.

⚠️ La v2 annonçait une activation dans `navbar.html` : **elle n'existe pas.** La navbar ne cite aucun évènement, son lien « À venir » pointe sur `index.html#evenements`. Même erreur que pour les pages Top, corrigée le 2 août 2026.

---

## 7. Accueil, navigation et pages ressource

- **`index.html`** : héros, Nouveautés, cartes d'évènements, grille des types, bandeaux PWA/légende.
- **Cartes d'évènement** : une classe couleur par évènement (13 existantes : yellow, purple, blue, green, orange, grey, red, violet, gold, brown, teal, staross, pink), toujours **déclarée en clair ET en mode sombre**. `min-height: 70px` sur `.event-label`, `margin-top: auto` sur `.event-date` pour aligner les dates. Badge vert « En cours ! » via `.event-en-cours` sur le `<a class="home-card">` + un `<span class="badge-en-cours">` en premier enfant. Le CSS existait depuis longtemps dans `index.css` mais **n'a été employé pour la première fois que le 4 août 2026**, sur Braises Arctiques. À retirer à la fin de chaque évènement, en même temps que la carte.
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
- **Discipline de livraison — qui fait quoi.** Claude ne livre que les fichiers **réellement modifiés** depuis la dernière récupération de Cam : re-fournir un fichier bit à bit identique ne sert à rien et brouille la lecture de ce qui a bougé. Chaque livraison dit explicitement quels fichiers ont changé et pourquoi. En contrepartie, Cam reprend **tous** les fichiers du lot annoncé, même ceux dont il ne se souvient pas qu'ils aient changé — un fichier corrigé voyage souvent dans le même lot qu'un autre. *(Règle reformulée le 2 août 2026 : la version d'origine était ambigüe et avait conduit à re-livrer trois pages Top inchangées.)*
- **Égalité de spécificité** : à (0,2,0) égal, c'est l'ordre de chargement qui tranche. Pour battre `pokemon.css` depuis `global.css`, viser (0,2,1)+ (ex. préfixe `img.`).
- **`theme-color`** : récidive systématique de la valeur thématique au lieu de `#29b6f6`. L'audit le vérifie **en premier**.
- **Ne jamais corriger une extension d'image** de sa propre initiative (`.png` ↔ `.webp`) : Cam prend les fichiers là où il les trouve.
- **Ne jamais deviner un nom de fichier** à partir d'une description orale (`HoOh` vs `Ho-Oh`) : demander.
- **Réécrire un bloc `<script>` par regex emporte le suivant.** Un `.*` entre `<script>` et `</script>` est gourmand : il capture jusqu'au **dernier** `</script>` de la page et avale donc le `<script src="script.js">` final. Symptôme : la navbar disparaît alors que le HTML semble intact. Après toute réécriture de script : vérifier que `script.js` est toujours appelé en fin de fichier. (Erreur commise le 1er août sur `OptiPM.html`.)
- **Chercher une classe, c'est déjà faire une hypothèse.** Le 1er août, un audit des renvois de note n'a interrogé que `card-note` et a conclu que six notes manquaient. Elles existaient toutes en `build-note`. Quatre pages ont été « corrigées » pour rien, avec du texte en double à la clé. Avant d'affirmer qu'une chose est absente, vérifier qu'on l'a cherchée sous toutes ses formes.
- **Un remplacement par nom d'attaque frappe la première occurrence, pas la bonne.** Toujours découper la page par carte et cibler le rang. Deux erreurs le même jour : `Ire de la Nature` a atterri sur Tokorico au lieu de Tokopiyon, `Végé-Attaque` sur Méga-Florizarre au lieu de Florizarre.
- **L'invariant croisé des bascules se vérifie par script, pas à l'œil.** Chaque page Top implique une « meilleure attaque immédiate absolue » par Pokémon : celle révélée s'il y a une bascule, celle de la face avant sinon. Extraire cette valeur sur les 15 pages et grouper par Pokémon fait tomber les contradictions en quelques secondes. La passe du 2 août en a sorti sept d'un coup, dont quatre qu'aucune relecture manuelle n'avait vues en trois audits.
- **Une image référencée n'est pas une image présente.** `TopAcier` appelait `Images/AirmureM.png` depuis le 3 août : le fichier n'a jamais existé dans le dépôt, et l'image était cassée en production sans que personne le voie. Découvert le 4 août en préparant `TopVol`, qui appelait la même. Toute page neuve se termine par une vérification des `src` **contre la liste réelle de `Images/`**, pas contre la convention de nommage — celle-ci dit seulement quel nom le fichier *devrait* porter.
- **Une couleur de nom est une donnée croisée.** Cancrelove a failli entrer au Top Combat en noir alors que `TopInsecte` le classe en bleu. Avant de poser `pokemon-name-*` sur une carte, vérifier ce que font les autres pages Top pour ce Pokémon.
- **Un décompte d'anomalies se déduplique avant d'être annoncé.** Le 3 août, le script d'audit a affiché 16 puis 10 lignes ; Cam s'est vu annoncer successivement « 16 », « 11 restantes » puis « 7 réelles » pour le même lot. En cause : une divergence d'orthographe produisait deux lignes (`AC croisée` **et** `orthographe`), et un cas légitime (« Feu Sacré+ » de Ho-Oh Apex) était compté comme faute. Un nombre communiqué doit être un nombre de **problèmes**, pas de lignes de sortie.
- **Un inventaire chiffré s'extrait par script au moment où on l'écrit.** Le §10 a annoncé pendant deux jours que « quatre boutons » pointaient vers des pages inexistantes. Il y en avait **trente-sept** : dix-huit vers Ténèbres, dix-neuf vers Vol. Seuls les quatre derniers ajoutés avaient été notés. Le 3 août au soir, la correction elle-même a reproduit la faute : « cinq boutons vers Vol », obtenus en additionnant la liste périmée et les trois nouveaux, au lieu des vingt-deux réels. Un décompte qu'on n'a pas extrait ne s'écrit pas.
- **Une conversation ne voit que ce qui est sur `dev`.** Le 4 août, le travail de la veille au soir n'avait pas été poussé : la session du matin a bâti sur une base vieille de seize heures sans pouvoir le détecter, et a produit une seconde v2.5 de ce document, incompatible avec la première. Deux règles en sortent — pousser sur `dev` en fin de session, et annoncer en début de conversation la date du dernier commit lu (« j'ai lu le dev du JJ/MM à HHhMM »), seul moyen pour Cam de repérer une base périmée avant qu'on construise dessus. La date se récupère sur le tarball `codeload`, dont les fichiers portent la date du commit ; `raw.githubusercontent` ne renvoie pas de `Last-Modified` et l'API GitHub est en limite de taux.
- **Le code dit la vérité, pas la mémoire.** Ce document a contenu pendant deux semaines des classes qui n'existaient pas.

---

## 10. Chantiers en attente

### Daté

- ✅ **4 août 2026 — fait.** Frissonille passé en Bon / Shiny dans `pokemon.css`, commentaire daté retiré, `nouveau-shiny` retiré de sa carte (le sous-titre « Nouveau Shiny ! » est conservé le temps de l'évènement). **Beldeneige a été traité en même temps** : son chromatique débute aussi pendant Braises Arctiques, par évolution — le chantier ne l'avait pas prévu. Leçon : quand un shiny débute, vérifier si son évolution débute avec lui.
- **📅 10 août 2026, 20h — fin de Braises Arctiques.** Trois gestes sur `index.html` : retirer le `event-en-cours` et le `<span class="badge-en-cours">` de la carte, puis retirer la carte de l'évènement elle-même. Et sur `BraisesArctiques.html` : retirer le sous-titre « Nouveau Shiny ! » de Frissonille.
- **📅 16 août 2026** — Journée Communauté Goupilou. Goupilou et Roublenard deviennent **Shiny, et non « Bon »** (la v2 de ce document disait « Bon + Shiny », c'était faux). Décommenter la ligne `emoji-shiny` de `pk-goupilou` et de `pk-roublenard` dans `pokemon.css`, puis retirer les trois `nouveau-shiny` de `CDGoupilou.html`. ✅ Les deux commentaires datés sont posés depuis le 31 juillet, `pk-roublenard` a été créée à cette occasion.
- **📅 5 août 2026 (rotation des raids obscurs)** — poser le badge Obscur sur `raids_obscurs.html`, qui n'en contient toujours **aucun**, et créer la règle de base `.badge-obscur-icon` dans `global.css` **à 15/22px**.
  Décision du 2 août : le badge fait la **même taille sur les pages Top et sur `raids_obscurs`** ; ChefRocket le garde plus petit, ses cartes étant plus serrées.
  ⚠️ La v2.2 annonçait 14/22px « pour s'aligner sur le shiny voisin » : **c'est faux.** `top.css` dimensionne déjà ces badges à **15px mobile / 22px desktop** via `.card-image .card-badges img`. C'est cette valeur qu'il faut reprendre.
  Conséquence pratique : **ne pas toucher aux 17 pages Top.** Elles posent leur badge en `<img>` nu, mais `top.css` les couvre déjà, et son sélecteur (0,2,1) l'emporterait de toute façon sur `.badge-obscur-icon` (0,1,0). La classe ne sert donc qu'à `raids_obscurs.html`. `rocket.css` conserve son override à 12/18px.

### Contenu

- ✅ **`TopVol` soldée le 4 août 2026 au soir** (voir §12). **Les 17 types sont couverts** : plus aucun bouton « Également Top X » ne pointe vers une page inexistante, et `TYPES_TOP` n'a plus d'entrée `page: null`.
- **Audit global des blocs `Bon` de `pokemon.css` contre les 17 Top.** Les classements sont désormais figés : c'est le moment de passer les 500 blocs verts au crible pour repérer ceux qui ne sont plus justifiés par aucun classement, et les pré-évolutions qui les suivent. Deux sortants ont déjà été traités à la main le 4 août (Doduo, Dodrio). Non fait.
- ✅ **`TopAcier` soldée le 3 août 2026** (voir §12). Les trois anomalies ouvertes — Galeking, Minotaupe, Vrombotor — sont tranchées.
- ✅ **`TopTenebres` soldée le 3 août 2026 au soir** (voir §12). L'audit croisé des **16** pages Top ne remonte aucune contradiction.
- **ChefRocket** : ajouter Cliff & Arlo (empiler dans `.rocket-list`) ; puis chantier séparation Sbires/Chefs avant activation navbar/accueil.
- **MeilleursPokemon.html** (Règles Générales) : à créer ; ensuite remplacer les `lien-a-venir` des 17 pages Top + activer la carte d'accueil + le lien navbar.
- **`OptiPM.html` est considérée comme terminée** (1er août 2026). Le Passe payant est couvert par le menu déroulant ; le ticket d'évènement et l'Étude Ambassadeur sont traités par deux lignes « Optionnel » en fin de tableau. Plus de « versions à venir ».
- **SEO / Open Graph** : meta description + og:tags (priorité pages Top) ; attend l'image 1200×630 de Cam.

### Dette technique

**Les six chantiers de la v2.1 sont soldés (1er août 2026).** `research-rangee-sep` versée en section 17 ; `nom-neutre` créée ; `event-sous-titre` était déjà absente du CSS et de toutes les pages ; les couleurs d'accent sont passées en variables (1026 valeurs dans `pokemon.css`, `global.css`, `top.css`, `index.css` et `optipm.css`, `--accent-cyan` créée au passage) ; `script.js?v=3` retiré des 33 pages ; les marges inline devenues `intro-item-fin`.

Ce qui les remplace :

- **`regionaux.html`** — page inachevée, contient un `<script>` inline. Sera reprise entièrement.
- **Styles inline — inventaire refait le 4 août 2026.** La v2.4 en annonçait deux ; il y en a **42, sur 8 pages** : `regionaux` (20), `TerresSauvages2026` (8), `CDGoupilou` (5), `CitySafariMarseille` (4), `MegaStaross` (2), `oeufs` (1), `GorythmicGigamax` (1), `GoFestMegaFinale` (1). Presque tous des `margin` sur des `<p>` dans un `intro-rules`, plus deux dimensionnements d'icône dans `CDGoupilou`. **Décision de Cam du 4 août : on corrige page par page, au moment où chaque page est retravaillée.** Pas de passe globale. `GorythmicGigamax` sortira du dépôt de toute façon.
  Soldés ce jour-là : le `passe-go-intro` de `BraisesArctiques` et celui de `FestivalAquatique`, identiques, dont la valeur est passée dans la classe `.passe-go-intro` de `global.css`.
- **Deux images cassées, à trancher** — `dynamax.html` pointe vers `QuartermacS.png`, qui n'existe pas (seul `Quartermac.png` est là) : le badge shiny de Quartermac renvoie une image morte. Et `oeufs.html` pointe vers `PandespiegleS.webp` alors que le fichier sur le disque est `PandespiegleS.png` — mauvaise extension. Rien n'a été corrigé : la règle « ne jamais corriger une extension de soi-même » s'applique.
- **`regionaux.html`** — 75 fichiers image référencés n'existent pas dans `Images/`. Page inachevée, cohérent.

### Purge du 4 août 2026

`passe-go-deluxe-title`, `passe-go-deluxe-item` et `passe-go-deluxe-intro` **supprimées de `global.css`** : jamais utilisées sur aucune page, y compris sur les deux sections Passe Go Deluxe existantes, qui reposent sur `intro-rules`. `passe-go-deluxe-intro` partageait le bloc groupé des encadrés d'intro, le sélecteur a été dégroupé.

Reste `research-note`, toujours déclarée et toujours inutilisée — laissée en place, son rendu (filet pointillé) a un usage identifiable si le besoin d'une vraie note de bas de carte se présente.

---

### Écarté

- **Notifications par pastille (Badging API)** — étudié le 31/07/2026, **abandonné**. `setAppBadge` n'est pas implémenté par Chrome sur Android, et sur iOS la pastille exige que l'utilisateur ait accordé la permission de notifications. La pastille n'est pas un mécanisme autonome : c'est une conséquence des notifications push.
- **Notifications push** — possibles techniquement (Android et iOS ≥ 16.4, PWA installée pour iOS), mais nécessitent une brique serveur : clés VAPID, stockage des abonnements, déclencheur d'envoi. Incompatible avec le site 100 % statique en l'état. Deux chemins si le sujet revient : Netlify Functions + stockage, ou un service tiers type OneSignal.

---

## 11. Prompt type — nouvelle page Top

Joindre : la page Top la plus récente + `top.css` + `script.js` (versions du dépôt).

Règles clés à rappeler dans le prompt :
1. Le modèle joint fait foi — **ignorer la mémoire**.
2. `theme-color: #29b6f6` strict.
3. `toggleBuild` sans couleurs + `aria-expanded`.
4. Zéro inline, sauf `display:none`.
5. Aucune classe `pk-` sur une page Top.
6. Livrer **la seule page** demandée : les activations sont gérées ailleurs.
7. Ne jamais inventer un nom de fichier image ni corriger une extension.
   8. `Images/` avec la casse réelle des fichiers, icônes de type comprises.
9. Auto-vérification finale sur la checklist §5.

---

## 12. Historique express

**4 août 2026 (soir) — `TopVol.html` livrée et activée : les 17 classements sont complets.** 30 cartes (25 + 5 Méga), la plus grosse page Top du site en boutons : **21 builds bi-type**, 14 bascules, 12 badges Obscur. Elle solde les 22 boutons « Également Top Vol » qui pendaient depuis des semaines.

**Quatre boutons retirés ailleurs**, leurs Pokémon n'entrant pas au classement : Méga-Dracolosse et Dracolosse (`TopDragon`), Togekiss (`TopFée`), Yanméga (`TopInsecte`). **Trois boutons réciproques ajoutés** : Méga-Airmure (`TopAcier`), Dracaufeu (`TopFeu`, 2AC en `-` reprenant le renvoi de Méga-Dracaufeu Y), Lugia (`TopPsy` #22, 2AC en `-`).

**Décisions de mécanique validées par Cam.** Drattak passe de Colère<sup>L</sup> à **Draco-Météore** sur `TopDragon` (la Méga l'avait déjà). **Draco Ascension s'écrit sans tiret** et **est Legacy** — corrigé aux quatre emplacements de `TopDragon`. **Feu Sacré et Feu Sacré+ sont Legacy** : le `L` manquait sur Ho-Oh Apex dans `TopFeu`. **Guériaigle de Hisui passe à `-` en 2e Attaque Chargée** avec renvoi, alignant `TopVol` sur `TopPsy` (Vol l'emporte sur Psyko). Typhon Hivernal est bien de type Vol : pas d'icône.

`pokemon.css` **710 classes** : Flamenroule créé en **Bon sans shiny** (son chromatique n'existe pas), Doduo et Dodrio repassés de Bon à **Normal / Shiny** — sortis des classements, et Doduo n'était vert que par Dodrio. Attention, Passerouge et Braisillon **ne sont pas de la famille de Flamenroule** (c'est Flambusard) : ils restent Normal.

Activations faites : `script.js` §14 (`page: 'TopVol.html'`) et `index.html` — carte du type activée, entrée Nouveautés du 04/08, et **retrait de « La suite des meilleurs Pokémon par Type » des À venir**, devenu sans objet. Audit croisé final : **17 pages, 497 cartes, 0 anomalie.**

Six images manquaient au dépôt au moment de la livraison (`AirmureM`, `Bazoucan`, `Etouraptor`, `Deflaisan`, `BoreasA`, `BoreasT`) ; Cam les ajoute. Leçon tirée en §9.

**4 août 2026 — `BraisesArctiques.html` complétée et mise en ligne.** Page reprise de bout en bout le jour du lancement, sur données fournies par Cam. Sauvages portés à 8 (Funécire, Polarhume et Hélionceau ajoutés, ordre revu) ; Pyronille ajouté aux Œufs 5 km ; Tâches d'Étude passées d'un texte d'attente à un `research-card` unique à deux tâches et quatre récompenses ; Étude Ponctuelle refaite en carte research (quatre distances de marathon, Pikachu à visière, PX retirés) ; Passe Go entièrement reconstruit — barème de points, tâches quotidiennes, plafond de 500 points levé les 8-9-10, bonus de rang, et une grille de 10 Pokémon à débloquer. PC du 100 % partout.

**Trois découvertes au passage.** Un système de classes `passe-go-*` complet dormait dans `global.css` sans aucun usage : le rang est un bandeau, pas un sous-titre (cf. §6) — trouvé seulement après avoir inventé une présentation, exactement la leçon « chercher une classe, c'est déjà faire une hypothèse ». Le `margin-top: -6px` de `pokemon-subtitle` mord sur un nom passé à la ligne (cf. §4). Et une marge de `<p>` bloquée par l'`overflow: hidden` de la carte décollait le bandeau du haut. Également ce jour : `nom-neutre` étendue au contexte research, `research-reward-form` centrée, trois classes Deluxe purgées, `margin: 0` posé sur `passe-go-rank`, et premier usage réel du badge « En cours ! » sur l'accueil.

`pokemon.css` : Frissonille et Beldeneige passés en Bon / Shiny (chantier daté du 4 août soldé, cf. §10). `index.html` : carte Braises Arctiques badgée « En cours ! », Nouveautés remises à jour au 04/08.

**3 août 2026 (soir) — `TopTenebres.html` livrée et activée.** 30 cartes (25 + 5 Méga), construite sur le modèle de `TopAcier`. Huit images ajoutées au dépôt : `Darkrai`, `Yveltal`, `Engloutyran`, `Corboss`, `Tengalice`, `MorpekoA`, `Pandarbare`, `Cacturne` — et bien **`MorpekoA`**, le suffixe `A` ne valant pas Alola dans ce cas précis.

Décisions de mécanique validées par Cam : Dimoret garde **Triple Axel** en 2e Attaque Chargée ; Démolosse non-Méga perd son bouton Top Feu, où seul **Méga**-Démolosse figure — deuxième application du contre-exemple Méga-Métalosse ; Hoopa Déchainé reçoit une bascule **Étonnement → Choc Mental** avec l'icône Spectre en 3e argument de `toggleAltImm`, et son bouton pointe vers **Psy**. Attention en relisant : `TopSpectre` #8 est Hoopa **Enchainé**, une autre forme, et son bouton pointe lui aussi vers Psy — ce n'est pas la carte réciproque.

`TopEau` : **Amphinobi** (#5) et **Colhomard** (#18) annonçaient un Top Ténèbres où ils ne figurent pas. Bouton, build et cout retirés ; Colhomard perd aussi sa bascule Cascade → Aboiement, portée par le `onclick` du bouton — même piège que Méga-Steelix sur `TopSol` le matin même.

Audit croisé étendu à **16 pages, 467 cartes** : zéro anomalie. `pokemon.css` **inchangé** : aucun entrant du Top Ténèbres n'avait de classe existante à repasser en Bon, et aucun sortant. Activations faites : `script.js` §14 et `index.html` (carte du type + groupe Nouveautés du 03/08). Ce document a été dégraissé au passage — §2 et §5 purgés de leurs dates de déménagement et de leur catalogue de cas traités.

**3 août 2026 — refonte de `TopAcier` et audit croisé final.** Page reconstruite : 30 cartes (25 + 5 Méga). Entrent **Méga-Airmure** (Méga 3) et **Exagide** (24) ; sortent **Méga-Steelix** et **Bamboiselle**. Décisions de mécanique validées par Cam : Méga-Lucario et Lucario passent à Forte-Paume<sup>L</sup> en attaque immédiate, Pisto-Poing entièrement retiré ; Necrozma Crinière du Couchant, Forgelina et Cobaltium passent à `-` en 2e Attaque Chargée avec renvoi explicatif ; Cobaltium perd Tête de Fer au profit de Lame Sainte<sup>L</sup> en face avant ; Solgaleo passe à Danse Flammes ; Scalpereur et Galeking reçoivent une bascule (Aboiement, Anti-Air) ; Minotaupe conserve Griffe Acier comme meilleure attaque absolue. Corrections structurelles au passage : `btn-dragon` sur le bouton Top Eau de Pingoléon, ordre `footnote-ref`/`legacy-indicator` inversé sur Hurle-Temps, `card-badges` manquant sur Dialga, note fausse de Dialga Originel supprimée (« Hurle-Temps fera toujours plus de dégâts que Tête de Fer Super Efficace » — Tête de Fer lui est bien nécessaire).

**Réciprocité et audit croisé.** `TopSol` : Minotaupe reçoit sa bascule Tir de Boue → Griffe Acier, et le build Acier de Méga-Steelix est retiré (bouton, build **et** bascule, qui en dépendait). `TopSpectre` : Exagide reçoit son build Acier réciproque. `TopCombat` : Cobaltium aligné sur `TopAcier` (2AC en `-`, renvoi, cout supprimé). Le script d'audit croisé, étendu ce jour aux attaques chargées croisées, aux couts, aux badges Obscur, aux couleurs de nom et aux images, est passé de **26 anomalies à 0** sur 437 cartes. Corrigés hors périmètre Acier : Grolem d'Alola (Lame de Roc, pas Boule Roc), Rhinastoc (Séisme, pas Tunnelier), Reshiram (Flamme Croix sans tiret), Éthernatos (Canon Dynamax sans tiret), Galeking (Laser Météore sans tiret), Jirachi (Carnareket avec un C), Forgelina (Marteau Mastoc est bien Legacy), Vrombotor (Détricanon, pas Bombe Beurk), et les trois libellés de cout nommant l'espèce. Méga-Métalosse perd son bouton Top Psy (cf. §5).

`pokemon.css` : Bamboiselle repassée de Bon à Normal (sortie du classement, aucune pré-évolution concernée) et replacée après Babimanta, l'ordre alphabétique était faux — **499 blocs Bon pour 709 classes**. Pas d'entrée Nouveautés sur `index.html` : décision de Cam, comme le 2 août.

**2 août 2026 — refonte de `TopCombat`**. Page reconstruite de zéro sur le modèle de `TopSpectre` : `<script>` inline supprimé (Shifours éclaté en deux cartes autonomes, Mille Poings et Poing Final ; note conditionnelle de Courrousinge devenue `build-note`), trois `toggleBuild` à 5 arguments éliminés, `</div>` excédentaire réglé, `<hr>` manquant de Roitiflam remis. Entrées et sorties : Cancrelove entre au rang 25, Coatox et Shaofouine sortent. Marshadow perd son bouton et son build.

**Audit croisé des 15 pages Top dans la foulée** — sept contradictions de bascule, dont quatre inédites. Corrigées : Lucario (les deux pages se renvoyaient l'une à l'autre), Méga-Scarhino et Scarhino (Riposte l'emporte, bascules ajoutées sur `TopInsecte`), Shifours Mille Poings (`TopEau`), Archéduc de Hisui (`TopPlante`), Archéduc d'Unys (`TopSpectre`). Trois restent, toutes sur `TopAcier` (cf. §10). Également : `L` de Poing de Colère ajouté sur `TopSpectre`, bloc Cout orphelin de Necrozma Ailes de l'Aurore supprimé, ligature de Nœud Herbe posée sur `TopPlante` et `TopPoison`, Coatox rendu à Direct Toxik sur `TopPoison`, build Combat de Cancrelove ajouté sur `TopInsecte`.

`pokemon.css` : Shaofouine et Kungfouine repassés de Bon à Normal (sortie du classement), soit 502 blocs Bon pour 709 classes. `index.html` : carte Gorythmic Gigamax retirée (évènement terminé), entrée Nouveautés du 02/08 ajoutée.

**Juillet 2026 — le grand refactor** : audit complet du site ; centralisation shiny / builds / bandeaux dans `script.js` ; suppression du code mort ; variables d'accent rapatriées dans `navbar.css` ; ~10 coquilles de fichiers shiny corrigées ; faux shinies retirés (Shifours, Wushours, Craparoi) ; service worker sécurisé ; barre des types créée ; refactor `.active` des 127 boutons Top ; navbar fusionnée après conflit de versions.

**Seconde quinzaine de juillet** : une douzaine de pages d'évènement (DixiemeAnniversaire, CoucheOzone, GorythmicGigamax, BraisesArctiques, EclosionFeuGlace, FestivalAquatique, MegaStaross, CDGoupilou, CitySafariMarseille, GoFestMegaFinale, TerresSauvages2026) ; pages ressource `OptiPM.html` ; 8 pages Top supplémentaires (Psy, Feu, Glace, Insecte, Plante, Poison, Roche, Sol) ; système `shiny-boost-circle` ; rectangles de difficulté des raids ; section Nouveautés de l'accueil.

**1er août 2026** : refonte de l'interaction d'`OptiPM.html` — les deux cases à cocher (Passe récupéré / Ambassadeur) remplacées par un menu déroulant de 26 entrées (0 à 2 500 PM par pas de 100, libellés « X PM → Y Combats »), tableau entièrement recalculé par un moteur `data-delta` au lieu de valeurs figées `data-default`/`data-variant` ; lignes 7 et 8 ajoutées ; Ambassadeur et ticket payant devenus deux lignes « Optionnel » ; bloc Règles Générales complété (plafond de stockage, sous-puces) ; page passée à `Images/`. Le mécanisme a été validé par simulation Python contre les deux schémas de référence de Cam avant écriture. Page considérée comme terminée. Dans la foulée : `optipm.css` créée, JS versé en section 16 de `script.js` (OptiPM n'a plus ni `<style>` ni `<script>` inline), et `.bullet` rapatriée de `top.css` vers `global.css` — elle manquait à 9 pages hors Top, soit ~98 puces sans leur marge.

**1er août 2026 (nuit)** : dette technique du §10 soldée en une passe — section 17 de `script.js`, classes `nom-neutre` et `intro-item-fin`, `?v=3` retiré des 33 pages (les alignant enfin sur le préchargement du service worker, qui vise `/script.js` sans paramètre), et 1026 couleurs d'accent passées en variables CSS avec création de `--accent-cyan`. Lot de 44 fichiers.

**1er août 2026 (soir)** : `TopSpectre.html` livrée (27 cartes, 2 Méga) et activée. **Audit croisé des 12 pages Top hors Acier et Combat** — 350 cartes, 293 Pokémon, 57 présents sur plusieurs pages. Corrigés : 5 contradictions de bascule (Feunard d'Alola, Victini, Pyrax, Kyurem Blanc, Tokopiyon), 4 divergences de Legacy (Végé-Attaque sur Florizarre, Méga-Florizarre et Jungko, Taillade sur Nidoking, Spatio-Rift sur Palkia), 4 fautes d'orthographe d'attaque (Jet-Pierres, Draco-Souffle ×3), le build sans destination d'Empiflor, 11 blocs de cout orphelins, 3 tirets longs, 2 ordres note/Legacy inversés, et la migration `Images/` de 12 pages (767 chemins). `pokemon.css` : `pk-hexagide` — coquille jamais utilisée, rangée dans les H — remplacée par `pk-exagide` en Bon + Shiny ; Monorpale et Dimoclès passés en Bon + Shiny. Section Nouveautés de l'accueil allégée à trois groupes. Un faux positif documenté en §9 : six notes crues manquantes existaient en `build-note`.

**31 juillet 2026 (soir)** : `TopSol.html` (30 cartes, 5 Méga) livrée et activée ; 12 entrées ajoutées ou modifiées dans `pokemon.css` (709 classes) ; commentaires datés du 16 août posés pour Goupilou et Roublenard ; **harmonisation des rangs Méga sur les 9 pages Top qui utilisaient `M1`** ; pages `TaxiVolant`, `DixiemeAnniversaire` et `CoucheOzone` constatées supprimées du dépôt ; ce document corrigé sur cinq points.

**31 juillet 2026** : audit des 7 fichiers partagés ; `section-nav` centralisée dans `global.css` (6 pages, blocs strictement identiques) + correction du bug d'ancre (`scroll-margin-top`) ; Badging API étudié puis écarté ; refonte de ce document.

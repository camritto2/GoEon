# GoEon — Manuel de fabrication

*Version 4.0 — 4 août 2026.*

## Ce qu'est ce document

Il répond à une seule question : **comment marche ce site, et comment y construire ou corriger une page sans rien casser.** Rien d'autre.

Il ne contient pas l'historique du projet, pas la liste des chantiers, pas le catalogue des décisions passées, pas d'inventaires chiffrés. Ces choses périment ; une règle non.

**Il ne se modifie pas à chaque session.** On y touche uniquement quand une **règle nouvelle** apparaît. Une décision qui ne concerne qu'une page ou qu'une carte se commente dans le code, pas ici.

## Les quatre règles de travail

1. **Ne jamais travailler de mémoire.** Source de vérité : le dépôt, branche `dev`. Ce document dit ce qui *devrait* être vrai ; seuls les fichiers disent ce qui *est* vrai.
2. **Annoncer en ouverture la date du dernier commit lu** (« j'ai lu le dev du JJ/MM à HHhMM »), seul moyen pour Cam de repérer une base périmée avant qu'on bâtisse dessus. Elle se récupère sur le tarball `codeload`, dont les fichiers portent la date du commit — `raw.githubusercontent` ne renvoie pas de `Last-Modified`, l'API GitHub est en limite de taux. **Rappeler à Cam de pousser sur `dev` en fin de session.**
3. **Tout doute se signale à Cam, qui tranche.** En audit, une anomalie apparente ne se corrige jamais d'office : un bouton, un tiret, une note ou une couleur qui semble contredire ce manuel peut être une décision validée. Seules les fautes mécaniques se corrigent sans demander — casse de fichier, tiret long, ordre d'attributs, faute d'orthographe d'attaque.
4. **Une décision volontaire se commente sur place**, dans le HTML ou le CSS concerné, pour qu'elle arrive sous les yeux au moment où la question se pose.

## Livraison

Claude livre des **fichiers complets**, jamais de fragments, et **seulement les fichiers réellement modifiés** depuis la dernière récupération de Cam. Chaque livraison dit lesquels et pourquoi. En contrepartie, Cam reprend **tous** les fichiers du lot annoncé.

Les données viennent de Cam — classements, rotations, infos d'évènement. Aucune recherche n'est à faire. Sources officielles uniquement, jamais de datamine.

---

## 1. Architecture

**Ordre de chargement CSS : `navbar` → `global` → `pokemon` → page.** Il détermine qui l'emporte à spécificité égale.

| Fichier | Rôle — ce qui doit y aller |
|---|---|
| `navbar.css` | **Toutes** les variables CSS (`:root` + `body.dark-mode`), accents compris. Styles de la navbar, tooltip « prochainement ». Contient l'`@import` Poppins — **ne jamais réduire la liste des graisses.** |
| `global.css` | Tout ce qui sert à plus d'une page : cartes, système `research-*`, badges, encadrés d'intro, puces, `section-nav`, difficulté des raids, animations. |
| `pokemon.css` | **Source de vérité shiny/tiers**, et rien d'autre. |
| `top.css` · `optipm.css` · `rocket.css` · `index.css` | Strictement ce qui ne sert qu'à ces pages. |
| `script.js` | **Toute** la logique du site, en sections numérotées et titrées. Aucun JS ne vit ailleurs. |

**Règles d'architecture :**

- **Zéro `<script>` inline, zéro `<style>`, zéro style inline** — sauf les `display:none` fonctionnels. Trois exceptions structurelles, cf. §7.
- Une couleur ne s'écrit jamais en dur : elle passe par une variable de `navbar.css`. Créer la variable si elle manque.
- Une valeur utilisée par plus d'une page appartient à `global.css`, pas à la feuille de la page.
- Pas de cache-busting : le service worker est en réseau-d'abord, les suffixes `?v=` n'apportent rien et désalignent le préchargement. Ne pas en introduire.
- `service-worker.js` : réseau d'abord, cache runtime filtré (GET + http + `response.ok`), fallback navigation → index, `CACHE_NAME` volontairement non versionné.

---

## 2. Règles globales de page

- **`theme-color: #29b6f6` sur toutes les pages, jamais la couleur du type.** Point récidiviste : à vérifier en premier dans tout audit.
- Un seul `<h1>` par page. Catégories en `<h2 class="category-title tier-X">`. Titre d'onglet : `GoEon - Nom`, tiret court.
- `icon-192` déclarée ; aucun lien Google Fonts (la police vient de `navbar.css`).
- **Aucun emoji dans les titres de section.**
- **Breakpoints : site 769px, navbar 960/961px.** La navbar exige ~1000px pour ses liens desktop ; ne pas l'aligner sur 769. Trois occurrences de `960` dans `script.js` : synchroniser si changement.
- Alignements pixel : technique du « fantôme structurel » (sous-titre `&nbsp;`, « + » des counters) plutôt que des marges magiques.
- Icône ou lien désactivé : `cursor: not-allowed` + tooltip « Disponible prochainement ! » au clic.
- Ancres : `scroll-margin-top` 70px sur les sections d'accueil, 72px sur `section-nav`.

---

## 3. Images

- **Dossier `Images/` avec un I majuscule, et la casse réelle du disque pour les fichiers** (`Spectre.webp`, pas `spectre.webp`). Netlify est insensible à la casse : une erreur ici ne casse rien en production et passe inaperçue. Ne jamais « corriger » vers la minuscule.
- **Ne jamais inventer un nom de fichier ni corriger une extension** (`.png` ↔ `.webp`). Cam prend les fichiers là où il les trouve, il n'y a aucune règle déductible. En cas de doute : demander.
- **Une image référencée n'est pas une image présente.** Toute page neuve ou retravaillée se termine par une vérification des `src` **contre la liste réelle de `Images/`** — pas contre la convention de nommage, qui dit seulement quel nom le fichier *devrait* porter.
- Nommage : `NomSansAccents.png`, shiny `NomS.png`, forme **avant** le S (`GoupixAS.png`).
- Suffixes de forme : **A** Alola, **G** Galar *et* Gigamax, **H** Hisui, **M** Méga, **P** Primo, **C**/**T** formes spéciales, **B**/**N** fusions Kyurem. La collision Galar/Gigamax est assumée ; si le cas survenait, ce serait `GG`.
- Des fichiers dérogent au nommage (tirets, suffixes isolés). Ce sont des cas particuliers, **pas des conventions à généraliser** : vérifier le disque, demander à Cam.

---

## 4. Contenu Pokémon

### Le statut « Bon » suit les classements, pas les stats

Le vert de `pokemon.css` signifie **« ce Pokémon figure dans un Top »**, pas « il est bon dans l'absolu ».

- Un Pokémon qui **sort** d'un classement : vérifier s'il figure encore dans un autre Top ; sinon le repasser en `/* Nom — Normal / Shiny */` et supprimer ses lignes de couleur.
- **La règle remonte aux pré-évolutions** : elles sont vertes parce que leur évolution l'est, et perdent le vert avec elle.
- Un Pokémon qui **entre** dans un Top en figurant déjà dans un autre n'a besoin de rien.
- Détail d'écriture : les blocs Bon écrivent `.emoji-shiny  {` avec **deux** espaces, les blocs Normal avec **une**. Respecter l'espacement du bloc d'arrivée lors d'une conversion.
- **Quand un shiny débute à une date connue**, préparer sa ligne `emoji-shiny` en commentaire daté dans `pokemon.css`. Vérifier si son évolution débute avec lui.

### Badges

- **Shiny** : `emoji-shiny` dans `div.badges`, visibilité pilotée par `pokemon.css`. **Ne jamais réutiliser cette classe pour un autre badge** — elle porte l'écouteur de clic du Johann-Effect.
- **Costume / Gigamax** : `emoji-costume`, classe distincte. Toujours visible, pas d'inversion en mode sombre.
- **Obscur** : `badge-obscur-icon`.
- **Shiny boosté** : badge entouré de `shiny-boost-circle`, qui scintille via `:has(.shiny-active)`. Uniquement dans un `div.badges`, jamais en ligne dans du texte.
- **Nouveau shiny annoncé** (pas encore actif en jeu) : classe `nouveau-shiny`, **pages évènement uniquement**. Ne jamais poser `shiny-active` en statique — le script la retire au premier clic.
- Les tailles de badge sont fixées dans les feuilles partagées : ne jamais les redimensionner sur place.

### Cartes

- **Ordre strict** : nom → sous-titre → séparateur → types → stats. Jamais le sous-titre après les stats.
- Structure : `pokemon-card` > `image-container` (badges + img) > `card-content`.
- `data-shiny` et le badge sont **toujours** présents dans le HTML ; c'est `pokemon.css` qui décide de l'affichage.
- La marge négative de `pokemon-subtitle` est calibrée pour un nom tenant **sur une ligne** : sur un nom qui passe à la ligne, vérifier le rendu.
- **`nom-neutre`** annule le vert « Bon » sur une page donnée. Avant de la poser, vérifier que le Pokémon est réellement « Bon » dans `pokemon.css` — sinon elle ne sert à rien, ou masque un vert légitime.

### Formats de texte

- **Rangs Méga : « Méga 1 », « Méga 2 » — jamais « M1 »**, y compris dans `card-rank`. `M1` est l'abréviation de Cam à la saisie, pas ce qui s'écrit.
- **Cout d'une 2e Attaque Chargée : « N Bonbons », jamais le nom de l'espèce.**
- Fourchettes : tiret demi-cadratin espacé « – ». Billets : « Nom / X € », espace insécable après la barre.
- Ligature œ obligatoire (« Nœud Herbe »). Accents circonflexes retirés des noms de formes (Déchainé, Enchainé).
- Dates sans année. Tiret long « — » toléré sur les évènements.

---

## 5. Pages Top[Type]

Les 17 types sont couverts : aucun bouton ne doit pointer vers une page inexistante.

- **Aucune classe `pk-`** sur ces pages : elles sont réservées aux pages évènement et contenu.
- Couleurs de nom : `pokemon-name-mega`, `pokemon-name-legendary`, `pokemon-name-rare` (**cyan, exclusif à ces pages**), `pokemon-name-normal`. Les formes Apex sont en **cyan**, pas en bleu ; le bleu reste à la forme de base.
- **Une couleur de nom est une donnée croisée** : avant de la poser, vérifier ce que font les autres pages Top pour ce Pokémon.
- Les Méga s'ajoutent aux 25. **Placées exactement où Cam les positionne**, jamais regroupées.
- Chaque carte porte un `div.card-badges` après le nom, même vide.
- Boutons de build : `toggleBuild('xxx-details', 'toggle-xxx-btn')` **sans argument de couleur** (elles vivent dans `.btn-X.active`) + `aria-expanded="false"` initial. Toute classe `btn-X` doit exister dans `top.css`.

### Bascule d'attaque immédiate

La face avant d'une page Top[X] porte la meilleure attaque immédiate **pour jouer le Pokémon en type X**. Le bouton « Également Top Y » ouvre le build bi-type ; la bascule révèle alors la meilleure attaque **dans l'absolu**.

**S'il n'y a pas de bascule sur une carte à bouton, c'est que l'attaque de face est déjà la meilleure dans l'absolu** — ce n'est pas un oubli.

Mise en œuvre : `toggleAltImm('id-imm', 'id-imm-alt')` + un `<span>` masqué. Si la face avant porte une icône de type, lui donner un id et le passer en **3e argument** : elle disparait au clic, même quand l'attaque révélée est du même type.

**Invariant croisé.** Pour un Pokémon présent sur plusieurs pages, chacune implique une « meilleure attaque immédiate absolue » : celle révélée s'il y a une bascule, celle de la face avant sinon. **Toutes les pages doivent impliquer la même.** Deux pages sans bascule affichant deux attaques différentes, ou deux bascules pointant l'une vers l'autre, sont contradictoires par construction. Cet invariant **se vérifie par script, pas à l'œil** : trois relectures manuelles successives ont laissé passer des contradictions qu'un groupement par Pokémon fait tomber en quelques secondes.

### Builds et boutons

- **Le bouton « Également Top Y » n'existe que si le Pokémon figure vraiment dans le Top Y.** Sinon retirer bouton et build, en laissant `<div class="card-button"></div>` et `<div class="card-build"></div>` vides. Piège : une Méga peut y être sans sa forme de base, ou l'inverse — **vérifier la carte, pas l'espèce**. Un bouton retiré emporte aussi la bascule que son `onclick` portait.
- Il existe des conservations volontaires, commentées sur place : ne pas les retirer, cf. règle de travail n°3.
- **Pas de bloc « Cout » sans 2e Attaque Chargée** : le build se réduit à `2e Attaque Chargée : -`, sans `<hr>` ni `attack-cost-container`. Invariant vérifiable : `builds − cartes sans 2e attaque = blocs de cout`.
- **L'absence de 2e attaque s'écrit `-`**, tiret court, jamais `—`.

### Attaques et renvois

- Ordre strict : `nom` → `legacy-indicator` → `footnote-ref` → icône de type.
- **Une icône de type accompagne toute attaque hors-type de la face avant**, immédiate comme chargée, pas seulement celles portées par une bascule.
- Certaines attaques sont **Legacy sur toutes les pages** : Végé-Attaque, Rafale Feu, Hydroblast, Draco Ascension, Feu Sacré et Feu Sacré+. Sans `L`, c'est un oubli.
- **Quand le `-` s'explique par la supériorité de l'attaque de face**, le même `footnote-ref` se pose **deux fois** : sur l'Attaque Chargée de la face avant *et* sur le tiret, avec une note unique.
- **Deux classes de note, à ne pas confondre.** `card-note` s'affiche en permanence sous la carte (renvois de la face avant) ; `build-note` vit dans le build et n'apparait qu'au déploiement (renvois de la 2e Attaque Chargée). **Un audit qui ne cherche que `card-note` conclura à tort que des notes manquent.**
- **Numérotation des renvois** : séquentielle dans l'ordre des cartes. Un numéro se **réutilise entre la forme Méga et la forme de base d'une même espèce** ; **deux espèces différentes gardent deux numéros distincts, même à texte identique**. Ne pas factoriser.
- Puces d'intro colorées comme leur ligne, puce Legacy neutre.

### Activation d'une nouvelle page Top

Deux gestes, et deux seulement : **(a)** `script.js`, config des types → `page: 'TopX.html'` · **(b)** `index.html` : carte du type (retirer `disabled` et `onclick`, poser le `href`) **et** une entrée dans les Nouveautés.

**Aucune activation dans `navbar.html`** : elle ne contient aucun lien par type, seulement « Meilleurs Pokémon » → `index.html#types`.

Puis rappeler à Cam : vérifier les images, relire la méta.

---

## 6. Pages Évènement

**Structure** : `h1` → `raids-date` → `astuce-shiny` (si des shinies sont cliquables) → `section-nav` (si ≥ 4 sections) → `intro-rules` → les sections.

Ordre des sections, toutes optionnelles : Pokémon à l'honneur → Bonus → Nouveaux Pokémon → Pokémon Sauvages → Raids → Tâches d'Étude → Attaques Spéciales → Passe Go / Ticket Payant → Infos Supplémentaires.

- **Couleur des noms** : vert via `pk-` pour les bons Pokémon, noir par défaut. **Le cyan est interdit ici**, il appartient aux pages Top.
- **Tout Pokémon de la page a sa classe dans `pokemon.css`.**
- **Pokémon costumé qui ne peut pas évoluer** : pas de classe `pk-`, et forcer l'affichage du badge shiny. S'il porte quand même un `pk-`, neutraliser le nom avec `nom-neutre`.
- **`section-nav`** : un `<a href="#ancre">` par section, l'`id` correspondant sur le `h2.category-title`. Le CSS est dans `global.css` — **ne jamais le recopier dans un `<style>`**.
- `section-sous-titre` pour les sous-titres de section.
- **Tâches d'étude** : un seul `research-card` quand plusieurs tâches partagent la même récompense, séparées par `<br>`.
- `research-reward-form` est le sous-titre des cartes d'étude. **Ne pas utiliser `research-note` à sa place** : elle porte un filet pointillé, elle est faite pour une note de bas de carte.
- **Cartes du Passe Go** : le rang n'est pas un sous-titre, c'est un bandeau `passe-go-rank` en **premier enfant** de `.pokemon-card`, avant `.image-container`. Le PC va en `passe-go-pc`.
  ⚠️ **`passe-go-rank` s'écrit en `<div>`, jamais en `<p>`** : `.pokemon-card` a `overflow: hidden`, la marge par défaut d'un `<p>` ne peut pas s'échapper et décolle le bandeau.
- `research-sep` est masquée globalement : la forcer en inline quand un sous-titre a besoin d'un séparateur visible.

**Activation** : `index.html` uniquement — carte d'évènement + classe couleur, et entrée dans les Nouveautés. Chaque classe couleur doit être **déclarée en clair ET en mode sombre**. Badge « En cours ! » via `event-en-cours` + `<span class="badge-en-cours">` en premier enfant. **À la fin de l'évènement** : retirer le badge, puis la carte.

**Aucune activation dans `navbar.html`** : son lien « À venir » pointe sur `index.html#evenements`.

---

## 7. Exceptions structurelles

Trois entorses assumées à « aucun CSS hors des fichiers partagés ». Elles sont commentées sur place ; ne pas les « corriger ».

1. **`TerresSauvages2026.html`** — `<style>` désactivant l'animation du badge shiny : le clic y affiche le Gigamax, l'animation induirait le lecteur en erreur.
2. **`script.js`, boutons « Signaler » et « Retour en haut »** — construits en JS, ils injectent leur propre `<style>`.
3. **`rocket.css?v=N`** — seul fichier CSS versionné.

---

## 8. Pièges connus

- **Fragment CSS orphelin** = déclarations flottant hors de tout sélecteur. Le navigateur avale **la règle suivante** en se resynchronisant : c'est donc la règle d'après qui disparaît, ce qui égare le diagnostic. Après toute fusion manuelle : vérifier l'équilibre des accolades et chercher les déclarations hors bloc.
- **Spécificité** : à égalité, l'ordre de chargement tranche. Pour battre `pokemon.css` depuis `global.css`, viser une spécificité supérieure (préfixe `img.`, `h2.`, `span.`).
- **Réécrire un `<script>` par regex emporte le suivant.** Un `.*` entre `<script>` et `</script>` capture jusqu'au **dernier** `</script>` de la page et avale le `<script src="script.js">` final. Symptôme : la navbar disparaît alors que le HTML semble intact. Toujours vérifier ensuite que `script.js` est appelé en fin de fichier.
- **Un remplacement par nom d'attaque frappe la première occurrence, pas la bonne.** Découper la page par carte et cibler le rang.
- **Chercher une classe, c'est déjà faire une hypothèse.** Avant d'affirmer qu'une chose est absente, vérifier qu'on l'a cherchée sous toutes ses formes.
- **Un décompte s'extrait par script au moment où on l'écrit**, et se déduplique avant d'être annoncé. Un nombre communiqué est un nombre de **problèmes**, pas de lignes de sortie.

---

## 9. Checklist d'audit

**Toute page :**
1. `theme-color` = `#29b6f6`
2. Un seul `<h1>` ; `icon-192` ; pas de lien Google Fonts
3. Zéro `<script>` inline ; zéro `<style>` ; styles inline = uniquement `display:none`
4. Aucun `images/` minuscule ; casse conforme au disque ; **tous les `src` existent réellement**
5. `alt` sur toutes les images ; pas d'ID dupliqué ; pas d'emoji dans les titres

**Page Top, en plus :**

6. Cohérence appels / divs / boutons `toggleBuild` ; ids `toggleAltImm` existants ; `aria-expanded` sur les builds et l'intro
7. Classes `btn-*` toutes présentes dans `top.css` ; aucune couleur dans les `onclick`
8. Aucun bloc « Cout » sans 2e attaque ; aucun tiret long ; ordre `legacy-indicator` → `footnote-ref` → icône
9. Aucun renvoi sans texte — chercher **`card-note` ET `build-note`**
10. Croisé avec les autres pages Top : bascules cohérentes, Legacy identique, réciprocité des boutons, mêmes badge Obscur / couleur de nom / libellé de forme / cout / image

**Page évènement, en plus :**

11. `section-nav` : chaque `href="#x"` a son `id="x"` sur un `h2`
12. Pas de cyan ; les `pk-` ne servent qu'aux bons Pokémon ; tous les Pokémon ont leur classe
13. `emoji-shiny` jamais détourné ; `nouveau-shiny` accompagné d'un commentaire daté dans `pokemon.css`
14. Dates cohérentes avec l'accueil

**Dans tous les cas : ce que l'audit remonte se signale à Cam. On ne corrige d'office que les fautes mécaniques.**

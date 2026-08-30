# GoEon — Chantiers

*Mis à jour le 27 août 2026 (soir). Ce fichier bouge souvent ; le manuel de fabrication (`GoEon-conventions.md`) presque jamais.*

## Datés

- **EN COURS — 25–30 août 2026 : Championnats XP.** `ChampionnatsXP.html` est en place, lié depuis `index.html`, et son badge d'accueil est désormais posé automatiquement (`script.js` §18). **Reste à faire : activer le lien navbar et la section `script.js` §14.** L'évènement se termine dimanche 30/08 à 20h — passé cette date, le travail n'a plus d'objet.

- **Vers le 24 septembre 2026 — basculer Netlify en redirection 301.** Voir la section Migration ci-dessous.

## Migration Netlify → Cloudflare — TERMINÉE le 27 août 2026

*Motif initial : Netlify gratuit = 300 crédits/mois, 15 par déploiement et 20 par Go servi — soit ~20 publications mensuelles, et mise en pause du site une fois le quota épuisé. Cloudflare : bande passante et requêtes illimitées, et le site reste en ligne même si la limite de builds est atteinte.*

### Ce qui a été fait

**Domaine : `goeon.fr`, acheté chez OVHcloud le 26/08.** 4,99 € HT la première année, **7,79 € HT au renouvellement**. `goeon.com` n'était plus libre, et Cloudflare Registrar ne gère pas le `.fr` (l'AFNIC n'est pas dans sa liste, contrairement au `.net`, `.org`, `.us`, `.uk`). Le `.fr` reste de toute façon le meilleur choix éditorial : site francophone, audience française, signal géographique positif pour le référencement.

- Pas de mail de vérification ICANN à 15 jours pour un `.fr` — cette règle vaut pour les extensions génériques. Une vérification NIS2 du titulaire a eu lieu le 26/08, réglée le jour même.
- Pas de protection WHOIS à payer : pour un `.fr` détenu par une personne physique, l'AFNIC masque déjà les données par défaut.
- DNSSEC était déjà désactivé chez OVH, ce qui a évité les 24 h de blocage habituelles au changement de serveurs de noms.

**DNS délégué à Cloudflare** (plan Free) le 26/08 : serveurs `boyd.ns.cloudflare.com` et `connie.ns.cloudflare.com` en remplacement de `dns111.ovh.net` / `ns111.ovh.net`. Zone active le jour même. Acheter le domaine ailleurs que chez Cloudflare ne pose aucun problème : seul le DNS doit y être hébergé, pas le domaine.

**Déploiement via Workers, et non Pages.** Le parcours Pages n'est plus proposé à la création dans le tableau de bord Cloudflare — tous les nouveaux projets passent par Workers. Deux fichiers ont dû être ajoutés à la racine du dépôt :

- **`wrangler.jsonc`** — déclare le site comme un ensemble d'assets statiques (`"directory": "./"`, pas de champ `main`, donc aucun script Worker). Sans lui, le déploiement échoue sur « Missing entry-point to Worker script or to assets directory ».
- **`.assetsignore`** — exclut `.git` du téléversement. **Indispensable** : Workers refuse tout fichier de plus de 25 Mo, et le pack Git du dépôt en fait 173. Exclut aussi les trois `.md` internes, qui étaient publiquement accessibles sur l'ancien site.

*Ces fichiers ne changent rien au site lui-même : le HTML reste pur et déployable partout, les autres hébergeurs ignorent simplement ces fichiers.*

**Configuration du Worker** : nom `goeon`, build command vide, deploy command `npx wrangler deploy`, path `/`, branche de production `main`, **builds des branches non-production désactivés** (sinon `dev` devient public et chaque push quotidien consomme un build).

**Domaines rattachés** : `goeon.fr` en domaine personnalisé du Worker, avec certificat HTTPS automatique. `www.goeon.fr` en `CNAME` **proxifié** vers `goeon.fr`, plus une Redirect Rule en 301 avec conservation du chemin (motif `https://www.goeon.fr/*` → `https://goeon.fr/${1}`, *Preserve query string* coché). Deux adresses servant le même contenu seraient traitées comme du contenu dupliqué et diviseraient le référencement — et, plus grave pour une PWA, créeraient deux origines donc deux installations possibles.

La route `workers.dev` est désactivée : elle exposait le nom complet de Cam dans l'URL.

**Déploiement automatique confirmé** : un push sur `main` déclenche un build sans intervention. Le seul clic manuel a été la création initiale du projet. Compter une trentaine de secondes avant que `goeon.fr` ne reflète un changement.

**Site Netlify figé le 27/08.** Dépôt délié (*Site configuration → Build & deploy → Manage repository → Unlink*), puis dépôt manuel par glisser-déposer de trois fichiers :

- `index.html` — page d'annonce statique renvoyant vers `goeon.fr`, avec consigne explicite de réinstaller la PWA
- `service-worker.js` — **kill switch** : vide les caches, se désenregistre, recharge les fenêtres ouvertes
- `_redirects` — `/service-worker.js` servi tel quel **avant** la règle générale `/* → /index.html 200`, sinon le kill switch n'atteint jamais personne

*Le kill switch est la pièce maîtresse. Un service worker intercepte les requêtes avant le réseau : sans lui, les ~50 utilisateurs ayant installé la PWA continueraient de voir l'ancien site depuis leur cache, indéfiniment, sans jamais recevoir ni page d'annonce ni redirection.*

**Choix retenu : site figé plutôt que bannière.** Tant que Netlify reste à jour, personne n'a de raison de migrer. Un site figé qui annonce le déménagement est une incitation réelle.

### Ce qui reste

**Vers le 24 septembre 2026 — basculer Netlify en redirection 301.** Décision : rediriger en permanence plutôt que supprimer, pour sauver les liens externes, les favoris et le référencement (un 301 transfère le jus SEO, un site éteint non).

Ne pas le faire plus tôt : une redirection immédiate ferait atterrir les utilisateurs sur un `goeon.fr` fonctionnel, sans aucune raison de réinstaller — ils resteraient dans une application dégradée, sans mises à jour ni notifications futures. La page d'annonce, elle, dit explicitement quoi faire.

Marche à suivre : remplacer le contenu Netlify par un `_redirects` contenant `/*  https://goeon.fr/:splat  301!` (le `!` force la redirection même si un fichier existe à ce chemin). Conserver le kill switch encore quelque temps si possible.

### Enseignements

**Sensibilité à la casse.** Cloudflare distingue majuscules et minuscules dans les chemins, contrairement à Netlify : toute référence `images/` au lieu de `Images/` renvoie un 404. Audit du 17/08 : 4 erreurs corrigées. Validé en production le 27/08 — toutes les pages fonctionnent sauf `regionaux.html`, seule page restée en minuscules (voir Dette technique).

**Fichiers commençant par un point.** Windows et les navigateurs les manipulent mal : une première tentative a produit un fichier `assetsignore` sans point, inerte et publié en ligne. Les créer en ligne de commande, et vérifier avec `git ls-files`. En PowerShell, `printf` n'existe pas — utiliser `Set-Content -Encoding ascii` (l'encodage `utf8` ajoute un marqueur invisible qui fausse la première ligne).

**Attention à `git push origin dev:main`.** Cette commande pousse le `dev` local vers le `main` distant, sans mettre à jour le `dev` distant. Faire *Sync Changes* **avant**, sinon les branches divergent silencieusement.

## Notifications push

*Sorti de « Écarté » le 17 août 2026 : Cloudflare lève le blocage, qui était l'absence de brique serveur. **Prérequis levé le 27/08 : la migration est terminée et le domaine en place.***

**Architecture**, entièrement dans le palier gratuit : un Worker pour l'envoi, KV pour stocker les abonnements, Cron Triggers pour la planification. Plus une paire de clés VAPID et les handlers `push` / `notificationclick` dans `service-worker.js`. *Le compte Cloudflare est déjà en place, ainsi que le sous-domaine `workers.dev` pour d'éventuels Workers annexes.*

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

**À ne pas oublier** : les abonnements sont liés à l'origine. Attendre que le gros des réinstallations soit passé avant de lancer la campagne d'abonnement, sinon une partie des utilisateurs s'abonnera depuis l'ancienne origine et perdra son abonnement en migrant.

## Entretien du dépôt

**Structure : les pages restent à la racine.** Décision du 27/08. Les déplacer en sous-dossiers changerait les URL publiques (`goeon.fr/TopFeu.html` → `goeon.fr/pages/TopFeu.html`) juste après la migration de domaine, alors que Google réindexe et que les utilisateurs réinstallent la PWA. Coût technique par-dessus : **3256 références `Images/`** en chemin relatif et 145 balises `<link>`/`<script>` à réécrire. Même raisonnement pour uniformiser la casse des noms de pages (29 en PascalCase, 9 en minuscules) — c'est aussi un changement d'URL. À reconsidérer dans plusieurs mois, et seulement avec des Redirect Rules Cloudflare page par page. *Rappel : la racine donne les URL les plus courtes, ce qui est un avantage pour des liens partagés sur Discord.*

**Retrait d'une page d'évènement passé.** Méthode de Cam : couper les fichiers dans l'explorateur Windows et les coller dans son dossier d'archives (hors dépôt), puis vérifier dans Source Control que chaque `D` est bien présent avant de commit. Pas de `git rm` — la commande refuse de supprimer un fichier modifié non commité, ce que l'explorateur ne fait pas. **Toujours vérifier les liens résiduels avant de supprimer** : `index.html`, la navbar, `script.js`, `service-worker.js`. Ne jamais toucher aux images des pages retirées, elles sont mutualisées.

**Retrait du 27/08 :** `BraisesArctiques.html`, `CDGoupilou.html`, `EclosionFeuGlace.html`, `FestivalAquatique.html`, `MegaStaross.html`. Les deux dernières étaient encore liées depuis l'accueil ; leurs cartes ont été retirées d'`index.html` dans le même geste, et `event-en-cours` / `badge-en-cours` déplacés sur Championnats XP. `chantiers-section-migration.md` supprimé également.

*Avant le retrait de `CDGoupilou.html` : **Goupilou et Roublenard passés Shiny dans `pokemon.css`** (blocs décommentés, en-têtes réécrits en « Normal / Shiny », sans `--accent-vert-bon`). Leur statut est désormais porté par `pokemon.css` seul, et suivra partout où Cam les replacera. La classe `nouveau-shiny` est partie avec la page. Rappel de son fonctionnement, pour la prochaine fois : `img.emoji-shiny.nouveau-shiny` dans `global.css` (l. 352) a une spécificité (0,2,1) qui bat volontairement les règles de `pokemon.css` (0,2,0) — c'est la béquille qui affiche et fait scintiller un badge avant que le Pokémon ne soit déclaré Shiny. **La retirer avant de décommenter fait disparaître le badge.***

*Sur `BraisesArctiques.html`, le sous-titre « Nouveau Shiny ! » de Frissonille avait été retiré juste avant l'archivage. Frissonille reste déclaré « Bon / Shiny » dans `pokemon.css` : rien n'est perdu.*

*Pages orphelines restantes, à conserver : `ChefRocket.html` et `regionaux.html` — en attente, pas mortes.*

## Contenu

- ~~**Bascule automatique par date.**~~ **FAIT le 30/08** — `script.js` §18. Module générique : il balaie `.home-card[data-debut][data-fin]` sur l'accueil et pose « En cours ! » ou « Terminé » selon `Date.now()`, relu toutes les minutes. Les cinq cartes d'évènement sont datées, plus aucun badge n'est écrit en dur, et `.badge-termine` a rejoint `index.css` à côté de `.badge-en-cours`. Une date illisible ou inversée laisse la carte intacte, pour ne jamais afficher un faux badge. Testé sur huit instants simulés, dont les bascules à la minute près. *Ce chantier est né de trois retards constatés en août : Braises Arctiques, Goupilou et le badge « En cours » resté sur Festival Aquatique quatre jours après sa fin.*
  **Ce qui reste manuel** : le retrait de la carte à la fin d'un évènement, et la mise à jour de `data-fin` si Niantic prolonge. **Reste à faire** : brancher le même mécanisme sur `Calendrier.html` et les notifications quand `evenements.json` existera — le format de dates est déjà le bon.
- **Filtre « Montrer que ce qui m'intéresse » sur les pages évènement.** *Idée du 24 août 2026.* L'utilisateur coche les Pokémon qui l'intéressent, ils se démarquent visuellement, et un bouton bascule la page en vue filtrée. Intérêt : sur une page évènement longue, on ne vient souvent que pour cinq ou six entrées.

  **Décisions de conception.** Le bouton est une barre **sticky en bas d'écran**, pas un bloc en pied de page : sinon il faut scroller jusqu'en bas pour appliquer ce qu'on a coché en haut. Elle n'apparaît qu'à partir du premier Pokémon coché et porte le compteur (« Voir mes 6 Pokémon ») — ce qui règle du même coup la découvrabilité, personne ne devinant seul qu'on peut cocher. La case est une **cible dédiée en coin de carte**, jamais un tap sur la carte entière : `toggleBuild` et `toggleAltImm` occupent déjà la surface. Persistance en `localStorage`, **une clé par évènement** (`goeon-interet-[Evenement]`), pour que la sélection survive à la fermeture de la PWA sur toute la durée de l'évènement. Pour la mise en évidence, contour + halo léger plutôt que simple bordure bleue : `--accent-bleu` sert déjà ailleurs et la confusion avec un statut existant serait immédiate.

  **Le vrai travail n'est pas le filtre.** Il est dans les effets de bord du masquage : recalculer les `<hr class="research-rangee-sep">` injectés par JS après chaque bascule, masquer les titres de section devenus vides, traiter les ancres de section-nav qui pointent vers du vide, et prévoir le cas « 0 coché » (message, pas page blanche). La partie visible — case, classe CSS, `localStorage`, barre sticky — est du JS vanille sans dépendance, de l'ordre de l'heure.

  **À arbitrer avant d'écrire la première ligne : une page ou toutes ?** Si c'est appelé à devenir un standard des pages évènement, l'écrire d'emblée comme **module générique de `script.js`** qui scanne les cartes présentes et s'auto-active sur un `data-event-id` déclaré par la page — surcoût initial faible, et pas de recollage du même bout de code à chaque nouvel évènement.

- **`Calendrier.html`** — calendrier des évènements récurrents du mois (Heures Vedette, Heures de Raid, journées d'Étude Limitée, bonus du week-end), une trentaine d'entrées mensuelles. Page complète d'abord, puis éventuellement un aperçu « cette semaine » sur l'accueil. **En attente de la référence Google Sheets de Cam.** Structure de données à arbitrer avec `evenements.json` : une seule source si possible.
- **Audit des blocs « Bon » de `pokemon.css` contre les 17 Top.** *Reporté à septembre : les Top vont bouger, on vérifiera après.* Mesure du 27/08 : **504 blocs marqués « Bon »**, dont 246 dont le nom apparaît dans un Top et **258 non**. Ces 258 ne sont pas tous à retirer — beaucoup sont des pré-évolutions qui gardent légitimement le statut (Abra, Barpau, Arcko…). Le travail se fait en deux temps : un script sort la liste, Cam tranche à la main, la chaîne d'évolution demandant du jugement.
- **ChefRocket** : ajouter Cliff, Arlo et Giovanni. Puis chantier séparation Sbires/Chefs, avant activation navbar et accueil.
- **MeilleursPokemon.html** (Règles Générales) : à créer. Ensuite, remplacer les `lien-a-venir` des 17 pages Top, activer la carte d'accueil et le lien navbar.
- **SEO / Open Graph** : audit du 27/08 — le `<head>` des pages ne contient que `charset`, `viewport`, `title` et `theme-color`. **Aucune meta description, aucun tag `og:`, aucun canonical.** À ajouter : meta description unique par page, `og:title` / `og:description` / `og:image` / `og:url` / `og:type`, et `<link rel="canonical">` en URL absolue `https://goeon.fr/…` (utile précisément après le changement de domaine). Seul `og:image` dépend de l'image 1200×630 de Cam ; les descriptions ne dépendent que de lui, et c'est là qu'est le volume (17 Top + accueil + pages évènement). *Gain le plus concret : un lien GoEon partagé sur Discord affiche un aperçu au lieu d'une URL nue.*
- **`robots.txt` et `sitemap.xml`** : absents du dépôt, à ajouter. **Fenêtre courte** : `goeon.fr` est un domaine neuf, Google le découvre de zéro et fixe en ce moment son rythme de passage — la carte complète vaut plus maintenant qu'une fois les habitudes prises. *Attention au conflit possible avec le `robots.txt` généré par Cloudflare si le blocage des crawlers d'entraînement est activé côté tableau de bord.*
- Et tellement plus qui se trouve pour le moment dans la tête de Cam !

## Dette technique

- **`regionaux.html`** — page inachevée : un `<script>` inline, des styles inline, et **71 fichiers images référencés mais absents** de `Images/` (soit 39 Pokémon, chromatiques comprises : Kangourex, Tauros et ses formes, Tropius, Plumeline, Sancoki, Flabébé, les singes d'Unys…). C'est en outre la **seule page du site dont les chemins sont en `images/` minuscule**, donc la seule cassée par la sensibilité à la casse de Cloudflare. Les fichiers n'existant pas, corriger la casse seule ne changerait rien de visible. Sera reprise entièrement. *Page orpheline : aucun lien du site n'y mène actuellement.*
- **`.staross-card` orpheline dans `index.css`** (l. 263 et 277) — la carte qui l'utilisait est partie avec `MegaStaross.html`. Deux lignes, aucun impact ; conservée en vue d'un futur évènement Staross. À trancher lors d'un prochain passage sur `index.css`.
- **Section R de `pokemon.css`** — `Rubombelle` est placé entre `Roublenard` et `Roucool` au lieu de suivre `Roucoups`. À corriger au prochain audit alphabétique.
- **Styles inline** — il en reste sur une poignée de pages, presque tous des marges sur des `<p>` dans un `intro-rules`. **Décision de Cam : on corrige page par page, au moment où chaque page est retravaillée.** Pas de passe globale.
- **Fichier technique `no-op-worker.js.map`** — téléversé par Wrangler à chaque déploiement. Inoffensif et invisible pour les visiteurs. Conservé sciemment.

## Écarté

- **Badging API en canal autonome** — `navigator.setAppBadge()` ne peut pas poser de pastille sur une application fermée : il faut un push pour réveiller le service worker, et Chrome impose alors l'affichage d'une notification. La pastille est donc une **conséquence** d'une notification, obtenue proprement via `silent: true`, jamais un mécanisme indépendant. Vérifié le 17/08 : `script.js` ne contient ni `setAppBadge` ni `DERNIERE_NOUVEAUTE`.
- **Application native (Capacitor ou équivalent)** — écarté le 17 août 2026. Techniquement simple puisque le site est statique et sans étape de build, mais : 99 $/an pour le compte développeur Apple, un Mac obligatoire pour compiler, plusieurs jours de validation à chaque mise à jour — l'inverse du besoin — et surtout un risque réel de retrait pour usage de la propriété intellectuelle Pokémon, bien plus élevé sur un store que sur le web. Le seul gain restant serait la visibilité sur les stores : notifications, hors-ligne et icône sur l'écran d'accueil sont déjà couverts par la PWA.
- **Rattacher `www.goeon.fr` comme second domaine du Worker** — écarté le 27/08 au profit d'une redirection 301. Deux origines actives dupliqueraient le référencement et risqueraient de créer deux installations PWA distinctes chez un même utilisateur.
- **Bannière de migration affichée sur les deux sites** — écarté le 27/08. Le code aurait dû tester le nom d'hôte pour ne pas s'afficher sur `goeon.fr`, les deux hébergeurs lisant le même dépôt. Rendu inutile par le choix de figer Netlify.

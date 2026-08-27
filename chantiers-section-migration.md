## Migration Netlify → Cloudflare Pages

*Décision du 17 août 2026, plan révisé le 26 août 2026. Motif : Netlify gratuit = 300 crédits/mois, 15 par déploiement et 20 par Go servi — soit ~20 publications mensuelles, et mise en pause du site une fois le quota épuisé. Cloudflare Pages : 500 builds/mois, bande passante et requêtes illimitées, et le site reste en ligne même si la limite de builds est atteinte.*

### Domaine : `goeon.fr` chez OVHcloud

`goeon.com` n'était plus libre au 26/08. Cloudflare Registrar ne gère pas le `.fr` (il propose `.net`, `.org`, `.us`, `.uk`, mais l'AFNIC n'est pas dans sa liste). Le domaine a donc été acheté chez **OVHcloud** : 4,99 € HT la première année, **7,79 € HT au renouvellement**.

Le `.fr` reste le meilleur choix éditorial : site francophone, audience française, signal géographique positif pour le référencement.

**Acheter ailleurs que chez Cloudflare ne change rien à Pages** : seul le *DNS* doit être hébergé chez Cloudflare, pas le domaine. D'où l'étape 2 bis ci-dessous.

**Pas de mail ICANN à 15 jours pour un `.fr`** — cette règle vaut pour les extensions génériques. Le `.fr` dépend de l'AFNIC, avec contrôle d'éligibilité possible a posteriori. Une vérification NIS2 du titulaire a bien eu lieu le 26/08, réglée le jour même.

**Ne pas payer la protection WHOIS** : pour un `.fr` détenu par une personne physique, l'AFNIC masque déjà les données par défaut.

### Étapes

1. ~~**Pousser les fichiers en attente sur `dev`.**~~ Fait le 26/08.
2. ~~**Acheter le domaine.**~~ `goeon.fr` acheté chez OVHcloud le 26/08.
2 bis. ~~**Déléguer le DNS à Cloudflare.**~~ Fait le 26/08. Zone créée (plan Free), serveurs de noms `boyd.ns.cloudflare.com` et `connie.ns.cloudflare.com` déclarés chez OVH en remplacement de `dns111.ovh.net` / `ns111.ovh.net`. DNSSEC était déjà à `OFF` — pas de blocage de 24 h.
3. **Créer le projet Pages** : Workers & Pages → Create → Pages → Connect to Git → `camritto2/GoEon`. Branche de production : **`main`** — à vérifier explicitement, Cloudflare propose par défaut la branche par défaut du dépôt. Autorisation GitHub limitée au seul dépôt GoEon (*Only select repositories*).
4. **Build** : commande de build **vide**, dossier de sortie **`/`**. Aucun framework à sélectionner.
5. **Désactiver les déploiements de prévisualisation** — sinon `dev` devient publiquement consultable et chaque push sur `dev` consomme un build.
6. **Vérifier le site sur l'URL en `.pages.dev`** avant de rattacher le domaine. C'est le test de la sensibilité à la casse : `regionaux.html` renverra des 404 que Netlify masquait.
7. **Rattacher `goeon.fr`** : Custom domains → Set up a domain, une fois le statut **Active**. Pages crée les enregistrements DNS automatiquement.
8. **Bannière d'annonce sur le site Netlify** pendant 3–4 semaines : « GoEon déménage sur goeon.fr, pensez à réinstaller l'application ». Une bannière, **pas** une redirection : une PWA installée qui suit une redirection hors scope se comporte comme un simple raccourci navigateur. C'est ici que démarre le compte à rebours.
9. **Basculer Netlify en redirection permanente** (et non l'éteindre — décision du 26/08). Trois opérations :
   - un dernier déploiement avec un **service worker « kill switch »** qui se désenregistre, vide ses caches et redirige. Sans lui, les PWA installées servent leur cache local et ne voient jamais le 301 : elles restent figées indéfiniment.
   - un fichier `_redirects` à la racine : `/*  https://goeon.fr/:splat  301!` (le `!` force la redirection même si un fichier existe à ce chemin).
   - **couper le déploiement automatique côté Netlify**, sinon un push sur `main` écrase cette configuration.

Le workflow ne change pas : `dev` reste la branche de travail poussée quotidiennement, `git push origin dev:main` déclenche la publication.

**Sensibilité à la casse.** Cloudflare Pages distingue majuscules et minuscules dans les chemins, contrairement à Netlify : toute référence `images/` au lieu de `Images/` renverra un 404. Audit du 17/08 : 4 erreurs de casse corrigées. **`regionaux.html` reste concerné** — ses chemins sont en minuscule et ses images n'existent pas ; la page est cassée dans les deux cas et relève de sa reprise complète.

**Aucune dépendance Netlify** (audité le 17/08) : pas de `netlify.toml`, `_redirects` ni `_headers`, aucun formulaire, aucune fonction serveur, aucun chemin absolu, aucune occurrence de « netlify » dans le code. Un seul appel réseau, `fetch('navbar.html')`, en relatif.

**Coût de l'attente.** Passer de `.netlify.app` à un domaine propre oblige les utilisateurs ayant installé la PWA à la réinstaller : l'identité d'une PWA tient à son origine. Ce coût est payé **une seule fois** en allant vers un domaine possédé — un futur changement d'hébergeur ne coûtera plus rien. Il croît avec le nombre d'installations, et deviendra bien plus lourd une fois les abonnements push en place, eux aussi liés à l'origine.

**À faire après la migration** : ajouter un `robots.txt` et un `sitemap.xml`, absents du dépôt. Attention au conflit possible avec le `robots.txt` généré par Cloudflare si le blocage des crawlers d'entraînement est activé.

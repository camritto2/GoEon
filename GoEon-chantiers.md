# GoEon — Chantiers

*Mis à jour le 4 août 2026. Ce fichier bouge souvent ; le manuel de fabrication (`GoEon-conventions.md`) presque jamais.*

## Datés

- **5 août 2026 — rotation des raids obscurs.** Poser le badge Obscur sur `raids_obscurs.html`, qui n'en contient aucun, et créer la règle de base `.badge-obscur-icon` dans `global.css` **à 15/22px** (valeur alignée sur celle de `top.css`). Ne pas toucher aux pages Top : leur `<img>` nu est déjà couvert par `top.css`, dont le sélecteur l'emporterait de toute façon. `rocket.css` conserve son propre dimensionnement, ses cartes étant plus serrées.
- **10 août 2026, 20h — fin de Braises Arctiques.** Sur `index.html` : retirer `event-en-cours`, le `<span class="badge-en-cours">`, puis la carte de l'évènement. Sur `BraisesArctiques.html` : retirer le sous-titre « Nouveau Shiny ! » de Frissonille.
- **16 août 2026 — Journée Communauté Goupilou.** Goupilou et Roublenard deviennent **Shiny, et non « Bon »**. Décommenter leur ligne `emoji-shiny` dans `pokemon.css`, puis retirer les trois `nouveau-shiny` de `CDGoupilou.html`. Les commentaires datés sont déjà posés.

## Contenu

- **Audit des blocs « Bon » de `pokemon.css` contre les 17 Top.** Les classements sont figés : c'est le moment de passer les blocs verts au crible pour repérer ceux qu'aucun classement ne justifie plus, ainsi que les pré-évolutions qui les suivent.
- **ChefRocket** : ajouter Cliff, Arlo et Giovanni. Puis chantier séparation Sbires/Chefs, avant activation navbar et accueil.
- **MeilleursPokemon.html** (Règles Générales) : à créer. Ensuite, remplacer les `lien-a-venir` des 17 pages Top, activer la carte d'accueil et le lien navbar.
- **SEO / Open Graph** : meta description et og:tags, priorité aux pages Top. Attend l'image 1200×630 de Cam.

## Dette technique

- **`regionaux.html`** — page inachevée : un `<script>` inline, des styles inline, et de nombreuses images référencées absentes de `Images/`. Sera reprise entièrement.
- **Styles inline** — il en reste sur une poignée de pages, presque tous des marges sur des `<p>` dans un `intro-rules`. **Décision de Cam : on corrige page par page, au moment où chaque page est retravaillée.** Pas de passe globale.
- **Deux images cassées, à trancher par Cam** — `dynamax.html` appelle un shiny de Quartermac qui n'existe pas sur le disque ; `oeufs.html` appelle un shiny de Pandespiègle avec la mauvaise extension. Non corrigées : la règle « ne jamais corriger une extension de soi-même » s'applique.
- `research-note` reste déclarée et inutilisée. Laissée en place : son rendu a un usage identifiable si le besoin d'une vraie note de bas de carte se présente.

## Écarté

- **Badging API** — abandonné. `setAppBadge` n'est pas implémenté par Chrome sur Android, et sur iOS la pastille dépend de la permission de notifications. Ce n'est pas un mécanisme autonome : c'est une conséquence des notifications push.
- **Notifications push** — techniquement possibles (Android, et iOS ≥ 16.4 en PWA installée), mais elles exigent une brique serveur : clés VAPID, stockage des abonnements, déclencheur d'envoi. Incompatible avec un site 100 % statique en l'état. Deux chemins si le sujet revient : Netlify Functions avec stockage, ou un service tiers.

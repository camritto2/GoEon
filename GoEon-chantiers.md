# GoEon — Chantiers

*Mis à jour le 21 septembre 2026. Ce fichier ne liste que ce qui reste à faire : ni journal des travaux terminés, ni règles durables — celles-ci vont dans le manuel de fabrication (`GoEon-conventions.md`).*

## Datés

**Vers le 24 septembre 2026 — basculer Netlify en redirection 301.** Décision : rediriger en permanence plutôt que supprimer, pour sauver les liens externes, les favoris et le référencement (un 301 transfère le jus SEO, un site éteint non).

Ne pas le faire plus tôt : une redirection immédiate ferait atterrir les utilisateurs sur un `goeon.fr` fonctionnel, sans aucune raison de réinstaller — ils resteraient dans une application dégradée, sans mises à jour ni notifications futures. La page d'annonce, elle, dit explicitement quoi faire.

Marche à suivre : remplacer le contenu Netlify par un `_redirects` contenant `/*  https://goeon.fr/:splat  301!` (le `!` force la redirection même si un fichier existe à ce chemin). Conserver le kill switch encore quelque temps si possible.

## Dette technique

**Les styles inline.** Il en reste sur une poignée de pages, presque tous des marges sur des `<p>` dans un `intro-rules`. **Décision de Cam : on corrige page par page, au moment où chaque page est retravaillée.** Pas de passe globale. Il en reste **110 sur les 17 pages Top**, plus 20 sur `regionaux.html` ; la reprise des Top pour l'Attaque Bonus-Méga les emportera en chemin.

## Notifications push

*Sorti de « Écarté » le 17 août 2026 : Cloudflare lève le blocage, qui était l'absence de brique serveur. **Prérequis levé le 27/08 : la migration est terminée et le domaine en place.***

**Architecture**, entièrement dans le palier gratuit : un Worker pour l'envoi, KV pour stocker les abonnements, Cron Triggers pour la planification. Plus une paire de clés VAPID et les handlers `push` / `notificationclick` dans `service-worker.js`. *Le compte Cloudflare est déjà en place, ainsi que le sous-domaine `workers.dev` pour d'éventuels Workers annexes.*

**Source de vérité : `evenements.json`**, au dépôt depuis le 5 septembre. Un seul fichier pour trois usages — affichage des pages, bascule automatique par date, notifications. Champs minimum : `debut`, `fin`, `importance` (majeur / mineur), `titre`, `lien`.

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

## Contenu

- **Filtre « Montrer que ce qui m'intéresse » sur les pages évènement.** *Idée du 24 août 2026.* L'utilisateur coche les Pokémon qui l'intéressent, ils se démarquent visuellement, et un bouton bascule la page en vue filtrée. Intérêt : sur une page évènement longue, on ne vient souvent que pour cinq ou six entrées.

  **Décisions de conception.** Le bouton est une barre **sticky en bas d'écran**, pas un bloc en pied de page : sinon il faut scroller jusqu'en bas pour appliquer ce qu'on a coché en haut. Elle n'apparaît qu'à partir du premier Pokémon coché et porte le compteur (« Voir mes 6 Pokémon ») — ce qui règle du même coup la découvrabilité, personne ne devinant seul qu'on peut cocher. La case est une **cible dédiée en coin de carte**, jamais un tap sur la carte entière : `toggleBuild` et `toggleAltImm` occupent déjà la surface. Persistance en `localStorage`, **une clé par évènement** (`goeon-interet-[Evenement]`), pour que la sélection survive à la fermeture de la PWA sur toute la durée de l'évènement. Pour la mise en évidence, contour + halo léger plutôt que simple bordure bleue : `--accent-bleu` sert déjà ailleurs et la confusion avec un statut existant serait immédiate.

  **Le vrai travail n'est pas le filtre.** Il est dans les effets de bord du masquage : recalculer les `<hr class="research-rangee-sep">` injectés par JS après chaque bascule, masquer les titres de section devenus vides, traiter les ancres de section-nav qui pointent vers du vide, et prévoir le cas « 0 coché » (message, pas page blanche). La partie visible — case, classe CSS, `localStorage`, barre sticky — est du JS vanille sans dépendance, de l'ordre de l'heure.

  **À arbitrer avant d'écrire la première ligne : une page ou toutes ?** Si c'est appelé à devenir un standard des pages évènement, l'écrire d'emblée comme **module générique de `script.js`** qui scanne les cartes présentes et s'auto-active sur un `data-event-id` déclaré par la page — surcoût initial faible, et pas de recollage du même bout de code à chaque nouvel évènement.
- **Audit des blocs « Bon » de `pokemon.css` contre les 17 Top.** *À faire après la reprise des 17 Top.* Mesure du 27/08 : **504 blocs marqués « Bon »**, dont 246 dont le nom apparaît dans un Top et **258 non**. Ces 258 ne sont pas tous à retirer — beaucoup sont des pré-évolutions qui gardent légitimement le statut (Abra, Barpau, Arcko…). Le travail se fait en deux temps : un script sort la liste, Cam tranche à la main, la chaîne d'évolution demandant du jugement.
- **MeilleursPokemon.html** (Règles Générales) : à créer. Ensuite, remplacer les `lien-a-venir` des 17 pages Top, activer la carte d'accueil et le lien navbar.
- Et tellement plus qui se trouve pour le moment dans la tête de Cam ! Ou dans sa liste perso !

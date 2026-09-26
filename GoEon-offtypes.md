# GoEon — Off-Types

*Créé le 16 septembre 2026. Fichier de collecte, pas de publication : il sert à relever les Off-Types type par type, puis à décider de leur sort une fois les dix-sept pages parcourues. Exclu du déploiement par `.assetsignore`.*

## Ce qu'on cherche à savoir

Deux chiffres trancheront, à la fin du parcours :

- **le nombre d'Off-Types par type** — s'il en entre un ou deux, on les intègre au Top ; s'il en entre dix, la page est dénaturée ;
- **le nombre de pages où chaque Off-Type apparait** — c'est le compteur qui dira si Mewtwo et Rayquaza débordent.

## Règles d'éligibilité

1. Pokémon **mono-type**, ou Pokémon **bi-type qui n'est bon que dans un seul de ses deux types**.
2. Pokémon de **type Normal**.
3. Un Pokémon **déjà bon dans ses deux types n'ira nulle part ailleurs**. Exemple : Méga-Métalosse est Top Acier et Top Psy, il s'arrête là.
4. L'attaque du type peut être une **Attaque Chargée ou une Attaque Immédiate**. Les deux comptent ; on note simplement laquelle, pour pouvoir trancher à la fin.
5. Le Pokémon est **meilleur que le 25e** de la page, ou **meilleur que le dernier Méga** s'il s'agit d'un Méga. Un Off-Type peut prendre un rang Méga intermédiaire, mais **on ne descend jamais en dessous de M5** : si son entrée pousse un Méga en M6, ce Méga sort de la page.
6. L'attaque du type **ne doit pas évincer une attaque d'un type dans lequel le Pokémon est déjà classé**. Krabboss est 6e sur TopEau grâce à Écume : lui substituer Griffe Acier lui couterait sa raison d'être, il n'entre pas en Acier. Aéroptéryx perdrait Cru-Ailes, de type Vol, mais il n'est classé nulle part en Vol et son Roche tient à Pouvoir Antique, donc rien ne s'y oppose.

## Questions restées ouvertes

**Tranché le 16 septembre : les Off-Types concourent dans le même classement, sans bloc à part ni plafond.** Le `<h1>` des dix-sept pages passe de « Les meilleurs Pokémon de *Type X* » à « Les meilleurs **attaquants** de *Type X* », ce qui déplace la promesse du type du Pokémon vers le type des dégâts et rend la présence d'un Off-Type exacte. Le `<span class="top-title-type">` et ses deux icônes ne bougent pas ; seul le texte d'amorce change. Fait sur `TopAcier`, à appliquer aux seize autres au fil de leur mise à jour. La bannière « Comprendre le classement » doit porter la phrase qui lève l'ambigüité : un Pokémon n'a pas besoin d'être du type pour figurer, il lui suffit de frapper avec une attaque de ce type.

**Le plafond par Pokémon.** La règle 3 ne borne que les bi-types. Un mono-type reste libre d'occuper autant de pages qu'il a d'attaques : Mewtwo est bon en Psy, son seul type, donc rien ne l'empêche d'entrer en Combat, Spectre, Glace, Feu et Électrik. Si le relevé confirme ce débordement, il faudra un plafond par Pokémon, quel que soit son nombre de types.

## Relevés

Une section par type. On ne note que ceux qui franchissent le seuil.

**Colonnes** — Pokémon · Ses types · Attaque du type · Source (AC ou AI) · Position visée

*L'emplacement compte : une 2e Attaque Chargée coute des Bonbons et des Poussières au lecteur, une 1re ne coute rien.*

*Les positions sont relevées contre le classement actuel, qui ne contient encore aucun Off-Type. Les décalages entre eux seront réconciliés à la fin.*

### Acier

*Seuils : 25e = Exagide · dernier Méga = Méga 5, Méga-Cizayox.*

| Pokémon | Types | Attaque du type | Source | Position visée |
|---|---|---|---|---|
| Méga-Staross | Eau / Psy | Puissance Cachée Acier | AI | M5, entre Méga-Galeking et Méga-Cizayox — **fait sortir Méga-Cizayox**, qui passerait en M6 |
| Zacian Héros Aguerri | Fée | Tête de Fer (AI : Ailes d'Acier) | AC | entre Fermite (18) et Solgaleo (19) |
| Zamazenta Héros Aguerri | Combat | Tête de Fer (AI : Griffe Acier) | AC | entre Solgaleo (19) et Galeking (20) |
| Necrozma | Psy | Tête de Fer (AI : Griffe Acier) | AC | entre Solgaleo (19) et Galeking (20) |
| Aéroptéryx | Roche / Vol | Ailes d'Acier | AI | entre Magnézone (24) et Exagide (25) |

*L'ordre relatif de Zamazenta Héros Aguerri et de Necrozma reste à départager.*

*Conséquence à traiter le jour où on fera TopInsecte : la carte de **Méga-Cizayox** y annonce « Également Top Acier ». Si Méga-Staross le fait sortir, ce renvoi devient faux.*

*Écarté : **Krabboss**, par la règle 6.*

### Combat

*Seuils : 25e = Chelours · dernier Méga = Méga 5, Méga-Gallame.*

| Pokémon | Types | Attaque du type | Source | Position visée |
|---|---|---|---|---|
| Katagami | Plante / Acier | Lame Sainte (AI : Tranch'Herbe, qui le fait Top Plante) | AC | entre Bétochef (8) et Gallame (9) - relevé avec Taillade (eDPS 23,37), à confirmer avec Tranch'Herbe |
| Mewtwo | Psy | Riposte L + Exploforce | AI + AC | entre Marshadow (10) et Mackogneur (11) (eDPS 21,41) |
| Raikou | Électrik | Aurasphère (AI : Éclair) | AC | entre Mackogneur (11) et Archéduc de Hisui (12) (eDPS 21,00) |
| Togekiss | Fée / Vol | Exploforce (AI : Charme) | AC | entre Viridium (19) et Quartermac (20) - relevé avec Puissance Cachée Combat et Aurasphère L (eDPS 19,30), à confirmer avec ce build |

*Tranché le 23 septembre : **Méga-Mewtwo Y est écarté**, Méga-Mewtwo X occupant déjà le rôle Combat (Méga 1). **Mewtwo est retenu** malgré la règle 6 : un joueur qui n'a pas assez de Méga-Énergie peut le jouer en Combat avec Riposte L et Exploforce. Méga-Mewtwo X et Y sont considérés comme deux Pokémon distincts.*

### Dragon

*Seuils : 25e = Pomdorochi · dernier Méga = Méga 5, Méga-Latios.*

*Relevé le 23 septembre : aucun Off-Type.*

### Eau

*Seuils : 25e = Milobellus · dernier Méga = Méga 5, Méga-Tortank.*

| Pokémon | Types | Attaque du type | Source | Position visée |
|---|---|---|---|---|
| Tranchodon | Dragon | Surf (AI : Draco-Queue, qui le fait Top Dragon) | AC | entre Golgopathe (23) et Tortank (24) (eDPS 16,97) |
| Crabominable | Combat / Glace | Écume + Pince-Masse | AI + AC | entre Tortank (24) et Milobellus (25) (eDPS 16,77) |

*Relevé le 25 septembre.*

### Électrik

*Seuils : 25e = Pharamp · dernier Méga = Méga 4, Méga-Pharamp.*

| Pokémon | Types | Attaque du type | Source | Position visée |
|---|---|---|---|---|
| Méga-Mewtwo Y | Psy | Tonnerre (AI : Coupe Psycho) | AC | entre Méga-Raichu X (Méga 2) et Regieleki (1) (eDPS 26,80) |
| Méga-Mewtwo X | Psy / Combat | Tonnerre (AI : Coupe Psycho) | AC | entre Zeraora (2) et Câblifère (3) (eDPS 25,72) |
| Mewtwo | Psy | Tonnerre (AI : Coupe Psycho) | AC | entre Fulguris Forme Avatar (14) et Grolem d'Alola (15) (eDPS 19,07) |
| Primo-Kyogre | Eau | Fatal-Foudre en 2e AC (AC : Onde Originelle, AI : Cascade) | 2e AC | Méga 5, entre Salarsen (17) et Élecsprint (18) (eDPS 18,32) |
| Zacian Héros Aguerri | Fée | Éclair Fou (AI : Aboiement) | AC | entre Élecsprint (18) et Zéblitz (19) (eDPS 17,78) |
| Arcanin | Feu | Crocs Éclair + Éclair Fou | AI + AC | entre Ohmassacre (20) et Raichu d'Alola (21) (eDPS 17,28) |
| Meloetta Forme Chant | Normal / Psy | Tonnerre (AI : Vive-Attaque) | AC | entre Fulgulairo (22) et Iguolta (23) (eDPS 16,68) |

*Relevé le 26 septembre.*

### Fée

*Seuils : 25e = Grodoudou · dernier Méga = Méga 4, Méga-Mysdibule.*

| Pokémon | Types | Attaque du type | Source | Position visée |
|---|---|---|---|---|
| Méga-Alakazam | Psy | Éclat Magique L (AI : Coupe Psycho) | AC | entre Amovénus Forme Avatar (2) et Tokorico (3) (eDPS 23,32) |
| Câblifère | Électrik | Éclat Magique (AI : Éclair) | AC | entre Tokotoro (6) et Amovénus Forme Totémique (7) (eDPS 21,31) |
| Méga-Branette | Spectre | Éclat Magique (AI : Châtiment) | AC | entre Sorcilence (11) et Oratoria (12) (eDPS 19,29) |
| Meloetta Forme Chant | Normal / Psy | Éclat Magique (AI : Vive-Attaque) | AC | entre Forgelina (16) et Galopa de Galar (17) (eDPS 17,92) |
| Gromago | Spectre | Éclat Magique (AI : Châtiment) | AC | entre Galopa de Galar (17) et Florges (18) (eDPS 17,29) |
| Ursaking | Sol / Normal | Câlinerie (AI : Charge) | AC | entre Tokopisco (19) et Rubombelle (20) (eDPS 16,81) |
| Alakazam | Psy | Éclat Magique L (AI : Coupe Psycho) | AC | entre Tokopisco (19) et Rubombelle (20), après Ursaking (eDPS 16,77) |
| Polagriffe | Glace | Charme + Câlinerie | AI + AC | entre Tokopisco (19) et Rubombelle (20), après Alakazam (eDPS 16,71) |
| Zamazenta Bouclier Suprême | Combat / Acier | Pouvoir Lunaire (AI : Griffe Acier) | AC | entre Mélodelfe (21) et Smogogo de Galar (22), après Méga-Mysdibule (eDPS 16,14) |
| Donphan | Sol | Charme + Câlinerie | AI + AC | entre Mélodelfe (21) et Smogogo de Galar (22), après Zamazenta Bouclier Suprême (eDPS 15,84) |
| Mew | Psy | Éclat Magique (AI : Draco-Queue) | AC | entre Smogogo de Galar (22) et Feunard d'Alola (23) (eDPS 15,31) |
| Zamazenta Héros Aguerri | Combat | Pouvoir Lunaire (AI : Griffe Acier) | AC | entre Cupcanaille (24) et Grodoudou (25) (eDPS 14,87) |

*Relevé le 26 septembre.*

*Avec Méga-Alakazam (Méga 2) et Méga-Branette (Méga 4), les Méga deviennent Méga-Diancie Méga 3, Méga-Altaria Méga 5 et **Méga-Mysdibule Méga 6 : il sortirait de la page** (règle 5).*

### Feu

*Seuils : 25e = Typhlosion de Hisui · dernier Méga = Méga 5, Méga-Démolosse.*

| Pokémon | Types | Attaque du type | Source | Position visée |
|---|---|---|---|---|
| Méga-Mewtwo X | Psy / Combat | Lance-Flammes (AI : Riposte) | AC | entre Reshiram (2) et Méga-Démolosse (Méga 5) (eDPS 26,76) |
| Méga-Mewtwo Y | Psy | Lance-Flammes (AI : Coupe Psycho) | AC | entre Reshiram (2) et Méga-Démolosse (Méga 5), après Méga-Mewtwo X (eDPS 26,34) |

*Relevé le 26 septembre.*

*Avec les deux, Méga-Mewtwo X prend Méga 5 et Méga-Mewtwo Y tomberait en Méga 6, tout comme **Méga-Démolosse en Méga 7 : les deux sortiraient de la page** (règle 5).*

### Glace

*Seuils : 25e = Lokhlass · dernier Méga = Méga 2, Méga-Oniglali.*

| Pokémon | Types | Attaque du type | Source | Position visée |
|---|---|---|---|---|
| | | | | |

### Insecte

*Seuils : 25e = Aéromite · dernier Méga = Méga 4, Méga-Dardargnan.*

| Pokémon | Types | Attaque du type | Source | Position visée |
|---|---|---|---|---|
| | | | | |

### Plante

*Seuils : 25e = Arboliva · dernier Méga = Méga 4, Méga-Blizzaroi.*

| Pokémon | Types | Attaque du type | Source | Position visée |
|---|---|---|---|---|
| | | | | |

### Poison

*Seuils : 25e = Salarsen 2 Formes · dernier Méga = Méga 4, Méga-Florizarre.*

| Pokémon | Types | Attaque du type | Source | Position visée |
|---|---|---|---|---|
| | | | | |

### Psy

*Seuils : 25e = Victini · dernier Méga = Méga 5, Méga-Latios.*

| Pokémon | Types | Attaque du type | Source | Position visée |
|---|---|---|---|---|
| | | | | |

### Roche

*Seuils : 25e = Séracrawl de Hisui · dernier Méga = Méga 3, Méga-Ptéra.*

| Pokémon | Types | Attaque du type | Source | Position visée |
|---|---|---|---|---|
| | | | | |

### Sol

*Seuils : 25e = Tritosor 2 Formes · dernier Méga = Méga 5, Méga-Steelix.*

| Pokémon | Types | Attaque du type | Source | Position visée |
|---|---|---|---|---|
| | | | | |

### Spectre

*Seuils : 25e = Courrousinge · dernier Méga = Méga 2, Méga-Branette.*

| Pokémon | Types | Attaque du type | Source | Position visée |
|---|---|---|---|---|
| | | | | |

### Ténèbres

*Seuils : 25e = Sharpedo · dernier Méga = Méga 5, Méga-Sharpedo.*

| Pokémon | Types | Attaque du type | Source | Position visée |
|---|---|---|---|---|
| | | | | |

### Vol

*Seuils : 25e = Dracaufeu · dernier Méga = Méga 5, Méga-Airmure.*

| Pokémon | Types | Attaque du type | Source | Position visée |
|---|---|---|---|---|
| | | | | |

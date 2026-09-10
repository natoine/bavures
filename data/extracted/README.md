# Données extraites

### Rapports annuels de l'IGPN

Un CSV par rapport (`2017.csv` à `2024.csv`), reprenant toutes les données
chiffrées que j'ai pu extraire de façon fiable du texte de ce rapport. Ce
ne sont **pas** des documents sources mais des données **dérivées**,
extraites et recopiées par lecture des rapports (texte extrait via
`pdftotext -layout`, pas d'OCR/parsing automatique sur les graphiques).

### Format

Chaque CSV a 4 colonnes : `metric,libelle,valeur,note`.

- `metric` : identifiant stable, **le même nom d'un rapport à l'autre**
  pour une même donnée (ex. `enquetes_judiciaires_ouvertes` désigne
  toujours la même chose, quel que soit le fichier) — c'est ce qui permet
  de recomposer une série temporelle en assemblant les 8 fichiers.
- `libelle` : description humaine de la métrique.
- `valeur` : la valeur numérique.
- `note` : précisions ou réserves propres à cette valeur pour cette année
  (vide la plupart du temps).

Un rapport ne contient pas forcément toutes les métriques : les lignes
présentes reflètent ce qui est réellement extractible de ce rapport-là. Je
n'ai rien inventé pour combler les années où une donnée est absente.

### Méthode

Seules les valeurs **explicitement énoncées en toutes lettres** dans le
texte du rapport (phrase du type « En 2022, l'IGPN a été saisie de 1 065
enquêtes judiciaires ») ou lisibles sans ambiguïté dans un graphique dont
les valeurs sont imprimées en clair ont été retenues. Je n'ai jamais deviné
une valeur à partir d'un graphique dont la mise en page se serait perdue à
l'extraction du texte.

### Métriques disponibles

| `metric`                                     | Description                                                           |
| -------------------------------------------- | --------------------------------------------------------------------- |
| `enquetes_judiciaires_ouvertes`              | Enquêtes judiciaires ouvertes (saisines)                              |
| `enquetes_judiciaires_cloturees`             | Enquêtes judiciaires clôturées                                        |
| `enquetes_administratives_ouvertes`          | Enquêtes administratives (pré-disciplinaires) ouvertes                |
| `enquetes_administratives_cloturees`         | Enquêtes administratives clôturées                                    |
| `effectifs_agents`                           | Effectif total de l'IGPN                                              |
| `signalements_plateforme`                    | Signalements reçus sur la plateforme de signalement (PFS)             |
| `consultations_juridiques_annee`             | Consultations juridiques rendues dans l'année                         |
| `formations_nombre_sessions`                 | Nombre de formations dispensées                                       |
| `formations_agents_formes`                   | Agents formés dans l'année                                            |
| `structures_evaluees`                        | Structures de la police nationale évaluées                            |
| `etudes_realisees`                           | Études réalisées                                                      |
| `missions_accompagnement`                    | Missions d'accompagnement de projet                                   |
| `fiches_amaris_publiees`                     | Fiches AMARIS publiées dans l'année                                   |
| `deces_mission_police`                       | Décès de particuliers à l'occasion d'une mission de police            |
| `blesses_mission_police`                     | Blessures graves de particuliers à l'occasion d'une mission de police |
| `enquetes_usage_force`                       | Enquêtes judiciaires portant sur l'usage de la force                  |
| `enquetes_injures_racistes_discriminatoires` | Enquêtes ouvertes pour injures à caractère raciste ou discriminatoire |
| `enquetes_corruption_active`                 | Enquêtes pour corruption active                                       |
| `enquetes_corruption_passive`                | Enquêtes pour corruption passive                                      |

### Points de vigilance méthodologique

- **Enquêtes judiciaires (2024)** : le rapport 2024 introduit une
  distinction entre « saisines » et « procédures » qui n'existait pas
  clairement dans les rapports précédents, et recalcule rétroactivement
  des valeurs différentes pour 2020-2023 (914 pour 2024, contre des
  valeurs recalculées de 943/900/927/934 pour 2023/2022/2021/2020). Ces
  valeurs recalculées ne sont **pas** utilisées ici pour 2020-2023 : chaque
  fichier annuel garde le chiffre publié par **son propre** rapport
  (1101, 1093, 1065, 1015). Le chiffre 2024 (914) utilise donc une
  définition légèrement différente de celle de 2017-2023.
- **Enquêtes administratives** : à l'inverse, la série utilisée ici
  (288, 290, 224, 173, 176, 192, 167, 168) est la série rétrospective
  2016-2024 publiée à l'identique par les rapports 2023 et 2024, plus
  cohérente dans le temps que les chiffres publiés année par année à
  l'origine (2017 : 276 à l'origine ; 2020 : 174 à l'origine).
- **Décès et blessés** : les bilans sont révisés à la hausse dans les
  rapports suivants au fur et à mesure de la réception de déclarations
  tardives (l'IGPN le documente elle-même). Chaque fichier annuel garde
  le chiffre du bilan publié **cette année-là** ; les révisions
  ultérieures connues sont signalées en `note` mais pas substituées.
- **`structures_evaluees` (2021)** : porte sur un périmètre différent
  (amélioration de l'accueil des victimes) des années 2019/2020 (audit
  général de structures) — valeurs non directement comparables malgré le
  même nom de métrique.
- **Agrégats vs cumuls** : certains chiffres rencontrés dans les rapports
  (ex. contenu cumulé d'une base de consultations juridiques) sont des
  totaux cumulés depuis la création d'un outil, pas un flux annuel ; ils
  n'ont volontairement pas été mélangés avec les métriques annuelles
  ci-dessus.

### Pour aller plus loin

Beaucoup d'autres chiffres existent dans les rapports (détail par type de
manquement disciplinaire, répartition géographique par délégation, usage
de l'arme par type, etc.) mais avec une couverture trop fragmentaire ou
une définition trop instable d'une année sur l'autre pour être ajoutés ici
sans risquer de comparer des choses non comparables. À compléter au cas
par cas si besoin.

## Présidents et ministres de l'Intérieur (`presidents-ministres-interieur.csv`)

Table de contexte politique, une ligne par année (1977-2026) : président et
ministre de l'Intérieur en exercice, leur famille politique, et une note
libre sur les changements de ministre en cours d'année.

Contrairement aux CSV IGPN ci-dessus, ce fichier a été **fourni par
l'utilisateur** (compilé à la main à partir de plusieurs sources), pas
extrait par Claude depuis un document source. Format large (une colonne
par variable), à la différence du format `metric,libelle,valeur,note` des
CSV IGPN.

Colonnes : `annee, president, affiliation_president, ministre_interieur,
affiliation_ministre, changement_ministre_note`. Une valeur "Nom1 / Nom2"
dans `ministre_interieur` (ou `president`) signifie plusieurs personnes en
poste la même année civile ; `changement_ministre_note` précise alors la
ou les dates de bascule (ex. « remplacé en mai »). Ce fichier ne contient
**aucune donnée chiffrée** (décès, enquêtes, violences...) : il ne sert
qu'à situer le contexte politique en regard des chiffres IGPN, jamais à
les recouper.

### Sources déclarées par l'utilisateur

- [interieur.gouv.fr — Les ministres de la Vème République](https://www.interieur.gouv.fr/Le-ministere/Histoire/Les-ministres-de-la-Veme-Republique)
  (ministres de l'Intérieur, dates exactes jusque vers 2020/Castaner)
- Wikipédia / Wikidata (ministres à partir de 2020 : Darmanin, Retailleau, Nuñez)
- [elysee.fr — Les présidents de la République](https://www.elysee.fr/la-presidence/les-presidents-de-la-republique)
  (liste officielle des présidents)
- [vie-publique.fr](https://www.vie-publique.fr) (fiches historiques par président/gouvernement, contexte politique)
- [assemblee-nationale.fr](https://www.assemblee-nationale.fr) (cité par l'utilisateur comme source complémentaire possible, non utilisée pour construire ce fichier)

### Historique

Une première version de ce fichier comportait aussi des colonnes
chiffrées (décès recensés par le média Basta!, contre-mesures IGPN,
affaires de violences comptabilisées par le ministère de la Justice).
L'utilisateur a demandé leur suppression : ce fichier ne sert plus qu'au
contexte politique (présidents/ministres/affiliations), sans mélanger de
données chiffrées de sources et de méthodologies hétérogènes avec les
CSV IGPN ci-dessus, qui restent la seule référence chiffrée du site.

### Utilisation sur le site

Affiché sur `/donnees` avec un lien de téléchargement direct (le CSV
lui-même est le document, il n'y a pas de PDF source unique). Sur la page
d'accueil, une frise chronologique (composant `PoliticalTimeline.svelte`)
représente, pour les présidents et pour les ministres de l'Intérieur, la
durée de chaque mandat et son affiliation politique.

Traitement des lignes multi-personnes : le champ `ministre_interieur`
(ou `president`) est d'abord découpé sur `/`, et le champ d'affiliation
correspondant sur `puis`. Si `changement_ministre_note` cite autant de
noms de mois que de bascules attendues, ces mois servent de points de
coupure dans l'année ; sinon l'année est divisée à parts égales entre les
personnes. Quand il y a plus de personnes que d'affiliations listées (ex.
un intérimaire), la ou les premières personnes se voient attribuer la
première affiliation, et chacune des suivantes une affiliation propre.
Les tranches consécutives d'une même personne sont ensuite fusionnées en
« mandats » continus (en conservant l'affiliation de la toute première
tranche), afin qu'un même mandat traversant plusieurs années n'apparaisse
qu'une fois sur la frise.

Les libellés d'affiliation bruts du CSV sont normalisés en un petit
nombre de familles pour rester dans les huit teintes catégorielles du kit
dataviz (ex. RPR et UMP sont regroupés sous « Droite (RPR/UMP) », LREM et
Renaissance sous « Centre (LREM/Renaissance) », ces partis étant
historiquement le même parti rebaptisé) ; les couleurs sont assignées par
ordre chronologique de première apparition.

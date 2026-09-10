# Données extraites des rapports annuels de l'IGPN

Un CSV par rapport (`2017.csv` à `2024.csv`), reprenant toutes les données
chiffrées que j'ai pu extraire de façon fiable du texte de ce rapport. Ce
ne sont **pas** des documents sources mais des données **dérivées**,
extraites et recopiées par lecture des rapports (texte extrait via
`pdftotext -layout`, pas d'OCR/parsing automatique sur les graphiques).

## Format

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

## Méthode

Seules les valeurs **explicitement énoncées en toutes lettres** dans le
texte du rapport (phrase du type « En 2022, l'IGPN a été saisie de 1 065
enquêtes judiciaires ») ou lisibles sans ambiguïté dans un graphique dont
les valeurs sont imprimées en clair ont été retenues. Je n'ai jamais deviné
une valeur à partir d'un graphique dont la mise en page se serait perdue à
l'extraction du texte.

## Métriques disponibles

| `metric` | Description |
|---|---|
| `enquetes_judiciaires_ouvertes` | Enquêtes judiciaires ouvertes (saisines) |
| `enquetes_judiciaires_cloturees` | Enquêtes judiciaires clôturées |
| `enquetes_administratives_ouvertes` | Enquêtes administratives (pré-disciplinaires) ouvertes |
| `enquetes_administratives_cloturees` | Enquêtes administratives clôturées |
| `effectifs_agents` | Effectif total de l'IGPN |
| `signalements_plateforme` | Signalements reçus sur la plateforme de signalement (PFS) |
| `consultations_juridiques_annee` | Consultations juridiques rendues dans l'année |
| `formations_nombre_sessions` | Nombre de formations dispensées |
| `formations_agents_formes` | Agents formés dans l'année |
| `structures_evaluees` | Structures de la police nationale évaluées |
| `etudes_realisees` | Études réalisées |
| `missions_accompagnement` | Missions d'accompagnement de projet |
| `fiches_amaris_publiees` | Fiches AMARIS publiées dans l'année |
| `deces_mission_police` | Décès de particuliers à l'occasion d'une mission de police |
| `blesses_mission_police` | Blessures graves de particuliers à l'occasion d'une mission de police |
| `enquetes_usage_force` | Enquêtes judiciaires portant sur l'usage de la force |
| `enquetes_injures_racistes_discriminatoires` | Enquêtes ouvertes pour injures à caractère raciste ou discriminatoire |
| `enquetes_corruption_active` | Enquêtes pour corruption active |
| `enquetes_corruption_passive` | Enquêtes pour corruption passive |

## Points de vigilance méthodologique

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

## Pour aller plus loin

Beaucoup d'autres chiffres existent dans les rapports (détail par type de
manquement disciplinaire, répartition géographique par délégation, usage
de l'arme par type, etc.) mais avec une couverture trop fragmentaire ou
une définition trop instable d'une année sur l'autre pour être ajoutés ici
sans risquer de comparer des choses non comparables. À compléter au cas
par cas si besoin.

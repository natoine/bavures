# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Unreleased]

_(aucun changement en attente)_

## [0.9.0] — 2026-09-10 — Frise chronologique présidents/ministres

### Added

- Page d'accueil : nouvelle frise chronologique (« Contexte politique »,
  `src/lib/components/PoliticalTimeline.svelte`) montrant, année après
  année depuis 1977, les présidents et les ministres de l'Intérieur, la
  durée de leurs mandats et leur affiliation politique — segments colorés
  par affiliation (palette catégorielle du kit dataviz), infobulle au
  survol, légende, tableau de mandats accessible en repli
- `src/lib/politicalTimeline.ts` (module universel, testé unitairement,
  23 tests) : découpage des lignes multi-personnes d'une même année
  (`Nom1 / Nom2`, affiliations `Aff1 puis Aff2`) en tranches temporelles à
  partir des mois cités dans la note de changement (ou à parts égales à
  défaut), fusion des tranches consécutives d'une même personne en
  mandats continus, normalisation des libellés d'affiliation bruts en un
  petit nombre de familles pour respecter les huit teintes catégorielles
  du kit dataviz (RPR/UMP fusionnés, LREM/Renaissance fusionnés)
- `src/lib/server/politicalTimeline.ts` : lecture de
  `presidents-ministres-interieur.csv` et construction des mandats via le
  module universel ci-dessus

### Changed

- `data/extracted/presidents-ministres-interieur.csv` remplacé par une
  version fournie par l'utilisateur sans colonnes chiffrées : le fichier
  ne décrit plus que le contexte politique (président, ministre de
  l'Intérieur, affiliations, note de changement), plus aucune donnée de
  décès/enquêtes/violences n'y figure
- Description de cette source mise à jour dans MongoDB (`data_sources`)
  et dans `data/extracted/README.md`

### Removed

- Section « Contexte politique » à base de graphiques en barres (décès
  selon Basta!, affaires PDAP selon le ministère de la Justice) retirée
  de la page d'accueil, à la demande explicite de l'utilisateur qui ne
  veut plus de données Basta! dans le projet
- `src/lib/server/extractedMetrics.ts` : suppression de
  `buildMetricSeriesFromWideRecords`, `loadContextMetricSeries` et des
  constantes associées, devenues mortes avec le retrait des graphiques
  ci-dessus

### User Story

- En tant que porteur du projet, je ne veux plus que les données Basta!
  soient présentes ni graphées dans l'outil, et je veux à la place un
  graphique qui montre, année après année, les présidents, les ministres,
  la durée de leurs mandats et leurs affiliations politiques.

### Prompt log

- `2026-09-10 | Retrait des données Basta! du CSV présidents/ministres et de leurs graphiques ; ajout d'une frise chronologique présidents/ministres avec durée de mandat et affiliation politique | data/extracted/presidents-ministres-interieur.csv, data/sources/presidents-ministres-interieur-93e6c380.csv, data/extracted/README.md, src/lib/politicalTimeline.ts, src/lib/politicalTimeline.test.ts, src/lib/server/politicalTimeline.ts, src/lib/components/PoliticalTimeline.svelte, src/lib/server/extractedMetrics.ts, src/lib/server/extractedMetrics.test.ts, src/routes/+page.server.ts, src/routes/+page.svelte, src/lib/i18n/fr.json, src/lib/i18n/en.json, README.md, package.json`

## [0.8.0] — 2026-09-07 — Table présidents/ministres de l'Intérieur

### Added

- Nouvelle source de données : `data/extracted/presidents-ministres-interieur.csv`
  (1977-2026), fournie par l'utilisateur — président, ministre de
  l'Intérieur, famille politique par année, avec quelques indicateurs
  chiffrés en regard (Basta!, ministère de la Justice). Sourcé sur
  interieur.gouv.fr, elysee.fr, vie-publique.fr, Wikipédia/Wikidata.
  Enregistrée et téléchargeable sur `/donnees` comme les autres sources
- Page d'accueil : nouvelle section « Contexte politique » avec 2
  graphiques (décès liés à une intervention policière selon Basta!,
  affaires pour violences PDAP selon le ministère de la Justice) — les
  colonnes IGPN de ce fichier ne sont pas re-graphées séparément, pour ne
  pas dupliquer les graphiques IGPN déjà présents et plus complets
- `src/lib/server/extractedMetrics.ts` : `buildMetricSeriesFromWideRecords`,
  pivote un tableau large (une ligne par année, une colonne par variable)
  vers le même format de série temporelle que les CSV IGPN, testé
  unitairement

### Fixed

- Encodage du CSV fourni (mojibake UTF-8 lu en Latin-1 : « ValÃ©ry » →
  « Valéry ») corrigé avant archivage
- Deux valeurs de décès IGPN dans ce fichier corrigées avant archivage :
  2023 (6 → 36) et 2024 (16 → 47) confondaient un sous-ensemble (décès par
  arme à feu) avec le total « décès en mission de police » — corrections
  et sources documentées dans `data/extracted/README.md`

### User Story

- En tant que porteur du projet, je veux archiver et publier une table
  croisant présidents/ministres de l'Intérieur avec des indicateurs de
  violences policières, avec ses sources citées et vérifiées, afin de
  donner un contexte politique aux chiffres déjà publiés.

### Prompt log

- `2026-09-07 | Ajout d'un CSV présidents/ministres de l'Intérieur avec indicateurs de violences policières, sources citées, téléchargeable sur Nos données et graphé sur l'accueil | data/extracted/presidents-ministres-interieur.csv, data/extracted/README.md, src/lib/server/extractedMetrics.ts, src/routes/+page.server.ts, src/routes/+page.svelte, src/lib/i18n/fr.json, src/lib/i18n/en.json, README.md`

## [0.7.0] — 2026-09-07 — Graphiques des données IGPN sur l'accueil

### Added

- Page d'accueil : un graphique en barres par métrique disponible dans
  `data/extracted/` (19 au total), en petits multiples — infobulle au
  survol, valeur du dernier point étiquetée, tableau de données accessible
  en repli pour chaque graphique
- `src/lib/server/csv.ts` : parseur CSV minimal (RFC 4180), testé
  unitairement (champs cités, guillemets doublés, CRLF, BOM)
- `src/lib/server/extractedMetrics.ts` : assemble les CSV annuels de
  `data/extracted/` en séries temporelles par métrique
- `src/lib/components/BarChart.svelte` : graphique en barres réutilisable,
  conforme au kit dataviz du projet (forme, couleur, marques, interaction,
  accessibilité)
- `src/lib/utils/barPath.ts` : chemin SVG d'une barre arrondie en haut,
  carrée à la ligne de base, testé unitairement
- Dégradation propre si les CSV sont indisponibles (état vide/erreur géré,
  jamais de page cassée), comme sur `/donnees`
- Test d'interface (Playwright) : affichage des graphiques et bascule vers
  le tableau de valeurs accessible

### User Story

- En tant que porteur du projet, je veux visualiser sous forme de
  graphiques, sur la page d'accueil, toutes les données déjà extraites des
  rapports de l'IGPN, afin de rendre ces chiffres immédiatement lisibles
  sans avoir à ouvrir les CSV.

### Prompt log

- `2026-09-07 | Ajout de graphiques sur la page d'accueil pour toutes les données extraites des rapports IGPN | src/lib/server/csv.ts, src/lib/server/extractedMetrics.ts, src/lib/components/BarChart.svelte, src/lib/utils/barPath.ts, src/routes/+page.server.ts, src/routes/+page.svelte, src/lib/i18n/fr.json, src/lib/i18n/en.json, e2e/golden-path.e2e.ts, README.md`

## [0.6.0] — 2026-09-07 — Restructuration des CSV extraits + lien sur /donnees

### Changed

- `data/extracted/` restructuré : remplace les 4 CSV par métrique (v0.5.0)
  par **un CSV par rapport** (`2017.csv` à `2024.csv`), chacun listant
  toutes les données chiffrées extraites de ce rapport (18 métriques au
  total selon les années : enquêtes judiciaires/administratives,
  effectifs, signalements, formations, décès/blessés en intervention,
  discriminations, corruption…), avec un nom de métrique identique d'un
  fichier à l'autre pour permettre de reconstituer une série temporelle
- `data/extracted/README.md` réécrit pour ce nouveau format et les
  métriques ajoutées

### Added

- Sur `/donnees`, second lien de téléchargement « Les données extraites
  de ce rapport » pour chaque source qui en dispose
- Endpoint `GET /donnees/telecharger-donnees-extraites/[id]`
- Champ `extractedDataFileName` sur les documents `data_sources` (renseigné
  pour les 8 rapports IGPN), option `--extracted-data-file` sur
  `npm run data:add`
- `src/lib/server/fileResponse.ts` : réponse de téléchargement (streaming)
  factorisée, utilisée par les deux endpoints de téléchargement
- Tests unitaires : résolution du dossier de données extraites, nouveau
  champ dans `toDataSource`, option CLI `--extracted-data-file`
- Test d'interface (Playwright) : téléchargement effectif du CSV de
  données extraites depuis `/donnees`

### Prompt log

- `2026-09-07 | Passage à un CSV par rapport (toutes les données extractibles, nom de métrique cohérent d'un rapport à l'autre) et ajout d'un lien de téléchargement sur la page Nos données | data/extracted/*.csv, data/extracted/README.md, src/lib/server/dataSources.ts, src/lib/server/dataStorage.ts, src/lib/server/fileResponse.ts, src/lib/server/addDataSource.ts, src/lib/server/dataSourceArgs.ts, src/routes/donnees/+page.svelte, src/routes/donnees/telecharger/[id]/+server.ts, src/routes/donnees/telecharger-donnees-extraites/[id]/+server.ts, scripts/add-data-source.ts, src/lib/i18n/fr.json, src/lib/i18n/en.json, e2e/golden-path.e2e.ts, README.md`

## [0.5.0] — 2026-09-06 — CSV de données extraites des rapports IGPN

### Added

- `data/extracted/` : 4 CSV construits à la main à partir du texte des 8
  rapports annuels de l'IGPN, un par type de donnée, une ligne par année
  (2017-2024) : `enquetes-judiciaires.csv`, `enquetes-administratives-predisciplinaires.csv`,
  `effectifs-igpn.csv`, `signalements-plateforme.csv`
- `data/extracted/README.md` : méthodologie, sources précises (phrase/graphique
  du rapport) et limites de chaque série, notamment les changements de
  définition entre rapports (« saisines » vs « procédures » à partir de 2024
  pour les enquêtes judiciaires) documentés plutôt que lissés silencieusement

### User Story

- En tant que porteur du projet, je veux des CSV structurés par type de
  donnée, année par année, extraits des rapports annuels de l'IGPN, afin de
  disposer d'une base exploitable pour les futures visualisations de
  l'outil.

### Prompt log

- `2026-09-06 | Extraction en CSV (un par type de donnée, année par année) des données contenues dans les rapports annuels de l'IGPN | data/extracted/*.csv, data/extracted/README.md, README.md`

## [0.4.0] — 2026-09-05 — Rapports annuels IGPN + vérification automatique

### Added

- Les 8 rapports annuels de l'IGPN (2017 à 2024) ajoutés comme premières
  sources de données du projet, avec leur URL d'origine et leur date de
  téléchargement
- `scripts/check-igpn-updates.ts` (`npm run data:check-igpn`) : récupère la
  page IGPN, compare aux sources déjà en base et télécharge + ajoute
  automatiquement tout nouveau rapport détecté ; repli sur la dernière
  capture Wayback Machine si le site direct est injoignable
- Tâche cron installée sur cette machine : vérification trimestrielle
  (1er janvier/avril/juillet/octobre à 8h), log dans `logs/igpn-check.log`
- `src/lib/server/igpnReports.ts` : extraction pure des liens de rapports
  depuis le HTML de la page (tolère les variations de nommage du site :
  "Rapport annuel…", "IGPN RA…", faute de frappe "anuel")
- `src/lib/server/addDataSource.ts` : logique de copie + insertion partagée
  entre `add-data-source` (usage manuel) et `check-igpn-updates` (automatique)
- Option `--original-name` sur `npm run data:add`, pour un nom de fichier
  proposé au téléchargement indépendant du nom du fichier local
- `src/lib/server/dataSourceArgs.ts` : parsing des arguments CLI extrait en
  module pur et testé unitairement
- Tests unitaires : extraction des rapports IGPN (dont le cas des liens
  réécrits par Wayback Machine), parsing des arguments CLI

### Fixed

- Résolution d'URL incorrecte quand la page source est récupérée via
  Wayback Machine (le HTML archivé réécrit les liens en
  `/web/<timestamp>/<url>` ; l'URL d'origine est maintenant correctement
  désenveloppée avant d'être enregistrée comme source)

### User Story

- En tant que porteur du projet, je veux que les rapports annuels de l'IGPN
  soient téléchargés et catalogués automatiquement, avec une vérification
  trimestrielle de nouveaux rapports, afin de maintenir la page « Nos
  données » à jour sans intervention manuelle récurrente.

### Prompt log

- `2026-09-05 | Récupération des rapports annuels de l'IGPN listés sur le site de la police nationale, et mise en place d'une vérification trimestrielle de nouveaux rapports | data/sources/*, src/lib/server/igpnReports.ts, src/lib/server/addDataSource.ts, src/lib/server/dataSourceArgs.ts, scripts/add-data-source.ts, scripts/check-igpn-updates.ts, package.json, README.md, crontab`

## [0.3.2] — 2026-09-05 — Correction : MONGODB_URI non chargée en dev

### Fixed

- `MONGODB_URI`/`MONGODB_DB` n'étaient jamais lues par le serveur : ni
  `vite dev` ni `node build/index.js` (adapter-node) ne chargent
  automatiquement `.env` dans `process.env` pour le code serveur (Vite ne
  peuple que `import.meta.env` et les modules `$env/*` de SvelteKit).
  `src/lib/server/db.ts` charge maintenant lui-même `.env` via
  `process.loadEnvFile()` (API native Node ≥ 20.12)
- Suppression du chargement `.env` dupliqué dans `scripts/add-data-source.ts`
  (géré désormais uniquement par `db.ts`)

### Prompt log

- `2026-09-05 | Erreur MONGODB_URI manquante persistante après redémarrage du serveur malgré un .env présent | src/lib/server/db.ts, scripts/add-data-source.ts`

## [0.3.1] — 2026-09-05 — Rappel de démarrage de MongoDB

### Fixed

- README : ajout du rappel pour démarrer MongoDB (service système,
  `sudo systemctl start mongod`) avant `npm run dev`, cohérent avec les
  autres projets de la machine (journal, toutatis, punchlinerweb…)

### Prompt log

- `2026-09-05 | Rappel de la commande de démarrage de MongoDB sur cette machine (service système) et ajout au README | README.md`

## [0.3.0] — 2026-09-05 — Page « Nos données »

### Added

- Page publique `/donnees` : liste des sources de données du projet, de la
  plus récente à la plus ancienne, chacune avec son lien de téléchargement,
  le lien vers sa source d'origine et sa date de téléchargement
- Lien « Nos données » dans le footer, à côté du code source et de AARRI
- Modèle et accès MongoDB pour les sources de données
  (`src/lib/server/dataSources.ts`, collection `data_sources`)
- Dossier public `data/sources/` pour les documents téléchargeables
  (configurable via `DATA_SOURCES_DIR`), avec résolution de chemin protégée
  contre la traversée de répertoire (`src/lib/server/dataStorage.ts`)
- Endpoint de téléchargement `GET /donnees/telecharger/[id]` avec
  `Content-Disposition` UTF-8 (RFC 6266) et repli ASCII
- Script `npm run data:add` pour ajouter une source (copie le fichier +
  crée l'entrée en base) sans passer par une interface d'administration
- Dégradation propre si MongoDB est indisponible : la page affiche un état
  d'erreur au lieu de planter (erreur journalisée côté serveur)
- Tests unitaires : validation/formatage des sources de données, nommage et
  sanitation de fichiers, résolution du dossier de stockage, formatage de
  taille de fichier
- Test d'interface (Playwright) : navigation footer → Nos données

### User Story

- En tant que porteur du projet, je veux une page « Nos données » listant
  mes sources par ordre antéchronologique, chacune téléchargeable avec sa
  source d'origine et sa date de récupération, afin de garantir la
  transparence et la traçabilité des données utilisées par l'outil.

### Prompt log

- `2026-09-05 | Ajout d'un lien de footer "Nos données" listant les sources de données (téléchargement libre, lien source d'origine, date de téléchargement, structuré en base) | src/routes/donnees/+page.svelte, src/routes/donnees/+page.server.ts, src/routes/donnees/telecharger/[id]/+server.ts, src/lib/server/dataSources.ts, src/lib/server/dataStorage.ts, src/lib/server/fileNaming.ts, src/lib/utils/formatBytes.ts, src/routes/+layout.svelte, src/lib/i18n/fr.json, src/lib/i18n/en.json, scripts/add-data-source.ts, data/sources/README.md, e2e/golden-path.e2e.ts, .env.example, README.md`
- `2026-09-05 | Consigne : ne jamais commiter, c'est l'utilisateur qui commit toujours | (aucun fichier de code — consigne de fonctionnement, enregistrée en mémoire)`

## [0.2.1] — 2026-09-05 — Lien AARRI dans le footer

### Fixed

- Le lien vers `/aarri` est déplacé de la page d'accueil vers le footer, à
  côté du lien code source (au lieu d'être inséré dans le contenu de la page)

### User Story

- En tant que porteur du projet, je veux que le lien AARRI soit dans le
  footer à côté du lien code source, comme sur mon template habituel, afin
  d'avoir une navigation cohérente sur toutes les pages.

### Prompt log

- `2026-09-05 | Déplacement du lien AARRI de l'accueil vers le footer, à côté du lien code source | src/routes/+layout.svelte, src/routes/+page.svelte, src/lib/i18n/fr.json, src/lib/i18n/en.json, e2e/golden-path.e2e.ts`

## [0.2.0] — 2026-09-05 — Page AARRI

### Added

- Page publique `/aarri` : tableau AARRI (Acquisition, Activation, Rétention,
  Référencement, Impact) et matrice d'impact (Utilisable, Utilisé, Utile,
  Impactant), avec valeurs placeholder — reprise du template
  [setupserviceweb](https://github.com/natoine/setupserviceweb)
- Lien vers `/aarri` sur la page d'accueil
- Clés i18n `aarri.*` en fr et en
- Test d'interface (Playwright) : navigation accueil → AARRI

### User Story

- En tant que porteur du projet, je veux un lien depuis l'accueil vers une
  page AARRI reprenant mon template habituel, afin de suivre publiquement les
  métriques d'acquisition/activation/rétention/référencement/impact du projet.

### Prompt log

- `2026-09-05 | Relecture du CLAUDE.md placé à la racine du projet et vérification de conformité aux standards qu'il liste | (aucun fichier de code modifié — vérification)`
- `2026-09-05 | Ajout sur l'accueil d'un lien vers une page AARRI reprenant le template habituel | src/routes/aarri/+page.svelte, src/routes/+page.svelte, src/lib/i18n/fr.json, src/lib/i18n/en.json, e2e/golden-path.e2e.ts, .prettierignore`

## [0.1.0] — 2026-09-05 — Initialisation du projet

### Added

- Initialisation du projet : SvelteKit 2 (TypeScript, Svelte 5) + adapter-node
- Connexion MongoDB (`src/lib/server/db.ts`), pilotée par `MONGODB_URI` / `MONGODB_DB`
- Internationalisation `svelte-i18n` (fr/en), langue résolue depuis l'en-tête
  `Accept-Language` du navigateur côté serveur, sans chaîne en dur dans le code
- En-têtes de sécurité HTTP de base (`X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security` en HTTPS)
- Page d'accueil et route publique `/changelog` exposant ce fichier
- Mise en page responsive mobile-first (breakpoints `rem`, pas de largeurs fixes en `px`)
- Tests unitaires (Vitest) : négociation de langue, lecture de la configuration MongoDB
- Tests d'interface (Playwright) : parcours nominal (accueil → changelog)
- Outillage : ESLint, Prettier

### Security

- Vulnérabilité connue et non corrigeable sans rupture : `cookie < 0.7.0` (via
  `@sveltejs/kit`) — sévérité LOW, correctif upstream non disponible sans
  downgrade de `@sveltejs/kit` (même constat que sur le template
  [setupserviceweb](https://github.com/natoine/setupserviceweb))
- Vulnérabilités MODERATE dans la chaîne de dépendances de `svelte-i18n`
  (`esbuild` en dev uniquement) — sans impact en production, à surveiller

### User Story

- En tant que porteur du projet, je veux initialiser Bavures sur une stack
  Node.js / SvelteKit / MongoDB conforme à mes standards (i18n, responsive,
  changelog public, tests unitaires et E2E), afin de pouvoir enchaîner
  directement sur les fonctionnalités de dataviz.

### Prompt log

- `2026-09-05 | Initialisation du projet Nodejs/SvelteKit/MongoDB | package.json, src/hooks.server.ts, src/lib/server/db.ts, src/lib/i18n/*, src/lib/utils/locale.ts, src/routes/+layout.svelte, src/routes/+page.svelte, src/routes/changelog/+page.svelte, CHANGELOG.md, README.md, .env.example`

[Unreleased]: https://github.com/natoine/bavures/compare/v0.8.0...HEAD
[0.8.0]: https://github.com/natoine/bavures/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/natoine/bavures/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/natoine/bavures/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/natoine/bavures/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/natoine/bavures/compare/v0.3.2...v0.4.0
[0.3.2]: https://github.com/natoine/bavures/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/natoine/bavures/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/natoine/bavures/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/natoine/bavures/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/natoine/bavures/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/natoine/bavures/releases/tag/v0.1.0

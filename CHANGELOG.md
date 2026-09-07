# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Unreleased]

_(aucun changement en attente)_

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

[Unreleased]: https://github.com/natoine/bavures/compare/v0.6.0...HEAD
[0.6.0]: https://github.com/natoine/bavures/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/natoine/bavures/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/natoine/bavures/compare/v0.3.2...v0.4.0
[0.3.2]: https://github.com/natoine/bavures/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/natoine/bavures/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/natoine/bavures/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/natoine/bavures/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/natoine/bavures/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/natoine/bavures/releases/tag/v0.1.0

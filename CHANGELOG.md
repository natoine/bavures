# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Unreleased]

_(aucun changement en attente)_

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

[Unreleased]: https://github.com/natoine/bavures/compare/v0.2.1...HEAD
[0.2.1]: https://github.com/natoine/bavures/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/natoine/bavures/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/natoine/bavures/releases/tag/v0.1.0

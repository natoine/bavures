# Bavures

Outil de dataviz des bavures policières.

## Périmètre fonctionnel

- Page d'accueil présentant l'outil (visualisations de données à venir)
- Page publique [`/changelog`](src/routes/changelog) exposant [CHANGELOG.md](CHANGELOG.md)
- Interface disponible en français et en anglais, langue détectée automatiquement
  depuis la configuration du navigateur (en-tête `Accept-Language`)

## Stack

- **SvelteKit 2** (Svelte 5, TypeScript) + `@sveltejs/adapter-node`
- **MongoDB** (driver officiel `mongodb`, connexion singleton dans
  [src/lib/server/db.ts](src/lib/server/db.ts))
- **svelte-i18n** pour l'internationalisation (fr/en)
- **Vitest** pour les tests unitaires, **Playwright** pour les tests d'interface (E2E)
- **ESLint** + **Prettier**

## Architecture

```
src/
  hooks.server.ts        # négociation de langue + en-têtes de sécurité HTTP
  lib/
    i18n/                 # init svelte-i18n + fichiers de traduction fr.json / en.json
    server/db.ts          # connexion MongoDB (singleton)
    utils/locale.ts        # négociation Accept-Language (pur, testé unitairement)
  routes/
    +layout.svelte         # nav, footer, garde de chargement i18n
    +page.svelte            # accueil
    changelog/              # rendu de CHANGELOG.md
e2e/                          # tests Playwright
```

## Démarrage

```bash
cp .env.example .env   # renseigner MONGODB_URI (une instance MongoDB doit tourner)
npm install
npm run dev
```

## Build & tests

```bash
npm run build       # build de production (adapter-node)
npm run preview     # sert le build

npm run check        # vérification des types (svelte-check)
npm run lint          # prettier --check + eslint
npm run format          # prettier --write

npm run test:unit        # tests unitaires (Vitest)
npm run test:e2e          # tests d'interface (Playwright)
npm run test                # unitaires puis E2E
```

## Internationalisation

Les traductions vivent dans `src/lib/i18n/{fr,en}.json`. Aucune chaîne ne doit
être écrite en dur dans les composants : passer par `$_('clé')` (import
`svelte-i18n`) et ajouter la clé dans les deux fichiers.

## Changelog

Ce projet suit [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/) et
[SemVer](https://semver.org/lang/fr/). Voir [CHANGELOG.md](CHANGELOG.md), aussi
exposé publiquement sur `/changelog`.

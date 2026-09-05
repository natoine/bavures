# Bavures

Outil de dataviz des bavures policières.

## Périmètre fonctionnel

- Page d'accueil présentant l'outil (visualisations de données à venir)
- Page publique [`/changelog`](src/routes/changelog) exposant [CHANGELOG.md](CHANGELOG.md)
- Page publique [`/aarri`](src/routes/aarri) : tableau AARRI et matrice d'impact
  du projet (métriques placeholder), reprise du template
  [setupserviceweb](https://github.com/natoine/setupserviceweb)
- Page publique [`/donnees`](src/routes/donnees) : « Nos données », la liste des
  sources de données du projet (de la plus récente à la plus ancienne), chacune
  librement téléchargeable avec son lien source d'origine et sa date de
  téléchargement
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
    server/
      db.ts               # connexion MongoDB (singleton)
      dataSources.ts       # modèle + accès Mongo pour les sources de données
      dataStorage.ts        # résolution sûre du dossier/fichiers stockés
      fileNaming.ts          # nettoyage de noms, MIME, Content-Disposition
    utils/
      locale.ts             # négociation Accept-Language (pur, testé unitairement)
      formatBytes.ts          # formatage lisible d'une taille de fichier
  routes/
    +layout.svelte         # nav, footer, garde de chargement i18n
    +page.svelte            # accueil
    changelog/              # rendu de CHANGELOG.md
    aarri/                   # tableau AARRI + matrice d'impact
    donnees/                  # « Nos données » + téléchargement des documents
data/sources/                  # documents sources stockés (voir data/sources/README.md)
scripts/add-data-source.ts       # CLI pour ajouter une source de données
e2e/                                # tests Playwright
```

## Démarrage

MongoDB est installé comme service système sur cette machine. Démarrez-le
avant de lancer l'application (une seule fois par session, il ne redémarre
pas seul au reboot tant qu'il n'est pas activé) :

```bash
sudo systemctl start mongod

# Vérifier qu'il tourne :
sudo systemctl status mongod

# Pour qu'il démarre automatiquement au démarrage de la machine :
sudo systemctl enable mongod
```

Puis :

```bash
cp .env.example .env   # renseigner MONGODB_URI si besoin (par défaut : mongodb://localhost:27017/bavures)
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

## Nos données

Chaque source de données est un document stocké dans `data/sources/`
(dossier accessible en lecture, configurable via `DATA_SOURCES_DIR`) avec une
entrée correspondante dans la collection MongoDB `data_sources` : titre,
description optionnelle, URL de la source d'origine, date de téléchargement,
fichier, type MIME et taille. La page publique `/donnees` liste ces sources
de la plus récente à la plus ancienne, chacune avec son lien de
téléchargement (`/donnees/telecharger/[id]`), le lien de la source d'origine
et la date de téléchargement.

Pour ajouter une source (copie le fichier + crée l'entrée en base) :

```bash
npm run data:add -- \
  --title "Nom du document" \
  --source-url "https://... (où la donnée a été trouvée)" \
  --file /chemin/local/vers/le/document.pdf \
  --downloaded-at 2026-09-05 \
  --description "Texte libre (optionnel)"
```

## Internationalisation

Les traductions vivent dans `src/lib/i18n/{fr,en}.json`. Aucune chaîne ne doit
être écrite en dur dans les composants : passer par `$_('clé')` (import
`svelte-i18n`) et ajouter la clé dans les deux fichiers.

## Changelog

Ce projet suit [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/) et
[SemVer](https://semver.org/lang/fr/). Voir [CHANGELOG.md](CHANGELOG.md), aussi
exposé publiquement sur `/changelog`.

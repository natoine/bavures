# Bavures

Outil de dataviz des bavures policières.

## Périmètre fonctionnel

- Page d'accueil présentant l'outil, avec des graphiques (un par métrique)
  des données extraites des rapports IGPN — voir « Graphiques » ci-dessous
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
      dataSourceArgs.ts      # parsing des arguments CLI (pur, testé unitairement)
      addDataSource.ts         # copie fichier + insertion Mongo (partagé par les scripts)
      dataStorage.ts              # résolution sûre des dossiers/fichiers stockés (sources + extraits)
      fileNaming.ts                 # nettoyage de noms, MIME, Content-Disposition
      fileResponse.ts                 # réponse HTTP de téléchargement (streaming), partagée
      igpnReports.ts                    # extraction des rapports IGPN depuis le HTML de la page
      csv.ts                               # parseur CSV minimal (RFC 4180)
      extractedMetrics.ts                    # assemble les CSV annuels en séries temporelles
    components/
      BarChart.svelte           # graphique en barres réutilisable (accueil)
    utils/
      locale.ts             # négociation Accept-Language (pur, testé unitairement)
      formatBytes.ts          # formatage lisible d'une taille de fichier
      barPath.ts                # chemin SVG d'une barre arrondie en haut
  routes/
    +layout.svelte         # nav, footer, garde de chargement i18n
    +page.svelte            # accueil + graphiques
    changelog/              # rendu de CHANGELOG.md
    aarri/                   # tableau AARRI + matrice d'impact
    donnees/                  # « Nos données » + téléchargement des documents et données extraites
data/
  sources/                       # documents sources stockés (voir data/sources/README.md)
  extracted/                       # CSV de données extraites (voir data/extracted/README.md)
logs/                             # logs des tâches cron (non versionné)
scripts/
  add-data-source.ts               # CLI pour ajouter une source de données
  check-igpn-updates.ts              # vérification automatique (cron, tous les 3 mois)
e2e/                                    # tests Playwright
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
  --description "Texte libre (optionnel)" \
  --original-name "Nom affiché au téléchargement.pdf" \
  --extracted-data-file "2025.csv"
```

### Rapports annuels de l'IGPN

Première source du projet : les 8 rapports annuels de l'IGPN (2017-2024),
listés sur
[cette page](https://www.police-nationale.interieur.gouv.fr/nous-decouvrir/notre-organisation/organisation/linspection-generale-de-police-nationale-igpn).

Une vérification automatique tourne tous les 3 mois (cron, voir ci-dessous)
via `npm run data:check-igpn`
([scripts/check-igpn-updates.ts](scripts/check-igpn-updates.ts)) : elle
récupère la page, compare les rapports trouvés à ceux déjà en base (par
titre), et télécharge + ajoute automatiquement tout nouveau millésime.
Si le site direct est injoignable (pare-feu Cloudflare bloquant certains
réseaux), le script retombe sur la dernière capture
[Wayback Machine](https://web.archive.org) de la page.

Tâche cron installée sur cette machine (`crontab -l`) :

```cron
PATH=/home/natoine/.nvm/versions/node/v22.22.2/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
# Bavures : verification trimestrielle d'un nouveau rapport annuel IGPN
0 8 1 1,4,7,10 * cd /home/natoine/dev/bavures ; npx tsx scripts/check-igpn-updates.ts >> /home/natoine/dev/bavures/logs/igpn-check.log 2>&1
```

Elle tourne le 1er janvier, avril, juillet et octobre à 8h ; le résultat est
journalisé dans `logs/igpn-check.log` (non versionné). MongoDB doit être
démarré pour que la tâche fonctionne (voir section Démarrage).

### Données extraites

[`data/extracted/`](data/extracted) contient un CSV par rapport
(`2017.csv` à `2024.csv`), listant toutes les données chiffrées extraites
à la main de ce rapport (enquêtes judiciaires et administratives,
effectifs, signalements, formations, décès et blessés en intervention,
discriminations, corruption…), avec un nom de métrique cohérent d'un
fichier à l'autre pour permettre de reconstituer une série temporelle.
Méthodologie, définition de chaque métrique et limites (séries révisées
d'un rapport à l'autre, périmètres non comparables) documentées dans
[data/extracted/README.md](data/extracted/README.md).

Sur la page `/donnees`, chaque rapport ayant des données extraites
affiche un second lien de téléchargement, « Les données extraites de ce
rapport », servi par `GET /donnees/telecharger-donnees-extraites/[id]` en
s'appuyant sur le champ `extractedDataFileName` du document Mongo
correspondant.

## Graphiques

La page d'accueil affiche un graphique en barres par métrique disponible
dans `data/extracted/` (19 au moment d'écrire ces lignes), en petits
multiples. `src/lib/server/extractedMetrics.ts` lit tous les fichiers
`<année>.csv`, les assemble en séries temporelles par métrique (triées par
année), et `src/lib/components/BarChart.svelte` les affiche : barre
plafonnée à 24px, valeur du dernier point étiquetée directement, infobulle
au survol de chaque barre, et un tableau de valeurs accessible (`<details>`)
en repli pour chaque graphique. Design conforme au kit dataviz du projet
(forme, couleur, marques, interaction) ; mode sombre volontairement pas
traité ici tant qu'il ne l'est pas au niveau du site entier.

## Internationalisation

Les traductions vivent dans `src/lib/i18n/{fr,en}.json`. Aucune chaîne ne doit
être écrite en dur dans les composants : passer par `$_('clé')` (import
`svelte-i18n`) et ajouter la clé dans les deux fichiers.

## Changelog

Ce projet suit [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/) et
[SemVer](https://semver.org/lang/fr/). Voir [CHANGELOG.md](CHANGELOG.md), aussi
exposé publiquement sur `/changelog`.

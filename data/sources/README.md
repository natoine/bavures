# Sources de données

Ce dossier contient les documents sources (rapports, jeux de données bruts…)
mis à disposition en téléchargement libre sur la page publique `/donnees`.

- Chaque fichier ici doit avoir une entrée correspondante dans la collection
  MongoDB `data_sources` (voir [src/lib/server/dataSources.ts](../../src/lib/server/dataSources.ts)).
- Ne pas renommer ou déplacer un fichier référencé par la base sans mettre à
  jour le champ `fileName` du document correspondant.
- Pour ajouter une nouvelle source, utiliser le script :

  ```bash
  npm run data:add -- \
    --title "Nom du document" \
    --source-url "https://... (où la donnée a été trouvée)" \
    --file /chemin/local/vers/le/document.pdf \
    --downloaded-at 2026-09-05
  ```

  Le script copie le fichier ici et crée l'entrée en base.

- Emplacement configurable via la variable d'environnement `DATA_SOURCES_DIR`
  (voir `.env.example`).

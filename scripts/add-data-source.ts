#!/usr/bin/env -S npx tsx
/**
 * Ajoute une source de données : copie le fichier dans le dossier de
 * stockage public et crée l'entrée correspondante en base MongoDB.
 *
 * Usage :
 *   npm run data:add -- \
 *     --title "Bilan des interventions 2025" \
 *     --source-url "https://exemple.org/ou-on-a-trouve-cette-donnee" \
 *     --file /chemin/local/vers/le/document.pdf \
 *     [--downloaded-at 2026-09-05] \
 *     [--description "Texte libre"] \
 *     [--original-name "Nom affiché au téléchargement.pdf"] \
 *     [--extracted-data-file "2025.csv"]
 */
import { addDataSourceFromFile } from '../src/lib/server/addDataSource';
import { parseAddDataSourceArgs } from '../src/lib/server/dataSourceArgs';
import { getMongoClientPromise } from '../src/lib/server/db';

async function main() {
	// Le chargement de `.env` est géré par `db.ts` (voir son import ci-dessus).
	const args = parseAddDataSourceArgs(process.argv.slice(2));

	const result = await addDataSourceFromFile({
		title: args.title,
		sourceUrl: args.sourceUrl,
		filePath: args.file,
		downloadedAt: args.downloadedAt,
		description: args.description,
		originalName: args.originalName,
		extractedDataFileName: args.extractedDataFileName
	});

	console.log(`✔ Source ajoutée : ${args.title}`);
	console.log(`  Fichier stocké : ${result.storedFilePath}`);
	console.log(`  Document Mongo : ${result.insertedId}`);

	const client = await getMongoClientPromise();
	await client.close();
}

main().catch((error: unknown) => {
	console.error('✘', error instanceof Error ? error.message : error);
	process.exitCode = 1;
});

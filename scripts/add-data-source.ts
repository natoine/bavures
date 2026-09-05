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
 *     [--description "Texte libre"]
 */
import { randomUUID } from 'node:crypto';
import { copyFile, mkdir, stat } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { getDataSourcesDir } from '../src/lib/server/dataStorage';
import { DATA_SOURCES_COLLECTION } from '../src/lib/server/dataSources';
import { getMongoClientPromise, getMongoDbName } from '../src/lib/server/db';
import { buildStoredFileName, guessMimeType } from '../src/lib/server/fileNaming';

interface Args {
	title: string;
	sourceUrl: string;
	file: string;
	downloadedAt: Date;
	description: string | null;
}

function parseArgs(argv: string[]): Args {
	const get = (flag: string): string | undefined => {
		const index = argv.indexOf(flag);
		return index === -1 ? undefined : argv[index + 1];
	};

	const title = get('--title');
	const sourceUrl = get('--source-url');
	const file = get('--file');
	const downloadedAtRaw = get('--downloaded-at');
	const description = get('--description') ?? null;

	if (!title || !sourceUrl || !file) {
		throw new Error(
			'Arguments requis manquants. Usage : --title <titre> --source-url <url> --file <chemin> [--downloaded-at AAAA-MM-JJ] [--description <texte>]'
		);
	}

	const downloadedAt = downloadedAtRaw ? new Date(downloadedAtRaw) : new Date();
	if (Number.isNaN(downloadedAt.getTime())) {
		throw new Error(`Date --downloaded-at invalide : ${downloadedAtRaw}`);
	}

	return { title, sourceUrl, file, downloadedAt, description };
}

async function main() {
	// Le chargement de `.env` est géré par `db.ts` (voir son import ci-dessous).
	const args = parseArgs(process.argv.slice(2));

	const originalFileName = basename(args.file);
	const fileStat = await stat(args.file);

	const storedFileName = buildStoredFileName(originalFileName, randomUUID().slice(0, 8));
	const targetDir = getDataSourcesDir();
	await mkdir(targetDir, { recursive: true });
	await copyFile(args.file, join(targetDir, storedFileName));

	const client = await getMongoClientPromise();
	try {
		const db = client.db(getMongoDbName());
		const result = await db.collection(DATA_SOURCES_COLLECTION).insertOne({
			title: args.title,
			description: args.description,
			sourceUrl: args.sourceUrl,
			fileName: storedFileName,
			originalFileName,
			mimeType: guessMimeType(originalFileName),
			fileSizeBytes: fileStat.size,
			downloadedAt: args.downloadedAt
		});

		console.log(`✔ Source ajoutée : ${args.title}`);
		console.log(`  Fichier stocké : ${join(targetDir, storedFileName)}`);
		console.log(`  Document Mongo : ${result.insertedId.toString()}`);
	} finally {
		await client.close();
	}
}

main().catch((error: unknown) => {
	console.error('✘', error instanceof Error ? error.message : error);
	process.exitCode = 1;
});

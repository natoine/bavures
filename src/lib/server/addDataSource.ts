import { randomUUID } from 'node:crypto';
import { copyFile, mkdir, stat } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { getDataSourcesDir } from './dataStorage';
import { DATA_SOURCES_COLLECTION } from './dataSources';
import { getMongoClientPromise, getMongoDbName } from './db';
import { buildStoredFileName, guessMimeType } from './fileNaming';

export interface AddDataSourceInput {
	title: string;
	sourceUrl: string;
	/** Chemin local du fichier à copier dans le dossier de stockage. */
	filePath: string;
	downloadedAt: Date;
	description?: string | null;
	/** Nom affiché au téléchargement ; par défaut, le nom du fichier local. */
	originalName?: string | null;
}

export interface AddDataSourceResult {
	insertedId: string;
	storedFilePath: string;
}

/**
 * Copie un fichier dans le dossier de stockage public et crée l'entrée
 * correspondante dans la collection `data_sources`. Partagé par le script
 * `add-data-source` (usage manuel) et `check-igpn-updates` (usage
 * automatisé) pour ne pas dupliquer la logique de copie/insertion.
 *
 * Ne ferme pas la connexion Mongo (singleton partagé) : à la charge de
 * l'appelant de la fermer s'il s'agit d'un script one-shot.
 */
export async function addDataSourceFromFile(
	input: AddDataSourceInput
): Promise<AddDataSourceResult> {
	const originalFileName = input.originalName ?? basename(input.filePath);
	const fileStat = await stat(input.filePath);

	const storedFileName = buildStoredFileName(originalFileName, randomUUID().slice(0, 8));
	const targetDir = getDataSourcesDir();
	await mkdir(targetDir, { recursive: true });
	const storedFilePath = join(targetDir, storedFileName);
	await copyFile(input.filePath, storedFilePath);

	const client = await getMongoClientPromise();
	const db = client.db(getMongoDbName());
	const result = await db.collection(DATA_SOURCES_COLLECTION).insertOne({
		title: input.title,
		description: input.description ?? null,
		sourceUrl: input.sourceUrl,
		fileName: storedFileName,
		originalFileName,
		mimeType: guessMimeType(originalFileName),
		fileSizeBytes: fileStat.size,
		downloadedAt: input.downloadedAt
	});

	return { insertedId: result.insertedId.toString(), storedFilePath };
}

import { ObjectId, type WithId, type Document } from 'mongodb';
import { getDb } from './db';

export const DATA_SOURCES_COLLECTION = 'data_sources';

/** Document stocké en base pour une source de données. */
export interface DataSourceDoc {
	title: string;
	description?: string | null;
	sourceUrl: string;
	fileName: string;
	originalFileName?: string;
	mimeType?: string;
	fileSizeBytes?: number;
	downloadedAt: Date;
	/** Nom du fichier CSV de données extraites (dans data/extracted/), si disponible. */
	extractedDataFileName?: string | null;
}

/** Vue publique, sérialisable, d'une source de données. */
export interface DataSource {
	id: string;
	title: string;
	description: string | null;
	sourceUrl: string;
	fileName: string;
	originalFileName: string;
	mimeType: string;
	fileSizeBytes: number;
	/** ISO 8601 */
	downloadedAt: string;
	extractedDataFileName: string | null;
}

/**
 * Convertit un document Mongo en `DataSource` sérialisable, en validant les
 * champs obligatoires. Lève une erreur explicite plutôt que de laisser
 * passer une entrée mal formée vers la page publique.
 */
export function toDataSource(doc: WithId<Document>): DataSource {
	const title = typeof doc.title === 'string' ? doc.title.trim() : '';
	if (title === '') {
		throw new Error(`Source de données invalide (titre manquant) : ${String(doc._id)}`);
	}

	const sourceUrl = typeof doc.sourceUrl === 'string' ? doc.sourceUrl.trim() : '';
	if (sourceUrl === '') {
		throw new Error(`Source de données invalide (URL source manquante) : ${String(doc._id)}`);
	}

	const fileName = typeof doc.fileName === 'string' ? doc.fileName.trim() : '';
	if (fileName === '') {
		throw new Error(`Source de données invalide (fichier manquant) : ${String(doc._id)}`);
	}

	const downloadedAt =
		doc.downloadedAt instanceof Date ? doc.downloadedAt : new Date(doc.downloadedAt);
	if (Number.isNaN(downloadedAt.getTime())) {
		throw new Error(`Source de données invalide (date de téléchargement) : ${String(doc._id)}`);
	}

	const fileSizeBytes =
		typeof doc.fileSizeBytes === 'number' &&
		Number.isFinite(doc.fileSizeBytes) &&
		doc.fileSizeBytes >= 0
			? doc.fileSizeBytes
			: 0;

	return {
		id: doc._id.toString(),
		title,
		description:
			typeof doc.description === 'string' && doc.description.trim() !== '' ? doc.description : null,
		sourceUrl,
		fileName,
		originalFileName:
			typeof doc.originalFileName === 'string' && doc.originalFileName.trim() !== ''
				? doc.originalFileName
				: fileName,
		mimeType:
			typeof doc.mimeType === 'string' && doc.mimeType.trim() !== ''
				? doc.mimeType
				: 'application/octet-stream',
		fileSizeBytes,
		downloadedAt: downloadedAt.toISOString(),
		extractedDataFileName:
			typeof doc.extractedDataFileName === 'string' && doc.extractedDataFileName.trim() !== ''
				? doc.extractedDataFileName
				: null
	};
}

/** Trie du plus récent au plus ancien (date de téléchargement). */
export function sortByDownloadedAtDesc(items: readonly DataSource[]): DataSource[] {
	return [...items].sort(
		(a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime()
	);
}

async function getCollection() {
	const database = await getDb();
	return database.collection(DATA_SOURCES_COLLECTION);
}

/** Liste toutes les sources de données, de la plus récente à la plus ancienne. */
export async function listDataSources(): Promise<DataSource[]> {
	const collection = await getCollection();
	const docs = await collection.find().sort({ downloadedAt: -1 }).toArray();
	return sortByDownloadedAtDesc(docs.map(toDataSource));
}

/** Récupère une source de données par son identifiant, ou `null` si absente/invalide. */
export async function getDataSourceById(id: string): Promise<DataSource | null> {
	if (!ObjectId.isValid(id)) return null;

	const collection = await getCollection();
	const doc = await collection.findOne({ _id: new ObjectId(id) });
	return doc ? toDataSource(doc) : null;
}

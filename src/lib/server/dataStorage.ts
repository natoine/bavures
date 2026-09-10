import { join, resolve, sep } from 'node:path';

/**
 * Dossier où sont stockés les documents sources téléchargeables, accessible
 * en lecture (permissions par défaut du système : 644 sur les fichiers).
 * Configurable via `DATA_SOURCES_DIR`, sinon `<projet>/data/sources`.
 */
export function getDataSourcesDir(): string {
	const configured = process.env.DATA_SOURCES_DIR?.trim();
	return configured && configured.length > 0
		? resolve(configured)
		: join(process.cwd(), 'data', 'sources');
}

/**
 * Dossier où sont stockés les CSV de données extraites des sources.
 * Configurable via `EXTRACTED_DATA_DIR`, sinon `<projet>/data/extracted`.
 */
export function getExtractedDataDir(): string {
	const configured = process.env.EXTRACTED_DATA_DIR?.trim();
	return configured && configured.length > 0
		? resolve(configured)
		: join(process.cwd(), 'data', 'extracted');
}

/** Vrai si `targetPath` est bien situé à l'intérieur de `baseDir`. */
export function isWithinDirectory(baseDir: string, targetPath: string): boolean {
	const normalizedBase = resolve(baseDir) + sep;
	const normalizedTarget = resolve(targetPath);
	return (normalizedTarget + sep).startsWith(normalizedBase);
}

/**
 * Résout le chemin absolu d'un fichier situé dans `dir`, à partir de son
 * nom. Lève une erreur si le nom résultant sort de ce dossier (défense en
 * profondeur, même si `fileName` provient normalement de la base de
 * données et non d'une entrée utilisateur directe).
 */
function resolveFileInDir(dir: string, fileName: string, dirLabel: string): string {
	const target = join(dir, fileName);
	if (!isWithinDirectory(dir, target)) {
		throw new Error(`Nom de fichier invalide (hors du dossier ${dirLabel}) : ${fileName}`);
	}
	return target;
}

/** Résout le chemin absolu d'un document source à partir de son nom. */
export function resolveStoredFilePath(fileName: string): string {
	return resolveFileInDir(getDataSourcesDir(), fileName, 'de stockage');
}

/** Résout le chemin absolu d'un CSV de données extraites à partir de son nom. */
export function resolveExtractedFilePath(fileName: string): string {
	return resolveFileInDir(getExtractedDataDir(), fileName, 'de données extraites');
}

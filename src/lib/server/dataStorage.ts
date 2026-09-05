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

/** Vrai si `targetPath` est bien situé à l'intérieur de `baseDir`. */
export function isWithinDirectory(baseDir: string, targetPath: string): boolean {
	const normalizedBase = resolve(baseDir) + sep;
	const normalizedTarget = resolve(targetPath);
	return (normalizedTarget + sep).startsWith(normalizedBase);
}

/**
 * Résout le chemin absolu d'un fichier stocké à partir de son nom.
 * Lève une erreur si le nom résultant sort du dossier de stockage (défense
 * en profondeur, même si `fileName` provient normalement de la base de
 * données et non d'une entrée utilisateur directe).
 */
export function resolveStoredFilePath(fileName: string): string {
	const dir = getDataSourcesDir();
	const target = join(dir, fileName);
	if (!isWithinDirectory(dir, target)) {
		throw new Error(`Nom de fichier invalide (hors du dossier de stockage) : ${fileName}`);
	}
	return target;
}

import { extname, basename } from 'node:path';

const MIME_TYPES: Record<string, string> = {
	'.pdf': 'application/pdf',
	'.csv': 'text/csv',
	'.json': 'application/json',
	'.xml': 'application/xml',
	'.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	'.xls': 'application/vnd.ms-excel',
	'.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'.zip': 'application/zip',
	'.txt': 'text/plain',
	'.ods': 'application/vnd.oasis.opendocument.spreadsheet'
};

const DEFAULT_MIME_TYPE = 'application/octet-stream';

// Marques diacritiques combinantes (U+0300 à U+036F), utilisées après une
// normalisation NFKD pour produire un repli ASCII (ex: "é" -> "e" + accent).
const COMBINING_DIACRITICS = new RegExp('[\\u0300-\\u036f]', 'g');

/** Devine le type MIME d'un fichier à partir de son extension. */
export function guessMimeType(fileName: string): string {
	const ext = extname(fileName).toLowerCase();
	return MIME_TYPES[ext] ?? DEFAULT_MIME_TYPE;
}

/**
 * Nettoie un nom de fichier pour un stockage sûr sur disque : retire tout
 * séparateur de chemin (protection contre la traversée de répertoire) et les
 * caractères hors d'un jeu restreint sûr.
 */
export function sanitizeFileName(fileName: string): string {
	const withoutPath = fileName.replace(/^.*[/\\]/, '');
	const cleaned = withoutPath
		.trim()
		.replace(/[^a-zA-Z0-9._-]+/g, '-')
		.replace(/-{2,}/g, '-')
		.replace(/^[.-]+|[.-]+$/g, '');

	return cleaned.length > 0 ? cleaned : 'fichier';
}

/**
 * Construit le nom de fichier utilisé pour le stockage sur disque : le nom
 * d'origine nettoyé, préfixé d'un suffixe unique pour éviter toute collision
 * entre deux documents portant le même nom.
 */
export function buildStoredFileName(originalFileName: string, uniqueSuffix: string): string {
	const sanitized = sanitizeFileName(originalFileName);
	const ext = extname(sanitized);
	const base = basename(sanitized, ext);
	return `${base}-${uniqueSuffix}${ext}`;
}

/**
 * Construit l'en-tête HTTP `Content-Disposition` pour un téléchargement,
 * avec un repli ASCII (compatibilité maximale) et la forme `filename*`
 * UTF-8 (RFC 6266) pour préserver les accents du nom d'origine.
 */
export function buildContentDisposition(fileName: string): string {
	const asciiFallback = fileName
		.normalize('NFKD')
		.replace(COMBINING_DIACRITICS, '')
		.replace(/[^\x20-\x7e]/g, '_');

	return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

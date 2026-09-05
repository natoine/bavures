/**
 * Négociation de la langue à partir de l'en-tête HTTP `Accept-Language`
 * envoyé par le navigateur (RFC 9110 §12.5.4), sans dépendance à une API
 * navigateur — donc utilisable côté serveur (SSR) comme côté client.
 */
export function parseAcceptLanguage(header: string | null | undefined): string[] {
	if (!header) return [];

	return header
		.split(',')
		.map((part) => {
			const [tag, qPart] = part.trim().split(';q=');
			const quality = qPart ? parseFloat(qPart) : 1;
			return { tag: tag.trim().toLowerCase(), quality: Number.isNaN(quality) ? 0 : quality };
		})
		.filter((entry) => entry.tag.length > 0)
		.sort((a, b) => b.quality - a.quality)
		.map((entry) => entry.tag);
}

/**
 * Choisit la meilleure langue supportée à partir de l'en-tête Accept-Language.
 * Retombe sur `fallback` si aucune langue demandée n'est supportée.
 */
export function resolveLocale(
	acceptLanguageHeader: string | null | undefined,
	supportedLocales: readonly string[],
	fallback: string
): string {
	const requested = parseAcceptLanguage(acceptLanguageHeader);

	for (const tag of requested) {
		const primary = tag.split('-')[0];
		const exact = supportedLocales.find((locale) => locale.toLowerCase() === tag);
		if (exact) return exact;

		const byPrimary = supportedLocales.find((locale) => locale.toLowerCase() === primary);
		if (byPrimary) return byPrimary;
	}

	return fallback;
}

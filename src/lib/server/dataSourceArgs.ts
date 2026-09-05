export interface AddDataSourceArgs {
	title: string;
	sourceUrl: string;
	file: string;
	downloadedAt: Date;
	description: string | null;
	originalName: string | null;
}

/**
 * Parse les arguments CLI du script `add-data-source`. Fonction pure
 * (aucun accès disque/réseau) pour rester testable sans mock.
 */
export function parseAddDataSourceArgs(argv: readonly string[]): AddDataSourceArgs {
	const get = (flag: string): string | undefined => {
		const index = argv.indexOf(flag);
		return index === -1 ? undefined : argv[index + 1];
	};

	const title = get('--title');
	const sourceUrl = get('--source-url');
	const file = get('--file');
	const downloadedAtRaw = get('--downloaded-at');
	const description = get('--description') ?? null;
	const originalName = get('--original-name') ?? null;

	if (!title || !sourceUrl || !file) {
		throw new Error(
			'Arguments requis manquants. Usage : --title <titre> --source-url <url> --file <chemin> [--downloaded-at AAAA-MM-JJ] [--description <texte>] [--original-name <nom>]'
		);
	}

	const downloadedAt = downloadedAtRaw ? new Date(downloadedAtRaw) : new Date();
	if (Number.isNaN(downloadedAt.getTime())) {
		throw new Error(`Date --downloaded-at invalide : ${downloadedAtRaw}`);
	}

	return { title, sourceUrl, file, downloadedAt, description, originalName };
}

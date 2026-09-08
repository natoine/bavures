/**
 * Parseur CSV minimal (RFC 4180) : champs entre guillemets, guillemets
 * doublés pour échapper un guillemet littéral, fins de ligne CRLF ou LF.
 * Volontairement autonome (pas de dépendance) pour un usage interne simple.
 */
export function parseCsv(text: string): string[][] {
	const rows: string[][] = [];
	let row: string[] = [];
	let field = '';
	let inQuotes = false;
	let i = 0;
	const len = text.length;

	while (i < len) {
		const char = text[i];

		if (inQuotes) {
			if (char === '"') {
				if (text[i + 1] === '"') {
					field += '"';
					i += 2;
					continue;
				}
				inQuotes = false;
				i++;
				continue;
			}
			field += char;
			i++;
			continue;
		}

		if (char === '"') {
			inQuotes = true;
			i++;
			continue;
		}
		if (char === ',') {
			row.push(field);
			field = '';
			i++;
			continue;
		}
		if (char === '\r') {
			i++;
			continue;
		}
		if (char === '\n') {
			row.push(field);
			rows.push(row);
			row = [];
			field = '';
			i++;
			continue;
		}
		field += char;
		i++;
	}

	if (field.length > 0 || row.length > 0) {
		row.push(field);
		rows.push(row);
	}

	return rows;
}

/**
 * Parse un CSV avec en-tête en tableau d'objets `{ colonne: valeur }`.
 * Les lignes entièrement vides sont ignorées.
 */
const BOM_PATTERN = new RegExp('^\\uFEFF');

export function parseCsvRecords(text: string): Record<string, string>[] {
	const withoutBom = text.replace(BOM_PATTERN, '');
	const rows = parseCsv(withoutBom).filter((row) => row.length > 1 || row[0] !== '');
	if (rows.length === 0) return [];

	const [header, ...dataRows] = rows;
	return dataRows.map((row) =>
		Object.fromEntries(header.map((column, index) => [column, row[index] ?? '']))
	);
}

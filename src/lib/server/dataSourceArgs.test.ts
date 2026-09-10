import { describe, expect, it } from 'vitest';
import { parseAddDataSourceArgs } from './dataSourceArgs';

describe('parseAddDataSourceArgs', () => {
	it('parse tous les arguments fournis (cas nominal)', () => {
		const result = parseAddDataSourceArgs([
			'--title',
			'Bilan 2025',
			'--source-url',
			'https://exemple.org/source',
			'--file',
			'/tmp/bilan.pdf',
			'--downloaded-at',
			'2026-01-15',
			'--description',
			'Un texte libre',
			'--original-name',
			'Bilan officiel 2025.pdf',
			'--extracted-data-file',
			'2025.csv'
		]);

		expect(result).toEqual({
			title: 'Bilan 2025',
			sourceUrl: 'https://exemple.org/source',
			file: '/tmp/bilan.pdf',
			downloadedAt: new Date('2026-01-15'),
			description: 'Un texte libre',
			originalName: 'Bilan officiel 2025.pdf',
			extractedDataFileName: '2025.csv'
		});
	});

	it('applique des valeurs par défaut pour les arguments optionnels absents (cas limite)', () => {
		const before = Date.now();
		const result = parseAddDataSourceArgs([
			'--title',
			'Bilan 2025',
			'--source-url',
			'https://exemple.org/source',
			'--file',
			'/tmp/bilan.pdf'
		]);
		const after = Date.now();

		expect(result.description).toBeNull();
		expect(result.originalName).toBeNull();
		expect(result.extractedDataFileName).toBeNull();
		expect(result.downloadedAt.getTime()).toBeGreaterThanOrEqual(before);
		expect(result.downloadedAt.getTime()).toBeLessThanOrEqual(after);
	});

	it("lève une erreur si un argument requis est manquant (cas d'erreur)", () => {
		expect(() => parseAddDataSourceArgs(['--title', 'Bilan 2025'])).toThrow(/requis/);
	});

	it("lève une erreur si --downloaded-at est invalide (cas d'erreur)", () => {
		expect(() =>
			parseAddDataSourceArgs([
				'--title',
				'Bilan 2025',
				'--source-url',
				'https://exemple.org/source',
				'--file',
				'/tmp/bilan.pdf',
				'--downloaded-at',
				'pas-une-date'
			])
		).toThrow(/invalide/);
	});
});

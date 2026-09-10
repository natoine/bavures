import { ObjectId, type Document, type WithId } from 'mongodb';
import { describe, expect, it } from 'vitest';
import { sortByDownloadedAtDesc, toDataSource, type DataSource } from './dataSources';

function makeDoc(overrides: Partial<Document> = {}): WithId<Document> {
	return {
		_id: new ObjectId(),
		title: 'Bilan des interventions 2025',
		sourceUrl: 'https://exemple.org/rapport-2025',
		fileName: 'bilan-2025-abc123.pdf',
		downloadedAt: new Date('2026-01-15T10:00:00.000Z'),
		...overrides
	};
}

describe('toDataSource', () => {
	it('convertit un document complet (cas nominal)', () => {
		const result = toDataSource(
			makeDoc({
				description: 'Bilan annuel des interventions',
				originalFileName: 'bilan 2025.pdf',
				mimeType: 'application/pdf',
				fileSizeBytes: 12345
			})
		);

		expect(result).toMatchObject({
			title: 'Bilan des interventions 2025',
			description: 'Bilan annuel des interventions',
			sourceUrl: 'https://exemple.org/rapport-2025',
			fileName: 'bilan-2025-abc123.pdf',
			originalFileName: 'bilan 2025.pdf',
			mimeType: 'application/pdf',
			fileSizeBytes: 12345,
			downloadedAt: '2026-01-15T10:00:00.000Z'
		});
		expect(typeof result.id).toBe('string');
	});

	it('applique des valeurs par défaut sur les champs optionnels absents (cas limite)', () => {
		const result = toDataSource(makeDoc());

		expect(result.description).toBeNull();
		expect(result.originalFileName).toBe('bilan-2025-abc123.pdf');
		expect(result.mimeType).toBe('application/octet-stream');
		expect(result.fileSizeBytes).toBe(0);
		expect(result.extractedDataFileName).toBeNull();
	});

	it('reprend le nom du CSV de données extraites quand il est présent (cas nominal)', () => {
		const result = toDataSource(makeDoc({ extractedDataFileName: '2025.csv' }));
		expect(result.extractedDataFileName).toBe('2025.csv');
	});

	it("lève une erreur si le titre est manquant (cas d'erreur)", () => {
		expect(() => toDataSource(makeDoc({ title: '' }))).toThrow(/titre/);
	});

	it("lève une erreur si l'URL source est manquante (cas d'erreur)", () => {
		expect(() => toDataSource(makeDoc({ sourceUrl: '' }))).toThrow(/URL source/);
	});

	it("lève une erreur si le fichier est manquant (cas d'erreur)", () => {
		expect(() => toDataSource(makeDoc({ fileName: '' }))).toThrow(/fichier/);
	});

	it("lève une erreur si la date de téléchargement est invalide (cas d'erreur)", () => {
		expect(() => toDataSource(makeDoc({ downloadedAt: 'pas-une-date' }))).toThrow(/date/);
	});
});

describe('sortByDownloadedAtDesc', () => {
	function withDate(downloadedAt: string): DataSource {
		return {
			id: downloadedAt,
			title: 't',
			description: null,
			sourceUrl: 'https://exemple.org',
			fileName: 'f.pdf',
			originalFileName: 'f.pdf',
			mimeType: 'application/pdf',
			fileSizeBytes: 0,
			downloadedAt,
			extractedDataFileName: null
		};
	}

	it('trie du plus récent au plus ancien (cas nominal)', () => {
		const items = [
			withDate('2025-01-01T00:00:00.000Z'),
			withDate('2026-06-01T00:00:00.000Z'),
			withDate('2025-12-01T00:00:00.000Z')
		];

		expect(sortByDownloadedAtDesc(items).map((i) => i.id)).toEqual([
			'2026-06-01T00:00:00.000Z',
			'2025-12-01T00:00:00.000Z',
			'2025-01-01T00:00:00.000Z'
		]);
	});

	it('gère un tableau vide (cas limite)', () => {
		expect(sortByDownloadedAtDesc([])).toEqual([]);
	});

	it("ne mute pas le tableau d'origine (cas d'erreur potentielle)", () => {
		const items = [withDate('2025-01-01T00:00:00.000Z'), withDate('2026-01-01T00:00:00.000Z')];
		const original = [...items];
		sortByDownloadedAtDesc(items);
		expect(items).toEqual(original);
	});
});

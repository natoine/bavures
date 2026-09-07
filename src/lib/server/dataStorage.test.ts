import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
	getDataSourcesDir,
	getExtractedDataDir,
	isWithinDirectory,
	resolveExtractedFilePath,
	resolveStoredFilePath
} from './dataStorage';

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
	process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
	process.env = { ...ORIGINAL_ENV };
});

describe('getDataSourcesDir', () => {
	it('utilise DATA_SOURCES_DIR si défini (cas nominal)', () => {
		process.env.DATA_SOURCES_DIR = '/srv/bavures-data';
		expect(getDataSourcesDir()).toBe('/srv/bavures-data');
	});

	it('retombe sur <cwd>/data/sources par défaut (cas limite)', () => {
		delete process.env.DATA_SOURCES_DIR;
		expect(getDataSourcesDir()).toBe(join(process.cwd(), 'data', 'sources'));
	});
});

describe('getExtractedDataDir', () => {
	it('utilise EXTRACTED_DATA_DIR si défini (cas nominal)', () => {
		process.env.EXTRACTED_DATA_DIR = '/srv/bavures-extracted';
		expect(getExtractedDataDir()).toBe('/srv/bavures-extracted');
	});

	it('retombe sur <cwd>/data/extracted par défaut (cas limite)', () => {
		delete process.env.EXTRACTED_DATA_DIR;
		expect(getExtractedDataDir()).toBe(join(process.cwd(), 'data', 'extracted'));
	});
});

describe('isWithinDirectory', () => {
	it('reconnaît un fichier dans le dossier (cas nominal)', () => {
		expect(isWithinDirectory('/data/sources', '/data/sources/rapport.pdf')).toBe(true);
	});

	it("détecte une traversée de répertoire (cas d'erreur)", () => {
		expect(isWithinDirectory('/data/sources', '/data/sources/../secret.env')).toBe(false);
		expect(isWithinDirectory('/data/sources', '/etc/passwd')).toBe(false);
	});

	it('rejette un dossier au nom simplement préfixé (cas limite)', () => {
		expect(isWithinDirectory('/data/sources', '/data/sources-evil/rapport.pdf')).toBe(false);
	});
});

describe('resolveStoredFilePath', () => {
	beforeEach(() => {
		process.env.DATA_SOURCES_DIR = '/data/sources';
	});

	it('résout un nom de fichier simple (cas nominal)', () => {
		expect(resolveStoredFilePath('rapport-abc123.pdf')).toBe('/data/sources/rapport-abc123.pdf');
	});

	it("lève une erreur sur une tentative de traversée (cas d'erreur)", () => {
		expect(() => resolveStoredFilePath('../../etc/passwd')).toThrow(/invalide/);
	});
});

describe('resolveExtractedFilePath', () => {
	beforeEach(() => {
		process.env.EXTRACTED_DATA_DIR = '/data/extracted';
	});

	it('résout un nom de fichier simple (cas nominal)', () => {
		expect(resolveExtractedFilePath('2024.csv')).toBe('/data/extracted/2024.csv');
	});

	it("lève une erreur sur une tentative de traversée (cas d'erreur)", () => {
		expect(() => resolveExtractedFilePath('../../etc/passwd')).toThrow(/invalide/);
	});
});

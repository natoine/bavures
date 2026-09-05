import { describe, expect, it } from 'vitest';
import {
	buildContentDisposition,
	buildStoredFileName,
	guessMimeType,
	sanitizeFileName
} from './fileNaming';

describe('guessMimeType', () => {
	it('reconnaît une extension connue (cas nominal)', () => {
		expect(guessMimeType('rapport.pdf')).toBe('application/pdf');
		expect(guessMimeType('donnees.CSV')).toBe('text/csv');
	});

	it('retombe sur application/octet-stream sans extension (cas limite)', () => {
		expect(guessMimeType('fichier-sans-extension')).toBe('application/octet-stream');
	});

	it("retombe sur application/octet-stream pour une extension inconnue (cas d'erreur)", () => {
		expect(guessMimeType('archive.rar')).toBe('application/octet-stream');
	});
});

describe('sanitizeFileName', () => {
	it('conserve un nom déjà sûr (cas nominal)', () => {
		expect(sanitizeFileName('rapport-2026.pdf')).toBe('rapport-2026.pdf');
	});

	it('retire le chemin et remplace les caractères dangereux (cas limite)', () => {
		expect(sanitizeFileName('../../etc/passwd')).toBe('passwd');
		expect(sanitizeFileName('rapport final (2026).pdf')).toBe('rapport-final-2026-.pdf');
	});

	it("retombe sur 'fichier' si le nom nettoyé est vide (cas d'erreur)", () => {
		expect(sanitizeFileName('***')).toBe('fichier');
		expect(sanitizeFileName('')).toBe('fichier');
	});
});

describe('buildStoredFileName', () => {
	it("insère le suffixe avant l'extension (cas nominal)", () => {
		expect(buildStoredFileName('rapport.pdf', 'abc123')).toBe('rapport-abc123.pdf');
	});

	it('fonctionne sans extension (cas limite)', () => {
		expect(buildStoredFileName('rapport', 'abc123')).toBe('rapport-abc123');
	});

	it("sanitize le nom d'origine avant d'y accoler le suffixe (cas d'erreur)", () => {
		expect(buildStoredFileName('../../etc/passwd', 'abc123')).toBe('passwd-abc123');
	});
});

describe('buildContentDisposition', () => {
	it('inclut le nom exact en UTF-8 (cas nominal)', () => {
		expect(buildContentDisposition('rapport.pdf')).toBe(
			'attachment; filename="rapport.pdf"; filename*=UTF-8\'\'rapport.pdf'
		);
	});

	it('translittère les accents dans le repli ASCII (cas limite)', () => {
		const result = buildContentDisposition('bilan général été.pdf');
		expect(result).toContain('filename="bilan general ete.pdf"');
		expect(result).toContain("filename*=UTF-8''bilan%20g%C3%A9n%C3%A9ral%20%C3%A9t%C3%A9.pdf");
	});

	it("remplace les caractères non ASCII sans équivalent (cas d'erreur)", () => {
		const result = buildContentDisposition('rapport-警察.pdf');
		expect(result).toContain('filename="rapport-__.pdf"');
	});
});

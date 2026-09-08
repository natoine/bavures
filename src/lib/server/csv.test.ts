import { describe, expect, it } from 'vitest';
import { parseCsv, parseCsvRecords } from './csv';

describe('parseCsv', () => {
	it('parse des lignes simples séparées par virgule (cas nominal)', () => {
		expect(parseCsv('a,b,c\n1,2,3')).toEqual([
			['a', 'b', 'c'],
			['1', '2', '3']
		]);
	});

	it('gère les champs entre guillemets contenant une virgule (cas limite)', () => {
		expect(parseCsv('a,b\n1,"deux, virgules"')).toEqual([
			['a', 'b'],
			['1', 'deux, virgules']
		]);
	});

	it('gère les guillemets doublés comme guillemet littéral (cas limite)', () => {
		expect(parseCsv('a\n"il dit ""bonjour"""')).toEqual([['a'], ['il dit "bonjour"']]);
	});

	it('gère les fins de ligne CRLF (cas nominal)', () => {
		expect(parseCsv('a,b\r\n1,2\r\n')).toEqual([
			['a', 'b'],
			['1', '2']
		]);
	});

	it("retourne un tableau vide pour une chaîne vide (cas d'erreur)", () => {
		expect(parseCsv('')).toEqual([]);
	});
});

describe('parseCsvRecords', () => {
	it("convertit en objets à partir de l'en-tête (cas nominal)", () => {
		expect(parseCsvRecords('metric,valeur\nfoo,42\nbar,7')).toEqual([
			{ metric: 'foo', valeur: '42' },
			{ metric: 'bar', valeur: '7' }
		]);
	});

	it('retire un BOM UTF-8 en tête de fichier (cas limite)', () => {
		expect(parseCsvRecords('﻿metric,valeur\nfoo,42')).toEqual([{ metric: 'foo', valeur: '42' }]);
	});

	it("retourne un tableau vide s'il n'y a que l'en-tête (cas limite)", () => {
		expect(parseCsvRecords('metric,valeur\n')).toEqual([]);
	});

	it("retourne un tableau vide pour un contenu vide (cas d'erreur)", () => {
		expect(parseCsvRecords('')).toEqual([]);
	});
});

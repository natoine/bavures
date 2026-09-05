import { describe, expect, it } from 'vitest';
import { parseAcceptLanguage, resolveLocale } from './locale';

describe('parseAcceptLanguage', () => {
	it('trie par qualité décroissante (cas nominal)', () => {
		expect(parseAcceptLanguage('fr-FR,fr;q=0.9,en;q=0.8')).toEqual(['fr-fr', 'fr', 'en']);
	});

	it("retourne un tableau vide si l'en-tête est absent (cas limite)", () => {
		expect(parseAcceptLanguage(null)).toEqual([]);
		expect(parseAcceptLanguage(undefined)).toEqual([]);
		expect(parseAcceptLanguage('')).toEqual([]);
	});

	it("ignore les qualités invalides sans planter (cas d'erreur)", () => {
		expect(parseAcceptLanguage('fr;q=abc')).toEqual(['fr']);
	});
});

describe('resolveLocale', () => {
	const supported = ['fr', 'en'] as const;

	it('choisit la langue exacte supportée (cas nominal)', () => {
		expect(resolveLocale('fr-FR,en;q=0.5', supported, 'en')).toBe('fr');
	});

	it("retombe sur le fallback si aucune langue demandée n'est supportée (cas limite)", () => {
		expect(resolveLocale('de-DE,it;q=0.5', supported, 'en')).toBe('en');
	});

	it("retombe sur le fallback si l'en-tête est absent (cas d'erreur)", () => {
		expect(resolveLocale(null, supported, 'en')).toBe('en');
	});

	it('reconnaît une langue par sa forme primaire (ex: "en-US" -> "en")', () => {
		expect(resolveLocale('en-US,fr;q=0.8', supported, 'fr')).toBe('en');
	});
});

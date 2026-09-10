import { describe, expect, it } from 'vitest';
import {
	buildTenureBlocks,
	distributeAffiliations,
	extractMonthsFromNote,
	mergeAdjacentSlots,
	normalizeAffiliation,
	orderedDistinctAffiliations,
	parseYearRowIntoSlots,
	type TenureBlock
} from './politicalTimeline';

describe('extractMonthsFromNote', () => {
	it("extrait un mois dans l'ordre du texte (cas nominal)", () => {
		expect(extractMonthsFromNote('changement en mai 1981 (alternance)')).toEqual([5]);
	});

	it('extrait plusieurs mois dans leur ordre d’apparition (cas nominal)', () => {
		expect(extractMonthsFromNote('changements mars et mai 2007')).toEqual([3, 5]);
	});

	it('gère les accents (août) (cas limite)', () => {
		expect(extractMonthsFromNote('changement en août 2000')).toEqual([8]);
	});

	it("retourne un tableau vide sans mois cité (cas d'erreur)", () => {
		expect(extractMonthsFromNote('cohabitation')).toEqual([]);
		expect(extractMonthsFromNote('')).toEqual([]);
	});
});

describe('distributeAffiliations', () => {
	it('donne la même affiliation à tous quand il n’y en a qu’une (cas nominal)', () => {
		expect(distributeAffiliations(3, ['UMP'])).toEqual(['UMP', 'UMP', 'UMP']);
	});

	it('réserve les dernières affiliations aux dernières personnes (cas nominal)', () => {
		// 3 personnes, 2 affiliations : les 2 premières partagent la première
		// affiliation (changement de personne sans changement de parti), la
		// dernière reçoit la seconde.
		expect(distributeAffiliations(3, ['PS', 'LREM'])).toEqual(['PS', 'PS', 'LREM']);
	});

	it('associe un par un quand les décomptes correspondent (cas limite)', () => {
		expect(distributeAffiliations(2, ['PS', 'RPR'])).toEqual(['PS', 'RPR']);
	});

	it("retourne des chaînes vides sans affiliation fournie (cas d'erreur)", () => {
		expect(distributeAffiliations(2, [])).toEqual(['', '']);
	});
});

describe('parseYearRowIntoSlots', () => {
	it('ne découpe pas une ligne à une seule personne (cas nominal)', () => {
		expect(parseYearRowIntoSlots(1978, 'Christian Bonnet', 'Droite (indépendants)', '')).toEqual([
			{ start: 1978, end: 1979, person: 'Christian Bonnet', affiliation: 'Droite (indépendants)' }
		]);
	});

	it('utilise les mois de la note comme points de coupure (cas nominal)', () => {
		const result = parseYearRowIntoSlots(
			1981,
			'Christian Bonnet / Gaston Defferre',
			'Droite puis PS',
			'changement en mai 1981 (alternance)'
		);
		expect(result[0]).toEqual({
			start: 1981,
			end: 1981 + 4 / 12,
			person: 'Christian Bonnet',
			affiliation: 'Droite'
		});
		expect(result[1]).toEqual({
			start: 1981 + 4 / 12,
			end: 1982,
			person: 'Gaston Defferre',
			affiliation: 'PS'
		});
	});

	it('répartit à parts égales si le nombre de mois ne correspond pas au nombre de personnes (cas limite)', () => {
		const result = parseYearRowIntoSlots(2007, 'A / B / C', 'UMP', 'sans mois cité');
		expect(result.map((s) => s.start)).toEqual([2007, 2007 + 1 / 3, 2007 + 2 / 3]);
		expect(result.every((s) => s.affiliation === 'UMP')).toBe(true);
	});
});

describe('mergeAdjacentSlots', () => {
	it('fusionne des créneaux consécutifs de la même personne (cas nominal)', () => {
		const result = mergeAdjacentSlots(
			[
				{ start: 1977, end: 1978, person: 'Bonnet', affiliation: 'Droite (indépendants)' },
				{ start: 1978, end: 1979, person: 'Bonnet', affiliation: 'Droite (indépendants)' },
				{ start: 1979, end: 1979.5, person: 'Bonnet', affiliation: 'Droite' }
			],
			'ministre'
		);
		expect(result).toEqual([
			{
				role: 'ministre',
				person: 'Bonnet',
				affiliation: 'Droite (indépendants)',
				start: 1977,
				end: 1979.5
			}
		]);
	});

	it('ne fusionne pas deux personnes différentes même adjacentes (cas limite)', () => {
		const result = mergeAdjacentSlots(
			[
				{ start: 1977, end: 1978, person: 'A', affiliation: 'X' },
				{ start: 1978, end: 1979, person: 'B', affiliation: 'Y' }
			],
			'ministre'
		);
		expect(result).toHaveLength(2);
	});

	it("ne fusionne pas la même personne séparée par un tiers (cas d'erreur évité)", () => {
		const result = mergeAdjacentSlots(
			[
				{ start: 1986, end: 1988, person: 'Pasqua', affiliation: 'RPR' },
				{ start: 1988, end: 1993, person: 'Joxe', affiliation: 'PS' },
				{ start: 1993, end: 1994, person: 'Pasqua', affiliation: 'RPR' }
			],
			'ministre'
		);
		expect(result).toHaveLength(3);
		expect(result.filter((b) => b.person === 'Pasqua')).toHaveLength(2);
	});
});

describe('normalizeAffiliation', () => {
	it('regroupe RPR et UMP (cas nominal)', () => {
		expect(normalizeAffiliation('RPR')).toBe('Droite (RPR/UMP)');
		expect(normalizeAffiliation('UMP')).toBe('Droite (RPR/UMP)');
		expect(normalizeAffiliation('Droite (RPR puis UMP)')).toBe('Droite (RPR/UMP)');
	});

	it('regroupe LREM et Renaissance (cas nominal)', () => {
		expect(normalizeAffiliation('LREM')).toBe('Centre (LREM/Renaissance)');
		expect(normalizeAffiliation('Centre (LREM/Renaissance)')).toBe('Centre (LREM/Renaissance)');
	});

	it('distingue indépendants de droite et centre-droit (cas limite)', () => {
		expect(normalizeAffiliation('Droite (indépendants)')).toBe('Droite (indépendants)');
		expect(normalizeAffiliation('Centre-droit (indépendants)')).toBe('Centre-droit (indépendants)');
	});

	it("retombe sur 'Autre' pour un texte non reconnu (cas d'erreur)", () => {
		expect(normalizeAffiliation('Sans étiquette')).toBe('Autre');
	});
});

describe('orderedDistinctAffiliations', () => {
	function block(person: string, affiliation: string, start: number): TenureBlock {
		return { role: 'ministre', person, affiliation, start, end: start + 1 };
	}

	it('ordonne par première apparition chronologique, pas par ordre du tableau (cas nominal)', () => {
		const result = orderedDistinctAffiliations([
			block('B', 'PS', 1982),
			block('A', 'Droite (indépendants)', 1977),
			block('C', 'PS', 1985) // même affiliation que B, ne doit pas être ré-ajoutée
		]);
		expect(result).toEqual(['Droite (indépendants)', 'PS']);
	});

	it('retourne un tableau vide sans mandat (cas limite)', () => {
		expect(orderedDistinctAffiliations([])).toEqual([]);
	});
});

describe('buildTenureBlocks', () => {
	const columns = {
		year: 'annee',
		person: 'ministre',
		affiliation: 'affiliation',
		note: 'note'
	};

	it('construit des mandats à partir de lignes annuelles (cas nominal)', () => {
		const result = buildTenureBlocks(
			[
				{ annee: '1977', ministre: 'Bonnet', affiliation: 'Droite (indépendants)', note: '' },
				{ annee: '1978', ministre: 'Bonnet', affiliation: 'Droite (indépendants)', note: '' }
			],
			'ministre',
			columns
		);
		expect(result).toEqual([
			{
				role: 'ministre',
				person: 'Bonnet',
				affiliation: 'Droite (indépendants)',
				start: 1977,
				end: 1979
			}
		]);
	});

	it("ignore une ligne sans année exploitable (cas d'erreur)", () => {
		const result = buildTenureBlocks(
			[{ annee: 'inconnue', ministre: 'Bonnet', affiliation: 'Droite', note: '' }],
			'ministre',
			columns
		);
		expect(result).toEqual([]);
	});

	it('gère une note absente (cas limite)', () => {
		const result = buildTenureBlocks(
			[{ annee: '1977', ministre: 'Bonnet', affiliation: 'Droite' }],
			'ministre',
			{ year: 'annee', person: 'ministre', affiliation: 'affiliation' }
		);
		expect(result).toEqual([
			{ role: 'ministre', person: 'Bonnet', affiliation: 'Droite', start: 1977, end: 1978 }
		]);
	});
});

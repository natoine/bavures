import { describe, expect, it } from 'vitest';
import { buildMetricSeries, sortMetricSeries, type MetricSeries } from './extractedMetrics';

describe('buildMetricSeries', () => {
	it('assemble plusieurs années en une série par métrique, triée par année (cas nominal)', () => {
		const result = buildMetricSeries([
			{
				year: 2020,
				records: [
					{ metric: 'enquetes_judiciaires_ouvertes', libelle: 'Enquêtes', valeur: '1101', note: '' }
				]
			},
			{
				year: 2019,
				records: [
					{ metric: 'enquetes_judiciaires_ouvertes', libelle: 'Enquêtes', valeur: '1460', note: '' }
				]
			}
		]);

		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({
			slug: 'enquetes_judiciaires_ouvertes',
			label: 'Enquêtes',
			points: [
				{ year: 2019, value: 1460, note: '' },
				{ year: 2020, value: 1101, note: '' }
			]
		});
	});

	it('ignore les lignes sans valeur numérique exploitable (cas limite)', () => {
		const result = buildMetricSeries([
			{
				year: 2023,
				records: [
					{ metric: 'effectifs_agents', libelle: 'Effectifs', valeur: '', note: 'non trouvé' },
					{ metric: 'signalements_plateforme', libelle: 'Signalements', valeur: '6664', note: '' }
				]
			}
		]);

		expect(result.map((s) => s.slug)).toEqual(['signalements_plateforme']);
	});

	it("ignore une ligne dont la valeur n'est pas un nombre (cas d'erreur)", () => {
		const result = buildMetricSeries([
			{
				year: 2023,
				records: [
					{ metric: 'effectifs_agents', libelle: 'Effectifs', valeur: 'non-disponible', note: '' }
				]
			}
		]);

		expect(result).toEqual([]);
	});

	it('retourne un tableau vide pour une entrée vide (cas limite)', () => {
		expect(buildMetricSeries([])).toEqual([]);
	});
});

describe('sortMetricSeries', () => {
	function series(slug: string): MetricSeries {
		return { slug, label: slug, points: [] };
	}

	it("respecte l'ordre canonique (cas nominal)", () => {
		const result = sortMetricSeries([
			series('signalements_plateforme'),
			series('enquetes_judiciaires_ouvertes')
		]);
		expect(result.map((s) => s.slug)).toEqual([
			'enquetes_judiciaires_ouvertes',
			'signalements_plateforme'
		]);
	});

	it('place un slug inconnu après les slugs connus, par ordre alphabétique (cas limite)', () => {
		const result = sortMetricSeries([
			series('zzz_inconnu'),
			series('aaa_inconnu'),
			series('effectifs_agents')
		]);
		expect(result.map((s) => s.slug)).toEqual(['effectifs_agents', 'aaa_inconnu', 'zzz_inconnu']);
	});
});

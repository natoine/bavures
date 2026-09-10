import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseCsvRecords } from './csv';
import { getExtractedDataDir } from './dataStorage';

export interface MetricPoint {
	year: number;
	value: number;
	note: string;
}

export interface MetricSeries {
	slug: string;
	label: string;
	points: MetricPoint[];
}

// Ordre d'affichage : suit la table du README de data/extracted/, du plus
// "institutionnel" au plus thématique. Un slug absent de cette liste est
// affiché après, par ordre alphabétique (filet de sécurité).
const METRIC_ORDER = [
	'enquetes_judiciaires_ouvertes',
	'enquetes_judiciaires_cloturees',
	'enquetes_administratives_ouvertes',
	'enquetes_administratives_cloturees',
	'effectifs_agents',
	'signalements_plateforme',
	'consultations_juridiques_annee',
	'formations_nombre_sessions',
	'formations_agents_formes',
	'structures_evaluees',
	'etudes_realisees',
	'missions_accompagnement',
	'fiches_amaris_publiees',
	'deces_mission_police',
	'blesses_mission_police',
	'enquetes_usage_force',
	'enquetes_injures_racistes_discriminatoires',
	'enquetes_corruption_active',
	'enquetes_corruption_passive'
];

function metricRank(slug: string): number {
	const index = METRIC_ORDER.indexOf(slug);
	return index === -1 ? METRIC_ORDER.length : index;
}

/** Trie par ordre d'affichage canonique, puis alphabétique en filet de sécurité. */
export function sortMetricSeries(series: readonly MetricSeries[]): MetricSeries[] {
	return [...series].sort((a, b) => {
		const rankDiff = metricRank(a.slug) - metricRank(b.slug);
		return rankDiff !== 0 ? rankDiff : a.slug.localeCompare(b.slug);
	});
}

/**
 * Assemble les lignes `{ metric, libelle, valeur, note }` de plusieurs CSV
 * annuels (un fichier = une année) en séries temporelles par métrique,
 * triées par année croissante puis par ordre d'affichage canonique.
 *
 * Fonction pure : ne touche pas au disque, pour rester testable simplement.
 */
export function buildMetricSeries(
	yearFiles: readonly { year: number; records: Record<string, string>[] }[]
): MetricSeries[] {
	const bySlug = new Map<string, MetricSeries>();

	for (const { year, records } of yearFiles) {
		for (const record of records) {
			const slug = record.metric?.trim();
			const label = record.libelle?.trim();
			const rawValue = record.valeur?.trim();
			if (!slug || !label || rawValue === undefined || rawValue === '') continue;

			const value = Number(rawValue);
			if (!Number.isFinite(value)) continue;

			const existing = bySlug.get(slug);
			const point: MetricPoint = { year, value, note: record.note?.trim() ?? '' };
			if (existing) {
				existing.points.push(point);
			} else {
				bySlug.set(slug, { slug, label, points: [point] });
			}
		}
	}

	const series = [...bySlug.values()].map((serie) => ({
		...serie,
		points: [...serie.points].sort((a, b) => a.year - b.year)
	}));

	return sortMetricSeries(series);
}

/**
 * Charge et assemble les séries de métriques depuis les CSV annuels de
 * `data/extracted/` (un fichier `<année>.csv` par rapport). Un fichier
 * manquant ou illisible est ignoré plutôt que de faire échouer l'ensemble.
 */
export async function loadExtractedMetricSeries(): Promise<MetricSeries[]> {
	const dir = getExtractedDataDir();

	let entries: string[];
	try {
		entries = await readdir(dir);
	} catch {
		return [];
	}

	const yearFiles: { year: number; records: Record<string, string>[] }[] = [];
	for (const entry of entries) {
		const match = /^(\d{4})\.csv$/.exec(entry);
		if (!match) continue;

		try {
			const content = await readFile(join(dir, entry), 'utf-8');
			yearFiles.push({ year: Number(match[1]), records: parseCsvRecords(content) });
		} catch {
			// Fichier illisible : on l'ignore plutôt que de faire échouer la page.
			continue;
		}
	}

	return buildMetricSeries(yearFiles);
}

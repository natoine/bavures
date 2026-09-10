import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildTenureBlocks, type PoliticalTimeline } from '$lib/politicalTimeline';
import { parseCsvRecords } from './csv';
import { getExtractedDataDir } from './dataStorage';

const TIMELINE_FILE = 'presidents-ministres-interieur.csv';

/**
 * Charge la frise présidents/ministres depuis
 * `data/extracted/presidents-ministres-interieur.csv`. Fichier absent ou
 * illisible : retourne des tableaux vides plutôt que d'échouer. La logique
 * de découpage/fusion, pure, vit dans `$lib/politicalTimeline` (accessible
 * aussi côté client, pour la coloration dans le composant).
 */
export async function loadPoliticalTimeline(): Promise<PoliticalTimeline> {
	const dir = getExtractedDataDir();

	try {
		const content = await readFile(join(dir, TIMELINE_FILE), 'utf-8');
		const records = parseCsvRecords(content);

		return {
			president: buildTenureBlocks(records, 'president', {
				year: 'annee',
				person: 'president',
				affiliation: 'affiliation_president'
			}),
			ministre: buildTenureBlocks(records, 'ministre', {
				year: 'annee',
				person: 'ministre_interieur',
				affiliation: 'affiliation_ministre',
				note: 'changement_ministre_note'
			})
		};
	} catch {
		return { president: [], ministre: [] };
	}
}

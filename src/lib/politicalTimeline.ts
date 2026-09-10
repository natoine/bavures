export type TimelineRole = 'president' | 'ministre';

/** Un mandat continu (fusion des lignes annuelles consécutives d'une même personne). */
export interface TenureBlock {
	role: TimelineRole;
	person: string;
	/** Libellé d'affiliation normalisé, utilisé pour la couleur. */
	affiliation: string;
	/** Année de début, fraction incluse (ex. 1981.33 ≈ mai 1981). */
	start: number;
	/** Année de fin, exclue (même convention). */
	end: number;
}

interface Slot {
	start: number;
	end: number;
	person: string;
	affiliation: string;
}

const FRENCH_MONTHS: Record<string, number> = {
	janvier: 1,
	février: 2,
	fevrier: 2,
	mars: 3,
	avril: 4,
	mai: 5,
	juin: 6,
	juillet: 7,
	août: 8,
	aout: 8,
	septembre: 9,
	octobre: 10,
	novembre: 11,
	décembre: 12,
	decembre: 12
};

/**
 * Extrait, dans l'ordre d'apparition dans le texte, les mois cités dans une
 * note de changement (ex. "changements mars et mai 2007" → [3, 5]).
 */
export function extractMonthsFromNote(note: string): number[] {
	const lower = note.toLowerCase();
	const matches: { month: number; index: number }[] = [];
	for (const [name, month] of Object.entries(FRENCH_MONTHS)) {
		const match = new RegExp(`\\b${name}\\b`, 'u').exec(lower);
		if (match) matches.push({ month, index: match.index });
	}
	return matches.sort((a, b) => a.index - b.index).map((m) => m.month);
}

/**
 * Répartit une liste d'affiliations sur `count` personnes : les premières
 * partagent la première affiliation (aucun changement de parti entre elles,
 * seulement de personne), puis chaque affiliation suivante s'applique à une
 * seule personne — reflète le fait qu'une note "X puis Y" décrit des
 * changements de parti, pas nécessairement un changement par personne.
 */
export function distributeAffiliations(count: number, affiliations: readonly string[]): string[] {
	if (count <= 0) return [];
	if (affiliations.length === 0) return Array(count).fill('');

	const leading = Math.max(count - (affiliations.length - 1), 1);
	const result: string[] = Array(leading).fill(affiliations[0]);
	for (let i = 1; i < affiliations.length && result.length < count; i++) {
		result.push(affiliations[i]);
	}
	while (result.length < count) result.push(affiliations[affiliations.length - 1]);
	return result.slice(0, count);
}

/**
 * Découpe une ligne annuelle (une ou plusieurs personnes séparées par
 * " / ", une ou plusieurs affiliations séparées par " puis ") en créneaux
 * temporels dans l'année. Les mois cités dans la note servent de points de
 * coupure quand leur nombre correspond ; sinon l'année est répartie à parts
 * égales entre les personnes.
 *
 * Fonction pure : aucun accès disque, pour rester testable simplement.
 */
export function parseYearRowIntoSlots(
	year: number,
	personField: string,
	affiliationField: string,
	note: string
): Slot[] {
	const people = personField
		.split('/')
		.map((s) => s.trim())
		.filter(Boolean);
	const affiliations = affiliationField
		.split(' puis ')
		.map((s) => s.trim())
		.filter(Boolean);

	if (people.length <= 1) {
		return [
			{
				start: year,
				end: year + 1,
				person: personField.trim(),
				affiliation: affiliationField.trim()
			}
		];
	}

	const months = extractMonthsFromNote(note);
	const cuts =
		months.length === people.length - 1
			? months.map((m) => (m - 1) / 12)
			: Array.from({ length: people.length - 1 }, (_, i) => (i + 1) / people.length);
	const bounds = [0, ...cuts, 1];

	const perPersonAffiliation = distributeAffiliations(people.length, affiliations);

	return people.map((person, i) => ({
		start: year + bounds[i],
		end: year + bounds[i + 1],
		person,
		affiliation: perPersonAffiliation[i]
	}));
}

/**
 * Fusionne les créneaux consécutifs d'une même personne en mandats continus
 * (l'affiliation retenue est celle du premier créneau du mandat — c'est la
 * plus complète, une note de changement en fin d'année tend à raccourcir le
 * libellé, ex. "Droite" au lieu de "Droite (indépendants)").
 */
export function mergeAdjacentSlots(slots: readonly Slot[], role: TimelineRole): TenureBlock[] {
	const sorted = [...slots].sort((a, b) => a.start - b.start);
	const blocks: TenureBlock[] = [];

	for (const slot of sorted) {
		const last = blocks[blocks.length - 1];
		if (last && last.person === slot.person && Math.abs(last.end - slot.start) < 1e-6) {
			last.end = slot.end;
		} else {
			blocks.push({
				role,
				person: slot.person,
				affiliation: slot.affiliation,
				start: slot.start,
				end: slot.end
			});
		}
	}

	return blocks;
}

/**
 * Construit les mandats continus d'un rôle (président ou ministre) à partir
 * des lignes annuelles du CSV.
 *
 * Fonction pure : ne touche pas au disque, pour rester testable simplement.
 */
export function buildTenureBlocks(
	records: readonly Record<string, string>[],
	role: TimelineRole,
	columns: { year: string; person: string; affiliation: string; note?: string }
): TenureBlock[] {
	const slots: Slot[] = [];

	for (const record of records) {
		const year = Number(record[columns.year]?.trim());
		if (!Number.isFinite(year)) continue;

		const personField = record[columns.person]?.trim();
		const affiliationField = record[columns.affiliation]?.trim();
		if (!personField || !affiliationField) continue;

		const note = (columns.note ? record[columns.note] : undefined)?.trim() ?? '';
		slots.push(...parseYearRowIntoSlots(year, personField, affiliationField, note));
	}

	return mergeAdjacentSlots(slots, role);
}

// Regroupements volontaires : RPR/UMP (même parti rebaptisé en 2002) et
// LREM/Renaissance (même parti rebaptisé en 2022) sous une seule couleur,
// pour rester sous le seuil de ~8 couleurs catégorielles distinctes sans
// perdre de nuance politiquement significative.
const AFFILIATION_RULES: { pattern: RegExp; label: string }[] = [
	{ pattern: /centre-droit/i, label: 'Centre-droit (indépendants)' },
	{ pattern: /indépendants/i, label: 'Droite (indépendants)' },
	{ pattern: /\bLR\b/, label: 'LR' },
	{ pattern: /LREM|Renaissance/i, label: 'Centre (LREM/Renaissance)' },
	{ pattern: /RPR|UMP/i, label: 'Droite (RPR/UMP)' },
	{ pattern: /MDC/i, label: 'MDC' },
	{ pattern: /\bPS\b/, label: 'PS' }
];

/** Normalise une affiliation brute vers un des libellés catégoriels ci-dessus. */
export function normalizeAffiliation(raw: string): string {
	for (const { pattern, label } of AFFILIATION_RULES) {
		if (pattern.test(raw)) return label;
	}
	return 'Autre';
}

/**
 * Liste les affiliations normalisées distinctes, dans l'ordre de leur
 * première apparition chronologique (toutes lignes confondues) — sert à
 * assigner les couleurs catégorielles dans un ordre stable et déterministe
 * plutôt qu'arbitraire.
 */
export function orderedDistinctAffiliations(blocks: readonly TenureBlock[]): string[] {
	const sorted = [...blocks].sort((a, b) => a.start - b.start);
	const seen = new Set<string>();
	const order: string[] = [];

	for (const block of sorted) {
		const label = normalizeAffiliation(block.affiliation);
		if (!seen.has(label)) {
			seen.add(label);
			order.push(label);
		}
	}

	return order;
}

export interface PoliticalTimeline {
	president: TenureBlock[];
	ministre: TenureBlock[];
}

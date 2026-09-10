export interface IgpnReportLink {
	year: number;
	url: string;
	title: string;
	originalFileName: string;
}

// Le site publie les rapports sous des noms légèrement différents d'une
// année à l'autre ("Rapport annuel de l'IGPN - 2024.pdf", "IGPN RA
// 2023.pdf" — abréviation de "Rapport Annuel", ou même "Rapport anuel..."
// en 2020 — faute de frappe d'origine). On matche largement ces variantes
// et on exclut explicitement les documents de conférence de presse /
// présentation qui trainent aussi en PDF sur la même page.
const REPORT_NAME_PATTERN = /rapport\s+ann?uel|igpn\s*ra\b/i;
const EXCLUDE_NAME_PATTERN = /conf[ée]rence|pr[ée]sentation/i;
const YEAR_PATTERN = /(20\d{2})/;
const ANCHOR_TAG_PATTERN = /<a\s+[^>]*>/gi;
// Le HTML servi par web.archive.org (utilisé en repli si le site direct est
// injoignable) réécrit chaque lien en `/web/<timestamp>/<url d'origine>` :
// on doit désenvelopper ce préfixe pour retrouver — et enregistrer — la
// vraie URL du document sur le site de la police nationale.
const WAYBACK_REWRITE_PATTERN = /^\/web\/\d+[a-z_]*\/(https?:\/\/.+)$/i;

function extractAttribute(tag: string, name: string): string | null {
	const match = new RegExp(`\\b${name}="([^"]*)"`, 'i').exec(tag);
	return match ? match[1] : null;
}

function resolveReportUrl(href: string, pageUrl: string): string {
	const waybackMatch = WAYBACK_REWRITE_PATTERN.exec(href);
	if (waybackMatch) return waybackMatch[1];
	return new URL(href, pageUrl).toString();
}

/**
 * Extrait, depuis le HTML de la page IGPN, les liens vers les rapports
 * annuels — en s'appuyant sur l'attribut `download` des liens de
 * téléchargement du site (qui porte le nom "propre" du document, plus
 * fiable à parser que le texte du lien). Un même millésime en double n'est
 * conservé qu'une fois (le premier rencontré).
 */
export function extractIgpnAnnualReportLinks(html: string, pageUrl: string): IgpnReportLink[] {
	const results: IgpnReportLink[] = [];
	const seenYears = new Set<number>();

	for (const tagMatch of html.matchAll(ANCHOR_TAG_PATTERN)) {
		const tag = tagMatch[0];
		const downloadName = extractAttribute(tag, 'download');
		const href = extractAttribute(tag, 'href');
		if (!downloadName || !href) continue;
		if (!/\.pdf$/i.test(downloadName)) continue;
		if (EXCLUDE_NAME_PATTERN.test(downloadName)) continue;
		if (!REPORT_NAME_PATTERN.test(downloadName)) continue;

		const yearMatch = YEAR_PATTERN.exec(downloadName);
		if (!yearMatch) continue;
		const year = Number(yearMatch[1]);
		if (seenYears.has(year)) continue;
		seenYears.add(year);

		let url: string;
		try {
			url = resolveReportUrl(href, pageUrl);
		} catch {
			continue;
		}

		results.push({
			year,
			url,
			title: `Rapport annuel de l'IGPN - ${year}`,
			originalFileName: `Rapport annuel de l'IGPN - ${year}.pdf`
		});
	}

	return results.sort((a, b) => b.year - a.year);
}

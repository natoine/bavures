import { describe, expect, it } from 'vitest';
import { extractIgpnAnnualReportLinks } from './igpnReports';

const PAGE_URL =
	'https://www.police-nationale.interieur.gouv.fr/nous-decouvrir/notre-organisation/organisation/linspection-generale-de-police-nationale-igpn';

// Fixture calquée sur la structure réelle du site (attribut `download`
// portant le nom du fichier, `href` vers le PDF).
const SAMPLE_HTML = `
<div class="documents">
	<a id="link-1" data-fr-assess-file download="Rapport annuel de l'IGPN - 2025.pdf" href="/sites/policenationale/files/2026-10/Rapport%20annuel%20de%20l%27IGPN%20-%202025.pdf" class="fr-link fr-link--download">
		Rapport annuel de l&#039;IGPN - 2025.pdf
	</a>
	<a id="link-2" data-fr-assess-file download="IGPN RA 2023.pdf" href="/sites/policenationale/files/2024-11/IGPN%20RA%202023.pdf" class="fr-link fr-link--download">
		IGPN RA 2023.pdf
	</a>
	<a id="link-3" data-fr-assess-file download="Rapport anuel de l'IGPN - 2020.pdf" href="/sites/policenationale/files/2023-09/Rapport%20anuel%20de%20l%27IGPN%20-%202020.pdf" class="fr-link fr-link--download">
		Rapport anuel de l&#039;IGPN - 2020.pdf
	</a>
	<a id="link-4" data-fr-assess-file download="Conférence de presse IGPN_15-10-2025.pdf" href="/sites/policenationale/files/2025-10/Conf%C3%A9rence.pdf" class="fr-link fr-link--download">
		Conférence de presse IGPN_15-10-2025.pdf
	</a>
	<a id="link-5" data-fr-assess-file download="Présentation - conférence de presse - rapport d'activité 2024 de l'IGPN.pdf" href="/sites/policenationale/files/2025-10/Presentation.pdf" class="fr-link fr-link--download">
		Présentation
	</a>
	<a id="link-6" class="fr-link">Lien sans attribut download ni pertinent</a>
</div>
`;

describe('extractIgpnAnnualReportLinks', () => {
	it('extrait les rapports annuels, du plus récent au plus ancien (cas nominal)', () => {
		const results = extractIgpnAnnualReportLinks(SAMPLE_HTML, PAGE_URL);

		expect(results.map((r) => r.year)).toEqual([2025, 2023, 2020]);
		expect(results[0]).toEqual({
			year: 2025,
			url: 'https://www.police-nationale.interieur.gouv.fr/sites/policenationale/files/2026-10/Rapport%20annuel%20de%20l%27IGPN%20-%202025.pdf',
			title: "Rapport annuel de l'IGPN - 2025",
			originalFileName: "Rapport annuel de l'IGPN - 2025.pdf"
		});
	});

	it('normalise le titre malgré une faute de frappe ou un nom différent dans la source (cas limite)', () => {
		const results = extractIgpnAnnualReportLinks(SAMPLE_HTML, PAGE_URL);
		const year2020 = results.find((r) => r.year === 2020);
		const year2023 = results.find((r) => r.year === 2023);

		expect(year2020?.title).toBe("Rapport annuel de l'IGPN - 2020");
		expect(year2023?.title).toBe("Rapport annuel de l'IGPN - 2023");
	});

	it("exclut les documents de conférence de presse / présentation et les liens sans année exploitable (cas d'erreur)", () => {
		const results = extractIgpnAnnualReportLinks(SAMPLE_HTML, PAGE_URL);

		expect(results.some((r) => r.originalFileName.includes('Conférence'))).toBe(false);
		expect(results.some((r) => r.originalFileName.includes('Présentation'))).toBe(false);
		expect(results).toHaveLength(3);
	});

	it('retourne un tableau vide si aucun lien ne correspond (cas limite)', () => {
		expect(extractIgpnAnnualReportLinks('<p>Rien ici</p>', PAGE_URL)).toEqual([]);
	});

	it("désenveloppe l'URL d'origine quand le HTML vient d'une capture Wayback Machine (cas d'erreur évité)", () => {
		const waybackHtml = `
			<a download="Rapport annuel de l'IGPN - 2024.pdf"
			   href="/web/20260209071135/https://www.police-nationale.interieur.gouv.fr/sites/policenationale/files/2025-10/Rapport%20annuel%20de%20l%27IGPN%20-%202024.pdf">
				Rapport annuel de l'IGPN - 2024.pdf
			</a>
		`;

		const results = extractIgpnAnnualReportLinks(waybackHtml, PAGE_URL);

		expect(results).toHaveLength(1);
		expect(results[0].url).toBe(
			'https://www.police-nationale.interieur.gouv.fr/sites/policenationale/files/2025-10/Rapport%20annuel%20de%20l%27IGPN%20-%202024.pdf'
		);
	});
});

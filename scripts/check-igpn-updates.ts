#!/usr/bin/env -S npx tsx
/**
 * Vérifie si un nouveau rapport annuel de l'IGPN est disponible sur le site
 * de la police nationale et l'ajoute automatiquement si c'est le cas
 * (téléchargement + copie dans le dossier de stockage + entrée MongoDB).
 *
 * Pensé pour être lancé périodiquement (voir crontab : tous les 3 mois).
 * Usage manuel : npm run data:check-igpn
 */
import { writeFile, rm, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { addDataSourceFromFile } from '../src/lib/server/addDataSource';
import { DATA_SOURCES_COLLECTION } from '../src/lib/server/dataSources';
import { getMongoClientPromise, getMongoDbName } from '../src/lib/server/db';
import { extractIgpnAnnualReportLinks } from '../src/lib/server/igpnReports';

const IGPN_PAGE_URL =
	'https://www.police-nationale.interieur.gouv.fr/nous-decouvrir/notre-organisation/organisation/linspection-generale-de-police-nationale-igpn';
const USER_AGENT =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

function log(message: string) {
	console.log(`[${new Date().toISOString()}] ${message}`);
}

async function fetchText(url: string): Promise<string> {
	const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
	if (!response.ok) throw new Error(`HTTP ${response.status} pour ${url}`);
	return response.text();
}

/**
 * Récupère le HTML de la page IGPN. Certains réseaux (dont, historiquement,
 * l'environnement d'exécution de Claude Code) se font bloquer par le
 * pare-feu du site (Cloudflare) : on retombe alors sur la dernière capture
 * Wayback Machine, qui contient la même liste de documents.
 */
async function fetchIgpnPageHtml(): Promise<string> {
	try {
		return await fetchText(IGPN_PAGE_URL);
	} catch (directError) {
		log(
			`Accès direct à la page IGPN impossible (${(directError as Error).message}), tentative via web.archive.org…`
		);
		const availability = JSON.parse(
			await fetchText(
				`https://archive.org/wayback/available?url=${encodeURIComponent(IGPN_PAGE_URL)}`
			)
		) as { archived_snapshots?: { closest?: { url?: string } } };
		const snapshotUrl = availability.archived_snapshots?.closest?.url;
		if (!snapshotUrl) {
			throw new Error('Aucune archive Wayback Machine disponible pour la page IGPN', {
				cause: directError
			});
		}
		return fetchText(snapshotUrl);
	}
}

async function downloadToTempFile(url: string): Promise<string> {
	const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
	if (!response.ok) throw new Error(`HTTP ${response.status} pour ${url}`);
	const dir = await mkdtemp(join(tmpdir(), 'bavures-igpn-'));
	const filePath = join(dir, 'rapport.pdf');
	await writeFile(filePath, Buffer.from(await response.arrayBuffer()));
	return filePath;
}

async function main() {
	const html = await fetchIgpnPageHtml();
	// On résout les URLs relatives par rapport à la page d'origine (jamais
	// par rapport à une éventuelle URL Wayback), pour toujours enregistrer
	// la vraie source d'origine en base.
	const reports = extractIgpnAnnualReportLinks(html, IGPN_PAGE_URL);

	if (reports.length === 0) {
		log(
			'Aucun rapport annuel détecté sur la page — la structure du site a peut-être changé, à vérifier manuellement.'
		);
		process.exitCode = 1;
		return;
	}

	const client = await getMongoClientPromise();
	try {
		const db = client.db(getMongoDbName());
		const collection = db.collection(DATA_SOURCES_COLLECTION);
		const existingTitles = new Set(
			(await collection.find({}, { projection: { title: 1 } }).toArray()).map((doc) => doc.title)
		);

		const newReports = reports.filter((report) => !existingTitles.has(report.title));
		if (newReports.length === 0) {
			log(`Aucun nouveau rapport IGPN (${reports.length} déjà en base).`);
			return;
		}

		for (const report of newReports) {
			log(`Nouveau rapport détecté : ${report.title} (${report.url})`);
			const filePath = await downloadToTempFile(report.url);
			try {
				const result = await addDataSourceFromFile({
					title: report.title,
					sourceUrl: report.url,
					filePath,
					downloadedAt: new Date(),
					originalName: report.originalFileName,
					description: `Rapport annuel de l'Inspection générale de la police nationale, exercice ${report.year}.`
				});
				log(`  ✔ Ajouté (document Mongo ${result.insertedId})`);
			} finally {
				await rm(join(filePath, '..'), { recursive: true, force: true });
			}
		}
	} finally {
		await client.close();
	}
}

main().catch((error: unknown) => {
	console.error('✘ Vérification IGPN échouée :', error instanceof Error ? error.message : error);
	process.exitCode = 1;
});

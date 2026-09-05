import { listDataSources } from '$lib/server/dataSources';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		const dataSources = await listDataSources();
		return { dataSources, loadError: false };
	} catch (error) {
		// Une base indisponible ne doit pas casser la page publique : on
		// journalise côté serveur et on affiche un état d'erreur discret.
		console.error('Impossible de charger les sources de données :', error);
		return { dataSources: [], loadError: true };
	}
};

import { loadExtractedMetricSeries } from '$lib/server/extractedMetrics';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		const metricSeries = await loadExtractedMetricSeries();
		return { metricSeries, loadError: false };
	} catch (error) {
		console.error('Impossible de charger les données extraites :', error);
		return { metricSeries: [], loadError: true };
	}
};

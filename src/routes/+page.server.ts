import { loadExtractedMetricSeries } from '$lib/server/extractedMetrics';
import { loadPoliticalTimeline } from '$lib/server/politicalTimeline';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		const [metricSeries, politicalTimeline] = await Promise.all([
			loadExtractedMetricSeries(),
			loadPoliticalTimeline()
		]);
		return { metricSeries, politicalTimeline, loadError: false };
	} catch (error) {
		console.error('Impossible de charger les données extraites :', error);
		return {
			metricSeries: [],
			politicalTimeline: { president: [], ministre: [] },
			loadError: true
		};
	}
};

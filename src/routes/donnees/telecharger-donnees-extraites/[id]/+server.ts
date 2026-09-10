import { error } from '@sveltejs/kit';
import { getDataSourceById } from '$lib/server/dataSources';
import { resolveExtractedFilePath } from '$lib/server/dataStorage';
import { streamFileResponse } from '$lib/server/fileResponse';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const dataSource = await getDataSourceById(params.id);
	if (!dataSource?.extractedDataFileName) {
		error(404, 'Données extraites introuvables pour cette source');
	}

	const filePath = resolveExtractedFilePath(dataSource.extractedDataFileName);
	return streamFileResponse(filePath, 'text/csv; charset=utf-8', dataSource.extractedDataFileName);
};

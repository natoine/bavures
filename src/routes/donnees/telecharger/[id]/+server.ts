import { error } from '@sveltejs/kit';
import { getDataSourceById } from '$lib/server/dataSources';
import { resolveStoredFilePath } from '$lib/server/dataStorage';
import { streamFileResponse } from '$lib/server/fileResponse';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const dataSource = await getDataSourceById(params.id);
	if (!dataSource) {
		error(404, 'Source de données introuvable');
	}

	const filePath = resolveStoredFilePath(dataSource.fileName);
	return streamFileResponse(filePath, dataSource.mimeType, dataSource.originalFileName);
};

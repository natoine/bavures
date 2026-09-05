import { error } from '@sveltejs/kit';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { getDataSourceById } from '$lib/server/dataSources';
import { resolveStoredFilePath } from '$lib/server/dataStorage';
import { buildContentDisposition } from '$lib/server/fileNaming';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const dataSource = await getDataSourceById(params.id);
	if (!dataSource) {
		error(404, 'Source de données introuvable');
	}

	const filePath = resolveStoredFilePath(dataSource.fileName);

	let fileStat;
	try {
		fileStat = await stat(filePath);
	} catch {
		error(404, 'Fichier introuvable sur le serveur');
	}

	const stream = createReadStream(filePath);
	const body = new ReadableStream({
		start(controller) {
			stream.on('data', (chunk) => controller.enqueue(chunk));
			stream.on('end', () => controller.close());
			stream.on('error', (err) => controller.error(err));
		},
		cancel() {
			stream.destroy();
		}
	});

	return new Response(body, {
		headers: {
			'Content-Type': dataSource.mimeType,
			'Content-Length': String(fileStat.size),
			'Content-Disposition': buildContentDisposition(dataSource.originalFileName),
			'Cache-Control': 'public, max-age=3600'
		}
	});
};

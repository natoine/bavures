import { error } from '@sveltejs/kit';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { buildContentDisposition } from './fileNaming';

/**
 * Construit une `Response` de téléchargement pour un fichier local, en
 * streamant son contenu. Lève une 404 SvelteKit si le fichier est
 * introuvable sur le disque (ex: entrée en base sans fichier correspondant).
 */
export async function streamFileResponse(
	filePath: string,
	mimeType: string,
	downloadName: string
): Promise<Response> {
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
			'Content-Type': mimeType,
			'Content-Length': String(fileStat.size),
			'Content-Disposition': buildContentDisposition(downloadName),
			'Cache-Control': 'public, max-age=3600'
		}
	});
}

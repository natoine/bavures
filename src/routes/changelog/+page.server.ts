import { readFile } from 'node:fs/promises';
import { marked } from 'marked';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const raw = await readFile('CHANGELOG.md', 'utf-8');
	const html = await marked.parse(raw);
	return { html };
};

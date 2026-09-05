import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { FALLBACK_LOCALE, SUPPORTED_LOCALES, initI18n } from '$lib/i18n';
import { resolveLocale } from '$lib/utils/locale';

// Résout la langue depuis l'en-tête `Accept-Language` du navigateur, l'expose
// via `event.locals.locale` et initialise svelte-i18n pour le rendu SSR.
const handleLocale: Handle = async ({ event, resolve }) => {
	const locale = resolveLocale(
		event.request.headers.get('accept-language'),
		SUPPORTED_LOCALES,
		FALLBACK_LOCALE
	);
	event.locals.locale = locale;
	initI18n(locale);

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', locale)
	});
};

// En-têtes de sécurité HTTP appliqués à toutes les réponses.
const handleSecurityHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
	if (event.url.protocol === 'https:') {
		response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
	}
	return response;
};

export const handle = sequence(handleLocale, handleSecurityHeaders);

import { init, register } from 'svelte-i18n';

export const SUPPORTED_LOCALES = ['fr', 'en'] as const;
export const FALLBACK_LOCALE = 'en';

register('fr', () => import('./fr.json'));
register('en', () => import('./en.json'));

let initialized = false;

/**
 * Initialise svelte-i18n avec la locale résolue (côté serveur depuis
 * `Accept-Language`, côté client avec la même valeur reçue du serveur afin
 * d'éviter tout écart d'hydratation).
 */
export function initI18n(locale: string) {
	initialized = true;
	init({ fallbackLocale: FALLBACK_LOCALE, initialLocale: locale });
}

export function isI18nInitialized() {
	return initialized;
}

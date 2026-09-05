import { browser } from '$app/environment';
import { initI18n, isI18nInitialized } from '$lib/i18n';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data }) => {
	// Sur le client, la locale a déjà été initialisée pendant le SSR ; on ne
	// ré-initialise que lors d'une navigation qui recharge le layout côté
	// client uniquement (ex: retour en arrière après un changement de langue).
	if (!browser || !isI18nInitialized()) {
		initI18n(data.locale);
	}
	return data;
};

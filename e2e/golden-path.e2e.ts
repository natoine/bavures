import { expect, test } from '@playwright/test';

test('parcours nominal : accueil puis navigation vers le changelog', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h1')).toBeVisible();

	await page.getByRole('link', { name: /changelog/i }).click();
	await expect(page).toHaveURL(/\/changelog$/);
	await expect(page.locator('h1')).toBeVisible();
});

test('la page respecte un viewport mobile', async ({ page }) => {
	await page.setViewportSize({ width: 375, height: 667 });
	await page.goto('/');
	await expect(page.locator('h1')).toBeVisible();
});

test("accueil : les graphiques de données de l'IGPN s'affichent", async ({ page }) => {
	await page.goto('/');

	const notice = page.locator('.charts-section .notice');
	const charts = page.locator('.charts-section .chart');

	// Selon la disponibilité des CSV extraits, la section affiche soit des
	// graphiques, soit un état vide/erreur géré — jamais une page cassée.
	await expect(notice.or(charts.first())).toBeVisible();

	if ((await charts.count()) === 0) return;

	await expect(charts.first().locator('svg')).toBeVisible();

	// Le tableau de repli (accessibilité) s'ouvre et porte les mêmes valeurs.
	await charts.first().locator('summary').click();
	await expect(charts.first().locator('table tbody tr').first()).toBeVisible();
});

test('footer : navigation vers la page AARRI', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('contentinfo').getByRole('link', { name: /aarri/i }).click();
	await expect(page).toHaveURL(/\/aarri$/);
	await expect(page.getByRole('heading', { name: 'AARRI' })).toBeVisible();
	await expect(page.getByRole('table')).toHaveCount(2);
});

test('footer : navigation vers la page Nos données', async ({ page }) => {
	await page.goto('/');
	await page
		.getByRole('contentinfo')
		.getByRole('link', { name: /données|data/i })
		.click();
	await expect(page).toHaveURL(/\/donnees$/);
	await expect(page.locator('h1')).toBeVisible();
	// La page doit s'afficher proprement dans tous les cas : liste de
	// sources si des données existent, sinon état vide/erreur géré (jamais
	// une page 500) — selon que MongoDB est disponible et peuplé ou non.
	await expect(page.locator('.data-list, .notice').first()).toBeVisible();
});

test('Nos données : le lien de données extraites (si présent) télécharge un CSV', async ({
	page,
	request
}) => {
	await page.goto('/donnees');

	const extractedLink = page
		.getByRole('link', { name: /données extraites|extracted from/i })
		.first();
	if ((await extractedLink.count()) === 0) {
		// Aucune source n'a de données extraites dans cet environnement
		// (base vide ou non peuplée) : rien de plus à vérifier ici.
		return;
	}

	const href = await extractedLink.getAttribute('href');
	expect(href).toBeTruthy();

	const response = await request.get(href!);
	expect(response.status()).toBe(200);
	expect(response.headers()['content-type']).toContain('text/csv');
});

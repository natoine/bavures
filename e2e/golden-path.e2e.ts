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

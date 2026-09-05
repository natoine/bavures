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

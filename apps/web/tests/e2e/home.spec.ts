import { expect, test } from '@playwright/test';

test('homepage renders all sections', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByText('REALIZACJE', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('PROCES', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('AKTUALNIE', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('KONTAKT', { exact: true }).first()).toBeVisible();
});

test('navigation to /realizacje works', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /realizacje/i }).first().click();
  await expect(page).toHaveURL(/\/realizacje/);
  await expect(page.getByRole('heading', { name: /Wszystkie projekty/i })).toBeVisible();
});

test('mobile menu toggles', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile only');
  await page.goto('/');
  await page.getByLabel('Otwórz menu').click();
  await expect(page.getByRole('link', { name: 'KONTAKT →' })).toBeVisible();
});

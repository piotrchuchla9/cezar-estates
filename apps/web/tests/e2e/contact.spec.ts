import { expect, test } from '@playwright/test';

test('contact form rejects invalid input', async ({ page }) => {
  await page.goto('/kontakt');
  await page.getByRole('button', { name: /WYŚLIJ/i }).click();
  await expect(page.getByPlaceholder('Imię i nazwisko')).toBeFocused();
});

test('contact form structure renders', async ({ page }) => {
  await page.goto('/kontakt');
  await expect(page.getByPlaceholder('Imię i nazwisko')).toBeVisible();
  await expect(page.getByPlaceholder('Email')).toBeVisible();
  await expect(page.getByPlaceholder('Wiadomość')).toBeVisible();
  await expect(page.getByText(/Wyrażam zgodę/)).toBeVisible();
});

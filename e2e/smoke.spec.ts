/**
 * Şartname §21.1, §18.1, §18.4-8, §18.5 — açılış duman testi.
 *
 * Doğrulananlar:
 * - Sayfa 200 döner ve uygulama kabuğu (`#app`) çizilir.
 * - CSP meta'sı §17'deki sıkı dizedir (`connect-src 'none'` dahil).
 * - §14.5 alt bilgisi her sayfada bulunur (İ5).
 * - Köken dışı hiçbir istek yapılmaz (§18.5, İ2).
 */
import { expect, test } from '@playwright/test';
import { openApp } from './support/app.ts';
import { guardExternalRequests } from './support/guards.ts';

test('ana sayfa açılır, CSP taşır, alt bilgi görünür ve dış istek yoktur', async ({ page }) => {
  const guard = guardExternalRequests(page);

  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await openApp(page);

  const cspMeta = page.locator('meta[http-equiv="Content-Security-Policy"]');
  await expect(cspMeta).toHaveCount(1);
  const policy = await cspMeta.getAttribute('content');
  expect(policy).toContain("default-src 'self'");
  expect(policy).toContain("connect-src 'none'");
  expect(policy).toContain("base-uri 'none'");
  expect(policy).toContain("form-action 'none'");

  await expect(page.locator('#app')).not.toBeEmpty();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // §14.5 / §18.4-8: alt bilgi her sayfada.
  const footerText = page
    .locator('footer')
    .getByText('Bağımsız bir açık kaynak projesidir; resmî bir kurum uygulaması değildir.');
  await expect(footerText).toBeVisible();

  guard.expectNoExternalRequests();
});

test('bilinmeyen yol kullanıcıyı NotFound sayfasına götürür (§11.1)', async ({ page }) => {
  const guard = guardExternalRequests(page);
  await openApp(page, '/#/boyle-bir-sayfa-yok');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ana sayfaya dön' })).toBeVisible();
  guard.expectNoExternalRequests();
});

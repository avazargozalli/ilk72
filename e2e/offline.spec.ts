/**
 * Şartname §18.4-3, §16 — çevrimdışı çalışma.
 *
 * Uygulama bir kez açıldıktan sonra hizmet çalışanı bütün kabuğu ön belleğe
 * alır; ağ kapalıyken yeniden yüklendiğinde uygulama ve acil ekranı çalışmaya
 * devam etmelidir. Çalışma zamanı önbelleği yoktur (§16) ve dış istek
 * yapılmaz (§18.5).
 */
import { expect, test } from '@playwright/test';
import { openApp } from './support/app.ts';
import { guardExternalRequests } from './support/guards.ts';

test('çevrimdışıyken uygulama, ana sayfa görselleri ve acil ekranı çalışır', async ({
  page,
  context,
  baseURL,
}) => {
  const guard = guardExternalRequests(page, baseURL);

  await openApp(page);

  // Hizmet çalışanı etkinleşene kadar bekle (§16). İlk ziyarette sayfa henüz
  // denetlenmediği için bir kez çevrimiçi yeniden yükleyip denetimi bekleriz.
  await page.waitForFunction(
    async () => {
      const registration = await navigator.serviceWorker?.getRegistration();
      return registration?.active != null;
    },
    undefined,
    { timeout: 30_000 },
  );
  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker?.controller));

  await context.setOffline(true);
  await page.reload();
  for (const imageName of ['aile-planlama.webp', 'afet-cantasi.webp']) {
    const homePhoto = page.locator(`main img[src$="gorseller/${imageName}"]`);
    await homePhoto.scrollIntoViewIfNeeded();
    await expect
      .poll(() => homePhoto.evaluate((image: HTMLImageElement) => image.naturalWidth))
      .toBeGreaterThan(0);
  }

  await page.goto('/#/acil');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole('link', { name: /112/ }).first()).toBeVisible();

  await context.setOffline(false);
  guard.expectNoExternalRequests();
});

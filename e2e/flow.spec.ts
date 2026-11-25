/**
 * Şartname §18.4-1, §18.4-2 — uçtan uca ana akış.
 *
 * İlk açılış kutusu → sihirbazın dokuz adımı → özet → yazdırma önizlemesi.
 * Ardından sayfa yenilenir ve verinin durduğu doğrulanır (otomatik kayıt).
 */
import { expect, test } from '@playwright/test';
import { openApp } from './support/app.ts';
import { guardExternalRequests } from './support/guards.ts';

test('ilk açılış → 9 adım → özet → yazdırma, yenilemeden sonra veri durur', async ({ page }) => {
  const guard = guardExternalRequests(page);

  await openApp(page);

  await page.getByRole('button', { name: 'Planı hazırlamaya başla' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Haneniz' })).toBeVisible();

  // 1. Haneniz
  const householdLabel = page.getByLabel('Hane etiketi');
  await householdLabel.fill('Yılmaz ailesi');
  await page.getByLabel('Adres').fill('Cumhuriyet Mahallesi 12/4, İzmir');
  await expect(householdLabel).toHaveValue('Yılmaz ailesi');
  await page.getByRole('button', { name: 'İleri' }).click();

  // 2. Kişiler (zorunlu alan: en az bir ad)
  await expect(page.getByRole('heading', { level: 1, name: 'Kişiler' })).toBeVisible();
  await page.getByLabel('Ad').first().fill('Ayşe Yılmaz');
  await page.getByRole('button', { name: 'İleri' }).click();

  // 3–8: adımlar "Sonra doldururum" ile geçilir (9. adımda bu düğme bitirir,
  // bu yüzden listede yok).
  const stepTitles = [
    'Özel ihtiyaçlar',
    'Acil kişiler',
    'Buluşma yerleri',
    'Eviniz',
    'Görevler',
    'Çanta ve belgeler',
  ];
  for (const title of stepTitles) {
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
    await page.getByRole('button', { name: 'Sonra doldururum' }).click();
  }

  // 9. adımdayız: bitir → özet.
  await expect(page.getByRole('heading', { level: 1, name: 'Gözden geçirme' })).toBeVisible();
  await expect(page.getByText('Kaydedildi', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Planı bitir' }).click();
  await expect(page).toHaveURL(/#\/ozet$/);
  await expect(page.getByText('Yılmaz ailesi', { exact: true })).toBeVisible();

  // §18.4-2 — doğrulanmış kayıttan sonra yenile, veri duruyor.
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('Yılmaz ailesi').first()).toHaveCount(1, { timeout: 15_000 });

  // §18.4-1 — yazdırma önizlemesi açılır ve belge türleri listelenir.
  await openApp(page, '/#/yazdir');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('checkbox').first()).toBeVisible();

  guard.expectNoExternalRequests();
});

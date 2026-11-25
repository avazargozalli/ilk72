/**
 * Şartname §18.4-1, §18.4-2 — uçtan uca ana akış.
 *
 * İlk açılış kutusu → sihirbazın dokuz adımı → özet → yazdırma önizlemesi.
 * Ardından sayfa yenilenir ve verinin durduğu doğrulanır (otomatik kayıt).
 */
import { expect, test } from '@playwright/test';
import {
  createEmptyContact,
  createEmptyHealth,
  createEmptyMember,
  createEmptyPlan,
} from '../src/model/defaults.ts';
import { PLAN_LIMITS } from '../src/model/validate.ts';
import { exportBackup } from '../src/storage/backup.ts';
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

test('dar ekranda acil kişiler ve baskıda kartların tüm satırları görünür', async ({
  page,
  browserName,
}) => {
  const guard = guardExternalRequests(page);
  const plan = createEmptyPlan();
  const longName = (label: string) => label.padEnd(PLAN_LIMITS.nameLength, 'W');
  const phone = '+90(555)123 00 00'.padEnd(PLAN_LIMITS.phoneMaxLength, '9');
  const backupPhone = '+90(555)111 00 00'.padEnd(PLAN_LIMITS.phoneMaxLength, '8');
  const longDetail = 'Mahalle parkı ana girişi '.padEnd(PLAN_LIMITS.shortTextLength, 'W');
  plan.household.label = longName('Örnek Hane ');
  plan.notes = 'Örnek not '.padEnd(PLAN_LIMITS.longTextLength, 'W');
  plan.healthOptIn = true;
  plan.members = [
    {
      ...createEmptyMember(),
      name: longName('Örnek Veli Bir '),
      phone,
      health: { ...createEmptyHealth(), bloodType: 'AB+' },
    },
    { ...createEmptyMember(), name: longName('Örnek Veli İki '), phone: backupPhone },
    {
      ...createEmptyMember('cocuk'),
      name: longName('Örnek Çocuk '),
      dailyPlaces: [{ kind: 'okul', label: longName('Örnek Okul '), phone: '', note: '' }],
    },
  ];
  plan.contacts = Array.from({ length: 10 }, (_, index) => ({
    ...createEmptyContact(),
    name: longName(`Örnek Acil Kişi ${index + 1} `),
    phone,
    phoneAlt: backupPhone,
    outOfArea: index === 0,
    city: index === 0 ? 'Ankara' : '',
    canPickUpChildren: true,
  }));
  const meeting = {
    label: longName('Örnek buluşma yeri '),
    detail: longDetail,
  };
  plan.meeting = { ...plan.meeting, nearHome: meeting, neighborhood: meeting, outOfArea: meeting };
  const backup = await exportBackup(plan);

  await page.setViewportSize({ width: 320, height: 640 });
  await openApp(page, '/#/ayarlar');
  await page.getByRole('checkbox', { name: 'Büyük yazı' }).check();
  await page.getByLabel('Yedek dosyasını seç').setInputFiles({
    name: backup.filename,
    mimeType: 'application/json',
    buffer: Buffer.from(backup.text),
  });
  await page.getByRole('button', { name: 'Üzerine yaz ve içe aktar' }).click();
  await expect(page.getByText('Yedek içe aktarıldı.')).toBeVisible();

  await page.getByRole('link', { name: 'Acil durum', exact: true }).press('Enter');
  await expect(page.getByRole('heading', { level: 1, name: 'Acil durum' })).toBeFocused();
  // macOS WebKit varsayılan olarak bağlantıları Option-Tab ile dolaşır.
  await page.keyboard.press(
    browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab',
  );
  await expect(page.locator('main a[href="tel:112"]')).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);

  await openApp(page, '/#/yazdir');
  await page.getByRole('checkbox', { name: 'Okul adını çocuk kartına ekle' }).check();
  await page.getByRole('checkbox', { name: 'Cüzdan kartına kan grubunu bas' }).check();
  await page.getByRole('checkbox', { name: 'Cüzdan kartına tek satır not bas' }).check();
  await page.getByRole('checkbox', { name: 'Cüzdan kartına plan özeti kare kodu bas' }).check();
  await expect(page.locator('.wallet-card__qr').first()).toBeVisible();
  await expect(page.locator('.child-card').last()).toContainText('Örnek Acil Kişi 10');

  // A4 kâğıdın 12 mm kenar boşluklarından sonra kalan genişliği.
  const contentWidth = Math.floor(((210 - 24) * 96) / 25.4);
  await page.setViewportSize({ width: contentWidth, height: 1024 });
  await page.emulateMedia({ media: 'print' });
  const metrics = await page.locator('.wallet-card, .child-card').evaluateAll((cards) =>
    cards.map((card) => {
      const { width, height } = card.getBoundingClientRect();
      return {
        width,
        height,
        kind: card.className,
        overflow: card.scrollHeight - card.clientHeight,
        horizontalOverflow: card.scrollWidth - card.clientWidth,
      };
    }),
  );
  expect(metrics).toHaveLength(9);
  for (const card of metrics) {
    expect(card.width).toBeCloseTo((85.6 * 96) / 25.4, 1);
    expect(card.height).toBeCloseTo((54 * 96) / 25.4, 1);
    expect(card.overflow, card.kind).toBeLessThanOrEqual(1);
    expect(card.horizontalOverflow, card.kind).toBeLessThanOrEqual(1);
  }
  await expect(page.locator('.wallet-card--back').first()).toContainText(phone);
  await expect(page.locator('.wallet-card--back').first()).toContainText(backupPhone);
  await expect(page.locator('.child-card').last()).toContainText(phone);
  const phoneFits = await page
    .locator('.print-card__number')
    .evaluateAll((numbers) => numbers.every((number) => number.scrollWidth <= number.clientWidth));
  expect(phoneFits).toBe(true);
  await expect(page.locator('.print-doc--full')).toContainText(longDetail);
  await expect(page.locator('.print-doc--fridge')).toContainText(longDetail);
  const fridgeFontSize = await page
    .locator('.print-doc--fridge')
    .evaluate((sheet) => Number.parseFloat(getComputedStyle(sheet).fontSize));
  expect(fridgeFontSize).toBeCloseTo((16 * 96) / 72, 3);
  expect(await page.locator('.print__preview').evaluate((preview) => preview.scrollWidth)).toBe(
    contentWidth,
  );
  guard.expectNoExternalRequests();
});

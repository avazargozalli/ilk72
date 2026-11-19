/**
 * Şartname §18.4-9 — XSS denemesi.
 *
 * Kullanıcı verisi DOM'a yalnızca Preact'in metin düğümleriyle girer;
 * `dangerouslySetInnerHTML` yasaktır (§17). Ad alanına zararlı yük yazıldığında
 * her ekranda **düz metin** görünmeli ve hiçbir iletişim kutusu açılmamalıdır.
 */
import { expect, test } from '@playwright/test';
import { openApp } from './support/app.ts';
import { guardExternalRequests } from './support/guards.ts';

const PAYLOADS = ['<img src=x onerror=alert(1)>', '"><script>alert(1)</script>'];

test('kişi adına yazılan HTML düz metin olarak görünür, betik çalışmaz', async ({ page }) => {
  const guard = guardExternalRequests(page);
  const dialogs: string[] = [];
  page.on('dialog', async (dialog) => {
    dialogs.push(dialog.message());
    await dialog.dismiss();
  });

  await openApp(page, '/#/plan/2');

  const nameInput = page.getByLabel('Ad').first();
  await nameInput.fill(PAYLOADS[0] ?? '');
  await nameInput.blur();
  await expect(nameInput).toHaveValue(PAYLOADS[0] ?? '');

  // Zararlı yükten doğan <img>/<script> düğümü oluşmamalı.
  expect(await page.locator('main img').count()).toBe(0);
  expect(await page.locator('main script').count()).toBe(0);

  await openApp(page, '/#/ozet');
  expect(await page.locator('main script').count()).toBe(0);
  expect(await page.locator('main img').count()).toBe(0);

  expect(dialogs, `Beklenmeyen iletişim kutusu: ${dialogs.join(', ')}`).toEqual([]);
  guard.expectNoExternalRequests();
});

test('ikinci yük (<script>) yazdırma önizlemesinde de zararsızdır', async ({ page }) => {
  const guard = guardExternalRequests(page);
  const dialogs: string[] = [];
  page.on('dialog', async (dialog) => {
    dialogs.push(dialog.message());
    await dialog.dismiss();
  });

  await openApp(page, '/#/plan/1');
  const labelInput = page.getByLabel('Hane etiketi').first();
  await labelInput.fill(PAYLOADS[1] ?? '');
  await labelInput.blur();

  await openApp(page, '/#/yazdir');
  expect(await page.locator('main script').count()).toBe(0);
  expect(dialogs).toEqual([]);
  guard.expectNoExternalRequests();
});

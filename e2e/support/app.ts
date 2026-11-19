/**
 * Şartname §11.2, §18.4 — uçtan uca testler için açılış yardımcısı.
 *
 * Uygulama kabuğu açılışta depoyu **asenkron** hazırlar; ilk çizimde yalnızca
 * "Yükleniyor…" görünür. Bu yüzden her test sayfayı açtıktan sonra ya ilk
 * açılış kutusunu ya da sayfa başlığını beklemeli ve ilk açılış kutusunu
 * kapatmalıdır. Bu yardımcı o iki adımı tek yerde toplar; testler tekrar
 * etmez.
 */
import type { Page } from '@playwright/test';

/** Kabuğun açılmasını bekler ve ilk açılış bilgilendirmesini kapatır (§11.2). */
export async function openApp(page: Page, path = '/'): Promise<void> {
  await page.goto(path);

  await page.waitForFunction(
    () => {
      const notice = document.querySelector('.first-run');
      const heading = document.querySelector('main h1');
      return Boolean(notice ?? heading);
    },
    undefined,
    { timeout: 15_000 },
  );

  const accept = page.getByRole('button', { name: 'Anladım, başla' });
  if ((await accept.count()) > 0) {
    await accept.first().click();
    await accept
      .first()
      .waitFor({ state: 'detached', timeout: 5_000 })
      .catch(() => undefined);
  }
}

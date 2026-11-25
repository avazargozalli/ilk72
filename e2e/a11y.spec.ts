/**
 * Şartname §18.7, §15 — WCAG 2.2 AA denetimi.
 *
 * Her sayfa ve her sihirbaz adımı `@axe-core/playwright` ile taranır; AA
 * etiketli kurallarda **sıfır ihlal** beklenir.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openApp } from './support/app.ts';
import { guardExternalRequests } from './support/guards.ts';

const PAGES = [
  '/#/',
  '/#/rehber',
  '/#/boyle-bir-yol-yok',
  '/#/gizlilik',
  '/#/kosullar',
  '/#/kunye',
  '/#/erisilebilirlik',
  '/#/kaynaklar',
  '/#/hakkinda',
  '/#/acil',
  '/#/canta',
];

function summarize(violations: { id: string; nodes: unknown[]; help: string }[]): string {
  return violations
    .map((violation) => `${violation.id}: ${violation.nodes.length} düğüm — ${violation.help}`)
    .join('\n');
}

test.describe('erişilebilirlik (WCAG 2.2 AA)', () => {
  for (const path of PAGES) {
    test(`axe ihlali yok: ${path}`, async ({ page }) => {
      const guard = guardExternalRequests(page);
      await openApp(page, path);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();

      expect(results.violations, summarize(results.violations)).toEqual([]);
      guard.expectNoExternalRequests();
    });
  }

  for (let step = 1; step <= 9; step += 1) {
    test(`axe ihlali yok: sihirbaz adımı ${step}`, async ({ page }) => {
      const guard = guardExternalRequests(page);
      await openApp(page, `/#/plan/${step}`);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();

      expect(results.violations, summarize(results.violations)).toEqual([]);
      guard.expectNoExternalRequests();
    });
  }

  test('gizlilik bildirimi 320 px genişlikte büyük yazıyla taşmıyor', async ({ page }) => {
    const guard = guardExternalRequests(page);
    await page.setViewportSize({ width: 320, height: 640 });
    await openApp(page, '/#/ayarlar');
    await page.getByRole('checkbox', { name: 'Büyük yazı' }).check();
    await page.getByRole('link', { name: 'Gizlilik', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Gizlilik Bildirimi' })).toBeVisible();
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
    guard.expectNoExternalRequests();
  });

  test('ana sayfa 320 px, büyük yazı ve koyu temada kullanılabilir', async ({ page, baseURL }) => {
    const guard = guardExternalRequests(page, baseURL);
    await page.setViewportSize({ width: 320, height: 640 });
    await page.emulateMedia({ colorScheme: 'dark' });
    await openApp(page, '/#/ayarlar');
    await page.getByRole('checkbox', { name: 'Büyük yazı' }).check();
    await page.goto('/#/');
    await expect(page.locator('html')).toHaveAttribute('data-large-text', 'true');

    const actions = [
      page.getByRole('button', { name: 'Planı hazırlamaya başla', exact: true }),
      page.getByRole('link', { name: 'Boş formu yazdır', exact: true }),
    ];
    for (const action of actions) {
      await expect(action).toBeVisible();
      const target = await action.boundingBox();
      expect(target?.width).toBeGreaterThanOrEqual(44);
      expect(target?.height).toBeGreaterThanOrEqual(44);
    }

    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations, summarize(results.violations)).toEqual([]);
    guard.expectNoExternalRequests();
  });
});

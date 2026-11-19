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
      await openApp(page, `/#/plan/${step}`);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();

      expect(results.violations, summarize(results.violations)).toEqual([]);
    });
  }
});

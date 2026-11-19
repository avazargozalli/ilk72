/**
 * Şartname §18.5 — dış istek muhafızı.
 *
 * Uygulama kendi kökeni dışına **hiçbir** ağ isteği yapmamalıdır (İ2). Bu
 * yardımcı, sayfadaki her HTTP(S) isteğini dinler ve köken dışı bir istek
 * görüldüğünde listeye yazar; testler sonunda liste boş değilse düşer.
 *
 * Kullanım:
 * ```ts
 * const guard = guardExternalRequests(page);
 * await page.goto('/');
 * await guard.expectNoExternalRequests();
 * ```
 */
import { expect, type Page } from '@playwright/test';

export interface ExternalRequestGuard {
  /** Şimdiye kadar görülen köken dışı istek adresleri. */
  readonly violations: readonly string[];
  /** Köken dışı istek yoksa geçer, varsa testi düşürür (§18.5). */
  expectNoExternalRequests: () => void;
}

export function guardExternalRequests(
  page: Page,
  origin = 'http://127.0.0.1:4173',
): ExternalRequestGuard {
  const violations: string[] = [];

  page.on('request', (request) => {
    const url = request.url();
    if (!url.startsWith('http://') && !url.startsWith('https://')) return;
    if (new URL(url).origin !== origin) violations.push(url);
  });

  return {
    violations,
    expectNoExternalRequests: () => {
      expect(violations, `Köken dışı istek(ler): ${violations.join(', ')}`).toEqual([]);
    },
  };
}

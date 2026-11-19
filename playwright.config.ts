/**
 * Şartname §18.1, §18.5 — uçtan uca testler.
 *
 * **Ortam notu (docs/kararlar.md K-16):** Playwright tarayıcı ikililerini
 * indirmek bu geliştirme ortamında mümkün değil (indirme alt süreci sandbox
 * tarafından engelleniyor). Bu yüzden varsayılan olarak **sistemde kurulu**
 * Chrome ve Edge (`channel`) kullanılır; indirme gerekmez. Firefox ve WebKit
 * projeleri yalnızca `ILK72_E2E_ALL_BROWSERS=1` iken eklenir ve o ortamda
 * `pnpm exec playwright install` önceden çalıştırılmış olmalıdır.
 *
 * Önizleme sunucusu doğrudan Vite ile başlatılır: `pnpm`/`npm` çağrısı
 * gerektirmez, depo içindeki bağımlılıkla çalışır (K-1, K-2).
 */
import { defineConfig, devices } from '@playwright/test';

const allBrowsers = process.env.ILK72_E2E_ALL_BROWSERS === '1';
const BASE_URL = 'http://127.0.0.1:4173';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  webServer: {
    command:
      'node ./node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4173 --strictPort',
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    { name: 'edge', use: { ...devices['Desktop Edge'], channel: 'msedge' } },
    {
      name: 'mobile',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        viewport: { width: 360, height: 640 },
        isMobile: true,
        hasTouch: true,
      },
    },
    ...(allBrowsers
      ? [
          { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
          { name: 'webkit', use: { ...devices['Desktop Safari'] } },
        ]
      : []),
  ],
});

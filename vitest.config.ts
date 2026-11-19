/**
 * Şartname §18 — Vitest birim ve bileşen testleri.
 *
 * Kapsam eşikleri (satır/dal %90) tanımlıdır ve `autoUpdate: false` ile
 * kendiliğinden düşmez. Ölçülen katmanlar §18.1'de adı geçenlerdir
 * (`model`, `storage`, `share`, `output`, `content`) + paylaşılan bayt
 * katmanı `src/lib`. Arayüz katmanı §18.1'de sayılmadığı için eşiğe dahil
 * değildir; erişilebilirliği `@axe-core/playwright` (e2e) denetler.
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      // `vite-plugin-pwa` tarafından üretilen sanal modül; birim testlerinde
      // gerçek hizmet çalışanı yok, bu yüzden sahte karşılığı kullanılır.
      'virtual:pwa-register': new URL('./test/mocks/pwa-register.ts', import.meta.url).pathname,
    },
  },
  test: {
    // Bu ortamda `forks` havuzu alt süreç açamıyor (EPERM); iş parçacığı
    // havuzu aynı izolasyonu süreç açmadan sağlar. Tarayıcı davranışı
    // happy-dom'da aynı kalır.
    pool: 'threads',
    environment: 'happy-dom',
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.{test,spec}.{ts,tsx}'],
    server: {
      // `nodeLinker: hoisted` (K-11) tek Preact kopyası sağlıyor; bu satır
      // yine de RTL'i Vite'tan geçirerek ikinci bir kopya olasılığını kapatır.
      deps: { inline: ['@testing-library/preact'] },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      include: [
        'src/lib/**',
        'src/model/**',
        'src/storage/**',
        'src/share/**',
        'src/output/**',
        'src/content/**',
      ],
      // Barrel dosyaları (`src/*/index.ts`) yalnızca yeniden dışa aktarım yapar;
      // çalıştırılabilir satır taşımadıkları için v8 onları %0 sayar ve
      // eşiği yanlış yönde düşürür (K-15).
      exclude: ['src/**/index.ts'],
      thresholds: {
        lines: 90,
        branches: 90,
        autoUpdate: false,
      },
    },
  },
});

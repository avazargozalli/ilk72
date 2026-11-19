/**
 * İlk 72 — içerik kapısı (Şartname §7, §13.4, §18.6).
 *
 * Doğrudan Node'un tip sıyırmasıyla çalışır: `node scripts/content-gate.ts`.
 * Bu yüzden içe aktarmalar `.ts` uzantılıdır ve yalnızca tip sıyırmayla uyumlu
 * sözdizimi kullanılır (`import type`).
 *
 * - `content:check` (geliştirme): hata yoksa 0; uyarılar yazılır, süreç 0 kalır.
 * - `content:check -- --prod` / `build:prod`: `taslak` madde varsa **1**.
 *
 * K-8 kararı gereği geçici stub kaldırıldı; gerçek denetim `src/content/check.ts`.
 */
import { runContentCheck } from '../src/content/check.ts';

const prod = process.argv.includes('--prod');
const modeLabel = prod ? 'üretim' : 'geliştirme';

const { errors, warnings } = runContentCheck({ prod });

for (const warning of warnings) {
  const where = warning.itemId === undefined ? '' : ` · ${warning.itemId}`;
  console.warn(`[içerik] Uyarı (${warning.code}${where}): ${warning.detail}`);
}

for (const error of errors) {
  const where = error.itemId === undefined ? '' : ` · ${error.itemId}`;
  console.error(`[içerik] Hata (${error.code}${where}): ${error.detail}`);
}

if (errors.length > 0) {
  console.error(
    `[içerik] ${modeLabel} denetimi başarısız: ${errors.length} hata, ${warnings.length} uyarı.`,
  );
  process.exitCode = 1;
} else {
  console.info(`[içerik] ${modeLabel} denetimi tamamlandı: hata yok, ${warnings.length} uyarı.`);
}

/**
 * Şartname §10.2, §18.3 — kare kod üretimi (`qrcode-generator`).
 *
 * **Neden SVG metni değil, matris?** §17 satır içi HTML kullanımını
 * yasaklar. `qrcode-generator` hazır SVG dizesi (`createSvgTag`) üretir ama
 * bunu Preact ağacına aktarmanın tek yolu HTML enjeksiyonu olurdu. Bu yüzden bu
 * modül SVG üretmez; kare kodun **modül matrisini** ve Preact'in güvenle
 * çizebileceği türetilmiş geometriyi döndürür:
 *
 * - `modules`: `true` = koyu modül; `modules[satır][sütun]`.
 * - `size`: kenardaki modül sayısı (boşluk hariç).
 * - `margin`: çevre boşluğu, modül cinsinden **4** (§10.2).
 * - `viewSize`: `size + 2 * margin`; SVG `viewBox="0 0 viewSize viewSize"`.
 * - `path`: `d` özniteliğine **doğrudan** verilebilecek, çevre boşluğu dahil
 *   edilmiş dikdörtgenlerden oluşan yol verisi. Yalnızca `M/h/v/H/z`, rakam ve
 *   boşluk içerir; kullanıcı verisi içermez, enjeksiyona kapalıdır. Tek bir
 *   `path` kullanmak 320 px'lik ekranlarda binlerce `<rect>` düğümü yerine tek
 *   düğüm çizer (İ10).
 *
 * Arayüz bileşeni şunu çizer (örnek):
 *
 * ```tsx
 * <svg viewBox={`0 0 ${qr.viewSize} ${qr.viewSize}`} role="img" aria-label={tr.share.qr.label}>
 *   <rect width={qr.viewSize} height={qr.viewSize} fill="#fff" />
 *   <path d={qr.path} fill="#000" />
 * </svg>
 * ```
 *
 * Hata düzeltme düzeyi `L`, sürüm otomatiktir (§10.2). `SHARE_MAX_URL` (1200)
 * aşılırsa kare kod **üretilmez**, `null` döner.
 */
import qrcode from 'qrcode-generator';
import { SHARE_MAX_URL } from '../config.ts';

/** §10.2 — hata düzeltme düzeyi. */
export const QR_ERROR_CORRECTION_LEVEL = 'L';

/** §10.2 — çevrede bırakılacak boşluk (modül). */
export const QR_MARGIN_MODULES = 4;

/**
 * `qrcode-generator` tek baytlık tablo kullanır (`charCodeAt & 0xff`); çok
 * baytlı metin sessizce bozulur. Yük her zaman base64url + bağlantı önekidir
 * (ASCII); yine de bozuk girdi kare koda dönüşmesin diye denetlenir.
 */
const PRINTABLE_ASCII = /^[\x20-\x7e]+$/;

/** Kare kod çizimi için gerekli bütün geometri. */
export interface ShareQr {
  /** Kare koda gömülen metin (bağlantı ya da yük). */
  data: string;
  /** Kenardaki modül sayısı. */
  size: number;
  /** Çevre boşluğu (modül). */
  margin: number;
  /** `size + 2 * margin`; SVG `viewBox` kenarı. */
  viewSize: number;
  /** `modules[satır][sütun]`; `true` = koyu. */
  modules: boolean[][];
  /** SVG `path` `d` özniteliği (boşluk dahil, güvenli karakterler). */
  path: string;
}

/**
 * §10.2 — kare kodu üretir. `payloadOrUrl` bir paylaşım yükü (`1p.…`) ya da
 * tam bağlantı olabilir; uzunluk `SHARE_MAX_URL` ile ölçülür.
 *
 * @returns Geometri; girdi boşsa, ASCII dışıysa, `SHARE_MAX_URL` aşılırsa ya da
 * kütüphane kodlayamazsa `null` (kare kod gösterilmez, §10.2 iletisi çıkar).
 */
export function buildShareQr(payloadOrUrl: string): ShareQr | null {
  if (!PRINTABLE_ASCII.test(payloadOrUrl)) return null;
  if (payloadOrUrl.length > SHARE_MAX_URL) return null;

  let code: ReturnType<typeof qrcode>;
  try {
    code = qrcode(0, QR_ERROR_CORRECTION_LEVEL);
    code.addData(payloadOrUrl);
    code.make();
  } catch {
    return null;
  }

  const size = code.getModuleCount();
  const modules: boolean[][] = [];
  let path = '';

  for (let row = 0; row < size; row += 1) {
    const line: boolean[] = [];
    let runStart = -1;
    for (let column = 0; column < size; column += 1) {
      const dark = code.isDark(row, column);
      line.push(dark);
      if (dark) {
        if (runStart < 0) runStart = column;
        if (column === size - 1) {
          path += rectangle(runStart, row, column - runStart + 1);
          runStart = -1;
        }
      } else if (runStart >= 0) {
        path += rectangle(runStart, row, column - runStart);
        runStart = -1;
      }
    }
    modules.push(line);
  }

  return {
    data: payloadOrUrl,
    size,
    margin: QR_MARGIN_MODULES,
    viewSize: size + 2 * QR_MARGIN_MODULES,
    modules,
    path,
  };
}

/** Bir modül satırındaki koyu komşu diziyi tek dikdörtgen olarak yazar. */
function rectangle(column: number, row: number, width: number): string {
  const x = column + QR_MARGIN_MODULES;
  const y = row + QR_MARGIN_MODULES;
  return `M${x} ${y}h${width}v1H${x}z`;
}

/**
 * Şartname §15 (dil) — i18n metinleri için küçük biçimlendirme yardımcıları.
 *
 * Sayaç, konum ve tarih içeren metinler tek tek yazılmaz; şablon + yer tutucu
 * kullanılır (`{count}`, `{index}`, `{date}` …). Böylece arayüz bileşenlerine
 * sabit metin gömülmez ve metinler tek yerden çevrilebilir kalır.
 */

/** Şablonlarda doldurulacak değerler. */
export type TextParams = Readonly<Record<string, string | number>>;

const PLACEHOLDER = /\{(\w+)\}/g;

/** `'{count} hata var'` + `{ count: 2 }` → `'2 hata var'`. Bilinmeyen yer tutucu korunur. */
export function formatText(template: string, params: TextParams = {}): string {
  return template.replace(PLACEHOLDER, (placeholder: string, key: string): string => {
    const value = params[key];
    return value === undefined ? placeholder : String(value);
  });
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * `YYYY-AA-GG` tarihini Türkçe kısa biçime çevirir (`19.11.2026`).
 * Saat dilimi kaydırması olmaması için `Date` kullanılmaz. Tanınmayan metin
 * olduğu gibi döner.
 */
export function formatDate(isoDate: string): string {
  const match = ISO_DATE.exec(isoDate);
  if (!match) return isoDate;
  const [, year, month, day] = match;
  if (!year || !month || !day) return isoDate;
  return `${day}.${month}.${year}`;
}

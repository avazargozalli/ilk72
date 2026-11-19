/**
 * Şartname §8.3 — doğrulama ve temizleme uyarıları.
 *
 * `sanitizePlan` kullanıcıya gösterilecek metni **taşımaz**: yalnızca makine
 * kodu ve alan yolu üretir, sonuç `"<kod>:<yol>"` biçiminde tek dizedir
 * (ör. `"sinir-asildi:members[0].name"`). Kullanıcıya görünen Türkçe metin
 * `src/i18n/tr.ts` içinde durur (§0 kural 7); bu dosya metin satmaz.
 *
 * `WARNING_TEXT_TR` arayüz metni değil, kodların Türkçe karşılıklarını
 * belgeleyen başvuru tablosudur: i18n katmanı kodu buradan çözüp kendi
 * metnini gösterebilir, ama ekrana basılacak metnin tek kaynağı `tr.ts`'tir.
 *
 * Yol biçimi: nesne alanları noktayla (`meeting.nearHome.label`), dizi
 * öğeleri köşeli parantezle (`members[0].name`) yazılır. Sağlık bilgileri
 * topluca silindiğinde yol `members[].health` (bütün üyeler) olur.
 */

export type PlanWarning =
  | 'bilinmeyen-alan'
  | 'gecersiz-deger'
  | 'sinir-asildi'
  | 'bilinmeyen-kisi'
  | 'saglik-silindi';

/** Bütün uyarı kodları; i18n katmanı bu listeyi dolaşarak metin eşler. */
export const PLAN_WARNINGS: readonly PlanWarning[] = [
  'bilinmeyen-alan',
  'gecersiz-deger',
  'sinir-asildi',
  'bilinmeyen-kisi',
  'saglik-silindi',
];

/** Kodların Türkçe karşılıkları (başvuru tablosu; arayüz metni `tr.ts`'te). */
export const WARNING_TEXT_TR: Record<PlanWarning, string> = {
  'bilinmeyen-alan': 'Tanınmayan alan atıldı.',
  'gecersiz-deger': 'Değer geçersizdi; varsayılan kullanıldı.',
  'sinir-asildi': 'Değer sınırı aştığı için kısaltıldı.',
  'bilinmeyen-kisi': 'Görev, planda bulunmayan bir kişiye atanmıştı; atama kaldırıldı.',
  'saglik-silindi': 'Sağlık bilgileri, sağlık izni kapalı olduğu için silindi.',
};

/** Uyarının çözülmüş hâli. */
export interface PlanWarningDetail {
  code: PlanWarning;
  path: string;
}

const SEPARATOR = ':';

/** Dize gerçekten tanımlı bir uyarı kodu mu? */
export function isPlanWarning(value: string): value is PlanWarning {
  return (PLAN_WARNINGS as readonly string[]).includes(value);
}

/** `{ code, path }` çiftini `sanitizePlan`'ın döndürdüğü tek dizeye çevirir. */
export function formatWarning(detail: PlanWarningDetail): string {
  return `${detail.code}${SEPARATOR}${detail.path}`;
}

/** `"<kod>:<yol>"` dizesini çözer; kod tanınmıyorsa ya da biçim bozuksa `null`. */
export function parseWarning(warning: string): PlanWarningDetail | null {
  const separator = warning.indexOf(SEPARATOR);
  if (separator <= 0) return null;
  const code = warning.slice(0, separator);
  if (!isPlanWarning(code)) return null;
  return { code, path: warning.slice(separator + 1) };
}

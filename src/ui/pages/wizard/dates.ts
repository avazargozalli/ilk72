/**
 * Şartname §11.5/5, §11.5/9, §8.2 — tarih yardımcıları.
 *
 * - `todayIso`: yerel günün `YYYY-AA-GG` karşılığı (plan alanları bu biçimdedir).
 * - `addMonthsIso`: ay eklerken ay sonu taşmasını hedef ayın son gününe indirger
 *   (31 Ağustos + 6 ay = 28/29 Şubat). Saat dilimi kaydırması olmaması için
 *   hesaplama UTC üzerinden yapılır ve `Date` yalnızca takvim aritmetiğinde
 *   kullanılır.
 * - `isIsoDateString`: §8.2'deki ISO tarih denetimi; `sanitizePlan` ile aynı
 *   kuralları (takvimsel geçerlilik) uygular.
 * - `defaultReviewDate`: §11.5/9'daki varsayılan — bugünden altı ay sonrası.
 */
/** §11.5/9 — bir sonraki gözden geçirme aralığı (ay). */
export const REVIEW_INTERVAL_MONTHS = 6;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

const pad = (value: number): string => String(value).padStart(2, '0');

/** Yerel günü `YYYY-AA-GG` biçiminde döndürür. */
export function todayIso(now: Date = new Date()): string {
  return `${String(now.getFullYear())}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** ISO tarihi takvim bileşenlerine ayırır; biçim uymuyorsa `null`. */
function parseIsoDate(value: string): { year: number; month: number; day: number } | null {
  const match = ISO_DATE.exec(value);
  if (match === null) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

/** §8.2 — ISO tarih (takvimsel olarak da geçerli) mi? */
export function isIsoDateString(value: string): boolean {
  const parts = parseIsoDate(value);
  if (parts === null) return false;
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  return (
    date.getUTCFullYear() === parts.year &&
    date.getUTCMonth() === parts.month - 1 &&
    date.getUTCDate() === parts.day
  );
}

/** `YYYY-AA-GG` tarihine ay ekler; ay sonu taşmasını hedef ayın sonuna indirger. */
export function addMonthsIso(isoDate: string, months: number): string {
  const parts = parseIsoDate(isoDate);
  if (parts === null) return isoDate;
  const firstOfTarget = new Date(Date.UTC(parts.year, parts.month - 1 + months, 1));
  const targetYear = firstOfTarget.getUTCFullYear();
  const targetMonth = firstOfTarget.getUTCMonth();
  const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  const day = Math.min(parts.day, lastDay);
  return `${String(targetYear)}-${pad(targetMonth + 1)}-${pad(day)}`;
}

/** §11.5/9 — varsayılan gözden geçirme tarihi: bugünden altı ay sonrası. */
export function defaultReviewDate(now: Date = new Date()): string {
  return addMonthsIso(todayIso(now), REVIEW_INTERVAL_MONTHS);
}

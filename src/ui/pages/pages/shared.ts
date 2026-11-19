/**
 * Şartname §11.3, §11.7, §11.9, §17 — sayfaların ortak yardımcıları.
 *
 * Saf işlevler: depo okumaz, ağ isteği yapmaz, DOM'a dokunmaz. Yalnızca
 * `Home`, `Summary`, `Emergency`, `Guide` ve `Bag` sayfalarının tekrar ettiği
 * küçük hesapları toplar:
 *
 * - `isFilled`: boşluk kırpıldıktan sonra boş olmayan metin.
 * - `uniqueFilledValues`: boş olmayan değerleri tekilleştirir (liste
 *   anahtarlarında yinelenen metin sorun çıkarmasın diye).
 * - `toTelHref`: kullanıcı telefonundan **güvenli** `tel:` bağlantısı üretir
 *   (§17: `tel:` yalnızca doğrulanmış değerlerle). Beklenmeyen karakter varsa
 *   bağlantı üretilmez; sayfa numarayı düz metin olarak gösterir.
 * - `dateOnly` / `isReviewOverdue`: §11.3'teki "son gözden geçirme + altı ay"
 *   hatırlatmasının tarih hesabı. Takvim aritmetiği UTC üzerinden yapılır;
 *   böylece saat dilimi kaydırması sonucu değiştirmez.
 */
import type { Plan } from '../../../model/types.ts';

/** Boşlukları kırpıldığında boş olmayan metin mi? */
export function isFilled(value: string | null | undefined): boolean {
  return (value ?? '').trim() !== '';
}

/** Boş olmayan değerleri ilk görülme sırasıyla tekilleştirir. */
export function uniqueFilledValues(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (trimmed === '' || seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
  }
  return result;
}

/** §17 — `tel:` bağlantısı için izinli biçim: isteğe bağlı `+`, en az 3 rakam. */
const TEL_COMPACT = /^\+?[0-9]{3,}$/u;

/**
 * Telefon numarasından `tel:` bağlantısı üretir; güvenli değilse `null`.
 *
 * Boşluk, parantez, nokta ve tire yaygın yazım biçimidir; bunlar atılır. Geriye
 * yalnızca rakam ve baştaki `+` kalıyorsa bağlantı kurulur. Başka herhangi bir
 * karakter (ör. içe aktarılmış bozuk veri) bağlantıyı **engeller**.
 */
export function toTelHref(phone: string): string | null {
  const compact = phone.replace(/[\s().-]/gu, '');
  return TEL_COMPACT.test(compact) ? `tel:${compact}` : null;
}

/** ISO tarih ya da zaman damgasının ilk 10 karakteri (`YYYY-AA-GG`). */
export function dateOnly(value: string): string {
  return value.length >= 10 ? value.slice(0, 10) : value;
}

const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/u;
const DAY_MS = 86_400_000;
/** §11.5/9 — altı aya karşılık gelen gün sayısı (Ay ortalaması, 182 gün). */
export const REVIEW_INTERVAL_DAYS = 182;

/** `YYYY-AA-GG` tarihini UTC gece yarısına çevirir; geçersizse `null`. */
function isoDayToUtc(value: string): number | null {
  const match = ISO_DAY.exec(dateOnly(value));
  if (match === null) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  const time = Date.UTC(year, month - 1, day);
  return Number.isNaN(time) ? null : time;
}

function todayUtc(now: Date): number {
  return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * §11.3 — gözden geçirme hatırlatması gerekli mi?
 *
 * - `nextReviewAt` yazılmışsa planın altı aylık döngüsü o tarihte dolar; tarih
 *   geçtiyse hatırlatma gösterilir.
 * - `nextReviewAt` boşsa `lastDrillAt` üzerinden altı ay hesaplanır.
 * - İkisi de boşsa hatırlatma yoktur (plan hiç gözden geçirilmemiş sayılmaz;
 *   sayfa bunun yerine "tarih yazılmadı" metnini gösterir).
 */
export function isReviewOverdue(plan: Plan, now: Date = new Date()): boolean {
  const today = todayUtc(now);

  const nextReviewAt = plan.review.nextReviewAt;
  if (nextReviewAt !== null) {
    const next = isoDayToUtc(nextReviewAt);
    return next !== null && today >= next;
  }

  const lastDrillAt = plan.review.lastDrillAt;
  if (lastDrillAt !== null) {
    const last = isoDayToUtc(lastDrillAt);
    return last !== null && today - last > REVIEW_INTERVAL_DAYS * DAY_MS;
  }

  return false;
}

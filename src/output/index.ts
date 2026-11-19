/**
 * Şartname §12 — çıktı katmanının tek giriş noktası.
 *
 * Şu an tek çıktı türü takvim dosyasıdır: `buildIcs` (Ek A) ve indirme için
 * gereken dosya adı/içerik türü. Yazdırma belgeleri `src/ui/print/**` içinde
 * Preact bileşenleridir ve bu katmandan bağımsızdır (§12).
 *
 * Kullanım (UI):
 *
 * ```ts
 * const ics = buildIcs({
 *   uid: reviewIcsUid(plan.id),
 *   date: plan.review.nextReviewAt,      // YYYY-MM-DD
 *   stamp: icsStamp(new Date()),
 *   summary: tr.share.calendar.summary,
 *   description: tr.share.calendar.description,
 *   url: APP_ORIGIN,
 * });
 * ```
 */

export type { IcsEvent } from './ics.ts';
export {
  buildIcs,
  foldIcsLine,
  ICS_CONTENT_TYPE,
  ICS_CONTINUATION_OCTETS,
  ICS_FILE_NAME,
  ICS_LINE_OCTETS,
  icsEscape,
  icsStamp,
  reviewIcsUid,
} from './ics.ts';

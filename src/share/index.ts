/**
 * Şartname §10 — paylaşım katmanının tek giriş noktası.
 *
 * Akış (§10.1–§10.3, `docs/mimari.md` §3.5–3.6):
 *
 * ```ts
 * // Gönderen
 * const card = buildShareCard(plan, { includeNeedsNotes, includeHealth: false });
 * const payload = await encodeShare(card, passphrase);        // '1p.' | '1e.'
 * const url = buildShareUrl(payload);                          // <kök>#/al/<yük>
 * const qr = buildShareQr(url);                                // null → kare kod yok
 *
 * // Alan
 * const data = await decodeShare(payload, passphrase);         // doğrulanmamış
 * const card = validateCard(data);                             // bozuk-veri
 * ```
 *
 * Notlar:
 * - `decodeShare` şema doğrulaması **yapmaz**; her zaman arkasından
 *   `validateCard` çağrılmalıdır (§10.1, §8.3).
 * - Kare kod satır içi HTML kullanılmadan çizilir: `buildShareQr` SVG
 *   metni değil modül matrisi ve `path` verisi döndürür (bkz. `qr.ts`).
 */

export type {
  ShareCard,
  ShareCardOptions,
  ShareContact,
  ShareMeeting,
  SharePerson,
} from './card.ts';
export {
  buildShareCard,
  CARD_VERSION,
  SHARE_CARD_LIMITS,
  validateCard,
} from './card.ts';
export {
  buildShareUrl,
  decodeShare,
  encodeShare,
  SHARE_IMPORT_PREFIX,
  SHARE_PAYLOAD_MAX_LENGTH,
  SHARE_PAYLOAD_PATTERN,
} from './codec.ts';
export type { ShareQr } from './qr.ts';
export {
  buildShareQr,
  QR_ERROR_CORRECTION_LEVEL,
  QR_MARGIN_MODULES,
} from './qr.ts';

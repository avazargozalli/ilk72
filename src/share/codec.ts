/**
 * Şartname §10.2, §17, Ek A — paylaşım yükü kodlaması.
 *
 * Biçim **normatiftir** (Ek A):
 *
 * ```
 * <sürüm><kip>.<base64url>     sürüm = 1, kip: p = düz, e = parolalı
 * düz     : deflate-raw(utf8(JSON(ShareCard)))
 * parolalı: encryptBytes(deflate-raw(utf8(JSON(ShareCard))), parola)
 * ```
 *
 * - Yük bağlantıda `#` sonrasında taşınır; tarayıcı o parçayı sunucuya
 *   **göndermez** (§10.2, §4.1 satır 4).
 * - `decodeShare` yalnızca **çözer**; şema doğrulaması çağıranın işidir
 *   (`validateCard`, §10.1). Bu ayrım Ek A'da açıkça istenir.
 * - Sıkıştırma bombasına karşı açılan JSON boyutu `SHARE_MAX_JSON` (16384) ile
 *   sınırlanır (§17); aşım `cok-buyuk` verir.
 * - Hata kodları Ek B.3'teki beş koddan biridir; Türkçe karşılıkları
 *   `src/i18n/common.ts` içindeki `tr.error.codes` altındadır.
 *
 * `src/storage/crypto.ts` içe aktarılır (Ek A'nın istediği bölünme); ters yönde
 * bağımlılık yoktur, döngü oluşmaz.
 */
import { APP_ORIGIN, ROUTES, SHARE_MAX_JSON } from '../config.ts';
import {
  b64urlDecode,
  b64urlEncode,
  deflate,
  inflate,
  utf8Decode,
  utf8Encode,
} from '../lib/bytes.ts';
import { decryptBytes, encryptBytes } from '../storage/crypto.ts';
import type { ShareCard } from './card.ts';

/** Ek A — yük kalıbı. Sürüm 1, kip `p`/`e`, gövde 1–8000 base64url karakteri. */
export const SHARE_PAYLOAD_PATTERN = /^1([pe])\.([A-Za-z0-9_-]{1,8000})$/;

/** Ek A — gövdenin en büyük uzunluğu (kalıptaki `{1,8000}`). */
export const SHARE_PAYLOAD_MAX_LENGTH = 8000;

/** Şartname §10.2 — içe alma yolunun öneki (`#/al/`). */
export const SHARE_IMPORT_PREFIX = ROUTES.import;

/**
 * §10.2 — paylaşım bağlantısı: `<kök>#/al/<yük>`.
 * Yük `#` sonrasında durur, ağ isteği yapılmaz.
 */
export function buildShareUrl(payload: string, origin: string = APP_ORIGIN): string {
  return `${origin}${SHARE_IMPORT_PREFIX}${payload}`;
}

/**
 * Ek A — özet kartı paylaşım yüküne çevirir.
 * Parola verilmezse (ya da boşsa) düz kip kullanılır.
 */
export async function encodeShare(card: ShareCard, passphrase?: string): Promise<string> {
  const json = utf8Encode(JSON.stringify(card));
  if (json.length > SHARE_MAX_JSON) throw new Error('cok-buyuk');
  let bytes = await deflate(json);
  if (passphrase) bytes = await encryptBytes(bytes, passphrase);
  const encoded = b64urlEncode(bytes);
  if (encoded.length > SHARE_PAYLOAD_MAX_LENGTH) throw new Error('cok-buyuk');
  return `1${passphrase ? 'e' : 'p'}.${encoded}`;
}

/**
 * Ek A — paylaşım yükünü çözer. Dönen değer **doğrulanmamıştır**; çağıran
 * `validateCard` uygulamak zorundadır (§10.1, §10.3).
 *
 * @throws `Error('gecersiz-baglanti')` — kalıp uymuyor ya da base64url bozuk.
 * @throws `Error('bozuk-veri')` — açma/JSON çözme başarısız.
 * @throws `Error('cok-buyuk')` — açılan JSON `SHARE_MAX_JSON` sınırını aşıyor.
 * @throws `Error('parola-gerekli')` — parolalı yük, parola verilmedi.
 * @throws `Error('parola-yanlis-veya-bozuk')` — parola yanlış ya da zarf bozuk.
 */
export async function decodeShare(payload: string, passphrase?: string): Promise<unknown> {
  const match = SHARE_PAYLOAD_PATTERN.exec(payload);
  if (match === null) throw new Error('gecersiz-baglanti');
  const mode = match[1];
  const encoded = match[2] ?? '';

  let bytes: Uint8Array;
  try {
    bytes = b64urlDecode(encoded);
  } catch {
    // Alfabe dışı karakter ya da geçersiz base64 uzunluğu: bağlantı geçersiz.
    throw new Error('gecersiz-baglanti');
  }

  if (mode === 'e') {
    if (!passphrase) throw new Error('parola-gerekli');
    bytes = await decryptBytes(bytes, passphrase);
  }

  let json: string;
  try {
    json = utf8Decode(await inflate(bytes, SHARE_MAX_JSON));
  } catch (error) {
    const tooBig = error instanceof Error && error.message === 'cok-buyuk';
    throw new Error(tooBig ? 'cok-buyuk' : 'bozuk-veri');
  }

  try {
    return JSON.parse(json) as unknown;
  } catch {
    throw new Error('bozuk-veri');
  }
}

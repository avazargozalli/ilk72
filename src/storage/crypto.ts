/**
 * Şartname §17, §9.3, Ek A — uygulama kilidi ve yedek şifrelemesi.
 *
 * Zarf biçimi **normatiftir** (Ek A, Ek B.1):
 *
 * ```
 * salt(16) || iv(12) || AES-256-GCM şifreli metin || etiket(16)
 * ```
 *
 * - Anahtar türetme: PBKDF2-HMAC-SHA256, 600.000 tur (`KDF_ITER`), 16 baytlık
 *   tuz. AES-256-GCM, 12 baytlık başlangıç vektörü.
 * - Her `encryptBytes` çağrısında tuz ve vektör tazedir; verilmezse
 *   `crypto.getRandomValues` ile üretilir (§17). Bilinen yanıt testi (Ek B.1)
 *   sabit tuz/vektör geçebilsin diye isteğe bağlı verilebilir.
 * - Parola hiçbir yere yazılmaz; `decryptBytes` yalnızca bellekte çalışır.
 *
 * Hata kodları kullanıcıya görünen iletilere `src/i18n/common.ts` üzerinden
 * bağlanır: `bozuk-veri`, `parola-yanlis-veya-bozuk`.
 */
import { toBufferSource, utf8Encode } from '../lib/bytes.ts';

/** Ek A — PBKDF2 tur sayısı (normatif). */
export const KDF_ITER = 600000;

/** Zarf başlığı: 16 bayt tuz + 12 bayt başlangıç vektörü. */
const HEADER_LENGTH = 28;

/** GCM kimlik doğrulama etiketi 16 bayt; bundan kısa zarf hiç denenmeden reddedilir. */
const MIN_BLOB_LENGTH = HEADER_LENGTH + 16;

/** `encryptBytes` için isteğe bağlı sabit tuz/vektör (yalnızca test vektörü). */
export interface EncryptOptions {
  salt?: Uint8Array;
  iv?: Uint8Array;
}

/**
 * Ek A — paroladan AES-256-GCM anahtarı türetir. Parola NFKC ile normalize
 * edilir; böylece farklı klavyelerden gelen aynı görünen parola aynı anahtarı
 * üretir.
 */
async function deriveKey(
  passphrase: string,
  salt: Uint8Array,
  iterations = KDF_ITER,
): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey(
    'raw',
    utf8Encode(passphrase.normalize('NFKC')),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt: toBufferSource(salt), iterations },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

/**
 * Ek A — `plain` baytlarını parolayla şifreler ve zarfı döndürür.
 * Verilmezse yeni rastgele tuz (16) ve vektör (12) üretilir.
 */
export async function encryptBytes(
  plain: Uint8Array,
  passphrase: string,
  options: EncryptOptions = {},
): Promise<Uint8Array> {
  const salt = options.salt ?? crypto.getRandomValues(new Uint8Array(16));
  const iv = options.iv ?? crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const sealed = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: toBufferSource(iv) },
      key,
      toBufferSource(plain),
    ),
  );

  const out = new Uint8Array(HEADER_LENGTH + sealed.length);
  out.set(salt, 0);
  out.set(iv, 16);
  out.set(sealed, HEADER_LENGTH);
  return out;
}

/**
 * Ek A — zarfı çözer. 44 bayttan kısa girdi `bozuk-veri`; çözülemeyen zarf
 * (yanlış parola ya da bozulmuş etiket) `parola-yanlis-veya-bozuk` verir.
 */
export async function decryptBytes(blob: Uint8Array, passphrase: string): Promise<Uint8Array> {
  if (blob.length < MIN_BLOB_LENGTH) throw new Error('bozuk-veri');

  const salt = blob.slice(0, 16);
  const iv = blob.slice(16, HEADER_LENGTH);
  const sealed = blob.slice(HEADER_LENGTH);
  const key = await deriveKey(passphrase, salt);
  try {
    return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, sealed));
  } catch {
    throw new Error('parola-yanlis-veya-bozuk');
  }
}

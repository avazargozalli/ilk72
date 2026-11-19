/**
 * Şartname §17, §10.2, Ek A — katmanlar arası paylaşılan bayt yardımcıları.
 *
 * Bu dosya `storage` katmanından ve 21.4 paylaşım kodlamasından (`share/codec.ts`)
 * birlikte kullanılır; kod kopyalanmaz. Davranış Ek A'daki referans kodun
 * **birebir** aynısıdır:
 *
 * - `b64urlDecode` geçersiz (alfabe dışı) karakterde `Error('gecersiz-karakter')`
 *   fırlatır; `atob`'un kendi hataları sarılmaz.
 * - `inflate` verilen `limit` aşılırsa `Error('cok-buyuk')` fırlatır
 *   (sıkıştırma bombası koruması, §17).
 * - `deflate`/`inflate` `deflate-raw` biçimini kullanır; çıktı yalnızca
 *   `Uint8Array`'dır.
 *
 * `SHARE_MAX_JSON` değeri `src/config.ts` içinde tek yerde durur; burada
 * yeniden dışa aktarılır ki paylaşım katmanı bayt katmanıyla aynı sabiti okusun.
 */
import { SHARE_MAX_JSON } from '../config.ts';

export { SHARE_MAX_JSON };

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

/** Metni UTF-8 baytlarına çevirir (`TextEncoder` tek örneği paylaşılır). */
export function utf8Encode(text: string): Uint8Array<ArrayBuffer> {
  return textEncoder.encode(text);
}

/** UTF-8 baytlarını metne çevirir. */
export function utf8Decode(bytes: Uint8Array): string {
  return textDecoder.decode(bytes);
}

/** `pipe` için gereken en küçük akış sözleşmesi (Compression/DecompressionStream uyar). */
interface ByteTransformStream {
  readonly readable: ReadableStream<Uint8Array>;
  readonly writable: WritableStream<BufferSource>;
}

/**
 * Web Crypto ve akış API'leri (TypeScript 5.7+ tiplerinde) `ArrayBuffer`'a
 * dayalı görünüm ister. Paylaşılan API `Uint8Array` alır; sınırda kopyalarız.
 * Kopya davranışı değiştirmez, yalnızca tür güvenliğini sağlar.
 */
export function toBufferSource(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  return new Uint8Array(bytes);
}

/** Ek A — base64url (dolgu yok). */
export function b64urlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Ek A — base64url çözümü; alfabe dışı karakterde `gecersiz-karakter`. */
export function b64urlDecode(value: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]*$/.test(value)) throw new Error('gecersiz-karakter');
  const binary = atob(
    value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4),
  );
  const out = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) out[index] = binary.charCodeAt(index);
  return out;
}

/**
 * Ek A — baytları akıştan geçirir. Yazma ve okuma eşzamanlı yürür: büyük girdi
 * akışın iç kuyruğunu doldurup kilitlenmesin diye yazmanın bitmesi beklenmez.
 */
async function pipe(
  bytes: Uint8Array,
  stream: ByteTransformStream,
  limit = Number.POSITIVE_INFINITY,
): Promise<Uint8Array> {
  const writer = stream.writable.getWriter();
  const wrote = writer.write(toBufferSource(bytes)).then(() => writer.close());
  void wrote.catch(() => undefined); // hata okuma tarafında da yüzeye çıkar

  const reader = stream.readable.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > limit) throw new Error('cok-buyuk');
    chunks.push(value);
  }
  await wrote;

  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

/** Ek A — `deflate-raw` sıkıştırma. */
export function deflate(bytes: Uint8Array): Promise<Uint8Array> {
  return pipe(bytes, new CompressionStream('deflate-raw'));
}

/**
 * Ek A — `deflate-raw` açma. `limit` verilirse açılmış boyut bu sınırı aşınca
 * `Error('cok-buyuk')` fırlatılır; sıkıştırma bombasına karşı ilk savunma.
 */
export function inflate(bytes: Uint8Array, limit?: number): Promise<Uint8Array> {
  return pipe(bytes, new DecompressionStream('deflate-raw'), limit);
}

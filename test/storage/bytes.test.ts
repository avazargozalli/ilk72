/**
 * Şartname §17, §18.3, Ek A — paylaşılan bayt yardımcılarının testleri.
 *
 * Bu dosya `src/lib/bytes.ts` sözleşmesini doğrular: base64url alfabesi,
 * sıkıştırma gidiş-dönüşü ve sıkıştırma bombası sınırı.
 */
import { describe, expect, it } from 'vitest';
import {
  b64urlDecode,
  b64urlEncode,
  deflate,
  inflate,
  SHARE_MAX_JSON,
  toBufferSource,
  utf8Decode,
  utf8Encode,
} from '../../src/lib/bytes.ts';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

describe('UTF-8 yardımcıları', () => {
  it('metni bayta, baytı metne çevirir', () => {
    expect([...utf8Encode('İ')]).toEqual([0xc4, 0xb0]);
    expect(utf8Decode(utf8Encode('İlk 72 — deneme'))).toBe('İlk 72 — deneme');
    expect(utf8Decode(new Uint8Array())).toBe('');
  });

  it('Web Crypto sınırı için ArrayBuffer tabanlı kopya verir', () => {
    const bytes = new Uint8Array([1, 2, 3]);
    const copy = toBufferSource(bytes);
    expect([...copy]).toEqual([1, 2, 3]);
    copy[0] = 9;
    expect(bytes[0]).toBe(1);
  });
});

describe('base64url', () => {
  it('dolgusuz base64url üretir (Ek A)', () => {
    expect(b64urlEncode(encoder.encode('hello'))).toBe('aGVsbG8');
    expect(b64urlEncode(new Uint8Array([0, 255, 254]))).toBe('AP_-');
    expect(b64urlEncode(new Uint8Array())).toBe('');
  });

  it('kodlanmış baytları birebir geri çözer', () => {
    const bytes = new Uint8Array([0, 1, 2, 250, 251, 252, 253, 254, 255]);
    expect([...b64urlDecode(b64urlEncode(bytes))]).toEqual([...bytes]);
    expect([...b64urlDecode('')]).toEqual([]);
  });

  it('alfabe dışı karakterde gecersiz-karakter fırlatır (Ek B.3)', () => {
    for (const value of ['AA+A', 'AA A', 'A.B', 'ğ', 'aGVsbG8=']) {
      expect(() => b64urlDecode(value), value).toThrow('gecersiz-karakter');
    }
  });

  it('geçersiz uzunlukta atob hatasını olduğu gibi bırakır', () => {
    expect(() => b64urlDecode('A')).toThrow();
  });
});

describe('deflate / inflate', () => {
  it('metni gidiş-dönüşte bozmadan korur', async () => {
    const text = `İlk 72 — deneme; çğıöşü 0123456789 ${'a'.repeat(2000)}`;
    const compressed = await deflate(encoder.encode(text));
    expect(compressed).toBeInstanceOf(Uint8Array);
    expect(decoder.decode(await inflate(compressed))).toBe(text);
  });

  it('boş girdiyi destekler', async () => {
    const compressed = await deflate(new Uint8Array());
    expect(await inflate(compressed)).toEqual(new Uint8Array());
  });

  it('limit aşımında cok-buyuk fırlatır (§17)', async () => {
    const compressed = await deflate(new Uint8Array(5_000_000));
    await expect(inflate(compressed, SHARE_MAX_JSON)).rejects.toThrow('cok-buyuk');
  });

  it('limit verilmezse boyut sınırı uygulamaz', async () => {
    const compressed = await deflate(new Uint8Array(5_000_000));
    const inflated = await inflate(compressed);
    expect(inflated.length).toBe(5_000_000);
  });

  it('SHARE_MAX_JSON normatif değerdir (Ek A)', () => {
    expect(SHARE_MAX_JSON).toBe(16384);
  });
});

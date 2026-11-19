/**
 * Şartname §17, §18.3, Ek A, Ek B.1 — şifreleme testleri.
 *
 * Ek B.1 bilinen yanıtı **bayt bayt** doğrulanır. Ayrıca rastgele tuz/vektörle
 * gidiş-dönüş, yanlış parola, bozulmuş zarf ve 44 bayttan kısa girdi sınanır.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { decryptBytes, encryptBytes, KDF_ITER } from '../../src/storage/crypto.ts';
import { fromHex, KNOWN_ANSWER, toHex } from './helpers.ts';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

let vectorBlob: Uint8Array;

beforeAll(async () => {
  vectorBlob = await encryptBytes(encoder.encode(KNOWN_ANSWER.plainText), KNOWN_ANSWER.passphrase, {
    salt: fromHex(KNOWN_ANSWER.saltHex),
    iv: fromHex(KNOWN_ANSWER.ivHex),
  });
});

describe('Ek B.1 — bilinen yanıt', () => {
  it('zarfı beklenen onaltılıkla birebir üretir', () => {
    expect(toHex(vectorBlob)).toBe(KNOWN_ANSWER.expectedHex);
    expect(vectorBlob.length).toBe(62);
    expect(toHex(vectorBlob.slice(0, 16))).toBe(KNOWN_ANSWER.saltHex);
    expect(toHex(vectorBlob.slice(16, 28))).toBe(KNOWN_ANSWER.ivHex);
  });

  it('aynı zarfı doğru parolayla çözer', async () => {
    const plain = await decryptBytes(vectorBlob, KNOWN_ANSWER.passphrase);
    expect(decoder.decode(plain)).toBe(KNOWN_ANSWER.plainText);
  });

  it('yanlış parolada parola-yanlis-veya-bozuk verir', async () => {
    await expect(decryptBytes(vectorBlob, 'Baska Parola 2')).rejects.toThrow(
      'parola-yanlis-veya-bozuk',
    );
  });

  it('44 bayttan kısa girdide bozuk-veri verir', async () => {
    await expect(decryptBytes(vectorBlob.slice(0, 43), KNOWN_ANSWER.passphrase)).rejects.toThrow(
      'bozuk-veri',
    );
  });

  it('bozulmuş etiketi reddeder', async () => {
    const corrupted = new Uint8Array(vectorBlob);
    corrupted[corrupted.length - 1] = (corrupted[corrupted.length - 1] ?? 0) ^ 0xff;
    await expect(decryptBytes(corrupted, KNOWN_ANSWER.passphrase)).rejects.toThrow(
      'parola-yanlis-veya-bozuk',
    );
  });
});

describe('şifreleme', () => {
  it('KDF tur sayısı normatiftir', () => {
    expect(KDF_ITER).toBe(600000);
  });

  it('rastgele tuz ve vektörle gidiş-dönüş yapar, her seferinde taze tuz üretir', async () => {
    const plain = encoder.encode('rastgele zarf denemesi');
    const first = await encryptBytes(plain, KNOWN_ANSWER.passphrase);
    const second = await encryptBytes(plain, KNOWN_ANSWER.passphrase);

    expect(first.length).toBe(plain.length + 44);
    expect(decoder.decode(await decryptBytes(first, KNOWN_ANSWER.passphrase))).toBe(
      'rastgele zarf denemesi',
    );
    expect(toHex(first.slice(0, 28))).not.toBe(toHex(second.slice(0, 28)));
  });

  it('boş düz metni şifreler', async () => {
    const blob = await encryptBytes(new Uint8Array(), KNOWN_ANSWER.passphrase);
    expect(blob.length).toBe(44);
    expect((await decryptBytes(blob, KNOWN_ANSWER.passphrase)).length).toBe(0);
  });

  it('yalnızca tuz verilirse vektörü kendisi üretir', async () => {
    const salt = new Uint8Array(16).fill(7);
    const blob = await encryptBytes(encoder.encode('tuz'), KNOWN_ANSWER.passphrase, { salt });
    expect(toHex(blob.slice(0, 16))).toBe(toHex(salt));
    expect(decoder.decode(await decryptBytes(blob, KNOWN_ANSWER.passphrase))).toBe('tuz');
  });

  it('yalnızca vektör verilirse tuzu kendisi üretir', async () => {
    const iv = new Uint8Array(12).fill(9);
    const blob = await encryptBytes(encoder.encode('vektör'), KNOWN_ANSWER.passphrase, { iv });
    expect(toHex(blob.slice(16, 28))).toBe(toHex(iv));
    expect(decoder.decode(await decryptBytes(blob, KNOWN_ANSWER.passphrase))).toBe('vektör');
  });

  it('parolayı NFKC ile normalize eder (Ek A)', async () => {
    const decomposed = 'Parola-O\u0308rnek 1';
    const blob = await encryptBytes(encoder.encode('normalize'), decomposed);
    expect(decoder.decode(await decryptBytes(blob, KNOWN_ANSWER.passphrase))).toBe('normalize');
  });

  it('bozulmuş şifreli metni reddeder', async () => {
    const blob = await encryptBytes(encoder.encode('bozulacak'), KNOWN_ANSWER.passphrase);
    blob[blob.length - 20] = (blob[blob.length - 20] ?? 0) ^ 0x01;
    await expect(decryptBytes(blob, KNOWN_ANSWER.passphrase)).rejects.toThrow(
      'parola-yanlis-veya-bozuk',
    );
  });
});

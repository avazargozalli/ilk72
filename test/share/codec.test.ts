/**
 * Şartname §10.2, §18.3, Ek A, Ek B.3 — paylaşım yükü kodlaması testleri.
 *
 * Ek B.3 tablosundaki **her satır** ayrı testtir. Hata kodları Türkçe iletiye
 * `src/i18n/common.ts` üzerinden bağlanır; burada yalnızca kodun kendisi sınanır.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { SHARE_MAX_JSON, SHARE_MAX_URL } from '../../src/config.ts';
import { b64urlEncode, deflate, utf8Encode } from '../../src/lib/bytes.ts';
import type { ShareCard } from '../../src/share/card.ts';
import {
  buildShareUrl,
  decodeShare,
  encodeShare,
  SHARE_PAYLOAD_MAX_LENGTH,
  SHARE_PAYLOAD_PATTERN,
} from '../../src/share/codec.ts';

const PASS_PHRASE = 'Parola-Örnek 1';
const ORIGIN = 'https://kullanici.github.io/ilk72/';

/** happy-dom'da global `URL` tarayıcı sınıfıdır; vektör yolu `fileURLToPath` ile kurulur. */
const VECTOR_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'vectors',
  'share-card.json',
);
const card = JSON.parse(readFileSync(VECTOR_PATH, 'utf8')) as ShareCard;

/** Ek B.3 — düz yük. */
async function plainPayload(value: ShareCard = card): Promise<string> {
  return encodeShare(value);
}

describe('Ek B.3 — gidiş-dönüş', () => {
  it('düz yük karta derin eşit çözülür', async () => {
    const payload = await plainPayload();
    expect(payload.startsWith('1p.')).toBe(true);
    expect(await decodeShare(payload)).toEqual(card);
  });

  it('parolalı yük doğru parolayla karta derin eşit çözülür', async () => {
    const payload = await encodeShare(card, PASS_PHRASE);
    expect(payload.startsWith('1e.')).toBe(true);
    expect(payload).not.toBe(await plainPayload());
    expect(await decodeShare(payload, PASS_PHRASE)).toEqual(card);
  });

  it('parolalı yük yanlış parolada parola-yanlis-veya-bozuk verir', async () => {
    const payload = await encodeShare(card, PASS_PHRASE);
    await expect(decodeShare(payload, 'Baska Parola 2')).rejects.toThrow(
      'parola-yanlis-veya-bozuk',
    );
  });

  it('parolalı yük parolasız çağrıda parola-gerekli verir', async () => {
    const payload = await encodeShare(card, PASS_PHRASE);
    await expect(decodeShare(payload)).rejects.toThrow('parola-gerekli');
  });

  it('`1p.AAAA` bozuk-veri verir', async () => {
    await expect(decodeShare('1p.AAAA')).rejects.toThrow('bozuk-veri');
  });

  it('`2p.AAAA` gecersiz-baglanti verir', async () => {
    await expect(decodeShare('2p.AAAA')).rejects.toThrow('gecersiz-baglanti');
  });

  it('`1p.AA+A` gecersiz-baglanti verir', async () => {
    await expect(decodeShare('1p.AA+A')).rejects.toThrow('gecersiz-baglanti');
  });

  it('5.000.000 sıfır baytın sıkıştırılmış hâli cok-buyuk verir (sıkıştırma bombası)', async () => {
    const bomb = await deflate(new Uint8Array(5_000_000));
    const payload = `1p.${b64urlEncode(bomb)}`;
    expect(payload.length).toBeLessThan(SHARE_PAYLOAD_MAX_LENGTH);
    await expect(decodeShare(payload)).rejects.toThrow('cok-buyuk');
  });

  it('örnek kartın JSON boyutu 602 bayt', () => {
    expect(new TextEncoder().encode(JSON.stringify(card)).length).toBe(602);
  });

  it('bağlantı uzunluğu SHARE_MAX_URL sınırının altında kalır', async () => {
    const url = buildShareUrl(await plainPayload(), ORIGIN);
    expect(url.length).toBeLessThanOrEqual(SHARE_MAX_URL);
    expect(url.startsWith(`${ORIGIN}#/al/1p.`)).toBe(true);
    // Şartname ~512 karakter der; sıkıştırma uygulamasına göre birkaç bayt oynar.
    expect(url.length).toBeGreaterThan(450);
  });

  it('parolalı bağlantı da sınırın altında kalır', async () => {
    const url = buildShareUrl(await encodeShare(card, PASS_PHRASE), ORIGIN);
    expect(url.length).toBeLessThanOrEqual(SHARE_MAX_URL);
    expect(url.startsWith(`${ORIGIN}#/al/1e.`)).toBe(true);
  });
});

describe('decodeShare — payload biçimi', () => {
  it('boş, kısa ve alfabe dışı yükleri reddeder', async () => {
    for (const payload of ['', '1p.', 'p.AAAA', '1p', '1x.AAAA', '1p.AAAA\n', ' 1p.AAAA']) {
      await expect(decodeShare(payload), payload).rejects.toThrow('gecersiz-baglanti');
    }
  });

  it('8.000 karakterden uzun yükü reddeder', async () => {
    const payload = `1p.${'A'.repeat(SHARE_PAYLOAD_MAX_LENGTH + 1)}`;
    await expect(decodeShare(payload)).rejects.toThrow('gecersiz-baglanti');
  });

  it('geçersiz base64 uzunluğunu gecersiz-baglanti olarak bildirir', async () => {
    await expect(decodeShare('1p.A')).rejects.toThrow('gecersiz-baglanti');
  });

  it('açılan ama JSON olmayan yükü bozuk-veri olarak reddeder', async () => {
    const payload = `1p.${b64urlEncode(await deflate(utf8Encode('bu json degil')))}`;
    await expect(decodeShare(payload)).rejects.toThrow('bozuk-veri');
  });

  it('şema doğrulaması çağıranda: nesne olduğu gibi döner', async () => {
    const payload = `1p.${b64urlEncode(await deflate(utf8Encode('{"v":9,"x":1}')))}`;
    expect(await decodeShare(payload)).toEqual({ v: 9, x: 1 });
  });

  it('kısa şifreli zarfı bozuk-veri olarak bildirir', async () => {
    const payload = `1e.${b64urlEncode(new Uint8Array([1, 2, 3]))}`;
    await expect(decodeShare(payload, PASS_PHRASE)).rejects.toThrow('bozuk-veri');
  });

  it('JSON sınırı normatiftir (Ek A)', () => {
    expect(SHARE_MAX_JSON).toBe(16384);
    expect(SHARE_MAX_URL).toBe(1200);
  });
});

describe('encodeShare — biçim', () => {
  it('yük `<sürüm><kip>.<base64url>` kalıbına uyar (Ek A)', async () => {
    for (const payload of [await plainPayload(), await encodeShare(card, PASS_PHRASE)]) {
      expect(SHARE_PAYLOAD_PATTERN.test(payload)).toBe(true);
      expect(payload).toMatch(/^1[pe]\.[A-Za-z0-9_-]+$/);
    }
  });

  it('parolasız ve boş parolada düz kip kullanır', async () => {
    expect(await encodeShare(card, '')).toBe(await encodeShare(card));
  });

  it('aynı kart her seferinde aynı düz yükü üretir', async () => {
    expect(await encodeShare(card)).toBe(await encodeShare(card));
  });

  it('parolalı yük her şifrelemede taze tuz/vektör taşır', async () => {
    expect(await encodeShare(card, PASS_PHRASE)).not.toBe(await encodeShare(card, PASS_PHRASE));
  });

  it('yalnızca boşluktan oluşan parola da şifreler (Ek A davranışı)', async () => {
    const payload = await encodeShare(card, ' ');
    expect(payload.startsWith('1e.')).toBe(true);
    expect(await decodeShare(payload, ' ')).toEqual(card);
  });
});

describe('buildShareUrl', () => {
  it('kök adres ile yükü `#` sonrasında birleştirir (§10.2)', () => {
    expect(buildShareUrl('1p.AAAA', ORIGIN)).toBe(`${ORIGIN}#/al/1p.AAAA`);
    expect(buildShareUrl('1p.AAAA', 'https://ornek.test/ilk72')).toBe(
      'https://ornek.test/ilk72#/al/1p.AAAA',
    );
  });

  it('varsayılan kök adresi kullanır', () => {
    expect(buildShareUrl('1p.AAAA')).toContain('#/al/1p.AAAA');
  });
});

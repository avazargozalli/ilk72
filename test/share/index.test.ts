/**
 * Şartname §10, `docs/mimari.md` §3.5–3.6 — paylaşım katmanının ortak giriş
 * noktası (`src/share/index.ts`).
 *
 * Arayüz `src/share/index.ts` üzerinden içe aktarır; bu test dışa aktarılan
 * adların eksiksiz ve modüllerin kendisiyle **aynı** olduğunu kilitler.
 */
import { describe, expect, it } from 'vitest';
import * as card from '../../src/share/card.ts';
import * as codec from '../../src/share/codec.ts';
import * as api from '../../src/share/index.ts';
import * as qr from '../../src/share/qr.ts';

describe('src/share/index.ts — ortak giriş noktası', () => {
  it('belgelenen adları dışa aktarır', () => {
    expect(Object.keys(api).sort()).toEqual([
      'CARD_VERSION',
      'QR_ERROR_CORRECTION_LEVEL',
      'QR_MARGIN_MODULES',
      'SHARE_CARD_LIMITS',
      'SHARE_IMPORT_PREFIX',
      'SHARE_PAYLOAD_MAX_LENGTH',
      'SHARE_PAYLOAD_PATTERN',
      'buildShareCard',
      'buildShareQr',
      'buildShareUrl',
      'decodeShare',
      'encodeShare',
      'validateCard',
    ]);
  });

  it('dışa aktarılan işlevler modüllerin kendisidir (kopya değil)', () => {
    expect(api.buildShareCard).toBe(card.buildShareCard);
    expect(api.validateCard).toBe(card.validateCard);
    expect(api.encodeShare).toBe(codec.encodeShare);
    expect(api.decodeShare).toBe(codec.decodeShare);
    expect(api.buildShareUrl).toBe(codec.buildShareUrl);
    expect(api.buildShareQr).toBe(qr.buildShareQr);
  });

  it('uçtan uca akış ortak giriş noktasından çalışır', async () => {
    const plan = await import('../../src/model/defaults.ts').then(({ createEmptyPlan }) => {
      const empty = createEmptyPlan();
      empty.household.label = 'Kaya ailesi';
      return empty;
    });
    const shared = api.buildShareCard(plan, { includeNeedsNotes: false, includeHealth: false });
    const payload = await api.encodeShare(shared);
    expect(api.SHARE_PAYLOAD_PATTERN.test(payload)).toBe(true);
    const url = api.buildShareUrl(payload, 'https://ornek.test/');
    expect(api.buildShareQr(url)).not.toBeNull();
    expect(api.validateCard(await api.decodeShare(payload))).toEqual(shared);
  });
});

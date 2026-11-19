/**
 * Şartname §10.2, §18.3 — kare kod testleri.
 *
 * Kare kod `dangerouslySetInnerHTML` olmadan çizilebilsin diye SVG **metni**
 * değil, modül matrisi ve güvenli (yalnız sayı/harf) bir `path` verisi üretilir.
 * Bu dosya matrisin kare ve boşluklu olduğunu, uzunluk sınırını ve `path`
 * güvenliğini denetler.
 */
import { describe, expect, it } from 'vitest';
import { SHARE_MAX_URL } from '../../src/config.ts';
import { buildShareQr, QR_MARGIN_MODULES } from '../../src/share/qr.ts';

const URL_SAMPLE = `https://kullanici.github.io/ilk72/#/al/1p.${'A'.repeat(200)}`;

/** `path` yalnızca SVG komut harfleri, sayı, boşluk ve işaret içerebilir. */
const SAFE_PATH = /^[MHVZhvz0-9 .,-]+$/;

function coordinates(path: string): number[] {
  return (path.match(/-?\d+/g) ?? []).map(Number);
}

describe('buildShareQr — matris', () => {
  it('normal bağlantı için matris üretir', () => {
    const qr = buildShareQr(URL_SAMPLE);
    expect(qr).not.toBeNull();
    if (qr === null) return;
    expect(qr.data).toBe(URL_SAMPLE);
    expect(qr.margin).toBe(QR_MARGIN_MODULES);
    expect(QR_MARGIN_MODULES).toBe(4);
    expect(qr.size).toBeGreaterThanOrEqual(21);
    expect(qr.viewSize).toBe(qr.size + 2 * QR_MARGIN_MODULES);
  });

  it('modül matrisi karedir ve her satır tam `size` uzunluktadır', () => {
    const qr = buildShareQr(URL_SAMPLE);
    if (qr === null) throw new Error('kare kod üretilmedi');
    expect(qr.modules).toHaveLength(qr.size);
    for (const row of qr.modules) {
      expect(row).toHaveLength(qr.size);
      expect(row.every((module) => typeof module === 'boolean')).toBe(true);
    }
    expect((qr.size - 21) % 4).toBe(0);
  });

  it('sol üst köşede bulucu desen vardır (7 × 7 koyu çerçeve)', () => {
    const qr = buildShareQr(URL_SAMPLE);
    if (qr === null) throw new Error('kare kod üretilmedi');
    expect(qr.modules[0]?.[0]).toBe(true);
    for (let index = 0; index < 7; index += 1) {
      expect(qr.modules[0]?.[index]).toBe(true);
      expect(qr.modules[index]?.[0]).toBe(true);
    }
    // Bulucu desenin içi (2..4) koyu, halka (1) açık.
    expect(qr.modules[1]?.[1]).toBe(false);
    expect(qr.modules[2]?.[2]).toBe(true);
  });

  it('`path` yalnızca güvenli SVG verisi içerir ve çizim alanının içinde kalır', () => {
    const qr = buildShareQr(URL_SAMPLE);
    if (qr === null) throw new Error('kare kod üretilmedi');
    expect(qr.path.length).toBeGreaterThan(0);
    expect(qr.path.startsWith('M')).toBe(true);
    expect(qr.path).toMatch(SAFE_PATH);
    const values = coordinates(qr.path);
    expect(values.length).toBeGreaterThan(0);
    expect(Math.max(...values)).toBeLessThan(qr.viewSize);
    // `v1` göreli dikey adımdır; mutlak koordinatlar negatife düşmez.
    expect(Math.min(...values)).toBeGreaterThanOrEqual(0);
  });

  it('her koyu modül `path` içinde bir dikdörtgen olarak yer alır', () => {
    const qr = buildShareQr('1p.AAAA');
    if (qr === null) throw new Error('kare kod üretilmedi');
    const dark = qr.modules.flat().filter(Boolean).length;
    const rectangles = (qr.path.match(/M/g) ?? []).length;
    expect(rectangles).toBeGreaterThan(0);
    expect(rectangles).toBeLessThanOrEqual(dark);
  });

  it('aynı girdi için her seferinde aynı matrisi üretir', () => {
    expect(buildShareQr(URL_SAMPLE)).toEqual(buildShareQr(URL_SAMPLE));
  });

  it('kısa yükte en küçük sürümü, uzun yükte daha büyük sürümü seçer (otomatik sürüm)', () => {
    const small = buildShareQr('1p.AAAA');
    const large = buildShareQr(URL_SAMPLE);
    if (small === null || large === null) throw new Error('kare kod üretilmedi');
    expect(small.size).toBe(21);
    expect(large.size).toBeGreaterThan(small.size);
  });
});

describe('buildShareQr — sınırlar', () => {
  it('SHARE_MAX_URL aşımında kare kod üretmez (§10.2)', () => {
    expect(buildShareQr('A'.repeat(SHARE_MAX_URL))).not.toBeNull();
    expect(buildShareQr('A'.repeat(SHARE_MAX_URL + 1))).toBeNull();
  });

  it('boş metinde null döner', () => {
    expect(buildShareQr('')).toBeNull();
  });

  it('ASCII olmayan metinde null döner (kodlayıcı tek baytlık tablo kullanır)', () => {
    expect(buildShareQr('https://ornek.test/#/al/şğü')).toBeNull();
  });

  it('QR sınırı yapılandırmadaki değerdir', () => {
    expect(SHARE_MAX_URL).toBe(1200);
  });
});

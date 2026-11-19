/**
 * Şartname §13.1, §13.3 — kaynak kaydının eksiksizliği, adres kuralları ve
 * izinli alan adları. Gerçek kayıt bozulmadan doğrulanır.
 */
import { describe, expect, it } from 'vitest';
import {
  ALLOWED_SOURCE_DOMAINS,
  getSource,
  isAllowedExternalDomain,
  isAllowedSourceDomain,
  isAllowedSourceUrl,
  parseHttpsUrl,
  REPO_AND_LICENSE_DOMAINS,
  SOURCES,
  SOURCES_BY_KEY,
} from '../../src/content/sources.ts';

/** §13.3 kaynak anahtarları tablosu ve sonradan eklenen yayınlar. */
const EXPECTED_KEYS = [
  'K-PLAN72',
  'K-KIRSEHIR',
  'K-KIRSEHIR2',
  'K-MUGLA',
  'K-UYARI',
  'K-CEVRE',
  'K-ONLEM',
  'K-ONLEM2',
  'K-ANINDA',
  'K-HAFTA',
  'K-HAFTA2',
  'K-KILIS',
  'K-OKUL',
  'K-ILK6',
  'K-BURSA',
  'K-SOZLUK',
  'K-CANTA-BB',
  'K-BURDUR',
  'K-GUMUSHANE',
  'K-SAKARYA',
  'K-KOCAELI',
  'K-EDEVLET',
  'K-TDTH',
  'K-112',
  'K-MUGLA-CANTA',
  'K-GUVENLI-YASAM',
  'K-OKUL-TABANLI',
];

describe('kaynak kaydı (§13.1, §13.3)', () => {
  it('şartnamedeki bütün anahtarları tablo sırasıyla taşır', () => {
    expect(SOURCES.map((source) => source.key)).toEqual(EXPECTED_KEYS);
  });

  it('anahtarlar benzersizdir ve anahtarla aranabilir', () => {
    expect(new Set(EXPECTED_KEYS).size).toBe(SOURCES.length);
    expect(Object.keys(SOURCES_BY_KEY)).toHaveLength(SOURCES.length);

    for (const source of SOURCES) {
      expect(getSource(source.key)).toBe(source);
    }
    expect(getSource('K-YOK')).toBeUndefined();
  });

  it('her kaynağın kurum, sayfa adı ve erişim tarihi doludur', () => {
    for (const source of SOURCES) {
      expect(source.key, source.key).toMatch(/^K-[A-Z0-9-]+$/);
      expect(source.org.trim(), source.key).not.toBe('');
      expect(source.title.trim(), source.key).not.toBe('');
      expect(source.accessed, source.key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('doğrulanmış kaynakların adresi https ve izinli alan adındadır', () => {
    const verified = SOURCES.filter((source) => source.verified);

    expect(verified).toHaveLength(SOURCES.length);
    for (const source of verified) {
      expect(source.url, source.key).not.toBeNull();
      expect(isAllowedSourceUrl(source.url), source.key).toBe(true);
    }
  });

  it('zor alan adları tablodaki adreslerle birebir eşleşir', () => {
    expect(getSource('K-PLAN72')?.url).toBe(
      'https://www.afad.gov.tr/depremler-onlenemez-ancak-depremlerin-afetlere-donusmesi-onlenebilir',
    );
    expect(getSource('K-HAFTA')?.url).toBe(
      'https://www.afad.gov.tr/1-7-mart-deprem-haftasini-hazirlik-ile-degerlendirin---basin-duyurusu',
    );
    expect(getSource('K-HAFTA2')?.url).toBe(
      'https://www.afad.gov.tr/1-7-mart-deprem-haftasini-hazirlik-ile-degerlendirin',
    );
    expect(getSource('K-TDTH')?.url).toBe('https://tdth.afad.gov.tr');
    expect(getSource('K-112')?.url).toBe('https://www.112.gov.tr/112-acm-projesi');
    expect(getSource('K-EDEVLET')?.url).toBe(
      'https://www.turkiye.gov.tr/afet-ve-acil-durum-yonetimi-acil-toplanma-alani-sorgulama',
    );
  });
});

describe('izinli alan adları (§13.1)', () => {
  it('kaynak alan adları şartnamedeki ile uyumludur', () => {
    expect([...ALLOWED_SOURCE_DOMAINS]).toEqual([
      'afad.gov.tr',
      'turkiye.gov.tr',
      '112.gov.tr',
      'icisleri.gov.tr',
      'saglik.gov.tr',
      'aile.gov.tr',
      'dask.gov.tr',
      'kizilay.org.tr',
      'mevzuat.gov.tr',
      'resmigazete.gov.tr',
      'kvkk.gov.tr',
      'mebakub.meb.gov.tr',
    ]);
  });

  it('depo ve lisans istisnaları ayrı tutulur', () => {
    expect([...REPO_AND_LICENSE_DOMAINS]).toEqual([
      'github.com',
      'creativecommons.org',
      'opensource.org',
    ]);
  });

  it('alt alan adlarını kabul eder, benzer adları reddeder', () => {
    expect(isAllowedSourceDomain('afad.gov.tr')).toBe(true);
    expect(isAllowedSourceDomain('kirsehir.afad.gov.tr')).toBe(true);
    expect(isAllowedSourceDomain('AFAD.GOV.TR')).toBe(true);
    expect(isAllowedSourceDomain('afad.gov.tr.')).toBe(true);
    expect(isAllowedSourceDomain('sahte-afad.gov.tr')).toBe(false);
    expect(isAllowedSourceDomain('afad.gov.tr.example.com')).toBe(false);
    expect(isAllowedSourceDomain('github.com')).toBe(false);

    expect(isAllowedExternalDomain('github.com')).toBe(true);
    expect(isAllowedExternalDomain('pages.github.com')).toBe(true);
    expect(isAllowedExternalDomain('creativecommons.org')).toBe(true);
    expect(isAllowedExternalDomain('github.com.example.com')).toBe(false);
  });

  it('https ve alan adı birlikte denetlenir', () => {
    expect(isAllowedSourceUrl('https://www.afad.gov.tr/deneme')).toBe(true);
    expect(isAllowedSourceUrl('http://www.afad.gov.tr/deneme')).toBe(false);
    expect(isAllowedSourceUrl('https://example.com/deneme')).toBe(false);
    expect(isAllowedSourceUrl('https://github.com/ilk72/ilk72')).toBe(false);
    expect(isAllowedSourceUrl(null)).toBe(false);
  });

  it('adres çözümlemesi yalnızca https kabul eder', () => {
    expect(parseHttpsUrl('https://tdth.afad.gov.tr')).toBeInstanceOf(URL);
    expect(parseHttpsUrl('ftp://www.afad.gov.tr/deneme')).toBeUndefined();
    expect(parseHttpsUrl('gecersiz-adres')).toBeUndefined();
  });
});

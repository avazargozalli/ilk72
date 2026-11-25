/**
 * Şartname §13.3, §18.6 — gerçek içerik kaydının eksiksizliği ve onay kapısının
 * gerçek kayıt üzerindeki davranışı:
 *  - bütün dış bağlantılar izinli alan adlarında,
 *  - taslak madde varken `prod` denetimi madde madde hata veriyor,
 *  - `K-ONERI-DOGRULA` (ve adresi bulunmayan diğer anahtarlar) taşıyan maddeler
 *    `onayli` yapılamıyor.
 */
import { describe, expect, it } from 'vitest';
import { ISSUE_CODES, runContentCheck } from '../../src/content/check.ts';
import type { ContentCategory } from '../../src/content/registry.ts';
import {
  CONTENT_ITEMS,
  CONTENT_TEXT_MAX,
  CONTENT_VERSION,
  contentByCategory,
  getContentItem,
} from '../../src/content/registry.ts';
import { isAllowedSourceUrl, SOURCES, SOURCES_BY_KEY } from '../../src/content/sources.ts';

function ids(prefix: string, from: number, to: number): string[] {
  return Array.from({ length: to - from + 1 }, (_, index) => {
    const value = String(from + index).padStart(2, '0');
    return `${prefix}-${value}`;
  });
}

/** §13.3 tablolarındaki kimlikler. */
const EXPECTED_IDS: Record<ContentCategory, string[]> = {
  plan: ids('P', 1, 12),
  canta: [
    ...ids('C', 1, 18),
    ...ids('C', 20, 24),
    ...ids('C', 30, 32),
    'C-40',
    'C-41',
    ...ids('C', 90, 94),
  ],
  belge: ids('B', 1, 5),
  tehlike: ids('H', 1, 10),
  once: ids('O', 1, 7),
  an: ids('A', 1, 6),
  sonra: ids('S', 1, 10),
};

describe('§13.3 — başlangıç içeriğinin tamamı', () => {
  it('kategori kategori beklenen kimlikleri taşır', () => {
    let total = 0;
    for (const [category, expected] of Object.entries(EXPECTED_IDS)) {
      const items = contentByCategory(category as ContentCategory);
      expect(
        items.map((item) => item.id),
        category,
      ).toEqual(expected);
      total += items.length;
    }
    expect(total).toBe(83);
    expect(CONTENT_ITEMS).toHaveLength(83);
  });

  it('kimlikler benzersizdir ve kimlikle madde bulunur', () => {
    const itemIds = CONTENT_ITEMS.map((item) => item.id);
    expect(new Set(itemIds).size).toBe(itemIds.length);
    expect(getContentItem('P-01')?.category).toBe('plan');
    expect(getContentItem('K-YOK')).toBeUndefined();
  });

  it('içerik sürümü pozitif bir tamsayıdır', () => {
    expect(Number.isInteger(CONTENT_VERSION)).toBe(true);
    expect(CONTENT_VERSION).toBeGreaterThan(0);
  });

  it('her madde kaynaklıdır, kaynakları kayıtlıdır ve metin sınırındadır', () => {
    for (const item of CONTENT_ITEMS) {
      expect(item.sources.length, item.id).toBeGreaterThanOrEqual(1);
      for (const key of item.sources) {
        expect(SOURCES_BY_KEY[key], `${item.id} → ${key}`).toBeDefined();
      }
      expect(item.text.length, item.id).toBeGreaterThan(0);
      expect(item.text.length, item.id).toBeLessThanOrEqual(CONTENT_TEXT_MAX);
      expect(item.text, item.id).toBe(item.text.trim());
    }
  });

  it('uygulamadaki bütün dış bağlantılar izinli alan adlarındadır', () => {
    const linked = SOURCES.filter((source) => source.url !== null);
    expect(linked).toHaveLength(SOURCES.length);

    for (const source of linked) {
      expect(source.url?.startsWith('https://'), source.key).toBe(true);
      expect(isAllowedSourceUrl(source.url), source.key).toBe(true);
    }

    for (const source of SOURCES) {
      if (source.verified) {
        expect(source.url, source.key).not.toBeNull();
      }
    }
  });
});

describe('§13.4, §18.6 — gerçek kayıt onay kapısı', () => {
  it('geliştirme denetimi hatasızdır ve her maddenin geçerli kaynağı vardır', () => {
    const result = runContentCheck();
    expect(result.errors).toEqual([]);
    for (const item of CONTENT_ITEMS) {
      for (const key of item.sources) {
        expect(SOURCES_BY_KEY[key]?.verified, item.id).toBe(true);
      }
    }
  });

  it('üretim denetimi taslak kalan her maddeyi bildirir', () => {
    const result = runContentCheck({ prod: true });
    const drafts = CONTENT_ITEMS.filter((item) => item.status === 'taslak');
    const issues = result.errors.filter((issue) => issue.code === ISSUE_CODES.draftInProd);
    expect(issues.map((issue) => issue.itemId)).toEqual(drafts.map((item) => item.id));
    expect(result.errors).toEqual(issues);
  });
});

describe('§18.6 — kayıt bütünlüğü ek denetimleri', () => {
  it('her maddenin kategorisi kendi tablosuyla uyumludur', () => {
    for (const [category, expected] of Object.entries(EXPECTED_IDS)) {
      for (const id of expected) {
        expect(getContentItem(id)?.category, id).toBe(category);
      }
    }
  });

  it('metinlerde baştaki/sondaki boşluk ve çift boşluk yoktur', () => {
    for (const item of CONTENT_ITEMS) {
      expect(item.text, item.id).not.toMatch(/\s{2,}/);
      expect(item.text, item.id).not.toMatch(/^\s|\s$/);
    }
  });

  it('içerik metinlerinde yasaklı ifadeler yoktur', () => {
    // §18.6: sahte güven, garanti, resmî uygulama izlenimi, para toplama.
    // Arayüz/i18n metinlerinin taranması A6 aşamasının işidir; hukuki
    // sayfalardaki açıklayıcı kullanımlar orada istisna listesiyle ele alınır.
    const forbidden = ['güvendesiniz', 'garanti', 'resmî uygulama', 'bağış', 'iban'];

    for (const item of CONTENT_ITEMS) {
      const text = item.text.toLowerCase();
      for (const phrase of forbidden) {
        expect(text, `${item.id}: "${phrase}"`).not.toContain(phrase);
      }
    }
  });
});

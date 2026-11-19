/**
 * Şartname §13.3, §18.6 — gerçek içerik kaydının eksiksizliği ve onay kapısının
 * gerçek kayıt üzerindeki davranışı:
 *  - bütün dış bağlantılar izinli alan adlarında,
 *  - taslak madde varken `prod` denetimi madde madde hata veriyor,
 *  - `K-ONERI-DOGRULA` (ve adresi bulunmayan diğer anahtarlar) taşıyan maddeler
 *    `onayli` yapılamıyor.
 */
import { describe, expect, it } from 'vitest';
import { checkContent, ISSUE_CODES, runContentCheck } from '../../src/content/check.ts';
import type { ContentCategory } from '../../src/content/registry.ts';
import {
  CONTENT_ITEMS,
  CONTENT_TEXT_MAX,
  CONTENT_VERSION,
  contentByCategory,
  getContentItem,
} from '../../src/content/registry.ts';
import { isAllowedSourceUrl, SOURCES, SOURCES_BY_KEY } from '../../src/content/sources.ts';
import { FIXED_NOW } from './fixtures.ts';

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

const UNVERIFIED_KEYS = SOURCES.filter((source) => !source.verified).map((source) => source.key);

/** Bir maddede doğrulanmamış kaynak var mı? */
function holdsUnverifiedSource(itemId: string): boolean {
  return (
    getContentItem(itemId)?.sources.some((key) => SOURCES_BY_KEY[key]?.verified !== true) ?? false
  );
}

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

  it('bütün maddeler taslaktır ve içerik sürümü 1', () => {
    expect(CONTENT_VERSION).toBe(1);
    for (const item of CONTENT_ITEMS) {
      expect(item.status, item.id).toBe('taslak');
    }
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
    expect(linked).toHaveLength(24);

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
  it('geliştirme denetimi hatasız geçer, doğrulanmamış kaynakları uyarır', () => {
    const result = runContentCheck();

    expect(result.errors).toEqual([]);
    expect(result.warnings).toHaveLength(UNVERIFIED_KEYS.length);
    expect(result.warnings.every((issue) => issue.code === ISSUE_CODES.unverifiedSource)).toBe(
      true,
    );
    const details = result.warnings.map((issue) => issue.detail).join(' ');
    for (const key of UNVERIFIED_KEYS) {
      expect(details, key).toContain(key);
    }
  });

  it('taslak madde varken üretim denetimi her madde için hata verir', () => {
    const result = runContentCheck({ prod: true, now: FIXED_NOW });
    const draftIssues = result.errors.filter((issue) => issue.code === ISSUE_CODES.draftInProd);

    expect(result.errors).toHaveLength(CONTENT_ITEMS.length);
    expect(draftIssues).toHaveLength(CONTENT_ITEMS.length);
    expect(draftIssues.map((issue) => issue.itemId)).toEqual(CONTENT_ITEMS.map((item) => item.id));
    expect(draftIssues.every((issue) => issue.detail.includes('onay bekliyor'))).toBe(true);
    expect(result.warnings).toHaveLength(UNVERIFIED_KEYS.length);
  });

  it('K-ONERI-DOGRULA taşıyan maddeler onayli yapılamaz', () => {
    const source = SOURCES_BY_KEY['K-ONERI-DOGRULA'];
    expect(source?.url).toBeNull();
    expect(source?.verified).toBe(false);

    const locked = CONTENT_ITEMS.filter((item) => item.sources.includes('K-ONERI-DOGRULA'));
    expect(locked.map((item) => item.id)).toEqual([
      'C-18',
      'C-20',
      'C-21',
      'C-22',
      'C-23',
      'C-24',
      'C-30',
      'C-31',
      'C-32',
      'C-40',
      'C-41',
      'C-91',
      'B-04',
      'B-05',
      'H-10',
    ]);

    const approved = locked.map((item) => ({
      ...item,
      status: 'onayli' as const,
      reviewedBy: 'Afet eğitmeni',
      reviewedAt: '2026-11-01',
    }));
    const result = checkContent({
      items: approved,
      sources: SOURCES,
      prod: true,
      now: FIXED_NOW,
    });
    const issues = result.errors.filter((issue) => issue.code === ISSUE_CODES.notApprovableSource);

    expect(issues).toHaveLength(approved.length);
    for (const item of approved) {
      const issue = issues.find((entry) => entry.itemId === item.id);
      expect(issue, item.id).toBeDefined();
      expect(issue?.detail).toContain('K-ONERI-DOGRULA');
    }
    expect(result.errors.filter((issue) => issue.code === ISSUE_CODES.draftInProd)).toEqual([]);
  });

  it('adresi bulunmayan bütün anahtarlar üretimde onayı engeller', () => {
    const lockedIds = CONTENT_ITEMS.filter((item) => holdsUnverifiedSource(item.id)).map(
      (item) => item.id,
    );
    expect(lockedIds).toHaveLength(20);

    const approved = CONTENT_ITEMS.map((item) => ({
      ...item,
      status: 'onayli' as const,
      reviewedBy: 'Afet eğitmeni',
      reviewedAt: '2026-11-01',
    }));
    const result = checkContent({
      items: approved,
      sources: SOURCES,
      prod: true,
      now: FIXED_NOW,
    });

    expect(result.errors.map((issue) => issue.itemId).sort()).toEqual([...lockedIds].sort());
    expect(result.errors.every((issue) => issue.code === ISSUE_CODES.notApprovableSource)).toBe(
      true,
    );
    expect(result.warnings).toEqual([]);
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

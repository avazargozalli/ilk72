/**
 * Şartname §13.4, §18.6 — onay kapısı kurallarının her biri için olumlu ve
 * olumsuz örnek. Testler sahte kayıt (fixture) kullanır; gerçek registry ve
 * kaynak kaydı bozulmaz.
 */
import { describe, expect, it } from 'vitest';
import { checkContent, ISSUE_CODES } from '../../src/content/check.ts';
import { CONTENT_TEXT_MAX } from '../../src/content/registry.ts';
import { errorsWithCode, FIXED_NOW, makeItem, makeSource, warningsWithCode } from './fixtures.ts';

const reviewed = {
  status: 'onayli' as const,
  reviewedBy: 'Afet eğitmeni',
  reviewedAt: '2026-05-01',
};

describe('§13.4-1 — her maddenin en az bir kaynağı var', () => {
  it('olumlu: kaynaklı madde hatasız geçer', () => {
    const result = checkContent({
      items: [makeItem()],
      sources: [makeSource()],
      now: FIXED_NOW,
    });

    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it('olumsuz: kaynaksız madde hata üretir', () => {
    const result = checkContent({
      items: [makeItem({ sources: [] })],
      sources: [makeSource()],
      now: FIXED_NOW,
    });
    const issues = errorsWithCode(result, ISSUE_CODES.missingSources);

    expect(issues).toHaveLength(1);
    expect(issues[0]?.itemId).toBe('T-01');
    expect(issues[0]?.detail).toContain('T-01');
  });
});

describe('§13.4-1 — kaynak anahtarları kayıtlı', () => {
  it('olumlu: kayıtlı anahtar hata üretmez', () => {
    const result = checkContent({
      items: [makeItem({ sources: ['K-DENEME'] })],
      sources: [makeSource()],
      now: FIXED_NOW,
    });

    expect(result.errors).toEqual([]);
  });

  it('olumsuz: kayıtsız anahtar bilinmeyen-kaynak hatası üretir', () => {
    const result = checkContent({
      items: [makeItem({ sources: ['K-YOK'] })],
      sources: [makeSource()],
      now: FIXED_NOW,
    });
    const issues = errorsWithCode(result, ISSUE_CODES.unknownSource);

    expect(issues).toHaveLength(1);
    expect(issues[0]?.itemId).toBe('T-01');
    expect(issues[0]?.detail).toContain('K-YOK');
  });
});

describe('§13.4-1 — kaynak adresi https ve izinli alan adında', () => {
  it('olumlu: https ve izinli alt alan adı geçer', () => {
    const result = checkContent({
      items: [makeItem()],
      sources: [makeSource({ url: 'https://kirsehir.afad.gov.tr/aile-afet-ve-acil-durum-plani' })],
      now: FIXED_NOW,
    });

    expect(result.errors).toEqual([]);
  });

  it('olumsuz: https olmayan adres hata üretir', () => {
    const result = checkContent({
      items: [makeItem()],
      sources: [makeSource({ url: 'http://www.afad.gov.tr/deneme' })],
      now: FIXED_NOW,
    });
    const issues = errorsWithCode(result, ISSUE_CODES.invalidSourceUrl);

    expect(issues).toHaveLength(1);
    expect(issues[0]?.detail).toContain('https');
  });

  it('olumsuz: izinli listede olmayan alan adı hata üretir', () => {
    const result = checkContent({
      items: [makeItem()],
      sources: [makeSource({ url: 'https://example.com/deneme' })],
      now: FIXED_NOW,
    });

    expect(errorsWithCode(result, ISSUE_CODES.invalidSourceUrl)).toHaveLength(1);
  });

  it('olumsuz: izinli alan adına benzeyen sahte alan adı hata üretir', () => {
    const result = checkContent({
      items: [makeItem()],
      sources: [makeSource({ url: 'https://afad.gov.tr.example.com/deneme' })],
      now: FIXED_NOW,
    });

    expect(errorsWithCode(result, ISSUE_CODES.invalidSourceUrl)).toHaveLength(1);
  });

  it('olumsuz: depo/lisans istisnası kaynak adresi olarak kullanılamaz', () => {
    const result = checkContent({
      items: [makeItem()],
      sources: [makeSource({ url: 'https://github.com/ilk72/ilk72' })],
      now: FIXED_NOW,
    });

    expect(errorsWithCode(result, ISSUE_CODES.invalidSourceUrl)).toHaveLength(1);
  });

  it('olumsuz: doğrulanmış ama adresi olmayan kaynak hata üretir', () => {
    const result = checkContent({
      items: [],
      sources: [makeSource({ url: null, verified: true })],
      now: FIXED_NOW,
    });
    const issues = errorsWithCode(result, ISSUE_CODES.invalidSourceUrl);

    expect(issues).toHaveLength(1);
    expect(issues[0]?.detail).toContain('adresi yok');
  });

  it('olumsuz: yinelenen kaynak anahtarı hata üretir', () => {
    const result = checkContent({
      items: [makeItem()],
      sources: [makeSource(), makeSource()],
      now: FIXED_NOW,
    });
    const issues = errorsWithCode(result, ISSUE_CODES.duplicateSourceKey);

    expect(issues).toHaveLength(1);
    expect(issues[0]?.detail).toContain('K-DENEME');
  });

  it.each(['', '2026-02-30', '2026-11-20'])(
    'geçersiz erişim tarihini reddeder (%s)',
    (accessed) => {
      const result = checkContent({
        items: [makeItem()],
        sources: [makeSource({ accessed })],
        now: FIXED_NOW,
      });

      expect(errorsWithCode(result, ISSUE_CODES.invalidSourceDate)).toHaveLength(1);
    },
  );
});

describe('§13.4-1 — metin en fazla 220 karakter', () => {
  it('olumlu: tam 220 karakter geçer', () => {
    const result = checkContent({
      items: [makeItem({ text: 'a'.repeat(CONTENT_TEXT_MAX) })],
      sources: [makeSource()],
      now: FIXED_NOW,
    });

    expect(result.errors).toEqual([]);
  });

  it('olumsuz: 221 karakter hata üretir', () => {
    const result = checkContent({
      items: [makeItem({ text: 'a'.repeat(CONTENT_TEXT_MAX + 1) })],
      sources: [makeSource()],
      now: FIXED_NOW,
    });
    const issues = errorsWithCode(result, ISSUE_CODES.textTooLong);

    expect(issues).toHaveLength(1);
    expect(issues[0]?.itemId).toBe('T-01');
    expect(issues[0]?.detail).toContain(String(CONTENT_TEXT_MAX + 1));
  });

  it('boş metni reddeder', () => {
    const result = checkContent({
      items: [makeItem({ text: '   ' })],
      sources: [makeSource()],
      now: FIXED_NOW,
    });

    expect(errorsWithCode(result, ISSUE_CODES.missingText)).toHaveLength(1);
  });
});

describe('§13.4-1 — onayli maddede reviewedBy ve reviewedAt dolu', () => {
  it('olumlu: dolu inceleme alanları geçer', () => {
    const result = checkContent({
      items: [makeItem(reviewed)],
      sources: [makeSource()],
      now: FIXED_NOW,
    });

    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it('olumsuz: reviewedBy boşsa hata üretir', () => {
    const result = checkContent({
      items: [makeItem({ status: 'onayli', reviewedAt: '2026-05-01' })],
      sources: [makeSource()],
      now: FIXED_NOW,
    });
    const issues = errorsWithCode(result, ISSUE_CODES.missingReview);

    expect(issues).toHaveLength(1);
    expect(issues[0]?.detail).toContain('reviewedBy');
    expect(issues[0]?.detail).not.toContain('reviewedAt');
  });

  it('olumsuz: reviewedAt boşsa hata üretir', () => {
    const result = checkContent({
      items: [makeItem({ status: 'onayli', reviewedBy: 'Afet eğitmeni' })],
      sources: [makeSource()],
      now: FIXED_NOW,
    });
    const issues = errorsWithCode(result, ISSUE_CODES.missingReview);

    expect(issues).toHaveLength(1);
    expect(issues[0]?.detail).toContain('reviewedAt');
  });

  it('olumsuz: ikisi de boşsa tek hatada ikisini de listeler', () => {
    const result = checkContent({
      items: [makeItem({ status: 'onayli' })],
      sources: [makeSource()],
      now: FIXED_NOW,
    });
    const issues = errorsWithCode(result, ISSUE_CODES.missingReview);

    expect(issues).toHaveLength(1);
    expect(issues[0]?.detail).toContain('reviewedBy');
    expect(issues[0]?.detail).toContain('reviewedAt');
  });

  it('olumsuz: geçersiz takvim tarihi hata üretir', () => {
    const result = checkContent({
      items: [makeItem({ ...reviewed, reviewedAt: '2026-02-30' })],
      sources: [makeSource()],
      now: FIXED_NOW,
    });
    const issues = errorsWithCode(result, ISSUE_CODES.invalidReviewDate);

    expect(issues).toHaveLength(1);
    expect(issues[0]?.detail).toContain('2026-02-30');
  });

  it('olumsuz: YYYY-AA-GG olmayan tarih hata üretir', () => {
    const result = checkContent({
      items: [makeItem({ ...reviewed, reviewedAt: '19.11.2026' })],
      sources: [makeSource()],
      now: FIXED_NOW,
    });

    expect(errorsWithCode(result, ISSUE_CODES.invalidReviewDate)).toHaveLength(1);
  });

  it('üretimde gelecekteki incelemeyi reddeder', () => {
    const result = checkContent({
      items: [makeItem({ ...reviewed, reviewedAt: '2026-11-20' })],
      sources: [makeSource()],
      prod: true,
      now: FIXED_NOW,
    });

    expect(errorsWithCode(result, ISSUE_CODES.invalidReviewDate)).toHaveLength(1);
  });

  it('erişim ve inceleme tarihlerini Türkiye takvim gününe göre kabul eder', () => {
    const nextDay = '2026-11-20';
    const result = checkContent({
      items: [makeItem({ ...reviewed, reviewedAt: nextDay })],
      sources: [makeSource({ accessed: nextDay })],
      now: new Date('2026-11-19T21:00:00Z'),
    });

    expect(result.errors).toEqual([]);
  });
});

describe('§13.4-1 — onayli madde doğrulanmamış kaynak taşıyamaz', () => {
  it('olumlu: taslak maddede doğrulanmamış kaynak yalnızca uyarı üretir', () => {
    const result = checkContent({
      items: [makeItem({ sources: ['K-ONERI-DOGRULA'] })],
      sources: [makeSource({ key: 'K-ONERI-DOGRULA', url: null, verified: false })],
      now: FIXED_NOW,
    });
    const warnings = warningsWithCode(result, ISSUE_CODES.unverifiedSource);

    expect(result.errors).toEqual([]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]?.detail).toContain('K-ONERI-DOGRULA');
    expect(warnings[0]?.detail).toContain('T-01');
  });

  it('olumsuz: onayli madde doğrulanmamış kaynak taşırsa hata üretir', () => {
    const result = checkContent({
      items: [makeItem({ ...reviewed, sources: ['K-ONERI-DOGRULA'] })],
      sources: [makeSource({ key: 'K-ONERI-DOGRULA', url: null, verified: false })],
      now: FIXED_NOW,
    });
    const issues = errorsWithCode(result, ISSUE_CODES.notApprovableSource);

    expect(issues).toHaveLength(1);
    expect(issues[0]?.itemId).toBe('T-01');
    expect(issues[0]?.detail).toContain('K-ONERI-DOGRULA');
  });

  it('olumsuz: onayli madde geçersiz adresli kaynak taşırsa hata üretir', () => {
    const result = checkContent({
      items: [makeItem(reviewed)],
      sources: [makeSource({ url: 'http://www.afad.gov.tr/deneme' })],
      now: FIXED_NOW,
    });

    expect(errorsWithCode(result, ISSUE_CODES.invalidSourceUrl)).toHaveLength(1);
    expect(errorsWithCode(result, ISSUE_CODES.notApprovableSource)).toHaveLength(1);
  });
});

describe('§13.4-4 — 12 ay uyarı, 18 ay hata', () => {
  const itemReviewedAt = (reviewedAt: string) =>
    makeItem({
      status: 'onayli',
      reviewedBy: 'Afet eğitmeni',
      reviewedAt,
    });

  it('olumlu: 12 aydan yeni inceleme uyarı üretmez', () => {
    const result = checkContent({
      items: [itemReviewedAt('2025-11-20')],
      sources: [makeSource()],
      now: FIXED_NOW,
    });

    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it('olumsuz: tam 12 ay geçen inceleme uyarı üretir', () => {
    const result = checkContent({
      items: [itemReviewedAt('2025-11-19')],
      sources: [makeSource()],
      now: FIXED_NOW,
    });
    const warnings = warningsWithCode(result, ISSUE_CODES.staleReview);

    expect(result.errors).toEqual([]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]?.detail).toContain('12');
  });

  it('18 ayı geçen inceleme geliştirmede uyarır, üretimi durdurur', () => {
    const input = {
      items: [itemReviewedAt('2025-05-19')],
      sources: [makeSource()],
      now: FIXED_NOW,
    };
    const devResult = checkContent(input);
    expect(devResult.errors).toEqual([]);
    expect(warningsWithCode(devResult, ISSUE_CODES.expiredReview)).toHaveLength(1);
    const result = checkContent({
      ...input,
      prod: true,
    });
    const issues = errorsWithCode(result, ISSUE_CODES.expiredReview);

    expect(issues).toHaveLength(1);
    expect(issues[0]?.itemId).toBe('T-01');
    expect(warningsWithCode(result, ISSUE_CODES.staleReview)).toEqual([]);
  });

  it('olumsuz: 18 aya yakın inceleme yalnızca uyarı üretir', () => {
    const result = checkContent({
      items: [itemReviewedAt('2025-05-20')],
      sources: [makeSource()],
      now: FIXED_NOW,
    });

    expect(result.errors).toEqual([]);
    expect(warningsWithCode(result, ISSUE_CODES.staleReview)).toHaveLength(1);
  });

  it('olumsuz: 29 Şubat incelemesi ay sonuna kısaltılarak hesaplanır', () => {
    const result = checkContent({
      items: [itemReviewedAt('2024-02-29')],
      sources: [makeSource({ accessed: '2024-02-29' })],
      now: new Date('2025-02-28T00:00:00.000Z'),
    });

    expect(result.errors).toEqual([]);
    expect(warningsWithCode(result, ISSUE_CODES.staleReview)).toHaveLength(1);
  });
});

describe('§13.4-1 — id benzersizliği', () => {
  it('olumlu: benzersiz kimlikler hata üretmez', () => {
    const result = checkContent({
      items: [makeItem({ id: 'T-01' }), makeItem({ id: 'T-02' })],
      sources: [makeSource()],
      now: FIXED_NOW,
    });

    expect(result.errors).toEqual([]);
  });

  it('olumsuz: yinelenen kimlik hata üretir', () => {
    const result = checkContent({
      items: [makeItem({ id: 'T-01' }), makeItem({ id: 'T-01', text: 'İkinci madde.' })],
      sources: [makeSource()],
      now: FIXED_NOW,
    });
    const issues = errorsWithCode(result, ISSUE_CODES.duplicateId);

    expect(issues).toHaveLength(1);
    expect(issues[0]?.itemId).toBe('T-01');
    expect(issues[0]?.detail).toContain('2');
  });
});

describe('§13.4-2 — üretimde taslak içerik', () => {
  it('olumlu: geliştirme kipinde taslaklar hata üretmez', () => {
    const result = checkContent({
      items: [makeItem(), makeItem({ id: 'T-02' })],
      sources: [makeSource()],
      prod: false,
      now: FIXED_NOW,
    });

    expect(result.errors).toEqual([]);
  });

  it('olumsuz: üretim kipinde her taslak madde ayrı hata üretir', () => {
    const result = checkContent({
      items: [makeItem(), makeItem({ id: 'T-02' })],
      sources: [makeSource()],
      prod: true,
      now: FIXED_NOW,
    });
    const issues = errorsWithCode(result, ISSUE_CODES.draftInProd);

    expect(issues).toHaveLength(2);
    expect(issues.map((issue) => issue.itemId)).toEqual(['T-01', 'T-02']);
    expect(issues[0]?.detail).toContain('onay bekliyor');
  });

  it('olumlu: üretim kipinde onaylı ve güncel maddeler hata üretmez', () => {
    const result = checkContent({
      items: [makeItem(reviewed)],
      sources: [makeSource()],
      prod: true,
      now: FIXED_NOW,
    });

    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });
});

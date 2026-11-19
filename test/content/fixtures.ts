/**
 * İçerik testleri için sahte kayıt üreticileri.
 *
 * `checkContent()` gerçek kaydı değiştirmediği için kurallar burada üretilen
 * tek kullanımlık maddeler ve kaynaklarla denenir; gerçek registry bozulmaz.
 */
import type { ContentCheckResult, Issue } from '../../src/content/check.ts';
import type { ContentItem } from '../../src/content/registry.ts';
import type { Source } from '../../src/content/sources.ts';

/** Bütün inceleme tarihi testlerinde sabit "şimdi" (şartname tarihi). */
export const FIXED_NOW = new Date('2026-11-19T12:00:00.000Z');

/** Geçerli, doğrulanmış bir kaynak; alanlar istenirse değiştirilir. */
export function makeSource(overrides: Partial<Source> = {}): Source {
  return {
    key: 'K-DENEME',
    org: 'Deneme Kurumu',
    title: 'Deneme Sayfası',
    url: 'https://www.afad.gov.tr/deneme-sayfasi',
    accessed: '2026-11-19',
    verified: true,
    ...overrides,
  };
}

/** Geçerli bir taslak madde; alanlar istenirse değiştirilir. */
export function makeItem(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: 'T-01',
    category: 'plan',
    text: 'Deneme amaçlı içerik maddesi.',
    sources: ['K-DENEME'],
    status: 'taslak',
    ...overrides,
  };
}

export function errorsWithCode(result: ContentCheckResult, code: string): Issue[] {
  return result.errors.filter((issue) => issue.code === code);
}

export function warningsWithCode(result: ContentCheckResult, code: string): Issue[] {
  return result.warnings.filter((issue) => issue.code === code);
}

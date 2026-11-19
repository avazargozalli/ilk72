/**
 * Şartname §8.3 — `warnings.ts`: makine kodları, Türkçe karşılıkları ve
 * `sanitizePlan`'ın döndürdüğü "kod:yol" dizelerinin çözümlenmesi.
 */
import { describe, expect, it } from 'vitest';
import {
  formatWarning,
  isPlanWarning,
  PLAN_WARNINGS,
  type PlanWarning,
  parseWarning,
  WARNING_TEXT_TR,
} from '../../src/model/warnings';

describe('uyarı kodları', () => {
  it('her kod için boş olmayan Türkçe karşılık tanımlar', () => {
    for (const code of PLAN_WARNINGS) {
      expect(WARNING_TEXT_TR[code].length, code).toBeGreaterThan(0);
    }
    expect(Object.keys(WARNING_TEXT_TR).sort()).toEqual([...PLAN_WARNINGS].sort());
  });

  it('kod listesi tekrarsızdır ve makine kodları Türkçe karakter içermez', () => {
    expect(new Set(PLAN_WARNINGS).size).toBe(PLAN_WARNINGS.length);
    for (const code of PLAN_WARNINGS) {
      expect(code).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('isPlanWarning yalnızca tanımlı kodlar için doğrudur', () => {
    for (const code of PLAN_WARNINGS) {
      expect(isPlanWarning(code), code).toBe(true);
    }
    expect(isPlanWarning('bilinmeyen-kod')).toBe(false);
    expect(isPlanWarning('')).toBe(false);
  });
});

describe('kod ile alan yolunu birleştirme', () => {
  it('"kod:yol" biçiminde tek dize üretir (§8.3 sözleşmesi)', () => {
    expect(formatWarning({ code: 'sinir-asildi', path: 'members[0].name' })).toBe(
      'sinir-asildi:members[0].name',
    );
    expect(formatWarning({ code: 'bilinmeyen-alan', path: 'household.extra' })).toBe(
      'bilinmeyen-alan:household.extra',
    );
  });

  it('bütün kodlar için gidiş-dönüş yapar', () => {
    for (const code of PLAN_WARNINGS) {
      const warning = formatWarning({ code, path: 'notes' });

      expect(parseWarning(warning)).toEqual({ code, path: 'notes' });
    }
  });

  it('boş yolu ve ilk iki nokta üst üstesinden sonraki yolu korur', () => {
    expect(parseWarning('gecersiz-deger:')).toEqual({ code: 'gecersiz-deger', path: '' });
    expect(parseWarning('gecersiz-deger:bag.items[0]:ek')).toEqual({
      code: 'gecersiz-deger',
      path: 'bag.items[0]:ek',
    });
  });

  it('tanınmayan ya da biçimsiz dizelerde null döner', () => {
    expect(parseWarning('bilinmeyen-kod:notes')).toBeNull();
    expect(parseWarning('sinir-asildi')).toBeNull();
    expect(parseWarning(':notes')).toBeNull();
    expect(parseWarning('')).toBeNull();
  });

  it('PlanWarning türü kod listesiyle uyumludur', () => {
    const code: PlanWarning = 'saglik-silindi';

    expect(PLAN_WARNINGS).toContain(code);
  });
});

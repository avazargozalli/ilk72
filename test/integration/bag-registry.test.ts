/**
 * Katmanlar arası sözleşme testi.
 *
 * `src/model/bag.ts` çanta maddelerini yalnızca kimlik olarak seçer; metinler
 * `src/content/registry.ts` içindedir. İki katman birbirini import etmediği
 * için (bkz. docs/mimari.md §1) bu bağ **derleme zamanında** denetlenemez.
 * Bu test o boşluğu kapatır: seçilen her kimlik kayıtta `canta` kategorisinde
 * bulunmalı ve liste dışı not maddeleri (C-90…C-94) listeye girmemelidir.
 */
import { describe, expect, it } from 'vitest';
import { CONTENT_ITEMS } from '../../src/content/registry';
import { buildBagItemIds } from '../../src/model/bag';
import { createEmptyPlan } from '../../src/model/defaults';

const BASE_IDS = Array.from({ length: 18 }, (_, i) => `C-${String(i + 1).padStart(2, '0')}`);
const NOTE_IDS = ['C-90', 'C-91', 'C-92', 'C-93', 'C-94'];

function householdTriggeringEveryCondition() {
  const empty = createEmptyPlan();
  return {
    ...empty,
    healthOptIn: true,
    members: [
      {
        id: 'm1',
        name: 'Bebek',
        group: 'bebek' as const,
        phone: '',
        dailyPlaces: [],
        needs: { mobility: true, hearing: true, vision: false, communication: false, note: '' },
        health: {
          bloodType: '' as const,
          conditions: '',
          medications: 'demir',
          allergies: '',
          devices: 'işitme cihazı',
        },
      },
      {
        id: 'm2',
        name: 'Çocuk',
        group: 'cocuk' as const,
        phone: '',
        dailyPlaces: [],
        needs: { mobility: false, hearing: false, vision: false, communication: false, note: '' },
        health: {
          bloodType: '' as const,
          conditions: '',
          medications: '',
          allergies: '',
          devices: '',
        },
      },
      {
        id: 'm3',
        name: 'Büyükanne',
        group: 'yasli' as const,
        phone: '',
        dailyPlaces: [],
        needs: { mobility: false, hearing: false, vision: false, communication: false, note: '' },
        health: {
          bloodType: '' as const,
          conditions: '',
          medications: '',
          allergies: '',
          devices: '',
        },
      },
    ],
    pets: [{ id: 'p1', name: 'Kedi', kind: 'kedi', note: '' }],
  };
}

describe('çanta kimlikleri ↔ içerik kaydı', () => {
  it('seçilen her kimlik kayıtta canta kategorisinde bulunur', () => {
    const ids = buildBagItemIds(householdTriggeringEveryCondition());
    const cantaIds = new Set(CONTENT_ITEMS.filter((i) => i.category === 'canta').map((i) => i.id));
    expect(ids.filter((id) => !cantaIds.has(id))).toEqual([]);
  });

  it('liste dışı not maddeleri (C-90…C-94) seçilmez', () => {
    const ids = buildBagItemIds(householdTriggeringEveryCondition());
    expect(ids.filter((id) => NOTE_IDS.includes(id))).toEqual([]);
  });

  it('temel 18 madde her hanede bulunur', () => {
    const ids = buildBagItemIds(createEmptyPlan());
    expect(BASE_IDS.filter((id) => !ids.includes(id))).toEqual([]);
  });

  it('koşullu maddeler haneye göre eklenir', () => {
    const ids = buildBagItemIds(householdTriggeringEveryCondition());
    for (const required of ['C-20', 'C-24', 'C-30', 'C-32', 'C-40']) {
      expect(ids).toContain(required);
    }
  });

  it('kimlikler benzersizdir', () => {
    const ids = buildBagItemIds(householdTriggeringEveryCondition());
    expect(new Set(ids).size).toBe(ids.length);
  });
});

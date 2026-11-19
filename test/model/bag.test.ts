/**
 * Şartname §11.6, §18.2 — `bag.ts`: haneye göre çanta listesi üretimi ve
 * işaret durumunun korunması.
 */
import { describe, expect, it } from 'vitest';
import {
  BASE_BAG_ITEM_IDS,
  buildBagItemIds,
  createCustomBagItem,
  isCustomBagItemId,
  MAX_CUSTOM_BAG_ITEMS,
  mergeBagItems,
} from '../../src/model/bag';
import {
  createChecklistItem,
  createEmptyMember,
  createEmptyPet,
  createEmptyPlan,
} from '../../src/model/defaults';
import type { ChecklistState, Health, Member, Plan } from '../../src/model/types';

const EMPTY_HEALTH: Health = {
  bloodType: '',
  conditions: '',
  medications: '',
  allergies: '',
  devices: '',
};

function planWithMember(group: Member['group'], flag: keyof Member['needs'] | null = null): Plan {
  const plan = createEmptyPlan();
  const member = createEmptyMember(group);
  member.name = 'Kişi';
  if (flag !== null && flag !== 'note') {
    member.needs[flag] = true;
  }
  plan.members.push(member);
  return plan;
}

function planWithHealth(health: Partial<Health>): Plan {
  const plan = createEmptyPlan();
  plan.healthOptIn = true;
  const member = createEmptyMember();
  member.name = 'Kişi';
  member.health = { ...EMPTY_HEALTH, ...health };
  plan.members.push(member);
  return plan;
}

function conditionalIds(plan: Plan): string[] {
  return buildBagItemIds(plan).filter(
    (id) => !(BASE_BAG_ITEM_IDS as readonly string[]).includes(id),
  );
}

describe('buildBagItemIds — temel maddeler', () => {
  it('C-01…C-18 listesini tam olarak tanımlar', () => {
    const expected = Array.from(
      { length: 18 },
      (_, index) => `C-${String(index + 1).padStart(2, '0')}`,
    );

    expect(BASE_BAG_ITEM_IDS).toEqual(expected);
  });

  it('her hanede C-01…C-18 bulunur', () => {
    const ids = buildBagItemIds(createEmptyPlan());

    expect(ids).toEqual([...BASE_BAG_ITEM_IDS]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('hane boşken koşullu madde eklemez', () => {
    expect(conditionalIds(createEmptyPlan())).toEqual([]);
  });
});

describe('buildBagItemIds — koşullu maddeler (§11.6 tablosu)', () => {
  it('bebek grubunda kişi varsa C-20…C-23 eklenir', () => {
    expect(conditionalIds(planWithMember('bebek'))).toEqual(['C-20', 'C-21', 'C-22', 'C-23']);
  });

  it('çocuk grubunda kişi varsa C-24 eklenir', () => {
    expect(conditionalIds(planWithMember('cocuk'))).toEqual(['C-24']);
  });

  it('bebek ve çocuk birlikteyse sıra C-20…C-24 olur', () => {
    const plan = createEmptyPlan();
    const baby = createEmptyMember('bebek');
    baby.name = 'Bebek';
    const child = createEmptyMember('cocuk');
    child.name = 'Çocuk';
    plan.members.push(baby, child);

    expect(conditionalIds(plan)).toEqual(['C-20', 'C-21', 'C-22', 'C-23', 'C-24']);
  });

  it('bebek sayısı artınca madde tekrarlanmaz', () => {
    const plan = createEmptyPlan();
    for (const name of ['Bebek 1', 'Bebek 2']) {
      const baby = createEmptyMember('bebek');
      baby.name = name;
      plan.members.push(baby);
    }

    const ids = buildBagItemIds(plan);

    expect(ids.filter((id) => id === 'C-20')).toHaveLength(1);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('herhangi bir needs.* işaretliyse C-30 ve C-31 eklenir', () => {
    for (const flag of ['mobility', 'hearing', 'vision', 'communication'] as const) {
      expect(conditionalIds(planWithMember('yetiskin', flag)), flag).toEqual(['C-30', 'C-31']);
    }
  });

  it('health.devices doluysa C-30 ve C-31 eklenir', () => {
    expect(conditionalIds(planWithHealth({ devices: 'İşitme cihazı' }))).toEqual(['C-30', 'C-31']);
  });

  it('health.devices boşsa C-30 eklenmez', () => {
    expect(conditionalIds(planWithHealth({ devices: '   ' }))).toEqual([]);
  });

  it('health.medications doluysa C-32 eklenir', () => {
    expect(conditionalIds(planWithHealth({ medications: 'İnhaler' }))).toEqual(['C-32']);
  });

  it('yaşlı grubunda kişi varsa C-32 eklenir', () => {
    expect(conditionalIds(planWithMember('yasli'))).toEqual(['C-32']);
  });

  it('evcil hayvan varsa C-40 ve C-41 eklenir', () => {
    const plan = createEmptyPlan();
    plan.pets.push(createEmptyPet());

    expect(conditionalIds(plan)).toEqual(['C-40', 'C-41']);
  });

  it('evcil hayvan yoksa C-40 eklenmez', () => {
    expect(conditionalIds(createEmptyPlan())).not.toContain('C-40');
  });

  it('bütün koşullar birlikteyse maddeler numara sırasıyla eklenir', () => {
    const plan = createEmptyPlan();
    plan.healthOptIn = true;
    const baby = createEmptyMember('bebek');
    baby.name = 'Bebek';
    const child = createEmptyMember('cocuk');
    child.name = 'Çocuk';
    child.needs.mobility = true;
    const elder = createEmptyMember('yasli');
    elder.name = 'Büyükanne';
    elder.health = { ...EMPTY_HEALTH, medications: 'Tansiyon ilacı' };
    plan.members.push(baby, child, elder);
    plan.pets.push(createEmptyPet());

    const ids = buildBagItemIds(plan);
    const expectedConditional = [
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
    ];

    expect(ids).toEqual([...BASE_BAG_ITEM_IDS, ...expectedConditional]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('özel maddeleri listeye katmaz', () => {
    const plan = createEmptyPlan();
    plan.bag.items = [createChecklistItem('ozel-sabit')];

    expect(buildBagItemIds(plan)).toEqual([...BASE_BAG_ITEM_IDS]);
  });
});

describe('mergeBagItems — işaret durumunun korunması', () => {
  const previous: ChecklistState[] = [
    { id: 'C-01', done: true, note: '6 şişe' },
    { id: 'C-02', done: false, note: '' },
    { id: 'C-20', done: true, note: 'Bebek maması' },
    { id: 'ozel-a', done: true, note: 'Kendi maddem' },
  ];

  it('id üzerinden işareti ve notu korur', () => {
    const merged = mergeBagItems(previous, ['C-01', 'C-02', 'C-03']);

    expect(merged).toEqual([
      { id: 'C-01', done: true, note: '6 şişe' },
      { id: 'C-02', done: false, note: '' },
      { id: 'C-03', done: false, note: '' },
      { id: 'ozel-a', done: true, note: 'Kendi maddem' },
    ]);
  });

  it('yeni maddeler işaretsiz ve notsuz eklenir', () => {
    const merged = mergeBagItems([], ['C-01', 'C-05']);

    expect(merged).toEqual([
      { id: 'C-01', done: false, note: '' },
      { id: 'C-05', done: false, note: '' },
    ]);
  });

  it('koşulu kalkan maddeler düşürülür, işareti kaybolur', () => {
    const merged = mergeBagItems(previous, ['C-01', 'C-02']);

    expect(merged.map((item) => item.id)).toEqual(['C-01', 'C-02', 'ozel-a']);
    expect(merged.some((item) => item.id === 'C-20')).toBe(false);
  });

  it('özel maddeleri sona ekleyerek korur', () => {
    const merged = mergeBagItems(previous, ['C-01', 'C-02', 'C-20']);

    expect(merged.map((item) => item.id)).toEqual(['C-01', 'C-02', 'C-20', 'ozel-a']);
    expect(merged[3]).toEqual({ id: 'ozel-a', done: true, note: 'Kendi maddem' });
  });

  it('en çok 15 özel madde tutar, fazlasını atar', () => {
    const many: ChecklistState[] = Array.from({ length: MAX_CUSTOM_BAG_ITEMS + 5 }, (_, index) => ({
      id: `ozel-${index}`,
      done: index % 2 === 0,
      note: `Not ${index}`,
    }));

    const merged = mergeBagItems(many, ['C-01']);

    expect(merged).toHaveLength(1 + MAX_CUSTOM_BAG_ITEMS);
    expect(MAX_CUSTOM_BAG_ITEMS).toBe(15);
    expect(merged.slice(1).map((item) => item.id)).toEqual(
      many.slice(0, MAX_CUSTOM_BAG_ITEMS).map((item) => item.id),
    );
    expect(merged[1]).toEqual({ id: 'ozel-0', done: true, note: 'Not 0' });
  });

  it('aynı id birden çok kez verilirse tek madde üretir', () => {
    const merged = mergeBagItems([], ['C-01', 'C-01', 'C-02']);

    expect(merged.map((item) => item.id)).toEqual(['C-01', 'C-02']);
  });

  it('önceki listede yinelenen id varsa ilk kaydı kullanır', () => {
    const merged = mergeBagItems(
      [
        { id: 'C-01', done: true, note: 'ilk' },
        { id: 'C-01', done: false, note: 'ikinci' },
      ],
      ['C-01'],
    );

    expect(merged).toEqual([{ id: 'C-01', done: true, note: 'ilk' }]);
  });

  it('üretilen listede yer alan özel id çoğaltılmaz', () => {
    const merged = mergeBagItems(previous, ['ozel-a']);

    expect(merged).toEqual([{ id: 'ozel-a', done: true, note: 'Kendi maddem' }]);
  });

  it('tanınmayan, özel olmayan maddeleri düşürür', () => {
    const merged = mergeBagItems([{ id: 'X-99', done: true, note: 'eski' }], ['C-01']);

    expect(merged).toEqual([{ id: 'C-01', done: false, note: '' }]);
  });

  it('girdileri değiştirmez ve sonuç nesnelerini paylaşmaz', () => {
    const ids = ['C-01', 'C-02'];
    const beforePrevious = JSON.stringify(previous);
    const beforeIds = JSON.stringify(ids);

    const merged = mergeBagItems(previous, ids);
    const firstMerged = merged[0];
    expect(firstMerged).toBeDefined();
    if (firstMerged !== undefined) firstMerged.done = false;

    expect(previous[0]?.done).toBe(true);
    expect(JSON.stringify(previous)).toBe(beforePrevious);
    expect(JSON.stringify(ids)).toBe(beforeIds);
    expect(merged[0]).not.toBe(previous[0]);
  });

  it('boş girdilerle çalışır', () => {
    expect(mergeBagItems([], [])).toEqual([]);
  });
});

describe('özel maddeler', () => {
  it('ozel- önekini tanır', () => {
    expect(isCustomBagItemId('ozel-abc')).toBe(true);
    expect(isCustomBagItemId('ozel-')).toBe(false);
    expect(isCustomBagItemId('C-01')).toBe(false);
    expect(isCustomBagItemId('ozelx')).toBe(false);
    expect(isCustomBagItemId('OZEL-a')).toBe(false);
  });

  it('createCustomBagItem ozel-<uuid> kimliğiyle işaretsiz madde üretir', () => {
    const first = createCustomBagItem();
    const second = createCustomBagItem();

    expect(first.id).toMatch(
      /^ozel-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(isCustomBagItemId(first.id)).toBe(true);
    expect(first.done).toBe(false);
    expect(first.note).toBe('');
    expect(first.id).not.toBe(second.id);
  });
});

/**
 * Şartname §8.2, §8.3, §18.2 — `validate.ts`: `sanitizePlan` sözleşmesi.
 *
 * Testler §8.1'deki şekle uyan dolu bir "ham" planı kopyalayıp tek bir alanı
 * bozar; böylece her sınır ve her düzeltme kuralı ayrı ayrı ölçülür.
 */
import { describe, expect, it } from 'vitest';
import { SCHEMA_VERSION } from '../../src/model/types';
import { PLAN_LIMITS, sanitizePlan } from '../../src/model/validate';
import { parseWarning } from '../../src/model/warnings';
import {
  cloneRaw,
  deleteRawPath,
  mutatedPlan,
  type RawValue,
  rawContact,
  rawDailyPlace,
  rawMember,
  rawPet,
  readPlanPath,
  setRawPath,
  toWarningPath,
  validPlanRecord,
} from './helpers';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

describe('sürüm denetimi (§8.3)', () => {
  it('schemaVersion 1 değilse desteklenmeyen-surum hatası verir', () => {
    const inputs: unknown[] = [
      { schemaVersion: 2 },
      { schemaVersion: 0 },
      { schemaVersion: '1' },
      { schemaVersion: 1.5 },
      {},
    ];

    for (const input of inputs) {
      expect(() => sanitizePlan(input)).toThrowError('desteklenmeyen-surum');
    }
  });

  it('plan nesnesi olmayan girdide de desteklenmeyen-surum hatası verir', () => {
    const inputs: unknown[] = [null, undefined, 0, 'plan', [], true];

    for (const input of inputs) {
      expect(() => sanitizePlan(input)).toThrowError('desteklenmeyen-surum');
    }
  });

  it('hata iletisi tam olarak desteklenmeyen-surum’dur', () => {
    try {
      sanitizePlan({ schemaVersion: 3 });
      expect.unreachable('hata bekleniyordu');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('desteklenmeyen-surum');
    }
  });

  it('şema sürümü sabiti 1’dir (§8.1)', () => {
    expect(SCHEMA_VERSION).toBe(1);
  });
});

describe('eksik alanlar varsayılanla doldurulur (§8.3)', () => {
  it('yalnızca sürüm içeren nesne tam bir boş plan üretir', () => {
    const { plan, warnings } = sanitizePlan({ schemaVersion: 1 });

    expect(warnings).toEqual([]);
    expect(plan.id).toMatch(UUID_PATTERN);
    expect(plan.createdAt).toMatch(ISO_PATTERN);
    expect(plan.updatedAt).toMatch(ISO_PATTERN);
    expect(plan.healthOptIn).toBe(false);
    expect(plan.household).toEqual({ label: '', address: '', buildingNote: '', floorCount: '' });
    expect(plan.members).toEqual([]);
    expect(plan.contacts).toEqual([]);
    expect(plan.meeting).toEqual({
      nearHome: { label: '', detail: '' },
      neighborhood: { label: '', detail: '' },
      outOfArea: { label: '', detail: '' },
      assemblyArea: { label: '', detail: '' },
      assemblyCheckedAt: null,
    });
    expect(plan.home).toEqual({
      safeSpots: [],
      exits: [],
      utilities: { electricity: '', gas: '', water: '' },
      hazards: [],
    });
    expect(plan.roles).toEqual([]);
    expect(plan.bag).toEqual({ location: '', items: [], lastCheckedAt: null });
    expect(plan.documents).toEqual([]);
    expect(plan.pets).toEqual([]);
    expect(plan.insurance).toEqual({ dask: 'bilmiyorum' });
    expect(plan.review).toEqual({ lastDrillAt: null, nextReviewAt: null });
    expect(plan.notes).toBe('');
  });

  it('tek tek eksik alanlar varsayılana döner ve uyarı üretmez', () => {
    const raw = cloneRaw(validPlanRecord());
    deleteRawPath(raw, 'household');
    deleteRawPath(raw, 'bag.items');
    deleteRawPath(raw, 'review.nextReviewAt');
    deleteRawPath(raw, 'notes');
    deleteRawPath(raw, 'members.0.health');
    deleteRawPath(raw, 'members.0.phone');
    deleteRawPath(raw, 'members.0.dailyPlaces');
    deleteRawPath(raw, 'members.0.needs.mobility');
    deleteRawPath(raw, 'members.0.group');
    deleteRawPath(raw, 'contacts.0.outOfArea');
    deleteRawPath(raw, 'home.hazards.0.done');
    deleteRawPath(raw, 'meeting.nearHome.label');
    deleteRawPath(raw, 'home.utilities');
    deleteRawPath(raw, 'insurance.dask');
    deleteRawPath(raw, 'pets.0.note');
    deleteRawPath(raw, 'createdAt');

    const { plan, warnings } = sanitizePlan(raw);

    expect(warnings).toEqual([]);
    expect(plan.household).toEqual({ label: '', address: '', buildingNote: '', floorCount: '' });
    expect(plan.bag.items).toEqual([]);
    expect(plan.review.nextReviewAt).toBeNull();
    expect(plan.notes).toBe('');
    expect(plan.members[0]?.health).toBeUndefined();
    expect(plan.members[0]?.phone).toBe('');
    expect(plan.members[0]?.dailyPlaces).toEqual([]);
    expect(plan.members[0]?.needs.mobility).toBe(false);
    expect(plan.members[0]?.group).toBe('yetiskin');
    expect(plan.contacts[0]?.outOfArea).toBe(false);
    expect(plan.home.hazards[0]?.done).toBe(false);
    expect(plan.meeting.nearHome.label).toBe('');
    expect(plan.home.utilities).toEqual({ electricity: '', gas: '', water: '' });
    expect(plan.insurance.dask).toBe('bilmiyorum');
    expect(plan.pets[0]?.note).toBe('');
    expect(plan.createdAt).toMatch(ISO_PATTERN);
  });

  it('kişiler eksikse rol ataması geçersiz sayılıp boşaltılır', () => {
    const raw = cloneRaw(validPlanRecord());
    deleteRawPath(raw, 'members');

    const { plan, warnings } = sanitizePlan(raw);

    expect(plan.members).toEqual([]);
    expect(plan.roles[0]?.memberId).toBeNull();
    expect(warnings).toEqual(['bilinmeyen-kisi:roles[0].memberId']);
  });
});

describe('bilinmeyen alanlar atılır (§8.3)', () => {
  const UNKNOWN_FIELD_PATHS = [
    'extra',
    'household.extra',
    'members.0.extra',
    'members.0.needs.extra',
    'members.0.dailyPlaces.0.extra',
    'members.0.health.extra',
    'contacts.0.extra',
    'meeting.extra',
    'meeting.nearHome.extra',
    'home.extra',
    'home.utilities.extra',
    'home.hazards.0.extra',
    'roles.0.extra',
    'bag.extra',
    'bag.items.0.extra',
    'documents.0.extra',
    'pets.0.extra',
    'insurance.extra',
    'review.extra',
  ];

  for (const path of UNKNOWN_FIELD_PATHS) {
    it(`${path} bilinmeyen alan olarak atılır`, () => {
      const { plan, warnings } = sanitizePlan(mutatedPlan(path, 1));

      expect(warnings).toContain(`bilinmeyen-alan:${toWarningPath(path)}`);
      expect(readPlanPath(plan, path)).toBeNull();
    });
  }
});

describe('geçerli plan korunur', () => {
  it('dolu plan uyarısız ve değiştirilmeden döner', () => {
    const raw = validPlanRecord();
    const { plan, warnings } = sanitizePlan(cloneRaw(raw));

    expect(warnings).toEqual([]);
    expect(plan).toEqual(raw);
    expect(plan.id).toBe('11111111-1111-4111-8111-111111111111');
    expect(plan.members.map((member) => member.id)).toEqual(['m1', 'm2']);
  });

  it('XSS yükleri düz metin olarak korunur (§18.4/9)', () => {
    const raw = cloneRaw(validPlanRecord());
    setRawPath(raw, 'members.0.name', '<img src=x onerror=alert(1)>');
    setRawPath(raw, 'notes', '"><script>alert(1)</script>');

    const { plan, warnings } = sanitizePlan(raw);

    expect(warnings).toEqual([]);
    expect(plan.members[0]?.name).toBe('<img src=x onerror=alert(1)>');
    expect(plan.notes).toBe('"><script>alert(1)</script>');
  });

  it('ikinci geçiş uyarı üretmez (idempotent)', () => {
    const raw = cloneRaw(validPlanRecord());
    setRawPath(raw, 'household.label', `${'a'.repeat(59)} son`);
    setRawPath(raw, 'members.0.name', 42);
    setRawPath(raw, 'contacts.0.phone', '12');
    setRawPath(raw, 'healthOptIn', false);
    setRawPath(raw, 'bilinmeyen', 1);
    setRawPath(raw, 'roles.0.memberId', 'yok');
    setRawPath(raw, 'review.nextReviewAt', 'dün');

    const first = sanitizePlan(raw);
    const second = sanitizePlan(first.plan);

    expect(first.warnings.length).toBeGreaterThan(0);
    expect(second.warnings).toEqual([]);
    expect(second.plan).toEqual(first.plan);
  });

  it('üretilen her uyarı "kod:yol" biçimindedir ve çözülebilir', () => {
    const raw = cloneRaw(validPlanRecord());
    setRawPath(raw, 'household.label', 'a'.repeat(80));
    setRawPath(raw, 'members.0.name', 42);
    setRawPath(raw, 'members.1.health', 'x');
    setRawPath(raw, 'contacts.0.phone', '12');
    setRawPath(raw, 'roles.0.memberId', 'yok');
    setRawPath(raw, 'roles.1', 'canta');
    setRawPath(raw, 'bilinmeyen', 1);

    const { warnings } = sanitizePlan(raw);

    expect(warnings.length).toBeGreaterThan(0);
    for (const warning of warnings) {
      const parsed = parseWarning(warning);
      expect(parsed, warning).not.toBeNull();
      expect(parsed?.path, warning).not.toBe('');
    }
  });
});

interface ScalarCase {
  path: string;
  value: RawValue;
  expected: RawValue;
}

const EMPTY_MEETING = {
  nearHome: { label: '', detail: '' },
  neighborhood: { label: '', detail: '' },
  outOfArea: { label: '', detail: '' },
  assemblyArea: { label: '', detail: '' },
  assemblyCheckedAt: null,
};

const EMPTY_HOME = {
  safeSpots: [],
  exits: [],
  utilities: { electricity: '', gas: '', water: '' },
  hazards: [],
};

const EMPTY_NEEDS = {
  mobility: false,
  hearing: false,
  vision: false,
  communication: false,
  note: '',
};

const SCALAR_CASES: ScalarCase[] = [
  { path: 'healthOptIn', value: 'evet', expected: false },
  {
    path: 'household',
    value: 'x',
    expected: { label: '', address: '', buildingNote: '', floorCount: '' },
  },
  { path: 'household.label', value: 7, expected: '' },
  { path: 'household.address', value: false, expected: '' },
  { path: 'household.buildingNote', value: [], expected: '' },
  { path: 'household.floorCount', value: null, expected: '' },
  { path: 'members', value: 'x', expected: [] },
  { path: 'members', value: {}, expected: [] },
  { path: 'members.0.name', value: 7, expected: '' },
  { path: 'members.0.group', value: 'kedi', expected: 'yetiskin' },
  { path: 'members.0.group', value: 5, expected: 'yetiskin' },
  { path: 'members.0.phone', value: 532, expected: '' },
  { path: 'members.0.dailyPlaces', value: 'x', expected: [] },
  { path: 'members.0.dailyPlaces.0.kind', value: 'ev', expected: 'diger' },
  { path: 'members.0.dailyPlaces.0.label', value: 5, expected: '' },
  { path: 'members.0.dailyPlaces.0.note', value: 5, expected: '' },
  { path: 'members.0.needs', value: 'x', expected: EMPTY_NEEDS },
  { path: 'members.0.needs.mobility', value: 'evet', expected: false },
  { path: 'members.0.needs.note', value: 5, expected: '' },
  { path: 'members.0.health', value: 'x', expected: null },
  { path: 'members.0.health.bloodType', value: 'C+', expected: '' },
  { path: 'members.0.health.conditions', value: 5, expected: '' },
  { path: 'members.0.health.medications', value: 5, expected: '' },
  { path: 'members.0.health.allergies', value: [], expected: '' },
  { path: 'members.0.health.devices', value: 5, expected: '' },
  { path: 'contacts', value: 3, expected: [] },
  { path: 'contacts.0.name', value: 5, expected: '' },
  { path: 'contacts.0.relation', value: [], expected: '' },
  { path: 'contacts.0.phone', value: 5, expected: '' },
  { path: 'contacts.0.phoneAlt', value: 5, expected: '' },
  { path: 'contacts.0.outOfArea', value: 'evet', expected: false },
  { path: 'contacts.0.city', value: 34, expected: '' },
  { path: 'contacts.0.canPickUpChildren', value: 1, expected: false },
  { path: 'meeting', value: 'x', expected: EMPTY_MEETING },
  { path: 'meeting.nearHome', value: 'x', expected: { label: '', detail: '' } },
  { path: 'meeting.nearHome.label', value: 5, expected: '' },
  { path: 'meeting.neighborhood.detail', value: 5, expected: '' },
  { path: 'meeting.assemblyCheckedAt', value: 5, expected: null },
  { path: 'home', value: [], expected: EMPTY_HOME },
  { path: 'home.safeSpots', value: 'Salon', expected: [] },
  { path: 'home.hazards', value: 'x', expected: [] },
  { path: 'home.hazards.0.done', value: 'evet', expected: false },
  { path: 'home.utilities', value: 'x', expected: { electricity: '', gas: '', water: '' } },
  { path: 'home.utilities.electricity', value: 5, expected: '' },
  { path: 'home.utilities.gas', value: [], expected: '' },
  { path: 'home.utilities.water', value: false, expected: '' },
  { path: 'roles', value: 'x', expected: [] },
  { path: 'roles.0.memberId', value: 5, expected: null },
  { path: 'roles.0.note', value: 5, expected: '' },
  { path: 'bag', value: [], expected: { location: '', items: [], lastCheckedAt: null } },
  { path: 'bag.location', value: 5, expected: '' },
  { path: 'bag.items', value: 'x', expected: [] },
  { path: 'bag.items.0.done', value: 'evet', expected: false },
  { path: 'bag.lastCheckedAt', value: 'dun', expected: null },
  { path: 'documents', value: 'x', expected: [] },
  { path: 'documents.0.done', value: 0, expected: false },
  { path: 'pets', value: {}, expected: [] },
  { path: 'pets.0.name', value: 5, expected: '' },
  { path: 'pets.0.kind', value: null, expected: '' },
  { path: 'pets.0.note', value: [], expected: '' },
  { path: 'insurance', value: 'x', expected: { dask: 'bilmiyorum' } },
  { path: 'insurance.dask', value: 'belki', expected: 'bilmiyorum' },
  { path: 'review', value: 5, expected: { lastDrillAt: null, nextReviewAt: null } },
  { path: 'review.lastDrillAt', value: 'dun', expected: null },
  { path: 'review.nextReviewAt', value: false, expected: null },
  { path: 'notes', value: 5, expected: '' },
];

describe('tür uymayan değer varsayılana döner (§8.3)', () => {
  for (const testCase of SCALAR_CASES) {
    it(`${testCase.path} türü uymazsa varsayılana döner`, () => {
      const { plan, warnings } = sanitizePlan(mutatedPlan(testCase.path, testCase.value));

      expect(warnings).toContain(`gecersiz-deger:${toWarningPath(testCase.path)}`);
      expect(readPlanPath(plan, testCase.path)).toEqual(testCase.expected);
    });
  }

  it('nesne olmayan liste öğeleri düşürülür', () => {
    const raw = cloneRaw(validPlanRecord());
    raw.members = [rawMember(1), 5];

    const { plan, warnings } = sanitizePlan(raw);

    expect(plan.members).toHaveLength(1);
    expect(plan.members[0]?.id).toBe('m1');
    expect(warnings).toContain('gecersiz-deger:members[1]');
  });

  it('gün içi yer, tehlike, çanta, belge ve evcil hayvan nesne değilse düşürülür', () => {
    const raw = cloneRaw(validPlanRecord());
    setRawPath(raw, 'members.0.dailyPlaces.0', 'okul');
    setRawPath(raw, 'home.hazards.0', 5);
    setRawPath(raw, 'bag.items.0', 'C-01');
    setRawPath(raw, 'documents.0', null);
    setRawPath(raw, 'pets.0', []);

    const { plan, warnings } = sanitizePlan(raw);

    expect(plan.members[0]?.dailyPlaces).toEqual([]);
    expect(plan.home.hazards).toEqual([]);
    expect(plan.bag.items).toHaveLength(1);
    expect(plan.bag.items[0]?.id).toBe('C-02');
    expect(plan.documents).toEqual([]);
    expect(plan.pets).toEqual([]);
    expect(warnings).toEqual(
      expect.arrayContaining([
        'gecersiz-deger:members[0].dailyPlaces[0]',
        'gecersiz-deger:home.hazards[0]',
        'gecersiz-deger:bag.items[0]',
        'gecersiz-deger:documents[0]',
        'gecersiz-deger:pets[0]',
      ]),
    );
  });

  it('nesne olmayan acil kişi düşürülür', () => {
    const raw = cloneRaw(validPlanRecord());
    raw.contacts = ['komşu'];

    const { plan, warnings } = sanitizePlan(raw);

    expect(plan.contacts).toEqual([]);
    expect(warnings).toEqual(['gecersiz-deger:contacts[0]']);
  });

  it('metin listesinde nesne olmayan öğe düşürülür, boş metin atılır', () => {
    const raw = cloneRaw(validPlanRecord());
    setRawPath(raw, 'home.safeSpots', ['Salon', 5, '  ', 'Mutfak']);

    const { plan, warnings } = sanitizePlan(raw);

    expect(plan.home.safeSpots).toEqual(['Salon', 'Mutfak']);
    expect(warnings).toEqual(['gecersiz-deger:home.safeSpots[1]']);
  });
});

describe('kimlik üretimi', () => {
  it('plan kimliği eksikse yeni UUID üretilir', () => {
    const raw = cloneRaw(validPlanRecord());
    deleteRawPath(raw, 'id');

    const { plan, warnings } = sanitizePlan(raw);

    expect(plan.id).toMatch(UUID_PATTERN);
    expect(warnings).toEqual([]);
  });

  it('geçersiz plan kimliği yeni UUID ile değiştirilir', () => {
    for (const value of [42, '   ', null, 'ornek@adres.test']) {
      const { plan, warnings } = sanitizePlan(mutatedPlan('id', value));

      expect(plan.id).toMatch(UUID_PATTERN);
      expect(warnings).toContain('gecersiz-deger:id');
    }
  });

  it('boş liste öğesi kimliği yeni UUID ile doldurulur', () => {
    const raw = cloneRaw(validPlanRecord());
    setRawPath(raw, 'bag.items.0.id', '');
    deleteRawPath(raw, 'pets.0.id');

    const { plan, warnings } = sanitizePlan(raw);

    expect(plan.bag.items[0]?.id).toMatch(UUID_PATTERN);
    expect(plan.pets[0]?.id).toMatch(UUID_PATTERN);
    expect(warnings).toEqual(['gecersiz-deger:bag.items[0].id']);
  });

  it('geçerli kimlikler korunur', () => {
    const { plan, warnings } = sanitizePlan(validPlanRecord());

    expect(plan.id).toBe('11111111-1111-4111-8111-111111111111');
    expect(plan.members.map((member) => member.id)).toEqual(['m1', 'm2']);
    expect(plan.bag.items.map((item) => item.id)).toEqual(['C-01', 'C-02']);
    expect(warnings).toEqual([]);
  });

  it('yinelenen kontrol listesi kimlikleri için ilk durumu ve notu korur', () => {
    const raw = mutatedPlan('bag.items', [
      { id: 'C-01', done: true, note: 'İlk kayıt' },
      { id: ' C-01 ', done: false, note: 'Tekrar' },
      { id: 'C-02', done: false, note: '' },
    ]);
    const { plan, warnings } = sanitizePlan(raw);
    expect(plan.bag.items).toEqual([
      { id: 'C-01', done: true, note: 'İlk kayıt' },
      { id: 'C-02', done: false, note: '' },
    ]);
    expect(warnings).toEqual(['gecersiz-deger:bag.items[1].id']);
  });
});

describe('sağlık izni (§8.3, İ8)', () => {
  it('healthOptIn false iken bütün sağlık alanları silinir', () => {
    const raw = cloneRaw(validPlanRecord());
    setRawPath(raw, 'healthOptIn', false);

    const { plan, warnings } = sanitizePlan(raw);

    expect(plan.healthOptIn).toBe(false);
    for (const member of plan.members) {
      expect('health' in member).toBe(false);
    }
    expect(warnings).toEqual(['saglik-silindi:members[].health']);
  });

  it('sağlık verisi yokken uyarı üretmez', () => {
    const raw = cloneRaw(validPlanRecord());
    setRawPath(raw, 'healthOptIn', false);
    deleteRawPath(raw, 'members.0.health');
    deleteRawPath(raw, 'members.1.health');

    expect(sanitizePlan(raw).warnings).toEqual([]);
  });

  it('izin kapalıyken sağlık alanlarının içi denetlenmez', () => {
    const raw = cloneRaw(validPlanRecord());
    setRawPath(raw, 'healthOptIn', false);
    setRawPath(raw, 'members.0.health', { bloodType: 'C+', gizli: 1 });

    const { plan, warnings } = sanitizePlan(raw);

    expect(warnings).toEqual(['saglik-silindi:members[].health']);
    expect(plan.members[0]?.health).toBeUndefined();
  });

  it('healthOptIn alanı yoksa kapalı sayılır', () => {
    const raw = cloneRaw(validPlanRecord());
    deleteRawPath(raw, 'healthOptIn');

    const { plan, warnings } = sanitizePlan(raw);

    expect(plan.healthOptIn).toBe(false);
    expect(warnings).toEqual(['saglik-silindi:members[].health']);
  });

  it('healthOptIn true iken sağlık alanları korunur', () => {
    const { plan, warnings } = sanitizePlan(validPlanRecord());

    expect(plan.members[0]?.health).toEqual({
      bloodType: 'A+',
      conditions: 'Astım',
      medications: 'İnhaler',
      allergies: 'Polen',
      devices: 'İşitme cihazı',
    });
    expect(warnings).toEqual([]);
  });

  it('izin açıkken bilinmeyen sağlık alanı atılır', () => {
    const { plan, warnings } = sanitizePlan(mutatedPlan('members.0.health.gizli', 1));

    expect(warnings).toEqual(['bilinmeyen-alan:members[0].health.gizli']);
    expect(plan.members[0]?.health).not.toHaveProperty('gizli');
  });
});

describe('rol atamaları (§8.3)', () => {
  it('var olmayan kişiye atanan rol boşaltılır ve uyarı verilir', () => {
    const raw = cloneRaw(validPlanRecord());
    setRawPath(raw, 'roles.0.memberId', 'yok');

    const { plan, warnings } = sanitizePlan(raw);

    expect(plan.roles[0]?.memberId).toBeNull();
    expect(warnings).toEqual(['bilinmeyen-kisi:roles[0].memberId']);
  });

  it('var olan kişiye atanan rol korunur', () => {
    const { plan, warnings } = sanitizePlan(validPlanRecord());

    expect(plan.roles[0]).toEqual({ roleId: 'canta', memberId: 'm1', note: 'Yatak odasında' });
    expect(warnings).toEqual([]);
  });

  it('atanmamış rol (memberId null) uyarı üretmez', () => {
    const { plan, warnings } = sanitizePlan(mutatedPlan('roles.0.memberId', null));

    expect(plan.roles[0]?.memberId).toBeNull();
    expect(warnings).toEqual([]);
  });

  it('boş memberId atanmamış sayılır', () => {
    const { plan, warnings } = sanitizePlan(mutatedPlan('roles.0.memberId', '   '));

    expect(plan.roles[0]?.memberId).toBeNull();
    expect(warnings).toEqual([]);
  });

  it('geçersiz roleId taşıyan atama düşürülür', () => {
    const { plan, warnings } = sanitizePlan(mutatedPlan('roles.0.roleId', 'kedi'));

    expect(plan.roles).toEqual([]);
    expect(warnings).toEqual(['gecersiz-deger:roles[0].roleId']);
  });

  it('nesne olmayan rol ataması düşürülür', () => {
    const raw = cloneRaw(validPlanRecord());
    raw.roles = ['canta'];

    const { plan, warnings } = sanitizePlan(raw);

    expect(plan.roles).toEqual([]);
    expect(warnings).toEqual(['gecersiz-deger:roles[0]']);
  });

  it('12 kişi sınırında kesilen kişiye atama boşaltılır', () => {
    const raw = cloneRaw(validPlanRecord());
    raw.members = Array.from({ length: 13 }, (_, index) => rawMember(index + 1));
    setRawPath(raw, 'roles.0.memberId', 'm13');

    const { plan, warnings } = sanitizePlan(raw);

    expect(plan.members).toHaveLength(12);
    expect(plan.roles[0]?.memberId).toBeNull();
    expect(warnings).toContain('bilinmeyen-kisi:roles[0].memberId');
  });
});

describe('liste sınırları (§8.2)', () => {
  it('12 kişi sınırında korunur, 13’te kesilir', () => {
    const atLimit = cloneRaw(validPlanRecord());
    atLimit.members = Array.from({ length: 12 }, (_, index) => rawMember(index + 1));
    const kept = sanitizePlan(atLimit);
    expect(kept.plan.members).toHaveLength(12);
    expect(kept.warnings).toEqual([]);

    const overLimit = cloneRaw(validPlanRecord());
    overLimit.members = Array.from({ length: 13 }, (_, index) => rawMember(index + 1));
    const cut = sanitizePlan(overLimit);
    expect(cut.plan.members).toHaveLength(12);
    expect(cut.plan.members[11]?.id).toBe('m12');
    expect(cut.plan.members.some((member) => member.id === 'm13')).toBe(false);
    expect(cut.warnings).toEqual(['sinir-asildi:members']);
  });

  it('10 acil kişi sınırında korunur, 11’de kesilir', () => {
    const atLimit = cloneRaw(validPlanRecord());
    atLimit.contacts = Array.from({ length: 10 }, (_, index) => rawContact(index + 1));
    expect(sanitizePlan(atLimit).warnings).toEqual([]);

    const overLimit = cloneRaw(validPlanRecord());
    overLimit.contacts = Array.from({ length: 11 }, (_, index) => rawContact(index + 1));
    const cut = sanitizePlan(overLimit);
    expect(cut.plan.contacts).toHaveLength(10);
    expect(cut.plan.contacts[9]?.id).toBe('c10');
    expect(cut.warnings).toEqual(['sinir-asildi:contacts']);
  });

  it('kişi başına 3 gün içi yer sınırı uygulanır', () => {
    const raw = cloneRaw(validPlanRecord());
    setRawPath(
      raw,
      'members.0.dailyPlaces',
      Array.from({ length: 3 }, (_, index) => rawDailyPlace(index + 1)),
    );
    expect(sanitizePlan(raw).warnings).toEqual([]);

    setRawPath(
      raw,
      'members.0.dailyPlaces',
      Array.from({ length: 4 }, (_, index) => rawDailyPlace(index + 1)),
    );
    const cut = sanitizePlan(raw);
    expect(cut.plan.members[0]?.dailyPlaces).toHaveLength(3);
    expect(cut.warnings).toEqual(['sinir-asildi:members[0].dailyPlaces']);
  });

  it('10 güvenli yer sınırında korunur, 11’de kesilir', () => {
    const atLimit = cloneRaw(validPlanRecord());
    setRawPath(
      atLimit,
      'home.safeSpots',
      Array.from({ length: 10 }, (_, index) => `Yer ${index}`),
    );
    expect(sanitizePlan(atLimit).warnings).toEqual([]);

    const overLimit = cloneRaw(validPlanRecord());
    setRawPath(
      overLimit,
      'home.safeSpots',
      Array.from({ length: 11 }, (_, index) => `Yer ${index}`),
    );
    const cut = sanitizePlan(overLimit);
    expect(cut.plan.home.safeSpots).toHaveLength(10);
    expect(cut.warnings).toEqual(['sinir-asildi:home.safeSpots']);
  });

  it('5 çıkış yolu sınırında korunur, 6’da kesilir', () => {
    const atLimit = cloneRaw(validPlanRecord());
    setRawPath(atLimit, 'home.exits', ['a', 'b', 'c', 'd', 'e']);
    expect(sanitizePlan(atLimit).warnings).toEqual([]);

    const overLimit = cloneRaw(validPlanRecord());
    setRawPath(overLimit, 'home.exits', ['a', 'b', 'c', 'd', 'e', 'f']);
    const cut = sanitizePlan(overLimit);
    expect(cut.plan.home.exits).toEqual(['a', 'b', 'c', 'd', 'e']);
    expect(cut.warnings).toEqual(['sinir-asildi:home.exits']);
  });

  it('6 evcil hayvan sınırında korunur, 7’de kesilir', () => {
    const atLimit = cloneRaw(validPlanRecord());
    atLimit.pets = Array.from({ length: 6 }, (_, index) => rawPet(index + 1));
    expect(sanitizePlan(atLimit).warnings).toEqual([]);

    const overLimit = cloneRaw(validPlanRecord());
    overLimit.pets = Array.from({ length: 7 }, (_, index) => rawPet(index + 1));
    const cut = sanitizePlan(overLimit);
    expect(cut.plan.pets).toHaveLength(6);
    expect(cut.plan.pets[5]?.id).toBe('p6');
    expect(cut.warnings).toEqual(['sinir-asildi:pets']);
  });
});

const NAME_FIELDS = [
  'household.label',
  'members.0.name',
  'members.0.dailyPlaces.0.label',
  'contacts.0.name',
  'contacts.0.relation',
  'contacts.0.city',
  'meeting.nearHome.label',
  'meeting.neighborhood.label',
  'meeting.outOfArea.label',
  'meeting.assemblyArea.label',
  'pets.0.name',
];

const SHORT_TEXT_FIELDS = [
  'household.address',
  'household.buildingNote',
  'household.floorCount',
  'members.0.dailyPlaces.0.note',
  'members.0.needs.note',
  'meeting.nearHome.detail',
  'home.safeSpots.0',
  'home.exits.0',
  'home.utilities.electricity',
  'home.utilities.gas',
  'home.utilities.water',
  'roles.0.note',
  'bag.location',
  'bag.items.0.note',
  'home.hazards.0.note',
  'documents.0.note',
  'pets.0.kind',
  'pets.0.note',
];

const LONG_TEXT_FIELDS = [
  'notes',
  'members.0.health.conditions',
  'members.0.health.medications',
  'members.0.health.allergies',
  'members.0.health.devices',
];

describe('metin sınırları (§8.2)', () => {
  for (const path of NAME_FIELDS) {
    it(`${path} 60 karakterde korunur`, () => {
      const value = 'a'.repeat(60);
      const { plan, warnings } = sanitizePlan(mutatedPlan(path, value));

      expect(readPlanPath(plan, path)).toBe(value);
      expect(warnings).toEqual([]);
    });

    it(`${path} 61 karakterde kesilir ve uyarı verir`, () => {
      const { plan, warnings } = sanitizePlan(mutatedPlan(path, 'a'.repeat(61)));

      expect(readPlanPath(plan, path)).toBe('a'.repeat(60));
      expect(warnings).toEqual([`sinir-asildi:${toWarningPath(path)}`]);
    });
  }

  for (const path of SHORT_TEXT_FIELDS) {
    it(`${path} 200 karakterde korunur`, () => {
      const value = 'b'.repeat(200);
      const { plan, warnings } = sanitizePlan(mutatedPlan(path, value));

      expect(readPlanPath(plan, path)).toBe(value);
      expect(warnings).toEqual([]);
    });

    it(`${path} 201 karakterde kesilir ve uyarı verir`, () => {
      const { plan, warnings } = sanitizePlan(mutatedPlan(path, 'b'.repeat(201)));

      expect(readPlanPath(plan, path)).toBe('b'.repeat(200));
      expect(warnings).toEqual([`sinir-asildi:${toWarningPath(path)}`]);
    });
  }

  for (const path of LONG_TEXT_FIELDS) {
    it(`${path} 500 karakterde korunur`, () => {
      const value = 'c'.repeat(500);
      const { plan, warnings } = sanitizePlan(mutatedPlan(path, value));

      expect(readPlanPath(plan, path)).toBe(value);
      expect(warnings).toEqual([]);
    });

    it(`${path} 501 karakterde kesilir ve uyarı verir`, () => {
      const { plan, warnings } = sanitizePlan(mutatedPlan(path, 'c'.repeat(501)));

      expect(readPlanPath(plan, path)).toBe('c'.repeat(500));
      expect(warnings).toEqual([`sinir-asildi:${toWarningPath(path)}`]);
    });
  }

  it('kesme kod noktası sınırına saygı duyar (görece yarım kalmaz)', () => {
    const value = '😀'.repeat(61);
    const { plan } = sanitizePlan(mutatedPlan('household.label', value));

    expect(plan.household.label).toBe('😀'.repeat(60));
    expect(plan.household.label).not.toContain('\uFFFD');
  });

  it('sınır sabitleri §8.2 tablosuyla aynıdır', () => {
    expect(PLAN_LIMITS).toEqual({
      nameLength: 60,
      shortTextLength: 200,
      longTextLength: 500,
      phoneMinLength: 3,
      phoneMaxLength: 20,
      members: 12,
      contacts: 10,
      dailyPlaces: 3,
      safeSpots: 10,
      exits: 5,
      pets: 6,
    });
  });
});

const PHONE_FIELDS = [
  'members.0.phone',
  'members.0.dailyPlaces.0.phone',
  'contacts.0.phone',
  'contacts.0.phoneAlt',
];

describe('telefon sınırları (§8.2)', () => {
  const VALID_PHONES = [
    '112',
    '0212 555 44 33',
    '+90 (212) 555-44-33',
    '05320000000',
    '12345678901234567890',
  ];

  for (const path of PHONE_FIELDS) {
    it(`${path} izinli karakterlerle ve 3–20 uzunlukta korunur`, () => {
      for (const value of VALID_PHONES) {
        const { plan, warnings } = sanitizePlan(mutatedPlan(path, value));

        expect(readPlanPath(plan, path), value).toBe(value);
        expect(warnings, value).toEqual([]);
      }
    });

    it(`${path} boş bırakılabilir`, () => {
      for (const value of ['', '   ']) {
        const { plan, warnings } = sanitizePlan(mutatedPlan(path, value));

        expect(readPlanPath(plan, path), value).toBe('');
        expect(warnings, value).toEqual([]);
      }
    });

    it(`${path} 20 karakteri aşınca kesilir`, () => {
      const { plan, warnings } = sanitizePlan(mutatedPlan(path, '123456789012345678901'));

      expect(readPlanPath(plan, path)).toBe('12345678901234567890');
      expect(warnings).toEqual([`sinir-asildi:${toWarningPath(path)}`]);
    });

    it(`${path} 3 karakterden kısa ya da geçersiz karakterliyse boşaltılır`, () => {
      for (const value of ['12', 'abc', '0555 12a 34', '12,34']) {
        const { plan, warnings } = sanitizePlan(mutatedPlan(path, value));

        expect(readPlanPath(plan, path), value).toBe('');
        expect(warnings, value).toContain(`gecersiz-deger:${toWarningPath(path)}`);
      }
    });
  }
});

const DATE_FIELDS = [
  'meeting.assemblyCheckedAt',
  'bag.lastCheckedAt',
  'review.lastDrillAt',
  'review.nextReviewAt',
];

describe('tarih alanları (§8.2)', () => {
  const VALID_DATES = [
    '2026-11-19',
    '2026-11-19T10:30',
    '2026-11-19T10:30:00Z',
    '2026-11-19T10:30:00.123+03:00',
    '2024-02-29',
    '2000-02-29',
  ];
  const INVALID_DATES = [
    '19.11.2026',
    '2026-13-01',
    '2026-00-10',
    '2026-11-00',
    '2026-02-30',
    '2023-02-29',
    '1900-02-29',
    'dün',
    '2026-11-19T25:00:00Z',
    '2026-11-19T10:70:00Z',
    '2026-11-19T10:30:70Z',
    '2026-11-19 10:30',
    '2026-11-19T10:30:00+25:00',
    '2026-11-19T10:30:00+03:99',
  ];

  for (const path of DATE_FIELDS) {
    it(`${path} geçerli ISO 8601 değerlerini korur`, () => {
      for (const value of VALID_DATES) {
        const { plan, warnings } = sanitizePlan(mutatedPlan(path, value));

        expect(readPlanPath(plan, path), value).toBe(value);
        expect(warnings, value).toEqual([]);
      }
    });

    it(`${path} geçersiz tarihte null olur ve uyarı verir`, () => {
      for (const value of INVALID_DATES) {
        const { plan, warnings } = sanitizePlan(mutatedPlan(path, value));

        expect(readPlanPath(plan, path), value).toBeNull();
        expect(warnings, value).toEqual([`gecersiz-deger:${toWarningPath(path)}`]);
      }
    });

    it(`${path} null ve boş değeri sessizce null yapar`, () => {
      for (const value of [null, '']) {
        const { plan, warnings } = sanitizePlan(mutatedPlan(path, value));

        expect(readPlanPath(plan, path), String(value)).toBeNull();
        expect(warnings, String(value)).toEqual([]);
      }
    });

    it(`${path} tarih olmayan türde null olur`, () => {
      const { plan, warnings } = sanitizePlan(mutatedPlan(path, 5));

      expect(readPlanPath(plan, path)).toBeNull();
      expect(warnings).toEqual([`gecersiz-deger:${toWarningPath(path)}`]);
    });
  }

  it('createdAt/updatedAt geçersizse şimdiki ISO zamanı kullanılır', () => {
    const raw = cloneRaw(validPlanRecord());
    setRawPath(raw, 'createdAt', 'dün');
    setRawPath(raw, 'updatedAt', 5);

    const { plan, warnings } = sanitizePlan(raw);

    expect(plan.createdAt).toMatch(ISO_PATTERN);
    expect(plan.updatedAt).toMatch(ISO_PATTERN);
    expect(warnings).toEqual(['gecersiz-deger:createdAt', 'gecersiz-deger:updatedAt']);
  });
});

describe('metin normalleştirme (§8.2)', () => {
  it('baş ve son boşlukları kırpar', () => {
    const { plan } = sanitizePlan(mutatedPlan('members.0.name', '   Ayşe Yılmaz   '));

    expect(plan.members[0]?.name).toBe('Ayşe Yılmaz');
  });

  it('denetim karakterlerini siler', () => {
    const raw = cloneRaw(validPlanRecord());
    setRawPath(raw, 'members.0.name', 'Ada\u0000');
    setRawPath(raw, 'household.label', '\u001fYılmaz\u0001');
    setRawPath(raw, 'home.safeSpots.0', 'Salon\u0007');

    const { plan } = sanitizePlan(raw);

    expect(plan.members[0]?.name).toBe('Ada');
    expect(plan.household.label).toBe('Yılmaz');
    expect(plan.home.safeSpots[0]).toBe('Salon');
  });

  it('kısa metinlerde satır sonunu siler', () => {
    const raw = cloneRaw(validPlanRecord());
    setRawPath(raw, 'members.0.name', 'Ayşe\nYılmaz');
    setRawPath(raw, 'household.address', 'Birinci satır\nİkinci satır');

    const { plan } = sanitizePlan(raw);

    expect(plan.members[0]?.name).toBe('AyşeYılmaz');
    expect(plan.household.address).toBe('Birinci satırİkinci satır');
  });

  it('notes ve sağlık metinlerinde satır sonu korunur, \\n biçimine getirilir', () => {
    const raw = cloneRaw(validPlanRecord());
    setRawPath(raw, 'notes', '  Birinci\r\nİkinci\rÜçüncü\n\n  ');
    setRawPath(raw, 'members.0.health.conditions', 'Satır 1\nSatır 2\u0000');

    const { plan } = sanitizePlan(raw);

    expect(plan.notes).toBe('Birinci\nİkinci\nÜçüncü');
    expect(plan.members[0]?.health?.conditions).toBe('Satır 1\nSatır 2');
  });

  it('Unicode NFC uygular', () => {
    const raw = cloneRaw(validPlanRecord());
    setRawPath(raw, 'members.0.name', 'Ays\u0327e');
    setRawPath(raw, 'notes', 'e\u0301');

    const { plan } = sanitizePlan(raw);

    expect(plan.members[0]?.name).toBe('Ayşe');
    expect(plan.notes).toBe('é');
  });

  it('boş ad veri kaybı yaratmadan boş bırakılır (zorunluluk sihirbazda, §11.4)', () => {
    const raw = cloneRaw(validPlanRecord());
    setRawPath(raw, 'members.0.name', '   ');

    const { plan, warnings } = sanitizePlan(raw);

    expect(plan.members[0]?.name).toBe('');
    expect(warnings).toEqual([]);
  });
});

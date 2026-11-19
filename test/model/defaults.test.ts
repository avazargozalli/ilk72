/**
 * Şartname §8.1, §18.2 — `defaults.ts`: boş plan ve tek kayıt varsayılanları.
 */
import { describe, expect, it } from 'vitest';
import {
  createChecklistItem,
  createEmptyContact,
  createEmptyDailyPlace,
  createEmptyMember,
  createEmptyPet,
  createEmptyPlace,
  createEmptyPlan,
  createEmptyRoleAssignment,
} from '../../src/model/defaults';
import { type Plan, SCHEMA_VERSION } from '../../src/model/types';
import { sanitizePlan } from '../../src/model/validate';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

const PLAN_KEYS = [
  'bag',
  'contacts',
  'createdAt',
  'documents',
  'healthOptIn',
  'home',
  'household',
  'id',
  'insurance',
  'meeting',
  'members',
  'notes',
  'pets',
  'review',
  'roles',
  'schemaVersion',
  'updatedAt',
];

describe('createEmptyPlan', () => {
  it('§8.1 şeklinin bütün alanlarını, fazlası olmadan kurar', () => {
    const plan = createEmptyPlan();

    expect(Object.keys(plan).sort()).toEqual(PLAN_KEYS);
    expect(plan.schemaVersion).toBe(SCHEMA_VERSION);
    expect(plan.schemaVersion).toBe(1);
  });

  it('kimlik ve zaman damgalarını üretir', () => {
    const plan = createEmptyPlan();

    expect(plan.id).toMatch(UUID_PATTERN);
    expect(plan.createdAt).toMatch(ISO_PATTERN);
    expect(plan.updatedAt).toMatch(ISO_PATTERN);
    expect(plan.createdAt).toBe(plan.updatedAt);
    expect(new Date(plan.createdAt).toISOString()).toBe(plan.createdAt);
  });

  it('boş listeleri, boş metinleri ve sağlık iznini kapalı bırakır', () => {
    const plan = createEmptyPlan();

    expect(plan.healthOptIn).toBe(false);
    expect(plan.household).toEqual({ label: '', address: '', buildingNote: '', floorCount: '' });
    expect(plan.members).toEqual([]);
    expect(plan.contacts).toEqual([]);
    expect(plan.meeting.nearHome).toEqual({ label: '', detail: '' });
    expect(plan.meeting.neighborhood).toEqual({ label: '', detail: '' });
    expect(plan.meeting.outOfArea).toEqual({ label: '', detail: '' });
    expect(plan.meeting.assemblyArea).toEqual({ label: '', detail: '' });
    expect(plan.meeting.assemblyCheckedAt).toBeNull();
    expect(plan.home.safeSpots).toEqual([]);
    expect(plan.home.exits).toEqual([]);
    expect(plan.home.utilities).toEqual({ electricity: '', gas: '', water: '' });
    expect(plan.home.hazards).toEqual([]);
    expect(plan.roles).toEqual([]);
    expect(plan.bag).toEqual({ location: '', items: [], lastCheckedAt: null });
    expect(plan.documents).toEqual([]);
    expect(plan.pets).toEqual([]);
    expect(plan.insurance.dask).toBe('bilmiyorum');
    expect(plan.review).toEqual({ lastDrillAt: null, nextReviewAt: null });
    expect(plan.notes).toBe('');
  });

  it('her çağrıda yeni kimlik ve ayrı nesneler üretir', () => {
    const first = createEmptyPlan();
    const second = createEmptyPlan();

    expect(first.id).not.toBe(second.id);
    expect(first).not.toBe(second);
    expect(first.household).not.toBe(second.household);
    expect(first.members).not.toBe(second.members);
    expect(first.meeting.nearHome).not.toBe(second.meeting.nearHome);
    expect(first.home.utilities).not.toBe(second.home.utilities);
    expect(first.bag.items).not.toBe(second.bag.items);

    first.household.label = 'Değişti';
    first.members.push(createEmptyMember());
    expect(second.household.label).toBe('');
    expect(second.members).toEqual([]);
  });

  it('sanitizePlan’dan uyarısız ve değişmeden geçer', () => {
    const plan = createEmptyPlan();
    const { plan: sanitized, warnings } = sanitizePlan(plan);

    expect(warnings).toEqual([]);
    expect(sanitized).toEqual(plan);
    expect(sanitized.id).toBe(plan.id);
  });
});

describe('tek kayıt fabrikaları', () => {
  it('createEmptyPlace boş yer üretir', () => {
    expect(createEmptyPlace()).toEqual({ label: '', detail: '' });
    expect(createEmptyPlace()).not.toBe(createEmptyPlace());
  });

  it('createEmptyMember varsayılan yetişkin üretir', () => {
    const member = createEmptyMember();

    expect(member.id).toMatch(UUID_PATTERN);
    expect(member.name).toBe('');
    expect(member.group).toBe('yetiskin');
    expect(member.phone).toBe('');
    expect(member.dailyPlaces).toEqual([]);
    expect(member.needs).toEqual({
      mobility: false,
      hearing: false,
      vision: false,
      communication: false,
      note: '',
    });
    expect(member.health).toBeUndefined();
    expect('health' in member).toBe(false);
  });

  it('createEmptyMember grup seçimini kabul eder ve yeni kimlik üretir', () => {
    const baby = createEmptyMember('bebek');
    const other = createEmptyMember('bebek');

    expect(baby.group).toBe('bebek');
    expect(baby.id).toMatch(UUID_PATTERN);
    expect(baby.id).not.toBe(other.id);
    expect(createEmptyMember('cocuk').group).toBe('cocuk');
    expect(createEmptyMember('yasli').group).toBe('yasli');
  });

  it('createEmptyDailyPlace, createEmptyContact ve createEmptyPet varsayılanları', () => {
    const dailyPlace = createEmptyDailyPlace();
    expect(dailyPlace).toEqual({ kind: 'diger', label: '', phone: '', note: '' });

    const contact = createEmptyContact();
    expect(contact.id).toMatch(UUID_PATTERN);
    expect(contact).toMatchObject({
      name: '',
      relation: '',
      phone: '',
      phoneAlt: '',
      outOfArea: false,
      city: '',
      canPickUpChildren: false,
    });

    const pet = createEmptyPet();
    expect(pet.id).toMatch(UUID_PATTERN);
    expect(pet).toMatchObject({ name: '', kind: '', note: '' });
  });

  it('createChecklistItem verilen kimliği işaretsiz kopyalar', () => {
    const item = createChecklistItem('C-01');

    expect(item).toEqual({ id: 'C-01', done: false, note: '' });
  });

  it('createEmptyRoleAssignment rolü atanmamış bırakır', () => {
    expect(createEmptyRoleAssignment('canta')).toEqual({
      roleId: 'canta',
      memberId: null,
      note: '',
    });
    expect(createEmptyRoleAssignment('iletisim').roleId).toBe('iletisim');
  });

  it('fabrikaların ürettiği değerler §8.2 sınırlarına uyar', () => {
    const plan: Plan = createEmptyPlan();
    plan.members.push(createEmptyMember());
    plan.contacts.push(createEmptyContact());
    plan.pets.push(createEmptyPet());
    plan.documents.push(createChecklistItem('B-01'));
    plan.roles.push(createEmptyRoleAssignment('canta'));

    expect(sanitizePlan(plan).warnings).toEqual([]);
  });
});

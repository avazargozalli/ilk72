/**
 * Şartname §8.1 — boş plan ve tek kayıt varsayılanları.
 *
 * `createEmptyPlan()` yeni planın tek kaynağıdır: kimlik (`crypto.randomUUID`)
 * ve ISO zaman damgaları burada üretilir, sağlık izni kapalı başlar (İ8).
 * Tek kayıt fabrikaları sihirbazın yeni satır eklerken aynı varsayılanları
 * kullanması içindir; böylece kimlik üretimi tek yerde kalır.
 *
 * Not: planın listeleri boş başlar. Çanta listesi (C-*) `bag.buildBagItemIds`
 * ile haneye göre üretilir; boş plana madde serilmez.
 */
import {
  type ChecklistState,
  type Contact,
  type DailyPlace,
  type Health,
  type Member,
  type Pet,
  type Place,
  type Plan,
  type RoleAssignment,
  type RoleId,
  SCHEMA_VERSION,
} from './types';

/** Boş yer etiketi (buluşma yerleri, toplanma alanı). */
export function createEmptyPlace(): Place {
  return { label: '', detail: '' };
}

/** Kontrol listesi maddesi (çanta, belge, tehlike avı) — işaretsiz. */
export function createChecklistItem(id: string): ChecklistState {
  return { id, done: false, note: '' };
}

/** Gün içinde bulunulan yer (okul, iş yeri, kreş…). */
export function createEmptyDailyPlace(): DailyPlace {
  return { kind: 'diger', label: '', phone: '', note: '' };
}

/** Boş sağlık kaydı; yalnızca `healthOptIn` açıkken kullanılır (İ8). */
export function createEmptyHealth(): Health {
  return { bloodType: '', conditions: '', medications: '', allergies: '', devices: '' };
}

/** Boş kişi; kimlik üretir, sağlık alanı **yoktur** (yalnızca izinle eklenir). */
export function createEmptyMember(group: Member['group'] = 'yetiskin'): Member {
  return {
    id: crypto.randomUUID(),
    name: '',
    group,
    phone: '',
    dailyPlaces: [],
    needs: {
      mobility: false,
      hearing: false,
      vision: false,
      communication: false,
      note: '',
    },
  };
}

/** Boş acil kişi. */
export function createEmptyContact(): Contact {
  return {
    id: crypto.randomUUID(),
    name: '',
    relation: '',
    phone: '',
    phoneAlt: '',
    outOfArea: false,
    city: '',
    canPickUpChildren: false,
  };
}

/** Boş evcil hayvan. */
export function createEmptyPet(): Pet {
  return { id: crypto.randomUUID(), name: '', kind: '', note: '' };
}

/** Atanmamış görev satırı (§11.5/7); atanmamış rol sorun değildir. */
export function createEmptyRoleAssignment(roleId: RoleId): RoleAssignment {
  return { roleId, memberId: null, note: '' };
}

/** §8.1'deki şekle uyan boş plan. */
export function createEmptyPlan(): Plan {
  const now = new Date().toISOString();

  return {
    schemaVersion: SCHEMA_VERSION,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    healthOptIn: false,
    household: { label: '', address: '', buildingNote: '', floorCount: '' },
    members: [],
    contacts: [],
    meeting: {
      nearHome: createEmptyPlace(),
      neighborhood: createEmptyPlace(),
      outOfArea: createEmptyPlace(),
      assemblyArea: createEmptyPlace(),
      assemblyCheckedAt: null,
    },
    home: {
      safeSpots: [],
      exits: [],
      utilities: { electricity: '', gas: '', water: '' },
      hazards: [],
    },
    roles: [],
    bag: { location: '', items: [], lastCheckedAt: null },
    documents: [],
    pets: [],
    insurance: { dask: 'bilmiyorum' },
    review: { lastDrillAt: null, nextReviewAt: null },
    notes: '',
  };
}

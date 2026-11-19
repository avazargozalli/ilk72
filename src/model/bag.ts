/**
 * Şartname §11.6 — haneye göre afet ve acil durum çantası listesi.
 *
 * Madde **metinleri** `src/content/registry.ts` içindedir (C-* maddeleri);
 * bu modül yalnızca hangi id'lerin seçileceğine karar verir. Böylece model
 * katmanı içerik kaydını import etmez (§mimari: bağımlılık yönü).
 *
 * Kurallar (§11.6):
 * - C-01…C-18 her hanede bulunur.
 * - `bebek` grubunda kişi varsa C-20…C-23.
 * - Herhangi bir `needs.*` işaretli ya da `health.devices` doluysa C-30, C-31.
 * - `health.medications` dolu ya da `yasli` grubunda kişi varsa C-32.
 * - Evcil hayvan varsa C-40, C-41.
 * - `cocuk` grubunda kişi varsa C-24.
 *
 * Liste numara sırasıyla üretilir: C-01…C-18, C-20…C-24, C-30…C-32, C-40, C-41.
 * `health` alanları yalnızca `healthOptIn` açıkken var olur (§8.3); izin
 * kapalıyken `devices`/`medications` zaten boş kabul edilir.
 */
import type { ChecklistState, Member, Plan } from './types';

/** Her hanede bulunan temel maddeler (§11.6). */
export const BASE_BAG_ITEM_IDS = [
  'C-01',
  'C-02',
  'C-03',
  'C-04',
  'C-05',
  'C-06',
  'C-07',
  'C-08',
  'C-09',
  'C-10',
  'C-11',
  'C-12',
  'C-13',
  'C-14',
  'C-15',
  'C-16',
  'C-17',
  'C-18',
] as const;

const INFANT_ITEM_IDS = ['C-20', 'C-21', 'C-22', 'C-23'] as const;
const CHILD_ITEM_ID = 'C-24';
const ACCESSIBILITY_ITEM_IDS = ['C-30', 'C-31'] as const;
const MEDICATION_ITEM_ID = 'C-32';
const PET_ITEM_IDS = ['C-40', 'C-41'] as const;

/** Kullanıcının kendi eklediği madde kimliğinin öneki (§11.6). */
export const CUSTOM_BAG_ITEM_PREFIX = 'ozel-';
/** En çok özel madde sayısı (§11.6). */
export const MAX_CUSTOM_BAG_ITEMS = 15;

const isFilled = (value: string | undefined): boolean => (value ?? '').trim() !== '';

function needsSupplies(member: Member): boolean {
  const { mobility, hearing, vision, communication } = member.needs;
  return mobility || hearing || vision || communication || isFilled(member.health?.devices);
}

function needsMedications(member: Member): boolean {
  return isFilled(member.health?.medications);
}

/** Hane yapısına göre çanta maddesi id'lerini üretir (saf işlev). */
export function buildBagItemIds(plan: Plan): string[] {
  const ids: string[] = [...BASE_BAG_ITEM_IDS];
  const groups = new Set(plan.members.map((member) => member.group));

  if (groups.has('bebek')) ids.push(...INFANT_ITEM_IDS);
  if (groups.has('cocuk')) ids.push(CHILD_ITEM_ID);
  if (plan.members.some(needsSupplies)) ids.push(...ACCESSIBILITY_ITEM_IDS);
  if (groups.has('yasli') || plan.members.some(needsMedications)) ids.push(MEDICATION_ITEM_ID);
  if (plan.pets.length > 0) ids.push(...PET_ITEM_IDS);

  return ids;
}

/** Kimlik kullanıcı maddesi mi (`ozel-<uuid>`)? Boş ek kimlik sayılmaz. */
export function isCustomBagItemId(id: string): boolean {
  return id.startsWith(CUSTOM_BAG_ITEM_PREFIX) && id.length > CUSTOM_BAG_ITEM_PREFIX.length;
}

/** Kullanıcının ekleyebileceği yeni madde (`ozel-<uuid>`, işaretsiz). */
export function createCustomBagItem(): ChecklistState {
  return { id: `${CUSTOM_BAG_ITEM_PREFIX}${crypto.randomUUID()}`, done: false, note: '' };
}

/**
 * Haneye göre üretilen listeyi önceki listeyle birleştirir.
 *
 * - Durum ve not `id` üzerinden korunur; yeni id'ler işaretsiz ve notsuz gelir.
 * - Üretilen listede artık bulunmayan (koşulu kalkan) maddeler düşürülür.
 * - Kullanıcı maddeleri (`ozel-*`) korunur ve listenin sonuna eklenir; en çok
 *   `MAX_CUSTOM_BAG_ITEMS` tanesi tutulur, fazlası (öncekiler kalacak biçimde)
 *   atılır.
 * - Girdi dizileri değiştirilmez; dönen maddeler yeni nesnelerdir.
 */
export function mergeBagItems(
  previous: readonly ChecklistState[],
  ids: readonly string[],
): ChecklistState[] {
  const previousById = new Map<string, ChecklistState>();
  for (const item of previous) {
    if (!previousById.has(item.id)) previousById.set(item.id, item);
  }

  const seen = new Set<string>();
  const merged: ChecklistState[] = [];

  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    const kept = previousById.get(id);
    merged.push(
      kept === undefined
        ? { id, done: false, note: '' }
        : { id: kept.id, done: kept.done, note: kept.note },
    );
  }

  let customCount = 0;
  for (const item of previous) {
    if (seen.has(item.id) || !isCustomBagItemId(item.id)) continue;
    seen.add(item.id);
    if (customCount >= MAX_CUSTOM_BAG_ITEMS) continue;
    merged.push({ id: item.id, done: item.done, note: item.note });
    customCount += 1;
  }

  return merged;
}

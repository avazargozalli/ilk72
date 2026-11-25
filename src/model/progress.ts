/**
 * Şartname §11.8 — planın bölüm doluluğu.
 *
 * Dokuz bölümün her biri için `'dolu' | 'kismen' | 'bos'` döner. İşlev **saftır**:
 * depo okumaz, planı değiştirmez; ziyaret izni dışarıdan parametre olarak gelir.
 *
 * "Dolu" koşulları §11.8 tablosundan birebir alınmıştır. "Kısmen" için tablo
 * ölçüt vermediğinden bölüme özgü, ölçülü bir kural uygulanır: bölümde
 * başlanmış ama "dolu" ölçütü tamamlanmamış veri varsa `'kismen'`.
 *
 * Dönen değer metin içermez; "Planınızın 9 bölümünden 6'sı dolu." gibi cümleler
 * `src/i18n/tr.ts` ile kurulur (§0 kural 7).
 */
import { BASE_BAG_ITEM_IDS } from './bag';
import type { Plan } from './types';

/** "Özel ihtiyaçlar" sihirbazdaki 3. adımdır (§11.5); iz 1 tabanlıdır. */
export const NEEDS_WIZARD_STEP = 3;

/** §11.8 tablosundaki dokuz bölüm, tablo sırasıyla. */
export const PLAN_SECTIONS = [
  'household',
  'members',
  'needs',
  'contacts',
  'meeting',
  'home',
  'roles',
  'bag',
  'review',
] as const;

export type PlanSection = (typeof PLAN_SECTIONS)[number];

export type SectionStatus = 'dolu' | 'kismen' | 'bos';

export interface PlanProgress {
  /** Bölüm başına durum. */
  sections: Record<PlanSection, SectionStatus>;
  /** `'dolu'` bölüm sayısı. */
  filled: number;
  /** `'kismen'` bölüm sayısı. */
  partial: number;
  /** `'bos'` bölüm sayısı. */
  empty: number;
  /** Bölüm toplamı (9). */
  total: number;
}

const NOTHING_VISITED: ReadonlySet<number> = new Set<number>();

const isFilled = (value: string): boolean => value.trim() !== '';

function householdStatus(plan: Plan): SectionStatus {
  const { label, address, buildingNote, floorCount } = plan.household;
  if (isFilled(label) && isFilled(address)) return 'dolu';
  const touched =
    isFilled(label) || isFilled(address) || isFilled(buildingNote) || isFilled(floorCount);
  return touched ? 'kismen' : 'bos';
}

function membersStatus(plan: Plan): SectionStatus {
  if (plan.members.length === 0) return 'bos';
  return plan.members.every((member) => isFilled(member.name)) ? 'dolu' : 'kismen';
}

function needsStatus(plan: Plan, visitedSteps: ReadonlySet<number>): SectionStatus {
  if (visitedSteps.has(NEEDS_WIZARD_STEP)) return 'dolu';
  const hasNeedsData = plan.members.some(
    (member) =>
      member.needs.mobility ||
      member.needs.hearing ||
      member.needs.vision ||
      member.needs.communication ||
      isFilled(member.needs.note),
  );
  return hasNeedsData || plan.healthOptIn ? 'kismen' : 'bos';
}

function contactsStatus(plan: Plan): SectionStatus {
  const usable = plan.contacts.filter(
    (contact) => isFilled(contact.name) && (isFilled(contact.phone) || isFilled(contact.phoneAlt)),
  );
  if (usable.length === 0) return 'bos';
  return usable.some((contact) => contact.outOfArea) ? 'dolu' : 'kismen';
}

function meetingStatus(plan: Plan): SectionStatus {
  const { nearHome, neighborhood, outOfArea, assemblyArea } = plan.meeting;
  if (isFilled(nearHome.label) && isFilled(neighborhood.label)) {
    return isFilled(assemblyArea.label) ? 'dolu' : 'kismen';
  }
  const touched = [nearHome, neighborhood, outOfArea, assemblyArea].some(
    (place) => isFilled(place.label) || isFilled(place.detail),
  );
  return touched ? 'kismen' : 'bos';
}

function homeStatus(plan: Plan): SectionStatus {
  const { safeSpots, exits, utilities, hazards } = plan.home;
  const hasSafeSpot = safeSpots.some(isFilled);
  const utilityCount = [utilities.electricity, utilities.gas, utilities.water].filter(
    isFilled,
  ).length;
  if (hasSafeSpot && utilityCount >= 2) return 'dolu';
  const touched =
    hasSafeSpot ||
    exits.some(isFilled) ||
    utilityCount > 0 ||
    hazards.some((hazard) => hazard.done);
  return touched ? 'kismen' : 'bos';
}

function rolesStatus(plan: Plan): SectionStatus {
  if (plan.roles.length === 0) return 'bos';
  return plan.roles.some((role) => role.memberId !== null) ? 'dolu' : 'kismen';
}

function bagStatus(plan: Plan): SectionStatus {
  const baseItemIds = new Set<string>(BASE_BAG_ITEM_IDS);
  const doneBaseItems = plan.bag.items.filter(
    (item) => item.done && baseItemIds.has(item.id),
  ).length;
  if (isFilled(plan.bag.location) && doneBaseItems * 2 >= BASE_BAG_ITEM_IDS.length) {
    return 'dolu';
  }
  const touched =
    isFilled(plan.bag.location) ||
    plan.bag.items.some((item) => item.done) ||
    plan.documents.some((documentItem) => documentItem.done) ||
    plan.bag.lastCheckedAt !== null;
  return touched ? 'kismen' : 'bos';
}

function reviewStatus(plan: Plan): SectionStatus {
  if (plan.review.nextReviewAt !== null) return 'dolu';
  return plan.review.lastDrillAt !== null ? 'kismen' : 'bos';
}

type SectionRule = (plan: Plan, visitedSteps: ReadonlySet<number>) => SectionStatus;

const SECTION_RULES: Record<PlanSection, SectionRule> = {
  household: householdStatus,
  members: membersStatus,
  needs: needsStatus,
  contacts: contactsStatus,
  meeting: meetingStatus,
  home: homeStatus,
  roles: rolesStatus,
  bag: bagStatus,
  review: reviewStatus,
};

/**
 * Tek bölümün durumu.
 *
 * @param visitedSteps Sihirbazda en az bir kez açılmış adımlar (1 tabanlı, §11.1);
 * "Özel ihtiyaçlar" için 3 gerekir.
 */
export function sectionStatus(
  plan: Plan,
  section: PlanSection,
  visitedSteps: ReadonlySet<number> = NOTHING_VISITED,
): SectionStatus {
  return SECTION_RULES[section](plan, visitedSteps);
}

/** Dokuz bölümün durumu ve sayıları. Gösterim metni i18n katmanında kurulur. */
export function computeProgress(
  plan: Plan,
  visitedSteps: ReadonlySet<number> = NOTHING_VISITED,
): PlanProgress {
  const sections = {} as Record<PlanSection, SectionStatus>;
  let filled = 0;
  let partial = 0;
  let empty = 0;

  for (const section of PLAN_SECTIONS) {
    const status = sectionStatus(plan, section, visitedSteps);
    sections[section] = status;
    if (status === 'dolu') filled += 1;
    else if (status === 'kismen') partial += 1;
    else empty += 1;
  }

  return { sections, filled, partial, empty, total: PLAN_SECTIONS.length };
}

/**
 * Şartname §11.4, §15 — sihirbaz alanlarının DOM kimlikleri.
 *
 * Doğrulama hata listesi (`ErrorSummary`) alan kimlikleriyle bağlantı kurar ve
 * odak bu kimliklere taşınır; bu yüzden kimlikler **tek yerde** üretilir ve
 * adım bileşenleriyle doğrulama aynı işlevleri kullanır. Kimlikler 1 tabanlı
 * indeks taşır ("Kişi 2 / 4" adlandırmasıyla uyumlu, §15).
 */
export const FIELD_IDS = {
  householdLabel: 'household-label',
  householdAddress: 'household-address',
  householdBuildingNote: 'household-building-note',

  memberName: (index: number): string => `member-${index + 1}-name`,
  memberPhone: (index: number): string => `member-${index + 1}-phone`,
  needsNote: (index: number): string => `member-${index + 1}-needs-note`,
  healthBloodType: (index: number): string => `member-${index + 1}-health-blood-type`,
  healthConditions: (index: number): string => `member-${index + 1}-health-conditions`,
  healthMedications: (index: number): string => `member-${index + 1}-health-medications`,
  healthAllergies: (index: number): string => `member-${index + 1}-health-allergies`,
  healthDevices: (index: number): string => `member-${index + 1}-health-devices`,
  dailyPlaceLabel: (member: number, place: number): string =>
    `member-${member + 1}-place-${place + 1}-label`,
  dailyPlacePhone: (member: number, place: number): string =>
    `member-${member + 1}-place-${place + 1}-phone`,
  dailyPlaceNote: (member: number, place: number): string =>
    `member-${member + 1}-place-${place + 1}-note`,

  contactName: (index: number): string => `contact-${index + 1}-name`,
  contactRelation: (index: number): string => `contact-${index + 1}-relation`,
  contactPhone: (index: number): string => `contact-${index + 1}-phone`,
  contactPhoneAlt: (index: number): string => `contact-${index + 1}-phone-alt`,
  contactCity: (index: number): string => `contact-${index + 1}-city`,

  meetingNearHomeLabel: 'meeting-near-home-label',
  meetingNearHomeDetail: 'meeting-near-home-detail',
  meetingNeighborhoodLabel: 'meeting-neighborhood-label',
  meetingNeighborhoodDetail: 'meeting-neighborhood-detail',
  meetingOutOfAreaLabel: 'meeting-out-of-area-label',
  meetingOutOfAreaDetail: 'meeting-out-of-area-detail',
  meetingAssemblyAreaLabel: 'meeting-assembly-area-label',
  meetingAssemblyAreaDetail: 'meeting-assembly-area-detail',
  meetingAssemblyCheckedAt: 'meeting-assembly-checked-at',

  safeSpot: (index: number): string => `home-safe-spot-${index + 1}`,
  exit: (index: number): string => `home-exit-${index + 1}`,
  utilityElectricity: 'home-utility-electricity',
  utilityGas: 'home-utility-gas',
  utilityWater: 'home-utility-water',

  roleMember: (roleId: string): string => `role-${roleId}-member`,
  roleNote: (roleId: string): string => `role-${roleId}-note`,

  bagLocation: 'bag-location',
  bagItem: (id: string): string => `bag-item-${id}`,
  bagItemNote: (id: string): string => `bag-item-${id}-note`,
  documentItem: (id: string): string => `document-${id}`,
  documentNote: (id: string): string => `document-${id}-note`,
  petName: (index: number): string => `pet-${index + 1}-name`,
  petKind: (index: number): string => `pet-${index + 1}-kind`,
  petNote: (index: number): string => `pet-${index + 1}-note`,

  lastDrillAt: 'review-last-drill-at',
  nextReviewAt: 'review-next-review-at',
  notes: 'review-notes',
} as const;

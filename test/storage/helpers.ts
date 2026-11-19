/**
 * Şartname §18.3 — saklama testlerinin ortak yardımcıları.
 *
 * Yalnızca test klasörüne aittir. `samplePlan()` §8.1'deki şekle uyan, sınırları
 * aşmayan küçük bir plan üretir (2 kişi, 1 acil kişi); `sanitizePlan` bu planda
 * hiçbir alanı değiştirmez.
 */
import {
  createEmptyContact,
  createEmptyMember,
  createEmptyPlan,
} from '../../src/model/defaults.ts';
import type { Plan } from '../../src/model/types.ts';

/** Ek B.1 — şifreleme bilinen yanıt vektörü. */
export const KNOWN_ANSWER = {
  plainText: 'İlk 72 — deneme',
  passphrase: 'Parola-Örnek 1',
  saltHex: '000102030405060708090a0b0c0d0e0f',
  ivHex: 'a0a1a2a3a4a5a6a7a8a9aaab',
  expectedHex:
    '000102030405060708090a0b0c0d0e0fa0a1a2a3a4a5a6a7a8a9aaaba8799d189e98ec59dd845de693eab0328b15e3035a10ece85b4b696863d5e88effe6',
} as const;

export function samplePlan(): Plan {
  const plan = createEmptyPlan();
  plan.household = {
    label: 'Yılmaz ailesi',
    address: 'Örnek Mahallesi 12. Sokak No 3 Daire 4',
    buildingNote: '4. kat, asansörlü, 2 merdiven',
    floorCount: '4',
  };
  plan.members = [
    {
      ...createEmptyMember('yetiskin'),
      name: 'Ayşe Yılmaz',
      phone: '0212 555 44 33',
    },
    {
      ...createEmptyMember('cocuk'),
      name: 'Mehmet Yılmaz',
    },
  ];
  plan.contacts = [
    {
      ...createEmptyContact(),
      name: 'Zeynep Kaya',
      relation: 'teyze',
      phone: '0532 111 22 33',
      outOfArea: true,
      city: 'İzmir',
      canPickUpChildren: true,
    },
  ];
  plan.meeting.nearHome = { label: 'Park', detail: 'Apartmanın karşısı' };
  plan.meeting.neighborhood = { label: 'Okul bahçesi', detail: '' };
  plan.notes = 'Yedek anahtar komşuda.';
  return plan;
}

/** Baytları küçük harfli onaltılığa çevirir (Ek B.1 karşılaştırması). */
export function toHex(bytes: Uint8Array): string {
  let hex = '';
  for (const byte of bytes) hex += byte.toString(16).padStart(2, '0');
  return hex;
}

/** Onaltılı metni baytlara çevirir (test vektörü tuz/vektörü). */
export function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

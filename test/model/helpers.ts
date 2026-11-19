/**
 * Şartname §18.2 — model testleri için ortak yardımcılar.
 *
 * Doğrulama testleri §8.1'deki şekle uyan **ham** bir nesne üzerinde çalışır;
 * alan yolları ("members.0.name" gibi) tablo hâlinde enjekte edilir. Bu dosya
 * yalnızca test klasörüne aittir, üretim koduna girmez.
 */

export interface RawObject {
  [key: string]: RawValue;
}

export type RawValue = boolean | number | null | string | RawObject | RawValue[];

export type RawContainer = RawObject | RawValue[];

export const isRawContainer = (value: RawValue | undefined): value is RawContainer =>
  typeof value === 'object' && value !== null;

/** Ham nesnenin derin kopyası; testler taban planı bozmadan değiştirir. */
export function cloneRaw<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Ham nesneden, noktayla ayrılmış yola göre değer okur. */
export function getRawPath(root: RawValue, path: string): RawValue {
  let current: RawValue = root;
  for (const part of path.split('.')) {
    if (!isRawContainer(current)) return null;
    current = Array.isArray(current) ? (current[Number(part)] ?? null) : (current[part] ?? null);
  }
  return current;
}

/** Ham nesnede, noktayla ayrılmış yola göre değer yazar (dizi indeksleri sayıdır). */
export function setRawPath(root: RawObject, path: string, value: RawValue): void {
  const container = resolveParent(root, path);
  const last = lastPart(path);
  if (Array.isArray(container)) container[Number(last)] = value;
  else container[last] = value;
}

/** Ham nesneden alanı siler; "eksik alan" davranışını sınamak için. */
export function deleteRawPath(root: RawObject, path: string): void {
  const container = resolveParent(root, path);
  const last = lastPart(path);
  if (Array.isArray(container)) container.splice(Number(last), 1);
  else delete container[last];
}

/** §8.1'deki yol biçimini uyarı yolu biçimine çevirir: `members.0.name` → `members[0].name`. */
export function toWarningPath(path: string): string {
  let result = '';
  for (const part of path.split('.')) {
    if (/^\d+$/.test(part)) result += `[${part}]`;
    else result += result === '' ? part : `.${part}`;
  }
  return result;
}

/** `sanitizePlan` çıktısını yol tabanlı okumak için ham nesne gibi ele alır. */
export function asRawObject(value: unknown): RawObject {
  return value as RawObject;
}

/** Verilen kodla üretilmiş uyarıların yol parçalarını döndürür. */
export function warningPaths(warnings: readonly string[], code: string): string[] {
  const prefix = `${code}:`;
  return warnings
    .filter((warning) => warning.startsWith(prefix))
    .map((w) => w.slice(prefix.length));
}

/** Geçerli, dolu bir üye (liste sınırı testlerinde çoğaltmak için). */
export function rawMember(index: number): RawObject {
  return {
    id: `m${index}`,
    name: `Kişi ${index}`,
    group: 'yetiskin',
    phone: '0532 000 00 00',
    dailyPlaces: [],
    needs: { mobility: false, hearing: false, vision: false, communication: false, note: '' },
  };
}

/** Geçerli, dolu bir acil kişi (liste sınırı testlerinde çoğaltmak için). */
export function rawContact(index: number): RawObject {
  return {
    id: `c${index}`,
    name: `Kişi ${index}`,
    relation: 'komşu',
    phone: '0532 111 22 33',
    phoneAlt: '',
    outOfArea: false,
    city: '',
    canPickUpChildren: false,
  };
}

/** Geçerli bir çanta/belge maddesi. */
export function rawChecklistItem(id: string): RawObject {
  return { id, done: false, note: '' };
}

/** Geçerli bir evcil hayvan. */
export function rawPet(index: number): RawObject {
  return { id: `p${index}`, name: `Evcil ${index}`, kind: 'kedi', note: '' };
}

/** Geçerli bir gün içi yer. */
export function rawDailyPlace(index: number): RawObject {
  return { kind: 'okul', label: `Yer ${index}`, phone: '', note: '' };
}

/**
 * §8.1'e uyan, hiçbir sınırı aşmayan dolu örnek plan.
 * Testler bunu kopyalayıp tek alanı bozarak beklentiyi ölçer.
 */
export function validPlanRecord(): RawObject {
  return {
    schemaVersion: 1,
    id: '11111111-1111-4111-8111-111111111111',
    createdAt: '2026-11-19T09:00:00.000Z',
    updatedAt: '2026-11-19T10:30:00.000Z',
    healthOptIn: true,
    household: {
      label: 'Yılmaz ailesi',
      address: 'Örnek Mahallesi 12. Sokak No 3 Daire 4',
      buildingNote: '4. kat, asansörlü, 2 merdiven',
      floorCount: '4',
    },
    members: [
      {
        id: 'm1',
        name: 'Ayşe Yılmaz',
        group: 'yetiskin',
        phone: '0212 555 44 33',
        dailyPlaces: [
          { kind: 'is', label: 'İş yeri', phone: '0212 555 11 22', note: 'Servisle gidiyor' },
        ],
        needs: {
          mobility: true,
          hearing: false,
          vision: false,
          communication: false,
          note: 'Merdiven inerken destek gerekir',
        },
        health: {
          bloodType: 'A+',
          conditions: 'Astım',
          medications: 'İnhaler',
          allergies: 'Polen',
          devices: 'İşitme cihazı',
        },
      },
      {
        id: 'm2',
        name: 'Mehmet Yılmaz',
        group: 'cocuk',
        phone: '',
        dailyPlaces: [],
        needs: { mobility: false, hearing: false, vision: false, communication: false, note: '' },
        health: { bloodType: '', conditions: '', medications: '', allergies: '', devices: '' },
      },
    ],
    contacts: [
      {
        id: 'c1',
        name: 'Zeynep Kaya',
        relation: 'teyze',
        phone: '0532 111 22 33',
        phoneAlt: '',
        outOfArea: true,
        city: 'İzmir',
        canPickUpChildren: true,
      },
    ],
    meeting: {
      nearHome: { label: 'Park', detail: 'Apartmanın karşısı' },
      neighborhood: { label: 'Okul bahçesi', detail: '' },
      outOfArea: { label: 'Teyzenin evi', detail: 'İzmir' },
      assemblyArea: { label: 'Kongre meydanı', detail: '' },
      assemblyCheckedAt: '2026-11-01',
    },
    home: {
      safeSpots: ['Salon: sağlam masa altı'],
      exits: ['Ana kapı', 'Balkon'],
      utilities: { electricity: 'Girişteki dolapta', gas: 'Mutfakta', water: 'Banyoda' },
      hazards: [{ id: 'H-01', done: true, note: '' }],
    },
    roles: [{ roleId: 'canta', memberId: 'm1', note: 'Yatak odasında' }],
    bag: {
      location: 'Giriş dolabı',
      items: [
        { id: 'C-01', done: true, note: '6 şişe' },
        { id: 'C-02', done: false, note: '' },
      ],
      lastCheckedAt: '2026-10-01',
    },
    documents: [{ id: 'B-01', done: true, note: '' }],
    pets: [{ id: 'p1', name: 'Tarçın', kind: 'kedi', note: 'Taşıma çantası' }],
    insurance: { dask: 'evet' },
    review: { lastDrillAt: '2026-05-01', nextReviewAt: '2027-05-01' },
    notes: 'Yedek anahtar komşuda.',
  };
}

/** Dolu örnek planın kopyasında tek yolu değiştirir. */
export function mutatedPlan(path: string, value: RawValue): RawObject {
  const raw = cloneRaw(validPlanRecord());
  setRawPath(raw, path, value);
  return raw;
}

/** Testlerde `sanitizePlan` sonucunu yol tabanlı okumak için kısayol. */
export function readPlanPath(plan: unknown, path: string): RawValue {
  return getRawPath(asRawObject(plan), path);
}

function lastPart(path: string): string {
  const parts = path.split('.');
  const last = parts.pop();
  if (last === undefined) throw new Error(`geçersiz yol: ${path}`);
  return last;
}

function resolveParent(root: RawObject, path: string): RawContainer {
  const parts = path.split('.');
  parts.pop();
  let current: RawContainer = root;
  for (const part of parts) {
    const next: RawValue | undefined = Array.isArray(current)
      ? current[Number(part)]
      : current[part];
    if (!isRawContainer(next)) throw new Error(`yol bulunamadı: ${path}`);
    current = next;
  }
  return current;
}

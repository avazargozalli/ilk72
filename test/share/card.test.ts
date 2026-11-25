/**
 * Şartname §10.1, §18.3, Ek B.3 — özet kart üretimi ve doğrulaması testleri.
 *
 * Normatif örnek kart `test/vectors/share-card.json` dosyasından **dosyadan**
 * okunur; böylece vektörün kendisi de denetlenir. Vektörün şartnamedeki
 * örnekle aynı olduğu (602 bayt) codec testlerinde de doğrulanır.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  createEmptyContact,
  createEmptyMember,
  createEmptyPlan,
} from '../../src/model/defaults.ts';
import type { Plan } from '../../src/model/types.ts';
import {
  buildShareCard,
  CARD_VERSION,
  SHARE_CARD_LIMITS,
  type ShareCard,
  type ShareCardOptions,
  validateCard,
} from '../../src/share/card.ts';

/**
 * happy-dom ortamında global `URL` tarayıcı sınıfıdır; göreli bir yolu dosya
 * yoluna çevirmez (bkz. `new URL(..., import.meta.url)` → `http://localhost`).
 * Bu yüzden vektör yolu `fileURLToPath` ile kurulur.
 */
const HERE = dirname(fileURLToPath(import.meta.url));
const VECTOR_PATH = join(HERE, '..', 'vectors', 'share-card.json');

/** Ek B.3 — şartnamedeki örnek özet kart (dosyadan). */
function readVector(): ShareCard {
  return JSON.parse(readFileSync(VECTOR_PATH, 'utf8')) as ShareCard;
}

const vector = readVector();

const plainOptions: ShareCardOptions = { includeNeedsNotes: false, includeHealth: false };
const notesOptions: ShareCardOptions = { includeNeedsNotes: true, includeHealth: false };

/**
 * Ek B.3 vektörünü **birebir** üreten plan. Kart üretim kuralları (buluşma
 * yeri = etiket + ", " + tarif, acil kişi = "Ad (ilişki)") bu eşitlikle kilitlenir.
 */
function vectorPlan(): Plan {
  const plan = createEmptyPlan();
  plan.household = {
    label: 'Yılmaz ailesi',
    address: 'Örnek Mahallesi 12. Sokak No 3 Daire 4',
    buildingNote: '4. kat, asansörlü, 2 merdiven',
    floorCount: '4',
  };
  plan.updatedAt = '2026-11-19T09:00:00.000Z';
  plan.members = [
    { ...createEmptyMember('yetiskin'), name: 'Ayşe Yılmaz', phone: '05550000001' },
    { ...createEmptyMember('yetiskin'), name: 'Mehmet Yılmaz', phone: '05550000002' },
    { ...createEmptyMember('cocuk'), name: 'Elif Yılmaz', phone: '' },
    { ...createEmptyMember('yasli'), name: 'Hatice Yılmaz', phone: '05550000003' },
  ];
  plan.contacts = [
    {
      ...createEmptyContact(),
      name: 'Fatma Demir',
      relation: 'teyze',
      phone: '05550000004',
      outOfArea: true,
      city: 'İzmir',
    },
    {
      ...createEmptyContact(),
      name: 'Ali Kaya',
      relation: 'komşu',
      phone: '05550000005',
      outOfArea: false,
      city: '',
    },
  ];
  plan.meeting.nearHome = {
    label: 'Apartmanın karşısındaki park',
    detail: 'çınar ağacının altı',
  };
  plan.meeting.neighborhood = { label: 'Mahalle pazaryeri girişi', detail: '' };
  plan.meeting.outOfArea = { label: 'İzmir', detail: 'Fatma teyzenin evi' };
  plan.meeting.assemblyArea = { label: 'Cumhuriyet İlkokulu bahçesi', detail: '' };
  plan.notes = 'Elif okuldaysa öğretmeninden teslim alınacak. Hatice Hanım yürüteç kullanıyor.';
  return plan;
}

/** Sağlık ve adres taşıyan plan: kartta hiçbirinin görünmediğini denetlemek için. */
function healthPlan(): Plan {
  const plan = vectorPlan();
  const first = plan.members[0];
  if (first === undefined) throw new Error('test planı bozuk');
  first.needs.note = 'Merdiven inerken destek gerekir';
  first.health = {
    bloodType: 'A+',
    conditions: 'Astım',
    medications: 'İnhaler',
    allergies: 'Polen',
    devices: 'İşitme cihazı',
  };
  return plan;
}

describe('buildShareCard — Ek B.3 vektörü', () => {
  it('şartnamedeki örnek kartı birebir üretir', () => {
    expect(buildShareCard(vectorPlan(), plainOptions)).toEqual(vector);
  });

  it('gidiş-dönüş: ürettiği kartı JSON gidiş-dönüşünde korur', () => {
    const card = buildShareCard(vectorPlan(), plainOptions);
    expect(JSON.parse(JSON.stringify(card))).toEqual(vector);
  });

  it('birleşik buluşma tarifi kesildikten sonra doğrulama kartı değiştirmez', () => {
    const plan = vectorPlan();
    plan.meeting.nearHome = { label: 'Park', detail: `${'a'.repeat(193)} son` };
    const card = buildShareCard(plan, plainOptions);
    expect(card.b.e).toHaveLength(199);
    expect(validateCard(card)).toEqual(card);
  });

  it('şema sürümü 1 ve alanlar tam olarak v, h, u, k, i, b, n', () => {
    const card = buildShareCard(vectorPlan(), plainOptions);
    expect(card.v).toBe(CARD_VERSION);
    expect(CARD_VERSION).toBe(1);
    expect(Object.keys(card).sort()).toEqual(['b', 'h', 'i', 'k', 'n', 'u', 'v']);
    expect(card.b).toEqual({
      e: 'Apartmanın karşısındaki park, çınar ağacının altı',
      m: 'Mahalle pazaryeri girişi',
      d: 'İzmir, Fatma teyzenin evi',
      t: 'Cumhuriyet İlkokulu bahçesi',
    });
  });

  it('güncelleme tarihini YYYY-AA-GG biçimine indirir, geçersizse boş bırakır', () => {
    const plan = vectorPlan();
    plan.updatedAt = '2026-03-09T23:59:59.000+03:00';
    expect(buildShareCard(plan, plainOptions).u).toBe('2026-03-09');

    plan.updatedAt = 'bilinmiyor';
    expect(buildShareCard(plan, plainOptions).u).toBe('');
  });
});

describe('buildShareCard — veri azaltma (İ8, §10.1)', () => {
  it('ev adresi ve sağlık bilgisi karta hiçbir koşulda girmez', () => {
    const card = buildShareCard(healthPlan(), { includeNeedsNotes: true, includeHealth: true });
    const json = JSON.stringify(card);
    for (const secret of [
      'Örnek Mahallesi',
      '12. Sokak',
      'Astım',
      'İnhaler',
      'Polen',
      'İşitme cihazı',
      'A+',
      'conditions',
      'medications',
      'allergies',
      'bloodType',
      'address',
      'health',
    ]) {
      expect(json, secret).not.toContain(secret);
    }
  });

  it('`includeHealth` seçeneği hiçbir şey eklemez (yalnızca arayüz simetrisi)', () => {
    const plan = healthPlan();
    const withHealth = buildShareCard(plan, { includeNeedsNotes: true, includeHealth: true });
    const withoutHealth = buildShareCard(plan, { includeNeedsNotes: true, includeHealth: false });
    expect(withHealth).toEqual(withoutHealth);
  });

  it('kişilerde yalnız a, t ve onayla o alanı bulunur', () => {
    const plain = buildShareCard(healthPlan(), plainOptions);
    const notes = buildShareCard(healthPlan(), notesOptions);
    expect(plain.k.every((person) => [...Object.keys(person)].sort().join() === 'a,t')).toBe(true);
    expect(notes.k[0]).toEqual({
      a: 'Ayşe Yılmaz',
      t: '05550000001',
      o: 'Merdiven inerken destek gerekir',
    });
  });

  it('`k[].o` yalnızca includeNeedsNotes açıkken ve not boş değilken dolar', () => {
    const plan = healthPlan();
    expect(buildShareCard(plan, plainOptions).k.some((person) => 'o' in person)).toBe(false);

    const withNotes = buildShareCard(plan, notesOptions);
    expect(withNotes.k.filter((person) => 'o' in person)).toHaveLength(1);

    const emptyNote = healthPlan();
    const member = emptyNote.members[0];
    if (member === undefined) throw new Error('test planı bozuk');
    member.needs.note = '   ';
    expect(buildShareCard(emptyNote, notesOptions).k.some((person) => 'o' in person)).toBe(false);
  });

  it('özel ihtiyaç notunu 120 karaktere, notu 300 karaktere indirir', () => {
    const plan = healthPlan();
    const member = plan.members[0];
    if (member === undefined) throw new Error('test planı bozuk');
    member.needs.note = 'n'.repeat(200);
    plan.notes = 'x'.repeat(400);
    const card = buildShareCard(plan, notesOptions);
    expect(card.k[0]?.o).toHaveLength(SHARE_CARD_LIMITS.needsNoteLength);
    expect(card.n).toHaveLength(SHARE_CARD_LIMITS.notesLength);
  });
});

describe('buildShareCard — alan kuralları', () => {
  it('adı ve telefonu boş kişileri atar, yalnız telefonu olanı korur', () => {
    const plan = vectorPlan();
    plan.members = [
      { ...createEmptyMember(), name: '', phone: '' },
      { ...createEmptyMember(), name: '', phone: '0555 111 22 33' },
      { ...createEmptyMember(), name: 'Ayşe', phone: '' },
    ];
    expect(buildShareCard(plan, plainOptions).k).toEqual([
      { a: '', t: '0555 111 22 33' },
      { a: 'Ayşe', t: '' },
    ]);
  });

  it('acil kişide ad ve ilişkiyi birleştirir; biri boşsa diğerini yazar', () => {
    const plan = vectorPlan();
    plan.contacts = [
      { ...createEmptyContact(), name: 'Ali Kaya', relation: 'komşu', phone: '1' },
      { ...createEmptyContact(), name: 'Veli', relation: '', phone: '2' },
      { ...createEmptyContact(), name: '', relation: 'muhtar', phone: '3' },
      { ...createEmptyContact(), name: '', relation: '', phone: '' },
    ];
    expect(buildShareCard(plan, plainOptions).i.map((contact) => contact.a)).toEqual([
      'Ali Kaya (komşu)',
      'Veli',
      'muhtar',
    ]);
  });

  it('asıl telefon boşsa ikinci telefonu kullanır', () => {
    const plan = vectorPlan();
    plan.contacts = [
      { ...createEmptyContact(), name: 'Ali', phone: '', phoneAlt: '0555 999 88 77' },
    ];
    expect(buildShareCard(plan, plainOptions).i[0]?.t).toBe('0555 999 88 77');
  });

  it('buluşma yerinde etiket ve tarifi virgülle birleştirir', () => {
    const plan = vectorPlan();
    plan.meeting.nearHome = { label: 'Park', detail: 'kapının karşısı' };
    plan.meeting.neighborhood = { label: 'Okul bahçesi', detail: '' };
    plan.meeting.outOfArea = { label: '', detail: 'Teyzenin evi' };
    plan.meeting.assemblyArea = { label: '', detail: '' };
    expect(buildShareCard(plan, plainOptions).b).toEqual({
      e: 'Park, kapının karşısı',
      m: 'Okul bahçesi',
      d: 'Teyzenin evi',
      t: '',
    });
  });

  it('çok satırlı notta satır sonlarını korur, denetim karakterlerini atar', () => {
    const plan = vectorPlan();
    plan.notes = '  Birinci satır\r\nİkinci\u0007 satır  ';
    const card = buildShareCard(plan, plainOptions);
    expect(card.n).toBe('Birinci satır\nİkinci satır');
  });

  it('metinleri NFC ile normalleştirir ve kırpar (§8.2)', () => {
    const plan = vectorPlan();
    plan.household.label = '  Yılmaz ailesi\u0000  ';
    expect(buildShareCard(plan, plainOptions).h).toBe('Yılmaz ailesi');
  });

  it('ürettiği kart her zaman validateCard süzgecinden değişmeden geçer', () => {
    const extreme = healthPlan();
    const member = extreme.members[0];
    if (member === undefined) throw new Error('test planı bozuk');
    member.name = 'N'.repeat(80);
    member.phone = '1'.repeat(40);
    member.needs.note = 'o'.repeat(200);
    extreme.meeting.outOfArea = { label: 'L'.repeat(80), detail: 'D'.repeat(250) };
    extreme.notes = 'not\r\n'.repeat(120);
    for (const options of [plainOptions, notesOptions]) {
      const card = buildShareCard(extreme, options);
      expect(validateCard(card)).toEqual(card);
    }
  });

  it('doğrulanmamış planda listeleri 12 ve 10 ile sınırlar', () => {
    const plan = vectorPlan();
    plan.members = Array.from({ length: 20 }, (_value, index) => ({
      ...createEmptyMember(),
      name: `Kişi ${index}`,
      phone: '0555 000 00 00',
    }));
    plan.contacts = Array.from({ length: 15 }, (_value, index) => ({
      ...createEmptyContact(),
      name: `Acil ${index}`,
      phone: '0555 111 22 33',
    }));
    const card = buildShareCard(plan, plainOptions);
    expect(card.k).toHaveLength(12);
    expect(card.i).toHaveLength(10);
    expect(validateCard(card)).toEqual(card);
  });

  it('boş planda da geçerli bir kart üretir', () => {
    const card = buildShareCard(createEmptyPlan(), plainOptions);
    expect(card).toEqual({
      v: 1,
      h: '',
      u: card.u,
      k: [],
      i: [],
      b: { e: '', m: '', d: '', t: '' },
      n: '',
    });
    expect(card.u).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(() => validateCard(card)).not.toThrow();
  });
});

describe('validateCard — sınırlar ve temizlik', () => {
  it('Ek B.3 vektörünü değiştirmeden döndürür', () => {
    expect(validateCard(vector)).toEqual(vector);
  });

  it('bilinmeyen alanları her düzeyde atar', () => {
    const dirty = {
      ...vector,
      extra: 'x',
      address: 'Örnek Mahallesi',
      k: vector.k.map((person, index) => (index === 0 ? { ...person, health: 'A+' } : person)),
      i: vector.i.map((contact, index) => (index === 0 ? { ...contact, note: 'gizli' } : contact)),
      b: { ...vector.b, x: 1 },
    };
    const clean = validateCard(dirty);
    expect(clean).toEqual(vector);
    expect(JSON.stringify(clean)).not.toContain('Örnek Mahallesi');
    expect(JSON.stringify(clean)).not.toContain('gizli');
  });

  it('13 kişiyi 12ye, 11 acil kişiyi 10a indirir', () => {
    const people = Array.from({ length: 13 }, (_value, index) => ({
      a: `Kişi ${index}`,
      t: '05550000000',
    }));
    const contacts = Array.from({ length: 11 }, (_value, index) => ({
      a: `Acil ${index}`,
      t: '05550000001',
      d: false,
      s: '',
    }));
    const card = validateCard({ ...vector, k: people, i: contacts });
    expect(card.k).toHaveLength(SHARE_CARD_LIMITS.members);
    expect(card.k).toHaveLength(12);
    expect(card.k[11]?.a).toBe('Kişi 11');
    expect(card.i).toHaveLength(SHARE_CARD_LIMITS.contacts);
    expect(card.i).toHaveLength(10);
  });

  it('metin sınırlarını uygular (§8.2, §10.1)', () => {
    const card = validateCard({
      v: 1,
      h: 'h'.repeat(80),
      u: '2026-11-19',
      k: [{ a: 'a'.repeat(80), t: '1'.repeat(40), o: 'o'.repeat(200) }],
      i: [{ a: 'c'.repeat(200), t: 't'.repeat(40), d: true, s: 's'.repeat(80) }],
      b: { e: 'e'.repeat(300), m: 'm'.repeat(300), d: 'd'.repeat(300), t: 't'.repeat(300) },
      n: 'n'.repeat(400),
    });
    expect(card.h).toHaveLength(SHARE_CARD_LIMITS.householdLength);
    expect(card.h).toHaveLength(60);
    expect(card.k[0]?.a).toHaveLength(60);
    expect(card.k[0]?.t).toHaveLength(20);
    expect(card.k[0]?.o).toHaveLength(120);
    expect(card.i[0]?.a).toHaveLength(SHARE_CARD_LIMITS.contactLabelLength);
    expect(card.i[0]?.a).toHaveLength(123);
    expect(card.i[0]?.t).toHaveLength(20);
    expect(card.i[0]?.s).toHaveLength(60);
    expect(card.b.e).toHaveLength(200);
    expect(card.b.t).toHaveLength(200);
    expect(card.n).toHaveLength(300);
  });

  it('eksik alanları boş değerle doldurur, boş `o` alanını düşürür', () => {
    expect(validateCard({ v: 1 })).toEqual({
      v: 1,
      h: '',
      u: '',
      k: [],
      i: [],
      b: { e: '', m: '', d: '', t: '' },
      n: '',
    });
    expect(validateCard({ v: 1, k: [{ a: 'A', t: '', o: '  ' }] }).k).toEqual([{ a: 'A', t: '' }]);
    expect(validateCard({ v: 1, i: [{ a: 'Ali', t: '0555 111 22 33' }] }).i).toEqual([
      { a: 'Ali', t: '0555 111 22 33', d: false, s: '' },
    ]);
  });

  it('geçersiz güncelleme tarihini boşaltır', () => {
    for (const value of ['', '19.11.2026', '2026-13-05', '2026-02-31', '2026-11-19T10:00:00Z']) {
      const card = validateCard({ v: 1, u: value });
      expect(card.u, value).toBe(value === '2026-11-19T10:00:00Z' ? '2026-11-19' : '');
    }
  });

  it('tür uymazsa bozuk-veri fırlatır', () => {
    const broken: unknown[] = [
      null,
      undefined,
      'metin',
      42,
      [],
      [vector],
      {},
      { v: 2 },
      { v: '1' },
      { v: 1, h: 42 },
      { v: 1, u: 42 },
      { v: 1, n: null },
      { v: 1, k: 'x' },
      { v: 1, k: [null] },
      { v: 1, k: ['kişi'] },
      { v: 1, k: [{ a: 1 }] },
      { v: 1, k: [{ a: 'A', t: 5 }] },
      { v: 1, k: [{ a: 'A', t: '', o: 5 }] },
      { v: 1, i: {} },
      { v: 1, i: [null] },
      { v: 1, i: [{ a: 'A', t: '', d: 'evet', s: '' }] },
      { v: 1, i: [{ a: 'A', t: '', d: false, s: 5 }] },
      { v: 1, b: 'x' },
      { v: 1, b: { e: 1 } },
    ];
    for (const input of broken) {
      expect(() => validateCard(input), JSON.stringify(input) ?? String(input)).toThrow(
        'bozuk-veri',
      );
    }
  });

  it('sınırlar şartnamedeki §8.2 değerleridir', () => {
    expect(SHARE_CARD_LIMITS).toMatchObject({
      members: 12,
      contacts: 10,
      householdLength: 60,
      nameLength: 60,
      phoneLength: 20,
      contactLabelLength: 123,
      cityLength: 60,
      placeLength: 200,
      needsNoteLength: 120,
      notesLength: 300,
    });
  });
});

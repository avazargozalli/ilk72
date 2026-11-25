/**
 * Şartname §10.1, §10.3, §4.2 (İ8) — plan → **özet kart** ve özet kart doğrulama.
 *
 * Paylaşılan şey tam plan değildir. Özet kartın şeması normatiftir (§10.1) ve
 * kısa anahtarlar yalnızca yer kazanmak içindir:
 *
 * ```ts
 * { v, h, u, k: [{ a, t, o? }], i: [{ a, t, d, s }], b: { e, m, d, t }, n }
 * ```
 *
 * Bilinçli kararlar:
 *
 * - **Ev adresi ve sağlık alanı şemada yoktur.** `household.address`,
 *   `household.buildingNote` ve `member.health` hiçbir koşulda karta girmez
 *   (§10.1, §4.2, İ8). `ShareCardOptions.includeHealth` çağrı yerinde yazdırma
 *   seçenekleriyle simetriyi korumak için alınır ve **bilerek okunmaz**. Serbest
 *   metin alanları kullanıcının yazdığı sağlık veya adres bilgilerini içerebilir.
 * - `k[].o` yalnızca `includeNeedsNotes` true **ve** kişinin özel ihtiyaç notu
 *   boş değilse eklenir; 120 karaktere indirilir (§10.1).
 * - Üretilen kart her zaman `validateCard` süzgecinden **değişmeden** geçer
 *   (sınırlar burada da uygulanır); böylece gönderen ile alan aynı şeyi görür.
 * - Adı ve telefonu boş olan kişi/kayıt karta konmaz: karta yazılacak bir şey
 *   taşımaz ve `SHARE_MAX_URL` (1200) sınırında yer kaplar.
 * - Buluşma yeri etiketi ve tarifi tek dizeye birleştirilir (`"etiket, tarif"`);
 *   şartnamedeki örnek kartın biçimi budur (§10.1, Ek B.3).
 */

import type { Place, Plan } from '../model/types.ts';
import { PLAN_LIMITS } from '../model/validate.ts';

/** Özet kart şema sürümü (§10.1). */
export const CARD_VERSION = 1;

/** §10.1 — kişiler: ad, telefon, isteğe bağlı özel ihtiyaç notu. */
export interface SharePerson {
  a: string;
  t: string;
  o?: string;
}

/** §10.1 — acil kişi: ad (+ilişki), telefon, şehir dışı mı, şehir. */
export interface ShareContact {
  a: string;
  t: string;
  d: boolean;
  s: string;
}

/** §10.1 — buluşma yerleri: ev yakını, mahalle, şehir dışı, toplanma alanı. */
export interface ShareMeeting {
  e: string;
  m: string;
  d: string;
  t: string;
}

/** §10.1 — özet kart (şartnamedeki tip birebir). */
export interface ShareCard {
  v: 1;
  h: string;
  u: string;
  k: SharePerson[];
  i: ShareContact[];
  b: ShareMeeting;
  n: string;
}

/**
 * Paylaşım ekranındaki iki onay. `includeHealth` bilerek etkisizdir (bkz. dosya
 * başlığı ve İ8): özet kartta sağlık alanı yoktur.
 */
export interface ShareCardOptions {
  includeNeedsNotes: boolean;
  includeHealth: boolean;
}

/**
 * Özet kartın metin sınırları. Şartname §8.2 tablosu + §10.1'deki kart
 * sınırları. `contactLabelLength`, `"Ad (ilişki)"` biçimi içindir:
 * 60 + 3 + 60 = 123.
 */
export const SHARE_CARD_LIMITS = {
  members: PLAN_LIMITS.members,
  contacts: PLAN_LIMITS.contacts,
  householdLength: PLAN_LIMITS.nameLength,
  nameLength: PLAN_LIMITS.nameLength,
  phoneLength: PLAN_LIMITS.phoneMaxLength,
  contactLabelLength: PLAN_LIMITS.nameLength * 2 + 3,
  cityLength: PLAN_LIMITS.nameLength,
  placeLength: PLAN_LIMITS.shortTextLength,
  needsNoteLength: 120,
  notesLength: 300,
} as const;

/** Denetim karakterleri (§8.2): tek satırlık metinlerde tamamen silinir. */
const CONTROL_CHARS = /\p{Cc}/gu;
/** Çok satırlı metinde satır sonu korunur; ötekiler silinir. */
const MULTILINE_CONTROL_CHARS = /(?!\n)\p{Cc}/gu;
const LINE_BREAKS = /\r\n?/g;
const CARD_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** §8.2 — kırp, denetim karakterlerini sil, NFC uygula. */
function normalizeText(value: string, multiline = false): string {
  const text = value.trim();
  if (multiline) {
    return text.replace(LINE_BREAKS, '\n').replace(MULTILINE_CONTROL_CHARS, '').normalize('NFC');
  }
  return text.replace(CONTROL_CHARS, '').normalize('NFC').trim();
}

/** §8.2 — sınırı aşan metni kod noktası bazında keser. */
function clampText(value: string, max: number): string {
  const characters = [...value];
  return characters.length > max ? characters.slice(0, max).join('') : value;
}

/**
 * §8.2 + sınır: normalleştirir, keser ve kesimden sonra kalan boşluğu kırpar.
 * Son kırpma, kesimin tam boşluk/ satır sonu üstüne denk geldiği durumda
 * `buildShareCard` ile `validateCard` çıktısının aynı kalmasını sağlar.
 */
function cleanText(value: string, max: number, multiline = false): string {
  return clampText(normalizeText(value, multiline), max).trim();
}

const hasText = (...values: readonly string[]): boolean => values.some((value) => value !== '');

/** Takvimsel geçerlilik: `2026-02-31` gibi tarihler reddedilir. */
function isCardDate(value: string): boolean {
  if (!CARD_DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

/** ISO zaman damgasının tarih bölümü; geçersizse boş dize. */
function cardDate(isoTimestamp: string): string {
  const date = normalizeText(isoTimestamp).slice(0, 10);
  return isCardDate(date) ? date : '';
}

/** Buluşma yeri: `"etiket, tarif"` (boş parçalar atlanır). */
function placeLine(place: Place): string {
  const label = cleanText(place.label, SHARE_CARD_LIMITS.nameLength);
  const detail = cleanText(place.detail, SHARE_CARD_LIMITS.placeLength);
  if (label === '') return detail;
  if (detail === '') return label;
  return clampText(`${label}, ${detail}`, SHARE_CARD_LIMITS.placeLength).trimEnd();
}

function sharePerson(
  person: Plan['members'][number],
  includeNeedsNotes: boolean,
): SharePerson | null {
  const name = cleanText(person.name, SHARE_CARD_LIMITS.nameLength);
  const phone = cleanText(person.phone, SHARE_CARD_LIMITS.phoneLength);
  if (!hasText(name, phone)) return null;
  const shared: SharePerson = { a: name, t: phone };
  if (!includeNeedsNotes) return shared;
  const note = cleanText(person.needs.note, SHARE_CARD_LIMITS.needsNoteLength, true);
  if (note !== '') shared.o = note;
  return shared;
}

function shareContact(contact: Plan['contacts'][number]): ShareContact | null {
  const name = cleanText(contact.name, SHARE_CARD_LIMITS.nameLength);
  const relation = cleanText(contact.relation, SHARE_CARD_LIMITS.nameLength);
  const phone = cleanText(
    contact.phone === '' ? contact.phoneAlt : contact.phone,
    SHARE_CARD_LIMITS.phoneLength,
  );
  if (!hasText(name, relation, phone)) return null;
  const label = name === '' ? relation : relation === '' ? name : `${name} (${relation})`;
  return {
    a: clampText(label, SHARE_CARD_LIMITS.contactLabelLength),
    t: phone,
    d: contact.outOfArea,
    s: cleanText(contact.city, SHARE_CARD_LIMITS.cityLength),
  };
}

/**
 * §10.1 — plandan özet kart üretir. Yapılandırılmış ev adresi ve sağlık alanları çıkarılır.
 * `options.includeHealth` bilerek okunmaz (bkz. dosya başlığı).
 */
export function buildShareCard(plan: Plan, options: ShareCardOptions): ShareCard {
  const people: SharePerson[] = [];
  for (const member of plan.members.slice(0, SHARE_CARD_LIMITS.members)) {
    const person = sharePerson(member, options.includeNeedsNotes);
    if (person !== null) people.push(person);
  }

  const contacts: ShareContact[] = [];
  for (const contact of plan.contacts.slice(0, SHARE_CARD_LIMITS.contacts)) {
    const shared = shareContact(contact);
    if (shared !== null) contacts.push(shared);
  }

  return {
    v: CARD_VERSION,
    h: cleanText(plan.household.label, SHARE_CARD_LIMITS.householdLength),
    u: cardDate(plan.updatedAt),
    k: people,
    i: contacts,
    b: {
      e: placeLine(plan.meeting.nearHome),
      m: placeLine(plan.meeting.neighborhood),
      d: placeLine(plan.meeting.outOfArea),
      t: placeLine(plan.meeting.assemblyArea),
    },
    n: cleanText(plan.notes, SHARE_CARD_LIMITS.notesLength, true),
  };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** §10.1 — tür uymazsa `bozuk-veri` (§10.3 hata iletileri Ek B.3 kodlarıyla). */
function fail(): never {
  throw new Error('bozuk-veri');
}

function readText(
  record: Record<string, unknown>,
  key: string,
  max: number,
  multiline = false,
): string {
  const value = record[key];
  if (value === undefined) return '';
  if (typeof value !== 'string') fail();
  return cleanText(value, max, multiline);
}

function readFlag(record: Record<string, unknown>, key: string): boolean {
  const value = record[key];
  if (value === undefined) return false;
  if (typeof value !== 'boolean') fail();
  return value;
}

function readCardDate(value: unknown): string {
  if (value === undefined) return '';
  if (typeof value !== 'string') fail();
  const date = normalizeText(value).slice(0, 10);
  return isCardDate(date) ? date : '';
}

function readList<T>(value: unknown, max: number, readItem: (item: unknown) => T): T[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) fail();
  const items: T[] = [];
  for (const item of value.slice(0, max)) items.push(readItem(item));
  return items;
}

function readPerson(value: unknown): SharePerson {
  if (!isRecord(value)) fail();
  const person: SharePerson = {
    a: readText(value, 'a', SHARE_CARD_LIMITS.nameLength),
    t: readText(value, 't', SHARE_CARD_LIMITS.phoneLength),
  };
  const note = value.o;
  if (note !== undefined) {
    if (typeof note !== 'string') fail();
    const text = cleanText(note, SHARE_CARD_LIMITS.needsNoteLength, true);
    if (text !== '') person.o = text;
  }
  return person;
}

function readContact(value: unknown): ShareContact {
  if (!isRecord(value)) fail();
  return {
    a: readText(value, 'a', SHARE_CARD_LIMITS.contactLabelLength),
    t: readText(value, 't', SHARE_CARD_LIMITS.phoneLength),
    d: readFlag(value, 'd'),
    s: readText(value, 's', SHARE_CARD_LIMITS.cityLength),
  };
}

function readMeeting(value: unknown): ShareMeeting {
  if (value === undefined) return { e: '', m: '', d: '', t: '' };
  if (!isRecord(value)) fail();
  return {
    e: readText(value, 'e', SHARE_CARD_LIMITS.placeLength),
    m: readText(value, 'm', SHARE_CARD_LIMITS.placeLength),
    d: readText(value, 'd', SHARE_CARD_LIMITS.placeLength),
    t: readText(value, 't', SHARE_CARD_LIMITS.placeLength),
  };
}

/**
 * §10.1, §10.3 — bağlantıdan gelen **güvenilmez** özet kartı doğrular.
 *
 * Bilinmeyen alanlar atılır, metinler §8.2 sınırlarına kesilir, kişi listesi
 * 12'ye, acil kişi listesi 10'a indirilir. Eksik alan boş değerle doldurulur
 * (boş `o` alanı düşürülür). Bir alanın türü uymuyorsa ya da `v` 1 değilse
 * `Error('bozuk-veri')` fırlatılır; bozuk kart ekrana çıkmaz.
 *
 * Telefonlar **atılmaz**: §10.3/5 uyarınca içe alınan bir numara yalnızca
 * §8.2'deki karakter kümesine uyuyorsa `tel:` bağlantısı olur, uymuyorsa düz
 * metin olarak gösterilir. Karar arayüzündür, doğrulamanın değil.
 *
 * @throws `Error('bozuk-veri')`
 */
export function validateCard(input: unknown): ShareCard {
  if (!isRecord(input) || input.v !== CARD_VERSION) fail();
  return {
    v: CARD_VERSION,
    h: readText(input, 'h', SHARE_CARD_LIMITS.householdLength),
    u: readCardDate(input.u),
    k: readList(input.k, SHARE_CARD_LIMITS.members, readPerson),
    i: readList(input.i, SHARE_CARD_LIMITS.contacts, readContact),
    b: readMeeting(input.b),
    n: readText(input, 'n', SHARE_CARD_LIMITS.notesLength, true),
  };
}

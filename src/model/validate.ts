/**
 * Şartname §8.2, §8.3 — şema doğrulama ve temizleme.
 *
 * `sanitizePlan`, depodan, yedek dosyasından ve paylaşım bağlantısından gelen
 * **her** veriye uygulanır (§8.3). Girdi asla olduğu gibi kullanılmaz: alanlar
 * tek tek okunur, bilinmeyen alanlar atılır, eksik alanlar varsayılanla
 * doldurulur, türü uymayan değer varsayılana döner, sınırı aşan metin kesilir
 * ve uyarı eklenir.
 *
 * Uyarılar `"<kod>:<yol>"` biçiminde döner (bkz. `warnings.ts`); ör.
 * `"sinir-asildi:members[0].name"`. Kullanıcıya görünen metin burada üretilmez.
 *
 * Bilinçli kararlar:
 * - Girdi nesne değilse ya da `schemaVersion !== 1` ise
 *   `Error('desteklenmeyen-surum')` fırlatılır (§8.3).
 * - `member.name` boş bırakılabilir: model veri uydurmaz, "en az bir kişinin
 *   adı" zorunluluğu sihirbazda uygulanır (§11.4).
 * - `healthOptIn === false` iken sağlık verisinin içi denetlenmez; doğrudan
 *   silinir ve tek bir `saglik-silindi` uyarısı üretilir (§4.2, İ8).
 * - Boş metin listesi öğeleri (`home.safeSpots` gibi) yazdırma çıktısında boş
 *   satır bırakmamak için düşürülür; bu veri kaybı değildir, alan boştur.
 */

import { createEmptyDailyPlace, createEmptyHealth } from './defaults';
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
import { formatWarning, type PlanWarning } from './warnings';

/** §8.2 tablosundaki sayısal sınırlar. Arayüz doğrulaması da bunları kullanır. */
export const PLAN_LIMITS = {
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
} as const;

const MEMBER_GROUPS = ['yetiskin', 'cocuk', 'bebek', 'yasli'] as const;
const DAILY_PLACE_KINDS = ['okul', 'is', 'diger'] as const;
const ROLE_IDS = [
  'canta',
  'vanalar',
  'cocuklar',
  'yaslilar',
  'evcil',
  'kapilar',
  'iletisim',
] as const;
const BLOOD_TYPES = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-'] as const;
const YES_NO_UNKNOWN = ['evet', 'hayir', 'bilmiyorum'] as const;

const TOP_LEVEL_KEYS = [
  'schemaVersion',
  'id',
  'createdAt',
  'updatedAt',
  'healthOptIn',
  'household',
  'members',
  'contacts',
  'meeting',
  'home',
  'roles',
  'bag',
  'documents',
  'pets',
  'insurance',
  'review',
  'notes',
] as const;
const HOUSEHOLD_KEYS = ['label', 'address', 'buildingNote', 'floorCount'] as const;
const PLACE_KEYS = ['label', 'detail'] as const;
const DAILY_PLACE_KEYS = ['kind', 'label', 'phone', 'note'] as const;
const NEEDS_KEYS = ['mobility', 'hearing', 'vision', 'communication', 'note'] as const;
const MEMBER_KEYS = ['id', 'name', 'group', 'phone', 'dailyPlaces', 'needs', 'health'] as const;
const HEALTH_KEYS = ['bloodType', 'conditions', 'medications', 'allergies', 'devices'] as const;
const CONTACT_KEYS = [
  'id',
  'name',
  'relation',
  'phone',
  'phoneAlt',
  'outOfArea',
  'city',
  'canPickUpChildren',
] as const;
const MEETING_KEYS = [
  'nearHome',
  'neighborhood',
  'outOfArea',
  'assemblyArea',
  'assemblyCheckedAt',
] as const;
const HOME_KEYS = ['safeSpots', 'exits', 'utilities', 'hazards'] as const;
const UTILITIES_KEYS = ['electricity', 'gas', 'water'] as const;
const CHECKLIST_KEYS = ['id', 'done', 'note'] as const;
const ROLE_KEYS = ['roleId', 'memberId', 'note'] as const;
const BAG_KEYS = ['location', 'items', 'lastCheckedAt'] as const;
const PET_KEYS = ['id', 'name', 'kind', 'note'] as const;
const INSURANCE_KEYS = ['dask'] as const;
const REVIEW_KEYS = ['lastDrillAt', 'nextReviewAt'] as const;

type Warn = (code: PlanWarning, path: string) => void;

interface TextSpec {
  max: number;
  multiline?: boolean;
}

interface SanitizeContext {
  warn: Warn;
  healthOptIn: boolean;
  healthStripped: boolean;
}

const EMPTY_RECORD: Record<string, unknown> = {};

/** Denetim karakterleri (Unicode Cc) tek satırlık metinlerde tamamen silinir (§8.2). */
const CONTROL_CHARS = /\p{Cc}/gu;
/** Çok satırlı metinlerde satır sonu korunur; sekme ve diğer denetim karakterleri silinir. */
const MULTILINE_CONTROL_CHARS = /(?!\n)\p{Cc}/gu;
const LINE_BREAKS = /\r\n?/g;
const PHONE_CHARACTERS = /^[\d +()-]+$/;
const PLAN_ID_PATTERN = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

const ISO_DATE_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2})?)?$/;
const LONG_MONTHS = new Set([1, 3, 5, 7, 8, 10, 12]);

const toComponent = (value: string | undefined): number => Number(value ?? '-1');

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const fieldPath = (parent: string, key: string): string =>
  parent === '' ? key : `${parent}.${key}`;

const itemPath = (parent: string, index: number): string => `${parent}[${index}]`;

function readRecord(
  value: unknown,
  path: string,
  allowed: readonly string[],
  warn: Warn,
): Record<string, unknown> | null {
  if (value === undefined) return EMPTY_RECORD;
  if (!isRecord(value)) {
    warn('gecersiz-deger', path);
    return null;
  }
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) warn('bilinmeyen-alan', fieldPath(path, key));
  }
  return value;
}

function readObject(
  value: unknown,
  path: string,
  allowed: readonly string[],
  warn: Warn,
): Record<string, unknown> {
  return readRecord(value, path, allowed, warn) ?? EMPTY_RECORD;
}

function readArray(value: unknown, path: string, warn: Warn): unknown[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    warn('gecersiz-deger', path);
    return [];
  }
  return value;
}

function mapItems<T>(
  items: readonly unknown[],
  path: string,
  max: number | undefined,
  warn: Warn,
  mapItem: (item: unknown, itemPathValue: string) => T | null,
): T[] {
  let list: readonly unknown[] = items;
  if (max !== undefined && list.length > max) {
    warn('sinir-asildi', path);
    list = list.slice(0, max);
  }
  const result: T[] = [];
  for (let index = 0; index < list.length; index += 1) {
    const mapped = mapItem(list[index], itemPath(path, index));
    if (mapped !== null) result.push(mapped);
  }
  return result;
}

function normalizeText(value: string, multiline: boolean): string {
  let text = value.trim();
  if (multiline) {
    text = text.replace(LINE_BREAKS, '\n').replace(MULTILINE_CONTROL_CHARS, '');
  } else {
    text = text.replace(CONTROL_CHARS, '');
  }
  return text.normalize('NFC').trim();
}

function sanitizeText(value: string, path: string, spec: TextSpec, warn: Warn): string {
  const text = normalizeText(value, spec.multiline === true);
  const characters = [...text];
  if (characters.length > spec.max) {
    warn('sinir-asildi', path);
    return characters.slice(0, spec.max).join('').trimEnd();
  }
  return text;
}

function readText(
  record: Record<string, unknown>,
  key: string,
  path: string,
  spec: TextSpec,
  warn: Warn,
): string {
  const value = record[key];
  if (value === undefined) return '';
  if (typeof value !== 'string') {
    warn('gecersiz-deger', path);
    return '';
  }
  return sanitizeText(value, path, spec, warn);
}

function readPhone(record: Record<string, unknown>, key: string, path: string, warn: Warn): string {
  const value = record[key];
  if (value === undefined) return '';
  if (typeof value !== 'string') {
    warn('gecersiz-deger', path);
    return '';
  }
  const text = sanitizeText(value, path, { max: PLAN_LIMITS.phoneMaxLength }, warn);
  if (text === '') return '';
  if (!PHONE_CHARACTERS.test(text)) {
    warn('gecersiz-deger', path);
    return '';
  }
  if ([...text].length < PLAN_LIMITS.phoneMinLength) {
    warn('gecersiz-deger', path);
    return '';
  }
  return text;
}

function readBoolean(
  record: Record<string, unknown>,
  key: string,
  path: string,
  warn: Warn,
): boolean {
  const value = record[key];
  if (value === undefined) return false;
  if (typeof value !== 'boolean') {
    warn('gecersiz-deger', path);
    return false;
  }
  return value;
}

function readEnum<T extends string>(
  record: Record<string, unknown>,
  key: string,
  path: string,
  values: readonly T[],
  fallback: T,
  warn: Warn,
): T {
  const value = record[key];
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !(values as readonly string[]).includes(value)) {
    warn('gecersiz-deger', path);
    return fallback;
  }
  return value as T;
}

function readId(
  record: Record<string, unknown>,
  key: string,
  path: string,
  warn: Warn,
  pattern?: RegExp,
): string {
  const value = record[key];
  if (value === undefined) return crypto.randomUUID();
  if (typeof value !== 'string') {
    warn('gecersiz-deger', path);
    return crypto.randomUUID();
  }
  const text = normalizeText(value, false);
  if (text === '' || (pattern !== undefined && !pattern.test(text))) {
    warn('gecersiz-deger', path);
    return crypto.randomUUID();
  }
  return text;
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return LONG_MONTHS.has(month) ? 31 : 30;
}

/** §8.2 — ISO 8601 tarih ya da tarih-saat; takvimsel geçerlilik de denetlenir. */
export function isIsoDate(value: string): boolean {
  const match = ISO_DATE_PATTERN.exec(value);
  if (match === null) return false;
  const year = toComponent(match[1]);
  const month = toComponent(match[2]);
  const day = toComponent(match[3]);
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > daysInMonth(year, month)) return false;
  if (toComponent(match[4]) > 23) return false;
  if (toComponent(match[5]) > 59) return false;
  if (toComponent(match[6]) > 59) return false;
  const zone = match[8];
  if (zone !== undefined && zone !== 'Z') {
    if (toComponent(zone.slice(1, 3)) > 23 || toComponent(zone.slice(4, 6)) > 59) return false;
  }
  return true;
}

function readDate(
  record: Record<string, unknown>,
  key: string,
  path: string,
  warn: Warn,
): string | null {
  const value = record[key];
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') {
    warn('gecersiz-deger', path);
    return null;
  }
  const text = value.trim();
  if (text === '') return null;
  if (!isIsoDate(text)) {
    warn('gecersiz-deger', path);
    return null;
  }
  return text;
}

function readTimestamp(
  record: Record<string, unknown>,
  key: string,
  path: string,
  fallback: string,
  warn: Warn,
): string {
  const value = record[key];
  if (value === undefined) return fallback;
  if (typeof value !== 'string') {
    warn('gecersiz-deger', path);
    return fallback;
  }
  const text = value.trim();
  if (!isIsoDate(text)) {
    warn('gecersiz-deger', path);
    return fallback;
  }
  return text;
}

function sanitizePlace(value: unknown, path: string, context: SanitizeContext): Place {
  const record = readObject(value, path, PLACE_KEYS, context.warn);
  return {
    label: readText(
      record,
      'label',
      fieldPath(path, 'label'),
      { max: PLAN_LIMITS.nameLength },
      context.warn,
    ),
    detail: readText(
      record,
      'detail',
      fieldPath(path, 'detail'),
      { max: PLAN_LIMITS.shortTextLength },
      context.warn,
    ),
  };
}

function sanitizeDailyPlace(
  value: unknown,
  path: string,
  context: SanitizeContext,
): DailyPlace | null {
  const record = readRecord(value, path, DAILY_PLACE_KEYS, context.warn);
  if (record === null) return null;
  return {
    kind: readEnum(
      record,
      'kind',
      fieldPath(path, 'kind'),
      DAILY_PLACE_KINDS,
      createEmptyDailyPlace().kind,
      context.warn,
    ),
    label: readText(
      record,
      'label',
      fieldPath(path, 'label'),
      { max: PLAN_LIMITS.nameLength },
      context.warn,
    ),
    phone: readPhone(record, 'phone', fieldPath(path, 'phone'), context.warn),
    note: readText(
      record,
      'note',
      fieldPath(path, 'note'),
      { max: PLAN_LIMITS.shortTextLength },
      context.warn,
    ),
  };
}

function sanitizeHealth(value: unknown, path: string, context: SanitizeContext): Health | null {
  const record = readRecord(value, path, HEALTH_KEYS, context.warn);
  if (record === null) return null;
  const longText: TextSpec = { max: PLAN_LIMITS.longTextLength, multiline: true };
  return {
    bloodType: readEnum(
      record,
      'bloodType',
      fieldPath(path, 'bloodType'),
      BLOOD_TYPES,
      createEmptyHealth().bloodType,
      context.warn,
    ),
    conditions: readText(
      record,
      'conditions',
      fieldPath(path, 'conditions'),
      longText,
      context.warn,
    ),
    medications: readText(
      record,
      'medications',
      fieldPath(path, 'medications'),
      longText,
      context.warn,
    ),
    allergies: readText(record, 'allergies', fieldPath(path, 'allergies'), longText, context.warn),
    devices: readText(record, 'devices', fieldPath(path, 'devices'), longText, context.warn),
  };
}

function sanitizeNeeds(value: unknown, path: string, context: SanitizeContext): Member['needs'] {
  const record = readObject(value, path, NEEDS_KEYS, context.warn);
  return {
    mobility: readBoolean(record, 'mobility', fieldPath(path, 'mobility'), context.warn),
    hearing: readBoolean(record, 'hearing', fieldPath(path, 'hearing'), context.warn),
    vision: readBoolean(record, 'vision', fieldPath(path, 'vision'), context.warn),
    communication: readBoolean(
      record,
      'communication',
      fieldPath(path, 'communication'),
      context.warn,
    ),
    note: readText(
      record,
      'note',
      fieldPath(path, 'note'),
      { max: PLAN_LIMITS.shortTextLength },
      context.warn,
    ),
  };
}

function sanitizeMember(value: unknown, path: string, context: SanitizeContext): Member | null {
  const record = readRecord(value, path, MEMBER_KEYS, context.warn);
  if (record === null) return null;
  const dailyPlacesPath = fieldPath(path, 'dailyPlaces');
  const member: Member = {
    id: readId(record, 'id', fieldPath(path, 'id'), context.warn),
    name: readText(
      record,
      'name',
      fieldPath(path, 'name'),
      { max: PLAN_LIMITS.nameLength },
      context.warn,
    ),
    group: readEnum(
      record,
      'group',
      fieldPath(path, 'group'),
      MEMBER_GROUPS,
      'yetiskin',
      context.warn,
    ),
    phone: readPhone(record, 'phone', fieldPath(path, 'phone'), context.warn),
    dailyPlaces: mapItems(
      readArray(record.dailyPlaces, dailyPlacesPath, context.warn),
      dailyPlacesPath,
      PLAN_LIMITS.dailyPlaces,
      context.warn,
      (item, itemPathValue) => sanitizeDailyPlace(item, itemPathValue, context),
    ),
    needs: sanitizeNeeds(record.needs, fieldPath(path, 'needs'), context),
  };
  const healthPath = fieldPath(path, 'health');
  if (context.healthOptIn) {
    if (record.health !== undefined) {
      const health = sanitizeHealth(record.health, healthPath, context);
      if (health !== null) member.health = health;
    }
  } else if (record.health !== undefined) {
    context.healthStripped = true;
  }
  return member;
}

function sanitizeContact(value: unknown, path: string, context: SanitizeContext): Contact | null {
  const record = readRecord(value, path, CONTACT_KEYS, context.warn);
  if (record === null) return null;
  return {
    id: readId(record, 'id', fieldPath(path, 'id'), context.warn),
    name: readText(
      record,
      'name',
      fieldPath(path, 'name'),
      { max: PLAN_LIMITS.nameLength },
      context.warn,
    ),
    relation: readText(
      record,
      'relation',
      fieldPath(path, 'relation'),
      { max: PLAN_LIMITS.nameLength },
      context.warn,
    ),
    phone: readPhone(record, 'phone', fieldPath(path, 'phone'), context.warn),
    phoneAlt: readPhone(record, 'phoneAlt', fieldPath(path, 'phoneAlt'), context.warn),
    outOfArea: readBoolean(record, 'outOfArea', fieldPath(path, 'outOfArea'), context.warn),
    city: readText(
      record,
      'city',
      fieldPath(path, 'city'),
      { max: PLAN_LIMITS.nameLength },
      context.warn,
    ),
    canPickUpChildren: readBoolean(
      record,
      'canPickUpChildren',
      fieldPath(path, 'canPickUpChildren'),
      context.warn,
    ),
  };
}

function sanitizeChecklist(
  value: unknown,
  path: string,
  max: number | undefined,
  context: SanitizeContext,
): ChecklistState[] {
  const seen = new Set<string>();
  return mapItems(
    readArray(value, path, context.warn),
    path,
    max,
    context.warn,
    (item, itemPathValue) => {
      const record = readRecord(item, itemPathValue, CHECKLIST_KEYS, context.warn);
      if (record === null) return null;
      const idPath = fieldPath(itemPathValue, 'id');
      const id = readId(record, 'id', idPath, context.warn);
      if (seen.has(id)) {
        context.warn('gecersiz-deger', idPath);
        return null;
      }
      seen.add(id);
      return {
        id,
        done: readBoolean(record, 'done', fieldPath(itemPathValue, 'done'), context.warn),
        note: readText(
          record,
          'note',
          fieldPath(itemPathValue, 'note'),
          { max: PLAN_LIMITS.shortTextLength },
          context.warn,
        ),
      };
    },
  );
}

function sanitizePet(value: unknown, path: string, context: SanitizeContext): Pet | null {
  const record = readRecord(value, path, PET_KEYS, context.warn);
  if (record === null) return null;
  return {
    id: readId(record, 'id', fieldPath(path, 'id'), context.warn),
    name: readText(
      record,
      'name',
      fieldPath(path, 'name'),
      { max: PLAN_LIMITS.nameLength },
      context.warn,
    ),
    kind: readText(
      record,
      'kind',
      fieldPath(path, 'kind'),
      { max: PLAN_LIMITS.shortTextLength },
      context.warn,
    ),
    note: readText(
      record,
      'note',
      fieldPath(path, 'note'),
      { max: PLAN_LIMITS.shortTextLength },
      context.warn,
    ),
  };
}

function readRoleId(
  record: Record<string, unknown>,
  path: string,
  context: SanitizeContext,
): RoleId | null {
  const value = record.roleId;
  if (typeof value === 'string' && (ROLE_IDS as readonly string[]).includes(value)) {
    return value as RoleId;
  }
  context.warn('gecersiz-deger', fieldPath(path, 'roleId'));
  return null;
}

function readMemberId(
  record: Record<string, unknown>,
  path: string,
  memberIds: ReadonlySet<string>,
  context: SanitizeContext,
): string | null {
  const value = record.memberId;
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') {
    context.warn('gecersiz-deger', fieldPath(path, 'memberId'));
    return null;
  }
  const text = normalizeText(value, false);
  if (text === '') return null;
  if (memberIds.has(text)) return text;
  context.warn('bilinmeyen-kisi', fieldPath(path, 'memberId'));
  return null;
}

function sanitizeRole(
  value: unknown,
  path: string,
  memberIds: ReadonlySet<string>,
  context: SanitizeContext,
): RoleAssignment | null {
  const record = readRecord(value, path, ROLE_KEYS, context.warn);
  if (record === null) return null;
  const roleId = readRoleId(record, path, context);
  if (roleId === null) return null;
  return {
    roleId,
    memberId: readMemberId(record, path, memberIds, context),
    note: readText(
      record,
      'note',
      fieldPath(path, 'note'),
      { max: PLAN_LIMITS.shortTextLength },
      context.warn,
    ),
  };
}

function sanitizeStringList(
  value: unknown,
  path: string,
  max: number,
  context: SanitizeContext,
): string[] {
  return mapItems(
    readArray(value, path, context.warn),
    path,
    max,
    context.warn,
    (item, itemPathValue) => {
      if (typeof item !== 'string') {
        context.warn('gecersiz-deger', itemPathValue);
        return null;
      }
      const text = sanitizeText(
        item,
        itemPathValue,
        { max: PLAN_LIMITS.shortTextLength },
        context.warn,
      );
      return text === '' ? null : text;
    },
  );
}

function sanitizeHousehold(
  value: unknown,
  path: string,
  context: SanitizeContext,
): Plan['household'] {
  const record = readObject(value, path, HOUSEHOLD_KEYS, context.warn);
  const shortText: TextSpec = { max: PLAN_LIMITS.shortTextLength };
  return {
    label: readText(
      record,
      'label',
      fieldPath(path, 'label'),
      { max: PLAN_LIMITS.nameLength },
      context.warn,
    ),
    address: readText(record, 'address', fieldPath(path, 'address'), shortText, context.warn),
    buildingNote: readText(
      record,
      'buildingNote',
      fieldPath(path, 'buildingNote'),
      shortText,
      context.warn,
    ),
    floorCount: readText(
      record,
      'floorCount',
      fieldPath(path, 'floorCount'),
      shortText,
      context.warn,
    ),
  };
}

function sanitizeMeeting(value: unknown, path: string, context: SanitizeContext): Plan['meeting'] {
  const record = readObject(value, path, MEETING_KEYS, context.warn);
  return {
    nearHome: sanitizePlace(record.nearHome, fieldPath(path, 'nearHome'), context),
    neighborhood: sanitizePlace(record.neighborhood, fieldPath(path, 'neighborhood'), context),
    outOfArea: sanitizePlace(record.outOfArea, fieldPath(path, 'outOfArea'), context),
    assemblyArea: sanitizePlace(record.assemblyArea, fieldPath(path, 'assemblyArea'), context),
    assemblyCheckedAt: readDate(
      record,
      'assemblyCheckedAt',
      fieldPath(path, 'assemblyCheckedAt'),
      context.warn,
    ),
  };
}

function sanitizeHome(value: unknown, path: string, context: SanitizeContext): Plan['home'] {
  const record = readObject(value, path, HOME_KEYS, context.warn);
  const utilitiesPath = fieldPath(path, 'utilities');
  const utilities = readObject(record.utilities, utilitiesPath, UTILITIES_KEYS, context.warn);
  const shortText: TextSpec = { max: PLAN_LIMITS.shortTextLength };
  return {
    safeSpots: sanitizeStringList(
      record.safeSpots,
      fieldPath(path, 'safeSpots'),
      PLAN_LIMITS.safeSpots,
      context,
    ),
    exits: sanitizeStringList(record.exits, fieldPath(path, 'exits'), PLAN_LIMITS.exits, context),
    utilities: {
      electricity: readText(
        utilities,
        'electricity',
        fieldPath(utilitiesPath, 'electricity'),
        shortText,
        context.warn,
      ),
      gas: readText(utilities, 'gas', fieldPath(utilitiesPath, 'gas'), shortText, context.warn),
      water: readText(
        utilities,
        'water',
        fieldPath(utilitiesPath, 'water'),
        shortText,
        context.warn,
      ),
    },
    hazards: sanitizeChecklist(record.hazards, fieldPath(path, 'hazards'), undefined, context),
  };
}

function sanitizeBag(value: unknown, path: string, context: SanitizeContext): Plan['bag'] {
  const record = readObject(value, path, BAG_KEYS, context.warn);
  return {
    location: readText(
      record,
      'location',
      fieldPath(path, 'location'),
      { max: PLAN_LIMITS.shortTextLength },
      context.warn,
    ),
    items: sanitizeChecklist(record.items, fieldPath(path, 'items'), undefined, context),
    lastCheckedAt: readDate(
      record,
      'lastCheckedAt',
      fieldPath(path, 'lastCheckedAt'),
      context.warn,
    ),
  };
}

function sanitizeInsurance(
  value: unknown,
  path: string,
  context: SanitizeContext,
): Plan['insurance'] {
  const record = readObject(value, path, INSURANCE_KEYS, context.warn);
  return {
    dask: readEnum(
      record,
      'dask',
      fieldPath(path, 'dask'),
      YES_NO_UNKNOWN,
      'bilmiyorum',
      context.warn,
    ),
  };
}

function sanitizeReview(value: unknown, path: string, context: SanitizeContext): Plan['review'] {
  const record = readObject(value, path, REVIEW_KEYS, context.warn);
  return {
    lastDrillAt: readDate(record, 'lastDrillAt', fieldPath(path, 'lastDrillAt'), context.warn),
    nextReviewAt: readDate(record, 'nextReviewAt', fieldPath(path, 'nextReviewAt'), context.warn),
  };
}

/**
 * Bilinmeyen veriyi §8.1 şeklindeki bir plana dönüştürür.
 *
 * @throws `Error('desteklenmeyen-surum')` — girdi nesne değilse ya da
 * `schemaVersion` 1 değilse.
 */
export function sanitizePlan(input: unknown): { plan: Plan; warnings: string[] } {
  const warnings: string[] = [];
  const warn: Warn = (code, path) => {
    warnings.push(formatWarning({ code, path }));
  };
  if (!isRecord(input) || input.schemaVersion !== SCHEMA_VERSION) {
    throw new Error('desteklenmeyen-surum');
  }
  const record = readObject(input, '', TOP_LEVEL_KEYS, warn);
  const context: SanitizeContext = {
    warn,
    healthOptIn: readBoolean(record, 'healthOptIn', 'healthOptIn', warn),
    healthStripped: false,
  };
  const now = new Date().toISOString();

  const members = mapItems(
    readArray(record.members, 'members', warn),
    'members',
    PLAN_LIMITS.members,
    warn,
    (item, itemPathValue) => sanitizeMember(item, itemPathValue, context),
  );
  if (context.healthStripped) warn('saglik-silindi', 'members[].health');
  const memberIds = new Set(members.map((member) => member.id));

  const plan: Plan = {
    schemaVersion: SCHEMA_VERSION,
    id: readId(record, 'id', 'id', warn, PLAN_ID_PATTERN),
    createdAt: readTimestamp(record, 'createdAt', 'createdAt', now, warn),
    updatedAt: readTimestamp(record, 'updatedAt', 'updatedAt', now, warn),
    healthOptIn: context.healthOptIn,
    household: sanitizeHousehold(record.household, 'household', context),
    members,
    contacts: mapItems(
      readArray(record.contacts, 'contacts', warn),
      'contacts',
      PLAN_LIMITS.contacts,
      warn,
      (item, itemPathValue) => sanitizeContact(item, itemPathValue, context),
    ),
    meeting: sanitizeMeeting(record.meeting, 'meeting', context),
    home: sanitizeHome(record.home, 'home', context),
    roles: mapItems(
      readArray(record.roles, 'roles', warn),
      'roles',
      undefined,
      warn,
      (item, itemPathValue) => sanitizeRole(item, itemPathValue, memberIds, context),
    ),
    bag: sanitizeBag(record.bag, 'bag', context),
    documents: sanitizeChecklist(record.documents, 'documents', undefined, context),
    pets: mapItems(
      readArray(record.pets, 'pets', warn),
      'pets',
      PLAN_LIMITS.pets,
      warn,
      (item, itemPathValue) => sanitizePet(item, itemPathValue, context),
    ),
    insurance: sanitizeInsurance(record.insurance, 'insurance', context),
    review: sanitizeReview(record.review, 'review', context),
    notes: readText(
      record,
      'notes',
      'notes',
      { max: PLAN_LIMITS.longTextLength, multiline: true },
      warn,
    ),
  };

  return { plan, warnings };
}

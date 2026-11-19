/**
 * Şartname §9.1–§9.3, §11.4, §11.8 — durum, otomatik kayıt ve bellek içi kip.
 *
 * Sorumluluklar:
 * - IndexedDB `ilk72` / `kv` deposunu açmak; açılamazsa **bellek içi kipte**
 *   çalışmak ve `isMemoryMode()` ile bunu bildirmek (§9.2).
 * - `plan` ve `settings` kayıtlarını okumak/yazmak; yazma 500 ms gecikmelidir
 *   ve `visibilitychange → hidden` anında bekleyen yazma hemen uygulanır (§9.1).
 * - Depoya **sanitize edilmiş** planı yazmak: `sanitizePlan` çıktısı olmayan
 *   hiçbir nesne diskine ulaşmaz (§8.3).
 * - İsteğe bağlı uygulama kilidi: plan `{ enc: true, data }` olarak saklanır,
 *   parola yalnızca bellekte tutulur, sekme kapanınca kaybolur (§9.3).
 * - İlk plan kaydında `navigator.storage.persist()` çağrısı ve sonucun
 *   `settings.storagePersisted` alanında tutulması (§9.1).
 *
 * Arayüz sözleşmesi (adlar sabit): `loadPlan`, `unlockPlan`, `savePlan`,
 * `flushPending`, `getSettings`, `updateSettings`, `clearAllData`,
 * `isMemoryMode`. Kilit için ek olarak `enableLock`, `disableLock`,
 * `isLocked`, `isUnlocked` dışa açılır. `mimari.md` §3'teki eski ad
 * `setPlan`, `savePlan` ile aynı işlevi görür.
 *
 * Notlar:
 * - Plan zaman damgaları (`updatedAt`) bu katmanda değiştirilmez; modelin
 *   verisidir.
 * - `updateSettings` yalnızca ayar kaydını yazar. Kilidi açmak/kapatmak,
 *   planın yeniden şifrelenmesini gerektirdiği için `enableLock` /
 *   `disableLock` ile yapılır.
 */
import { WIZARD_STEP_COUNT } from '../config.ts';
import { utf8Decode, utf8Encode } from '../lib/bytes.ts';
import type { Plan } from '../model/types.ts';
import { sanitizePlan } from '../model/validate.ts';
import { decryptBytes, encryptBytes } from './crypto.ts';
import { createMemoryStore, type KeyValueStore, openStore } from './idb.ts';

/** §9.1 — otomatik kayıt gecikmesi. */
const SAVE_DELAY_MS = 500;

/** §9.1 — nesne deposundaki anahtarlar. */
const PLAN_KEY = 'plan';
const SETTINGS_KEY = 'settings';

/** §9.3 — kilit parolasının en kısa uzunluğu (güç ölçer yoktur). */
const MIN_PASSPHRASE_LENGTH = 8;

/** §12 — yazdırma seçimleri. `documents` boşsa yazdırma sayfası kendi varsayılanını uygular. */
export interface PrintPrefs {
  documents: string[];
  includeHealth: boolean;
  includeSchoolName: boolean;
}

/** §9.1 — `settings` kaydı. */
export interface Settings {
  largeText: boolean;
  lockEnabled: boolean;
  printPrefs: PrintPrefs;
  firstRunAccepted: boolean;
  visitedSteps: number[];
  /**
   * §9.1 — `navigator.storage.persist()` sonucu: `true` kalıcı depolama
   * verildi, `false` verilmedi, `null` henüz sorulmadı ya da API yok.
   */
  storagePersisted: boolean | null;
}

/** `loadPlan` sonucu: plan yoksa `plan: null`; kilitliyse `encrypted: true`. */
export interface LoadedPlan {
  plan: Plan | null;
  encrypted: boolean;
}

/** §9.1 — depodaki şifreli plan kaydı. */
interface EncryptedPlanRecord {
  enc: true;
  data: Uint8Array;
}

let db: KeyValueStore = createMemoryStore();
let ready: Promise<void> | null = null;
let memoryMode = false;
let settings: Settings = createDefaultSettings();

/** Bellekteki çözülmüş plan; kilitliyken `null` olabilir. */
let currentPlan: Plan | null = null;
/** Diskten okunan son şifreli kayıt (kilit durumunu bilmek için). */
let encryptedData: Uint8Array | null = null;
/** Açılmış kilit parolası; yalnızca bellekte, sekme kapanınca kaybolur (§9.3). */
let passphrase: string | null = null;

let pendingPlan: Plan | null = null;
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let writeChain: Promise<void> = Promise.resolve();
let lastSaveError: unknown = null;

let persistenceRequested = false;
let visibilityListenerInstalled = false;

/** Ayar kaydının varsayılanları; bozuk/eksik alanlar bunlara döner. */
function createDefaultSettings(): Settings {
  return {
    largeText: false,
    lockEnabled: false,
    printPrefs: { documents: [], includeHealth: false, includeSchoolName: false },
    firstRunAccepted: false,
    visitedSteps: [],
    storagePersisted: null,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isEncryptedPlanRecord(value: unknown): value is EncryptedPlanRecord {
  return isRecord(value) && value.enc === true && value.data instanceof Uint8Array;
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function readVisitedSteps(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  const steps = new Set<number>();
  for (const item of value) {
    if (
      typeof item === 'number' &&
      Number.isInteger(item) &&
      item >= 1 &&
      item <= WIZARD_STEP_COUNT
    ) {
      steps.add(item);
    }
  }
  return [...steps].sort((first, second) => first - second);
}

function readDocuments(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const documents: string[] = [];
  for (const item of value) {
    if (typeof item === 'string' && item !== '' && !documents.includes(item)) {
      documents.push(item);
    }
    if (documents.length >= 50) break;
  }
  return documents;
}

/** Depodan gelen `settings` kaydını güvenli biçime getirir. */
function sanitizeSettings(input: unknown): Settings {
  const defaults = createDefaultSettings();
  if (!isRecord(input)) return defaults;

  const storedPrintPrefs = isRecord(input.printPrefs) ? input.printPrefs : {};
  const persisted = input.storagePersisted;

  return {
    largeText: readBoolean(input.largeText, defaults.largeText),
    lockEnabled: readBoolean(input.lockEnabled, defaults.lockEnabled),
    printPrefs: {
      documents: readDocuments(storedPrintPrefs.documents),
      includeHealth: readBoolean(storedPrintPrefs.includeHealth, defaults.printPrefs.includeHealth),
      includeSchoolName: readBoolean(
        storedPrintPrefs.includeSchoolName,
        defaults.printPrefs.includeSchoolName,
      ),
    },
    firstRunAccepted: readBoolean(input.firstRunAccepted, defaults.firstRunAccepted),
    visitedSteps: readVisitedSteps(input.visitedSteps),
    storagePersisted:
      typeof persisted === 'boolean' || persisted === null ? persisted : defaults.storagePersisted,
  };
}

async function initialize(): Promise<void> {
  try {
    db = await openStore();
    memoryMode = false;
  } catch {
    // §9.2 — depo açılamıyorsa uygulama bellek içi kipte çalışır.
    db = createMemoryStore();
    memoryMode = true;
  }

  installVisibilityListener();

  try {
    settings = sanitizeSettings(await db.get(SETTINGS_KEY));
  } catch {
    settings = createDefaultSettings();
  }
}

function ensureReady(): Promise<void> {
  ready ??= initialize();
  return ready;
}

/**
 * §9.1 — sekme gizlenirken bekleyen yazmayı hemen uygular. Dinleyici bir kez
 * kurulur; `clearAllData` sonrası yeniden başlatmada tekrar eklenmez.
 */
function installVisibilityListener(): void {
  if (visibilityListenerInstalled) return;
  if (typeof document === 'undefined' || typeof document.addEventListener !== 'function') return;
  visibilityListenerInstalled = true;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void flushPending().catch(() => undefined);
  });
}

/**
 * Depoyu ve ayarları hazırlar. Arayüz ilk açılışta `loadPlan`'dan önce
 * `getSettings()` okumak istiyorsa bunu beklemelidir.
 */
export function initializeStorage(): Promise<void> {
  return ensureReady();
}

/** §9.2 — depo kalıcı değil de yalnızca bellekte mi? */
export function isMemoryMode(): boolean {
  return memoryMode;
}

/** §9.1 — geçerli ayarların kopyası (dışarıdan değiştirilemez). */
export function getSettings(): Settings {
  return {
    ...settings,
    printPrefs: {
      ...settings.printPrefs,
      documents: [...settings.printPrefs.documents],
    },
    visitedSteps: [...settings.visitedSteps],
  };
}

/** §9.1 — ayar güncellemesi; kayıt hemen yazılır ve bir sonraki açılışta kalıcıdır. */
export async function updateSettings(patch: Partial<Settings>): Promise<void> {
  await ensureReady();
  settings = sanitizeSettings({
    ...settings,
    ...patch,
    // `printPrefs` alan alan birleştirilir: kısmi güncelleme diğer seçimleri silmez.
    printPrefs: { ...settings.printPrefs, ...(patch.printPrefs ?? {}) },
  });
  await db.set(SETTINGS_KEY, settings);
}

/**
 * §9.1, §9.3 — planı okur. Kayıt `{ enc: true, data }` ise parola gerekir:
 * `plan: null`, `encrypted: true` döner ve `unlockPlan` çağrılmalıdır.
 * Kilit bu oturumda zaten açıldıysa bellek içindeki plan döner.
 */
export async function loadPlan(): Promise<LoadedPlan> {
  await ensureReady();

  if (passphrase !== null && currentPlan !== null) {
    return { plan: currentPlan, encrypted: false };
  }

  const stored = await db.get(PLAN_KEY);
  if (stored === undefined) {
    currentPlan = null;
    encryptedData = null;
    return { plan: null, encrypted: false };
  }

  if (isEncryptedPlanRecord(stored)) {
    encryptedData = stored.data;
    currentPlan = null;
    return { plan: null, encrypted: true };
  }

  const sanitized = sanitizePlan(stored);
  currentPlan = sanitized.plan;
  encryptedData = null;
  return { plan: currentPlan, encrypted: false };
}

/**
 * §9.3 — şifreli planı parolayla açar. Parola bellekte tutulur; sonraki
 * kayıtlar aynı parolayla yeniden şifrelenir. Hatalar `decryptBytes`'tan
 * gelir: `parola-yanlis-veya-bozuk`, `bozuk-veri`.
 */
export async function unlockPlan(candidate: string): Promise<Plan> {
  await ensureReady();

  let data = encryptedData;
  if (data === null) {
    const stored = await db.get(PLAN_KEY);
    if (stored === undefined) throw new Error('bozuk-veri');
    if (isEncryptedPlanRecord(stored)) {
      data = stored.data;
    } else {
      // Kayıt şifreli değilse parola sorulmasına gerek yok; temizleyip döndür.
      const sanitized = sanitizePlan(stored);
      currentPlan = sanitized.plan;
      return sanitized.plan;
    }
  }

  const plain = await decryptBytes(data, candidate);
  let parsed: unknown;
  try {
    parsed = JSON.parse(utf8Decode(plain));
  } catch {
    throw new Error('bozuk-veri');
  }
  const sanitized = sanitizePlan(parsed);

  passphrase = candidate;
  currentPlan = sanitized.plan;
  if (!settings.lockEnabled) {
    settings = { ...settings, lockEnabled: true };
    await db.set(SETTINGS_KEY, settings).catch(() => undefined);
  }
  return sanitized.plan;
}

/**
 * §9.1, §11.4 — planı 500 ms gecikmeyle kaydettirir. Depoya **sanitize
 * edilmiş** kopya yazılır; ham girdi hiçbir zaman saklanmaz (§8.3).
 */
export function savePlan(plan: Plan): void {
  const sanitized = sanitizePlan(plan);
  currentPlan = sanitized.plan;
  pendingPlan = sanitized.plan;

  if (saveTimer !== null) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    void writePending();
  }, SAVE_DELAY_MS);
}

/** `mimari.md` §3'teki ad; `savePlan` ile aynı davranış. */
export const setPlan = savePlan;

/**
 * Bekleyen yazmayı hemen uygular ve tamamlanmasını bekler. Yazma başarısız
 * olduysa hata burada yüzeye çıkar; arayüz "kaydedilemedi" durumunu böyle
 * gösterebilir.
 */
export async function flushPending(): Promise<void> {
  if (saveTimer !== null) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  await ensureReady();
  await writePending();
  if (lastSaveError !== null) {
    const error = lastSaveError;
    lastSaveError = null;
    throw error;
  }
}

function writePending(): Promise<void> {
  const plan = pendingPlan;
  pendingPlan = null;
  if (plan === null) return writeChain;

  writeChain = writeChain.then(async () => {
    try {
      // `savePlan` depo hazır olmadan çağrılabilir (ör. yeni plan); yazmadan
      // önce açılışın tamamlanması beklenir.
      await ensureReady();
      await persistPlan(plan);
      lastSaveError = null;
    } catch (error) {
      lastSaveError = error;
    }
  });
  return writeChain;
}

async function persistPlan(plan: Plan): Promise<void> {
  if (settings.lockEnabled) {
    if (passphrase === null) throw new Error('parola-gerekli');
    const data = await encryptBytes(utf8Encode(JSON.stringify(plan)), passphrase);
    await db.set(PLAN_KEY, { enc: true, data });
    encryptedData = data;
  } else {
    await db.set(PLAN_KEY, plan);
    encryptedData = null;
  }
  await requestPersistence();
}

/**
 * §9.1 — ilk plan kaydında `navigator.storage.persist()` çağrılır; sonuç
 * ayarlarda tutulur ve ayarlar sayfasında gösterilir. En fazla bir kez denenir.
 */
async function requestPersistence(): Promise<void> {
  if (persistenceRequested || memoryMode) return;
  persistenceRequested = true;

  let persisted: boolean | null = null;
  const manager = globalThis.navigator?.storage;
  if (manager && typeof manager.persist === 'function') {
    try {
      persisted = await manager.persist();
    } catch {
      persisted = false;
    }
  }

  settings = { ...settings, storagePersisted: persisted };
  // Plan yazıldı; ayar kaydının yazılamaması kaydetmeyi başarısız saymaz.
  await db.set(SETTINGS_KEY, settings).catch(() => undefined);
}

/** §9.3 — kilidi açar: plan bundan sonra `{ enc: true, data }` olarak saklanır. */
export async function enableLock(candidate: string): Promise<void> {
  await ensureReady();
  if (typeof candidate !== 'string' || candidate.length < MIN_PASSPHRASE_LENGTH) {
    throw new Error('parola-kisa');
  }
  if (currentPlan === null && encryptedData !== null) {
    // Kilitli plan önce açılmalı; yoksa parola değişmiş gibi görünürdü.
    throw new Error('kilitli');
  }

  const previousLock = settings.lockEnabled;
  passphrase = candidate;
  settings = { ...settings, lockEnabled: true };
  try {
    if (currentPlan !== null) {
      pendingPlan = currentPlan;
      await flushPending();
    }
    await db.set(SETTINGS_KEY, settings);
  } catch (error) {
    settings = { ...settings, lockEnabled: previousLock };
    passphrase = null;
    throw error;
  }
}

/**
 * §9.3 — kilidi kapatır: plan düz kayda çevrilir. Kilitli plan önce
 * açılmamışsa `parola-gerekli` verir (veri silinmez).
 */
export async function disableLock(): Promise<void> {
  await ensureReady();
  if (!settings.lockEnabled) return;
  if (passphrase === null && encryptedData !== null) throw new Error('parola-gerekli');

  settings = { ...settings, lockEnabled: false };
  if (currentPlan !== null) {
    pendingPlan = currentPlan;
    await flushPending();
  }
  passphrase = null;
  await db.set(SETTINGS_KEY, settings);
}

/** §9.3 — kayıt diskte şifreli mi (bu oturumda açılmış olsa bile)? */
export function isLocked(): boolean {
  return encryptedData !== null || settings.lockEnabled;
}

/** §9.3 — parola bu oturumda bellekte mi? */
export function isUnlocked(): boolean {
  return passphrase !== null;
}

/**
 * §9.4, §18.4-7 — "Bütün verilerimi sil": veritabanı, `caches` ve
 * `localStorage` temizlenir; bellekteki plan, ayarlar ve parola sıfırlanır.
 * Sonraki çağrı depoyu yeniden açar.
 */
export async function clearAllData(): Promise<void> {
  await ensureReady();

  // Bekleyen debounce yazmasını iptal et; uçuştaki yazma bitmeden silme.
  if (saveTimer !== null) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  pendingPlan = null;
  await writeChain;

  let databaseError: unknown = null;
  try {
    await db.clear();
  } catch (error) {
    databaseError = error;
  }

  await clearCacheStorage();
  try {
    if (typeof localStorage !== 'undefined') localStorage.clear();
  } catch {
    // Gizli kipte localStorage erişilemez; veritabanı ve önbellek yine temizlendi.
  }

  resetRuntimeState();
  db.close();
  db = createMemoryStore();
  ready = null;
  memoryMode = false;
  persistenceRequested = false;

  if (databaseError !== null) throw databaseError;
}

async function clearCacheStorage(): Promise<void> {
  if (typeof caches === 'undefined') return;
  const keys = await caches.keys().catch(() => [] as string[]);
  await Promise.all(keys.map((key) => caches.delete(key).catch(() => false)));
}

function resetRuntimeState(): void {
  currentPlan = null;
  encryptedData = null;
  passphrase = null;
  pendingPlan = null;
  lastSaveError = null;
  writeChain = Promise.resolve();
  settings = createDefaultSettings();
}

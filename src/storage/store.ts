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
export const PERSISTENCE_STATUS_EVENT = 'ilk72:persistence-status';

/** §9.1 — nesne deposundaki anahtarlar. */
const PLAN_KEY = 'plan';
const SETTINGS_KEY = 'settings';
// A new revision blocks writes from tabs holding an older plan or lock state.
const REVISION_KEY = 'revision';

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
let revision: unknown;
let readError: unknown;

/** Bellekteki çözülmüş plan; kilitliyken `null` olabilir. */
let currentPlan: Plan | null = null;
/** Diskten okunan son şifreli kayıt (kilit durumunu bilmek için). */
let encryptedData: Uint8Array | null = null;
/** Açılmış kilit parolası; yalnızca bellekte, sekme kapanınca kaybolur (§9.3). */
let passphrase: string | null = null;

let pendingPlan: Plan | null = null;
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let writeChain: Promise<void> = Promise.resolve();
let lastSave: Promise<void> = Promise.resolve();
let clearing: Promise<void> | null = null;

let persistenceRequested = false;
let clearGeneration = 0;
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
    const [storedPlan, storedSettings, storedRevision] = await db.getMany([
      PLAN_KEY,
      SETTINGS_KEY,
      REVISION_KEY,
    ]);
    settings = sanitizeSettings(storedSettings);
    revision = storedRevision;
    if (isEncryptedPlanRecord(storedPlan)) {
      encryptedData = storedPlan.data;
      settings.lockEnabled = true;
    } else if (storedPlan !== undefined) {
      const { plan } = sanitizePlan(storedPlan);
      currentPlan ??= plan;
      // The plan record takes precedence over settings written by older app versions.
      settings.lockEnabled = false;
    }
    persistenceRequested = settings.storagePersisted !== null;
  } catch (error) {
    readError = error;
  }
}

function ensureReady(): Promise<void> {
  ready ??= initialize();
  return ready;
}

async function ensureReadable(): Promise<void> {
  await ensureReady();
  if (readError !== undefined) throw readError;
}

function queueWrite<T>(write: () => Promise<T>): Promise<T> {
  const result = writeChain.then(write);
  writeChain = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
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
  return queueWrite(async () => {
    await ensureReadable();
    await commitSettings(patch);
  });
}

async function commitSettings(
  patch: Partial<Settings>,
  change?: { lockEnabled: boolean; record?: Plan | EncryptedPlanRecord },
): Promise<void> {
  const nextRevision = change === undefined ? revision : crypto.randomUUID();
  const lockEnabled = change?.lockEnabled ?? settings.lockEnabled;
  let nextSettings = settings;
  await db.update([REVISION_KEY, SETTINGS_KEY], ([storedRevision, storedSettings]) => {
    if (storedRevision !== revision) throw new Error('depo-degisti');
    const current = sanitizeSettings(storedSettings);
    nextSettings = sanitizeSettings({
      ...current,
      ...patch,
      printPrefs: { ...current.printPrefs, ...patch.printPrefs },
      lockEnabled,
    });
    const entries: [string, unknown][] = [[SETTINGS_KEY, nextSettings]];
    if (change !== undefined) entries.push([REVISION_KEY, nextRevision]);
    if (change?.record !== undefined) entries.push([PLAN_KEY, change.record]);
    return { entries };
  });
  settings = nextSettings;
  revision = nextRevision;
}

async function commitLock(nextPassphrase: string | null): Promise<void> {
  const plan = currentPlan;
  if (plan !== null) {
    const previousSave = lastSave;
    await persistPlan(plan, nextPassphrase);
    if (pendingPlan === plan) pendingPlan = null;
    if (lastSave === previousSave && currentPlan === plan) lastSave = Promise.resolve();
  } else {
    await commitSettings({}, { lockEnabled: nextPassphrase !== null });
  }
  passphrase = nextPassphrase;
}

/**
 * §9.1, §9.3 — planı okur. Kayıt `{ enc: true, data }` ise parola gerekir:
 * `plan: null`, `encrypted: true` döner ve `unlockPlan` çağrılmalıdır.
 * Kilit bu oturumda zaten açıldıysa bellek içindeki plan döner.
 */
export async function loadPlan(): Promise<LoadedPlan> {
  await ensureReadable();
  if (encryptedData !== null && passphrase === null) {
    return { plan: null, encrypted: true };
  }
  return { plan: currentPlan, encrypted: false };
}

/**
 * §9.3 — şifreli planı parolayla açar. Parola bellekte tutulur; sonraki
 * kayıtlar aynı parolayla yeniden şifrelenir. Hatalar `decryptBytes`'tan
 * gelir: `parola-yanlis-veya-bozuk`, `bozuk-veri`.
 */
export async function unlockPlan(candidate: string): Promise<Plan> {
  return queueWrite(async () => {
    await ensureReadable();
    if (encryptedData === null) {
      if (currentPlan === null) throw new Error('bozuk-veri');
      return currentPlan;
    }

    const plain = await decryptBytes(encryptedData, candidate);
    let parsed: unknown;
    try {
      parsed = JSON.parse(utf8Decode(plain));
    } catch {
      throw new Error('bozuk-veri');
    }
    const { plan } = sanitizePlan(parsed);
    passphrase = candidate;
    currentPlan = plan;
    // A save queued before the lock was opened cannot replace the decrypted plan.
    pendingPlan = null;
    lastSave = Promise.resolve();
    return plan;
  });
}

/**
 * §9.1, §11.4 — planı 500 ms gecikmeyle kaydettirir. Depoya **sanitize
 * edilmiş** kopya yazılır; ham girdi hiçbir zaman saklanmaz (§8.3).
 */
export function savePlan(plan: Plan): void {
  if (clearing !== null) return;
  const sanitized = sanitizePlan(plan);
  currentPlan = sanitized.plan;
  pendingPlan = sanitized.plan;

  if (saveTimer !== null) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    void writePending().catch(() => undefined);
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
  stopSaveTimer();
  return writePending();
}

function stopSaveTimer(): void {
  if (saveTimer !== null) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
}

function writePending(): Promise<void> {
  const plan = pendingPlan;
  if (plan === null) return lastSave;
  pendingPlan = null;

  lastSave = queueWrite(async () => {
    try {
      await ensureReadable();
      if (currentPlan !== plan) return;
      await saveInCurrentMode(plan);
    } catch (error) {
      if (currentPlan === plan && clearing === null) pendingPlan ??= plan;
      throw error;
    }
  });
  return lastSave;
}

/** Bir yedeği, yazma işlemi tamamlanınca bellekteki planın yerine koyar. */
export async function replacePlan(plan: Plan): Promise<Plan> {
  const replacement = sanitizePlan(plan).plan;
  return queueWrite(async () => {
    await ensureReadable();
    const preferences = currentPlan?.id === replacement.id ? {} : { visitedSteps: [] };
    await saveInCurrentMode(replacement, preferences);
    stopSaveTimer();
    pendingPlan = null;
    lastSave = Promise.resolve();
    currentPlan = replacement;
    return replacement;
  });
}

async function saveInCurrentMode(plan: Plan, patch?: Partial<Settings>): Promise<void> {
  if (settings.lockEnabled && passphrase === null) throw new Error('parola-gerekli');
  await persistPlan(plan, passphrase, patch);
}

async function persistPlan(
  plan: Plan,
  activePassphrase: string | null,
  patch: Partial<Settings> = {},
): Promise<void> {
  const data =
    activePassphrase === null
      ? null
      : await encryptBytes(utf8Encode(JSON.stringify(plan)), activePassphrase);
  await commitSettings(patch, {
    lockEnabled: data !== null,
    record: data ? { enc: true, data } : plan,
  });
  encryptedData = data;
  // Firefox may show a permission prompt. The plan is already committed.
  void requestPersistence();
}

/**
 * §9.1 — ilk plan kaydında `navigator.storage.persist()` çağrılır; sonuç
 * ayarlarda tutulur ve ayarlar sayfasında gösterilir. En fazla bir kez denenir.
 */
async function requestPersistence(): Promise<void> {
  if (persistenceRequested || memoryMode) return;
  persistenceRequested = true;
  const generation = clearGeneration;

  let persisted: boolean;
  try {
    const manager = globalThis.navigator?.storage;
    if (!manager || typeof manager.persist !== 'function') return;
    persisted = await manager.persist();
  } catch {
    persisted = false;
  }

  // Plan yazıldı; ayar kaydının yazılamaması kaydetmeyi başarısız saymaz.
  await queueWrite(async () => {
    if (generation !== clearGeneration) return;
    await commitSettings({ storagePersisted: persisted });
    globalThis.window?.dispatchEvent(new Event(PERSISTENCE_STATUS_EVENT));
  }).catch(() => undefined);
}

/** §9.3 — kilidi açar: plan bundan sonra `{ enc: true, data }` olarak saklanır. */
export async function enableLock(candidate: string): Promise<void> {
  if (typeof candidate !== 'string' || [...candidate].length < MIN_PASSPHRASE_LENGTH) {
    throw new Error('parola-kisa');
  }
  return queueWrite(async () => {
    await ensureReadable();
    if (encryptedData !== null && passphrase === null) throw new Error('kilitli');
    await commitLock(candidate);
  });
}

/**
 * §9.3 — kilidi kapatır: plan düz kayda çevrilir. Kilitli plan önce
 * açılmamışsa `parola-gerekli` verir (veri silinmez).
 */
export async function disableLock(): Promise<void> {
  return queueWrite(async () => {
    await ensureReadable();
    if (!settings.lockEnabled) return;
    if (passphrase === null && encryptedData !== null) throw new Error('parola-gerekli');
    await commitLock(null);
  });
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
 * §9.4 — "Bütün verilerimi sil": depodaki ve bu sekmenin belleğindeki plan,
 * ayarlar ve parola silinir. Çevrimdışı açılış için kullanılan uygulama
 * dosyalarının önbelleği korunur.
 */
export function clearAllData(): Promise<void> {
  if (clearing !== null) return clearing;
  stopSaveTimer();
  clearing = queueWrite(async () => {
    await ensureReady();
    // Eski sekmelerin silinen veriyi yeniden yazmasını engelleyen tek kayıt.
    const nextRevision = crypto.randomUUID();
    await db.update([], () => ({ clear: true, entries: [[REVISION_KEY, nextRevision]] }));

    resetRuntimeState(nextRevision);
  }).finally(() => {
    clearing = null;
  });
  return clearing;
}

function resetRuntimeState(nextRevision: string): void {
  clearGeneration += 1;
  revision = nextRevision;
  readError = undefined;
  currentPlan = null;
  encryptedData = null;
  passphrase = null;
  pendingPlan = null;
  lastSave = Promise.resolve();
  persistenceRequested = false;
  settings = createDefaultSettings();
}

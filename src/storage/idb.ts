/**
 * Şartname §6, §9.1 — IndexedDB sarmalayıcısı (kütüphane yok, projede yazıldı).
 *
 * Veritabanı `ilk72`, sürüm 1, tek nesne deposu `kv` (anahtar: dize).
 * Bu dosya yalnızca "aç / oku / yaz / temizle / kapat" sözleşmesini sağlar;
 * bellek içi kip kararı ve saklama biçimi `store.ts` dosyasındadır (§9.2).
 *
 * Depo açılamazsa **açık hata** fırlatılır (`Error('depo-kullanilamaz')`);
 * çağıran taraf `createMemoryStore()` ile bellek içi kipe düşebilir.
 *
 * `openStore(factory?)` isteğe bağlı fabrika alır: tarayıcıda
 * `globalThis.indexedDB`, testlerde `fake-indexeddb` ya da kasıtlı bozuk bir
 * fabrika verilebilir.
 */

/** §9.1 — veritabanı adı (normatif). */
export const DB_NAME = 'ilk72';
/** §9.1 — veritabanı sürümü (normatif). */
export const DB_VERSION = 1;
/** §9.1 — tek nesne deposu. */
export const STORE_NAME = 'kv';

/** Anahtar-değer deposunun dışa açılan en küçük yüzeyi. */
export interface KeyValueStore {
  /** Kayıt yoksa `undefined` döner. */
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
  /** Depodaki bütün anahtarları siler. */
  clear(): Promise<void>;
  close(): void;
}

/** Tarayıcıda `indexedDB` yoksa `undefined`; erişim `typeof` ile güvenlidir. */
function defaultIndexedDb(): IDBFactory | undefined {
  return typeof indexedDB === 'undefined' ? undefined : indexedDB;
}

/**
 * §9.1 — veritabanını açar; nesne deposu yoksa oluşturur.
 * Açılamazsa (API yok, güvenlik engeli, sürüm çakışması) `Error('depo-kullanilamaz')`.
 */
export async function openStore(
  factory: IDBFactory | undefined = defaultIndexedDb(),
): Promise<KeyValueStore> {
  if (factory === undefined) throw new Error('depo-kullanilamaz');
  const database = await openDatabase(factory);
  return {
    get: (key) => readValue(database, key),
    set: (key, value) => writeValue(database, key, value),
    clear: () => clearValues(database),
    close: () => database.close(),
  };
}

/**
 * §9.2 — bellek içi yedek depo. Aynı `KeyValueStore` sözleşmesini uygular;
 * veri yalnızca bu sekmenin ömrü kadar yaşar.
 */
export function createMemoryStore(): KeyValueStore {
  const values = new Map<string, unknown>();
  return {
    async get(key) {
      return values.get(key);
    },
    async set(key, value) {
      values.set(key, value);
    },
    async clear() {
      values.clear();
    },
    close() {
      values.clear();
    },
  };
}

function openDatabase(factory: IDBFactory): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    let request: IDBOpenDBRequest;
    try {
      request = factory.open(DB_NAME, DB_VERSION);
    } catch {
      reject(new Error('depo-kullanilamaz'));
      return;
    }

    let settled = false;
    const fail = (): void => {
      if (settled) return;
      settled = true;
      reject(new Error('depo-kullanilamaz'));
    };

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      const database = request.result;
      if (settled) {
        database.close();
        return;
      }
      settled = true;
      // Başka sekme sürüm yükseltirse bağlantıyı bırak (veri kaybı olmasın).
      database.onversionchange = () => database.close();
      resolve(database);
    };

    request.onerror = fail;
    request.onblocked = fail;
  });
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('depo-hatasi'));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    const fail = (): void => reject(transaction.error ?? new Error('depo-hatasi'));
    transaction.onerror = fail;
    transaction.onabort = fail;
  });
}

async function readValue(database: IDBDatabase, key: string): Promise<unknown> {
  const transaction = database.transaction(STORE_NAME, 'readonly');
  const request = transaction.objectStore(STORE_NAME).get(key);
  return requestResult(request);
}

async function writeValue(database: IDBDatabase, key: string, value: unknown): Promise<void> {
  const transaction = database.transaction(STORE_NAME, 'readwrite');
  transaction.objectStore(STORE_NAME).put(value, key);
  await transactionDone(transaction);
}

async function clearValues(database: IDBDatabase): Promise<void> {
  const transaction = database.transaction(STORE_NAME, 'readwrite');
  transaction.objectStore(STORE_NAME).clear();
  await transactionDone(transaction);
}

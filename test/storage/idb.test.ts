/**
 * Şartname §9.1, §9.2, §18.3 — IndexedDB sarmalayıcısı.
 *
 * Gerçek tarayıcı IndexedDB'si yerine `fake-indexeddb` kullanılır. Açılamayan
 * depo için sahte fabrikalarla hata yolları da sınanır: sarmalayıcı her
 * durumda `Error('depo-kullanilamaz')` fırlatmalıdır.
 */
import { IDBKeyRange as FakeIDBKeyRange, indexedDB as fakeIndexedDB } from 'fake-indexeddb';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createMemoryStore,
  DB_NAME,
  DB_VERSION,
  openStore,
  STORE_NAME,
} from '../../src/storage/idb.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('IndexedDB sarmalayıcısı', () => {
  it('normatif veritabanı adını, sürümü ve depo adını taşır', () => {
    expect(DB_NAME).toBe('ilk72');
    expect(DB_VERSION).toBe(1);
    expect(STORE_NAME).toBe('kv');
  });

  it('açar, yazar, okur, üzerine yazar ve temizler', async () => {
    vi.stubGlobal('indexedDB', fakeIndexedDB);
    vi.stubGlobal('IDBKeyRange', FakeIDBKeyRange);

    const handle = await openStore();
    try {
      expect(await handle.get('plan')).toBeUndefined();

      await handle.set('plan', { schemaVersion: 1 });
      expect(await handle.get('plan')).toEqual({ schemaVersion: 1 });

      await handle.set('plan', { schemaVersion: 1, notes: 'yeni' });
      expect(await handle.get('plan')).toEqual({ schemaVersion: 1, notes: 'yeni' });

      await handle.clear();
      expect(await handle.get('plan')).toBeUndefined();
    } finally {
      handle.close();
    }
  });

  it('yazılamayan değeri reddeder', async () => {
    vi.stubGlobal('indexedDB', fakeIndexedDB);
    vi.stubGlobal('IDBKeyRange', FakeIDBKeyRange);

    const handle = await openStore();
    try {
      await expect(handle.set('kitap', () => undefined)).rejects.toThrow();
    } finally {
      handle.close();
    }
  });

  it('indexedDB yoksa açık hata fırlatır (§9.2)', async () => {
    vi.stubGlobal('indexedDB', undefined);
    await expect(openStore()).rejects.toThrow('depo-kullanilamaz');
  });

  it('open çağrısı fırlatan fabrikada açık hata verir', async () => {
    const factory = {
      open: () => {
        throw new Error('güvenlik engeli');
      },
    } as unknown as IDBFactory;
    await expect(openStore(factory)).rejects.toThrow('depo-kullanilamaz');
  });

  it('istek hatasını açık hataya çevirir', async () => {
    const factory = {
      open: () => {
        const request = {} as IDBOpenDBRequest;
        queueMicrotask(() => {
          request.onerror?.(new Event('error'));
          // İkinci çağrı yutulur; söz bir kez reddedilir.
          request.onerror?.(new Event('error'));
        });
        return request;
      },
    } as unknown as IDBFactory;

    await expect(openStore(factory)).rejects.toThrow('depo-kullanilamaz');
  });

  it('engellenen açılışı açık hataya çevirir', async () => {
    const factory = {
      open: () => {
        const request = {} as IDBOpenDBRequest;
        queueMicrotask(() =>
          request.onblocked?.(new Event('blocked') as unknown as IDBVersionChangeEvent),
        );
        return request;
      },
    } as unknown as IDBFactory;

    await expect(openStore(factory)).rejects.toThrow('depo-kullanilamaz');
  });

  it('engelden sonra gelen başarılı açılışta bağlantıyı kapatır', async () => {
    const close = vi.fn();
    const factory = {
      open: () => {
        const request = {} as IDBOpenDBRequest;
        queueMicrotask(() => {
          request.onblocked?.(new Event('blocked') as unknown as IDBVersionChangeEvent);
          Object.defineProperty(request, 'result', {
            configurable: true,
            value: { close, onversionchange: null },
          });
          request.onsuccess?.(new Event('success'));
          request.onsuccess?.(new Event('success'));
        });
        return request;
      },
    } as unknown as IDBFactory;

    await expect(openStore(factory)).rejects.toThrow('depo-kullanilamaz');
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(close).toHaveBeenCalledTimes(2);
  });

  it('nesne deposu zaten varsa yeniden oluşturmaz', async () => {
    const createObjectStore = vi.fn();
    const database = {
      close: () => undefined,
      onversionchange: null,
      objectStoreNames: { contains: () => true },
      createObjectStore,
    };
    const factory = {
      open: () => {
        const request = {} as IDBOpenDBRequest;
        Object.defineProperty(request, 'result', { configurable: true, value: database });
        queueMicrotask(() => {
          request.onupgradeneeded?.(new Event('upgradeneeded') as unknown as IDBVersionChangeEvent);
          request.onsuccess?.(new Event('success'));
        });
        return request;
      },
    } as unknown as IDBFactory;

    const handle = await openStore(factory);
    handle.close();
    expect(createObjectStore).not.toHaveBeenCalled();
  });
});

describe('bellek içi depo', () => {
  it('aynı sözleşmeyi uygular ve kapanınca temizlenir', async () => {
    const memory = createMemoryStore();
    expect(await memory.get('plan')).toBeUndefined();
    await memory.set('plan', { enc: false });
    expect(await memory.get('plan')).toEqual({ enc: false });
    await memory.clear();
    expect(await memory.get('plan')).toBeUndefined();

    await memory.set('settings', { largeText: true });
    memory.close();
    expect(await memory.get('settings')).toBeUndefined();
  });
});

/** Açılış isteği başarılı olan sahte fabrika; `fakeDatabase` sahte bir IDBDatabase'dir. */
function openWith(fakeDatabase: unknown): IDBFactory {
  return {
    open: () => {
      const request = {} as IDBOpenDBRequest;
      Object.defineProperty(request, 'result', { configurable: true, value: fakeDatabase });
      queueMicrotask(() => request.onsuccess?.(new Event('success')));
      return request;
    },
  } as unknown as IDBFactory;
}

interface FakeTransaction {
  error: Error | null;
  oncomplete: (() => void) | null;
  onerror: (() => void) | null;
  onabort: (() => void) | null;
  objectStore(): { put(): void; clear(): void; get(): IDBRequest<unknown> };
}

function fakeDatabase(transaction: () => FakeTransaction): unknown {
  return { close: () => undefined, onversionchange: null, transaction };
}

describe('işlem hataları', () => {
  it('okuma isteğinin hatasını depo-hatasi olarak reddeder', async () => {
    const request = { error: null } as unknown as IDBRequest<unknown>;
    const handle = await openStore(
      openWith({
        close: () => undefined,
        onversionchange: null,
        transaction: () => ({
          objectStore: () => ({
            get: () => {
              queueMicrotask(() => request.onerror?.(new Event('error')));
              return request;
            },
          }),
        }),
      }),
    );

    try {
      await expect(handle.get('plan')).rejects.toThrow('depo-hatasi');
    } finally {
      handle.close();
    }
  });

  it('yazma işleminin hatasını reddeder', async () => {
    const database = fakeDatabase(() => {
      const transaction: FakeTransaction = {
        error: new Error('işlem hatası'),
        oncomplete: null,
        onerror: null,
        onabort: null,
        objectStore: () => ({
          put: () => {
            queueMicrotask(() => transaction.onerror?.());
          },
          clear: () => {
            queueMicrotask(() => transaction.oncomplete?.());
          },
          get: () => ({}) as IDBRequest<unknown>,
        }),
      };
      return transaction;
    });
    const handle = await openStore(openWith(database));

    try {
      await expect(handle.set('plan', {})).rejects.toThrow('işlem hatası');
      await expect(handle.clear()).resolves.toBeUndefined();
    } finally {
      handle.close();
    }
  });

  it('iptal edilen yazma işlemini reddeder', async () => {
    const database = fakeDatabase(() => {
      const transaction: FakeTransaction = {
        error: new Error('işlem iptal edildi'),
        oncomplete: null,
        onerror: null,
        onabort: null,
        objectStore: () => ({
          put: () => {
            queueMicrotask(() => transaction.onabort?.());
          },
          clear: () => undefined,
          get: () => ({}) as IDBRequest<unknown>,
        }),
      };
      return transaction;
    });
    const handle = await openStore(openWith(database));

    try {
      await expect(handle.set('plan', {})).rejects.toThrow('işlem iptal edildi');
    } finally {
      handle.close();
    }
  });
});

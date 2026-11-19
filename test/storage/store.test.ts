/**
 * Şartname §9.1–§9.3, §18.3 — IndexedDB, otomatik kayıt, kilit ve bellek içi kip.
 *
 * Her test taze bir `store.ts` modülüyle başlar (`vi.resetModules`), böylece
 * modül içi durum (açık bağlantı, parola, bekleyen yazma) testler arasında
 * taşınmaz. Depo olarak `fake-indexeddb` kullanılır; gerçek IndexedDB yoktur.
 */
import { IDBKeyRange as FakeIDBKeyRange, indexedDB as fakeIndexedDB } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Plan } from '../../src/model/types.ts';
import { sanitizePlan } from '../../src/model/validate.ts';
import { encryptBytes } from '../../src/storage/crypto.ts';
import { openStore } from '../../src/storage/idb.ts';
import { samplePlan } from './helpers.ts';

type StoreModule = typeof import('../../src/storage/store.ts');

const encoder = new TextEncoder();
const PASS = 'Parola-Örnek 1';

let store: StoreModule;

beforeEach(async () => {
  vi.stubGlobal('indexedDB', fakeIndexedDB);
  vi.stubGlobal('IDBKeyRange', FakeIDBKeyRange);
  vi.resetModules();
  store = await import('../../src/storage/store.ts');
  await store.clearAllData();
});

afterEach(async () => {
  await store.flushPending().catch(() => undefined);
  Reflect.deleteProperty(navigator, 'storage');
  vi.unstubAllGlobals();
});

async function freshStore(): Promise<StoreModule> {
  vi.resetModules();
  return import('../../src/storage/store.ts');
}

async function readRecord(key: string): Promise<unknown> {
  const handle = await openStore();
  try {
    return await handle.get(key);
  } finally {
    handle.close();
  }
}

async function writeRecord(key: string, value: unknown): Promise<void> {
  const handle = await openStore();
  try {
    await handle.set(key, value);
  } finally {
    handle.close();
  }
}

describe('açılış ve kayıt', () => {
  it('boş depoda plan yoktur, ayarlar varsayılandır', async () => {
    await expect(store.loadPlan()).resolves.toEqual({ plan: null, encrypted: false });
    expect(store.isMemoryMode()).toBe(false);
    expect(store.getSettings()).toEqual({
      largeText: false,
      lockEnabled: false,
      printPrefs: { documents: [], includeHealth: false, includeSchoolName: false },
      firstRunAccepted: false,
      visitedSteps: [],
      storagePersisted: null,
    });
    await expect(store.flushPending()).resolves.toBeUndefined();
  });

  it('savePlan sanitize edilmiş planı yazar ve yeniden yüklenebilir', async () => {
    const input = samplePlan();
    input.household.label = 'A'.repeat(61);
    input.healthOptIn = false;
    const firstMember = input.members[0];
    if (firstMember) {
      firstMember.health = {
        bloodType: 'A+',
        conditions: 'Astım',
        medications: '',
        allergies: '',
        devices: '',
      };
    }

    store.savePlan(input);
    await store.flushPending();

    const expected = sanitizePlan(input).plan;
    const raw = await readRecord('plan');
    expect(raw).toEqual(expected);
    expect((raw as Plan).household.label).toHaveLength(60);
    expect((raw as Plan).members[0]?.health).toBeUndefined();

    const fresh = await freshStore();
    await expect(fresh.loadPlan()).resolves.toEqual({ plan: expected, encrypted: false });
    expect(fresh.isMemoryMode()).toBe(false);
  });

  it('savePlan 500 ms gecikmeyle yazar (§9.1)', async () => {
    store.savePlan(samplePlan());

    await new Promise((resolve) => setTimeout(resolve, 120));
    expect(await readRecord('plan')).toBeUndefined();

    await vi.waitFor(
      async () => {
        expect(await readRecord('plan')).toBeDefined();
      },
      { timeout: 3000, interval: 50 },
    );
  }, 10000);

  it('art arda değişiklikte yalnızca son plan yazılır', async () => {
    const first = samplePlan();
    first.notes = 'ilk';
    const second = samplePlan();
    second.notes = 'son';

    store.savePlan(first);
    store.savePlan(second);
    await store.flushPending();

    expect(await readRecord('plan')).toEqual(sanitizePlan(second).plan);
  });

  it('flushPending bekleyen yazmayı hemen uygular', async () => {
    store.savePlan(samplePlan());
    await store.flushPending();
    expect(await readRecord('plan')).toBeDefined();
  });

  it('desteklenmeyen şema sürümünü yazmaz (§8.3)', () => {
    const invalid = { ...samplePlan(), schemaVersion: 2 } as unknown as Plan;
    expect(() => store.savePlan(invalid)).toThrow('desteklenmeyen-surum');
  });

  it('visibilitychange hidden bekleyen yazmayı hemen uygular (§9.1)', async () => {
    store.savePlan(samplePlan());
    expect(await readRecord('plan')).toBeUndefined();

    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    try {
      document.dispatchEvent(new Event('visibilitychange'));
      // 450 ms < 500 ms debounce: yazma yalnızca gizleme olayıyla gelebilir.
      await vi.waitFor(
        async () => {
          expect(await readRecord('plan')).toBeDefined();
        },
        { timeout: 450, interval: 25 },
      );
    } finally {
      Reflect.deleteProperty(document, 'visibilityState');
    }
  });
});

describe('ayarlar', () => {
  it('updateSettings kalıcıdır, kısmi yamayı birleştirir ve savunmalı kopya döner', async () => {
    await store.updateSettings({ largeText: true, visitedSteps: [2, 1, 2] });
    await store.updateSettings({
      printPrefs: { documents: ['tam-plan'], includeHealth: true, includeSchoolName: false },
    });
    await store.updateSettings({ firstRunAccepted: true });

    const current = store.getSettings();
    expect(current).toMatchObject({
      largeText: true,
      firstRunAccepted: true,
      visitedSteps: [1, 2],
      printPrefs: { documents: ['tam-plan'], includeHealth: true, includeSchoolName: false },
    });

    // Savunmalı kopya: dönen nesneyi değiştirmek modül durumunu etkilemez.
    current.printPrefs.documents.push('buzdolabi');
    current.visitedSteps.push(3);
    expect(store.getSettings().printPrefs.documents).toEqual(['tam-plan']);
    expect(store.getSettings().visitedSteps).toEqual([1, 2]);

    const fresh = await freshStore();
    await fresh.loadPlan();
    expect(fresh.getSettings()).toEqual(store.getSettings());
  });

  it('bozuk ayar kaydını varsayılanlara indirger', async () => {
    await writeRecord('settings', {
      largeText: 'evet',
      lockEnabled: 1,
      printPrefs: 'yok',
      firstRunAccepted: null,
      visitedSteps: [0, 1, 2, 2, 13, 1.5, '3', 5],
      storagePersisted: 'bilinmiyor',
    });

    const fresh = await freshStore();
    await fresh.loadPlan();
    expect(fresh.getSettings()).toEqual({
      largeText: false,
      lockEnabled: false,
      printPrefs: { documents: [], includeHealth: false, includeSchoolName: false },
      firstRunAccepted: false,
      visitedSteps: [1, 2, 5],
      storagePersisted: null,
    });
  });

  it('yazdırma belgesi listesindeki tekrarları atar, boşları ve 50 üstünü keser', async () => {
    const documents = Array.from({ length: 60 }, (_, index) => `belge-${index}`);
    documents[3] = 'belge-0';
    await writeRecord('settings', { printPrefs: { documents: ['', ...documents, 5] } });

    const fresh = await freshStore();
    await fresh.loadPlan();
    const prefs = fresh.getSettings().printPrefs;
    expect(prefs.documents).toHaveLength(50);
    expect(prefs.documents[0]).toBe('belge-0');
    expect(prefs.documents).not.toContain('');
  });
});

describe('kalıcı depolama isteği (§9.1)', () => {
  it('ilk kayıtta persist çağrılır, sonuç ayarda tutulur, ikinci kayıtta tekrarlanmaz', async () => {
    const persist = vi.fn(async () => true);
    Object.defineProperty(navigator, 'storage', { configurable: true, value: { persist } });

    store.savePlan(samplePlan());
    await store.flushPending();
    expect(persist).toHaveBeenCalledTimes(1);
    expect(store.getSettings().storagePersisted).toBe(true);

    store.savePlan(samplePlan());
    await store.flushPending();
    expect(persist).toHaveBeenCalledTimes(1);
  });

  it('persist reddederse ayarda false tutulur', async () => {
    Object.defineProperty(navigator, 'storage', {
      configurable: true,
      value: {
        persist: async () => {
          throw new Error('izin yok');
        },
      },
    });

    store.savePlan(samplePlan());
    await store.flushPending();
    expect(store.getSettings().storagePersisted).toBe(false);
  });

  it('persist yoksa sonuç null kalır', async () => {
    Object.defineProperty(navigator, 'storage', { configurable: true, value: {} });

    store.savePlan(samplePlan());
    await store.flushPending();
    expect(store.getSettings().storagePersisted).toBeNull();
  });
});

describe('bellek içi kip (§9.2)', () => {
  it('IndexedDB açılamazsa bellek içi kipte çalışır', async () => {
    vi.stubGlobal('indexedDB', undefined);
    const memory = await freshStore();

    await expect(memory.loadPlan()).resolves.toEqual({ plan: null, encrypted: false });
    expect(memory.isMemoryMode()).toBe(true);

    const input = samplePlan();
    const expected = sanitizePlan(input).plan;
    memory.savePlan(input);
    await memory.flushPending();
    const loaded = await memory.loadPlan();
    expect(loaded.encrypted).toBe(false);
    expect(loaded.plan).toEqual(expected);

    await memory.updateSettings({ largeText: true });
    expect(memory.getSettings().largeText).toBe(true);

    await expect(memory.clearAllData()).resolves.toBeUndefined();
    await expect(memory.loadPlan()).resolves.toEqual({ plan: null, encrypted: false });
    expect(memory.isMemoryMode()).toBe(true);
  });
});

describe('uygulama kilidi (§9.3)', () => {
  it('kilit açıkken plan şifreli saklanır, yanlış parola veriyi silmez', async () => {
    await store.enableLock(PASS);
    expect(store.isLocked()).toBe(true);
    expect(store.isUnlocked()).toBe(true);

    const input = samplePlan();
    const expected = sanitizePlan(input).plan;
    store.savePlan(input);
    await store.flushPending();

    const raw = await readRecord('plan');
    expect(raw).toMatchObject({ enc: true });
    expect((raw as { data: Uint8Array }).data).toBeInstanceOf(Uint8Array);

    const fresh = await freshStore();
    await expect(fresh.loadPlan()).resolves.toEqual({ plan: null, encrypted: true });
    expect(fresh.isLocked()).toBe(true);
    expect(fresh.isUnlocked()).toBe(false);

    await expect(fresh.unlockPlan('Yanlis Parola 2')).rejects.toThrow('parola-yanlis-veya-bozuk');
    // Yanlış parola veriyi silmez; kayıt hâlâ şifreli ve açılabilir (§9.3).
    await expect(fresh.loadPlan()).resolves.toEqual({ plan: null, encrypted: true });

    await expect(fresh.unlockPlan(PASS)).resolves.toEqual(expected);
    expect(fresh.isUnlocked()).toBe(true);
    await expect(fresh.loadPlan()).resolves.toEqual({ plan: expected, encrypted: false });

    fresh.savePlan(input);
    await fresh.flushPending();
    expect(await readRecord('plan')).toMatchObject({ enc: true });
  }, 30000);

  it('enableLock mevcut planı hemen şifreler; disableLock düz kayda döner', async () => {
    const input = samplePlan();
    const expected = sanitizePlan(input).plan;
    store.savePlan(input);
    await store.flushPending();
    expect(await readRecord('plan')).not.toMatchObject({ enc: true });

    await store.enableLock(PASS);
    expect(await readRecord('plan')).toMatchObject({ enc: true });

    store.savePlan(input);
    await store.flushPending();
    expect(await readRecord('plan')).toMatchObject({ enc: true });

    await store.disableLock();
    expect(store.isLocked()).toBe(false);
    expect(store.isUnlocked()).toBe(false);
    expect(await readRecord('plan')).not.toMatchObject({ enc: true });

    const fresh = await freshStore();
    await expect(fresh.loadPlan()).resolves.toEqual({ plan: expected, encrypted: false });
  }, 30000);

  it('kilit açılmadan disableLock parola ister, veri silinmez', async () => {
    await store.enableLock(PASS);
    store.savePlan(samplePlan());
    await store.flushPending();

    const fresh = await freshStore();
    await fresh.loadPlan();
    await expect(fresh.disableLock()).rejects.toThrow('parola-gerekli');

    await expect(fresh.unlockPlan(PASS)).resolves.toBeDefined();
    await expect(fresh.disableLock()).resolves.toBeUndefined();
    expect(fresh.isLocked()).toBe(false);
    expect(await readRecord('plan')).not.toMatchObject({ enc: true });
  }, 30000);

  it('kilitli plan açılmadan yeni kilit kurulamaz', async () => {
    await store.enableLock(PASS);
    store.savePlan(samplePlan());
    await store.flushPending();

    const fresh = await freshStore();
    await fresh.loadPlan();
    await expect(fresh.enableLock('Baska parola 2')).rejects.toThrow('kilitli');
  }, 30000);

  it('kilit parolası en az 8 karakterdir (§9.3)', async () => {
    await expect(store.enableLock('kisa')).rejects.toThrow('parola-kisa');
    expect(store.isLocked()).toBe(false);
  });

  it('plan yokken unlockPlan bozuk-veri verir', async () => {
    await expect(store.unlockPlan(PASS)).rejects.toThrow('bozuk-veri');
  });

  it('şifresiz kayıtta unlockPlan parola istemeden temiz planı döndürür', async () => {
    const input = samplePlan();
    const expected = sanitizePlan(input).plan;
    store.savePlan(input);
    await store.flushPending();

    const fresh = await freshStore();
    await expect(fresh.unlockPlan(PASS)).resolves.toEqual(expected);
  });

  it('şifreli kayıt bulununca kilit ayarı onarılır', async () => {
    const json = JSON.stringify(sanitizePlan(samplePlan()).plan);
    const data = await encryptBytes(encoder.encode(json), PASS);
    await writeRecord('plan', { enc: true, data });

    const fresh = await freshStore();
    await expect(fresh.loadPlan()).resolves.toEqual({ plan: null, encrypted: true });
    await expect(fresh.unlockPlan(PASS)).resolves.toBeDefined();
    expect(fresh.getSettings().lockEnabled).toBe(true);
  }, 30000);

  it('şifre çözülse de JSON bozuksa bozuk-veri verir', async () => {
    const data = await encryptBytes(encoder.encode('{bozuk json'), PASS);
    await writeRecord('plan', { enc: true, data });
    await writeRecord('settings', { lockEnabled: true });

    const fresh = await freshStore();
    await expect(fresh.loadPlan()).resolves.toEqual({ plan: null, encrypted: true });
    await expect(fresh.unlockPlan(PASS)).rejects.toThrow('bozuk-veri');
  }, 30000);

  it('kilit ayarı açıkken parola yoksa kaydetme parola-gerekli verir', async () => {
    await writeRecord('settings', { lockEnabled: true });

    const fresh = await freshStore();
    await fresh.loadPlan();
    fresh.savePlan(samplePlan());
    await expect(fresh.flushPending()).rejects.toThrow('parola-gerekli');
  });
});

describe('bütün verileri silme (§9.4)', () => {
  it('veritabanını, caches ve localStorage temizler', async () => {
    store.savePlan(samplePlan());
    await store.flushPending();
    await store.updateSettings({ largeText: true });
    window.localStorage.setItem('deneme', '1');

    const deleteCache = vi.fn(async () => true);
    const keys = vi.fn(async () => ['a', 'b']);
    vi.stubGlobal('caches', { keys, delete: deleteCache });

    await store.clearAllData();

    expect(deleteCache).toHaveBeenCalledTimes(2);
    expect(window.localStorage.length).toBe(0);
    expect(store.getSettings().largeText).toBe(false);
    expect(await readRecord('plan')).toBeUndefined();
    expect(await readRecord('settings')).toBeUndefined();
    // Silme sonrası depo yeniden açılır ve boştur.
    await expect(store.loadPlan()).resolves.toEqual({ plan: null, encrypted: false });
    expect(store.isMemoryMode()).toBe(false);
  });

  it('cache hataları veri silmeyi engellemez', async () => {
    store.savePlan(samplePlan());
    await store.flushPending();

    vi.stubGlobal('caches', {
      keys: async () => {
        throw new Error('cache yok');
      },
      delete: async () => false,
    });
    await expect(store.clearAllData()).resolves.toBeUndefined();

    store.savePlan(samplePlan());
    await store.flushPending();
    vi.stubGlobal('caches', {
      keys: async () => ['a'],
      delete: async () => {
        throw new Error('silinemedi');
      },
    });
    await expect(store.clearAllData()).resolves.toBeUndefined();
    expect(await readRecord('plan')).toBeUndefined();
  });

  it('bekleyen debounce yazmasını iptal eder, sonradan veri geri yazılmaz', async () => {
    store.savePlan(samplePlan());
    await store.clearAllData();
    expect(await readRecord('plan')).toBeUndefined();

    // İptal edilmemiş 500 ms'lik zamanlayıcı bu arada yazmamalı.
    await new Promise((resolve) => setTimeout(resolve, 650));
    expect(await readRecord('plan')).toBeUndefined();
  }, 10000);
});

/**
 * Şartname §9.4, §18.3 — yedek dosyası dışa/içe aktarma.
 *
 * Düz ve parolalı biçimlerin gidiş-dönüşü, 1 MB sınırı, `format` denetimi,
 * özet alanları ve sıkıştırma bombası sınanır. İçe aktarma hiçbir zaman
 * mevcut planın üzerine yazmaz; bu dosya yalnızca `{ plan, summary }` döner.
 */
import { describe, expect, it } from 'vitest';
import { BACKUP_MAX_BYTES } from '../../src/config.ts';
import { b64urlEncode, deflate } from '../../src/lib/bytes.ts';
import type { Plan } from '../../src/model/types.ts';
import { sanitizePlan } from '../../src/model/validate.ts';
import { backupFilename, exportBackup, importBackup } from '../../src/storage/backup.ts';
import { encryptBytes } from '../../src/storage/crypto.ts';
import { samplePlan } from './helpers.ts';

const PASS = 'Parola-Örnek 1';
const encoder = new TextEncoder();

function envelopeOf(text: string): Record<string, unknown> {
  return JSON.parse(text) as Record<string, unknown>;
}

describe('dosya adı ve düz biçim', () => {
  it('dosya adı ilk72-yedek-YYYY-AA-GG.json biçimindedir', async () => {
    expect(backupFilename(new Date(2026, 0, 5))).toBe('ilk72-yedek-2026-01-05.json');
    expect(backupFilename(new Date(2026, 10, 19))).toBe('ilk72-yedek-2026-11-19.json');

    const file = await exportBackup(samplePlan());
    expect(file.filename).toMatch(/^ilk72-yedek-\d{4}-\d{2}-\d{2}\.json$/);
  });

  it('düz yedeğin zarfı §9.4 alanlarını taşır', async () => {
    const plan = samplePlan();
    const envelope = envelopeOf((await exportBackup(plan)).text);

    expect(envelope.format).toBe('ilk72-yedek');
    expect(envelope.schemaVersion).toBe(1);
    expect(envelope.encrypted).toBe(false);
    expect(typeof envelope.exportedAt).toBe('string');
    expect(Number.isNaN(Date.parse(String(envelope.exportedAt)))).toBe(false);
    expect(envelope.plan).toEqual(sanitizePlan(plan).plan);
  });

  it('düz dışa aktarma → içe aktarma planı ve özeti birebir korur', async () => {
    const plan = samplePlan();
    const file = await exportBackup(plan);
    const imported = await importBackup(file.text);

    expect(imported.plan).toEqual(sanitizePlan(plan).plan);
    expect(imported.summary).toEqual({
      members: 2,
      contacts: 1,
      updatedAt: plan.updatedAt,
    });
  });

  it('içe aktarmada sanitizePlan uygular (§8.3)', async () => {
    const plan = samplePlan();
    plan.household.label = 'B'.repeat(61);
    plan.notes = 'satır\nsonu';
    const imported = await importBackup((await exportBackup(plan)).text);

    expect(imported.plan).toEqual(sanitizePlan(plan).plan);
    expect(imported.plan.household.label).toHaveLength(60);
  });

  it('dışa aktarma girdi planını değiştirmez', async () => {
    const plan = samplePlan();
    const before = JSON.stringify(plan);
    await exportBackup(plan);
    expect(JSON.stringify(plan)).toBe(before);
  });
});

describe('parolalı biçim', () => {
  it('parolalı zarf `data` taşır, `plan` taşımaz', async () => {
    const envelope = envelopeOf((await exportBackup(samplePlan(), PASS)).text);
    expect(envelope.encrypted).toBe(true);
    expect(typeof envelope.data).toBe('string');
    expect(envelope.plan).toBeUndefined();
  });

  it('parolalı dışa aktarma → içe aktarma planı korur', async () => {
    const plan = samplePlan();
    const file = await exportBackup(plan, PASS);
    const imported = await importBackup(file.text, PASS);

    expect(imported.plan).toEqual(sanitizePlan(plan).plan);
    expect(imported.summary.members).toBe(2);
  });

  it('yanlış parolada parola-yanlis-veya-bozuk verir', async () => {
    const file = await exportBackup(samplePlan(), PASS);
    await expect(importBackup(file.text, 'Yanlis Parola 2')).rejects.toThrow(
      'parola-yanlis-veya-bozuk',
    );
  });

  it('parola verilmezse parola-gerekli verir', async () => {
    const file = await exportBackup(samplePlan(), PASS);
    await expect(importBackup(file.text)).rejects.toThrow('parola-gerekli');
  });

  it('bozuk base64url ve kısa zarfta bozuk-veri verir', async () => {
    const base = { format: 'ilk72-yedek', schemaVersion: 1, encrypted: true };
    await expect(importBackup(JSON.stringify({ ...base, data: 'AA+A' }), PASS)).rejects.toThrow(
      'bozuk-veri',
    );
    const shortData = b64urlEncode(new Uint8Array(10));
    await expect(importBackup(JSON.stringify({ ...base, data: shortData }), PASS)).rejects.toThrow(
      'bozuk-veri',
    );
    await expect(importBackup(JSON.stringify({ ...base, data: '' }), PASS)).rejects.toThrow(
      'bozuk-veri',
    );
  });

  it('şişirilmiş JSON 1 MB sınırını aşarsa cok-buyuk verir (§17)', async () => {
    const bomb = new Uint8Array(BACKUP_MAX_BYTES + 1000);
    const data = b64urlEncode(await encryptBytes(await deflate(bomb), PASS));
    const text = JSON.stringify({
      format: 'ilk72-yedek',
      schemaVersion: 1,
      encrypted: true,
      data,
    });
    expect(encoder.encode(text).length).toBeLessThan(BACKUP_MAX_BYTES);
    await expect(importBackup(text, PASS)).rejects.toThrow('cok-buyuk');
  });

  it('boş parola düz biçim üretir', async () => {
    const envelope = envelopeOf((await exportBackup(samplePlan(), '')).text);
    expect(envelope.encrypted).toBe(false);
    expect(envelope.plan).toBeDefined();
  });
});

describe('içe aktarma denetimleri (§9.4)', () => {
  it('1 MB üstü dosyayı reddeder', async () => {
    await expect(importBackup('x'.repeat(BACKUP_MAX_BYTES + 1))).rejects.toThrow('cok-buyuk');
  });

  it('yanlış format değerini reddeder', async () => {
    const text = JSON.stringify({
      format: 'baska-yedek',
      schemaVersion: 1,
      encrypted: false,
      plan: sanitizePlan(samplePlan()).plan,
    });
    await expect(importBackup(text)).rejects.toThrow('gecersiz-format');
  });

  it('desteklenmeyen şema sürümünü reddeder', async () => {
    const text = JSON.stringify({
      format: 'ilk72-yedek',
      schemaVersion: 2,
      encrypted: false,
      plan: sanitizePlan(samplePlan()).plan,
    });
    await expect(importBackup(text)).rejects.toThrow('desteklenmeyen-surum');
  });

  it('bozuk JSON ve nesne olmayan içerikte bozuk-veri verir', async () => {
    for (const text of ['', '{', 'null', '[]', '"metin"']) {
      await expect(importBackup(text), text).rejects.toThrow('bozuk-veri');
    }
  });

  it('eksik plan ve geçersiz encrypted alanında bozuk-veri verir', async () => {
    const base = { format: 'ilk72-yedek', schemaVersion: 1 };
    await expect(importBackup(JSON.stringify({ ...base, encrypted: false }))).rejects.toThrow(
      'bozuk-veri',
    );
    await expect(
      importBackup(JSON.stringify({ ...base, encrypted: 'evet', plan: {} })),
    ).rejects.toThrow('bozuk-veri');
    await expect(
      importBackup(JSON.stringify({ ...base, encrypted: false, plan: 'metin' })),
    ).rejects.toThrow('bozuk-veri');
  });

  it('plan içindeki desteklenmeyen sürümü modele bırakır', async () => {
    const plan = { ...sanitizePlan(samplePlan()).plan, schemaVersion: 2 } as unknown as Plan;
    const text = JSON.stringify({
      format: 'ilk72-yedek',
      schemaVersion: 1,
      encrypted: false,
      plan,
    });
    await expect(importBackup(text)).rejects.toThrow('desteklenmeyen-surum');
  });
});

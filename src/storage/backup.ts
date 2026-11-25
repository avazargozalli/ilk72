/**
 * Şartname §9.4, §18.3 — yedek dosyası dışa/içe aktarma.
 *
 * Dosya adı `ilk72-yedek-YYYY-AA-GG.json` (yerel tarih). İki biçim vardır:
 *
 * ```jsonc
 * // düz
 * { "format": "ilk72-yedek", "schemaVersion": 1, "exportedAt": "…", "encrypted": false, "plan": { … } }
 * // parolalı
 * { "format": "ilk72-yedek", "schemaVersion": 1, "exportedAt": "…", "encrypted": true, "data": "<base64url>" }
 * ```
 *
 * Parolalı `data` = `base64url(encryptBytes(deflate(utf8(JSON(plan)))))`
 * (§9.4; şifreleme zarfı Ek A). İçe aktarma:
 *
 * 1. Dosya en çok 1 MB (§9.4) — UTF-8 bayt uzunluğu ölçülür;
 * 2. `format` ve `schemaVersion` denetlenir;
 * 3. parolalıysa parola istenir, açılan JSON `BACKUP_MAX_BYTES` sınırıyla
 *    şişirilir (sıkıştırma bombası) ve `sanitizePlan` uygulanır (§8.3);
 * 4. kullanıcıya gösterilecek özet (`members`, `contacts`, `updatedAt`) döner.
 *
 * **Bu dosya hiçbir zaman mevcut planın üzerine yazmaz.** Arayüz özeti
 * gösterip onay aldıktan sonra `store.replacePlan` çağırmalıdır (§9.4).
 *
 * Hata kodları: `cok-buyuk`, `bozuk-veri`, `gecersiz-format`,
 * `desteklenmeyen-surum`, `parola-gerekli`, `parola-yanlis-veya-bozuk`.
 * `gecersiz-format` ve `desteklenmeyen-surum` için `src/i18n/common.ts`
 * içinde özel ileti yoktur; arayüz genel iletiye düşebilir ya da kendi
 * eşlemesini ekleyebilir.
 */
import { BACKUP_FILE_PREFIX, BACKUP_MAX_BYTES } from '../config.ts';
import {
  b64urlDecode,
  b64urlEncode,
  deflate,
  inflate,
  utf8Decode,
  utf8Encode,
} from '../lib/bytes.ts';
import { type Plan, SCHEMA_VERSION } from '../model/types.ts';
import { sanitizePlan } from '../model/validate.ts';
import { decryptBytes, encryptBytes } from './crypto.ts';

/** §9.4 — dosyadaki `format` değeri. */
export const BACKUP_FORMAT = 'ilk72-yedek';

/** İçe aktarma özeti: "4 kişi, 3 acil kişi, son güncelleme …" (§9.4). */
export interface BackupSummary {
  members: number;
  contacts: number;
  updatedAt: string;
}

/** Dışa aktarma sonucu: indirilecek dosyanın adı ve UTF-8 metni. */
export interface BackupFile {
  filename: string;
  text: string;
}

/** İçe aktarma sonucu: temizlenmiş plan ve kullanıcıya gösterilecek özet. */
export interface ImportedBackup {
  plan: Plan;
  summary: BackupSummary;
}

interface BackupEnvelope {
  format: string;
  schemaVersion: number;
  exportedAt: string;
  encrypted: boolean;
  plan?: unknown;
  data?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** §9.4 — `ilk72-yedek-YYYY-AA-GG.json`, yerel tarih. */
export function backupFilename(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${BACKUP_FILE_PREFIX}-${year}-${month}-${day}.json`;
}

/**
 * §9.4 — planı yedek dosyasına dönüştürür. `passphrase` verilirse parolalı
 * biçim üretilir. Dışa aktarılan plan da `sanitizePlan`'dan geçer.
 */
export async function exportBackup(plan: Plan, passphrase?: string): Promise<BackupFile> {
  const sanitized = sanitizePlan(plan).plan;
  const json = JSON.stringify(sanitized);
  if (utf8Encode(json).length > BACKUP_MAX_BYTES) throw new Error('cok-buyuk');
  const envelope: BackupEnvelope = {
    format: BACKUP_FORMAT,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    encrypted: false,
  };

  if (passphrase !== undefined && passphrase !== '') {
    envelope.encrypted = true;
    const compressed = await deflate(utf8Encode(json));
    envelope.data = b64urlEncode(await encryptBytes(compressed, passphrase));
  } else {
    envelope.plan = sanitized;
  }

  const formatted = JSON.stringify(envelope, null, 2);
  if (utf8Encode(formatted).length <= BACKUP_MAX_BYTES) {
    return { filename: backupFilename(), text: formatted };
  }
  const compact = JSON.stringify(envelope);
  if (utf8Encode(compact).length > BACKUP_MAX_BYTES) throw new Error('cok-buyuk');
  return { filename: backupFilename(), text: compact };
}

/**
 * §9.4 — yedek metnini içe aktarır. Mevcut planı **değiştirmez**; onay ve
 * yazma çağıran arayüzün işidir.
 */
export async function importBackup(text: string, passphrase?: string): Promise<ImportedBackup> {
  if (utf8Encode(text).length > BACKUP_MAX_BYTES) throw new Error('cok-buyuk');

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('bozuk-veri');
  }
  if (!isRecord(parsed)) throw new Error('bozuk-veri');
  if (parsed.format !== BACKUP_FORMAT) throw new Error('gecersiz-format');
  if (parsed.schemaVersion !== SCHEMA_VERSION) throw new Error('desteklenmeyen-surum');
  if (typeof parsed.encrypted !== 'boolean') throw new Error('bozuk-veri');

  let planInput: unknown;
  if (parsed.encrypted) {
    if (typeof parsed.data !== 'string' || parsed.data === '') throw new Error('bozuk-veri');
    if (passphrase === undefined || passphrase === '') throw new Error('parola-gerekli');
    planInput = await decodeEncryptedPayload(parsed.data, passphrase);
  } else {
    planInput = parsed.plan;
  }

  if (!isRecord(planInput)) throw new Error('bozuk-veri');
  const sanitized = sanitizePlan(planInput);
  return { plan: sanitized.plan, summary: summarize(sanitized.plan) };
}

/**
 * §9.4, §17 — parolalı yedeği çözer. Base64url hatası kullanıcıya
 * `bozuk-veri` olarak döner; parola hatası aynen korunur; açılmış JSON
 * 1 MB sınırıyla şişirilir.
 */
async function decodeEncryptedPayload(data: string, passphrase: string): Promise<unknown> {
  let compressed: Uint8Array;
  try {
    compressed = b64urlDecode(data);
  } catch {
    throw new Error('bozuk-veri');
  }

  const plain = await decryptBytes(compressed, passphrase);

  let json: string;
  try {
    json = utf8Decode(await inflate(plain, BACKUP_MAX_BYTES));
  } catch (error) {
    if (error instanceof Error && error.message === 'cok-buyuk') throw error;
    throw new Error('bozuk-veri');
  }

  try {
    return JSON.parse(json);
  } catch {
    throw new Error('bozuk-veri');
  }
}

function summarize(plan: Plan): BackupSummary {
  return {
    members: plan.members.length,
    contacts: plan.contacts.length,
    updatedAt: plan.updatedAt,
  };
}

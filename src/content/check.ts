/**
 * İlk 72 — içerik onay kapısı (Şartname §13.4, §18.6).
 *
 * `runContentCheck()` gerçek kaydı denetler; `checkContent()` aynı kuralları
 * verilen kayıt üzerinde uygular ve testlerde sahte kayıt (fixture) ile
 * kullanılır. Gerçek kayıt bu işlevler tarafından **değiştirilmez**.
 *
 * Denetlenen kurallar (§13.4-1, §13.4-4):
 *  1. Her maddenin en az bir kaynağı var.
 *  2. Kaynak anahtarları kayıtlı.
 *  3. Kaynak adresleri `https` ve izinli alan adlarında; adresi olmayan
 *     (doğrulanmamış) anahtarlar onaylanamaz.
 *  4. Metin ≤ 220 karakter.
 *  5. `onayli` maddelerde `reviewedBy` ve `reviewedAt` dolu.
 *  6. `onayli` hiçbir madde doğrulanmamış kaynak anahtarı taşımıyor.
 *  7. `id`'ler benzersiz.
 *  8. `reviewedAt` üzerinden 12 ay geçen maddeler uyarı, 18 ay geçenler hata.
 *  9. `prod: true` iken `taslak` madde kalması hatadır; her taslak madde
 *     ayrı ayrı listelenir (§21.13).
 */
import type { ContentItem } from './registry.ts';
import { CONTENT_ITEMS, CONTENT_TEXT_MAX } from './registry.ts';
import type { Source } from './sources.ts';
import { ALLOWED_SOURCE_DOMAINS, isAllowedSourceUrl, SOURCES } from './sources.ts';

export interface Issue {
  code: string;
  itemId?: string;
  detail: string;
}

export interface ContentCheckResult {
  errors: Issue[];
  warnings: Issue[];
}

export interface RunContentCheckOptions {
  prod?: boolean;
  now?: Date;
}

export interface ContentCheckInput {
  items: readonly ContentItem[];
  sources: readonly Source[];
  prod?: boolean;
  now?: Date;
}

/** Kararlı hata/uyarı kodları; betik çıktısı ve testler bunlara dayanır. */
export const ISSUE_CODES = {
  missingSources: 'kaynaksiz-madde',
  unknownSource: 'bilinmeyen-kaynak',
  invalidSourceUrl: 'gecersiz-kaynak-adresi',
  textTooLong: 'metin-cok-uzun',
  missingReview: 'eksik-inceleme',
  invalidReviewDate: 'gecersiz-inceleme-tarihi',
  notApprovableSource: 'onaylanamaz-kaynak',
  unverifiedSource: 'dogrulanmamis-kaynak',
  duplicateId: 'yinelenen-id',
  duplicateSourceKey: 'yinelenen-kaynak-anahtari',
  draftInProd: 'taslak-icerik-prod',
  staleReview: 'eskimis-inceleme',
  expiredReview: 'suresi-gecmis-inceleme',
} as const;

/** `reviewedAt` üzerinden bu kadar ay geçince uyarı (§13.4-4). */
export const REVIEW_WARNING_MONTHS = 12;

/** `reviewedAt` üzerinden bu kadar ay geçince hata (§13.4-4). */
export const REVIEW_ERROR_MONTHS = 18;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** `YYYY-AA-GG` biçimindeki geçerli bir takvim tarihini UTC gece yarısına çevirir. */
function parseIsoDate(value: string): Date | undefined {
  const match = ISO_DATE.exec(value);
  if (match === null) {
    return undefined;
  }

  const year = Number(match[1] ?? '');
  const month = Number(match[2] ?? '');
  const day = Number(match[3] ?? '');
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return undefined;
  }

  return date;
}

/** Ay ekler; hedef ayda o gün yoksa ayın son gününe kısaltır (ör. 29 Şubat + 12 ay). */
function addMonths(date: Date, months: number): Date {
  const day = date.getUTCDate();
  const monthIndex = date.getUTCMonth() + months;
  const targetYear = date.getUTCFullYear() + Math.floor(monthIndex / 12);
  const targetMonth = ((monthIndex % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  return new Date(Date.UTC(targetYear, targetMonth, Math.min(day, lastDay)));
}

/** Değerlerin kaç kez geçtiğini sayar; yinelenenleri raporlamak için. */
function countBy(values: readonly string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}

/**
 * Verilen kayıt üzerinde §13.4 denetimini çalıştırır.
 *
 * Saf işlevdir: `items` ve `sources` dizilerini değiştirmez. Testler gerçek
 * kaydı bozmadan sahte kayıtla kural kural deneme yapar.
 */
export function checkContent(input: ContentCheckInput): ContentCheckResult {
  const errors: Issue[] = [];
  const warnings: Issue[] = [];
  const now = input.now ?? new Date();
  const prod = input.prod ?? false;
  const sourceCounts = countBy(input.sources.map((source) => source.key));
  const itemIdCounts = countBy(input.items.map((item) => item.id));
  const sourcesByKey = new Map(input.sources.map((source) => [source.key, source]));

  // Kaynak kaydının kendi bütünlüğü: anahtar tekrarı ve adres kuralı.
  const reportedSourceKeys = new Set<string>();
  for (const source of input.sources) {
    if ((sourceCounts.get(source.key) ?? 0) > 1 && !reportedSourceKeys.has(source.key)) {
      reportedSourceKeys.add(source.key);
      errors.push({
        code: ISSUE_CODES.duplicateSourceKey,
        detail: `${source.key} kaynak anahtarı ${sourceCounts.get(source.key) ?? 0} kez tanımlanmış; anahtarlar benzersiz olmalı (§13.1).`,
      });
    }

    if (source.url === null) {
      if (source.verified) {
        errors.push({
          code: ISSUE_CODES.invalidSourceUrl,
          detail: `${source.key} "verified: true" olarak işaretli ama adresi yok; doğrulanmış kaynağın https adresi olmalı (§13.1).`,
        });
      }
      continue;
    }

    if (!isAllowedSourceUrl(source.url)) {
      errors.push({
        code: ISSUE_CODES.invalidSourceUrl,
        detail: `${source.key} kaynak adresi geçersiz: ${source.url}. Adres https olmalı ve şu alan adlarından birinde bulunmalı: ${ALLOWED_SOURCE_DOMAINS.join(', ')} (§13.1).`,
      });
    }
  }

  // Doğrulanmamış kaynakları taslak maddelerde kullananlar için tek uyarı.
  const unverifiedUsage = new Map<string, string[]>();
  const reportedDuplicateIds = new Set<string>();

  for (const item of input.items) {
    if ((itemIdCounts.get(item.id) ?? 0) > 1 && !reportedDuplicateIds.has(item.id)) {
      reportedDuplicateIds.add(item.id);
      errors.push({
        code: ISSUE_CODES.duplicateId,
        itemId: item.id,
        detail: `${item.id} kimliği ${itemIdCounts.get(item.id) ?? 0} maddede kullanılıyor; kimlikler benzersiz olmalı (§13.2).`,
      });
    }

    if (item.sources.length === 0) {
      errors.push({
        code: ISSUE_CODES.missingSources,
        itemId: item.id,
        detail: `${item.id} maddesinin hiç kaynağı yok; en az bir kaynak anahtarı zorunlu (§13.4-1).`,
      });
    }

    for (const key of item.sources) {
      const source = sourcesByKey.get(key);
      if (source === undefined) {
        errors.push({
          code: ISSUE_CODES.unknownSource,
          itemId: item.id,
          detail: `${item.id}: "${key}" kaynak anahtarı kayıtlı değil (sources.ts).`,
        });
        continue;
      }

      if (!source.verified || source.url === null) {
        if (item.status === 'onayli') {
          errors.push({
            code: ISSUE_CODES.notApprovableSource,
            itemId: item.id,
            detail: `${item.id} "onayli" olamaz: ${key} doğrulanmamış bir kaynak (resmî adresi yok). Önce kaynağı doğrulayın ya da maddeyi silin (§13.3, §13.4-1).`,
          });
        } else {
          const ids = unverifiedUsage.get(key) ?? [];
          ids.push(item.id);
          unverifiedUsage.set(key, ids);
        }
        continue;
      }

      if (!isAllowedSourceUrl(source.url) && item.status === 'onayli') {
        errors.push({
          code: ISSUE_CODES.notApprovableSource,
          itemId: item.id,
          detail: `${item.id} "onayli" olamaz: ${key} kaynağının adresi geçersiz (${source.url}); adres https ve izinli alan adında olmalı (§13.4-1).`,
        });
      }
    }

    if (item.text.length > CONTENT_TEXT_MAX) {
      errors.push({
        code: ISSUE_CODES.textTooLong,
        itemId: item.id,
        detail: `${item.id} metni ${item.text.length} karakter; sınır ${CONTENT_TEXT_MAX} (§13.2).`,
      });
    }

    if (item.status === 'onayli') {
      const reviewedBy = item.reviewedBy?.trim() ?? '';
      const reviewedAt = item.reviewedAt?.trim() ?? '';
      const missingFields: string[] = [];
      if (reviewedBy === '') {
        missingFields.push('reviewedBy');
      }
      if (reviewedAt === '') {
        missingFields.push('reviewedAt');
      }

      if (missingFields.length > 0) {
        errors.push({
          code: ISSUE_CODES.missingReview,
          itemId: item.id,
          detail: `${item.id} "onayli" ama ${missingFields.join(' ve ')} boş; ikisi de zorunlu (§13.2, §13.4-1).`,
        });
      } else {
        const reviewedDate = parseIsoDate(reviewedAt);
        if (reviewedDate === undefined) {
          errors.push({
            code: ISSUE_CODES.invalidReviewDate,
            itemId: item.id,
            detail: `${item.id}: reviewedAt "${reviewedAt}" geçerli bir YYYY-AA-GG tarihi değil (§13.2).`,
          });
        } else if (now.getTime() >= addMonths(reviewedDate, REVIEW_ERROR_MONTHS).getTime()) {
          errors.push({
            code: ISSUE_CODES.expiredReview,
            itemId: item.id,
            detail: `${item.id} inceleme tarihi ${reviewedAt}; ${REVIEW_ERROR_MONTHS} aydan eski. Üretim derlemesi bu maddeyle yayımlanamaz; kaynak yeniden doğrulanmalı (§13.4-4).`,
          });
        } else if (now.getTime() >= addMonths(reviewedDate, REVIEW_WARNING_MONTHS).getTime()) {
          warnings.push({
            code: ISSUE_CODES.staleReview,
            itemId: item.id,
            detail: `${item.id} inceleme tarihi ${reviewedAt}; ${REVIEW_WARNING_MONTHS} aydan eski. Kaynağı güncel sayfayla karşılaştırıp reviewedAt alanını yenileyin (§13.4-4).`,
          });
        }
      }
    }

    if (prod && item.status === 'taslak') {
      errors.push({
        code: ISSUE_CODES.draftInProd,
        itemId: item.id,
        detail: `${item.id} onay bekliyor: durum "taslak". Üretim derlemesi için madde "onayli" yapılmalı ya da şartnameye göre silinmeli (§13.4-2).`,
      });
    }
  }

  for (const [key, ids] of unverifiedUsage) {
    const uniqueIds = [...new Set(ids)];
    warnings.push({
      code: ISSUE_CODES.unverifiedSource,
      detail: `${key} doğrulanmamış bir kaynak (resmî adresi yok); bu anahtarı taşıyan maddeler "onayli" yapılamaz: ${uniqueIds.join(', ')}.`,
    });
  }

  return { errors, warnings };
}

/**
 * Gerçek içerik kaydını §13.4'e göre denetler.
 *
 * `prod: true` üretim derlemesidir: `taslak` madde varsa her madde için ayrı
 * hata üretir. `now` yalnızca inceleme tarihi testlerinde verilir.
 */
export function runContentCheck(options: RunContentCheckOptions = {}): ContentCheckResult {
  return checkContent({
    items: CONTENT_ITEMS,
    sources: SOURCES,
    prod: options.prod ?? false,
    now: options.now,
  });
}

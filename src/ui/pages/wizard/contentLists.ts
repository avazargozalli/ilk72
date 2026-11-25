/**
 * Şartname §11.5/6, §11.5/8, §13.3 — sihirbazın içerik kaydından okuduğu listeler.
 *
 * Metinler burada **yazılmaz**: tehlike avı (`H-*`), çanta (`C-*`) ve belge
 * (`B-*`) maddeleri `src/content/registry.ts` içinden okunur (İ4). Modeller
 * yalnızca kimlikleri (`ChecklistState.id`) taşır; görünen metin kayıttan gelir.
 *
 */
import { type ContentItem, contentByCategory, getContentItem } from '../../../content/registry.ts';

/** §11.5/6 — tehlike avı listesi (H-*), kayıt sırasıyla. */
export const HAZARD_ITEMS: readonly ContentItem[] = contentByCategory('tehlike');

/** §11.5/8 — belge kopyaları listesi (B-*), kayıt sırasıyla. */
export const DOCUMENT_ITEMS: readonly ContentItem[] = contentByCategory('belge');

export const HAZARD_IDS: readonly string[] = HAZARD_ITEMS.map((item) => item.id);
export const DOCUMENT_IDS: readonly string[] = DOCUMENT_ITEMS.map((item) => item.id);

/** Çanta maddesi metinleri (`C-*`); koşullu maddeler `bag.ts` tarafından seçilir. */
const BAG_ITEM_TEXTS: ReadonlyMap<string, string> = new Map(
  contentByCategory('canta').map((item) => [item.id, item.text] as const),
);

/** Belge maddesi metinleri (`B-*`); çanta ile karıştırılmamalıdır. */
const DOCUMENT_TEXTS: ReadonlyMap<string, string> = new Map(
  contentByCategory('belge').map((item) => [item.id, item.text] as const),
);

/** Çanta maddesinin metni; kayıtta yoksa `undefined` (kullanıcı maddesi). */
export function bagItemText(id: string): string | undefined {
  return BAG_ITEM_TEXTS.get(id);
}

/** Belge maddesinin metni (`B-*`); kayıtta yoksa `undefined`. */
export function documentItemText(id: string): string | undefined {
  return DOCUMENT_TEXTS.get(id);
}

/** §13.3'teki serbest açıklama maddesi (P-04, P-10) metni. */
export function contentItemText(id: string): string | undefined {
  return getContentItem(id)?.text;
}

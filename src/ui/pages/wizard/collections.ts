/**
 * Sihirbaz yardımcıları — dizi işlemleri.
 *
 * Plan alanları değiştirilmez; her düzenleme yeni bir dizi üretir ve
 * `onPatch` ile yukarı akar (§11.4 "her değişiklik otomatik kaydedilir").
 */

/** Dizide tek öğeyi değiştirir; yeni dizi döner. */
export function replaceAt<T>(items: readonly T[], index: number, value: T): T[] {
  return items.map((item, itemIndex) => (itemIndex === index ? value : item));
}

/** Diziden bir öğeyi çıkarır; yeni dizi döner. */
export function removeAt<T>(items: readonly T[], index: number): T[] {
  return items.filter((_item, itemIndex) => itemIndex !== index);
}

/** Diziye öğe ekler; yeni dizi döner. */
export function appendItem<T>(items: readonly T[], value: T): T[] {
  return [...items, value];
}

/** Boş metinleri atar; yazdırma çıktısında boş satır kalmasın (§8.3 notu). */
export function dropEmptyText(items: readonly string[]): string[] {
  return items.filter((item) => item.trim() !== '');
}

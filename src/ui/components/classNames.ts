/**
 * Şartname §15 — sınıf adı birleştirme yardımcısı.
 *
 * Bileşenler koşullu sınıf eklerken boş/`undefined` değerleri ayıklamak için
 * bunu kullanır; böylece `class="field  field--invalid"` gibi çift boşluklar
 * oluşmaz.
 */

/** Boş olmayan metinleri tek boşlukla birleştirir. */
export function joinClassNames(
  ...values: ReadonlyArray<string | false | null | undefined>
): string {
  return values
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .join(' ');
}

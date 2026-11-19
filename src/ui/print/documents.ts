/**
 * Şartname §12 — yazdırılabilir belgelerin listesi ve baskı seçenekleri.
 *
 * Altı belge §12 tablosundaki sırayla tanımlıdır (12.1–12.6). `#/yazdir`
 * sayfası bu listeyi kutulara çevirir ve seçilenleri belge sırasıyla basar.
 *
 * Varsayılan seçim, hanenin kendi belgeleridir; "Boş form" başkasına dağıtmak
 * için olduğundan (§5, §12.6) varsayılan olarak **işaretsizdir**.
 *
 * Sağlık bilgisi ve okul adı varsayılan olarak **kapalıdır** (İ8, §4.1 satır 20):
 * kullanıcı ayrı ayrı işaretlemedikçe hiçbir çıktıya girmez.
 */

/** §12 tablosundaki belge sırası. */
export const PRINT_DOCUMENT_IDS = [
  'fullPlan',
  'fridgeSheet',
  'walletCards',
  'childCards',
  'bagChecklist',
  'blankForm',
] as const;

export type PrintDocumentId = (typeof PRINT_DOCUMENT_IDS)[number];

/** Varsayılan olarak işaretli belgeler (§12.6 hariç). */
export const DEFAULT_PRINT_DOCUMENTS: readonly PrintDocumentId[] = [
  'fullPlan',
  'fridgeSheet',
  'walletCards',
  'childCards',
  'bagChecklist',
];

/** Baskı seçenekleri (§12.1 sağlık, §12.4 okul adı, §12.3 kan grubu ve not). */
export interface PrintOptions {
  /** Sağlık bilgilerini tam plana ekle (§12.1). */
  includeHealth: boolean;
  /** Okul adını çocuk kartına ekle (§12.4). */
  includeSchoolName: boolean;
  /** Cüzdan kartının arkasına kan grubunu bas (§12.3 — ayrı onay). */
  includeBloodType: boolean;
  /** Cüzdan kartının arkasına tek satır not bas (§12.3 — ayrı onay). */
  includeWalletNote: boolean;
}

/** Bütün hassas seçenekler kapalı başlar (İ8). */
export const DEFAULT_PRINT_OPTIONS: PrintOptions = {
  includeHealth: false,
  includeSchoolName: false,
  includeBloodType: false,
  includeWalletNote: false,
};

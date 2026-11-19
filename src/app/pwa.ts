/**
 * Şartname §16 — hizmet çalışanı güncelleme köprüsü.
 *
 * `main.tsx` üretim derlemesinde hizmet çalışanını kaydeder; yeni sürüm
 * hazır olduğunda bu modül üzerinden kabuğa olay duyurur. Kabuk "Yenile"
 * düğmesini gösterir ve **yalnızca kullanıcı bastığında** güncellemeyi uygular
 * (form doldururken veri kaybını önlemek için, §16).
 *
 * Bu köprü ayrı bir modülde durur çünkü `main.tsx` kabuğu, kabuk da güncelleme
 * eylemini kullanır; doğrudan içe aktarma döngüsel bağımlılık yaratırdı.
 */

/** Kabuğun dinlediği olay adı. */
export const UPDATE_READY_EVENT = 'ilk72:update-ready';

type UpdateApplier = (reloadPage?: boolean) => Promise<void>;

let applier: UpdateApplier | null = null;

/** `main.tsx` kaydettiği güncelleme işlevini buraya bağlar. */
export function setUpdateApplier(fn: UpdateApplier): void {
  applier = fn;
}

/** Yeni sürümün hazır olduğunu kabuğa duyurur (kendiliğinden yenileme yok). */
export function announceUpdateReady(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(UPDATE_READY_EVENT));
}

/** Kullanıcı "Yenile"ye bastığında çağrılır. */
export function applyServiceWorkerUpdate(): void {
  if (applier === null) return;
  void applier(true);
}

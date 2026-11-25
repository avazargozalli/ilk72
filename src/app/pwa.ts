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
type ReloadCheck = () => boolean | Promise<boolean>;

let applier: UpdateApplier | null = null;
let updateReady = false;
let controllerUpdated = false;
let reloadCheck: ReloadCheck | null = null;

/** Hizmet çalışanı, kabuk abone olmadan önce de hazır olabilir. */
export function isUpdateReady(): boolean {
  return updateReady;
}

/** `main.tsx` kaydettiği güncelleme işlevini buraya bağlar. */
export function setUpdateApplier(fn: UpdateApplier): void {
  applier = fn;
}

/** Yeni sürümün hazır olduğunu kabuğa duyurur (kendiliğinden yenileme yok). */
export function announceUpdateReady(): void {
  updateReady = true;
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(UPDATE_READY_EVENT));
}

/** Başka bir sekme güncellemeyi etkinleştirse bile yerel onayı bekler. */
export async function onServiceWorkerControlling(): Promise<void> {
  controllerUpdated = true;
  const canReload = reloadCheck;
  reloadCheck = null;
  if (canReload !== null && (await canReload())) {
    window.location.reload();
    return;
  }
  announceUpdateReady();
}

/** Kullanıcı "Yenile"ye bastığında çağrılır. */
export async function applyServiceWorkerUpdate(canReload: ReloadCheck): Promise<void> {
  if (applier === null) return;
  updateReady = false;
  reloadCheck = canReload;
  try {
    if (controllerUpdated) await onServiceWorkerControlling();
    else await applier(true);
  } catch (error) {
    reloadCheck = null;
    announceUpdateReady();
    throw error;
  }
}

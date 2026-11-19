/**
 * Vitest için `virtual:pwa-register` yerine geçen sahte modül.
 *
 * Üretimde bu modülü `vite-plugin-pwa` sağlar; birim/bileşen testleri Vite
 * geliştirme sunucusuna bağlanmadığı için `vitest.config.ts` içindeki takma ad
 * buraya yönlendirir. Hizmet çalışanı test ortamında kaydedilmez.
 */

export type UpdateApplier = (reloadPage?: boolean) => Promise<void>;

/** Test ortamında güncelleme yok; çağrı sessizce yok sayılır. */
export function registerSW(_options?: unknown): UpdateApplier {
  return async () => undefined;
}

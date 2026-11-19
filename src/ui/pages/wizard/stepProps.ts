/**
 * Şartname §11.4 — sihirbaz adım bileşenlerinin ortak sözleşmesi.
 *
 * Adımlar durumu kendileri tutmaz: plan ve değişiklik geri çağrısı yukarıdan
 * gelir, hata metinleri tek doğrulama modülünden (`validation.ts`) okunur.
 * Böylece "İleri" denetimi ile alan terk edildiğinde yapılan denetim aynı
 * kuralları kullanır (§11.4).
 */
import type { Plan } from '../../../model/types.ts';

export interface WizardStepProps {
  /** Mevcut plan (uygulama kabuğunda tutulur, sanitize edilmiştir). */
  plan: Plan;
  /** Her alan değişikliğinde yukarı akan yama. */
  onPatch: (patch: Partial<Plan>) => void;
  /** Alan kimliğine bağlı hata metni; hata yoksa `undefined`. */
  errorOf: (id: string) => string | undefined;
  /** Alan terk edilince doğrulama (§11.4). */
  onFieldBlur: (id: string) => void;
  /**
   * §11.5/9, §12 — "Takvimime ekle" (.ics) indirmesi. Gerçek dosya üretimi
   * çıktı katmanındadır; sihirbaz yalnızca niyeti iletir.
   */
  onDownloadIcs?: () => void;
}

/**
 * Şartname §11.4, §11.5 — sihirbazın adım tanımları.
 *
 * Dokuz adımın sırası, anahtarı ve bağlandığı rehber kartı **tek yerde** durur;
 * adım başlıkları ve "neden" açıklamaları `src/i18n/wizard.ts` içindedir.
 * `WIZARD_STEP_COUNT` `src/config.ts`'ten gelir (elle sayı yazılmaz).
 */
import { ROUTES, WIZARD_STEP_COUNT } from '../../../config.ts';

/** Sihirbaz adımı, 1 tabanlı (§11.1 `#/plan/1` … `#/plan/9`). */
export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/** `tr.wizard.steps` altındaki anahtar; adım sırasıyla aynıdır. */
export type WizardStepKey =
  | 'household'
  | 'members'
  | 'needs'
  | 'contacts'
  | 'meeting'
  | 'home'
  | 'roles'
  | 'bag'
  | 'review';

/** §11.4 — adımın "varsa ilgili rehber kartı" bağlantısı. */
export type GuideLink = 'once' | 'an' | 'sonra' | 'all';

export interface WizardStepDefinition {
  step: WizardStep;
  key: WizardStepKey;
  guide: GuideLink;
}

/** §11.5 tablosunun sırası; `WIZARD_STEP_COUNT` ile tutarlı olmalıdır. */
export const WIZARD_STEPS: Readonly<Record<WizardStep, WizardStepDefinition>> = {
  1: { step: 1, key: 'household', guide: 'once' },
  2: { step: 2, key: 'members', guide: 'once' },
  3: { step: 3, key: 'needs', guide: 'once' },
  4: { step: 4, key: 'contacts', guide: 'sonra' },
  5: { step: 5, key: 'meeting', guide: 'sonra' },
  6: { step: 6, key: 'home', guide: 'an' },
  7: { step: 7, key: 'roles', guide: 'once' },
  8: { step: 8, key: 'bag', guide: 'once' },
  9: { step: 9, key: 'review', guide: 'once' },
};

/** Adım numarasını geçerli aralığa (1…9) indirger; geçersizse 1 döner. */
export function clampStep(value: number | undefined): WizardStep {
  if (value === undefined || !Number.isInteger(value)) return 1;
  if (value < 1) return 1;
  if (value > WIZARD_STEP_COUNT) return WIZARD_STEP_COUNT as WizardStep;
  return value as WizardStep;
}

/** Bir sonraki adım; son adımda son adım döner. */
export function nextStep(step: WizardStep): WizardStep {
  return clampStep(step + 1);
}

/** Adımın tanımı. */
export function stepDefinition(step: WizardStep): WizardStepDefinition {
  return WIZARD_STEPS[step];
}

/** §11.4 — rehber kartı bağlantısının `#` adresi. */
export function guideHref(link: GuideLink): string {
  if (link === 'all') return ROUTES.guide;
  return ROUTES.guidePart(link);
}

/**
 * Şartname §11.4 — sihirbaz adım göstergesi.
 *
 * Biçim: **"3 / 9 — Özel ihtiyaçlar"**. Geçerli adım `aria-current="step"`
 * ile işaretlenir (§15); ekran okuyucu hangi adımda olduğunu söyler.
 * Adım başlığı i18n'den gelir (`tr.wizard.*`, sihirbazı yazan ajan doldurur).
 */
import { formatText, tr } from '../../i18n/tr.ts';
import { joinClassNames } from './classNames.ts';

export interface StepperProps {
  /** Geçerli adım, 1'den başlar. */
  step: number;
  /** Toplam adım sayısı (`WIZARD_STEP_COUNT`, §11.4). */
  total: number;
  /** Adımın Türkçe başlığı. */
  title: string;
  class?: string;
}

export function Stepper({ step, total, title, class: className }: StepperProps) {
  return (
    <p class={joinClassNames('stepper', className)} aria-current="step">
      <span class="stepper__position">
        {formatText(tr.components.stepper.position, { step, total })}
      </span>
      {' — '}
      <span class="stepper__title">{title}</span>
    </p>
  );
}

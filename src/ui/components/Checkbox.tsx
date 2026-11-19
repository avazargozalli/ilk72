/**
 * Şartname §11.5, §15 — onay kutusu.
 *
 * Etiket, kutunun kendisine bağlıdır (sarmalayan `label`); ipucu metni
 * `aria-describedby` ile ilişkilendirilir. Klavyeyle (boşluk tuşu) ve
 * ekran okuyucuyla kullanılabilir; dokunma hedefi CSS'te en az 44 × 44 px'tir
 * (§15).
 */
import { useAutoId } from './a11y.ts';
import { joinClassNames } from './classNames.ts';

export interface CheckboxProps {
  /** Görünen etiket metni (i18n'den). */
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  /** Etiketin altındaki kısa açıklama. */
  hint?: string;
  disabled?: boolean;
  class?: string;
  /** Dışarıdan ek açıklama bağlantısı (ör. `Field`). */
  'aria-describedby'?: string;
  /** Dışarıdan hata durumu (ör. `Field`). */
  'aria-invalid'?: 'true';
}

export function Checkbox({
  label,
  checked,
  onChange,
  id,
  hint,
  disabled = false,
  class: className,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
}: CheckboxProps) {
  const generatedId = useAutoId('checkbox');
  const controlId = id ?? generatedId;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const description = [describedBy, hintId]
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .join(' ');

  return (
    <div class={joinClassNames('checkbox', className)}>
      <label class="checkbox__label" for={controlId}>
        <input
          class="checkbox__input"
          id={controlId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          aria-describedby={description.length > 0 ? description : undefined}
          aria-invalid={invalid}
          onChange={(event) => onChange(event.currentTarget.checked)}
        />
        <span class="checkbox__text">{label}</span>
      </label>
      {hint ? (
        <p class="checkbox__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

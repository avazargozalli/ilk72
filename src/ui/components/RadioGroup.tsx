/**
 * Şartname §15 — radyo düğmesi grubu.
 *
 * Grup `fieldset` + `legend` ile anlamlı biçimde adlandırılır; ipucu ve hata
 * metinleri `aria-describedby` ile gruba bağlanır. Seçeneklerin her biri
 * `label` ile kendi düğmesine bağlıdır; klavyede ok tuşları tarayıcının
 * kendi davranışıyla çalışır.
 */
import { tr } from '../../i18n/tr.ts';
import { useAutoId } from './a11y.ts';
import { joinClassNames } from './classNames.ts';

export interface RadioOption {
  value: string;
  label: string;
  /** Seçenek altındaki kısa açıklama. */
  hint?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** Grup başlığı (`legend`). */
  legend: string;
  /** Bütün seçenekler için ortak `name`. */
  name: string;
  /** Seçili değer; hiçbiri seçili değilse `null`. */
  value: string | null;
  onChange: (value: string) => void;
  options: readonly RadioOption[];
  hint?: string;
  /** Grup hatası; seçenekler `aria-invalid` olur ve hata metni gruba bağlanır. */
  error?: string;
  required?: boolean;
  /** Seçeneklerin yerleşimi (CSS). */
  direction?: 'vertical' | 'horizontal';
  id?: string;
  class?: string;
}

export function RadioGroup({
  legend,
  name,
  value,
  onChange,
  options,
  hint,
  error,
  required = false,
  direction = 'vertical',
  id,
  class: className,
}: RadioGroupProps) {
  const generatedId = useAutoId('radio-group');
  const baseId = id ?? generatedId;
  const hintId = hint ? `${baseId}-hint` : undefined;
  const errorId = error ? `${baseId}-error` : undefined;
  const describedBy = [hintId, errorId]
    .filter((value): value is string => typeof value === 'string')
    .join(' ');

  return (
    <fieldset
      class={joinClassNames(
        'radio-group',
        `radio-group--${direction}`,
        error ? 'radio-group--invalid' : undefined,
        className,
      )}
      aria-describedby={describedBy.length > 0 ? describedBy : undefined}
    >
      <legend class="radio-group__legend">
        {legend}
        {required ? (
          <span class="radio-group__required">{` ${tr.components.field.required}`}</span>
        ) : null}
      </legend>
      {hint ? (
        <p class="radio-group__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      <div class="radio-group__options">
        {options.map((option, index) => {
          const optionId = `${baseId}-option-${index}`;
          const optionHintId = option.hint ? `${optionId}-hint` : undefined;
          return (
            <div class="radio-option" key={option.value}>
              <label class="radio-option__label" for={optionId}>
                <input
                  class="radio-option__input"
                  id={optionId}
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  disabled={option.disabled ?? false}
                  aria-describedby={optionHintId}
                  aria-invalid={error ? 'true' : undefined}
                  onChange={() => onChange(option.value)}
                />
                <span class="radio-option__text">{option.label}</span>
              </label>
              {option.hint ? (
                <p class="radio-option__hint" id={optionHintId}>
                  {option.hint}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
      {error ? (
        <p class="radio-group__error" id={errorId}>
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

/**
 * Şartname §11.4, §15 — etiket + ipucu + hata bağlantısı.
 *
 * `Field` yalnızca görsel kabuk değildir: etiketi denetime bağlar, ipucu ve
 * hata iletisini `aria-describedby` ile aynı denetime iliştirir, hata varsa
 * `aria-invalid`, zorunluysa `aria-required` verir. Zorunluluk renkle değil
 * metinle ("(zorunlu)") belirtilir (§15).
 *
 * Kullanım:
 * ```tsx
 * <Field label={tr…} hint={…} error={…} required>
 *   <TextInput value={value} onInput={setValue} />
 * </Field>
 * ```
 */
import type { ComponentChildren } from 'preact';
import { cloneElement, isValidElement } from 'preact';
import { tr } from '../../i18n/tr.ts';
import { useAutoId } from './a11y.ts';
import { joinClassNames } from './classNames.ts';

/** `Field`'in denetime enjekte ettiği erişilebilirlik bağlantıları. */
interface FieldControlProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: 'true';
  'aria-required'?: 'true';
}

export interface FieldProps {
  /** Görünen etiket metni (i18n'den). */
  label: string;
  /** Denetimin kimliği; verilmezse üretilir. */
  id?: string;
  /** Alan altındaki kısa açıklama. */
  hint?: string;
  /** Alan altında gösterilen hata iletisi; varsa denetim `aria-invalid` olur. */
  error?: string;
  /** Zorunlu alan işareti ("(zorunlu)") ve `aria-required`. */
  required?: boolean;
  /** Tek bir denetim öğesi (ör. `TextInput`, `PhoneInput`). */
  children?: ComponentChildren;
  class?: string;
}

function propsOf(child: ComponentChildren): Record<string, unknown> | null {
  if (!isValidElement(child)) return null;
  return child.props as Record<string, unknown>;
}

function textProp(child: ComponentChildren, name: string): string | undefined {
  const value = propsOf(child)?.[name];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

/** Boş olmayan kimlikleri tek boşlukla birleştirir (`aria-describedby` değeri). */
function joinIds(ids: ReadonlyArray<string | undefined>): string | undefined {
  const joined = ids
    .filter((id): id is string => typeof id === 'string' && id.length > 0)
    .join(' ');
  return joined.length > 0 ? joined : undefined;
}

export function Field({
  label,
  id,
  hint,
  error,
  required = false,
  children,
  class: className,
}: FieldProps) {
  const generatedId = useAutoId('field');
  const controlId = textProp(children, 'id') ?? id ?? generatedId;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = joinIds([textProp(children, 'aria-describedby'), hintId, errorId]);

  const controlProps: FieldControlProps = {
    id: controlId,
    'aria-describedby': describedBy,
    'aria-invalid': error ? 'true' : undefined,
    'aria-required': required ? 'true' : undefined,
  };
  // Denetim bir VNode ise bağlantılar kopyalanarak enjekte edilir; düz metin
  // ya da çoklu çocuk verilirse dokunulmaz (etiket yine denetime bağlıdır).
  const control = isValidElement(children) ? cloneElement(children, controlProps) : children;

  return (
    <div class={joinClassNames('field', error ? 'field--invalid' : undefined, className)}>
      <label class="field__label" for={controlId}>
        {label}
        {required ? (
          <span class="field__required">{` ${tr.components.field.required}`}</span>
        ) : null}
      </label>
      {hint ? (
        <p class="field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      {control}
      {error ? (
        <p class="field__error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

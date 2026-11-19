/**
 * Şartname §11.4, §15 — sihirbazın ortak alan sarmalayıcıları.
 *
 * `Field` etiketi denetime bağlar, ipucu ve hata iletisini `aria-describedby`
 * ile iliştirir (§15). Buradaki sarmalayıcılar yalnızca `Field`'i ilgili
 * denetimle eşleştirir; hiçbir metin gömmez (metinler `tr.wizard.*`).
 *
 * `SelectField`, `TextAreaField` ve `DateField` bileşen kitaplığında hazır
 * olmadığı için burada yazılmıştır; `Field` her denetim öğesiyle çalışır.
 */

import { tr } from '../../../i18n/tr.ts';
import { PLAN_LIMITS } from '../../../model/validate.ts';
import { Checkbox, Field, PhoneInput, TextInput } from '../../components/index.ts';

/** Ortak alan kabuğu: etiket, ipucu ve hata. */
interface BaseFieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  onBlur?: () => void;
}

export interface TextFieldProps extends BaseFieldProps {
  value: string;
  maxLength?: number;
  autocomplete?: string;
  inputMode?: 'text' | 'numeric' | 'tel' | 'email' | 'url' | 'search';
  onInput: (value: string) => void;
}

export function TextField({
  id,
  label,
  hint,
  error,
  onBlur,
  value,
  maxLength,
  autocomplete,
  inputMode,
  onInput,
}: TextFieldProps) {
  return (
    <Field label={label} id={id} hint={hint} error={error}>
      <TextInput
        value={value}
        maxLength={maxLength}
        autocomplete={autocomplete}
        inputMode={inputMode}
        onInput={onInput}
        onBlur={onBlur}
      />
    </Field>
  );
}

export interface PhoneFieldProps extends BaseFieldProps {
  value: string;
  onInput: (value: string) => void;
}

export function PhoneField({ id, label, hint, error, onBlur, value, onInput }: PhoneFieldProps) {
  return (
    <Field label={label} id={id} hint={hint} error={error}>
      <PhoneInput value={value} onInput={onInput} onBlur={onBlur} />
    </Field>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps extends BaseFieldProps {
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
}

export function SelectField({
  id,
  label,
  hint,
  error,
  onBlur,
  value,
  options,
  onChange,
}: SelectFieldProps) {
  return (
    <Field label={label} id={id} hint={hint} error={error}>
      <select
        class="text-input"
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        onBlur={onBlur}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export interface DateFieldProps extends BaseFieldProps {
  value: string;
  onInput: (value: string) => void;
}

/** Tarih alanı: tarayıcının kendi takvim denetimi; değer `YYYY-AA-GG` (§8.2). */
export function DateField({ id, label, hint, error, onBlur, value, onInput }: DateFieldProps) {
  return (
    <Field label={label} id={id} hint={hint} error={error}>
      <input
        class="text-input"
        type="date"
        value={value}
        onInput={(event) => onInput(event.currentTarget.value)}
        onBlur={onBlur}
      />
    </Field>
  );
}

export interface TextAreaFieldProps extends BaseFieldProps {
  value: string;
  maxLength?: number;
  rows?: number;
  onInput: (value: string) => void;
}

/** Çok satırlı metin (`notes` ve sağlık metinleri 500 karakter, §8.2). */
export function TextAreaField({
  id,
  label,
  hint,
  error,
  onBlur,
  value,
  maxLength,
  rows = 3,
  onInput,
}: TextAreaFieldProps) {
  return (
    <Field label={label} id={id} hint={hint} error={error}>
      <textarea
        class="text-input"
        value={value}
        maxLength={maxLength}
        rows={rows}
        onInput={(event) => onInput(event.currentTarget.value)}
        onBlur={onBlur}
      />
    </Field>
  );
}

export interface CompactNoteFieldProps {
  id: string;
  /** Ekran okuyucu etiketi; görsel olarak gizlenir (§15). */
  label: string;
  value: string;
  maxLength?: number;
  error?: string;
  onInput: (value: string) => void;
  onBlur?: () => void;
}

/**
 * Liste maddesi altındaki kısa not alanı: görsel kalabalık olmasın diye
 * etiketi gizlidir ama erişilebilir adı vardır. Hata metni görünür kalır.
 */
export function CompactNoteField({
  id,
  label,
  value,
  maxLength = PLAN_LIMITS.shortTextLength,
  error,
  onInput,
  onBlur,
}: CompactNoteFieldProps) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div class="field">
      <label class="visually-hidden" for={id}>
        {label}
      </label>
      <input
        class="text-input"
        id={id}
        type="text"
        value={value}
        maxLength={maxLength}
        placeholder={tr.wizard.fields.notePlaceholder}
        aria-describedby={errorId}
        aria-invalid={error ? 'true' : undefined}
        onInput={(event) => onInput(event.currentTarget.value)}
        onBlur={onBlur}
      />
      {error ? (
        <p class="field__error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export interface ChecklistRowProps {
  id: string;
  text: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  noteValue: string;
  onNoteInput: (value: string) => void;
  onNoteBlur?: () => void;
  noteError?: string;
}

/** §11.5/8 — "Her madde için kutu + kısa not". */
export function ChecklistRow({
  id,
  text,
  checked,
  onCheckedChange,
  noteValue,
  onNoteInput,
  onNoteBlur,
  noteError,
}: ChecklistRowProps) {
  return (
    <div>
      <Checkbox label={text} checked={checked} onChange={onCheckedChange} />
      <CompactNoteField
        id={`${id}-note`}
        label={`${text} — ${tr.wizard.fields.notePlaceholder}`}
        value={noteValue}
        error={noteError}
        onInput={onNoteInput}
        onBlur={onNoteBlur}
      />
    </div>
  );
}

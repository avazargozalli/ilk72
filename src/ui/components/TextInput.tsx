/**
 * Şartname §11.4, §15, §17 — tek satırlık metin alanı.
 *
 * Denetimli bileşendir: değer her zaman üst bileşenden gelir (`value`) ve
 * değişiklik `onInput` ile bildirilir. Erişilebilirlik bağlantıları
 * (`aria-describedby`, `aria-invalid`, `aria-required`) `Field` tarafından
 * enjekte edilir; doğrudan kullanıldığında da geçerli olur.
 *
 * Kullanıcı verisi DOM'a yalnızca metin değeri olarak girer; HTML olarak
 * yorumlanmaz (§17).
 */
import type { JSX } from 'preact';
import { joinClassNames } from './classNames.ts';

/** Desteklenen giriş tipleri; arama/dış bağlantı alanları için `url`/`search`. */
export type TextInputType = 'text' | 'email' | 'search' | 'url' | 'tel';

export interface TextInputProps {
  id?: string;
  /** Görünen değer (temizlenmiş metin). */
  value: string;
  /** Her değişiklikte yeni değer. */
  onInput: (value: string) => void;
  /** Alan terk edildiğinde (doğrulama için, §11.4). */
  onBlur?: () => void;
  type?: TextInputType;
  name?: string;
  maxLength?: number;
  /** Tarayıcı otomatik doldurma ipucu (ör. `"tel"`, `"off"`). */
  autocomplete?: string;
  inputMode?: 'text' | 'numeric' | 'tel' | 'email' | 'url' | 'search';
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  class?: string;
  /** `Field` enjekte eder. */
  'aria-describedby'?: string;
  /** `Field` enjekte eder. */
  'aria-invalid'?: 'true';
  /** `Field` enjekte eder. */
  'aria-required'?: 'true';
}

export function TextInput({
  id,
  value,
  onInput,
  onBlur,
  type = 'text',
  name,
  maxLength,
  autocomplete,
  inputMode,
  placeholder,
  disabled = false,
  required = false,
  class: className,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  'aria-required': ariaRequired,
}: TextInputProps) {
  // Preact 11, `input` niteliklerini `type` değerine göre ayrımlı birleşim
  // olarak tipler. Dinamik `type` değerini geçirmek için nitelik nesnesi hedef
  // tipe daraltılır; çalışma zamanı değeri değişmez.
  const inputProps = {
    class: joinClassNames('text-input', className),
    id,
    name,
    type,
    value,
    maxLength,
    autocomplete,
    inputMode,
    placeholder,
    disabled,
    required,
    'aria-describedby': describedBy,
    'aria-invalid': invalid,
    'aria-required': ariaRequired,
    onInput: (event: Event) => onInput((event.currentTarget as HTMLInputElement).value),
    onBlur: onBlur ? () => onBlur() : undefined,
  } as unknown as JSX.IntrinsicElements['input'];

  return <input {...inputProps} />;
}

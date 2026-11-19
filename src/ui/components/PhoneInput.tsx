/**
 * Şartname §8.2, §11.5, §15 — telefon alanı.
 *
 * Alan yalnızca **rakam, boşluk, `+`, `-`, `(`, `)`** karakterlerini kabul
 * eder (Şartname §8.2); başka karakterler yazıldığında ya da yapıştırıldığında
 * süzülür ve değer en çok 20 karakter olur. `inputMode="tel"` mobil klavyeyi,
 * `autocomplete="tel"` tarayıcı otomatik doldurmasını yönlendirir.
 *
 * Telefon numarası biçimi **zorlanmaz**: numara türü (sabit/mobil) ve alan
 * kodu kullanıcıya bırakılır; uygulama numara doğrulamaz, yalnızca karakter
 * kümesini ve uzunluğu sınırlar.
 */
import { joinClassNames } from './classNames.ts';
import { TextInput } from './TextInput.tsx';

/** Şartname §8.2 — telefon alanının üst sınırı. */
export const PHONE_MAX_LENGTH = 20;

const ALLOWED_PHONE_CHARACTERS: ReadonlySet<string> = new Set('0123456789+()- ');

/**
 * Telefon metnini §8.2 karakter kümesine ve 20 karakter sınırına indirger.
 * Süzme sırası korunur; böylece kullanıcının yazdığı sıra değişmez.
 */
export function sanitizePhoneInput(value: string): string {
  let result = '';
  for (const character of value) {
    if (ALLOWED_PHONE_CHARACTERS.has(character)) {
      result += character;
      if (result.length >= PHONE_MAX_LENGTH) break;
    }
  }
  return result;
}

export interface PhoneInputProps {
  id?: string;
  value: string;
  onInput: (value: string) => void;
  onBlur?: () => void;
  name?: string;
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

export function PhoneInput({
  id,
  value,
  onInput,
  onBlur,
  name,
  placeholder,
  disabled = false,
  required = false,
  class: className,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  'aria-required': ariaRequired,
}: PhoneInputProps) {
  return (
    <TextInput
      id={id}
      class={joinClassNames('phone-input', className)}
      type="tel"
      inputMode="tel"
      autocomplete="tel"
      maxLength={PHONE_MAX_LENGTH}
      name={name}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      aria-describedby={describedBy}
      aria-invalid={invalid}
      aria-required={ariaRequired}
      onBlur={onBlur}
      onInput={(next) => onInput(sanitizePhoneInput(next))}
    />
  );
}

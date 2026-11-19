/**
 * Şartname §8.2, §15, §18.1 — `PhoneInput`.
 *
 * Ölçütler: yalnızca izinli karakterler (`0-9`, `+`, `-`, `(`, `)`, boşluk),
 * 20 karakter sınırı, `inputMode="tel"` ve `autocomplete="tel"`.
 */
import { fireEvent, render, screen } from '@testing-library/preact';
import { useState } from 'preact/hooks';
import { describe, expect, it } from 'vitest';
import { PHONE_MAX_LENGTH, PhoneInput, sanitizePhoneInput } from '../../src/ui/components/index.ts';
import { asInputElement } from './helpers.tsx';

function PhoneHarness() {
  const [value, setValue] = useState('');
  return <PhoneInput value={value} onInput={setValue} />;
}

function renderPhone(): HTMLInputElement {
  render(<PhoneHarness />);
  return asInputElement(screen.getByRole('textbox'));
}

describe('PhoneInput', () => {
  it('telefon klavyesi ve otomatik doldurma ipuçlarını verir', () => {
    const input = renderPhone();

    expect(input.getAttribute('type')).toBe('tel');
    expect(input.getAttribute('inputmode')).toBe('tel');
    expect(input.getAttribute('autocomplete')).toBe('tel');
    expect(input.getAttribute('maxlength')).toBe(String(PHONE_MAX_LENGTH));
    expect(PHONE_MAX_LENGTH).toBe(20);
  });

  it('§8.2 karakter kümesi dışındaki karakterleri süzer', () => {
    const input = renderPhone();

    fireEvent.input(input, { target: { value: '0555 abc!+' } });

    expect(input.value).toBe('0555 +');
  });

  it('Türkçe harfleri ve denetim karakterlerini kaldırır', () => {
    expect(sanitizePhoneInput('05şş5 ğü')).toBe('055 ');
    expect(sanitizePhoneInput('0212\n555\t12')).toBe('021255512');
    expect(sanitizePhoneInput('<script>')).toBe('');
  });

  it('biçimlendirmeyi olduğu gibi korur, 20 karakterde keser', () => {
    expect(sanitizePhoneInput('+90 (532) 111 22 33')).toBe('+90 (532) 111 22 33');
    expect(sanitizePhoneInput('1'.repeat(30))).toBe('1'.repeat(PHONE_MAX_LENGTH));

    const input = renderPhone();
    fireEvent.input(input, { target: { value: '2'.repeat(30) } });

    expect(input.value).toBe('2'.repeat(PHONE_MAX_LENGTH));
  });
});

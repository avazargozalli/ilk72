/**
 * Şartname §11.4, §15, §18.1 — `Field` ve `TextInput`.
 *
 * Ölçütler: etiket denetime bağlı; ipucu ve hata `aria-describedby` ile
 * ilişkili; hata metni alanın altında; zorunluluk renkle değil metinle.
 */
import { fireEvent, render, screen } from '@testing-library/preact';
import { describe, expect, it, vi } from 'vitest';
import { tr } from '../../src/i18n/tr.ts';
import { Field, TextInput } from '../../src/ui/components/index.ts';
import { inputByLabelText, normalizeText } from './helpers.tsx';

const requiredMarker = tr.components.field.required;

describe('Field', () => {
  it('etiketi denetime bağlar ve zorunluluğu metinle belirtir', () => {
    render(
      <Field label="Ad" required>
        <TextInput value="" onInput={() => undefined} />
      </Field>,
    );

    const input = inputByLabelText(`Ad ${requiredMarker}`);

    expect(input.getAttribute('aria-required')).toBe('true');
    expect(normalizeText(screen.getByText(tr.components.field.required).textContent)).toBe(
      requiredMarker,
    );
  });

  it('ipucu ve hata iletisini aria-describedby ile denetime bağlar', () => {
    render(
      <Field label="Telefon" hint="Yalnızca rakam ve boşluk" error="Telefon numarası çok kısa">
        <TextInput value="" onInput={() => undefined} />
      </Field>,
    );

    const input = inputByLabelText('Telefon');
    const hintId = screen.getByText('Yalnızca rakam ve boşluk').id;
    const errorId = screen.getByText('Telefon numarası çok kısa').id;
    const describedBy = (input.getAttribute('aria-describedby') ?? '').split(' ');

    expect(describedBy).toContain(hintId);
    expect(describedBy).toContain(errorId);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    // §11.4: hata iletisi alanın altında durur.
    expect(input.nextElementSibling?.id).toBe(errorId);
  });

  it('hatasız alanda aria-invalid taşımaz ve hata metni çizmez', () => {
    render(
      <Field label="Ad">
        <TextInput value="Ayşe" onInput={() => undefined} />
      </Field>,
    );

    const input = inputByLabelText('Ad');

    expect(input.hasAttribute('aria-invalid')).toBe(false);
    expect(input.hasAttribute('aria-required')).toBe(false);
    expect(screen.queryByText('Ad', { selector: '.field__error' })).toBeNull();
  });

  it('denetimin kendi kimliğini ve açıklamasını korur', () => {
    render(
      <Field label="Ad" hint="Kısa yazın">
        <TextInput id="member-name" value="" onInput={() => undefined} aria-describedby="extra" />
      </Field>,
    );

    const input = inputByLabelText('Ad');
    const describedBy = (input.getAttribute('aria-describedby') ?? '').split(' ');

    expect(input.id).toBe('member-name');
    expect(describedBy[0]).toBe('extra');
    expect(describedBy).toContain(screen.getByText('Kısa yazın').id);
  });
});

describe('TextInput', () => {
  it('yazılan değeri iletir', () => {
    const onInput = vi.fn();
    render(<TextInput value="" onInput={onInput} />);

    const input = screen.getByRole('textbox');
    fireEvent.input(input, { target: { value: 'Ayşe' } });

    expect(onInput).toHaveBeenCalledWith('Ayşe');
  });

  it('alan terk edilince onBlur çağırır', () => {
    const onBlur = vi.fn();
    render(<TextInput value="" onInput={() => undefined} onBlur={onBlur} />);

    fireEvent.blur(screen.getByRole('textbox'));

    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('tip, uzunluk ve otomatik doldurma niteliklerini geçirir', () => {
    render(
      <TextInput
        value=""
        onInput={() => undefined}
        type="search"
        maxLength={60}
        autocomplete="off"
        inputMode="search"
      />,
    );

    const input = screen.getByRole('searchbox');

    expect(input.getAttribute('maxlength')).toBe('60');
    expect(input.getAttribute('autocomplete')).toBe('off');
    expect(input.getAttribute('inputmode')).toBe('search');
  });
});

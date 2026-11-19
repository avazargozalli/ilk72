/**
 * Şartname §11.4, §15, §18.1 — `ErrorSummary`.
 *
 * Ölçütler: hata sayısını yazan `role="alert"` özeti; her hata için ilgili
 * alana odaklanan bağlantı; adres çubuğu değişmez.
 */
import { fireEvent, render, screen } from '@testing-library/preact';
import { useState } from 'preact/hooks';
import { describe, expect, it } from 'vitest';
import { formatText, tr } from '../../src/i18n/tr.ts';
import {
  ErrorSummary,
  type ErrorSummaryItem,
  Field,
  TextInput,
} from '../../src/ui/components/index.ts';
import { normalizeText } from './helpers.tsx';

const NAME_ID = 'member-name';
const ERRORS: readonly ErrorSummaryItem[] = [
  { id: NAME_ID, message: 'Ad yazın' },
  { id: 'member-phone', message: 'Telefon çok kısa' },
];

function FormHarness({ errors }: { errors: readonly ErrorSummaryItem[] }) {
  const [name, setName] = useState('');
  return (
    <div>
      <ErrorSummary errors={errors} />
      <Field label="Ad" error={errors[0]?.message}>
        <TextInput id={NAME_ID} value={name} onInput={setName} />
      </Field>
    </div>
  );
}

describe('ErrorSummary', () => {
  it('hata sayısını ve her hata için bağlantı çizer', () => {
    render(<ErrorSummary errors={ERRORS} />);

    const summary = screen.getByRole('alert');
    const expectedTitle = formatText(tr.components.errorSummary.title, {
      count: ERRORS.length,
    });

    expect(normalizeText(summary.textContent)).toContain(expectedTitle);
    expect(summary.getAttribute('tabindex')).toBe('-1');
    expect(screen.getAllByRole('link')).toHaveLength(ERRORS.length);
    expect(screen.getByText(ERRORS[1]?.message ?? '')).not.toBeNull();
  });

  it('hatasızken hiçbir şey çizmez', () => {
    render(<ErrorSummary errors={[]} />);

    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('başlık verilirse onu kullanır', () => {
    render(<ErrorSummary errors={ERRORS} title="Düzeltilecek alanlar" />);

    expect(screen.getByRole('heading', { name: 'Düzeltilecek alanlar' })).not.toBeNull();
  });

  it('bağlantıya tıklanınca ilgili alana odaklanır', () => {
    render(<FormHarness errors={ERRORS} />);

    fireEvent.click(screen.getByRole('link', { name: ERRORS[0]?.message ?? '' }));

    expect(document.activeElement?.id).toBe(NAME_ID);
    expect(window.location.hash).toBe('');
  });

  it('focusOnMount ile özetin kendisine odaklanır', () => {
    render(<ErrorSummary errors={ERRORS} focusOnMount />);

    expect(document.activeElement).toBe(screen.getByRole('alert'));
  });
});

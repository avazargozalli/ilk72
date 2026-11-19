/**
 * Şartname §11.5, §15, §18.1 — `Checkbox` ve `RadioGroup`.
 *
 * Ölçütler: etiket bağı, seçim değişikliğinin bildirilmesi, ipucu ve hata
 * metinlerinin grupla ilişkilendirilmesi, zorunluluk işaretinin metinle
 * verilmesi.
 */
import { fireEvent, render, screen } from '@testing-library/preact';
import { useState } from 'preact/hooks';
import { describe, expect, it, vi } from 'vitest';
import { tr } from '../../src/i18n/tr.ts';
import { Checkbox, RadioGroup, type RadioOption } from '../../src/ui/components/index.ts';
import { asInputElement } from './helpers.tsx';

const requiredMarker = tr.components.field.required;

const GROUP_OPTIONS: readonly RadioOption[] = [
  { value: 'yetiskin', label: 'Yetişkin' },
  { value: 'cocuk', label: 'Çocuk' },
  { value: 'bebek', label: 'Bebek' },
];

describe('Checkbox', () => {
  it('etiketiyle bulunur ve işaretlenince değişikliği bildirir', () => {
    const onChange = vi.fn();
    function Harness() {
      const [checked, setChecked] = useState(false);
      return (
        <Checkbox
          label="Kapıları kontrol et"
          checked={checked}
          onChange={(next) => {
            onChange(next);
            setChecked(next);
          }}
        />
      );
    }
    render(<Harness />);

    const checkbox = screen.getByRole('checkbox', { name: 'Kapıları kontrol et' });
    fireEvent.click(checkbox);

    expect(onChange).toHaveBeenCalledWith(true);
    expect(asInputElement(checkbox).checked).toBe(true);
  });

  it('ipucunu aria-describedby ile bağlar', () => {
    render(
      <Checkbox
        label="Sağlık bilgisi"
        hint="İsteğe bağlı"
        checked={false}
        onChange={() => undefined}
      />,
    );

    const checkbox = screen.getByRole('checkbox', { name: 'Sağlık bilgisi' });
    const hintId = screen.getByText('İsteğe bağlı').id;

    expect(checkbox.getAttribute('aria-describedby')).toBe(hintId);
  });

  it('devre dışıyken değişiklik bildirmez', () => {
    const onChange = vi.fn();
    render(<Checkbox label="Kapalı kutu" checked={false} disabled onChange={onChange} />);

    fireEvent.click(screen.getByRole('checkbox', { name: 'Kapalı kutu' }));

    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('RadioGroup', () => {
  function GroupHarness() {
    const [value, setValue] = useState<string | null>(null);
    return (
      <RadioGroup
        legend="Kimin için?"
        name="group"
        value={value}
        onChange={setValue}
        options={GROUP_OPTIONS}
      />
    );
  }

  it('grubu legend ile adlandırır ve seçimi bildirir', () => {
    render(<GroupHarness />);

    const group = screen.getByRole('group', { name: 'Kimin için?' });
    expect(group.tagName).toBe('FIELDSET');
    expect(screen.getAllByRole('radio')).toHaveLength(GROUP_OPTIONS.length);

    const child = screen.getByRole('radio', { name: 'Çocuk' });
    fireEvent.click(child);

    expect(asInputElement(child).checked).toBe(true);
    expect(asInputElement(screen.getByRole('radio', { name: 'Yetişkin' })).checked).toBe(false);
  });

  it('zorunluluk işaretini metinle ve hata metnini grupla bağlar', () => {
    render(
      <RadioGroup
        legend="Sigorta"
        name="insurance"
        value={null}
        onChange={() => undefined}
        options={GROUP_OPTIONS}
        required
        error="Bir seçenek işaretleyin"
      />,
    );

    const group = screen.getByRole('group', { name: `Sigorta ${requiredMarker}` });
    const errorId = screen.getByText('Bir seçenek işaretleyin').id;

    expect(group.getAttribute('aria-describedby')).toBe(errorId);
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio.getAttribute('aria-invalid')).toBe('true');
    }
  });

  it('ipucu metnini de gruba bağlar', () => {
    render(
      <RadioGroup
        legend="Grup"
        name="hint-group"
        value="yetiskin"
        onChange={() => undefined}
        options={GROUP_OPTIONS}
        hint="Bir kişi seçin"
      />,
    );

    const group = screen.getByRole('group', { name: 'Grup' });
    const hintId = screen.getByText('Bir kişi seçin').id;

    expect(group.getAttribute('aria-describedby')).toBe(hintId);
  });
});

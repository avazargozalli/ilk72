/**
 * Şartname §11.4, §15, §18.1 — `Stepper`.
 *
 * Ölçüt: "3 / 9 — Özel ihtiyaçlar" biçimi ve `aria-current="step"`.
 */
import { render, screen } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { formatText, tr } from '../../src/i18n/tr.ts';
import { Stepper } from '../../src/ui/components/index.ts';
import { normalizeText } from './helpers.tsx';

describe('Stepper', () => {
  it('adım konumunu "3 / 9" biçiminde yazar', () => {
    render(<Stepper step={3} total={9} title="Özel ihtiyaçlar" />);

    const position = screen.getByText(
      formatText(tr.components.stepper.position, { step: 3, total: 9 }),
    );

    expect(position.textContent).toBe('3 / 9');
  });

  it('geçerli adımı aria-current="step" ile işaretler', () => {
    render(<Stepper step={3} total={9} title="Özel ihtiyaçlar" />);

    const position = screen.getByText(
      formatText(tr.components.stepper.position, { step: 3, total: 9 }),
    );
    const marked = position.closest('[aria-current="step"]');

    expect(marked).not.toBeNull();
    expect(normalizeText(marked?.textContent)).toBe('3 / 9 — Özel ihtiyaçlar');
  });

  it('adım başlığını ve konumu tek satırda birleştirir', () => {
    render(<Stepper step={1} total={9} title="Haneniz" />);

    const stepper = document.querySelector('.stepper');

    expect(normalizeText(stepper?.textContent)).toBe('1 / 9 — Haneniz');
  });
});

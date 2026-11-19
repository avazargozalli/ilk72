/**
 * Şartname §11.2, §15, §18.1 — `Notice`.
 *
 * Ölçütler: varsayılan `role="note"`, gerektiğinde canlı bölge; bilgi renkle
 * değil simge + ton adı metniyle de verilir.
 */
import { render, screen } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { tr } from '../../src/i18n/tr.ts';
import { Notice, type NoticeTone } from '../../src/ui/components/index.ts';
import { normalizeText } from './helpers.tsx';

const TONES: readonly NoticeTone[] = ['info', 'warning', 'success', 'error'];

describe('Notice', () => {
  it('varsayılan olarak role="note" çizer ve simge + ton adı taşır', () => {
    render(<Notice title="Başlık">Gövde metni</Notice>);

    const notice = screen.getByRole('note');
    const icon = notice.querySelector('svg');

    expect(icon).not.toBeNull();
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
    expect(normalizeText(notice.textContent)).toContain(tr.components.notice.toneLabels.info);
    expect(screen.getByText('Başlık')).not.toBeNull();
    expect(screen.getByText('Gövde metni')).not.toBeNull();
  });

  it('her ton için kendi sınıfını, ton adını ve simgesini verir', () => {
    for (const tone of TONES) {
      const { unmount } = render(<Notice tone={tone}>içerik</Notice>);
      const notice = screen.getByRole('note');

      expect(notice.classList.contains(`notice--${tone}`)).toBe(true);
      expect(normalizeText(notice.textContent)).toContain(tr.components.notice.toneLabels[tone]);
      expect(notice.querySelector('svg')).not.toBeNull();

      unmount();
    }
  });

  it('live="polite" durum bölgesi (role="status") üretir', () => {
    render(<Notice live="polite">Kaydedildi</Notice>);

    expect(screen.getByRole('status')).not.toBeNull();
    expect(screen.queryByRole('note')).toBeNull();
  });

  it('live="assertive" uyarı bölgesi (role="alert") üretir', () => {
    render(<Notice live="assertive">Dikkat</Notice>);

    expect(screen.getByRole('alert')).not.toBeNull();
  });

  it('başlık ve içerik verilmezse yalnızca ikon + ton adı çizer', () => {
    render(<Notice />);

    const notice = screen.getByRole('note');
    expect(notice.textContent).toBe(`${tr.components.notice.toneLabels.info}: `);
  });
});

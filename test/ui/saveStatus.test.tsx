/**
 * Şartname §11.4, §15, §18.1 — `SaveStatus`.
 *
 * Ölçütler: `aria-live="polite"` ile durum duyurusu; "Kaydedildi" metni;
 * canlı bölgenin her zaman DOM'da kalması (sonradan eklenen bölge duyurulmaz).
 */
import { render, screen } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { tr } from '../../src/i18n/tr.ts';
import { SaveStatus } from '../../src/ui/components/index.ts';
import { normalizeText } from './helpers.tsx';

describe('SaveStatus', () => {
  it('canlı bölgeyi her zaman çizer', () => {
    render(<SaveStatus state="idle" />);

    const status = screen.getByRole('status');

    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(status.getAttribute('aria-atomic')).toBe('true');
    expect(normalizeText(status.textContent)).toBe('');
  });

  it('kaydedildi durumunu duyurur', () => {
    render(<SaveStatus state="saved" />);

    expect(normalizeText(screen.getByRole('status').textContent)).toBe(
      tr.components.saveStatus.saved,
    );
  });

  it('kaydediliyor ve hata durumlarını yazar', () => {
    const { rerender } = render(<SaveStatus state="saving" />);
    expect(normalizeText(screen.getByRole('status').textContent)).toBe(
      tr.components.saveStatus.saving,
    );

    rerender(<SaveStatus state="error" detail="Depo açılamadı" />);
    const status = screen.getByRole('status');
    expect(normalizeText(status.textContent)).toBe(
      `${tr.components.saveStatus.error} Depo açılamadı`,
    );
  });

  it('durum değişince aynı canlı bölgeyi günceller', () => {
    const { rerender } = render(<SaveStatus state="saving" />);
    const status = screen.getByRole('status');

    rerender(<SaveStatus state="saved" />);

    expect(screen.getByRole('status')).toBe(status);
    expect(normalizeText(status.textContent)).toBe(tr.components.saveStatus.saved);
  });
});

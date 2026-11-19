/**
 * Şartname §13.1, §15, §17, §18.1 — `SourceLink`.
 *
 * Ölçütler: yalnızca izinli alan adlarına `https` bağlantı; `target="_blank"`
 * + `rel="noopener noreferrer"`; kaynak adı ve erişim tarihi metin olarak;
 * izinsiz adreste bağlantı **hiç** üretilmez.
 */
import { render, screen } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { formatDate, formatText, tr } from '../../src/i18n/tr.ts';
import { SourceLink } from '../../src/ui/components/index.ts';
import { normalizeText } from './helpers.tsx';

const SOURCE_URL = 'https://www.afad.gov.tr/deprem-aninda-neler-yapmalisiniz';
const SOURCE_LABEL = 'AFAD — Deprem Anında Neler Yapmalısınız?';
const ACCESSED = '2026-11-19';

describe('SourceLink', () => {
  it('izinli alan adında yeni sekmede açılan güvenli bağlantı üretir', () => {
    render(<SourceLink url={SOURCE_URL} label={SOURCE_LABEL} accessed={ACCESSED} />);

    const link = screen.getByRole('link');

    expect(link.getAttribute('href')).toBe(SOURCE_URL);
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(normalizeText(link.textContent)).toBe(
      `${SOURCE_LABEL} (${tr.components.sourceLink.newTab})`,
    );
  });

  it('kaynak adını ve erişim tarihini metin olarak yazar', () => {
    render(<SourceLink url={SOURCE_URL} label={SOURCE_LABEL} accessed={ACCESSED} />);

    const accessedText = formatText(tr.components.sourceLink.accessedAt, {
      date: formatDate(ACCESSED),
    });

    expect(normalizeText(document.body.textContent)).toContain(accessedText);
    expect(accessedText).toContain('19.11.2026');
  });

  it('alt alan adlarını da izinli sayar', () => {
    render(
      <SourceLink
        url="https://kirsehir.afad.gov.tr/aile-afet-ve-acil-durum-plani"
        label="Kırşehir İl AFAD"
      />,
    );

    expect(screen.getByRole('link').getAttribute('target')).toBe('_blank');
  });

  it('izinli olmayan alan adına bağlantı üretmez', () => {
    render(<SourceLink url="https://example.com/kaynak" label={SOURCE_LABEL} />);

    expect(screen.queryByRole('link')).toBeNull();
    expect(normalizeText(document.body.textContent)).toBe(
      `${SOURCE_LABEL} (${tr.components.sourceLink.unverified})`,
    );
  });

  it('https olmayan adrese bağlantı üretmez', () => {
    render(<SourceLink url="http://www.afad.gov.tr/deprem" label={SOURCE_LABEL} />);

    expect(screen.queryByRole('link')).toBeNull();
    expect(normalizeText(document.body.textContent)).toContain(tr.components.sourceLink.unverified);
  });

  it('adres yoksa doğrulanmadı metni gösterir', () => {
    render(<SourceLink url={null} label={SOURCE_LABEL} accessed={ACCESSED} />);

    expect(screen.queryByRole('link')).toBeNull();
    expect(normalizeText(document.body.textContent)).toBe(
      `${SOURCE_LABEL} (${tr.components.sourceLink.unverified})`,
    );
  });

  it('erişim tarihi verilmezse tarih metni çizmez', () => {
    render(<SourceLink url={SOURCE_URL} label={SOURCE_LABEL} />);

    expect(screen.queryByText(/Erişim tarihi/u)).toBeNull();
    expect(normalizeText(document.body.textContent)).not.toContain('19.11.2026');
  });
});

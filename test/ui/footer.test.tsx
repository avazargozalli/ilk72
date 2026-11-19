/**
 * Şartname §14.5, İ5, §15, §18.1 — `Footer`.
 *
 * Ölçütler: §14.5 metni **birebir**; bağlantılar Gizlilik / Koşullar / Künye /
 * Erişilebilirlik / Kaynaklar sırasıyla ve doğru yollara gider.
 */
import { render, screen } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { ROUTES } from '../../src/config.ts';
import { tr } from '../../src/i18n/tr.ts';
import { Footer } from '../../src/ui/components/index.ts';
import { normalizeText } from './helpers.tsx';

/** §14.5'teki bağlantı sırası. */
const EXPECTED_LINKS = [
  { label: tr.nav.privacy, href: ROUTES.privacy },
  { label: tr.nav.terms, href: ROUTES.terms },
  { label: tr.nav.imprint, href: ROUTES.imprint },
  { label: tr.nav.accessibility, href: ROUTES.accessibility },
  { label: tr.nav.sources, href: ROUTES.sources },
] as const;

describe('Footer', () => {
  it('§14.5 cümlelerini birebir kullanır', () => {
    render(<Footer />);

    // §14.5 metni şartnameden alınmıştır; değiştirilemez (İ5).
    expect(tr.components.footer.independence).toBe(
      'Bağımsız bir açık kaynak projesidir; resmî bir kurum uygulaması değildir.',
    );
    expect(tr.components.footer.emergencyNote).toBe('Acil durumda 112.');

    expect(screen.getByText(tr.components.footer.independence)).not.toBeNull();
    expect(screen.getByText(tr.components.footer.emergencyNote)).not.toBeNull();
  });

  it('bağlantıları §14.5 sırasıyla ve doğru yollarla çizer', () => {
    render(<Footer />);

    const links = screen.getAllByRole('link');

    expect(links.map((link) => normalizeText(link.textContent))).toEqual(
      EXPECTED_LINKS.map((link) => link.label),
    );
    expect(links.map((link) => link.getAttribute('href'))).toEqual(
      EXPECTED_LINKS.map((link) => link.href),
    );
  });

  it('alt bilgi bağlantılarını adlandırılmış bir nav içinde toplar', () => {
    render(<Footer />);

    const nav = screen.getByRole('navigation', { name: tr.components.footer.navLabel });

    expect(nav.querySelectorAll('a')).toHaveLength(EXPECTED_LINKS.length);
    expect(document.querySelector('footer')).not.toBeNull();
  });

  it('bütün metinleri tek alt bilgi bölgesinde verir', () => {
    render(<Footer />);

    const footer = document.querySelector('footer');
    const text = normalizeText(footer?.textContent);

    expect(text).toContain(tr.components.footer.independence);
    expect(text).toContain(tr.components.footer.emergencyNote);
    for (const link of EXPECTED_LINKS) {
      expect(text).toContain(link.label);
    }
  });
});

/**
 * §18.4-8 — "Her sayfada alt bilgi metni var (İ5)".
 *
 * Alt bilgi uygulama kabuğunda (`src/main.tsx`) yaşar; bu test onun gerçekten
 * render edildiğini ve §14.5 metnini taşıdığını kilitler. Sayfa ekleyen
 * ajanlar kabuğu değiştirmediği sürece kural korunur.
 */
import { render, screen } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { tr } from '../../src/i18n/tr';
import { App } from '../../src/main';

describe('uygulama kabuğu — alt bilgi', () => {
  it('§14.5 bağımsızlık cümlesini gösterir', () => {
    render(<App />);
    expect(screen.getByText(tr.components.footer.independence)).toBeTruthy();
  });

  it('acil durumda 112 yönlendirmesini gösterir (İ6)', () => {
    render(<App />);
    expect(screen.getByText(tr.components.footer.emergencyNote)).toBeTruthy();
  });

  it('gizlilik bağlantısı uygulama içi yola gider', () => {
    render(<App />);
    const link = screen.getByRole('link', { name: tr.nav.privacy });
    expect(link.getAttribute('href')).toBe('#/gizlilik');
  });
});

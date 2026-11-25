/**
 * Şartname §14, §18.4-8 — yasal ve bilgi sayfaları.
 *
 * Metinler §14'e birebir uygundur; bu test metnin **varlığını** kilitler
 * (kısaltma/yeniden yazma olursa düşer) ve harici bağlantıların izinli alan
 * adlarında kaldığını doğrular.
 */
import { render, screen } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { isAllowedSourceUrl } from '../../src/content/sources';
import { tr } from '../../src/i18n/tr';
import { About } from '../../src/ui/pages/About';
import { Accessibility } from '../../src/ui/pages/Accessibility';
import { Imprint } from '../../src/ui/pages/Imprint';
import { Privacy } from '../../src/ui/pages/Privacy';
import { Sources } from '../../src/ui/pages/Sources';
import { Terms } from '../../src/ui/pages/Terms';

describe('yasal sayfalar (§14)', () => {
  it('plan verisini, barındırma kayıtlarını ve geri bildirim işlemesini açıklar', () => {
    render(<Privacy />);
    expect(screen.getByRole('heading', { level: 1, name: tr.legal.privacy.title })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Planınız bu tarayıcıda saklanır' })).toBeTruthy();
    const hostingLink = screen.getByRole('link', { name: 'GitHub Pages ziyaretçi kayıtları' });
    expect(hostingLink.getAttribute('href')).toContain('#data-collection');
    expect(hostingLink.getAttribute('rel')).toContain('noreferrer');
    expect(screen.getByRole('heading', { name: 'KVKK kapsamındaki haklarınız' })).toBeTruthy();
  });

  it('kullanım koşulları §14.2 "ne değildir" ve 112 yönlendirmesini taşır', () => {
    render(<Terms />);
    expect(screen.getByRole('heading', { level: 1, name: tr.legal.terms.title })).toBeTruthy();
    expect(screen.getByText(/Acil durumda 112'yi arayın/)).toBeTruthy();
  });

  it('künye sürüm ve sorumlu bilgisini gösterir (§14.3)', () => {
    render(<Imprint />);
    expect(screen.getByText(/Sorumlu kişi/)).toBeTruthy();
    expect(screen.getByText(/Uygulama sürümü/)).toBeTruthy();
  });

  it('erişilebilirlik beyanı gönüllü olduğunu söyler (§14.4)', () => {
    render(<Accessibility />);
    expect(screen.getByText(/Bu beyan gönüllü olarak yayımlanır/)).toBeTruthy();
  });

  it('yasal sayfalar birbirine bağlantı verir (§14.5 listesi)', () => {
    render(<Privacy />);
    expect(screen.getByRole('link', { name: tr.nav.terms }).getAttribute('href')).toBe(
      '#/kosullar',
    );
    expect(screen.getByRole('link', { name: tr.nav.accessibility }).getAttribute('href')).toBe(
      '#/erisilebilirlik',
    );
  });

  it('hakkında sayfası ilkeleri ve "ne değildir" bölümünü taşır', () => {
    render(<About />);
    expect(screen.getByRole('heading', { level: 1, name: tr.legal.about.title })).toBeTruthy();
    expect(screen.getByText(/Resmî bir kurum uygulaması değildir/)).toBeTruthy();
    expect(screen.getByText(/Veri cihazda kalır/)).toBeTruthy();
  });

  it('kaynaklar sayfasındaki bütün dış bağlantılar izinli alan adlarındadır (§13.1)', () => {
    render(<Sources />);
    const anchors = Array.from(document.querySelectorAll('a[href^="https://"]'));
    expect(anchors.length).toBeGreaterThan(0);
    for (const anchor of anchors) {
      expect(isAllowedSourceUrl(anchor.getAttribute('href'))).toBe(true);
    }
  });
});

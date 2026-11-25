/**
 * Şartname §11.9, İ6 — acil ekranı sayfası.
 *
 * Ölçütler:
 * - 112 düğmesi her zaman `<a href="tel:112">` olarak çizilir; altında
 *   "Bu uygulama yardım çağırmaz." yazar (§11.9, İ6). Plan yokken de görünür.
 * - Buluşma yerleri ev yakını → mahalle → şehir dışı sırasıyla, ayrıca
 *   toplanma alanı.
 * - Acil kişilerde **şehir dışı kişi en üstte**; telefonlar `tel:` bağlantısı.
 * - Deprem sonrası kartları (`sonra`) kaynak bağlantıları ve erişim tarihiyle.
 */
import { render, screen } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { EMERGENCY_TEL } from '../../src/config.ts';
import { contentByCategory } from '../../src/content/registry.ts';
import { getSource } from '../../src/content/sources.ts';
import { formatDate, tr } from '../../src/i18n/tr.ts';
import { createEmptyPlan } from '../../src/model/defaults.ts';
import { Emergency } from '../../src/ui/pages/Emergency.tsx';
import { normalizeText } from './helpers.tsx';
import { fullPlan } from './pagesFixtures.tsx';

/** Başlığından bölümün `section` öğesini bulur. */
function sectionByHeading(name: string): HTMLElement {
  const heading = screen.getByRole('heading', { level: 2, name });
  const section = heading.closest('section');
  if (section === null) {
    throw new Error(`Bölüm bulunamadı: ${name}`);
  }
  return section;
}

describe('Emergency — 112 (İ6, §11.9)', () => {
  it('112 bağlantısını ve "yardım çağırmaz" metnini plan varken gösterir', () => {
    render(<Emergency plan={fullPlan()} />);

    const call = screen.getByRole('link', { name: tr.pages.emergency.callAction });
    expect(call.getAttribute('href')).toBe(EMERGENCY_TEL);
    expect(EMERGENCY_TEL).toBe('tel:112');
    expect(tr.pages.emergency.callAction).toBe("112'yi ara");

    // İ6 — metin birebir şartnameden gelir.
    expect(tr.pages.emergency.callNote).toBe('Bu uygulama yardım çağırmaz.');
    expect(screen.getByText(tr.pages.emergency.callNote)).toBeTruthy();
  });

  it('plan yokken de 112 bağlantısını gösterir (§9.3 kilit bilgisi sayfada yok)', () => {
    render(<Emergency plan={null} />);

    expect(
      screen.getByRole('link', { name: tr.pages.emergency.callAction }).getAttribute('href'),
    ).toBe(EMERGENCY_TEL);
    expect(screen.getByText(tr.pages.emergency.callNote)).toBeTruthy();
    expect(screen.getByText(tr.pages.emergency.noPlan)).toBeTruthy();
  });
});

describe('Emergency — buluşma yerleri', () => {
  it('ev yakını → mahalle → şehir dışı → toplanma alanı sırasıyla gösterir', () => {
    render(<Emergency plan={fullPlan()} />);

    const section = sectionByHeading(tr.pages.emergency.placesTitle);
    const terms = Array.from(section.querySelectorAll('dt')).map((term) =>
      normalizeText(term.textContent),
    );

    expect(terms).toEqual([
      tr.wizard.fields.nearHomeLabel,
      tr.wizard.fields.neighborhoodLabel,
      tr.wizard.fields.outOfAreaLabel,
      tr.wizard.fields.assemblyAreaLabel,
    ]);
    expect(normalizeText(section.textContent)).toContain('Karşı park');
    expect(normalizeText(section.textContent)).toContain('Okul bahçesi');
  });

  it('plan yoksa "kayıtlı değil" metnini gösterir', () => {
    render(<Emergency plan={null} />);

    const section = sectionByHeading(tr.pages.emergency.placesTitle);
    expect(normalizeText(section.textContent).split(tr.pages.emergency.placeEmpty).length - 1).toBe(
      4,
    );
  });
});

describe('Emergency — acil kişiler', () => {
  it('şehir dışı kişiyi en üste alır', () => {
    render(<Emergency plan={fullPlan()} />);

    const section = sectionByHeading(tr.pages.emergency.contactsTitle);
    const contacts = Array.from(section.querySelectorAll('li'));

    expect(contacts).toHaveLength(2);
    expect(normalizeText(contacts[0]?.textContent)).toContain('Zeynep Yılmaz');
    expect(normalizeText(contacts[0]?.textContent)).toContain('Şehir dışı — İzmir');
    expect(normalizeText(contacts[1]?.textContent)).toContain('Ali Veli');
  });

  it('telefonları tel: bağlantısı yapar (§11.9)', () => {
    render(<Emergency plan={fullPlan()} />);

    const section = sectionByHeading(tr.pages.emergency.contactsTitle);
    const hrefs = Array.from(section.querySelectorAll('a')).map((anchor) =>
      anchor.getAttribute('href'),
    );

    expect(hrefs).toEqual(['tel:05554445566', 'tel:02120000000', 'tel:05552223344']);
  });

  it('acil kişi yoksa bilgi metnini gösterir', () => {
    render(<Emergency plan={createEmptyPlan()} />);

    expect(screen.getByText(tr.pages.emergency.contactsEmpty)).toBeTruthy();
  });
});

describe('Emergency — deprem sonrası kartları', () => {
  it('sonra kategorisindeki bütün kartları kaynak bağlantılarıyla listeler', () => {
    render(<Emergency plan={null} />);

    const items = contentByCategory('sonra');
    const section = sectionByHeading(tr.pages.emergency.afterTitle);
    const cards = Array.from(section.querySelectorAll('li'));

    expect(cards).toHaveLength(items.length);
    for (const [index, card] of cards.entries()) {
      const item = items[index];
      if (item === undefined) throw new Error('Kart eşleşmedi.');
      expect(normalizeText(card.textContent)).toContain(item.text);
      expect(card.querySelectorAll('a').length).toBeGreaterThan(0);
    }
  });

  it('kaynak satırında kurum, sayfa adı ve erişim tarihi yazar (§11.10, İ4)', () => {
    render(<Emergency plan={null} />);

    const section = sectionByHeading(tr.pages.emergency.afterTitle);
    const text = normalizeText(section.textContent);

    expect(text).toContain(tr.pages.common.sourcePrefix);
    const source = getSource('K-HAZIRIM-DEPREM');
    if (source === undefined) throw new Error('Deprem rehberi kaynağı bulunamadı.');
    expect(text).toContain(`erişim: ${formatDate(source.accessed)}`);
    expect(text).toContain(source.org);
    expect(text).toContain(source.title);
    expect(section.querySelector('a[href^="https://"]')).not.toBeNull();
  });
});

/**
 * Şartname §11.10, §13.2, §13.4 — rehber sayfası.
 *
 * Ölçütler:
 * - Üç sekme (Önce / An / Sonra) doğru yollara gider, etkin sekme
 *   `aria-current="page"` taşır.
 * - Seçilen bölümün kartları; kart metni **içerik kaydından** birebir gelir.
 * - `status: 'taslak'` kartlarda "TASLAK — onaylanmadı" etiketi.
 * - Her kartta kaynak bağlantısı, erişim tarihi ve "Hata bildir" bağlantısı.
 * - Sayfa başında §11.10 uyarısı.
 */
import { render, screen } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { CONTENT_ISSUE_URL, ROUTES } from '../../src/config.ts';
import { contentByCategory } from '../../src/content/registry.ts';
import { getSource } from '../../src/content/sources.ts';
import { formatDate, formatText, tr } from '../../src/i18n/tr.ts';
import { Guide, type GuidePart } from '../../src/ui/pages/Guide.tsx';
import { normalizeText } from './helpers.tsx';

const PARTS: readonly GuidePart[] = ['once', 'an', 'sonra'];

/** Başlığından bölümün `section` öğesini bulur. */
function sectionByHeading(name: string): HTMLElement {
  const heading = screen.getByRole('heading', { level: 2, name });
  const section = heading.closest('section');
  if (section === null) {
    throw new Error(`Bölüm bulunamadı: ${name}`);
  }
  return section;
}

describe('Guide — sekmeler', () => {
  it('üç sekmeyi doğru yollara bağlar ve etkin sekmeyi işaretler', () => {
    render(<Guide part="an" />);

    const nav = screen.getByRole('navigation', { name: tr.pages.guide.tabsLabel });
    const links = Array.from(nav.querySelectorAll('a'));

    expect(links).toHaveLength(3);
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      ROUTES.guidePart('once'),
      ROUTES.guidePart('an'),
      ROUTES.guidePart('sonra'),
    ]);
    expect(links.map((link) => normalizeText(link.textContent))).toEqual([
      tr.pages.guide.tabs.once,
      tr.pages.guide.tabs.an,
      tr.pages.guide.tabs.sonra,
    ]);
    expect(links[0]?.getAttribute('aria-current')).toBeNull();
    expect(links[1]?.getAttribute('aria-current')).toBe('page');
    expect(links[2]?.getAttribute('aria-current')).toBeNull();
  });

  it('sayfa başında §11.10 uyarısını gösterir', () => {
    render(<Guide />);

    expect(tr.pages.guide.intro).toBe(
      'Bu kartlar resmî kaynakların özetidir. Güncel ve ayrıntılı bilgi için kaynağı açın.',
    );
    expect(screen.getByText(tr.pages.guide.intro)).toBeTruthy();
  });

  it('bölüm seçilmezse Önce kartlarını gösterir', () => {
    render(<Guide />);

    expect(screen.getByRole('heading', { level: 2, name: tr.pages.guide.parts.once })).toBeTruthy();
  });
});

describe('Guide — kartlar', () => {
  for (const part of PARTS) {
    it(`${tr.pages.guide.parts[part]} bölümünün kartlarını kayıt metniyle gösterir`, () => {
      render(<Guide part={part} />);

      const items = contentByCategory(part);
      const section = sectionByHeading(tr.pages.guide.parts[part]);
      const cards = Array.from(section.querySelectorAll('li'));

      expect(cards).toHaveLength(items.length);
      for (const [index, card] of cards.entries()) {
        const item = items[index];
        if (item === undefined) throw new Error('Kart eşleşmedi.');
        // §13.2 — kart gövdesi kayıttaki metnin birebir aynısıdır.
        expect(normalizeText(card.textContent)).toContain(item.text);
      }
    });
  }

  it('taslak kartları "TASLAK — onaylanmadı" etiketiyle işaretler (§13.4)', () => {
    render(<Guide part="sonra" />);

    const cards = sectionByHeading(tr.pages.guide.parts.sonra).querySelectorAll('li');
    for (const [index, item] of contentByCategory('sonra').entries()) {
      expect(cards[index]?.textContent?.includes(tr.pages.guide.draft)).toBe(
        item.status === 'taslak',
      );
    }
  });

  it('kart başlığını ve kısa konu adını gösterir', () => {
    render(<Guide part="once" />);

    expect(screen.getByRole('heading', { level: 3, name: 'Tehlike avı' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 3, name: 'Çök-Kapan-Tutun' })).toBeTruthy();
  });
});

describe('Guide — kaynak ve hata bildirimi', () => {
  it('her kartta kaynak bağlantısı ve erişim tarihi vardır (§11.10, İ4)', () => {
    render(<Guide part="an" />);

    const items = contentByCategory('an');
    const section = sectionByHeading(tr.pages.guide.parts.an);
    const cards = Array.from(section.querySelectorAll('li'));

    for (const [index, card] of cards.entries()) {
      const item = items[index];
      if (item === undefined) throw new Error('Kart eşleşmedi.');
      const text = normalizeText(card.textContent);

      expect(text).toContain(tr.pages.common.sourcePrefix);
      for (const key of item.sources) {
        const source = getSource(key);
        if (source === undefined || source.url === null) continue;
        expect(text).toContain(
          formatText(tr.pages.common.sourceAccessed, { date: formatDate(source.accessed) }),
        );
      }
      const anchors = Array.from(card.querySelectorAll('a[href]'));
      expect(anchors.length).toBeGreaterThan(0);
      const sourceAnchors = anchors.filter((anchor) =>
        (anchor.getAttribute('href') ?? '').startsWith('https://'),
      );
      expect(sourceAnchors.length).toBeGreaterThan(0);
      for (const anchor of sourceAnchors) {
        expect(anchor.getAttribute('target')).toBe('_blank');
        expect(anchor.getAttribute('rel')).toBe('noopener noreferrer');
      }
    }
  });

  it('her kartta depo sorun şablonuna giden "Hata bildir" bağlantısı vardır (§13.4-5)', () => {
    render(<Guide part="once" />);

    const section = sectionByHeading(tr.pages.guide.parts.once);
    const cards = Array.from(section.querySelectorAll('li'));
    const issueLinks = Array.from(section.querySelectorAll(`a[href="${CONTENT_ISSUE_URL}"]`));

    expect(issueLinks).toHaveLength(contentByCategory('once').length);
    for (const link of issueLinks) {
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
      expect(normalizeText(link.textContent)).toContain(tr.pages.guide.reportIssue);
    }
    expect(cards.length).toBe(issueLinks.length);
  });
});

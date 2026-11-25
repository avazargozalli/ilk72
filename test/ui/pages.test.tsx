/**
 * Şartname §11.3, §11.8, İ3, İ9, §18.4-8 — ana sayfa, NotFound ve sayfa ilkeleri.
 *
 * Ölçütler:
 * - Plan yokken üç cümlelik tanıtım, başlangıç düğmesi, "Boş formu yazdır"
 *   bağlantısı (`#/yazdir`) ve "Bana gönderilen planı aç" açıklaması.
 * - Plan varken §11.8 doluluk cümlesi + **sabit** uyarı, dört eylem ve gözden
 *   geçirme tarihi; altı ay geçtiyse nazik hatırlatma.
 * - İ9: hiçbir sayfada "güvendesiniz", "hazırsınız", "garanti" gibi ifade yok.
 * - §18.4-8: sayfalar kendi alt bilgisini yazmaz; alt bilgi uygulama kabuğunda.
 * - Sayfalar `src/storage/**` ve CSS import etmez, `dangerouslySetInnerHTML`
 *   kullanmaz.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen } from '@testing-library/preact';
import type { JSX } from 'preact';
import { describe, expect, it, vi } from 'vitest';
import { ROUTES } from '../../src/config.ts';
import { tr } from '../../src/i18n/tr.ts';
import { createEmptyPlan } from '../../src/model/defaults.ts';
import { computeProgress } from '../../src/model/progress.ts';
import type { Plan } from '../../src/model/types.ts';
import { Bag } from '../../src/ui/pages/Bag.tsx';
import { Emergency } from '../../src/ui/pages/Emergency.tsx';
import { Guide } from '../../src/ui/pages/Guide.tsx';
import { Home } from '../../src/ui/pages/Home.tsx';
import { NotFound } from '../../src/ui/pages/NotFound.tsx';
import { Summary } from '../../src/ui/pages/Summary.tsx';
import { normalizeText } from './helpers.tsx';
import { fullPlan, planWithHousehold } from './pagesFixtures.tsx';

const h1 = (name: string) => screen.getByRole('heading', { level: 1, name });

/** `YYYY-AA-GG` tarihini testin beklediği GG.AA.YYYY biçimine çevirir. */
function dateOnly(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}.${month}.${year}`;
}

describe('Home — plan yok (§11.3)', () => {
  it('üç cümlelik tanıtımı, başlangıç düğmesini ve boş form bağlantısını gösterir', () => {
    const onStart = vi.fn();
    render(<Home plan={null} onStart={onStart} />);

    expect(h1(tr.pages.home.title)).toBeTruthy();
    expect(tr.pages.home.intro).toHaveLength(3);
    for (const sentence of tr.pages.home.intro) {
      expect(screen.getByText(sentence)).toBeTruthy();
    }

    fireEvent.click(screen.getByRole('button', { name: tr.pages.home.start }));
    expect(onStart).toHaveBeenCalledTimes(1);

    // İ3 — kâğıt öncelikli: boş form yazdırma sayfası.
    expect(screen.getByRole('link', { name: tr.pages.home.printBlank }).getAttribute('href')).toBe(
      ROUTES.print,
    );
  });

  it('"Bana gönderilen planı aç" açıklamasını gösterir', () => {
    render(<Home plan={null} />);

    expect(screen.getByRole('heading', { level: 2, name: tr.pages.home.importTitle })).toBeTruthy();
    expect(screen.getByText(tr.pages.home.importBody)).toBeTruthy();
  });

  it('onStart verilmezse başlangıç bağlantısı sihirbazın ilk adımına gider', () => {
    render(<Home plan={null} />);

    expect(screen.getByRole('link', { name: tr.pages.home.start }).getAttribute('href')).toBe(
      ROUTES.plan(1),
    );
  });
});

describe('Home — plan var (§11.3, §11.8)', () => {
  it('doluluk cümlesini ve İ9 sabit uyarısını gösterir', () => {
    const plan = planWithHousehold();
    render(<Home plan={plan} progress={computeProgress(plan)} />);

    expect(screen.getByText("Planınızın 9 bölümünden 1'i dolu.")).toBeTruthy();
    // §11.8 — metin sabittir: doluluk bir güvenlik derecesi değildir.
    expect(tr.pages.home.progressNote).toBe(
      'Bu sayı planın ne kadarını doldurduğunuzu gösterir; bir güvenlik derecesi değildir.',
    );
    expect(screen.getByText(tr.pages.home.progressNote)).toBeTruthy();
  });

  it('doluluk dışarıdan verilmezse plana göre hesaplar', () => {
    render(<Home plan={createEmptyPlan()} />);

    expect(screen.getByText('Planınızın 9 bölümünden hiçbiri dolu değil.')).toBeTruthy();
  });

  it('Devam et, Yazdır, Acil ekranı ve Paylaş eylemlerini doğru yollara bağlar', () => {
    render(<Home plan={createEmptyPlan()} />);

    expect(screen.getByRole('link', { name: tr.pages.home.continue }).getAttribute('href')).toBe(
      ROUTES.plan(1),
    );
    expect(screen.getByRole('link', { name: tr.nav.print }).getAttribute('href')).toBe(
      ROUTES.print,
    );
    expect(
      screen.getByRole('link', { name: tr.pages.home.emergencyAction }).getAttribute('href'),
    ).toBe(ROUTES.emergency);
    expect(screen.getByRole('link', { name: tr.nav.share }).getAttribute('href')).toBe(
      ROUTES.share,
    );
    expect(screen.getByRole('link', { name: tr.pages.home.summaryLink }).getAttribute('href')).toBe(
      ROUTES.summary,
    );
  });

  it('son gözden geçirme tarihini yazar ve altı ay geçtiyse nazik hatırlatma gösterir', () => {
    const plan: Plan = {
      ...createEmptyPlan(),
      review: { lastDrillAt: '2020-01-15', nextReviewAt: '2020-07-15' },
    };
    render(<Home plan={plan} />);

    expect(screen.getByText(`Son tatbikat: ${dateOnly('2020-01-15')}`)).toBeTruthy();
    expect(screen.getByText(`Sonraki gözden geçirme: ${dateOnly('2020-07-15')}`)).toBeTruthy();
    expect(screen.getByText(tr.pages.home.reviewReminderTitle)).toBeTruthy();
    expect(screen.getByText(tr.pages.home.reviewReminder)).toBeTruthy();
  });

  it('gözden geçirme tarihi ilerideyse hatırlatma göstermez', () => {
    const plan: Plan = {
      ...createEmptyPlan(),
      review: { lastDrillAt: '2026-01-15', nextReviewAt: '2999-01-15' },
    };
    render(<Home plan={plan} />);

    expect(screen.queryByText(tr.pages.home.reviewReminderTitle)).toBeNull();
  });

  it('gözden geçirme tarihi yoksa bunu söyler', () => {
    render(<Home plan={createEmptyPlan()} />);

    expect(screen.getByText(tr.pages.home.noReviewDate)).toBeTruthy();
  });
});

describe('NotFound', () => {
  it('başlığı, açıklamayı ve ana sayfa bağlantısını gösterir (§11.1)', () => {
    render(<NotFound />);

    expect(h1(tr.error.notFound.title)).toBeTruthy();
    expect(screen.getByText(tr.error.notFound.body)).toBeTruthy();
    expect(screen.getByRole('link', { name: tr.common.backHome }).getAttribute('href')).toBe(
      ROUTES.home,
    );
  });
});

/** İ9 — yasaklı ifadeler (küçük harfle aranır). */
const FORBIDDEN_PHRASES = ['güvendesiniz', 'hazırsınız', 'garanti', 'güvenlik puanı'];

const PAGE_CASES: ReadonlyArray<readonly [string, () => JSX.Element]> = [
  ['Home (plan yok)', () => <Home plan={null} />],
  ['Home (plan var)', () => <Home plan={fullPlan()} />],
  ['Summary', () => <Summary plan={fullPlan()} />],
  ['Emergency', () => <Emergency plan={fullPlan()} />],
  ['Guide', () => <Guide part="sonra" />],
  ['Bag', () => <Bag plan={fullPlan()} />],
  ['NotFound', () => <NotFound />],
];

describe('sayfa ilkeleri', () => {
  for (const [name, createPage] of PAGE_CASES) {
    it(`${name} İ9 yasaklı ifadelerini kullanmaz`, () => {
      const { container } = render(createPage());
      const text = normalizeText(container.textContent).toLocaleLowerCase('tr');

      for (const phrase of FORBIDDEN_PHRASES) {
        expect(text, `${name} → ${phrase}`).not.toContain(phrase);
      }
    });

    it(`${name} kendi alt bilgisini yazmaz (§18.4-8)`, () => {
      const { container } = render(createPage());

      expect(container.querySelector('footer')).toBeNull();
      expect(normalizeText(container.textContent)).not.toContain(tr.components.footer.independence);
    });
  }
});

/** Sayfa ve yardımcı dosyalarının kaynak metni (statik ilke denetimleri). */
const PAGE_DIR = resolve(process.cwd(), 'src/ui/pages');
const HELPER_DIR = resolve(PAGE_DIR, 'pages');
const PAGE_FILES = [
  'Home.tsx',
  'Summary.tsx',
  'Emergency.tsx',
  'Guide.tsx',
  'Bag.tsx',
  'NotFound.tsx',
];
const PAGE_SOURCES = [
  ...PAGE_FILES.map((file) => ({ name: file, path: resolve(PAGE_DIR, file) })),
  ...readdirSync(HELPER_DIR)
    .filter((file) => file.endsWith('.ts') || file.endsWith('.tsx'))
    .map((file) => ({ name: `pages/${file}`, path: resolve(HELPER_DIR, file) })),
];

describe('sayfa kaynak kuralları', () => {
  it('saklama katmanını import etmez', () => {
    for (const source of PAGE_SOURCES) {
      const text = readFileSync(source.path, 'utf8');
      expect(text, source.name).not.toMatch(/from '[^']*storage\//u);
    }
  });

  it('CSS import etmez (stiller uygulama kabuğunda yüklenir)', () => {
    for (const source of PAGE_SOURCES) {
      const text = readFileSync(source.path, 'utf8');
      expect(text, source.name).not.toMatch(/from '[^']*\.css'/u);
    }
  });

  it('dangerouslySetInnerHTML kullanmaz (§17)', () => {
    for (const source of PAGE_SOURCES) {
      const text = readFileSync(source.path, 'utf8');
      expect(text, source.name).not.toContain('dangerouslySetInnerHTML');
    }
  });
});

/**
 * Şartname §11.7, §11.8, İ8 — plan özeti sayfası.
 *
 * Ölçütler:
 * - Dokuz bölümün başlığı ve her bölümün yanında ilgili adıma giden "Düzenle"
 *   bağlantısı (`#/plan/1` … `#/plan/9`).
 * - Üstte çıktı düğmeleri (Yazdır, Paylaş).
 * - Sağlık bilgileri **varsayılan gizli**; "Göster" açar, "Gizle" kapatır (İ8).
 * - Sağlık izni kapalıyken sağlık alanları hiç okunmaz.
 * - Bölüm içerikleri (kişiler, acil kişiler, buluşma yerleri, vana/şalter,
 *   görevler, çanta sayıları, gözden geçirme) okunur biçimde gösterilir.
 */
import { fireEvent, render, screen } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { ROUTES } from '../../src/config.ts';
import { contentByCategory } from '../../src/content/registry.ts';
import { formatText, tr } from '../../src/i18n/tr.ts';
import { buildBagItemIds, mergeBagItems } from '../../src/model/bag.ts';
import { createEmptyPlan } from '../../src/model/defaults.ts';
import { PLAN_SECTIONS } from '../../src/model/progress.ts';
import { Summary } from '../../src/ui/pages/Summary.tsx';
import { fullPlan } from './pagesFixtures.tsx';

/** `YYYY-AA-GG` tarihini GG.AA.YYYY biçimine çevirir. */
function dateOnly(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}.${month}.${year}`;
}

const EXPECTED_EDIT_HREFS = PLAN_SECTIONS.map((_, index) => ROUTES.plan(index + 1));

describe('Summary — bölümler ve düzenleme bağlantıları', () => {
  it('dokuz bölümün başlığını §11.8 sırasıyla gösterir', () => {
    render(<Summary plan={fullPlan()} />);

    expect(screen.getByRole('heading', { level: 1, name: tr.pages.summary.title })).toBeTruthy();
    for (const section of PLAN_SECTIONS) {
      expect(
        screen.getByRole('heading', { level: 2, name: tr.pages.sectionTitles[section] }),
      ).toBeTruthy();
    }
  });

  it('her bölümün yanında ilgili adıma giden "Düzenle" bağlantısı vardır', () => {
    render(<Summary plan={fullPlan()} />);

    const editLinks = screen.getAllByRole('link', { name: /Düzenle/u });
    expect(editLinks.map((link) => link.getAttribute('href'))).toEqual(EXPECTED_EDIT_HREFS);
    // Bağlantı metni görünürde "Düzenle"; bölüm adı ekran okuyucuya yazılır.
    expect(editLinks[0]?.textContent).toBe(
      `${tr.pages.common.edit}${formatText(tr.pages.common.editSection, {
        section: tr.pages.sectionTitles.household,
      })}`,
    );
  });

  it('üstte çıktı düğmelerini (Yazdır, Paylaş) gösterir', () => {
    render(<Summary plan={fullPlan()} />);

    expect(screen.getByRole('link', { name: tr.nav.print }).getAttribute('href')).toBe(
      ROUTES.print,
    );
    expect(screen.getByRole('link', { name: tr.nav.share }).getAttribute('href')).toBe(
      ROUTES.share,
    );
  });
});

describe('Summary — bölüm içerikleri', () => {
  it('kişileri, telefonu ve gün içindeki yeri gösterir', () => {
    render(<Summary plan={fullPlan()} />);

    expect(screen.getAllByText('Ayşe Yılmaz').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Can Yılmaz').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: '0555 111 22 33' }).getAttribute('href')).toBe(
      'tel:05551112233',
    );
    expect(screen.getByText('Belediye (İş yeri)')).toBeTruthy();
    expect(screen.getByText(tr.wizard.options.groups.cocuk)).toBeTruthy();
  });

  it('destek ihtiyaçlarını ve notunu gösterir', () => {
    render(<Summary plan={fullPlan()} />);

    expect(screen.getByText(tr.wizard.fields.needsMobility)).toBeTruthy();
    expect(screen.getByText('Merdiven inerken destek gerekir.')).toBeTruthy();
  });

  it('acil kişileri, şehir dışı bilgisini ve telefon bağlantılarını gösterir', () => {
    render(<Summary plan={fullPlan()} />);

    expect(screen.getByRole('heading', { level: 3, name: 'Zeynep Yılmaz — teyze' })).toBeTruthy();
    expect(screen.getByText('Şehir dışı — İzmir')).toBeTruthy();
    expect(screen.getByText(tr.pages.summary.canPickUpChildren)).toBeTruthy();
    expect(screen.getByRole('link', { name: '0555 444 55 66' }).getAttribute('href')).toBe(
      'tel:05554445566',
    );
  });

  it('buluşma yerlerini ve toplanma alanını gösterir', () => {
    render(<Summary plan={fullPlan()} />);

    expect(screen.getByText('Karşı park — Kapıcı dairesinin karşısı')).toBeTruthy();
    expect(screen.getByText('Cami avlusu')).toBeTruthy();
    expect(screen.getByText('Teyzenin evi — İzmir, Karşıyaka')).toBeTruthy();
    expect(
      screen.getByText(`Toplanma alanı için resmî sorguya bakıldı: ${dateOnly('2026-04-01')}`),
    ).toBeTruthy();
  });

  it('güvenli yerleri, çıkış yollarını, vana/şalter yerlerini ve tehlike sayısını gösterir', () => {
    render(<Summary plan={fullPlan()} />);

    expect(screen.getByText('Salon iç duvarı')).toBeTruthy();
    expect(screen.getByText('Ana kapı')).toBeTruthy();
    expect(screen.getByText('Giriş katı, merdiven altı')).toBeTruthy();
    expect(
      screen.getByText(
        formatText(tr.pages.summary.hazardsCount, {
          done: 1,
          total: contentByCategory('tehlike').length,
        }),
      ),
    ).toBeTruthy();
  });

  it('görevleri atanan kişiyle, atanmamışları "Atanmadı" ile gösterir', () => {
    render(<Summary plan={fullPlan()} />);

    expect(
      screen.getByText(
        formatText(tr.pages.common.labelValue, {
          label: tr.wizard.roles.canta,
          value: 'Ayşe Yılmaz',
        }),
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(
        formatText(tr.pages.common.labelValue, {
          label: tr.wizard.roles.vanalar,
          value: tr.wizard.fields.roleUnassigned,
        }),
      ),
    ).toBeTruthy();
  });

  it('çanta ve belge sayılarını, evcil hayvanı ve sigorta yanıtını gösterir', () => {
    const plan = fullPlan();
    render(<Summary plan={plan} />);

    const items = mergeBagItems(plan.bag.items, buildBagItemIds(plan));
    const doneItems = items.filter((item) => item.done).length;

    expect(
      screen.getByText(
        formatText(tr.pages.summary.bagItemsCount, { done: doneItems, total: items.length }),
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(
        formatText(tr.pages.summary.documentsCount, {
          done: 1,
          total: contentByCategory('belge').length,
        }),
      ),
    ).toBeTruthy();
    expect(screen.getByText('Pamuk (kedi)')).toBeTruthy();
    expect(screen.getByText(tr.wizard.options.yesNoUnknown.evet)).toBeTruthy();
    expect(screen.getByRole('link', { name: tr.pages.summary.bagOpen }).getAttribute('href')).toBe(
      ROUTES.bag,
    );
  });

  it('gözden geçirme tarihlerini ve notu gösterir', () => {
    render(<Summary plan={fullPlan()} />);

    expect(screen.getByText(dateOnly('2026-05-04'))).toBeTruthy();
    expect(screen.getByText(dateOnly('2026-11-04'))).toBeTruthy();
    expect(screen.getByText('Toplanma alanını eylülde yeniden kontrol et.')).toBeTruthy();
  });

  it('boş planda da dokuz bölümü ve boş metinlerini gösterir', () => {
    render(<Summary plan={createEmptyPlan()} />);

    expect(screen.getByText(tr.pages.summary.membersEmpty)).toBeTruthy();
    expect(screen.getByText(tr.pages.summary.needsNone)).toBeTruthy();
    expect(screen.getByText(tr.pages.summary.contactsEmpty)).toBeTruthy();
    expect(screen.getByText(tr.pages.summary.meetingEmpty)).toBeTruthy();
    expect(screen.getByText(tr.pages.summary.rolesEmpty)).toBeTruthy();
    expect(screen.getByText(tr.pages.summary.petsEmpty)).toBeTruthy();
    expect(screen.getByText(tr.pages.summary.notesEmpty)).toBeTruthy();
  });
});

describe('Summary — sağlık bilgileri (İ8)', () => {
  it('sağlık bilgilerini varsayılan olarak gizler ve "Göster" ile açar', () => {
    render(<Summary plan={fullPlan()} />);

    expect(screen.queryByText('Astım')).toBeNull();
    expect(screen.queryByText('Ventolin')).toBeNull();
    expect(screen.queryByText('A Rh+')).toBeNull();

    const showButton = screen.getByRole('button', { name: tr.pages.common.show });
    expect(showButton.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(showButton);

    expect(screen.getByText('Astım')).toBeTruthy();
    expect(screen.getByText('Ventolin')).toBeTruthy();
    expect(screen.getByText('A Rh+')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: tr.pages.common.hide }).getAttribute('aria-expanded'),
    ).toBe('true');
  });

  it('"Gizle" ile sağlık bilgilerini yeniden kapatır', () => {
    render(<Summary plan={fullPlan()} />);

    fireEvent.click(screen.getByRole('button', { name: tr.pages.common.show }));
    expect(screen.getByText('Astım')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: tr.pages.common.hide }));
    expect(screen.queryByText('Astım')).toBeNull();
  });

  it('sağlık izni kapalıyken sağlık bilgisi göstermez', () => {
    const plan = { ...fullPlan(), healthOptIn: false };
    render(<Summary plan={plan} />);

    expect(screen.queryByRole('button', { name: tr.pages.common.show })).toBeNull();
    expect(screen.queryByText('Astım')).toBeNull();
    expect(screen.getByText(tr.pages.summary.healthNone)).toBeTruthy();
  });
});

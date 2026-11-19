/**
 * Şartname §12, §18.1 — yazdırma/çıktı testleri (aşama 21.9).
 *
 * Ölçütler:
 * - `#/yazdir` sayfası altı belgeyi kutularla sorar ve seçilenleri önizler.
 * - Buzdolabı sayfasında **hiçbir** sağlık bilgisi yoktur (plan sağlık içerse de, §12.2).
 * - Çocuk kartında **ev adresi yoktur**; okul adı yalnızca `includeSchoolName` ile gelir (§12.4).
 * - `includeHealth` false iken tam planda sağlık bilgisi yoktur (§12.1, İ8).
 * - Her belgede alt bilgi cümlesi vardır (§12); 112 bağlantısı `tel:112`'dir (İ6).
 */
import { fireEvent, render, screen } from '@testing-library/preact';
import type { ComponentChildren } from 'preact';
import { describe, expect, it, vi } from 'vitest';
import { APP_NAME, EMERGENCY_TEL } from '../../src/config.ts';
import { formatDate, formatText, tr } from '../../src/i18n/tr.ts';
import { createEmptyPlan } from '../../src/model/defaults.ts';
import type { Member, Plan } from '../../src/model/types.ts';
import { Print } from '../../src/ui/pages/Print.tsx';
import {
  BagChecklist,
  BlankForm,
  ChildCards,
  FridgeSheet,
  FullPlan,
  PRINT_DOCUMENT_IDS,
  WalletCards,
} from '../../src/ui/print/index.ts';
import { normalizeText } from './helpers.tsx';

/** §12 alt bilgi cümlesi: "İlk 72 ile hazırlandı · {tarih} · Resmî bir belge değildir." */
function footerLine(date: string): string {
  return formatText(tr.print.footer.line, { app: APP_NAME, date: formatDate(date) });
}

/** Planın son kayıt tarihi; alt bilgide bu tarih basılır. */
const PLAN_DATE = '2026-11-19';
const PLAN_DATE_TEXT = '19.11.2026';

/**
 * §8.1'e uyan, dolu bir test planı. Sağlık izni açıktır ve sağlık alanları
 * doludur; böylece "sağlık görünmemeli" ölçütleri gerçekten sınanır.
 */
function createTestPlan(overrides: Partial<Plan> = {}): Plan {
  return {
    ...createEmptyPlan(),
    updatedAt: `${PLAN_DATE}T10:30:00.000Z`,
    healthOptIn: true,
    household: {
      label: 'Yılmaz ailesi',
      address: 'Örnek Mahallesi 12. Sokak No 3 Daire 4',
      buildingNote: '4. kat, asansörlü, 2 merdiven',
      floorCount: '4',
    },
    members: [
      {
        id: 'm1',
        name: 'Ayşe Yılmaz',
        group: 'yetiskin',
        phone: '0212 555 44 33',
        dailyPlaces: [
          { kind: 'is', label: 'İş yeri', phone: '0212 555 11 22', note: 'Servisle gidiyor' },
        ],
        needs: {
          mobility: true,
          hearing: false,
          vision: false,
          communication: false,
          note: 'Merdiven inerken destek gerekir',
        },
        health: {
          bloodType: 'A+',
          conditions: 'Astım',
          medications: 'İnhaler',
          allergies: 'Polen',
          devices: 'İşitme cihazı',
        },
      },
      {
        id: 'm2',
        name: 'Mehmet Yılmaz',
        group: 'cocuk',
        phone: '0532 222 33 44',
        dailyPlaces: [{ kind: 'okul', label: 'Atatürk İlkokulu', phone: '', note: '' }],
        needs: { mobility: false, hearing: false, vision: false, communication: false, note: '' },
        health: { bloodType: '', conditions: '', medications: '', allergies: '', devices: '' },
      },
    ],
    contacts: [
      {
        id: 'c1',
        name: 'Zeynep Kaya',
        relation: 'teyze',
        phone: '0532 111 22 33',
        phoneAlt: '0532 111 22 44',
        outOfArea: true,
        city: 'İzmir',
        canPickUpChildren: true,
      },
      {
        id: 'c2',
        name: 'Komşu Ali',
        relation: 'komşu',
        phone: '0533 999 88 77',
        phoneAlt: '',
        outOfArea: false,
        city: '',
        canPickUpChildren: false,
      },
    ],
    meeting: {
      nearHome: { label: 'Park', detail: 'Apartmanın karşısı' },
      neighborhood: { label: 'Okul bahçesi', detail: '' },
      outOfArea: { label: 'Teyzenin evi', detail: 'İzmir' },
      assemblyArea: { label: 'Kongre meydanı', detail: '' },
      assemblyCheckedAt: '2026-11-01',
    },
    home: {
      safeSpots: ['Salon: sağlam masa altı'],
      exits: ['Ana kapı', 'Balkon'],
      utilities: { electricity: 'Girişteki dolapta', gas: 'Mutfakta', water: 'Banyoda' },
      hazards: [{ id: 'H-01', done: true, note: '' }],
    },
    roles: [{ roleId: 'canta', memberId: 'm1', note: 'Yatak odasında' }],
    bag: {
      location: 'Giriş dolabı',
      items: [
        { id: 'C-01', done: true, note: '6 şişe' },
        { id: 'C-02', done: false, note: '' },
      ],
      lastCheckedAt: '2026-10-01',
    },
    documents: [{ id: 'B-01', done: true, note: '' }],
    pets: [{ id: 'p1', name: 'Tarçın', kind: 'kedi', note: 'Taşıma çantası' }],
    insurance: { dask: 'evet' },
    review: { lastDrillAt: '2026-05-01', nextReviewAt: '2027-05-01' },
    notes: 'Yedek anahtar komşuda.\nİkinci satır.',
    ...overrides,
  };
}

/** Belgenin bütün metni (karşılaştırma için tek boşluklu). */
function pageText(): string {
  return normalizeText(document.body.textContent);
}

/** Bir belge bileşeninin metni. */
function renderText(element: ComponentChildren): string {
  const { container } = render(element);
  return normalizeText(container.textContent);
}

/** Sayfadaki bütün belge kutularını işaretler. */
function checkAllDocuments(): void {
  for (const id of PRINT_DOCUMENT_IDS) {
    const input = screen.getByRole('checkbox', {
      name: tr.print.documents[id].title,
    }) as HTMLInputElement;
    if (!input.checked) fireEvent.click(input);
  }
}

/** happy-dom `window.print` sağlamadığı için sayacı elle kurar. */
function installPrintSpy(): ReturnType<typeof vi.fn> {
  const spy = vi.fn();
  Object.defineProperty(window, 'print', {
    configurable: true,
    writable: true,
    value: spy,
  });
  return spy;
}

describe('Print sayfası (§12)', () => {
  it('altı belgenin kutusunu da gösterir', () => {
    render(<Print plan={createTestPlan()} />);

    expect(PRINT_DOCUMENT_IDS).toHaveLength(6);
    for (const id of PRINT_DOCUMENT_IDS) {
      const input = screen.getByRole('checkbox', {
        name: tr.print.documents[id].title,
      }) as HTMLInputElement;
      expect(input.type).toBe('checkbox');
    }
  });

  it('"Yazdır" düğmesi enjekte edilen onPrint davranışını çağırır', () => {
    const onPrint = vi.fn();
    const printSpy = installPrintSpy();

    render(<Print plan={createTestPlan()} onPrint={onPrint} />);
    fireEvent.click(screen.getByRole('button', { name: tr.print.page.printButton }));

    expect(onPrint).toHaveBeenCalledTimes(1);
    expect(printSpy).not.toHaveBeenCalled();
  });

  it('onPrint verilmezse tarayıcının yazdırma penceresini çağırır', () => {
    const printSpy = installPrintSpy();

    render(<Print plan={createTestPlan()} />);
    fireEvent.click(screen.getByRole('button', { name: tr.print.page.printButton }));

    expect(printSpy).toHaveBeenCalledTimes(1);
  });

  it('varsayılan olarak hanenin belgelerini seçer, boş formu seçmez', () => {
    render(<Print plan={createTestPlan()} />);

    for (const id of PRINT_DOCUMENT_IDS) {
      const input = screen.getByRole('checkbox', {
        name: tr.print.documents[id].title,
      }) as HTMLInputElement;
      expect(input.checked, id).toBe(id !== 'blankForm');
    }
  });

  it('her belge türü seçilince önizlemede render edilir', () => {
    render(<Print plan={createTestPlan()} />);
    checkAllDocuments();

    for (const id of PRINT_DOCUMENT_IDS) {
      const input = screen.getByRole('checkbox', {
        name: tr.print.documents[id].title,
      }) as HTMLInputElement;
      expect(input.checked, id).toBe(true);
    }

    // Her belge kendi `aria-label`'ıyla bir bölge olarak bulunur.
    for (const id of PRINT_DOCUMENT_IDS) {
      expect(screen.getByRole('region', { name: tr.print.documents[id].title }), id).not.toBeNull();
    }
    expect(document.querySelector('.print-doc--blank')).not.toBeNull();
  });

  it('ölçek notunu ve önizleme başlığını gösterir', () => {
    render(<Print plan={createTestPlan()} />);

    expect(screen.getByText(tr.print.page.scaleNote)).not.toBeNull();
    expect(tr.print.page.scaleNote).toBe('Yazdırırken ölçek %100 olsun.');
    expect(
      screen.getByRole('heading', { name: tr.print.page.previewTitle, level: 2 }),
    ).not.toBeNull();
  });

  it('hiç belge seçilmezse önizleme yerine uyarı gösterir', () => {
    render(<Print plan={createTestPlan()} />);

    for (const id of PRINT_DOCUMENT_IDS) {
      const input = screen.getByRole('checkbox', {
        name: tr.print.documents[id].title,
      }) as HTMLInputElement;
      if (input.checked) fireEvent.click(input);
    }

    expect(screen.getByText(tr.print.page.previewEmpty)).not.toBeNull();
  });

  it('sağlık seçeneğini planda izin yoksa kapatır', () => {
    render(<Print plan={createTestPlan({ healthOptIn: false })} />);

    const input = screen.getByRole('checkbox', {
      name: tr.print.page.includeHealth,
    }) as HTMLInputElement;
    expect(input.disabled).toBe(true);
    expect(screen.getByText(tr.print.page.includeHealthUnavailable)).not.toBeNull();
  });

  it('sağlık adımı ziyaret edilmemişse sağlık seçeneğini kapatır', () => {
    render(<Print plan={createTestPlan()} visitedSteps={new Set([1, 2])} />);

    expect(
      (screen.getByRole('checkbox', { name: tr.print.page.includeHealth }) as HTMLInputElement)
        .disabled,
    ).toBe(true);
  });

  it('sağlık seçeneği işaretlenince tam planda sağlık bilgisi görünür', () => {
    render(<Print plan={createTestPlan()} />);

    expect(pageText()).not.toContain('Astım');
    fireEvent.click(screen.getByRole('checkbox', { name: tr.print.page.includeHealth }));

    expect(pageText()).toContain('Astım');
    expect(pageText()).toContain('İnhaler');
  });

  it('takvim niyeti verilirse .ics düğmesini gösterir', () => {
    const onDownloadIcs = vi.fn();
    render(<Print plan={createTestPlan()} onDownloadIcs={onDownloadIcs} />);

    fireEvent.click(screen.getByRole('button', { name: tr.print.page.calendarButton }));
    expect(onDownloadIcs).toHaveBeenCalledTimes(1);
  });
});

describe('FullPlan (§12.1)', () => {
  it('en üstte 112 ve buluşma yerlerini verir', () => {
    const text = renderText(<FullPlan plan={createTestPlan()} />);

    expect(text).toContain(tr.print.emergency.title);
    expect(text).toContain('Park');
    expect(text).toContain('Kongre meydanı');
    expect(screen.getByRole('link', { name: '112' }).getAttribute('href')).toBe(EMERGENCY_TEL);
  });

  it('includeHealth false iken sağlık bilgisi basmaz', () => {
    const text = renderText(<FullPlan plan={createTestPlan()} includeHealth={false} />);

    expect(text).not.toContain('Astım');
    expect(text).not.toContain('İnhaler');
    expect(text).not.toContain('A Rh+');
  });

  it('varsayılan olarak sağlık bilgisi basmaz (İ8)', () => {
    const text = renderText(<FullPlan plan={createTestPlan()} />);
    expect(text).not.toContain('Astım');
  });

  it('includeHealth true iken sağlık bölümünü basar', () => {
    const text = renderText(<FullPlan plan={createTestPlan()} includeHealth />);

    expect(text).toContain(tr.print.sections.health);
    expect(text).toContain('Astım');
    expect(text).toContain('İnhaler');
    expect(text).toContain('A Rh+');
  });

  it('plan sağlık izni kapalıysa includeHealth true olsa da sağlık basmaz', () => {
    const text = renderText(
      <FullPlan plan={createTestPlan({ healthOptIn: false })} includeHealth />,
    );
    expect(text).not.toContain('Astım');
  });

  it('ev adresini ve planın bölümlerini basar', () => {
    const text = renderText(<FullPlan plan={createTestPlan()} />);

    expect(text).toContain('Örnek Mahallesi 12. Sokak No 3 Daire 4');
    for (const section of [
      tr.print.sections.meeting,
      tr.print.sections.household,
      tr.print.sections.members,
      tr.print.sections.contacts,
      tr.print.sections.home,
      tr.print.sections.roles,
      tr.print.sections.bag,
      tr.print.sections.review,
    ]) {
      expect(text).toContain(section);
    }
  });

  it('üç sayfa bloğu ve her sayfada alt bilgi basar', () => {
    render(<FullPlan plan={createTestPlan()} />);

    expect(document.querySelectorAll('.print-sheet')).toHaveLength(3);
    expect(screen.getAllByText(footerLine(PLAN_DATE))).toHaveLength(3);
  });
});

describe('FridgeSheet (§12.2)', () => {
  it('112, buluşma yerleri, acil kişiler, vana yerleri, çanta ve görevleri basar', () => {
    render(<FridgeSheet plan={createTestPlan()} />);
    const text = pageText();

    expect(screen.getByRole('link', { name: '112' }).getAttribute('href')).toBe(EMERGENCY_TEL);
    expect(text).toContain('Park');
    expect(text).toContain('Zeynep Kaya');
    expect(text).toContain('Girişteki dolapta');
    expect(text).toContain('Giriş dolabı');
    expect(text).toContain(tr.wizard.roles.canta);
  });

  it('plan sağlık bilgisi içerse de sağlık bilgisi basmaz', () => {
    const text = renderText(<FridgeSheet plan={createTestPlan()} />);

    expect(text).not.toContain('Astım');
    expect(text).not.toContain('İnhaler');
    expect(text).not.toContain('Polen');
    expect(text).not.toContain('A Rh+');
    expect(text).not.toContain('İşitme cihazı');
    expect(text).not.toContain(tr.print.sections.health);
  });

  it('tek sayfa ve alt bilgi içerir', () => {
    render(<FridgeSheet plan={createTestPlan()} />);

    expect(document.querySelectorAll('.print-sheet')).toHaveLength(1);
    expect(screen.getByText(footerLine(PLAN_DATE))).not.toBeNull();
  });
});

describe('WalletCards (§12.3)', () => {
  it('kişi başına ön ve arka yüz basar', () => {
    render(<WalletCards plan={createTestPlan()} />);

    expect(document.querySelectorAll('.wallet-card--front')).toHaveLength(2);
    expect(document.querySelectorAll('.wallet-card--back')).toHaveLength(2);
    expect(document.querySelectorAll('.wallet-card__fold')).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: '112' })).toHaveLength(2);

    const text = pageText();
    expect(text).toContain('Ayşe Yılmaz');
    expect(text).toContain('Mehmet Yılmaz');
    expect(text).toContain('Yılmaz ailesi');
    expect(text).toContain('Zeynep Kaya');
    expect(text).toContain('Park');
  });

  it('kan grubunu ve tek satır notu yalnızca ayrı onayla basar', () => {
    const withoutConsent = renderText(<WalletCards plan={createTestPlan()} />);
    expect(withoutConsent).not.toContain('A Rh+');
    expect(withoutConsent).not.toContain('Yedek anahtar komşuda.');

    const withConsent = renderText(
      <WalletCards plan={createTestPlan()} includeBloodType includeWalletNote />,
    );
    expect(withConsent).toContain('A Rh+');
    expect(withConsent).toContain('Yedek anahtar komşuda.');
    // Tek satır not: yalnızca ilk satır basılır (§12.3).
    expect(withConsent).not.toContain('İkinci satır.');
  });

  it('ev adresini basmaz', () => {
    const text = renderText(<WalletCards plan={createTestPlan()} />);
    expect(text).not.toContain('Örnek Mahallesi');
  });

  it('A4 sayfada dörtten fazla kartı yeni sayfaya taşır', () => {
    const members: Member[] = Array.from({ length: 5 }, (_unused, index) => ({
      id: `extra-${index}`,
      name: `Kişi ${index}`,
      group: 'yetiskin' as const,
      phone: '0555 000 00 00',
      dailyPlaces: [],
      needs: { mobility: false, hearing: false, vision: false, communication: false, note: '' },
    }));
    render(<WalletCards plan={createTestPlan({ members })} />);

    expect(document.querySelectorAll('.wallet-row')).toHaveLength(5);
    expect(document.querySelectorAll('.print-sheet')).toHaveLength(2);
  });
});

describe('ChildCards (§12.4)', () => {
  it('çocuk kartında ev adresi yoktur', () => {
    const text = renderText(<ChildCards plan={createTestPlan()} />);

    expect(text).not.toContain('Örnek Mahallesi');
    expect(text).not.toContain('Daire 4');
    expect(text).toContain('Mehmet Yılmaz');
  });

  it('ad, iki veli telefonu, şehir dışı kişi, buluşma yeri ve teslim alacakları basar', () => {
    const text = renderText(<ChildCards plan={createTestPlan()} />);

    expect(text).toContain(tr.print.childCards.family);
    expect(text).toContain('Ayşe Yılmaz — 0212 555 44 33');
    expect(text).toContain('Zeynep Kaya — 0532 111 22 33');
    expect(text).toContain(tr.print.childCards.pickUp);
    expect(text).toContain('Park');
    // Yalnızca "çocukları teslim alabilir" işaretli kişi yazılır.
    expect(text).not.toContain('Komşu Ali');
  });

  it('okul adını yalnızca includeSchoolName ile basar', () => {
    const withoutSchool = renderText(<ChildCards plan={createTestPlan()} />);
    expect(withoutSchool).not.toContain('Atatürk İlkokulu');

    const withSchool = renderText(<ChildCards plan={createTestPlan()} includeSchoolName />);
    expect(withSchool).toContain('Atatürk İlkokulu');
  });

  it('planda çocuk yoksa bilgi satırı basar', () => {
    const plan = createTestPlan();
    const adultsOnly = plan.members.filter((member) => member.group !== 'cocuk');
    const text = renderText(<ChildCards plan={createTestPlan({ members: adultsOnly })} />);

    expect(text).toContain(tr.print.childCards.noChildren);
  });
});

describe('BagChecklist (§12.5)', () => {
  it('üretilmiş listeyi kutularla, çantanın yeri ve boş kontrol satırıyla basar', () => {
    const plan = createTestPlan({
      bag: { location: 'Giriş dolabı', items: [], lastCheckedAt: null },
    });
    render(<BagChecklist plan={plan} />);
    const text = pageText();

    expect(document.querySelectorAll('.print-check').length).toBeGreaterThanOrEqual(18);
    expect(text).toContain('Giriş dolabı');
    expect(text).toContain(tr.print.bagList.lastCheckedBlank);
    expect(document.querySelectorAll('.print-blank__line').length).toBe(1);
  });

  it('madde metinlerini içerik kaydından ve kullanıcı notundan alır', () => {
    const text = renderText(<BagChecklist plan={createTestPlan()} />);

    expect(text).toContain('Su');
    expect(text).toContain('6 şişe');
    expect(text).toContain('Uzun süre bozulmayan kuru gıda');
  });

  it('altında kaynak notu basar', () => {
    const text = renderText(<BagChecklist plan={createTestPlan()} />);

    expect(text).toContain('Kaynak: AFAD');
    expect(text).toContain('Erişim tarihi: 19.11.2026');
  });
});

describe('BlankForm (§12.6)', () => {
  it('plansız basılır ve kişisel veri içermez', () => {
    const text = renderText(<BlankForm date={PLAN_DATE} />);

    expect(text).toContain(tr.print.blankForm.intro);
    expect(text).not.toContain('Yılmaz');
    expect(text).not.toContain('Örnek Mahallesi');
    expect(text).not.toContain('Ayşe');
    // Elle doldurulacak satırlar ve 112 yönlendirmesi bulunur.
    expect(document.querySelectorAll('.print-blank__line').length).toBeGreaterThan(10);
    expect(screen.getByRole('link', { name: '112' }).getAttribute('href')).toBe(EMERGENCY_TEL);
  });

  it('iki sayfa bloğu ve her sayfada alt bilgi basar', () => {
    render(<BlankForm date={PLAN_DATE} />);

    expect(document.querySelectorAll('.print-sheet')).toHaveLength(2);
    expect(screen.getAllByText(footerLine(PLAN_DATE))).toHaveLength(2);
  });
});

describe('ortak baskı kuralları (§12)', () => {
  it('her belgede alt bilgi cümlesi vardır', () => {
    const plan = createTestPlan();
    const documents = [
      <FullPlan key="full" plan={plan} />,
      <FridgeSheet key="fridge" plan={plan} />,
      <WalletCards key="wallet" plan={plan} />,
      <ChildCards key="child" plan={plan} />,
      <BagChecklist key="bag" plan={plan} />,
      <BlankForm key="blank" date={PLAN_DATE} />,
    ];

    for (const document of documents) {
      const { container, unmount } = render(document);
      expect(normalizeText(container.textContent)).toContain(footerLine(PLAN_DATE));
      unmount();
    }
  });

  it('alt bilgi cümlesi şartnamedeki metindir', () => {
    expect(footerLine(PLAN_DATE)).toBe(
      `İlk 72 ile hazırlandı · ${PLAN_DATE_TEXT} · Resmî bir belge değildir.`,
    );
  });

  it('112 bağlantısı tel:112 ve 112 metniyledir', () => {
    render(<FullPlan plan={createTestPlan()} />);

    const link = screen.getByRole('link', { name: '112' });
    expect(link.getAttribute('href')).toBe(EMERGENCY_TEL);
    expect(EMERGENCY_TEL).toBe('tel:112');
    expect(link.textContent).toBe('112');
  });

  it('XSS denemesi düz metin olarak basılır (§18.4-9)', () => {
    const plan = createTestPlan({ notes: '<img src=x onerror=alert(1)>' });
    const text = renderText(<FullPlan plan={plan} />);

    expect(text).toContain('<img src=x onerror=alert(1)>');
    expect(document.querySelector('img')).toBeNull();
  });
});

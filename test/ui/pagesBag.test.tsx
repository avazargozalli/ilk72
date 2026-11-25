/**
 * Şartname §11.6 — çanta kontrol listesi sayfası.
 *
 * Ölçütler:
 * - Liste `buildBagItemIds` + `mergeBagItems` ile haneye göre üretilir:
 *   bebek → C-20…C-23, çocuk → C-24, özel ihtiyaç → C-30/C-31, yaşlı ya da ilaç
 *   → C-32, evcil hayvan → C-40/C-41.
 * - Önceki işaretler ve notlar `id` üzerinden korunur.
 * - Çantanın yeri ve son kontrol tarihi düzenlenebilir; değişiklik `onChange`
 *   ile yukarı akar.
 * - `onChange` verilmezse liste salt okunur olur.
 */
import { fireEvent, render, screen } from '@testing-library/preact';
import { describe, expect, it, vi } from 'vitest';
import { ROUTES } from '../../src/config.ts';
import { formatText, tr } from '../../src/i18n/tr.ts';
import { BASE_BAG_ITEM_IDS, buildBagItemIds } from '../../src/model/bag.ts';
import { createEmptyMember, createEmptyPlan } from '../../src/model/defaults.ts';
import type { Plan } from '../../src/model/types.ts';
import { Bag } from '../../src/ui/pages/Bag.tsx';

/** Altı çizili maddelerin etiketleri (içerik kaydından). */
const ITEM_TEXTS = {
  water: 'İçme suyu',
  babyFood: 'Bebeğiniz kullanıyorsa kendi maması',
  childToy: 'Çocuğunuzun sevdiği küçük bir oyuncak',
  prescription: 'Reçete ve ilaç listesinin kopyası',
  petFood: 'Evcil hayvan için mama ve su',
} as const;

function checkboxCount(): number {
  return document.querySelectorAll('input[type="checkbox"]').length;
}

describe('Bag — haneye göre liste (§11.6)', () => {
  it('boş hanede temel maddeleri (C-01…C-18) listeler', () => {
    const plan = createEmptyPlan();
    render(<Bag plan={plan} onChange={() => {}} />);

    expect(checkboxCount()).toBe(BASE_BAG_ITEM_IDS.length);
    expect(screen.getByLabelText(ITEM_TEXTS.water)).toBeTruthy();
    expect(
      screen.getByText(
        formatText(tr.pages.bag.itemsCount, {
          done: 0,
          total: BASE_BAG_ITEM_IDS.length,
        }),
      ),
    ).toBeTruthy();
  });

  it('bebek, çocuk, yaşlı ve evcil hayvan koşullarında ek maddeleri ekler', () => {
    const plan: Plan = {
      ...createEmptyPlan(),
      members: [
        { ...createEmptyMember('bebek'), name: 'Bebek' },
        { ...createEmptyMember('cocuk'), name: 'Çocuk' },
        { ...createEmptyMember('yasli'), name: 'Dede' },
      ],
      pets: [{ id: 'pet-1', name: 'Pamuk', kind: 'kedi', note: '' }],
    };
    render(<Bag plan={plan} onChange={() => {}} />);

    const ids = buildBagItemIds(plan);
    expect(ids).toContain('C-20');
    expect(ids).toContain('C-24');
    expect(ids).toContain('C-32');
    expect(ids).toContain('C-40');
    expect(checkboxCount()).toBe(ids.length);

    expect(screen.getByLabelText(ITEM_TEXTS.babyFood)).toBeTruthy();
    expect(screen.getByLabelText(ITEM_TEXTS.childToy)).toBeTruthy();
    expect(screen.getByLabelText(ITEM_TEXTS.prescription)).toBeTruthy();
    expect(screen.getByLabelText(ITEM_TEXTS.petFood)).toBeTruthy();
  });

  it('özel ihtiyaç işaretli kişide yardımcı malzeme maddelerini ekler', () => {
    const member = {
      ...createEmptyMember('yetiskin'),
      name: 'Ayşe',
      needs: {
        mobility: true,
        hearing: false,
        vision: false,
        communication: false,
        note: '',
      },
    };
    const plan: Plan = { ...createEmptyPlan(), members: [member] };
    render(<Bag plan={plan} onChange={() => {}} />);

    const ids = buildBagItemIds(plan);
    expect(ids).toContain('C-30');
    expect(ids).toContain('C-31');
    expect(checkboxCount()).toBe(ids.length);
  });

  it('önceki işaretleri ve notları id üzerinden korur', () => {
    const plan: Plan = {
      ...createEmptyPlan(),
      bag: {
        location: 'Koridor dolabı',
        items: [{ id: 'C-01', done: true, note: '2 şişe' }],
        lastCheckedAt: '2026-05-04',
      },
    };
    render(<Bag plan={plan} onChange={() => {}} />);

    const water = screen.getByLabelText(ITEM_TEXTS.water);
    expect(water instanceof HTMLInputElement).toBe(true);
    if (water instanceof HTMLInputElement) {
      expect(water.checked).toBe(true);
    }
    expect(screen.getByText('2 şişe')).toBeTruthy();
    expect((screen.getByLabelText(tr.wizard.fields.bagLocation) as HTMLInputElement).value).toBe(
      'Koridor dolabı',
    );
    expect((screen.getByLabelText(tr.pages.bag.lastCheckedAt) as HTMLInputElement).value).toBe(
      '2026-05-04',
    );
  });

  it('kullanıcı maddesinin adını not alanından okur (§11.6, K-13)', () => {
    const plan: Plan = {
      ...createEmptyPlan(),
      bag: {
        location: '',
        items: [{ id: 'ozel-deneme', done: true, note: 'Kedi maması' }],
        lastCheckedAt: null,
      },
    };
    render(<Bag plan={plan} onChange={() => {}} />);

    const custom = screen.getByLabelText('Kedi maması');
    expect(custom instanceof HTMLInputElement).toBe(true);
    if (custom instanceof HTMLInputElement) {
      expect(custom.checked).toBe(true);
    }
  });
});

describe('Bag — düzenleme', () => {
  it('kutu işaretlenince güncel listeyi onChange ile yukarı akıtır', () => {
    const onChange = vi.fn();
    const plan = createEmptyPlan();
    render(<Bag plan={plan} onChange={onChange} />);

    fireEvent.click(screen.getByLabelText(ITEM_TEXTS.water));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        bag: expect.objectContaining({
          location: '',
          items: expect.arrayContaining([expect.objectContaining({ id: 'C-01', done: true })]),
        }),
      }),
    );

    const patch = onChange.mock.calls[0]?.[0] as Partial<Plan> | undefined;
    expect(patch?.bag?.items).toHaveLength(buildBagItemIds(plan).length);
  });

  it('çantanın yerini ve son kontrol tarihini düzenler', () => {
    const onChange = vi.fn();
    render(<Bag plan={createEmptyPlan()} onChange={onChange} />);

    fireEvent.input(screen.getByLabelText(tr.wizard.fields.bagLocation), {
      target: { value: 'Koridor dolabı' },
    });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        bag: expect.objectContaining({ location: 'Koridor dolabı' }),
      }),
    );

    fireEvent.input(screen.getByLabelText(tr.pages.bag.lastCheckedAt), {
      target: { value: '2026-05-04' },
    });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        bag: expect.objectContaining({ lastCheckedAt: '2026-05-04' }),
      }),
    );
  });

  it('tarih alanı boşaltılınca null yazar', () => {
    const onChange = vi.fn();
    const plan: Plan = {
      ...createEmptyPlan(),
      bag: { location: '', items: [], lastCheckedAt: '2026-05-04' },
    };
    render(<Bag plan={plan} onChange={onChange} />);

    fireEvent.input(screen.getByLabelText(tr.pages.bag.lastCheckedAt), {
      target: { value: '' },
    });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        bag: expect.objectContaining({ lastCheckedAt: null }),
      }),
    );
  });

  it('onChange verilmezse listeyi salt okunur gösterir', () => {
    render(<Bag plan={createEmptyPlan()} />);

    const water = screen.getByLabelText(ITEM_TEXTS.water);
    expect(water instanceof HTMLInputElement && water.disabled).toBe(true);
    expect(screen.getByText(tr.pages.bag.readOnly)).toBeTruthy();
  });

  it('çanta kontrol listesinin yazdırma sayfasına bağlantı verir (İ3)', () => {
    render(<Bag plan={createEmptyPlan()} onChange={() => {}} />);

    expect(screen.getByRole('link', { name: tr.pages.bag.printLink }).getAttribute('href')).toBe(
      ROUTES.print,
    );
  });
});

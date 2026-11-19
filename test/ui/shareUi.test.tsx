/**
 * Şartname §10.1, §10.2, §18.4-4, İ8 — paylaşım sayfası.
 *
 * Ölçütler:
 * - "Özel ihtiyaç notlarını da ekle" kutusu ve §10.1 uyarısı **birebir**.
 * - Parolasız yük `1p.`, parolalı yük `1e.`; kart `decodeShare` + `validateCard`
 *   ile geri okunabilir.
 * - Kare kod SVG'si `dangerouslySetInnerHTML` olmadan çizilir; uzunluk
 *   aşımında `null` → §10.2 iletisi.
 * - Bağlantı kopyalama `navigator.clipboard` ile; yoksa seçilebilir metin + not.
 * - `navigator.share` yokken "Paylaş" düğmesi gizlenir.
 * - Ev adresi ve sağlık bilgisi karta girmez; ekranda bu bir notla söylenir.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen, waitFor } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { tr } from '../../src/i18n/tr.ts';
import {
  createEmptyContact,
  createEmptyMember,
  createEmptyPlan,
} from '../../src/model/defaults.ts';
import type { Plan } from '../../src/model/types.ts';
import {
  buildShareCard,
  decodeShare,
  SHARE_CARD_LIMITS,
  validateCard,
} from '../../src/share/index.ts';
import { Share } from '../../src/ui/pages/Share.tsx';
import { buttonByName, normalizeText } from './helpers.tsx';
import { fullPlan } from './pagesFixtures.tsx';

function stubClipboard(value: unknown): void {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value });
}

function stubShare(value: unknown): void {
  Object.defineProperty(navigator, 'share', { configurable: true, value });
}

afterEach(() => {
  // Kendi tanımladığımız gölge özellikleri kaldırır; happy-dom'un kendi
  // `Navigator` getter'ları yeniden görünür olur.
  Reflect.deleteProperty(navigator, 'clipboard');
  Reflect.deleteProperty(navigator, 'share');
});

function payloadOf(url: string): string {
  const at = url.indexOf('#/al/');
  return at < 0 ? '' : url.slice(at + '#/al/'.length);
}

async function generateLink(): Promise<string> {
  fireEvent.click(buttonByName(tr.share.send.generate));
  const input = (await screen.findByLabelText(tr.share.link.label)) as HTMLInputElement;
  await waitFor(() => expect(input.value).not.toBe(''));
  return input.value;
}

/** QR sınırını aşacak kadar uzun, sıkıştırılamayan bir plan. */
function oversizedPlan(): Plan {
  const unique = (): string => crypto.randomUUID();
  const members = Array.from({ length: 12 }, (_, index) => ({
    ...createEmptyMember('yetiskin'),
    name: `${index}${unique()}`.slice(0, SHARE_CARD_LIMITS.nameLength),
    phone: unique().slice(0, SHARE_CARD_LIMITS.phoneLength),
    needs: {
      mobility: false,
      hearing: false,
      vision: false,
      communication: false,
      note: unique().repeat(4).slice(0, SHARE_CARD_LIMITS.needsNoteLength),
    },
  }));
  const contacts = Array.from({ length: 10 }, (_, index) => ({
    ...createEmptyContact(),
    name: `${index}${unique()}`.slice(0, SHARE_CARD_LIMITS.nameLength),
    phone: unique().slice(0, SHARE_CARD_LIMITS.phoneLength),
    city: unique().slice(0, SHARE_CARD_LIMITS.cityLength),
  }));

  return {
    ...createEmptyPlan(),
    household: { label: unique(), address: 'Deneme sokak 1', buildingNote: '', floorCount: '' },
    members,
    contacts,
    meeting: {
      nearHome: { label: unique().repeat(6), detail: '' },
      neighborhood: { label: unique().repeat(6), detail: '' },
      outOfArea: { label: unique().repeat(6), detail: '' },
      assemblyArea: { label: unique().repeat(6), detail: '' },
      assemblyCheckedAt: null,
    },
    notes: unique().repeat(9).slice(0, SHARE_CARD_LIMITS.notesLength),
  };
}

describe('Share — kart ve seçenekler (§10.1)', () => {
  it('özel ihtiyaç notu kutusunu ve uyarı metnini birebir gösterir', () => {
    render(<Share plan={fullPlan()} />);

    expect(screen.getByText(tr.share.options.includeNeedsNotes)).toBeTruthy();
    expect(
      screen.getByText(
        'Bu notlar sağlık bilgisi içerebilir. Bağlantıyı gören herkes okuyabilir. Parola koymanızı öneririz.',
      ),
    ).toBeTruthy();
    expect(tr.share.options.includeNeedsNotesWarning).toBe(
      'Bu notlar sağlık bilgisi içerebilir. Bağlantıyı gören herkes okuyabilir. Parola koymanızı öneririz.',
    );
  });

  it('ev adresi ve sağlık bilgisinin karta girmediğini bir notla söyler', () => {
    render(<Share plan={fullPlan()} />);

    expect(screen.getByText(tr.share.card.excluded)).toBeTruthy();
    // Ev adresi ve sağlık bilgisi ekranda da karta da yazılmaz.
    const text = normalizeText(document.body.textContent);
    expect(text).not.toContain('Deneme sokak 1');
    expect(text).not.toContain('Astım');
  });

  it('kutu işaretsizken yükte özel ihtiyaç notu bulunmaz', async () => {
    const plan = fullPlan();
    render(<Share plan={plan} />);

    const payload = payloadOf(await generateLink());
    const card = validateCard(await decodeShare(payload));

    expect(payload.startsWith('1p.')).toBe(true);
    expect(card.k.every((person) => person.o === undefined)).toBe(true);
    expect(card).toEqual(buildShareCard(plan, { includeNeedsNotes: false, includeHealth: false }));
  });

  it('kutu işaretlenince özel ihtiyaç notu karta eklenir', async () => {
    const plan = fullPlan();
    render(<Share plan={plan} />);

    fireEvent.click(screen.getByLabelText(tr.share.options.includeNeedsNotes));
    const payload = payloadOf(await generateLink());
    const card = validateCard(await decodeShare(payload));

    const adult = card.k.find((person) => person.a === 'Ayşe Yılmaz');
    expect(adult?.o).toBe('Merdiven inerken destek gerekir.');
  });
});

describe('Share — yük ve parola (§10.2)', () => {
  it('parolasız bağlantı üretir ve bağlantıyı metin alanında gösterir', async () => {
    render(<Share plan={fullPlan()} />);

    const url = await generateLink();
    expect(url).toContain('#/al/1p.');
    const input = screen.getByLabelText(tr.share.link.label) as HTMLInputElement;
    expect(input.value).toBe(url);
    expect(input.hasAttribute('readonly')).toBe(true);
  });

  it('parola verilince 1e. yükü üretir ve parolayla açılır', async () => {
    render(<Share plan={fullPlan()} />);

    fireEvent.input(screen.getByLabelText(tr.share.password.label), {
      target: { value: 'aile-parolasi' },
    });
    const url = await generateLink();

    expect(url).toContain('#/al/1e.');
    const payload = payloadOf(url);
    const card = validateCard(await decodeShare(payload, 'aile-parolasi'));
    expect(card.h).toBe('Yılmaz ailesi');
    await expect(decodeShare(payload)).rejects.toThrow('parola-gerekli');
  }, 20_000);
});

describe('Share — kare kod (§10.2)', () => {
  it('bağlantı için güvenli SVG kare kod çizer', async () => {
    const { container } = render(<Share plan={fullPlan()} />);
    await generateLink();

    const svg = await screen.findByRole('img', { name: tr.share.qr.label });
    expect(svg.tagName.toLowerCase()).toBe('svg');
    expect(svg.getAttribute('viewBox')).toMatch(/^0 0 \d+ \d+$/u);
    expect(container.querySelector('svg path')?.getAttribute('d')?.startsWith('M')).toBe(true);
    expect(container.querySelector('svg')?.innerHTML).not.toContain('<script');
  });

  it('uzunluk aşılınca kare kod çizmez ve §10.2 iletisini gösterir', async () => {
    render(<Share plan={oversizedPlan()} />);
    await generateLink();

    expect(await screen.findByText(tr.share.qr.tooLong)).toBeTruthy();
    expect(screen.queryByRole('img', { name: tr.share.qr.label })).toBeNull();
  });
});

describe('Share — kopyalama ve sistem paylaşımı (§10.2)', () => {
  it('Bağlantıyı kopyala düğmesi panoya yazar ve durumu duyurur', async () => {
    const writeText = vi.fn(async () => undefined);
    stubClipboard({ writeText });
    render(<Share plan={fullPlan()} />);

    const url = await generateLink();
    fireEvent.click(buttonByName(tr.share.link.copy));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(url));
    expect(await screen.findByText(tr.share.link.copied)).toBeTruthy();
  });

  it('pano yoksa seçilebilir metin bırakır ve elle kopyalama notu gösterir', async () => {
    stubClipboard(undefined);
    render(<Share plan={fullPlan()} />);

    await generateLink();
    fireEvent.click(buttonByName(tr.share.link.copy));

    expect(await screen.findByText(tr.share.link.copyFailed)).toBeTruthy();
    const input = screen.getByLabelText(tr.share.link.label) as HTMLInputElement;
    expect(input.hasAttribute('readonly')).toBe(true);
  });

  it('navigator.share yokken Paylaş düğmesini göstermez', () => {
    stubShare(undefined);
    render(<Share plan={fullPlan()} />);

    expect(screen.queryByRole('button', { name: tr.share.systemShare.action })).toBeNull();
  });

  it('navigator.share varsa Paylaş düğmesi bağlantıyla çağırır', async () => {
    const share = vi.fn(async () => undefined);
    stubShare(share);
    render(<Share plan={fullPlan()} />);

    const url = await generateLink();
    fireEvent.click(buttonByName(tr.share.systemShare.action));

    await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
    const calls = share.mock.calls as unknown as Array<[ShareData]>;
    expect(calls[0]?.[0]?.url).toBe(url);
  });
});

describe('Share — kaynak kuralları (§17)', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/ui/pages/Share.tsx'), 'utf8');

  it('dangerouslySetInnerHTML kullanmaz', () => {
    expect(source).not.toContain('dangerouslySetInnerHTML');
  });

  it('CSS import etmez ve depoyu import etmez', () => {
    expect(source).not.toMatch(/from '[^']*\.css'/u);
    expect(source).not.toMatch(/from '[^']*storage\//u);
  });
});

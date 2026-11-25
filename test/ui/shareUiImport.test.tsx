/**
 * Şartname §10.3, §18.4-4 — gönderilen plan özetini içe alma sayfası.
 *
 * Ölçütler:
 * - Geçersiz/bozuk yük Türkçe hata iletisiyle gösterilir (§10.3/1, Ek B.3).
 * - Parolalı yükte parola istenir; yanlış parola veri silmeden yeniden denenir.
 * - Önizleme metni birebir; kart **düz metin** olarak gösterilir (§10.3/3).
 * - İki seçenek: "Yalnızca görüntüle ve yazdır" (varsayılan) ve "Kendi planıma ekle".
 * - Birleştirmede çakışan alanlar kullanıcıya sorulur; onaysız ezilmez (§10.3/4).
 * - Telefon yalnız §8.2 karakter kümesine uyuyorsa `tel:` bağlantısı olur (§10.3/5).
 * - İşlem bitince yük `history.replaceState` ile adres çubuğundan silinir (§10.3/6).
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
import type { Member, Plan } from '../../src/model/types.ts';
import { buildShareCard, encodeShare, type ShareCard } from '../../src/share/index.ts';
import { Import } from '../../src/ui/pages/Import.tsx';
import { buttonByName } from './helpers.tsx';

afterEach(() => {
  vi.restoreAllMocks();
});

function member(name: string, phone: string, note = ''): Member {
  const template = createEmptyMember('yetiskin');
  return {
    ...template,
    id: `member-${name}`,
    name,
    phone,
    needs: { ...template.needs, note },
  };
}

function planOf(overrides: Partial<Plan> = {}): Plan {
  return { ...createEmptyPlan(), ...overrides };
}

/** Birleştirme sınamaları için tek kişilik, tek acil kişilik, tek buluşma yeri olan plan. */
function incomingPlan(): Plan {
  const contact = createEmptyContact();
  return planOf({
    household: { label: 'Yılmaz ailesi', address: '', buildingNote: '', floorCount: '' },
    members: [member('Ayşe Yılmaz', '0555 111 22 33')],
    contacts: [
      {
        ...contact,
        id: 'contact-incoming',
        name: 'Fatma Demir',
        relation: 'teyze',
        phone: '0555 444 55 66',
        outOfArea: true,
        city: 'İzmir',
      },
    ],
    meeting: {
      nearHome: { label: 'Karşı park', detail: '' },
      neighborhood: { label: '', detail: '' },
      outOfArea: { label: '', detail: '' },
      assemblyArea: { label: '', detail: '' },
      assemblyCheckedAt: null,
    },
    notes: 'Okuldan öğretmen teslim edecek.',
  });
}

async function payloadOf(plan: Plan, passphrase?: string): Promise<string> {
  return encodeShare(
    buildShareCard(plan, { includeNeedsNotes: true, includeHealth: false }),
    passphrase,
  );
}

async function renderPreview(
  plan: Plan,
  props: { plan?: Plan | null; onViewOnly?: () => void; onMerge?: (merged: Plan) => void } = {},
): Promise<void> {
  const payload = await payloadOf(plan);
  render(<Import payload={payload} {...props} />);
  expect(await screen.findByText(tr.share.receive.intro)).toBeTruthy();
}

describe('Import — hatalar (§10.3/1)', () => {
  it('geçersiz yükü Türkçe iletiyle gösterir', async () => {
    render(<Import payload="bozuk-yuk" />);

    expect(await screen.findByText(tr.error.codes['gecersiz-baglanti'])).toBeTruthy();
    expect(screen.getByText(tr.share.receive.errorTitle)).toBeTruthy();
    expect(screen.queryByText(tr.share.receive.intro)).toBeNull();
  });

  it('bozulmuş yükü Türkçe iletiyle gösterir', async () => {
    render(<Import payload="1p.AAAA" />);

    expect(await screen.findByText(tr.error.codes['bozuk-veri'])).toBeTruthy();
  });

  it('şema doğrulaması başarısızsa bozuk-veri iletisini gösterir', async () => {
    const payload = await encodeShare({ v: 2, h: 'x' } as unknown as ShareCard);
    render(<Import payload={payload} />);

    expect(await screen.findByText(tr.error.codes['bozuk-veri'])).toBeTruthy();
  });
});

describe('Import — parola (§10.3/1)', () => {
  it('parolalı yükte parola ister, yanlış parolayı bildirir, doğru parolayla açar', async () => {
    const payload = await payloadOf(incomingPlan(), 'aile-parolasi');
    render(<Import payload={payload} />);

    expect(await screen.findByText(tr.share.receive.passwordPrompt)).toBeTruthy();
    const input = screen.getByLabelText(tr.share.receive.passwordLabel);

    fireEvent.input(input, { target: { value: 'yanlis-parola' } });
    fireEvent.click(buttonByName(tr.share.receive.submit));
    expect(await screen.findByText(tr.error.codes['parola-yanlis-veya-bozuk'])).toBeTruthy();

    fireEvent.input(input, { target: { value: 'aile-parolasi' } });
    fireEvent.click(buttonByName(tr.share.receive.submit));
    expect(await screen.findByText(tr.share.receive.intro)).toBeTruthy();
  }, 30_000);
});

describe('Import — önizleme (§10.3/3)', () => {
  it('özet metnini birebir ve kartı düz metin olarak gösterir', async () => {
    await renderPreview(incomingPlan());

    expect(tr.share.receive.intro).toBe(
      'Size bir aile afet planı özeti gönderildi. Göndereni tanıyorsanız kullanın.',
    );
    expect(screen.getByText('Yılmaz ailesi')).toBeTruthy();
    expect(screen.getByText('Ayşe Yılmaz')).toBeTruthy();
    expect(screen.getByText('Fatma Demir (teyze)')).toBeTruthy();
    expect(screen.getByText('Karşı park')).toBeTruthy();
    expect(screen.getByText('Okuldan öğretmen teslim edecek.')).toBeTruthy();
    expect(document.querySelector('script')).toBeNull();
  });

  it('§8.2 karakter kümesine uyan telefonu tel: bağlantısı yapar', async () => {
    await renderPreview(incomingPlan());

    const link = screen.getByRole('link', { name: '0555 111 22 33' });
    expect(link.getAttribute('href')).toBe('tel:05551112233');
  });

  it('§8.2 karakter kümesine uymayan telefonu düz metin bırakır', async () => {
    const card: ShareCard = {
      v: 1,
      h: '',
      u: '',
      k: [{ a: 'Test Kişi', t: '05ab<' }],
      i: [],
      b: { e: '', m: '', d: '', t: '' },
      n: '',
    };
    const payload = await encodeShare(card);
    render(<Import payload={payload} />);

    expect(await screen.findByText('Test Kişi')).toBeTruthy();
    expect(screen.getByText('05ab<')).toBeTruthy();
    expect(screen.queryByRole('link', { name: '05ab<' })).toBeNull();
    expect(document.querySelector('script')).toBeNull();
  });
});

describe('Import — seçenekler (§10.3/4)', () => {
  it('varsayılan seçenek "Yalnızca görüntüle ve yazdır"dır', async () => {
    await renderPreview(incomingPlan());

    const viewOnly = screen.getByRole('radio', { name: tr.share.receive.viewOnly });
    expect((viewOnly as HTMLInputElement).checked).toBe(true);
  });

  it('plan yokken birleştirme seçeneği kapalıdır ve yönlendirme gösterilir', async () => {
    await renderPreview(incomingPlan(), { plan: null });

    expect(
      (screen.getByRole('radio', { name: tr.share.receive.merge }) as HTMLInputElement).disabled,
    ).toBe(true);
    expect(screen.getByText(tr.share.receive.noPlanNote)).toBeTruthy();
  });

  it('yalnızca görüntüle seçilince yazdırır, yükü adres çubuğundan siler', async () => {
    const replaceState = vi.spyOn(history, 'replaceState');
    const onViewOnly = vi.fn();
    const payload = await payloadOf(incomingPlan());
    render(<Import payload={payload} onViewOnly={onViewOnly} />);
    await screen.findByText(tr.share.receive.intro);

    fireEvent.click(buttonByName(tr.share.receive.print));

    await waitFor(() => expect(onViewOnly).toHaveBeenCalledTimes(1));
    expect(replaceState).toHaveBeenCalledTimes(1);
    const target = replaceState.mock.calls[0]?.[2];
    expect(String(target)).not.toContain(payload);
    expect(await screen.findByText(tr.share.receive.done)).toBeTruthy();
  });
});

describe('Import — birleştirme (§10.3/4)', () => {
  it('aynı adlı mevcut kişileri belirsiz bir kayıtla birleştirmez', async () => {
    const target = planOf({
      members: [member('Ayşe Yılmaz', '0555 100 00 00'), member('Ayşe Yılmaz', '0555 200 00 00')],
    });
    const onMerge = vi.fn();
    await renderPreview(planOf({ members: [member('Ayşe Yılmaz', '0555 300 00 00')] }), {
      plan: target,
      onMerge,
    });

    fireEvent.click(screen.getByRole('radio', { name: tr.share.receive.merge }));
    expect(screen.queryByText(tr.share.receive.conflict.title)).toBeNull();
    fireEvent.click(buttonByName(tr.share.receive.mergeApply));

    const merged = onMerge.mock.calls[0]?.[0] as Plan;
    expect(merged.members.map((entry) => entry.phone)).toEqual([
      '0555 100 00 00',
      '0555 200 00 00',
      '0555 300 00 00',
    ]);
  });

  it('çakışan alanı sorar; varsayılan olarak mevcut bilgiyi korur', async () => {
    const target = planOf({ members: [member('Ayşe Yılmaz', '0555 999 99 99')] });
    const onMerge = vi.fn();
    await renderPreview(incomingPlan(), { plan: target, onMerge });

    fireEvent.click(screen.getByRole('radio', { name: tr.share.receive.merge }));
    expect(screen.getByText(tr.share.receive.conflict.title)).toBeTruthy();
    expect(screen.getAllByText('0555 111 22 33').length).toBeGreaterThan(0);

    fireEvent.click(buttonByName(tr.share.receive.mergeApply));

    await waitFor(() => expect(onMerge).toHaveBeenCalledTimes(1));
    const merged = onMerge.mock.calls[0]?.[0] as Plan;
    expect(merged.members[0]?.phone).toBe('0555 999 99 99');
  });

  it('kullanıcı "gönderilen bilgiyi kullan" derse çakışan alan güncellenir', async () => {
    const target = planOf({ members: [member('Ayşe Yılmaz', '0555 999 99 99')] });
    const onMerge = vi.fn();
    await renderPreview(incomingPlan(), { plan: target, onMerge });

    fireEvent.click(screen.getByRole('radio', { name: tr.share.receive.merge }));
    const takeOptions = screen.getAllByRole('radio', { name: tr.share.receive.conflict.take });
    fireEvent.click(takeOptions[0] as HTMLInputElement);
    fireEvent.click(buttonByName(tr.share.receive.mergeApply));

    await waitFor(() => expect(onMerge).toHaveBeenCalledTimes(1));
    const merged = onMerge.mock.calls[0]?.[0] as Plan;
    expect(merged.members[0]?.phone).toBe('0555 111 22 33');
  });

  it('çakışmayan kişileri, acil kişileri ve buluşma yerlerini ekler', async () => {
    const onMerge = vi.fn();
    await renderPreview(incomingPlan(), { plan: createEmptyPlan(), onMerge });

    fireEvent.click(screen.getByRole('radio', { name: tr.share.receive.merge }));
    fireEvent.click(buttonByName(tr.share.receive.mergeApply));

    await waitFor(() => expect(onMerge).toHaveBeenCalledTimes(1));
    const merged = onMerge.mock.calls[0]?.[0] as Plan;
    expect(merged.members.some((entry) => entry.name === 'Ayşe Yılmaz')).toBe(true);
    expect(merged.contacts.some((entry) => entry.name === 'Fatma Demir')).toBe(true);
    expect(merged.contacts[0]?.outOfArea).toBe(true);
    expect(merged.contacts[0]?.city).toBe('İzmir');
    expect(merged.meeting.nearHome.label).toBe('Karşı park');
  });

  it('birleştirme de yükü adres çubuğundan siler ve sonucu duyurur', async () => {
    const replaceState = vi.spyOn(history, 'replaceState');
    const payload = await payloadOf(incomingPlan());
    render(<Import payload={payload} plan={createEmptyPlan()} onMerge={vi.fn()} />);
    await screen.findByText(tr.share.receive.intro);

    fireEvent.click(screen.getByRole('radio', { name: tr.share.receive.merge }));
    fireEvent.click(buttonByName(tr.share.receive.mergeApply));

    await waitFor(() => expect(replaceState).toHaveBeenCalledTimes(1));
    expect(await screen.findByText(tr.share.receive.mergeDone)).toBeTruthy();
  });
});

describe('Import — kaynak kuralları (§17)', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/ui/pages/Import.tsx'), 'utf8');

  it('dangerouslySetInnerHTML kullanmaz ve CSS import etmez', () => {
    expect(source).not.toContain('dangerouslySetInnerHTML');
    expect(source).not.toMatch(/from '[^']*\.css'/u);
  });
});

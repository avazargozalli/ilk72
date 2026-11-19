/**
 * Şartname §11.4, §11.5, §18.4-1, §18.4-2 — sihirbaz davranışı.
 *
 * Sihirbaz durumu yukarıdan aldığı için testler küçük bir kabuk (Harness)
 * kullanır: yama uygulanır, plan yeniden çizilir. Böylece "İleri" denetimi,
 * geri dönüşte veri kaybı olmaması ve adım ziyareti gerçek akışta sınanır.
 */
import { fireEvent, render, screen } from '@testing-library/preact';
import { useState } from 'preact/hooks';
import { describe, expect, it, vi } from 'vitest';
import { tr } from '../../src/i18n/tr';
import { createEmptyMember, createEmptyPlan } from '../../src/model/defaults';
import type { Plan } from '../../src/model/types';
import { Wizard } from '../../src/ui/pages/Wizard';
import { defaultReviewDate } from '../../src/ui/pages/wizard/dates';

function Harness({
  initialPlan,
  initialStep,
  onVisit = () => {},
  onFinish = () => {},
  onPatch,
}: {
  initialPlan: Plan;
  initialStep?: number;
  onVisit?: (step: number) => void;
  onFinish?: () => void;
  onPatch?: (patch: Partial<Plan>) => void;
}) {
  const [plan, setPlan] = useState<Plan>(initialPlan);
  const applyPatch = (patch: Partial<Plan>): void => {
    onPatch?.(patch);
    setPlan((current) => ({ ...current, ...patch }));
  };
  return (
    <Wizard
      plan={plan}
      visitedSteps={new Set()}
      onPatch={applyPatch}
      onVisit={onVisit}
      onFinish={onFinish}
      initialStep={initialStep}
    />
  );
}

const heading = (name: string) => screen.getByRole('heading', { level: 1, name });

describe('sihirbaz — gezinme ve adım göstergesi', () => {
  it('1. adımda gösterge "1 / 9 — Haneniz" biçimindedir ve aria-current taşır', () => {
    render(<Harness initialPlan={createEmptyPlan()} />);
    const stepper = screen.getByText(tr.wizard.steps.household.title, {
      selector: '.stepper__title',
    });
    expect(stepper).toBeTruthy();
    expect(document.querySelector('.stepper')?.getAttribute('aria-current')).toBe('step');
    expect(heading(tr.wizard.steps.household.title)).toBeTruthy();
  });

  it('"Sonra doldururum" doğrulama yapmadan sonraki adıma geçer', () => {
    render(<Harness initialPlan={createEmptyPlan()} />);
    fireEvent.click(screen.getByRole('button', { name: tr.wizard.actions.skip }));
    expect(heading(tr.wizard.steps.members.title)).toBeTruthy();
  });

  it('"Geri" önceki adıma döner ve veri kaybettirmez', () => {
    const plan = {
      ...createEmptyPlan(),
      household: { ...createEmptyPlan().household, label: 'Yılmaz ailesi' },
    };
    render(<Harness initialPlan={plan} initialStep={2} />);
    fireEvent.click(screen.getByRole('button', { name: tr.wizard.actions.back }));
    expect(heading(tr.wizard.steps.household.title)).toBeTruthy();
    expect((screen.getByLabelText(tr.wizard.fields.householdLabel) as HTMLInputElement).value).toBe(
      'Yılmaz ailesi',
    );
  });

  it('ilk adım ziyareti onVisit ile bildirilir (§11.8)', () => {
    const onVisit = vi.fn();
    render(<Harness initialPlan={createEmptyPlan()} onVisit={onVisit} />);
    expect(onVisit).toHaveBeenCalledWith(1);
  });

  it('"İleri" adım ziyaretini bildirir', () => {
    const onVisit = vi.fn();
    render(<Harness initialPlan={createEmptyPlan()} onVisit={onVisit} />);
    fireEvent.click(screen.getByRole('button', { name: tr.wizard.actions.next }));
    expect(onVisit).toHaveBeenCalledWith(2);
  });
});

describe('sihirbaz — doğrulama (§11.4)', () => {
  it('2. adımda ad boşken "İleri" geçmez, hata özeti görünür ve odak ilk hatalı alana gider', () => {
    const plan = { ...createEmptyPlan(), members: [createEmptyMember()] };
    render(<Harness initialPlan={plan} initialStep={2} />);

    fireEvent.click(screen.getByRole('button', { name: tr.wizard.actions.next }));

    // Adım değişmedi.
    expect(heading(tr.wizard.steps.members.title)).toBeTruthy();
    // Hata özeti duyuruldu; ileti hem özette hem alanın altında görünür.
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getAllByText(tr.wizard.errors.requiredMemberName).length).toBeGreaterThan(0);
    // Odak ilk hatalı alanda.
    expect(document.activeElement?.id).toBe('member-1-name');
  });

  it('ad doldurulunca "İleri" sonraki adıma geçer', () => {
    const plan = {
      ...createEmptyPlan(),
      members: [{ ...createEmptyMember(), name: 'Ayşe Yılmaz' }],
    };
    render(<Harness initialPlan={plan} initialStep={2} />);
    fireEvent.click(screen.getByRole('button', { name: tr.wizard.actions.next }));
    expect(heading(tr.wizard.steps.needs.title)).toBeTruthy();
  });

  it('alan terk edilince hata görünür, "İleri"ye basmadan', () => {
    const plan = { ...createEmptyPlan(), members: [createEmptyMember()] };
    render(<Harness initialPlan={plan} initialStep={2} />);
    const nameInput = screen.getByLabelText(tr.wizard.fields.memberName);
    fireEvent.blur(nameInput);
    expect(screen.getByText(tr.wizard.errors.requiredMemberName)).toBeTruthy();
  });
});

describe('sihirbaz — adım 8 ve 9', () => {
  it('8. adım çanta listesini haneye göre üretir (bebek → C-20)', () => {
    const plan = {
      ...createEmptyPlan(),
      members: [{ ...createEmptyMember(), name: 'Bebek', group: 'bebek' as const }],
    };
    render(<Harness initialPlan={plan} initialStep={8} />);
    expect(screen.getByText(tr.wizard.fields.bagItemsLegend)).toBeTruthy();
    // C-20 "Bebeğiniz kullanıyorsa kendi maması" maddesi, bebek grubu olduğu için listede olmalı.
    expect(screen.getByLabelText('Bebeğiniz kullanıyorsa kendi maması')).toBeTruthy();
  });

  it('9. adımda sonraki gözden geçirme tarihi varsayılan olarak altı ay sonrasıdır', () => {
    const onPatch = vi.fn();
    render(<Harness initialPlan={createEmptyPlan()} initialStep={9} onPatch={onPatch} />);
    const expected = defaultReviewDate();
    const reviewPatch = onPatch.mock.calls
      .map(([patch]) => patch as Partial<Plan>)
      .find((patch) => patch.review?.nextReviewAt === expected);
    expect(reviewPatch).toBeTruthy();
  });
});

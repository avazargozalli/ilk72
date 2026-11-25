/**
 * Şartname §11.4, §11.5, §11.8 — sihirbaz kabuğu.
 *
 * Dokuz adımı tek yerde yönetir: adım göstergesi, "neden" açıklaması, rehber
 * bağlantısı, hata özeti ve gezinme düğmeleri. Durum **yukarıdan** gelir
 * (`plan` + `onPatch`); bileşen kendi başına saklama katmanına dokunmaz, böylece
 * otomatik kayıt tek bir yerde (uygulama kabuğu) kalır (§11.4).
 *
 * Davranış kuralları:
 * - Doğrulama **alan terk edilince** ve **"İleri"de** çalışır (§11.4); iki yol
 *   da `validation.ts` içindeki aynı kural kümesini kullanır.
 * - "İleri" hata bulursa hata özeti görünür ve odak **ilk hatalı alana** taşınır.
 * - "Geri" ve "Sonra doldururum" doğrulama yapmaz; veri kaybı yoktur (§11.4).
 * - Adım değişiminde odak sayfa başlığına (`h1`, `tabindex="-1"`) taşınır (§11.1).
 * - Adım ziyareti `onVisit` ile bildirilir; "Özel ihtiyaçlar" bölümünün doluluk
 *   ölçütü bu izi kullanır (§11.8).
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { WIZARD_STEP_COUNT } from '../../config.ts';
import { tr } from '../../i18n/tr.ts';
import type { Plan } from '../../model/types.ts';
import {
  ErrorSummary,
  focusElementById,
  type SaveState,
  SaveStatus,
  Stepper,
} from '../components/index.ts';
import { StepBag } from './wizard/StepBag.tsx';
import { StepContacts } from './wizard/StepContacts.tsx';
import { StepHome } from './wizard/StepHome.tsx';
import { StepHousehold } from './wizard/StepHousehold.tsx';
import { StepMeeting } from './wizard/StepMeeting.tsx';
import { StepMembers } from './wizard/StepMembers.tsx';
import { StepNeeds } from './wizard/StepNeeds.tsx';
import { StepReview } from './wizard/StepReview.tsx';
import { StepRoles } from './wizard/StepRoles.tsx';
import type { WizardStepProps } from './wizard/stepProps.ts';
import { clampStep, guideHref, nextStep, stepDefinition, type WizardStep } from './wizard/steps.ts';
import { validateWizardStep } from './wizard/validation.ts';

export interface WizardProps {
  /** Sanitize edilmiş plan (uygulama kabuğunda tutulur). */
  plan: Plan;
  /** Ziyaret edilen adımlar, 1 tabanlı (§11.8). */
  visitedSteps: ReadonlySet<number>;
  /** Her değişiklikte yukarı akan yama; otomatik kayıt buradan yürür. */
  onPatch: (patch: Partial<Plan>) => void;
  /** Adım ziyaretini bildirir (§11.8). */
  onVisit: (step: number) => void;
  /** Uygulama kabuğunda adımın adres ve tarayıcı geçmişini günceller. */
  onNavigate?: (step: WizardStep) => void;
  /** Son adım tamamlandığında çağrılır (§11.5 sonu: `#/ozet`). */
  onFinish: () => void;
  /** `#/plan/<n>` yolundan gelen başlangıç adımı. */
  initialStep?: number;
  /** Kaydetme durumu; `SaveStatus` ile `aria-live` olarak duyurulur. */
  saveState?: SaveState;
  /** §11.5/9 — "Takvimime ekle" niyeti (gerçek .ics üretimi çıktı katmanında). */
  onDownloadIcs?: () => void;
}

function StepContent({ step, props }: { step: WizardStep; props: WizardStepProps }) {
  switch (step) {
    case 1: {
      return <StepHousehold {...props} />;
    }
    case 2: {
      return <StepMembers {...props} />;
    }
    case 3: {
      return <StepNeeds {...props} />;
    }
    case 4: {
      return <StepContacts {...props} />;
    }
    case 5: {
      return <StepMeeting {...props} />;
    }
    case 6: {
      return <StepHome {...props} />;
    }
    case 7: {
      return <StepRoles {...props} />;
    }
    case 8: {
      return <StepBag {...props} />;
    }
    case 9: {
      return <StepReview {...props} />;
    }
    default: {
      return null;
    }
  }
}

export function Wizard({
  plan,
  onPatch,
  onVisit,
  onNavigate,
  onFinish,
  initialStep,
  saveState = 'idle',
  onDownloadIcs,
}: WizardProps) {
  const [step, setStep] = useState<WizardStep>(() => clampStep(initialStep));
  const [touched, setTouched] = useState<ReadonlySet<string>>(() => new Set());
  const [submitted, setSubmitted] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Yalnız ilk adımın ziyaretini bildirir; sonraki adımlar `goToStep` içinde
  // bildirilir (§11.8). Bağımlılık listesi bilinçli olarak boştur.
  useEffect(() => {
    onVisit(step);
  }, []);

  useLayoutEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const errors = validateWizardStep(step, plan);

  const errorOf = (id: string): string | undefined => {
    if (!submitted && !touched.has(id)) return undefined;
    return errors.find((error) => error.id === id)?.message;
  };

  const onFieldBlur = (id: string): void => {
    setTouched((current) => (current.has(id) ? current : new Set([...current, id])));
  };

  const goToStep = (next: WizardStep): void => {
    if (onNavigate !== undefined) {
      onNavigate(next);
      return;
    }
    setStep(next);
    setTouched(new Set());
    setSubmitted(false);
    onVisit(next);
  };

  const attemptAdvance = (): boolean => {
    const found = validateWizardStep(step, plan);
    if (found.length === 0) return true;
    setSubmitted(true);
    const first = found[0];
    if (first !== undefined) focusElementById(first.id);
    return false;
  };

  const handleNext = (): void => {
    if (!attemptAdvance()) return;
    if (step === WIZARD_STEP_COUNT) {
      onFinish();
      return;
    }
    goToStep(nextStep(step));
  };

  const handleSkip = (): void => {
    if (step === WIZARD_STEP_COUNT) {
      onFinish();
      return;
    }
    goToStep(nextStep(step));
  };

  const handleBack = (): void => {
    if (step === 1) return;
    goToStep(clampStep(step - 1));
  };

  const definition = stepDefinition(step);
  const texts = tr.wizard.steps[definition.key];
  const isLast = step === WIZARD_STEP_COUNT;

  return (
    <div class="wizard">
      <header class="wizard__header">
        <Stepper step={step} total={WIZARD_STEP_COUNT} title={texts.title} />
        <progress
          class="wizard__progress"
          value={step}
          max={WIZARD_STEP_COUNT}
          aria-hidden="true"
        />
        <h1 id="wizard-heading" tabIndex={-1} ref={headingRef}>
          {texts.title}
        </h1>
        <p>{texts.why}</p>
        <a class="wizard__guide-link" href={guideHref(definition.guide)}>
          {tr.wizard.guideLinks[definition.guide]}
        </a>
      </header>

      {submitted && errors.length > 0 ? <ErrorSummary errors={errors} /> : null}

      <div class="wizard__body">
        <StepContent
          step={step}
          props={{
            plan,
            onPatch,
            errorOf,
            onFieldBlur,
            ...(onDownloadIcs ? { onDownloadIcs } : {}),
          }}
        />
      </div>

      <div class="wizard__footer">
        <div class="button-row wizard__actions">
          <button
            class="button button--secondary"
            type="button"
            disabled={step === 1}
            onClick={handleBack}
          >
            {tr.wizard.actions.back}
          </button>
          <button class="button button--quiet" type="button" onClick={handleSkip}>
            {tr.wizard.actions.skip}
          </button>
          <button class="button button--primary" type="button" onClick={handleNext}>
            {isLast ? tr.wizard.actions.finish : tr.wizard.actions.next}
          </button>
        </div>
        <SaveStatus state={saveState} />
      </div>
    </div>
  );
}

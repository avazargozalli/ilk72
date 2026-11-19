/**
 * Şartname §11.5/9 — "Gözden geçirme" adımı.
 *
 * - Son tatbikat tarihi isteğe bağlıdır.
 * - Sonraki gözden geçirme tarihi **varsayılan olarak bugünden altı ay
 *   sonrasıdır** (§11.5/9). Adım ilk açıldığında, tarih boşsa varsayılan plana
 *   yazılır; böylece planın "Gözden geçirme" bölümü gerçekten dolar (§11.8).
 *   Kullanıcı sonradan tarihi değiştirebilir; varsayılan bir daha yazılmaz.
 * - "Takvimime ekle" düğmesi çıktı katmanına niyet iletir (`onDownloadIcs`);
 *   takvim dosyasında kişisel veri bulunmadığı ekranda yazılıdır (§12).
 * - Açıklama olarak §11.5/9'daki P-10 maddesi içerik kaydından gösterilir (İ4).
 */
import { useEffect } from 'preact/hooks';
import { tr } from '../../../i18n/tr.ts';
import { PLAN_LIMITS } from '../../../model/validate.ts';
import { contentItemText } from './contentLists.ts';
import { defaultReviewDate } from './dates.ts';
import { FIELD_IDS } from './fieldIds.ts';
import { DateField, TextAreaField } from './fields.tsx';
import type { WizardStepProps } from './stepProps.ts';

export function StepReview({
  plan,
  onPatch,
  errorOf,
  onFieldBlur,
  onDownloadIcs,
}: WizardStepProps) {
  const review = plan.review;

  // Varsayılan tarih yalnız ilk çizimde yazılır (§11.5/9); sonraki
  // değişiklikler kullanıcıya aittir. Bağımlılık listesi bilinçli olarak boştur.
  useEffect(() => {
    if (review.nextReviewAt !== null) return;
    onPatch({ review: { ...review, nextReviewAt: defaultReviewDate() } });
  }, []);

  const referenceText = contentItemText('P-10');

  return (
    <>
      {referenceText ? <p>{referenceText}</p> : null}

      <DateField
        id={FIELD_IDS.lastDrillAt}
        label={tr.wizard.fields.lastDrillAt}
        hint={tr.wizard.hints.lastDrillAt}
        value={review.lastDrillAt ?? ''}
        error={errorOf(FIELD_IDS.lastDrillAt)}
        onInput={(value) =>
          onPatch({ review: { ...review, lastDrillAt: value === '' ? null : value } })
        }
        onBlur={() => onFieldBlur(FIELD_IDS.lastDrillAt)}
      />

      <DateField
        id={FIELD_IDS.nextReviewAt}
        label={tr.wizard.fields.nextReviewAt}
        hint={tr.wizard.hints.nextReviewAt}
        value={review.nextReviewAt ?? ''}
        error={errorOf(FIELD_IDS.nextReviewAt)}
        onInput={(value) =>
          onPatch({ review: { ...review, nextReviewAt: value === '' ? null : value } })
        }
        onBlur={() => onFieldBlur(FIELD_IDS.nextReviewAt)}
      />

      <p class="repeater__hint">{tr.wizard.hints.reviewCalendar}</p>
      {onDownloadIcs ? (
        <p>
          <button class="button button--secondary" type="button" onClick={onDownloadIcs}>
            {tr.wizard.actions.addCalendar}
          </button>
        </p>
      ) : null}

      <TextAreaField
        id={FIELD_IDS.notes}
        label={tr.wizard.fields.notes}
        hint={tr.wizard.hints.notes}
        value={plan.notes}
        maxLength={PLAN_LIMITS.longTextLength}
        rows={4}
        error={errorOf(FIELD_IDS.notes)}
        onInput={(value) => onPatch({ notes: value })}
        onBlur={() => onFieldBlur(FIELD_IDS.notes)}
      />
    </>
  );
}

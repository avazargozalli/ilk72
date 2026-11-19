/**
 * Şartname §11.5/1 — "Haneniz" adımı.
 *
 * Alanlar: hane etiketi, adres, bina notu (kat, asansör, merdiven). Adresin
 * yalnızca tam plan çıktısında yer aldığı alan ipucunda belirtilir; ev adresi
 * paylaşılan özet karta girmez (§10.1). Doğrulama sınırları §8.2'dedir.
 */
import { tr } from '../../../i18n/tr.ts';
import type { Plan } from '../../../model/types.ts';
import { PLAN_LIMITS } from '../../../model/validate.ts';
import { FIELD_IDS } from './fieldIds.ts';
import { TextField } from './fields.tsx';
import type { WizardStepProps } from './stepProps.ts';

export function StepHousehold({ plan, onPatch, errorOf, onFieldBlur }: WizardStepProps) {
  const household = plan.household;
  const patch = (changes: Partial<Plan['household']>): void => {
    onPatch({ household: { ...household, ...changes } });
  };

  return (
    <>
      <TextField
        id={FIELD_IDS.householdLabel}
        label={tr.wizard.fields.householdLabel}
        hint={tr.wizard.hints.householdLabel}
        value={household.label}
        maxLength={PLAN_LIMITS.nameLength}
        error={errorOf(FIELD_IDS.householdLabel)}
        onInput={(value) => patch({ label: value })}
        onBlur={() => onFieldBlur(FIELD_IDS.householdLabel)}
      />
      <TextField
        id={FIELD_IDS.householdAddress}
        label={tr.wizard.fields.householdAddress}
        hint={tr.wizard.hints.householdAddress}
        value={household.address}
        maxLength={PLAN_LIMITS.shortTextLength}
        error={errorOf(FIELD_IDS.householdAddress)}
        onInput={(value) => patch({ address: value })}
        onBlur={() => onFieldBlur(FIELD_IDS.householdAddress)}
      />
      <TextField
        id={FIELD_IDS.householdBuildingNote}
        label={tr.wizard.fields.householdBuildingNote}
        hint={tr.wizard.hints.householdBuildingNote}
        value={household.buildingNote}
        maxLength={PLAN_LIMITS.shortTextLength}
        error={errorOf(FIELD_IDS.householdBuildingNote)}
        onInput={(value) => patch({ buildingNote: value })}
        onBlur={() => onFieldBlur(FIELD_IDS.householdBuildingNote)}
      />
    </>
  );
}

/**
 * Şartname §11.5/3 — "Özel ihtiyaçlar" adımı.
 *
 * 1. Kişi başına destek ihtiyaçları: hareket, işitme, görme, iletişim kutuları
 *    ve kısa not.
 * 2. **Ayrı bölüm**: "Sağlık bilgisi eklemek istiyorum" anahtarı (İ8).
 *    - Anahtar açılınca §11.5'teki bilgilendirme metni gösterilir ve kişi
 *      başına sağlık alanları görünür.
 *    - Kapatılırken "Girdiğiniz sağlık bilgileri silinecek." onayı istenir
 *      (`Dialog`); onaylanınca **bütün** `member.health` alanları `onPatch` ile
 *      `undefined` yapılır (§4.2, §18.4-5).
 */
import { useState } from 'preact/hooks';
import { formatText, tr } from '../../../i18n/tr.ts';
import { createEmptyHealth } from '../../../model/defaults.ts';
import type { Health, Member } from '../../../model/types.ts';
import { PLAN_LIMITS } from '../../../model/validate.ts';
import { Checkbox, Dialog, Notice } from '../../components/index.ts';
import { replaceAt } from './collections.ts';
import { FIELD_IDS } from './fieldIds.ts';
import { SelectField, TextAreaField, TextField } from './fields.tsx';
import { memberLabel } from './labels.ts';
import { BLOOD_TYPE_OPTIONS, isBloodType } from './options.ts';
import type { WizardStepProps } from './stepProps.ts';

interface HealthFieldsProps {
  member: Member;
  index: number;
  errorOf: (id: string) => string | undefined;
  onFieldBlur: (id: string) => void;
  onChange: (changes: Partial<Member>) => void;
}

/** §11.5/3 — yalnızca sağlık anahtarı açıkken çizilen kişi sağlık alanları. */
function HealthFields({ member, index, errorOf, onFieldBlur, onChange }: HealthFieldsProps) {
  const health = member.health ?? createEmptyHealth();
  const setHealth = (changes: Partial<Health>): void => {
    onChange({ health: { ...health, ...changes } });
  };
  const bloodTypeId = FIELD_IDS.healthBloodType(index);
  const conditionsId = FIELD_IDS.healthConditions(index);
  const medicationsId = FIELD_IDS.healthMedications(index);
  const allergiesId = FIELD_IDS.healthAllergies(index);
  const devicesId = FIELD_IDS.healthDevices(index);

  return (
    <fieldset class="repeater__item-group">
      <legend class="repeater__item-label">
        {formatText(tr.wizard.fields.healthMemberLegend, {
          name: memberLabel(member, index),
        })}
      </legend>
      <SelectField
        id={bloodTypeId}
        label={tr.wizard.fields.bloodType}
        value={health.bloodType}
        options={BLOOD_TYPE_OPTIONS}
        error={errorOf(bloodTypeId)}
        onChange={(value) => {
          if (isBloodType(value)) setHealth({ bloodType: value });
        }}
        onBlur={() => onFieldBlur(bloodTypeId)}
      />
      <TextAreaField
        id={conditionsId}
        label={tr.wizard.fields.conditions}
        value={health.conditions}
        maxLength={PLAN_LIMITS.longTextLength}
        error={errorOf(conditionsId)}
        onInput={(value) => setHealth({ conditions: value })}
        onBlur={() => onFieldBlur(conditionsId)}
      />
      <TextAreaField
        id={medicationsId}
        label={tr.wizard.fields.medications}
        value={health.medications}
        maxLength={PLAN_LIMITS.longTextLength}
        error={errorOf(medicationsId)}
        onInput={(value) => setHealth({ medications: value })}
        onBlur={() => onFieldBlur(medicationsId)}
      />
      <TextAreaField
        id={allergiesId}
        label={tr.wizard.fields.allergies}
        value={health.allergies}
        maxLength={PLAN_LIMITS.longTextLength}
        error={errorOf(allergiesId)}
        onInput={(value) => setHealth({ allergies: value })}
        onBlur={() => onFieldBlur(allergiesId)}
      />
      <TextAreaField
        id={devicesId}
        label={tr.wizard.fields.devices}
        value={health.devices}
        maxLength={PLAN_LIMITS.longTextLength}
        error={errorOf(devicesId)}
        onInput={(value) => setHealth({ devices: value })}
        onBlur={() => onFieldBlur(devicesId)}
      />
    </fieldset>
  );
}

export function StepNeeds({ plan, onPatch, errorOf, onFieldBlur }: WizardStepProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const members = plan.members;
  const healthOptIn = plan.healthOptIn;

  const patchMember = (index: number, changes: Partial<Member>): void => {
    const member = members[index];
    if (member === undefined) return;
    onPatch({ members: replaceAt(members, index, { ...member, ...changes }) });
  };

  const handleOptIn = (checked: boolean): void => {
    if (checked) {
      onPatch({ healthOptIn: true });
      return;
    }
    // §11.5/3 — kapatmadan önce "Girdiğiniz sağlık bilgileri silinecek." onayı.
    setConfirmDelete(true);
  };

  const confirmDeleteHealth = (): void => {
    setConfirmDelete(false);
    onPatch({
      healthOptIn: false,
      members: members.map((member) => ({ ...member, health: undefined })),
    });
  };

  return (
    <>
      {members.length === 0 ? <Notice tone="info">{tr.wizard.notices.noMembers}</Notice> : null}

      {members.map((member, index) => {
        const noteId = FIELD_IDS.needsNote(index);
        return (
          <fieldset class="repeater__item-group" key={member.id}>
            <legend class="repeater__item-label">
              {formatText(tr.wizard.fields.memberNeedsLegend, {
                name: memberLabel(member, index),
              })}
            </legend>
            <Checkbox
              label={tr.wizard.fields.needsMobility}
              checked={member.needs.mobility}
              onChange={(checked) =>
                patchMember(index, { needs: { ...member.needs, mobility: checked } })
              }
            />
            <Checkbox
              label={tr.wizard.fields.needsHearing}
              checked={member.needs.hearing}
              onChange={(checked) =>
                patchMember(index, { needs: { ...member.needs, hearing: checked } })
              }
            />
            <Checkbox
              label={tr.wizard.fields.needsVision}
              checked={member.needs.vision}
              onChange={(checked) =>
                patchMember(index, { needs: { ...member.needs, vision: checked } })
              }
            />
            <Checkbox
              label={tr.wizard.fields.needsCommunication}
              checked={member.needs.communication}
              onChange={(checked) =>
                patchMember(index, { needs: { ...member.needs, communication: checked } })
              }
            />
            <TextField
              id={noteId}
              label={tr.wizard.fields.needsNote}
              hint={tr.wizard.hints.needsNote}
              value={member.needs.note}
              maxLength={PLAN_LIMITS.shortTextLength}
              error={errorOf(noteId)}
              onInput={(value) => patchMember(index, { needs: { ...member.needs, note: value } })}
              onBlur={() => onFieldBlur(noteId)}
            />
          </fieldset>
        );
      })}

      <fieldset class="repeater__item-group">
        <legend class="repeater__item-label">{tr.wizard.fields.healthLegend}</legend>
        <p>{tr.wizard.hints.healthIntro}</p>
        <Checkbox
          label={tr.wizard.fields.healthOptIn}
          checked={healthOptIn}
          onChange={handleOptIn}
        />
        {healthOptIn ? <Notice tone="info">{tr.wizard.notices.healthInfo}</Notice> : null}
        {healthOptIn
          ? members.map((member, index) => (
              <HealthFields
                key={member.id}
                member={member}
                index={index}
                errorOf={errorOf}
                onFieldBlur={onFieldBlur}
                onChange={(changes) => patchMember(index, changes)}
              />
            ))
          : null}
      </fieldset>

      <Dialog
        open={confirmDelete}
        title={tr.wizard.health.deleteTitle}
        description={tr.wizard.health.deleteBody}
        onClose={() => setConfirmDelete(false)}
        actions={
          <>
            <button class="button" type="button" onClick={() => setConfirmDelete(false)}>
              {tr.components.dialog.cancel}
            </button>
            <button class="button button--primary" type="button" onClick={confirmDeleteHealth}>
              {tr.wizard.health.deleteConfirm}
            </button>
          </>
        }
      >
        <p>{tr.wizard.health.deleteHint}</p>
      </Dialog>
    </>
  );
}

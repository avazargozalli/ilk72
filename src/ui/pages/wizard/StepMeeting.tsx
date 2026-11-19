/**
 * Şartname §11.5/5 — "Buluşma yerleri" adımı.
 *
 * Üç buluşma yeri ve resmî afet ve acil durum toplanma alanı kullanıcı
 * tarafından yazılır. Uygulama **alan önermez** (§4.1 satır 11, §3.2): toplanma
 * alanı için yalnızca e-Devlet'teki resmî sorgunun bağlantısı verilir
 * (`K-EDEVLET`, `SourceLink`) ve "resmî sorgudan baktım" tarihi tutulur.
 */

import { getSource } from '../../../content/sources.ts';
import { formatText, tr } from '../../../i18n/tr.ts';
import type { Place, Plan } from '../../../model/types.ts';
import { PLAN_LIMITS } from '../../../model/validate.ts';
import { SourceLink } from '../../components/index.ts';
import { FIELD_IDS } from './fieldIds.ts';
import { DateField, TextField } from './fields.tsx';
import type { WizardStepProps } from './stepProps.ts';

type MeetingPlaceKey = 'nearHome' | 'neighborhood' | 'outOfArea' | 'assemblyArea';

function updateMeetingPlace(
  meeting: Plan['meeting'],
  key: MeetingPlaceKey,
  place: Place,
): Plan['meeting'] {
  if (key === 'nearHome') return { ...meeting, nearHome: place };
  if (key === 'neighborhood') return { ...meeting, neighborhood: place };
  if (key === 'outOfArea') return { ...meeting, outOfArea: place };
  return { ...meeting, assemblyArea: place };
}

export function StepMeeting({ plan, onPatch, errorOf, onFieldBlur }: WizardStepProps) {
  const assemblyCheckedAtId = FIELD_IDS.meetingAssemblyCheckedAt;
  const edevlet = getSource('K-EDEVLET');

  const patchPlace = (key: MeetingPlaceKey, changes: Partial<Place>): void => {
    const place = { ...plan.meeting[key], ...changes };
    onPatch({ meeting: updateMeetingPlace(plan.meeting, key, place) });
  };

  const patchMeeting = (changes: Partial<Plan['meeting']>): void => {
    onPatch({ meeting: { ...plan.meeting, ...changes } });
  };

  return (
    <>
      <TextField
        id={FIELD_IDS.meetingNearHomeLabel}
        label={tr.wizard.fields.nearHomeLabel}
        value={plan.meeting.nearHome.label}
        maxLength={PLAN_LIMITS.nameLength}
        error={errorOf(FIELD_IDS.meetingNearHomeLabel)}
        onInput={(value) => patchPlace('nearHome', { label: value })}
        onBlur={() => onFieldBlur(FIELD_IDS.meetingNearHomeLabel)}
      />
      <TextField
        id={FIELD_IDS.meetingNearHomeDetail}
        label={tr.wizard.fields.placeDetail}
        hint={tr.wizard.hints.placeDetail}
        value={plan.meeting.nearHome.detail}
        maxLength={PLAN_LIMITS.shortTextLength}
        error={errorOf(FIELD_IDS.meetingNearHomeDetail)}
        onInput={(value) => patchPlace('nearHome', { detail: value })}
        onBlur={() => onFieldBlur(FIELD_IDS.meetingNearHomeDetail)}
      />

      <TextField
        id={FIELD_IDS.meetingNeighborhoodLabel}
        label={tr.wizard.fields.neighborhoodLabel}
        value={plan.meeting.neighborhood.label}
        maxLength={PLAN_LIMITS.nameLength}
        error={errorOf(FIELD_IDS.meetingNeighborhoodLabel)}
        onInput={(value) => patchPlace('neighborhood', { label: value })}
        onBlur={() => onFieldBlur(FIELD_IDS.meetingNeighborhoodLabel)}
      />
      <TextField
        id={FIELD_IDS.meetingNeighborhoodDetail}
        label={tr.wizard.fields.placeDetail}
        hint={tr.wizard.hints.placeDetail}
        value={plan.meeting.neighborhood.detail}
        maxLength={PLAN_LIMITS.shortTextLength}
        error={errorOf(FIELD_IDS.meetingNeighborhoodDetail)}
        onInput={(value) => patchPlace('neighborhood', { detail: value })}
        onBlur={() => onFieldBlur(FIELD_IDS.meetingNeighborhoodDetail)}
      />

      <TextField
        id={FIELD_IDS.meetingOutOfAreaLabel}
        label={tr.wizard.fields.outOfAreaLabel}
        value={plan.meeting.outOfArea.label}
        maxLength={PLAN_LIMITS.nameLength}
        error={errorOf(FIELD_IDS.meetingOutOfAreaLabel)}
        onInput={(value) => patchPlace('outOfArea', { label: value })}
        onBlur={() => onFieldBlur(FIELD_IDS.meetingOutOfAreaLabel)}
      />
      <TextField
        id={FIELD_IDS.meetingOutOfAreaDetail}
        label={tr.wizard.fields.placeDetail}
        hint={tr.wizard.hints.placeDetail}
        value={plan.meeting.outOfArea.detail}
        maxLength={PLAN_LIMITS.shortTextLength}
        error={errorOf(FIELD_IDS.meetingOutOfAreaDetail)}
        onInput={(value) => patchPlace('outOfArea', { detail: value })}
        onBlur={() => onFieldBlur(FIELD_IDS.meetingOutOfAreaDetail)}
      />

      <TextField
        id={FIELD_IDS.meetingAssemblyAreaLabel}
        label={tr.wizard.fields.assemblyAreaLabel}
        hint={tr.wizard.hints.assemblyArea}
        value={plan.meeting.assemblyArea.label}
        maxLength={PLAN_LIMITS.nameLength}
        error={errorOf(FIELD_IDS.meetingAssemblyAreaLabel)}
        onInput={(value) => patchPlace('assemblyArea', { label: value })}
        onBlur={() => onFieldBlur(FIELD_IDS.meetingAssemblyAreaLabel)}
      />
      <p>{tr.wizard.hints.assemblyAreaNoSuggestion}</p>
      {edevlet ? (
        <p>
          <SourceLink
            url={edevlet.url}
            label={formatText(tr.wizard.sources.label, {
              org: edevlet.org,
              title: edevlet.title,
            })}
            accessed={edevlet.accessed}
          />
        </p>
      ) : null}
      <TextField
        id={FIELD_IDS.meetingAssemblyAreaDetail}
        label={tr.wizard.fields.placeDetail}
        hint={tr.wizard.hints.placeDetail}
        value={plan.meeting.assemblyArea.detail}
        maxLength={PLAN_LIMITS.shortTextLength}
        error={errorOf(FIELD_IDS.meetingAssemblyAreaDetail)}
        onInput={(value) => patchPlace('assemblyArea', { detail: value })}
        onBlur={() => onFieldBlur(FIELD_IDS.meetingAssemblyAreaDetail)}
      />
      <DateField
        id={assemblyCheckedAtId}
        label={tr.wizard.fields.assemblyCheckedAt}
        hint={tr.wizard.hints.assemblyCheckedAt}
        value={plan.meeting.assemblyCheckedAt ?? ''}
        error={errorOf(assemblyCheckedAtId)}
        onInput={(value) => patchMeeting({ assemblyCheckedAt: value === '' ? null : value })}
        onBlur={() => onFieldBlur(assemblyCheckedAtId)}
      />
    </>
  );
}

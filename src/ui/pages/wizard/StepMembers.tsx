/**
 * Şartname §11.5/2 — "Kişiler" adımı.
 *
 * - Tekrarlı kişi alanları: ad, grup (yetişkin/çocuk/bebek/yaşlı), telefon.
 * - Kişi başına gün içinde bulunduğu yerler (okul/iş/diğer), en çok
 *   `PLAN_LIMITS.dailyPlaces` (3) tanedir (§8.2).
 * - "En az 1 kişi": plan boşsa ilk kişi satırı kendiliğinden eklenir; zorunlu
 *   tek alan "en az bir kişinin adı"dır (§11.4), denetimi `validation.ts` yapar.
 * - Bir kişi silinirse ona atanmış görevler "atanmadı"ya döner (§8.3 kuralının
 *   sihirbaz tarafı).
 */
import { useEffect } from 'preact/hooks';
import { tr } from '../../../i18n/tr.ts';
import { createEmptyDailyPlace, createEmptyMember } from '../../../model/defaults.ts';
import type { DailyPlace, Member } from '../../../model/types.ts';
import { PLAN_LIMITS } from '../../../model/validate.ts';
import { RadioGroup, Repeater, type RepeaterItem } from '../../components/index.ts';
import { appendItem, removeAt, replaceAt } from './collections.ts';
import { FIELD_IDS } from './fieldIds.ts';
import { PhoneField, TextField } from './fields.tsx';
import {
  DAILY_PLACE_KIND_OPTIONS,
  isDailyPlaceKind,
  isMemberGroup,
  MEMBER_GROUP_OPTIONS,
} from './options.ts';
import type { WizardStepProps } from './stepProps.ts';

interface MemberFieldsProps {
  member: Member;
  index: number;
  errorOf: (id: string) => string | undefined;
  onFieldBlur: (id: string) => void;
  onChange: (changes: Partial<Member>) => void;
}

/** Tek kişinin alanları; `Repeater` öğesi olarak çizilir. */
function MemberFields({ member, index, errorOf, onFieldBlur, onChange }: MemberFieldsProps) {
  const nameId = FIELD_IDS.memberName(index);
  const phoneId = FIELD_IDS.memberPhone(index);

  const patchDailyPlace = (placeIndex: number, changes: Partial<DailyPlace>): void => {
    const place = member.dailyPlaces[placeIndex];
    if (place === undefined) return;
    onChange({
      dailyPlaces: replaceAt(member.dailyPlaces, placeIndex, { ...place, ...changes }),
    });
  };

  const dailyPlaceItems: RepeaterItem[] = member.dailyPlaces.map((place, placeIndex) => {
    const labelId = FIELD_IDS.dailyPlaceLabel(index, placeIndex);
    const placePhoneId = FIELD_IDS.dailyPlacePhone(index, placeIndex);
    const noteId = FIELD_IDS.dailyPlaceNote(index, placeIndex);
    return {
      key: `${member.id}-place-${placeIndex + 1}`,
      content: (
        <>
          <RadioGroup
            legend={tr.wizard.fields.dailyPlaceKind}
            name={`${nameId}-place-${placeIndex + 1}-kind`}
            direction="horizontal"
            value={place.kind}
            options={DAILY_PLACE_KIND_OPTIONS}
            onChange={(value) => {
              if (isDailyPlaceKind(value)) patchDailyPlace(placeIndex, { kind: value });
            }}
          />
          <TextField
            id={labelId}
            label={tr.wizard.fields.dailyPlaceLabel}
            value={place.label}
            maxLength={PLAN_LIMITS.nameLength}
            error={errorOf(labelId)}
            onInput={(value) => patchDailyPlace(placeIndex, { label: value })}
            onBlur={() => onFieldBlur(labelId)}
          />
          <PhoneField
            id={placePhoneId}
            label={tr.wizard.fields.dailyPlacePhone}
            hint={tr.wizard.hints.phone}
            value={place.phone}
            error={errorOf(placePhoneId)}
            onInput={(value) => patchDailyPlace(placeIndex, { phone: value })}
            onBlur={() => onFieldBlur(placePhoneId)}
          />
          <TextField
            id={noteId}
            label={tr.wizard.fields.dailyPlaceNote}
            value={place.note}
            maxLength={PLAN_LIMITS.shortTextLength}
            error={errorOf(noteId)}
            onInput={(value) => patchDailyPlace(placeIndex, { note: value })}
            onBlur={() => onFieldBlur(noteId)}
          />
        </>
      ),
    };
  });

  return (
    <>
      <TextField
        id={nameId}
        label={tr.wizard.fields.memberName}
        value={member.name}
        maxLength={PLAN_LIMITS.nameLength}
        error={errorOf(nameId)}
        onInput={(value) => onChange({ name: value })}
        onBlur={() => onFieldBlur(nameId)}
      />
      <RadioGroup
        legend={tr.wizard.fields.memberGroup}
        name={`${nameId}-group`}
        direction="horizontal"
        value={member.group}
        options={MEMBER_GROUP_OPTIONS}
        hint={tr.wizard.hints.memberGroup}
        onChange={(value) => {
          if (isMemberGroup(value)) onChange({ group: value });
        }}
      />
      <PhoneField
        id={phoneId}
        label={tr.wizard.fields.memberPhone}
        hint={tr.wizard.hints.phone}
        value={member.phone}
        error={errorOf(phoneId)}
        onInput={(value) => onChange({ phone: value })}
        onBlur={() => onFieldBlur(phoneId)}
      />
      <Repeater
        legend={tr.wizard.fields.dailyPlacesLegend}
        itemName={tr.wizard.fields.repeaterDailyPlace}
        hint={tr.wizard.hints.dailyPlaces}
        items={dailyPlaceItems}
        maxItems={PLAN_LIMITS.dailyPlaces}
        onAdd={() =>
          onChange({ dailyPlaces: appendItem(member.dailyPlaces, createEmptyDailyPlace()) })
        }
        onRemove={(placeIndex) =>
          onChange({ dailyPlaces: removeAt(member.dailyPlaces, placeIndex) })
        }
      />
    </>
  );
}

export function StepMembers({ plan, onPatch, errorOf, onFieldBlur }: WizardStepProps) {
  // §11.5/2 — "En az 1 kişi": boş planda ilk kişi satırı kendiliğinden eklenir,
  // böylece zorunlu ad alanı her zaman ekranda ve odaklanabilir olur.
  const memberCount = plan.members.length;
  useEffect(() => {
    if (memberCount > 0) return;
    onPatch({ members: [createEmptyMember()] });
  }, [memberCount, onPatch]);

  const patchMember = (index: number, changes: Partial<Member>): void => {
    const member = plan.members[index];
    if (member === undefined) return;
    onPatch({ members: replaceAt(plan.members, index, { ...member, ...changes }) });
  };

  const addMember = (): void => {
    if (plan.members.length >= PLAN_LIMITS.members) return;
    onPatch({ members: appendItem(plan.members, createEmptyMember()) });
  };

  const removeMember = (index: number): void => {
    const removed = plan.members[index];
    if (removed === undefined) return;
    const roles = plan.roles.map((role) =>
      role.memberId === removed.id ? { ...role, memberId: null } : role,
    );
    onPatch({ members: removeAt(plan.members, index), roles });
  };

  const items: RepeaterItem[] = plan.members.map((member, index) => ({
    key: member.id,
    content: (
      <MemberFields
        member={member}
        index={index}
        errorOf={errorOf}
        onFieldBlur={onFieldBlur}
        onChange={(changes) => patchMember(index, changes)}
      />
    ),
  }));

  return (
    <Repeater
      legend={tr.wizard.fields.membersLegend}
      itemName={tr.wizard.fields.repeaterMember}
      hint={tr.wizard.hints.membersRequired}
      items={items}
      minItems={1}
      maxItems={PLAN_LIMITS.members}
      onAdd={addMember}
      onRemove={removeMember}
    />
  );
}

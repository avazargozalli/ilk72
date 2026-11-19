/**
 * Şartname §11.5 — sihirbazdaki seçenek listeleri.
 *
 * Seçenek metinleri `tr.wizard.options.*` altındadır; değerler `src/model/types.ts`
 * ile birebir aynıdır. Daraltma işlevleri, denetimden gelen `string` değeri
 * modelin birleşim türüne güvenle çevirmek için kullanılır.
 */

import { tr } from '../../../i18n/tr.ts';
import type { DailyPlace, Health, Member, RoleId, YesNoUnknown } from '../../../model/types.ts';
import type { RadioOption } from '../../components/index.ts';
import type { SelectOption } from './fields.tsx';
import { memberLabel } from './labels.ts';

/** §11.5/7 — yedi görev, tablodaki sırayla. */
export const ROLE_IDS = [
  'canta',
  'vanalar',
  'cocuklar',
  'yaslilar',
  'evcil',
  'kapilar',
  'iletisim',
] as const satisfies readonly RoleId[];

/** §8.1 `Member.group` — dört grup. */
export const MEMBER_GROUP_VALUES = ['yetiskin', 'cocuk', 'bebek', 'yasli'] as const;

/** §8.1 `DailyPlace.kind` — üç yer türü. */
export const DAILY_PLACE_KIND_VALUES = ['okul', 'is', 'diger'] as const;

/** §8.1 `YesNoUnknown` — sigorta yanıtı. */
export const YES_NO_UNKNOWN_VALUES = ['evet', 'hayir', 'bilmiyorum'] as const;

/** §8.1 `Health.bloodType` — boş ya da sekiz kan grubu. */
export const BLOOD_TYPE_VALUES = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-'] as const;

export const MEMBER_GROUP_OPTIONS: readonly RadioOption[] = MEMBER_GROUP_VALUES.map((value) => ({
  value,
  label: tr.wizard.options.groups[value],
}));

export const DAILY_PLACE_KIND_OPTIONS: readonly RadioOption[] = DAILY_PLACE_KIND_VALUES.map(
  (value) => ({ value, label: tr.wizard.options.dailyPlaceKinds[value] }),
);

export const INSURANCE_OPTIONS: readonly RadioOption[] = YES_NO_UNKNOWN_VALUES.map((value) => ({
  value,
  label: tr.wizard.options.yesNoUnknown[value],
}));

export const BLOOD_TYPE_OPTIONS: readonly SelectOption[] = BLOOD_TYPE_VALUES.map((value) => ({
  value,
  label: value === '' ? tr.wizard.options.bloodTypes.none : tr.wizard.options.bloodTypes[value],
}));

/** §11.5/7 — görev için kişi seçimi; boş değer "Atanmadı"dır. */
export function memberSelectOptions(members: readonly Member[]): readonly SelectOption[] {
  return [
    { value: '', label: tr.wizard.fields.roleUnassigned },
    ...members.map((member, index) => ({ value: member.id, label: memberLabel(member, index) })),
  ];
}

export function isMemberGroup(value: string): value is Member['group'] {
  return (MEMBER_GROUP_VALUES as readonly string[]).includes(value);
}

export function isDailyPlaceKind(value: string): value is DailyPlace['kind'] {
  return (DAILY_PLACE_KIND_VALUES as readonly string[]).includes(value);
}

export function isYesNoUnknown(value: string): value is YesNoUnknown {
  return (YES_NO_UNKNOWN_VALUES as readonly string[]).includes(value);
}

export function isBloodType(value: string): value is Health['bloodType'] {
  return (BLOOD_TYPE_VALUES as readonly string[]).includes(value);
}

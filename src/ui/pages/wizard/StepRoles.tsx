/**
 * Şartname §11.5/7 — "Görevler" adımı.
 *
 * Yedi görevin her biri için kişi seçimi ve not alınır. Atanmamış rol sorun
 * değildir; bu yüzden hiçbir görev zorunlu tutulmaz (§11.5/7). Görev satırı
 * `plan.roles` içinde yoksa seçim yapıldığında oluşturulur.
 */
import { tr } from '../../../i18n/tr.ts';
import type { RoleAssignment, RoleId } from '../../../model/types.ts';
import { Notice } from '../../components/index.ts';
import { FIELD_IDS } from './fieldIds.ts';
import { SelectField, TextField } from './fields.tsx';
import { memberSelectOptions, ROLE_IDS } from './options.ts';
import type { WizardStepProps } from './stepProps.ts';

export function StepRoles({ plan, onPatch, errorOf, onFieldBlur }: WizardStepProps) {
  const memberOptions = memberSelectOptions(plan.members);

  const patchRole = (roleId: RoleId, changes: Partial<RoleAssignment>): void => {
    const exists = plan.roles.some((role) => role.roleId === roleId);
    const roles = exists
      ? plan.roles.map((role) => (role.roleId === roleId ? { ...role, ...changes } : role))
      : [...plan.roles, { roleId, memberId: null, note: '', ...changes }];
    onPatch({ roles });
  };

  return (
    <>
      <p>{tr.wizard.hints.roles}</p>
      {plan.members.length === 0 ? (
        <Notice tone="info">{tr.wizard.notices.noMembers}</Notice>
      ) : null}
      {ROLE_IDS.map((roleId) => {
        const assignment = plan.roles.find((role) => role.roleId === roleId);
        const memberId = assignment?.memberId ?? '';
        const noteId = FIELD_IDS.roleNote(roleId);
        return (
          <fieldset class="repeater__item-group" key={roleId}>
            <legend class="repeater__item-label">{tr.wizard.roles[roleId]}</legend>
            <SelectField
              id={FIELD_IDS.roleMember(roleId)}
              label={tr.wizard.fields.roleMember}
              value={memberId}
              options={memberOptions}
              onChange={(value) => patchRole(roleId, { memberId: value === '' ? null : value })}
            />
            <TextField
              id={noteId}
              label={tr.wizard.fields.roleNote}
              value={assignment?.note ?? ''}
              maxLength={200}
              error={errorOf(noteId)}
              onInput={(value) => patchRole(roleId, { note: value })}
              onBlur={() => onFieldBlur(noteId)}
            />
          </fieldset>
        );
      })}
    </>
  );
}

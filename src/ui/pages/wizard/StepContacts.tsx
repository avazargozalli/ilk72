/**
 * Şartname §11.5/4 — "Acil kişiler" adımı.
 *
 * Tekrarlı acil kişi alanları: ad, ilişki, iki telefon, şehir dışı irtibat
 * (+şehir), çocukları teslim alabilir. Açıklama olarak §13.3'teki P-04 maddesi
 * gösterilir; en az bir şehir dışı kişi **önerilir**, zorunlu değildir.
 */
import { tr } from '../../../i18n/tr.ts';
import { createEmptyContact } from '../../../model/defaults.ts';
import type { Contact } from '../../../model/types.ts';
import { PLAN_LIMITS } from '../../../model/validate.ts';
import { Checkbox, Repeater, type RepeaterItem } from '../../components/index.ts';
import { appendItem, removeAt, replaceAt } from './collections.ts';
import { contentItemText } from './contentLists.ts';
import { FIELD_IDS } from './fieldIds.ts';
import { PhoneField, TextField } from './fields.tsx';
import type { WizardStepProps } from './stepProps.ts';

interface ContactFieldsProps {
  contact: Contact;
  index: number;
  errorOf: (id: string) => string | undefined;
  onFieldBlur: (id: string) => void;
  onChange: (changes: Partial<Contact>) => void;
}

/** Tek acil kişinin alanları; `Repeater` öğesi olarak çizilir. */
function ContactFields({ contact, index, errorOf, onFieldBlur, onChange }: ContactFieldsProps) {
  const nameId = FIELD_IDS.contactName(index);
  const relationId = FIELD_IDS.contactRelation(index);
  const phoneId = FIELD_IDS.contactPhone(index);
  const phoneAltId = FIELD_IDS.contactPhoneAlt(index);
  const cityId = FIELD_IDS.contactCity(index);

  return (
    <>
      <TextField
        id={nameId}
        label={tr.wizard.fields.contactName}
        value={contact.name}
        maxLength={PLAN_LIMITS.nameLength}
        error={errorOf(nameId)}
        onInput={(value) => onChange({ name: value })}
        onBlur={() => onFieldBlur(nameId)}
      />
      <TextField
        id={relationId}
        label={tr.wizard.fields.contactRelation}
        value={contact.relation}
        maxLength={PLAN_LIMITS.nameLength}
        error={errorOf(relationId)}
        onInput={(value) => onChange({ relation: value })}
        onBlur={() => onFieldBlur(relationId)}
      />
      <PhoneField
        id={phoneId}
        label={tr.wizard.fields.contactPhone}
        hint={tr.wizard.hints.phone}
        value={contact.phone}
        error={errorOf(phoneId)}
        onInput={(value) => onChange({ phone: value })}
        onBlur={() => onFieldBlur(phoneId)}
      />
      <PhoneField
        id={phoneAltId}
        label={tr.wizard.fields.contactPhoneAlt}
        hint={tr.wizard.hints.phone}
        value={contact.phoneAlt}
        error={errorOf(phoneAltId)}
        onInput={(value) => onChange({ phoneAlt: value })}
        onBlur={() => onFieldBlur(phoneAltId)}
      />
      <Checkbox
        label={tr.wizard.fields.contactOutOfArea}
        checked={contact.outOfArea}
        onChange={(checked) => onChange({ outOfArea: checked })}
      />
      {contact.outOfArea ? (
        <TextField
          id={cityId}
          label={tr.wizard.fields.contactCity}
          hint={tr.wizard.hints.contactCity}
          value={contact.city}
          maxLength={PLAN_LIMITS.nameLength}
          error={errorOf(cityId)}
          onInput={(value) => onChange({ city: value })}
          onBlur={() => onFieldBlur(cityId)}
        />
      ) : null}
      <Checkbox
        label={tr.wizard.fields.contactCanPickUp}
        checked={contact.canPickUpChildren}
        onChange={(checked) => onChange({ canPickUpChildren: checked })}
      />
    </>
  );
}

export function StepContacts({ plan, onPatch, errorOf, onFieldBlur }: WizardStepProps) {
  const description = contentItemText('P-04');

  const patchContact = (index: number, changes: Partial<Contact>): void => {
    const contact = plan.contacts[index];
    if (contact === undefined) return;
    onPatch({ contacts: replaceAt(plan.contacts, index, { ...contact, ...changes }) });
  };

  const addContact = (): void => {
    if (plan.contacts.length >= PLAN_LIMITS.contacts) return;
    onPatch({ contacts: appendItem(plan.contacts, createEmptyContact()) });
  };

  const removeContact = (index: number): void => {
    if (plan.contacts[index] === undefined) return;
    onPatch({ contacts: removeAt(plan.contacts, index) });
  };

  const items: RepeaterItem[] = plan.contacts.map((contact, index) => ({
    key: contact.id,
    content: (
      <ContactFields
        contact={contact}
        index={index}
        errorOf={errorOf}
        onFieldBlur={onFieldBlur}
        onChange={(changes) => patchContact(index, changes)}
      />
    ),
  }));

  return (
    <>
      {description ? <p>{description}</p> : null}
      <Repeater
        legend={tr.wizard.fields.contactsLegend}
        itemName={tr.wizard.fields.repeaterContact}
        hint={tr.wizard.hints.contacts}
        items={items}
        maxItems={PLAN_LIMITS.contacts}
        onAdd={addContact}
        onRemove={removeContact}
      />
    </>
  );
}

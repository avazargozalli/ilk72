/**
 * Şartname §11.5/8 — "Çanta ve belgeler" adımı.
 *
 * - Çantanın yeri serbest metindir.
 * - Çanta listesi **haneye göre üretilir** (§11.6): `buildBagItemIds` hangi
 *   kimliklerin seçileceğine karar verir, `mergeBagItems` önceki işaretleri
 *   `id` üzerinden korur. Madde metinleri içerik kaydından gelir (İ4).
 * - Kullanıcı kendi maddesini ekleyebilir (`ozel-<uuid>`, en çok 15, §11.6).
 *   Modelde madde başına tek serbest metin alanı (`note`) olduğu için özel
 *   maddenin **adı** bu alanda tutulur; alan etiketi de buna göre "Madde adı"
 *   olur (bkz. `docs/kararlar.md` K-13).
 * - Belgeler (`B-*`) ve evcil hayvanlar (en çok `PLAN_LIMITS.pets`) aynı
 *   desende toplanır; sigorta sorusu yalnızca denetim maddesidir (§4.1 satır 17).
 */
import { getSource } from '../../../content/sources.ts';
import { formatText, tr } from '../../../i18n/tr.ts';
import {
  buildBagItemIds,
  createCustomBagItem,
  isCustomBagItemId,
  MAX_CUSTOM_BAG_ITEMS,
  mergeBagItems,
} from '../../../model/bag.ts';
import type { Pet } from '../../../model/types.ts';
import { PLAN_LIMITS } from '../../../model/validate.ts';
import {
  Checkbox,
  RadioGroup,
  Repeater,
  type RepeaterItem,
  SourceLink,
} from '../../components/index.ts';
import { appendItem, removeAt, replaceAt } from './collections.ts';
import { bagItemText, DOCUMENT_IDS, documentItemText } from './contentLists.ts';
import { FIELD_IDS } from './fieldIds.ts';
import { CompactNoteField, TextField } from './fields.tsx';
import { INSURANCE_OPTIONS, isYesNoUnknown } from './options.ts';
import type { WizardStepProps } from './stepProps.ts';

export function StepBag({ plan, onPatch, errorOf, onFieldBlur, onDownloadIcs }: WizardStepProps) {
  const bag = plan.bag;
  const items = mergeBagItems(bag.items, buildBagItemIds(plan));
  const documents = mergeBagItems(plan.documents, DOCUMENT_IDS);
  const customCount = items.filter((item) => isCustomBagItemId(item.id)).length;

  const patchItems = (next: typeof items): void => {
    onPatch({ bag: { ...bag, items: next } });
  };

  const toggleItem = (id: string, done: boolean): void => {
    patchItems(items.map((item) => (item.id === id ? { ...item, done } : item)));
  };

  const noteItem = (id: string, note: string): void => {
    patchItems(items.map((item) => (item.id === id ? { ...item, note } : item)));
  };

  const addCustom = (): void => {
    if (customCount >= MAX_CUSTOM_BAG_ITEMS) return;
    patchItems([...items, createCustomBagItem()]);
  };

  const removeItem = (id: string): void => {
    patchItems(items.filter((item) => item.id !== id));
  };

  const toggleDocument = (id: string, done: boolean): void => {
    onPatch({
      documents: documents.map((item) => (item.id === id ? { ...item, done } : item)),
    });
  };

  const noteDocument = (id: string, note: string): void => {
    onPatch({
      documents: documents.map((item) => (item.id === id ? { ...item, note } : item)),
    });
  };

  const patchPets = (next: Pet[]): void => {
    onPatch({ pets: next });
  };

  const petItems: RepeaterItem[] = plan.pets.map((pet, index) => {
    const nameId = FIELD_IDS.petName(index);
    const kindId = FIELD_IDS.petKind(index);
    const noteId = FIELD_IDS.petNote(index);
    return {
      key: pet.id,
      content: (
        <>
          <TextField
            id={nameId}
            label={tr.wizard.fields.petName}
            value={pet.name}
            maxLength={PLAN_LIMITS.nameLength}
            error={errorOf(nameId)}
            onInput={(value) => patchPets(replaceAt(plan.pets, index, { ...pet, name: value }))}
            onBlur={() => onFieldBlur(nameId)}
          />
          <TextField
            id={kindId}
            label={tr.wizard.fields.petKind}
            value={pet.kind}
            maxLength={PLAN_LIMITS.shortTextLength}
            error={errorOf(kindId)}
            onInput={(value) => patchPets(replaceAt(plan.pets, index, { ...pet, kind: value }))}
            onBlur={() => onFieldBlur(kindId)}
          />
          <TextField
            id={noteId}
            label={tr.wizard.fields.petNote}
            value={pet.note}
            maxLength={PLAN_LIMITS.shortTextLength}
            error={errorOf(noteId)}
            onInput={(value) => patchPets(replaceAt(plan.pets, index, { ...pet, note: value }))}
            onBlur={() => onFieldBlur(noteId)}
          />
        </>
      ),
    };
  });

  const dask = getSource('K-DASK');

  return (
    <>
      <TextField
        id={FIELD_IDS.bagLocation}
        label={tr.wizard.fields.bagLocation}
        hint={tr.wizard.hints.bagLocation}
        value={bag.location}
        maxLength={PLAN_LIMITS.shortTextLength}
        error={errorOf(FIELD_IDS.bagLocation)}
        onInput={(value) => onPatch({ bag: { ...bag, items: bag.items, location: value } })}
        onBlur={() => onFieldBlur(FIELD_IDS.bagLocation)}
      />

      <fieldset class="repeater__item-group">
        <legend class="repeater__item-label">{tr.wizard.fields.bagItemsLegend}</legend>
        <p class="repeater__hint">{tr.wizard.hints.bagItems}</p>
        {items.map((item) => {
          const custom = isCustomBagItemId(item.id);
          const text = custom ? item.note : (bagItemText(item.id) ?? item.id);
          const noteId = FIELD_IDS.bagItemNote(item.id);
          return (
            <div key={item.id}>
              {custom ? (
                <CompactNoteField
                  id={FIELD_IDS.bagItem(item.id)}
                  label={tr.wizard.fields.customBagItemName}
                  value={text}
                  error={errorOf(noteId)}
                  onInput={(value) => noteItem(item.id, value)}
                  onBlur={() => onFieldBlur(noteId)}
                />
              ) : (
                <Checkbox
                  id={FIELD_IDS.bagItem(item.id)}
                  label={text}
                  checked={item.done}
                  onChange={(checked) => toggleItem(item.id, checked)}
                />
              )}
              {custom ? (
                <Checkbox
                  id={`${FIELD_IDS.bagItem(item.id)}-done`}
                  label={tr.wizard.fields.customBagItemDone}
                  checked={item.done}
                  onChange={(checked) => toggleItem(item.id, checked)}
                />
              ) : (
                <CompactNoteField
                  id={noteId}
                  label={formatText(tr.wizard.fields.itemNote, { item: text })}
                  value={item.note}
                  error={errorOf(noteId)}
                  onInput={(value) => noteItem(item.id, value)}
                  onBlur={() => onFieldBlur(noteId)}
                />
              )}
              {custom ? (
                <button class="repeater__remove" type="button" onClick={() => removeItem(item.id)}>
                  {tr.components.repeater.remove}
                </button>
              ) : null}
            </div>
          );
        })}
        <button
          class="repeater__add"
          type="button"
          disabled={customCount >= MAX_CUSTOM_BAG_ITEMS}
          onClick={addCustom}
        >
          {tr.wizard.fields.addCustomBagItem}
        </button>
      </fieldset>

      <fieldset class="repeater__item-group">
        <legend class="repeater__item-label">{tr.wizard.fields.documentsLegend}</legend>
        <p class="repeater__hint">{tr.wizard.hints.documents}</p>
        {documents.map((document) => {
          const text = documentItemText(document.id) ?? document.id;
          const noteId = FIELD_IDS.documentNote(document.id);
          return (
            <div key={document.id}>
              <Checkbox
                id={FIELD_IDS.documentItem(document.id)}
                label={text}
                checked={document.done}
                onChange={(checked) => toggleDocument(document.id, checked)}
              />
              <CompactNoteField
                id={noteId}
                label={formatText(tr.wizard.fields.itemNote, { item: text })}
                value={document.note}
                error={errorOf(noteId)}
                onInput={(value) => noteDocument(document.id, value)}
                onBlur={() => onFieldBlur(noteId)}
              />
            </div>
          );
        })}
      </fieldset>

      <Repeater
        legend={tr.wizard.fields.petsLegend}
        itemName={tr.wizard.fields.repeaterPet}
        hint={tr.wizard.hints.pets}
        items={petItems}
        maxItems={PLAN_LIMITS.pets}
        onAdd={() =>
          patchPets(
            appendItem(plan.pets, { id: crypto.randomUUID(), name: '', kind: '', note: '' }),
          )
        }
        onRemove={(index) => patchPets(removeAt(plan.pets, index))}
      />

      <RadioGroup
        legend={tr.wizard.fields.insuranceQuestion}
        name="insurance-dask"
        value={plan.insurance.dask}
        options={INSURANCE_OPTIONS}
        hint={tr.wizard.hints.insurance}
        onChange={(value) => {
          if (isYesNoUnknown(value)) onPatch({ insurance: { dask: value } });
        }}
      />
      {dask ? (
        <p>
          <SourceLink
            url={dask.url}
            label={formatText(tr.wizard.sources.label, { org: dask.org, title: dask.title })}
            accessed={dask.accessed}
          />
        </p>
      ) : null}

      {onDownloadIcs ? (
        <p>
          <button class="button button--secondary" type="button" onClick={onDownloadIcs}>
            {tr.wizard.actions.addCalendar}
          </button>
        </p>
      ) : null}
    </>
  );
}

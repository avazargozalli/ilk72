/**
 * Şartname §11.6 — çanta kontrol listesi sayfası (`#/canta`).
 *
 * Liste **haneye göre üretilir**: `buildBagItemIds` hangi maddelerin seçileceğine
 * karar verir (bebek, çocuk, özel ihtiyaç, evcil hayvan), `mergeBagItems` önceki
 * işaretleri ve notları `id` üzerinden korur. Madde metinleri içerik kaydından
 * gelir (İ4); kullanıcı maddesinin adı `note` alanında tutulur (§11.6, K-13).
 *
 * Sayfa saklama katmanını tanımaz: değişiklikler `onChange` ile yukarı akar.
 * `onChange` verilmezse denetimler salt okunur olur (önizleme).
 */

import { ROUTES } from '../../config.ts';
import { contentByCategory } from '../../content/registry.ts';
import { formatText, tr } from '../../i18n/tr.ts';
import { buildBagItemIds, isCustomBagItemId, mergeBagItems } from '../../model/bag.ts';
import type { ChecklistState, Plan } from '../../model/types.ts';
import { PLAN_LIMITS } from '../../model/validate.ts';
import { Checkbox, Field, Notice, TextInput } from '../components/index.ts';

export interface BagProps {
  plan: Plan;
  /** Her değişiklikte yukarı akan yama; otomatik kayıt uygulama kabuğunda. */
  onChange?: (patch: Partial<Plan>) => void;
}

const BAG_ITEM_TEXTS: ReadonlyMap<string, string> = new Map(
  contentByCategory('canta').map((item) => [item.id, item.text] as const),
);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/u;

function itemText(item: ChecklistState): string {
  if (isCustomBagItemId(item.id)) {
    return item.note.trim() === '' ? tr.pages.bag.customItemFallback : item.note;
  }
  return BAG_ITEM_TEXTS.get(item.id) ?? item.id;
}

function dateValue(value: string | null): string {
  return value !== null && ISO_DATE.test(value) ? value : '';
}

export function Bag({ plan, onChange }: BagProps) {
  const items = mergeBagItems(plan.bag.items, buildBagItemIds(plan));
  const doneCount = items.filter((item) => item.done).length;
  const readOnly = onChange === undefined;

  const patchBag = (changes: Partial<Plan['bag']>): void => {
    onChange?.({ bag: { ...plan.bag, items, ...changes } });
  };

  const toggleItem = (id: string, done: boolean): void => {
    patchBag({ items: items.map((item) => (item.id === id ? { ...item, done } : item)) });
  };

  return (
    <div class="page page--bag">
      <header class="page__heading">
        <h1 tabIndex={-1}>{tr.pages.bag.title}</h1>
        <p>{tr.pages.bag.intro}</p>
      </header>

      {readOnly ? <Notice tone="info">{tr.pages.bag.readOnly}</Notice> : null}

      <div class="bag__metadata">
        <Field
          id="bag-location"
          label={tr.wizard.fields.bagLocation}
          hint={tr.wizard.hints.bagLocation}
        >
          <TextInput
            value={plan.bag.location}
            maxLength={PLAN_LIMITS.shortTextLength}
            disabled={readOnly}
            onInput={(value) => patchBag({ location: value })}
          />
        </Field>

        <Field
          id="bag-last-checked-at"
          label={tr.pages.bag.lastCheckedAt}
          hint={tr.pages.bag.lastCheckedHint}
        >
          <input
            class="text-input"
            type="date"
            value={dateValue(plan.bag.lastCheckedAt)}
            disabled={readOnly}
            onInput={(event) =>
              patchBag({
                lastCheckedAt: event.currentTarget.value === '' ? null : event.currentTarget.value,
              })
            }
          />
        </Field>
      </div>

      <fieldset class="repeater__item-group bag__checklist">
        <legend class="repeater__item-label">{tr.wizard.fields.bagItemsLegend}</legend>
        <p class="bag__count">
          {formatText(tr.pages.bag.itemsCount, { done: doneCount, total: items.length })}
        </p>
        <ul class="bag__items">
          {items.map((item) => {
            const text = itemText(item);
            const custom = isCustomBagItemId(item.id);
            return (
              <li key={item.id}>
                <Checkbox
                  id={`bag-item-${item.id}`}
                  label={text}
                  checked={item.done}
                  disabled={readOnly}
                  onChange={(checked) => toggleItem(item.id, checked)}
                />
                {!custom && item.note.trim() !== '' ? <p class="bag__note">{item.note}</p> : null}
              </li>
            );
          })}
        </ul>
      </fieldset>

      <p>
        <a class="bag__print" href={ROUTES.print}>
          {tr.pages.bag.printLink}
        </a>
      </p>
    </div>
  );
}

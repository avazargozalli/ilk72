/**
 * Şartname §11.5, §15 — tekrarlı alanlar (kişiler, acil kişiler, evcil
 * hayvanlar …).
 *
 * Her öğe görünür bir "Kişi 2 / 4" başlığıyla ve `role="group"` +
 * `aria-labelledby` ile adlandırılır; böylece ekran okuyucu hangi öğenin
 * içinde gezindiğini söyler (§15). Ekle/sil düğmeleri gerçek `<button>`
 * öğeleridir: klavyeyle çalışır, `Tab` sırasına girer ve 44 × 44 px dokunma
 * hedefini CSS sağlar. Öğe adı ("Kişi") i18n'den gelir; bileşende sabit metin
 * yoktur (§0 kural 7).
 */
import type { ComponentChildren } from 'preact';
import { formatText, tr } from '../../i18n/tr.ts';
import { useAutoId } from './a11y.ts';
import { joinClassNames } from './classNames.ts';

export interface RepeaterItem {
  /** Kararlı anahtar (ör. `member.id`); silmede başka öğelerin durumu korunur. */
  key: string;
  /** Öğenin alanları. */
  content: ComponentChildren;
}

export interface RepeaterProps {
  /** Grubun başlığı (`legend`). */
  legend: string;
  /** Tekrarlı öğenin adı: "Kişi", "Acil kişi", "Evcil hayvan" (§11.5). */
  itemName: string;
  items: readonly RepeaterItem[];
  /** Yeni öğe ekleme; verilmezse ekle düğmesi gösterilmez. */
  onAdd?: () => void;
  onRemove: (index: number) => void;
  /** Ekle düğmesi metni; verilmezse "{itemName} ekle" kullanılır. */
  addLabel?: string;
  hint?: string;
  /** Sil düğmesinin kapalı olduğu en az öğe sayısı. */
  minItems?: number;
  /** Ekle düğmesinin kapalı olduğu en çok öğe sayısı. */
  maxItems?: number;
  class?: string;
}

export function Repeater({
  legend,
  itemName,
  items,
  onAdd,
  onRemove,
  addLabel,
  hint,
  minItems = 0,
  maxItems,
  class: className,
}: RepeaterProps) {
  const baseId = useAutoId('repeater');
  const hintId = hint ? `${baseId}-hint` : undefined;
  const total = items.length;
  const canRemove = total > minItems;
  const canAdd = maxItems === undefined || total < maxItems;

  return (
    <fieldset class={joinClassNames('repeater', className)} aria-describedby={hintId}>
      <legend class="repeater__legend">{legend}</legend>
      {hint ? (
        <p class="repeater__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      <ol class="repeater__list">
        {items.map((item, index) => {
          const label = formatText(tr.components.repeater.itemLabel, {
            name: itemName,
            index: index + 1,
            total,
          });
          return (
            <li class="repeater__item" key={item.key}>
              {/* Her öğe kendi `fieldset` + `legend` çiftiyle adlandırılır;
                  ekran okuyucu "Kişi 2 / 4" başlığını grup içinde duyurur (§15). */}
              <fieldset class="repeater__item-group">
                <legend class="repeater__item-label">{label}</legend>
                {item.content}
                <button
                  class="repeater__remove"
                  type="button"
                  disabled={!canRemove}
                  aria-label={formatText(tr.components.repeater.removeItem, {
                    item: label,
                    action: tr.components.repeater.remove,
                  })}
                  onClick={() => onRemove(index)}
                >
                  {tr.components.repeater.remove}
                </button>
              </fieldset>
            </li>
          );
        })}
      </ol>
      {onAdd ? (
        <button class="repeater__add" type="button" disabled={!canAdd} onClick={onAdd}>
          {addLabel ?? formatText(tr.components.repeater.add, { name: itemName })}
        </button>
      ) : null}
    </fieldset>
  );
}

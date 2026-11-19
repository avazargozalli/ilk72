/**
 * Şartname §11.5, §15, §18.1 — `Repeater`.
 *
 * Ölçütler: "Kişi 2 / 4" biçiminde adlandırma, ekle/sil düğmelerinin
 * çalışması, sil düğmesinin erişilebilir adı, klavyeyle erişilebilir gerçek
 * düğmeler, alt/üst sınırlarda düğmelerin kapanması.
 */
import { fireEvent, render, screen } from '@testing-library/preact';
import { describe, expect, it, vi } from 'vitest';
import { formatText, tr } from '../../src/i18n/tr.ts';
import { Repeater, type RepeaterItem } from '../../src/ui/components/index.ts';
import { buttonByName } from './helpers.tsx';

const ITEM_NAME = 'Kişi';

function makeItems(count: number): readonly RepeaterItem[] {
  return Array.from({ length: count }, (_value, index) => ({
    key: `item-${index}`,
    content: <p>{`alan-${index + 1}`}</p>,
  }));
}

function itemLabel(index: number, total: number): string {
  return formatText(tr.components.repeater.itemLabel, { name: ITEM_NAME, index, total });
}

function removeLabel(index: number, total: number): string {
  return formatText(tr.components.repeater.removeItem, {
    item: itemLabel(index, total),
    action: tr.components.repeater.remove,
  });
}

describe('Repeater', () => {
  it('her öğeyi "Kişi 2 / 4" gibi adlandırır', () => {
    render(
      <Repeater
        legend="Hanenizdeki kişiler"
        itemName={ITEM_NAME}
        items={makeItems(4)}
        onRemove={() => undefined}
      />,
    );

    expect(screen.getByText(itemLabel(1, 4)).textContent).toBe('Kişi 1 / 4');
    expect(screen.getByText(itemLabel(2, 4)).textContent).toBe('Kişi 2 / 4');
    expect(screen.getByText(itemLabel(4, 4)).textContent).toBe('Kişi 4 / 4');

    // Her öğe kendi `fieldset` + `legend` çiftiyle gruplanır (§15).
    const groups = screen.getAllByRole('group');
    expect(groups).toHaveLength(5); // dış grup + 4 öğe grubu
    expect(groups[0]?.tagName).toBe('FIELDSET');
    expect(groups[2]?.tagName).toBe('FIELDSET');
  });

  it('sil düğmesine öğe adını içeren erişilebilir ad verir', () => {
    const onRemove = vi.fn();
    render(
      <Repeater legend="Kişiler" itemName={ITEM_NAME} items={makeItems(2)} onRemove={onRemove} />,
    );

    const removeButton = buttonByName(removeLabel(2, 2));

    expect(removeButton.getAttribute('type')).toBe('button');
    fireEvent.click(removeButton);
    expect(onRemove).toHaveBeenCalledWith(1);
  });

  it('ekle düğmesi varsayılan metinle çalışır ve klavyeyle erişilebilir', () => {
    const onAdd = vi.fn();
    render(
      <Repeater
        legend="Kişiler"
        itemName={ITEM_NAME}
        items={makeItems(1)}
        onAdd={onAdd}
        onRemove={() => undefined}
      />,
    );

    const addButton = buttonByName(formatText(tr.components.repeater.add, { name: ITEM_NAME }));

    expect(addButton.tagName).toBe('BUTTON');
    expect(addButton.tabIndex).toBe(0);
    fireEvent.click(addButton);
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('addLabel verilirse onu kullanır', () => {
    render(
      <Repeater
        legend="Kişiler"
        itemName={ITEM_NAME}
        items={[]}
        onAdd={() => undefined}
        onRemove={() => undefined}
        addLabel="Yeni kişi"
      />,
    );

    expect(buttonByName('Yeni kişi').textContent).toBe('Yeni kişi');
    expect(screen.queryByText(itemLabel(1, 0))).toBeNull();
  });

  it('üst sınıra gelince ekle, alt sınırda sil düğmesini kapatır', () => {
    render(
      <Repeater
        legend="Kişiler"
        itemName={ITEM_NAME}
        items={makeItems(3)}
        onAdd={() => undefined}
        onRemove={() => undefined}
        minItems={3}
        maxItems={3}
      />,
    );

    expect(buttonByName(formatText(tr.components.repeater.add, { name: ITEM_NAME })).disabled).toBe(
      true,
    );
    for (const index of [1, 2, 3]) {
      expect(buttonByName(removeLabel(index, 3)).disabled).toBe(true);
    }
  });

  it('onAdd verilmezse ekle düğmesi çizilmez', () => {
    render(
      <Repeater
        legend="Kişiler"
        itemName={ITEM_NAME}
        items={makeItems(1)}
        onRemove={() => undefined}
      />,
    );

    const addLabel = formatText(tr.components.repeater.add, { name: ITEM_NAME });
    expect(screen.queryByRole('button', { name: addLabel })).toBeNull();
  });
});

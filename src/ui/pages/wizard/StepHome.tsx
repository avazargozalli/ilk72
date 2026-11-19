/**
 * Şartname §11.5/6 — "Eviniz" adımı.
 *
 * - Odalardaki güvenli yerler (en çok `PLAN_LIMITS.safeSpots` = 10) ve çıkış
 *   yolları (en çok `PLAN_LIMITS.exits` = 5) metin listeleridir.
 * - Elektrik şalteri, gaz ve su vanası için **yer tarifi** alınır; nasıl
 *   kapatılacağı anlatılmaz (§11.5/6, İ7) ve tesisat uyarısı gösterilir.
 * - Tehlike avı listesi `H-*` maddelerinden gelir (`contentByCategory`).
 */
import { tr } from '../../../i18n/tr.ts';
import { mergeBagItems } from '../../../model/bag.ts';
import type { Plan } from '../../../model/types.ts';
import { PLAN_LIMITS } from '../../../model/validate.ts';
import { Checkbox, Notice, Repeater, type RepeaterItem } from '../../components/index.ts';
import { appendItem, removeAt, replaceAt } from './collections.ts';
import { HAZARD_IDS, HAZARD_ITEMS } from './contentLists.ts';
import { FIELD_IDS } from './fieldIds.ts';
import { TextField } from './fields.tsx';
import type { WizardStepProps } from './stepProps.ts';

type UtilityKey = 'electricity' | 'gas' | 'water';

function withUtility(
  utilities: Plan['home']['utilities'],
  key: UtilityKey,
  value: string,
): Plan['home']['utilities'] {
  if (key === 'electricity') return { ...utilities, electricity: value };
  if (key === 'gas') return { ...utilities, gas: value };
  return { ...utilities, water: value };
}

export function StepHome({ plan, onPatch, errorOf, onFieldBlur }: WizardStepProps) {
  const home = plan.home;
  const safeSpots = home.safeSpots.length > 0 ? home.safeSpots : [''];
  const exits = home.exits.length > 0 ? home.exits : [''];
  const hazards = mergeBagItems(home.hazards, HAZARD_IDS);

  const patchSpots = (next: string[]): void => {
    onPatch({ home: { ...home, safeSpots: next } });
  };
  const patchExits = (next: string[]): void => {
    onPatch({ home: { ...home, exits: next } });
  };
  const patchUtility = (key: UtilityKey, value: string): void => {
    onPatch({ home: { ...home, utilities: withUtility(home.utilities, key, value) } });
  };
  const toggleHazard = (id: string, done: boolean): void => {
    onPatch({
      home: {
        ...home,
        hazards: hazards.map((hazard) => (hazard.id === id ? { ...hazard, done } : hazard)),
      },
    });
  };

  const spotItems: RepeaterItem[] = safeSpots.map((value, index) => {
    const id = FIELD_IDS.safeSpot(index);
    return {
      key: `safe-spot-${index + 1}`,
      content: (
        <TextField
          id={id}
          label={tr.wizard.fields.safeSpotLabel}
          value={value}
          maxLength={PLAN_LIMITS.shortTextLength}
          error={errorOf(id)}
          onInput={(next) => patchSpots(replaceAt(safeSpots, index, next))}
          onBlur={() => onFieldBlur(id)}
        />
      ),
    };
  });

  const exitItems: RepeaterItem[] = exits.map((value, index) => {
    const id = FIELD_IDS.exit(index);
    return {
      key: `exit-${index + 1}`,
      content: (
        <TextField
          id={id}
          label={tr.wizard.fields.exitLabel}
          value={value}
          maxLength={PLAN_LIMITS.shortTextLength}
          error={errorOf(id)}
          onInput={(next) => patchExits(replaceAt(exits, index, next))}
          onBlur={() => onFieldBlur(id)}
        />
      ),
    };
  });

  return (
    <>
      <Repeater
        legend={tr.wizard.fields.safeSpotsLegend}
        itemName={tr.wizard.fields.repeaterSafeSpot}
        hint={tr.wizard.hints.safeSpots}
        items={spotItems}
        minItems={1}
        maxItems={PLAN_LIMITS.safeSpots}
        onAdd={() => {
          if (safeSpots.length >= PLAN_LIMITS.safeSpots) return;
          patchSpots(appendItem(safeSpots, ''));
        }}
        onRemove={(index) => patchSpots(removeAt(safeSpots, index))}
      />

      <Repeater
        legend={tr.wizard.fields.exitsLegend}
        itemName={tr.wizard.fields.repeaterExit}
        hint={tr.wizard.hints.exits}
        items={exitItems}
        minItems={1}
        maxItems={PLAN_LIMITS.exits}
        onAdd={() => {
          if (exits.length >= PLAN_LIMITS.exits) return;
          patchExits(appendItem(exits, ''));
        }}
        onRemove={(index) => patchExits(removeAt(exits, index))}
      />

      <fieldset class="repeater__item-group">
        <legend class="repeater__item-label">{tr.wizard.fields.utilitiesLegend}</legend>
        <p>{tr.wizard.hints.utilities}</p>
        <Notice tone="warning">{tr.wizard.notices.utilitiesWarning}</Notice>
        <TextField
          id={FIELD_IDS.utilityElectricity}
          label={tr.wizard.fields.utilityElectricity}
          value={home.utilities.electricity}
          maxLength={PLAN_LIMITS.shortTextLength}
          error={errorOf(FIELD_IDS.utilityElectricity)}
          onInput={(value) => patchUtility('electricity', value)}
          onBlur={() => onFieldBlur(FIELD_IDS.utilityElectricity)}
        />
        <TextField
          id={FIELD_IDS.utilityGas}
          label={tr.wizard.fields.utilityGas}
          value={home.utilities.gas}
          maxLength={PLAN_LIMITS.shortTextLength}
          error={errorOf(FIELD_IDS.utilityGas)}
          onInput={(value) => patchUtility('gas', value)}
          onBlur={() => onFieldBlur(FIELD_IDS.utilityGas)}
        />
        <TextField
          id={FIELD_IDS.utilityWater}
          label={tr.wizard.fields.utilityWater}
          value={home.utilities.water}
          maxLength={PLAN_LIMITS.shortTextLength}
          error={errorOf(FIELD_IDS.utilityWater)}
          onInput={(value) => patchUtility('water', value)}
          onBlur={() => onFieldBlur(FIELD_IDS.utilityWater)}
        />
      </fieldset>

      <fieldset class="repeater__item-group">
        <legend class="repeater__item-label">{tr.wizard.fields.hazardsLegend}</legend>
        <p>{tr.wizard.hints.hazards}</p>
        {HAZARD_ITEMS.map((item) => {
          const state = hazards.find((hazard) => hazard.id === item.id);
          return (
            <Checkbox
              key={item.id}
              label={item.text}
              checked={state?.done ?? false}
              onChange={(checked) => toggleHazard(item.id, checked)}
            />
          );
        })}
      </fieldset>
    </>
  );
}

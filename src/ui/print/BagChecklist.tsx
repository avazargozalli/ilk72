/**
 * Şartname §12.5 — **Çanta kontrol listesi** (A4).
 *
 * Haneye göre üretilmiş madde listesi (C-*, §11.6) kutularla; çantanın yeri;
 * son kontrol tarihi için boş satır; altında kaynak notu. Madde metinleri
 * içerik kaydından gelir (İ4); kullanıcı maddesinin metni `note` alanındadır
 * (K-13).
 *
 * Liste planda henüz üretilmemişse `buildBagItemIds` ile haneden yeniden
 * üretilir; böylece belge her durumda eksiksiz basılır.
 */
import { tr } from '../../i18n/tr.ts';
import { buildBagItemIds } from '../../model/bag.ts';
import type { ChecklistState, Plan } from '../../model/types.ts';
import {
  BlankLine,
  CheckLine,
  checklistText,
  DocHeading,
  filled,
  LabeledValue,
  PrintFoot,
  planDate,
  printValue,
  SourceNote,
} from './parts.tsx';

export interface BagChecklistProps {
  /** Yazdırılacak plan. */
  plan: Plan;
}

/** Çanta maddesini tek satırda yazar; kullanıcı notu varsa sonuna eklenir. */
function itemLabel(item: ChecklistState): string {
  const text = checklistText(item);
  return filled(item.note) && text !== item.note.trim()
    ? `${text} — ${tr.print.bagList.notePrefix}${item.note.trim()}`
    : text;
}

export function BagChecklist({ plan }: BagChecklistProps) {
  const date = planDate(plan);
  const items: ChecklistState[] =
    plan.bag.items.length > 0
      ? plan.bag.items
      : buildBagItemIds(plan).map((id) => ({ id, done: false, note: '' }));

  return (
    <section class="print-doc print-doc--bag" aria-label={tr.print.documents.bagChecklist.title}>
      <div class="print-sheet">
        <DocHeading title={tr.print.documents.bagChecklist.title} meta={plan.household.label} />

        <LabeledValue label={tr.print.labels.bagLocation} value={printValue(plan.bag.location)} />

        <ul class="print-checks print-checks--spaced">
          {items.map((item) => (
            <CheckLine key={item.id} label={itemLabel(item)} done={item.done} />
          ))}
        </ul>

        <BlankLine label={tr.print.bagList.lastCheckedBlank} />

        <SourceNote sourceKey="K-CANTA-BB" />
        <PrintFoot date={date} />
      </div>
    </section>
  );
}

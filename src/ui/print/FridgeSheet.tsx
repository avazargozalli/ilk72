/**
 * Şartname §12.2 — **Buzdolabı sayfası** (A4, en az 16 pt).
 * Uzun kayıtlar, okunabilirliği korumak için ek sayfaya taşabilir.
 *
 * İçerik: 112; üç buluşma yeri ve resmî toplanma alanı; acil kişiler; vana ve
 * şalter yerleri; çantanın yeri; görevler. **Sağlık bilgisi yoktur** (İ8) — bu
 * belge evde görünür bir yerde durduğu için hassas bilgi taşımaz.
 *
 * Punto büyüklüğü `src/styles/print.css` içinde `.print-doc--fridge` ile 16 pt
 * olarak ayarlanır (§12).
 */
import { tr } from '../../i18n/tr.ts';
import type { Plan } from '../../model/types.ts';
import {
  DocHeading,
  EmergencyBlock,
  filled,
  LabeledValue,
  MeetingPlaces,
  PrintFoot,
  planDate,
  printValue,
} from './parts.tsx';

export interface FridgeSheetProps {
  /** Yazdırılacak plan. */
  plan: Plan;
}

/** Acil kişileri tek satırda yazar: "Zeynep Kaya — 0532 …". */
function contactLine(name: string, phone: string, phoneAlt: string): string {
  const phones = [phone.trim(), phoneAlt.trim()].filter((value) => value !== '');
  return [name.trim(), phones.join(' / ')].filter((part) => part !== '').join(' — ');
}

export function FridgeSheet({ plan }: FridgeSheetProps) {
  const date = planDate(plan);
  // §11.9'daki önceliği izler: şehir dışı kişi en üstte.
  const contacts = [...plan.contacts].sort(
    (first, second) => Number(second.outOfArea) - Number(first.outOfArea),
  );

  return (
    <section class="print-doc print-doc--fridge" aria-label={tr.print.documents.fridgeSheet.title}>
      <div class="print-sheet">
        <DocHeading title={tr.print.documents.fridgeSheet.title} meta={plan.household.label} />

        <EmergencyBlock />

        <div class="print-section">
          <h3 class="print-section__title">{tr.print.sections.meeting}</h3>
          <MeetingPlaces plan={plan} />
        </div>

        <div class="print-section">
          <h3 class="print-section__title">{tr.print.sections.contacts}</h3>
          {contacts.length === 0 ? (
            <p class="print-note">{tr.print.values.none}</p>
          ) : (
            <ul class="print-list print-list--large">
              {contacts.map((contact) => (
                <li key={contact.id}>
                  {contactLine(contact.name, contact.phone, contact.phoneAlt)}
                  {filled(contact.city) ? ` (${contact.city.trim()})` : ''}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div class="print-section">
          <h3 class="print-section__title">{tr.print.sections.utilities}</h3>
          <LabeledValue
            label={tr.print.labels.electricity}
            value={printValue(plan.home.utilities.electricity)}
          />
          <LabeledValue label={tr.print.labels.gas} value={printValue(plan.home.utilities.gas)} />
          <LabeledValue
            label={tr.print.labels.water}
            value={printValue(plan.home.utilities.water)}
          />
        </div>

        <div class="print-section">
          <h3 class="print-section__title">{tr.print.sections.bag}</h3>
          <LabeledValue label={tr.print.labels.bagLocation} value={printValue(plan.bag.location)} />
        </div>

        <div class="print-section">
          <h3 class="print-section__title">{tr.print.sections.roles}</h3>
          {plan.roles.length === 0 ? (
            <p class="print-note">{tr.print.values.none}</p>
          ) : (
            <ul class="print-list print-list--large">
              {plan.roles.map((assignment) => {
                const member = plan.members.find((item) => item.id === assignment.memberId);
                return (
                  <li key={assignment.roleId}>
                    {tr.wizard.roles[assignment.roleId]}
                    {' — '}
                    {member === undefined || !filled(member.name)
                      ? tr.print.values.unassigned
                      : member.name.trim()}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <p class="print-note">{tr.print.fridge.usage}</p>
        <PrintFoot date={date} />
      </div>
    </section>
  );
}

/**
 * Şartname §12.4 — **Çocuk kartları** (çocuk başına, cüzdan kartı ölçüsü).
 *
 * İçerik: ad; "Ailem:" iki veli telefonu; şehir dışı kişi; buluşma yeri;
 * "Beni teslim alabilecekler:" işaretli acil kişiler.
 *
 * **Ev adresi bu karta basılmaz** (§4.1 satır 20). Okul adı **yalnızca**
 * `includeSchoolName` işaretliyse eklenir (§12.4).
 *
 * Ölçü `src/styles/print.css` içinde `.child-card` ile mm cinsinden verilir.
 */
import { tr } from '../../i18n/tr.ts';
import type { Plan } from '../../model/types.ts';
import { DocHeading, filled, PrintFoot, planDate, printValue } from './parts.tsx';

export interface ChildCardsProps {
  /** Yazdırılacak plan. */
  plan: Plan;
  /** Okul adını karta ekle (§12.4 — ayrı onay, varsayılan kapalı). */
  includeSchoolName?: boolean;
}

/** A4 sayfada dört kart (2 × 2). */
const CHILD_CARDS_PER_PAGE = 4;

function chunk<T>(items: readonly T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    pages.push(items.slice(index, index + size));
  }
  return pages;
}

/** Çocuğun okul adı: gün içi yerlerinden `okul` türündeki ilk dolu kayıt. */
function schoolName(plan: Plan, memberId: string): string | null {
  const member = plan.members.find((item) => item.id === memberId);
  if (member === undefined) return null;
  for (const place of member.dailyPlaces) {
    if (place.kind !== 'okul') continue;
    if (filled(place.label)) return place.label.trim();
  }
  return null;
}

export function ChildCards({ plan, includeSchoolName = false }: ChildCardsProps) {
  const date = planDate(plan);
  const children = plan.members.filter((member) => member.group === 'cocuk');
  const pages = chunk(children, CHILD_CARDS_PER_PAGE);

  // İki veli telefonu: yetişkin gruptaki dolu numaralar (§12.4).
  const guardianPhones = plan.members
    .filter((member) => member.group === 'yetiskin' && filled(member.phone))
    .slice(0, 2)
    .map((member) => `${printValue(member.name)} — ${printValue(member.phone)}`);

  const outOfArea = plan.contacts.find((contact) => contact.outOfArea);
  // "Beni teslim alabilecekler:" yalnızca açıkça işaretli acil kişiler (§11.5/4).
  const pickUpContacts = plan.contacts.filter((contact) => contact.canPickUpChildren);

  return (
    <section class="print-doc print-doc--child" aria-label={tr.print.documents.childCards.title}>
      <DocHeading title={tr.print.documents.childCards.title} meta={plan.household.label} />

      {children.length === 0 ? (
        <div class="print-sheet">
          <p class="print-note">{tr.print.childCards.noChildren}</p>
          <PrintFoot date={date} />
        </div>
      ) : (
        pages.map((members, pageIndex) => (
          <div class="print-sheet child-sheet" key={`child-page-${pageIndex}`}>
            <p class="print-note">{tr.print.childCards.usage}</p>
            {members.map((member) => {
              const school = includeSchoolName ? schoolName(plan, member.id) : null;
              return (
                <div class="child-card" key={member.id}>
                  <p class="child-card__eyebrow">{tr.print.documents.childCards.title}</p>
                  <p class="child-card__name">{printValue(member.name)}</p>

                  <p class="child-card__line">{tr.print.childCards.family}</p>
                  {guardianPhones.length === 0 ? (
                    <p class="child-card__line">{tr.print.values.empty}</p>
                  ) : (
                    <ul class="child-card__list">
                      {guardianPhones.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  )}

                  <p class="child-card__line">
                    {tr.print.childCards.outOfArea}{' '}
                    {outOfArea === undefined
                      ? tr.print.values.empty
                      : `${printValue(outOfArea.name)} — ${printValue(outOfArea.phone)}`}
                  </p>

                  <p class="child-card__line">
                    {tr.print.childCards.meeting} {printValue(plan.meeting.nearHome.label)}
                    {filled(plan.meeting.nearHome.detail)
                      ? ` · ${plan.meeting.nearHome.detail.trim()}`
                      : ''}
                  </p>

                  {school === null ? null : (
                    <p class="child-card__line">
                      {tr.print.childCards.school} {school}
                    </p>
                  )}

                  <p class="child-card__line">{tr.print.childCards.pickUp}</p>
                  {pickUpContacts.length === 0 ? (
                    <p class="child-card__line">{tr.print.childCards.pickUpEmpty}</p>
                  ) : (
                    <ul class="child-card__list">
                      {pickUpContacts.map((contact) => (
                        <li key={contact.id}>
                          {printValue(contact.name)} — {printValue(contact.phone)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
            <PrintFoot date={date} />
          </div>
        ))
      )}
    </section>
  );
}

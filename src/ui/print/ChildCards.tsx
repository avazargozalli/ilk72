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
import { formatText, tr } from '../../i18n/tr.ts';
import type { Member, Plan } from '../../model/types.ts';
import { CardPhoneLine, DocHeading, filled, PrintFoot, planDate, printValue } from './parts.tsx';

export interface ChildCardsProps {
  /** Yazdırılacak plan. */
  plan: Plan;
  /** Okul adını karta ekle (§12.4 — ayrı onay, varsayılan kapalı). */
  includeSchoolName?: boolean;
}

/** A4 sayfada dört kart (2 × 2). */
const CHILD_CARDS_PER_PAGE = 4;
const PICKUP_ON_MAIN_CARD = 2;
const PICKUP_ON_CONTINUATION_CARD = 6;

function chunk<T>(items: readonly T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    pages.push(items.slice(index, index + size));
  }
  return pages;
}

/** Çocuğun okul adı: gün içi yerlerinden `okul` türündeki ilk dolu kayıt. */
function schoolName(member: Member): string | null {
  for (const place of member.dailyPlaces) {
    if (place.kind !== 'okul') continue;
    if (filled(place.label)) return place.label.trim();
  }
  return null;
}

export function ChildCards({ plan, includeSchoolName = false }: ChildCardsProps) {
  const date = planDate(plan);
  const children = plan.members.filter((member) => member.group === 'cocuk');
  // İki veli telefonu: yetişkin gruptaki dolu numaralar (§12.4).
  const guardianPhones = plan.members
    .filter((member) => member.group === 'yetiskin' && filled(member.phone))
    .slice(0, 2);

  const outOfArea = plan.contacts.find((contact) => contact.outOfArea);
  // "Beni teslim alabilecekler:" yalnızca açıkça işaretli acil kişiler (§11.5/4).
  const pickUpContacts = plan.contacts.filter((contact) => contact.canPickUpChildren);
  const pickUpGroups = [
    pickUpContacts.slice(0, PICKUP_ON_MAIN_CARD),
    ...chunk(pickUpContacts.slice(PICKUP_ON_MAIN_CARD), PICKUP_ON_CONTINUATION_CARD),
  ];
  const cards = children.flatMap((member) =>
    pickUpGroups.map((contacts, index) => ({ member, contacts, index })),
  );
  const pages = chunk(cards, CHILD_CARDS_PER_PAGE);

  return (
    <section class="print-doc print-doc--child" aria-label={tr.print.documents.childCards.title}>
      <DocHeading title={tr.print.documents.childCards.title} meta={plan.household.label} />

      {children.length === 0 ? (
        <div class="print-sheet">
          <p class="print-note">{tr.print.childCards.noChildren}</p>
          <PrintFoot date={date} />
        </div>
      ) : (
        pages.map((pageCards, pageIndex) => (
          <div class="print-sheet child-sheet" key={`child-page-${pageIndex}`}>
            <p class="print-note">{tr.print.childCards.usage}</p>
            {pageCards.map(({ member, contacts, index }) => {
              const school = includeSchoolName ? schoolName(member) : null;
              return (
                <div class="child-card" key={`${member.id}-${index}`}>
                  <p class="child-card__eyebrow">
                    {pickUpGroups.length === 1
                      ? tr.print.documents.childCards.title
                      : formatText(tr.print.childCards.cardNumber, {
                          index: index + 1,
                          total: pickUpGroups.length,
                        })}
                  </p>
                  <p class="child-card__name print-card__short">{printValue(member.name)}</p>

                  {index === 0 ? (
                    <>
                      <p class="child-card__line">{tr.print.childCards.family}</p>
                      {guardianPhones.length === 0 ? (
                        <p class="child-card__line">{tr.print.values.empty}</p>
                      ) : (
                        <ul class="child-card__list">
                          {guardianPhones.map((guardian) => (
                            <li key={guardian.id}>
                              <CardPhoneLine name={guardian.name} phone={guardian.phone} />
                            </li>
                          ))}
                        </ul>
                      )}

                      <p class="child-card__line">
                        {outOfArea === undefined ? (
                          <>
                            {tr.print.childCards.outOfArea} {tr.print.values.empty}
                          </>
                        ) : (
                          <CardPhoneLine
                            name={`${tr.print.childCards.outOfArea} ${printValue(outOfArea.name)}`}
                            phone={outOfArea.phone || outOfArea.phoneAlt}
                          />
                        )}
                      </p>

                      <p class="child-card__line print-card__short">
                        {tr.print.childCards.meeting} {printValue(plan.meeting.nearHome.label)}
                        {filled(plan.meeting.nearHome.detail)
                          ? ` · ${plan.meeting.nearHome.detail.trim()}`
                          : ''}
                      </p>

                      {school === null ? null : (
                        <p class="child-card__line print-card__short">
                          {tr.print.childCards.school} {school}
                        </p>
                      )}
                    </>
                  ) : null}

                  <p class="child-card__line">{tr.print.childCards.pickUp}</p>
                  {contacts.length === 0 ? (
                    <p class="child-card__line">{tr.print.childCards.pickUpEmpty}</p>
                  ) : (
                    <ul class="child-card__list">
                      {contacts.map((contact) => (
                        <li key={contact.id}>
                          <CardPhoneLine
                            name={contact.name}
                            phone={contact.phone || contact.phoneAlt}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                  <p class="print-card__more">{tr.print.labels.cardShortened}</p>
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

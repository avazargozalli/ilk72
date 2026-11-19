/**
 * Şartname §12.1 — **Tam plan** (A4, 2–4 sayfa).
 *
 * Planın tamamı, bölüm başlıklarıyla. En üstte "Acil durumda 112" ve buluşma
 * yerleri vardır. Sağlık bilgileri **yalnızca** `includeHealth` işaretliyse ve
 * planda sağlık izni (`healthOptIn`) açıksa basılır (§4.1 satır 3, İ8).
 *
 * Ev adresi yalnızca bu çıktıda yer alır (§11.5/1); cüzdan, çocuk kartı ve
 * buzdolabı sayfasında adres basılmaz.
 *
 * Belge üç sayfa bloğuna ayrılmıştır (`print-sheet`); her sayfanın altında
 * §12'deki alt bilgi satırı bulunur.
 */
import { tr } from '../../i18n/tr.ts';
import type { Member, Plan } from '../../model/types.ts';
import {
  CheckLine,
  checklistText,
  DocHeading,
  EmergencyBlock,
  filled,
  LabeledValue,
  MeetingPlaces,
  PrintFoot,
  planDate,
  printDate,
  printValue,
  Section,
  ValueList,
  yesNo,
} from './parts.tsx';

export interface FullPlanProps {
  /** Yazdırılacak plan (uygulama kabuğunda sanitize edilmiş). */
  plan: Plan;
  /** Sağlık bilgilerini de bas (§12.1); varsayılan kapalıdır (İ8). */
  includeHealth?: boolean;
}

/** Gün içinde bulunulan yeri tek satırda yazar. */
function dailyPlaceText(member: Member): string[] {
  return member.dailyPlaces
    .map((place) => {
      const kind = tr.wizard.options.dailyPlaceKinds[place.kind];
      const label = place.label.trim();
      const phone = place.phone.trim();
      const note = place.note.trim();
      const head = label === '' ? kind : `${kind}: ${label}`;
      const withPhone = phone === '' ? head : `${head} (${phone})`;
      return note === '' ? withPhone : `${withPhone} — ${note}`;
    })
    .filter((line) => line.trim() !== '');
}

/** Destek ihtiyaçlarını kısa metne çevirir (§11.5/3). */
function needsText(member: Member): string {
  const parts: string[] = [];
  if (member.needs.mobility) parts.push(tr.wizard.fields.needsMobility);
  if (member.needs.hearing) parts.push(tr.wizard.fields.needsHearing);
  if (member.needs.vision) parts.push(tr.wizard.fields.needsVision);
  if (member.needs.communication) parts.push(tr.wizard.fields.needsCommunication);
  if (filled(member.needs.note)) parts.push(member.needs.note.trim());
  return parts.length === 0 ? tr.print.values.none : parts.join(' · ');
}

/** Kimlik → kişi adı; bulunamazsa boş metin. */
function memberName(plan: Plan, memberId: string | null): string {
  if (memberId === null) return '';
  return plan.members.find((member) => member.id === memberId)?.name.trim() ?? '';
}

/** Kan grubunu tek sözlükten (sihirbazla aynı) yazar; boşsa "Yazılmadı". */
function bloodTypeLabel(member: Member): string {
  const bloodType = member.health?.bloodType;
  if (bloodType === undefined || bloodType === '') return tr.print.values.empty;
  return tr.wizard.options.bloodTypes[bloodType];
}

export function FullPlan({ plan, includeHealth = false }: FullPlanProps) {
  const date = planDate(plan);
  // §12.1 + İ8: sağlık yalnızca iki koşul birlikte sağlanırsa basılır.
  const showHealth = includeHealth && plan.healthOptIn;

  return (
    <section class="print-doc print-doc--full" aria-label={tr.print.documents.fullPlan.title}>
      <DocHeading title={tr.print.documents.fullPlan.title} meta={plan.household.label} />

      {/* 1. sayfa: acil durum, buluşma yerleri, hane, kişiler */}
      <div class="print-sheet">
        <EmergencyBlock />
        <Section title={tr.print.sections.meeting}>
          <MeetingPlaces plan={plan} />
        </Section>

        <Section title={tr.print.sections.household}>
          <LabeledValue
            label={tr.print.labels.householdLabel}
            value={printValue(plan.household.label)}
          />
          <LabeledValue
            label={tr.print.labels.address}
            value={printValue(plan.household.address)}
          />
          <LabeledValue
            label={tr.print.labels.buildingNote}
            value={printValue(plan.household.buildingNote)}
          />
          <LabeledValue
            label={tr.print.labels.floorCount}
            value={printValue(plan.household.floorCount)}
          />
          <p class="print-note">{tr.print.fullPlan.addressNote}</p>
        </Section>

        <Section title={tr.print.sections.members}>
          {plan.members.length === 0 ? (
            <p class="print-note">{tr.print.values.noMembers}</p>
          ) : (
            <table class="print-table">
              <thead>
                <tr>
                  <th scope="col">{tr.print.labels.name}</th>
                  <th scope="col">{tr.print.labels.group}</th>
                  <th scope="col">{tr.print.labels.phone}</th>
                  <th scope="col">{tr.print.labels.dailyPlaces}</th>
                  <th scope="col">{tr.print.labels.needs}</th>
                </tr>
              </thead>
              <tbody>
                {plan.members.map((member) => {
                  const places = dailyPlaceText(member);
                  return (
                    <tr key={member.id}>
                      <td>{printValue(member.name)}</td>
                      <td>{tr.wizard.options.groups[member.group]}</td>
                      <td>{printValue(member.phone)}</td>
                      <td>{places.length === 0 ? tr.print.values.none : places.join('; ')}</td>
                      <td>{needsText(member)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Section>

        <PrintFoot date={date} />
      </div>

      {/* 2. sayfa: sağlık (isteğe bağlı), acil kişiler, ev */}
      <div class="print-sheet">
        {showHealth ? (
          <Section title={tr.print.sections.health}>
            <p class="print-note">{tr.print.fullPlan.healthNote}</p>
            {plan.members.map((member) => (
              <div class="print-health" key={member.id}>
                <p class="print-health__name">{printValue(member.name)}</p>
                <LabeledValue label={tr.print.labels.bloodType} value={bloodTypeLabel(member)} />
                <LabeledValue
                  label={tr.print.labels.conditions}
                  value={printValue(member.health?.conditions)}
                />
                <LabeledValue
                  label={tr.print.labels.medications}
                  value={printValue(member.health?.medications)}
                />
                <LabeledValue
                  label={tr.print.labels.allergies}
                  value={printValue(member.health?.allergies)}
                />
                <LabeledValue
                  label={tr.print.labels.devices}
                  value={printValue(member.health?.devices)}
                />
              </div>
            ))}
          </Section>
        ) : null}

        <Section title={tr.print.sections.contacts}>
          {plan.contacts.length === 0 ? (
            <p class="print-note">{tr.print.values.none}</p>
          ) : (
            <table class="print-table">
              <thead>
                <tr>
                  <th scope="col">{tr.print.labels.name}</th>
                  <th scope="col">{tr.print.labels.relation}</th>
                  <th scope="col">{tr.print.labels.phone}</th>
                  <th scope="col">{tr.print.labels.phoneAlt}</th>
                  <th scope="col">{tr.print.labels.outOfArea}</th>
                  <th scope="col">{tr.print.labels.city}</th>
                  <th scope="col">{tr.print.labels.canPickUp}</th>
                </tr>
              </thead>
              <tbody>
                {plan.contacts.map((contact) => (
                  <tr key={contact.id}>
                    <td>{printValue(contact.name)}</td>
                    <td>{printValue(contact.relation)}</td>
                    <td>{printValue(contact.phone)}</td>
                    <td>{printValue(contact.phoneAlt)}</td>
                    <td>{yesNo(contact.outOfArea)}</td>
                    <td>{printValue(contact.city)}</td>
                    <td>{yesNo(contact.canPickUpChildren)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>

        <Section title={tr.print.sections.home}>
          <ValueList label={tr.print.labels.safeSpots} values={plan.home.safeSpots} />
          <ValueList label={tr.print.labels.exits} values={plan.home.exits} />
          <LabeledValue
            label={tr.print.labels.electricity}
            value={printValue(plan.home.utilities.electricity)}
          />
          <LabeledValue label={tr.print.labels.gas} value={printValue(plan.home.utilities.gas)} />
          <LabeledValue
            label={tr.print.labels.water}
            value={printValue(plan.home.utilities.water)}
          />
          {plan.home.hazards.length === 0 ? null : (
            <>
              <p class="print-row__label">{tr.print.labels.hazards}</p>
              <ul class="print-checks">
                {plan.home.hazards.map((item) => (
                  <CheckLine key={item.id} label={checklistText(item)} done={item.done} />
                ))}
              </ul>
            </>
          )}
        </Section>

        <PrintFoot date={date} />
      </div>

      {/* 3. sayfa: görevler, çanta ve belgeler, evcil hayvanlar, gözden geçirme */}
      <div class="print-sheet">
        <Section title={tr.print.sections.roles}>
          {plan.roles.length === 0 ? (
            <p class="print-note">{tr.print.values.none}</p>
          ) : (
            <table class="print-table">
              <thead>
                <tr>
                  <th scope="col">{tr.print.labels.role}</th>
                  <th scope="col">{tr.print.labels.assignedTo}</th>
                  <th scope="col">{tr.print.labels.roleNote}</th>
                </tr>
              </thead>
              <tbody>
                {plan.roles.map((assignment) => {
                  const name = memberName(plan, assignment.memberId);
                  return (
                    <tr key={assignment.roleId}>
                      <td>{tr.wizard.roles[assignment.roleId]}</td>
                      <td>{name === '' ? tr.print.values.unassigned : name}</td>
                      <td>{printValue(assignment.note)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Section>

        <Section title={tr.print.sections.bag}>
          <LabeledValue label={tr.print.labels.bagLocation} value={printValue(plan.bag.location)} />
          <LabeledValue
            label={tr.print.labels.lastCheckedAt}
            value={printDate(plan.bag.lastCheckedAt)}
          />
          <p class="print-row__label">{tr.print.labels.bagItems}</p>
          {plan.bag.items.length === 0 ? (
            <p class="print-note">{tr.print.values.none}</p>
          ) : (
            <ul class="print-checks">
              {plan.bag.items.map((item) => (
                <CheckLine key={item.id} label={checklistText(item)} done={item.done} />
              ))}
            </ul>
          )}
          <p class="print-row__label">{tr.print.labels.documents}</p>
          {plan.documents.length === 0 ? (
            <p class="print-note">{tr.print.values.none}</p>
          ) : (
            <ul class="print-checks">
              {plan.documents.map((item) => (
                <CheckLine key={item.id} label={checklistText(item)} done={item.done} />
              ))}
            </ul>
          )}
        </Section>

        <Section title={tr.print.sections.pets}>
          {plan.pets.length === 0 ? (
            <p class="print-note">{tr.print.values.none}</p>
          ) : (
            <ul class="print-list">
              {plan.pets.map((pet) => (
                <li key={pet.id}>
                  {[pet.name.trim(), pet.kind.trim(), pet.note.trim()]
                    .filter((part) => part !== '')
                    .join(' · ')}
                </li>
              ))}
            </ul>
          )}
          <LabeledValue
            label={tr.print.labels.insurance}
            value={tr.wizard.options.yesNoUnknown[plan.insurance.dask]}
          />
        </Section>

        <Section title={tr.print.sections.review}>
          <LabeledValue
            label={tr.print.labels.lastDrillAt}
            value={printDate(plan.review.lastDrillAt)}
          />
          <LabeledValue
            label={tr.print.labels.nextReviewAt}
            value={printDate(plan.review.nextReviewAt)}
          />
        </Section>

        <Section title={tr.print.sections.notes}>
          <p class="print-notes">{printValue(plan.notes)}</p>
        </Section>

        <PrintFoot date={date} />
      </div>
    </section>
  );
}

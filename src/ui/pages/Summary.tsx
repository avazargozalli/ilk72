/**
 * Şartname §11.7, İ8 — plan özeti.
 *
 * Planın dokuz bölümü (§11.8 sırasıyla) okunur biçimde gösterilir; her bölümün
 * başlığının hemen altında **Düzenle** bağlantısı ilgili sihirbaz adımına
 * (`#/plan/<n>`) gider. Sayfanın üstünde çıktı düğmeleri (Yazdır, Paylaş) durur.
 *
 * **İ8:** sağlık bilgileri ekranda **varsayılan olarak gizlidir**; yalnızca
 * "Göster" düğmesine basıldığında açılır ve "Gizle" ile yeniden kapanır. Sağlık
 * izni (`healthOptIn`) kapalıysa sağlık alanları hiç okunmaz.
 *
 * Sayfa salt okunurdur: saklama katmanını tanımaz, düzenleme sihirbazda yapılır.
 */
import type { ComponentChildren } from 'preact';
import { useState } from 'preact/hooks';
import { ROUTES } from '../../config.ts';
import { contentByCategory } from '../../content/registry.ts';
import { formatDate, formatText, tr } from '../../i18n/tr.ts';
import { buildBagItemIds, mergeBagItems } from '../../model/bag.ts';
import type { PlanSection } from '../../model/progress.ts';
import type { Contact, Health, Member, Plan, RoleAssignment } from '../../model/types.ts';
import { PhoneLink } from './pages/PhoneLink.tsx';
import { dateOnly, isFilled, uniqueFilledValues } from './pages/shared.ts';

/** §11.8 bölümü → sihirbaz adımı (§11.5). */
const SECTION_STEPS: Record<PlanSection, number> = {
  household: 1,
  members: 2,
  needs: 3,
  contacts: 4,
  meeting: 5,
  home: 6,
  roles: 7,
  bag: 8,
  review: 9,
};

const HAZARD_ITEMS = contentByCategory('tehlike');
const DOCUMENT_ITEMS = contentByCategory('belge');

/** `Etiket: değer` tek satırlık metin. */
function labelValue(label: string, value: string): string {
  return formatText(tr.pages.common.labelValue, { label, value });
}

/** Tanım listesinde bir satır; değer boşsa "Yazılmadı" yazılır. */
function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{isFilled(value) ? value : tr.pages.common.emptyValue}</dd>
    </>
  );
}

/** Bölüm kabuğu: başlık + "Düzenle" bağlantısı. */
function SummarySection({
  section,
  children,
}: {
  section: PlanSection;
  children: ComponentChildren;
}) {
  const title = tr.pages.sectionTitles[section];
  const headingId = `summary-${section}`;

  return (
    <section class="summary__section" aria-labelledby={headingId}>
      <header class="summary__section-heading">
        <h2 id={headingId}>{title}</h2>
        <a class="summary__edit" href={ROUTES.plan(SECTION_STEPS[section])}>
          {tr.pages.common.edit}
          <span class="visually-hidden">
            {formatText(tr.pages.common.editSection, { section: title })}
          </span>
        </a>
      </header>
      {children}
    </section>
  );
}

function memberName(member: Member, index: number): string {
  return isFilled(member.name)
    ? member.name
    : formatText(tr.wizard.fields.memberFallback, { index: index + 1 });
}

function contactName(contact: Contact): string {
  return isFilled(contact.name) ? contact.name : tr.pages.summary.contactFallback;
}

function contactTitle(contact: Contact): string {
  const name = contactName(contact);
  return isFilled(contact.relation)
    ? formatText(tr.pages.summary.contactTitleWithRelation, {
        name,
        relation: contact.relation,
      })
    : name;
}

/** §11.5/3 — işaretli destek ihtiyaçlarının adları. */
const NEED_FLAGS = [
  { key: 'mobility', label: tr.wizard.fields.needsMobility },
  { key: 'hearing', label: tr.wizard.fields.needsHearing },
  { key: 'vision', label: tr.wizard.fields.needsVision },
  { key: 'communication', label: tr.wizard.fields.needsCommunication },
] as const;

function needLabels(member: Member): string[] {
  return NEED_FLAGS.filter((flag) => member.needs[flag.key]).map((flag) => flag.label);
}

function hasHealthValues(health: Health): boolean {
  return (
    isFilled(health.bloodType) ||
    isFilled(health.conditions) ||
    isFilled(health.medications) ||
    isFilled(health.allergies) ||
    isFilled(health.devices)
  );
}

function bloodTypeLabel(health: Health): string {
  return health.bloodType === ''
    ? tr.wizard.options.bloodTypes.none
    : tr.wizard.options.bloodTypes[health.bloodType];
}

/**
 * İ8 — sağlık bilgileri varsayılan gizli. "Göster" düğmesi `aria-expanded` ve
 * `aria-controls` ile bağlıdır; içerik kapalıyken DOM'da **hiç** yer almaz.
 */
function HealthBlock({ plan }: { plan: Plan }) {
  const [visible, setVisible] = useState(false);
  const membersWithHealth = plan.healthOptIn
    ? plan.members.filter((member) => member.health !== undefined && hasHealthValues(member.health))
    : [];

  if (membersWithHealth.length === 0) {
    return (
      <>
        <h3>{tr.pages.summary.healthTitle}</h3>
        <p>{tr.pages.summary.healthNone}</p>
      </>
    );
  }

  return (
    <>
      <h3>{tr.pages.summary.healthTitle}</h3>
      <button
        class="button button--secondary"
        type="button"
        aria-expanded={visible}
        aria-controls="summary-health-details"
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? tr.pages.common.hide : tr.pages.common.show}
      </button>
      <div id="summary-health-details">
        {visible
          ? membersWithHealth.map((member) => {
              const health = member.health;
              if (health === undefined) return null;
              const index = plan.members.indexOf(member);
              return (
                <div key={member.id}>
                  <h4>
                    {formatText(tr.wizard.fields.healthMemberLegend, {
                      name: memberName(member, index),
                    })}
                  </h4>
                  <dl>
                    <FieldRow label={tr.wizard.fields.bloodType} value={bloodTypeLabel(health)} />
                    <FieldRow label={tr.wizard.fields.conditions} value={health.conditions} />
                    <FieldRow label={tr.wizard.fields.medications} value={health.medications} />
                    <FieldRow label={tr.wizard.fields.allergies} value={health.allergies} />
                    <FieldRow label={tr.wizard.fields.devices} value={health.devices} />
                  </dl>
                </div>
              );
            })
          : null}
      </div>
    </>
  );
}

function MembersPanel({ plan }: { plan: Plan }) {
  if (plan.members.length === 0) {
    return <p>{tr.pages.summary.membersEmpty}</p>;
  }

  return (
    <ul class="summary__list">
      {plan.members.map((member, index) => {
        const places = member.dailyPlaces;
        return (
          <li key={member.id}>
            <h3>{memberName(member, index)}</h3>
            <dl>
              <FieldRow
                label={tr.wizard.fields.memberGroup}
                value={tr.wizard.options.groups[member.group]}
              />
              {isFilled(member.phone) ? (
                <>
                  <dt>{tr.wizard.fields.memberPhone}</dt>
                  <dd>
                    <PhoneLink phone={member.phone} />
                  </dd>
                </>
              ) : null}
            </dl>
            {places.length === 0 ? null : (
              <div>
                <p>{tr.pages.summary.dailyPlacesTitle}</p>
                <ul>
                  {places.map((place) => (
                    <li key={`${member.id}-${place.kind}-${place.label}-${place.phone}`}>
                      {isFilled(place.label)
                        ? formatText(tr.pages.summary.dailyPlaceLine, {
                            label: place.label,
                            kind: tr.wizard.options.dailyPlaceKinds[place.kind],
                          })
                        : tr.wizard.options.dailyPlaceKinds[place.kind]}
                      {isFilled(place.phone) ? <PhoneLink phone={place.phone} /> : null}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function NeedsPanel({ plan }: { plan: Plan }) {
  return (
    <>
      {plan.members.length === 0 ? (
        <p>{tr.pages.summary.needsNone}</p>
      ) : (
        <ul class="summary__list">
          {plan.members.map((member, index) => {
            const labels = needLabels(member);
            return (
              <li key={member.id}>
                <h3>{memberName(member, index)}</h3>
                {labels.length > 0 ? <p>{labels.join(', ')}</p> : null}
                {isFilled(member.needs.note) ? <p>{member.needs.note}</p> : null}
                {labels.length === 0 && !isFilled(member.needs.note) ? (
                  <p>{tr.pages.summary.needsNone}</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
      <HealthBlock plan={plan} />
    </>
  );
}

function ContactsPanel({ plan }: { plan: Plan }) {
  if (plan.contacts.length === 0) {
    return <p>{tr.pages.summary.contactsEmpty}</p>;
  }

  return (
    <ul class="summary__list">
      {plan.contacts.map((contact) => (
        <li key={contact.id}>
          <h3>{contactTitle(contact)}</h3>
          {contact.outOfArea ? (
            <p>
              {formatText(
                isFilled(contact.city)
                  ? tr.pages.summary.contactOutOfArea
                  : tr.pages.summary.contactOutOfAreaNoCity,
                { city: contact.city },
              )}
            </p>
          ) : null}
          <dl>
            {isFilled(contact.phone) ? (
              <>
                <dt>{tr.wizard.fields.contactPhone}</dt>
                <dd>
                  <PhoneLink phone={contact.phone} />
                </dd>
              </>
            ) : null}
            {isFilled(contact.phoneAlt) ? (
              <>
                <dt>{tr.pages.summary.phoneAltLabel}</dt>
                <dd>
                  <PhoneLink phone={contact.phoneAlt} />
                </dd>
              </>
            ) : null}
          </dl>
          {contact.canPickUpChildren ? <p>{tr.pages.summary.canPickUpChildren}</p> : null}
        </li>
      ))}
    </ul>
  );
}

const MEETING_PLACES = [
  { key: 'nearHome', label: tr.wizard.fields.nearHomeLabel },
  { key: 'neighborhood', label: tr.wizard.fields.neighborhoodLabel },
  { key: 'outOfArea', label: tr.wizard.fields.outOfAreaLabel },
  { key: 'assemblyArea', label: tr.wizard.fields.assemblyAreaLabel },
] as const;

function MeetingPanel({ plan }: { plan: Plan }) {
  const places = MEETING_PLACES.map(({ key, label }) => ({ key, label, place: plan.meeting[key] }));
  const anyFilled = places.some(({ place }) => isFilled(place.label) || isFilled(place.detail));

  return (
    <>
      {anyFilled ? (
        <dl>
          {places.map(({ key, label, place }) => {
            const hasLabel = isFilled(place.label);
            const hasDetail = isFilled(place.detail);
            const value = hasLabel
              ? formatText(
                  hasDetail ? tr.pages.summary.placeLine : tr.pages.summary.placeLineNoDetail,
                  { label: place.label, detail: place.detail },
                )
              : hasDetail
                ? place.detail
                : tr.pages.common.emptyValue;
            return (
              <div key={key}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            );
          })}
        </dl>
      ) : (
        <p>{tr.pages.summary.meetingEmpty}</p>
      )}
      {plan.meeting.assemblyCheckedAt === null ? null : (
        <p>
          {formatText(tr.pages.summary.meetingCheckedAt, {
            date: formatDate(dateOnly(plan.meeting.assemblyCheckedAt)),
          })}
        </p>
      )}
    </>
  );
}

function HomePanel({ plan }: { plan: Plan }) {
  const safeSpots = uniqueFilledValues(plan.home.safeSpots);
  const exits = uniqueFilledValues(plan.home.exits);
  const hazardIds = new Set(HAZARD_ITEMS.map((item) => item.id));
  const hazardsDone = plan.home.hazards.filter(
    (hazard) => hazard.done && hazardIds.has(hazard.id),
  ).length;

  return (
    <>
      <h3>{tr.pages.summary.homeSafeSpots}</h3>
      {safeSpots.length === 0 ? (
        <p>{tr.pages.common.emptyValue}</p>
      ) : (
        <ul>
          {safeSpots.map((spot) => (
            <li key={spot}>{spot}</li>
          ))}
        </ul>
      )}

      <h3>{tr.pages.summary.homeExits}</h3>
      {exits.length === 0 ? (
        <p>{tr.pages.common.emptyValue}</p>
      ) : (
        <ul>
          {exits.map((exit) => (
            <li key={exit}>{exit}</li>
          ))}
        </ul>
      )}

      <h3>{tr.wizard.fields.utilitiesLegend}</h3>
      <dl>
        <FieldRow
          label={tr.wizard.fields.utilityElectricity}
          value={plan.home.utilities.electricity}
        />
        <FieldRow label={tr.wizard.fields.utilityGas} value={plan.home.utilities.gas} />
        <FieldRow label={tr.wizard.fields.utilityWater} value={plan.home.utilities.water} />
      </dl>

      <p>
        {formatText(tr.pages.summary.hazardsCount, {
          done: hazardsDone,
          total: HAZARD_ITEMS.length,
        })}
      </p>
    </>
  );
}

function RoleRow({ role, plan }: { role: RoleAssignment; plan: Plan }) {
  const member =
    role.memberId === null
      ? undefined
      : plan.members.find((candidate) => candidate.id === role.memberId);
  const value =
    member === undefined
      ? tr.wizard.fields.roleUnassigned
      : memberName(member, plan.members.indexOf(member));

  return (
    <li>
      <p>{labelValue(tr.wizard.roles[role.roleId], value)}</p>
      {isFilled(role.note) ? <p>{role.note}</p> : null}
    </li>
  );
}

function RolesPanel({ plan }: { plan: Plan }) {
  if (plan.roles.length === 0) {
    return <p>{tr.pages.summary.rolesEmpty}</p>;
  }

  return (
    <ul class="summary__list">
      {plan.roles.map((role) => (
        <RoleRow key={role.roleId} role={role} plan={plan} />
      ))}
    </ul>
  );
}

function BagPanel({ plan }: { plan: Plan }) {
  const items = mergeBagItems(plan.bag.items, buildBagItemIds(plan));
  const doneItems = items.filter((item) => item.done).length;
  const documentIds = new Set(DOCUMENT_ITEMS.map((item) => item.id));
  const doneDocuments = plan.documents.filter(
    (document) => document.done && documentIds.has(document.id),
  ).length;

  return (
    <>
      <dl>
        <FieldRow label={tr.wizard.fields.bagLocation} value={plan.bag.location} />
        <FieldRow
          label={tr.pages.summary.insuranceTitle}
          value={tr.wizard.options.yesNoUnknown[plan.insurance.dask]}
        />
      </dl>
      <p>{formatText(tr.pages.summary.bagItemsCount, { done: doneItems, total: items.length })}</p>
      <p>
        {formatText(tr.pages.summary.documentsCount, {
          done: doneDocuments,
          total: DOCUMENT_ITEMS.length,
        })}
      </p>
      <p>
        <a href={ROUTES.bag}>{tr.pages.summary.bagOpen}</a>
      </p>

      <h3>{tr.pages.summary.petsTitle}</h3>
      {plan.pets.length === 0 ? (
        <p>{tr.pages.summary.petsEmpty}</p>
      ) : (
        <ul>
          {plan.pets.map((pet) => (
            <li key={pet.id}>
              {formatText(
                isFilled(pet.kind) ? tr.pages.summary.petLineWithKind : tr.pages.summary.petLine,
                { name: pet.name, kind: pet.kind },
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function ReviewPanel({ plan }: { plan: Plan }) {
  return (
    <dl>
      <dt>{tr.wizard.fields.lastDrillAt}</dt>
      <dd>
        {plan.review.lastDrillAt === null
          ? tr.pages.common.emptyValue
          : formatDate(dateOnly(plan.review.lastDrillAt))}
      </dd>
      <dt>{tr.wizard.fields.nextReviewAt}</dt>
      <dd>
        {plan.review.nextReviewAt === null
          ? tr.pages.common.emptyValue
          : formatDate(dateOnly(plan.review.nextReviewAt))}
      </dd>
      <dt>{tr.wizard.fields.notes}</dt>
      <dd>{isFilled(plan.notes) ? plan.notes : tr.pages.summary.notesEmpty}</dd>
    </dl>
  );
}

export interface SummaryProps {
  plan: Plan;
}

export function Summary({ plan }: SummaryProps) {
  return (
    <div class="page page--summary">
      <h1 tabIndex={-1}>{tr.pages.summary.title}</h1>

      <section class="summary__outputs" aria-labelledby="summary-outputs">
        <h2 id="summary-outputs">{tr.pages.summary.outputsTitle}</h2>
        <div class="button-row">
          <a class="button button--primary" href={ROUTES.print}>
            {tr.nav.print}
          </a>
          <a class="button button--secondary" href={ROUTES.share}>
            {tr.nav.share}
          </a>
        </div>
      </section>

      <SummarySection section="household">
        <dl>
          <FieldRow label={tr.wizard.fields.householdLabel} value={plan.household.label} />
          <FieldRow label={tr.wizard.fields.householdAddress} value={plan.household.address} />
          <FieldRow
            label={tr.wizard.fields.householdBuildingNote}
            value={plan.household.buildingNote}
          />
          {isFilled(plan.household.floorCount) ? (
            <FieldRow label={tr.pages.summary.floorCountLabel} value={plan.household.floorCount} />
          ) : null}
        </dl>
      </SummarySection>

      <SummarySection section="members">
        <MembersPanel plan={plan} />
      </SummarySection>

      <SummarySection section="needs">
        <NeedsPanel plan={plan} />
      </SummarySection>

      <SummarySection section="contacts">
        <ContactsPanel plan={plan} />
      </SummarySection>

      <SummarySection section="meeting">
        <MeetingPanel plan={plan} />
      </SummarySection>

      <SummarySection section="home">
        <HomePanel plan={plan} />
      </SummarySection>

      <SummarySection section="roles">
        <RolesPanel plan={plan} />
      </SummarySection>

      <SummarySection section="bag">
        <BagPanel plan={plan} />
      </SummarySection>

      <SummarySection section="review">
        <ReviewPanel plan={plan} />
      </SummarySection>
    </div>
  );
}

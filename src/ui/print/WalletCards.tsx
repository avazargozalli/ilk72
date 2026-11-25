/**
 * Şartname §12.3 — **Cüzdan kartları** (kişi başına).
 *
 * Ölçü 85,6 × 54 mm; iki yüz yan yana, ortada katlama çizgisi ve kesme
 * çizgileri. A4 sayfada dört kart vardır (§12). Ön yüz: ad, hane etiketi, 112 ve
 * buluşma yerleri. Arka yüz: şehir dışı kişi ve en çok üç acil telefon; isteğe
 * bağlı kan grubu ve tek satır not — **ayrı onayla** (§4.1 satır 3, İ8).
 *
 * Kare kod yalnızca yazdırma sayfasında ayrıca seçilirse arka yüze basılır.
 *
 * Ev adresi bu kartta **yoktur** (§4.1 satır 20).
 */
import { EMERGENCY_NUMBER, EMERGENCY_TEL } from '../../config.ts';
import { tr } from '../../i18n/tr.ts';
import type { Contact, Member, Plan } from '../../model/types.ts';
import type { ShareQr } from '../../share/index.ts';
import { ShareQrImage } from '../components/ShareQrImage.tsx';
import { CardPhoneLine, DocHeading, filled, PrintFoot, planDate, printValue } from './parts.tsx';

export interface WalletCardsProps {
  /** Yazdırılacak plan. */
  plan: Plan;
  /** Arka yüze kan grubunu bas (§12.3 — ayrı onay, varsayılan kapalı). */
  includeBloodType?: boolean;
  /** Arka yüze tek satır not bas (§12.3 — ayrı onay, varsayılan kapalı). */
  includeWalletNote?: boolean;
  /** Ayrı seçimle arka yüze basılan plan özeti kare kodu. */
  qr?: ShareQr | null;
}

/** A4 sayfada dört kart (§12). */
const CARDS_PER_PAGE = 4;

/** Şehir dışı kişi: ilk işaretli kişi; yoksa `undefined`. */
function outOfAreaContact(plan: Plan): Contact | undefined {
  return plan.contacts.find((contact) => contact.outOfArea);
}

/** En çok üç acil kişi; şehir dışı kişi ayrı satırda zaten gösterilir. */
function emergencyContacts(plan: Plan, outOfArea: Contact | undefined): Contact[] {
  return [...plan.contacts]
    .sort((first, second) => Number(second.outOfArea) - Number(first.outOfArea))
    .filter((contact) => filled(contact.phone) || filled(contact.phoneAlt))
    .slice(0, 3)
    .filter((contact) => contact.id !== outOfArea?.id);
}

/** Plan notlarının ilk dolu satırı (§12.3 tek satır not). */
function noteLine(plan: Plan): string | null {
  for (const line of plan.notes.split('\n')) {
    const trimmed = line.trim();
    if (trimmed !== '') return trimmed;
  }
  return null;
}

function chunk<T>(items: readonly T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    pages.push(items.slice(index, index + size));
  }
  return pages;
}

function bloodTypeText(member: Member): string | null {
  const bloodType = member.health?.bloodType;
  if (bloodType === undefined || bloodType === '') return null;
  return tr.wizard.options.bloodTypes[bloodType];
}

function MemberCard({
  plan,
  member,
  includeBloodType,
  includeWalletNote,
  qr,
}: {
  plan: Plan;
  member: Member;
  includeBloodType: boolean;
  includeWalletNote: boolean;
  qr: ShareQr | null;
}) {
  const outOfArea = outOfAreaContact(plan);
  const contacts = emergencyContacts(plan, outOfArea);
  const bloodType = includeBloodType && plan.healthOptIn ? bloodTypeText(member) : null;
  const note = includeWalletNote ? noteLine(plan) : null;

  return (
    <div class="wallet-row">
      <div class="wallet-card wallet-card--front">
        <p class="wallet-card__eyebrow">{tr.print.wallet.frontTitle}</p>
        <p class="wallet-card__name print-card__short">{printValue(member.name)}</p>
        <p class="wallet-card__household print-card__short">{printValue(plan.household.label)}</p>
        <p class="wallet-card__emergency">
          <a class="wallet-card__call" href={EMERGENCY_TEL}>
            {EMERGENCY_NUMBER}
          </a>
        </p>
        <p class="wallet-card__line print-card__short">
          {tr.print.wallet.meetingNear}: {placeOf(plan.meeting.nearHome)}
        </p>
        <p class="wallet-card__line print-card__short">
          {tr.print.wallet.meetingNeighborhood}: {placeOf(plan.meeting.neighborhood)}
        </p>
        <p class="wallet-card__line print-card__short">
          {tr.print.wallet.meetingOutOfArea}: {placeOf(plan.meeting.outOfArea)}
        </p>
        <p class="print-card__more">{tr.print.labels.cardShortened}</p>
      </div>

      <div class="wallet-card__fold" aria-hidden="true">
        <span class="wallet-card__fold-label">{tr.print.labels.cardFold}</span>
      </div>

      <div class="wallet-card wallet-card--back">
        <p class="wallet-card__eyebrow">{tr.print.wallet.backTitle}</p>
        <div class="wallet-card__back-layout">
          <div class="wallet-card__contact-list">
            <p>{tr.print.wallet.outOfAreaContact}:</p>
            {outOfArea === undefined ? (
              <p>{tr.print.values.empty}</p>
            ) : (
              <p>
                <CardPhoneLine
                  name={outOfArea.name}
                  phone={outOfArea.phone}
                  phoneAlt={outOfArea.phoneAlt}
                />
              </p>
            )}
            <p>{tr.print.wallet.emergencyContacts}:</p>
            {contacts.length === 0 ? (
              <p>{tr.print.values.none}</p>
            ) : (
              <ul class="wallet-card__list">
                {contacts.map((contact) => (
                  <li key={contact.id}>
                    <CardPhoneLine
                      name={contact.name}
                      phone={contact.phone}
                      phoneAlt={contact.phoneAlt}
                    />
                  </li>
                ))}
              </ul>
            )}
            {bloodType === null ? null : (
              <p>
                {tr.print.wallet.bloodType}: {bloodType}
              </p>
            )}
            {note === null ? null : (
              <p class="print-card__short">
                {tr.print.wallet.note}: {note}
              </p>
            )}
          </div>
          {qr === null ? null : <ShareQrImage qr={qr} class="wallet-card__qr" />}
        </div>
      </div>
    </div>
  );
}

/** Yer etiketini tek satırda yazar (buluşma yerleri için kısa biçim). */
function placeOf(place: { label: string; detail: string }): string {
  const label = place.label.trim();
  const detail = place.detail.trim();
  if (label === '' && detail === '') return tr.print.values.empty;
  return detail === '' ? label : `${label} · ${detail}`;
}

export function WalletCards({
  plan,
  includeBloodType = false,
  includeWalletNote = false,
  qr = null,
}: WalletCardsProps) {
  const date = planDate(plan);
  const pages = chunk(plan.members, CARDS_PER_PAGE);

  return (
    <section class="print-doc print-doc--wallet" aria-label={tr.print.documents.walletCards.title}>
      <DocHeading title={tr.print.documents.walletCards.title} meta={plan.household.label} />

      {plan.members.length === 0 ? (
        <div class="print-sheet">
          <p class="print-note">{tr.print.wallet.noMembers}</p>
          <PrintFoot date={date} />
        </div>
      ) : (
        pages.map((members, pageIndex) => (
          <div class="print-sheet wallet-sheet" key={`wallet-page-${pageIndex}`}>
            <p class="print-note">{tr.print.wallet.usage}</p>
            {members.map((member) => (
              <MemberCard
                key={member.id}
                plan={plan}
                member={member}
                includeBloodType={includeBloodType}
                includeWalletNote={includeWalletNote}
                qr={qr}
              />
            ))}
            <PrintFoot date={date} />
          </div>
        ))
      )}
    </section>
  );
}

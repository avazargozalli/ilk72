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
import { DocHeading, filled, PrintFoot, planDate, printValue } from './parts.tsx';

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

/** En çok üç acil telefon; şehir dışı kişi en üstte (§11.9 önceliği). */
function emergencyPhones(plan: Plan): string[] {
  const sorted = [...plan.contacts].sort(
    (first, second) => Number(second.outOfArea) - Number(first.outOfArea),
  );
  const lines: string[] = [];
  for (const contact of sorted) {
    const phones = [contact.phone.trim(), contact.phoneAlt.trim()].filter((value) => value !== '');
    if (phones.length === 0) continue;
    lines.push(
      filled(contact.name) ? `${contact.name.trim()} — ${phones.join(' / ')}` : phones.join(' / '),
    );
    if (lines.length >= 3) break;
  }
  return lines;
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
  const phones = emergencyPhones(plan);
  const bloodType = includeBloodType && plan.healthOptIn ? bloodTypeText(member) : null;
  const note = includeWalletNote ? noteLine(plan) : null;

  return (
    <div class="wallet-row">
      <div class="wallet-card wallet-card--front">
        <p class="wallet-card__eyebrow">{tr.print.wallet.frontTitle}</p>
        <p class="wallet-card__name">{printValue(member.name)}</p>
        <p class="wallet-card__household">{printValue(plan.household.label)}</p>
        <p class="wallet-card__emergency">
          <a class="wallet-card__call" href={EMERGENCY_TEL}>
            {EMERGENCY_NUMBER}
          </a>
        </p>
        <p class="wallet-card__line">
          {tr.print.wallet.meetingNear}: {placeOf(plan.meeting.nearHome)}
        </p>
        <p class="wallet-card__line">
          {tr.print.wallet.meetingNeighborhood}: {placeOf(plan.meeting.neighborhood)}
        </p>
        <p class="wallet-card__line">
          {tr.print.wallet.meetingOutOfArea}: {placeOf(plan.meeting.outOfArea)}
        </p>
      </div>

      <div class="wallet-card__fold" aria-hidden="true">
        <span class="wallet-card__fold-label">{tr.print.labels.cardFold}</span>
      </div>

      <div class="wallet-card wallet-card--back">
        <p class="wallet-card__eyebrow">{tr.print.wallet.backTitle}</p>
        {qr === null ? null : <ShareQrImage qr={qr} class="wallet-card__qr" />}
        <p class="wallet-card__line">
          {tr.print.wallet.outOfAreaContact}:{' '}
          {outOfArea === undefined
            ? tr.print.values.empty
            : `${printValue(outOfArea.name)} — ${printValue(outOfArea.phone)}`}
        </p>
        <p class="wallet-card__line">{tr.print.wallet.emergencyContacts}:</p>
        {phones.length === 0 ? (
          <p class="wallet-card__line">{tr.print.values.none}</p>
        ) : (
          <ul class="wallet-card__list">
            {phones.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}
        {bloodType === null ? null : (
          <p class="wallet-card__line">
            {tr.print.wallet.bloodType}: {bloodType}
          </p>
        )}
        {note === null ? null : (
          <p class="wallet-card__line">
            {tr.print.wallet.note}: {note}
          </p>
        )}
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

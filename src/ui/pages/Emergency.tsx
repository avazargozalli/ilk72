/**
 * Şartname §11.9, İ6 — acil ekranı (`#/acil`).
 *
 * Çevrimdışı açılır; tek sütun, büyük punto ve yüksek kontrast hedeflenir
 * (görsel ağırlık başlık düzeyleri ve `.button--emergency` ile kurulur).
 *
 * Sıra §11.9'daki gibidir:
 * 1. `<a href="tel:112">` düğmesi ve hemen altında "Bu uygulama yardım çağırmaz."
 * 2. Buluşma yerleri: ev yakını → mahalle → şehir dışı, ayrıca toplanma alanı.
 * 3. Acil kişiler; **şehir dışı kişi en üstte**, telefonlar `tel:` bağlantısı.
 * 4. Deprem **sonrası** kartlarının kısa listesi (`contentByCategory('sonra')`)
 *    ve her kartın kaynak bağlantıları.
 *
 * **§9.3:** kilit açık olsa da 112 düğmesi parolasız görünür. Bu sayfa kilidi
 * bilmez; 112'yi **her zaman** çizer, `plan` verilmese bile. Plan yoksa yalnızca
 * buluşma yeri ve acil kişi bölümleri boş görünür.
 */

import { EMERGENCY_TEL } from '../../config.ts';
import { contentByCategory } from '../../content/registry.ts';
import { formatDate, formatText, tr } from '../../i18n/tr.ts';
import type { Contact, Place, Plan } from '../../model/types.ts';
import { PhoneLink } from './pages/PhoneLink.tsx';
import { SourceLine } from './pages/SourceLine.tsx';
import { dateOnly, isFilled } from './pages/shared.ts';

export interface EmergencyProps {
  plan: Plan | null;
}

const AFTER_ITEMS = contentByCategory('sonra');

const EMERGENCY_PLACES = [
  { key: 'nearHome', label: tr.wizard.fields.nearHomeLabel },
  { key: 'neighborhood', label: tr.wizard.fields.neighborhoodLabel },
  { key: 'outOfArea', label: tr.wizard.fields.outOfAreaLabel },
  { key: 'assemblyArea', label: tr.wizard.fields.assemblyAreaLabel },
] as const;

/** Şehir dışı irtibat kişisi en üste; diğerleri kendi sırasında kalır. */
function outOfAreaFirst(contacts: readonly Contact[]): Contact[] {
  return [...contacts].sort((first, second) => Number(second.outOfArea) - Number(first.outOfArea));
}

function placeValue(place: Place | undefined): string {
  if (place === undefined) return tr.pages.emergency.placeEmpty;
  if (isFilled(place.label) && isFilled(place.detail)) {
    return formatText(tr.pages.summary.placeLine, {
      label: place.label,
      detail: place.detail,
    });
  }
  if (isFilled(place.label)) return place.label;
  if (isFilled(place.detail)) return place.detail;
  return tr.pages.emergency.placeEmpty;
}

function contactHeadline(contact: Contact): string {
  return isFilled(contact.name) ? contact.name : tr.pages.emergency.contactFallback;
}

export function Emergency({ plan }: EmergencyProps) {
  const contacts = plan === null ? [] : outOfAreaFirst(plan.contacts);

  return (
    <div class="page page--emergency">
      <h1 tabIndex={-1}>{tr.pages.emergency.title}</h1>
      {plan === null ? <p>{tr.pages.emergency.noPlan}</p> : null}

      <section class="emergency__call" aria-labelledby="emergency-call">
        <h2 id="emergency-call">{tr.pages.emergency.callTitle}</h2>
        <p>
          <a class="button button--emergency" href={EMERGENCY_TEL}>
            {tr.pages.emergency.callAction}
          </a>
        </p>
        <p>{tr.pages.emergency.callNote}</p>
      </section>

      <section class="emergency__places" aria-labelledby="emergency-places">
        <h2 id="emergency-places">{tr.pages.emergency.placesTitle}</h2>
        <dl>
          {EMERGENCY_PLACES.map(({ key, label }) => (
            <div key={key}>
              <dt>{label}</dt>
              <dd>{placeValue(plan === null ? undefined : plan.meeting[key])}</dd>
            </div>
          ))}
        </dl>
        {plan !== null && plan.meeting.assemblyCheckedAt !== null ? (
          <p>
            {formatText(tr.pages.emergency.assemblyCheckedAt, {
              date: formatDate(dateOnly(plan.meeting.assemblyCheckedAt)),
            })}
          </p>
        ) : null}
      </section>

      <section class="emergency__contacts-section" aria-labelledby="emergency-contacts">
        <h2 id="emergency-contacts">{tr.pages.emergency.contactsTitle}</h2>
        {contacts.length === 0 ? (
          <p>{tr.pages.emergency.contactsEmpty}</p>
        ) : (
          <ul class="emergency__contacts">
            {contacts.map((contact) => (
              <li class="emergency__contact" key={contact.id}>
                <h3>{contactHeadline(contact)}</h3>
                {contact.outOfArea ? (
                  <p>
                    {formatText(
                      isFilled(contact.city)
                        ? tr.pages.emergency.contactOutOfArea
                        : tr.pages.emergency.contactOutOfAreaNoCity,
                      { city: contact.city },
                    )}
                  </p>
                ) : null}
                {isFilled(contact.relation) ? <p>{contact.relation}</p> : null}
                {isFilled(contact.phone) ? (
                  <p class="emergency__phone">
                    <PhoneLink phone={contact.phone} />
                  </p>
                ) : null}
                {isFilled(contact.phoneAlt) ? (
                  <p class="emergency__phone">
                    <PhoneLink phone={contact.phoneAlt} />
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section class="emergency__after" aria-labelledby="emergency-after">
        <h2 id="emergency-after">{tr.pages.emergency.afterTitle}</h2>
        <p>{tr.pages.emergency.afterIntro}</p>
        <ul class="emergency__cards">
          {AFTER_ITEMS.map((item) => (
            <li class="emergency__card" key={item.id}>
              <p>{item.text}</p>
              {item.sources.map((sourceKey) => (
                <SourceLine key={sourceKey} sourceKey={sourceKey} />
              ))}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

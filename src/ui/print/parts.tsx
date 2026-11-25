/**
 * Şartname §12 — baskı belgelerinin ortak parçaları.
 *
 * Altı belge de aynı küçük yapı taşlarını kullanır: belge başlığı, bölüm
 * başlığı, etiket/değer satırı, buluşma yerleri, 112 yönlendirmesi, onay kutusu
 * taklidi ve her sayfanın altındaki alt bilgi satırı (§12, §14.5).
 *
 * Kurallar:
 * - Metinler `tr.print` içinden gelir; bu dosyaya sabit Türkçe metin yazılmaz.
 * - Kullanıcı verisi DOM'a yalnızca Preact metin düğümleriyle girer
 *   (`dangerouslySetInnerHTML` yok, §17).
 * - Sağlık bilgisi hiçbir yerde "varsayılan" olarak basılmaz; onu yalnızca
 *   `FullPlan` (`includeHealth`) ve `WalletCards` (`includeBloodType`) basar.
 * - Baskı stilini uygulama girişinde yüklenen `src/styles/print.css` sağlar.
 */
import type { ComponentChildren } from 'preact';
import { APP_NAME, EMERGENCY_NUMBER, EMERGENCY_TEL } from '../../config.ts';
import { getContentItem } from '../../content/registry.ts';
import { getSource } from '../../content/sources.ts';
import { formatDate, formatText, tr } from '../../i18n/tr.ts';
import type { ChecklistState, Place, Plan } from '../../model/types.ts';

/** Boş olmayan (kırpılmış) metin mi? */
export function filled(value: string | null | undefined): boolean {
  return (value ?? '').trim() !== '';
}

/** Plandaki metni basar; boşsa "Yazılmadı" yazar (boş satır bırakmaz). */
export function printValue(value: string | null | undefined): string {
  const text = (value ?? '').trim();
  return text === '' ? tr.print.values.empty : text;
}

/** Kartlarda yer daraldığında ad kısalabilir, numara ayrı ve tam görünür. */
export function CardPhoneLine({
  name,
  phone,
  phoneAlt,
}: {
  name: string;
  phone: string;
  phoneAlt?: string;
}) {
  const primary = phone.trim();
  const alternate = phoneAlt?.trim() ?? '';
  return (
    <>
      <span class="print-card__phone-row">
        <span class="print-card__short">{printValue(name)} — </span>
        <span class="print-card__number">{printValue(primary || alternate)}</span>
      </span>
      {primary && alternate ? <span class="print-card__number">{alternate}</span> : null}
    </>
  );
}

/** ISO tarih ya da ISO zaman damgasını `GG.AA.YYYY` biçiminde basar. */
export function printDate(value: string | null | undefined): string {
  if (!filled(value)) return tr.print.values.empty;
  return formatDate((value ?? '').slice(0, 10));
}

/** Alt bilgi satırındaki tarih: planın son kayıt tarihi (§12). */
export function planDate(plan: Plan): string {
  return plan.updatedAt.slice(0, 10);
}

/** Bugünün `YYYY-AA-GG` biçimi (plansız belgeler için). */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Bir buluşma yerini tek satırda yazar: "Park · Apartmanın karşısı". */
export function placeText(place: Place): string {
  const label = place.label.trim();
  const detail = place.detail.trim();
  if (label === '' && detail === '') return tr.print.values.empty;
  if (detail === '') return label;
  if (label === '') return detail;
  return `${label} · ${detail}`;
}

/** Evet/hayır değerini tek sözlükten (sihirbazla aynı) yazar (§15). */
export function yesNo(value: boolean): string {
  return value ? tr.wizard.options.yesNoUnknown.evet : tr.wizard.options.yesNoUnknown.hayir;
}

/**
 * §12 — her sayfanın altındaki küçük punto satır.
 * Cümle `tr.print.footer.line`, uygulama adı `APP_NAME`'den gelir (§0.1).
 */
export function PrintFoot({ date }: { date: string }) {
  return (
    <p class="print-foot">
      {formatText(tr.print.footer.line, { app: APP_NAME, date: formatDate(date) })}
    </p>
  );
}

/** Belge başlığı (`h2`) ve varsa alt satırı. */
export function DocHeading({ title, meta }: { title: string; meta?: string }) {
  return (
    <header class="print-doc__heading">
      <h2 class="print-doc__title">{title}</h2>
      {meta ? <p class="print-doc__meta">{meta}</p> : null}
    </header>
  );
}

/** Bölüm başlığı (`h3`) ve içeriği. */
export function Section({ title, children }: { title: string; children?: ComponentChildren }) {
  return (
    <section class="print-section">
      <h3 class="print-section__title">{title}</h3>
      {children}
    </section>
  );
}

/** Etiket + değer satırı. */
export function LabeledValue({ label, value }: { label: string; value: string }) {
  return (
    <div class="print-row">
      <span class="print-row__label">{label}</span>
      <span class="print-row__value">{value}</span>
    </div>
  );
}

/** Değer listesi; liste boşsa "Yok" yazar. */
export function ValueList({ label, values }: { label: string; values: readonly string[] }) {
  const lines = values.map((value) => value.trim()).filter((value) => value !== '');
  return (
    <div class="print-row">
      <span class="print-row__label">{label}</span>
      <span class="print-row__value">
        {lines.length === 0 ? (
          tr.print.values.none
        ) : (
          <ul class="print-list">
            {lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}
      </span>
    </div>
  );
}

/** §12.1, §12.2, §12.3 — "Acil durumda 112" kutusu (İ6: tek numara 112). */
export function EmergencyBlock() {
  return (
    <div class="print-emergency">
      <p class="print-emergency__title">{tr.print.emergency.title}</p>
      <p class="print-emergency__number">
        <a class="print-emergency__call" href={EMERGENCY_TEL}>
          {EMERGENCY_NUMBER}
        </a>
        <span class="print-emergency__link">{tr.print.emergency.call}</span>
      </p>
      <p class="print-emergency__note">{tr.print.emergency.note}</p>
    </div>
  );
}

/** §12 — üç buluşma yeri ve resmî toplanma alanı. */
export function MeetingPlaces({ plan }: { plan: Plan }) {
  return (
    <div class="print-places">
      <LabeledValue label={tr.print.labels.nearHome} value={placeText(plan.meeting.nearHome)} />
      <LabeledValue
        label={tr.print.labels.neighborhood}
        value={placeText(plan.meeting.neighborhood)}
      />
      <LabeledValue
        label={tr.print.labels.outOfAreaPlace}
        value={placeText(plan.meeting.outOfArea)}
      />
      <LabeledValue
        label={tr.print.labels.assemblyArea}
        value={placeText(plan.meeting.assemblyArea)}
      />
      {filled(plan.meeting.assemblyCheckedAt) ? (
        <LabeledValue
          label={tr.print.labels.assemblyCheckedAt}
          value={printDate(plan.meeting.assemblyCheckedAt)}
        />
      ) : null}
    </div>
  );
}

/**
 * §12.5 — kontrol listesi maddesinin metni.
 * Bilinen maddelerin metni içerik kaydından (`C-*`, `B-*`, `H-*`), kullanıcı
 * maddesinin metni `note` alanından gelir (K-13).
 */
export function checklistText(item: ChecklistState): string {
  const content = getContentItem(item.id);
  if (content !== undefined) return content.text;
  return filled(item.note) ? item.note.trim() : tr.print.values.empty;
}

/** Kâğıtta işaret kutusu (işaret durumu ekran okuyucuya metinle verilir). */
export function CheckLine({ label, done }: { label: string; done: boolean }) {
  return (
    <li class="print-check">
      <span class="print-check__box" aria-hidden="true">
        {done ? '✓' : ''}
      </span>
      <span class="print-check__text">{label}</span>
      <span class="visually-hidden">{done ? tr.print.values.done : tr.print.values.notDone}</span>
    </li>
  );
}

/**
 * §12.5, §13.1 — kaynak notu. Kaynak kaydında olmayan anahtar için cümle
 * uydurulmaz; "kaynak kaydı bulunamadı" yazılır (İ4).
 */
export function SourceNote({ sourceKey }: { sourceKey: string }) {
  const source = getSource(sourceKey);
  if (source === undefined) {
    return <p class="print-source">{tr.print.source.missing}</p>;
  }
  return (
    <p class="print-source">
      {formatText(tr.print.source.line, {
        org: source.org,
        title: source.title,
        date: formatDate(source.accessed),
      })}
    </p>
  );
}

/** Boş form ve elle doldurulan yerler için alt çizgili boş satır. */
export function BlankLine({ label }: { label: string }) {
  return (
    <div class="print-blank">
      <span class="print-blank__label">{label}</span>
      <span class="print-blank__line" aria-hidden="true" />
    </div>
  );
}

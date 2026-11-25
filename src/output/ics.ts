/**
 * Şartname §12, Ek A, Ek B.2 — altı aylık gözden geçirme hatırlatması (.ics).
 *
 * `buildIcs` Ek A'daki referans kodu temel alır:
 *
 * - Satırlar `CRLF` ile biter, dosya `END:VCALENDAR\r\n` ile kapanır.
 * - Satır katlama 75 oktettir; devam satırları tek boşlukla başlar ve 74 oktet
 *   taşır (1 + 74 = 75). Çok baytlı UTF-8 karakteri asla bölünmez.
 * - `\`, `;`, `,` ve satır sonu kaçırılır (`\\`, `\;`, `\,`, `\n`).
 * - Olay tüm gündür (`VALUE=DATE`), bitiş bir sonraki gündür, altı ayda bir
 *   yinelenir (kısa aylarda son gün kullanılır) ve 09:00'da görüntü uyarısı
 *   verir (`TRIGGER:PT9H`).
 *
 * Takvim dosyasında tarih, etkinlik kimliği ve genel açıklama bulunur.
 * `summary` ve `description` için `tr.share.calendar` metinleri kullanılır
 * (Ek B.2). Uygulama takvim dosyasına kişi alanlarını eklemez.
 *
 * Dosya adı `ICS_FILE_NAME`, indirme `text/calendar` türüyle yapılır (§12).
 */

/** §12 — indirilen dosyanın adı. */
export const ICS_FILE_NAME = 'ilk72-hatirlatma.ics';

/** §12 — tarayıcıya verilecek içerik türü. */
export const ICS_CONTENT_TYPE = 'text/calendar;charset=utf-8';

/** Ek A — katlanmış satır sınırı (oktet). */
export const ICS_LINE_OCTETS = 75;

/** Ek A — devam satırının sınırı: 74 oktet + 1 boşluk = 75. */
export const ICS_CONTINUATION_OCTETS = 74;

const encoder = new TextEncoder();
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Ek A — `buildIcs` girdisi. Metinler `tr.share.calendar` içinden gelir. */
export interface IcsEvent {
  /** Kalıcı olay kimliği; `reviewIcsUid` ile üretilir. */
  uid: string;
  /** İlk hatırlatma günü, `YYYY-MM-DD`. */
  date: string;
  /** Oluşturma zaman damgası, `YYYYMMDDTHHMMSSZ` (`icsStamp`). */
  stamp: string;
  /** Olay başlığı (genel metin). */
  summary: string;
  /** Açıklama (genel metin, kişisel veri içermez). */
  description: string;
  /** Uygulamanın kök adresi; verilmezse `URL` satırı yazılmaz. */
  url?: string;
}

/** Ek A — RFC 5545 metin kaçışı. */
export function icsEscape(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n?|\n/g, '\\n');
}

/**
 * Ek A — 75 oktet sınırına katlar; UTF-8 karakterini bölmez.
 * Devam satırları tek boşlukla başladığı için onların sınırı 74 oktettir.
 */
export function foldIcsLine(line: string): string {
  const parts: string[] = [];
  let current = '';
  let octets = 0;
  for (const character of line) {
    const length = encoder.encode(character).length;
    const limit = parts.length === 0 ? ICS_LINE_OCTETS : ICS_CONTINUATION_OCTETS;
    if (octets + length > limit) {
      parts.push(current);
      current = '';
      octets = 0;
    }
    current += character;
    octets += length;
  }
  parts.push(current);
  return parts.join('\r\n ');
}

/** Takvimsel geçerlilik denetimi: `2027-02-30` reddedilir. */
function isCalendarDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

/**
 * Ek A — takvim dosyasını üretir. Çıktı her satırı `CRLF` ile biten tek bir
 * dizedir; indirirken UTF-8 olarak yazılır.
 *
 * @throws `Error('gecersiz-tarih')` — `date` `YYYY-MM-DD` biçiminde değilse ya
 * da takvimde böyle bir gün yoksa (geçersiz tarih `.ics` üretmez).
 */
export function buildIcs(event: IcsEvent): string {
  const { uid, date, stamp, summary, description, url } = event;
  if (!isCalendarDate(date)) throw new Error('gecersiz-tarih');

  const start = date.replace(/-/g, '');
  const next = new Date(`${date}T00:00:00.000Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  const endDate = next.toISOString().split('T')[0] ?? '';
  if (!DATE_PATTERN.test(endDate)) throw new Error('gecersiz-tarih');
  const end = endDate.replace(/-/g, '');
  const day = Number(date.slice(-2));
  // RFC 5545 §3.3.10: select the requested day or the last day of a shorter month.
  const recurrence =
    day > 28
      ? `FREQ=MONTHLY;INTERVAL=6;BYMONTHDAY=${day},-1;BYSETPOS=1`
      : 'FREQ=MONTHLY;INTERVAL=6';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ilk72//TR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${icsEscape(uid)}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `RRULE:${recurrence}`,
    `SUMMARY:${icsEscape(summary)}`,
    `DESCRIPTION:${icsEscape(description)}`,
    ...(url ? [`URL:${url}`] : []),
    'TRANSP:TRANSPARENT',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${icsEscape(summary)}`,
    'TRIGGER:PT9H',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .map(foldIcsLine)
    .join('\r\n')
    .concat('\r\n');
}

/** §12 — bir `Date`i RFC 5545 zaman damgasına (`YYYYMMDDTHHMMSSZ`) çevirir. */
export function icsStamp(date: Date): string {
  return date
    .toISOString()
    .replace(/\.\d{3}Z$/, 'Z')
    .replace(/[-:]/g, '');
}

/**
 * §12 — takvim olayının kalıcı kimliği. Aynı plan yeniden indirildiğinde takvim
 * uygulaması olayı günceller, ikinci bir hatırlatma oluşturmaz.
 */
export function reviewIcsUid(planId: string): string {
  return `${planId}@ilk72`;
}

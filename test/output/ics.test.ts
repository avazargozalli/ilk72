/**
 * Şartname §12, §18.3, Ek A, Ek B.2 — takvim dosyası testleri.
 *
 * Ek B.2 beklenen çıktısı `test/vectors/expected.ics` dosyasından **bayt bayt**
 * okunur ve `buildIcs` çıktısının UTF-8 baytlarıyla karşılaştırılır. Kullanılan
 * `summary`/`description` metinleri `src/i18n/share.ts` içindeki uygulama
 * metinleridir; böylece uygulamanın gerçek çıktısı vektöre bağlanır.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { tr } from '../../src/i18n/tr.ts';
import {
  buildIcs,
  foldIcsLine,
  ICS_FILE_NAME,
  type IcsEvent,
  icsEscape,
  icsStamp,
  reviewIcsUid,
} from '../../src/output/ics.ts';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/** happy-dom'da global `URL` tarayıcı sınıfıdır; vektör yolu `fileURLToPath` ile kurulur. */
const expectedBytes = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '..', 'vectors', 'expected.ics'),
);

/** Ek B.2 girdisi. */
const B2_EVENT: IcsEvent = {
  uid: '3f0c2d5e-0000-4000-8000-000000000001@ilk72',
  date: '2027-05-19',
  stamp: '20261119T080000Z',
  summary: 'Aile afet planını gözden geçir',
  description:
    'Çantadaki su, gıda ve ilaçların tarihlerini kontrol edin; telefon numaralarını güncelleyin; buluşma yerlerini ailece tekrar edin.\nPlanınız: cihazınızdaki İlk 72 uygulaması.',
  url: 'https://kullanici.github.io/ilk72/',
};

function lines(content: string): string[] {
  return content.split('\r\n').slice(0, -1);
}

function octets(line: string): number {
  return encoder.encode(line).length;
}

/** Katlanmış satırları birleştirir (CRLF + tek boşluk → yok). */
function unfold(content: string): string {
  return content.replace(/\r\n /g, '');
}

describe('Ek B.2 — beklenen çıktı', () => {
  it('şartnamedeki metni bayt bayt üretir', () => {
    const content = buildIcs(B2_EVENT);
    expect(content).toBe(decoder.decode(expectedBytes));
    expect([...encoder.encode(content)]).toEqual([...new Uint8Array(expectedBytes)]);
    expect(encoder.encode(content).length).toBe(expectedBytes.length);
  });

  it('uygulama metinleri (i18n) şartnamedeki metinlerdir', () => {
    expect(tr.share.calendar.summary).toBe(B2_EVENT.summary);
    expect(tr.share.calendar.description).toBe(B2_EVENT.description);
    const content = buildIcs({ ...B2_EVENT, ...tr.share.calendar });
    expect([...encoder.encode(content)]).toEqual([...new Uint8Array(expectedBytes)]);
  });

  it('her satır CRLF ile biter ve 75 okteti aşmaz', () => {
    const content = buildIcs(B2_EVENT);
    expect(content.endsWith('\r\n')).toBe(true);
    expect(/\r(?!\n)/.test(content)).toBe(false);
    expect(/[^\r]\n/.test(content)).toBe(false);
    for (const line of lines(content)) expect(octets(line), line).toBeLessThanOrEqual(75);
    expect(lines(content).some((line) => octets(line) === 75)).toBe(true);
  });

  it('katlamada çok baytlı karakterleri bölmez', () => {
    const content = buildIcs(B2_EVENT);
    for (const line of lines(content)) {
      expect(line).not.toContain('\uFFFD');
      expect(decoder.decode(encoder.encode(line))).toBe(line);
    }
  });

  it('dosya adı ve içerik türü şartnamededir', () => {
    expect(ICS_FILE_NAME).toBe('ilk72-hatirlatma.ics');
  });

  it('açıklamada kişisel veri yok (§12): yalnızca uygulama metni kullanılır', () => {
    const content = buildIcs({ ...B2_EVENT, ...tr.share.calendar });
    expect(unfold(content)).toContain(icsEscape(tr.share.calendar.description));
    expect(content).not.toMatch(/Yılmaz|0555|\/al\/|adres/i);
    expect(tr.share.calendar.description).not.toContain('{');
  });
});

describe('buildIcs — alanlar ve kaçışlar', () => {
  it('kaçış kurallarını uygular (ters bölü, noktalı virgül, virgül, satır sonu)', () => {
    expect(icsEscape('a\\b;c,d')).toBe('a\\\\b\\;c\\,d');
    expect(icsEscape('birinci\nikinci')).toBe('birinci\\nikinci');
    expect(icsEscape('birinci\r\nikinci')).toBe('birinci\\nikinci');
    expect(icsEscape('birinci\rikinci')).toBe('birinci\\nikinci');
    expect(icsEscape('düz metin')).toBe('düz metin');
    const content = buildIcs({ ...B2_EVENT, summary: 'a;b,c\\d', description: 'x\ny' });
    expect(content).toContain('SUMMARY:a\\;b\\,c\\\\d');
    expect(content).toContain('DESCRIPTION:x\\ny');
  });

  it('URL verilmezse URL satırı yazılmaz', () => {
    const content = buildIcs({ ...B2_EVENT, url: undefined });
    expect(content).not.toContain('URL:');
    expect(content).toContain('TRANSP:TRANSPARENT');
    const emptyUrl = buildIcs({ ...B2_EVENT, url: '' });
    expect(emptyUrl).not.toContain('URL:');
  });

  it('bitiş tarihini bir sonraki gün olarak yazar (ay ve yıl devri dahil)', () => {
    expect(buildIcs({ ...B2_EVENT, date: '2027-12-31' })).toContain('DTEND;VALUE=DATE:20280101');
    expect(buildIcs({ ...B2_EVENT, date: '2028-02-28' })).toContain('DTEND;VALUE=DATE:20280229');
    expect(buildIcs({ ...B2_EVENT, date: '2027-02-28' })).toContain('DTEND;VALUE=DATE:20270301');
    expect(buildIcs({ ...B2_EVENT, date: '0099-12-31' })).toContain('DTEND;VALUE=DATE:01000101');
  });

  it('olay gövdesi sabittir: UID, DTSTAMP, altı aylık yineleme, anımsatıcı', () => {
    const content = buildIcs(B2_EVENT);
    expect(content).toContain('UID:3f0c2d5e-0000-4000-8000-000000000001@ilk72\r\n');
    expect(content).toContain('DTSTAMP:20261119T080000Z\r\n');
    expect(content).toContain('RRULE:FREQ=MONTHLY;INTERVAL=6\r\n');
    expect(content).toContain('BEGIN:VALARM\r\nACTION:DISPLAY');
    expect(content).toContain('TRIGGER:PT9H');
    expect(content).toContain('TRANSP:TRANSPARENT');
    expect(content.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//ilk72//TR\r\n')).toBe(
      true,
    );
    expect(content.endsWith('END:VCALENDAR\r\n')).toBe(true);
  });

  it('geçersiz tarihte gecersiz-tarih fırlatır', () => {
    for (const date of ['', '2027-13-01', '2027-02-30', '19.05.2027', '2027-5-9', '9999-12-31']) {
      expect(() => buildIcs({ ...B2_EVENT, date }), date).toThrow('gecersiz-tarih');
    }
  });
});

describe('foldIcsLine', () => {
  it('75 okteti aşmayan satırı olduğu gibi bırakır', () => {
    const line = 'X'.repeat(75);
    expect(foldIcsLine(line)).toBe(line);
    expect(foldIcsLine('')).toBe('');
  });

  it('uzun satırı 75 + 74 oktetlik parçalara böler, devam satırları tek boşlukla başlar', () => {
    const folded = foldIcsLine('A'.repeat(200));
    const parts = folded.split('\r\n');
    expect(parts[0]).toHaveLength(75);
    expect(parts[1]).toHaveLength(75);
    expect(parts[1]?.startsWith(' ')).toBe(true);
    expect(parts[2]?.startsWith(' ')).toBe(true);
    expect(parts.join('').replace(/ /g, '')).toBe('A'.repeat(200));
    for (const part of parts) expect(octets(part)).toBeLessThanOrEqual(75);
  });

  it('çok baytlı karakteri iki satıra bölmez', () => {
    const folded = foldIcsLine(`DESCRIPTION:${'ğ'.repeat(100)}`);
    for (const part of folded.split('\r\n')) {
      expect(octets(part)).toBeLessThanOrEqual(75);
      expect(part).not.toContain('\uFFFD');
    }
  });
});

describe('yardımcılar', () => {
  it('icsStamp tarihi RFC 5545 zaman damgasına çevirir', () => {
    expect(icsStamp(new Date('2026-11-19T08:00:00.000Z'))).toBe('20261119T080000Z');
    expect(icsStamp(new Date('2027-05-19T00:00:00.000Z'))).toBe('20270519T000000Z');
  });

  it('reviewIcsUid plan kimliğinden kalıcı olay kimliği üretir', () => {
    expect(reviewIcsUid('3f0c2d5e-0000-4000-8000-000000000001')).toBe(
      '3f0c2d5e-0000-4000-8000-000000000001@ilk72',
    );
  });
});

/**
 * Şartname §12 — çıktı katmanının ortak giriş noktası (`src/output/index.ts`).
 *
 * Takvim indirme akışı arayüzde bu dosyadan içe aktarılır; dışa aktarılan
 * adların eksiksiz olduğunu kilitler.
 */
import { describe, expect, it } from 'vitest';
import { tr } from '../../src/i18n/tr.ts';
import * as ics from '../../src/output/ics.ts';
import * as api from '../../src/output/index.ts';

describe('src/output/index.ts — ortak giriş noktası', () => {
  it('belgelenen adları dışa aktarır', () => {
    expect(Object.keys(api).sort()).toEqual([
      'ICS_CONTENT_TYPE',
      'ICS_CONTINUATION_OCTETS',
      'ICS_FILE_NAME',
      'ICS_LINE_OCTETS',
      'buildIcs',
      'foldIcsLine',
      'icsEscape',
      'icsStamp',
      'reviewIcsUid',
    ]);
  });

  it('dışa aktarılan işlevler modülün kendisidir', () => {
    expect(api.buildIcs).toBe(ics.buildIcs);
    expect(api.foldIcsLine).toBe(ics.foldIcsLine);
    expect(api.ICS_FILE_NAME).toBe(ics.ICS_FILE_NAME);
  });

  it('arayüz akışı: plan kimliği + i18n metinleri + kök adres', () => {
    const content = api.buildIcs({
      uid: api.reviewIcsUid('plan-1'),
      date: '2027-05-19',
      stamp: api.icsStamp(new Date('2026-11-19T08:00:00.000Z')),
      summary: tr.share.calendar.summary,
      description: tr.share.calendar.description,
      url: 'https://kullanici.github.io/ilk72/',
    });
    expect(content).toContain('UID:plan-1@ilk72');
    expect(content).toContain('DTSTAMP:20261119T080000Z');
    expect(content).toContain('RRULE:FREQ=MONTHLY;INTERVAL=6');
    expect(api.ICS_FILE_NAME).toBe('ilk72-hatirlatma.ics');
    expect(api.ICS_CONTENT_TYPE).toContain('text/calendar');
  });
});

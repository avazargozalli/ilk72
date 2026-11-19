/**
 * Şartname §10.1, §10.2, §10.3, §6, §18.6 — paylaşım arayüz metinleri.
 *
 * Uyarılar şartnamede **birebir** verilmiştir; bu dosya metinlerin
 * değişmediğini kilitler. Ayrıca §18.6'daki yasaklı ifadeler taranır.
 */
import { describe, expect, it } from 'vitest';
import { share } from '../../src/i18n/share.ts';

/** `tr.share` altındaki bütün metin yaprakları. */
function leaves(value: unknown, path = 'share'): { path: string; text: string }[] {
  if (typeof value === 'string') return [{ path, text: value }];
  if (typeof value !== 'object' || value === null) return [];
  return Object.entries(value).flatMap(([key, child]) => leaves(child, `${path}.${key}`));
}

const all = leaves(share);

describe('paylaşım ekranı uyarıları (§10.1, §4.1)', () => {
  it('KVKK uyarısı birebir (§4.1 satır 1)', () => {
    expect(share.warning).toBe(
      'Bu bilgileri yalnızca aileniz ve güvendiğiniz kişilerle paylaşın; adı geçen kişilere haber verin.',
    );
  });

  it('özel ihtiyaç notu uyarısı birebir (§10.1)', () => {
    expect(share.options.includeNeedsNotes).toBe('Özel ihtiyaç notlarını da ekle');
    expect(share.options.includeNeedsNotesWarning).toBe(
      'Bu notlar sağlık bilgisi içerebilir. Bağlantıyı gören herkes okuyabilir. Parola koymanızı öneririz.',
    );
  });

  it('uzun yük iletisi birebir (§10.2)', () => {
    expect(share.qr.tooLong).toBe(
      'Bilgiler kare kod için fazla uzun. Notları kısaltın ya da yedek dosyasıyla paylaşın.',
    );
  });

  it('desteklenmeyen tarayıcı iletisi birebir (§6)', () => {
    expect(share.unsupported).toBe(
      'Tarayıcınız bu özelliği desteklemiyor; planı yazdırabilir ya da yedek dosyası indirebilirsiniz.',
    );
  });

  it('kare kod açıklaması erişilebilir bir etikettir', () => {
    expect(share.qr.label.length).toBeGreaterThan(20);
    expect(share.qr.label).toContain('kare kod');
  });
});

describe('içe alma metinleri (§10.3)', () => {
  it('önizleme cümlesi ve seçenekler birebir (§10.3/3-4)', () => {
    expect(share.receive.intro).toBe(
      'Size bir aile afet planı özeti gönderildi. Göndereni tanıyorsanız kullanın.',
    );
    expect(share.receive.viewOnly).toBe('Yalnızca görüntüle ve yazdır');
    expect(share.receive.merge).toBe('Kendi planıma ekle');
  });

  it('kart alanlarının okunur adları vardır', () => {
    expect(share.receive.fields).toMatchObject({
      household: 'Hane',
      members: 'Kişiler',
      contacts: 'Acil kişiler',
      meeting: 'Buluşma yerleri',
      notes: 'Not',
      phone: 'Telefon',
      city: 'Şehir',
    });
  });
});

describe('takvim metinleri (§12, Ek B.2)', () => {
  it('özet ve açıklama genel metindir, kişisel veri taşımaz', () => {
    expect(share.calendar.summary).toBe('Aile afet planını gözden geçir');
    expect(share.calendar.description).toContain('Çantadaki su, gıda ve ilaçların');
    expect(share.calendar.description).toContain('\n');
    expect(share.calendar.note).toBe('Takvim dosyasında kişisel bilginiz yer almaz.');
  });
});

describe('metin kalitesi', () => {
  it('boş metin, yer tutucu ve baştaki/sondaki boşluk yok', () => {
    expect(all.length).toBeGreaterThan(30);
    for (const { path, text } of all) {
      expect(text.trim(), path).toBe(text);
      expect(text.length, path).toBeGreaterThan(0);
      expect(text, path).not.toContain('{');
      expect(text, path).not.toContain('  ');
    }
  });

  it('§18.6 yasaklı ifadeleri içermez', () => {
    const forbidden = ['güvendesiniz', 'garanti', 'resmî uygulama', 'bağış', 'iban'];
    for (const { path, text } of all) {
      const lowered = text.toLocaleLowerCase('tr');
      for (const word of forbidden) expect(lowered, `${path}: ${word}`).not.toContain(word);
    }
  });

  it('acil numara dışında numara ya da kısa numara önermez', () => {
    for (const { path, text } of all) {
      expect(text, path).not.toMatch(/\b(110|155|156|122|177|158)\b/);
    }
  });
});

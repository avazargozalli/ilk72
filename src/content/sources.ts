/** Rehber ve kontrol listeleri için resmî kaynaklar. */
export interface Source {
  key: string; // "K-ANINDA"
  org: string; // "AFAD"
  title: string; // sayfanın adı
  url: string | null; // https, izinli alan adlarından; doğrulanmamışsa null
  accessed: string; // YYYY-AA-GG — metnin kaynakla karşılaştırıldığı tarih
  verified: boolean; // false ise madde "onayli" yapılamaz
}

/** Şartname §13.3 kaynak tablosunun erişim tarihi. */
export const SOURCE_ACCESSED = '2026-11-19';

/**
 * Şartname §13.1 — uygulamadaki bütün dış bağlantıların ait olabileceği alan
 * adları (ve alt alan adları).
 */
export const ALLOWED_SOURCE_DOMAINS = [
  'afad.gov.tr',
  'turkiye.gov.tr',
  '112.gov.tr',
  'icisleri.gov.tr',
  'saglik.gov.tr',
  'aile.gov.tr',
  'dask.gov.tr',
  'kizilay.org.tr',
  'mevzuat.gov.tr',
  'resmigazete.gov.tr',
  'kvkk.gov.tr',
  'mebakub.meb.gov.tr',
] as const;

/**
 * Şartname §13.1 — depo ve lisans bağlantıları için istisna alan adları.
 * Bunlar kaynak adresi olarak kullanılamaz; yalnızca depo/lisans bağlantısıdır.
 */
export const REPO_AND_LICENSE_DOMAINS = [
  'github.com',
  'creativecommons.org',
  'opensource.org',
] as const;

export const SOURCES: readonly Source[] = [
  {
    key: 'K-PLAN72',
    org: 'AFAD',
    title: 'Depremler Önlenemez, Ancak Depremlerin Afetlere Dönüşmesi Önlenebilir',
    url: 'https://www.afad.gov.tr/depremler-onlenemez-ancak-depremlerin-afetlere-donusmesi-onlenebilir',
    accessed: SOURCE_ACCESSED,
    verified: true,
  },
  {
    key: 'K-KIRSEHIR',
    org: 'Kırşehir İl AFAD',
    title: 'Aile Afet ve Acil Durum Planı',
    url: 'https://kirsehir.afad.gov.tr/aile-afet-ve-acil-durum-plani',
    accessed: SOURCE_ACCESSED,
    verified: true,
  },
  {
    key: 'K-KIRSEHIR2',
    org: 'Kırşehir İl AFAD',
    title: 'Deprem Değil İhmal Öldürür',
    url: 'https://kirsehir.afad.gov.tr/deprem-degil-ihmal-oldurur',
    accessed: SOURCE_ACCESSED,
    verified: true,
  },
  {
    key: 'K-MUGLA',
    org: 'Muğla İl AFAD',
    title: 'Sevdikleriniz ve Kendiniz İçin Önlem Alın, Güvende Kalın',
    url: 'https://mugla.afad.gov.tr/sevdikleriniz-ve-kendiniz-icin-onlem-alin-guvende-kalin',
    accessed: SOURCE_ACCESSED,
    verified: true,
  },
  {
    key: 'K-UYARI',
    org: 'AFAD',
    title: 'AFAD Uyarıyor: Deprem İçin Önlemlerinizi Alın',
    url: 'https://www.afad.gov.tr/afad-uyariyor-deprem-icin-onlemlerinizi-alin',
    accessed: SOURCE_ACCESSED,
    verified: true,
  },
  {
    key: 'K-CEVRE',
    org: 'AFAD',
    title: 'Deprem Öncesi Çevrenizi Hazırlayın',
    url: 'https://www.afad.gov.tr/deprem-oncesi-cevrenizi-hazirlayin',
    accessed: SOURCE_ACCESSED,
    verified: true,
  },
  {
    key: 'K-ONLEM',
    org: 'AFAD',
    title: 'Deprem Öncesi, Anı ve Sonrası Önlemini Al, Güvende Kal',
    url: 'https://www.afad.gov.tr/deprem-oncesi-ani-ve-sonrasi-onlemini-al-guvende-kal',
    accessed: SOURCE_ACCESSED,
    verified: true,
  },
  {
    key: 'K-ONLEM2',
    org: 'AFAD',
    title: 'Deprem Öncesi, Anı ve Sonrası Alabileceğiniz Önlemleri Biliyor Musunuz?',
    url: 'https://www.afad.gov.tr/deprem-oncesi-ani-ve-sonrasi-alabileceginiz-onlemleri-biliyor-musunuz',
    accessed: SOURCE_ACCESSED,
    verified: true,
  },
  {
    key: 'K-ANINDA',
    org: 'AFAD',
    title: 'Deprem Anında Neler Yapmalısınız?',
    url: 'https://www.afad.gov.tr/deprem-aninda-neler-yapmalisiniz',
    accessed: SOURCE_ACCESSED,
    verified: true,
  },
  {
    key: 'K-HAFTA',
    org: 'AFAD',
    title: "1-7 Mart Deprem Haftası'nı Hazırlık ile Değerlendirin (basın duyurusu)",
    url: 'https://www.afad.gov.tr/1-7-mart-deprem-haftasini-hazirlik-ile-degerlendirin---basin-duyurusu',
    accessed: SOURCE_ACCESSED,
    verified: true,
  },
  {
    key: 'K-HAFTA2',
    org: 'AFAD',
    title: "1-7 Mart Deprem Haftası'nı Hazırlık İle Değerlendirin (basın bülteni)",
    url: 'https://www.afad.gov.tr/1-7-mart-deprem-haftasini-hazirlik-ile-degerlendirin',
    accessed: SOURCE_ACCESSED,
    verified: true,
  },
  {
    key: 'K-KILIS',
    org: 'Kilis İl AFAD',
    title: "1-7 Mart Deprem Haftası'nı Hazırlık ile Değerlendirin",
    url: 'https://kilis.afad.gov.tr/1-7-mart-deprem-haftasini-hazirlik-ile-degerlendirin',
    accessed: SOURCE_ACCESSED,
    verified: true,
  },
  {
    key: 'K-OKUL',
    org: 'AFAD',
    title: "Deprem Haftası'nda Tüm Okullarda Aynı Anda Deprem Tatbikatı Yapılacak",
    url: 'https://www.afad.gov.tr/deprem-haftasinda-tum-okullarda-ayni-anda-deprem-tatbikati-yapilacak---basin-bulteni',
    accessed: SOURCE_ACCESSED,
    verified: true,
  },
  {
    key: 'K-ILK6',
    org: 'İstanbul İl AFAD',
    title: 'Deprem Sonrası İlk 6 Saate Dikkat',
    url: 'https://istanbul.afad.gov.tr/deprem-sonrasi-ilk-6-saate-dikkat---basin-bulteni',
    accessed: SOURCE_ACCESSED,
    verified: true,
  },
  {
    key: 'K-BURSA',
    org: 'Bursa İl AFAD',
    title: 'Deprem',
    url: 'https://bursa.afad.gov.tr/deprem',
    accessed: SOURCE_ACCESSED,
    verified: true,
  },
  {
    key: 'K-SOZLUK',
    org: 'AFAD',
    title: 'Açıklamalı Afet Yönetimi Terimleri Sözlüğü ("afet ve acil durum çantası" maddesi)',
    url: 'https://www.afad.gov.tr/aciklamali-afet-yonetimi-terimleri-sozlugu',
    accessed: SOURCE_ACCESSED,
    verified: true,
  },
  {
    key: 'K-CANTA-BB',
    org: 'AFAD',
    title: 'Afet ve Acil Durum Çantası Hazırlayın (basın bülteni)',
    url: 'https://www.afad.gov.tr/afet-ve-acil-durum-cantasi-hazirlayin-basin-bulteni',
    accessed: SOURCE_ACCESSED,
    verified: true,
  },
  {
    key: 'K-BURDUR',
    org: 'Burdur İl AFAD',
    title: 'Afet ve Acil Durum Çantası Hazırlamalıyız',
    url: 'https://burdur.afad.gov.tr/afet-ve-acil-durum-cantasi-hazirlamaliyiz',
    accessed: SOURCE_ACCESSED,
    verified: true,
  },
  {
    key: 'K-GUMUSHANE',
    org: 'Gümüşhane İl AFAD',
    title: 'Afet ve Acil Durum Çantasında Neler Bulunmalı?',
    url: 'https://gumushane.afad.gov.tr/afet-ve-acil-durum-cantasinda-neler-bulunmali',
    accessed: SOURCE_ACCESSED,
    verified: true,
  },
  {
    key: 'K-SAKARYA',
    org: 'Sakarya İl AFAD',
    title: 'Afet ve Acil Durum Çantası Neden Önemli?',
    url: 'https://sakarya.afad.gov.tr/afet-ve-acil-durum-cantasi-neden-onemli',
    accessed: SOURCE_ACCESSED,
    verified: true,
  },
  {
    key: 'K-KOCAELI',
    org: 'Kocaeli İl AFAD',
    title: 'Afet Çantanız Hazır Olsun ki Canınız Sağ Olsun',
    url: 'https://kocaeli.afad.gov.tr/afet-cantaniz-hazir-olsun-ki-caniniz-sag-olsun',
    accessed: SOURCE_ACCESSED,
    verified: true,
  },
  {
    key: 'K-EDEVLET',
    org: 'e-Devlet Kapısı',
    title: 'Afet ve Acil Durum Toplanma Alanı Sorgulama',
    url: 'https://www.turkiye.gov.tr/afet-ve-acil-durum-yonetimi-acil-toplanma-alani-sorgulama',
    accessed: SOURCE_ACCESSED,
    verified: true,
  },
  {
    key: 'K-TDTH',
    org: 'AFAD',
    title: 'Türkiye Deprem Tehlike Haritaları',
    url: 'https://tdth.afad.gov.tr',
    accessed: SOURCE_ACCESSED,
    verified: true,
  },
  {
    key: 'K-112',
    org: 'İçişleri Bakanlığı',
    title: '112 Acil Çağrı Merkezi Projesi',
    url: 'https://www.112.gov.tr/112-acm-projesi',
    accessed: SOURCE_ACCESSED,
    verified: true,
  },
  {
    key: 'K-MUGLA-CANTA',
    org: 'Muğla İl AFAD',
    title: 'Afet ve Acil Durum Çantası',
    url: 'https://mugla.afad.gov.tr/afet-ve-acil-durum-cantasi',
    accessed: SOURCE_ACCESSED,
    verified: true,
  },
  {
    key: 'K-GUVENLI-YASAM',
    org: 'Çankırı İl AFAD',
    title: 'Güvenli Yaşam 1 Eğitimi — Aile Afet Planı ve Afet ve Acil Durum Çantası',
    url: 'https://cankiri.afad.gov.tr/kurumlar/cankiri.afad/dOKUMANLAR/Guvenli_Yasam_Klavuzu/gy_1_egitim_kitapcigi.pdf',
    accessed: SOURCE_ACCESSED,
    verified: true,
  },
  {
    key: 'K-OKUL-TABANLI',
    org: 'Millî Eğitim Bakanlığı',
    title: 'Okul Tabanlı Afet Eğitimi, Kitap 1 — Afet Öncesi Yapılacaklar',
    url: 'https://mebakub.meb.gov.tr/eskisite/wp-content/uploads/2024/03/okul-tabanli-afet-egitimi_kitap_1.pdf',
    accessed: SOURCE_ACCESSED,
    verified: true,
  },
];

/** Hızlı arama için anahtar → kaynak eşlemesi. */
export const SOURCES_BY_KEY: Readonly<Record<string, Source>> = Object.freeze(
  Object.fromEntries(SOURCES.map((source) => [source.key, source])),
);

/** Anahtarla kaynak bulur; kayıtlı değilse `undefined`. */
export function getSource(key: string): Source | undefined {
  return SOURCES_BY_KEY[key];
}

function matchesDomain(hostname: string, domains: readonly string[]): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, '');
  return domains.some((domain) => host === domain || host.endsWith(`.${domain}`));
}

/** Ana bilgisayar adı §13.1'deki izinli kaynak alan adlarından biri mi? */
export function isAllowedSourceDomain(hostname: string): boolean {
  return matchesDomain(hostname, ALLOWED_SOURCE_DOMAINS);
}

/** Ana bilgisayar adı kaynak ya da depo/lisans istisnası listesinde mi? */
export function isAllowedExternalDomain(hostname: string): boolean {
  return matchesDomain(hostname, [...ALLOWED_SOURCE_DOMAINS, ...REPO_AND_LICENSE_DOMAINS]);
}

/** `https` ve izinli alan adında olan bir adres döndürür; değilse `undefined`. */
export function parseHttpsUrl(value: string): URL | undefined {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return undefined;
  }
  return parsed.protocol === 'https:' ? parsed : undefined;
}

/** Kaynak adresi `https` mi ve izinli kaynak alan adında mı? */
export function isAllowedSourceUrl(value: string | null): boolean {
  if (value === null) {
    return false;
  }
  const parsed = parseHttpsUrl(value);
  return parsed !== undefined && isAllowedSourceDomain(parsed.hostname);
}

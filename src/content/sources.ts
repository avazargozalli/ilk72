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
  'hazirim.gov.tr',
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
    key: 'K-AILE',
    org: 'Bursa İl AFAD',
    title: 'Afete Hazır Aile',
    url: 'https://bursa.afad.gov.tr/afete-hazir-aile',
    accessed: '2026-11-25',
    verified: true,
  },
  {
    key: 'K-TEHLIKE-AVI',
    org: 'Çankırı İl AFAD',
    title: 'Güvenli Yaşam — Tehlike Avı 1 Kontrol Listesi',
    url: 'https://cankiri.afad.gov.tr/kurumlar/cankiri.afad/dOKUMANLAR/Guvenli_Yasam_Klavuzu/tehlike_avi_1_birlestirildi.pdf',
    accessed: '2026-11-25',
    verified: true,
  },
  {
    key: 'K-UYARI',
    org: 'AFAD',
    title: 'AFAD Uyarıyor: Deprem İçin Önlemlerinizi Alın',
    url: 'https://www.afad.gov.tr/afad-uyariyor-deprem-icin-onlemlerinizi-alin',
    accessed: '2026-11-25',
    verified: true,
  },
  {
    key: 'K-ONLEM',
    org: 'AFAD',
    title: 'Deprem Öncesi, Anı ve Sonrası Önlemini Al, Güvende Kal',
    url: 'https://www.afad.gov.tr/deprem-oncesi-ani-ve-sonrasi-onlemini-al-guvende-kal',
    accessed: '2026-11-25',
    verified: true,
  },
  {
    key: 'K-ONLEM2',
    org: 'AFAD',
    title: 'Deprem Öncesi, Anı ve Sonrası Alabileceğiniz Önlemleri Biliyor Musunuz?',
    url: 'https://www.afad.gov.tr/deprem-oncesi-ani-ve-sonrasi-alabileceginiz-onlemleri-biliyor-musunuz',
    accessed: '2026-11-25',
    verified: true,
  },
  {
    key: 'K-ILK6',
    org: 'AFAD',
    title: 'Deprem Sonrası İlk 6 Saate Dikkat (basın bülteni)',
    url: 'https://afad.gov.tr/deprem-sonrasi-ilk-6-saate-dikkat---basin-bulteni',
    accessed: '2026-11-25',
    verified: true,
  },
  {
    key: 'K-SOZLUK',
    org: 'AFAD',
    title: 'Açıklamalı Afet Yönetimi Terimleri Sözlüğü ("afet ve acil durum çantası" maddesi)',
    url: 'https://www.afad.gov.tr/aciklamali-afet-yonetimi-terimleri-sozlugu',
    accessed: '2026-11-25',
    verified: true,
  },
  {
    key: 'K-CANTA-BB',
    org: 'AFAD',
    title: 'Afet ve Acil Durum Çantası Nasıl Hazırlanmalı?',
    url: 'https://www.afad.gov.tr/afet-ve-acil-durum-cantasi-nasil-hazirlanmali',
    accessed: '2026-11-25',
    verified: true,
  },
  {
    key: 'K-BURDUR',
    org: 'Burdur İl AFAD',
    title: 'Afet ve Acil Durum Çantası Hazırlayın',
    url: 'https://burdur.afad.gov.tr/afet-ve-acil-durum-cantasi-hazirlayin',
    accessed: '2026-11-25',
    verified: true,
  },
  {
    key: 'K-GUMUSHANE',
    org: 'Gümüşhane İl AFAD',
    title: 'Afet ve Acil Durum Çantasında Neler Bulunmalı?',
    url: 'https://gumushane.afad.gov.tr/afet-ve-acil-durum-cantasinda-neler-bulunmali',
    accessed: '2026-11-25',
    verified: true,
  },
  {
    key: 'K-EDEVLET',
    org: 'e-Devlet Kapısı',
    title: 'Afet ve Acil Durum Toplanma Alanı Sorgulama',
    url: 'https://www.turkiye.gov.tr/afet-ve-acil-durum-yonetimi-acil-toplanma-alani-sorgulama',
    accessed: '2026-11-25',
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
    accessed: '2026-11-25',
    verified: true,
  },
  {
    key: 'K-GUVENLI-YASAM',
    org: 'Çankırı İl AFAD',
    title: 'Güvenli Yaşam 1 Eğitimi — Aile Afet Planı ve Afet ve Acil Durum Çantası',
    url: 'https://cankiri.afad.gov.tr/kurumlar/cankiri.afad/dOKUMANLAR/Guvenli_Yasam_Klavuzu/gy_1_egitim_kitapcigi.pdf',
    accessed: '2026-11-25',
    verified: true,
  },
  {
    key: 'K-OKUL-TABANLI',
    org: 'Millî Eğitim Bakanlığı',
    title: 'Okul Tabanlı Afet Eğitimi, Kitap 1 — Afet Öncesi Yapılacaklar',
    url: 'https://mebakub.meb.gov.tr/eskisite/wp-content/uploads/2024/03/okul-tabanli-afet-egitimi_kitap_1.pdf',
    accessed: '2026-11-25',
    verified: true,
  },
  {
    key: 'K-HAZIRIM-DEPREM',
    org: 'AFAD',
    title: 'Hazırım — Deprem İçin Hazırlık Rehberi',
    url: 'https://hazirim.gov.tr/tr/afetler/deprem',
    accessed: '2026-11-25',
    verified: true,
  },
  {
    key: 'K-HAZIRIM-HAYVAN',
    org: 'AFAD',
    title: 'Hazırım — Evcil Hayvanlarınızı Afete Hazırlayın',
    url: 'https://hazirim.gov.tr/tr/ozel-icerikler/evcil-hayvanlar-icin',
    accessed: '2026-11-25',
    verified: true,
  },
  {
    key: 'K-TDTH-BILGI',
    org: 'AFAD',
    title: 'Türkiye Deprem Tehlike Haritası',
    url: 'https://afad.gov.tr/turkiye-deprem-tehlike-haritasi',
    accessed: '2026-11-25',
    verified: true,
  },
  {
    key: 'K-DASK',
    org: 'Doğal Afet Sigortaları Kurumu',
    title: 'Zorunlu Deprem Sigortası — Teminat ve Kapsamı',
    url: 'https://www.dask.gov.tr/tr/teminat-ve-kapsami',
    accessed: '2026-11-25',
    verified: true,
  },
  {
    key: 'K-BARTIN-TAHLIYE',
    org: 'Bartın İl AFAD',
    title: 'Elazığ’daki Deprem Sonrası Müdahale ve İyileştirme Çalışmaları',
    url: 'https://bartin.afad.gov.tr/elazigdaki-deprem-sonrasi-mudahale-ve-iyilestirme-calismalari',
    accessed: '2026-11-25',
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

/** Kullanıcı bilgisi içermeyen, mutlak HTTPS adresini çözümler. */
export function parseHttpsUrl(value: string): URL | undefined {
  if (!value.startsWith('https://')) {
    return undefined;
  }
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return undefined;
  }
  return parsed.username === '' && parsed.password === '' ? parsed : undefined;
}

/** Kaynak adresi `https` mi ve izinli kaynak alan adında mı? */
export function isAllowedSourceUrl(value: string | null): boolean {
  if (value === null) {
    return false;
  }
  const parsed = parseHttpsUrl(value);
  return parsed !== undefined && isAllowedSourceDomain(parsed.hostname);
}

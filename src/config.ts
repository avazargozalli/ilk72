/**
 * Şartname §0.1, §14, §20 — tek yerde duran yapılandırma.
 * Yer tutucular ({GITHUB_KULLANICI}, {ILETISIM_EPOSTA}, {BARINDIRMA_SAGLAYICISI})
 * sahibi tarafından doldurulur; kod bunları okur, başka yerde tekrarlamaz.
 */

export const APP_NAME = 'İlk 72';
export const APP_VERSION = '0.1.0';

/** Yer tutucular — yayın öncesi sahibi doldurur (§0.1). */
export const PLACEHOLDERS = {
  githubUser: '{GITHUB_KULLANICI}',
  contactEmail: '{ILETISIM_EPOSTA}',
  ownerName: 'Azar Gozalli',
  hostingProvider: '{BARINDIRMA_SAGLAYICISI}',
} as const;

export const REPO_URL = `https://github.com/${PLACEHOLDERS.githubUser}/ilk72`;
export const ISSUES_URL = `${REPO_URL}/issues`;
export const CONTACT_EMAIL = PLACEHOLDERS.contactEmail;

/**
 * Uygulamanın kök adresi. Yalnızca paylaşım bağlantılarının önekini ve
 * takvim dosyasındaki URL alanını üretmek için kullanılır; ağ isteği yapılmaz.
 */
export const APP_ORIGIN =
  typeof location !== 'undefined' ? `${location.origin}${location.pathname}` : '/';

/** Sayfa başlıkları ve yol tanımları (§11.1). */
export const ROUTES = {
  home: '#/',
  plan: (step: number) => `#/plan/${step}`,
  summary: '#/ozet',
  emergency: '#/acil',
  guide: '#/rehber',
  guidePart: (part: 'once' | 'an' | 'sonra') => `#/rehber/${part}`,
  bag: '#/canta',
  print: '#/yazdir',
  share: '#/paylas',
  import: '#/al/',
  settings: '#/ayarlar',
  about: '#/hakkinda',
  privacy: '#/gizlilik',
  terms: '#/kosullar',
  imprint: '#/kunye',
  accessibility: '#/erisilebilirlik',
  sources: '#/kaynaklar',
} as const;

/** Sihirbaz adım sayısı (§11.4). */
export const WIZARD_STEP_COUNT = 9;

/** Özet kartının bağlantı uzunluğu sınırı (§10.2). */
export const SHARE_MAX_URL = 1200;
/** Paylaşım yükünün açılmış JSON boyutu sınırı (§17). */
export const SHARE_MAX_JSON = 16384;

/** Yedek dosyası adı ve boyut sınırı (§9.4). */
export const BACKUP_FILE_PREFIX = 'ilk72-yedek';
export const BACKUP_MAX_BYTES = 1024 * 1024;

/** Acil durumda tek yönlendirme (İ6, §4.1 satır 13). */
export const EMERGENCY_NUMBER = '112';
export const EMERGENCY_TEL = 'tel:112';

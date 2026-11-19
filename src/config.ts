/** Proje kimliği, iletişim bilgileri ve uygulama ayarları. */

export const APP_NAME = 'İlk 72';
export const APP_VERSION = '0.1.0';

export const PROJECT = {
  githubUser: 'avazargozalli',
  contactEmail: 'gozelliazer@gmail.com',
  ownerName: 'Azar Gozalli',
  hostingProvider: 'GitHub Pages',
} as const;

export const REPO_URL = `https://github.com/${PROJECT.githubUser}/ilk72`;
export const ISSUES_URL = `${REPO_URL}/issues`;
export const CONTENT_ISSUE_URL = `${ISSUES_URL}/new?template=icerik-hatasi.yml`;
export const CONTACT_EMAIL = PROJECT.contactEmail;

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

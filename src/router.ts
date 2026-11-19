/**
 * Şartname §11.1 — '#' tabanlı küçük yönlendirici.
 *
 * Yol tanımları `config.ts` içindeki `ROUTES` ile aynı kaynaktan gelir.
 * Bilinmeyen yol `NotFound` sayfasına düşer. Her yol değişiminde belge başlığı
 * güncellenir ve odak sayfanın `h1` başlığına (`tabindex="-1"`) taşınır.
 * Yönlendirici kitaplığı kullanılmaz (§6).
 */
import { ROUTES, WIZARD_STEP_COUNT } from './config';
import { tr } from './i18n/tr';

export type RouteId =
  | 'home'
  | 'plan'
  | 'summary'
  | 'emergency'
  | 'guide'
  | 'bag'
  | 'print'
  | 'share'
  | 'import'
  | 'settings'
  | 'about'
  | 'privacy'
  | 'terms'
  | 'imprint'
  | 'accessibility'
  | 'sources'
  | 'notFound';

export type GuidePart = 'once' | 'an' | 'sonra';

export interface RouteMatch {
  id: RouteId;
  /** Adres çubuğundaki kanonik `#` yolu. */
  path: string;
  /** Belge başlığı için Türkçe sayfa adı (i18n'den). */
  title: string;
  /** Yalnızca `plan` yolunda dolu: 1–9 arası sihirbaz adımı. */
  planStep?: number;
  /** Yalnızca `guide` yolunda dolu: rehber sekmesi. */
  guidePart?: GuidePart;
  /** Yalnızca `import` yolunda dolu: `#/al/<yük>` parçası. */
  importPayload?: string;
}

interface ExactRoute {
  path: string;
  id: RouteId;
  title: string;
}

const EXACT_ROUTES: readonly ExactRoute[] = [
  { path: ROUTES.home, id: 'home', title: tr.nav.home },
  { path: ROUTES.summary, id: 'summary', title: tr.nav.summary },
  { path: ROUTES.emergency, id: 'emergency', title: tr.nav.emergency },
  { path: ROUTES.guide, id: 'guide', title: tr.nav.guide },
  { path: ROUTES.bag, id: 'bag', title: tr.nav.bag },
  { path: ROUTES.print, id: 'print', title: tr.nav.print },
  { path: ROUTES.share, id: 'share', title: tr.nav.share },
  { path: ROUTES.settings, id: 'settings', title: tr.nav.settings },
  { path: ROUTES.about, id: 'about', title: tr.nav.about },
  { path: ROUTES.privacy, id: 'privacy', title: tr.nav.privacy },
  { path: ROUTES.terms, id: 'terms', title: tr.nav.terms },
  { path: ROUTES.imprint, id: 'imprint', title: tr.nav.imprint },
  { path: ROUTES.accessibility, id: 'accessibility', title: tr.nav.accessibility },
  { path: ROUTES.sources, id: 'sources', title: tr.nav.sources },
];

const GUIDE_PARTS: ReadonlyArray<{ path: string; part: GuidePart }> = [
  { path: ROUTES.guidePart('once'), part: 'once' },
  { path: ROUTES.guidePart('an'), part: 'an' },
  { path: ROUTES.guidePart('sonra'), part: 'sonra' },
];

const PLAN_PATH = /^\/plan\/(\d+)$/;
const IMPORT_PREFIX = '/al/';
const toHash = (path: string): string => `#${path}`;

/** `#/ozet/` ile `#/ozet` aynı sayılır; kök yol `#/` olarak korunur. */
function normalizePath(hash: string): string {
  const withoutHash = hash.startsWith('#') ? hash.slice(1) : hash;
  if (withoutHash === '' || withoutHash === '/') return '/';
  return withoutHash.endsWith('/') ? withoutHash.slice(0, -1) : withoutHash;
}

function notFound(hash: string): RouteMatch {
  return { id: 'notFound', path: toHash(normalizePath(hash)), title: tr.nav.notFound };
}

/** Adres çubuğundan gelen `#` değerini sayfa eşleşmesine çevirir. */
export function resolveRoute(hash: string): RouteMatch {
  const path = normalizePath(hash);
  if (path === '/') return { id: 'home', path: ROUTES.home, title: tr.nav.home };

  const planMatch = PLAN_PATH.exec(path);
  if (planMatch) {
    const step = Number(planMatch[1]);
    if (Number.isInteger(step) && step >= 1 && step <= WIZARD_STEP_COUNT) {
      return { id: 'plan', path: toHash(path), title: tr.nav.plan, planStep: step };
    }
    return notFound(hash);
  }

  if (path.startsWith(IMPORT_PREFIX)) {
    const payload = path.slice(IMPORT_PREFIX.length);
    if (payload.length > 0) {
      return { id: 'import', path: toHash(path), title: tr.nav.import, importPayload: payload };
    }
    return notFound(hash);
  }

  for (const guide of GUIDE_PARTS) {
    if (toHash(path) === guide.path) {
      return { id: 'guide', path: guide.path, title: tr.nav.guide, guidePart: guide.part };
    }
  }

  for (const route of EXACT_ROUTES) {
    if (toHash(path) === route.path) {
      return { id: route.id, path: route.path, title: route.title };
    }
  }

  return notFound(hash);
}

/** O anki adres çubuğunun yolu. */
export function currentRoute(): RouteMatch {
  if (typeof location === 'undefined') return resolveRoute('');
  return resolveRoute(location.hash);
}

/** `hashchange` olaylarını dinler; dönen işlev aboneliği sonlandırır. */
export function subscribeToRouteChanges(listener: (route: RouteMatch) => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const handleChange = (): void => listener(currentRoute());
  window.addEventListener('hashchange', handleChange);
  return () => window.removeEventListener('hashchange', handleChange);
}

/** Belge başlığı: "<sayfa adı> · <uygulama adı>". */
export function updateDocumentTitle(route: RouteMatch, doc: Document = document): void {
  doc.title = `${route.title} · ${tr.app.name}`;
}

/**
 * Odağı sayfanın `h1` başlığına taşır (§11.1). Başlıkta `tabindex` yoksa
 * `-1` eklenir; böylece ekran okuyucu ve klavye kullanıcısı yeni sayfayı
 * başlıktan duyar.
 */
export function focusRouteHeading(doc: Document = document): void {
  const heading = doc.querySelector<HTMLElement>('main h1') ?? doc.querySelector<HTMLElement>('h1');
  if (!heading) return;
  if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
  heading.focus();
}

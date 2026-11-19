/**
 * Şartname §15, §18.7 — bileşenlerin ortak erişilebilirlik yardımcıları.
 *
 * - `useAutoId`: etiket ↔ denetim ↔ açıklama bağlantıları için benzersiz,
 *   kararlı DOM kimlikleri üretir. Preact sürümüne bağımlı olmamak için
 *   `preact/hooks`'un `useId`'si yerine sayaç kullanılır.
 * - Odak yardımcıları: iletişim kutusunda odak hapsi, `Esc` ile kapanma ve
 *   hata özetinden ilgili alana odaklanma için kullanılır (§15).
 */
import { useState } from 'preact/hooks';

let autoIdCounter = 0;

/** Her bileşen örneği için benzersiz, yaşam boyu kararlı bir kimlik üretir. */
export function useAutoId(prefix: string): string {
  const [id] = useState(() => {
    autoIdCounter += 1;
    return `${prefix}-${autoIdCounter}`;
  });
  return id;
}

/**
 * Odaklanabilir öğeler (§15). Gizli, devre dışı ve `tabindex="-1"` olan
 * öğeler dışarıda kalır.
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'summary',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/** Kapsayıcı içindeki, sekme sırasına giren öğeler. */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) =>
      element.tabIndex >= 0 &&
      !element.hasAttribute('hidden') &&
      element.getAttribute('aria-hidden') !== 'true',
  );
}

/** Kapsayıcıdaki ilk odaklanabilir öğeye, yoksa kapsayıcının kendisine odaklanır. */
export function focusFirst(container: HTMLElement): void {
  const first = getFocusableElements(container)[0];
  if (first) {
    first.focus();
    return;
  }
  container.focus();
}

/**
 * `Tab` / `Shift+Tab` ile odak kapsayıcı içinde döner (§15 odak hapsi).
 * Yalnızca iletişim kutusu gibi kalıcı katmanlarda kullanılır.
 */
export function trapTabKey(event: KeyboardEvent, container: HTMLElement | null): void {
  if (!container) return;
  const focusable = getFocusableElements(container);
  if (focusable.length === 0) {
    event.preventDefault();
    container.focus();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (!first || !last) return;

  const active = document.activeElement;
  const focusOutside = active === null || !container.contains(active);

  if (event.shiftKey) {
    if (focusOutside || active === first || active === container) {
      event.preventDefault();
      last.focus();
    }
    return;
  }

  if (focusOutside) {
    event.preventDefault();
    first.focus();
    return;
  }

  if (active === last) {
    event.preventDefault();
    first.focus();
  }
}

/** Verilen kimlikteki öğeye odaklanır; öğe yoksa `false` döner. */
export function focusElementById(id: string, doc: Document = document): boolean {
  const element = doc.getElementById(id);
  if (!element) return false;
  element.focus();
  return true;
}

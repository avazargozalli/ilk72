/**
 * Şartname §14.5, İ5, §15 — her sayfanın alt bilgisi.
 *
 * Metin §14.5'teki cümlenin **birebir** aynısıdır ve "bağımsız proje, resmî
 * kurum uygulaması değil" uyarısını her sayfada yineler (İ5). Bağlantılar
 * Gizlilik / Koşullar / Künye / Erişilebilirlik / Kaynaklar sırasıyla,
 * §11.1'deki yollara gider. Yeni sekme yoktur: bunlar uygulama içi sayfalardır.
 */
import { ROUTES } from '../../config.ts';
import { tr } from '../../i18n/tr.ts';
import { joinClassNames } from './classNames.ts';

const LINKS = [
  { href: ROUTES.privacy, label: tr.nav.privacy },
  { href: ROUTES.terms, label: tr.nav.terms },
  { href: ROUTES.imprint, label: tr.nav.imprint },
  { href: ROUTES.accessibility, label: tr.nav.accessibility },
  { href: ROUTES.sources, label: tr.nav.sources },
] as const;

export interface FooterProps {
  class?: string;
}

export function Footer({ class: className }: FooterProps) {
  return (
    <footer class={joinClassNames('footer', className)}>
      <div class="footer__inner">
        <div class="footer__identity">
          <p class="footer__independence">{tr.components.footer.independence}</p>
          <p class="footer__emergency">{tr.components.footer.emergencyNote}</p>
        </div>
        <nav class="footer__nav" aria-label={tr.components.footer.navLabel}>
          <ul class="footer__links">
            {LINKS.map((link) => (
              <li class="footer__item" key={link.href}>
                <a class="footer__link" href={link.href}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}

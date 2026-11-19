/**
 * Şartname §14 — yasal ve bilgi sayfalarının ortak gövdesi.
 *
 * Metinler `src/i18n/legal.ts` içinde §14'e birebir uygun biçimde durur;
 * bu bileşen yalnızca çizer: sayfa başlığı (`h1`), bölüm başlıkları (`h2`) ve
 * paragraflar. Metni kısaltmaz, yeniden yazmaz, sırasını değiştirmez
 * (§0 kural 5, §14).
 *
 * Sayfalar arası bağlantılar `tr.legal.footer.links` üzerinden kurulur; §14.5'te
 * zorunlu kılınan alt bilgi cümlesi ise `Footer` bileşeninde tek yerde durur ve
 * uygulama kabuğunda her sayfada çizilir (İ5).
 */
import { ROUTES } from '../../../config.ts';
import type { LegalPage } from '../../../i18n/legal.ts';
import { tr } from '../../../i18n/tr.ts';

export interface LegalPageViewProps {
  page: LegalPage;
}

export function LegalPageView({ page }: LegalPageViewProps) {
  return (
    <article class="legal">
      <h1 tabIndex={-1}>{page.title}</h1>

      {page.sections.map((section, index) => (
        // Metin sırası normatiftir; anahtar olarak sıra kullanılır (§14).
        <section class="legal__section" key={`section-${index}`}>
          {section.heading ? <h2>{section.heading}</h2> : null}
          {section.paragraphs.map((paragraph, paragraphIndex) => (
            <p key={`paragraph-${paragraphIndex}`}>{paragraph}</p>
          ))}
        </section>
      ))}

      <nav class="legal__links" aria-label={tr.legal.footer.navLabel}>
        <ul>
          {tr.legal.footer.links.map((link) => (
            <li key={link.key}>
              <a href={ROUTES[link.key]}>{tr.nav[link.key]}</a>
            </li>
          ))}
        </ul>
      </nav>
    </article>
  );
}

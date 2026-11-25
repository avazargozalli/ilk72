/** Hukuki ve bilgi sayfalarının başlık, paragraf ve bağlantı düzeni. */
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
        <section class="legal__section" key={`section-${index}`}>
          {section.heading ? <h2>{section.heading}</h2> : null}
          {section.paragraphs.map((paragraph, paragraphIndex) => (
            <p key={`paragraph-${paragraphIndex}`}>{paragraph}</p>
          ))}
          {section.links?.length ? (
            <ul>
              {section.links.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith('https://') ? (
                    <a href={link.href} target="_blank" rel="noopener noreferrer">
                      {link.label}
                    </a>
                  ) : (
                    <a href={link.href}>{link.label}</a>
                  )}
                </li>
              ))}
            </ul>
          ) : null}
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

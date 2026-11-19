/**
 * Şartname §11.1, §13.1 — "Kaynaklar" sayfası (`#/kaynaklar`).
 *
 * Bütün dış bağlantılar `SourceLink` üzerinden kurulur; bu bileşen yalnızca
 * izinli alan adlarına (`https`) bağlantı üretir (§13.1, §17). Adresi
 * doğrulanmamış kaynaklar bağlantı
 * olarak değil, "doğrulanmadı" notuyla listelenir (İ4: kaynaksız tavsiye yok).
 */
import { SOURCES } from '../../content/sources.ts';
import { formatText, tr } from '../../i18n/tr.ts';
import { SourceLink } from '../components/index.ts';

export function Sources() {
  return (
    <article class="legal">
      <h1 tabIndex={-1}>{tr.legal.sources.title}</h1>
      <p>{tr.legal.sources.intro}</p>
      <p>{tr.legal.sources.note}</p>

      <ul class="sources__list">
        {SOURCES.map((source) => (
          <li class="sources__item" key={source.key}>
            <SourceLink
              url={source.url}
              label={formatText(tr.wizard.sources.label, {
                org: source.org,
                title: source.title,
              })}
              accessed={source.accessed}
            />
          </li>
        ))}
      </ul>
    </article>
  );
}

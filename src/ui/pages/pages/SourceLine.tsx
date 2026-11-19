/**
 * Şartname §11.9, §11.10, §13.1, §17 — "Kaynak: … (erişim: …)" satırı.
 *
 * §11.10 biçimi birebir korunur: `Kaynak: <kurum> — <sayfa> (erişim: GG.AA.YYYY)`.
 * Adres yalnızca `https` ve §13.1'de izinli alan adlarındaysa bağlantı olur
 * (`isAllowedSourceUrl`); değilse bağlantı **hiç** üretilmez ve "Kaynak
 * doğrulanmadı" yazılır. Dış bağlantılar yeni sekmede açılır,
 * `rel="noopener noreferrer"` taşır ve yeni sekme bilgisi ekran okuyucuya
 * metinle söylenir (§15, §17).
 */
import { getSource, isAllowedSourceUrl } from '../../../content/sources.ts';
import { formatDate, formatText, tr } from '../../../i18n/tr.ts';
import { dateOnly } from './shared.ts';

export interface SourceLineProps {
  /** Kaynak kaydındaki anahtar (ör. `K-ANIL`). Kayıtlı değilse satır çizilmez. */
  sourceKey: string;
}

export function SourceLine({ sourceKey }: SourceLineProps) {
  const source = getSource(sourceKey);
  if (source === undefined) return null;

  const label = formatText(tr.pages.common.sourceLabel, {
    org: source.org,
    title: source.title,
  });
  const accessed = formatDate(dateOnly(source.accessed));

  const content =
    source.url === null || !isAllowedSourceUrl(source.url) ? (
      <>
        <span class="source-line__label">{label}</span>
        {` (${tr.components.sourceLink.unverified})`}
      </>
    ) : (
      <>
        <a
          class="source-line__anchor"
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          referrerPolicy="no-referrer"
        >
          {label}
          <span class="visually-hidden">{` (${tr.components.sourceLink.newTab})`}</span>
        </a>
        {` ${formatText(tr.pages.common.sourceAccessed, { date: accessed })}`}
      </>
    );

  return (
    <p class="source-line">
      <span class="source-line__prefix">{`${tr.pages.common.sourcePrefix} `}</span>
      {content}
    </p>
  );
}

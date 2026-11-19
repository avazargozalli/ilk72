/**
 * Şartname §13.1, §15, §17 — kaynak bağlantısı.
 *
 * Dış bağlantı yalnızca **izinli kaynak alan adlarına** ve yalnızca `https`
 * adreslere üretilir (`src/content/sources.ts` → `isAllowedSourceUrl`).
 * İzinli olmayan ya da henüz doğrulanmamış kaynaklarda bağlantı **hiç
 * oluşturulmaz**; yerine "Kaynak doğrulanmadı" metni gösterilir. Böylece
 * içerik kaydındaki bir hata kullanıcıyı rastgele bir adrese göndermez.
 *
 * Bağlantılar yeni sekmede açılır ve `rel="noopener noreferrer"` taşır (§17);
 * yeni sekme bilgisi ekranda ve ekran okuyucuda metinle belirtilir (§15).
 * Kaynak adı ve erişim tarihi her zaman metin olarak yazılır (İ4).
 */
import { isAllowedSourceUrl } from '../../content/sources.ts';
import { formatDate, formatText, tr } from '../../i18n/tr.ts';
import { joinClassNames } from './classNames.ts';

export interface SourceLinkProps {
  /** Kaynağın `https` adresi; `null` ise doğrulanmamış sayılır. */
  url: string | null;
  /** Kaynağın görünen adı (kurum + başlık), i18n'den. */
  label: string;
  /** Metnin kaynakla karşılaştırıldığı tarih, `YYYY-AA-GG`. */
  accessed?: string;
  class?: string;
}

export function SourceLink({ url, label, accessed, class: className }: SourceLinkProps) {
  if (url === null || !isAllowedSourceUrl(url)) {
    return (
      <span class={joinClassNames('source-link', 'source-link--unverified', className)}>
        <span class="source-link__label">{label}</span>
        {` (${tr.components.sourceLink.unverified})`}
      </span>
    );
  }

  return (
    <span class={joinClassNames('source-link', className)}>
      <a
        class="source-link__anchor"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        referrerPolicy="no-referrer"
      >
        {label}
        <span class="source-link__new-tab">{` (${tr.components.sourceLink.newTab})`}</span>
      </a>
      {accessed ? (
        <span class="source-link__accessed">
          {` · ${formatText(tr.components.sourceLink.accessedAt, { date: formatDate(accessed) })}`}
        </span>
      ) : null}
    </span>
  );
}

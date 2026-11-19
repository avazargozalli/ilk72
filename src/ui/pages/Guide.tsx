/**
 * Şartname §11.10, §13.2, §13.4 — rehber.
 *
 * Üç sekme vardır: Önce / An / Sonra. Sekmeler `#/rehber/<bölüm>` yoluna giden
 * bağlantılardır; etkin sekme `aria-current="page"` ile işaretlenir. Sayfa
 * durumu yukarıdan `part` prop'u ile gelir, sayfa kendi yönlendirmesini yapmaz.
 *
 * Her kart:
 * - kısa başlık (konu adı),
 * - 1–2 cümlelik metin **birebir** içerik kaydından (`src/content/registry.ts`, İ4),
 * - `Kaynak: <kurum> — <sayfa> (erişim: GG.AA.YYYY)` satırı (`SourceLine`),
 * - durumu `taslak` ise "TASLAK — onaylanmadı" etiketi (§13.4),
 * - "Hata bildir" bağlantısı (depo sorun şablonu, `ISSUES_URL`; §13.4-5).
 *
 * Sayfa başında §11.10'daki uyarı gösterilir. Kartlara tavsiye cümlesi
 * eklenmez; metin yalnızca kayıttan gelir.
 */

import { ISSUES_URL, ROUTES } from '../../config.ts';
import { contentByCategory } from '../../content/registry.ts';
import { formatText, tr } from '../../i18n/tr.ts';
import { Notice } from '../components/index.ts';
import { SourceLine } from './pages/SourceLine.tsx';

export type GuidePart = 'once' | 'an' | 'sonra';

export interface GuideProps {
  /** Etkin sekme; `#/rehber/<bölüm>` yolundan gelir. Varsayılan `once`. */
  part?: GuidePart;
}

const PARTS: readonly GuidePart[] = ['once', 'an', 'sonra'];

/** Kart konusu başlıkları (`tr.pages.guide.cardTitles`); kayıtta yoksa kimlik yazılır. */
const CARD_TITLES: Readonly<Record<string, string>> = tr.pages.guide.cardTitles;

export function Guide({ part = 'once' }: GuideProps) {
  const items = contentByCategory(part);
  const currentPart = tr.pages.guide.parts[part];

  return (
    <div class="page page--guide">
      <h1 tabIndex={-1}>{tr.pages.guide.title}</h1>

      <Notice tone="info">{tr.pages.guide.intro}</Notice>

      <nav class="guide__tabs-nav" aria-label={tr.pages.guide.tabsLabel}>
        <ul class="guide__tabs">
          {PARTS.map((key) => (
            <li key={key}>
              <a
                class={key === part ? 'guide__tab guide__tab--current' : 'guide__tab'}
                href={ROUTES.guidePart(key)}
                aria-current={key === part ? 'page' : undefined}
              >
                {tr.pages.guide.tabs[key]}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section aria-labelledby="guide-cards">
        <h2 id="guide-cards">{currentPart}</h2>
        <ul class="guide__cards">
          {items.map((item) => {
            const title = CARD_TITLES[item.id] ?? item.id;
            return (
              <li class="guide__card" key={item.id}>
                <h3>{title}</h3>
                <p>{item.text}</p>
                {item.status === 'taslak' ? (
                  <p class="guide__draft">{tr.pages.guide.draft}</p>
                ) : null}
                <div class="guide__sources">
                  {item.sources.map((sourceKey) => (
                    <SourceLine key={sourceKey} sourceKey={sourceKey} />
                  ))}
                </div>
                <p class="guide__report">
                  <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer">
                    {tr.pages.guide.reportIssue}
                    <span class="visually-hidden">
                      {formatText(tr.pages.guide.reportIssueFor, { title })}
                    </span>
                  </a>
                </p>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

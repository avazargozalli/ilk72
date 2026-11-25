/**
 * Şartname §11.3, §11.8, İ3, İ9 — ana sayfa.
 *
 * İki durum vardır ve ikisi de **saf prop** ile belirlenir:
 *
 * - `plan === null`: üç cümlelik tanıtım, "Planı hazırlamaya başla" düğmesi,
 *   "Boş formu yazdır" bağlantısı (`#/yazdir`, İ3) ve "Bana gönderilen planı aç"
 *   açıklaması.
 * - `plan` var: §11.8 doluluk özeti ve **hemen altında** sabit uyarı (İ9),
 *   "Devam et / Yazdır / Acil ekranı / Paylaş", son gözden geçirme tarihi ve
 *   altı ay geçtiyse nazik hatırlatma.
 *
 * Sayfa saklama katmanını tanımaz: plan ve doluluk dışarıdan gelir, düğme
 * niyeti `onStart` ile yukarı akar (yönlendirmeyi uygulama kabuğu yapar).
 * Bu yüzden `#/plan/1` bağlantısı yalnızca `onStart` verilmediğinde kurulur;
 * böylece düğme hiçbir zaman sessiz kalmaz.
 */
import { ROUTES } from '../../config.ts';
import { formatDate, formatText, tr } from '../../i18n/tr.ts';
import { computeProgress, type PlanProgress } from '../../model/progress.ts';
import type { Plan } from '../../model/types.ts';
import { Notice } from '../components/index.ts';
import { dateOnly, isReviewOverdue } from './pages/shared.ts';

const illustrationPath = `${import.meta.env.BASE_URL}gorseller/`;

export interface HomeProps {
  /** Kayıtlı plan; yoksa `null`. */
  plan: Plan | null;
  /** §11.8 doluluğu (ziyaret iziyle hesaplanmış olabilir). Verilmezse hesaplanır. */
  progress?: PlanProgress;
  /** "Planı hazırlamaya başla" / "Devam et" niyeti. */
  onStart?: () => void;
}

interface StartActionProps {
  label: string;
  onStart?: () => void;
  class: string;
}

/**
 * Birincil eylem: niyet verilmişse düğme, verilmemişse sihirbazın ilk adımına
 * giden bağlantı. İkisi aynı görünür metni taşıdığı için aynı anda çizilmez.
 */
function StartAction({ label, onStart, class: className }: StartActionProps) {
  if (onStart !== undefined) {
    return (
      <button class={className} type="button" onClick={onStart}>
        {label}
      </button>
    );
  }
  return (
    <a class={className} href={ROUTES.plan(1)}>
      {label}
    </a>
  );
}

/** §11.8 doluluk cümlesi; toplam her zaman dokuz bölümdür. */
function progressSentence(progress: PlanProgress): string {
  const sentences = tr.pages.home.progressSentences;
  const template = sentences[progress.filled] ?? sentences[0] ?? '';
  return formatText(template, { total: progress.total, filled: progress.filled });
}

function PlanOverview({
  plan,
  progress,
  onStart,
}: {
  plan: Plan;
  progress?: PlanProgress;
  onStart?: () => void;
}) {
  const current = progress ?? computeProgress(plan);
  const lastDrillAt = plan.review.lastDrillAt;
  const nextReviewAt = plan.review.nextReviewAt;
  const overdue = isReviewOverdue(plan);

  return (
    <div class="home-overview">
      <section class="home-card home-overview__plan" aria-labelledby="home-plan">
        <h2 id="home-plan">{tr.pages.home.planTitle}</h2>
        <p class="home-overview__progress">{progressSentence(current)}</p>
        {/* §11.8, İ9 — sabit uyarı; doluluk bir güvenlik derecesi değildir. */}
        <p>{tr.pages.home.progressNote}</p>

        <div class="button-row home-overview__actions">
          <StartAction
            label={tr.pages.home.continue}
            onStart={onStart}
            class="button button--primary"
          />
          <a class="button button--secondary" href={ROUTES.print}>
            {tr.nav.print}
          </a>
          <a class="button button--secondary" href={ROUTES.emergency}>
            {tr.pages.home.emergencyAction}
          </a>
          <a class="button button--secondary" href={ROUTES.share}>
            {tr.nav.share}
          </a>
        </div>
        <p>
          <a href={ROUTES.summary}>{tr.pages.home.summaryLink}</a>
        </p>
      </section>

      <section class="home-card" aria-labelledby="home-review">
        <h2 id="home-review">{tr.pages.home.reviewTitle}</h2>
        {lastDrillAt === null ? null : (
          <p>
            {formatText(tr.pages.home.lastDrillAt, { date: formatDate(dateOnly(lastDrillAt)) })}
          </p>
        )}
        {nextReviewAt === null ? null : (
          <p>
            {formatText(tr.pages.home.nextReviewAt, { date: formatDate(dateOnly(nextReviewAt)) })}
          </p>
        )}
        {lastDrillAt === null && nextReviewAt === null ? <p>{tr.pages.home.noReviewDate}</p> : null}
        {overdue ? (
          <Notice tone="info" title={tr.pages.home.reviewReminderTitle}>
            {tr.pages.home.reviewReminder}
          </Notice>
        ) : null}
        <p>
          <a href={ROUTES.plan(9)}>{tr.pages.home.reviewLink}</a>
        </p>
      </section>
    </div>
  );
}

export function Home({ plan, progress, onStart }: HomeProps) {
  const [lead, ...details] = tr.pages.home.intro;
  return (
    <div class="home">
      {plan === null ? (
        <>
          <section class="home-hero" aria-labelledby="home-title">
            <div class="home-hero__copy">
              <h1 id="home-title" tabIndex={-1}>
                {tr.pages.home.title}
              </h1>
              <p class="home-hero__lead">{lead}</p>
              <div class="button-row home-hero__actions">
                <StartAction
                  label={tr.pages.home.start}
                  onStart={onStart}
                  class="button button--primary"
                />
                <a class="button button--secondary" href={ROUTES.print}>
                  {tr.pages.home.printBlank}
                </a>
              </div>
              <div class="home-hero__details">
                {details.map((sentence) => (
                  <p key={sentence}>{sentence}</p>
                ))}
              </div>
            </div>
            <img
              class="home-hero__image"
              src={`${illustrationPath}aile-planlama.webp`}
              width={1080}
              height={810}
              alt=""
              fetchPriority="high"
            />
          </section>

          <div class="home-next">
            <section class="home-card home-card--guide" aria-labelledby="home-guide">
              <img
                class="home-card__image"
                src={`${illustrationPath}afet-cantasi.webp`}
                width={600}
                height={450}
                alt=""
                loading="lazy"
                decoding="async"
              />
              <div>
                <h2 id="home-guide">{tr.pages.home.guideTitle}</h2>
                <p>{tr.pages.home.guideBody}</p>
                <a class="home-card__link" href={ROUTES.guide}>
                  {tr.pages.home.guideAction} <span aria-hidden="true">→</span>
                </a>
              </div>
            </section>
            <section class="home-card home-card--receive" aria-labelledby="home-import">
              <h2 id="home-import">{tr.pages.home.importTitle}</h2>
              <p>{tr.pages.home.importBody}</p>
            </section>
          </div>
        </>
      ) : (
        <>
          <h1 class="home__title" tabIndex={-1}>
            {tr.pages.home.title}
          </h1>
          <PlanOverview plan={plan} progress={progress} onStart={onStart} />
        </>
      )}
    </div>
  );
}

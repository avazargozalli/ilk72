/**
 * Şartname §10.1, §10.2 — paylaşım sayfası.
 *
 * Planın **özet kartı** üretilir; tam plan paylaşılmaz (§10.1). Sayfa saf
 * prop'ludur: plan yukarıdan gelir, saklama katmanı tanınmaz.
 *
 * - "Özel ihtiyaç notlarını da ekle" işaretsizse kartta `o` alanı yoktur;
 *   işaretlenirse altındaki §10.1 uyarısı görünür.
 * - İsteğe bağlı parola yükü `1e.`, parolasız yük `1p.` olur (§10.2).
 * - Bağlantı metin alanında gösterilir; `navigator.clipboard` varsa kopyalanır,
 *   yoksa metin seçilebilir kalır ve not gösterilir.
 * - Kare kod `buildShareQr` geometrisinden **Preact düğümleriyle** çizilir;
 *   HTML enjeksiyonu kullanılmaz (§17). Uzunluk aşımında geometri
 *   `null` döner ve §10.2 iletisi gösterilir.
 * - `navigator.share` yalnızca varsa gösterilir; uygulama kendisi ileti
 *   göndermez (§10.2).
 * - Ev adresi ve sağlık bilgisi karta girmez (İ8, §10.1); bu, kartın
 *   altındaki notla açıkça söylenir.
 */
import { useState } from 'preact/hooks';
import { tr } from '../../i18n/tr.ts';
import type { Plan } from '../../model/types.ts';
import {
  buildShareCard,
  buildShareQr,
  buildShareUrl,
  encodeShare,
  type ShareQr,
} from '../../share/index.ts';
import { Checkbox, Field, Notice } from '../components/index.ts';
import { ShareQrImage } from '../components/ShareQrImage.tsx';

export interface ShareProps {
  /** Özet kartı üretilecek plan (uygulama kabuğunda sanitize edilmiş). */
  plan: Plan;
}

type ShareStatus = 'idle' | 'copied' | 'copy-failed' | 'share-failed';

function statusText(state: ShareStatus): string {
  if (state === 'copied') return tr.share.link.copied;
  if (state === 'copy-failed') return tr.share.link.copyFailed;
  if (state === 'share-failed') return tr.share.systemShare.failed;
  return '';
}

export function Share({ plan }: ShareProps) {
  const [includeNeedsNotes, setIncludeNeedsNotes] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [url, setUrl] = useState<string | null>(null);
  const [qr, setQr] = useState<ShareQr | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ShareStatus>('idle');

  const canSystemShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  /** Seçenekler değişince eski bağlantı ve kare kod geçersiz olur. */
  const resetOutput = (): void => {
    setUrl(null);
    setQr(null);
    setStatus('idle');
    setError(null);
  };

  const handleGenerate = async (): Promise<void> => {
    setBusy(true);
    resetOutput();
    try {
      const card = buildShareCard(plan, { includeNeedsNotes, includeHealth: false });
      const payload = await encodeShare(card, passphrase === '' ? undefined : passphrase);
      const nextUrl = buildShareUrl(payload);
      setUrl(nextUrl);
      setQr(buildShareQr(nextUrl));
    } catch (error) {
      setError(
        error instanceof Error && error.message === 'cok-buyuk'
          ? tr.share.send.tooLong
          : tr.share.send.error,
      );
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async (): Promise<void> => {
    if (url === null) return;
    const clipboard = typeof navigator === 'undefined' ? undefined : navigator.clipboard;
    if (clipboard === undefined || typeof clipboard.writeText !== 'function') {
      setStatus('copy-failed');
      return;
    }
    try {
      await clipboard.writeText(url);
      setStatus('copied');
    } catch {
      setStatus('copy-failed');
    }
  };

  const handleSystemShare = async (): Promise<void> => {
    if (url === null) return;
    setStatus('idle');
    try {
      await navigator.share({ title: tr.share.title, text: tr.share.intro, url });
    } catch (error) {
      if (!(error instanceof Error && error.name === 'AbortError')) setStatus('share-failed');
    }
  };

  return (
    <div class="page page--share">
      <h1 tabIndex={-1}>{tr.share.title}</h1>
      <p class="share__intro">{tr.share.intro}</p>
      <Notice tone="info">{tr.share.warning}</Notice>

      <section class="share__section" aria-labelledby="share-card-heading">
        <h2 id="share-card-heading">{tr.share.card.title}</h2>
        <p>{tr.share.card.contents}</p>
        <p class="share__note">{tr.share.card.excluded}</p>
        <p class="share__note">{tr.share.card.freeTextWarning}</p>
      </section>

      <section class="share__section" aria-labelledby="share-options-heading">
        <h2 id="share-options-heading">{tr.share.options.title}</h2>
        <Checkbox
          id="share-include-needs-notes"
          label={tr.share.options.includeNeedsNotes}
          hint={tr.share.options.includeNeedsNotesWarning}
          checked={includeNeedsNotes}
          disabled={busy}
          onChange={(checked) => {
            setIncludeNeedsNotes(checked);
            resetOutput();
          }}
        />

        <Field label={tr.share.password.label} hint={tr.share.password.hint} id="share-passphrase">
          <input
            class="text-input"
            id="share-passphrase"
            type="password"
            autocomplete="new-password"
            value={passphrase}
            disabled={busy}
            onInput={(event) => {
              setPassphrase(event.currentTarget.value);
              resetOutput();
            }}
          />
        </Field>

        <div class="button-row share__actions">
          <button
            class="button button--primary"
            type="button"
            disabled={busy}
            onClick={() => void handleGenerate()}
          >
            {busy ? tr.share.send.working : tr.share.send.generate}
          </button>
        </div>

        {error === null ? null : (
          <Notice tone="error" live="polite">
            {error}
          </Notice>
        )}
      </section>

      {url === null ? null : (
        <section class="share__section" aria-labelledby="share-link-heading">
          <h2 id="share-link-heading">{tr.share.link.title}</h2>
          <Field label={tr.share.link.label} id="share-link">
            <input
              class="text-input share__link"
              id="share-link"
              type="text"
              readonly
              value={url}
              onFocus={(event) => event.currentTarget.select()}
            />
          </Field>
          <div class="button-row share__actions">
            <button
              class="button button--secondary"
              type="button"
              onClick={() => void handleCopy()}
            >
              {tr.share.link.copy}
            </button>
            {canSystemShare ? (
              <button
                class="button button--secondary"
                type="button"
                disabled={url === null}
                onClick={() => void handleSystemShare()}
              >
                {tr.share.systemShare.action}
              </button>
            ) : null}
          </div>
          <p class="share__status" role="status" aria-live="polite">
            {statusText(status)}
          </p>
        </section>
      )}

      {url === null ? null : (
        <section class="share__section" aria-labelledby="share-qr-heading">
          <h2 id="share-qr-heading">{tr.share.qr.title}</h2>
          <p class="share__hint">{tr.share.qr.hint}</p>
          {qr === null ? (
            <Notice tone="warning">{tr.share.qr.tooLong}</Notice>
          ) : (
            <div class="share__qr">
              <ShareQrImage qr={qr} class="share__qr-image" />
            </div>
          )}
        </section>
      )}
    </div>
  );
}

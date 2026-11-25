/**
 * Şartname §12 — `#/yazdir` sayfası: çıktı seçimi ve baskı önizlemesi.
 *
 * Sayfa, hangi belgelerin basılacağını **kutularla** sorar (§12), hassas
 * seçenekleri ayrı ayrı sorar (sağlık bilgisi, okul adı, kan grubu, tek satır
 * not) ve seçilen belgelerin önizlemesini ekranda gösterir. "Yazdır" düğmesi
 * tarayıcının yazdırma penceresini açar (`window.print()`); test ve kabuk
 * kolaylığı için `onPrint` ile enjekte edilebilir.
 *
 * PDF kitaplığı **yoktur** (§6): çıktı tamamen tarayıcının yazdırma penceresi ve
 * `src/styles/print.css` ile üretilir.
 *
 * Kâğıt önceliği (İ3): bu sayfa her akışın son durağıdır; ölçek notu ("%100")
 * ve takvim niyeti burada gösterilir.
 */
import { useEffect, useState } from 'preact/hooks';
import { tr } from '../../i18n/tr.ts';
import type { Plan } from '../../model/types.ts';
import {
  buildShareCard,
  buildShareQr,
  buildShareUrl,
  encodeShare,
  type ShareQr,
} from '../../share/index.ts';
import { Checkbox, Notice } from '../components/index.ts';
import {
  BagChecklist,
  BlankForm,
  ChildCards,
  DEFAULT_PRINT_DOCUMENTS,
  DEFAULT_PRINT_OPTIONS,
  FridgeSheet,
  FullPlan,
  PRINT_DOCUMENT_IDS,
  type PrintDocumentId,
  type PrintOptions,
  WalletCards,
} from '../print/index.ts';

/** §11.5/3 — sağlık bilgisinin girildiği adım; `visitedSteps` 1 tabanlıdır. */
const HEALTH_STEP = 3;

export interface PrintProps {
  /** Yazdırılacak plan (uygulama kabuğunda sanitize edilmiş). */
  plan: Plan;
  /** Ziyaret edilen sihirbaz adımları (§11.8); sağlık seçeneği buna bakar. */
  visitedSteps?: ReadonlySet<number>;
  /** "Yazdır" davranışı; verilmezse `window.print()` çağrılır. */
  onPrint?: () => void;
  /** §12 son notu — takvim dosyası niyeti (.ics üretimi çıktı katmanında). */
  onDownloadIcs?: () => void;
}

/** Seçilen belgeyi ilgili bileşenle çizer. */
function PrintDocument({
  id,
  plan,
  options,
  walletQr,
}: {
  id: PrintDocumentId;
  plan: Plan;
  options: PrintOptions;
  walletQr: ShareQr | null;
}) {
  switch (id) {
    case 'fullPlan': {
      return <FullPlan plan={plan} includeHealth={options.includeHealth} />;
    }
    case 'fridgeSheet': {
      return <FridgeSheet plan={plan} />;
    }
    case 'walletCards': {
      return (
        <WalletCards
          plan={plan}
          includeBloodType={options.includeBloodType}
          includeWalletNote={options.includeWalletNote}
          qr={walletQr}
        />
      );
    }
    case 'childCards': {
      return <ChildCards plan={plan} includeSchoolName={options.includeSchoolName} />;
    }
    case 'bagChecklist': {
      return <BagChecklist plan={plan} />;
    }
    case 'blankForm': {
      return <BlankForm />;
    }
    default: {
      return null;
    }
  }
}

export function Print({ plan, visitedSteps, onPrint, onDownloadIcs }: PrintProps) {
  const [documents, setDocuments] = useState<readonly PrintDocumentId[]>(DEFAULT_PRINT_DOCUMENTS);
  const [options, setOptions] = useState<PrintOptions>(DEFAULT_PRINT_OPTIONS);
  const [includeWalletQr, setIncludeWalletQr] = useState(false);
  const [walletQr, setWalletQr] = useState<ShareQr | null>(null);
  const [qrState, setQrState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const walletSelected = documents.includes('walletCards');

  useEffect(() => {
    if (!includeWalletQr || !walletSelected) {
      setQrState('idle');
      setWalletQr(null);
      return;
    }

    let cancelled = false;
    setQrState('loading');
    setWalletQr(null);
    const card = buildShareCard(plan, { includeNeedsNotes: false, includeHealth: false });
    void encodeShare({ ...card, n: '' }).then(
      (payload) => {
        if (cancelled) return;
        const qr = buildShareQr(buildShareUrl(payload));
        setWalletQr(qr);
        setQrState(qr === null ? 'error' : 'ready');
      },
      () => {
        if (!cancelled) setQrState('error');
      },
    );
    return () => {
      cancelled = true;
    };
  }, [includeWalletQr, walletSelected, plan]);

  // §4.1 satır 3 / İ8: sağlık seçeneği yalnızca plan izinliyse sunulur. Ziyaret
  // izi verilmişse 3. adımın açılmış olması da aranır; iz hiç yoksa (ör. içe
  // aktarılmış plan) yalnızca planın kendi iznine bakılır.
  const hasVisitTrace = visitedSteps !== undefined && visitedSteps.size > 0;
  const healthAvailable =
    plan.healthOptIn && (!hasVisitTrace || visitedSteps?.has(HEALTH_STEP) === true);
  const healthHint = plan.healthOptIn
    ? tr.print.page.includeHealthNotVisited
    : tr.print.page.includeHealthUnavailable;

  const toggleDocument = (id: PrintDocumentId, checked: boolean): void => {
    setDocuments((current) => {
      if (checked) {
        return current.includes(id) ? current : [...current, id];
      }
      return current.filter((item) => item !== id);
    });
  };

  const setOption = (key: keyof PrintOptions, value: boolean): void => {
    setOptions((current) => ({ ...current, [key]: value }));
  };

  const handlePrint = (): void => {
    if (onPrint !== undefined) {
      onPrint();
      return;
    }
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
    }
  };

  const selected = PRINT_DOCUMENT_IDS.filter((id) => documents.includes(id));

  return (
    <div class="print">
      <h1 id="print-heading" tabIndex={-1}>
        {tr.print.page.title}
      </h1>
      <p class="print__intro">{tr.print.page.intro}</p>

      <div class="print__controls">
        <fieldset class="print__fieldset">
          <legend class="print__legend">{tr.print.page.documentsLegend}</legend>
          {PRINT_DOCUMENT_IDS.map((id) => (
            <Checkbox
              key={id}
              id={`print-doc-${id}`}
              label={tr.print.documents[id].title}
              hint={tr.print.documents[id].description}
              checked={documents.includes(id)}
              onChange={(checked) => toggleDocument(id, checked)}
            />
          ))}
        </fieldset>

        <fieldset class="print__fieldset">
          <legend class="print__legend">{tr.print.page.optionsLegend}</legend>
          <Checkbox
            id="print-include-health"
            label={tr.print.page.includeHealth}
            hint={healthAvailable ? tr.print.page.includeHealthHint : healthHint}
            checked={options.includeHealth}
            disabled={!healthAvailable}
            onChange={(checked) => setOption('includeHealth', checked)}
          />
          <Checkbox
            id="print-include-school-name"
            label={tr.print.page.includeSchoolName}
            hint={tr.print.page.includeSchoolNameHint}
            checked={options.includeSchoolName}
            onChange={(checked) => setOption('includeSchoolName', checked)}
          />
          <Checkbox
            id="print-include-blood-type"
            label={tr.print.page.includeBloodType}
            hint={tr.print.page.includeBloodTypeHint}
            checked={options.includeBloodType}
            disabled={!plan.healthOptIn}
            onChange={(checked) => setOption('includeBloodType', checked)}
          />
          <Checkbox
            id="print-include-wallet-note"
            label={tr.print.page.includeWalletNote}
            hint={tr.print.page.includeWalletNoteHint}
            checked={options.includeWalletNote}
            onChange={(checked) => setOption('includeWalletNote', checked)}
          />
          <Checkbox
            id="print-include-wallet-qr"
            label={tr.print.page.includeWalletQr}
            hint={tr.print.page.includeWalletQrHint}
            checked={includeWalletQr}
            disabled={!walletSelected || plan.members.length === 0}
            onChange={setIncludeWalletQr}
          />
          {qrState === 'error' && includeWalletQr && walletSelected ? (
            <Notice tone="warning" live="polite">
              {tr.print.page.walletQrError}
            </Notice>
          ) : null}
        </fieldset>

        <div class="print__actions">
          <button
            class="button button--primary"
            type="button"
            disabled={
              selected.length === 0 ||
              (includeWalletQr && walletSelected && (qrState === 'idle' || qrState === 'loading'))
            }
            onClick={handlePrint}
          >
            {tr.print.page.printButton}
          </button>
          {onDownloadIcs === undefined ? null : (
            <button class="button button--secondary" type="button" onClick={onDownloadIcs}>
              {tr.print.page.calendarButton}
            </button>
          )}
        </div>

        <Notice tone="info">{tr.print.page.scaleNote}</Notice>
        {onDownloadIcs === undefined ? null : (
          <p class="print__hint">{tr.print.page.calendarHint}</p>
        )}
      </div>

      <section class="print__preview" aria-labelledby="print-preview-heading">
        <h2 id="print-preview-heading" class="print__preview-title">
          {tr.print.page.previewTitle}
        </h2>
        <p class="print__hint">{tr.print.page.previewHint}</p>
        {selected.length === 0 ? (
          <p class="print__empty">{tr.print.page.previewEmpty}</p>
        ) : (
          selected.map((id) => (
            <PrintDocument
              key={id}
              id={id}
              plan={plan}
              options={options}
              walletQr={includeWalletQr ? walletQr : null}
            />
          ))
        )}
      </section>
    </div>
  );
}

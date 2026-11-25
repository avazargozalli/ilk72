/**
 * Şartname §9, §11.1, §11.2, §11.4 — uygulama kabuğu.
 *
 * Kabuk, planın ve ayarların **tek sahibidir**: depoyu açar (§9.1), kilidi
 * çözer (§9.3), değişiklikleri otomatik kaydeder (§11.4), ilk açılış
 * bilgilendirmesini gösterir (§11.2) ve yolu ilgili sayfaya çevirir (§11.1).
 * Sayfalar saf prop tabanlıdır; depoya erişmezler (§mimari §1).
 *
 * Bellek içi kip (§9.2): depo açılamazsa uygulama çalışmaya devam eder ve
 * kalıcı bir uyarı gösterir. Kilit açıkken 112 düğmesi parolasız erişilebilir
 * kalır (§9.3): kilit ekranı `tel:112` bağlantısını her zaman gösterir.
 */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import {
  APP_ORIGIN,
  BACKUP_MAX_BYTES,
  EMERGENCY_NUMBER,
  EMERGENCY_TEL,
  ROUTES,
} from '../config.ts';
import { CONTENT_ITEMS } from '../content/registry.ts';
import { tr } from '../i18n/tr.ts';
import { createEmptyPlan } from '../model/defaults.ts';
import { computeProgress } from '../model/progress.ts';
import type { Plan } from '../model/types.ts';
import { sanitizePlan } from '../model/validate.ts';
import {
  buildIcs,
  ICS_CONTENT_TYPE,
  ICS_FILE_NAME,
  icsStamp,
  reviewIcsUid,
} from '../output/index.ts';
import {
  currentRoute,
  focusRouteHeading,
  type RouteId,
  type RouteMatch,
  subscribeToRouteChanges,
  updateDocumentTitle,
} from '../router.ts';
import { exportBackup, importBackup } from '../storage/backup.ts';
import {
  clearAllData,
  disableLock,
  enableLock,
  flushPending,
  getSettings,
  initializeStorage,
  isMemoryMode,
  loadPlan,
  PERSISTENCE_STATUS_EVENT,
  replacePlan,
  type Settings,
  savePlan,
  unlockPlan,
  updateSettings,
} from '../storage/store.ts';
import { Dialog, FirstRunNotice, Notice, type SaveState } from '../ui/components/index.ts';
import { About } from '../ui/pages/About.tsx';
import { Accessibility } from '../ui/pages/Accessibility.tsx';
import { Bag } from '../ui/pages/Bag.tsx';
import { Emergency } from '../ui/pages/Emergency.tsx';
import { Guide } from '../ui/pages/Guide.tsx';
import { Home } from '../ui/pages/Home.tsx';
import { Import } from '../ui/pages/Import.tsx';
import { Imprint } from '../ui/pages/Imprint.tsx';
import { NotFound } from '../ui/pages/NotFound.tsx';
import { Print } from '../ui/pages/Print.tsx';
import { Privacy } from '../ui/pages/Privacy.tsx';
import { dateOnly } from '../ui/pages/pages/shared.ts';
import { Settings as SettingsPage } from '../ui/pages/Settings.tsx';
import { Share } from '../ui/pages/Share.tsx';
import { Sources } from '../ui/pages/Sources.tsx';
import { Summary } from '../ui/pages/Summary.tsx';
import { Terms } from '../ui/pages/Terms.tsx';
import { Wizard } from '../ui/pages/Wizard.tsx';
import { defaultReviewDate } from '../ui/pages/wizard/dates.ts';
import { BlankForm } from '../ui/print/BlankForm.tsx';

import { applyServiceWorkerUpdate, isUpdateReady, UPDATE_READY_EVENT } from './pwa.ts';

type BootState = 'booting' | 'locked' | 'storage-error' | 'ready';

const PUBLIC_ROUTES = new Set<RouteId>([
  'emergency',
  'guide',
  'about',
  'privacy',
  'terms',
  'imprint',
  'accessibility',
  'sources',
  'notFound',
]);

function LockScreen({
  storageError,
  onUnlock,
  onReset,
}: {
  storageError: boolean;
  onUnlock: (passphrase: string) => Promise<void>;
  onReset: () => Promise<void>;
}) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = async (): Promise<void> => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await onUnlock(value);
    } catch {
      setError(tr.shell.lock.wrongPassword);
      setValue('');
      inputRef.current?.focus();
    } finally {
      setBusy(false);
    }
  };

  const reset = async (): Promise<void> => {
    if (resetBusy) return;
    setResetBusy(true);
    setError(null);
    try {
      await onReset();
    } catch {
      setError(tr.shell.lock.resetError);
    } finally {
      setResetBusy(false);
    }
  };

  return (
    <>
      <h1 tabIndex={-1}>{storageError ? tr.shell.lock.storageErrorTitle : tr.shell.lock.title}</h1>
      <p>{storageError ? tr.shell.lock.storageErrorIntro : tr.shell.lock.intro}</p>

      {storageError ? null : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <label class="field__label" for="unlock-passphrase">
            {tr.shell.lock.passwordLabel}
          </label>
          <input
            ref={inputRef}
            class="text-input"
            id="unlock-passphrase"
            type="password"
            autocomplete="current-password"
            value={value}
            aria-invalid={error === tr.shell.lock.wrongPassword ? 'true' : undefined}
            aria-describedby={error === tr.shell.lock.wrongPassword ? 'unlock-error' : undefined}
            onInput={(event) => setValue(event.currentTarget.value)}
          />
          {error === tr.shell.lock.wrongPassword ? (
            <p class="field__error" id="unlock-error" role="alert">
              {error}
            </p>
          ) : null}
          <div class="button-row">
            <button class="button button--primary" type="submit" disabled={busy}>
              {tr.shell.lock.submit}
            </button>
          </div>
        </form>
      )}
      <button
        class="button button--quiet"
        type="button"
        disabled={busy}
        onClick={() => {
          setError(null);
          setResetOpen(true);
        }}
      >
        {storageError ? tr.shell.lock.forgotConfirm : tr.shell.lock.forgot}
      </button>
      <Dialog
        open={resetOpen}
        title={storageError ? tr.shell.lock.forgotConfirm : tr.shell.lock.forgotTitle}
        description={storageError ? tr.shell.lock.resetBody : tr.shell.lock.forgotBody}
        onClose={() => {
          if (!resetBusy) setResetOpen(false);
        }}
        actions={
          <>
            <button
              class="button button--secondary"
              type="button"
              disabled={resetBusy}
              onClick={() => setResetOpen(false)}
            >
              {tr.shell.lock.forgotCancel}
            </button>
            <button
              class="button button--primary"
              type="button"
              disabled={resetBusy}
              onClick={() => void reset()}
            >
              {tr.shell.lock.forgotConfirm}
            </button>
          </>
        }
      >
        {error === tr.shell.lock.resetError ? (
          <Notice tone="error" live="assertive">
            {error}
          </Notice>
        ) : null}
      </Dialog>

      {/* §9.3 — acil durumda 112 her zaman parolasız erişilebilir. */}
      <p>
        {tr.shell.lock.emergencyHint}{' '}
        <a class="button button--emergency" href={EMERGENCY_TEL}>
          {EMERGENCY_NUMBER}
        </a>
      </p>
    </>
  );
}

export function AppShell() {
  const [route, setRoute] = useState<RouteMatch>(() => currentRoute());
  const [boot, setBoot] = useState<BootState>('booting');
  const [draftPlan, setDraftPlan] = useState<Plan | null>(null);
  const draftRef = useRef<Plan | null>(null);
  const plan = useMemo(
    () => (draftPlan === null ? null : sanitizePlan(draftPlan).plan),
    [draftPlan],
  );
  const [settings, setSettings] = useState<Settings | null>(null);
  const [memoryMode, setMemoryMode] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState(false);
  // §16 — çevrimdışı notu ve "Yeni sürüm hazır" bildirimi.
  const [offline, setOffline] = useState(
    () => typeof navigator !== 'undefined' && navigator.onLine === false,
  );
  const [updateReady, setUpdateReady] = useState(isUpdateReady);
  const [updateBusy, setUpdateBusy] = useState(false);
  const [updateError, setUpdateError] = useState(false);
  const [updateMemoryConfirm, setUpdateMemoryConfirm] = useState(false);
  const saveTimer = useRef<number | null>(null);
  const editVersion = useRef(0);
  const replacement = useRef(false);
  const [replacing, setReplacing] = useState(false);
  const unlockRequired = boot !== 'ready' && !PUBLIC_ROUTES.has(route.id);

  useEffect(() => {
    const goOnline = (): void => setOffline(false);
    const goOffline = (): void => setOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  useEffect(() => {
    const onUpdateReady = (): void => setUpdateReady(true);
    window.addEventListener(UPDATE_READY_EVENT, onUpdateReady);
    if (isUpdateReady()) onUpdateReady();
    return () => window.removeEventListener(UPDATE_READY_EVENT, onUpdateReady);
  }, []);

  // Açılış: depoyu hazırla, planı ve ayarları oku (§9.1, §9.3).
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await initializeStorage();
        const loaded = await loadPlan();
        if (cancelled) return;
        draftRef.current = loaded.plan;
        setDraftPlan(loaded.plan);
        setMemoryMode(isMemoryMode());
        setSettings(getSettings());
        setBoot(loaded.encrypted && loaded.plan === null ? 'locked' : 'ready');
      } catch {
        if (!cancelled) setBoot('storage-error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => subscribeToRouteChanges(setRoute), []);

  useEffect(() => {
    const syncPersistenceStatus = (): void => {
      setSettings((current) =>
        current === null
          ? current
          : { ...current, storagePersisted: getSettings().storagePersisted },
      );
    };
    window.addEventListener(PERSISTENCE_STATUS_EVENT, syncPersistenceStatus);
    return () => window.removeEventListener(PERSISTENCE_STATUS_EVENT, syncPersistenceStatus);
  }, []);

  useEffect(() => {
    updateDocumentTitle(route);
  }, [route]);

  useLayoutEffect(() => {
    focusRouteHeading();
  }, [route, boot]);

  // §15 — "Büyük yazı" ayarı kök öğeye yazılır; token'lar bunu okur.
  useEffect(() => {
    document.documentElement.dataset.largeText = settings?.largeText ? 'true' : 'false';
  }, [settings?.largeText]);

  const stopSaveTimer = (): void => {
    if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
    saveTimer.current = null;
  };

  useEffect(() => stopSaveTimer, []);

  const confirmSave = async (): Promise<boolean> => {
    stopSaveTimer();
    const version = editVersion.current;
    try {
      await flushPending();
      if (version !== editVersion.current) return false;
      setSaveState(isMemoryMode() ? 'idle' : 'saved');
      setSaveError(null);
      return true;
    } catch (error) {
      if (version === editVersion.current) {
        setSaveState('error');
        setSaveError(
          error instanceof Error && error.message === 'depo-degisti'
            ? tr.shell.concurrentEdit
            : tr.shell.saveError,
        );
      }
      return false;
    }
  };

  const patchPlan = (patch: Partial<Plan>): void => {
    if (replacement.current) return;
    const base = draftRef.current ?? createEmptyPlan();
    const next = { ...base, ...patch, updatedAt: new Date().toISOString() };
    draftRef.current = next;
    setDraftPlan(next);
    editVersion.current += 1;
    setSaveState(isMemoryMode() ? 'idle' : 'saving');
    savePlan(next);
    stopSaveTimer();
    saveTimer.current = window.setTimeout(() => void confirmSave(), 500);
  };

  const writeSettings = (patch: Partial<Settings>): void => {
    void updateSettings(patch).then(
      () => setSettingsError(false),
      () => setSettingsError(true),
    );
  };

  const visitStep = (step: number): void => {
    setSettings((current) => {
      if (current === null) return current;
      if (current.visitedSteps.includes(step)) return current;
      const next: Settings = {
        ...current,
        visitedSteps: [...current.visitedSteps, step].sort((a, b) => a - b),
      };
      writeSettings({ visitedSteps: next.visitedSteps });
      return next;
    });
  };

  const acceptFirstRun = (): void => {
    writeSettings({ firstRunAccepted: true });
    setSettings((current) => (current === null ? current : { ...current, firstRunAccepted: true }));
    focusRouteHeading();
  };

  const handleUnlock = async (passphrase: string): Promise<void> => {
    const unlocked = await unlockPlan(passphrase);
    draftRef.current = unlocked;
    setDraftPlan(unlocked);
    setSettings(getSettings());
    setBoot('ready');
  };

  const handleSettingsChange = (patch: Partial<Settings>): void => {
    writeSettings(patch);
    setSettings((current) => (current === null ? current : { ...current, ...patch }));
  };

  const handleExportBackup = async (passphrase?: string): Promise<void> => {
    if (plan === null) return;
    const { filename, text } = await exportBackup(plan, passphrase);
    downloadTextFile(filename, text);
  };

  const commitReplacement = async (next: Plan): Promise<void> => {
    if (replacement.current) throw new Error('kayit-basarisiz');
    replacement.current = true;
    setReplacing(true);
    try {
      const saved = await replacePlan(next);
      stopSaveTimer();
      editVersion.current += 1;
      draftRef.current = saved;
      setDraftPlan(saved);
      setSaveState(isMemoryMode() ? 'idle' : 'saved');
      setSaveError(null);
      setSettings(getSettings());
    } catch {
      throw new Error('kayit-basarisiz');
    } finally {
      replacement.current = false;
      setReplacing(false);
    }
  };

  const handleImportBackup = async (file: File, passphrase?: string): Promise<void> => {
    if (file.size > BACKUP_MAX_BYTES) throw new Error('cok-buyuk');
    const { plan: imported } = await importBackup(await file.text(), passphrase);
    await commitReplacement(imported);
  };

  const handleEnableLock = async (passphrase: string): Promise<void> => {
    await enableLock(passphrase);
    setSettings(getSettings());
  };

  const handleDisableLock = async (): Promise<void> => {
    await disableLock();
    setSettings(getSettings());
  };

  const handleClearAll = async (): Promise<void> => {
    await clearAllData();
    stopSaveTimer();
    editVersion.current += 1;
    draftRef.current = null;
    setDraftPlan(null);
    setSettings(getSettings());
    setSaveState('idle');
    setSaveError(null);
    setSettingsError(false);
    setBoot('ready');
  };

  const handleUpdate = async (): Promise<void> => {
    setUpdateBusy(true);
    setUpdateError(false);
    try {
      if (draftRef.current !== null && !(await confirmSave())) return;
      const version = editVersion.current;
      await applyServiceWorkerUpdate(() => version === editVersion.current || confirmSave());
      setUpdateReady(isUpdateReady());
    } catch {
      setUpdateError(true);
    } finally {
      setUpdateBusy(false);
    }
  };

  if (boot === 'booting') {
    return (
      <main id="main-content" tabIndex={-1}>
        <p role="status">{tr.shell.booting}</p>
      </main>
    );
  }

  return (
    <>
      <header class="app-header">
        <div class="app-header__inner">
          <a class="app-brand" href={ROUTES.home}>
            <span class="app-brand__mark" aria-hidden="true">
              72
            </span>
            <span>{tr.app.name}</span>
          </a>
          <nav class="main-nav" aria-label={tr.shell.navigation}>
            {(['home', 'guide', 'settings', 'about', 'emergency'] as const).map((key) => (
              <a
                key={key}
                class={key === 'emergency' ? 'main-nav__emergency' : undefined}
                href={ROUTES[key]}
                aria-current={route.id === key ? 'page' : undefined}
              >
                {tr.nav[key]}
              </a>
            ))}
          </nav>
        </div>
      </header>
      {/* §16 — çevrimdışıyken küçük not; plan kullanılabilir kalır. */}
      {offline ? (
        <div class="shell-banner">
          <p class="shell-offline" role="status">
            {tr.shell.pwa.offline}
          </p>
        </div>
      ) : null}

      {/* §16 — yeni sürüm bildirimi; kullanıcı onaylamadan yenilenmez. */}
      {updateReady ? (
        <div class="shell-banner">
          <p class="shell-update" role="status">
            {tr.shell.pwa.updateReady}{' '}
            <button
              class="button button--secondary"
              type="button"
              disabled={updateBusy || replacing}
              onClick={() => {
                if (memoryMode && plan !== null) setUpdateMemoryConfirm(true);
                else void handleUpdate();
              }}
            >
              {tr.shell.pwa.updateAction}
            </button>
          </p>
          <Dialog
            open={updateMemoryConfirm}
            title={tr.shell.pwa.updateMemoryTitle}
            description={tr.shell.pwa.updateMemoryBody}
            onClose={() => setUpdateMemoryConfirm(false)}
            actions={
              <>
                <button
                  class="button button--secondary"
                  type="button"
                  onClick={() => setUpdateMemoryConfirm(false)}
                >
                  {tr.components.dialog.cancel}
                </button>
                <button
                  class="button button--primary"
                  type="button"
                  onClick={() => {
                    setUpdateMemoryConfirm(false);
                    void handleUpdate();
                  }}
                >
                  {tr.shell.pwa.updateAction}
                </button>
              </>
            }
          />
          {updateError ? (
            <Notice tone="error" live="polite">
              {tr.shell.pwa.updateError}
            </Notice>
          ) : null}
        </div>
      ) : null}

      {memoryMode ? (
        <div class="shell-banner">
          <Notice tone="warning">{tr.shell.memoryMode}</Notice>
        </div>
      ) : null}

      <main
        id="main-content"
        class={route.id === 'home' && !unlockRequired ? 'app-main app-main--home' : 'app-main'}
        tabIndex={-1}
      >
        {CONTENT_ITEMS.some((item) => item.status === 'taslak') && (
          <Notice class="shell-notice shell-notice--draft" tone="info">
            {tr.shell.draft}
          </Notice>
        )}
        {boot === 'ready' && settings !== null && !settings.firstRunAccepted ? (
          <FirstRunNotice onAccept={acceptFirstRun} />
        ) : null}
        {saveError === null ? null : (
          <Notice class="shell-notice" tone="error" live="polite">
            {saveError}
          </Notice>
        )}
        {settingsError ? (
          <Notice class="shell-notice" tone="error" live="polite">
            {tr.shell.settingsError}
          </Notice>
        ) : null}
        {unlockRequired ? (
          <LockScreen
            storageError={boot === 'storage-error'}
            onUnlock={handleUnlock}
            onReset={handleClearAll}
          />
        ) : replacing && (route.id === 'plan' || route.id === 'bag') ? (
          <h1 tabIndex={-1}>{tr.shell.planReplacing}</h1>
        ) : (
          renderRoute(route, {
            draftPlan,
            plan,
            settings,
            saveState,
            patchPlan,
            visitStep,
            downloadIcs: () => {
              if (plan !== null) downloadCalendar(plan);
            },
            onSettingsChange: handleSettingsChange,
            onExportBackup: handleExportBackup,
            onImportBackup: handleImportBackup,
            onMerge: commitReplacement,
            onEnableLock: handleEnableLock,
            onDisableLock: handleDisableLock,
            onClearAll: handleClearAll,
          })
        )}
      </main>
    </>
  );
}

interface RouteContext {
  draftPlan: Plan | null;
  plan: Plan | null;
  settings: Settings | null;
  saveState: SaveState;
  patchPlan: (patch: Partial<Plan>) => void;
  visitStep: (step: number) => void;
  downloadIcs: () => void;
  onSettingsChange: (patch: Partial<Settings>) => void;
  onExportBackup: (passphrase?: string) => Promise<void>;
  onImportBackup: (file: File, passphrase?: string) => Promise<void>;
  onMerge: (next: Plan) => Promise<void>;
  onEnableLock: (passphrase: string) => Promise<void>;
  onDisableLock: () => Promise<void>;
  onClearAll: () => Promise<void>;
}

/** §12 — .ics dosyasını tarayıcıda indirir; ağ isteği yoktur. */
function downloadTextFile(filename: string, text: string, type = 'application/json'): void {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** §12 — .ics dosyasını tarayıcıda indirir; ağ isteği yoktur. */
function downloadCalendar(plan: Plan): void {
  const date = dateOnly(plan.review.nextReviewAt ?? defaultReviewDate());
  const ics = buildIcs({
    uid: reviewIcsUid(plan.id),
    date,
    stamp: icsStamp(new Date()),
    summary: tr.share.calendar.summary,
    description: tr.share.calendar.description,
    url: APP_ORIGIN,
  });
  downloadTextFile(ICS_FILE_NAME, ics, ICS_CONTENT_TYPE);
}

/** Plan gerektiren sayfalarda plan yoksa yönlendirme gösterilir (§11.3). */
function PlanRequired() {
  return (
    <>
      <h1 tabIndex={-1}>{tr.nav.plan}</h1>
      <Notice tone="info">{tr.shell.noPlan.text}</Notice>
      <p>
        <a class="button button--primary" href={ROUTES.plan(1)}>
          {tr.shell.noPlan.action}
        </a>
      </p>
    </>
  );
}

function renderRoute(route: RouteMatch, context: RouteContext) {
  switch (route.id) {
    case 'plan': {
      const current = context.draftPlan ?? createEmptyPlan();
      return (
        <Wizard
          key={route.planStep}
          plan={current}
          visitedSteps={new Set(context.settings?.visitedSteps ?? [])}
          onPatch={context.patchPlan}
          onVisit={context.visitStep}
          onNavigate={(step) => {
            location.hash = ROUTES.plan(step);
          }}
          onFinish={() => {
            location.hash = ROUTES.summary;
          }}
          initialStep={route.planStep}
          saveState={context.saveState}
          onDownloadIcs={context.downloadIcs}
        />
      );
    }
    case 'home': {
      return (
        <Home
          plan={context.plan}
          {...(context.plan === null
            ? {}
            : {
                progress: computeProgress(
                  context.plan,
                  new Set(context.settings?.visitedSteps ?? []),
                ),
              })}
          onStart={() => {
            location.hash = ROUTES.plan(1);
          }}
        />
      );
    }
    case 'summary': {
      return context.plan === null ? <PlanRequired /> : <Summary plan={context.plan} />;
    }
    case 'emergency': {
      return <Emergency plan={context.plan} />;
    }
    case 'guide': {
      return <Guide part={route.guidePart} />;
    }
    case 'bag': {
      return context.draftPlan === null ? (
        <PlanRequired />
      ) : (
        <Bag plan={context.draftPlan} onChange={context.patchPlan} />
      );
    }
    case 'print': {
      // §12.6/§11.3 — boş form **plan oluşturmadan** basılabilir; plan yokken
      // yalnızca boş form sunulur, diğer belgeler plan ister.
      if (context.plan === null) {
        return (
          <div class="print">
            <h1 tabIndex={-1}>{tr.print.page.title}</h1>
            <p class="print__intro">{tr.shell.noPlan.text}</p>
            <p class="print__hint">{tr.print.page.scaleNote}</p>
            <div class="print__actions">
              <button class="button button--primary" type="button" onClick={() => window.print()}>
                {tr.print.page.printButton}
              </button>
              <a class="button button--secondary" href={ROUTES.plan(1)}>
                {tr.shell.noPlan.action}
              </a>
            </div>
            <div class="print__preview">
              <BlankForm />
            </div>
          </div>
        );
      }
      return (
        <Print
          plan={context.plan}
          visitedSteps={new Set(context.settings?.visitedSteps ?? [])}
          onDownloadIcs={context.downloadIcs}
        />
      );
    }
    case 'share': {
      return context.plan === null ? <PlanRequired /> : <Share plan={context.plan} />;
    }
    case 'import': {
      return (
        <Import
          key={route.importPayload}
          payload={route.importPayload ?? ''}
          plan={context.plan}
          onMerge={context.onMerge}
        />
      );
    }
    case 'settings': {
      const current = context.settings;
      if (current === null) return <PlanRequired />;
      return (
        <SettingsPage
          plan={context.plan}
          settings={current}
          onChange={context.onSettingsChange}
          onExportBackup={context.onExportBackup}
          onImportBackup={context.onImportBackup}
          onEnableLock={context.onEnableLock}
          onDisableLock={context.onDisableLock}
          onClearAll={context.onClearAll}
        />
      );
    }
    case 'about': {
      return <About />;
    }
    case 'privacy': {
      return <Privacy />;
    }
    case 'terms': {
      return <Terms />;
    }
    case 'imprint': {
      return <Imprint />;
    }
    case 'accessibility': {
      return <Accessibility />;
    }
    case 'sources': {
      return <Sources />;
    }
    default: {
      return <NotFound />;
    }
  }
}

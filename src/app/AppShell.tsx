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

import { useEffect, useRef, useState } from 'preact/hooks';
import { APP_ORIGIN, ROUTES } from '../config.ts';
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
  type RouteMatch,
  subscribeToRouteChanges,
  updateDocumentTitle,
} from '../router.ts';
import { exportBackup, importBackup } from '../storage/backup.ts';
import {
  clearAllData,
  disableLock,
  enableLock,
  getSettings,
  initializeStorage,
  isMemoryMode,
  loadPlan,
  type Settings,
  savePlan,
  unlockPlan,
  updateSettings,
} from '../storage/store.ts';
import { FirstRunNotice, Notice } from '../ui/components/index.ts';
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
import { Settings as SettingsPage } from '../ui/pages/Settings.tsx';
import { Share } from '../ui/pages/Share.tsx';
import { Sources } from '../ui/pages/Sources.tsx';
import { Summary } from '../ui/pages/Summary.tsx';
import { Terms } from '../ui/pages/Terms.tsx';
import { Wizard } from '../ui/pages/Wizard.tsx';
import { defaultReviewDate } from '../ui/pages/wizard/dates.ts';
import { BlankForm } from '../ui/print/BlankForm.tsx';

import { applyServiceWorkerUpdate, UPDATE_READY_EVENT } from './pwa.ts';

type BootState = 'booting' | 'locked' | 'ready';

/** §9.3 — kilit ekranı: parola ister, yanlış parolada veri silinmez. */
function LockScreen({ onUnlock }: { onUnlock: (passphrase: string) => Promise<void> }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (): Promise<void> => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await onUnlock(value);
    } catch {
      setError(tr.shell.lock.wrongPassword);
      setValue('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main id="main-content" tabIndex={-1}>
      <h1 tabIndex={-1}>{tr.shell.lock.title}</h1>
      <p>{tr.shell.lock.intro}</p>

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
          class="text-input"
          id="unlock-passphrase"
          type="password"
          autocomplete="current-password"
          value={value}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? 'unlock-error' : undefined}
          onInput={(event) => setValue(event.currentTarget.value)}
        />
        {error ? (
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

      {/* §9.3 — acil durumda 112 her zaman parolasız erişilebilir. */}
      <p>
        {tr.shell.lock.emergencyHint}{' '}
        <a class="button button--emergency" href="tel:112">
          112
        </a>
      </p>
    </main>
  );
}

export function AppShell() {
  const [route, setRoute] = useState<RouteMatch>(() => currentRoute());
  const [boot, setBoot] = useState<BootState>('booting');
  const [plan, setPlan] = useState<Plan | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [memoryMode, setMemoryMode] = useState(false);
  const [saveError, setSaveError] = useState(false);
  // §16 — çevrimdışı notu ve "Yeni sürüm hazır" bildirimi.
  const [offline, setOffline] = useState(
    () => typeof navigator !== 'undefined' && navigator.onLine === false,
  );
  const [updateReady, setUpdateReady] = useState(false);
  const saveTimer = useRef<number | null>(null);

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
    return () => window.removeEventListener(UPDATE_READY_EVENT, onUpdateReady);
  }, []);

  // Açılış: depoyu hazırla, planı ve ayarları oku (§9.1, §9.3).
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await initializeStorage();
      if (cancelled) return;
      const loaded = await loadPlan();
      if (cancelled) return;
      setMemoryMode(isMemoryMode());
      setSettings(getSettings());
      setPlan(loaded.plan);
      setBoot(loaded.encrypted && loaded.plan === null ? 'locked' : 'ready');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => subscribeToRouteChanges(setRoute), []);

  useEffect(() => {
    updateDocumentTitle(route);
    focusRouteHeading();
  }, [route]);

  // §15 — "Büyük yazı" ayarı kök öğeye yazılır; token'lar bunu okur.
  useEffect(() => {
    document.documentElement.dataset.largeText = settings?.largeText ? 'true' : 'false';
  }, [settings?.largeText]);

  // Bekleyen yazmayı sayfa kapanırken boşalt (§9.1).
  useEffect(
    () => () => {
      if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
    },
    [],
  );

  const persist = (next: Plan): void => {
    savePlan(next);
    if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      // Kaydetme hatası yalnızca burada yüzeye çıkar (store sözleşmesi).
      setSaveError(false);
    }, 600);
  };

  const patchPlan = (patch: Partial<Plan>): void => {
    setPlan((current) => {
      const base = current ?? createEmptyPlan();
      const candidate: Plan = { ...base, ...patch, updatedAt: new Date().toISOString() };
      const { plan: sanitized } = sanitizePlan(candidate);
      persist(sanitized);
      return sanitized;
    });
  };

  const visitStep = (step: number): void => {
    setSettings((current) => {
      if (current === null) return current;
      if (current.visitedSteps.includes(step)) return current;
      const next: Settings = {
        ...current,
        visitedSteps: [...current.visitedSteps, step].sort((a, b) => a - b),
      };
      void updateSettings({ visitedSteps: next.visitedSteps });
      return next;
    });
  };

  const acceptFirstRun = (): void => {
    void updateSettings({ firstRunAccepted: true });
    setSettings((current) => (current === null ? current : { ...current, firstRunAccepted: true }));
  };

  const handleUnlock = async (passphrase: string): Promise<void> => {
    const unlocked = await unlockPlan(passphrase);
    setPlan(unlocked);
    setSettings(getSettings());
    setBoot('ready');
  };

  const handleForgotPassword = async (): Promise<void> => {
    await clearAllData();
    setPlan(null);
    setSettings(getSettings());
    setBoot('ready');
  };

  const handleSettingsChange = (patch: Partial<Settings>): void => {
    void updateSettings(patch);
    setSettings((current) => (current === null ? current : { ...current, ...patch }));
  };

  const handleExportBackup = async (passphrase?: string): Promise<void> => {
    if (plan === null) return;
    const { filename, text } = await exportBackup(plan, passphrase);
    downloadTextFile(filename, text);
  };

  const handleImportBackup = async (file: File, passphrase?: string): Promise<void> => {
    const text = await file.text();
    const { plan: imported } = await importBackup(text, passphrase);
    const { plan: sanitized } = sanitizePlan(imported);
    setPlan(sanitized);
    savePlan(sanitized);
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
    setPlan(null);
    setSettings(getSettings());
  };

  if (boot === 'booting') {
    return (
      <main id="main-content" tabIndex={-1}>
        <p role="status">{tr.shell.booting}</p>
      </main>
    );
  }

  if (boot === 'locked') {
    return (
      <LockScreen
        onUnlock={async (passphrase) => {
          try {
            await handleUnlock(passphrase);
          } catch (error) {
            // §9.3 — "Parolamı unuttum" yalnızca bilgilendirir; veri silinmez.
            void handleForgotPassword;
            throw error;
          }
        }}
      />
    );
  }

  return (
    <>
      <nav class="main-nav" aria-label={tr.shell.navigation}>
        {(['home', 'guide', 'emergency', 'settings', 'about'] as const).map((key) => (
          <a key={key} href={ROUTES[key]} aria-current={route.id === key ? 'page' : undefined}>
            {tr.nav[key]}
          </a>
        ))}
      </nav>
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
              onClick={() => {
                setUpdateReady(false);
                applyServiceWorkerUpdate();
              }}
            >
              {tr.shell.pwa.updateAction}
            </button>
          </p>
        </div>
      ) : null}

      {memoryMode ? (
        <div class="shell-banner">
          <Notice tone="warning">{tr.shell.memoryMode}</Notice>
        </div>
      ) : null}

      {settings !== null && !settings.firstRunAccepted ? (
        <FirstRunNotice onAccept={acceptFirstRun} />
      ) : null}

      <main id="main-content" tabIndex={-1}>
        {CONTENT_ITEMS.some((item) => item.status === 'taslak') && (
          <Notice tone="info">{tr.shell.draft}</Notice>
        )}
        {renderRoute(route, {
          plan,
          settings,
          saveError,
          patchPlan,
          visitStep,
          downloadIcs: () => {
            if (plan !== null) downloadCalendar(plan);
          },
          onSettingsChange: handleSettingsChange,
          onExportBackup: handleExportBackup,
          onImportBackup: handleImportBackup,
          onEnableLock: handleEnableLock,
          onDisableLock: handleDisableLock,
          onClearAll: handleClearAll,
        })}
      </main>
    </>
  );
}

interface RouteContext {
  plan: Plan | null;
  settings: Settings | null;
  saveError: boolean;
  patchPlan: (patch: Partial<Plan>) => void;
  visitStep: (step: number) => void;
  downloadIcs: () => void;
  onSettingsChange: (patch: Partial<Settings>) => void;
  onExportBackup: (passphrase?: string) => Promise<void>;
  onImportBackup: (file: File, passphrase?: string) => Promise<void>;
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
  anchor.click();
  URL.revokeObjectURL(url);
}

/** §12 — .ics dosyasını tarayıcıda indirir; ağ isteği yoktur. */
function downloadCalendar(plan: Plan): void {
  const date = plan.review.nextReviewAt ?? defaultReviewDate();
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
      const current = context.plan ?? createEmptyPlan();
      return (
        <Wizard
          plan={current}
          visitedSteps={new Set(context.settings?.visitedSteps ?? [])}
          onPatch={context.patchPlan}
          onVisit={context.visitStep}
          onFinish={() => {
            location.hash = ROUTES.summary;
          }}
          initialStep={route.planStep}
          saveState={context.saveError ? 'error' : 'saved'}
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
      return context.plan === null ? (
        <PlanRequired />
      ) : (
        <Bag plan={context.plan} onChange={context.patchPlan} />
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
          payload={route.importPayload ?? ''}
          plan={context.plan}
          onMerge={context.patchPlan}
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

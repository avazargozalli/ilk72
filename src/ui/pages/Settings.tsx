/**
 * Şartname §9.1, §9.3, §9.4, §15 — ayarlar sayfası.
 *
 * Sayfa saf prop'ludur: plan ve ayarlar yukarıdan gelir, kalıcı yazma işini
 * uygulama kabuğu yapar (`onExportBackup`, `onImportBackup`, `onClearAll` …).
 * Yedek **önizlemesi** için `importBackup` çağrılır: §9.4, kullanıcıya özet
 * göstermeden ve üzerine yazma onayı almadan hiçbir şeyin değişmemesini ister.
 *
 * - "Büyük yazı": §15'teki 22 px gövde metni; `onChange({ largeText })`.
 * - Kalıcı saklama satırı: `settings.storagePersisted` (§9.1).
 * - Yedek: isteğe bağlı parolayla dışa aktarma; dosya seçerek içe aktarma,
 *   1 MB üstü ret, özet ve **üzerine yazma onayı** (§9.4).
 * - Kilit: açmadan önce §9.3 zorunlu uyarısı birebir; parola en az 8 karakter;
 *   "Parolamı unuttum" yalnızca sıfırlamayı önerir, kurtarma yoktur (§9.3).
 * - "Bütün verilerimi sil": onaydan sonra `onClearAll` (§9.4).
 */
import { useState } from 'preact/hooks';
import { BACKUP_MAX_BYTES } from '../../config.ts';
import { errorMessage, formatDate, tr } from '../../i18n/tr.ts';
import type { Plan } from '../../model/types.ts';
import { type BackupSummary, importBackup } from '../../storage/backup.ts';
import type { Settings as SettingsRecord } from '../../storage/store.ts';
import { Checkbox, Dialog, Field, Notice } from '../components/index.ts';

export interface SettingsProps {
  /** Plan yoksa yedek dışa aktarma kapalıdır. */
  plan: Plan | null;
  /** Geçerli ayarlar (uygulama kabuğunda tutulur). */
  settings: SettingsRecord;
  /** Ayar değişikliği; kalıcı yazma kabukta yapılır. */
  onChange: (patch: Partial<SettingsRecord>) => void;
  /** Yedek dosyasını indirir (isteğe bağlı parola). */
  onExportBackup: (passphrase?: string) => Promise<void>;
  /** Onaylanmış yedeği içe aktarır ve planın sahibi olarak kaydeder. */
  onImportBackup: (file: File, passphrase?: string) => Promise<void>;
  /** Kilidi açar (parola en az 8 karakter). */
  onEnableLock: (passphrase: string) => Promise<void>;
  /** Kilidi kapatır. */
  onDisableLock: () => Promise<void>;
  /** Bütün verileri siler (§9.4). */
  onClearAll: () => Promise<void>;
}

/** §9.3 — en kısa parola; güç ölçer yoktur, yalnızca uzunluk denetlenir. */
const MIN_PASSPHRASE_LENGTH = 8;

function errorCode(error: unknown): string {
  return error instanceof Error ? error.message : '';
}

/** Yedek hata kodları → Türkçe ileti (Ek B.3 dışındaki iki kod burada). */
function backupErrorMessage(code: string): string {
  if (code === 'gecersiz-format') return tr.share.settings.backup.invalidFormat;
  if (code === 'desteklenmeyen-surum') return tr.share.settings.backup.unsupportedVersion;
  if (code === 'cok-buyuk') return tr.share.settings.backup.tooLarge;
  if (code === 'kayit-basarisiz') return tr.share.settings.backup.saveFailed;
  return errorMessage(code);
}

function persistenceMessage(value: boolean | null): string {
  if (value === true) return tr.shell.persistent.granted;
  if (value === false) return tr.shell.persistent.denied;
  if (typeof globalThis.navigator?.storage?.persist === 'function')
    return tr.shell.persistent.pending;
  return tr.shell.persistent.unavailable;
}

interface PendingImport {
  file: File;
  text: string;
}

interface PreviewImport {
  file: File;
  passphrase?: string;
  summary: BackupSummary;
}

export function Settings({
  plan,
  settings,
  onChange,
  onExportBackup,
  onImportBackup,
  onEnableLock,
  onDisableLock,
  onClearAll,
}: SettingsProps) {
  const [exportPassphrase, setExportPassphrase] = useState('');
  const [exportBusy, setExportBusy] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const [pending, setPending] = useState<PendingImport | null>(null);
  const [backupPassword, setBackupPassword] = useState('');
  const [preview, setPreview] = useState<PreviewImport | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importDone, setImportDone] = useState(false);
  const [importBusy, setImportBusy] = useState(false);

  const [lockPassphrase, setLockPassphrase] = useState('');
  const [lockError, setLockError] = useState<string | null>(null);
  const [lockBusy, setLockBusy] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [clearBusy, setClearBusy] = useState(false);
  const [clearDone, setClearDone] = useState(false);
  const [clearError, setClearError] = useState<string | null>(null);

  const handleExport = async (): Promise<void> => {
    if (plan === null) return;
    setExportBusy(true);
    setExportMessage(null);
    try {
      await onExportBackup(exportPassphrase.trim() === '' ? undefined : exportPassphrase);
      setExportMessage(tr.share.settings.backup.exportDone);
    } catch {
      setExportMessage(tr.share.settings.backup.exportFailed);
    } finally {
      setExportBusy(false);
    }
  };

  /**
   * §9.4 — yedeği **önce** çözer, özeti gösterir; yazma onaydan sonra
   * `onImportBackup` ile yapılır. Parola gerekiyorsa parola istemi açılır.
   */
  const prepareImport = async (file: File, text: string, passphrase: string): Promise<void> => {
    setImportBusy(true);
    try {
      const result = await importBackup(text, passphrase === '' ? undefined : passphrase);
      setPreview({
        file,
        summary: result.summary,
        ...(passphrase === '' ? {} : { passphrase }),
      });
      setPending(null);
      setBackupPassword('');
      setImportError(null);
    } catch (error) {
      const code = errorCode(error);
      if (code === 'parola-gerekli') {
        setPending({ file, text });
        setImportError(null);
      } else if (code === 'parola-yanlis-veya-bozuk') {
        setPending({ file, text });
        setImportError(errorMessage(code));
      } else {
        setPending(null);
        setImportError(backupErrorMessage(code));
      }
    } finally {
      setImportBusy(false);
    }
  };

  const handleFile = async (file: File | undefined): Promise<void> => {
    if (file === undefined) return;
    setImportError(null);
    setImportDone(false);
    setPreview(null);
    setPending(null);
    setBackupPassword('');

    if (file.size > BACKUP_MAX_BYTES) {
      setImportError(tr.share.settings.backup.tooLarge);
      return;
    }

    setImportBusy(true);
    let text: string;
    try {
      text = await file.text();
    } catch {
      setImportError(tr.share.settings.backup.readFailed);
      setImportBusy(false);
      return;
    }
    await prepareImport(file, text, '');
  };

  const submitBackupPassword = async (): Promise<void> => {
    if (pending === null) return;
    await prepareImport(pending.file, pending.text, backupPassword);
  };

  const confirmImport = async (): Promise<void> => {
    if (preview === null) return;
    setImportBusy(true);
    try {
      await onImportBackup(preview.file, preview.passphrase);
      setPreview(null);
      setImportDone(true);
      setImportError(null);
    } catch (error) {
      setImportError(backupErrorMessage(errorCode(error)));
    } finally {
      setImportBusy(false);
    }
  };

  const handleEnableLock = async (): Promise<void> => {
    setLockError(null);
    if ([...lockPassphrase].length < MIN_PASSPHRASE_LENGTH) {
      setLockError(tr.share.settings.lock.tooShort);
      return;
    }
    setLockBusy(true);
    try {
      await onEnableLock(lockPassphrase);
      setLockPassphrase('');
    } catch (error) {
      setLockError(
        errorCode(error) === 'parola-kisa'
          ? tr.share.settings.lock.tooShort
          : tr.share.settings.lock.enableFailed,
      );
    } finally {
      setLockBusy(false);
    }
  };

  const handleDisableLock = async (): Promise<void> => {
    setLockError(null);
    setLockBusy(true);
    try {
      await onDisableLock();
    } catch {
      setLockError(tr.share.settings.lock.disableFailed);
    } finally {
      setLockBusy(false);
    }
  };

  const handleClearAll = async (close: () => void): Promise<void> => {
    if (clearBusy) return;
    setClearBusy(true);
    setClearDone(false);
    setClearError(null);
    try {
      await onClearAll();
      setClearDone(true);
      close();
    } catch {
      setClearError(tr.share.settings.delete.failed);
      close();
    } finally {
      setClearBusy(false);
    }
  };

  return (
    <div class="page page--settings">
      <header class="page__heading">
        <h1 tabIndex={-1}>{tr.share.settings.title}</h1>
        <p>{tr.share.settings.intro}</p>
      </header>

      <div class="settings__overview">
        <section class="settings__section" aria-labelledby="settings-display-heading">
          <h2 id="settings-display-heading">{tr.share.settings.display.title}</h2>
          <Checkbox
            id="settings-large-text"
            label={tr.share.settings.display.largeText}
            hint={tr.share.settings.display.largeTextHint}
            checked={settings.largeText}
            onChange={(checked) => onChange({ largeText: checked })}
          />
        </section>

        <section class="settings__section" aria-labelledby="settings-persistence-heading">
          <h2 id="settings-persistence-heading">{tr.share.settings.persistence.title}</h2>
          <p class="settings__hint">{tr.share.settings.persistence.hint}</p>
          <p class="settings__status" role="status">
            {persistenceMessage(settings.storagePersisted)}
          </p>
        </section>
      </div>

      <section class="settings__section" aria-labelledby="settings-backup-heading">
        <h2 id="settings-backup-heading">{tr.share.settings.backup.title}</h2>
        <p>{tr.share.settings.backup.intro}</p>

        <h3>{tr.share.settings.backup.exportTitle}</h3>
        <p class="settings__hint">{tr.share.settings.backup.exportHint}</p>
        <Field
          label={tr.share.settings.backup.passphraseLabel}
          hint={tr.share.settings.backup.passphraseHint}
          id="settings-export-passphrase"
        >
          <input
            class="text-input"
            id="settings-export-passphrase"
            type="password"
            autocomplete="new-password"
            value={exportPassphrase}
            onInput={(event) => setExportPassphrase(event.currentTarget.value)}
          />
        </Field>
        <button
          class="button button--primary"
          type="button"
          disabled={exportBusy || plan === null}
          onClick={() => void handleExport()}
        >
          {tr.share.settings.backup.export}
        </button>
        {plan === null ? (
          <p class="settings__hint">{tr.share.settings.backup.noPlanToExport}</p>
        ) : null}
        <p class="settings__status" role="status">
          {exportMessage ?? ''}
        </p>

        <h3>{tr.share.settings.backup.importTitle}</h3>
        <p class="settings__hint">{tr.share.settings.backup.importHint}</p>
        <label class="field__label" for="settings-backup-file">
          {tr.share.settings.backup.inputLabel}
        </label>
        <input
          class="text-input"
          id="settings-backup-file"
          type="file"
          accept=".json,application/json"
          disabled={importBusy}
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            const input = event.currentTarget;
            void handleFile(file);
            input.value = '';
          }}
        />

        {pending === null ? null : (
          <form
            class="settings__form"
            onSubmit={(event) => {
              event.preventDefault();
              void submitBackupPassword();
            }}
          >
            <p>{tr.share.settings.backup.passwordPrompt}</p>
            <Field label={tr.share.settings.backup.passwordLabel} id="settings-backup-password">
              <input
                class="text-input"
                id="settings-backup-password"
                type="password"
                autocomplete="off"
                value={backupPassword}
                onInput={(event) => setBackupPassword(event.currentTarget.value)}
              />
            </Field>
            <button class="button button--primary" type="submit" disabled={importBusy}>
              {tr.share.settings.backup.passwordSubmit}
            </button>
          </form>
        )}

        {preview === null ? null : (
          <div class="settings__preview">
            <dl class="settings__summary">
              <div>
                <dt>{tr.share.settings.backup.summaryMembers}</dt>
                <dd>{preview.summary.members}</dd>
              </div>
              <div>
                <dt>{tr.share.settings.backup.summaryContacts}</dt>
                <dd>{preview.summary.contacts}</dd>
              </div>
              <div>
                <dt>{tr.share.settings.backup.summaryUpdatedAt}</dt>
                <dd>{formatDate(preview.summary.updatedAt.slice(0, 10))}</dd>
              </div>
            </dl>
            <Notice tone="warning">{tr.share.settings.backup.overwriteWarning}</Notice>
            <div class="button-row">
              <button
                class="button button--primary"
                type="button"
                disabled={importBusy}
                onClick={() => void confirmImport()}
              >
                {tr.share.settings.backup.overwriteConfirm}
              </button>
              <button
                class="button button--secondary"
                type="button"
                onClick={() => setPreview(null)}
              >
                {tr.components.dialog.cancel}
              </button>
            </div>
          </div>
        )}

        {importError === null ? null : (
          <p class="field__error" role="alert">
            {importError}
          </p>
        )}
        {importDone ? (
          <Notice tone="success" live="polite">
            {tr.share.settings.backup.imported}
          </Notice>
        ) : null}
      </section>

      <section class="settings__section" aria-labelledby="settings-lock-heading">
        <h2 id="settings-lock-heading">{tr.share.settings.lock.title}</h2>
        <p>{tr.share.settings.lock.intro}</p>

        {settings.lockEnabled ? (
          <>
            <p class="settings__status">{tr.share.settings.lock.enabled}</p>
            <div class="button-row">
              <button
                class="button button--secondary"
                type="button"
                disabled={lockBusy}
                onClick={() => void handleDisableLock()}
              >
                {tr.share.settings.lock.disable}
              </button>
              <button
                class="button button--quiet"
                type="button"
                onClick={() => setForgotOpen(true)}
              >
                {tr.share.settings.lock.forgot}
              </button>
            </div>
          </>
        ) : (
          <>
            <p class="settings__status">{tr.share.settings.lock.disabled}</p>
            {/* §9.3 — açmadan önce gösterilmesi zorunlu uyarı (birebir). */}
            <Notice tone="warning">{tr.share.settings.lock.warning}</Notice>
            <Field
              label={tr.share.settings.lock.passwordLabel}
              hint={tr.share.settings.lock.passwordHint}
              id="settings-lock-passphrase"
              error={lockError ?? undefined}
            >
              <input
                class="text-input"
                id="settings-lock-passphrase"
                type="password"
                autocomplete="new-password"
                value={lockPassphrase}
                disabled={plan === null || lockBusy}
                onInput={(event) => setLockPassphrase(event.currentTarget.value)}
              />
            </Field>
            <button
              class="button button--primary"
              type="button"
              disabled={lockBusy || plan === null}
              onClick={() => void handleEnableLock()}
            >
              {tr.share.settings.lock.enable}
            </button>
            {plan === null ? (
              <p class="settings__hint">{tr.share.settings.lock.noPlanToLock}</p>
            ) : null}
          </>
        )}
        {settings.lockEnabled && lockError !== null ? (
          <p class="field__error" role="alert">
            {lockError}
          </p>
        ) : null}
      </section>

      {/* §16 — ana ekrana ekleme: tarayıcının kendi akışı kullanılır, ısrarcı
          istem gösterilmez; kısa açıklama burada durur. */}
      <section class="settings__section" aria-labelledby="settings-install-heading">
        <h2 id="settings-install-heading">{tr.shell.install.title}</h2>
        <p>{tr.shell.install.body}</p>
      </section>

      <section class="settings__section" aria-labelledby="settings-delete-heading">
        <h2 id="settings-delete-heading">{tr.share.settings.delete.title}</h2>
        <p>{tr.share.settings.delete.intro}</p>
        <button
          class="button button--secondary settings__danger"
          type="button"
          onClick={() => setDeleteOpen(true)}
        >
          {tr.share.settings.delete.button}
        </button>
        {clearError === null ? null : (
          <p class="field__error" role="alert">
            {clearError}
          </p>
        )}
        {clearDone ? (
          <Notice tone="success" live="polite">
            {tr.share.settings.delete.done}
          </Notice>
        ) : null}
      </section>

      <Dialog
        open={deleteOpen}
        title={tr.share.settings.delete.confirmTitle}
        description={tr.share.settings.delete.confirmBody}
        onClose={() => {
          if (!clearBusy) setDeleteOpen(false);
        }}
        actions={
          <>
            <button
              class="button button--secondary"
              type="button"
              disabled={clearBusy}
              onClick={() => setDeleteOpen(false)}
            >
              {tr.share.settings.delete.cancel}
            </button>
            <button
              class="button button--primary"
              type="button"
              disabled={clearBusy}
              onClick={() => void handleClearAll(() => setDeleteOpen(false))}
            >
              {tr.share.settings.delete.confirm}
            </button>
          </>
        }
      />

      <Dialog
        open={forgotOpen}
        title={tr.shell.lock.forgotTitle}
        description={tr.shell.lock.forgotBody}
        onClose={() => {
          if (!clearBusy) setForgotOpen(false);
        }}
        actions={
          <>
            <button
              class="button button--secondary"
              type="button"
              disabled={clearBusy}
              onClick={() => setForgotOpen(false)}
            >
              {tr.shell.lock.forgotCancel}
            </button>
            <button
              class="button button--primary"
              type="button"
              disabled={clearBusy}
              onClick={() => void handleClearAll(() => setForgotOpen(false))}
            >
              {tr.shell.lock.forgotConfirm}
            </button>
          </>
        }
      >
        <p>{tr.share.settings.lock.resetNote}</p>
      </Dialog>
    </div>
  );
}

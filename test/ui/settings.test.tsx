/**
 * Şartname §9.1, §9.3, §9.4, §15, §18.4-6, §18.4-7 — ayarlar sayfası.
 *
 * Ölçütler:
 * - "Büyük yazı" anahtarı (§15).
 * - Yedek: dışa aktarma (isteğe bağlı parola), içe aktarma (dosya seç, 1 MB
 *   üstü ret, özet göster, üzerine yazma onayı).
 * - Kilit: açmadan önce §9.3 uyarısı **birebir**; parola < 8 reddi; kapama;
 *   "Parolamı unuttum" yalnızca sıfırlamayı önerir ve kurtarma olmadığını söyler.
 * - "Bütün verilerimi sil": onaydan sonra `onClearAll`.
 * - Kalıcı saklama satırı (§9.1).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen, waitFor } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BACKUP_MAX_BYTES } from '../../src/config.ts';
import { formatDate, tr } from '../../src/i18n/tr.ts';
import { exportBackup } from '../../src/storage/backup.ts';
import type { Settings as SettingsRecord } from '../../src/storage/store.ts';
import { Settings, type SettingsProps } from '../../src/ui/pages/Settings.tsx';
import { buttonByName, normalizeText } from './helpers.tsx';
import { fullPlan } from './pagesFixtures.tsx';

afterEach(() => {
  vi.restoreAllMocks();
});

function makeSettings(overrides: Partial<SettingsRecord> = {}): SettingsRecord {
  return {
    largeText: false,
    lockEnabled: false,
    printPrefs: { documents: [], includeHealth: false, includeSchoolName: false },
    firstRunAccepted: true,
    visitedSteps: [],
    storagePersisted: null,
    ...overrides,
  };
}

function setup(overrides: Partial<SettingsProps> = {}) {
  const props: SettingsProps = {
    plan: fullPlan(),
    settings: makeSettings(),
    onChange: vi.fn(),
    onExportBackup: vi.fn(async () => undefined),
    onImportBackup: vi.fn(async () => undefined),
    onEnableLock: vi.fn(async () => undefined),
    onDisableLock: vi.fn(async () => undefined),
    onClearAll: vi.fn(async () => undefined),
    ...overrides,
  };
  return { props, ...render(<Settings {...props} />) };
}

function fileInput(): HTMLInputElement {
  return screen.getByLabelText(tr.share.settings.backup.inputLabel) as HTMLInputElement;
}

async function chooseFile(file: File): Promise<void> {
  fireEvent.change(fileInput(), { target: { files: [file] } });
}

describe('Settings — görünüm ve kalıcı saklama (§15, §9.1)', () => {
  it('"Büyük yazı" anahtarını ayardan okur ve değişikliği bildirir', () => {
    const { props } = setup({ settings: makeSettings({ largeText: true }) });

    const checkbox = screen.getByLabelText(tr.share.settings.display.largeText) as HTMLInputElement;
    expect(checkbox.checked).toBe(true);

    fireEvent.click(checkbox);
    expect(props.onChange).toHaveBeenCalledWith({ largeText: false });
  });

  it('kalıcı saklama verildiğinde olumlu metni gösterir', () => {
    setup({ settings: makeSettings({ storagePersisted: true }) });

    expect(screen.getByText(tr.shell.persistent.granted)).toBeTruthy();
  });

  it('kalıcı saklama verilmediğinde yedek önerisini gösterir', () => {
    setup({ settings: makeSettings({ storagePersisted: false }) });

    expect(screen.getByText(tr.shell.persistent.denied)).toBeTruthy();
  });

  it('desteklenmediğinde bunu söyler', () => {
    setup({ settings: makeSettings({ storagePersisted: null }) });

    expect(screen.getByText(tr.shell.persistent.unavailable)).toBeTruthy();
  });
});

describe('Settings — yedek dışa aktarma (§9.4)', () => {
  it('parolasız dışa aktarır', async () => {
    const { props } = setup();

    fireEvent.click(buttonByName(tr.share.settings.backup.export));

    await waitFor(() => expect(props.onExportBackup).toHaveBeenCalledWith(undefined));
    expect(await screen.findByText(tr.share.settings.backup.exportDone)).toBeTruthy();
  });

  it('isteğe bağlı parolayı dışa aktarmaya geçirir', async () => {
    const { props } = setup();

    fireEvent.input(screen.getByLabelText(tr.share.settings.backup.passphraseLabel), {
      target: { value: 'yedek-parolasi' },
    });
    fireEvent.click(buttonByName(tr.share.settings.backup.export));

    await waitFor(() => expect(props.onExportBackup).toHaveBeenCalledWith('yedek-parolasi'));
  });

  it('plan yoksa dışa aktarma düğmesi kapalıdır', () => {
    setup({ plan: null });

    expect(buttonByName(tr.share.settings.backup.export).disabled).toBe(true);
  });
});

describe('Settings — yedek içe aktarma (§9.4)', () => {
  it('dosyayı okur, özeti gösterir ve onaydan sonra içe aktarır', async () => {
    const plan = fullPlan();
    const { text } = await exportBackup(plan);
    const file = new File([text], 'ilk72-yedek.json', { type: 'application/json' });
    const { props } = setup();

    await chooseFile(file);

    expect(await screen.findByText(tr.share.settings.backup.summaryMembers)).toBeTruthy();
    const summaryText = normalizeText(document.querySelector('.settings__summary')?.textContent);
    expect(summaryText).toContain(String(plan.members.length));
    expect(summaryText).toContain(String(plan.contacts.length));
    expect(summaryText).toContain(formatDate(plan.updatedAt.slice(0, 10)));
    expect(screen.getByText(tr.share.settings.backup.overwriteWarning)).toBeTruthy();
    expect(props.onImportBackup).not.toHaveBeenCalled();

    fireEvent.click(buttonByName(tr.share.settings.backup.overwriteConfirm));

    await waitFor(() => expect(props.onImportBackup).toHaveBeenCalledWith(file, undefined));
    expect(await screen.findByText(tr.share.settings.backup.imported)).toBeTruthy();
  });

  it('1 MB üstü dosyayı reddeder ve içe aktarma çağrısı yapmaz', async () => {
    const file = new File(['{}'], 'buyuk.json', { type: 'application/json' });
    Object.defineProperty(file, 'size', { configurable: true, value: BACKUP_MAX_BYTES + 1 });
    const { props } = setup();

    await chooseFile(file);

    expect(await screen.findByText(tr.share.settings.backup.tooLarge)).toBeTruthy();
    expect(props.onImportBackup).not.toHaveBeenCalled();
  });

  it('parolalı yedeği parola isteyerek açar', async () => {
    const { text } = await exportBackup(fullPlan(), 'yedek-parolasi');
    const file = new File([text], 'ilk72-yedek.json', { type: 'application/json' });
    setup();

    await chooseFile(file);
    expect(await screen.findByText(tr.share.settings.backup.passwordPrompt)).toBeTruthy();

    const passwordInput = screen.getByLabelText(tr.share.settings.backup.passwordLabel);
    fireEvent.input(passwordInput, { target: { value: 'yanlis-parola' } });
    fireEvent.click(buttonByName(tr.share.settings.backup.passwordSubmit));
    expect(await screen.findByText(tr.error.codes['parola-yanlis-veya-bozuk'])).toBeTruthy();

    fireEvent.input(passwordInput, { target: { value: 'yedek-parolasi' } });
    fireEvent.click(buttonByName(tr.share.settings.backup.passwordSubmit));
    expect(await screen.findByText(tr.share.settings.backup.overwriteWarning)).toBeTruthy();
  }, 30_000);

  it('başka biçimdeki dosyayı Türkçe iletiyle reddeder', async () => {
    setup();

    await chooseFile(new File(['{}'], 'baska.json', { type: 'application/json' }));

    expect(await screen.findByText(tr.share.settings.backup.invalidFormat)).toBeTruthy();
  });
});

describe('Settings — uygulama kilidi (§9.3)', () => {
  it('açmadan önce zorunlu uyarıyı birebir gösterir', () => {
    setup();

    expect(
      screen.getByText(
        'Kilit, telefonunuzu başkası kullanırsa bilgilerinizi korur. Ama acil durumda parolayı hatırlamanız gerekir. Planın basılı bir kopyasını mutlaka bulundurun.',
      ),
    ).toBeTruthy();
    expect(tr.share.settings.lock.warning).toBe(
      'Kilit, telefonunuzu başkası kullanırsa bilgilerinizi korur. Ama acil durumda parolayı hatırlamanız gerekir. Planın basılı bir kopyasını mutlaka bulundurun.',
    );
  });

  it('8 karakterden kısa parolayı reddeder', async () => {
    const { props } = setup();

    fireEvent.input(screen.getByLabelText(tr.share.settings.lock.passwordLabel), {
      target: { value: 'kisa123' },
    });
    fireEvent.click(buttonByName(tr.share.settings.lock.enable));

    expect(await screen.findByText(tr.share.settings.lock.tooShort)).toBeTruthy();
    expect(props.onEnableLock).not.toHaveBeenCalled();
  });

  it('8 karakterlik parolayla kilidi açar', async () => {
    const { props } = setup();

    fireEvent.input(screen.getByLabelText(tr.share.settings.lock.passwordLabel), {
      target: { value: 'uzunparola' },
    });
    fireEvent.click(buttonByName(tr.share.settings.lock.enable));

    await waitFor(() => expect(props.onEnableLock).toHaveBeenCalledWith('uzunparola'));
  });

  it('kilit açıkken kapatma düğmesi onDisableLock çağırır', async () => {
    const { props } = setup({ settings: makeSettings({ lockEnabled: true }) });

    fireEvent.click(buttonByName(tr.share.settings.lock.disable));

    await waitFor(() => expect(props.onDisableLock).toHaveBeenCalledTimes(1));
  });

  it('"Parolamı unuttum" kurtarma olmadığını söyler ve yalnızca sıfırlamayı önerir', async () => {
    const { props } = setup({ settings: makeSettings({ lockEnabled: true }) });

    fireEvent.click(buttonByName(tr.share.settings.lock.forgot));

    expect(await screen.findByText(tr.shell.lock.forgotTitle)).toBeTruthy();
    expect(screen.getByText(tr.shell.lock.forgotBody)).toBeTruthy();
    expect(normalizeText(document.body.textContent)).toContain('sıfırdan başlamaktır');

    fireEvent.click(buttonByName(tr.shell.lock.forgotConfirm));
    await waitFor(() => expect(props.onClearAll).toHaveBeenCalledTimes(1));
  });
});

describe('Settings — bütün verileri sil (§9.4, §18.4-7)', () => {
  it('onaydan önce silmez, onaydan sonra onClearAll çağırır', async () => {
    const { props } = setup();

    fireEvent.click(buttonByName(tr.share.settings.delete.button));

    expect(await screen.findByText(tr.share.settings.delete.confirmTitle)).toBeTruthy();
    expect(props.onClearAll).not.toHaveBeenCalled();

    fireEvent.click(buttonByName(tr.share.settings.delete.confirm));

    await waitFor(() => expect(props.onClearAll).toHaveBeenCalledTimes(1));
    expect(await screen.findByText(tr.share.settings.delete.done)).toBeTruthy();
  });
});

describe('Settings — kaynak kuralları (§17)', () => {
  it('CSS import etmez ve dangerouslySetInnerHTML kullanmaz', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/ui/pages/Settings.tsx'), 'utf8');

    expect(source).not.toMatch(/from '[^']*\.css'/u);
    expect(source).not.toContain('dangerouslySetInnerHTML');
  });
});

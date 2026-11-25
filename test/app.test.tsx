/**
 * Şartname §0 kural 2, §18.1 — önce testler.
 *
 * Aşama 21.1'de iskeleti doğrulayan testler, uygulama kabuğu (`AppShell`, 21.13)
 * devreye girdiğinde güncellendi: kabuk açılışta depoyu açar, bu yüzden ilk
 * çizimde yalnızca "Yükleniyor…" görünür ve sayfa başlığı **asenkron** gelir.
 * Yönlendirici ve model sözleşmesi testleri değişmedi.
 */
import 'fake-indexeddb/auto';
import { act, fireEvent, render, screen } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  applyServiceWorkerUpdate,
  isUpdateReady,
  onServiceWorkerControlling,
  setUpdateApplier,
} from '../src/app/pwa';
import { ROUTES, WIZARD_STEP_COUNT } from '../src/config';
import { tr } from '../src/i18n/tr';
import { App } from '../src/main';
import { SCHEMA_VERSION } from '../src/model/types';
import {
  currentRoute,
  focusRouteHeading,
  type RouteId,
  resolveRoute,
  updateDocumentTitle,
} from '../src/router';
import * as storage from '../src/storage/store';

afterEach(() => vi.restoreAllMocks());

/** Kabuk açılışını bekler ve sayfa başlığını döndürür. */
const openApp = async () => {
  render(<App />);
  return screen.findByRole('heading', { level: 1 });
};

describe('uygulama kabuğu', () => {
  it('açılıştan sonra ana sayfayı ana bölge ve odaklanabilir h1 ile çizer', async () => {
    const heading = await openApp();

    expect(document.querySelector('main')).not.toBeNull();
    expect(heading.textContent).toBe(tr.pages.home.title);
    expect(heading.getAttribute('tabindex')).toBe('-1');
    expect(document.title).toBe(`${tr.nav.home} · ${tr.app.name}`);
  });

  it('içeriğe geç bağlantısı odağı ana bölgeye taşır, adresi değiştirmez', async () => {
    await openApp();

    screen.getByRole('link', { name: tr.common.skipToContent }).click();

    expect(document.activeElement?.id).toBe('main-content');
    expect(window.location.hash).not.toContain('main-content');
  });

  it('bilinmeyen yolda NotFound sayfasını gösterir', async () => {
    window.location.hash = '#/bilinmeyen';
    const heading = await openApp();

    expect(heading.textContent).toBe(tr.error.notFound.title);
  });

  it('adres değişince içeriği, belge başlığını ve odağı günceller', async () => {
    await openApp();

    act(() => {
      window.location.hash = ROUTES.emergency;
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    const heading = await screen.findByRole('heading', { level: 1 });
    expect(heading.textContent).toBe(tr.nav.emergency);
    expect(document.title).toBe(`${tr.nav.emergency} · ${tr.app.name}`);
    expect(document.activeElement).toBe(heading);
  });

  it('yazım sırasında boşluğu korur ve bir sonraki adıma adresiyle geçer', async () => {
    window.location.hash = ROUTES.plan(1);
    await openApp();
    const input = screen.getByLabelText(tr.wizard.fields.householdLabel) as HTMLInputElement;

    fireEvent.input(input, { target: { value: 'Örnek ' } });
    expect(input.value).toBe('Örnek ');
    fireEvent.input(input, { target: { value: 'Örnek aile' } });
    expect(input.value).toBe('Örnek aile');

    fireEvent.click(screen.getByRole('button', { name: tr.wizard.actions.next }));
    await screen.findByRole('heading', { name: tr.wizard.steps.members.title, level: 1 });
    expect(location.hash).toBe(ROUTES.plan(2));
  });

  it('depo yazma hatasında planı kaydedilmiş olarak göstermez', async () => {
    vi.spyOn(storage, 'flushPending').mockRejectedValueOnce(new Error('depo-degisti'));
    window.location.hash = ROUTES.plan(1);
    await openApp();
    const input = screen.getByLabelText(tr.wizard.fields.householdLabel);

    fireEvent.input(input, { target: { value: 'Bu sekmedeki plan' } });

    expect(screen.getByText(tr.components.saveStatus.saving)).toBeTruthy();
    expect(await screen.findByText(tr.shell.concurrentEdit)).toBeTruthy();
    expect(screen.queryByText(tr.components.saveStatus.saved)).toBeNull();
  });

  it('kilit ekranı parola kurtarma açıklaması ile bilgi ve acil sayfalarına erişim sunar', async () => {
    vi.spyOn(storage, 'loadPlan').mockResolvedValue({ plan: null, encrypted: true });
    const clear = vi.spyOn(storage, 'clearAllData');
    expect((await openApp()).textContent).toBe(tr.shell.lock.title);

    fireEvent.click(screen.getByRole('button', { name: tr.shell.lock.forgot }));
    expect(await screen.findByRole('dialog', { name: tr.shell.lock.forgotTitle })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: tr.shell.lock.forgotCancel }));
    expect(clear).not.toHaveBeenCalled();

    window.location.hash = ROUTES.privacy;
    expect(
      await screen.findByRole('heading', { name: tr.legal.privacy.title, level: 1 }),
    ).toBeTruthy();
    window.location.hash = ROUTES.emergency;
    expect(await screen.findByRole('heading', { name: tr.nav.emergency, level: 1 })).toBeTruthy();
    expect(document.querySelector('main a[href="tel:112"]')).not.toBeNull();
  });

  it('okunamayan planı silmeden kurtarma ekranı gösterir', async () => {
    vi.spyOn(storage, 'loadPlan').mockRejectedValue(new Error('bozuk-veri'));
    const clear = vi.spyOn(storage, 'clearAllData');

    expect((await openApp()).textContent).toBe(tr.shell.lock.storageErrorTitle);
    expect(clear).not.toHaveBeenCalled();
  });
});

describe('yönlendirici', () => {
  const knownRoutes: [string, RouteId][] = [
    [ROUTES.home, 'home'],
    [ROUTES.summary, 'summary'],
    [ROUTES.emergency, 'emergency'],
    [ROUTES.guide, 'guide'],
    [ROUTES.guidePart('once'), 'guide'],
    [ROUTES.guidePart('an'), 'guide'],
    [ROUTES.guidePart('sonra'), 'guide'],
    [ROUTES.bag, 'bag'],
    [ROUTES.print, 'print'],
    [ROUTES.share, 'share'],
    [ROUTES.settings, 'settings'],
    [ROUTES.about, 'about'],
    [ROUTES.privacy, 'privacy'],
    [ROUTES.terms, 'terms'],
    [ROUTES.imprint, 'imprint'],
    [ROUTES.accessibility, 'accessibility'],
    [ROUTES.sources, 'sources'],
  ];

  it('§11.1 tablosundaki yolları tanır', () => {
    for (const [path, id] of knownRoutes) {
      expect(resolveRoute(path).id, path).toBe(id);
    }
  });

  it('adres çubuğu boşken ana sayfaya düşer', () => {
    expect(resolveRoute('').id).toBe('home');
    expect(resolveRoute('#').id).toBe('home');
    expect(currentRoute().id).toBe('home');
  });

  it('sihirbaz adımlarını 1–9 aralığında doğrular', () => {
    expect(resolveRoute(ROUTES.plan(1)).id).toBe('plan');
    expect(resolveRoute(ROUTES.plan(WIZARD_STEP_COUNT)).id).toBe('plan');
    expect(resolveRoute(ROUTES.plan(3)).planStep).toBe(3);
    expect(resolveRoute(ROUTES.plan(0)).id).toBe('notFound');
    expect(resolveRoute(ROUTES.plan(WIZARD_STEP_COUNT + 1)).id).toBe('notFound');
    expect(resolveRoute('#/plan/uc').id).toBe('notFound');
  });

  it('rehber alt sayfalarını ve içe alma yükünü ayırır', () => {
    expect(resolveRoute(ROUTES.guidePart('an')).guidePart).toBe('an');

    const imported = resolveRoute(`${ROUTES.import}1p.AAAA`);
    expect(imported.id).toBe('import');
    expect(imported.importPayload).toBe('1p.AAAA');

    expect(resolveRoute(ROUTES.import).id).toBe('notFound');
    expect(resolveRoute('#/rehber/bilinmeyen').id).toBe('notFound');
  });

  it('bilinmeyen yolu NotFound olarak işaretler', () => {
    expect(resolveRoute('#/yok').id).toBe('notFound');
    expect(resolveRoute('#/ozet/fazla').id).toBe('notFound');
  });

  it('belge başlığını sayfa adıyla günceller', () => {
    updateDocumentTitle(resolveRoute(ROUTES.emergency));

    expect(document.title).toBe(`${tr.nav.emergency} · ${tr.app.name}`);
  });

  it('odağı sayfa h1 başlığına taşır ve tabindex yoksa ekler', () => {
    document.body.innerHTML = '<main><h1>Deneme</h1></main>';
    const pageHeading = document.querySelector('h1');

    focusRouteHeading();

    expect(document.activeElement).toBe(pageHeading);
    expect(pageHeading?.getAttribute('tabindex')).toBe('-1');
  });
});

describe('veri modeli sözleşmesi', () => {
  it('şema sürümü 1 olarak sabitlenmiştir (§8.1)', () => {
    expect(SCHEMA_VERSION).toBe(1);
  });
});

describe('hizmet çalışanı güncellemesi', () => {
  it('başka sekmenin etkinleştirdiği sürümde yerel onay ve kayıt durumunu bekler', async () => {
    const reload = vi.spyOn(window.location, 'reload').mockImplementation(() => undefined);
    const apply = vi.fn(async () => undefined);
    setUpdateApplier(apply);

    await onServiceWorkerControlling();
    expect(reload).not.toHaveBeenCalled();
    expect(isUpdateReady()).toBe(true);

    await applyServiceWorkerUpdate(() => false);
    expect(reload).not.toHaveBeenCalled();
    expect(isUpdateReady()).toBe(true);

    await applyServiceWorkerUpdate(() => true);
    expect(reload).toHaveBeenCalledOnce();
    expect(apply).not.toHaveBeenCalled();
  });
});

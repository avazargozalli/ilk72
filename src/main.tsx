/**
 * Şartname §7, §11.1, §14.5, §16, §18.1 — uygulama girişi.
 *
 * Kabuk (`src/app/AppShell.tsx`) planı, ayarları ve yönlendirmeyi yönetir;
 * bu dosya yalnızca "içeriğe geç" bağlantısını, kabuğu ve §14.5 alt bilgisini
 * bir araya getirir.
 *
 * Hizmet çalışanı **yalnızca üretim derlemesinde** kaydedilir (§16). Güncelleme
 * akışı `registerSW` üzerinden yürür: yeni sürüm hazır olduğunda kabuğa
 * `ilk72:update-ready` olayı duyurulur ve sayfa **kullanıcı onayı olmadan
 * yenilenmez** — form doldururken veri kaybını önlemek için (§16).
 */

import { registerSW } from 'virtual:pwa-register';
import { render } from 'preact';
import { AppShell } from './app/AppShell.tsx';
import { announceUpdateReady, onServiceWorkerControlling, setUpdateApplier } from './app/pwa.ts';
import { tr } from './i18n/tr.ts';
import { Footer } from './ui/components/Footer.tsx';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/pages.css';
import './styles/print.css';

export function App() {
  return (
    <>
      {/* biome-ignore lint/a11y/useValidAnchor: '#' tabanlı yönlendirici yüzünden "İçeriğe geç" bağlantısı adresi değiştirmeden odağı taşır (§15). */}
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('main-content')?.focus();
        }}
      >
        {tr.common.skipToContent}
      </a>
      <AppShell />
      {/* §14.5, İ5, §18.4-8: alt bilgi her sayfada bulunur. */}
      <Footer />
    </>
  );
}

function registerServiceWorker(): void {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  setUpdateApplier(
    registerSW({
      immediate: true,
      onNeedRefresh() {
        // §16 — kullanıcı onaylamadan sayfa yenilenmez.
        announceUpdateReady();
      },
      onNeedReload() {
        void onServiceWorkerControlling();
      },
    }),
  );
}

export function bootstrap(container: HTMLElement): void {
  render(<App />, container);
  if (import.meta.env.PROD) registerServiceWorker();
}

if (typeof document !== 'undefined') {
  const container = document.getElementById('app');
  if (container) bootstrap(container);
}

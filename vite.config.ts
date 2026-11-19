/**
 * Şartname §4.3, §6, §16 — Vite yapılandırması.
 *
 * `base: './'` tek yerde durur: GitHub Pages, alt dizin ya da yerel önizleme
 * fark etmeksizin bütün varlıklar göreli yollarla yüklenir. Çalışma zamanı
 * önbelleği (runtimeCaching) bilinçli olarak yoktur; uygulama dış istek
 * yapmadığı için gerekmez (§16).
 */
import preact from '@preact/preset-vite';
import { defineConfig, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { tr } from './src/i18n/tr.ts';

/**
 * Geliştirme sunucusunda Vite satır içi stil enjekte ettiği ve HMR için
 * WebSocket açtığı için CSP iki yönerge bakımından geçici olarak gevşetilir.
 * Yalnızca `serve` modunda çalışır; üretim derlemesinde meta olduğu gibi kalır
 * (§17, K-5 ve K-12).
 */
function devCspPlugin(): Plugin {
  return {
    name: 'ilk72-dev-csp',
    apply: 'serve',
    transformIndexHtml(html) {
      return html
        .replace("style-src 'self'", "style-src 'self' 'unsafe-inline'")
        .replace("connect-src 'none'", "connect-src 'self' ws://localhost:* ws://127.0.0.1:*");
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [
    preact(),
    devCspPlugin(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      manifest: {
        name: tr.app.name,
        short_name: tr.app.name,
        description: tr.app.description,
        lang: 'tr',
        display: 'standalone',
        start_url: './',
        scope: './',
        // Renkler `src/styles/tokens.css` ile aynı olmalı (§15); manifest CSS
        // okuyamadığı için burada yalnızca açık tema değerleri yinelenir.
        background_color: '#f7f7f5',
        theme_color: '#f7f7f5',
      },
      workbox: {
        // `manifest.webmanifest` eklenti tarafından ayrıca ön belleğe alınır;
        // burada tekrarlanmaz (§16).
        globPatterns: ['**/*.{html,js,css,svg,png,ico,json}'],
        navigateFallback: 'index.html',
        runtimeCaching: [],
      },
    }),
  ],
  build: {
    sourcemap: false,
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: true,
  },
});

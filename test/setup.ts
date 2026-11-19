/**
 * Şartname §18 — test ortamı hazırlığı (happy-dom).
 *
 * Her testten önce temiz bir sayfa ve boş tarayıcı deposu bırakır; her testten
 * sonra DOM'u ve depoyu temizler. Tarayıcıda var olan ama happy-dom'un
 * sağlamadığı globaller yalnızca eksikse doldurulur (§6'daki tarayıcı
 * yerleşikleri: Web Crypto, CompressionStream).
 */
import { webcrypto } from 'node:crypto';
import {
  CompressionStream as NodeCompressionStream,
  DecompressionStream as NodeDecompressionStream,
} from 'node:stream/web';
import { cleanup } from '@testing-library/preact';
import { afterEach, beforeEach } from 'vitest';

function installMissingBrowserGlobals(): void {
  if (typeof globalThis.crypto === 'undefined' || typeof globalThis.crypto.subtle === 'undefined') {
    Object.defineProperty(globalThis, 'crypto', { configurable: true, value: webcrypto });
  }

  if (typeof globalThis.CompressionStream === 'undefined') {
    Object.defineProperty(globalThis, 'CompressionStream', {
      configurable: true,
      writable: true,
      value: NodeCompressionStream,
    });
  }

  if (typeof globalThis.DecompressionStream === 'undefined') {
    Object.defineProperty(globalThis, 'DecompressionStream', {
      configurable: true,
      writable: true,
      value: NodeDecompressionStream,
    });
  }

  if (typeof window.matchMedia !== 'function') {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: (query: string) =>
        ({
          matches: false,
          media: query,
          onchange: null,
          addEventListener: () => undefined,
          removeEventListener: () => undefined,
          addListener: () => undefined,
          removeListener: () => undefined,
          dispatchEvent: () => false,
        }) as unknown as MediaQueryList,
    });
  }
}

installMissingBrowserGlobals();

beforeEach(() => {
  window.history.replaceState(null, '', '/');
  document.title = '';
  document.body.innerHTML = '';
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  document.body.innerHTML = '';
});

/**
 * Şartname §0 kural 7, §14, §15 — kullanıcıya görünen bütün metinlerin tek
 * giriş noktası. Kod içi adlar İngilizce; bu dosyanın dışında sabit Türkçe
 * metin gömülmez.
 *
 * Yapı (aşama 21.6): `tr.ts` yalnızca **toplayıcıdır**. Metinler alt
 * modüllerde durur:
 *
 * | Dosya | `tr` altındaki yeri | Sahibi |
 * |---|---|---|
 * | `common.ts` | `tr.app` dışında `tr.nav`, `tr.common`, `tr.error` (yayılır) | ui-dev |
 * | `components.ts` | `tr.components` (yayılır) | ui-dev |
 * | `wizard.ts` | `tr.wizard` | wizard-dev |
 * | `pages.ts` | `tr.pages` | pages-dev |
 * | `print.ts` | `tr.print` | print-dev |
 * | `share.ts` | `tr.share` | share-ui-dev |
 * | `legal.ts` | `tr.legal` | docs-dev |
 *
 * **Korunan sözleşme:** `tr.app.name` (`vite.config.ts` PWA manifesti),
 * `tr.app.description`, `tr.nav.*` ve `tr.error.notFound.*` (`router.ts`)
 * silinemez ya da yeniden adlandırılamaz.
 */
import { APP_NAME } from '../config.ts';
import { common } from './common.ts';
import { components } from './components.ts';
import { legal } from './legal.ts';
import { pages } from './pages.ts';
import { print } from './print.ts';
import { share } from './share.ts';
import { shell } from './shell.ts';
import { wizard } from './wizard.ts';

export type { TextParams } from './format.ts';
export { formatDate, formatText } from './format.ts';

export const tr = {
  app: {
    name: APP_NAME,
    description: 'Aile afet ve acil durum planı; çevrimdışı çalışır, hesap gerektirmez.',
    tagline: 'Aile afet ve acil durum planı',
    privacyNote: 'Yazdıklarınız yalnızca bu cihazda saklanır; bize ya da başkasına gönderilmez.',
  },
  ...common,
  ...components,
  wizard,
  pages,
  print,
  share,
  legal,
  shell,
} as const;

export type ErrorCode = keyof typeof tr.error.codes;

const isErrorCode = (code: string): code is ErrorCode => Object.hasOwn(tr.error.codes, code);

/** Ek B.3'teki hata kodu → Türkçe ileti; bilinmeyen kodda genel ileti döner. */
export function errorMessage(code: string): string {
  return isErrorCode(code) ? tr.error.codes[code] : tr.error.generic;
}

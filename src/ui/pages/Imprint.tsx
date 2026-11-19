/**
 * Şartname §11.1, §14.3 — Künye ve İletişim (`#/kunye`).
 * Metin `src/i18n/legal.ts` içinde §14.3'e birebir uygundur.
 */
import { tr } from '../../i18n/tr.ts';
import { LegalPageView } from './legal/LegalPageView.tsx';

export function Imprint() {
  return <LegalPageView page={tr.legal.imprint} />;
}

/**
 * Şartname §11.1, §14.4 — Erişilebilirlik Beyanı (`#/erisilebilirlik`).
 * Metin `src/i18n/legal.ts` içinde §14.4'e birebir uygundur; beyan gönüllüdür
 * ve resmî bir erişilebilirlik belgesi anlamına gelmez (§4.1 satır 16).
 */
import { tr } from '../../i18n/tr.ts';
import { LegalPageView } from './legal/LegalPageView.tsx';

export function Accessibility() {
  return <LegalPageView page={tr.legal.accessibility} />;
}

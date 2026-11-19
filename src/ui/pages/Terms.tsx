/**
 * Şartname §11.1, §14.2 — Kullanım Koşulları ve Sorumluluk Reddi (`#/kosullar`).
 * Metin `src/i18n/legal.ts` içinde §14.2'ye birebir uygundur.
 */
import { tr } from '../../i18n/tr.ts';
import { LegalPageView } from './legal/LegalPageView.tsx';

export function Terms() {
  return <LegalPageView page={tr.legal.terms} />;
}

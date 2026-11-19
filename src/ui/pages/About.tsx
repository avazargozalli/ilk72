/**
 * Şartname §11.1, §20 — "Hakkında" sayfası (`#/hakkinda`).
 *
 * Metin `src/i18n/legal.ts` içindedir; bu sayfa yalnız çizer. İlkeler ve
 * "ne değildir" bölümleri §20'deki README başlıklarıyla aynı kaynaktan gelir;
 * hiçbir kurum adı, logosu ya da kurumsal rengi kullanılmaz (İ5).
 */
import { tr } from '../../i18n/tr.ts';
import { LegalPageView } from './legal/LegalPageView.tsx';

export function About() {
  return <LegalPageView page={tr.legal.about} />;
}

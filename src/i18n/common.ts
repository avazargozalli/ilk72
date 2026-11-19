/**
 * Şartname §0 kural 7, §11.1, §14.5, Ek B.3 — ortak arayüz metinleri.
 *
 * Bu dosya `tr.ts` içine **yayılarak** girer; dışa aktarılan nesnenin anahtarları
 * `tr` kökünde görünür: `tr.nav.*`, `tr.common.*`, `tr.error.*`.
 *
 * - `nav`: §11.1 yol tablosu ve alt bilgi bağlantıları. `router.ts` ve
 *   `vite.config.ts` bu anahtarları doğrudan okur; **silinemez/yeniden
 *   adlandırılamaz**.
 * - `common`: her sayfada yeniden kullanılan kısa metinler.
 * - `error`: genel hata iletisi, NotFound ve Ek B.3 hata kodu karşılıkları.
 *
 * Başka ajanlar bu dosyaya metin eklemez; kendi modüllerini
 * (`wizard.ts`, `pages.ts`, `print.ts`, `share.ts`, `legal.ts`) doldurur.
 */

const nav = {
  home: 'Ana sayfa',
  plan: 'Plan',
  summary: 'Özet',
  emergency: 'Acil durum',
  guide: 'Rehber',
  bag: 'Çanta',
  print: 'Yazdır',
  share: 'Paylaş',
  import: 'Plan özetini aç',
  settings: 'Ayarlar',
  about: 'Hakkında',
  privacy: 'Gizlilik',
  terms: 'Koşullar',
  imprint: 'Künye',
  accessibility: 'Erişilebilirlik',
  sources: 'Kaynaklar',
  notFound: 'Sayfa bulunamadı',
} as const;

const commonText = {
  skipToContent: 'İçeriğe geç',
  backHome: 'Ana sayfaya dön',
  comingSoon: 'Bu sayfa yakında tamamlanacak.',
} as const;

const error = {
  generic: 'Bir sorun oldu. Lütfen yeniden deneyin.',
  notFound: {
    title: 'Sayfa bulunamadı',
    body: 'Aradığınız sayfa bulunamadı. Bağlantı eski ya da yanlış olabilir.',
  },
  /** Ek B.3 — hata kodu → kullanıcıya görünen Türkçe ileti (birebir). */
  codes: {
    'gecersiz-baglanti': 'Bu bağlantı geçerli bir plan özeti değil.',
    'bozuk-veri': 'Bağlantı eksik ya da bozulmuş. Gönderenden yeniden isteyin.',
    'cok-buyuk': 'Bu bağlantı açılamayacak kadar büyük.',
    'parola-gerekli': 'Bu özet parolayla korunuyor.',
    'parola-yanlis-veya-bozuk': 'Parola yanlış ya da bağlantı bozulmuş.',
  },
} as const;

/** `tr` köküne yayılan grup: `nav`, `common`, `error`. */
export const common = { nav, common: commonText, error } as const;

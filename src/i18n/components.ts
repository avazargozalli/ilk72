/**
 * Şartname §0 kural 7, §11.2, §14.5, §15 — ortak arayüz bileşenlerinin metinleri.
 *
 * Bu dosya `tr.ts` içine **yayılarak** girer; anahtarları `tr.components.*`
 * altında görünür. Bütün bileşenler metinlerini buradan okur; bileşen
 * dosyalarına sabit Türkçe metin yazılmaz (bkz. `test/ui`).
 *
 * Sayaç/tarih içeren metinler `{...}` yer tutucularıyla yazılır ve
 * `formatText`/`formatDate` ile doldurulur (`./format.ts`).
 */

const componentsText = {
  /** `Field` — zorunlu alan işareti metinle verilir (renkle değil, §15). */
  field: {
    required: '(zorunlu)',
  },

  /** `TextInput` / `PhoneInput` — kullanıcıya gösterilen ayrı metin yok. */

  /** `Repeater` — tekrarlı alanların ekran okuyucu adlandırması (§15). */
  repeater: {
    /** "Kişi 2 / 4" */
    itemLabel: '{name} {index} / {total}',
    /** "Kişi ekle" */
    add: '{name} ekle',
    remove: 'Sil',
    /** Sil düğmesinin erişilebilir adı: "Kişi 2 / 4: Sil" */
    removeItem: '{item}: {action}',
  },

  /** `Notice` — renk dışında simge + metin; ton adı ekran okuyucuya yazılır. */
  notice: {
    toneLabels: {
      info: 'Bilgi',
      warning: 'Uyarı',
      success: 'Tamam',
      error: 'Hata',
    },
  },

  /** `Stepper` — "3 / 9" (başlık ayrı gelir, §11.4). */
  stepper: {
    position: '{step} / {total}',
  },

  /** `SourceLink` — kaynak adı + erişim tarihi; yeni sekme bildirilir. */
  sourceLink: {
    newTab: 'yeni sekmede açılır',
    accessedAt: 'Erişim tarihi: {date}',
    unverified: 'Kaynak doğrulanmadı',
  },

  /** `Dialog` — iletişim kutusu düğmeleri (§15 odak hapsi, `Esc`). */
  dialog: {
    close: 'Kapat',
    cancel: 'İptal',
    confirm: 'Onayla',
  },

  /** `ErrorSummary` — hata sayısı ve ilk hataya odaklanan bağlantılar (§15). */
  errorSummary: {
    title: '{count} hata var. Lütfen işaretli alanları düzeltin.',
  },

  /** `SaveStatus` — otomatik kayıt durumu, `aria-live="polite"` (§11.4). */
  saveStatus: {
    saved: 'Kaydedildi',
    saving: 'Kaydediliyor…',
    error: 'Kaydedilemedi',
  },

  /** `Footer` — §14.5 metni **birebir**; bağlantı adları `tr.nav.*`'dan gelir. */
  footer: {
    independence: 'Bağımsız bir açık kaynak projesidir; resmî bir kurum uygulaması değildir.',
    emergencyNote: 'Acil durumda 112.',
    navLabel: 'Bilgi ve yasal bağlantılar',
  },

  /** `FirstRunNotice` — §11.2 ilk açılış kutusu, metin **birebir**. */
  firstRun: {
    title: 'Başlamadan önce',
    regionLabel: 'İlk açılış bilgilendirmesi',
    items: [
      'Bu, bağımsız bir açık kaynak projesidir; resmî bir kurum uygulaması değildir.',
      "Acil durumda 112'yi arayın. Bu uygulama yardım çağırmaz.",
      'Planınız bu tarayıcıda saklanır. Uygulama planınızı kendiliğinden göndermez.',
      'Tavsiyeler resmî kaynaklara dayanır ama onların yerini tutmaz.',
    ],
    termsLink: 'Kullanım koşulları',
    privacyLink: 'Gizlilik bildirimi',
    accept: 'Anladım, başla',
  },
} as const;

/** `tr` köküne yayılan grup: `tr.components.*`. */
export const components = { components: componentsText } as const;

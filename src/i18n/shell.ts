/**
 * Şartname §9.2, §9.3, §11.2 — uygulama kabuğunun kendi metinleri.
 *
 * Sihirbaz, sayfalar, çıktılar ve hukuki metinler kendi i18n dosyalarında
 * durur; burada yalnızca **kabuk** düzeyindeki metinler vardır: açılış
 * (depo hazırlanıyor), kilit ekranı (§9.3), bellek içi kip uyarısı (§9.2) ve
 * kaydetme hatası.
 */

export const shell = {
  draft: 'Taslak sürüm · Rehber içeriği henüz uzman onayından geçmedi.',
  navigation: 'Ana menü',
  booting: 'Yükleniyor…',

  /** §9.2 — depo açılamadığında kalıcı uyarı (birebir metin). */
  memoryMode:
    'Bu tarayıcı oturumunda planınız kaydedilemiyor. Sayfayı kapatmadan önce yazdırın ya da yedek dosyası indirin.',

  /** §9.3 — kilit ekranı. */
  lock: {
    title: 'Planınız kilitli',
    intro: 'Planınız bu cihazda şifreli saklanıyor. Açmak için parolanızı yazın.',
    passwordLabel: 'Parola',
    submit: 'Planı aç',
    wrongPassword: 'Parola yanlış. Verileriniz silinmedi; yeniden deneyebilirsiniz.',
    forgot: 'Parolamı unuttum',
    forgotTitle: 'Parola kurtarılamaz',
    forgotBody:
      'Parola yalnızca bu cihazda, bellekte tutulur ve hiçbir yere kaydedilmez. Parolayı hatırlamıyorsanız plan açılamaz. Tek yol, planı silip sıfırdan başlamaktır.',
    forgotCancel: 'Vazgeç',
    forgotConfirm: 'Planı sil ve sıfırdan başla',
    emergencyHint: 'Acil durumda 112’yi parola olmadan arayabilirsiniz:',
  },

  /** Otomatik kayıt hatası (§11.4). */
  saveError: 'Plan kaydedilemedi. Yazdırmayı ya da yedek dosyası indirmeyi deneyin.',

  /** Plan yokken plan gerektiren sayfaların gösterdiği yönlendirme (§11.3). */
  noPlan: {
    text: 'Bu sayfa için önce planınızı hazırlamanız gerekiyor.',
    action: 'Planı hazırlamaya başla',
  },

  /** Yedek dosyası okunamadığında. */
  backupError: 'Yedek dosyası okunamadı. Dosyanın bozulmadığından emin olun.',

  /** §16 — çevrimdışı çalışma bildirimleri. */
  pwa: {
    offline: 'Çevrimdışı — planınız kullanılabilir',
    updateReady: 'Yeni sürüm hazır.',
    updateAction: 'Yenile',
  },

  /** §16 — "Ana ekrana nasıl eklenir?" kısa açıklaması (ayarlar sayfasında). */
  install: {
    title: 'Ana ekrana nasıl eklenir?',
    body: 'Telefonunuzda tarayıcı menüsünden "Ana ekrana ekle" seçeneğini kullanın. Bilgisayarda adres çubuğundaki kur simgesine tıklayın. Uygulama kurulduktan sonra internet olmadan da açılır.',
  },

  /** §9.1 — kalıcı depolama izni sonucu. */
  persistent: {
    granted: 'Tarayıcı, planınızı kalıcı olarak saklamayı kabul etti.',
    denied:
      'Tarayıcı kalıcı saklama izni vermedi. Yedek dosyası ve basılı kopya bu yüzden önemlidir.',
    unavailable: 'Bu tarayıcı kalıcı saklama iznini desteklemiyor.',
  },
} as const;

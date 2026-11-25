/**
 * Şartname §10.1, §10.2, §10.3, §12, §6 — paylaşım, içe alma ve takvim
 * hatırlatmasının bütün arayüz metinleri. `tr.ts` bu nesneyi `tr.share` olarak
 * birleştirir (sarmalanmış değil, doğrudan içerik):
 *
 * ```ts
 * tr.share.card.title, tr.share.import…, tr.share.calendar.summary
 * ```
 *
 * Uyarılar şartnameden **birebir** alınmıştır (§4.1 satır 1, §10.1, §10.2,
 * §10.3); anlamını değiştirme. Ek B.3 hata kodu karşılıkları `common.ts`
 * içindeki `tr.error.codes` altındadır; burada tekrarlanmaz.
 *
 * `calendar.summary` ve `calendar.description` **normatiftir** (Ek B.2):
 * `src/output/ics.ts` takvim dosyasını bunlarla üretir ve
 * `test/output/ics.test.ts` bayt eşitliğini bu metinlerle doğrular.
 */
export const share = {
  title: 'Planı paylaş',
  intro:
    'Planınızın bir özetini bağlantı ya da kare kodla aile üyelerinize gönderebilirsiniz. Tam plan paylaşılmaz.',
  warning:
    'Bu bilgileri yalnızca aileniz ve güvendiğiniz kişilerle paylaşın; adı geçen kişilere haber verin.',
  unsupported:
    'Tarayıcınız bu özelliği desteklemiyor; planı yazdırabilir ya da yedek dosyası indirebilirsiniz.',
  card: {
    title: 'Özet kartta neler var?',
    contents:
      'Kartta hane etiketi, kişilerin adı ve telefonu, acil kişiler, buluşma yerleri ve notunuz yer alır.',
    excluded:
      'Formdaki ev adresi ve sağlık alanları karta girmez. Özel ihtiyaç notu yalnızca aşağıdaki kutuyu işaretlerseniz eklenir.',
    freeTextWarning:
      'Paylaşmadan önce hane etiketini, buluşma tariflerini ve notları kontrol edin. Bu alanlara yazdığınız adres, okul adı veya sağlık bilgileri de özete girebilir. Bağlantının ve kare kodun kopyaları alıcılarda kalabilir.',
  },
  options: {
    title: 'Kart seçenekleri',
    includeNeedsNotes: 'Özel ihtiyaç notlarını da ekle',
    includeNeedsNotesWarning:
      'Bu notlar sağlık bilgisi içerebilir. Bağlantıyı gören herkes okuyabilir. Parola koymanızı öneririz.',
  },
  password: {
    legend: 'Parola (isteğe bağlı)',
    label: 'Parola',
    hint: 'Parola koyarsanız özeti yalnızca parolayı bilenler açabilir. Parolayı başka bir yolla iletin.',
  },
  link: {
    title: 'Bağlantı',
    label: 'Paylaşım bağlantısı',
    copy: 'Bağlantıyı kopyala',
    copied: 'Bağlantı kopyalandı.',
    copyFailed: 'Bağlantı kopyalanamadı. Bağlantıyı seçip elle kopyalayın.',
  },
  qr: {
    title: 'Kare kod',
    label: 'Plan özetini açan kare kod. Telefonunuzun kamerasıyla okutabilirsiniz.',
    hint: 'Kare kodu telefonunuzun kamerasıyla okutun.',
    tooLong: 'Bilgiler kare kod için fazla uzun. Notları kısaltın ya da yedek dosyasıyla paylaşın.',
  },
  systemShare: {
    label: 'Bağlantıyı paylaş',
    action: 'Paylaş',
    failed: 'Paylaşım penceresi açılamadı. Bağlantıyı kopyalayabilirsiniz.',
  },
  send: {
    generate: 'Bağlantı oluştur',
    working: 'Bağlantı hazırlanıyor…',
    error: 'Bağlantı oluşturulamadı. Lütfen yeniden deneyin.',
    tooLong: 'Özet bağlantı için fazla büyük. Metinleri kısaltın veya yedek dosyasıyla paylaşın.',
  },
  receive: {
    title: 'Gönderilen plan özeti',
    intro: 'Size bir aile afet planı özeti gönderildi. Göndereni tanıyorsanız kullanın.',
    passwordPrompt: 'Bu özet parolayla korunuyor. Parolayı girin.',
    passwordLabel: 'Parola',
    passwordHint: 'Parolayı gönderen kişiden isteyin.',
    submit: 'Özeti aç',
    viewOnly: 'Yalnızca görüntüle ve yazdır',
    merge: 'Kendi planıma ekle',
    mergeHint:
      'Kişiler, acil kişiler ve buluşma yerleri planınıza eklenir. Çakışan alanlarda size sorulur; hiçbir alan sorulmadan değiştirilmez.',
    cleared: 'Bağlantı adres çubuğundan silindi.',
    errorTitle: 'Bağlantı açılamadı',
    cardTitle: 'Özet kart',
    empty: 'Yazılmadı',
    loading: 'Özet açılıyor…',
    modeLegend: 'Ne yapmak istersiniz?',
    print: 'Yazdır',
    finish: 'Bitir',
    mergeApply: 'Seçilen bilgileri planıma ekle',
    mergeDone: 'Gönderilen bilgiler planınıza eklendi.',
    mergeFailed: 'Gönderilen bilgiler kaydedilemedi. Önizlemedeki bilgiler korunuyor.',
    mergeLimit: 'Plandaki kişi sınırı nedeniyle {count} yeni kişi kaydı eklenemeyecek.',
    done: 'İşlem tamamlandı. Bağlantı adres çubuğundan silindi.',
    noPlanNote:
      'Kendi planınıza eklemek için önce bir plan hazırlamanız gerekir. Şimdilik yalnızca görüntüleyebilirsiniz.',
    conflict: {
      title: 'Çakışan bilgiler var',
      hint: 'Hangi bilginin kullanılacağını seçin. Siz seçmeden hiçbir alan değiştirilmez.',
      keep: 'Mevcut planımdaki bilgiyi koru',
      take: 'Gönderilen bilgiyi kullan',
      currentLabel: 'Şu anki bilgi',
      incomingLabel: 'Gönderilen bilgi',
      yes: 'Evet',
      no: 'Hayır',
    },
    fields: {
      household: 'Hane',
      updated: 'Güncelleme tarihi',
      members: 'Kişiler',
      contacts: 'Acil kişiler',
      meeting: 'Buluşma yerleri',
      nearHome: 'Evin yakını',
      neighborhood: 'Mahallede',
      outOfArea: 'Şehir dışı',
      assemblyArea: 'Toplanma alanı',
      notes: 'Not',
      needsNote: 'Özel ihtiyaç notu',
      phone: 'Telefon',
      city: 'Şehir',
      outOfAreaFlag: 'Şehir dışı irtibat kişisi',
    },
  },
  settings: {
    title: 'Ayarlar',
    intro: 'Bu sayfadaki ayarlar yalnızca bu cihazda saklanır.',
    display: {
      title: 'Görünüm',
      largeText: 'Büyük yazı',
      largeTextHint: 'Metinleri daha büyük gösterir; küçük ekranda okumayı kolaylaştırır.',
    },
    persistence: {
      title: 'Kalıcı saklama',
      hint: 'Tarayıcıdan planınızı silmemesini istemek için kullanılan izin.',
    },
    backup: {
      title: 'Yedek dosyası',
      intro:
        'Yedek dosyasını bu cihazda saklayabilir ya da başka bir cihaza taşıyabilirsiniz. Yedek, planınızın tam kopyasıdır.',
      exportTitle: 'Yedek dosyasını indir',
      exportHint:
        'İsteğe bağlı olarak bir parola koyabilirsiniz. Parolayı unutursanız yedek açılamaz.',
      passphraseLabel: 'Yedek parolası (isteğe bağlı)',
      passphraseHint: 'Parola koymazsanız dosyayı bulan herkes okuyabilir.',
      export: 'Yedek dosyasını indir',
      exportDone: 'Yedek dosyası hazırlandı.',
      exportFailed: 'Yedek dosyası oluşturulamadı. Lütfen yeniden deneyin.',
      importTitle: 'Yedekten geri yükle',
      importHint: 'Bir yedek dosyası seçin. Dosya en çok 1 MB olabilir.',
      inputLabel: 'Yedek dosyasını seç',
      tooLarge: 'Yedek dosyası en çok 1 MB olabilir. Daha küçük bir dosya seçin.',
      readFailed: 'Dosya okunamadı. Lütfen yeniden deneyin.',
      invalidFormat: 'Bu dosya bir İlk 72 yedek dosyası değil.',
      unsupportedVersion: 'Bu yedek dosyası bu sürümle açılamıyor.',
      passwordPrompt: 'Bu yedek parolayla korunuyor. Parolayı girin.',
      passwordLabel: 'Yedek parolası',
      passwordSubmit: 'Yedeği aç',
      summaryMembers: 'Kişi sayısı',
      summaryContacts: 'Acil kişi sayısı',
      summaryUpdatedAt: 'Son güncelleme',
      overwriteWarning:
        'İçe aktarma mevcut planınızın üzerine yazacak. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?',
      overwriteConfirm: 'Üzerine yaz ve içe aktar',
      imported: 'Yedek içe aktarıldı.',
      saveFailed: 'Yedek tarayıcıya kaydedilemedi. Mevcut planınız korunuyor.',
      noPlanToExport: 'Dışa aktarılacak bir plan yok. Önce planınızı hazırlayın.',
    },
    lock: {
      title: 'Uygulama kilidi',
      intro: 'Kilit isteğe bağlıdır ve varsayılan olarak kapalıdır.',
      warning:
        'Kilit, telefonunuzu başkası kullanırsa bilgilerinizi korur. Ama acil durumda parolayı hatırlamanız gerekir. Planın basılı bir kopyasını mutlaka bulundurun.',
      passwordLabel: 'Parola',
      passwordHint: 'En az 8 karakter. Kolay tahmin edilen bir şey seçmeyin.',
      enable: 'Kilidi etkinleştir',
      disable: 'Kilidi kapat',
      enabled: 'Kilit açık. Plan bu cihazda şifreli saklanıyor.',
      disabled: 'Kilit kapalı. Plan bu cihazda şifrelenmeden saklanıyor.',
      tooShort: 'Parola en az 8 karakter olmalı.',
      enableFailed: 'Kilit açılamadı. Lütfen yeniden deneyin.',
      noPlanToLock: 'Kilidi etkinleştirmek için önce bir plan hazırlayın.',
      disableFailed: 'Kilit kapatılamadı. Lütfen yeniden deneyin.',
      forgot: 'Parolamı unuttum',
      resetNote: 'Parola kurtarılamaz. Tek yol, planı silip sıfırdan başlamaktır.',
    },
    delete: {
      title: 'Bütün verilerimi sil',
      intro: 'Plan, ayarlar ve cihazdaki bütün uygulama verileri silinir. Bu işlem geri alınamaz.',
      button: 'Bütün verilerimi sil',
      confirmTitle: 'Bütün veriler silinsin mi?',
      confirmBody:
        'Bu tarayıcıdaki İlk 72 planı ve ayarları silinecek. Eski plan görünüyorsa diğer İlk 72 sekmelerini kapatın veya yenileyin. İndirdiğiniz dosyalar, basılı kopyalar ve paylaştığınız bağlantılar bu işlemden etkilenmez.',
      confirm: 'Evet, bütün verilerimi sil',
      cancel: 'Vazgeç',
      done: 'Bütün veriler silindi.',
      failed: 'Veriler silinemedi. Lütfen yeniden deneyin.',
    },
  },
  calendar: {
    title: 'Takvim hatırlatması',
    summary: 'Aile afet planını gözden geçir',
    description:
      'Çantadaki su, gıda ve ilaçların tarihlerini kontrol edin; telefon numaralarını güncelleyin; buluşma yerlerini ailece tekrar edin.\nPlanınız: cihazınızdaki İlk 72 uygulaması.',
    download: 'Takvimime ekle',
    note: 'Takvim dosyasında ad, telefon, adres veya sağlık bilgisi yer almaz.',
    missingDate: 'Önce bir sonraki gözden geçirme tarihini yazın.',
  },
} as const;

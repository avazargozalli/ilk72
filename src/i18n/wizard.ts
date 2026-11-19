/**
 * Şartname §11.4, §11.5, §11.6 — sihirbazın bütün metinleri.
 *
 * `tr.ts` bu nesneyi `tr.wizard` olarak birleştirir; biçim sarmalanmış
 * **değil**, doğrudan içeriktir. Sihirbaz bileşenleri sabit Türkçe metin
 * taşımaz (§0 kural 7); her metin buradan gelir.
 *
 * - `steps`: dokuz adımın başlığı ve bir cümlelik "neden" açıklaması (§11.4).
 * - `fields` / `headers`: alan ve bölüm etiketleri.
 * - `options`: seçenek metinleri (grup, yer türü, sigorta yanıtı).
 * - `hints`: alan altındaki kısa açıklamalar.
 * - `notices`: §11.5'te birebir verilen bilgilendirme ve uyarı metinleri.
 * - `errors`: alan doğrulama iletileri; sınırlar `PLAN_LIMITS`'ten gelir ({max}).
 * - `roles`: §11.5/7'deki yedi görevin adları.
 * - `sources`: kaynak bağlantısı etiketleri (`SourceLink`, §13.1).
 *
 * Kapsam dışı bilinçli olarak: toplanma alanı verisi, tavsiye cümlesi, sağlık
 * yorumu. Sihirbaz yalnızca kullanıcının yazdığını toplar ve yerini gösterir.
 */

export const wizard = {
  /** §11.5 tablosundaki dokuz adım; anahtar sırası adım sırasıdır. */
  steps: {
    household: {
      title: 'Haneniz',
      why: 'Hane bilgileri, planın kimin için hazırlandığını ve evinizin nerede olduğunu gösterir.',
    },
    members: {
      title: 'Kişiler',
      why: 'Evde kimin yaşadığını bilmek, afet sonrası herkesin nerede olduğunu ve kimin kime ulaşacağını planlamayı kolaylaştırır.',
    },
    needs: {
      title: 'Özel ihtiyaçlar',
      why: 'Özel ihtiyaçları önceden yazmak, desteğe ihtiyacı olan kişilerin afet anında gözden kaçmamasını sağlar.',
    },
    contacts: {
      title: 'Acil kişiler',
      why: 'Acil durumda aranacak kişileri önceden belirlemek, telefonlar çalışmadığında kimin kimi arayacağını kolaylaştırır.',
    },
    meeting: {
      title: 'Buluşma yerleri',
      why: 'Buluşma yerlerini önceden kararlaştırmak, afet sonrası birbirinizi bulmayı kolaylaştırır.',
    },
    home: {
      title: 'Eviniz',
      why: 'Evinizdeki güvenli yerleri ve vana, şalter gibi noktaları bilmek, sarsıntı sırasında ve sonrasında ne yapacağınızı netleştirir.',
    },
    roles: {
      title: 'Görevler',
      why: 'Görevleri önceden paylaşmak, afet anında kimin neyi yapacağının konuşulmuş olmasını sağlar.',
    },
    bag: {
      title: 'Çanta ve belgeler',
      why: 'Çantanın yerini ve içindekileri yazmak, afet sonrası ilk saatlerde ihtiyaç duyacağınız malzemelere ulaşmayı kolaylaştırır.',
    },
    review: {
      title: 'Gözden geçirme',
      why: 'Planı düzenli olarak gözden geçirmek, telefon numaraları ve ihtiyaçlar değiştiğinde planın güncel kalmasını sağlar.',
    },
  },

  fields: {
    householdLabel: 'Hane etiketi',
    householdAddress: 'Adres',
    householdBuildingNote: 'Bina notu',

    memberName: 'Ad',
    memberGroup: 'Grup',
    memberPhone: 'Telefon',
    membersLegend: 'Hanenizdeki kişiler',
    dailyPlacesLegend: 'Gün içinde bulunduğu yerler',
    dailyPlaceKind: 'Yer türü',
    dailyPlaceLabel: 'Yer adı',
    dailyPlacePhone: 'Yer telefonu',
    dailyPlaceNote: 'Not',
    /** Adı yazılmamış kişi için ekran okuyucu etiketi (§15). */
    memberFallback: 'Kişi {index}',
    memberNeedsLegend: '{name} için destek ihtiyaçları',
    needsMobility: 'Hareket desteği gerekir',
    needsHearing: 'İşitme desteği gerekir',
    needsVision: 'Görme desteği gerekir',
    needsCommunication: 'İletişim desteği gerekir',
    needsNote: 'Kısa not',

    healthLegend: 'Sağlık bilgileri (isteğe bağlı)',
    healthOptIn: 'Sağlık bilgisi eklemek istiyorum',
    healthMemberLegend: '{name} için sağlık bilgileri',
    bloodType: 'Kan grubu',
    conditions: 'Sürekli hastalıklar',
    medications: 'Düzenli kullanılan ilaçlar',
    allergies: 'Alerjiler',
    devices: 'Kullanılan yardımcı cihazlar',

    contactName: 'Ad',
    contactRelation: 'İlişki',
    contactPhone: 'Telefon',
    contactPhoneAlt: 'İkinci telefon',
    contactOutOfArea: 'Şehir dışı irtibat kişisi',
    contactCity: 'Şehir',
    contactCanPickUp: 'Çocukları teslim alabilir',
    contactsLegend: 'Acil durumda aranacak kişiler',

    nearHomeLabel: 'Ev yakınındaki buluşma yeri',
    neighborhoodLabel: 'Mahalledeki buluşma yeri',
    outOfAreaLabel: 'Şehir dışındaki buluşma yeri',
    placeDetail: 'Tarif ya da adres (isteğe bağlı)',
    assemblyAreaLabel: 'Afet ve acil durum toplanma alanı',
    assemblyCheckedAt: 'Resmî sorguya baktığım tarih',

    safeSpotsLegend: 'Güvenli yerler',
    safeSpotLabel: 'Güvenli yer',
    exitsLegend: 'Çıkış yolları',
    exitLabel: 'Çıkış yolu',
    utilitiesLegend: 'Vana ve şalter yerleri',
    utilityElectricity: 'Elektrik şalterinin yeri',
    utilityGas: 'Gaz vanasının yeri',
    utilityWater: 'Su vanasının yeri',
    hazardsLegend: 'Tehlike avı',

    rolesLegend: 'Görevler',
    roleMember: 'Kimi yapacak?',
    roleNote: 'Not (isteğe bağlı)',
    roleUnassigned: 'Atanmadı',

    bagLocation: 'Çantanın yeri',
    bagItemsLegend: 'Çanta listesi',
    /** §11.6 — kullanıcının kendi eklediği madde (`ozel-<uuid>`). */
    customBagItemName: 'Madde adı',
    customBagItemDone: 'Bu madde hazır',
    addCustomBagItem: 'Kendi maddemi ekle',
    documentsLegend: 'Belge kopyaları',
    petsLegend: 'Evcil hayvanlar',
    petName: 'Ad',
    petKind: 'Tür',
    petNote: 'Not',
    insuranceLegend: 'Zorunlu deprem sigortası',
    insuranceQuestion: 'Zorunlu deprem sigortanız var mı?',
    itemNote: '{item} için not (isteğe bağlı)',
    notePlaceholder: 'Kısa not (isteğe bağlı)',

    lastDrillAt: 'Son tatbikat tarihi',
    nextReviewAt: 'Sonraki gözden geçirme tarihi',
    notes: 'Notlar',

    /** Tekrarlı alanların öğe adı (`Repeater`, §15). */
    repeaterMember: 'Kişi',
    repeaterDailyPlace: 'Yer',
    repeaterContact: 'Acil kişi',
    repeaterPet: 'Evcil hayvan',
    repeaterSafeSpot: 'Güvenli yer',
    repeaterExit: 'Çıkış yolu',
  },

  options: {
    groups: {
      yetiskin: 'Yetişkin',
      cocuk: 'Çocuk',
      bebek: 'Bebek',
      yasli: 'Yaşlı',
    },
    dailyPlaceKinds: {
      okul: 'Okul',
      is: 'İş yeri',
      diger: 'Diğer',
    },
    yesNoUnknown: {
      evet: 'Evet',
      hayir: 'Hayır',
      bilmiyorum: 'Bilmiyorum',
    },
    bloodTypes: {
      none: 'Seçilmedi',
      'A+': 'A Rh+',
      'A-': 'A Rh-',
      'B+': 'B Rh+',
      'B-': 'B Rh-',
      'AB+': 'AB Rh+',
      'AB-': 'AB Rh-',
      '0+': '0 Rh+',
      '0-': '0 Rh-',
    },
  },

  hints: {
    householdLabel: 'Örneğin: Yılmaz ailesi.',
    householdAddress: 'Adres yalnızca tam plan çıktısında görünür; paylaşılan özet karta girmez.',
    householdBuildingNote: 'Örneğin: 4. kat, asansörlü, 2 merdiven.',
    membersRequired: 'Bu adımda en az bir kişinin adını yazın.',
    memberGroup: 'Çocuk için okuldan kimin teslim alabileceğini 4. adımda işaretleyebilirsiniz.',
    phone: 'İsteğe bağlı. Yalnızca rakam, boşluk ve + - ( ) kullanılabilir.',
    dailyPlaces: 'Okul, iş yeri ya da düzenli gidilen bir yer.',
    needsNote: 'Örneğin: merdiven inerken destek gerekir.',
    healthIntro:
      'Sağlık bilgileri isteğe bağlıdır, varsayılan olarak kapalıdır ve paylaşılan özet karta girmez.',
    contacts: 'En az bir şehir dışı kişi önerilir; zorunlu değildir.',
    contactCity: 'Şehir dışı irtibat kişisiyse şehri yazın.',
    placeDetail: 'Yeri kısa bir tarifle anlatın.',
    assemblyArea:
      "Size en yakın afet ve acil durum toplanma alanını e-Devlet'teki resmî sorgudan öğrenin ve buraya yazın.",
    assemblyAreaNoSuggestion: 'Uygulama size bir toplanma alanı önermez.',
    assemblyCheckedAt: 'Toplanma alanı için resmî sorguya baktığınız tarihi seçin.',
    safeSpots: 'Sarsıntı sırasında kullanacağınız güvenli yerleri yazın.',
    exits: 'Evden çıkmak için kullanabileceğiniz yolları yazın.',
    utilities: 'Vana ve şalterin yerini yazın; nasıl kapatılacağını değil.',
    hazards: 'Evde düzeltmeyi düşündüğünüz maddeleri işaretleyin.',
    roles: 'Her göreve bir kişi seçebilirsiniz. Atanmamış görev sorun değildir.',
    bagLocation: 'Çantayı evin nerede tuttuğunuzu yazın.',
    bagItems: 'Hazırladığınız maddeleri işaretleyin; not ekleyebilirsiniz.',
    documents: 'Belgelerin kopyalarını hazırladıysanız işaretleyin.',
    pets: 'Evcil hayvanlarınız varsa adlarını yazın.',
    insurance: 'Bu bilgi planda denetim maddesi olarak yer alır.',
    lastDrillAt: 'Tatbikat yaptıysanız tarihini seçin.',
    nextReviewAt: 'Altı ay sonrası önerilir; tarihi değiştirebilirsiniz.',
    notes: 'Planınızla ilgili eklemek istediğiniz notlar.',
    reviewCalendar: 'Takvim dosyasında kişisel bilgi yer almaz.',
  },

  notices: {
    /** §11.5/3 — sağlık anahtarı açılırken gösterilen metin (birebir). */
    healthInfo:
      'Kan grubu, hastalık, ilaç gibi bilgiler hassastır. Yalnızca bu cihazda saklanır. Eklemek zorunda değilsiniz; yalnızca acil durumda bir başkasının bilmesi gereken kadarını yazın.',
    /** §11.5/6 — tesisat uyarısı (birebir). */
    utilitiesWarning:
      'Tesisat üzerinde kendiniz işlem yapmayın; gerekirse yetkili servisten destek alın.',
    noMembers: 'Bu bölümü doldurabilmek için önce 2. adımda kişi ekleyin.',
    /** §13.3'ten gelen açıklama maddeleri (P-04, P-10) gösterilemezse. */
    missingContent: '',
  },

  health: {
    deleteTitle: 'Sağlık bilgileri silinecek',
    /** §11.5/3 — kapatma onayı metni (birebir). */
    deleteBody: 'Girdiğiniz sağlık bilgileri silinecek.',
    deleteHint: 'Bu işlem geri alınamaz. Sağlık bilgilerini yeniden yazmanız gerekir.',
    deleteConfirm: 'Sağlık bilgilerini sil',
  },

  actions: {
    back: 'Geri',
    next: 'İleri',
    skip: 'Sonra doldururum',
    finish: 'Planı bitir',
    addCalendar: 'Takvimime ekle',
  },

  errors: {
    requiredMemberName: 'En az bir kişinin adı gerekli.',
    tooLong: 'En fazla {max} karakter yazabilirsiniz.',
    phoneShort: 'Telefon numarası boş olabilir ya da en az {min} karakter olmalı.',
    phoneLong: 'Telefon numarası en fazla {max} karakter olabilir.',
    phoneCharacters:
      'Telefon numarasında yalnızca rakam, boşluk ve + - ( ) işaretleri kullanılabilir.',
    dateInvalid: 'Tarihi GG.AA.YYYY biçiminde seçin.',
  },

  /** §11.5/7 — yedi görev; `RoleId` anahtarlarıyla birebir. */
  roles: {
    canta: 'Çantayı almak',
    vanalar: 'Vana ve şalter',
    cocuklar: 'Çocuklar',
    yaslilar: 'Yaşlı ve desteğe ihtiyacı olanlar',
    evcil: 'Evcil hayvanlar',
    kapilar: 'Kapıları açık bırakmak ve kontrol etmek',
    iletisim: 'Şehir dışı kişiye haber vermek',
  },

  /** §11.4 — adımın ilgili rehber kartı bağlantısı. */
  guideLinks: {
    once: 'Rehber: deprem öncesi',
    an: 'Rehber: deprem anı',
    sonra: 'Rehber: deprem sonrası',
    all: 'Rehber kartları',
  },

  /** §13.1 — kaynak bağlantısı etiketi. */
  sources: {
    label: '{org} — {title}',
    daskOrg: 'DASK',
    daskTitle: 'Doğal Afet Sigortaları Kurumu',
  },
} as const;

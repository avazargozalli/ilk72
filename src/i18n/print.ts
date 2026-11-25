/**
 * Şartname §12 — yazdırma çıktılarının metinleri.
 *
 * `tr.ts` bu nesneyi `tr.print` olarak birleştirir; biçim sarmalanmış **değil**,
 * doğrudan içeriktir:
 *
 * ```ts
 * export const print = { fullPlan: { title: '…' }, … } as const;
 * ```
 *
 * Kapsam: `#/yazdir` sayfası (belge seçimi, seçenekler, ölçek notu), altı
 * belgenin başlıkları ve sütun/satır etiketleri, her sayfanın altındaki alt
 * bilgi cümlesi (§12, §14.5) ve kaynak notu (§12.5).
 *
 * Yer tutucular `formatText`/`formatDate` ile doldurulur (`./format.ts`):
 * `{app}`, `{date}`, `{org}`, `{title}`, `{total}`, `{index}`, `{name}` …
 *
 * **Tek sözlük kuralı (§15):** grup, rol, gün içi yer türü, kan grubu ve
 * "evet/hayır/bilmiyorum" adları burada **tekrarlanmaz**; ekrandaki sihirbazla
 * aynı sözcükler kullanılsın diye `tr.wizard` içinden okunur. Böylece kâğıtla
 * ekran arasında ad farkı oluşmaz. Bu dosya yalnızca baskıya özgü metinleri
 * taşır.
 *
 * Bileşen dosyalarına sabit Türkçe metin yazılmaz (§0 kural 7).
 */
export const print = {
  /** `#/yazdir` sayfası: seçim, seçenekler, ölçek notu, önizleme (§12). */
  page: {
    title: 'Yazdırma ve önizleme',
    intro:
      'Hangi belgeleri basmak istediğinizi seçin. Aşağıdaki önizleme kâğıda çıkacak sonucu gösterir. Afet anında telefon ve şebeke çalışmayabilir; planı yazdırıp saklayın.',
    documentsLegend: 'Basılacak belgeler',
    optionsLegend: 'Baskı seçenekleri',
    includeHealth: 'Sağlık bilgilerini de bas',
    includeHealthHint:
      'Sağlık bilgilerini tam plana ekler. Cüzdan kartı için kan grubunu ayrıca seçebilirsiniz.',
    includeHealthUnavailable:
      'Planda sağlık bilgisi yok. 3. adımdaki "Sağlık bilgisi eklemek istiyorum" anahtarını açarsanız bu seçenek kullanılabilir.',
    includeHealthNotVisited:
      'Sağlık bilgileri bu planda kayıtlı değil. 3. adımı açıp bilgileri eklerseniz bu seçenek kullanılabilir.',
    includeSchoolName: 'Okul adını çocuk kartına ekle',
    includeSchoolNameHint:
      'Çocuk kartında ev adresi hiçbir zaman basılmaz. Okul adı yalnızca bu seçenek işaretliyse görünür.',
    includeBloodType: 'Cüzdan kartına kan grubunu bas',
    includeBloodTypeHint:
      'Kan grubu sağlık bilgisidir; yalnızca bu seçenek işaretliyse ve planda yazılıysa basılır.',
    includeWalletNote: 'Cüzdan kartına tek satır not bas',
    includeWalletNoteHint: 'Planınızdaki notların ilk satırı cüzdan kartının arkasına basılır.',
    includeWalletQr: 'Cüzdan kartına plan özeti kare kodu bas',
    includeWalletQrHint:
      'Kodu okutan herkes parola girmeden hane etiketini, kişi bilgilerini, acil bağlantıları ve buluşma yerlerini görebilir. Kartı güvendiğiniz kişilerle paylaşın.',
    walletQrError: 'Özet kare koda sığmadı. Cüzdan kartları kare kod olmadan yazdırılabilir.',
    printButton: 'Yazdır',
    calendarButton: 'Takvimime ekle',
    calendarHint: 'Takvim dosyasında ad, telefon, adres veya sağlık bilgisi yer almaz.',
    scaleNote: 'Yazdırırken ölçek %100 olsun.',
    previewTitle: 'Önizleme',
    previewEmpty: 'Yazdırmak için yukarıdan en az bir belge seçin.',
    previewHint: 'Kâğıda yalnızca seçtiğiniz belgeler basılır; bu önizleme ekranda kalır.',
  },

  /** §12 tablosu — altı belgenin adı ve kısa açıklaması (kutuların ipucu). */
  documents: {
    fullPlan: {
      title: 'Tam plan',
      description:
        'Planın tamamı, bölüm başlıklarıyla. A4, 2–4 sayfa. Sağlık bilgileri yalnızca işaretlerseniz eklenir.',
    },
    fridgeSheet: {
      title: 'Buzdolabı sayfası',
      description:
        'Büyük punto: 112, buluşma yerleri, acil kişiler, vana ve şalter yerleri, çantanın yeri ve görevler. Uzun kayıtlar ek sayfaya geçebilir. Sağlık bilgisi yok.',
    },
    walletCards: {
      title: 'Cüzdan kartları',
      description:
        'Kişi başına bir kart; iki yüzü yan yana, ortada katlama çizgisi. A4 sayfada dört kart.',
    },
    childCards: {
      title: 'Çocuk kartları',
      description:
        'Çocuk başına cüzdan ölçüsünde kart. Ev adresi basılmaz; okul adı yalnızca isteğe bağlıdır.',
    },
    bagChecklist: {
      title: 'Çanta kontrol listesi',
      description:
        'Hanenize göre üretilmiş liste, kutularla. Çantanın yeri ve son kontrol tarihi için boş satır.',
    },
    blankForm: {
      title: 'Boş form',
      description: 'Elle doldurulacak form. Plan oluşturmadan basılabilir; kişisel bilgi içermez.',
    },
  },

  /**
   * §12, §14.5 — her sayfanın altındaki küçük punto satır. Uygulama adı
   * `APP_NAME`'den gelir (§0.1: ad tek yerde durur), tarih planın tarihidir.
   */
  footer: {
    line: '{app} ile hazırlandı · {date} · Resmî bir belge değildir.',
  },

  /** §12.1, §12.2, §12.3 — acil durum yönlendirmesi (İ6: tek numara 112). */
  emergency: {
    title: 'Acil durumda 112',
    call: '112’yi ara',
    note: 'Bu uygulama yardım çağırmaz.',
  },

  /** Belge içindeki bölüm başlıkları. */
  sections: {
    household: 'Hane',
    members: 'Kişiler',
    health: 'Sağlık bilgileri',
    contacts: 'Acil kişiler',
    meeting: 'Buluşma yerleri',
    home: 'Ev ve güvenli yerler',
    utilities: 'Vana ve şalter yerleri',
    roles: 'Görevler',
    bag: 'Çanta ve belgeler',
    pets: 'Evcil hayvanlar',
    review: 'Gözden geçirme',
    notes: 'Notlar',
  },

  /** Satır ve sütun etiketleri (sütun başlıkları dâhil). */
  labels: {
    cardShortened: '… ile biten metinler tam plandadır.',
    // Hane
    householdLabel: 'Hane etiketi',
    address: 'Adres',
    buildingNote: 'Bina notu',
    floorCount: 'Kat sayısı',
    // Kişiler
    name: 'Ad',
    group: 'Grup',
    phone: 'Telefon',
    dailyPlaces: 'Gün içinde bulunduğu yerler',
    needs: 'Destek ihtiyaçları',
    needsNote: 'Destek notu',
    // Sağlık (§12.1 — yalnızca isteğe bağlı bölüm)
    bloodType: 'Kan grubu',
    conditions: 'Sürekli hastalıklar',
    medications: 'Düzenli kullanılan ilaçlar',
    allergies: 'Alerjiler',
    devices: 'Yardımcı cihazlar',
    // Acil kişiler
    relation: 'İlişki',
    phoneAlt: 'İkinci telefon',
    outOfArea: 'Şehir dışı',
    city: 'Şehir',
    canPickUp: 'Çocukları teslim alabilir',
    // Buluşma yerleri
    nearHome: 'Ev yakınındaki buluşma yeri',
    neighborhood: 'Mahalledeki buluşma yeri',
    outOfAreaPlace: 'Şehir dışındaki buluşma yeri',
    assemblyArea: 'Afet ve acil durum toplanma alanı',
    assemblyCheckedAt: 'Resmî sorguya bakılan tarih',
    // Ev
    safeSpots: 'Güvenli yerler',
    exits: 'Çıkış yolları',
    electricity: 'Elektrik şalterinin yeri',
    gas: 'Gaz vanasının yeri',
    water: 'Su vanasının yeri',
    hazards: 'Tehlike avı',
    // Görevler
    role: 'Görev',
    assignedTo: 'Kimi yapacak',
    roleNote: 'Not',
    // Çanta ve belgeler
    bagLocation: 'Çantanın yeri',
    bagItems: 'Çanta listesi',
    documents: 'Belge kopyaları',
    pets: 'Evcil hayvanlar',
    insurance: 'Zorunlu deprem sigortası',
    lastCheckedAt: 'Son kontrol tarihi',
    // Gözden geçirme
    lastDrillAt: 'Son tatbikat tarihi',
    nextReviewAt: 'Sonraki gözden geçirme tarihi',
    // Kartlar
    cardFold: 'Katla',
  },

  /** Boş alanların yerine yazılan kısa karşılıklar. */
  values: {
    empty: 'Yazılmadı',
    none: 'Yok',
    unassigned: 'Atanmadı',
    done: 'Hazır',
    notDone: 'Hazır değil',
    noMembers: 'Planda kişi yok.',
  },

  /** §12.1 — tam plan. */
  fullPlan: {
    /** Ev adresinin yalnızca bu çıktıda yer aldığı notu (§11.5/1). */
    addressNote: 'Ev adresi yalnızca tam planda ve yalnızca bu çıktıda yer alır.',
    healthNote: 'Sağlık alanlarını bu çıktıya eklediniz. Belgeyi güvenli bir yerde saklayın.',
  },

  /** §12.2 — buzdolabı sayfası (sağlık bilgisi yok). */
  fridge: {
    usage:
      'Buzdolabı çıktısını evde görünür bir yere asın. Birden çok sayfa varsa birlikte saklayın.',
  },

  /** §12.3 — cüzdan kartları. */
  wallet: {
    usage: 'Kartları kesme çizgilerinden kesin, ortadan katlayın ve cüzdanda taşıyın.',
    frontTitle: 'Ön yüz',
    backTitle: 'Arka yüz',
    meetingNear: 'Buluşma: ev yakını',
    meetingNeighborhood: 'Buluşma: mahalle',
    meetingOutOfArea: 'Buluşma: şehir dışı',
    outOfAreaContact: 'Şehir dışı kişi',
    emergencyContacts: 'Acil kişiler',
    bloodType: 'Kan grubu',
    note: 'Not',
    noMembers: 'Planda kişi yok; cüzdan kartı basılmaz.',
  },

  /** §12.4 — çocuk kartları (ev adresi yok, okul adı isteğe bağlı). */
  childCards: {
    usage: 'Numaralı kartları birlikte saklayın. Ev adresi bu kartlara basılmaz.',
    cardNumber: 'Çocuk kartı · {index}/{total}',
    family: 'Ailem:',
    pickUp: 'Beni teslim alabilecekler:',
    school: 'Okul:',
    outOfArea: 'Şehir dışı kişi:',
    meeting: 'Buluşma yeri:',
    noChildren: 'Planda çocuk yok; çocuk kartı basılmaz.',
    pickUpEmpty: 'Teslim alacak kişi işaretlenmedi',
  },

  /** §12.5 — çanta kontrol listesi. */
  bagList: {
    lastCheckedBlank: 'Son kontrol tarihi: ',
    notePrefix: 'Not: ',
  },

  /** §12.6 — boş form (kişisel veri içermez). */
  blankForm: {
    intro:
      'Bu form elle doldurulur. Plan oluşturmadan da basılabilir; kişisel bilgi içermez. Doldurduktan sonra görünür bir yere asın.',
    household: 'Hane',
    householdLabel: 'Hane etiketi:',
    address: 'Adres:',
    buildingNote: 'Bina notu (kat, asansör, merdiven):',
    members: 'Evde yaşayan kişiler',
    memberLine: 'Ad ve soyad · grup · telefon',
    contacts: 'Acil durumda aranacak kişiler',
    contactLine: 'Ad · ilişki · telefon',
    meeting: 'Buluşma yerleri',
    nearHome: 'Ev yakınındaki buluşma yeri:',
    neighborhood: 'Mahalledeki buluşma yeri:',
    outOfAreaPlace: 'Şehir dışındaki buluşma yeri:',
    assemblyArea: 'Afet ve acil durum toplanma alanı:',
    home: 'Ev: güvenli yerler ve çıkışlar',
    safeSpotLine: 'Güvenli yer:',
    exitLine: 'Çıkış yolu:',
    utilities: 'Vana ve şalter yerleri',
    electricity: 'Elektrik şalteri:',
    gas: 'Gaz vanası:',
    water: 'Su vanası:',
    roles: 'Görevler',
    roleLine: 'Görev · kişi · not',
    bag: 'Afet ve acil durum çantası',
    bagLocation: 'Çantanın yeri:',
    bagItemLine: 'Madde:',
    documents: 'Belge kopyaları',
    documentLine: 'Belge:',
    review: 'Gözden geçirme',
    lastDrillAt: 'Son tatbikat tarihi:',
    nextReviewAt: 'Sonraki gözden geçirme tarihi:',
    notes: 'Notlar',
    noteLine: 'Not:',
  },

  /**
   * §13.1, §12.5 — kaynak notu. Kaynak kaydı (`src/content/sources.ts`) dışında
   * kaynak **uydurulmaz**; kaydı olmayan maddede not boş kalır (İ4).
   */
  source: {
    line: 'Kaynak: {org} — {title} · Erişim tarihi: {date}',
    missing: 'Kaynak kaydı bulunamadı.',
  },
} as const;

/**
 * Şartname §11.3, §11.6, §11.7, §11.9, §11.10, §11.8, İ3, İ6, İ8, İ9 — sayfaların
 * bütün metinleri.
 *
 * `tr.ts` bu nesneyi `tr.pages` olarak birleştirir; biçim sarmalanmış **değil**,
 * doğrudan içeriktir. Sayfa bileşenleri sabit Türkçe metin taşımaz (§0 kural 7):
 * başlık, açıklama, düğme, uyarı ve sabit cümleler burada durur.
 *
 * - `common`: birkaç sayfada yeniden kullanılan kısa metinler ve biçimler.
 * - `sectionTitles`: §11.8'deki dokuz bölümün adı (özet sayfası).
 * - `home`: §11.3 ana sayfa.
 * - `summary`: §11.7 plan özeti.
 * - `emergency`: §11.9 acil ekranı.
 * - `guide`: §11.10 rehber sekmeleri ve kart başlıkları.
 * - `bag`: §11.6 çanta kontrol listesi sayfası.
 *
 * **İ9 sınırı:** burada sahte güven veren bir ifade ya da bir güven puanı
 * yoktur; doluluk cümlesi yalnızca doldurulan bölüm sayısını söyler ve hemen
 * altında §11.8'deki sabit uyarı gösterilir.
 *
 * Sayaç/tarih içeren metinler `{...}` yer tutucularıyla yazılır ve
 * `formatText`/`formatDate` ile doldurulur (`./format.ts`).
 *
 * Kart başlıkları (`guide.cardTitles`) §13.3'teki madde metinlerinin yerine
 * geçmez; yalnızca kartın konusunu adlandıran kısa etiketlerdir. Rehber kartının
 * gövdesi her zaman `src/content/registry.ts` içindeki metindir (İ4).
 */
export const pages = {
  /** Sayfalarda yeniden kullanılan kısa metinler ve biçimler. */
  common: {
    /** Özet sayfasındaki "Düzenle" bağlantısı (§11.7). */
    edit: 'Düzenle',
    /** "Düzenle" bağlantısının ekran okuyucu eki: ": Kişiler". */
    editSection: ': {section}',
    show: 'Göster',
    hide: 'Gizle',
    /** Değeri yazılmamış alanlar için. */
    emptyValue: 'Yazılmadı',
    /** "Etiket: değer" satırı. */
    labelValue: '{label}: {value}',
    /** §13.1 — kaynak satırı: "Kaynak: AFAD — … (erişim: 19.11.2026)". */
    sourcePrefix: 'Kaynak:',
    sourceLabel: '{org} — {title}',
    sourceAccessed: '(erişim: {date})',
  },

  /** §11.8 tablosundaki dokuz bölümün adı, tablo sırasıyla. */
  sectionTitles: {
    household: 'Hane',
    members: 'Kişiler',
    needs: 'Özel ihtiyaçlar',
    contacts: 'Acil kişiler',
    meeting: 'Buluşma yerleri',
    home: 'Eviniz',
    roles: 'Görevler',
    bag: 'Çanta ve belgeler',
    review: 'Gözden geçirme',
  },

  /** §11.3 — ana sayfa. */
  home: {
    title: 'Aile afet ve acil durum planı',
    /** Plan yokken gösterilen üç cümlelik tanıtım. */
    intro: [
      'Acil kişilerinizi, buluşma yerlerinizi ve evdeki görevleri tek bir planda toplayın.',
      'Planınız bu tarayıcıda saklanır ve çevrimdışı açılır.',
      'Hazırladığınız planı yazdırabilir veya PDF olarak kaydedebilirsiniz.',
    ],
    start: 'Planı hazırlamaya başla',
    printBlank: 'Boş formu yazdır',
    guideTitle: 'Deprem rehberi',
    guideBody: 'Deprem öncesi, sırası ve sonrası için resmî kaynaklara dayanan kısa bilgiler.',
    guideAction: 'Rehberi aç',
    importTitle: 'Bana gönderilen planı aç',
    importBody:
      'Size ulaşan plan bağlantısına dokunun. Özet, hesap açmadan bu uygulamada görüntülenir. Bağlantıyı kimlerle paylaşabileceğinizi gönderene sorun.',
    planTitle: 'Planınız',
    /**
     * §11.8 — doluluk cümlesi. Toplam bölüm sayısı 9'dur; Türkçe sayı eki
     * doldurulan bölüm sayısına göre değiştiği için cümleler tek tek yazılır
     * (dizi sırası = dolu bölüm sayısı).
     */
    progressSentences: [
      'Planınızın {total} bölümünden hiçbiri dolu değil.',
      "Planınızın {total} bölümünden 1'i dolu.",
      "Planınızın {total} bölümünden 2'si dolu.",
      "Planınızın {total} bölümünden 3'ü dolu.",
      "Planınızın {total} bölümünden 4'ü dolu.",
      "Planınızın {total} bölümünden 5'i dolu.",
      "Planınızın {total} bölümünden 6'sı dolu.",
      "Planınızın {total} bölümünden 7'si dolu.",
      "Planınızın {total} bölümünden 8'i dolu.",
      'Planınızın {total} bölümünün tamamı dolu.',
    ],
    /** §11.8 — doluluk sayısının altındaki **sabit** uyarı (İ9). */
    progressNote:
      'Bu sayı planın ne kadarını doldurduğunuzu gösterir; bir güvenlik derecesi değildir.',
    continue: 'Devam et',
    emergencyAction: 'Acil ekranı',
    summaryLink: 'Plan özetini aç',
    reviewTitle: 'Gözden geçirme',
    lastDrillAt: 'Son tatbikat: {date}',
    nextReviewAt: 'Sonraki gözden geçirme: {date}',
    noReviewDate: 'Henüz bir gözden geçirme tarihi yazılmadı.',
    /** §11.3 — altı ay geçtiyse gösterilen nazik hatırlatma. */
    reviewReminderTitle: 'Gözden geçirme zamanı gelmiş olabilir',
    reviewReminder:
      'Planınızı altı aydan daha önce gözden geçirmişsiniz. Kısa bir gözden geçirme için gözden geçirme adımını açabilirsiniz.',
    reviewLink: 'Gözden geçirme adımını aç',
  },

  /** §11.7 — plan özeti. */
  summary: {
    title: 'Plan özeti',
    outputsTitle: 'Çıktılar',
    floorCountLabel: 'Kat sayısı',
    membersEmpty: 'Henüz kişi eklenmedi.',
    dailyPlacesTitle: 'Gün içinde bulunduğu yerler',
    dailyPlaceLine: '{label} ({kind})',
    needsTitle: 'Destek ihtiyaçları',
    needsNone: 'Destek ihtiyacı yazılmadı.',
    healthTitle: 'Sağlık bilgileri',
    /** İ8 — sağlık izni kapalıyken ya da hiç sağlık bilgisi yokken. */
    healthNone: 'Sağlık bilgisi eklenmedi.',
    contactsEmpty: 'Acil kişi yazılmadı.',
    contactFallback: 'Acil kişi',
    contactTitle: '{name}',
    contactTitleWithRelation: '{name} — {relation}',
    contactOutOfArea: 'Şehir dışı — {city}',
    contactOutOfAreaNoCity: 'Şehir dışı',
    phoneAltLabel: 'İkinci telefon',
    canPickUpChildren: 'Çocukları teslim alabilir.',
    meetingEmpty: 'Buluşma yeri yazılmadı.',
    placeLine: '{label} — {detail}',
    placeLineNoDetail: '{label}',
    meetingCheckedAt: 'Toplanma alanı için resmî sorguya bakıldı: {date}',
    homeSafeSpots: 'Güvenli yerler',
    homeExits: 'Çıkış yolları',
    hazardsCount: 'Tehlike avında {done} / {total} madde işaretli.',
    rolesEmpty: 'Görev yazılmadı.',
    bagItemsCount: 'Çanta listesinde {done} / {total} madde işaretli.',
    bagOpen: 'Çanta listesini aç',
    documentsCount: 'Belge kopyalarında {done} / {total} madde işaretli.',
    petsTitle: 'Evcil hayvanlar',
    petsEmpty: 'Evcil hayvan yazılmadı.',
    petLine: '{name}',
    petLineWithKind: '{name} ({kind})',
    insuranceTitle: 'Zorunlu deprem sigortası',
    reviewLastDrill: 'Son tatbikat: {date}',
    reviewNext: 'Sonraki gözden geçirme: {date}',
    notesEmpty: 'Not yazılmadı.',
  },

  /** §11.9 — acil ekranı. */
  emergency: {
    title: 'Acil durum',
    callTitle: 'Yardım çağırmak için',
    /** İ6 — tek yönlendirme 112; düğme `<a href="tel:112">` olarak çizilir. */
    callAction: "112'yi ara",
    callNote: 'Bu uygulama yardım çağırmaz.',
    placesTitle: 'Buluşma yerleri',
    placeEmpty: 'Planınızda kayıtlı değil.',
    assemblyCheckedAt: 'Toplanma alanı için resmî sorguya bakıldı: {date}',
    contactsTitle: 'Acil kişiler',
    contactsEmpty: 'Planınızda kayıtlı acil kişi yok.',
    contactFallback: 'Acil kişi',
    contactOutOfArea: 'Şehir dışı — {city}',
    contactOutOfAreaNoCity: 'Şehir dışı irtibat kişisi',
    afterTitle: 'Deprem sonrası için kısa liste',
    afterIntro: 'Bu maddeler resmî kaynakların özetidir. Ayrıntı için kaynağı açın.',
    noPlan:
      'Henüz bir plan yok. Buluşma yerleri ve acil kişiler plan hazırlandığında burada görünür.',
  },

  /** §11.10 — rehber. */
  guide: {
    title: 'Rehber',
    /** §11.10 — sayfa başı uyarısı (birebir). */
    intro: 'Bu kartlar resmî kaynakların özetidir. Güncel ve ayrıntılı bilgi için kaynağı açın.',
    tabsLabel: 'Rehber bölümleri',
    tabs: {
      once: 'Önce',
      an: 'An',
      sonra: 'Sonra',
    },
    parts: {
      once: 'Deprem öncesi',
      an: 'Deprem anı',
      sonra: 'Deprem sonrası',
    },
    /** §11.10, §13.4 — onaylanmamış madde etiketi. */
    draft: 'TASLAK — onaylanmadı',
    /** §13.4-5 — her kartta hata bildirim bağlantısı. */
    reportIssue: 'Hata bildir',
    reportIssueFor: ': {title}',
    /**
     * Kart konuları (§13.3 maddelerinin kısa adları). Gövde metni her zaman
     * `contentByCategory(...)` üzerinden gelir; burası yalnızca başlıktır.
     */
    cardTitles: {
      'O-01': 'Tehlike avı',
      'O-02': 'Afet ve acil durum çantası',
      'O-03': 'Çök-Kapan-Tutun',
      'O-04': 'Yapı ruhsatı ve izin belgesi',
      'O-05': 'Taşıyıcı kolon ve duvarlar',
      'O-06': 'Bina dayanıklılığı',
      'O-07': 'Zorunlu deprem sigortası',
      'A-01': 'Sarsıntı sırasında sakin kalmak',
      'A-02': 'Çök-Kapan-Tutun hareketi',
      'A-03': 'Cam ve düşebilecek eşyalar',
      'A-04': 'Merdiven ve çıkışlar',
      'A-05': 'Balkon, merdiven ve asansör',
      'A-06': 'Dışarıdaysanız',
      'S-01': 'Binadan çıkmak',
      'S-02': 'Kibrit ve elektrik düğmeleri',
      'S-03': 'Vana ve şalterler',
      'S-04': 'Toplanma alanına gitmek',
      'S-05': 'Hasarlı binalar ve enerji hatları',
      'S-06': 'Kıyıdaysanız',
      'S-07': 'Desteğe ihtiyacı olanlar',
      'S-08': 'Araç kullanımı',
      'S-09': 'Toplanma alanında kalmak',
      'S-10': 'Resmî uyarıları izlemek',
    },
  },

  /** §11.6 — çanta kontrol listesi sayfası. */
  bag: {
    title: 'Afet ve acil durum çantası',
    intro:
      'Liste hanenize göre üretilir. Kişi ekledikçe maddeler değişir; işaretlediğiniz maddeler korunur.',
    itemsCount: 'Çanta listesinde {done} / {total} madde işaretli.',
    lastCheckedAt: 'Son kontrol tarihi',
    lastCheckedHint: 'Çantayı en son ne zaman kontrol ettiğinizi seçin.',
    /** `ozel-*` maddesinin adı yazılmamışsa gösterilen etiket. */
    customItemFallback: 'Kendi maddem',
    printLink: 'Çanta kontrol listesini yazdır',
    readOnly: 'Liste şu anda yalnızca okunabilir; değiştirmek için planı düzenleyin.',
  },
} as const;

/** Rehber maddeleri ve kaynakları. Uzman incelemesi her madde için ayrı kaydedilir. */
export type ContentCategory = 'plan' | 'canta' | 'belge' | 'tehlike' | 'once' | 'an' | 'sonra';

export interface ContentItem {
  id: string; // "A-03"
  category: ContentCategory;
  text: string; // kendi cümlelerimizle, ≤ 220 karakter
  sources: string[]; // ≥1 kaynak anahtarı
  status: 'taslak' | 'onayli';
  reviewedBy?: string; // onayli ise zorunlu
  reviewedAt?: string; // onayli ise zorunlu, YYYY-AA-GG
}

/** Şartname §13.2 — bir maddenin metni en fazla 220 karakterdir. */
export const CONTENT_TEXT_MAX = 220;

/** Metinler değiştikçe artar; "Hakkında" sayfasında gösterilir (§13.2). */
export const CONTENT_VERSION = 3;

/** Kategoriler §13.2'deki sırayla. */
export const CONTENT_CATEGORIES: readonly ContentCategory[] = [
  'plan',
  'canta',
  'belge',
  'tehlike',
  'once',
  'an',
  'sonra',
];

/**
 * §13.3 başlangıç içeriğinin tamamı: plan P-01…P-12, çanta C-01…C-18,
 * koşullu C-20…C-24, C-30…C-32, C-40, C-41, liste dışı C-90…C-94,
 * belge B-01…B-05, tehlike H-01…H-10, önce O-01…O-07, an A-01…A-06,
 * sonra S-01…S-10.
 */
export const CONTENT_ITEMS: readonly ContentItem[] = [
  // ----- Plan (plan) -----
  {
    id: 'P-01',
    category: 'plan',
    text: 'Aile afet ve acil durum planı, afetten sonraki ilk 72 saat için hazırlanır.',
    sources: ['K-AILE', 'K-GUVENLI-YASAM'],
    status: 'taslak',
  },
  {
    id: 'P-02',
    category: 'plan',
    text: 'Planda evin güvenli yerleri, afet ve acil durum çantası ve evi tahliye planı yer alır.',
    sources: ['K-AILE'],
    status: 'taslak',
  },
  {
    id: 'P-03',
    category: 'plan',
    text: 'Evde devrilebilecek eşyaları belirlerken ailece görev paylaşın.',
    sources: ['K-GUVENLI-YASAM'],
    status: 'taslak',
  },
  {
    id: 'P-04',
    category: 'plan',
    text: 'Şehir içinde destek olabilecek bir kişi, şehir dışında haberleri aileye aktarabilecek bir irtibat kişisi belirleyin.',
    sources: ['K-GUVENLI-YASAM'],
    status: 'taslak',
  },
  {
    id: 'P-05',
    category: 'plan',
    text: 'Evden çıkış için birden fazla yol düşünün.',
    sources: ['K-GUVENLI-YASAM'],
    status: 'taslak',
  },
  {
    id: 'P-06',
    category: 'plan',
    text: 'Deprem sonrası buluşma yerinizi ailece kararlaştırın.',
    sources: ['K-UYARI'],
    status: 'taslak',
  },
  {
    id: 'P-07',
    category: 'plan',
    text: "Size en yakın afet ve acil durum toplanma alanını e-Devlet'teki resmî sorgudan öğrenin.",
    sources: ['K-HAZIRIM-DEPREM', 'K-EDEVLET'],
    status: 'taslak',
  },
  {
    id: 'P-08',
    category: 'plan',
    text: 'Mahallenizde tahliyenin nasıl yapılacağını öğrenin ve komşularınızla yardımlaşmayı konuşun.',
    sources: ['K-GUVENLI-YASAM'],
    status: 'taslak',
  },
  {
    id: 'P-09',
    category: 'plan',
    text: 'İlk 72 saat için su, gıda, tuvalet ve temizlik ihtiyaçlarını nasıl karşılayacağınızı planlayın.',
    sources: ['K-GUVENLI-YASAM'],
    status: 'taslak',
  },
  {
    id: 'P-10',
    category: 'plan',
    text: 'Planınızı altı ayda bir gözden geçirin. Ailece düzenli tatbikat yapın.',
    sources: ['K-ONLEM2', 'K-GUVENLI-YASAM'],
    status: 'taslak',
  },
  {
    id: 'P-11',
    category: 'plan',
    text: 'Çocuk, yaşlı, engelli ve düzenli ilaç kullanan bireylerin ihtiyaçlarını ayrıca planlayın.',
    sources: ['K-GUVENLI-YASAM'],
    status: 'taslak',
  },
  {
    id: 'P-12',
    category: 'plan',
    text: 'Türkiye Deprem Tehlike Haritası konumunuza ilişkin deprem tehlikesini gösterir. Binanızın dayanıklılığını değerlendirmek için yetkili kuruluşlara başvurun.',
    sources: ['K-TDTH-BILGI', 'K-TDTH', 'K-UYARI'],
    status: 'taslak',
  },

  // ----- Çanta (canta) — temel liste -----
  {
    id: 'C-01',
    category: 'canta',
    text: 'Su',
    sources: ['K-SOZLUK', 'K-BURDUR'],
    status: 'taslak',
  },
  {
    id: 'C-02',
    category: 'canta',
    text: 'Uzun süre bozulmayan kuru gıda',
    sources: ['K-SOZLUK', 'K-BURDUR'],
    status: 'taslak',
  },
  {
    id: 'C-03',
    category: 'canta',
    text: 'İlk yardım çantası',
    sources: ['K-SOZLUK', 'K-BURDUR'],
    status: 'taslak',
  },
  {
    id: 'C-04',
    category: 'canta',
    text: 'Düzenli kullanılan ilaçlar ve sağlık kayıtları',
    sources: ['K-BURDUR', 'K-GUMUSHANE'],
    status: 'taslak',
  },
  {
    id: 'C-05',
    category: 'canta',
    text: 'Önemli evrakların fotokopileri (kimlik vb.)',
    sources: ['K-SOZLUK', 'K-BURDUR'],
    status: 'taslak',
  },
  {
    id: 'C-06',
    category: 'canta',
    text: 'Acil telefon numaralarının yazılı listesi',
    sources: ['K-SOZLUK'],
    status: 'taslak',
  },
  {
    id: 'C-07',
    category: 'canta',
    text: 'Bir miktar nakit para',
    sources: ['K-SOZLUK'],
    status: 'taslak',
  },
  {
    id: 'C-08',
    category: 'canta',
    text: 'Pilli radyo',
    sources: ['K-SOZLUK', 'K-GUMUSHANE'],
    status: 'taslak',
  },
  {
    id: 'C-09',
    category: 'canta',
    text: 'El feneri ve yedek piller',
    sources: ['K-GUMUSHANE'],
    status: 'taslak',
  },
  {
    id: 'C-10',
    category: 'canta',
    text: 'Taşınabilir şarj cihazı',
    sources: ['K-GUMUSHANE'],
    status: 'taslak',
  },
  {
    id: 'C-11',
    category: 'canta',
    text: 'Düdük',
    sources: ['K-GUMUSHANE'],
    status: 'taslak',
  },
  {
    id: 'C-12',
    category: 'canta',
    text: 'Çakı',
    sources: ['K-GUMUSHANE'],
    status: 'taslak',
  },
  {
    id: 'C-13',
    category: 'canta',
    text: 'Mevsime uygun yedek giysi',
    sources: ['K-SOZLUK', 'K-GUMUSHANE'],
    status: 'taslak',
  },
  {
    id: 'C-14',
    category: 'canta',
    text: 'Yağmurluk',
    sources: ['K-BURDUR', 'K-GUMUSHANE'],
    status: 'taslak',
  },
  {
    id: 'C-15',
    category: 'canta',
    text: 'Hijyen malzemeleri: sabun, tuvalet kâğıdı, havlu',
    sources: ['K-BURDUR', 'K-GUMUSHANE'],
    status: 'taslak',
  },
  {
    id: 'C-16',
    category: 'canta',
    text: 'Maske',
    sources: ['K-BURDUR'],
    status: 'taslak',
  },
  {
    id: 'C-17',
    category: 'canta',
    text: 'Not defteri ve kalem',
    sources: ['K-BURDUR'],
    status: 'taslak',
  },
  {
    id: 'C-18',
    category: 'canta',
    text: 'Battaniye ya da uyku tulumu',
    sources: ['K-GUVENLI-YASAM'],
    status: 'taslak',
  },

  // ----- Çanta — koşullu maddeler (bebek, çocuk, engelli, evcil hayvan) -----
  {
    id: 'C-20',
    category: 'canta',
    text: 'Bebeğiniz kullanıyorsa kendi maması',
    sources: ['K-OKUL-TABANLI'],
    status: 'taslak',
  },
  {
    id: 'C-21',
    category: 'canta',
    text: 'Bebek bezi',
    sources: ['K-OKUL-TABANLI'],
    status: 'taslak',
  },
  {
    id: 'C-22',
    category: 'canta',
    text: 'Bebeğiniz kullanıyorsa biberonu',
    sources: ['K-OKUL-TABANLI'],
    status: 'taslak',
  },
  {
    id: 'C-23',
    category: 'canta',
    text: 'Bebek için yedek giysi',
    sources: ['K-GUVENLI-YASAM'],
    status: 'taslak',
  },
  {
    id: 'C-24',
    category: 'canta',
    text: 'Çocuğunuzun sevdiği küçük bir oyuncak',
    sources: ['K-GUVENLI-YASAM'],
    status: 'taslak',
  },
  {
    id: 'C-30',
    category: 'canta',
    text: 'Pille çalışan yardımcı cihazlar için yedek pil',
    sources: ['K-GUVENLI-YASAM'],
    status: 'taslak',
  },
  {
    id: 'C-31',
    category: 'canta',
    text: 'Özel ihtiyaçlara yönelik malzemeler',
    sources: ['K-GUVENLI-YASAM'],
    status: 'taslak',
  },
  {
    id: 'C-32',
    category: 'canta',
    text: 'Reçete ve ilaç listesinin kopyası',
    sources: ['K-GUVENLI-YASAM', 'K-OKUL-TABANLI'],
    status: 'taslak',
  },
  {
    id: 'C-40',
    category: 'canta',
    text: 'Evcil hayvan için mama ve su',
    sources: ['K-HAZIRIM-HAYVAN'],
    status: 'taslak',
  },
  {
    id: 'C-41',
    category: 'canta',
    text: 'Evcil hayvan için tasma ya da taşıma çantası',
    sources: ['K-HAZIRIM-HAYVAN'],
    status: 'taslak',
  },

  // ----- Çanta — liste dışı notlar -----
  {
    id: 'C-90',
    category: 'canta',
    text: 'Çantayı çıkışa yakın ve kolay ulaşabileceğiniz bir yerde tutun.',
    sources: ['K-HAZIRIM-DEPREM'],
    status: 'taslak',
  },
  {
    id: 'C-91',
    category: 'canta',
    text: 'Çantadaki gıda, su ve ilaçların son kullanma tarihlerini düzenli olarak kontrol edin.',
    sources: ['K-OKUL-TABANLI'],
    status: 'taslak',
  },
  {
    id: 'C-92',
    category: 'canta',
    text: 'Kişisel ihtiyaçlar için ayrı çantalar, ortak malzemeler için hane çantası hazırlayabilirsiniz.',
    sources: ['K-GUVENLI-YASAM'],
    status: 'taslak',
  },
  {
    id: 'C-93',
    category: 'canta',
    text: 'Benzer bir çantayı iş yerinde ve araçta da bulundurabilirsiniz.',
    sources: ['K-OKUL-TABANLI'],
    status: 'taslak',
  },
  {
    id: 'C-94',
    category: 'canta',
    text: 'Yatağınızın yanında el feneri ve önü kapalı, sağlam ayakkabı bulundurun.',
    sources: ['K-TEHLIKE-AVI'],
    status: 'taslak',
  },

  // ----- Belge kopyaları (belge) -----
  {
    id: 'B-01',
    category: 'belge',
    text: 'Kimlik belgelerinin fotokopisi',
    sources: ['K-BURDUR'],
    status: 'taslak',
  },
  {
    id: 'B-02',
    category: 'belge',
    text: 'Tapu ve benzeri değerli evrakların kopyası',
    sources: ['K-CANTA-BB'],
    status: 'taslak',
  },
  {
    id: 'B-03',
    category: 'belge',
    text: 'Sağlık kayıtları',
    sources: ['K-BURDUR'],
    status: 'taslak',
  },
  {
    id: 'B-04',
    category: 'belge',
    text: 'Sigorta belgelerinin kopyası',
    sources: ['K-GUVENLI-YASAM'],
    status: 'taslak',
  },
  {
    id: 'B-05',
    category: 'belge',
    text: 'Diploma ve benzeri önemli belgelerin kopyası',
    sources: ['K-CANTA-BB'],
    status: 'taslak',
  },

  // ----- Tehlike avı (tehlike) -----
  {
    id: 'H-01',
    category: 'tehlike',
    text: 'Rafları ve dolapları duvara sabitleyin.',
    sources: ['K-AILE', 'K-ONLEM2'],
    status: 'taslak',
  },
  {
    id: 'H-02',
    category: 'tehlike',
    text: 'Ağır ve büyük eşyaları alt raflara yerleştirin.',
    sources: ['K-AILE'],
    status: 'taslak',
  },
  {
    id: 'H-03',
    category: 'tehlike',
    text: 'Kavanoz ve şişeleri kilidi ya da mandalı olan kapalı dolaplarda tutun.',
    sources: ['K-AILE', 'K-TEHLIKE-AVI'],
    status: 'taslak',
  },
  {
    id: 'H-04',
    category: 'tehlike',
    text: 'Tablo ve aynaları yatak ve oturma yerlerinden uzak duvarlara sabitleyin.',
    sources: ['K-AILE', 'K-TEHLIKE-AVI'],
    status: 'taslak',
  },
  {
    id: 'H-05',
    category: 'tehlike',
    text: 'Tavandaki ağır nesnelerin ve aydınlatmaların bağlantılarını sağlamlaştırın.',
    sources: ['K-AILE'],
    status: 'taslak',
  },
  {
    id: 'H-06',
    category: 'tehlike',
    text: 'Su ısıtıcısı, buzdolabı, fırın gibi cihazları uygun malzemeyle duvara ya da yere sabitleyin.',
    sources: ['K-ONLEM'],
    status: 'taslak',
  },
  {
    id: 'H-07',
    category: 'tehlike',
    text: 'Tarım ve böcek ilaçlarını, yanıcı maddeleri kilitli, kapalı dolaplarda ve alt raflarda saklayın.',
    sources: ['K-ONLEM'],
    status: 'taslak',
  },
  {
    id: 'H-08',
    category: 'tehlike',
    text: 'Hasarlı elektrik kablosu ya da gaz bağlantısı varsa yetkili servise onartın; kendiniz işlem yapmayın.',
    sources: ['K-ONLEM'],
    status: 'taslak',
  },
  {
    id: 'H-09',
    category: 'tehlike',
    text: 'Çıkış yolunu kapatabilecek eşyaların yerini değiştirin.',
    sources: ['K-AILE', 'K-ONLEM2'],
    status: 'taslak',
  },
  {
    id: 'H-10',
    category: 'tehlike',
    text: 'Elektrik şalterinin, gaz ve su vanalarının yerini evdeki herkes bilsin.',
    sources: ['K-OKUL-TABANLI'],
    status: 'taslak',
  },

  // ----- Deprem öncesi (once) -----
  {
    id: 'O-01',
    category: 'once',
    text: 'Evinizde tehlike avı yapın: devrilebilecek, düşebilecek eşyaları belirleyip sabitleyin.',
    sources: ['K-UYARI'],
    status: 'taslak',
  },
  {
    id: 'O-02',
    category: 'once',
    text: 'Afet ve acil durum çantanızı hazırlayın.',
    sources: ['K-CANTA-BB', 'K-HAZIRIM-DEPREM'],
    status: 'taslak',
  },
  {
    id: 'O-03',
    category: 'once',
    text: 'Ailece Çök-Kapan-Tutun hareketini öğrenin ve deneyin.',
    sources: ['K-UYARI'],
    status: 'taslak',
  },
  {
    id: 'O-04',
    category: 'once',
    text: 'Oturduğunuz binanın yapı ruhsatı ve yapı kullanma izin belgesi olduğunu teyit edin.',
    sources: ['K-HAZIRIM-DEPREM'],
    status: 'taslak',
  },
  {
    id: 'O-05',
    category: 'once',
    text: 'Binanın taşıyıcı kolon ve duvarlarına müdahale edilmesine izin vermeyin.',
    sources: ['K-UYARI'],
    status: 'taslak',
  },
  {
    id: 'O-06',
    category: 'once',
    text: 'Binanızın dayanıklılığından emin değilseniz yetkili kuruluşlara inceletin.',
    sources: ['K-UYARI', 'K-HAZIRIM-DEPREM'],
    status: 'taslak',
  },
  {
    id: 'O-07',
    category: 'once',
    text: 'Konutunuzun Zorunlu Deprem Sigortası kapsamında olup olmadığını ve varsa poliçenin geçerliliğini kontrol edin.',
    sources: ['K-DASK'],
    status: 'taslak',
  },

  // ----- Deprem anı (an) -----
  {
    id: 'A-01',
    category: 'an',
    text: 'Bina içindeyseniz sakin kalmaya çalışın. Sarsıntı bitene kadar korunma pozisyonunda kalın.',
    sources: ['K-HAZIRIM-DEPREM'],
    status: 'taslak',
  },
  {
    id: 'A-02',
    category: 'an',
    text: 'İçeride güvenli bir yerde çökün, başınızı ve ensenizi koruyarak kapanın ve sabit bir yere tutunun. Tekerlekli sandalye kullanıyorsanız tekerlekleri kilitleyip başınızı ve boynunuzu koruyun.',
    sources: ['K-HAZIRIM-DEPREM', 'K-ONLEM2'],
    status: 'taslak',
  },
  {
    id: 'A-03',
    category: 'an',
    text: 'İçeride camlardan, dışarıya bakan duvar ve kapılardan ve üzerinize düşebilecek eşyalardan uzak durun.',
    sources: ['K-ONLEM'],
    status: 'taslak',
  },
  {
    id: 'A-04',
    category: 'an',
    text: 'Merdivenlere ve çıkışlara doğru koşmayın.',
    sources: ['K-ONLEM2'],
    status: 'taslak',
  },
  {
    id: 'A-05',
    category: 'an',
    text: 'Balkon, merdiven ve asansörlerden uzak durun.',
    sources: ['K-HAZIRIM-DEPREM'],
    status: 'taslak',
  },
  {
    id: 'A-06',
    category: 'an',
    text: 'Dışarıdaysanız enerji hatlarından, binalardan, direklerden, ağaçlardan ve duvar diplerinden uzaklaşın.',
    sources: ['K-ONLEM'],
    status: 'taslak',
  },

  // ----- Deprem sonrası (sonra) -----
  {
    id: 'S-01',
    category: 'sonra',
    text: 'Sarsıntı durduğunda kendinizi ve yakın çevrenizi kontrol edin. Güvenli bir çıkış varsa binayı tahliye edin.',
    sources: ['K-ONLEM', 'K-HAZIRIM-DEPREM'],
    status: 'taslak',
  },
  {
    id: 'S-02',
    category: 'sonra',
    text: 'Kibrit veya çakmak yakmayın, elektrik düğmelerine dokunmayın. Gaz kokusu varsa şaltere dokunmadan binayı hemen terk edin.',
    sources: ['K-GUVENLI-YASAM', 'K-ONLEM2'],
    status: 'taslak',
  },
  {
    id: 'S-03',
    category: 'sonra',
    text: 'Gaz kokusu yoksa ve tahliyeyi geciktirmeden güvenle ulaşabiliyorsanız, çıkarken gaz ve su vanalarını ve elektrik şalterini kapatın.',
    sources: ['K-BARTIN-TAHLIYE', 'K-ILK6'],
    status: 'taslak',
  },
  {
    id: 'S-04',
    category: 'sonra',
    text: 'Afet ve acil durum çantanız elinizin altındaysa alın. Güvenli çıkış yolunu izleyip afet ve acil durum toplanma alanına gidin.',
    sources: ['K-HAZIRIM-DEPREM', 'K-ONLEM2'],
    status: 'taslak',
  },
  {
    id: 'S-05',
    category: 'sonra',
    text: 'Enerji hatlarından ve hasarlı binalardan uzak durun. Yetkililer güvenli olduğunu açıklayana kadar hasarlı binalara girmeyin.',
    sources: ['K-ONLEM2', 'K-GUVENLI-YASAM'],
    status: 'taslak',
  },
  {
    id: 'S-06',
    category: 'sonra',
    text: 'Deniz kıyısındaysanız tsunami tehlikesine karşı kıyıdan uzaklaşıp yüksek bir yere çıkın.',
    sources: ['K-ONLEM'],
    status: 'taslak',
  },
  {
    id: 'S-07',
    category: 'sonra',
    text: 'Kendi güvenliğinizi gözeterek yardıma ihtiyaç duyan bebek, çocuk, yaşlı, engelli ve hamilelere destek olun.',
    sources: ['K-ONLEM2', 'K-ONLEM'],
    status: 'taslak',
  },
  {
    id: 'S-08',
    category: 'sonra',
    text: 'İlk saatlerde aracınızı kullanmayın ve yolları acil yardım araçlarına açık bırakın.',
    sources: ['K-HAZIRIM-DEPREM', 'K-ILK6'],
    status: 'taslak',
  },
  {
    id: 'S-09',
    category: 'sonra',
    text: 'Yetkililer yönlendirene kadar toplanma alanında kalın.',
    sources: ['K-ILK6'],
    status: 'taslak',
  },
  {
    id: 'S-10',
    category: 'sonra',
    text: 'Radyo ve televizyondan yapılan resmî uyarıları izleyin.',
    sources: ['K-ONLEM2'],
    status: 'taslak',
  },
];

/** Bir kategorideki maddeleri kayıt sırasıyla döndürür. */
export function contentByCategory(category: ContentCategory): ContentItem[] {
  return CONTENT_ITEMS.filter((item) => item.category === category);
}

/** Kimlikle madde bulur; yoksa `undefined`. */
export function getContentItem(id: string): ContentItem | undefined {
  return CONTENT_ITEMS.find((item) => item.id === id);
}

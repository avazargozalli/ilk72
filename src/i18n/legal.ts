/**
 * Şartname §14 — Gizlilik Bildirimi (14.1), Kullanım Koşulları ve Sorumluluk
 * Reddi (14.2), Künye ve İletişim (14.3), Erişilebilirlik Beyanı (14.4) ve
 * yasal sayfaların ortak alt bağlantıları.
 *
 * **Sözleşme (21.8 sayfa bileşenleri için):**
 * `tr.legal` = `{ privacy, terms, imprint, accessibility, footer }`.
 * Her yasal sayfa `{ title, sections }` taşır:
 *
 * - `title`: sayfanın `<h1>` başlığı (§14'teki başlık, birebir).
 * - `sections`: `{ heading?, paragraphs }` dizisi. `heading`, §14 metnindeki
 *   kalın ara başlıktır (noktalama işaretiyle birlikte); `paragraphs` ise o
 *   başlığın altındaki cümlelerdir. Başlığı olmayan son satırlar (ör. "Son
 *   güncelleme: …") başlıksız bir bölüm olarak durur. Her paragraf tek bir
 *   `<p>` olarak çizilir; metin bölünmez, yeniden yazılmaz.
 * - `footer.links`: yasal sayfaların altındaki çapraz bağlantılar; görünen
 *   etiketler `tr.nav.*` içinden, hedefler `ROUTES` içinden gelir. §14.5'teki
 *   zorunlu alt bilgi metni ve bağlantıları `tr.components.footer` ile
 *   `src/ui/components/Footer.tsx` içinde **tek yerde** durur; burada
 *   yinelenmez.
 *
 * §14 metinlerinin anlamı değiştirilmez; yalnızca `src/config.ts` içindeki
 * yer tutucular ve `{TARIH}` doldurulur (§0 kural 5, §14). Metinler avukat
 * onayına kadar taslaktır (bkz. `docs/hukuki-inceleme.md`).
 */
import { APP_NAME, APP_VERSION, ISSUES_URL, PROJECT, REPO_URL, ROUTES } from '../config.ts';
import { CONTENT_VERSION } from '../content/registry.ts';

/**
 * §14 metinlerinin son güncelleme / son değerlendirme tarihi. Şartnamenin
 * hazırlık tarihiyle aynıdır; metin değişirse bu tarih güncellenir.
 */
const UPDATED_AT = '2026-11-19';

/**
 * §14.4 "Bilinen eksikler" — dürüst ve kısa liste (İ9: sahte güven yok).
 * Elle erişilebilirlik doğrulaması A13'e kadar tamamlanmadığı için burada
 * başarı iddiası yer almaz.
 */
const KNOWN_ACCESSIBILITY_GAPS =
  'ekran okuyucuyla tam akışın elle doğrulaması sürüyor; gerçek telefonda, %200 yakınlaştırmada ve 320 px genişlikte deneme henüz tamamlanmadı; baskı çıktılarının cetvelle ölçümü ve en az üç kişiyle kullanılabilirlik denemesi bekliyor';

export interface LegalSection {
  /** §14'teki kalın ara başlık; yoksa bölüm başlıksızdır. */
  heading?: string;
  /** §14'teki satırların birebir hâli; her öğe ayrı bir paragraftır. */
  paragraphs: readonly string[];
}

export interface LegalPage {
  /** Sayfanın `<h1>` başlığı. */
  title: string;
  /** Sayfa gövdesi, §14'teki sırayla. */
  sections: readonly LegalSection[];
}

export const legal = {
  /** §14.1 — Gizlilik Bildirimi (`#/gizlilik`). */
  privacy: {
    title: 'Gizlilik Bildirimi',
    sections: [
      {
        heading: 'Kısaca:',
        paragraphs: ['Yazdıklarınız cihazınızdan çıkmaz. Sizi izlemiyoruz.'],
      },
      {
        heading: 'Hangi bilgiler nerede durur?',
        paragraphs: [
          'Planınıza yazdığınız her şey (adlar, telefonlar, adres, isterseniz sağlık bilgileri) yalnızca bu cihazdaki tarayıcının deposunda saklanır. Bize ya da başka birine gönderilmez. Sunucumuz, üyelik sistemimiz ya da veritabanımız yoktur; bu bilgilere erişemeyiz.',
        ],
      },
      {
        heading: 'Çerez ve izleme.',
        paragraphs: [
          'Çerez, analitik, reklam ya da izleme aracı kullanmıyoruz. Tarayıcı deposunu yalnızca planınızı ve ayarlarınızı saklamak için kullanıyoruz.',
        ],
      },
      {
        heading: 'Barındırma.',
        paragraphs: [
          `Uygulamanın dosyaları ${PROJECT.hostingProvider} üzerinden sunulur. GitHub, Pages ziyaretçilerinin IP adresini güvenlik amacıyla kaydeder. Proje sahibi bu kayıtlara erişemez. Uygulamayı bir kez açtıktan sonra internet olmadan da kullanabilirsiniz.`,
        ],
      },
      {
        heading: 'Paylaşım.',
        paragraphs: [
          'Bir özeti bağlantı ya da kare kodla paylaşırsanız bilgiler o bağlantının içinde taşınır; sunucuya gönderilmez. Bağlantıyı gören herkes içeriğini okuyabilir. Parola koyarsanız yalnızca parolayı bilenler okuyabilir. Bağlantıyı kimle paylaştığınız sizin sorumluluğunuzdadır.',
        ],
      },
      {
        heading: 'Başkalarının bilgileri.',
        paragraphs: [
          'Planınıza aile üyelerinizin ve yakınlarınızın bilgilerini yazıyorsunuz. Bu bilgileri yalnızca aileniz ve güvendiğiniz kişilerle paylaşın; adı geçenlere haber verin.',
        ],
      },
      {
        heading: 'Takvim hatırlatması.',
        paragraphs: ['İndirdiğiniz takvim dosyasında kişisel bilginiz yer almaz.'],
      },
      {
        heading: 'Silme.',
        paragraphs: [
          'Ayarlar sayfasındaki "Bütün verilerimi sil" düğmesi bu cihazdaki her şeyi kalıcı olarak siler. Yazdırdığınız kâğıtlar ve paylaştığınız bağlantılar sizdedir.',
        ],
      },
      {
        heading: 'İletişim.',
        paragraphs: [`${PROJECT.ownerName} — ${PROJECT.contactEmail}`],
      },
      {
        paragraphs: [`Son güncelleme: ${UPDATED_AT}`],
      },
    ],
  },

  /** §14.2 — Kullanım Koşulları ve Sorumluluk Reddi (`#/kosullar`). */
  terms: {
    title: 'Kullanım Koşulları ve Sorumluluk Reddi',
    sections: [
      {
        heading: 'Bu uygulama nedir?',
        paragraphs: [
          'İlk 72, ailenizin afet ve acil durum planını hazırlamanıza yardımcı olan ücretsiz ve açık kaynak bir araçtır. Gönüllü olarak geliştirilir.',
        ],
      },
      {
        heading: 'Ne değildir?',
        paragraphs: [
          "Resmî bir kurum uygulaması değildir; herhangi bir kurumla bağlantısı yoktur. Acil yardım hizmeti değildir; yardım çağırmaz, uyarı göndermez. Acil durumda 112'yi arayın. Tıbbi, hukuki, mühendislik ya da sigorta danışmanlığı vermez.",
        ],
      },
      {
        heading: 'İçerik.',
        paragraphs: [
          'Rehber metinleri resmî kurumların kamuya açık tavsiyelerinden özetlenmiştir ve her birinin kaynağı gösterilir. Özen göstermemize rağmen içerik eksik, eskimiş ya da durumunuza uygun olmayabilir. Güncel ve bağlayıcı bilgi için resmî kaynaklara ve yetkililerin yönlendirmelerine uyun. Afet anında yetkililerin talimatları her zaman bu uygulamadaki bilgilerden önce gelir.',
        ],
      },
      {
        heading: 'Sizin sorumluluğunuz.',
        paragraphs: [
          'Plana yazdığınız bilgilerin doğruluğu, güncelliği ve kimlerle paylaşıldığı sizin sorumluluğunuzdadır. Planın basılı bir kopyasını bulundurun; cihazınız afet anında çalışmayabilir.',
        ],
      },
      {
        heading: 'Garanti.',
        paragraphs: [
          'Uygulama "olduğu gibi" sunulur; kesintisiz ya da hatasız çalışacağı garanti edilmez. Yürürlükteki hukukun izin verdiği ölçüde, uygulamanın kullanımından doğabilecek zararlardan sorumluluk kabul edilmez. Bu madde, hukuken sınırlandırılamayan sorumlulukları kaldırmaz.',
        ],
      },
      {
        heading: 'Lisans.',
        paragraphs: ['Kaynak kodu MIT lisansı, rehber metinleri CC BY 4.0 lisansı altındadır.'],
      },
      {
        heading: 'Hata bildirimi.',
        paragraphs: [
          `Yanlış ya da eskimiş bir bilgi görürseniz lütfen bildirin: ${ISSUES_URL} ya da ${PROJECT.contactEmail}`,
        ],
      },
      {
        paragraphs: [`Son güncelleme: ${UPDATED_AT}`],
      },
    ],
  },

  /** §14.3 — Künye ve İletişim (`#/kunye`). */
  imprint: {
    title: 'Künye ve İletişim',
    sections: [
      {
        paragraphs: [
          `Sorumlu: ${PROJECT.ownerName} · E-posta: ${PROJECT.contactEmail} · Kaynak kodu: ${REPO_URL} · Barındırma: ${PROJECT.hostingProvider} · Uygulama sürümü: ${APP_VERSION} · İçerik sürümü: ${CONTENT_VERSION} · Ticari amaç taşımaz; bağış ya da ödeme kabul etmez.`,
        ],
      },
    ],
  },

  /** §14.4 — Erişilebilirlik Beyanı (`#/erisilebilirlik`). */
  accessibility: {
    title: 'Erişilebilirlik Beyanı',
    sections: [
      {
        paragraphs: [
          `Bu uygulamayı herkesin kullanabilmesini istiyoruz. Hedefimiz WCAG 2.2 AA düzeyidir. Klavye kullanımını ve metin boyutunu büyütmeyi destekliyoruz. Bilinen eksikler: ${KNOWN_ACCESSIBILITY_GAPS}. Bir engelle karşılaşırsanız ${PROJECT.contactEmail} adresine yazın; en geç 14 gün içinde yanıt vermeye çalışırız. Bu beyan gönüllüdür; resmî bir erişilebilirlik belgesi ya da logosu anlamına gelmez. Son değerlendirme: ${UPDATED_AT}`,
        ],
      },
    ],
  },

  /**
   * §14.5 — yasal sayfaların ortak alt bağlantıları. Görünen etiketler
   * `tr.nav`, hedefler `ROUTES` içindedir; metin burada yinelenmez.
   */
  footer: {
    navLabel: 'Yasal sayfalar',
    links: [
      { key: 'privacy', route: ROUTES.privacy },
      { key: 'terms', route: ROUTES.terms },
      { key: 'imprint', route: ROUTES.imprint },
      { key: 'accessibility', route: ROUTES.accessibility },
    ],
  },

  /** §11.1 — `#/hakkinda`: kısa tanıtım, ilkeler ve "ne değildir" (§20). */
  about: {
    title: 'Hakkında',
    sections: [
      {
        heading: 'Bu uygulama nedir?',
        paragraphs: [
          `${APP_NAME}, ailenizin afet ve acil durum planını hazırlamanıza yardımcı olan ücretsiz ve açık kaynak bir araçtır. Gönüllü olarak geliştirilir. Plan on dakikada doldurulur ve yazdırılır.`,
          `Uygulama çevrimdışı çalışır, hesap istemez ve yazdıklarınız yalnızca bu cihazda saklanır.`,
        ],
      },
      {
        heading: 'Ne değildir?',
        paragraphs: [
          'Resmî bir kurum uygulaması değildir; herhangi bir kurumla bağlantısı yoktur. Hiçbir kurumun adı, logosu ya da kurumsal rengi ürün kimliğinde kullanılmaz.',
          'Acil yardım hizmeti değildir; yardım çağırmaz, uyarı göndermez. Acil durumda 112’yi arayın.',
          'Tıbbi, hukuki, mühendislik ya da sigorta danışmanlığı vermez. İlk yardım uygulaması, ilaç önerisi, bina dayanıklılığı değerlendirmesi ve tesisat onarımı anlatılmaz; ilgili yetkili kaynağa yönlendirilir.',
        ],
      },
      {
        heading: 'İlkeler',
        paragraphs: [
          'Veri cihazda kalır; sunucu, hesap, senkronizasyon, analitik ve çerez yoktur.',
          'Uygulama kendi kökeni dışına ağ isteği yapmaz. Dış siteler yalnızca sizin tıkladığınız bağlantılarla, yeni sekmede açılır.',
          'Kâğıt önceliklidir: her akış sizi yazdırmaya ya da PDF kaydetmeye götürür.',
          'Kaynaksız tavsiye yoktur; her afet tavsiyesi resmî bir kaynağa bağlıdır, kendi cümlelerimizle yazılır ve kaynağı gösterilir.',
          'Sahte güven yoktur: “güvendesiniz” gibi ifadeler ve güvenlik puanı kullanılmaz; yalnızca planın hangi bölümlerinin dolu olduğu gösterilir.',
          'Para toplama ve tanıtım yoktur: bağış düğmesi, IBAN, reklam, ortaklık bağlantısı ve marka önerisi bulunmaz.',
        ],
      },
      {
        heading: 'Sürüm bilgisi',
        paragraphs: [`Uygulama sürümü: ${APP_VERSION} · İçerik sürümü: ${CONTENT_VERSION}`],
      },
    ],
  },

  /** §11.1, §13.1 — `#/kaynaklar`: rehber metinlerinin dayandığı resmî kaynaklar. */
  sources: {
    title: 'Kaynaklar',
    intro:
      'Rehber ve kontrol listesi metinleri resmî kurumların kamuya açık sayfalarına dayanır. Her maddenin kaynağı kendi kartında gösterilir; aşağıda kullanılan kaynakların tam listesi vardır.',
    note: 'Kurum adları yalnızca kaynak göstermek için düz metin olarak anılır. Bu uygulama resmî bir kurum uygulaması değildir.',
    accessLabel: 'Erişim tarihi',
    unverifiedLabel: 'Doğrulanmadı',
  },
} as const;

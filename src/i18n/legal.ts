/** Şartname §14 kapsamındaki güncel kullanıcı metinleri. Yayın incelemesi: docs/hukuki-inceleme.md. */
import { APP_NAME, APP_VERSION, ISSUES_URL, PROJECT, REPO_URL, ROUTES } from '../config.ts';
import { CONTENT_VERSION } from '../content/registry.ts';

const UPDATED_AT = '25.11.2026';
const contactLink = { label: PROJECT.contactEmail, href: `mailto:${PROJECT.contactEmail}` };
const issuesLink = { label: 'GitHub’da hata bildir', href: ISSUES_URL };
const githubPrivacyLink = {
  label: 'GitHub gizlilik bildirimi',
  href: 'https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement',
};

export interface LegalSection {
  heading?: string;
  paragraphs: readonly string[];
  links?: readonly { label: string; href: string }[];
}

export interface LegalPage {
  title: string;
  sections: readonly LegalSection[];
}

export const legal = {
  privacy: {
    title: 'Gizlilik Bildirimi',
    sections: [
      {
        heading: 'Planınız bu tarayıcıda saklanır',
        paragraphs: [
          'Uygulama planınızı ve ayarlarınızı kendi sunucusuna göndermez. Hesap açmadan kullanabilirsiniz. Proje ekibi, uygulamaya girdiğiniz ad, telefon, adres, not veya sağlık bilgilerine erişmez.',
          'Plan ve ayarlar bu tarayıcı profilinin yerel deposuna yazılır. Uygulama kilidi isteğe bağlıdır. Kilidi etkinleştirirseniz kayıtlı plan şifrelenir. Parolanızı saklayın. Tarayıcı verisini temizlerseniz veya cihazınızı kaybederseniz planı geri yüklemek için bir yedeğe ihtiyaç duyarsınız.',
        ],
      },
      {
        heading: 'Çerezler ve çevrimdışı kullanım',
        paragraphs: [
          'Uygulama çerez, reklam, analitik veya izleme aracı kullanmaz. Tarayıcı planınızı ve ayarlarınızı yerel depoda tutar, uygulama dosyalarını ise çevrimdışı kullanım için önbelleğe alır.',
        ],
      },
      {
        heading: 'Barındırma ve dış bağlantılar',
        paragraphs: [
          `Uygulama dosyalarını ${PROJECT.hostingProvider} sunar. GitHub, siteyi çevrimiçi ziyaret ettiğinizde IP adresinizi güvenlik amacıyla kaydettiğini bildirir. Proje ekibi Pages erişim günlüklerini uygulamada toplamaz veya görüntülemez. GitHub, kişisel verileri ABD’de ve başka ülkelerde işleyebileceğini bildirir.`,
          'Resmî kaynaklara veya GitHub’a giden bağlantıları açtığınızda ilgili sitenin gizlilik kuralları uygulanır.',
        ],
        links: [
          {
            label: 'GitHub Pages ziyaretçi kayıtları',
            href: 'https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages#data-collection',
          },
          githubPrivacyLink,
        ],
      },
      {
        heading: 'Bağlantı, kare kod, yedek ve baskı',
        paragraphs: [
          'Özet kartı bağlantının # işaretinden sonraki bölümünde taşınır. Tarayıcı bu bölümü normal sayfa isteğinde barındırma sunucusuna göndermez. Parolasız bağlantıyı veya kare kodu alan herkes özeti açabilir. Parolalı özette güçlü bir parola seçin ve parolayı ayrı bir kanaldan gönderin.',
          'Özet kartta adlar, telefonlar, buluşma yerleri ve plan notu bulunabilir. Ev adresi ve sağlık için ayrılmış alanlar özete eklenmez. Serbest metne yazdığınız bilgiler ve seçerseniz destek ihtiyacı notları özette görünebilir. Göndermeden önce bunları kontrol edin.',
          'Yedek dosyası planın tamamını içerebilir. Yedekleme parolası seçmezseniz dosyayı açan herkes içeriği okuyabilir. Yazdırılan belgelerde ve PDF’lerde seçtiğiniz ayrıntılar bulunur. Kopyalama, mesajlaşma, yazdırma ve bulut depolama için seçtiğiniz hizmetler bu kopyalara erişebilir veya onları saklayabilir.',
          'Takvim dosyası hatırlatma tarihini ve bir etkinlik tanımlayıcısını içerir. Planınızdaki ad, telefon, adres ve sağlık alanları dosyaya eklenmez. Dosyayı içe aktardığınız takvim, etkinliği kendi hesabınıza kaydedebilir.',
        ],
      },
      {
        heading: 'Başkalarının ve çocukların bilgileri',
        paragraphs: [
          'Afet planı için gereken en az bilgiyi yazın. Başkasının bilgilerini kaydetmeden ve paylaşmadan önce kişiyi bilgilendirin ve bunu yapmaya yetkili olduğunuzdan emin olun. Çocuklarla ilgili kayıt ve kartları velileri veya yasal temsilcileri yönetmelidir. Okul, konum ve sağlık ayrıntılarını ancak gerektiğinde ekleyin.',
          'Sağlık bilgisi özel nitelikli kişisel veridir. Destek ihtiyacı ve serbest metin de sağlık bilgisi içerebilir. Uygulamadaki sağlık alanlarını açmak yalnızca bir cihaz ayarıdır. Kanuni bir işleme sebebinin veya gerektiğinde kişinin açık rızasının yerini tutmaz.',
          'KVKK’daki kişisel ve ailevi faaliyet istisnası, gerçek kişinin yalnızca kendisi veya aynı konutta yaşayan aile fertleriyle ilgili faaliyetlerinde, veri güvenliğini sağlaması ve bilgileri üçüncü kişilere vermemesi şartıyla uygulanır.',
        ],
      },
      {
        heading: 'Planı silme',
        paragraphs: [
          'Ayarlar’daki “Bütün verilerimi sil” düğmesi bu tarayıcı profilindeki planı ve ayarları temizler. Diğer açık İlk 72 sekmelerini kapatın veya yenileyin. İndirilen yedek ve PDF’leri, takvim kayıtlarını, basılı belgeleri ve gönderilen kopyaları bulundukları yerden ayrıca kaldırın. Daha önce gönderdiğiniz bir özeti cihazınızdan geri alamazsınız.',
        ],
      },
      {
        heading: 'Geri bildirim gönderirseniz',
        paragraphs: [
          `Proje yazışmalarında veri sorumlusu ${PROJECT.ownerName}’dir. Size yanıt vermek, bildirdiğiniz sorunu incelemek ve proje güvenliğini sağlamak için doğrudan gönderdiğiniz e-postadaki adresinizi, varsa adınızı ve mesajınızı ya da GitHub bildiriminizde görünen kullanıcı adınızı ve bildiriminizi işler. Bu işlemler, temel haklarınıza zarar vermemek kaydıyla proje desteği ve güvenliği için gerekli olduğunda KVKK m.5/2-f kapsamındaki meşru menfaate dayanır. Hukuki yükümlülüğün yerine getirilmesi veya bir hakkın korunması gereken durumlarda m.5/2-ç ve m.5/2-e uygulanabilir.`,
          'E-posta Gmail üzerinden, depo bildirimleri GitHub üzerinden alınır. Bu sağlayıcılar verileri yurt dışında işleyebilir. Herkese açık GitHub bildirimleri, yorumlar ve ekler başkaları tarafından görülebilir ve kopyalanabilir. Kanuni bir yükümlülük varsa iletiler yetkili mercilere verilebilir. Gerçek plan verisi, sağlık bilgisi, paylaşım bağlantısı, yedek veya parola göndermeyin. Bir hatayı örnek verilerle anlatın.',
        ],
        links: [
          contactLink,
          githubPrivacyLink,
          {
            label: 'Google gizlilik politikası',
            href: 'https://policies.google.com/privacy?hl=tr',
          },
        ],
      },
      {
        heading: 'KVKK kapsamındaki haklarınız',
        paragraphs: [
          'KVKK m.11 uyarınca verinizin işlenip işlenmediğini öğrenebilir, işlenmişse bilgi isteyebilir, amacını ve amaca uygun kullanımı ile yurt içinde veya dışında aktarıldığı üçüncü kişileri öğrenebilirsiniz. Eksik veya yanlış verilerin düzeltilmesini, kanuni şartlar oluştuğunda silinmesini veya yok edilmesini ve bu işlemlerin ilgili alıcılara bildirilmesini isteyebilirsiniz. Yalnızca otomatik işlemle aleyhinize çıkan sonuca itiraz edebilir, Kanuna aykırı işleme nedeniyle zararınız varsa giderilmesini talep edebilirsiniz.',
          `Başvuru usulü ve uygun iletim kanalı için ${PROJECT.contactEmail} adresinden bilgi alabilirsiniz. Başvurunuzu Tebliğ’e uygun bir yolla iletin. Örneğin projeye daha önce bildirdiğiniz ve kayıtlarda bulunan e-posta adresinizi kullanabilirsiniz. Başvurunuzu GitHub’da yayımlamayın. Projeye usulüne uygun ulaşan başvurular en geç 30 gün içinde sonuçlandırılır. Kurula şikâyet koşulları ve süreleri başvuru rehberinde açıklanır.`,
        ],
        links: [
          {
            label: 'Kişisel Verileri Koruma Kurumu başvuru rehberi',
            href: 'https://www.kvkk.gov.tr/Icerik/2062/Basvuru-Hakki',
          },
          contactLink,
        ],
      },
      { paragraphs: [`Son güncelleme ${UPDATED_AT}`] },
    ],
  },

  terms: {
    title: 'Kullanım Koşulları ve Sorumluluk Reddi',
    sections: [
      {
        heading: 'Uygulamanın amacı',
        paragraphs: [
          'İlk 72, hane halkının afet ve acil durum planını hazırlaması ve yazdırması için gönüllü olarak geliştirilen, ücretsiz ve açık kaynak bir araçtır.',
          "Bağımsız bir projedir. Acil durumda 112'yi arayın. Uygulama yardım çağrısı iletmez, erken uyarı göndermez ve tıbbi, hukuki, mühendislik ya da sigorta danışmanlığı vermez.",
        ],
      },
      {
        heading: 'Resmî kaynaklar ve planın kullanımı',
        paragraphs: [
          'Rehber kartları, yanında belirtilen resmî kaynaklara dayalı kısa özetlerdir. Afet anında yetkili kurumların güncel duyurularını ve talimatlarını izleyin. Toplanma alanını e-Devlet’teki resmî hizmetten kendiniz doğrulayın.',
          'Plandaki bilgileri düzenli olarak gözden geçirin ve basılı bir kopyasını erişebileceğiniz yerde saklayın. Paylaşmadan önce içeriği ve alıcıyı kontrol edin. Çocuk kartındaki bilgiler, okulun veya yetkili mercilerin teslim usullerinin yerini tutmaz.',
        ],
      },
      {
        heading: 'Garanti ve kanuni haklar',
        paragraphs: [
          'Uygulama mevcut haliyle sunulur. Kesintisiz çalışma, tarayıcının kayıtları saklaması veya rehberin her duruma uygunluğu için ayrıca garanti verilmez.',
          'Kanundan doğan haklar, ağır kusura ilişkin sorumluluk ve emredici hukuk kuralları saklıdır.',
        ],
      },
      {
        heading: 'Kod ve içerik lisansları',
        paragraphs: [
          'Kaynak kodu MIT lisansı kapsamındadır. Projenin özgün rehber metinleri, arayüz metinleri ve belgeleri CC BY 4.0 kapsamında sunulur. Üçüncü taraf kaynak ve varlıklarının hakları kendi sahiplerine aittir. Kurum adları, kaynağı belirtmek için kullanılır.',
        ],
        links: [
          { label: 'MIT kod lisansı', href: `${REPO_URL}/blob/main/LICENSE` },
          { label: 'CC BY 4.0 içerik lisansı', href: `${REPO_URL}/blob/main/LICENSE-CONTENT` },
          {
            label: 'Üçüncü taraf lisansları',
            href: `${REPO_URL}/blob/main/THIRD_PARTY_LICENSES.md`,
          },
        ],
      },
      {
        heading: 'İçerik hatası veya hak ihlali bildirimi',
        paragraphs: [
          'Yanlış bir tavsiye veya çalışmayan kaynak bağlantısı görürseniz ilgili maddenin adını ve varsa güncel resmî bağlantıyı gönderin. Hak ihlali veya gizlilikle ilgili konular için e-posta kullanın ve yalnızca gerekli bilgileri verin.',
        ],
        links: [issuesLink, contactLink],
      },
      { paragraphs: [`Son güncelleme ${UPDATED_AT}`] },
    ],
  },

  imprint: {
    title: 'Künye ve İletişim',
    sections: [
      {
        heading: 'Proje ve yayın bilgileri',
        paragraphs: [
          `Sorumlu kişi ${PROJECT.ownerName}`,
          `Barındırma sağlayıcısı ${PROJECT.hostingProvider}`,
          `Uygulama sürümü ${APP_VERSION} · İçerik sürümü ${CONTENT_VERSION}`,
          'İlk 72 bağımsız, gönüllü bir açık kaynak projesidir. Ücretsizdir ve bağış ya da ödeme kabul etmez.',
        ],
        links: [{ label: 'Kaynak kodu deposu', href: REPO_URL }],
      },
      {
        heading: 'İletişim',
        paragraphs: [
          'İçerik veya erişilebilirlik hatalarını GitHub’da paylaşabilirsiniz. Özel konuları e-posta ile iletin. Herkese açık bildirimlere kişisel bilgi veya plan dosyası eklemeyin.',
        ],
        links: [contactLink, issuesLink],
      },
      { paragraphs: [`Son güncelleme ${UPDATED_AT}`] },
    ],
  },

  accessibility: {
    title: 'Erişilebilirlik Beyanı',
    sections: [
      {
        heading: 'Kapsam ve hedef',
        paragraphs: [
          'İlk 72 web uygulaması ve hane planı akışı için hedefimiz WCAG 2.2 AA düzeyidir. Uygulama klavyeyle gezinmeyi, görünür odağı ve “Büyük yazı” seçeneğini destekler. Boş plan formu yazdırılabilir.',
          'Bu beyan gönüllü olarak yayımlanır. Erişilebilirlik değerlendirmesi devam ediyor.',
        ],
        links: [{ label: 'WCAG 2.2 ölçütleri', href: 'https://www.w3.org/TR/WCAG22/' }],
      },
      {
        heading: 'Değerlendirme ve bilinen eksikler',
        paragraphs: [
          'Sayfaları otomatik erişilebilirlik testleriyle kontrol ediyoruz. Ekran okuyucuyla tam akış, gerçek telefonda kullanım, tarayıcıda %200 yakınlaştırma ve basılı kartların ölçümü için manuel doğrulama sürüyor.',
        ],
      },
      {
        heading: 'Bir erişim engelini bildirin',
        paragraphs: [
          'Ulaşamadığınız sayfayı veya tamamlayamadığınız adımı bildirin. İsterseniz cihazınızı, tarayıcınızı ve kullandığınız yardımcı teknolojiyi belirtin. Kişisel plan verisi eklemeyin. 14 gün içinde ilk yanıtı vermeyi hedefliyoruz.',
        ],
        links: [
          contactLink,
          {
            label: 'GitHub’da erişilebilirlik sorunu bildir',
            href: `${ISSUES_URL}/new?template=erisilebilirlik.yml`,
          },
        ],
      },
      { paragraphs: [`Beyan güncelleme tarihi ${UPDATED_AT}`] },
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
          `${APP_NAME}, ailenizin afet ve acil durum planını hazırlamanıza yardımcı olan ücretsiz ve açık kaynak bir araçtır. Gönüllü olarak geliştirilir. Planınızı yazdırabilir ve çevrimdışı kullanabilirsiniz.`,
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
          'Veri cihazda kalır. Uygulama planı kendiliğinden göndermez ve hesap istemez.',
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

# Hukuki İnceleme — İlk 72

**Mevzuat ve uygulama ön incelemesi:** 25.11.2026

**Kapsam:** Türkiye’de hane halkının afet planı için yayımlanması planlanan, ücretsiz ve hesapsız
statik web uygulaması ile buna bağlı açık GitHub deposu ve proje iletişim kanalları.

İncelemede `src/i18n/legal.ts`, yerel depolama, yedek, paylaşım, baskı ve takvim akışları,
proje künyesi, kaynak kayıtları, lisanslar ve Pages iş akışı esas alındı. Uygulama içindeki
kullanıcı metinleri bu incelemeye göre güncellendi. Bölüm 5, yayınlanacak sürümü inceleyen
avukatın görüşünü kaydetmek içindir. Proje şartnamesi ayrıca afet rehberindeki her madde için
[ayrı içerik incelemesi](icerik-onay.md) öngörür.

Bu dosyadaki kaynak ve uygulama incelemesi mesleki görüşe hazırlık kaydıdır. Avukat görüşü
ve afet uzmanı onayı bu projenin yayın koşullarıdır. Resmî kaynaklarla madde düzeyindeki
karşılaştırmalar içerik inceleme kayıtlarında izlenir.

## 1. Veri akışları

| Akış | Bugünkü tasarım | Yayın öncesi doğrulama |
|---|---|---|
| Plan ve ayarlar | Ad, telefon, adres, buluşma yerleri, notlar ve isteğe bağlı sağlık bilgileri IndexedDB’de, saklama kullanılamazsa oturum belleğinde kalır. Uygulama planı bir servise göndermez. İsteğe bağlı kilit kayıtlı planı şifreler. | Üretim çıktısında dış ağ isteği ve telemetri kontrolü. Yerel işlemede rollerin KVKK m.3 ölçütleriyle teyidi. |
| Yedek, özet, baskı ve takvim | Kullanıcı tam yedek, basılı belge, PDF, özet bağlantısı/kare kod veya takvim dosyası oluşturabilir. Özet, URL parçasında taşınır. Serbest metinler sağlık, adres ve okul bilgisi içerebilir. Kopyalar seçilen cihaz veya hizmette kalabilir. Takvim dosyasında seçilen tarih ve etkinlik tanımlayıcısı bulunur. | Kopyalama ve paylaşmadan önce doğru kapsam uyarısı. Alıcının veya platformun veriyi kullanma biçimi yayıncının yerel saklama mimarisinden bağımsızdır. |
| GitHub Pages | Sağlayıcı, çevrimiçi ziyaretçinin IP adresini güvenlik amacıyla kaydettiğini bildirir. Uygulama kodunda erişim günlüklerini toplama veya görüntüleme işlevi yok. | Pages hesabındaki erişimler, sağlayıcının rolü, varsa alt işleyenler, saklama, işlem ülkeleri ve aktarım mekanizması. |
| Gmail ve GitHub depo etkileşimleri | Proje e-postasına ya da depoya ulaşan mesajlar, hesap adı, e-posta, içerik ve ekler görülebilir. Herkese açık Issues, yorum ve PR ekleri başkaları tarafından kopyalanabilir. | Proje sahibinin fiilî erişimi, gönderim/aktarım yönü, hukuki sebep ve denge testi, sağlayıcı sözleşmeleri, saklama-imha ve usulüne uygun başvuru kanalı. |

GitHub’un [Pages ziyaretçi kaydı açıklaması](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages#data-collection),
[depo görünürlüğü](https://docs.github.com/en/repositories/creating-and-managing-repositories/about-repositories#about-repository-visibility)
ve [gizlilik bildirimi](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).
Gmail için [Google veri aktarımı açıklaması](https://policies.google.com/privacy/frameworks?hl=tr).

25.11.2026 tarihinde depo ayarları, Pages'in GitHub Actions üzerinden ve zorunlu HTTPS ile
yapılandırıldığını gösterdi. `github-pages` ortamında dağıtım kaydı bulunmadı ve proje adresi
HTTP 404 döndürdü. Sağlayıcı sözleşmesi, erişim günlükleri ve fiilî saklama koşulları bu ayarlardan
doğrulanamaz. [GitHub Pages ayarları API’si](https://docs.github.com/en/rest/pages/pages)

## 2. Şartname §4.4 soruları

### S1 · Yerel plan verisinde veri sorumlusu

KVKK m.2 ve m.3 uyarınca belirleyici olan ilgili işleme faaliyetinin amaç ve vasıtalarını kimin
belirlediğidir. Kullanıcı planın amacını, kişileri, girdiği bilgileri ve kopyaların alıcılarını
seçiyor. Geliştirici statik aracı sunuyor ve planı teslim almıyor. Bu olgular, mevcut tasarımda
planın yerel işlenmesi bakımından proje sahibinin veri sorumlusu olmaması yönündeki
değerlendirmeyi destekler. Teknik erişimin bulunmaması tek başına rolü belirlemez. Yayıncı rolü,
barındırma ve yazışma için ayrıca incelenir. Gizlilik bildirimi kullanıcıya doğrulanabilen veri
akışını açıklar. [6698 sayılı Kanun](https://www.mevzuat.gov.tr/MevzuatMetin/1.5.6698.pdf) ·
[Kurulun veri sorumlusu/veri işleyen ölçütleri, 2020/71](https://www.kvkk.gov.tr/Icerik/6874/2020-71)

### S2 · Barındırma, yazışma ve yurt dışına aktarım

KVKK m.9’un 7499 sayılı Kanun’la değişen rejiminde veri sorumlusu veya işleyen tarafından yurt
dışına aktarım, m.5 veya m.6’daki bir işleme şartıyla birlikte yeterlilik kararı veya uygun
güvenceye dayanır. Kurulun standart sözleşmesi kullanılırsa imzadan itibaren beş iş günü içinde
Kurum’a bildirilir. m.9/6’daki istisnalar, yeterlilik ve uygun güvence bulunmadığında arızi
aktarımlarla sınırlıdır. Bir gizlilik politikası veya yabancı hukuka göre hazırlanmış sözleşme
tek başına Türk hukukundaki mekanizmayı kurmaz. [7499 sayılı Kanun m.33–34](https://cdn.tbmm.gov.tr/KKBSPublicFile/D28/Y2/KanunMetni/48c107c3-a4dc-468e-bcf2-f7c8c24af1b0.htm) ·
[Yurt dışına aktarım yönetmeliği](https://www.resmigazete.gov.tr/eskiler/2024/07/20240710-2.htm) ·
[Kurumun aktarım rehberi, §4.A](https://www.kvkk.gov.tr/Icerik/8143/Kisisel-Verilerin-Yurt-Disina-Aktarilmasi-Rehberi)

GitHub, güvenlik kaydının amacını kendi belgesinde açıklıyor. Bir kişinin verisini yabancı veri
sorumlusuna doğrudan vermesi ile proje sahibinin veriyi bir sağlayıcıya aktarması farklı
olaylardır. GitHub Pages için proje hesabından erişim ve talimat yetkisi, depo etkileşimleri
için ise kimin hangi veriyi aldığı ve başka yere ilettiği doğrulanmalıdır. GitHub’u seçmek
ve günlükleri görmemek m.9 sonucunu tek başına belirlemez. Kurul, Gmail’in projece yazışma
altyapısı olarak kullanılması değerlendirmesine yakın bir olayda yabancı veri merkezinde
saklamayı aktarım kabul etmiştir. Kararın aktarım rejimi eski hükme dayanır. Bugün Gmail ve
GitHub akışlarını ayrı ayrı güncel m.9’a göre incelemek gerekir. Uygun güvence sağlanamazsa
posta ve gerekirse barındırma için fiilî işleme ve uzaktan erişimi Türkiye ile sınırlanan
sağlayıcı seçeneği değerlendirilmeli, süreç ve kullanıcı metni yeni duruma göre güncellenmelidir.
[Kurul kararı 2019/157](https://www.kvkk.gov.tr/Icerik/5493/2019-157)

### S3 · 5651 ve künye

Proje sahibi, yayımladığı rehber ve uygulama bakımından 5651 m.2 ve m.4 anlamında içerik
sağlayıcıdır. İçeriği barındıran sistemleri sağlayan veya işleten tarafın yer sağlayıcı rolü
m.2 ve m.5 kapsamında ayrıca değerlendirilir. Dış bağlantılar için m.4/2, bağlantının sunuluşundan
içeriği benimseme ve kullanıcının ulaşmasını amaçlama açıkça anlaşılırsa genel hükümleri saklı
tutar. m.3 ile yönetmelik m.5 birlikte değerlendirilir. Ücretsiz, reklamsız, bağışsız mevcut
modelde ticari veya ekonomik faaliyet görünmüyor. Künye sorumlu kişiyi, iletişimi ve barındırmayı
gösteriyor. Faaliyetin niteliği değişirse yönetmelikte sayılan kimlik, tebligat adresi, telefon,
e-posta ve barındırma bilgilerinden uygulanabilir olanları yayıncı doğrular.
[5651 sayılı Kanun](https://mevzuat.adalet.gov.tr/mevzuat/103224?query=5651) ·
[İnternet Yayınları Yönetmeliği](https://www.resmigazete.gov.tr/eskiler/2007/11/20071130-6.htm)

### S4 · Sorumluluk ve tüketici hukuku

TBK m.20–25, standart sözleşme hükümlerinin dâhil edilmesi ve içerik denetimi bakımından
önemlidir. m.49 ve devamı, hukuka aykırı kusurlu fiilin yol açtığı zararlarda uygulanabilir.
m.115 karşısında ağır kusura ilişkin sorumluluğu önceden kaldıran anlaşma geçersizdir.
Güncel kullanım metni hizmetin işlevini ve garanti sınırlarını açıklar ve kanuni hakları saklı
tutar. Ücretsiz ve mesleki veya ticari amaçla sunulduğuna dair işaret bulunmayan bu dağıtımda
6502 m.2, 3 ve 6563 m.2 kapsamına giren bir tüketici işlemi veya elektronik ticaret faaliyeti
görünmüyor. Bir ticari sağlayıcı devralır, karşılıklı edim veya ticari ileti eklenirse kapsamı,
6502 m.5’teki haksız şart denetimini ve 6563 hükümlerini tekrar inceleyin. İlk açılıştaki
“Anladım, başla” seçimi yerel bir bilgilendirme durumudur.
[TBK](https://www.mevzuat.gov.tr/MevzuatMetin/1.5.6098.pdf) ·
[6502](https://www.mevzuat.gov.tr/MevzuatMetin/1.5.6502.pdf) ·
[6563](https://www.mevzuat.gov.tr/MevzuatMetin/1.5.6563.pdf)

### S5 · Resmî kaynaklar, telif ve işaretler

FSEK m.31’in resmen yayımlanan mevzuat ve yargı kararlarına ilişkin serbestisi, kamuya açık
kurum kılavuzları, afişleri ve fotoğrafları için otomatik lisans sağlamaz. Koruma eserin niteliğine
göre değerlendirilir. FSEK m.35 kapsamındaki alıntıların kapsamı amaçla orantılı olmalı ve alıntı
belirtilmelidir. Proje, tavsiyeyi özgün cümleyle özetler, kurum ve kaynağı düz metin ve
bağlantıyla gösterir. Görsel ve işaretleri proje markası olarak kullanmaz. Kurum adı kullanımının
kaynak belirtme ile sınırlı oluşu, 6769 m.7 ve iltibas riski açısından önemlidir. Yeniden kullanım
kararı öncesi üçüncü taraf içerik ve depo görsellerinin kökeni teyit edilmelidir.
[FSEK](https://www.mevzuat.gov.tr/MevzuatMetin/1.3.5846.pdf) ·
[Bakanlığın telif açıklamaları](https://telifhaklari.ktb.gov.tr/TR-332449/genel-sorular.html) ·
[6769 sayılı Kanun](https://www.turkpatent.gov.tr/tr/mevzuat)

### S6 · e-Devlet bağlantısı ve afet yetkileri

Kullanıcı tıklayınca [AFAD toplanma alanı sorgulaması](https://www.turkiye.gov.tr/afet-ve-acil-durum-yonetimi-acil-toplanma-alani-sorgulama)
e-Devlet’te açılır. Kullanıcı burada kimliğini doğrular ve sonucu uygulamaya kendisi yazabilir.
Mevcut akışta otomatik sorgu, oturum, kullanıcı adına işlem veya gömülü kimlik ekranı bulunmaz.
Bağlantının sağlayıcının kurallarına ve güncel adrese uygunluğu yayın öncesi kontrol edilir.
[Kapının gizlilik ve kullanım bilgileri](https://www.turkiye.gov.tr/bilgilendirme?konu=gizlilik&theme=default)

Afet ve Acil Durum Müdahale Hizmetleri Yönetmeliği (Karar 10809, 31.12.2025, RG 33124,
5. Mükerrer) m.37, 2022 yönetmeliğini kaldırdı. Güncel m.4/1-i toplanma alanını tanımlar,
m.14/8’de belirleme, işaretleme ve denetim, m.14/16’da tahliye, m.16/6’da 112 ve m.24’te
AFAD görevleri düzenlenir. Uygulama tek acil çağrı numarası olarak 112’yi gösterir ve yerel plan
oluşturur. Yetkililerin güncel yönlendirmesi esastır.
[Güncel Yönetmelik](https://www.resmigazete.gov.tr/eskiler/2025/12/20251231M5-15.pdf) ·
[112 Acil Çağrı Merkezi](https://www.112.gov.tr/)

### S7 · Hane istisnası, sağlık ve çocuklar

KVKK m.28/1-a, gerçek kişinin yalnızca kendisiyle veya aynı konuttaki aile fertleriyle ilgili
faaliyeti, veri güvenliğine uyum ve veriyi üçüncü kişilere vermeme şartlarını birlikte arar.
Başka hanede yaşayan yakının, bakıcının veya komşunun kaydı ile planın üçüncü kişiye
gönderilmesi için genel bir aile istisnası varsayılamaz. İstisna dışındaki sağlık verilerinde
güncel m.6’daki şartlar ve Kurulun yeterli önlemleri değerlendirilir. Sağlık alanı anahtarı
işlevsel bir seçimdir. Fiilî bir acilde, kendi rızasını açıklayamayan kişinin hayatı veya beden
bütünlüğünü korumak için zorunlu ve ölçülü bilgi verme, m.6/3-c kapsamında değerlendirilebilir.
Bu hüküm hazırlık aşamasındaki rutin kaydetme ve paylaşmayı kendiliğinden kapsamaz.
[Kurumun kanunun kapsamı açıklaması](https://www.kvkk.gov.tr/SharedFolderServer/CMSFiles/4d1c6565-b087-4bfb-b148-70e75b2549a5.pdf) ·
[Özel nitelikli kişisel veri rehberi](https://www.kvkk.gov.tr/Icerik/8183/Ozel-Nitelikli-Kisisel-Verilerin-Islenmesine-Iliskin-Rehber) ·
[Kurul kararı 2018/10](https://www.kvkk.gov.tr/Icerik/4110/2018-10)

Çocuğun yararı, ayırt etme gücü ve yasal temsil yetkisi somut olayda dikkate alınır. KVKK,
bu uygulama için tek bir genel çocuk rıza yaşı belirlemiyor. Çocuk kartında ev adresi için alan
yoktur. Okul adı isteğe bağlıdır. Not ve buluşma alanlarında hassas bilgi en aza indirilir.
Kart, çocuğun teslimiyle ilgili okul kurallarını veya velayet kararlarını değiştirmez.
[TMK m.13, 16, 24–25, 335, 339 ve 342](https://www.mevzuat.gov.tr/MevzuatMetin/1.5.4721.pdf) ·
[Kurul kararı 2020/622](https://www.kvkk.gov.tr/Icerik/6816/2020-622)

### S8 · Destek, bağış ve kamu yararı

Bugünkü dağıtımda ödeme, sponsorluk ve yardım çağrısı yoktur. Bir yöntem eklenirse 2860
m.2–6, 29 ve ilgili yönetmelik uyarınca çağrının içeriği, kimin adına, ne için ve nasıl
para toplandığı incelenmelidir. İnternette izinsiz yardım toplama için m.6’da içeriğin
çıkarılmasını ve erişimin engellenmesini içeren süreç vardır. “Kamu yararına çalışan dernek”
5253 m.27 kapsamında ayrı bir statüdür. Proje künyesinde bağımsız açık kaynak projesi
tanımı kullanılır. [2860 sayılı Kanun](https://www.mevzuat.gov.tr/MevzuatMetin/1.5.2860.pdf) ·
[İnternet düzenlemesini getiren 7262 m.7](https://resmigazete.gov.tr/eskiler/2020/12/20201231M5-19.htm) ·
[5253 sayılı Kanun](https://www.mevzuat.gov.tr/MevzuatMetin/1.5.5253.pdf)

### S9 · Ad ve görsel kimlik

6769 m.5–7 bakımından “İlk 72”, “İlk72”, “Ilk 72”, “İlk 72 Saat” ve benzer işaretler
TÜRKPATENT sicilinde yazılım, çevrimiçi yazılım hizmetleri ve eğitim içerikleriyle ilgili
mal ve hizmetler yönünden araştırılmalıdır. Lafzî arama, karıştırılma ihtimali veya görsel
benzerlik hakkında tek başına sonuç vermez. İkon için de özgünlük ve kullanım hakkı
teyit edilir. 25.11.2026’da TÜRKPATENT’in açık sicilinde tüm sınıflarda “İlk 72” için “içinde geçen”
ön sorgusu kayıt döndürmedi. Bitişik yazım sorgusunun sonucu doğrulanamadı. Sınıf, yazım
ve görsel benzerlik araştırması ile işaretin ayırt ediciliği incelemesi açık.
[TÜRKPATENT Marka Araştırma](https://www.turkpatent.gov.tr/research) ·
[TÜRKPATENT Marka İnceleme Kılavuzu](https://www.turkpatent.gov.tr/tr/duyurular/marka-inceleme-kilavuzu-guncellendi-18082021)

### S10 · MIT, CC BY 4.0 ve dağıtım

MIT, kodun telif ve lisans bildirimi korunarak yeniden kullanımına izin verir. CC BY 4.0
projenin lisanslayabildiği özgün içerikte atıf, lisans bağlantısı ve varsa değişiklik bildirimi
gerektirir. Projenin ücretsiz ve gönüllü oluşu, lisansların verdiği yeniden kullanım izinlerini
daraltmaz. Üçüncü taraf içerikleri kendi koşullarına tabidir. FSEK m.14–17’deki manevi haklar
ve m.48, 52’deki mali hak tasarruflarına ilişkin hükümler uyarınca, katkı verenin lisanslama
yetkisi ve gerekiyorsa açık yazılı izin değerlendirilir. Uygulanabilir emredici Türk hukuku
hükümleri lisanslardaki garanti/sorumluluk ifadeleriyle bertaraf edilemez. Dağıtım paketinde
kod, içerik ve üçüncü taraf lisansları erişilebilir kalmalıdır.
[MIT lisansı](../LICENSE) · [CC BY 4.0 tam metni](https://creativecommons.org/licenses/by/4.0/legalcode.tr) ·
[Üçüncü taraf bildirimleri](../THIRD_PARTY_LICENSES.md)

## 3. Ek kapsam ve işletim yükümlülükleri

### Erişilebilirlik

5378 m.3/f ve m.7, bilgi ve iletişim teknolojilerini erişilebilirlik kapsamına alır.
2025/10 sayılı Genelge, saydığı kamu, eğitim, sağlık, ulaştırma, finans ve haberleşme
kuruluşlarına bir yıl, 6563 kapsamındaki elektronik ticaret hizmet sağlayıcılarına iki yıl
öngörür. 21.06.2025’ten hesaplandığında tarihler sırasıyla 21.06.2026 ve 21.06.2027’dir.
Mevcut gönüllü gerçek kişi yayını listede görünmüyor. 6701 m.3–5’teki ayrımcılık ve
makul düzenleme hükümleri, sunulan hizmetin niteliğine göre ayrıca değerlendirilmeli.
Kamu kurumu devralırsa veya kapsam içi bir yayıncıya geçilirse Genelge ve Bakanlık
Yönergesi doğrudan gözden geçirilir. Uygulama WCAG 2.2 AA hedefini, yapılan testleri ve
süren doğrulamayı beyan eder. Genelge kapsamındaki Erişilebilirlik Logosu Komisyon
değerlendirmesine bağlıdır. [5378 sayılı Kanun](https://www.aile.gov.tr/eyhgm/mevzuat/ulusal-mevzuat/kanunlar/engelliler-hakkinda-kanun/) ·
[2025/10 Genelge](https://www.aile.gov.tr/media/219872/web_siteleri_ve_mobil_uygulamalarin_erisilebilirligi_hakkinda_genelge.pdf) ·
[Uygulama yönergesi](https://www.aile.gov.tr/media/257570/web_siteleri_ve_mobil_uygulamalarin_erisilebilirligi_genelgesi_uygulama_usul_ve_esaslari_hakkinda_yonerge.pdf) ·
[TİHEK ayrımcılık ve eşitlik](https://www.tihek.gov.tr/kategori/pages/Ayrimcilikla-Mucadele-ve-Esitlik)

### Yazışma, başvuru ve güvenlik

- Proje yazışmaları için m.4 uyarınca amaç ve saklama süresini bilgi türüne göre belirleyin.
  Olağan bildirimlerde m.5/2-f kullanılıyorsa zorunluluğu ve temel haklarla dengeyi belgeleyin.
  Hukuki yükümlülük/uyuşmazlık akışında somut dayanağı ayrıca kaydedin. Amaç ve yasal saklama
  yükümlülüğü sona erdiğinde m.7’ye göre veriyi silin, yok edin veya anonim hâle getirin.
  Kişisel verinin GitHub’a yanlışlıkla gönderilmesi hâlinde görünürlüğü hızla kısıtlayın,
  gerekiyorsa sağlayıcıyla iletişime geçin. Kopyalar üzerinde kontrolün sınırını açıklayın.
  [Kurul kararı 2019/78](https://www.kvkk.gov.tr/Icerik/5434/2019-78) ·
  [Silme ve imha yönetmeliği](https://www.kvkk.gov.tr/Icerik/5441/KISISEL-VERILERIN-SILINMESI-YOK-EDILMESI-VEYA-ANONIM-HALE-GETIRILMESI-HAKKINDA-YONETMELIK)
- m.10 aydınlatmasını, verinin toplandığı kanalın yanında erişilebilir kılın. Sağlayıcı,
  amaç, alıcılar, toplama yöntemi, somut hukuki sebep ve m.11 haklarını fiilî akışla eşleştirin.
  İlk açılış ve yerel sağlık ayarını rıza toplama yöntemi olarak kullanmayın.
  [Aydınlatma Tebliği m.4–6](https://www.kvkk.gov.tr/Icerik/4132/aydinlatma-yukumlulugunun-yerine-getirilmesinde-uyulacak-usul-ve-esaslar-hakkinda-teblig)
- m.13 için gerçek bir yazılı başvuru adresi veya Tebliğ’deki uygulanabilir resmî kanal
  belirleyin ve gerekli iletişim bilgisini yayımlayın. Sıradan e-posta yolu, gönderenin daha
  önce bildirdiği ve veri sorumlusunun sisteminde kayıtlı adres şartıyla işler. Başvuruyu
  niteliğine göre en kısa sürede, en geç 30 günde yanıtlayın. Yetersiz/olumsuz yanıt hâlinde
  m.14 süreleri, yanıtın öğrenilmesinden itibaren 30 gün ve her durumda başvurudan itibaren
  60 gündür. Yanıt verilmediyse 60 günlük üst süre içinde Kurula şikâyet edilebilir.
  [Başvuru Tebliği](https://www.resmigazete.gov.tr/eskiler/2018/03/20180310-6.htm) ·
  [Kurumun başvuru rehberi](https://www.kvkk.gov.tr/Icerik/2062/Basvuru-Hakki)
- Projece işlenen veriler için m.12 kapsamında erişim yetkilerini sınırlandırın, hesapları
  koruyun ve ihlal bildirim sorumlusunu belirleyin. Kanuni olmayan yollarla elde edilme
  öğrenildiğinde Kurula gecikmeksizin ve en geç 72 saatte bildirim, etkilenen kişilere ise
  tespitten sonra makul olan en kısa sürede bildirim öngörülür.
  [Kurul kararı 2019/10](https://www.kvkk.gov.tr/Icerik/5362/Veri-Ihlali-Bildirimi)
- KVKK m.16 için VERBİS durumunu gerçek veri sorumlusunun faaliyet ve ölçütlerine göre
  kaydedin. 2025/1572 uygulama duyurusunda ana faaliyeti özel nitelikli veri işleme olmayanlar
  için 50 çalışan ve 100 milyon TL, bu nitelikte ana faaliyeti olanlar için 10 çalışan ve
  10 milyon TL altı eşikleri birlikte değerlendirilir. Bilanço esasına göre defter
  tutmayanlarda çalışan ölçütü esas alınır. Sicil istisnası, m.4, 7, 10, 11 ve 12
  yükümlülüklerini kaldırmaz. [Kurulun 2025/1572 uygulama duyurusu](https://www.kvkk.gov.tr/Icerik/8577/kisisel-verileri-koruma-kurulunun-04-09-2025-tarihli-ve-2025-1572-sayili-kararinin-uygulama-esaslarina-iliskin-kamuoyu-duyurusu)
- Tarayıcı deposu ve önbellek, planı ve çevrimdışı işlevi sağlar. Çerez veya izleme
  eklenirse kullanılan teknoloji, amaç, zorunluluk, aydınlatma ve rıza gereği yeniden
  değerlendirilir. [Kurumun Çerez Rehberi](https://www.kvkk.gov.tr/SharedFolderServer/CMSFiles/fb193dbb-b159-4221-8a7b-3addc083d33f.pdf)

### Diğer işlev sınırları

- 7545 sayılı Siber Güvenlik Kanunu m.2 ve m.7 kapsamı, fiilî yayıncı ve barındıranın
  faaliyetine göre değerlendirilir. Uygulanıyorsa hizmet alanındaki siber zafiyet ve olayların
  Başkanlığa gecikmeksizin bildirilmesi yükümlülüğü, projeye yapılan özel güvenlik
  bildiriminden ayrı yürütülür.
  [7545 sayılı Kanun](https://www.resmigazete.gov.tr/eskiler/2025/03/20250319-1.htm)

- Zorunlu deprem sigortası hatırlatması, 6305 m.10’daki bina ve hak sahibi kapsamına göre
  ifade edilir. Uygulama prim, şirket veya poliçe tavsiyesi vermez ve poliçe numarasını
  istemez. [DASK mevzuat metni](https://www.dask.gov.tr/tr/kanun)
- Bir ilk yardım çantası hatırlatması ve yetkili eğitime yönlendirme, uygulamanın kapsamıdır.
  Eğitim veya sertifika faaliyetine geçilirse İlkyardım Yönetmeliği’ndeki yetki ve izinler
  ayrıca incelenir. [İlkyardım Yönetmeliği, Sağlık Bakanlığı](https://bahcesaraydh.saglik.gov.tr/TR-1556207/ilkyardim-yonetmeligi.html) ·
  [27.12.2025 değişikliği](https://www.resmigazete.gov.tr/eskiler/2025/12/20251227-8.htm)
- Kişisel veriler ve özel hayat bakımından TMK m.24–25, Anayasa m.20 ve somut olayda TCK
  m.135–140 dikkate alınır. Afet içeriği bakımından TCK m.217/A’nın özel kast, aleniyet
  ve kamu barışını bozmaya elverişlilik unsurları birlikte değerlendirilir. Rehber tarihli
  kaynaklara dayanır ve anlık afet haberi yayımlamaz.
  [Anayasa](https://www.mevzuat.gov.tr/MevzuatMetin/1.5.2709.pdf) ·
  [TCK](https://www.mevzuat.gov.tr/MevzuatMetin/1.5.5237.pdf)

## 4. Yayın öncesi kayıt altına alınacak kararlar

| Konu | Gerekli kanıt | Durum |
|---|---|---|
| Yayıncı ve iletişim | Fiilî yayıncının kimliği, yetkisi, başvuru kanalı ve başvuruyu işletecek kişi | Proje künyesi mevcut. Resmî kanal ve işleyiş teyidi bekleniyor. |
| GitHub Pages, GitHub depo ve Gmail | Roller, erişim ve saklama ayarları, varsa m.9 mekanizması veya sağlayıcı değişikliği | Sağlayıcıların kamusal belgeleri incelendi. Hesap ve sözleşme kanıtı bekleniyor. |
| Yazışmalar | Veri envanteri, meşru menfaat denge testi, saklama ve imha kararı, VERBİS ve ihlal sorumlusu | Yayıncı teyidi bekleniyor. |
| Marka ve görseller | Tarihli sicil sonucu, benzerlik değerlendirmesi, ikon ve üçüncü taraf varlıkların kaynak/hak kaydı | “İlk 72” ön sorgusunda sonuç yok. Benzerlik ve varlık hakları incelemesi bekleniyor. |
| Hukuki metinler ve rehber | Yayın sürümüne ait avukat görüşü ve içerik onay kayıtları | Mevzuat ön incelemesi yazıldı. İmzalı görüş ve içerik onayları bekleniyor. |
| Elle erişilebilirlik, baskı ve barındırma | `docs/mimari.md` §7 test kaydı. Nihai barındırmada `frame-ancestors 'none'` HTTP başlığı veya kısıtın yayın kararı. | Ekran okuyucu, gerçek cihaz ve fiziksel baskı kayıtları bekleniyor. |

## 5. Avukat onayı

- **İnceleyen (ad, unvan ve baro bilgisi):**
- **İncelenen sürüm / commit:**
- **İnceleme tarihi:**
- **Görüş ve koşullar:**
- **İstenen değişiklikler ve uygulama kaydı:**
- **Onaylayan (ad soyad, unvan):**
- **Onay tarihi:**

Onay tarihi, avukat görüşü alındıktan ve koşullar yerine getirildikten sonra `YYYY-AA-GG`
biçiminde kaydedilir. İncelenen sürüm alanına avukatın incelediği tam Git commit kimliği yazılır.
Onay kaydı sonraki bir commit’te eklenebilir. Üretim derlemesi, incelenen commit’in yayın geçmişinde
olduğunu ve yayın kapsamındaki kod, lisanslar, paketler, kamuya açık proje metinleri ile Pages
yapılandırmasının aynı kaldığını doğrular. Yeni yayın içeriği yeniden incelemeye girer.
[Yayın denetimi](../scripts/legal-gate.ts) · [Pages iş akışı](../.github/workflows/pages.yml)

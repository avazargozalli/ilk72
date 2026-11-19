# İlk 72 — Aile Afet Planı: Proje Şartnamesi

**Sürüm:** 1.0 · **Tarih:** 2026-11-19 · **Veri şeması sürümü:** 1 · **Çalışma adı:** `ilk72`

Ailelerin afet ve acil durum planını on dakikada hazırlayıp yazdırabildiği, çevrimdışı çalışan, hesap gerektirmeyen ve hiçbir veriyi cihaz dışına göndermeyen açık kaynak bir web uygulaması.

> **Önemli:** Bu belge hukuki danışmanlık değildir. Bölüm 4'teki hukuki çerçeve mevzuat taranarak hazırlanmıştır; her satırda neyin kaynağından doğrulandığı, neyin hukukçu doğrulaması beklediği işaretlidir. Uygulama herkese açılmadan önce Bölüm 4.4'teki liste bir avukata onaylatılmalıdır. Güvenlik tavsiyesi içeren metinler de Bölüm 13.4'teki onay kapısından geçmeden yayımlanamaz.

---

## 0. Bu belge nasıl kullanılır (uygulayan ajan için)

1. **Sırayla ilerle.** Bölüm 21'deki aşamaları verilen sırayla uygula; bir aşamanın kabul ölçütleri sağlanmadan sonrakine geçme.
2. **Önce testler.** Her aşamada önce testleri yaz (Ek B'deki vektörler dahil), sonra kodu.
3. **Öncelik sırası.** Çelişki olursa: Bölüm 2 (ilkeler) > Bölüm 4 (hukuki tasarım kararları) > Ek B (vektörler) > Ek A (referans kod) > diğer bölümler.
4. **İlkeleri esnetme.** Bölüm 2'deki kurallar "daha iyi kullanıcı deneyimi" gerekçesiyle bile delinmez. Bir kuralı delmeden çözemediğin bir şey olursa o özelliği yapma, `docs/kararlar.md` dosyasına not düş.
5. **Güvenlik ve hukuk metni uydurma.** Kullanıcıya görünen her afet tavsiyesi Bölüm 13'teki kayıt sisteminden gelir ve kaynağı gösterilir. Bölüm 13.3'te olmayan bir tavsiye cümlesi yazma. Hukuki metinler için Bölüm 14'teki taslakları kullan; anlamını değiştirme.
6. **Bağımlılık ekleme.** Çalışma zamanı bağımlılıkları yalnızca `preact` ve `qrcode-generator`. Geliştirme bağımlılıkları Bölüm 6'dakilerle sınırlı. Kurarken o günkü güncel kararlı sürümleri kullan, lisanslarını denetle (yalnızca MIT, ISC, BSD, Apache-2.0), kilit dosyasını depoya ekle.
7. **Dil.** Kod içi adlar İngilizce; kullanıcıya görünen her metin Türkçe ve `src/i18n/tr.ts` içinde. Bileşenlerin içine sabit Türkçe metin gömme.
8. **Dış kaynak yok.** Uygulama çalışırken kendi kökeni dışına hiçbir istek yapmaz (yazı tipi, harita, analitik, CDN, API dahil). Bunu Bölüm 18.5'teki test kanıtlar.
9. **Sahibine sorman gerekenler** yalnızca Bölüm 0.1'dekilerdir. Geri kalan her kararı bu belgeye göre kendin ver.
10. **Bitince** Bölüm 21.13'teki listeyi madde madde doğrula ve raporla.

### 0.1 Sahibinin yapması gerekenler (ajan yapmaz, hatırlatır)

| İş | Açıklama |
|---|---|
| Proje sahibi | **Azar Gozalli** · `avazargozalli` · `gozelliazer@gmail.com` |
| Ad kontrolü | "İlk 72" çalışma adıdır. Yayından önce marka ve alan adı araması yapılmalı. Ad `src/config.ts` içinde tek yerde durur. |
| İçerik onayı | Bölüm 13.3'teki her içerik satırını resmî kaynağın **güncel** sayfasıyla karşılaştırıp `onayli` yapmak. AFAD siteleri otomatik erişimi engellediği için bunu bir insan tarayıcıdan yapmalıdır. Mümkünse bir afet eğitmeni ya da AFAD il müdürlüğü görüşü alınmalı. |
| Hukuki inceleme | Bölüm 4.4'teki sorular ve Bölüm 14'teki metinler bir avukata onaylatılmalı. |
| Yayın | GitHub deposu (`ilk72`, herkese açık), Pages kaynağı "GitHub Actions". Alternatif barındırma kararı Bölüm 4.3'te. |
| Para toplamama | Bağış, sponsor, reklam eklenmeyecek (Bölüm 4.1, satır 8). Değiştirmek isterse önce hukukçu. |

---

## 1. Özet

Kullanıcı kısa bir soru dizisini yanıtlar; uygulama şunları üretir:

- **Aile afet planı** (A4, yazdırılabilir): kişiler, acil kişiler, buluşma yerleri, toplanma alanı, evin güvenli yerleri, vana ve şalter yerleri, görev dağılımı, özel ihtiyaçlar.
- **Cüzdan kartları** (kişi başı), **çocuk kartı**, **buzdolabı sayfası**.
- **Afet ve acil durum çantası kontrol listesi**, hane yapısına göre uyarlanmış.
- **Altı aylık gözden geçirme hatırlatması** (takvim dosyası).
- **Rehber kartları:** deprem öncesi, anı ve sonrası için resmî kaynaklara dayalı kısa tavsiyeler; her kartta kaynak bağlantısı.
- **Paylaşım:** özet kartı bağlantı ya da kare kodla aile üyelerine aktarma; tam plan için yedek dosyası.

Dayanak: AFAD, ailelerin afet sonrası ilk 72 saat için bir afet ve acil durum planı yapmasını önerir (kaynak anahtarları: K-PLAN72, K-KIRSEHIR; Bölüm 13.3). Uygulama resmî bir uygulama değildir; resmî tavsiyeyi uygulanabilir bir forma dönüştüren bağımsız bir araçtır.

## 2. İlkeler (değiştirilemez)

| # | İlke |
|---|---|
| İ1 | **Veri cihazda kalır.** Sunucu, hesap, senkronizasyon, analitik, hata raporlama servisi, çerez yok. Proje sahibi hiçbir kullanıcı verisini göremez. |
| İ2 | **Sıfır dış istek.** Uygulama kendi kökeni dışına ağ isteği yapmaz. Dış siteler yalnızca kullanıcının tıkladığı bağlantılarla, yeni sekmede açılır. |
| İ3 | **Kâğıt önceliklidir.** Afet anında telefon ve şebeke çalışmayabilir. Her akış kullanıcıyı yazdırmaya ya da PDF kaydetmeye götürür. |
| İ4 | **Kaynaksız tavsiye yok.** Her afet tavsiyesi resmî bir kaynağa bağlıdır, kendi cümlelerimizle yazılır, kaynağı ve erişim tarihi gösterilir. |
| İ5 | **Resmî görünme yok.** Hiçbir kurumun adı, logosu, amblemi, kurumsal rengi ürün kimliğinde kullanılmaz. Kızılay/kızılhaç amblemi ve benzeri işaretler hiçbir yerde kullanılmaz. Her sayfanın altında "Bağımsız bir açık kaynak projesidir; resmî bir kurum uygulaması değildir." yazar. |
| İ6 | **Acil servis değildir.** Uygulama yardım çağrısı iletmez, uyarı göndermez, haber ya da anlık bilgi sunmaz. Acil durumda tek yönlendirme: **112**. |
| İ7 | **Tıbbi ve teknik talimat yok.** İlk yardım uygulaması, ilaç, bina dayanıklılığı değerlendirmesi, tesisat onarımı anlatılmaz; ilgili yetkili kaynağa yönlendirilir. |
| İ8 | **Veri azaltma.** T.C. kimlik no, kimlik/pasaport no, banka, poliçe, parola alanı yoktur. Sağlık bilgisi isteğe bağlıdır, varsayılan kapalıdır, paylaşımlara varsayılan olarak girmez. |
| İ9 | **Sahte güven yok.** "Güvendesiniz", "hazırsınız" gibi ifadeler ve güvenlik puanı yoktur. Yalnızca planın hangi bölümlerinin dolu olduğu gösterilir. |
| İ10 | **Herkes için.** WCAG 2.2 AA; büyük punto, sade dil, klavye ve ekran okuyucu desteği; düşük donanımlı telefonlarda çalışır. |
| İ11 | **Para ve tanıtım yok.** Bağış düğmesi, IBAN, reklam, ortaklık bağlantısı, ürün önerisi (marka adıyla çanta, sigorta şirketi vb.) yok. |
| İ12 | **Kullanıcı içeriği yayımlanmaz.** Yorum, forum, harita üzerinde paylaşım, kullanıcıdan kullanıcıya herkese açık içerik yok. |

## 3. Kapsam

### 3.1 Bu sürümde

- Tek hane için tek plan (en çok 12 kişi).
- Genel afet planı + **deprem** rehber modülü.
- Türkçe arayüz; metinler çeviriye hazır yapıda.
- Çevrimdışı çalışan PWA; yazdırma çıktıları; yedek ve paylaşım.

### 3.2 Kapsam dışı

- Sel, yangın, heyelan, çığ, fırtına rehber modülleri (aynı kayıt sistemiyle sonra eklenir; Bölüm 23).
- Toplanma alanı verisi ya da haritası (kullanıcı resmî sorgudan öğrenip elle yazar; Bölüm 4.1 satır 11).
- Anlık deprem verisi, uyarı, bildirim, konum paylaşımı, "güvendeyim" iletisi.
- Kurum, okul, işyeri planları. Birden çok hane. Hesap ve bulut yedeği.
- İlk yardım anlatımı. Bina risk değerlendirmesi. Sigorta tavsiyesi.

## 4. Hukuki çerçeve

**Durum sütunu:** **D** = bu belge hazırlanırken resmî mevzuat metni ya da resmî kurum sayfasının arama alıntısından doğrulandı (2026-11-19). **H** = genel bilgiye dayanır; yayından önce hukukçu doğrulamalı. Mevzuat değişebilir; inceleme sırasında güncel metinlere bakılmalıdır.

### 4.1 Mevzuat ve tasarım kararları

| # | Mevzuat ve hüküm | Projeye etkisi | Tasarım kararı | Durum |
|---|---|---|---|---|
| 1 | **6698 sayılı KVKK m.28/1-a.** Gerçek kişilerin tamamen kendisiyle veya aynı konutta yaşayan aile fertleriyle ilgili faaliyetler kapsamındaki işlemesi Kanun dışındadır. Kurumun rehberine göre veriler üçüncü kişilerle paylaşılır ya da alenileştirilirse istisna tartışmalı hale gelir. | Planı dolduran kullanıcı, ailesinin verisini kendi cihazında işler. | Veri yalnızca cihazda tutulur (İ1). Paylaşım her zaman kullanıcının açık eylemidir; paylaşım ekranında "Bu bilgileri yalnızca ailenizle ve güvendiğiniz kişilerle paylaşın; adı geçen kişilere haber verin." uyarısı gösterilir. Herkese açık yayın özelliği yoktur. | D (madde ve rehber alıntısı) |
| 2 | **KVKK m.3** (veri sorumlusu: işleme amaç ve vasıtalarını belirleyen), **m.10** (aydınlatma), **m.12** (veri güvenliği), **m.16** (sicil). | Proje sahibi plan verisine erişmediği ve onu işlemediği için bu veriler bakımından veri sorumlusu sayılmaması **beklenir**. | Mimari bunu teknik olarak imkânsız kılar: sunucu yok, günlük yok, telemetri yok. Yine de bir "Gizlilik Bildirimi" yayımlanır (Bölüm 14.1) ve bu değerlendirme hukukçuya sorulur (4.4-S1). | H |
| 3 | **KVKK m.6** (2/3/2024 tarihli 7499 sayılı Kanunla değişik). Sağlık verisi özel niteliklidir; işlenmesi kural olarak yasaktır, istisnalar sayılıdır (açık rıza vb.). | Kan grubu, hastalık, ilaç, alerji, engellilik bilgisi özel niteliklidir. | Sağlık alanları isteğe bağlıdır; ayrı bir açma-kapama ile, bilgilendirme metni gösterilerek açılır (11.5, 3. adım). Varsayılan paylaşımlara girmez; cüzdan kartına basılması ayrıca sorulur. İsteğe bağlı parola ile cihazda şifrelenebilir (9.3). | D (madde metni alıntısı) |
| 4 | **KVKK m.9** (yurt dışına aktarım) ve barındırma. | Statik dosyalar yurt dışındaki bir sağlayıcıdan sunulursa, sağlayıcı ziyaretçinin IP adresini ve tarayıcı bilgisini kendi günlüklerine yazabilir. Plan verisi **aktarılmaz**. | Gizlilik bildiriminde barındırma sağlayıcısı ve bu günlükler açıkça yazılır. Paylaşım yükü URL'nin `#` sonrasındaki parçasında taşınır; bu parça sunucuya gönderilmez (10.2). Barındırma seçenekleri 4.3'te. Proje sahibinin bu günlükler bakımından konumu hukukçuya sorulur (4.4-S2). | H |
| 5 | **Kişisel Verileri Koruma Kurumu, Çerez Uygulamaları Hakkında Rehber.** | Analitik ve reklam çerezleri rıza gerektirir. | Çerez kullanılmaz. Tarayıcı deposu yalnızca kullanıcının kendi planını ve ayarlarını saklamak için, hizmetin çalışması için zorunlu ölçüde kullanılır. Rıza penceresi yoktur; gizlilik bildiriminde açıklanır. | H |
| 6 | **5651 sayılı Kanun m.2, m.4.** İçerik sağlayıcı, internette sunduğu her içerikten sorumludur. | Proje sahibi içerik sağlayıcıdır; rehber metinlerinin doğruluğundan sorumludur. | İçerik kayıt sistemi ve onay kapısı (Bölüm 13). Dış bağlantılar yalnızca izinli resmî alan adlarına verilir (13.2). | D |
| 7 | **5651 m.3** ve **İnternet Ortamında Yapılan Yayınların Düzenlenmesine Dair Usul ve Esaslar Hakkında Yönetmelik m.5.** Tanıtıcı bilgi bulundurma yükümlülüğü; Yönetmelik bunu "ticari veya ekonomik amaçlı" sağlayıcılar için düzenler. | Proje ticari değildir. | Yine de gönüllü bir "Künye ve İletişim" sayfası bulunur: sorumlu kişi, e-posta, depo adresi, barındırma sağlayıcısı (14.3). Projenin ticari sayılıp sayılmayacağı hukukçuya sorulur (4.4-S3). | D |
| 8 | **2860 sayılı Yardım Toplama Kanunu** ve Yardım Toplama Esas ve Usulleri Hakkında Yönetmelik. İzinsiz yardım toplamak yaptırıma bağlıdır; internet ortamı da kapsamdadır. | Bağış düğmesi, IBAN, kampanya izin gerektirebilir. | İ11: hiçbir para toplama öğesi yok. Depoda `FUNDING.yml` oluşturulmaz. | D |
| 9 | **6098 sayılı TBK m.115.** Ağır kusurdan sorumlu olunmayacağına dair önceden yapılan anlaşma kesin hükümsüzdür. Ayrıca m.49 vd. (haksız fiil). | Sorumluluk reddi metni tek başına koruma sağlamaz. | Asıl koruma içerik sürecidir: kaynak zorunluluğu, insan onayı, tarihli kayıt, hata bildirim yolu, hızlı düzeltme (Bölüm 13). Sorumluluk reddi yine de açık ve görünür biçimde yer alır (14.2). | D (m.115) / H (m.49) |
| 10 | **5237 sayılı TCK m.217/A** (13/10/2022 tarihli 7418 sayılı Kanunla eklendi): halkı yanıltıcı bilgiyi alenen yayma. | Afet dönemlerinde doğrulanmamış bilgi yaymak hukuki risk taşır. | İ6 ve İ12: haber, anlık bilgi, söylenti, kullanıcı içeriği yok. Yalnızca resmî kaynağa dayalı, tarihli, değişmeyen rehber metni. | D (maddenin varlığı ve adı) |
| 11 | **e-Devlet "Afet ve Acil Durum Toplanma Alanı Sorgulama"** hizmeti ve kullanım koşulları; **TCK m.243–244** (bilişim sistemine girme, sistemi engelleme). | Toplanma alanı verisi resmî hizmettedir; otomatik çekmek koşullara ve hukuka aykırı olabilir. | Veri çekilmez, kopyalanmaz, çerçeve içinde gösterilmez. Kullanıcıya bağlantı verilir; sonucu kendisi yazar (11.5, 5. adım). | D (hizmetin varlığı) / H (koşullar) |
| 12 | **Afet ve Acil Durum Müdahale Hizmetleri Yönetmeliği** (RG 31760): "afet ve acil durum toplanma alanı" tanımı. **5902 sayılı Kanun** ve **7269 sayılı Kanun**: afet yönetiminde yetkili kurumlar. | Terimler ve yetki. | Arayüzde resmî terim kullanılır: "afet ve acil durum toplanma alanı". Uygulama kurum yetkisindeki hiçbir işi üstlenmez (İ6). | D (tanım) / H (kanunlar) |
| 13 | **112 Acil Çağrı Merkezi.** İçişleri Bakanlığı açıklamasına göre 110, 112, 155, 156, 122, 177 ve 158 numaraları 112'de birleştirilmiştir. | Eski numaraları göstermek yanıltır. | Uygulamada tek acil numara: **112** (`tel:112` bağlantısı). Başka kısa numara gösterilmez. | D |
| 14 | **5846 sayılı FSEK.** Kurum yayınları, afişleri, görselleri eserdir. m.31: resmen yayımlanan mevzuat metinlerinin çoğaltılması serbesttir. | Kurum metinlerini ve görsellerini kopyalamak ihlal olabilir. | İ4: bütün rehber metni kendi cümlelerimizle yazılır, kaynak gösterilir. Kurum görseli, afişi, simgesi kullanılmaz. Çizimler özgün ve sade olur. | H |
| 15 | **6769 sayılı Sınai Mülkiyet Kanunu** ve kurum ad/amblemlerinin korunmasına dair özel düzenlemeler (Kızılay amblemi dahil). | Kurum adı ya da amblemi kullanmak, resmî izlenimi vermek. | İ5. Kurum adları yalnızca kaynak gösterirken düz metin olarak geçer. İlk yardım çantası simgesi için kırmızı hilal ya da haç **kullanılmaz**; nötr bir çanta simgesi kullanılır. | H |
| 16 | **2025/10 sayılı Cumhurbaşkanlığı Genelgesi** (RG 21.06.2025, 32933) ve **5378 sayılı Kanun m.7**. Genelge kamu kurumları, bankalar, özel hastaneler, e-ticaret hizmet sağlayıcıları gibi sayılı kuruluşlara WCAG 2.2 temelli erişilebilirlik yükümlülüğü getirir. | Bireyler ve açık kaynak projeleri Genelge'de sayılmaz. | Yükümlülük olmasa da hedef WCAG 2.2 AA'dır (İ10); erişilebilirlik beyanı yayımlanır (14.4). Erişilebilirlik Logosu **kullanılmaz** (resmî değerlendirme gerektirir). | D |
| 17 | **6305 sayılı Afet Sigortaları Kanunu** (zorunlu deprem sigortası). | Sigorta bilgisi plana girer. | Yalnızca "Zorunlu deprem sigortanız var mı?" denetim maddesi ve DASK resmî sitesine bağlantı. Şirket, ürün, fiyat, tavsiye yok. Poliçe numarası alanı yok. | H |
| 18 | **İlkyardım Yönetmeliği** ve sağlık mevzuatı. | İlk yardım anlatmak yetki ve doğruluk riski taşır. | İ7. Çanta listesinde "ilk yardım çantası" maddesi bulunur; uygulama yöntemi anlatılmaz, "Yetkili merkezlerden ilk yardım eğitimi alın." denir. | H |
| 19 | **6502 sayılı Tüketicinin Korunması Hakkında Kanun**, **6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun**. | Satış ve ticari ileti yoksa uygulanmaz. | İ11 ile kapsam dışında kalınır: satış, üyelik, e-posta toplama, bildirim gönderimi yok. | H |
| 20 | **Çocuklara ilişkin veriler** (velayet, TMK) ve çocuk güvenliği. | Çocuğun adı, okulu, adresi plana girer. | Bilgiyi veli girer. Çocuk kartında varsayılan olarak ev adresi **basılmaz**; yalnızca ad, veli telefonları, buluşma yeri (12.4). Okul adı karta isteğe bağlı eklenir. | H |
| 21 | **Açık kaynak lisansları.** | Kod ve içerik yeniden kullanımı. | Kod: MIT. Rehber metinleri ve belgeler: CC BY 4.0. Üçüncü taraf lisansları `THIRD_PARTY_LICENSES.md` içinde. | H |

### 4.2 Hukuki tasarım kararlarının teknik karşılıkları

| Karar | Teknik karşılık | Kanıtlayan test |
|---|---|---|
| Veri cihazdan çıkmaz | Ağ isteği yapan kod yok; CSP `connect-src 'none'` | 18.5 dış istek testi |
| Paylaşım kullanıcı eylemidir | Paylaşım yalnızca düğmeyle, uyarı onayından sonra üretilir | 18.4 uçtan uca |
| Sağlık verisi isteğe bağlı | `health` alanı yalnızca `healthOptIn === true` iken saklanır; kapatılınca silinir | 18.2 model testleri |
| Sağlık verisi varsayılan paylaşılmaz | Özet kart şemasında sağlık alanı yok; ek not ayrı onay ister | 18.3 kodlama testleri |
| Kaynaksız tavsiye yok | Kayıt şeması kaynak zorunlu kılar; izinli alan adı listesi | 18.6 içerik testleri |
| Onaysız içerik yayımlanmaz | Üretim derlemesi `taslak` içerikle başarısız olur | 18.6, CI |
| Resmî görünme yok | Her sayfada sabit alt bilgi; simge ve renk denetimi | 18.4, elle kontrol |
| Para toplama yok | İlgili öğe ve dosya yok | CI'da `FUNDING.yml` ve yasaklı sözcük taraması |

### 4.3 Barındırma seçenekleri

| Seçenek | Artı | Eksi |
|---|---|---|
| **A. GitHub Pages** (varsayılan) | Ücretsiz, basit, açık kaynak akışına uygun | Sağlayıcı yurt dışında; erişim günlüklerini sağlayıcı tutar |
| **B. Türkiye'de statik barındırma** | Erişim günlükleri yurt içinde kalır | Ücretli; günlükleri kapatmak ya da kısa tutmak sahibin sorumluluğu olur ve bu kez günlükler bakımından veri sorumlusu olma ihtimali artar |
| **C. İkisi birden** (B ana adres, A yedek) | Erişilebilirlik artar | İki ortamın bakımı |

Uygulama her seçenekte aynı çalışır (göreli yollar, `base` ayarı tek yerde). Karar hukukçu görüşünden sonra verilir (4.4-S2). Hangi seçenek kullanılırsa kullanılsın içerik dağıtım ağı, harici yazı tipi ya da analitik eklenmez.

### 4.4 Hukukçuya sorulacaklar (yayın öncesi zorunlu)

- **S1.** Proje sahibi, yalnızca kullanıcının cihazında tutulan plan verileri bakımından veri sorumlusu sayılır mı? Sayılmıyorsa gizlilik bildirimindeki ifade yeterli mi?
- **S2.** Barındırma sağlayıcısının tuttuğu erişim günlükleri bakımından proje sahibinin sıfatı nedir? Yurt dışı sağlayıcı kullanımı KVKK m.9 bakımından bir yükümlülük doğurur mu? Hangi barındırma seçeneği önerilir?
- **S3.** Proje 5651 sayılı Kanun ve ilgili yönetmelik bakımından "ticari veya ekonomik amaçlı" sayılır mı? Künye sayfasındaki bilgiler yeterli mi?
- **S4.** Bölüm 14.2'deki kullanım koşulları ve sorumluluk reddi metni TBK ve tüketici mevzuatı bakımından uygun mu?
- **S5.** Rehber metinlerinde kurum adlarının kaynak olarak anılması ve resmî sayfalara bağlantı verilmesi FSEK ve marka hukuku bakımından sorun doğurur mu?
- **S6.** e-Devlet hizmetine dış bağlantı verilmesi hizmetin kullanım koşullarına uygun mu?
- **S7.** Sağlık bilgisi alanları ve paylaşım özelliği, kullanıcı aile dışından birinin (bakıcı, komşu) bilgisini girdiğinde KVKK m.28/1-a istisnası bakımından risk doğurur mu? Uyarı metinleri yeterli mi?
- **S8.** İleride GitHub Sponsors gibi bir destek yolu açılırsa 2860 sayılı Kanun bakımından izin gerekir mi?
- **S9.** "İlk 72" adı ve görsel kimlik marka araması bakımından kullanılabilir mi?
- **S10.** MIT ve CC BY 4.0 lisanslarının birlikte kullanımı ve garanti reddi maddeleri Türk hukukunda nasıl değerlendirilir?

Hukukçu görüşü `docs/hukuki-inceleme.md` dosyasına tarih ve kapsamıyla işlenir; yayın etiketi bu dosya olmadan atılmaz (21.13).

## 5. Kullanıcılar ve senaryolar

| Kim | Senaryo | Öncelik |
|---|---|---|
| Ebeveyn | Akşam 10 dakikada planı doldurur, yazdırır, çocukların çantasına kart koyar | Sihirbaz, çocuk kartı |
| Yaşlı ya da engelli bireye bakan kişi | Özel ihtiyaçları, ilaç ve cihaz bilgisini plana işler; bakıcıyla paylaşır | Özel ihtiyaç adımı, şifreli paylaşım |
| Yalnız yaşayan yaşlı | Büyük puntolu arayüzle acil kişileri ve buluşma yerini yazar | Erişilebilirlik, buzdolabı sayfası |
| Öğretmen, muhtar, dernek | Sayfayı topluluğuna dağıtır; herkes kendi planını yapar | Kurulumsuz kullanım, paylaşılabilir adres |
| Apartman yöneticisi | Sakinlere boş plan formunu basılı dağıtır | Boş form çıktısı (12.6) |

## 6. Teknoloji

| Konu | Karar |
|---|---|
| Dil | TypeScript, `strict: true`, `noUncheckedIndexedAccess: true` |
| Arayüz | Preact (işlevsel bileşenler, kancalar). Yönlendirme, durum yönetimi, form kitaplığı **eklenmez**; hepsi projede yazılır |
| Derleme | Vite + `@preact/preset-vite` |
| PWA | `vite-plugin-pwa` (Workbox, ön bellekleme listesi üretimi) |
| Kare kod | `qrcode-generator` |
| Saklama | IndexedDB (sarmalayıcı projede yazılır) |
| Şifreleme, sıkıştırma | Tarayıcı yerleşikleri: Web Crypto, `CompressionStream` |
| Yazdırma | Tarayıcının yazdırma penceresi + baskı CSS'i. PDF kitaplığı yok |
| Test | Vitest, `@testing-library/preact`, `happy-dom`, `fake-indexeddb`, Playwright, `@axe-core/playwright` |
| Biçim/lint | Biome |
| Çalışma ortamı | Node ≥ 22 (geliştirme); tarayıcılar: son 2 ana sürüm Chrome, Edge, Firefox, Safari; Android Chrome ve iOS Safari |
| Lisans | Kod MIT; içerik ve belgeler CC BY 4.0 |

`CompressionStream` ya da Web Crypto bulunmayan tarayıcıda paylaşım ve şifreleme özellikleri gizlenir, "Tarayıcınız bu özelliği desteklemiyor; planı yazdırabilir ya da yedek dosyası indirebilirsiniz." iletisi gösterilir. Çekirdek akış (doldur, kaydet, yazdır) bunlara bağlı değildir.

## 7. Depo yapısı

```
ilk72/
├─ src/
│  ├─ main.tsx                 # giriş, yönlendirici, hizmet çalışanı kaydı
│  ├─ config.ts                # ad, sürüm, depo adresi, iletişim, barındırma bilgisi
│  ├─ router.ts                # # tabanlı küçük yönlendirici
│  ├─ i18n/tr.ts               # bütün arayüz metinleri
│  ├─ model/
│  │  ├─ types.ts              # Bölüm 8
│  │  ├─ defaults.ts           # boş plan üretimi
│  │  ├─ validate.ts           # şema doğrulama ve temizleme (8.3)
│  │  ├─ progress.ts           # bölüm doluluk hesabı (11.8)
│  │  └─ bag.ts                # haneye göre çanta listesi üretimi (11.6)
│  ├─ storage/
│  │  ├─ idb.ts                # IndexedDB sarmalayıcı
│  │  ├─ store.ts              # durum, otomatik kayıt, bellek içi yedek kip
│  │  ├─ crypto.ts             # Ek A: encryptBytes, decryptBytes
│  │  └─ backup.ts             # yedek dosyası dışa/içe aktarma (9.4)
│  ├─ share/
│  │  ├─ codec.ts              # Ek A: encodeShare, decodeShare
│  │  ├─ card.ts               # plan → özet kart, özet kart doğrulama (10.1)
│  │  └─ qr.ts                 # kare kod SVG üretimi
│  ├─ output/
│  │  ├─ ics.ts                # Ek A: buildIcs
│  │  └─ print.ts              # yazdırma seçimi ve belge başlığı
│  ├─ content/
│  │  ├─ sources.ts            # kaynak kaydı (13.1)
│  │  ├─ registry.ts           # içerik kaydı (13.3)
│  │  └─ check.ts              # içerik denetimi (testler ve derleme kapısı kullanır)
│  ├─ ui/
│  │  ├─ components/           # Field, TextInput, PhoneInput, Checkbox, RadioGroup, Repeater, Notice, Stepper, SourceLink, Dialog
│  │  ├─ pages/                # Home, Wizard*, Summary, Emergency, Guide, Bag, Print, Share, Import, Settings, About, Privacy, Terms, Imprint, Accessibility, Sources, NotFound
│  │  └─ print/                # FullPlan, WalletCards, ChildCards, FridgeSheet, BagChecklist, BlankForm
│  └─ styles/                  # tokens.css, base.css, components.css, print.css
├─ public/                     # manifest simgeleri (özgün), robots.txt
├─ test/                       # birim ve bileşen testleri, vectors/
├─ e2e/                        # Playwright senaryoları
├─ docs/                       # kararlar.md, hukuki-inceleme.md (şablon), icerik-onay.md, mimari.md
├─ .github/                    # workflows (ci, pages), issue ve PR şablonları
├─ README.md  CONTRIBUTING.md  CODE_OF_CONDUCT.md  SECURITY.md  CHANGELOG.md
├─ LICENSE  LICENSE-CONTENT  THIRD_PARTY_LICENSES.md
└─ index.html  package.json  tsconfig.json  vite.config.ts  vitest.config.ts  playwright.config.ts  biome.json
```

`package.json` betikleri: `dev`, `build` (taslak içeriğe izin verir, "TASLAK" şeridi gösterir), `build:prod` (taslak içerik varsa başarısız), `preview`, `test`, `coverage`, `e2e`, `lint`, `format`, `typecheck`, `content:check`, `check` (lint + typecheck + coverage + content:check + build + e2e).

## 8. Veri modeli

### 8.1 Tipler (`src/model/types.ts`)

```ts
export const SCHEMA_VERSION = 1;

export type YesNoUnknown = 'evet' | 'hayir' | 'bilmiyorum';

export interface Place {
  label: string;        // "Apartmanın karşısındaki park"
  detail: string;       // tarif ya da adres; boş olabilir
}

export interface DailyPlace {            // okul, iş yeri, kreş, bakım merkezi
  kind: 'okul' | 'is' | 'diger';
  label: string;
  phone: string;
  note: string;                           // "Servisle gidiyor", "Teslim alacak kişi: ..."
}

export interface Health {                 // ÖZEL NİTELİKLİ — yalnızca healthOptIn true iken var olur
  bloodType: '' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | '0+' | '0-';
  conditions: string;                     // sürekli hastalıklar
  medications: string;                    // düzenli ilaçlar
  allergies: string;
  devices: string;                        // işitme cihazı, oksijen, tekerlekli sandalye...
}

export interface Member {
  id: string;                             // crypto.randomUUID()
  name: string;
  group: 'yetiskin' | 'cocuk' | 'bebek' | 'yasli';
  phone: string;
  dailyPlaces: DailyPlace[];              // en çok 3
  needs: {
    mobility: boolean;                    // hareket desteği gerekir
    hearing: boolean;
    vision: boolean;
    communication: boolean;               // iletişim desteği gerekir
    note: string;                         // "Merdiven inerken destek gerekir"
  };
  health?: Health;
}

export interface Contact {
  id: string;
  name: string;
  relation: string;                       // "teyze", "komşu"
  phone: string;
  phoneAlt: string;
  outOfArea: boolean;                     // şehir dışı irtibat kişisi
  city: string;                           // outOfArea ise
  canPickUpChildren: boolean;             // çocukları teslim alabilir
}

export interface RoleAssignment {
  roleId: RoleId;
  memberId: string | null;
  note: string;
}
export type RoleId =
  | 'canta' | 'vanalar' | 'cocuklar' | 'yaslilar' | 'evcil' | 'kapilar' | 'iletisim';

export interface ChecklistState { id: string; done: boolean; note: string; }

export interface Pet { id: string; name: string; kind: string; note: string; }

export interface Plan {
  schemaVersion: 1;
  id: string;
  createdAt: string;                      // ISO 8601
  updatedAt: string;
  healthOptIn: boolean;
  household: {
    label: string;                        // "Yılmaz ailesi"
    address: string;
    buildingNote: string;                 // "4. kat, asansörlü, 2 merdiven"
    floorCount: string;
  };
  members: Member[];                      // 1–12
  contacts: Contact[];                    // 0–10
  meeting: {
    nearHome: Place;                      // 1. buluşma yeri: evin hemen yakını
    neighborhood: Place;                  // 2. buluşma yeri: mahallede
    outOfArea: Place;                     // 3. buluşma yeri: şehir dışı
    assemblyArea: Place;                  // resmî toplanma alanı (kullanıcı yazar)
    assemblyCheckedAt: string | null;     // resmî sorgudan baktığı tarih
  };
  home: {
    safeSpots: string[];                  // her oda için güvenli yer; en çok 10
    exits: string[];                      // çıkış yolları; en çok 5
    utilities: { electricity: string; gas: string; water: string };  // yer tarifi
    hazards: ChecklistState[];            // tehlike avı listesi (13.3, H-*)
  };
  roles: RoleAssignment[];
  bag: {
    location: string;
    items: ChecklistState[];              // çanta listesi (13.3, C-*)
    lastCheckedAt: string | null;
  };
  documents: ChecklistState[];            // belge kopyaları (13.3, B-*)
  pets: Pet[];                            // 0–6
  insurance: { dask: YesNoUnknown };
  review: {
    lastDrillAt: string | null;
    nextReviewAt: string | null;
  };
  notes: string;
}
```

### 8.2 Alan sınırları

| Alan türü | Sınır |
|---|---|
| Ad, etiket, ilişki, şehir | 1–60 karakter (boş bırakılabilen alanlarda 0–60) |
| Telefon | 0 ya da 3–20 karakter; yalnızca rakam, boşluk, `+`, `-`, `(`, `)` |
| Tarif, adres, not (kısa) | 0–200 karakter |
| `notes`, sağlık metinleri | 0–500 karakter |
| Listeler | Tabloda yazan üst sınırlar; aşan öğeler içe aktarmada kesilir |
| Tarih | ISO 8601; geçersizse `null` |

Bütün metinlerde baştaki ve sondaki boşluk kırpılır, denetim karakterleri (U+0000–U+001F, satır sonu hariç yalnızca `notes` ve sağlık metinlerinde) silinir, Unicode NFC uygulanır.

### 8.3 Doğrulama ve temizleme (`validate.ts`)

`sanitizePlan(input: unknown): { plan: Plan; warnings: string[] }`

- Bilinmeyen alanlar atılır; eksik alanlar varsayılanla doldurulur; tür uymayan değer varsayılana döner.
- Sınırı aşan metin kesilir, uyarı eklenir.
- `healthOptIn === false` ise bütün `member.health` alanları **silinir**.
- `roles[].memberId` var olmayan bir kişiyi gösteriyorsa `null` yapılır.
- `schemaVersion` 1 değilse `Error('desteklenmeyen-surum')`.
- Bu işlev depodan okunan, dosyadan içe aktarılan ve bağlantıyla gelen **her** veriye uygulanır. Doğrulanmamış veri duruma ya da ekrana ulaşmaz.

## 9. Saklama, yedek, şifreleme

### 9.1 IndexedDB

- Veritabanı `ilk72`, sürüm 1, tek nesne deposu `kv` (anahtar: dize).
- Anahtarlar: `plan` (düz `Plan` ya da `{ enc: true, data: Uint8Array }`), `settings` (`{ largeText, lockEnabled, printPrefs, firstRunAccepted }`), `meta` (`{ contentSeenVersion }`).
- Değişiklikler 500 ms gecikmeyle otomatik kaydedilir; sayfa kapanırken (`visibilitychange` → `hidden`) bekleyen kayıt hemen yazılır.
- İlk kayıtta `navigator.storage.persist()` çağrılır (varsa); sonuç ayarlar sayfasında gösterilir.

### 9.2 Depo kullanılamıyorsa

Gizli sekme ya da kısıtlı ortamda IndexedDB açılamazsa uygulama bellek içi kipte çalışır ve kalıcı bir uyarı gösterir: "Bu tarayıcı oturumunda planınız kaydedilemiyor. Sayfayı kapatmadan önce yazdırın ya da yedek dosyası indirin."

### 9.3 Uygulama kilidi (isteğe bağlı, varsayılan kapalı)

- Açıldığında plan `encryptBytes(utf8(JSON))` ile şifrelenmiş saklanır (Ek A). Anahtar bellekte tutulur; sekme kapanınca yok olur.
- Açılışta parola sorulur. Yanlış parolada veri silinmez. "Parolamı unuttum" yalnızca planı silip sıfırdan başlamayı önerir; kurtarma yolu yoktur ve bu açıkça söylenir.
- Açmadan önce zorunlu uyarı: "Kilit, telefonunuzu başkası kullanırsa bilgilerinizi korur. Ama acil durumda parolayı hatırlamanız gerekir. Planın basılı bir kopyasını mutlaka bulundurun."
- Parola en az 8 karakter; güç ölçer yok, yalnızca uzunluk ve "kolay tahmin edilen bir şey seçmeyin" notu.
- Acil ekranı (11.9) kilit açıkken de **112 düğmesini** parolasız gösterir; kişisel bilgiler parola ister.

### 9.4 Yedek dosyası

- Dışa aktarma: `ilk72-yedek-YYYY-AA-GG.json`.
  - Düz: `{ "format": "ilk72-yedek", "schemaVersion": 1, "exportedAt": "...", "encrypted": false, "plan": { ... } }`
  - Parolalı: `{ ..., "encrypted": true, "data": "<base64url(encryptBytes(deflate(utf8(JSON(plan)))))>" }`
- İçe aktarma: dosya en çok 1 MB; `format` denetlenir; parolalıysa parola sorulur; sonuç `sanitizePlan`'dan geçer; kullanıcıya özet gösterilir ("4 kişi, 3 acil kişi, son güncelleme …") ve mevcut planın **üzerine yazılacağı** açıkça onaylatılır.
- Ayarlar sayfasında "Bütün verilerimi sil" düğmesi: onaydan sonra veritabanını, önbelleği (`caches`) ve `localStorage`'ı temizler.

## 10. Paylaşım

### 10.1 Özet kart

Paylaşılan şey tam plan değil, **özet kart**tır. Şema (kısa anahtarlar yer kazanmak içindir):

```ts
interface ShareCard {
  v: 1;
  h: string;                                   // hane etiketi
  u: string;                                   // güncelleme tarihi YYYY-AA-GG
  k: { a: string; t: string; o?: string }[];   // kişiler: ad, telefon, (isteğe bağlı) özel not ≤120
  i: { a: string; t: string; d: boolean; s: string }[];  // acil kişiler: ad (+ilişki), telefon, şehir dışı mı, şehir
  b: { e: string; m: string; d: string; t: string };     // buluşma: ev yakını, mahalle, şehir dışı, toplanma alanı
  n: string;                                   // not ≤ 300
}
```

- `k[].o` yalnızca kullanıcı paylaşım ekranında "Özel ihtiyaç notlarını da ekle" kutusunu işaretlerse doldurulur; kutunun altında uyarı: "Bu notlar sağlık bilgisi içerebilir. Bağlantıyı gören herkes okuyabilir. Parola koymanızı öneririz."
- Ev adresi özet karta **girmez**.
- `validateCard(input: unknown): ShareCard` bilinmeyen alanları atar, sınırları uygular (kişi ≤ 12, acil kişi ≤ 10, metin sınırları 8.2), tür uymazsa `Error('bozuk-veri')`.

### 10.2 Bağlantı ve kare kod

- Yük: `encodeShare(card, parola?)` (Ek A). Biçim: `1p.<base64url>` (düz) ya da `1e.<base64url>` (parolalı).
- Bağlantı: `<kök>#/al/<yük>`. Yük URL'nin `#` sonrasında durduğu için tarayıcı onu sunucuya **göndermez**.
- Bağlantı uzunluğu `SHARE_MAX_URL` (1200) değerini aşarsa kare kod üretilmez; "Bilgiler kare kod için fazla uzun. Notları kısaltın ya da yedek dosyasıyla paylaşın." iletisi gösterilir. (Ölçüm: 4 kişilik örnek hane 512 karakter, parolalı 570 karakter; Ek B.3.)
- Kare kod: `qrcode-generator`, otomatik sürüm, hata düzeltme `L`, SVG olarak çizilir, çevresinde 4 modül boşluk, `role="img"` ve açıklayıcı `aria-label`.
- Paylaşım yolları: bağlantıyı kopyala, kare kodu göster, `navigator.share` (varsa). Uygulama kendisi ileti göndermez.

### 10.3 İçe alma (`#/al/<yük>`)

1. Yük çözülür; parolalıysa parola sorulur. Hatalar Türkçe iletiyle gösterilir (Ek B.3'teki kodlar).
2. `validateCard` uygulanır.
3. Önizleme ekranı: "Size bir aile afet planı özeti gönderildi. Göndereni tanıyorsanız kullanın." Kartın içeriği düz metin olarak gösterilir.
4. Seçenekler: "Yalnızca görüntüle ve yazdır" (varsayılan), "Kendi planıma ekle" (kişileri, acil kişileri ve buluşma yerlerini mevcut planla **birleştirir**; çakışan alanlarda kullanıcıya sorar; hiçbir şeyi sormadan ezmez).
5. İçe alınan telefonlar yalnızca 8.2'deki karakter kümesine uyuyorsa `tel:` bağlantısı olur.
6. İşlem bitince adres çubuğundan yük silinir (`history.replaceState`).

## 11. Uygulama akışı

### 11.1 Yollar

| Yol | Sayfa |
|---|---|
| `#/` | Ana sayfa |
| `#/plan/1` … `#/plan/9` | Sihirbaz adımları |
| `#/ozet` | Plan özeti ve doluluk |
| `#/acil` | Acil ekranı |
| `#/rehber`, `#/rehber/once`, `#/rehber/an`, `#/rehber/sonra` | Rehber kartları |
| `#/canta` | Çanta kontrol listesi |
| `#/yazdir` | Çıktı seçimi ve baskı önizleme |
| `#/paylas` | Paylaşım |
| `#/al/<yük>` | İçe alma |
| `#/ayarlar` | Ayarlar, yedek, kilit, silme |
| `#/hakkinda`, `#/gizlilik`, `#/kosullar`, `#/kunye`, `#/erisilebilirlik`, `#/kaynaklar` | Bilgi sayfaları |

Bilinmeyen yol → `NotFound` (ana sayfaya bağlantı). Her yol değişiminde odak sayfa başlığına (`h1`, `tabindex="-1"`) taşınır ve belge başlığı güncellenir.

### 11.2 İlk açılış

Tam ekran olmayan bir bilgilendirme kutusu (yalnızca ilk kez):

> **Başlamadan önce**
> - Bu, bağımsız bir açık kaynak projesidir; resmî bir kurum uygulaması değildir.
> - Acil durumda **112**'yi arayın. Bu uygulama yardım çağırmaz.
> - Yazdıklarınız yalnızca bu cihazda saklanır; bize ya da başkasına gönderilmez.
> - Tavsiyeler resmî kaynaklara dayanır ama onların yerini tutmaz.
>
> [Kullanım koşulları] · [Gizlilik bildirimi] — **[Anladım, başla]**

Onay `settings.firstRunAccepted` olarak saklanır.

### 11.3 Ana sayfa

- Plan yoksa: kısa tanıtım (3 cümle), "Planı hazırlamaya başla" düğmesi, "Boş formu yazdır" bağlantısı, "Bana gönderilen planı aç" açıklaması.
- Plan varsa: doluluk özeti (11.8), "Devam et", "Yazdır", "Acil ekranı", "Paylaş"; son gözden geçirme tarihi ve altı ayı geçtiyse nazik bir hatırlatma.

### 11.4 Sihirbaz — genel kurallar

- 9 adım; üstte adım göstergesi ("3 / 9 — Özel ihtiyaçlar"). Her adım atlanabilir ("Sonra doldururum"); zorunlu tek alan 2. adımda en az bir kişinin adıdır.
- Her adımın başında bir cümlelik "neden" açıklaması ve varsa ilgili rehber kartına bağlantı.
- Doğrulama alanı terk edince ve "İleri"de yapılır; hata iletisi alanın altında, `aria-describedby` ile bağlı, ilk hatalı alana odaklanılır.
- "Geri" veri kaybettirmez; her değişiklik otomatik kaydedilir, "Kaydedildi" durumu `aria-live="polite"` ile duyurulur.

### 11.5 Adımlar

| # | Adım | Alanlar | Notlar |
|---|---|---|---|
| 1 | **Haneniz** | Hane etiketi; adres; bina notu (kat, asansör, merdiven) | Adresin yalnızca tam plan çıktısında yer aldığı belirtilir |
| 2 | **Kişiler** | Tekrarlı: ad*, grup (yetişkin/çocuk/bebek/yaşlı), telefon; gün içinde bulunduğu yerler (tür, ad, telefon, not) | En az 1 kişi. Çocuk için "Okuldan kim teslim alabilir?" ipucu 4. adıma yönlendirir |
| 3 | **Özel ihtiyaçlar** | Kişi başına: hareket, işitme, görme, iletişim desteği kutuları + not. **Ayrı bölüm:** "Sağlık bilgisi eklemek istiyorum" anahtarı | Anahtar açılırken metin: "Kan grubu, hastalık, ilaç gibi bilgiler hassastır. Yalnızca bu cihazda saklanır. Eklemek zorunda değilsiniz; yalnızca acil durumda bir başkasının bilmesi gereken kadarını yazın." Açılınca kişi başına sağlık alanları görünür. Kapatılırken: "Girdiğiniz sağlık bilgileri silinecek." onayı |
| 4 | **Acil kişiler** | Tekrarlı: ad, ilişki, telefon, ikinci telefon, şehir dışı irtibat mı (+şehir), çocukları teslim alabilir mi | Açıklama olarak P-04 maddesi gösterilir. En az bir şehir dışı kişi önerilir, zorunlu değil |
| 5 | **Buluşma yerleri** | Ev yakını; mahallede; şehir dışı; resmî toplanma alanı + "Resmî sorgudan baktım" tarihi | Toplanma alanı için: "Size en yakın afet ve acil durum toplanma alanını e-Devlet'teki resmî sorgudan öğrenin ve buraya yazın." + dış bağlantı (K-EDEVLET). Uygulama alan önermez |
| 6 | **Eviniz** | Odalardaki güvenli yerler; çıkış yolları; elektrik şalteri, gaz vanası, su vanası yer tarifleri; tehlike avı listesi (H-*) | Vana ve şalterin nasıl kapatılacağı anlatılmaz; yalnızca yeri yazılır. Uyarı: "Tesisat üzerinde kendiniz işlem yapmayın; gerekirse yetkili servisten destek alın." |
| 7 | **Görevler** | Rol listesi; her rol için kişi seçimi ve not | Roller: çantayı almak, vana ve şalter, çocuklar, yaşlı ve desteğe ihtiyacı olanlar, evcil hayvanlar, kapıları açık bırakmak/kontrol, şehir dışı kişiye haber vermek. Atanmamış rol sorun değildir |
| 8 | **Çanta ve belgeler** | Çantanın yeri; çanta listesi (C-*, haneye göre üretilir; 11.6); belge kopyaları listesi (B-*); evcil hayvanlar; zorunlu deprem sigortası (evet/hayır/bilmiyorum) | Her madde için kutu + kısa not. Sigorta sorusunun altında DASK resmî sitesine bağlantı |
| 9 | **Gözden geçirme** | Son tatbikat tarihi; bir sonraki gözden geçirme tarihi (varsayılan: bugünden 6 ay sonra); "Takvimime ekle" (.ics) | Açıklama olarak P-10 maddesi gösterilir. Serbest not alanı |

Sihirbaz bitince `#/ozet` açılır.

### 11.6 Çanta listesinin üretimi (`bag.ts`)

Temel maddeler (C-01…C-18) her hanede bulunur. Koşullu maddeler:

| Koşul | Eklenen maddeler |
|---|---|
| `bebek` grubunda kişi var | C-20 … C-23 |
| Herhangi birinde `needs.*` işaretli ya da `health.devices` dolu | C-30, C-31 |
| `health.medications` dolu ya da `yasli` grubunda kişi var | C-32 |
| `pets.length > 0` | C-40, C-41 |
| `cocuk` grubunda kişi var | C-24 |

Hane değiştiğinde liste yeniden üretilir; daha önce işaretlenmiş maddelerin durumu `id` üzerinden korunur. Kullanıcı kendi maddesini ekleyebilir (`id`: `ozel-<uuid>`, en çok 15).

### 11.7 Özet sayfası

Planın bütün bölümleri okunur biçimde; her bölümün yanında "Düzenle" (ilgili adıma gider). Üstte çıktı düğmeleri. Sağlık bilgileri ekranda varsayılan olarak **gizli** ("Göster" ile açılır).

### 11.8 Doluluk (`progress.ts`)

Dokuz bölümün her biri için "dolu / kısmen / boş":

| Bölüm | "Dolu" koşulu |
|---|---|
| Hane | etiket ve adres dolu |
| Kişiler | ≥1 kişi ve hepsinin adı dolu |
| Özel ihtiyaçlar | adım en az bir kez ziyaret edilmiş (`settings` içinde iz) |
| Acil kişiler | ≥1 kişi telefonuyla; ≥1 şehir dışı kişi varsa "dolu", yoksa "kısmen" |
| Buluşma | ev yakını ve mahalle dolu; toplanma alanı doluysa "dolu", değilse "kısmen" |
| Ev | ≥1 güvenli yer ve üç vana/şalter alanından ≥2'si dolu |
| Görevler | ≥1 rol atanmış |
| Çanta ve belgeler | çanta yeri dolu ve temel maddelerin ≥ yarısı işaretli |
| Gözden geçirme | `nextReviewAt` dolu |

Gösterim: "Planınızın 9 bölümünden 6'sı dolu." Hemen altında sabit not: "Bu sayı planın ne kadarını doldurduğunuzu gösterir; bir güvenlik derecesi değildir." (İ9)

### 11.9 Acil ekranı (`#/acil`)

Çevrimdışı açılır, tek sütun, çok büyük punto, yüksek kontrast:

1. **112'yi ara** düğmesi (`<a href="tel:112">`), altında "Bu uygulama yardım çağırmaz."
2. Buluşma yerleri (ev yakını → mahalle → şehir dışı) ve toplanma alanı.
3. Acil kişiler; şehir dışı kişi en üstte; telefonlar `tel:` bağlantısı.
4. Deprem **sonrası** rehber kartlarının kısa listesi (S-*), kaynak bağlantılarıyla.

Ana sayfadan ve her sayfanın üst çubuğundan tek dokunuşla ulaşılır.

### 11.10 Rehber

Üç sekme: Önce / An / Sonra. Her kart: kısa başlık, 1–2 cümle (13.3'teki metin), altında `Kaynak: <kurum> — <sayfa adı> (erişim: GG.AA.YYYY)` bağlantısı. Sayfa başında: "Bu kartlar resmî kaynakların özetidir. Güncel ve ayrıntılı bilgi için kaynağı açın." Durumu `taslak` olan kartlar geliştirme derlemesinde "TASLAK — onaylanmadı" etiketiyle görünür; üretim derlemesinde taslak kart bulunamaz (13.4).

## 12. Çıktılar

Hepsi `#/yazdir` sayfasından seçilir ve tarayıcının yazdırma penceresiyle basılır ya da PDF kaydedilir. Sayfa, hangi belgelerin basılacağını kutularla sorar ve ekranda önizleme gösterir.

Genel baskı kuralları (`print.css`): yalnızca seçilen belgeler görünür; gezinme, düğmeler, alt bilgi gizlenir; siyah metin, beyaz zemin, en az 11 pt (kartlarda en az 8 pt); her belge yeni sayfada başlar (`break-before: page`); satır ve kutular sayfa ortasında bölünmez (`break-inside: avoid`); her sayfanın altında küçük puntoyla "İlk 72 ile hazırlandı · {tarih} · Resmî bir belge değildir."

| # | Belge | İçerik ve düzen |
|---|---|---|
| 12.1 | **Tam plan** (A4, 2–4 sayfa) | Planın tamamı, bölüm başlıklarıyla. Sağlık bilgileri yalnızca "Sağlık bilgilerini de bas" işaretliyse. En üstte "Acil durumda 112" ve buluşma yerleri |
| 12.2 | **Buzdolabı sayfası** (A4, tek sayfa, en az 16 pt) | 112; üç buluşma yeri ve toplanma alanı; acil kişiler; vana ve şalter yerleri; çantanın yeri; görevler. Sağlık bilgisi **yok** |
| 12.3 | **Cüzdan kartı** (kişi başına; 85,6 × 54 mm iki yüz yan yana, ortada katlama çizgisi, kesme işaretleri; A4'e 4 kart) | Ön: ad, hane etiketi, 112, buluşma yerleri. Arka: şehir dışı kişi ve en çok 3 acil kişi telefonu; isteğe bağlı kan grubu ve tek satır özel not (ayrı onayla); isteğe bağlı özet kart kare kodu |
| 12.4 | **Çocuk kartı** (çocuk başına; cüzdan kartı ölçüsü) | Ad; "Ailem:" iki veli telefonu; şehir dışı kişi; buluşma yeri; "Beni teslim alabilecekler:" işaretli acil kişiler. Ev adresi **yok**; okul adı yalnızca ayrı onayla |
| 12.5 | **Çanta kontrol listesi** (A4) | Üretilmiş liste, kutularla; çantanın yeri; son kontrol tarihi için boş satır; altında kaynak notu |
| 12.6 | **Boş form** (A4, 2 sayfa) | Elle doldurulacak plan formu; plan oluşturmadan basılabilir; kişisel veri içermez |

Kâğıt boyutu `@page { size: A4; margin: 12mm }`. Kartların ölçüleri mm ile verilir; tarayıcı ölçeklemesi için önizlemede "Yazdırırken ölçek %100 olsun." notu.

**Takvim dosyası:** `buildIcs` (Ek A). Dosya adı `ilk72-hatirlatma.ics`. Olay tüm gün, `nextReviewAt` tarihinde, altı ayda bir yinelenir. Açıklamada **kişisel veri bulunmaz** (takvim sağlayıcısına gidebileceği için); yalnızca Ek B.2'deki genel metin.

## 13. İçerik kayıt sistemi

### 13.1 Kaynak kaydı (`sources.ts`)

```ts
interface Source {
  key: string;            // "K-ANINDA"
  org: string;            // "AFAD"
  title: string;          // sayfanın adı
  url: string;            // https, izinli alan adlarından
  accessed: string;       // YYYY-AA-GG — metnin kaynakla karşılaştırıldığı tarih
}
```

İzinli alan adları (ve alt alan adları): `afad.gov.tr`, `turkiye.gov.tr`, `112.gov.tr`, `icisleri.gov.tr`, `saglik.gov.tr`, `aile.gov.tr`, `dask.gov.tr`, `kizilay.org.tr`, `mevzuat.gov.tr`, `resmigazete.gov.tr`, `kvkk.gov.tr`, `mebakub.meb.gov.tr`. Uygulamadaki **bütün** dış bağlantılar bu listeden olmak zorundadır (depo ve lisans bağlantıları hariç: `github.com`, `creativecommons.org`, `opensource.org`).

### 13.2 İçerik kaydı (`registry.ts`)

```ts
interface ContentItem {
  id: string;                         // "A-03"
  category: 'plan' | 'canta' | 'belge' | 'tehlike' | 'once' | 'an' | 'sonra';
  text: string;                       // kendi cümlelerimizle, ≤ 220 karakter
  sources: string[];                  // ≥1 kaynak anahtarı
  status: 'taslak' | 'onayli';
  reviewedBy?: string;                // onayli ise zorunlu
  reviewedAt?: string;                // onayli ise zorunlu, YYYY-AA-GG
}
export const CONTENT_VERSION = 1;     // metinler değiştikçe artar; "Hakkında" sayfasında gösterilir
```

Yazım kuralları: emir kipi yerine yalın, sakin anlatım ("… yapın"); korku dili ve ünlem yok; sayı ve süre yalnızca kaynakta varsa; bir maddede tek tavsiye; kaynak metninden cümle kopyalanmaz.

### 13.3 Başlangıç içeriği

Aşağıdaki metinler resmî sayfaların **arama alıntılarına** dayanılarak yazılmış taslaklardır (siteler otomatik erişime kapalıdır). Hepsi `status: 'taslak'` olarak girilir. Onay sırasında kaynak sayfada karşılığı bulunamayan madde **silinir**, düzeltilmez.

**Plan (`plan`)**

| id | Metin | Kaynak |
|---|---|---|
| P-01 | Aile afet ve acil durum planı, afetten sonraki ilk 72 saat için hazırlanır. | K-PLAN72, K-KIRSEHIR |
| P-02 | Planda evin güvenli yerleri, afet ve acil durum çantası ve evi tahliye planı yer alır. | K-PLAN72, K-KIRSEHIR |
| P-03 | Afet anında aile bireyleri arasındaki görev dağılımını önceden belirleyin. | K-KARAR |
| P-04 | Şehir içinde ve şehir dışında birer destek noktası ve irtibat kişisi belirleyin. | K-KARAR |
| P-05 | Evden çıkış için birden fazla yol düşünün. | K-KARAR |
| P-06 | Deprem sonrası buluşma yerinizi ailece kararlaştırın. | K-MUGLA, K-UYARI |
| P-07 | Size en yakın afet ve acil durum toplanma alanını e-Devlet'teki resmî sorgudan öğrenin. | K-MUGLA, K-EDEVLET |
| P-08 | Mahallenizde tahliyenin nasıl yapılacağını öğrenin; komşularınızla yardımlaşmayı konuşun. | K-KIRSEHIR |
| P-09 | İlk 72 saat için su, gıda, tuvalet ve temizlik ihtiyaçlarını nasıl karşılayacağınızı planlayın. | K-KIRSEHIR |
| P-10 | Planınızı düzenli olarak güncelleyin ve ailece uygulayın; en az altı ayda bir tatbikat yapın. | K-MUGLA, K-KARAR |
| P-11 | Çocuk, yaşlı, engelli ve düzenli ilaç kullanan bireylerin ihtiyaçlarını ayrıca planlayın. | K-ENGELLI |
| P-12 | Binanızın bulunduğu yerin deprem tehlikesini resmî Türkiye Deprem Tehlike Haritası'ndan öğrenebilirsiniz. | K-MUGLA, K-TDTH |

**Çanta (`canta`)**

| id | Metin | Kaynak |
|---|---|---|
| C-01 | Su | K-SOZLUK, K-BURDUR |
| C-02 | Uzun süre bozulmayan kuru gıda | K-SOZLUK, K-BURDUR |
| C-03 | İlk yardım çantası | K-SOZLUK, K-BURDUR |
| C-04 | Düzenli kullanılan ilaçlar ve sağlık kayıtları | K-BURDUR, K-SAKARYA |
| C-05 | Önemli evrakların fotokopileri (kimlik vb.) | K-SOZLUK, K-BURDUR |
| C-06 | Acil telefon numaralarının yazılı listesi | K-SOZLUK |
| C-07 | Bir miktar nakit para | K-SOZLUK, K-SAKARYA |
| C-08 | Pilli radyo | K-SOZLUK, K-GUMUSHANE |
| C-09 | El feneri ve yedek piller | K-GUMUSHANE |
| C-10 | Taşınabilir şarj cihazı | K-GUMUSHANE |
| C-11 | Düdük | K-GUMUSHANE |
| C-12 | Çakı | K-GUMUSHANE |
| C-13 | Mevsime uygun yedek giysi | K-SOZLUK, K-GUMUSHANE |
| C-14 | Yağmurluk | K-BURDUR, K-GUMUSHANE |
| C-15 | Hijyen malzemeleri: sabun, tuvalet kâğıdı, havlu | K-BURDUR, K-GUMUSHANE |
| C-16 | Maske | K-BURDUR |
| C-17 | Not defteri ve kalem | K-BURDUR |
| C-18 | Battaniye ya da uyku tulumu | K-ONERI-DOGRULA |
| C-20 | Bebek maması | K-ONERI-DOGRULA |
| C-21 | Bebek bezi | K-ONERI-DOGRULA |
| C-22 | Biberon | K-ONERI-DOGRULA |
| C-23 | Bebek için yedek giysi | K-ONERI-DOGRULA |
| C-24 | Çocuk için küçük bir oyuncak ya da kitap | K-ONERI-DOGRULA |
| C-30 | Kullanılan yardımcı cihazların yedek pili ya da parçası | K-ONERI-DOGRULA |
| C-31 | Özel ihtiyaçlara yönelik malzemeler | K-ONERI-DOGRULA |
| C-32 | Reçete ve ilaç listesinin kopyası | K-ONERI-DOGRULA |
| C-40 | Evcil hayvan için mama ve su | K-ONERI-DOGRULA |
| C-41 | Evcil hayvan için tasma ya da taşıma çantası | K-ONERI-DOGRULA |

`K-ONERI-DOGRULA` gerçek bir kaynak değildir: bu maddeler için resmî kaynak bu belge hazırlanırken doğrulanamamıştır. Sahibi resmî bir kaynak bulursa kaynak anahtarını değiştirir (ilk bakılacak yer: K-CANTA-BB); bulamazsa madde silinir. Bu anahtarı taşıyan madde `onayli` yapılamaz (18.6).

Çanta ile ilgili ek notlar (`canta` kategorisi, liste dışı):

| id | Metin | Kaynak |
|---|---|---|
| C-90 | Çantayı evin çıkışına yakın bir yerde tutun. | K-KIRSEHIR2 |
| C-91 | Çantadaki gıda, su ve ilaçların tarihlerini düzenli olarak kontrol edin. | K-ONERI-DOGRULA |
| C-92 | Aile için ortak bir çanta ya da her birey için ayrı çanta hazırlanabilir. | K-SAKARYA |
| C-93 | Benzer bir çantayı iş yerinde ve araçta da bulundurabilirsiniz. | K-KOCAELI |
| C-94 | Yatağınızın yanında su, düdük, fener ve ayakkabı bulundurun. | K-KIRSEHIR |

**Belge kopyaları (`belge`)**

| id | Metin | Kaynak |
|---|---|---|
| B-01 | Kimlik belgelerinin fotokopisi | K-BURDUR |
| B-02 | Tapu ve benzeri değerli evrakların kopyası | K-SAKARYA |
| B-03 | Sağlık kayıtları | K-BURDUR |
| B-04 | Sigorta belgelerinin kopyası | K-ONERI-DOGRULA |
| B-05 | Diploma ve benzeri önemli belgelerin kopyası | K-ONERI-DOGRULA |

**Tehlike avı (`tehlike`)**

| id | Metin | Kaynak |
|---|---|---|
| H-01 | Rafları ve dolapları duvara sabitleyin. | K-CEVRE, K-ONLEM2 |
| H-02 | Ağır ve büyük eşyaları alt raflara yerleştirin. | K-CEVRE |
| H-03 | Kavanoz ve şişeleri kilidi ya da mandalı olan kapalı dolaplarda tutun. | K-CEVRE |
| H-04 | Tablo ve aynaları yatak ve oturma yerlerinden uzak duvarlara sabitleyin. | K-CEVRE |
| H-05 | Tavandaki ağır nesnelerin ve aydınlatmaların bağlantılarını sağlamlaştırın. | K-CEVRE |
| H-06 | Su ısıtıcısı, buzdolabı, fırın gibi cihazları uygun malzemeyle duvara ya da yere sabitleyin. | K-ONLEM, K-MUGLA |
| H-07 | Tarım ve böcek ilaçlarını, yanıcı maddeleri kilitli, kapalı dolaplarda ve alt raflarda saklayın. | K-ONLEM |
| H-08 | Hasarlı elektrik kablosu ya da gaz bağlantısı varsa yetkili servise onartın; kendiniz işlem yapmayın. | K-ONLEM |
| H-09 | Çıkış yolunu kapatabilecek eşyaların yerini değiştirin. | K-KIRSEHIR2 |
| H-10 | Elektrik şalterinin, gaz ve su vanalarının yerini evdeki herkes bilsin. | K-ONERI-DOGRULA |

**Deprem öncesi (`once`)**

| id | Metin | Kaynak |
|---|---|---|
| O-01 | Evinizde tehlike avı yapın: devrilebilecek, düşebilecek eşyaları belirleyip sabitleyin. | K-MUGLA, K-UYARI |
| O-02 | Afet ve acil durum çantanızı hazırlayın. | K-MUGLA, K-CEVRE |
| O-03 | Ailece Çök-Kapan-Tutun hareketini öğrenin ve deneyin. | K-MUGLA, K-UYARI |
| O-04 | Oturduğunuz binanın yapı ruhsatı ve yapı kullanma izin belgesi olduğunu teyit edin. | K-HAFTA |
| O-05 | Binanın taşıyıcı kolon ve duvarlarına müdahale edilmesine izin vermeyin. | K-HAFTA2 |
| O-06 | Binanızın dayanıklılığından emin değilseniz yetkili kuruluşlara inceletin. | K-HAFTA |
| O-07 | Konutunuz için zorunlu deprem sigortası yaptırın. | K-ONLEM2 |

**Deprem anı (`an`)**

| id | Metin | Kaynak |
|---|---|---|
| A-01 | Sakin kalmaya çalışın; sarsıntı durana kadar bulunduğunuz yerde kalın. | K-ANINDA |
| A-02 | Güvenli bir yerde diz üstü çökün, başınızı ve ensenizi koruyacak şekilde kapanın, sabit bir yere tutunun. | K-ANINDA, K-OKUL |
| A-03 | Cam, pencere, dışarıya bakan duvar ve kapılardan, üzerinize düşebilecek eşyalardan uzak durun. | K-OKUL, K-ANINDA |
| A-04 | Merdivenlere ve çıkışlara doğru koşmayın. | K-OKUL |
| A-05 | Balkon, merdiven ve asansörlerden uzak durun. | K-ILK6 |
| A-06 | Dışarıdaysanız enerji hatlarından, binalardan, direklerden, ağaçlardan ve duvar diplerinden uzaklaşın. | K-OKUL, K-KILIS |

**Deprem sonrası (`sonra`)**

| id | Metin | Kaynak |
|---|---|---|
| S-01 | Sarsıntı durunca çevrenizin ve kendinizin güvende olduğundan emin olduktan sonra binadan çıkın. | K-KILIS, K-MUGLA |
| S-02 | Kibrit ya da çakmak yakmayın; elektrik düğmelerine dokunmayın. | K-KILIS |
| S-03 | Gaz ve su vanalarını kapatın; gaz kokusu yoksa elektrik şalterini de kapatın. Soba ve ısıtıcıları söndürün. | K-KILIS, K-HAFTA |
| S-04 | Afet ve acil durum çantanızı alarak toplanma alanına gidin. | K-KILIS, K-HAFTA |
| S-05 | Hasarlı binalardan ve enerji hatlarından uzak durun. | K-ONLEM2 |
| S-06 | Deniz kıyısındaysanız tsunami tehlikesine karşı kıyıdan uzaklaşıp yüksek bir yere çıkın. | K-KILIS |
| S-07 | Yardıma ihtiyaç duyabilecek bebek, çocuk, yaşlı, engelli ve hamilelere destek olun. | K-KILIS |
| S-08 | İlk saatlerde aracınızı kullanmayın; yolları acil yardım araçlarına bırakın. | K-ILK6, K-BURSA |
| S-09 | Yetkililer yönlendirene kadar toplanma alanında kalın. | K-ILK6 |
| S-10 | Radyo ve televizyondan yapılan resmî uyarıları izleyin. | K-BURSA |

**Kaynak anahtarları**

| Anahtar | Kurum ve sayfa | Adres |
|---|---|---|
| K-PLAN72 | AFAD — Depremler Önlenemez, Ancak Depremlerin Afetlere Dönüşmesi Önlenebilir | `https://www.afad.gov.tr/depremler-onlenemez-ancak-depremlerin-afetlere-donusmesi-onlenebilir` |
| K-KIRSEHIR | Kırşehir İl AFAD — Aile Afet ve Acil Durum Planı | `https://kirsehir.afad.gov.tr/aile-afet-ve-acil-durum-plani` |
| K-KIRSEHIR2 | Kırşehir İl AFAD — Deprem Değil İhmal Öldürür | `https://kirsehir.afad.gov.tr/deprem-degil-ihmal-oldurur` |
| K-MUGLA | Muğla İl AFAD — Sevdikleriniz ve Kendiniz İçin Önlem Alın, Güvende Kalın | `https://mugla.afad.gov.tr/sevdikleriniz-ve-kendiniz-icin-onlem-alin-guvende-kalin` |
| K-UYARI | AFAD — AFAD Uyarıyor: Deprem İçin Önlemlerinizi Alın | `https://www.afad.gov.tr/afad-uyariyor-deprem-icin-onlemlerinizi-alin` |
| K-CEVRE | AFAD — Deprem Öncesi Çevrenizi Hazırlayın | `https://www.afad.gov.tr/deprem-oncesi-cevrenizi-hazirlayin` |
| K-ONLEM | AFAD — Deprem Öncesi, Anı ve Sonrası Önlemini Al, Güvende Kal | `https://www.afad.gov.tr/deprem-oncesi-ani-ve-sonrasi-onlemini-al-guvende-kal` |
| K-ONLEM2 | AFAD — Deprem Öncesi, Anı ve Sonrası Alabileceğiniz Önlemleri Biliyor Musunuz? | `https://www.afad.gov.tr/deprem-oncesi-ani-ve-sonrasi-alabileceginiz-onlemleri-biliyor-musunuz` |
| K-ANINDA | AFAD — Deprem Anında Neler Yapmalısınız? | `https://www.afad.gov.tr/deprem-aninda-neler-yapmalisiniz` |
| K-HAFTA | AFAD — 1-7 Mart Deprem Haftası'nı Hazırlık ile Değerlendirin (basın duyurusu) | `https://www.afad.gov.tr/1-7-mart-deprem-haftasini-hazirlik-ile-degerlendirin---basin-duyurusu` |
| K-HAFTA2 | AFAD — 1-7 Mart Deprem Haftası'nı Hazırlık İle Değerlendirin (basın bülteni) | `https://www.afad.gov.tr/1-7-mart-deprem-haftasini-hazirlik-ile-degerlendirin` |
| K-KILIS | Kilis İl AFAD — 1-7 Mart Deprem Haftası'nı Hazırlık ile Değerlendirin | `https://kilis.afad.gov.tr/1-7-mart-deprem-haftasini-hazirlik-ile-degerlendirin` |
| K-OKUL | AFAD — Deprem Haftası'nda Tüm Okullarda Aynı Anda Deprem Tatbikatı Yapılacak | `https://www.afad.gov.tr/deprem-haftasinda-tum-okullarda-ayni-anda-deprem-tatbikati-yapilacak---basin-bulteni` |
| K-ILK6 | İstanbul İl AFAD — Deprem Sonrası İlk 6 Saate Dikkat | `https://istanbul.afad.gov.tr/deprem-sonrasi-ilk-6-saate-dikkat---basin-bulteni` |
| K-BURSA | Bursa İl AFAD — Deprem | `https://bursa.afad.gov.tr/deprem` |
| K-SOZLUK | AFAD — Açıklamalı Afet Yönetimi Terimleri Sözlüğü ("afet ve acil durum çantası" maddesi) | `https://www.afad.gov.tr/aciklamali-afet-yonetimi-terimleri-sozlugu` |
| K-CANTA-BB | AFAD — Afet ve Acil Durum Çantası Hazırlayın (basın bülteni) | `https://www.afad.gov.tr/afet-ve-acil-durum-cantasi-hazirlayin-basin-bulteni` |
| K-BURDUR | Burdur İl AFAD — Afet ve Acil Durum Çantası Hazırlamalıyız | `https://burdur.afad.gov.tr/afet-ve-acil-durum-cantasi-hazirlamaliyiz` |
| K-GUMUSHANE | Gümüşhane İl AFAD — Afet ve Acil Durum Çantasında Neler Bulunmalı? | `https://gumushane.afad.gov.tr/afet-ve-acil-durum-cantasinda-neler-bulunmali` |
| K-SAKARYA | Sakarya İl AFAD — Afet ve Acil Durum Çantası Neden Önemli? | `https://sakarya.afad.gov.tr/afet-ve-acil-durum-cantasi-neden-onemli` |
| K-KOCAELI | Kocaeli İl AFAD — Afet Çantanız Hazır Olsun ki Canınız Sağ Olsun | `https://kocaeli.afad.gov.tr/afet-cantaniz-hazir-olsun-ki-caniniz-sag-olsun` |
| K-EDEVLET | e-Devlet Kapısı — Afet ve Acil Durum Toplanma Alanı Sorgulama | `https://www.turkiye.gov.tr/afet-ve-acil-durum-yonetimi-acil-toplanma-alani-sorgulama` |
| K-TDTH | AFAD — Türkiye Deprem Tehlike Haritaları | `https://tdth.afad.gov.tr` |
| K-112 | İçişleri Bakanlığı — 112 Acil Çağrı Merkezi Projesi | `https://www.112.gov.tr/112-acm-projesi` |
| K-KARAR | **Doğrulanacak:** altı ayda bir tatbikat, görev dağılımı, şehir içi ve dışı destek noktaları, alternatif kaçış yolları önerileri bu belge hazırlanırken yalnızca AFAD'a atıf yapan bir basın haberinden görüldü. Sahibi AFAD'ın kendi sayfasını bulup bu anahtarı ona bağlamalı | (resmî adres bulunacak) |
| K-ENGELLI | **Doğrulanacak:** İstanbul Valiliği İPKB (İSMEP) "Engelli Bireyler İçin Afet ve Acil Durum" rehberi; resmî yayın sayfası bulunup bağlanmalı | (resmî adres bulunacak) |

Adresi "bulunacak" olan anahtarlar `K-ONERI-DOGRULA` gibi davranır: bağlı maddeler `onayli` yapılamaz.

### 13.4 Onay kapısı

1. `content:check` betiği şunları denetler: her maddenin ≥1 kaynağı var; kaynak anahtarları kayıtlı; kaynak adresleri `https` ve izinli alan adlarında; metin ≤ 220 karakter; `onayli` maddelerde `reviewedBy` ve `reviewedAt` dolu; `onayli` hiçbir madde doğrulanmamış kaynak anahtarı taşımıyor; `id`'ler benzersiz.
2. `build:prod` ayrıca `taslak` madde kalmışsa **başarısız olur**. `build` (geliştirme) taslaklara izin verir ve her sayfada "TASLAK SÜRÜM — içerik onaylanmamıştır" şeridi gösterir.
3. Onay süreci `docs/icerik-onay.md` içinde yazılıdır: sahibi kaynağı tarayıcıda açar, maddeyi karşılaştırır, gerekirse metni düzeltir, `status`, `reviewedBy`, `reviewedAt` ve kaynağın `accessed` alanını günceller; her onay ayrı bir commit olur.
4. Her yıl ve büyük bir afetten sonra resmî tavsiyeler değişmiş olabilir: `reviewedAt` üzerinden 12 ay geçen maddeler için `content:check` uyarı verir; 18 ay geçince `build:prod` başarısız olur.
5. Kullanıcıların yanlış ya da eskimiş içeriği bildirmesi için her rehber kartında "Hata bildir" bağlantısı (depo sorun şablonuna gider) ve Künye sayfasında e-posta bulunur.

## 14. Hukuki metin taslakları

Bu metinler `src/i18n/tr.ts` içinde durur ve ilgili sayfalarda gösterilir. Avukat onayına kadar taslaktır; ajan anlamlarını değiştirmez, yalnızca yer tutucuları doldurur.

### 14.1 Gizlilik Bildirimi (`#/gizlilik`)

> **Kısaca:** Yazdıklarınız cihazınızdan çıkmaz. Sizi izlemiyoruz.
>
> **Hangi bilgiler nerede durur?** Planınıza yazdığınız her şey (adlar, telefonlar, adres, isterseniz sağlık bilgileri) yalnızca bu cihazdaki tarayıcının deposunda saklanır. Bize ya da başka birine gönderilmez. Sunucumuz, üyelik sistemimiz ya da veritabanımız yoktur; bu bilgilere erişemeyiz.
>
> **Çerez ve izleme.** Çerez, analitik, reklam ya da izleme aracı kullanmıyoruz. Tarayıcı deposunu yalnızca planınızı ve ayarlarınızı saklamak için kullanıyoruz.
>
> **Barındırma.** Uygulamanın dosyaları GitHub Pages üzerinden sunulur. Her internet sitesinde olduğu gibi, barındırma sağlayıcısı sayfayı açtığınızda IP adresinizi ve tarayıcı bilginizi kendi kayıtlarına yazabilir. Bu kayıtlara biz erişemeyiz; ayrıntı için sağlayıcının gizlilik politikasına bakabilirsiniz. Uygulamayı bir kez açtıktan sonra internet olmadan da kullanabilirsiniz.
>
> **Paylaşım.** Bir özeti bağlantı ya da kare kodla paylaşırsanız bilgiler o bağlantının içinde taşınır; sunucuya gönderilmez. Bağlantıyı gören herkes içeriğini okuyabilir. Parola koyarsanız yalnızca parolayı bilenler okuyabilir. Bağlantıyı kimle paylaştığınız sizin sorumluluğunuzdadır.
>
> **Başkalarının bilgileri.** Planınıza aile üyelerinizin ve yakınlarınızın bilgilerini yazıyorsunuz. Bu bilgileri yalnızca aileniz ve güvendiğiniz kişilerle paylaşın; adı geçenlere haber verin.
>
> **Takvim hatırlatması.** İndirdiğiniz takvim dosyasında kişisel bilginiz yer almaz.
>
> **Silme.** Ayarlar sayfasındaki "Bütün verilerimi sil" düğmesi bu cihazdaki her şeyi kalıcı olarak siler. Yazdırdığınız kâğıtlar ve paylaştığınız bağlantılar sizdedir.
>
> **İletişim.** Azar Gozalli — gozelliazer@gmail.com
>
> Son güncelleme: {TARIH}

### 14.2 Kullanım Koşulları ve Sorumluluk Reddi (`#/kosullar`)

> **Bu uygulama nedir?** İlk 72, ailenizin afet ve acil durum planını hazırlamanıza yardımcı olan ücretsiz ve açık kaynak bir araçtır. Gönüllü olarak geliştirilir.
>
> **Ne değildir?** Resmî bir kurum uygulaması değildir; herhangi bir kurumla bağlantısı yoktur. Acil yardım hizmeti değildir; yardım çağırmaz, uyarı göndermez. Acil durumda 112'yi arayın. Tıbbi, hukuki, mühendislik ya da sigorta danışmanlığı vermez.
>
> **İçerik.** Rehber metinleri resmî kurumların kamuya açık tavsiyelerinden özetlenmiştir ve her birinin kaynağı gösterilir. Özen göstermemize rağmen içerik eksik, eskimiş ya da durumunuza uygun olmayabilir. Güncel ve bağlayıcı bilgi için resmî kaynaklara ve yetkililerin yönlendirmelerine uyun. Afet anında yetkililerin talimatları her zaman bu uygulamadaki bilgilerden önce gelir.
>
> **Sizin sorumluluğunuz.** Plana yazdığınız bilgilerin doğruluğu, güncelliği ve kimlerle paylaşıldığı sizin sorumluluğunuzdadır. Planın basılı bir kopyasını bulundurun; cihazınız afet anında çalışmayabilir.
>
> **Garanti.** Uygulama "olduğu gibi" sunulur; kesintisiz ya da hatasız çalışacağı garanti edilmez. Yürürlükteki hukukun izin verdiği ölçüde, uygulamanın kullanımından doğabilecek zararlardan sorumluluk kabul edilmez. Bu madde, hukuken sınırlandırılamayan sorumlulukları kaldırmaz.
>
> **Lisans.** Kaynak kodu MIT lisansı, rehber metinleri CC BY 4.0 lisansı altındadır.
>
> **Hata bildirimi.** Yanlış ya da eskimiş bir bilgi görürseniz lütfen bildirin: https://github.com/avazargozalli/ilk72/issues ya da gozelliazer@gmail.com
>
> Son güncelleme: {TARIH}

### 14.3 Künye ve İletişim (`#/kunye`)

> Sorumlu: Azar Gozalli · E-posta: gozelliazer@gmail.com · Kaynak kodu: https://github.com/avazargozalli/ilk72 · Barındırma: GitHub Pages · Uygulama sürümü: {SURUM} · İçerik sürümü: {ICERIK_SURUMU} · Ticari amaç taşımaz; bağış ya da ödeme kabul etmez.

### 14.4 Erişilebilirlik Beyanı (`#/erisilebilirlik`)

> Bu uygulamayı herkesin kullanabilmesini istiyoruz. Hedefimiz WCAG 2.2 AA düzeyidir. Uygulama klavyeyle kullanılabilir, ekran okuyucularla denenmiştir, metin boyutu büyütülebilir. Bilinen eksikler: {BILINEN_EKSIKLER}. Bir engelle karşılaşırsanız gozelliazer@gmail.com adresine yazın; en geç 14 gün içinde yanıt vermeye çalışırız. Bu beyan gönüllüdür; resmî bir erişilebilirlik belgesi ya da logosu anlamına gelmez. Son değerlendirme: {TARIH}

### 14.5 Her sayfanın alt bilgisi

> Bağımsız bir açık kaynak projesidir; resmî bir kurum uygulaması değildir. Acil durumda 112. · [Gizlilik] · [Koşullar] · [Künye] · [Erişilebilirlik] · [Kaynaklar]

## 15. Arayüz, erişilebilirlik, dil

- **Görsel dil:** sakin, sade, tek vurgu rengi; alarm kırmızısı yalnızca 112 düğmesinde. Kurumsal renk ve amblem çağrışımlarından kaçınılır (İ5). Simgeler özgün, çizgisel, metinle birlikte.
- **Tipografi:** sistem yazı tipi yığını; gövde 18 px; "Büyük yazı" ayarıyla 22 px; satır yüksekliği 1,5; satır uzunluğu en çok ~65 karakter.
- **Dokunma hedefleri:** en az 44 × 44 CSS pikseli; aralarında en az 8 px.
- **Renk:** açık ve koyu tema (`prefers-color-scheme`); metin kontrastı ≥ 4,5:1, büyük metin ve arayüz öğeleri ≥ 3:1; bilgi yalnızca renkle verilmez.
- **Klavye:** her şey klavyeyle; görünür odak; mantıklı sekme sırası; "İçeriğe geç" bağlantısı; iletişim kutularında odak hapsi ve `Esc`.
- **Ekran okuyucu:** anlamlı HTML (`main`, `nav`, `h1`–`h3`, `fieldset`/`legend`, `label`); durum iletileri `aria-live`; hata özetleri; tekrarlı alanlarda "Kişi 2 / 4" adlandırması.
- **Hareket:** animasyon yok denecek kadar az; `prefers-reduced-motion` gözetilir.
- **Dil:** sade Türkçe; kısa cümle; yabancı terim ve kısaltma yok; "siz" hitabı; suçlayıcı ya da korkutucu ifade yok. Hata iletileri ne olduğunu ve ne yapılacağını söyler.
- **Küçük ekran:** 320 px genişlikte yatay kaydırma yok; %200 yakınlaştırmada kullanılabilir.
- **Zaman sınırı yok;** oturum sona ermez; veri otomatik kaydedilir.

## 16. PWA ve çevrimdışı

- `manifest.webmanifest`: ad "İlk 72", kısa ad "İlk 72", `lang: "tr"`, `display: "standalone"`, `start_url` ve `scope` göreli, özgün simgeler (192, 512, maskelenebilir).
- Hizmet çalışanı bütün uygulama kabuğunu ve içerik dosyalarını ön belleğe alır; ilk ziyaretten sonra uygulama tamamen çevrimdışı çalışır. Çalışma zamanı önbelleği **yoktur** (dış istek olmadığı için gerekmez).
- Güncelleme: yeni sürüm hazır olduğunda "Yeni sürüm hazır. [Yenile]" bildirimi; kullanıcı onaylamadan sayfa yenilenmez (form doldururken veri kaybını önlemek için).
- Çevrimdışıyken üst çubukta küçük "Çevrimdışı — planınız kullanılabilir" notu.
- Ana ekrana ekleme için tarayıcının kendi akışı kullanılır; ısrarcı istem gösterilmez. Ayarlar sayfasında kısa bir "Ana ekrana nasıl eklenir?" açıklaması bulunur.

## 17. Güvenlik

- **CSP** (`index.html` içinde meta): `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; worker-src 'self'; manifest-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'` (son yönerge meta ile uygulanamazsa barındırma başlığıyla verilir; verilemiyorsa `docs/kararlar.md`'ye yazılır).
- Kullanıcı verisi DOM'a yalnızca Preact'in metin düğümleriyle girer; `dangerouslySetInnerHTML` **yasak** (lint kuralı ve test).
- `tel:` ve dış bağlantılar yalnızca doğrulanmış değerlerle üretilir; dış bağlantılarda `rel="noopener noreferrer"` ve `target="_blank"`; `<meta name="referrer" content="no-referrer">`.
- İçe aktarma ve paylaşım girdileri güvenilmezdir: boyut sınırları, sıkıştırma bombası sınırı (`SHARE_MAX_JSON`), şema temizliği (8.3, 10.1).
- Şifreleme: PBKDF2-HMAC-SHA256, 600.000 tur, 16 baytlık rastgele tuz; AES-256-GCM, 12 baytlık rastgele başlangıç vektörü; her şifrelemede yeni tuz ve vektör (Ek A). Parola hiçbir yere yazılmaz.
- Bağımlılıklar: CI'da `npm audit --omit=dev` (yüksek ve kritik açıkta başarısız); Dependabot açık; kilit dosyası zorunlu.
- `SECURITY.md`: açıkların özelden bildirilmesi.
- `robots.txt`: dizine eklenmeye izin verir (uygulamada kişisel veri sunulmaz); `#/al/...` yolları zaten sunucuya gitmez.

## 18. Testler

### 18.1 Genel
Vitest (birim ve bileşen), Playwright (uçtan uca; Chromium, Firefox, WebKit; ayrıca 360 × 640 mobil görünüm). `src/model`, `src/storage`, `src/share`, `src/output`, `src/content` için satır ve dal kapsamı ≥ %90.

### 18.2 Model
- `sanitizePlan`: bilinmeyen alan atma, sınır kesme, tür düzeltme, `healthOptIn` kapalıyken sağlık alanlarının silinmesi, geçersiz rol atamasının temizlenmesi, sürüm hatası, 12'den fazla kişinin kesilmesi.
- `progress`: 11.8 tablosundaki her koşul için dolu/kısmen/boş örnekleri.
- `bag`: 11.6 tablosundaki her koşul; işaret durumunun korunması; özel madde sınırı.

### 18.3 Saklama, şifreleme, paylaşım, takvim
- Ek B.1 bilinen yanıt testi (şifreleme çıktısı bayt bayt aynı).
- Rastgele tuz ve vektörle gidiş-dönüş; yanlış parola; bozulmuş veri; 44 bayttan kısa girdi.
- Ek B.3 paylaşım durumları: gidiş-dönüş (düz ve parolalı), hata kodları, sıkıştırma bombası, uzunluk sınırı.
- Özet kartta ev adresi ve sağlık alanı **bulunmadığının** denetimi; `o` alanının yalnızca onayla dolduğu.
- Ek B.2 takvim çıktısı (bayt bayt aynı); 75 oktet satır sınırı; kaçış kuralları.
- Yedek: dışa aktar → içe aktar eşitliği (düz ve parolalı); 1 MB üstü dosya reddi; yanlış `format`.
- IndexedDB (`fake-indexeddb`): kaydet/oku, kilitli kayıt, bellek içi yedek kip.

### 18.4 Uçtan uca
1. İlk açılış kutusu → sihirbazın 9 adımı → özet → yazdırma önizlemesi (her belge türü görünür).
2. Sayfayı yenile → veriler duruyor.
3. Çevrimdışı kipte yeniden aç → uygulama ve acil ekranı çalışıyor.
4. Paylaşım: bağlantı üret → yeni bağlamda aç → önizleme → "yalnızca görüntüle"; parolalı sürüm; adres çubuğundan yükün silinmesi.
5. Sağlık anahtarı: aç, doldur, kapat → veriler silindi; paylaşımda ve buzdolabı sayfasında sağlık bilgisi yok.
6. Kilit: aç, yenile, parola sor; yanlış parola; acil ekranında 112 parolasız görünür.
7. "Bütün verilerimi sil" → depo boş.
8. Her sayfada alt bilgi metni var (İ5).
9. XSS: ad alanlarına `<img src=x onerror=alert(1)>` ve `"><script>alert(1)</script>` yaz → her ekranda ve baskı önizlemesinde düz metin; hiçbir iletişim kutusu açılmaz.

### 18.5 Dış istek testi
Playwright'ta bütün istekler dinlenir; test kökeni dışındaki **herhangi** bir istek testi başarısız kılar. 18.4'teki senaryoların tamamı bu denetim altında koşar.

### 18.6 İçerik testleri
`content:check` kurallarının her biri için olumlu ve olumsuz örnek; uygulamadaki bütün dış bağlantıların izinli alan adlarında olduğunun taranması; `taslak` içerikle `build:prod`'un başarısız olduğunun doğrulanması; arayüz metinlerinde yasaklı ifadelerin ("güvendesiniz", "garanti", "resmî uygulama", "bağış", "IBAN") bulunmadığının taranması (hukuki sayfalardaki açıklayıcı kullanımlar için açık istisna listesi).

### 18.7 Erişilebilirlik
`@axe-core/playwright` ile her sayfada ve her sihirbaz adımında WCAG 2.2 AA etiketli kurallar: sıfır ihlal. Ek olarak elle kontrol listesi `docs/mimari.md` içinde: yalnızca klavyeyle tam akış; bir ekran okuyucuyla tam akış; %200 yakınlaştırma; 320 px; koyu tema; baskı çıktılarının okunurluğu.

### 18.8 Boyut ve başarım
Toplam JavaScript (gzip) ≤ 150 kB; ilk yükleme düşük donanımlı telefonda kabul edilebilir (Playwright'ta 4× CPU yavaşlatma ve "Fast 3G" ile etkileşime hazır olma ≤ 5 sn).

## 19. CI/CD

- **`ci.yml`** (push, pull request): `npm ci` → `lint` → `typecheck` → `coverage` → `content:check` → `build` → Playwright tarayıcı kurulumu → `e2e` → `npm audit --omit=dev`. Ek adım: depoda `FUNDING.yml` bulunmadığını denetle.
- **`pages.yml`** (yalnızca `v*` etiketi ve elle tetikleme): `npm ci` → `build:prod` (onaysız içerik varsa burada durur) → `docs/hukuki-inceleme.md` dosyasının "Onay tarihi" satırının dolu olduğunu denetle → Pages'e yayımla. `main` dalına her itişte **yayımlanmaz**; böylece onaysız içerik ve incelenmemiş sürüm canlıya çıkamaz.
- Geliştirme önizlemesi isteyenler `npm run build && npm run preview` kullanır.
- Action'ların güncel ana sürümleri; en dar `permissions`.

## 20. Belgeler

- **`README.md`:** ne olduğu; ekran görüntüsü yer tutucusu; canlı adres; ilkeler (Bölüm 2'nin kısa hali); "ne değildir"; nasıl kullanılır; gizlilik özeti; nasıl katkı verilir; içerik ve kaynak politikası; lisanslar; sınırlar (Bölüm 22).
- **`CONTRIBUTING.md`:** kurulum; `npm run check`; içerik önerme kuralları (resmî kaynak zorunlu, izinli alan adları, kendi cümleleriyle); çeviri katkısı; ilkeleri delen önerilerin kabul edilmeyeceği.
- **`docs/kararlar.md`:** tasarım kararları, tarihleriyle.
- **`docs/hukuki-inceleme.md`:** şablon: inceleyen, tarih, kapsam, Bölüm 4.4 sorularına yanıtlar, istenen değişiklikler, "Onay tarihi:" satırı.
- **`docs/icerik-onay.md`:** 13.4'teki süreç, adım adım; onaylayan kişinin nitelikleri; yıllık gözden geçirme takvimi.
- **`docs/mimari.md`:** modüller, veri akışı, saklama, paylaşım biçimi, elle test listeleri.
- **`SECURITY.md`, `CODE_OF_CONDUCT.md`, `CHANGELOG.md`, `LICENSE` (MIT, "Azar Gozalli ve ilk72 katkıcıları"), `LICENSE-CONTENT` (CC BY 4.0), `THIRD_PARTY_LICENSES.md`.**
- **Sorun şablonları:** hata; yanlış ya da eskimiş içerik (kaynak adresi zorunlu); erişilebilirlik engeli; öneri.

## 21. Uygulama aşamaları ve kabul ölçütleri

| # | Aşama | Yapılacak | Bitti sayılır |
|---|---|---|---|
| 21.1 | İskelet | Depo yapısı, araçlar, boş Preact uygulaması, yönlendirici, CSP | `lint`, `typecheck`, `test`, `build` hatasız; boş sayfa açılıyor |
| 21.2 | Model | `types`, `defaults`, `validate`, `progress`, `bag` | 18.2 testleri geçer |
| 21.3 | Saklama | `idb`, `store`, `crypto`, `backup` | 18.3'ün saklama, şifreleme, yedek testleri geçer |
| 21.4 | Paylaşım ve takvim | `codec`, `card`, `qr`, `ics` | 18.3'ün paylaşım ve takvim testleri geçer; Ek B vektörleri birebir |
| 21.5 | İçerik | `sources`, `registry` (13.3'ün tamamı, hepsi `taslak`), `check` | 18.6 testleri geçer; `build:prod` beklendiği gibi başarısız |
| 21.6 | Ortak arayüz | Bileşenler, stiller, i18n, alt bilgi, ilk açılış kutusu | Bileşen testleri; axe sıfır ihlal |
| 21.7 | Sihirbaz | 9 adım, otomatik kayıt, doğrulama | 18.4-1 ve 18.4-2 geçer |
| 21.8 | Özet, acil, rehber, çanta | İlgili sayfalar | 18.4-3, 18.4-5, 18.4-8 geçer |
| 21.9 | Çıktılar | Yazdırma sayfası ve 6 belge düzeni, takvim indirme | Elle baskı kontrolü: A4'te taşma yok, kart ölçüleri cetvelle doğru; 18.4-1 |
| 21.10 | Paylaşım arayüzü, ayarlar, kilit | Paylaş, içe al, ayarlar, yedek, silme | 18.4-4, 18.4-6, 18.4-7, 18.4-9 geçer |
| 21.11 | PWA | Manifest, hizmet çalışanı, güncelleme bildirimi | 18.4-3 ve 18.5 geçer; çevrimdışı tam akış |
| 21.12 | Hukuki sayfalar, belgeler, CI | Bölüm 14, 19, 20 | İş akışları geçerli; bütün belge dosyaları var |
| 21.13 | Son kontrol | Aşağıdaki liste | Tüm maddeler işaretli |

### 21.13 Son kontrol listesi

Ajanın tamamlayacakları:

- [ ] `npm run check` temiz kopyada hatasız.
- [ ] Ek B vektörleri testlerde birebir kullanılıyor.
- [ ] Dış istek testi (18.5) bütün uçtan uca senaryolarda geçiyor.
- [ ] `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `fetch(`, `XMLHttpRequest`, `WebSocket`, `sendBeacon` kaynak kodda yok (hizmet çalışanının kendi önbellek mantığı dışında).
- [ ] Çalışma zamanı bağımlılıkları yalnızca `preact` ve `qrcode-generator`; lisansları `THIRD_PARTY_LICENSES.md` içinde.
- [ ] Bölüm 2'deki 12 ilkenin her biri için karşılık gelen test ya da elle kontrol `docs/mimari.md` içinde işaretli.
- [ ] `build:prod` taslak içerik nedeniyle başarısız oluyor (bu aşamada beklenen durum) ve hata iletisi hangi maddelerin onay beklediğini listeliyor.
- [ ] Yer tutucular ve sahibine kalan işler raporda listelendi.

Sahibinin tamamlayacakları (bunlar bitmeden yayın yapılmaz):

- [ ] Bölüm 13.3'teki bütün maddeler onaylandı ya da silindi; `build:prod` geçiyor.
- [ ] `docs/hukuki-inceleme.md` dolduruldu, "Onay tarihi" yazıldı; istenen değişiklikler uygulandı.
- [ ] Ad ve marka araması yapıldı.
- [ ] Barındırma seçeneği kararlaştırıldı; gizlilik bildirimi ve künye buna göre dolduruldu.
- [ ] Bir ekran okuyucuyla ve gerçek bir telefonla elle deneme yapıldı; en az üç farklı kişiye (biri 65 yaş üstü) denetildi.

## 22. Bilinen sınırlar (README'de aynen yer alır)

1. Uygulama plan yapmayı kolaylaştırır; çantayı hazırlamak, eşyaları sabitlemek ve tatbikat yapmak kullanıcıya kalır.
2. Rehber yalnızca depremi kapsar; diğer afetler için resmî kaynaklara bakılmalıdır.
3. Toplanma alanı bilgisi uygulamada yoktur; kullanıcı resmî sorgudan öğrenip kendisi yazar ve zaman zaman yeniden kontrol etmelidir.
4. Veri yalnızca tek cihazdadır; cihaz kaybolur ya da tarayıcı verisi silinirse plan da gider. Yedek dosyası ve basılı kopya bu yüzden önemlidir.
5. Paylaşılan özet o andaki halin kopyasıdır; sonradan yapılan değişiklikler karşı tarafa kendiliğinden gitmez.
6. Uygulama kilidinin parolası unutulursa veri kurtarılamaz.
7. İçerik resmî tavsiyelerin özetidir; resmî kaynaklar değiştiğinde güncellenene kadar eski kalabilir.
8. Bağımsız ve gönüllü bir projedir; sürekliliği garanti edilmez. Açık kaynak olduğu için başkaları sürdürebilir.

## 23. Yol haritası (bu sürümde yapılmaz)

- Sel, yangın, heyelan, çığ, fırtına rehber modülleri (aynı kayıt ve onay sistemiyle).
- Başka diller (Türkiye'de yaşayan ve Türkçe okumayan haneler için); çeviriler de onay kapısından geçer.
- Kolay okunur sürüm ve işaret dili videolarına bağlantı (yalnızca resmî kaynaklardan).
- Okul ve apartman için ayrı, sade plan şablonları.
- Bir kurumla resmî iş birliği ya da içerik incelemesi için başvuru.

## 24. Mevzuat ve kaynak listesi

Erişim tarihi: 2026-11-19. Güncel metin için Mevzuat Bilgi Sistemi (`mevzuat.gov.tr`) ve Resmî Gazete esas alınır.

- 6698 sayılı Kişisel Verilerin Korunması Kanunu (m.3, 6, 9, 10, 12, 16, 28); 7499 sayılı Kanunla yapılan değişiklikler. Kişisel Verileri Koruma Kurumu, "Kişisel Verilerin Korunması Kanunu ve Uygulaması" rehberi; "Çerez Uygulamaları Hakkında Rehber".
- 5651 sayılı İnternet Ortamında Yapılan Yayınların Düzenlenmesi ve Bu Yayınlar Yoluyla İşlenen Suçlarla Mücadele Edilmesi Hakkında Kanun (m.2, 3, 4); İnternet Ortamında Yapılan Yayınların Düzenlenmesine Dair Usul ve Esaslar Hakkında Yönetmelik (m.5, 6).
- 2860 sayılı Yardım Toplama Kanunu; Yardım Toplama Esas ve Usulleri Hakkında Yönetmelik.
- 6098 sayılı Türk Borçlar Kanunu (m.49 vd., m.115).
- 5237 sayılı Türk Ceza Kanunu (m.217/A, m.243, m.244).
- 5846 sayılı Fikir ve Sanat Eserleri Kanunu (m.31); 6769 sayılı Sınai Mülkiyet Kanunu.
- 5378 sayılı Engelliler Hakkında Kanun (m.7); 2025/10 sayılı Cumhurbaşkanlığı Genelgesi (RG 21.06.2025, 32933).
- 5902 sayılı Afet ve Acil Durum Yönetimi Başkanlığı ile İlgili Bazı Düzenlemeler Hakkında Kanun; 7269 sayılı Umumi Hayata Müessir Afetler Dolayısiyle Alınacak Tedbirlerle Yapılacak Yardımlara Dair Kanun; Afet ve Acil Durum Müdahale Hizmetleri Yönetmeliği (RG 31760).
- 6305 sayılı Afet Sigortaları Kanunu. İlkyardım Yönetmeliği. 6502 ve 6563 sayılı Kanunlar.
- Rehber içeriğinin kaynakları: Bölüm 13.3'teki kaynak anahtarları tablosu.

---

## Ek A — Referans kod (JavaScript, normatif)

Paylaşım kodlaması, şifreleme ve takvim dosyası üretimi. Ek B'deki değerler bu kodla üretilmiştir. TypeScript'e taşırken davranışı birebir koru; `src/storage/crypto.ts`, `src/share/codec.ts`, `src/output/ics.ts` dosyalarına böl.

```js
// İlk 72 — referans parçalar (paylaşım kodlaması, şifreleme, takvim dosyası). Node >= 22 ve tarayıcıda aynı çalışır.
const te = new TextEncoder(), td = new TextDecoder();

export function b64urlEncode(bytes) {
  let s = ''; for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function b64urlDecode(str) {
  if (!/^[A-Za-z0-9_-]*$/.test(str)) throw new Error('gecersiz-karakter');
  const s = atob(str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4));
  const out = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}
async function pipe(bytes, stream, limit = Infinity) {
  const w = stream.writable.getWriter();
  const wrote = w.write(bytes).then(() => w.close());
  wrote.catch(() => {}); // hata okuma tarafında da yüzeye çıkar
  const r = stream.readable.getReader(); const chunks = []; let n = 0;
  for (;;) { const { done, value } = await r.read(); if (done) break; n += value.length; if (n > limit) throw new Error('cok-buyuk'); chunks.push(value); }
  await wrote;
  const out = new Uint8Array(n); let o = 0; for (const c of chunks) { out.set(c, o); o += c.length; } return out;
}
export const deflate = (bytes) => pipe(bytes, new CompressionStream('deflate-raw'));
export const inflate = (bytes, limit) => pipe(bytes, new DecompressionStream('deflate-raw'), limit);

// ---- Şifreleme: PBKDF2-HMAC-SHA256 (600.000 tur) -> AES-256-GCM ----
export const KDF_ITER = 600000;
async function deriveKey(passphrase, salt, iter = KDF_ITER) {
  const base = await crypto.subtle.importKey('raw', te.encode(passphrase.normalize('NFKC')), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: iter }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
// çıktı: salt(16) || iv(12) || şifreli metin + etiket(16)
export async function encryptBytes(plain, passphrase, { salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12)) } = {}) {
  const key = await deriveKey(passphrase, salt);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain));
  const out = new Uint8Array(28 + ct.length); out.set(salt, 0); out.set(iv, 16); out.set(ct, 28); return out;
}
export async function decryptBytes(blob, passphrase) {
  if (blob.length < 28 + 16) throw new Error('bozuk-veri');
  const key = await deriveKey(passphrase, blob.slice(0, 16));
  try { return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: blob.slice(16, 28) }, key, blob.slice(28))); }
  catch { throw new Error('parola-yanlis-veya-bozuk'); }
}

// ---- Paylaşım yükü: "<sürüm><kip>.<base64url>"  kip: p = düz, e = parolalı ----
export const SHARE_MAX_URL = 1200, SHARE_MAX_JSON = 16384;
export async function encodeShare(card, passphrase) {
  let bytes = await deflate(te.encode(JSON.stringify(card)));
  if (passphrase) bytes = await encryptBytes(bytes, passphrase);
  return `1${passphrase ? 'e' : 'p'}.${b64urlEncode(bytes)}`;
}
export async function decodeShare(payload, passphrase) {
  const m = /^1([pe])\.([A-Za-z0-9_-]{1,8000})$/.exec(payload);
  if (!m) throw new Error('gecersiz-baglanti');
  let bytes = b64urlDecode(m[2]);
  if (m[1] === 'e') { if (!passphrase) throw new Error('parola-gerekli'); bytes = await decryptBytes(bytes, passphrase); }
  let json; try { json = td.decode(await inflate(bytes, SHARE_MAX_JSON)); } catch (e) { throw new Error(e.message === 'cok-buyuk' ? 'cok-buyuk' : 'bozuk-veri'); }
  let obj; try { obj = JSON.parse(json); } catch { throw new Error('bozuk-veri'); }
  return obj; // çağıran taraf şema doğrulamasından geçirmek ZORUNDA
}

// ---- Takvim dosyası (.ics, RFC 5545) ----
const icsEsc = (s) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
function fold(line) { // 75 oktet sınırı, UTF-8 karakterleri bölmeden
  const out = []; let cur = '', n = 0;
  for (const ch of line) { const l = te.encode(ch).length; if (n + l > (out.length ? 74 : 75)) { out.push(cur); cur = ''; n = 0; } cur += ch; n += l; }
  out.push(cur); return out.join('\r\n ');
}
// date: 'YYYY-MM-DD' (ilk hatırlatma günü), stamp: 'YYYYMMDDTHHMMSSZ'
export function buildIcs({ uid, date, stamp, summary, description, url }) {
  const d = date.replace(/-/g, ''); const next = new Date(Date.UTC(+date.slice(0, 4), +date.slice(5, 7) - 1, +date.slice(8, 10) + 1));
  const dEnd = next.toISOString().slice(0, 10).replace(/-/g, '');
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ilk72//TR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
    `UID:${uid}`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${dEnd}`, 'RRULE:FREQ=MONTHLY;INTERVAL=6',
    `SUMMARY:${icsEsc(summary)}`, `DESCRIPTION:${icsEsc(description)}`, ...(url ? [`URL:${url}`] : []), 'TRANSP:TRANSPARENT',
    'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${icsEsc(summary)}`, 'TRIGGER:PT9H', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR']
    .map(fold).join('\r\n') + '\r\n';
}
```

## Ek B — Test vektörleri (normatif)

### B.1 Şifreleme — bilinen yanıt

| Girdi | Değer |
|---|---|
| Düz metin (UTF-8) | `İlk 72 — deneme` |
| Parola | `Parola-Örnek 1` |
| Tuz (16 bayt) | `00 01 02 … 0f` |
| Başlangıç vektörü (12 bayt) | `a0 a1 a2 … ab` |
| Beklenen çıktı (onaltılık; tuz + vektör + şifreli metin + etiket) | `000102030405060708090a0b0c0d0e0fa0a1a2a3a4a5a6a7a8a9aaaba8799d189e98ec59dd845de693eab0328b15e3035a10ece85b4b696863d5e88effe6` |

`decryptBytes(çıktı, 'Parola-Örnek 1')` düz metni geri verir; başka parola `parola-yanlis-veya-bozuk` hatası verir.

### B.2 Takvim dosyası — beklenen çıktı

Girdi: `uid: '3f0c2d5e-0000-4000-8000-000000000001@ilk72'`, `date: '2027-05-19'`, `stamp: '20261119T080000Z'`, `summary: 'Aile afet planını gözden geçir'`, `description: 'Çantadaki su, gıda ve ilaçların tarihlerini kontrol edin; telefon numaralarını güncelleyin; buluşma yerlerini ailece tekrar edin.\nPlanınız: cihazınızdaki İlk 72 uygulaması.'` (`\n` gerçek satır sonudur), `url: 'https://kullanici.github.io/ilk72/'`.

Beklenen çıktı (her satır `CRLF` ile biter; aşağıda satır sonları gösterilmemiştir; devam satırları tek boşlukla başlar):

```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ilk72//TR
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:3f0c2d5e-0000-4000-8000-000000000001@ilk72
DTSTAMP:20261119T080000Z
DTSTART;VALUE=DATE:20270519
DTEND;VALUE=DATE:20270520
RRULE:FREQ=MONTHLY;INTERVAL=6
SUMMARY:Aile afet planını gözden geçir
DESCRIPTION:Çantadaki su\, gıda ve ilaçların tarihlerini kontrol edin\;
  telefon numaralarını güncelleyin\; buluşma yerlerini ailece tekrar ed
 in.\nPlanınız: cihazınızdaki İlk 72 uygulaması.
URL:https://kullanici.github.io/ilk72/
TRANSP:TRANSPARENT
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:Aile afet planını gözden geçir
TRIGGER:PT9H
END:VALARM
END:VEVENT
END:VCALENDAR
```

Uygulamada `summary` ve `description` bu örnekteki metinlerdir; `url` uygulamanın kök adresidir.

### B.3 Paylaşım durumları

Örnek özet kart (`test/vectors/share-card.json` olarak kaydet):

```json
{
  "v": 1,
  "h": "Yılmaz ailesi",
  "u": "2026-11-19",
  "k": [
    {
      "a": "Ayşe Yılmaz",
      "t": "05550000001"
    },
    {
      "a": "Mehmet Yılmaz",
      "t": "05550000002"
    },
    {
      "a": "Elif Yılmaz",
      "t": ""
    },
    {
      "a": "Hatice Yılmaz",
      "t": "05550000003"
    }
  ],
  "i": [
    {
      "a": "Fatma Demir (teyze)",
      "t": "05550000004",
      "d": true,
      "s": "İzmir"
    },
    {
      "a": "Ali Kaya (komşu)",
      "t": "05550000005",
      "d": false,
      "s": ""
    }
  ],
  "b": {
    "e": "Apartmanın karşısındaki park, çınar ağacının altı",
    "m": "Mahalle pazaryeri girişi",
    "d": "İzmir, Fatma teyzenin evi",
    "t": "Cumhuriyet İlkokulu bahçesi"
  },
  "n": "Elif okuldaysa öğretmeninden teslim alınacak. Hatice Hanım yürüteç kullanıyor."
}
```

| Durum | Beklenen |
|---|---|
| `decodeShare(await encodeShare(kart))` | karta derin eşit |
| `decodeShare(await encodeShare(kart, p), p)` | karta derin eşit |
| Parolalı yük, yanlış parola | `Error('parola-yanlis-veya-bozuk')` |
| Parolalı yük, parolasız çağrı | `Error('parola-gerekli')` |
| `decodeShare('1p.AAAA')` | `Error('bozuk-veri')` |
| `decodeShare('2p.AAAA')` | `Error('gecersiz-baglanti')` |
| `decodeShare('1p.AA+A')` | `Error('gecersiz-baglanti')` |
| 5.000.000 sıfır baytın `deflate` çıktısı düz yük olarak | `Error('cok-buyuk')` |
| Örnek kartın JSON boyutu | 602 bayt |
| Örnek kartla `https://kullanici.github.io/ilk72/#/al/` + düz yük | yaklaşık 512 karakter (sıkıştırma uygulamasına göre birkaç bayt değişebilir; test `≤ 1200` olarak denetler) |
| Aynı, parolalı | yaklaşık 570 karakter |

Hata kodlarının kullanıcıya görünen karşılıkları (`tr.ts`): `gecersiz-baglanti` → "Bu bağlantı geçerli bir plan özeti değil."; `bozuk-veri` → "Bağlantı eksik ya da bozulmuş. Gönderenden yeniden isteyin."; `cok-buyuk` → "Bu bağlantı açılamayacak kadar büyük."; `parola-gerekli` → "Bu özet parolayla korunuyor."; `parola-yanlis-veya-bozuk` → "Parola yanlış ya da bağlantı bozulmuş."

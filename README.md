# İlk 72 — Aile Afet Planı

Ailelerin afet ve acil durum planını hazırlayıp yazdırabildiği, çevrimdışı çalışan açık kaynak
bir web uygulaması. Hesap gerektirmez ve planı kendiliğinden başka bir yere göndermez.

**0.1.0 geliştirme sürümü.** [Geliştirme sürümünün kaynak kodu](https://github.com/avazargozalli/ilk72/releases/tag/gelistirme-0.1.0) katkıya açıktır. Aile planlayıcısını yerelde deneyebilir,
boş formu yazdırabilir ve içerik düzeltmesi önerebilirsiniz. Rehberdeki 83 madde afet uzmanının
incelemesini, hukuki metinler avukat görüşünü bekliyor. Taslaklar varken üretim derlemesi durur.

## Ekran görüntüsü

![İlk 72 ana ekranında plan hazırlamaya başlama ve boş formu yazdırma seçenekleri](docs/ekran-goruntusu.png)

## Uygulama yayını

Barındırma için GitHub Pages seçildi. İncelemeler tamamlandığında uygulama
`https://avazargozalli.github.io/ilk72/` adresinde yayımlanacak.
[İçerik inceleme süreci](docs/icerik-onay.md) · [Hukuki inceleme kaydı](docs/hukuki-inceleme.md)

## Ne olduğu

İlk 72, bir ailenin afet ve acil durum planını kısa bir soru dizisiyle hazırlayan ve yazdırılabilir
çıktılara dönüştüren bir web uygulamasıdır. Plan, afetten sonraki **ilk 72 saat** için düşünülür.
Uygulama şunları üretir:

- Aile afet planı (A4, yazdırılabilir): kişiler, acil kişiler, buluşma yerleri, toplanma alanı,
  evin güvenli yerleri, vana ve şalter yerleri, görev dağılımı, özel ihtiyaçlar.
- Kişi başı cüzdan kartları, çocuk kartı ve buzdolabı sayfası.
- Hane yapısına göre uyarlanmış afet ve acil durum çantası kontrol listesi.
- Altı aylık gözden geçirme hatırlatması için takvim dosyası.
- Deprem öncesi, anı ve sonrası için resmî kaynaklara dayalı kısa rehber kartları; her kartta
  kaynak bağlantısı ve erişim tarihi.
- Aile üyelerine bağlantı ya da kare kodla aktarılabilen özet kart; tam plan için yedek dosyası.

Uygulama resmî bir kurum uygulaması değildir; resmî tavsiyeyi uygulanabilir bir forma dönüştüren
bağımsız bir araçtır.

## İlkeler (kısa hâli)

Şartnamenin 12 değiştirilemez ilkesi. Ayrıntı ve test karşılıkları: `docs/mimari.md`.

| # | İlke |
|---|---|
| İ1 | **Veri cihazda kalır.** Sunucu, hesap, senkronizasyon, analitik, hata raporlama servisi, çerez yok. Proje sahibi uygulamaya yazılan plan verisini görmez. |
| İ2 | **Sıfır dış istek.** Uygulama kendi kökeni dışına ağ isteği yapmaz; dış siteler yalnızca tıklanan bağlantıyla yeni sekmede açılır. |
| İ3 | **Kâğıt önceliklidir.** Afet anında telefon ve şebeke çalışmayabilir; her akış yazdırmaya ya da PDF kaydetmeye götürür. |
| İ4 | **Kaynaksız tavsiye yok.** Her afet tavsiyesi resmî bir kaynağa bağlıdır, kendi cümlelerimizle yazılır, kaynağı ve erişim tarihi gösterilir. |
| İ5 | **Resmî görünme yok.** Kurum adı, logosu, amblemi, kurumsal rengi kullanılmaz; her sayfanın altında bağımsız proje olduğu yazar. |
| İ6 | **Acil servis değildir.** Yardım çağrısı iletmez, uyarı göndermez, haber sunmaz; tek yönlendirme 112'dir. |
| İ7 | **Tıbbi ve teknik talimat yok.** İlk yardım uygulaması, ilaç, bina dayanıklılığı ya da tesisat onarımı anlatılmaz; yetkili kaynağa yönlendirilir. |
| İ8 | **Veri azaltma.** T.C. kimlik no, kimlik/pasaport no, banka, poliçe, parola alanı yoktur; sağlık bilgisi isteğe bağlı ve varsayılan kapalıdır. |
| İ9 | **Sahte güven yok.** "Güvendesiniz", "hazırsınız" gibi ifadeler ve güvenlik puanı yoktur; yalnızca planın hangi bölümlerinin dolu olduğu gösterilir. |
| İ10 | **Herkes için.** WCAG 2.2 AA hedeflenir; büyük punto, sade dil, klavye ve ekran okuyucu desteği vardır; düşük donanımlı telefonlarda çalışır. |
| İ11 | **Para ve tanıtım yok.** Bağış düğmesi, IBAN, reklam, ortaklık bağlantısı, marka adıyla ürün önerisi yoktur. |
| İ12 | **Kullanıcı içeriği yayımlanmaz.** Yorum, forum, harita üzerinde paylaşım, kullanıcıdan kullanıcıya herkese açık içerik yoktur. |

## Ne değildir

- **Resmî bir kurum uygulaması değildir.** Hiçbir kurumla bağlantısı yoktur; kurum adı yalnızca
  kaynak gösterirken düz metin olarak geçer.
- **Acil yardım hizmeti değildir.** Yardım çağırmaz, uyarı göndermez, anlık bilgi sunmaz. Acil
  durumda **112**'yi arayın.
- **Tıbbi, hukuki, mühendislik ya da sigorta danışmanlığı değildir.** İlk yardım yöntemi, ilaç,
  bina risk değerlendirmesi veya poliçe tavsiyesi vermez; ilgili yetkili kaynağa yönlendirir.
- **Bir hesap ya da bulut hizmeti değildir.** Üyelik, giriş, senkronizasyon, cihazlar arası aktarım
  yoktur.
- **Bir veri toplama aracı değildir.** Sunucu, veritabanı, günlük erişimi, telemetri ya da çerez
  yoktur.
- **Toplanma alanı verisi sunmaz.** Resmî sorgudan öğrenilen bilgi kullanıcı tarafından elle
  yazılır; harita veya otomatik veri çekme yoktur.
- **Ticari değildir.** Satış, reklam, sponsorluk, bağış ya da IBAN yoktur.

## Nasıl kullanılır

1. Uygulamayı tarayıcıda açın. İlk açılışta kısa bir bilgilendirme kutusu çıkar; kabul edince
   sihirbaz başlar.
2. Dokuz adımı izleyin: haneniz, kişiler, özel ihtiyaçlar, acil kişiler, buluşma yerleri, eviniz,
   görevler, çanta ve belgeler, gözden geçirme.
3. Özet sayfasında planın hangi bölümlerinin dolu olduğunu görün. Eksik bölümler için sihirbaza
   dönebilirsiniz.
4. **Yazdır** sayfasından aile planını, cüzdan ve çocuk kartlarını, buzdolabı sayfasını, çanta
   listesini ya da boş formu yazdırın veya PDF olarak kaydedin. Kâğıt kopyayı çantanıza ve
   buzdolabınıza koyun (İ3).
5. Uygulamayı ana ekrana ekleyin; ilk ziyaretten sonra internet olmadan da çalışır. Ayarlar
   sayfasında "Ana ekrana nasıl eklenir?" açıklaması vardır.
6. Planı aile üyeleriyle paylaşmak için özet kartı bağlantı ya da kare kod olarak gönderin. Özet,
   paylaşıldığı andaki hâlin kopyasıdır. Tam plan için yedek dosyasını indirin.
7. Planı altı ayda bir gözden geçirin; takvim dosyasını indirerek hatırlatma ekleyin.
8. Ayarlar’daki “Bütün verilerimi sil” düğmesi bu tarayıcı profilindeki planı ve ayarları temizler.

## Gizlilik özeti

- Plan ve ayarlar tarayıcının yerel deposunda saklanır. Uygulama kilidini etkinleştirirseniz
  kayıtlı plan şifrelenir. Uygulama çerez veya analitik kullanmaz.
- GitHub Pages, çevrimiçi ziyaretçilerin IP adresini güvenlik amacıyla kaydettiğini bildirir.
  [GitHub Pages veri toplama bilgileri](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages#data-collection)
- Özet bağlantısındaki plan parçası normal sayfa isteğinde sunucuya iletilmez. Parolasız
  bağlantı ile kare kodu alan herkes özeti açabilir. Yedek, baskı, PDF ve takvim kopyaları
  kullandığınız cihazlarda ve seçtiğiniz hizmetlerde kalabilir.
- Proje e-postasına veya GitHub bildirimlerine kendiniz gönderdiğiniz bilgiler proje
  sorumlusu Azar Gozalli tarafından sorun inceleme, yanıt ve proje güvenliği için işlenir.
  Gerekli ve ölçülü işlemler KVKK m.5/2-f kapsamındaki meşru menfaate dayanır. E-posta Gmail
  üzerinden, depo bildirimleri GitHub üzerinden alınır. Sağlayıcılar verileri yurt dışında
  işleyebilir. Herkese açık bildirim, PR ve eklerde örnek veriler kullanın.
  [Google gizlilik politikası](https://policies.google.com/privacy?hl=tr) ·
  [GitHub gizlilik bildirimi](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement)
- KVKK haklarınızı kullanmak için usule uygun başvuru kanalını proje e-postasından öğrenebilirsiniz.
  Kişisel başvurunuzu açık depoda yayımlamayın.
  [Proje e-postası](mailto:gozelliazer@gmail.com) ·
  [KVKK başvuru rehberi](https://www.kvkk.gov.tr/Icerik/2062/Basvuru-Hakki)
- Ayrıntılar [Gizlilik Bildirimi metninde](src/i18n/legal.ts) ve [hukuki inceleme kaydında](docs/hukuki-inceleme.md) yer alır.

## İçerik ve kaynak politikası

- **Kaynaksız tavsiye yok (İ4).** Kullanıcıya gösterilen her afet tavsiyesi, resmî bir kaynağa bağlı
  bir içerik maddesidir; her maddede kaynağın adı, adresi ve erişim tarihi gösterilir.
- **Kendi cümlelerimizle.** Kurum metinleri, görselleri, afişleri ve amblemleri kopyalanmaz;
  metinler kendi cümlelerimizle özetlenir. Kaynak yalnızca düz metin olarak anılır.
- **İzinli alan adları.** İçerik kaydındaki kaynak bağlantıları şu resmî alan adlarına ve alt alan adlarına
  verilir: `afad.gov.tr`, `turkiye.gov.tr`, `112.gov.tr`, `icisleri.gov.tr`, `saglik.gov.tr`,
  `aile.gov.tr`, `dask.gov.tr`, `kizilay.org.tr`, `mevzuat.gov.tr`, `resmigazete.gov.tr`,
  `kvkk.gov.tr`, `mebakub.meb.gov.tr`, `hazirim.gov.tr`.
- **Onay kapısı.** Her madde, kaynağıyla karşılaştırılıp `onayli` yapılana kadar `taslak` dur.
  `content:check` kaynak zorunluluğunu, adres kurallarını, metin uzunluğunu ve inceleme
  alanlarını denetler; `build:prod` taslak madde kaldıysa başarısız olur.
- **Düzeltme yolu.** Rehber kartlarındaki "Hata bildir" bağlantısı ya da Künye sayfasındaki
  e-posta ile yanlış veya eskimiş içerik bildirilir. İçerik hataları için depodaki "Yanlış veya
  eskimiş içerik" sorun şablonu kullanılır; **resmî kaynak adresi zorunludur**.
- **Güncellik.** İncelemeler yılda bir ve büyük bir afetten sonra yinelenir; 12 ayı geçen inceleme
  uyarı, 18 ayı geçen inceleme üretim derlemesini durdurur. Ayrıntı: `docs/icerik-onay.md`.
- **Sınırlar.** Rehber yalnızca depremi kapsar; tıbbi ya da teknik talimat içermez; yetkililerin
  talimatlarının yerini tutmaz.

## Nasıl katkı verilir

- Kurulum, kalite kapısı ve içerik önerme kuralları: [CONTRIBUTING.md](CONTRIBUTING.md).
- Davranış kuralları: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
- Güvenlik açıkları herkese açık sorun olarak değil, özelden bildirilir: [SECURITY.md](SECURITY.md).
- Hata, içerik hatası, erişilebilirlik engeli ve öneri için depodaki sorun şablonlarını kullanın.
- İlkeleri delen öneriler (bağış, reklam, hesap, telemetri, dış istek, resmî amblem vb.)
  değerlendirilmez.

Yerel geliştirme kısa yolu:

```powershell
pnpm install --frozen-lockfile
pnpm exec playwright install chromium firefox webkit
pnpm run dev
pnpm run check
```

## Lisanslar

- **Kod:** MIT — [LICENSE](LICENSE).
- **Rehber metinleri ve belgeler:** CC BY 4.0 — [LICENSE-CONTENT](LICENSE-CONTENT).
- **Üçüncü taraf bağımlılıklar:** [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).
- Proje bağış kabul etmez ve `FUNDING.yml` dosyası bilinçli olarak yoktur (İ11).

## Bilinen sınırlar

1. Uygulama plan yapmayı kolaylaştırır; çantayı hazırlamak, eşyaları sabitlemek ve tatbikat yapmak kullanıcıya kalır.
2. Rehber yalnızca depremi kapsar; diğer afetler için resmî kaynaklara bakılmalıdır.
3. Toplanma alanı bilgisi uygulamada yoktur; kullanıcı resmî sorgudan öğrenip kendisi yazar ve zaman zaman yeniden kontrol etmelidir.
4. Veri yalnızca tek cihazdadır; cihaz kaybolur ya da tarayıcı verisi silinirse plan da gider. Yedek dosyası ve basılı kopya bu yüzden önemlidir.
5. Paylaşılan özet o andaki halin kopyasıdır; sonradan yapılan değişiklikler karşı tarafa kendiliğinden gitmez.
6. Uygulama kilidinin parolası unutulursa veri kurtarılamaz.
7. İçerik resmî tavsiyelerin özetidir; resmî kaynaklar değiştiğinde güncellenene kadar eski kalabilir.
8. Bağımsız ve gönüllü bir projedir; sürekliliği garanti edilmez. Açık kaynak olduğu için başkaları sürdürebilir.

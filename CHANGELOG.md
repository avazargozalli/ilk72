# Değişiklik Günlüğü — İlk 72

Bu dosya proje sürümlerindeki kullanıcıya görünen değişiklikleri listeler. Biçim
[Keep a Changelog](https://keepachangelog.com/tr/1.1.0/) yaklaşımını izler; sürüm numarası
`package.json` içindeki `version` alanıyla aynıdır. Geliştirme sürümleri GitHub Releases üzerinde ön sürüm olarak işaretlenir.

## [Yayımlanmamış]

- Gizlilik Bildirimi, Kullanım Koşulları, Künye ve Erişilebilirlik Beyanı güncellendi.
  Türk mevzuatına ve sağlayıcı açıklamalarına dayalı yayın incelemesi kayda alındı.
- Plan, kilit ve yedekten geri yükleme işlemlerinde yerel kayıt tutarlılığı güçlendirildi.
  Bir sürüm güncellemesi, açık sekmedeki plan değişiklikleri kaydedilene kadar bekler.
- Cüzdan kartına isteğe bağlı kare kod eklendi. Paylaşım ve içe alma özetinde, sınırı aşan ve
  çakışan kayıtlar için kullanıcıya bilgi veriliyor.
- İçerik sürümü 4. 83 madde için resmî kaynak karşılaştırması kaydedildi, 15 maddenin metni
  ya da kaynak eşleştirmesi düzeltildi. Maddeler uzman onayını bekliyor.
- Üretim derlemesi hukuki onayı incelenen Git commit’iyle eşleştiriyor.
- Çanta baskısı güncel hane bileşimini kullanıyor. Takvim hatırlatması ayın son günlerini
  ve kısa ayları kapsıyor.
- Acil ekranı 320 px genişlikte büyük yazıyla taşmadan açılıyor. Çocuk kartları uzun
  teslim alma listelerini numaralı devam kartlarına yayıyor.
- Eski kilit ayarının ilk kaydı engellemesi ve yinelenen çanta kayıtlarının ilerlemeyi
  şişirmesi düzeltildi. Özet bağlantısı şehir dışı seçimi kaldırılan kişinin şehrini içermiyor.
- Lisans bildirimleri derleme paketine eklendi. CI, Chromium, Firefox, WebKit ve mobil profili
  çalıştırıyor.

## [0.1.0] — 2026-11-19

İlk geliştirme sürümü; içerik taslak.

### İçerik sürümü 2

- Kaynak adresi eksik olan 20 madde resmî yayınlarla eşleştirildi. Planı gözden geçirme sıklığı ile tatbikat sıklığı ayrıldı.

### Eklendi

- Çevrimdışı çalışan, hesap gerektirmeyen Preact + TypeScript + Vite tabanlı PWA iskeleti.
- Dokuz adımlı plan sihirbazı için veri modeli, doğrulama/temizleme, doluluk ve çanta listesi
  üretimi.
- IndexedDB saklama, otomatik kayıt, isteğe bağlı uygulama kilidi, şifreli yedek ve yedek dosyası
  dışa/içe aktarma.
- Paylaşım özet kartı, bağlantı/kare kod kodlaması ve takvim (`.ics`) üretimi; Ek B vektörleri.
- Resmî kaynaklara bağlı içerik kayıt sistemi ve onay kapısı (`content:check`, `build:prod`).
- Ortak arayüz bileşenleri, erişilebilir kabuk, alt bilgi, yazdırma çıktıları ve Türkçe i18n
  altyapısı.
- Gizlilik Bildirimi, Kullanım Koşulları ve Sorumluluk Reddi, Künye ve Erişilebilirlik Beyanı
  sayfaları için §14 metinleri.
- CI (`ci.yml`) ve Pages (`pages.yml`) iş akışları; sorun ve PR şablonları.
- MIT (kod) ve CC BY 4.0 (içerik) lisansları, üçüncü taraf lisans listesi, güvenlik ve davranış
  belgeleri.

### Notlar

- Rehber içeriğinin tamamı **taslaktır**; `pnpm run build:prod` bu yüzden başarısız olur. Bu,
  onaysız içeriğin yayımlanmasını engelleyen kasıtlı kapıdır (§13.4).
- Hukuki metinler avukat incelemesi bekler; `docs/hukuki-inceleme.md` içindeki **Onay tarihi**
  satırı boştur ve Pages yayını bu satır dolmadan yapılmaz.
- Ana ekranın gerçek görüntüsü README’ye eklendi. Uygulamanın üretim yayını inceleme bekliyor.
- İçerik incelemesi tamamlanana kadar uygulama geliştirme sürümü olarak kalır.

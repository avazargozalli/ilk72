# Değişiklik Günlüğü — İlk 72

Bu dosya proje sürümlerindeki kullanıcıya görünen değişiklikleri listeler. Biçim
[Keep a Changelog](https://keepachangelog.com/tr/1.1.0/) yaklaşımını izler; sürüm numarası
`package.json` içindeki `version` alanıyla aynıdır. Proje henüz yayımlanmamıştır.

## [0.1.0] — 2026-11-19

İlk geliştirme sürümü; içerik taslak.

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
- Uygulama henüz yayımlanmamıştır; canlı adres ve ekran görüntüsü yayın öncesi eklenecektir.
- İçerik incelemesi tamamlanana kadar uygulama geliştirme sürümü olarak kalır.

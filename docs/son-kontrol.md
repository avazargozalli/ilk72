# Son Kontrol — İlk 72

25.11.2026 · Uygulama sürümü 0.1.0 · Şema sürümü 1 · İçerik sürümü 4

## Depo ve derleme

| Denetim | Kanıt |
|---|---|
| Biome, TypeScript, birim ve bileşen testleri | `pnpm run check` başarılı. 49 dosyada 866 test geçti. Ölçülen kodda satır kapsamı %99,62 ve dal kapsamı %96,79. |
| Tarayıcı uyumluluğu | Chromium, Firefox, WebKit ve 360 × 640 mobil profilde 112 Playwright testi geçti. |
| Erişilebilirlik | 11 sayfa ve 9 adımda axe taraması. Gizlilik ve dolu acil durum sayfaları, büyük yazıyla 320 px genişlikte ayrıca denetlendi. Acil arama bağlantısına klavyeyle erişildi. |
| Baskı görünümü | Dört tarayıcı profilinde A4 alanı, uzun alanlar ve 10 teslim alma kişisi ile 85,6 × 54 mm kartlar ölçüldü. Telefon numaraları tam basıldı, uzun serbest metin kartta üç noktayla gösterildi ve tam planda korundu. |
| Çevrimdışı ve ağ davranışı | Hizmet çalışanıyla çevrimdışı açılış, acil ekranı ve köken dışı istek denetimleri. Pages yerleşimini örnekleyen `/ilk72/` alt dizini, Chromium önizlemesinde çevrimdışı yenileme ve 112 bağlantısıyla doğrulandı. |
| Veri tutarlılığı | IndexedDB yazma, kilit ve yedekten geri yükleme, eski sekme denetimi, silme ve kayıt başarısızlığı testleri |
| Biçim uyumluluğu | Ek B.1 şifreleme, B.2 takvim ve B.3 paylaşım vektörleri |
| Kaynak kaydı | `pnpm run content:check` başarılı. 20 resmî kaynak, sıfır hata ve uyarı. 83 maddeye ait [rehber](icerik-kaynak-incelemesi-rehber.md) ve [liste](icerik-kaynak-incelemesi-listeler.md) karşılaştırmaları tamamlandı. |
| Üretim içerik kapısı | `pnpm run build:prod` beklenen çıkış kodu 1. Afet uzmanı onayı bekleyen 83 madde raporlanıyor. |
| Hukuki yayın kapısı | Geçerli tarih, onaylayan ve incelenen tam Git commit’i denetlenir. Yayın dosyaları değişirse eski kayıt kabul edilmez. Mevcut onay kaydı boş. |
| Dağıtım lisansları | Geliştirme derlemesinde `dist/LICENSE`, `dist/LICENSE-CONTENT` ve `dist/THIRD_PARTY_LICENSES.md` kök belgelerle bayt bayt eşleşiyor. |
| Üretim bağımlılıkları | `pnpm audit --prod --audit-level=high` bilinen güvenlik uyarısı bildirmedi. |
| Depo belgeleri | Yerel Markdown bağlantıları, GitHub YAML dosyaları ve `git diff --check` doğrulandı. |

## Yayın için açık kayıtlar

| İş | Yapılacak doğrulama |
|---|---|
| Afet içeriği | 83 madde için nitelikli içerik inceleyeninin kaynak karşılaştırması ve tarihli onay kaydı. [İçerik onayı](icerik-onay.md) |
| Hukuki onay | Yayın sürümü için avukat görüşü ve geçerli onay tarihi. [Hukuki inceleme](hukuki-inceleme.md) |
| KVKK süreci | Fiilî yayıncı ve başvuru kanalı, sağlayıcı rolleri, saklama/aktarım dayanağı, saklama ve imha kararları. [Yayın öncesi kararlar](hukuki-inceleme.md#4-yayın-öncesi-kayıt-altına-alınacak-kararlar) |
| Marka ve görseller | “İlk 72” için açık sicildeki ön sorgu tamamlandı. Benzer işaretler ve görsel kullanım hakları değerlendirilecek. [Marka incelemesi](hukuki-inceleme.md#s9--ad-ve-görsel-kimlik) |
| Barındırma | Pages, GitHub Actions ve zorunlu HTTPS ile yapılandırılmış. Dağıtım kaydı yok, proje adresi HTTP 404 dönüyor. Fiilî sağlayıcı koşulları ve `frame-ancestors` başlığı açık. [Barındırma kararı](kararlar.md) |
| Elle erişilebilirlik ve baskı | Ekran okuyucu, gerçek telefon, %200 tarayıcı yakınlaştırması, tam akış, üç kişiyle kullanım ve fiziksel baskı ölçümleri. [Elle doğrulama](mimari.md#7-elle-doğrulama-listeleri-187) |

İlk geliştirme sürümünün kayıtları depo geçmişindedir. Mevcut teknik sınırlar
[README](../README.md#bilinen-sınırlar) ve [mimari belgede](mimari.md) yer alır.

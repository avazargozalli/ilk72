# Son Kontrol — İlk 72

25.11.2026 · Uygulama sürümü 0.1.0 · Şema sürümü 1 · İçerik sürümü 3

## Depo ve derleme

| Denetim | Kanıt |
|---|---|
| Biome, TypeScript, birim ve bileşen testleri | `pnpm run check` başarılı. 48 dosyada 852 test geçti. Ölçülen kodda satır kapsamı %99,62 ve dal kapsamı %96,74. |
| Tarayıcı uyumluluğu | Chromium, Firefox, WebKit ve 360 × 640 mobil profilde 108 Playwright testi geçti. Firefox kayıt akışı ayrıca altı kez başarıyla tekrarlandı. |
| Erişilebilirlik | 11 sayfa ve 9 adımda axe taraması. Gizlilik bildirimi, büyük yazıyla 320 px genişlikte ayrıca denetlenir. |
| Çevrimdışı ve ağ davranışı | Hizmet çalışanıyla çevrimdışı açılış, acil ekranı ve köken dışı istek denetimleri |
| Veri tutarlılığı | IndexedDB yazma, kilit ve yedekten geri yükleme, eski sekme denetimi, silme ve kayıt başarısızlığı testleri |
| Biçim uyumluluğu | Ek B.1 şifreleme, B.2 takvim ve B.3 paylaşım vektörleri |
| Kaynak kaydı | `pnpm run content:check` başarılı. 20 resmî kaynak, sıfır hata ve uyarı. |
| Üretim içerik kapısı | `pnpm run build:prod` beklenen çıkış kodu 1. Afet uzmanı onayı bekleyen 83 madde raporlanıyor. |
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
| Barındırma | Canlı adres, fiilî sağlayıcı ayarları ve `frame-ancestors` HTTP başlığı. [Barındırma kararı](kararlar.md) |
| Elle erişilebilirlik ve baskı | Ekran okuyucu, gerçek telefon, %200 tarayıcı yakınlaştırması, tam akış, üç kişiyle kullanım ve fiziksel baskı ölçümleri. [Elle doğrulama](mimari.md#7-elle-doğrulama-listeleri-187) |

İlk geliştirme sürümünün kayıtları depo geçmişindedir. Mevcut teknik sınırlar
[README](../README.md#bilinen-sınırlar) ve [mimari belgede](mimari.md) yer alır.

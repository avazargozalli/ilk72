# Güvenlik Politikası — İlk 72

İlk 72, kullanıcı verisini yalnızca cihazda tutan ve hesap gerektirmeyen bir uygulamadır. Yine de
paylaşım bağlantıları, içe aktarma, hizmet çalışanı ve bağımlılıklar güvenlik açısından
incelenmelidir. Bir açık bulduğunuzu düşünüyorsanız lütfen **herkese açık sorun (issue) açmayın**.

## Desteklenen sürümler

| Sürüm | Durum | Güvenlik düzeltmesi |
|---|---|---|
| `0.1.x` (geliştirme) | Aktif geliştirme; yayımlanmadı | En son geliştirme sürümüne çaba gösterilir |
| `0.1.0` öncesi | Yok | — |

Yayımlanmış bir sürüm henüz yoktur. Bir sürüm yayımlandığında bu tablo güncellenir.

## Açık nasıl bildirilir

Tercih edilen yol **GitHub Güvenlik Bildirimleri**'dir (özel):

`https://github.com/{GITHUB_KULLANICI}/ilk72/security/advisories/new`

GitHub üzerinden bildiremiyorsanız `{ILETISIM_EPOSTA}` adresine yazın. Bu iki yer tutucu
(`{GITHUB_KULLANICI}`, `{ILETISIM_EPOSTA}`) yayın öncesi sahibi tarafından doldurulacaktır; o zamana
kadar bildirimi depo sahibine doğrudan ulaştırın.

Bildiriminizde şunlar olsun:

- Sorunun kısa adı ve etkilenen sürüm/ortam (tarayıcı, işletim sistemi).
- Sorunu yeniden üretme adımları ve beklenen/gözlenen davranış.
- Olası etki (ör. XSS, veri sızıntısı, dış istek, hizmet çalışanı önbelleği, veri kaybı).
- Varsa en küçük kanıt (ekran görüntüsü, istek günlüğü, örnek yük). **Gerçek kişisel plan
  verisi göndermeyin**; örnekleri uydurun.
- İsterseniz adınız ve anılma tercihiniz. Anonim bildirim de kabul edilir.

Bir güvenlik açığı için para ödülü (bounty) yoktur; proje gönüllü yürütülür.

## Kapsam

İncelenmeye değer başlıca alanlar:

- Plan verisinin, yedek dosyasının veya paylaşım bağlantısının işlenmesinde XSS ya da kod
  çalıştırma (ör. ad alanına `<img src=x onerror=...>` yazılması).
- `dangerouslySetInnerHTML`, `innerHTML`, `eval` veya benzeri tehlikeli API'lerin kullanımı.
- CSP'nin (`index.html` meta etiketi) atlatılması; üretimde `connect-src 'none'` dışına çıkan kod.
- Hizmet çalışanı önbelleğinin kötüye kullanımı ya da önbellek zehirlenmesi.
- Uygulamanın kendi kökeni dışına istek yapması (İ2); gizlilik ihlali.
- Şifreleme zarfı (PBKDF2-HMAC-SHA256 600.000 tur, AES-256-GCM), parola işleme veya yedek
  biçimindeki hatalar.
- Bağımlılık zincirinde bilinen, yüksek/kritik bir açık (`pnpm audit --omit=dev`).
- Kilitli olmayan ya da doğrulanmamış dış bağlantı üretimi (`tel:` ve `https:` dışı).

Kapsam dışı:

- Cihazın veya tarayıcının ele geçirilmesi, fiziksel erişim, kötü amaçlı tarayıcı eklentisi.
- Kullanıcının kendi cihazında plan verisini başkalarıyla paylaşması (paylaşım kullanıcı eylemidir).
- GitHub Pages'in vermediği HTTP başlıkları (ör. `frame-ancestors`). Bu, `docs/kararlar.md`
  içindeki K-4'te bilinçli sapma olarak kayıtlıdır; **yeni bir açık değildir**.
- Sosyal mühendislik, istenmeyen e-posta, hizmet engelleme (DoS) denemeleri.
- İçerikteki tıbbi/afet tavsiyesinin doğruluğu; bu konular `docs/icerik-onay.md` sürecine ve
  "yanlış veya eskimiş içerik" sorun şablonuna aittir.

## Süreç

- Bildirimi aldıktan sonra en geç **7 gün** içinde ilk yanıt hedeflenir; bu bir gönüllü proje
  olduğu için süre garantisi verilmez.
- Sorun doğrulanırsa düzeltme planı ve hedef tarih bildirilir; düzeltme yayımlanana kadar ayrıntılar
  özel tutulur.
- Düzeltme yayımlandıktan sonra, istenirse bildirimi yapan kişiye teşekkür edilir (koordineli
  açıklama).
- Açık, kullanıcı verisini ya da üçüncü kişileri riske atıyorsa önce geçici önlem (özelliği
  kapatma) uygulanabilir.

## Güvenlik ilkeleri

- Sunucu, hesap, telemetri ve çerez yoktur; proje sahibi kullanıcı planlarını göremez (İ1).
- Uygulama kendi kökeni dışına istek yapmaz (İ2); dış bağlantılar yalnızca kullanıcı tıklamasıyla
  yeni sekmede açılır ve `rel="noopener noreferrer"` taşır.
- Kullanıcı verisi DOM'a yalnızca Preact metin düğümleriyle girer; `dangerouslySetInnerHTML`
  yasaktır.
- İçe aktarma ve paylaşım girdileri güvenilmez kabul edilir: boyut sınırı, sıkıştırma bombası
  sınırı ve şema temizliği uygulanır.
- Bağımlılıklar kilitlidir (`pnpm-lock.yaml`) ve CI'da `pnpm audit --omit=dev --audit-level=high`
  ile denetlenir.
- Ayrıntılı tehdit modeli ve savunmalar: `docs/sartname.md` §17 ve `docs/mimari.md`.

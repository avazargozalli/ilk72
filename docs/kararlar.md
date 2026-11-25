# Tasarım Kararları — İlk 72

Şartname §0.4 uyarınca: şartnameyi delmeden çözülemeyen her durum buraya yazılır.
Biçim: kimlik, tarih, karar, gerekçe, şartname referansı, geri alma yolu.

## Dizin

| # | Karar | Kısa gerekçe |
|---|---|---|
| K-1 | npm yerine pnpm | bu makinede `npm` yok |
| K-2 | Araç zinciri mutlak yolla çağrılıyor | `node` PATH'te değil |
| K-3 | pnpm store çalışma alanı içinde | sandbox yalnız çalışma alanına yazar |
| K-4 | `frame-ancestors` meta ile verilemiyor | başlık gerektirir |
| K-5 | Geliştirmede `style-src 'unsafe-inline'` | Vite satır içi stil |
| K-6 | Git deposu yok | `git` kurulu değil |
| K-7 | `@vitest/coverage-v8` eklendi | kapsam eşiği ölçümü |
| K-8 | `content:check` stub'ı 21.5'te bağlandı | aşamalı kurulum |
| K-9 | Playwright tarayıcıları ertelendi | indirme engelli (bkz. K-16) |
| K-10 | Bağımlılık sürümleri | §0.6 güncel kararlı sürümler |
| K-11 | Düz (`hoisted`) node_modules | Windows + Node 24 sembolik bağ sorunu |
| K-12 | Geliştirmede `connect-src` gevşetmesi | HMR WebSocket |
| K-13 | Özel çanta maddesinin metni `note` alanında | §8.1'de ad alanı yok |
| K-14 | `frame-ancestors` yayın öncesi sahip görevi | barındırma başlığı |
| K-15 | `src/lib/**` kapsama eklendi | paylaşılan bayt katmanı |
| K-16 | Chromium, Firefox, WebKit ve mobil tarayıcı testleri | şartname §18.1 |
| K-17 | Takvim ve kare kod bağlantıları | ortak çıktı bileşenleri |
| K-18 | Cüzdan kartında isteğe bağlı kare kod | şartname §12.3 |
| K-19 | Plansız "Boş form" ayrı ekran | §12.6 plan gerektirmiyor |
| K-20 | Barrel dosyaları kapsam dışı | %0 sayılıp eşiği düşürüyordu |
| K-21 | Güncelleme + çevrimdışı notu kabukta | §16 |

---


### K-1 · npm yerine pnpm
**Tarih:** 2026-11-19 · **Referans:** §7, §19

Bu makinede `npm` kurulu değil; Node 24.21.0 ve pnpm 11.28.5 paketli geliyor.
Bütün `npm run X` komutları `pnpm run X` olarak koşar; `npm ci` yerine `pnpm install --frozen-lockfile` kullanılır.
**Geri alma:** npm kurulursa `package-lock.json` üretilip CI `npm ci`'ye çevrilir. Kilit dosyası depoda tutulur (`pnpm-lock.yaml`).

### K-2 · Araç zinciri mutlak yolla çağrılıyor
**Tarih:** 2026-11-19 · **Referans:** §6

`node` PATH'te yok. Geliştirme için tarif:
`$env:PATH = "C:\Users\avaza\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin;" + $env:PATH`,
sonra `& $node <pnpm.mjs> run <betik>`.
Bu yalnızca yerel doğrulama içindir; depo betikleri standart `node`/`npm` varsayar.

### K-3 · pnpm store workspace içinde
**Tarih:** 2026-11-19 · **Referans:** §6

Dosya sandbox'ı yalnızca çalışma alanına yazmaya izin veriyor. Kurulumlar
`--store-dir .pnpm-store` ile yapıldı; `.pnpm-store/` `.gitignore` içinde.

### K-4 · `frame-ancestors` meta ile verilemiyor
**Tarih:** 2026-11-19 · **Referans:** §17

`frame-ancestors` bir meta etiketiyle uygulanamaz (tarayıcı yok sayar). CSP meta'sı §17'deki
dizenin bu yönergesi **çıkarılmış** hâlidir; `frame-ancestors 'none'` barındırma başlığıyla
verilmelidir. GitHub Pages başlık vermediği için bu bir **yayın öncesi sahip görevidir**
(`docs/hukuki-inceleme.md` ve README'de not edildi). Başlık verilemezse bu bir güvenlik açığı
değildir; yalnızca çerçeveleme koruması CSP dışında sağlanamaz — `X-Frame-Options` da barındırma
başlığı gerektirir.

### K-5 · Geliştirme modunda `style-src 'unsafe-inline'`
**Tarih:** 2026-11-19 · **Referans:** §17

Vite geliştirme sunucusu stilleri `<style>` etiketiyle satır içi enjekte eder; sıkı `style-src 'self'`
geliştirmeyi kırar. `vite.config.ts` küçük bir plugin **yalnızca `serve` modunda** `style-src 'self' 'unsafe-inline'`
uygular. Üretim derlemesi ve e2e/preview tam sıkı dizeden sapmaz. Test: `e2e/smoke.spec.ts` CSP meta'sını
denetler.

### K-6 · Git deposu yok
**Tarih:** 2026-11-19 · **Referans:** §19, §20

Bu makinede `git` kurulu değil. `.github/workflows/*` ve şablonlar **yazılır ve şartnameyle birebir**
tutulur, ancak yerel olarak koşturulamaz; commit/etiket akışı sahibinin deposunda işler. CI adımlarının
yerel karşılığı `pnpm run check` ile doğrulanır.

### K-7 · `@vitest/coverage-v8` geliştirme bağımlılığı
**Tarih:** 2026-11-19 · **Referans:** §6, §18.1

Biçim/lint listesindeki araçların dışında tek ek: Vitest'in kendi kapsam sağlayıcısı. §18.1'deki
satır/dal ≥ %90 ölçütü bu olmadan ölçülemez. Çalışma zamanı bağımlılığı değildir.

### K-8 · `content:check` 21.5'e kadar geçici stub
**Tarih:** 2026-11-19 · **Referans:** §7, §13.4

`scripts/content-gate.ts`, `src/content/check.ts` yokken uyarı basıp exit 0 döner; böylece 21.1'de
kalite kapısı çalışır. **21.5 aşaması bu stub'ı gerçek denetime bağlamak zorundadır** ve `build:prod`
taslak içerikte başarısız olmalıdır.

**Uygulandı (21.5):** stub kaldırıldı; `content:check` artık `runContentCheck({ prod })` çağırıyor.
Geliştirme kipi yalnız uyarı üretip exit 0 döner; `--prod` taslak maddelerin **her biri** için ayrı
hata üretip exit 1 verir (83 madde, 3 uyarı). Böylece §21.13'teki "hangi maddelerin onay beklediği
madde madde listelenir" ölçütü doğrudan karşılanır.

### K-13 · Özel çanta maddesinin metni `note` alanında tutuluyor
**Tarih:** 2026-11-19 · **Referans:** §8.1, §11.6

§11.6 "kullanıcı kendi maddesini ekleyebilir (`id`: `ozel-<uuid>`, en çok 15)" diyor; ancak §8.1'deki
`ChecklistState` yalnız `{ id, done, note }` alanlarını tanımlıyor — maddenin **adı** için ayrı alan yok.
Şema §8.1 normatif olduğu için `types.ts` genişletilmedi. Özel maddelerde kullanıcının yazdığı metin
`note` alanında tutuluyor ve o alanın etiketi "Madde adı" olarak gösteriliyor; bilinen maddelerde aynı
alan "not" olarak kalıyor. Liste sırası ve `id` biçimi §11.6'ya uygun.
**Sonuç:** özel maddede ayrı "not" yoktur. Kalıcı çözüm §8.1'e bir `label` alanı eklenmesini gerektirir;
bu bir şartname değişikliğidir, sahibinin kararına bırakıldı.

### K-14 · `frame-ancestors` ve `X-Frame-Options` yayın öncesi sahip görevi
**Tarih:** 2026-11-19 · **Referans:** §17, K-4

K-4'ün devamı: çerçeveleme koruması yalnızca HTTP başlığıyla verilebilir. GitHub Pages özel başlık
vermediği için bu madde `README.md` ve `docs/hukuki-inceleme.md` içinde yayın öncesi görev olarak
işaretlendi. Uygulama bu koruma olmadan da çalışır; korumanın yokluğu veri sızmasına yol açmaz
(veri cihazda kalır) ama tıklama hilelerine karşı katmanı eksik bırakır.

### K-15 · `src/lib/**` kapsam ölçümüne eklendi
**Tarih:** 2026-11-19 · **Referans:** §18.1, K-11

Saklama katmanı Ek A'nın bayt yardımcılarını `src/lib/bytes.ts` içine taşıdı; paylaşım katmanı da
aynı modülü kullanacak. §18.1'de adı geçen katmanlar `model`, `storage`, `share`, `output`, `content`
olduğu için `src/lib` eşiğin dışında kalıyordu ve ölçülmüyordu. `vitest.config.ts` kapsam desenine
eklendi; eşik değişmedi (satır/dal %90). Arayüz katmanı §18.1'de sayılmadığı için kapsam dışıdır;
erişilebilirliği e2e/axe denetler.

### K-16 · Chromium, Firefox, WebKit ve mobil tarayıcı testleri
**Tarih:** 2026-11-25 · **Referans:** §18.1, §18.5, §21.13

İlk çalışma ortamında tarayıcı indirme ve yerel önizleme sunucusu kısıtlıydı. O tarihte
sistem tarayıcılarıyla test edildi. Güncel yapılandırma Playwright’ın Chromium, Firefox
ve WebKit sürümlerini, ayrıca 360 × 640 mobil profili çalıştırır. GitHub Actions aynı
tarayıcıları kurar. Bazı macOS 27 test ortamlarında Firefox için ayrı, geçici bir
Core Foundation kullanıcı profili gerekebilir. [Playwright hata kaydı](https://github.com/microsoft/playwright/issues/42768)

### K-18 · Cüzdan kartında isteğe bağlı kare kod
**Tarih:** 2026-11-25 · **Referans:** §12.3, §10.2

Yazdırma sayfası, kullanıcı ayrı bir kutuyu işaretlediğinde cüzdan kartının arkasına plan
özetinin kare kodunu ekler. Paylaşım katmanının ürettiği bağlantı parola gerektirmediği için
seçeneğin yanında kopyayı elinde bulunduranların görebileceği bilgiler açıkça yazılır.
Genel plan notu, özel ihtiyaç notları ve sağlık alanları kodun dışında tutulur. Bağlantı
boyut sınırını aşarsa uygulama önizlemede uyarı gösterir ve kare kod olmadan baskı sunar.

### K-19 · Plansız "Boş form" basımı ayrı ekranda
**Tarih:** 2026-11-19 · **Referans:** §11.3, §12.6

§12.6 boş formun **plan oluşturmadan** basılabilmesini ister. `Print` bileşeni plan ister
(belgeleri plan üzerinden üretir), bu yüzden plan yokken `AppShell` doğrudan `BlankForm`
bileşenini ve bir "Yazdır" düğmesi gösterir. Böylece Home'daki "Boş formu yazdır" bağlantısı
hedefsiz kalmaz ve kişisel veri içermeyen form her koşulda basılabilir.

### K-20 · Kapsam ölçümünde barrel dosyaları hariç
**Tarih:** 2026-11-19 · **Referans:** §18.1, K-15

`src/*/index.ts` dosyaları yalnızca yeniden dışa aktarım yapar; v8 onları %0 sayar ve eşiği
yanlış yönde düşürür (`output/index.ts` ve `share/index.ts` 0% gösteriyordu). `vitest.config.ts`
bu dosyaları kapsam dışına aldı: `exclude: ['src/**/index.ts']`. Eşik değişmedi (satır/dal %90);
gerçek kapsam %99,10 satır / %97,38 dal.

### K-21 · Güncelleme bildirimi ve çevrimdışı notu kabukta
**Tarih:** 2026-11-19 · **Referans:** §16

Hizmet çalışanı artık `vite-plugin-pwa`'nın `registerSW` yardımcısıyla kaydedilir; yeni sürüm
hazır olduğunda `src/app/pwa.ts` üzerinden kabuğa olay duyurulur ve "Yeni sürüm hazır. [Yenile]"
gösterilir. **Sayfa kullanıcı onayı olmadan yenilenmez** (§16). Çevrimdışıyken üstte
"Çevrimdışı — planınız kullanılabilir" notu görünür. Birim testlerinde `virtual:pwa-register`
sanal modülü `test/mocks/pwa-register.ts` ile takma adlandırılır.

### K-17 · Takvim ve kare kod bağlantıları
**Tarih:** 2026-11-25 · **Referans:** §10.2, §12, §11.5/9

Takvim düğmesi `onDownloadIcs` üzerinden uygulama kabuğundaki dosya üretimini çağırır.
Paylaşma ve yazdırma sayfaları aynı özet kart kodlayıcısını ve kare kod bileşenini kullanır.

### K-9 · Playwright tarayıcıları ertelendi
**Tarih:** 2026-11-19 · **Referans:** §18.4

Tarayıcı ikilileri (~yüzlerce MB) hemen indirilmedi. `e2e` aşamasına (A7 ve sonrası) geçerken
`pnpm exec playwright install` çalıştırılacak. O ana kadar `e2e` kalite kapısında yer almaz.

### K-10 · Bağımlılık sürümleri
**Tarih:** 2026-11-19 · **Referans:** §0.6, §6

§0.6 gereği o günün güncel kararlı sürümleri kuruldu: preact 11.2.0, qrcode-generator 2.0.4,
typescript 7.0.2, vite 8.3.8, vite-plugin-pwa 2.0.0, vitest 5.1.1, biome 2.6.8, playwright 1.65.1,
@testing-library/preact 3.2.6, happy-dom 21.0.4, fake-indexeddb 6.2.8, @axe-core/playwright 4.14.0.
Lisans denetimi ve `THIRD_PARTY_LICENSES.md` 21.12 aşamasında tamamlanır (hepsi MIT/ISC/BSD/Apache-2.0
olmalı; aykırı lisans varsa paket değiştirilir ve buraya yazılır).

### K-11 · Düz (`hoisted`) node_modules bağlaması
**Tarih:** 2026-11-19 · **Referans:** §6, §7

pnpm'in varsayılan sembolik bağlama düzeni bu makinede (Windows 11 + Node 24.21) iki ayrı çökme üretti:

1. `vite → rolldown`: `ERR_MODULE_NOT_FOUND: Cannot find package 'rolldown'`. Paket sanal depoda
   (`node_modules/.pnpm/vite@…/node_modules/rolldown`) mevcuttu; Node 24 ESM çözümlemesi içe aktaran
   modülün **gerçek yoluna** geçmediği için sembolik yol üzerinden aradı ve bulamadı.
2. `vite-plugin-pwa → workbox-build → glob → path-scurry → lru-cache`: hoisted kopya `lru-cache@5.1.1`
   (başka bir bağımlılıktan) çözülüyor, `lru-cache@11` bekleyen kod `LRUCache is not a constructor`
   ile ölüyordu.

**Karar:** `pnpm-workspace.yaml` içinde `nodeLinker: hoisted` + `overrides: path-scurry>lru-cache: ^11.5.3`.
Sonuç: elle junction onarımı **gerekmiyor**; temiz `pnpm install` sonrası `pnpm run build` geçiyor.
pnpm 11 `package.json` içindeki `pnpm` alanını artık okumadığı için ayarlar `pnpm-workspace.yaml`'da.
**Geri alma:** Node/Linux CI'da varsayılan bağlayıcıya dönülebilir; `overrides` yine gereklidir.

### K-12 · Geliştirme modunda `connect-src` gevşetmesi
**Tarih:** 2026-11-19 · **Referans:** §17, K-5

K-5'e ek olarak Vite'ın HMR WebSocket'i de sıkı `connect-src 'none'` tarafından engelleniyordu
(dev konsolunda CSP hatası, HMR sessiz). `vite.config.ts` içindeki `ilk72-dev-csp` plugin'i
**yalnızca `serve` modunda** `connect-src 'self' ws://localhost:* ws://127.0.0.1:*` uygular.
Üretim derlemesi ve e2e/preview tam sıkı `connect-src 'none'` ile çalışır; `dist/index.html`
üzerinde denetlenir.

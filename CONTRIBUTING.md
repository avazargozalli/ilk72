# Katkı Rehberi — İlk 72

İlk 72'ye katkı vermek istediğiniz için teşekkürler. Bu proje gönüllü yürütülen, bağımsız ve açık
kaynak bir aile afet planı uygulamasıdır. Katkı vermeden önce lütfen bu rehberi ve
[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) dosyasını okuyun.

[GitHub sorunları](https://github.com/avazargozalli/ilk72/issues) · [Proje iletişimi](mailto:gozelliazer@gmail.com)

## 1. Ortam ve kurulum

- **Node.js ≥ 22** gerekir. (Proje Node 24 ile geliştirilir ve test edilir.)
- **Paket yöneticisi pnpm'dir.** Bu projede `npm` kullanılmaz; kilit dosyası `pnpm-lock.yaml`'dır
  (bkz. `docs/kararlar.md`, K-1). `npm ci` / `npm install` çalıştırmayın; kilit dosyasını
  değiştirmeyin.
- pnpm yoksa Node ile birlikte gelen Corepack üzerinden açın:

```powershell
corepack enable
corepack prepare pnpm@11 --activate
```

Kurulum ve geliştirme:

```powershell
pnpm install --frozen-lockfile
pnpm run dev          # http://127.0.0.1:5173
```

Kod değiştirmeden önce ve göndermeden önce kalite kapısı:

```powershell
pnpm run check        # lint + typecheck + coverage + content:check + build + e2e
```

Tek tek komutlar:

| Komut | Ne yapar |
|---|---|
| `pnpm run lint` | Biome biçim ve lint denetimi |
| `pnpm run format` | Biome ile otomatik biçimlendirme |
| `pnpm run typecheck` | `tsc --noEmit` |
| `pnpm run test` | Vitest birim/bileşen testleri |
| `pnpm run coverage` | Kapsamla test; `src/model`, `src/storage`, `src/share`, `src/output`, `src/content` için satır ve dal ≥ %90 |
| `pnpm run content:check` | İçerik onay kapısı denetimi |
| `pnpm run build` | Geliştirme derlemesi (taslak içeriğe izin verir, "TASLAK" şeridi gösterir) |
| `pnpm run build:prod` | Üretim derlemesi; onaysız içerik varsa **başarısız olur** |
| `pnpm run e2e` | Playwright uçtan uca testleri (önce `pnpm exec playwright install chrome msedge` gerekir) |

`pnpm run build:prod` bu geliştirme sürümünde taslak içerik nedeniyle başarısız olur; bu beklenen
durumdur ve içerik onaylanana kadar sürer.

### Depo düzeni

```
src/config.ts        ad, sürüm, depo adresi, iletişim, barındırma (tek yer)
src/model/           saf işlevler: types, defaults, validate, progress, bag
src/storage/         IndexedDB, otomatik kayıt, şifreleme, yedek
src/share/           özet kart, kodlama, kare kod
src/output/          takvim (.ics) ve yazdırma çıktıları
src/content/         kaynak kaydı, içerik kaydı, onay denetimi
src/ui/              bileşenler, sayfalar, yazdırma düzenleri
src/i18n/            kullanıcıya görünen bütün metinler
test/  e2e/          birim, bileşen ve uçtan uca testler
docs/                şartname, mimari, kararlar, hukuki inceleme, içerik onayı
```

Ayrıntılı mimari: `docs/mimari.md`. Tek doğruluk kaynağı: `docs/sartname.md`.

## 2. Kod katkıları

- **TypeScript `strict`** ve `noUncheckedIndexedAccess` açıktır. `any` yerine dar tipler kullanın.
- **Çalışma zamanı bağımlılığı eklemeyin.** Yalnızca `preact` ve `qrcode-generator` kullanılır;
  yönlendirme, durum yönetimi ve form kitaplığı projede yazılır (şartname §6).
- **Dış istek yoktur.** Yazı tipi, harita, CDN, analitik, API ya da başka bir kökene istek yapan
  kod eklemeyin. Uygulama yalnızca kendi kökeninden yüklenir ve çevrimdışı çalışır (İ2).
- **Kullanıcıya görünen metinler `src/i18n/` altında durur.** Bileşenlere sabit Türkçe metin
  gömmeyin (şartname §0 kural 7). Hukuki metinlerin (`src/i18n/legal.ts`) anlamı değiştirilemez;
  proje kimliği ve iletişim bilgileri `src/config.ts` üzerinden güncellenir.
- **`dangerouslySetInnerHTML` ve `innerHTML` yasaktır.** Kullanıcı verisi DOM'a yalnızca Preact'in
  metin düğümleriyle girer (güvenlik, §17).
- **Erişilebilirlik:** WCAG 2.2 AA hedefi. Anlamlı HTML, etiketler, klavye erişimi, görünür odak,
  ≥ 4,5:1 kontrast, 44 × 44 px dokunma hedefi ve `prefers-reduced-motion` gözetilir. Değişikliğiniz
  yeni bir erişilebilirlik engeli yaratmamalıdır.
- **Test yazın.** `src/model`, `src/storage`, `src/share`, `src/output` ve `src/content` için satır
  ve dal kapsamı ≥ %90'dır. Hata düzeltmelerinde hatayı yakalayan bir test ekleyin.
- **Biçim:** Biome. Göndermeden önce `pnpm run lint` ve `pnpm run typecheck` temiz olmalıdır.

## 3. İçerik önerme kuralları

Rehber, çanta listesi ve belge metinleri resmî tavsiyelerin **kendi cümlelerimizle** yazılmış
özetleridir. İçerik önerirken:

1. **Resmî kaynak zorunludur.** Her madde en az bir resmî kaynağa bağlıdır. Kaynak adresi `https`
   ile başlamalı ve şu alan adlarından birinde olmalıdır (ve alt alan adlarında):
   `afad.gov.tr`, `turkiye.gov.tr`, `112.gov.tr`, `icisleri.gov.tr`, `saglik.gov.tr`,
   `aile.gov.tr`, `dask.gov.tr`, `kizilay.org.tr`, `mevzuat.gov.tr`, `resmigazete.gov.tr`,
   `kvkk.gov.tr`, `mebakub.meb.gov.tr`.
2. **Kendi cümlelerinizle yazın.** Kurum metinlerini, afişlerini, görsellerini kopyalamayın;
   alıntı yapmayın. Kaynak adı yalnızca düz metin olarak anılır (İ4, İ5).
3. **Kısa ve sade olun.** Metin en fazla **220 karakter** olabilir; sade Türkçe, kısa cümle,
   "siz" hitabı kullanın. Tıbbi, hukuki, mühendislik ya da sigorta tavsiyesi yazmayın (İ7).
4. **Madde kaydı `src/content/registry.ts` içindedir.** Yeni madde eklerken `id`, `category`,
   `text`, `sources` alanlarını doldurun; `status` **`taslak`** kalır. `onayli` durumuna yalnızca
   onaylayan kişi geçirebilir (`docs/icerik-onay.md`).
5. **Kaynak kaydı `src/content/sources.ts` içindedir.** Yeni kaynak için `key`, `org`, `title`,
   `url`, `accessed` ve `verified` alanları gerekir. Adresi doğrulanmamış kaynaklar `verified:
   false` ve `url: null` taşır; bunlara bağlı maddeler `onayli` yapılamaz.
6. **Onay ayrı bir iştir.** İçerik değişikliği ile onaylama aynı katkıda yapılmaz; her onay ayrı
   bir commit olur ve `reviewedBy` / `reviewedAt` alanları doldurulur (şartname §13.4).
7. **Hata bildirimi.** Var olan bir maddedeki yanlışlığı bildiriyorsanız "Yanlış veya eskimiş
   içerik" sorun şablonunu kullanın; **resmî kaynak adresi zorunludur**.

## 4. Çeviri katkıları

- Uygulama şu an yalnızca Türkçedir; metinler `src/i18n/` altında çeviriye hazır biçimde ayrılmıştır.
  Yeni dil eklemek yapısal bir değişikliktir; başlamadan önce bir sorun açıp konuşun.
- Bir çeviri, **bütün anahtarları** kapsamalı ve Türkçe metinle aynı yapıyı korumalıdır. Eksik
  anahtar, ekrana Türkçe metin sızmasına yol açar.
- **Makine çevirisi doğrudan yayımlanmaz.** Çeviri, o dili ana dili olarak konuşan bir kişi
  tarafından gözden geçirilmelidir.
- **İçerik çevirileri de onay kapısından geçer** (şartname §23): her madde resmî kaynağıyla
  karşılaştırılmalı ve `reviewedBy` / `reviewedAt` alanları doldurulmalıdır. Hukuki metin
  çevirileri ayrıca hukukçu incelemesi gerektirir.
- Çeviri katkısında kaynak dilin anlamını değiştirmeyin; özellikle güvenlik uyarılarını ve yasal
  metinleri kısaltmayın.

## 5. Kabul edilmeyecek öneriler

Aşağıdakiler şartnamenin değiştirilemez ilkelerini deldiği için **kabul edilmez**; lütfen öneri
açmayın:

- Bağış düğmesi, IBAN, `FUNDING.yml`, sponsorluk, reklam, ortaklık bağlantısı, marka adıyla ürün
  önerisi veya satış (İ11).
- Hesap, giriş, bulut senkronizasyonu, cihazlar arası aktarım, kullanıcı verisi toplama (İ1).
- Analitik, telemetri, çerez, hata izleme servisi, harita, CDN, harici yazı tipi ya da herhangi bir
  dış istek (İ1, İ2).
- Kurum adı, logosu, amblemi, kurumsal rengi; Kızılay/kızılhaç amblemi veya benzeri işaret (İ5).
- Yardım çağırma, uyarı gönderme, anlık deprem/haber akışı (İ6).
- İlk yardım uygulaması, ilaç, bina dayanıklılığı değerlendirmesi, tesisat onarımı anlatımı (İ7).
- T.C. kimlik no, kimlik/pasaport no, banka, poliçe, parola toplama; sağlık bilgisini varsayılan
  açık yapma (İ8).
- "Güvendesiniz", "hazırsınız" gibi ifadeler, güvenlik puanı, başarı iddiası (İ9).
- Yorum, forum, herkese açık kullanıcı içeriği veya kullanıcıdan kullanıcıya paylaşım (İ12).
- Alt bilgideki bağımsızlık cümlesini kaldırma ya da resmî görünüm veren tasarım (İ5).

Bir öneri bu maddelerden biriyle çelişiyorsa, gerekçesi ne olursa olsun reddedilir. İlkeyi
delmeden çözülemeyen bir sorun varsa lütfen önce sorun açıp tartışın; çözüm
`docs/kararlar.md` dosyasına yazılır.

## 6. Gönderme süreci

- Değişiklikleri küçük ve tek konulu tutun. İçerik değişikliği ile kod değişikliğini aynı PR'da
  karıştırmayın.
- PR açmadan önce `pnpm run check` çalıştırın; PR şablonundaki onay listesini doldurun.
- Bir hata düzeltmesi yeni bir davranış ekliyorsa testini de ekleyin.
- Güvenlik açıkları için [SECURITY.md](SECURITY.md) yolunu izleyin; **herkese açık sorun açmayın.**
- Katkınızla, kodun MIT ve içeriğin CC BY 4.0 lisansı altında yayımlanmasına izin vermiş olursunuz.

## 7. Notlar

- Bu çalışma kopyasında `git` yoktur (bkz. `docs/kararlar.md`, K-6); sürüm denetimi ve etiketleme
  sahibinin GitHub deposunda yürür. CI iş akışları `pnpm` kullanır (K-1).
- CI; lint, typecheck, kapsam, `content:check`, derleme, Playwright uçtan uca testleri ve
  `pnpm audit --omit=dev --audit-level=high` adımlarını koşar; `FUNDING.yml` bulunmadığını denetler.
- Sorularınız için: `gozelliazer@gmail.com`.

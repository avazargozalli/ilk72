# Mimari — İlk 72

Bu belge modüllerin, veri akışının ve elle doğrulama listelerinin haritasıdır.
Şartname: `docs/sartname.md`. Kararlar ve sapmalar: `docs/kararlar.md`.

## 1. Katmanlar

```
ui/          →   görünüm, erişilebilirlik, yönlendirme
  ↓ (yalnız okuma + niyet)
model/       →   saf işlevler: doğrulama, temizleme, doluluk, çanta üretimi
  ↓
storage/     →   IndexedDB, otomatik kayıt, şifreleme, yedek dosyası
share/       →   özet kart üretimi, kodlama, kare kod
output/      →   .ics takvim dosyası
content/     →   kaynak kaydı, içerik kaydı, onay denetimi
```

**Bağımlılık yönü tek yönlüdür.** `model` hiçbir şeyi import etmez (yalnız `types`).
`storage`, `share`, `output`, `content` birbirini import etmez. `ui` hepsini kullanabilir.
Döngüsel import yasak.

## 2. Sahiplik

| Dizin | Sahip aşama | Aşama |
|---|---|---|
| `src/config.ts`, `src/model/types.ts`, `index.html`, `docs/mimari.md`, `docs/kararlar.md`, `docs/pano.md` | Lead | A1 |
| `src/main.tsx`, `src/router.ts`, `src/styles/tokens.css`, `src/styles/base.css`, `src/i18n/tr.ts` | builder | A1 |
| `src/model/{defaults,validate,progress,bag}.ts` | model-dev | A2 |
| `src/storage/**` | storage-dev | A3 |
| `src/share/**`, `src/output/ics.ts` | share-dev | A4 |
| `src/content/**` | content-dev | A5 |
| `src/ui/components/**`, `src/styles/components.css`, `src/i18n/**` | ui-dev | A6 |
| `src/i18n/wizard.ts` | wizard-dev | A7 |
| `src/i18n/pages.ts` | pages-dev | A8 |
| `src/i18n/print.ts` | print-dev | A9 |
| `src/i18n/share.ts` | share-ui-dev | A10 |
| `src/i18n/legal.ts` | docs-dev | A12 |
| `src/ui/pages/Wizard*.tsx` | wizard-dev | A7 |
| `src/ui/pages/{Home,Summary,Emergency,Guide,Bag,NotFound}.tsx` | pages-dev | A8 |
| `src/ui/pages/Print.tsx`, `src/ui/print/**`, `src/styles/print.css` | print-dev | A9 |
| `src/ui/pages/{Share,Import,Settings}.tsx` | share-ui-dev | A10 |
| `public/**`, PWA yapılandırması | pwa-dev | A11 |
| `test/integration/**` | Lead | A13 |
| `docs/**` (yukarıdakiler hariç), `.github/**`, kök belgeler | docs-dev | A12 |

## 3. Veri akışı

1. **Açılış:** `storage/store.ts` → IndexedDB `kv["plan"]` okunur.
   - Kayıt düz `Plan` ise doğrudan.
   - `{ enc: true, data }` ise parola sorulur, `decryptBytes` → `JSON.parse` → `sanitizePlan`.
   - Depo açılamazsa bellek içi kip + kalıcı uyarı (§9.2).
2. **Düzenleme:** sayfa `plan` üzerinde değişiklik üretir → `store.savePlan(next)` → 500 ms debounce
   ile yazma; `visibilitychange → hidden` anında bekleyen yazma hemen.
3. **Doğrulama:** depodan, dosyadan ve bağlantıdan gelen **her** veri `sanitizePlan`'dan geçer.
   Doğrulanmamış veri duruma ya da DOM'a ulaşmaz (§8.3).
4. **Çıktı:** `ui/print/*` yalnız `plan` okur, DOM'a Preact metin düğümleriyle yazar.
5. **Paylaşım:** `share/card.ts` `Plan → ShareCard`; `share/codec.ts` `ShareCard → '1p.'|'1e.' + b64url`.
   Uzunluk `SHARE_MAX_URL` üstündeyse kare kod üretilmez (§10.2).
6. **İçe alma:** `#/al/<yük>` → `decodeShare` → `validateCard` → önizleme → kullanıcı seçimi → birleştirme.

## 4. Saklama biçimi

Veritabanı `ilk72`, sürüm 1, tek nesne deposu `kv` (anahtar: dize).

| Anahtar | Değer |
|---|---|
| `plan` | `Plan` **veya** `{ enc: true, data: Uint8Array }` |
| `settings` | `{ largeText, lockEnabled, printPrefs, firstRunAccepted, visitedSteps? }` |
| `meta` | `{ contentSeenVersion }` |
| `revision` | Son plan/kilit yazımının rastgele depo sürümü |

Plan, kilit ayarı ve sürüm tek IndexedDB işleminde yazılır. Ayrı sekmeler, açtıkları
sürüm artık geçerli değilse planı güncelleyemez. Silme işlemi planı ve ayarları temizler,
eski sekmelerin planı yeniden yazmasını önlemek için yeni bir rastgele sürüm bırakır.
Uygulama dosyaları çevrimdışı erişim için önbellekte kalır.

## 5. Paylaşım biçimi

`<sürüm><kip>.<base64url>` — sürüm `1`, kip `p` (düz) veya `e` (parolalı).
Düz: `deflate-raw(utf8(JSON(ShareCard)))`. Parolalı: `encryptBytes(deflate(...), parola)`.
Şifreleme zarfı: `salt(16) || iv(12) || ciphertext || tag(16)`; PBKDF2-HMAC-SHA256 600.000 tur,
AES-256-GCM. Bağlantıda yük `#` sonrasındadır; sunucuya gitmez.

## 6. İlkelerin teknik karşılığı

Şartname §4.2 tablosu normatiftir. Ek olarak bu depoda:

| İlke | Kanıt |
|---|---|
| İ1 veri cihazda | `connect-src 'none'`, ağ API'si yok, telemetri yok |
| İ2 sıfır dış istek | `e2e`'de tüm istekler dinlenir; köken dışı istek testi düşürür |
| İ3 kâğıt öncelikli | her akış `#/yazdir`'a bağlanır; `print.css` |
| İ4 kaynaksız tavsiye yok | `content/check.ts` kaynak zorunlu kılar |
| İ5 resmî görünme yok | sabit alt bilgi, amblem yok, kurumsal renk yok |
| İ6 acil servis değil | tek numara `tel:112`, "yardım çağırmaz" metni |
| İ7 tıbbi/teknik talimat yok | içerik kaydında ilgili maddeler yönlendirme |
| İ8 veri azaltma | `health` yalnız `healthOptIn`, varsayılan kapalı |
| İ9 sahte güven yok | yalnız doluluk sayısı + sabit uyarı |
| İ10 herkes için | WCAG 2.2 AA, axe sıfır ihlal, 320 px |
| İ11 para/tanıtım yok | `FUNDING.yml` yok, bağış öğesi yok |
| İ12 kullanıcı içeriği yayımlanmaz | herkese açık paylaşım özelliği yok |

## 7. Elle doğrulama listeleri (§18.7)

Otomatik karşılığı olanlar `e2e/a11y.spec.ts` (axe, WCAG 2.2 AA, 11 sayfa + 9 adım) ve
`e2e/*.spec.ts` içindedir. Aşağıdaki **elle** kalemler sahibinde açıktır
(`docs/son-kontrol.md` §3).

Otomatik kontroller:

- [x] Sihirbaz → özet → yazdırma akışı ve yanıt veren kontroller tarayıcı testinde. Görünür odak stili CSS ve bileşen testleriyle denetlenir.
- [x] 320 px genişlikte büyük yazı açıkken gizlilik bildirimi yatay taşmıyor. Varsayılan mobil test profili 360 × 640.
- [x] Koyu temada kontrast ≥ 4,5:1 (büyük metin ≥ 3:1): `tokens.css` `prefers-color-scheme` bloğu; axe `color-contrast` sıfır ihlal (acil düğmesi 1.14:1 hatası düzeltildi).
- [x] Bilgi yalnız renkle verilmiyor: doluluk/durum metinle de yazılır; taslak etiketi metin.
- [x] Odak görünür; odak tuzağı yalnız iletişim kutularında; `Esc` kapatır: `Dialog` bileşeni + `test/ui/dialog.test.tsx`.
- [x] Animasyon `prefers-reduced-motion` ile kapalı: `base.css`/`components.css`.

Sahibinde kalan elle doğrulamalar:

- [ ] %200 tarayıcı yakınlaştırması ve 320 px genişlikte tam akışın elle kontrolü.
- [ ] Ekran okuyucuyla tam akış (NVDA veya VoiceOver): her adımda başlık, etiket, hata duyurusu.
- [ ] Gerçek telefonla (Android Chrome / iOS Safari) tam akış ve ana ekrana ekleme.
- [ ] Baskı çıktılarının okunurluğu: A4'te taşma yok, kart ölçüleri cetvelle doğru (85,6 × 54 mm), her belge yeni sayfada.
- [ ] Kâğıt çıktısında siyah metin / beyaz zemin ve en az 11 pt (kartlarda ≥ 8 pt) gözle kontrolü.
- [ ] En az üç kişiyle kullanılabilirlik denemesi (biri 65 yaş üstü).

## 8. Kapsam dışı (yapılmayacak)

Sel/yangın/heyelan/çığ/fırtına modülleri, toplanma alanı verisi, anlık deprem verisi, uyarı,
konum paylaşımı, "güvendeyim" iletisi, hesap/bulut, çok haneli plan, ilk yardım anlatımı,
bina risk değerlendirmesi, sigorta tavsiyesi (§3.2). Bunlardan biri istenirse: yapma, Lead'e ilet.

## 9. Test stratejisi

- **Birim/bileşen:** Vitest + happy-dom. `src/model`, `src/storage`, `src/share`, `src/output`,
  `src/content` için satır ve dal kapsamı ≥ %90 (§18.1).
- **Normatif vektörler:** Ek B.1 (şifreleme bilinen yanıt), B.2 (`buildIcs` bayt bayt),
  B.3 (paylaşım durumları) — `test/vectors/` altında dosya olarak durur.
- **Uçtan uca:** Playwright, chromium/firefox/webkit + 360 × 640 mobil profil.
- **Erişilebilirlik:** `@axe-core/playwright`, WCAG 2.2 AA etiketli kurallar, sıfır ihlal.
- **Dış istek:** e2e'de her istek dinlenir; köken dışı istek testi düşürür (§18.5).

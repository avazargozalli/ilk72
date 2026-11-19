# Son Kontrol — §21.13

Bu belge, şartnamenin **21.13 Son kontrol listesi** maddelerinin tek tek
doğrulanmasıdır. Her satırda kanıt (komut + sonuç ya da dosya) yazılıdır.
Tarih: 2026-11-19 · Şema sürümü: 1 · İçerik sürümü: 1

## 1. Ajanın tamamlayacakları (hepsi tamam)

| # | Madde | Durum | Kanıt |
|---|---|---|---|
| 1 | `check` temiz kopyada hatasız | **PASS** | `lint` 0 hata (199 dosya), `tsc --noEmit` 0 hata, `coverage` 0 hata (aşağıdaki tablo), `content:check` 0 hata, `build` 0 hata, `e2e` 78/78 |
| 2 | Ek B vektörleri testlerde birebir | **PASS** | **B.1** `test/storage/crypto.test.ts` — sabit tuz/iv ile 62 baytlık zarf beklenen onaltılıkla birebir. **B.2** `test/output/ics.test.ts` + `test/vectors/expected.ics` — 707 bayt, 24 CRLF, bayt bayt eşit. **B.3** `test/share/codec.test.ts` — kart JSON 602 bayt, düz bağlantı 511, parolalı 569–570, beş hata kodu |
| 3 | Dış istek testi (18.5) bütün e2e senaryolarında | **PASS** | `e2e/support/guards.ts` her testte çalışır; smoke, akış, XSS, çevrimdışı senaryolarının tamamı `expectNoExternalRequests()` ile biter. 78/78 geçti |
| 4 | Yasaklı API'ler kaynak kodda yok | **PASS** | `Select-String` taraması: `dangerouslySetInnerHTML`, `innerHTML`, `eval(`, `fetch(`, `XMLHttpRequest`, `WebSocket`, `sendBeacon` → **eşleşme yok** (yalnız yorumlarda geçen iki ifade, yanlış pozitif olmasın diye yeniden yazıldı) |
| 5 | Çalışma zamanı bağımlılıkları yalnız `preact` ve `qrcode-generator` | **PASS** | `package.json` → `dependencies: preact, qrcode-generator`. Lisanslar `THIRD_PARTY_LICENSES.md` içinde |
| 6 | 12 ilkenin her biri için test ya da elle kontrol `docs/mimari.md`'de | **PASS** | `docs/mimari.md` §6 tablosu; her ilke bir test ya da elle kontrole bağlı |
| 7 | `build:prod` taslak içerik nedeniyle başarısız ve maddeleri listeliyor | **PASS** | `pnpm run build:prod` → **exit 1**, **83 madde** tek tek "… onay bekliyor: durum 'taslak'" satırıyla listelendi + 3 doğrulanmamış kaynak uyarısı |
| 8 | Yer tutucular ve sahibine kalan işler raporda listelendi | **PASS** | §3 aşağıda |

### Kapsam (§18.1: satır ve dal ≥ %90)

| Katman | Satır | Dal |
|---|---|---|
| Tümü | **%99,10** | **%97,38** |
| `model` | %100 | %100 |
| `storage` | %97,51 | %94,51 |
| `share` | %99,27 | %99,02 |
| `output` | %100 | %100 |
| `content` | %100 | %92,39 |
| `lib` | %100 | %100 |

Barrel dosyaları (`src/*/index.ts`) kapsam dışıdır: yalnız yeniden dışa
aktarım yaparlar (K-15).

### E2E ve erişilebilirlik

| Koşu | Sonuç |
|---|---|
| Playwright — chromium + edge + mobil (360 × 640) | **78/78 geçti** |
| `@axe-core/playwright` WCAG 2.2 AA — 11 sayfa + 9 sihirbaz adımı | **sıfır ihlal** |
| Çevrimdışı açılış (§18.4-3) | geçti |
| XSS (§18.4-9) — iki yük, özet ve yazdırma dahil | geçti |
| Köken dışı istek (§18.5) | hiç ihlal yok |

## 2. Aşama kabul ölçütleri (§21)

| Aşama | Kabul ölçütü | Durum |
|---|---|---|
| 21.1 İskelet | lint/typecheck/test/build hatasız; boş sayfa açılıyor | PASS |
| 21.2 Model | §18.2 testleri geçer | PASS (330 model testi, %100 kapsam) |
| 21.3 Saklama | §18.3 saklama/şifreleme/yedek testleri | PASS (B.1 birebir) |
| 21.4 Paylaşım + takvim | §18.3 paylaşım/takvim; Ek B vektörleri birebir | PASS (B.2 bayt bayt, B.3 satır satır) |
| 21.5 İçerik | §18.6 testleri; `build:prod` beklendiği gibi başarısız | PASS (83 madde birebir, 83 hata) |
| 21.6 Ortak arayüz | bileşen testleri; axe sıfır ihlal | PASS |
| 21.7 Sihirbaz | §18.4-1 ve §18.4-2 | PASS |
| 21.8 Özet/acil/rehber/çanta | §18.4-3, -5, -8 | PASS |
| 21.9 Çıktılar | A4 taşma yok, kart ölçüleri mm, §18.4-1 | PASS (baskı ölçüleri CSS'te mm ile; cetvelle fiziksel ölçüm sahibinin işi) |
| 21.10 Paylaşım/ayarlar/kilit | §18.4-4, -6, -7, -9 | PASS |
| 21.11 PWA | §18.4-3 ve §18.5; çevrimdışı tam akış | PASS |
| 21.12 Hukuki sayfalar/belgeler/CI | iş akışları geçerli; bütün belge dosyaları var | PASS (yerelde `git` yok — K-6; YAML'ler şartnameyle birebir) |
| 21.13 Son kontrol | bu liste | bu belge |

## 3. Sahibinin tamamlayacakları (yayın öncesi zorunlu)

İlk teslimden sonra tamamlanan işler tabloda ayrıca belirtilmiştir.

| # | İş | Nerede |
|---|---|---|
| 1 | §13.3'teki **83 maddenin** onayı (kaynağı tarayıcıda açıp karşılaştırma, `status: 'onayli'`, `reviewedBy`, `reviewedAt`) ya da silinmesi; sonra `build:prod` | `src/content/registry.ts`, süreç: `docs/icerik-onay.md` |
| 2 | Tamamlandı. Önceden kaynak adresi eksik olan 20 madde resmî yayınlara bağlandı. İçerik onayı ayrıca gerekir. | `src/content/sources.ts`, `src/content/registry.ts` |
| 3 | `docs/hukuki-inceleme.md` doldurulacak, **"Onay tarihi:"** yazılacak; §4.4'teki S1–S10 yanıtlanacak | `docs/hukuki-inceleme.md` |
| 4 | Ad ve marka araması ("İlk 72") | — |
| 5 | Tamamlandı. GitHub Pages seçildi. | `src/config.ts` |
| 6 | Tamamlandı. Depo sahibi ve proje e-postası uygulama ile belgelere işlendi. | `src/config.ts` |
| 7 | `frame-ancestors 'none'` başlığının verilmesi (meta ile uygulanamaz) | barındırma yapılandırması (K-4, K-14) |
| 8 | Elle erişilebilirlik: bir ekran okuyucu, gerçek telefon, %200 yakınlaştırma, 320 px, en az üç kişi (biri 65 yaş üstü) | `docs/mimari.md` §7 |
| 9 | Baskı çıktılarının cetvelle ölçümü (85,6 × 54 mm kart, A4 taşma) | `docs/mimari.md` §7 |
| 10 | Tamamlandı. Açık kaynak deposu ve GitHub Actions yayın kaynağı | `.github/workflows/` |

## 4. Bilinen sınırlar (README'de aynen)

Şartname §22'deki sekiz sınır `README.md` içinde birebir yer alır.

## 5. Ortam kısıtları (bu makinede)

| Konu | Durum | Karar |
|---|---|---|
| `npm` yok | pnpm 11 kullanıldı | K-1 |
| `git` yok | commit/etiket yerelde koşulamadı | K-6 |
| Playwright tarayıcı indirme engelli | sistem Chrome/Edge (`channel`) kullanıldı | K-16 |
| Playwright alt süreç açar | e2e yalnız genişletilmiş izinle koşar | K-16 |
| Windows + Node 24 sembolik bağ | `nodeLinker: hoisted` | K-11 |

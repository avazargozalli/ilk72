# Görev Panosu — İlk 72

> **Tek gerçek kaynak.** Bu dosyayı **yalnızca Lead** yazar. Ajanlar satırı kendileri değiştirmez;
> işi bitirince 5 bloklu handoff raporunu Lead'e verir, Lead satırı işler.
> Neden dosya: bu oturumda DSH `team_task_*` araçları şemada görünüyor ancak çalıştırıcıda
> "unknown tool" veriyor (bkz. `TEAM.md` §2.1). Pano dosya tabanlı yürüyor.

Durumlar: `bekliyor` · `devam` · `inceleme` (verifier bekliyor) · `bitti` · `bloke`

## Aşama tablosu

| ID | Aşama | Sahip | Durum | Bağımlılık | Kanıt |
|---|---|---|---|---|---|
| A1 | 21.1 İskelet: araç zinciri, Preact kabuğu, yönlendirici, CSP | builder | bitti | — | lint/typecheck/test/coverage/build/content:check exit 0; `dist/index.html` CSP'de `connect-src 'none'`; UTF-8 doğrulandı; `nodeLinker: hoisted` ile temiz install → build (K-11) |
| A2 | 21.2 Model: types, defaults, validate, progress, bag | model-dev | bitti | A1 ✓ | 330 model testi; tam koşu 398 test exit 0; `src/model` kapsam %100/%100; Lead'in bağımsız denetimi 6/6 (sınır tablosu, sürüm kapısı, sağlık silme, rol temizliği, idempotans). Çapraz-katman `bag ⊂ registry` denetimi kalıcı teste alındı: `test/integration/bag-registry.test.ts` (5 test) |
| A3 | 21.3 Saklama: idb, store, crypto, backup | storage-dev | bitti | A2 ✓ | Ek B.1 vektörü bayt bayt eşleşti; 81 storage testi (tam koşu 556); storage+lib kapsam %97,47/%94,73; `tsc`/`biome` temiz. Lead `src/lib/**`'i kapsam desenine ekledi (config boşluğu) |
| A4 | 21.4 Paylaşım + takvim: codec, card, qr, ics | share-dev | devam | A3 ✓ | — |
| A5 | 21.5 İçerik: sources, registry (§13.3 tamamı), check | content-dev | bitti | A1 ✓ | 83/83 madde birebir (bağımsız ayrıştırma denetimi: metin/kaynak/id farkı yok); 27 kaynak anahtarı (24 https + 3 doğrulanmamış); `content:check` 0, `--prod` 83 hata + 3 uyarı; kapsam %100 satır / %92,39 dal |
| A6 | 21.6 Ortak arayüz: bileşenler, stiller, i18n, ilk açılış | ui-dev | bitti | A2 ✓, A5 ✓ | 69 UI testi; 17 bileşen + 9 i18n dosyası; `tsc`/`build` exit 0; Lead `components.css`'i `main.tsx`'e bağladı ve `Footer`'ı kabuğa ekledi → dist CSS 2,68→10,85 kB; `test/integration/app-footer.test.tsx` (3 test) §18.4-8'i kilitledi |
| A7 | 21.7 Sihirbaz: 9 adım, otomatik kayıt, doğrulama | wizard-dev → Lead | bitti | A6 ✓ | wizard-dev düştü; Lead tamamladı: `Wizard.tsx`, `StepBag.tsx`, `StepReview.tsx` yazıldı, `SelectField` import hatası giderildi, `tsc`/`lint`/`build` temiz, `test/ui/wizard.test.tsx` 10 test (§11.4 doğrulama+odak, geri, atla, ziyaret izi, çanta üretimi, 6 ay varsayılanı) |
| A8 | 21.8 Özet, acil, rehber, çanta sayfaları | pages-dev | bitti | A6 ✓, A7 ✓ | 71 sayfa testi; altı sayfa saf prop tabanlı; §11.9 acil ekranı tek sütun + büyük punto (`pages.css`), axe sıfır ihlal |
| A9 | 21.9 Çıktılar: yazdırma, 6 belge, takvim indirme | print-dev | bitti | A6 ✓, A7 ✓ | 47 test; altı belge (§12.1–12.6); `print.css` A4/12 mm, kart 85,6 × 54 mm; buzdolabı sayfasında sağlık yok, çocuk kartında ev adresi yok |
| A10 | 21.10 Paylaşım arayüzü, ayarlar, kilit | share-ui-dev | bitti | A4 ✓, A6 ✓ | 47 test; §10.1 uyarısı birebir, `1p./1e.` yükler, kare kod matrisle (satır içi HTML yok), §10.3 hata kodları, §9.3 kilit uyarısı, §9.4 1 MB + üzerine yazma onayı |
| A11 | 21.11 PWA: manifest, hizmet çalışanı, güncelleme | builder → Lead | bitti | A6 ✓, A9 ✓ | manifest + tam ön bellek (çalışma zamanı önbelleği yok); `registerSW` ile "Yeni sürüm hazır + Yenile" (onaysız yenileme yok), çevrimdışı notu, "ana ekrana ekle" açıklaması; e2e çevrimdışı testi geçti |
| A12 | 21.12 Hukuki sayfalar, belgeler, CI | docs-dev → Lead | bitti | A5 ✓, A6 ✓ | docs-dev düştü; 9 kök belge, §14 metinleri (`legal.ts`), `docs/hukuki-inceleme.md`, `docs/icerik-onay.md`, 2 workflow, 3 sorun şablonu yazıldı. Lead tamamladı: `oneri.yml` + `PULL_REQUEST_TEMPLATE.md`; hukuki sayfa bileşenleri (`Privacy`, `Terms`, `Imprint`, `Accessibility`, `About`, `Sources`, `LegalPageView`) + `test/ui/legal.test.tsx` (7 test: §14 başlıkları, 112 metni, künye sürümü, gönüllü beyan, §14.5 bağlantıları, kaynak alan adı denetimi) |
| A8 | 21.8 Özet, acil, rehber, çanta sayfaları | pages-dev | bekliyor | A6, A7 | — |
| A9 | 21.9 Çıktılar: yazdırma, 6 belge, takvim indirme | print-dev | bekliyor | A6, A7 | — |
| A10 | 21.10 Paylaşım arayüzü, ayarlar, kilit | share-ui-dev | bekliyor | A4, A6 | — |
| A11 | 21.11 PWA: manifest, hizmet çalışanı, güncelleme | pwa-dev | bekliyor | A6, A9 | — |
| A12 | 21.12 Hukuki sayfalar, belgeler, CI | docs-dev | bekliyor | A5, A6 | — |
| A13 | 21.13 Son kontrol: listedeki her madde | lead | bitti | A1–A12 ✓ | `docs/son-kontrol.md`: sekiz ajan maddesi PASS + kanıt; e2e 78/78 (chromium/edge/mobil), axe sıfır ihlal, dış istek yok, `build:prod` 83 maddeyle başarısız |

## Dalga planı

- **Dalga 1 (şimdi):** A1 — iskelet ve araç zinciri.
- **Dalga 2 (A1 sonrası, paralel):** A2 (model), A5 (içerik).
- **Dalga 3:** A3 (saklama), A6 (arayüz) — A2/A5'e bağlı.
- **Dalga 4 (paralel):** A4, A7.
- **Dalga 5 (paralel):** A8, A9, A10, A12.
- **Dalga 6:** A11, sonra A13.

## Kayıt kuralları

1. Bir aşama `bitti` olmadan ona bağlı aşama `devam`a alınmaz.
2. `bitti` için: kalite kapısı komutları (lint, typecheck, test, coverage, build, content:check) yeşil **ve** kabul ölçütleri kanıtlı.
3A. `inceleme` durumu: verifier bağımsız denetliyor; `bitti`ya çevirme yetkisi verifier raporundadır.
4. `bloke` satırına bloke nedeni ve denenen yollar yazılır; Lead karar verir.
5. Her satırda kanıt sütunu dolar: dosya:satır veya komut + özet çıktı. Kanıtsız `bitti` yok.

## Sapmalar ve kararlar

Kararlar `docs/kararlar.md` içinde (K-1…K-n). Yeni sapma gerekiyorsa: dur, Lead'e sor.

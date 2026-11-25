# Üçüncü Taraf Lisansları — İlk 72

Bu dosya, İlk 72'nin tarayıcıya dağıttığı üçüncü taraf kodunun lisans bildirimlerini ve doğrudan
geliştirme bağımlılıklarının lisanslarını içerir. Dağıtılan kod, paket lisansları ve lisans
bildirimleri **2026-11-25** tarihinde kilitli bağımlılıklar ve derleme çıktısı üzerinden kontrol
edilmiştir. Derleme bu dosyayı `LICENSE` ve `LICENSE-CONTENT` ile birlikte çıktı dizinine ekler.

> Tarayıcıya dağıtılan üçüncü taraf kodu MIT lisanslıdır. Erişilebilirlik testinde kullanılan
> `@axe-core/playwright` MPL-2.0 lisanslıdır. Aşağıda doğrudan geliştirme bağımlılıkları ile
> şartnamedeki listenin dışında kalan dolaylı geliştirme bağımlılıkları gösterilir.

## 1. Tarayıcıya dağıtılan kod

| Paket veya bileşen | Sürüm | Lisans (SPDX) | Kaynak |
|---|---|---|---|
| `preact` | 11.2.0 | MIT | <https://github.com/preactjs/preact> |
| `qrcode-generator` | 2.0.4 | MIT | <https://github.com/kazuhikoarase/qrcode-generator> |
| `workbox-core`, `workbox-precaching`, `workbox-routing`, `workbox-strategies`, `workbox-window` | 7.4.1 | MIT | <https://github.com/GoogleChrome/workbox/blob/v7.4.1/LICENSE> |
| Vite'ın modül ön yükleme ve dinamik içe aktarma yardımcıları | 8.3.8 | MIT | <https://github.com/vitejs/vite/blob/v8.3.8/LICENSE> |

Workbox kodu hizmet çalışanının yanında, `workbox-window` ise uygulamanın tarayıcı paketinde
dağıtılır. Vite, uygulama koduna tarayıcıda çalışan ön yükleme yardımcılarını ekler. Tam
bildirimler §4'tedir.

## 2. Geliştirme bağımlılıkları

Bu paketler geliştirme, test ve derleme sırasında kullanılır. Derleme araçlarından tarayıcıya
dağıtılan bileşenler §1'de gösterilmiştir.

| Paket | Sürüm | Lisans (SPDX) | Kaynak |
|---|---|---|---|
| `typescript` | 7.0.2 | Apache-2.0 | <https://github.com/microsoft/TypeScript> |
| `vite` | 8.3.8 | MIT | <https://github.com/vitejs/vite> |
| `@preact/preset-vite` | 2.10.6 | MIT | <https://github.com/preactjs/preset-vite> |
| `vite-plugin-pwa` | 2.0.0 | MIT | <https://github.com/vite-pwa/vite-plugin-pwa> |
| `vitest` | 5.1.1 | MIT | <https://github.com/vitest-dev/vitest> |
| `@vitest/coverage-v8` | 5.1.1 | MIT | <https://github.com/vitest-dev/vitest> |
| `@testing-library/preact` | 3.2.6 | MIT | <https://github.com/testing-library/preact-testing-library> |
| `happy-dom` | 21.0.4 | MIT | <https://github.com/capricorn86/happy-dom> |
| `fake-indexeddb` | 6.2.8 | Apache-2.0 | <https://github.com/dumbmatter/fakeIndexedDB> |
| `@playwright/test` | 1.65.1 | Apache-2.0 | <https://github.com/microsoft/playwright> |
| `@axe-core/playwright` | 4.14.0 | **MPL-2.0** | <https://github.com/dequelabs/axe-core-npm> |
| `@biomejs/biome` | 2.6.8 | MIT OR Apache-2.0 (MIT seçildi) | <https://github.com/biomejs/biome> |
| `@types/node` | 26.6.6 | MIT | <https://github.com/DefinitelyTyped/DefinitelyTyped> |

## 3. Uyarılar ve lisans dışı kalanlar

### 3.1 `@axe-core/playwright` — MPL-2.0 (doğrudan bağımlılık)

- **Sorun:** Şartname §0 kural 6 ve §6, yalnızca MIT, ISC, BSD ve Apache-2.0 lisanslı
  bağımlılıklara izin verir. `@axe-core/playwright@4.14.0` paketinin `license` alanı
  `MPL-2.0`'dir (Mozilla Public License 2.0, dosya düzeyinde copyleft).
- **Durum:** Paket, §6/§18.7'de erişilebilirlik testleri için adıyla istenen araçtır. Bu nedenle
  **değiştirilmedi**; karar Lead'e/sahibine bırakıldı. Seçenekler: (a) MPL-2.0'ı geliştirme
  bağımlılığı için kabul etmek ve bunu `docs/kararlar.md` içine ayrı bir karar olarak yazmak;
  (b) aynı işi yapan izinli lisanslı bir araç bulmak; (c) erişilebilirlik testini elle kontrol
  listesine indirmek (axe sıfır ihlal ölçütünden feragat anlamına gelir).
- **Etki:** Paket yalnızca test aracıdır, üretim paketine girmez. MPL-2.0, dosya düzeyinde
  copyleft uygular. MPL kapsamındaki yazılım dağıtılırsa lisansın kaynak kodu erişimi ve
  bildirim yükümlülükleri ayrıca değerlendirilir.

### 3.2 Transitive paketler (doğrudan bağımlılık değil)

Hoisted `node_modules` taramasında izinli liste dışında kalan, **geliştirme araçlarına ait**
transitive paketler:

| Paket | Sürüm | Lisans | Gelme yolu | Üretim çıktısında? |
|---|---|---|---|---|
| `axe-core` | 4.14.1 | MPL-2.0 | `@axe-core/playwright` | Hayır (test) |
| `lightningcss` | 1.33.0 | MPL-2.0 | `vite` | Hayır (derleme aracı) |
| `lightningcss-win32-x64-msvc` | 1.33.0 | MPL-2.0 | `lightningcss` (platform ikilisi) | Hayır |
| `glob` | 11.1.0 | BlueOak-1.0.0 | `vite-plugin-pwa` → `workbox-build` | Hayır |
| `graceful-fs` | 4.2.12 | BlueOak-1.0.0 | `glob` / `path-scurry` | Hayır |
| `jackspeak` | 4.2.3 | BlueOak-1.0.0 | `glob` | Hayır |
| `minipass` | 7.1.3 | BlueOak-1.0.0 | `glob` | Hayır |
| `package-json-from-dist` | 1.0.1 | BlueOak-1.0.0 | `glob` | Hayır |
| `path-scurry` | 2.0.2 | BlueOak-1.0.0 | `glob` | Hayır |
| `caniuse-lite` | 1.0.30001826 | CC-BY-4.0 | `vite` / `workbox` | Hayır (veri dosyası) |

BlueOak-1.0.0 izinli bir lisans modelidir ancak şartnamenin saydığı dört lisanstan biri değildir;
CC-BY-4.0 ise veri dosyası içindir ve atıf gerektirir. Bu paketlerin hiçbiri uygulama paketine
girmediği için üretim dağıtımı etkilemez; yine de bağımlılık ağacı büyüdükçe izlenmelidir.
`type-fest` (MIT OR CC0-1.0) ve `@biomejs/cli-*` (MIT OR Apache-2.0) izinli listedeki
seçeneklerden biriyle uyumludur.

### 3.3 `qrcode-generator` lisans dosyası

`qrcode-generator@2.0.4` paketinin `package.json` dosyası MIT lisansını, dağıtılan `dist/qrcode.mjs`
dosyası ise lisans ile telif sahibini bildirir. Tam lisans metni projenin kaynak deposundadır.
[qrcode-generator lisansı](https://github.com/kazuhikoarase/qrcode-generator/blob/master/LICENSE)

## 4. Çalışma zamanı lisans metinleri

### 4.1 `preact` — MIT

```
The MIT License (MIT)

Copyright (c) 2015-present Jason Miller

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### 4.2 `qrcode-generator` — MIT

```
MIT License

Copyright (c) 2009 Kazuhiko Arase

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

`qrcode-generator` kaynak dosyasındaki bildirime göre “QR Code”, DENSO WAVE INCORPORATED'ın tescilli
markasıdır. Marka hakları saklıdır.

### 4.3 Workbox — MIT

```
Copyright 2018 Google LLC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

### 4.4 Vite tarayıcı yardımcıları — MIT

```
MIT License

Copyright (c) 2019-present, VoidZero Inc. and Vite contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 5. Geliştirme lisans metinleri nerede?

Geliştirme bağımlılıklarının tam lisans metinleri kurulumdan sonra
`node_modules/<paket>/LICENSE*` dosyalarında bulunur (ör. `node_modules/typescript/LICENSE`).
Kanonik metinler:

- MIT: <https://opensource.org/license/mit>
- Apache-2.0: <https://www.apache.org/licenses/LICENSE-2.0>
- BSD: <https://opensource.org/license/bsd-3-clause>
- ISC: <https://opensource.org/license/isc>
- MPL-2.0: <https://www.mozilla.org/MPL/2.0/>
- BlueOak-1.0.0: <https://blueoakcouncil.org/license/1.0.0>
- CC BY 4.0: <https://creativecommons.org/licenses/by/4.0/>

## 6. Yeniden üretme

Lisans denetimini yeniden çalıştırmak için (PowerShell):

```powershell
$paks = @(
  'preact','qrcode-generator','typescript','vite','@preact/preset-vite','vite-plugin-pwa',
  'vitest','@vitest/coverage-v8','@testing-library/preact','happy-dom','fake-indexeddb',
  '@playwright/test','@axe-core/playwright','@biomejs/biome','@types/node',
  'workbox-core','workbox-precaching','workbox-routing','workbox-strategies','workbox-window'
)
foreach ($p in $paks) {
  $j = Get-Content "node_modules/$p/package.json" -Raw | ConvertFrom-Json
  "{0}@{1}: {2}" -f $p, $j.version, $j.license
}
```

Bağımlılık eklendiğinde veya sürüm yükseltildiğinde paket lisanslarını ve üretim çıktısına giren
kodu karşılaştırın. Dağıtılan bileşenler için telif ve lisans bildirimlerini bu dosyada güncelleyin.

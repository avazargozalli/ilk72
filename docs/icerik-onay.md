# İçerik Onay Süreci — İlk 72

Bu belge, şartnamenin **§13.4 onay kapısını** adım adım anlatır: rehber, çanta ve belge
metinlerinin resmî kaynaklarıyla karşılaştırılıp `onayli` durumuna nasıl geçirileceğini, kimin
onaylayabileceğini ve incelemenin ne zaman yenileneceğini tanımlar.

İlgili dosyalar: `src/content/registry.ts` (maddeler), `src/content/sources.ts` (kaynaklar),
`src/content/check.ts` (kapı kuralları), `docs/sartname.md` §13.1–§13.4.
İlgili komutlar: `pnpm run content:check`, `pnpm run build:prod`.

> **Temel kural:** Kaynağında karşılığı bulunamayan madde **düzeltilmez, silinir** (şartname
> §13.3). Resmî sayfada karşılığı olmayan bir tavsiye, iyi niyetle bile olsa yayımlanamaz.

## 1. Onaylayan kişinin nitelikleri

Onaylayan kişi aşağıdaki nitelikleri taşımalıdır:

- **Afet ve acil durum alanında bilgi sahibi olmak.** Tercihen AFAD afet eğitmeni, AFAD il
  müdürlüğünde görevli uzman ya da afet eğitimi vermeye yetkili bir eğitmen. Bu mümkün değilse,
  afet yönetimi/acil durum alanında eğitim almış ve resmî kaynakları okuyabilen bir uzman.
- **Resmî kaynak okuryazarlığı.** AFAD, İçişleri Bakanlığı, Sağlık Bakanlığı, e-Devlet ve ilgili
  mevzuat sayfalarını tarayıcıda açıp metni karşılaştırabilmek; sayfanın güncel sürümünü ayırt
  edebilmek.
- **Türkçe yeterliliği.** Metnin anlamını, tonunu ve güvenlik uyarılarını değerlendirebilmek;
  sade ve korkutucu olmayan dil kuralına (şartname §15) uygunluğu denetleyebilmek.
- **Bağımsızlık ve çıkar çatışması olmaması.** Ticari bir ürün, marka, sigorta şirketi veya
  hizmet sağlayıcısı adına hareket etmemek (İ11). Marka adıyla ürün önerisi yapmayacak olmak.
- **Hesap verebilirlik.** Adı ve niteliği `reviewedBy` alanına yazılacak; her onay ayrı bir commit
  olarak kayda geçecek.
- **İkinci göz (önerilir).** Sağlık bilgisi, engellilik ve çocuk güvenliği ile ilgili maddelerde
  mümkünse ikinci bir kişi (ör. sağlık profesyoneli, özel eğitim uzmanı, engelli birey temsilcisi)
  görüşü alınır. Bu kişi de `reviewedBy` alanında anılır.

Onaylayan kişi, metni yazan kişiyle aynı olabilir; ancak metnin kaynağıyla karşılaştırılması
**ayrı bir adımdır** ve körlemesine "onayla" işlemi değildir.

## 2. Onay kapısının kuralları (§13.4)

`pnpm run content:check` aşağıdakileri denetler:

1. Her maddenin **en az bir kaynağı** vardır.
2. Kaynak anahtarları `sources.ts` içinde **kayıtlıdır**.
3. Kaynak adresleri **`https`** ile başlar ve **izinli alan adlarındadır** (aşağıdaki liste).
4. Metin boş olamaz ve en fazla **220 karakterdir**.
5. `onayli` maddelerde **`reviewedBy` ve `reviewedAt` doludur**. Kaynak erişim ve inceleme
   tarihleri Türkiye takvimine göre geçerli bir gün olmalıdır. Gelecek tarihler reddedilir.
6. `onayli` hiçbir madde **doğrulanmamış** kaynak anahtarı taşımaz (`verified: false` ya da
   `url: null` olan kaynak).
7. Madde ve kaynak **kimlikleri benzersizdir**.

Ek kapılar:

- **`build:prod`**: `taslak` madde kaldıysa **başarısız olur** ve onay bekleyen maddeleri tek tek
  listeler. Yayın bu komut geçmeden yapılamaz.
- **`build` (geliştirme)**: taslaklara izin verir; her sayfada "TASLAK SÜRÜM — içerik
  onaylanmamıştır" şeridi gösterilir.
- **12 / 18 ay kuralı**: `reviewedAt` üzerinden 12 ay geçen maddeler için `content:check` **uyarı**
  verir; 18 ay geçen maddeler `build:prod`'u **başarısız** kılar.
- **İzinli alan adları:** `afad.gov.tr`, `hazirim.gov.tr`, `turkiye.gov.tr`, `112.gov.tr`, `icisleri.gov.tr`,
  `saglik.gov.tr`, `aile.gov.tr`, `dask.gov.tr`, `kizilay.org.tr`, `mevzuat.gov.tr`,
  `resmigazete.gov.tr`, `kvkk.gov.tr`, `mebakub.meb.gov.tr` (ve alt alan adları).

## Uzman incelemesine hazırlanan kaynaklar

İçerik sürümü 3’te 83 maddenin kimlikleri korunarak plan, çanta ve deprem rehberi kaynakları güncellendi.
Madde metinlerinin uzman incelemesi ve onay kayıtları aşağıdaki süreçte tamamlanır.

- `P-01`–`P-02` ve Bursa İl AFAD’a dayanan `H` maddeleri için aile planı ve yapısal olmayan riskler bölümlerini karşılaştırın. [Bursa İl AFAD — Afete Hazır Aile](https://bursa.afad.gov.tr/afete-hazir-aile)
- `P-03`–`P-05`, `P-08`–`P-11`, hane çantası ve yardımcı cihaz maddeleri için plan, çanta ve özel ihtiyaç bölümlerine bakın. Kitapta geçen tarihsel acil numaralar yerine uygulamada güncel tek acil çağrı numarası olan 112 kullanılır. [Güvenli Yaşam 1 Eğitimi](https://cankiri.afad.gov.tr/kurumlar/cankiri.afad/dOKUMANLAR/Guvenli_Yasam_Klavuzu/gy_1_egitim_kitapcigi.pdf), [112 Acil Çağrı Merkezi](https://www.112.gov.tr/112-acm-projesi)
- Bebek ihtiyaçları, son kullanma tarihleri, araç ve iş yeri çantası ile tesisatın yerini bilme maddeleri için 65–67. sayfalara bakın. Evcil hayvan maddelerinde AFAD’ın ayrı rehberini açın. [MEB — Okul Tabanlı Afet Eğitimi, Kitap 1](https://mebakub.meb.gov.tr/eskisite/wp-content/uploads/2024/03/okul-tabanli-afet-egitimi_kitap_1.pdf), [AFAD Hazırım — Evcil Hayvanlarınızı Afete Hazırlayın](https://hazirim.gov.tr/tr/ozel-icerikler/evcil-hayvanlar-icin)
- Deprem anı ve sonrası kartları için Hazırım rehberini, `A-02` tekerlekli sandalye uyarlaması için AFAD’ın ilgili metnini ve `S-03` vana ve şalter koşulu için il müdürlüğünün duyurusunu karşılaştırın. [AFAD Hazırım — Deprem](https://hazirim.gov.tr/tr/afetler/deprem), [AFAD — Deprem önlemleri](https://afad.gov.tr/deprem-oncesi-ani-ve-sonrasi-alabileceginiz-onlemleri-biliyor-musunuz), [Bartın İl AFAD — Elazığ depremi](https://bartin.afad.gov.tr/elazigdaki-deprem-sonrasi-mudahale-ve-iyilestirme-calismalari)
- `P-12` konuma ilişkin deprem tehlikesi ile yapının dayanıklılık değerlendirmesini ayrı ele alır. `O-07` için sigortanın kapsam içi ve kapsam dışı bina türlerini kontrol edin. [AFAD — Türkiye Deprem Tehlike Haritası](https://afad.gov.tr/turkiye-deprem-tehlike-haritasi), [DASK — Teminat ve Kapsamı](https://www.dask.gov.tr/tr/teminat-ve-kapsami)

## 3. Adım adım onay

Aşağıdaki adımları her madde için ayrı ayrı uygulayın. **Bir commit'te birden fazla maddeyi
onaylamayın**; onaylar izlenebilir olmalıdır.

### 3.1 Hazırlık

1. Depoyu ve araç zincirini hazırlayın: `pnpm install --frozen-lockfile`.
2. `src/content/registry.ts` dosyasında onaylanacak maddeyi bulun; `id`, `text`, `sources`
   alanlarını not edin.
3. Maddenin kaynak anahtarlarını `src/content/sources.ts` içinde bulun; kaynağın `url`,
   `accessed` ve `verified` alanlarına bakın.
4. `verified: false` ya da `url: null` olan bir kaynak varsa o madde **onaylanamaz**. Önce kaynağın
   resmî adresini bulup `sources.ts` içinde güncelleyin; adres bulunamıyorsa maddeyi silin.

### 3.2 Kaynağı açın ve karşılaştırın

5. Kaynak adresini **tarayıcıda** açın. AFAD sayfaları otomatik erişimi engelleyebildiği için bu
   adım insan tarafından yapılmalıdır; betik/otomatik çekme kullanılmaz.
6. Sayfanın **güncel** sürümünü gördüğünüzü doğrulayın (sayfa başlığı, tarih, içerik). Şüphede
   kalırsanız kurumun ana sayfasından ilgili yayına gidin.
7. Madde metnini kaynaktaki tavsiyeyle **anlam düzeyinde** karşılaştırın:
   - Metin kaynakta karşılığı olan bir tavsiyeyi mi anlatıyor?
   - Kaynakta olmayan bir yöntem, doz, süre, marka ya da teknik ayrıntı eklenmiş mi?
   - Metin kaynağın anlamını aşırı genelleştiriyor ya da bağlamından koparıyor mu?
   - Tıbbi/teknik talimat, marka adı, korkutucu dil veya "güvendesiniz" türü bir ifade var mı?
     (İ7, İ9, İ11)
8. Karar verin:
   - **Uygun:** madde kaynakla uyumlu.
   - **Düzeltilmeli:** anlamı kaynakla uyumlu hâle getirin; metni kendi cümlelerinizle yeniden
     yazın, 220 karakter sınırını koruyun.
   - **Silinmeli:** kaynakta karşılığı yoksa ya da güvenli biçimde ifade edilemiyorsa maddeyi
     silin. Şüpheli maddeyi "düzeltip" yayımlamayın.

### 3.3 Kaydı güncelleyin

9. `src/content/registry.ts` içinde maddeyi güncelleyin:
   - `status: 'onayli'`
   - `reviewedBy`: onaylayan kişinin adı ve niteliği — ör.
     `"Ad Soyad (AFAD afet eğitmeni)"`
   - `reviewedAt`: karşılaştırmanın yapıldığı tarih — **`YYYY-AA-GG`** (ör. `2026-11-25`).
     Geçersiz tarih `content:check` hatası verir.
10. İlgili kaynağın `accessed` alanını, sayfayı gerçekten kontrol ettiğiniz tarihle güncelleyin
    (aynı kaynağı kullanan başka maddeler de bu tarihten yararlanır).
11. Metni değiştirdiyseniz `CONTENT_VERSION` değerini artırın (`src/content/registry.ts`);
    bu, "Hakkında" sayfasında görünen içerik sürümüdür.
12. Değişikliğin gerekçesini commit mesajına yazın: ör.
    `içerik(P-04): kaynak güncel sayfayla karşılaştırıldı, onaylandı`.

### 3.4 Kapıları çalıştırın

13. `pnpm run content:check` — hata yoksa devam edin. Uyarılar (12 ayı geçen inceleme,
    doğrulanmamış kaynak kullanımı) not edilir.
14. `pnpm run build:prod` — bu aşamada **diğer maddeler hâlâ taslak olduğu için başarısız olması
    beklenir**. Çıktıda sizin onayladığınız maddenin **artık hata listesinde olmadığını** doğrulayın.
15. Bütün maddeler onaylandığında `pnpm run build:prod` geçer; bu, yayın öncesi zorunlu kapıdır.
16. Onayı bu belgedeki **Onay kaydı** tablosuna ekleyin (tarih, madde, onaylayan, kaynak,
    commit).

## 4. Yıllık gözden geçirme takvimi

Resmî tavsiyeler değişebilir; bu yüzden inceleme yenilenir (şartname §13.4-4):

| Zaman | Yapılacak | Sonuç |
|---|---|---|
| **Her yıl Ocak ayının ilk iki haftası** | Bütün `onayli` maddelerin kaynakları yeniden açılır; metin karşılaştırılır; `reviewedAt` yenilenir | 12 ay uyarısı sıfırlanır |
| **Büyük bir afetten sonra en geç 30 gün içinde** | Afetle ilgili maddeler (özellikle deprem öncesi/anı/sonrası) öncelikli olarak gözden geçirilir | Değişen tavsiyeler güncellenir |
| **Resmî kaynak sayfası değiştiğinde** | İlgili kaynağa bağlı bütün maddeler karşılaştırılır | Gerekiyorsa metin güncellenir, `CONTENT_VERSION` artırılır |
| **`reviewedAt` üzerinden 12 ay geçince** | `content:check` uyarı verir; inceleme yenilenene kadar yeni sürüm yayımlanmamalıdır | Uyarı |
| **`reviewedAt` üzerinden 18 ay geçince** | `build:prod` başarısız olur; madde yayımlanamaz | Zorunlu yenileme |

Yıllık gözden geçirmeyi yapan kişi, onaylayan kişiyle aynı nitelikleri taşımalıdır. Gözden geçirme
sonucu (değişiklik yok / güncellendi / silindi) commit mesajında ve Onay kaydı tablosunda belirtilir.

## 5. `reviewedBy` ve `reviewedAt` doldurma adımları (özet)

1. Madde için doğru kaynağı açın ve karşılaştırmayı yapın (bkz. §3.2).
2. `reviewedBy` alanına **ad soyad + nitelik** yazın: `"Ad Soyad (nitelik)"`. Takma ad veya
   kurum adı tek başına yeterli değildir.
3. `reviewedAt` alanına **karşılaştırma gününü** `YYYY-AA-GG` biçiminde yazın. Gelecek tarih
   kullanmayın; tarih, gerçekten sayfayı açtığınız gün olmalıdır.
4. `status` alanını `'onayli'` yapın.
5. Kaynağın `accessed` alanını aynı günle güncelleyin.
6. `pnpm run content:check` ve `pnpm run build:prod` çalıştırın; hata varsa düzeltin.
7. Değişikliği tek maddelik bir commit olarak gönderin; bu belgedeki tabloya kaydedin.

## 6. Hata bildirimi ve düzeltme

- Rehber kartlarındaki **"Hata bildir"** bağlantısı, depodaki "Yanlış veya eskimiş içerik" sorun
  şablonuna gider; şablonda **resmî kaynak adresi zorunludur**.
- Künye sayfasındaki `gozelliazer@gmail.com` üzerinden de bildirim
  yapılabilir.
- Bildirilen hata doğrulanırsa:
  - Metin düzeltilir, `CONTENT_VERSION` artırılır ve gerekliyse `reviewedAt` yenilenir.
  - Düzeltme, kaynağıyla birlikte commit edilir; acele durumlarda yayın geri çekilebilir.
- Güvenlik açıkları bu sürecin dışındadır; `SECURITY.md` izlenir.

## 7. Onay kaydı

Her onay ayrı satır. Bu tablo, `docs/hukuki-inceleme.md` ve `CHANGELOG.md` ile birlikte yayın
kanıtıdır.

| Tarih | Madde | Onaylayan (nitelik) | Kaynak | Commit / not |
|---|---|---|---|---|
| _(YYYY-AA-GG)_ | _(ör. P-01)_ | _(Ad Soyad — nitelik)_ | _(K-AILE)_ | _(commit özeti)_ |

## 8. Sık yapılan hatalar

- Kaynağı açmadan `onayli` yapmak; yalnızca sayfa başlığını görmek yeterli değildir.
- Kaynağı bulunamayan maddeyi silmek yerine "düzeltmeye" çalışmak (§13.3: silinir).
- Aynı commit'te onlarca maddeyi onaylamak; izlenebilirlik kaybolur.
- `reviewedAt` alanına bugünün tarihini otomatik yazmak; tarih gerçek karşılaştırma günü olmalıdır.
- `reviewedBy` alanına yalnızca "AFAD" yazmak; kişi ve nitelik gerekir.
- Kaynağı doğrulanmamış maddeyi onaylamak; `content:check` bunu reddeder.
- Metni 220 karakteri aşacak şekilde "zenginleştirmek"; sade ve kısa tutulur.
- Yıllık gözden geçirmeyi atlamak; 18 aydan sonra üretim derlemesi durur.

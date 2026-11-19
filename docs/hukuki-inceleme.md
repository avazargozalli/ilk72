# Hukuki İnceleme — İlk 72

> **Şablon.** Bu dosya, yayın öncesi zorunlu hukuki incelemenin kaydıdır (şartname §4.4, §19,
> §20). İncelemeyi yapan avukat tarafından doldurulur. Dosya doldurulmadan ve aşağıdaki
> **Onay tarihi** alanı yazılmadan `v*` etiketi atılmaz; `pages.yml` iş akışı bu alan boşken
> yayın yapmaz.
>
> Bu dosya hukuki görüşün kendisi değil, görüşün kaydı ve izlenebilirliğidir. Görüşün aslı
> (imzalı PDF vb.) gerekiyorsa ayrıca saklanır.

## 1. İnceleme bilgileri

| Alan | Değer |
|---|---|
| İnceleyen (ad soyad, unvan) | _(doldurulacak)_ |
| Baro sicil no / iletişim | _(doldurulacak)_ |
| İnceleme tarihi | _(YYYY-AA-GG)_ |
| İncelemenin kapsamı | _(aşağıdaki §2'ye göre)_ |
| Görüşme / iletişim biçimi | _(yazılı görüş, toplantı, e-posta…)_ |
| Projenin belge sürümü | 1.0 — 2026-11-19 (`docs/sartname.md`) |
| Bu kaydı dolduran | _(doldurulacak)_ |

## 2. İnceleme kapsamı

Avukatın en azından aşağıdaki belgeleri ve mevcut sürümü incelemesi beklenir:

- `docs/sartname.md` §4 (hukuki çerçeve ve §4.4 soruları), §13 (içerik kayıt sistemi ve onay
  kapısı), §14 (hukuki metin taslakları), §17 (güvenlik), §22 (bilinen sınırlar).
- `src/i18n/legal.ts` — gizlilik bildirimi, kullanım koşulları, künye, erişilebilirlik beyanı.
- `docs/icerik-onay.md` — içerik onay süreci ve onaylayan kişinin nitelikleri.
- `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `LICENSE`, `LICENSE-CONTENT`,
  `THIRD_PARTY_LICENSES.md`.
- Barındırma seçenekleri (`docs/sartname.md` §4.3) ve seçilen sağlayıcı
  (`{BARINDIRMA_SAGLAYICISI}`, yayın öncesi doldurulacak).

İncelemenin sınırı: bu dosya, afet/rehber içeriğinin doğruluğunun tıbbi veya teknik incelemesini
kapsamaz; o inceleme `docs/icerik-onay.md` sürecine aittir.

## 3. §4.4 soruları ve yanıtlar

Her sorunun altındaki **Yanıt** alanı avukat tarafından doldurulur. Yanıt yoksa soru kapanmış
sayılmaz.

**S1.** Proje sahibi, yalnızca kullanıcının cihazında tutulan plan verileri bakımından veri
sorumlusu sayılır mı? Sayılmıyorsa gizlilik bildirimindeki ifade yeterli mi?

**Yanıt:** _(doldurulacak)_

**S2.** Barındırma sağlayıcısının tuttuğu erişim günlükleri bakımından proje sahibinin sıfatı
nedir? Yurt dışı sağlayıcı kullanımı KVKK m.9 bakımından bir yükümlülük doğurur mu? Hangi
barındırma seçeneği önerilir?

**Yanıt:** _(doldurulacak)_

**S3.** Proje 5651 sayılı Kanun ve ilgili yönetmelik bakımından "ticari veya ekonomik amaçlı"
sayılır mı? Künye sayfasındaki bilgiler yeterli mi?

**Yanıt:** _(doldurulacak)_

**S4.** Bölüm 14.2'deki kullanım koşulları ve sorumluluk reddi metni TBK ve tüketici mevzuatı
bakımından uygun mu?

**Yanıt:** _(doldurulacak)_

**S5.** Rehber metinlerinde kurum adlarının kaynak olarak anılması ve resmî sayfalara bağlantı
verilmesi FSEK ve marka hukuku bakımından sorun doğurur mu?

**Yanıt:** _(doldurulacak)_

**S6.** e-Devlet hizmetine dış bağlantı verilmesi hizmetin kullanım koşullarına uygun mu?

**Yanıt:** _(doldurulacak)_

**S7.** Sağlık bilgisi alanları ve paylaşım özelliği, kullanıcı aile dışından birinin (bakıcı,
komşu) bilgisini girdiğinde KVKK m.28/1-a istisnası bakımından risk doğurur mu? Uyarı metinleri
yeterli mi?

**Yanıt:** _(doldurulacak)_

**S8.** İleride GitHub Sponsors gibi bir destek yolu açılırsa 2860 sayılı Kanun bakımından izin
gerekir mi?

**Yanıt:** _(doldurulacak)_

**S9.** "İlk 72" adı ve görsel kimlik marka araması bakımından kullanılabilir mi?

**Yanıt:** _(doldurulacak)_

**S10.** MIT ve CC BY 4.0 lisanslarının birlikte kullanımı ve garanti reddi maddeleri Türk
hukukunda nasıl değerlendirilir?

**Yanıt:** _(doldurulacak)_

## 4. İstenen değişiklikler

Avukatın istediği metin değişiklikleri buraya madde madde yazılır. Değişiklikler uygulandıkça
"Durum" sütunu güncellenir; uygulanmayan değişiklik gerekçesiyle birlikte açık kalır.

| # | İlgili yer (dosya / sayfa / soru) | İstenen değişiklik | Öncelik | Durum |
|---|---|---|---|---|
| 1 | _(ör. `src/i18n/legal.ts` gizlilik bildirimi)_ | _(doldurulacak)_ | _(yüksek/orta/düşük)_ | _(açık/uygulandı/uygulanmayacak + gerekçe)_ |
| 2 | | | | |

## 5. Avukat onayı

- **Görüş özeti:** _(doldurulacak)_
- **Koşullar / çekinceler:** _(doldurulacak)_
- **Onaylayan (ad soyad, unvan):** _(doldurulacak)_
- **Onay tarihi:**

## 6. Proje tarafı uygulama kaydı

- İstenen değişiklikler uygulandı mı? _(evet/hayır; açıklama)_
- Değişikliklerin uygulandığı sürüm / commit: _(doldurulacak)_
- Uygulayan: _(doldurulacak)_
- Uygulama tarihi: _(YYYY-AA-GG)_
- Yayın etiketi: _(v0.1.0 vb.; onaydan önce boş)_
- Not: `docs/kararlar.md` içindeki K-4 (`frame-ancestors` başlığının verilememesi) avukata ayrıca
  bildirilmelidir; bu bir hukuki uyum değil, barındırma kısıtıdır.

---

**İlgili belgeler:** `docs/sartname.md` §4.4 · `docs/icerik-onay.md` · `README.md` ·
`src/i18n/legal.ts` · `docs/kararlar.md` (K-4, K-6) · `SECURITY.md`

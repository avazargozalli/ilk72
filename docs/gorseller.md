# Proje görselleri

Ana sayfa için iki temsili görsel üretildi. Uygulama bunları kendi barındırıldığı adresten
WebP olarak yükler. Hizmet çalışanı dosyaları çevrimdışı kullanım için önbelleğe alır.

| Dosya | Kullanım | Boyut |
| --- | --- | --- |
| [aile-planlama.webp](../public/gorseller/aile-planlama.webp) | Ana ekrandaki aile planı görseli | 1080 × 810 px |
| [afet-cantasi.webp](../public/gorseller/afet-cantasi.webp) | Deprem rehberi bağlantısının yanındaki çanta görseli | 600 × 450 px |

README’deki ekran görüntüleri, ilk açılış bilgilendirmesi geçildikten sonra yerel geliştirme
derlemesinden Chromium ile alındı. Görüntülerde kullanıcı planı ya da kişisel veri bulunmaz.

## Üretim kaydı

Görseller İlk 72 için Codex'in yerleşik ImageGen aracıyla üretildi. Aşağıdaki istemler özgün
üretimde kullanıldı.

<details>
<summary>Aile planı görseli</summary>

```text
Use case: photorealistic-natural
Asset type: primary editorial photograph for a Turkish household disaster preparedness web app, right-hand image in a warm ivory and dark evergreen interface.
Primary request: A quiet, ordinary family moment making an emergency contact and meeting plan at a wood kitchen table in a contemporary Turkish apartment. The camera sees only two people's hands and modest sleeves, one hand placing a physical contact card on a clean notebook and the other holding a pencil. The papers contain a few faint blank form lines with absolutely no legible writing, signatures, numbers, maps, or graphics. One compact unbranded bag slightly out of focus in the back of the room. Natural, credible situation, domestic, low-stress.
Style: premium nonprofit editorial photography, natural warm afternoon window light, muted olive evergreen and oat, elegant realistic matte paper and timber, subtle photograph grain, full color, not stylized. View from a slightly elevated approximately 45-degree angle, interesting depth, hands and papers grouped in the middle of the frame, designed for a landscape 4:3 crop and usable center square crop. No text, flags, logos, trademarks, official uniforms, first-aid markings, distress, injuries, rubble, or watermark. Fill the entire canvas with the image.
```

</details>

<details>
<summary>Afet çantası görseli</summary>

```text
Use case: photorealistic-natural
Asset type: secondary editorial photograph for the household disaster preparation section of a Turkish public-interest web app.
Primary request: A calm still life of a simple olive fabric household preparedness backpack next to a few everyday objects on a warm wood entryway bench in a modest contemporary home. The open bag, generic flashlight and a neutral folded cloth supply context, with a soft out-of-focus window or doorway behind. The bag is evocative editorial imagery, not a checklist or exact equipment demonstration.
Style: premium nonprofit magazine photography, subtle grain, realistic home textures, soft directional daylight with oat and deep evergreen color relationship, artfully restrained composition. Landscape 4:3 center-weighted group so it can also be cropped to 3:2, no black studio background. No people, text, markings, decals, branding, hazard graphics, official emblems, distressed scene, injuries or watermark. Fill the entire canvas with the image.
```

</details>

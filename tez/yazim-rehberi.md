# Tez Yazım Rehberi

Bu dosya, tez bölümlerini yazarken uyulacak kuralları ve tavsiyeleri içerir.

---

## Referans Dosyaları Hakkında

| Dosya       | Açıklama                  | Güvenilirlik                           |
| ----------- | ------------------------- | -------------------------------------- |
| `rapor.md`  | Üniversite resmi şablonu  | ✅ %100 güvenilir                      |
| `ornek1.md` | Sınıf arkadaşı tez örneği | ⚠️ Genel fikir verir, %100 doğru değil |
| `ornek2.md` | Sınıf arkadaşı tez örneği | ⚠️ Genel fikir verir, %100 doğru değil |

> **Uyarı:** `ornek1.md` ve `ornek2.md` dosyaları referans amaçlı kullanılabilir ancak içerikleri %100 doğru değildir. Yapı ve yaklaşım için genel bir fikir verebilir, fakat birebir takip edilmemelidir. Resmi kurallar için `rapor.md` şablonu esas alınmalıdır.

---

## Genel Kurallar

### Dil ve Üslup

- Türkçe, formal akademik dil
- Teknik terimler ilk kullanımda açıklanacak
- Kısa, net cümleler tercih edilecek
- Gereksiz tekrardan kaçınılacak

### Kanıt Odaklı Yazım

- Her iddia kanıtlanacak (kod referansı, şema, ekran görüntüsü)
- "Bulgular" bölümünde sadece somut çıktılar yer alacak
- Ekran görüntüleri ilgili modül başlığı altında olacak

### Format (Üniversite Şablonu)

- Font: Times New Roman, 12pt
- Satır aralığı: 1.5
- Kenar boşlukları: Sol 4cm, diğerleri 2.5cm
- Şekil/tablo numaralandırma: Şekil 3.1, Çizelge 3.1 formatında

---

## Görsel Kullanımı

> Herhangi bir yerde çizelge, şekil veya resim kullanılması faydalı olacaksa, yazım sırasında belirtilecek.

### Görsel Türleri

- **Şekil:** Mimari diyagramlar, akış şemaları, grafikler
- **Çizelge:** Karşılaştırma tabloları, özellik listeleri
- **Resim:** Ekran görüntüleri (ekranlar.md rehberine göre)

### Numaralandırma

- Şekiller: `Şekil X.Y` (X = bölüm, Y = sıra)
- Çizelgeler: `Çizelge X.Y`
- Resimler: `Resim X.Y`

### Açıklama Formatı

```
Şekil 3.1. Genel sistem mimarisi diyagramı
```

- Açıklama şeklin/çizelgenin altında
- İlk harf büyük, sonunda nokta yok

---

## Bölüm Yazım Süreci

Her alt başlık için:

1. **Kaynak Toplama**

   - İlgili kod dosyalarını oku
   - İlgili dokümanları tara (docs/ klasörü)

2. **İçerik Çıkarma**

   - Ne yapıldı?
   - Neden bu şekilde yapıldı?
   - Alternatifler neydi?

3. **Akademik Yazım**

   - Formal dil kullan
   - Teknik terimleri açıkla
   - Kanıtlarla destekle

4. **Görsel Önerisi**
   - Bu başlık için şekil/çizelge/resim faydalı mı?
   - Evet ise türünü ve içeriğini belirt

---

## Bölüm Bazlı Notlar

### 1. GİRİŞ

- Max 3 sayfa (üniversite kuralı)
- Literatür en az 3 paragraf

### 2. KURAMSAL ÇERÇEVE

- Araştırma gerektiren bölüm
- Kaynak gösterimi zorunlu
- Projeye özel değil, genel kavramlar

### 3. SİSTEM TASARIMI VE TEKNOLOJİLER

- Teknoloji + kullanım birlikte (tekrar yok)
- Mimari diyagramlar önemli

### 4. UYGULAMA

- Ekran görüntüleri ağırlıklı
- Her modül için: açıklama + görsel
- `ekranlar.md` rehberini takip et

### 5. BULGULAR

- Sadece somut çıktılar
- OEE hesaplama örneği (gerçek verilerle)
- AI çıktısı örneği
- Ekran değerlendirmesi YOK (ölçüm yoksa)

### 6. SONUÇ VE ÖNERİLER

- Min 1.5 sayfa, min 5 paragraf (üniversite kuralı)
- Son paragraf: gelecek öneriler

---

## Kaynak Gösterimi

APA formatı kullanılacak:

```
[1] Yazar, A. (Yıl). Başlık. Dergi, Cilt(Sayı), sayfa.
```

Metin içinde:

```
... bu yaklaşım tercih edilmiştir [1].
```

---

## Kontrol Listesi (Her Bölüm İçin)

- [ ] Formal dil kullanıldı mı?
- [ ] Teknik terimler açıklandı mı?
- [ ] İddialar kanıtlandı mı?
- [ ] Görsel gerekli mi? Önerildi mi?
- [ ] Üniversite format kurallarına uygun mu?
- [ ] Gereksiz tekrar var mı?

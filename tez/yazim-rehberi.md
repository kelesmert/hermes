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
Resim 4.1. Giriş ekranı
Çizelge 2.1. Teknoloji karşılaştırması
```

- Açıklama görselin altında
- Numara sonrası nokta VAR (örn: `Şekil 3.1.`)
- Açıklama sonunda nokta YOK (örn: `...diyagramı`)
- İlk harf büyük

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
- Ekran değerlendirmesi YOK (ölçüm yoksa)
- Her alt madde için senaryo formatı:

```
**Girdi:** [Başlangıç durumu/verisi]
**İşlem:** [Sistemin yaptığı hesaplama/işlem]
**Çıktı:** [Sonuç/metrik]
**Görsel:** Resim X.Y / Şekil X.Y
```

Örnekler:

- 5.1: OEE hesaplama örneği (girdi: üretim verileri → işlem: A×P×Q → çıktı: %85)
- 5.2: Duruş analizi (girdi: 10 duruş kaydı → işlem: reason gruplama → çıktı: dağılım)
- 5.3: Simülasyon (girdi: boş DB → işlem: shift-sim → çıktı: 8 saat veri)
- 5.4: AI çıktısı (girdi: OEE verisi → işlem: LLM analizi → çıktı: insight)

### 6. SONUÇ VE ÖNERİLER

- Min 1.5 sayfa, min 5 paragraf (üniversite kuralı)
- Son paragraf: gelecek öneriler

---

## Kaynak Gösterimi

**Sistem:** Numaralı kaynak gösterimi (IEEE tarzı)

### Metin İçinde

Kaynak numarası köşeli parantez içinde verilir:

```
... bu yaklaşım tercih edilmiştir [1].
... literatürde belirtildiği gibi [2, 3].
... birçok çalışmada incelenmiştir [4-7].
```

**Kurallar:**

- Tek kaynak: `[1]`
- Birden fazla kaynak (ayrı): `[2, 5, 8]`
- Ardışık kaynaklar: `[4-7]`
- Nokta parantez dışında: `... belirtilmiştir [1].`

### Kaynakça Sayfasında

Kaynaklar metin içinde geçiş sırasına göre numaralandırılır:

**Makale:**

```
[1] Mirza S., Bakshi S.Z., "Introduction to MANET", International Research Journal of Engineering and Technology, Vol. 5, No. 1, pp. 17-20, 2018.
```

**Kitap:**

```
[2] McAdams W.H., "Heat Transmission", 2nd ed., McGraw Hill, New York, pp. 278-292, 1942.
```

**Tez:**

```
[3] Sarıca İ., "Yapay Sinir Ağı Kullanarak Farklı Kategoriler İle Süt İneklerinde Kızgınlık Tahmini", Yüksek Lisans Tezi, Muğla Sıtkı Koçman Üniversitesi Fen Bilimleri Enstitüsü, Muğla, pp. 40-65, 2020.
```

**Konferans:**

```
[4] Amin M.S., Rizvi S.T.H., Malik S., "Smart Wheelchair", in 2021 International Conference on Digital Futures (ICoDT2), pp. 1-6, 2021.
```

**Web Kaynağı:**

```
[5] MongoDB Inc., "MongoDB Documentation", https://docs.mongodb.com, Erişim tarihi: 15.01.2025.
```

---

## Kontrol Listesi (Her Bölüm İçin)

- [ ] Formal dil kullanıldı mı?
- [ ] Teknik terimler açıklandı mı?
- [ ] İddialar kanıtlandı mı?
- [ ] Görsel gerekli mi? Önerildi mi?
- [ ] Üniversite format kurallarına uygun mu?
- [ ] Gereksiz tekrar var mı?
- [ ] Kaynaklar numaralı sistemde [1] formatında mı?

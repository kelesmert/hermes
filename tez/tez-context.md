# Tez Yazım Context Dosyası

> **Bu dosya ne için?**  
> Yeni bir oturumda bu dosyayı paylaşarak tüm bağlamı aktarmak için.  
> Kullanım: "Bu dosyayı oku ve tez yazmaya devam edelim"

---

## 1. PROJE VE AMAÇ

### Proje Nedir?

- **Proje Adı:** Hermes MES (Manufacturing Execution System) MVP
- **Teknoloji:** Node.js/Express + React/Vite + MongoDB (Monorepo)
- **Konum:** `/home/kelesmert/Desktop/projects/hermes`

### Ne Yapıyoruz?

Bu proje için **lisans bitirme tezi (mühendislik projesi raporu)** yazıyoruz.

- **Üniversite:** Muğla Sıtkı Koçman Üniversitesi
- **Fakülte:** Teknoloji Fakültesi
- **Bölüm:** Bilişim Sistemleri Mühendisliği
- **Tür:** Lisans Mühendislik Projesi
- **Dil:** Türkçe (+ İngilizce Abstract)
- **Hedef Uzunluk:** ~60 sayfa (kesin limit yok, kanıt odaklı)

### Kullanıcının Beklentisi

- Tez bölümlerini **birlikte** yazacağız
- Her bölüm için projeden kaynak toplanacak, akademik dilde yazılacak
- Kod, doküman ve ekran görüntüleriyle desteklenecek

---

## 2. ÇALIŞMA METODOLOJİSİ

### Her Bölüm İçin Süreç

1. **Kaynak Toplama**

   - İlgili kod dosyalarını oku (backend/src, frontend/src)
   - İlgili dokümanları tara (docs/ klasörü)
   - Gerekirse kullanıcıya sor

2. **İçerik Çıkarma**

   - Ne yapıldı?
   - Neden bu şekilde yapıldı?
   - Alternatifler neydi?

3. **Akademik Yazım**

   - Türkçe, formal akademik dil
   - Teknik terimler ilk kullanımda açıklanacak
   - Kanıtlarla desteklenecek

4. **Görsel Önerisi**
   - Şekil/çizelge/resim faydalı mı?
   - Evet ise türünü ve içeriğini belirt

### Önemli Prensipler

- **Kanıt Odaklı:** Her iddia kanıtlanacak (kod, şema, ekran görüntüsü)
- **Tekrar Yok:** Aynı şey farklı bölümlerde anlatılmayacak
- **Ağırlık Sırası:** MES/OEE (A) + Mimari (B) > Gerçek zamanlı (C) >= AI (D)

---

## 3. ALINAN KARARLAR

### Yapısal Kararlar

| Karar                     | Açıklama                                               |
| ------------------------- | ------------------------------------------------------ |
| Bölüm 3 birleştirildi     | "Mimari" ve "Teknolojiler" tek bölümde (tekrar önleme) |
| Sayfa hedefi yok          | Her bölüm iddiasını kanıtlayacak kadar uzun            |
| Monitoring eklendi        | 4.2.3 olarak canlı izleme ekranları                    |
| Dashboard/Reports ayrıldı | 4.4.3 OEE Dashboard, 4.4.4 OEE Raporları               |
| Bulgular sadeleştirildi   | Subjektif UI değerlendirmesi çıkarıldı (ölçüm yok)     |

### Format Kararları

| Öğe                  | Değer                             |
| -------------------- | --------------------------------- |
| Font                 | Times New Roman, 12pt             |
| Satır aralığı        | 1.5                               |
| Kenar boşlukları     | Sol 4cm, diğerleri 2.5cm          |
| Şekil numaralandırma | Şekil 3.1, Çizelge 3.1 formatı    |
| Kaynak formatı       | Numaralı [1] sistemi (IEEE tarzı) |

### Dosya Organizasyonu

Her ana bölüm ayrı .md dosyasında:

```
tez/
├── bolum-yapisi.md      # Nihai yapı (referans)
├── ekranlar.md          # Ekran görüntüsü rehberi
├── yazim-rehberi.md     # Yazım kuralları
├── rules.md             # Kısa yazım notları (hızlı hatırlatma)
├── tez-context.md       # Bu dosya
├── 1-giris.md           # (yazılacak)
├── 2-kuramsal-cerceve.md
├── 3-sistem-tasarimi-ve-teknolojiler.md
├── 4-uygulama.md
├── 5-bulgular.md
├── 6-sonuc-ve-oneriler.md
```

---

## 4. REFERANS DOSYALARI

### tez/ Klasöründe

| Dosya              | İçerik                          | Güvenilirlik         |
| ------------------ | ------------------------------- | -------------------- |
| `bolum-yapisi.md`  | Tüm bölüm yapısı, alt başlıklar | ✅ Kesin referans    |
| `ekranlar.md`      | Hangi ekran hangi bölüme        | ✅ Kesin referans    |
| `yazim-rehberi.md` | Yazım kuralları, checklist      | ✅ Kesin referans    |
| `rapor.md`         | Üniversite resmi şablonu        | ✅ %100 güvenilir    |
| `ornek1.md`        | Sınıf arkadaşı örneği           | ⚠️ Genel fikir verir |
| `ornek2.md`        | Sınıf arkadaşı örneği           | ⚠️ Genel fikir verir |

### Proje Dokümanları (docs/)

- `docs/specs/oee-design.md` - OEE tasarım detayları
- `docs/specs/downtime-design-v2.md` - Duruş yönetimi tasarımı
- `docs/specs/sim-clock.md` - Simülasyon saati tasarımı
- `docs/analysis/system-analysis-report.md` - Sistem analizi
- `docs/meta/file-overview.md` - Dosya yapısı özeti

### Kod Yapısı

**Backend (Domain-Driven):**

```
backend/src/domains/
├── auth/          # Kimlik doğrulama
├── users/         # Kullanıcı yönetimi
├── access-control/# RBAC
├── machines/      # Makine yönetimi
├── oee/           # OEE hesaplama
├── board/         # Üretim panosu
├── parts/         # Parça yönetimi
├── production/    # Üretim takibi
├── downtime/      # Duruş yönetimi
├── simulations/   # Simülasyon sistemi
├── ai/            # AI entegrasyonu
```

**Frontend (Feature-Based):**

```
frontend/src/features/
├── auth/
├── users/          # Roller burada tab olarak (ayrı klasör yok)
├── machines/
├── monitoring/     # Canlı izleme (2sn polling)
├── oee/
├── board/
├── parts/
├── production/
├── downtime/
├── simulations/
├── ai/
├── dashboard/
```

**Önemli Route Bilgileri:**

| Route         | Sayfa                   | Not                                  |
| ------------- | ----------------------- | ------------------------------------ |
| `/`           | → `/dashboard` redirect | Index route                          |
| `/dashboard`  | Dashboard               | Supervisor odaklı operasyon görünümü |
| `/monitoring` | Monitoring              | Tek makine telemetry (2sn polling)   |
| `/users`      | Users + Roles           | Roller tab olarak, ayrı `/roles` yok |
| `/production` | Production              | `/job-orders` değil                  |
| `/ai`         | AI Hub                  | `/ai-hub` değil                      |

**RBAC Bilgileri:**

- 4 rol: master, supervisor, operator, viewer
- 15 permission (`backend/src/constants/permissions.js`)

**Script Kullanımı:**

```bash
cd backend && npm run seed
cd backend && npm run shift:sim
```

---

## 5. TEZ BÖLÜM YAPISI (ÖZET)

```
1. GİRİŞ
   1.1 Problem Tanımı
   1.2 Projenin Amacı ve Kapsamı
   1.3 Literatür Taraması
   1.4 Projenin Yapısı

2. KURAMSAL ÇERÇEVE
   2.1 Üretim Yönetim Sistemleri (MES, Endüstri 4.0, ISA-95)
   2.2 OEE (Kavram, Bileşenler, Hesaplama)
   2.3 Üretim Duruşları (Planlı/Plansız, Kategoriler)
   2.4 Yapay Zeka ve Üretim (AI, LLM)

3. SİSTEM TASARIMI VE TEKNOLOJİLER
   3.1 Genel Sistem Mimarisi
   3.2 Backend Tasarımı ve Teknolojileri
   3.3 Frontend Tasarımı ve Teknolojileri
   3.4 Veritabanı Tasarımı

4. UYGULAMA
   4.1 Kullanıcı ve Erişim Yönetimi Modülü
   4.2 Makine Yönetimi (+ Monitoring)
   4.3 Üretim Takibi (+ Board)
   4.4 OEE Hesaplama ve Raporlama (Dashboard + Reports)
   4.5 Duruş Yönetimi
   4.6 Simülasyon Sistemi
   4.7 AI Destekli Analiz

5. BULGULAR
   5.1 OEE Metrikleri ve Örnek Hesaplamalar
   5.2 Duruş Analizi Örneği
   5.3 Simülasyon Çıktıları
   5.4 AI Modülü Çıktıları

6. SONUÇ VE ÖNERİLER
   6.1 Projenin Özeti
   6.2 Elde Edilen Kazanımlar
   6.3 Karşılaşılan Zorluklar
   6.4 Gelecek Geliştirme Önerileri
```

> Detaylı yapı için: `bolum-yapisi.md`  
> Ekran görüntüleri için: `ekranlar.md`

---

## 6. İLERLEME DURUMU

### Tamamlanan Hazırlık Adımları

- [x] Üniversite şablonu analiz edildi (rapor.md)
- [x] Örnek tezler incelendi (ornek1.md, ornek2.md)
- [x] Nihai bölüm yapısı belirlendi
- [x] bolum-yapisi.md oluşturuldu
- [x] ekranlar.md oluşturuldu ve yapıyla eşleştirildi
- [x] yazim-rehberi.md oluşturuldu
- [x] tez-context.md oluşturuldu (bu dosya)

### Bölüm Yazım Durumu

| Bölüm               | Durum       | Dosya |
| ------------------- | ----------- | ----- |
| 1. Giriş            | ⏳ Bekliyor | -     |
| 2. Kuramsal Çerçeve | ⏳ Bekliyor | -     |
| 3. Sistem Tasarımı  | ⏳ Bekliyor | -     |
| 4. Uygulama         | ✅ Başladı  | `tez/4-uygulama.md` |
| 5. Bulgular         | ⏳ Bekliyor | -     |
| 6. Sonuç            | ⏳ Bekliyor | -     |

### Sonraki Adım

Mevcut akış: **4. Uygulama** bölümünden ilerleniyor. Bir sonraki adım olarak `ekranlar.md` rehberine göre **4.2 Makine Yönetimi Modülü** yazılabilir.

---

## 7. YENİ OTURUMDA YAPILACAKLAR

1. Bu dosyayı (`tez-context.md`) paylaş
2. "Tez yazmaya devam ediyoruz" de
3. Gerekirse şu dosyaları da paylaş:
   - `bolum-yapisi.md` (yapı referansı)
   - `yazim-rehberi.md` (kurallar)
   - Üzerinde çalışılan bölüm dosyası (varsa)

---

## 8. SON GÜNCELLEME

**Tarih:** 2026-01-05  
**Durum:** Hazırlık tamamlandı, yazıma başlandı  
**Son İşlem:** `tez/4-uygulama.md` içinde 4.1 modülü yazıldı

# NİHAİ TEZ BÖLÜM YAPISI

**Proje:** Hermes MES (Manufacturing Execution System) MVP  
**Üniversite:** Muğla Sıtkı Koçman Üniversitesi - Teknoloji Fakültesi - Bilişim Sistemleri Mühendisliği  
**Tür:** Lisans Mühendislik Projesi  
**Dil:** Türkçe

---

## Ön Sayfalar (Romen Rakamı)

- Dış Kapak
- İç Kapak
- Kabul ve Onay Sayfası (I)
- Mühendislik Projesi Bildirimi (II)
- Özet + Anahtar Kelimeler (III)
- Abstract + Keywords (IV)
- Teşekkür (V)
- İçindekiler (VI-VII)
- Şekillerin Listesi (VIII)
- Tabloların Listesi (IX)
- Simgeler ve Kısaltmalar (X)

---

## Ana Metin (Arap Rakamı)

### 1. GİRİŞ

- 1.1 Problemin Tanımı ve Motivasyon
- 1.2 Projenin Amacı
- 1.3 Projenin Kapsamı
- 1.4 Literatür Taraması
- 1.5 Raporun Organizasyonu

---

### 2. KURAMSAL ÇERÇEVE

- 2.1 Üretim Yönetim Sistemleri
  - 2.1.1 MES (Manufacturing Execution System) Kavramı
  - 2.1.2 MES'in Endüstri 4.0 İçindeki Yeri
  - 2.1.3 MES Fonksiyonları ve Standartları (ISA-95)
- 2.2 OEE (Overall Equipment Effectiveness)
  - 2.2.1 OEE Kavramı ve Önemi
  - 2.2.2 OEE Bileşenleri (Availability, Performance, Quality)
  - 2.2.3 OEE Hesaplama Yöntemleri
- 2.3 Üretim Duruşları ve Yönetimi
  - 2.3.1 Planlı ve Plansız Duruşlar
  - 2.3.2 Duruş Kategorileri ve Analizi
- 2.4 Yapay Zeka ve Üretim Sistemleri
  - 2.4.1 Üretimde AI Uygulamaları
  - 2.4.2 Büyük Dil Modelleri (LLM) ve Endüstriyel Kullanım

---

### 3. SİSTEM TASARIMI VE TEKNOLOJİLER

- 3.1 Genel Sistem Mimarisi
  - 3.1.1 Monorepo Yapısı
  - 3.1.2 İstemci-Sunucu Mimarisi
- 3.2 Backend Tasarımı ve Teknolojileri
  - 3.2.1 Web/API Katmanı (Node.js, Express.js)
  - 3.2.2 Alan Modülleri ve API Organizasyonu (Domain tabanlı yapı, Router)
  - 3.2.3 Veri Katmanı (MongoDB, Mongoose)
  - 3.2.4 Kimlik Doğrulama ve Yetkilendirme (JWT, Guard yapısı)
- 3.3 Frontend Tasarımı ve Teknolojileri
  - 3.3.1 React ve Vite
  - 3.3.2 Feature-Based Yapı
  - 3.3.3 Material-UI (MUI)
  - 3.3.4 TanStack Query ve State Management
- 3.4 Veritabanı Tasarımı
  - 3.4.1 Veri Modelleri ve İlişkiler
  - 3.4.2 Veritabanı Şeması

---

### 4. UYGULAMA

- 4.1 Kullanıcı ve Erişim Yönetimi Modülü
  - 4.1.1 Kimlik Doğrulama Sistemi
  - 4.1.2 Rol Tabanlı Erişim Kontrolü (RBAC)
  - 4.1.3 Kullanıcı Yönetimi Ekranları
- 4.2 Makine Yönetimi Modülü
  - 4.2.1 Makine Tanımlama ve Durum Takibi
  - 4.2.2 Makine Listesi ve Detay Ekranları
  - 4.2.3 Canlı İzleme (Monitoring)
- 4.3 Üretim Takibi Modülü
  - 4.3.1 Parça Yönetimi
  - 4.3.2 İş Emirleri ve Üretim Kayıtları
  - 4.3.3 Üretim Panosu (Board)
- 4.4 OEE Hesaplama ve Raporlama Modülü
  - 4.4.1 OEE Hesaplama Algoritması
  - 4.4.2 Availability, Performance, Quality Hesaplamaları
  - 4.4.3 OEE Dashboard
  - 4.4.4 OEE Raporları ve Grafikler
- 4.5 Duruş Yönetimi Modülü
  - 4.5.1 Planlı Duruş Tanımlama
  - 4.5.2 Plansız Duruş Kayıt ve Takibi
  - 4.5.3 Duruş Analizi ve Raporlama
- 4.6 Simülasyon Sistemi
  - 4.6.1 Simülasyon Saati (Simulation Clock)
  - 4.6.2 Vardiya ve Üretim Simülasyonu
- 4.7 AI Destekli Analiz Modülü
  - 4.7.1 LLM Entegrasyonu
  - 4.7.2 OEE Insight Özelliği

---

### 5. BULGULAR

- 5.1 OEE Metrikleri ve Örnek Hesaplamalar
- 5.2 Duruş Analizi Örneği
- 5.3 Simülasyon Çıktıları
- 5.4 AI Modülü Çıktıları

---

### 6. SONUÇ VE ÖNERİLER

- 6.1 Projenin Özeti
- 6.2 Elde Edilen Kazanımlar
- 6.3 Karşılaşılan Zorluklar
- 6.4 Gelecek Geliştirme Önerileri

---

## Son Sayfalar

- KAYNAKLAR
- EKLER
  - EK-1: Kaynak Kod Linki (GitHub)
  - EK-2: Ek Ekran Görüntüleri
- ÖZGEÇMİŞ

---

## Notlar

- Sayfa hedeflemesi yok - her bölüm iddiasını kanıtlayacak kadar uzun olacak
- Ekran görüntüleri ilgili modül başlığı altında yer alacak
- Ağırlık: MES/OEE (A) + Mimari (B) > Gerçek zamanlı (C) >= AI (D)
- Her ana bölüm kendi başlık adıyla ayrı bir .md dosyasına sahip olacak (örn: `tez/
├── bolum-yapisi.md
├── 1-giris.md
├── 2-kuramsal-cerceve.md
├── 3-sistem-tasarimi-ve-teknolojiler.md
├── 4-uygulama.md
├── 5-bulgular.md
├── 6-sonuc-ve-oneriler.md`, vb.)
- O bölümle ilgili araştırma ve içerik ilgili dosyaya yazılacak

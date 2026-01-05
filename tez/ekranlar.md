# Tez Ekran Görüntüleri Rehberi

Bu dosya, tez raporunda kullanılacak ekran görüntülerinin hangi bölüm altında yer alacağını tanımlar.

> **Referans:** Bu dosya `bolum-yapisi.md` ile uyumludur.

---

## Bölüm Yapısı Özeti

| Bölüm | Konu |
|-------|------|
| 4.1 | Kullanıcı ve Erişim Yönetimi Modülü |
| 4.2 | Makine Yönetimi Modülü |
| 4.3 | Üretim Takibi Modülü |
| 4.4 | OEE Hesaplama ve Raporlama Modülü |
| 4.5 | Duruş Yönetimi Modülü |
| 4.6 | Simülasyon Sistemi |
| 4.7 | AI Destekli Analiz Modülü |

---

## 4.1 Kullanıcı ve Erişim Yönetimi Modülü

### 4.1.1 Kimlik Doğrulama Sistemi
- **Dosya:** `frontend/src/features/auth/pages/login.jsx`
- **Route:** `/login`
- **Ekran Görüntüleri:**
  1. Giriş formu (kullanıcı adı, şifre, giriş butonu)
- **Açıklama:** JWT tabanlı kimlik doğrulama

### 4.1.2 Rol Tabanlı Erişim Kontrolü (RBAC)
- **Dosya:** `frontend/src/features/users/pages/roles.jsx`
- **Route:** `/roles`
- **Ekran Görüntüleri:**
  1. Rol listesi ve izin matrisi
  2. Rol oluşturma/düzenleme modalı
- **Açıklama:** 4 rol (Master, Supervisor, Operator, Viewer), 16+ permission

### 4.1.3 Kullanıcı Yönetimi Ekranları
- **Dosya:** `frontend/src/features/users/pages/users.jsx`
- **Route:** `/users`
- **Ekran Görüntüleri:**
  1. Kullanıcı listesi tablosu
  2. Yeni kullanıcı ekleme modalı
  3. Kullanıcı düzenleme modalı
- **Açıklama:** Admin tarafından kullanıcı CRUD işlemleri

---

## 4.2 Makine Yönetimi Modülü

### 4.2.1 Makine Tanımlama ve Durum Takibi
- **Dosya:** `frontend/src/features/machines/pages/machines.jsx`
- **Route:** `/machines`
- **Ekran Görüntüleri:**
  1. Makine listesi tablosu (durum: running, idle, stopped)
  2. Makine ekleme modalı
  3. Makine düzenleme modalı
- **Açıklama:** Fabrika makine envanteri ve durum yönetimi

### 4.2.2 Makine Listesi ve Detay Ekranları
- **Dosya:** `frontend/src/features/machines/pages/machines.jsx`
- **Route:** `/machines`
- **Ekran Görüntüleri:**
  1. Makine detay görünümü (varsa)
  2. Makine filtreleme/arama
- **Açıklama:** Makine detaylı bilgi ekranları

### 4.2.3 Canlı İzleme (Monitoring)
- **Dosya:** `frontend/src/features/monitoring/pages/monitoring.jsx`
- **Route:** `/monitoring`
- **Ekran Görüntüleri:**
  1. Makine seçim dropdown ve kaynak seçimi (live/shift)
  2. Sinyal durumu kartı (son sinyal zamanı, timeout durumu)
  3. Telemetry grafikleri (sıcaklık, tork, enerji - Recharts)
  4. Canlı pencere vs vardiya penceresi karşılaştırması
- **Açıklama:** Gerçek zamanlı telemetry izleme, 2sn polling

---

## 4.3 Üretim Takibi Modülü

### 4.3.1 Parça Yönetimi
- **Dosya:** `frontend/src/features/parts/pages/parts.jsx`
- **Route:** `/parts`
- **Ekran Görüntüleri:**
  1. Parça listesi tablosu (kategori, birim, varsayılan makine)
  2. Yeni parça ekleme modalı
  3. Parça düzenleme modalı
- **Açıklama:** Üretilecek parça tanımları (fasteners, electronics, mechanical_plastics)

### 4.3.2 İş Emirleri ve Üretim Kayıtları
- **Dosya:** `frontend/src/features/production/pages/job-orders.jsx`
- **Route:** `/production` veya `/job-orders`
- **Ekran Görüntüleri:**
  1. İş emri listesi (durum renk kodları: pending, in_progress, paused, completed)
  2. Yeni iş emri oluşturma formu
  3. İş emri detay modalı (start/pause/resume/complete aksiyonları)
  4. Üretim girişi modalı (produce aksiyonu, good/defect count)
- **Açıklama:** JobOrder yaşam döngüsü yönetimi

### 4.3.3 Üretim Panosu (Board)
- **Dosya:** `frontend/src/features/dashboard/pages/dashboard.jsx`
- **Route:** `/dashboard` veya `/`
- **Ekran Görüntüleri:**
  1. Özet metrik kartları (aktif makine, toplam üretim, OEE)
  2. Makine durum kartları grid görünümü
  3. Kritik uyarılar bölümü
- **Açıklama:** Giriş sonrası ana özet ekranı, shift bazlı operasyon özeti

---

## 4.4 OEE Hesaplama ve Raporlama Modülü

### 4.4.1 OEE Hesaplama Algoritması
- **Açıklama:** Kod ve algoritma açıklaması (ekran görüntüsü yok, formül/şema olabilir)

### 4.4.2 Availability, Performance, Quality Hesaplamaları
- **Açıklama:** Kod ve algoritma açıklaması (ekran görüntüsü yok, formül/şema olabilir)

### 4.4.3 OEE Dashboard
- **Dosya:** `frontend/src/features/reports/pages/reports.jsx`
- **Route:** `/reports`
- **Ekran Görüntüleri:**
  1. OEE özet kartları (Availability, Performance, Quality, OEE yüzdesi)
  2. Kayıp dağılımı grafiği (top 3 reason)
- **Açıklama:** OEE metriklerinin özet görünümü

### 4.4.4 OEE Raporları ve Grafikler
- **Dosya:** `frontend/src/features/reports/pages/reports.jsx`
- **Route:** `/reports`
- **Ekran Görüntüleri:**
  1. Tarih/makine/kaynak filtre alanları
  2. OEE trend grafiği (Recharts)
  3. Detaylı filtreli rapor görünümü
- **Açıklama:** Verimlilik analizi ve detaylı raporlama

---

## 4.5 Duruş Yönetimi Modülü

### 4.5.1 Planlı Duruş Tanımlama
- **Dosya:** `frontend/src/features/downtime/` (planned downtime rules bölümü)
- **Route:** `/downtimes`
- **Ekran Görüntüleri:**
  1. Planlı duruş kuralları listesi (başlangıç/bitiş saati, tekrar)
  2. Yeni planlı duruş kuralı ekleme modalı
  3. Planlı duruş çalıştırma geçmişi (runs)
- **Açıklama:** Scheduler tabanlı planlı duruş yönetimi

### 4.5.2 Plansız Duruş Kayıt ve Takibi
- **Dosya:** `frontend/src/features/downtime/pages/downtimes.jsx`
- **Route:** `/downtimes`
- **Ekran Görüntüleri:**
  1. Açık duruşlar listesi (planlı/plansız ayrımı)
  2. Kapalı duruşlar geçmişi (filtreleme)
  3. Duruş sınıflandırma modalı (reason seçimi, 5dk edit kuralı)
  4. Duruş split işlemi modalı
- **Açıklama:** Plansız duruş yönetimi ve sınıflandırma

### 4.5.3 Duruş Analizi ve Raporlama
- **Dosya:** `frontend/src/features/downtime/pages/downtimes.jsx`
- **Route:** `/downtimes`
- **Ekran Görüntüleri:**
  1. Duruş özet istatistikleri (varsa)
  2. Reason bazlı dağılım
- **Açıklama:** Duruş verileri analizi

---

## 4.6 Simülasyon Sistemi

### 4.6.1 Simülasyon Saati (Simulation Clock)
- **Açıklama:** Kod ve konsept açıklaması (ekran görüntüsü yok, şema olabilir)

### 4.6.2 Vardiya ve Üretim Simülasyonu
- **Dosya:** `frontend/src/features/simulations/pages/simulations.jsx`
- **Route:** `/simulations`
- **Ekran Görüntüleri:**
  1. Simülasyon durum kartları (data-gen, shift-sim, job-sim)
  2. Başlat/Durdur kontrol butonları
  3. Log konsolu (gerçek zamanlı log akışı)
  4. Simülasyon parametreleri
- **Açıklama:** UI üzerinden simülasyon script yönetimi

---

## 4.7 AI Destekli Analiz Modülü

### 4.7.1 LLM Entegrasyonu
- **Dosya:** `frontend/src/features/ai/pages/ai-hub.jsx`
- **Route:** `/ai` veya `/ai-hub`
- **Ekran Görüntüleri:**
  1. AI Hub ana sayfası
  2. Use case kartları (U1, U2, U3 durumları: Aktif/Hazırlanıyor)
  3. Son 20 analiz listesi
- **Açıklama:** AI özelliklerinin merkezi hub sayfası

### 4.7.2 OEE Insight Özelliği (U1)
- **Dosya:** `frontend/src/features/reports/pages/reports.jsx` (AI Analizi kartı)
- **Route:** `/reports`
- **Ekran Görüntüleri:**
  1. AI Analizi kartı (summary, highlights, actions, warnings)
  2. Yeniden analiz butonu
  3. Loading/error durumları
- **Açıklama:** OpenAI destekli OEE açıklama asistanı

### 4.7.3 Duruş Pattern Analizi (U2) - Opsiyonel
- **Dosya:** `frontend/src/features/downtime/`
- **Route:** `/downtimes`
- **Ekran Görüntüleri:**
  1. Duruş AI analiz butonu
  2. Pattern analiz sonuçları
- **Açıklama:** Kapalı duruşlar için post-mortem AI analizi

---

## Ek Ekranlar

### Layout Bileşenleri
- **Dosya:** `frontend/src/components/layout/`
- **Ekran Görüntüleri:**
  1. Sol sidebar (navigasyon menüsü)
  2. Üst header (kullanıcı menüsü)
  3. Breadcrumbs örneği
- **Açıklama:** Uygulama kabuk tasarımı

---

## Ekran Görüntüsü Alma Rehberi

### Hazırlık
1. `npm run seed` ile örnek veri oluştur
2. `npm run shift:sim` ile simülasyon başlat
3. Farklı roller için giriş yap (Master, Supervisor, Operator, Viewer)

### Önerilen Sıra
1. Login ekranı (4.1.1)
2. Users ve Roles (4.1.2, 4.1.3)
3. Machines ve Monitoring (4.2)
4. Parts ve Job Orders (4.3.1, 4.3.2)
5. Dashboard/Board (4.3.3)
6. Reports/OEE (4.4.3, 4.4.4)
7. Downtimes (4.5)
8. Simulations (4.6.2)
9. AI Hub ve U1 (4.7)

### Format
- Çözünürlük: 1920x1080 önerilir
- Format: PNG
- İsimlendirme: `sekil-4-1-1-giris-ekrani.png`

---

## Özet Tablo

| Bölüm | Ekran | Görsel Sayısı | Öncelik |
|-------|-------|---------------|---------|
| 4.1.1 | Giriş | 1 | Yüksek |
| 4.1.2 | Rol Yönetimi | 2 | Orta |
| 4.1.3 | Kullanıcı Yönetimi | 3 | Orta |
| 4.2.1 | Makine Tanımlama | 3 | Orta |
| 4.2.2 | Makine Detay | 2 | Düşük |
| 4.2.3 | Canlı İzleme (Monitoring) | 4 | Yüksek |
| 4.3.1 | Parça Yönetimi | 3 | Orta |
| 4.3.2 | İş Emirleri | 4 | Yüksek |
| 4.3.3 | Üretim Panosu (Dashboard) | 3 | Yüksek |
| 4.4.3 | OEE Dashboard | 2 | Yüksek |
| 4.4.4 | OEE Raporları | 3 | Yüksek |
| 4.5.1 | Planlı Duruş | 3 | Orta |
| 4.5.2 | Plansız Duruş | 4 | Yüksek |
| 4.5.3 | Duruş Analizi | 2 | Orta |
| 4.6.2 | Simülasyon | 4 | Orta |
| 4.7.1 | AI Hub | 3 | Orta |
| 4.7.2 | OEE Insight (U1) | 3 | Yüksek |
| Ek | Layout | 3 | Düşük |

**Toplam tahmini görsel sayısı: ~50 adet**

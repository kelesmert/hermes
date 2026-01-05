# Tez Ekran Görüntüleri Rehberi

Bu dosya, tez raporunda kullanılacak ekran görüntülerinin hangi bölüm altında yer alacağını tanımlar.

> **Referans:** Bu dosya `bolum-yapisi.md` ile uyumludur.

---

## Bölüm Yapısı Özeti

| Bölüm | Konu                                |
| ----- | ----------------------------------- |
| 4.1   | Kullanıcı ve Erişim Yönetimi Modülü |
| 4.2   | Makine Yönetimi Modülü              |
| 4.3   | Üretim Takibi Modülü                |
| 4.4   | OEE Hesaplama ve Raporlama Modülü   |
| 4.5   | Duruş Yönetimi Modülü               |
| 4.6   | Simülasyon Sistemi                  |
| 4.7   | AI Destekli Analiz Modülü           |

---

## 4.1 Kullanıcı ve Erişim Yönetimi Modülü

### 4.1.1 Kimlik Doğrulama Sistemi

- **Dosya:** `frontend/src/features/auth/pages/login.jsx`
- **Route:** `/login`
- **Ekran Görüntüleri:**
  1. Giriş formu (kullanıcı adı, şifre, giriş butonu)
- **Açıklama:** JWT tabanlı kimlik doğrulama

### 4.1.2 Rol Tabanlı Erişim Kontrolü (RBAC)

- **Dosya:** `frontend/src/features/users/pages/users.jsx` (Roller tab içinde)
- **Bileşenler:** `role-list.jsx`, `role-form-dialog.jsx`
- **Route:** `/users` (Roller & İzinler tab'ı)
- **Ekran Görüntüleri:**
  1. Rol listesi ve izin matrisi
  2. Rol oluşturma/düzenleme modalı
- **Açıklama:** 4 rol (Master, Supervisor, Operator, Viewer), 15 permission

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
  1. Makine listesi tablosu (durum: running, idle, downtime, maintenance)
  2. Makine ekleme modalı
  3. Makine düzenleme modalı
- **Açıklama:** Fabrika makine envanteri ve durum yönetimi

### 4.2.2 Makine Listesi ve Detay Ekranları

- **Dosya:** `frontend/src/features/machines/pages/machines.jsx`
- **Route:** `/machines`
- **Ekran Görüntüleri:**
  1. Durum kayıtları penceresi (son durum değişimleri ve zaman bilgisi)
  2. Aktif/pasif anahtarı ve etiket görünümü (liste üzerinde)
- **Açıklama:** Detay inceleme ayrı sayfa yerine durum kayıtları üzerinden yapılır

### 4.2.3 Canlı İzleme (Monitoring)

- **Dosya:** `frontend/src/features/monitoring/pages/monitoring.jsx`
- **Route:** `/monitoring`
- **Backend Kanıtı:**
  - Endpoint: `GET /api/board/machines/:id/telemetry`
  - Service: `backend/src/domains/board/services/board-service.js`
- **Ekran Görüntüleri:**
  1. Makine seçim dropdown ve kaynak seçimi (live/shift)
  2. Sinyal durumu kartı (son sinyal zamanı, timeout durumu)
  3. Telemetry grafikleri (sıcaklık, tork, enerji - Recharts)
  4. Canlı pencere vs vardiya penceresi karşılaştırması
- **Açıklama:** Telemetry izleme (2sn polling ile güncellenir, WebSocket yok)

---

## 4.3 Üretim Takibi Modülü

### 4.3.1 Parça Yönetimi

- **Dosya:** `frontend/src/features/parts/pages/parts.jsx`
- **Route:** `/parts`
- **Ekran Görüntüleri:**
  1. Parça listesi tablosu (kategori, birim, ideal çevrim, uyumlu makineler)
  2. Yeni parça ekleme modalı
  3. Parça düzenleme modalı
- **Açıklama:** Üretilecek parça tanımları (fasteners, electronics, mechanical_plastics)

### 4.3.2 İş Emirleri ve Üretim Kayıtları

- **Dosya:** `frontend/src/features/production/pages/job-orders.jsx`
- **Route:** `/production`
- **Backend Kanıtı:**
  - Endpoints: `GET/POST /api/production/job-orders`, `POST /api/production/job-orders/:id/start|pause|resume|complete|cancel|produce`
  - Service: `backend/src/domains/production/services/job-order-service.js`
- **Ekran Görüntüleri:**
  1. İş emri listesi (durum renk kodları: pending, in_progress, paused, completed)
  2. Yeni iş emri oluşturma formu
  3. İş emri detay modalı (start/pause/resume/complete aksiyonları)
  4. Üretim girişi modalı (produce aksiyonu, good/defect count)
- **Açıklama:** JobOrder yaşam döngüsü yönetimi

### 4.3.3 Üretim Panosu (Board)

- **Dosya:** `frontend/src/features/dashboard/pages/dashboard.jsx`
- **Route:** `/dashboard` (kök URL `/` buraya redirect olur)
- **Ekran Görüntüleri:**
  1. Operasyon filtreleri (kaynak + shift tarihi) ve pencere bilgisi
  2. KPI kartları (toplam makine, çalışma/duruş/boşta/unknown dağılımı)
  3. Durum dağılımı grafiği (pie)
  4. Duruşlar tablosu (süre, tür, başlangıç/bitiş)
  5. Makineler tablosu (as-of durum, açık duruş, son telemetry)
- **Açıklama:** Giriş sonrası ana özet ekranı, shift bazlı operasyon özeti

---

## 4.4 OEE Hesaplama ve Raporlama Modülü

### 4.4.1 OEE Hesaplama Algoritması

- **Backend Kanıtı:**
  - Endpoint: `GET /api/oee/stats`
  - Service: `backend/src/domains/oee/services/oee-calculator-service.js`
- **Ekran Görüntüleri:**
  1. OEE formül/akış şeması (tez içinde şekil)
- **Açıklama:** OEE hesaplama mantığı ve pencere modeli (shift/range)

### 4.4.2 Availability, Performance, Quality Hesaplamaları

- **Ekran Görüntüleri:**
  1. A/P/Q bileşen formülleri (tez içinde şekil)
- **Açıklama:** A/P/Q bileşenlerinin yorumlanması (planlı süre, çalışma süresi, kalite)

### 4.4.3 OEE Dashboard

- **Dosya:** `frontend/src/features/reports/pages/reports.jsx`
- **Route:** `/reports`
- **Ekran Görüntüleri:**
  1. OEE özet kartları (Availability, Performance, Quality, OEE yüzdesi)
  2. Planlı süre / çalışma süresi ve üretim adetleri (good/defect)
  3. Operatör kırılımı tablosu (operatör bazlı A/P/Q/OEE)
- **Açıklama:** OEE metriklerinin özet görünümü ve operatör kırılımı

### 4.4.4 OEE Raporları ve Grafikler

- **Dosya:** `frontend/src/features/reports/pages/reports.jsx`
- **Route:** `/reports`
- **Backend Kanıtı:**
  - Endpoint: `GET /api/oee/stats`
  - Service: `backend/src/domains/oee/services/oee-calculator-service.js`
- **Ekran Görüntüleri:**
  1. Tarih/makine/kaynak filtre alanları (shift/range)
  2. Trend özeti + coverage bilgisi
  3. OEE trend grafiği (Recharts)
- **Açıklama:** Trend raporlama (haftalık/aylık) ve kapsama göstergesi

---

## 4.5 Duruş Yönetimi Modülü

### 4.5.1 Planlı Duruş Tanımlama

- **Dosya:** `frontend/src/features/downtime/pages/downtimes.jsx` (Planlı sekmesi)
- **Route:** `/downtimes`
- **Ekran Görüntüleri:**
  1. Planlı duruş kuralları listesi (başlangıç/bitiş saati, tekrar)
  2. Yeni planlı duruş kuralı ekleme modalı
  3. Planlı duruş çalıştırma geçmişi (runs, filtreler ve durumlar)
- **Açıklama:** Scheduler tabanlı planlı duruş yönetimi

### 4.5.2 Plansız Duruş Kayıt ve Takibi

- **Dosya:** `frontend/src/features/downtime/pages/downtimes.jsx`
- **Route:** `/downtimes`
- **Backend Kanıtı:**
  - Endpoints: `GET /api/downtimes`, `PATCH /api/downtimes/:id`, `POST /api/downtimes/:id/split`, `POST /api/downtimes/manual-start`, `POST /api/downtimes/:id/confirm`
  - Service: `backend/src/domains/downtime/services/downtime-service.js`
- **Ekran Görüntüleri:**
  1. Açık duruşlar listesi (planlı/plansız ayrımı)
  2. Kapalı duruşlar geçmişi (filtreleme)
  3. Duruş sınıflandırma/düzeltme penceresi (reason seçimi, düzeltme penceresi, split akışı)
  4. Split ile reason değişimi (aynı pencerede, yeni kayıt üretimi)
  5. Plansız duruş başlatma penceresi
  6. Onay bekleyen kayıt etiketi ve onay aksiyonu
- **Açıklama:** Plansız duruş yönetimi ve sınıflandırma

### 4.5.3 Duruş Analizi ve Raporlama

- **Dosya:** `frontend/src/features/downtime/pages/downtimes.jsx`
- **Route:** `/downtimes`
- **Ekran Görüntüleri:**
  1. Geçmiş duruş filtreleri (tarih aralığı, kategori, reason)
  2. Geçmiş duruş listesi (kayıtların makine/job bağlamı ile incelenmesi)
  3. AI duruş analizi penceresi (kapalı plansız duruşlar için)
- **Açıklama:** Filtrelenebilir geçmiş görünümü ve (opsiyonel) AI destekli değerlendirme

---

## 4.6 Simülasyon Sistemi

### 4.6.1 Simülasyon Saati (Simulation Clock)

- **Açıklama:** Konsept açıklaması (ekran görüntüsü yok, genel şema/akış diyagramı uygun)

### 4.6.2 Vardiya ve Üretim Simülasyonu

- **Dosya:** `frontend/src/features/simulations/pages/simulations.jsx`
- **Route:** `/simulations`
- **Ekran Görüntüleri:**
  1. Simülasyon durum kartları (data-gen, shift-sim, job-sim)
  2. Başlat/Durdur kontrol butonları
  3. Log konsolu (gerçek zamanlı log akışı)
  4. shift-sim reset akışı (onay penceresi ve uyarı metni)
  5. Log temizleme aksiyonu (+ opsiyonel: kontrol kapalı uyarısı `ENABLE_SIMULATION_CONTROL`)
- **Açıklama:** UI üzerinden simülasyon süreçlerini (telemetri + üretim) başlatma/durdurma ve log takibi

---

## 4.7 AI Destekli Analiz Modülü

### 4.7.1 LLM Entegrasyonu

- **Dosya:** `frontend/src/features/ai/pages/ai-hub.jsx`
- **Route:** `/ai`
- **Ekran Görüntüleri:**
  1. AI Hub ana sayfası
  2. Use case kartları (U1, U2 + U3 prototip kartı)
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

### 4.7.3 Duruş Post-Mortem Analizi (U2)

- **Dosya:** `frontend/src/features/downtime/pages/downtimes.jsx` + `frontend/src/features/downtime/components/downtime-ai-dialog.jsx`
- **Route:** `/downtimes`
- **Ekran Görüntüleri:**
  1. Duruş detay/düzenleme penceresi (DialogActions içinde “AI Analiz”)
  2. AI Duruş Analizi diyaloğu (özet + patternlar + aksiyonlar + uyarılar)
- **Açıklama:** Kapatılmış plansız duruşlar için post-mortem AI analizi (açık duruşlarda çalışmaz)

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

1. `cd backend && npm run seed` ile örnek veri oluştur
2. `cd backend && npm run shift:sim` ile simülasyon başlat
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
- İsimlendirme: `resim-4-1-1-giris-ekrani.png`

---

## Özet Tablo

| Bölüm | Ekran                     | Görsel Sayısı | Öncelik |
| ----- | ------------------------- | ------------- | ------- |
| 4.1.1 | Giriş                     | 1             | Yüksek  |
| 4.1.2 | Rol Yönetimi              | 2             | Orta    |
| 4.1.3 | Kullanıcı Yönetimi        | 3             | Orta    |
| 4.2.1 | Makine Tanımlama          | 3             | Orta    |
| 4.2.2 | Makine Detay              | 2             | Düşük   |
| 4.2.3 | Canlı İzleme (Monitoring) | 4             | Yüksek  |
| 4.3.1 | Parça Yönetimi            | 3             | Orta    |
| 4.3.2 | İş Emirleri               | 4             | Yüksek  |
| 4.3.3 | Üretim Panosu (Dashboard) | 3             | Yüksek  |
| 4.4.3 | OEE Dashboard             | 2             | Yüksek  |
| 4.4.4 | OEE Raporları             | 3             | Yüksek  |
| 4.5.1 | Planlı Duruş              | 3             | Orta    |
| 4.5.2 | Plansız Duruş             | 4             | Yüksek  |
| 4.5.3 | Duruş Analizi             | 2             | Orta    |
| 4.6.2 | Simülasyon                | 5             | Orta    |
| 4.7.1 | AI Hub                    | 3             | Orta    |
| 4.7.2 | OEE Insight (U1)          | 3             | Yüksek  |
| 4.7.3 | Duruş AI Analizi (U2)     | 2             | Orta    |
| Ek    | Layout                    | 3             | Düşük   |

**Toplam tahmini görsel sayısı: ~50 adet**

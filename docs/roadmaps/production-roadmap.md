# Production & Parts Domain Roadmap

## Güncelleme Kuralları

**Ne zaman güncellenir:** Domain implementasyonu devam ettiğinde, fazlar tamamlandığında, "Implementation Status" bölümü güncellenirken.

**Format:** Status güncelleme: ✅ Tamamlandı, 🔄 Devam ediyor, ⏳ Henüz başlanmadı. "Implementation Status" bölümüne ekle/güncelle.

**Önemli:** Roadmap dosyaları **SİLİNMEZ**. Tarihsel kayıt ve onboarding materyali olarak kalır. Gerçek implementasyon plandan farklı olabilir.

---

## Implementation Status (Güncel Durum)

### Tamamlanan Domainler

- **Parts Domain**: Model, CRUD endpoint'leri, kategori sistemi (fasteners/electronics/mechanical_plastics), makine uyumluluğu tamamlandı.
- **OEE Domain (Kısmi)**: MachineTelemetry modeli, OEE Processor Job (otomatik downtime detection), OeeMachineState modeli ile **Availability** hesaplaması tamamlandı. Performance ve Quality hesaplamaları için JobOrder domain'i gerekli.
- **Board Domain**: Dashboard metrik endpoint'leri (`/api/board/metrics`, `/api/board/machines/:id/metrics`, `/api/board/machines/:id/telemetry`) tamamlandı.
- **Production Domain**: JobOrder + ProductionEvent modelleri, CRUD + start/pause/resume/produce/complete/cancel aksiyon endpoint'leri ve telemetry tabanlı üretim simülatörü tamamlandı.
- **Monitoring Frontend**: Canlı telemetry grafikler (2sn polling, 10dk kayan pencere, Recharts) tamamlandı.

### Bekleyen Domainler

- Bu roadmap kapsamında bekleyen zorunlu domain kalmadı.

---

## Amaç

Bu dokümantasyon, MES (Manufacturing Execution System) projesi kapsamında oluşturulacak **temel domainleri** ve bunların entegrasyonunu açıklar.

### **Temel Domainler (Zorunlu):**

1. **Parts Domain:** Parça tanımlamaları, ideal üretim süreleri ve makine uyumluluğu.
2. **Production Domain:** İş emirleri (Job Orders), üretim süreçleri ve üretim olayları.

### **Opsiyonel Domainler (Gelecek için planlanmış):**

- **Inventory Domain:** Stok yönetimi, üretilen parçaların stokta tutulması.
- **Quality Analysis Domain:** Kalite kontrol, fire analizi ve iyileştirme süreçleri.
- **Supply Chain Domain:** Tedarik zinciri yönetimi ve lojistik süreçler.
- **Maintenance Domain:** Bakım yönetimi ve yedek parça takibi.

---

## Genel Akış

### **Temel Süreç (MVP):**

1. **Parça Tanımları (Parts Domain):**

   - Üretilecek parçalar tanımlanır.
   - Parçaların ideal üretim süresi (idealCycleTime) ve hangi makinelerde üretilebileceği belirtilir.
   - Parts Domain bağımsız bir domain olarak tasarlanır ve diğer domainler tarafından kullanılabilir.

2. **İş Emri Oluşturma (Production Domain):**

   - Supervisor, bir iş emri oluşturur.
   - Parça (Parts Domain'den), makine, hedef miktar ve operatör atanır.
   - İş emri başlangıçta "pending" durumunda olur.

3. **Üretim Başlatma:**

   - Operatör, iş emrini başlatır.
   - Makine "running" durumuna geçer.
   - Üretim süreci başlar.

4. **Üretim Süreci:**

   - Data-gen scripti telemetry/sinyal verisi üretir.
  - Üretim simülatörü (`job-simulator`) aktif iş emirleri için ilgili `jobOrder` etiketli telemetry’yi işler; sinyal 1 aralıklarından good/defect üretim eventleri oluşturur. Kaynak seçimi `JOB_SIM_TELEMETRY_SOURCE` ile yapılır.
   - Böylece üretilen parçalar ve hatalı parçalar ayrı event kayıtları olarak saklanır.

5. **Üretim Tamamlama:**

   - Hedef miktar tamamlandığında iş emri "completed" durumuna geçer.
   - Makine "idle" durumuna döner.

6. **OEE Hesaplama:**

   - Availability, Performance ve Quality hesaplanır.
   - Raporlama için veriler hazırlanır.

### **Gelecek Entegrasyonlar (Proje Planlamasında Tekrar Düşünülecek):**

> ⚠️ **NOT:** Aşağıdaki entegrasyonlar, temel süreç tamamlandıktan sonra proje planlaması sırasında detaylı olarak değerlendirilecek ve gerekli görülenler implement edilecektir.

- **Stok Yönetimi:** Üretilen parçalar belirli seviyeyi geçtiğinde stokta tutulur.
- **Kalite Analizi:** Fire oranları ve hata türleri detaylı analiz edilir.
- **Tedarik Zinciri:** Parça tedarik süreçleri otomatikleştirilir.
- **Bakım Yönetimi:** Parça bazlı makine bakım süreçleri planlanır.

---

## Modeller (Örnek - İleride Karar Verilecek)

> ⚠️ **NOT:** Aşağıdaki modeller örnek olarak verilmiştir. Gerçek model yapısı, implementasyon sırasında proje mimarisine ve mevcut modellere uygun olarak tasarlanacaktır.

### **Parts Domain:**

#### **Part Model (Örnek)**

- `partNo`: String (unique, otomatik: "PART-001")
- `name`: String → Parça adı (örn: "Vida M8x20")
- `description`: String → Parça açıklaması
- `idealCycleTime`: Number → İdeal üretim süresi (saniye cinsinden)
- `category`: String → Parça kategorisi (örn: "fastener", "component", "assembly")
- `compatibleMachines`: [ObjectId] (ref: Machine) → Bu parçanın üretilebileceği makineler
- `unit`: String → Birim (örn: "piece", "kg", "meter")
- `isActive`: Boolean → Parça aktif mi? (default: true)
- `createdBy`: ObjectId (ref: User)
- `timestamps`: true (createdAt, updatedAt)

> **Not:** Model oluşturulurken mevcut Machine ve User modelleriyle uyumluluk kontrol edilecektir.

---

### **Production Domain:**

#### **JobOrder Model (Örnek)**

- `orderNo`: String (unique, otomatik: "JO-20241113-001")
- `part`: ObjectId (ref: Part) → Hangi parça üretilecek
- `machine`: ObjectId (ref: Machine) → Hangi makine üretecek
- `targetQuantity`: Number → Hedef miktar (örn: 500)
- `producedQuantity`: Number → Şu ana kadar üretilen (default: 0)
- `goodQuantity`: Number → Hatasız üretilen (default: 0)
- `defectiveQuantity`: Number → Hatalı üretilen (default: 0)
- `status`: String (enum: "pending", "in_progress", "paused", "completed", "cancelled")
- `assignedOperator`: ObjectId (ref: User) → Hangi operatör
- `startTime`: Date → Başlangıç zamanı (null başlangıçta)
- `endTime`: Date → Bitiş zamanı (null başlangıçta)
- `estimatedDurationMinutes`: Number → Tahmini süre (Part'tan hesaplanır)
- `actualDurationMinutes`: Number → Gerçek süre (endTime - startTime)
- `notes`: String → Açıklama
- `createdBy`: ObjectId (ref: User) → Kim oluşturdu
- `timestamps`: true (createdAt, updatedAt)

> **Not:** Model oluşturulurken mevcut Part, Machine ve User modelleriyle uyumluluk kontrol edilecektir.

#### **ProductionEvent Model (Örnek)**

- `jobOrder`: ObjectId (ref: JobOrder)
- `machine`: ObjectId (ref: Machine)
- `eventType`: String (enum: "start", "produce", "defect", "pause", "resume", "complete")
- `quantity`: Number → Bu olayla ilgili miktar (produce/defect için)
- `qualityStatus`: String (enum: "good", "defective") → produce için
- `defectType`: String → Hata tipi ("scratch", "dimension_error", "incomplete", "other")
- `defectNotes`: String → Hata açıklaması
- `operator`: ObjectId (ref: User)
- `timestamp`: Date (default: now)
- `metadata`: Mixed → Ekstra bilgi (JSON)

> **Not:** Event kayıt yapısı, mevcut telemetry ve event sistemleriyle uyumlu olacak şekilde tasarlanacaktır.

---

## API Endpoints (Örnek - İleride Karar Verilecek)

> ⚠️ **NOT:** Aşağıdaki API endpoint'leri örnek olarak verilmiştir. Gerçek route yapısı, implementasyon sırasında mevcut routing mimarisine uygun olarak tasarlanacaktır.

### **Parts Domain API (Örnek):**

```http
GET    /api/parts                    → Tüm parça listesi (filtreleme: category, isActive)
POST   /api/parts                    → Yeni parça oluştur
GET    /api/parts/:id                → Tek parça detayı
PATCH  /api/parts/:id                → Parça güncelle
DELETE /api/parts/:id                → Parça sil (soft delete: isActive = false)
GET    /api/parts/:id/compatible-machines → Parçanın üretilebileceği makineler
```

> **Not:** CRUD işlemleri mevcut projedeki pattern'lere (controller, service, route yapısı) uygun olarak implement edilecektir.

---

### **Production Domain API (Örnek):**

#### **JobOrder CRUD (Örnek):**

```http
GET    /api/production/job-orders                → Tüm iş emirleri listesi (filtreleme: status, machine, part)
POST   /api/production/job-orders                → Yeni iş emri oluştur
GET    /api/production/job-orders/:id            → Tek iş emri detayı
PATCH  /api/production/job-orders/:id            → İş emri güncelle
DELETE /api/production/job-orders/:id            → İş emri sil
```

> **Not:** CRUD işlemleri mevcut projedeki pattern'lere (controller, service, route yapısı) uygun olarak implement edilecektir.

#### **JobOrder İşlemleri (Örnek):**

```http
POST   /api/production/job-orders/:id/start      → Üretimi başlat
POST   /api/production/job-orders/:id/produce    → Parça üretildi kaydet (body: { quantity, qualityStatus, defectType?, defectNotes? })
POST   /api/production/job-orders/:id/pause      → Üretimi duraklat
POST   /api/production/job-orders/:id/resume     → Üretimi devam ettir
POST   /api/production/job-orders/:id/complete   → Üretimi tamamla
```

#### **Events (Örnek):**

```http
GET    /api/production/job-orders/:id/events     → İş emrine ait tüm olaylar
```

---

## Domain Bağımlılıkları

### **Parts Domain Bağımlılıkları:**

**Bağımlı Olduğu Domainler:**

- **Machines Domain:** Parçanın hangi makinelerde üretilebileceği bilgisi için.
- **Users Domain:** Parça tanımını oluşturan kullanıcı bilgisi için.

**Bu Domain'e Bağımlı Olanlar:**

- **Production Domain:** İş emirleri oluştururken parça bilgilerini kullanır.
- **OEE Domain:** Performans hesaplamalarında idealCycleTime kullanır.
- **(Gelecek) Inventory Domain:** Stok yönetiminde parça tanımlarını kullanır.
- **(Gelecek) Quality Analysis Domain:** Kalite kontrol süreçlerinde parça tanımlarını kullanır.

---

### **Production Domain Bağımlılıkları:**

**Bağımlı Olduğu Domainler:**

- **Parts Domain:** Parça bilgileri (idealCycleTime, compatibleMachines).
- **Machines Domain:** Makine bilgileri (status, currentJobOrder).
- **Users Domain:** Operatör bilgileri (assignedOperator, createdBy).

**Bu Domain'e Bağımlı Olanlar:**

- **OEE Domain:** Performance ve Quality hesaplamaları için JobOrder verilerini kullanır.
- **Board Domain:** Dashboard'da anlık üretim durumunu gösterir.
- **Data-Gen Script:** JobOrder'a göre üretim simülasyonu yapar.
- **(Gelecek) Inventory Domain:** Üretim tamamlandığında stok güncellenir.
- **(Gelecek) Quality Analysis Domain:** Fire analizi ve kalite kontrol için üretim verileri kullanılır.

---

## Alınan Kararlar

1. **Parts Domain Ayrımı:**

   - ✅ Parça tanımlamaları bağımsız bir **Parts Domain** olarak oluşturulacak.
   - **Neden:** Parçalar sadece üretimde değil, stok yönetimi, kalite analizi ve tedarik zinciri gibi opsiyonel domainlerde de kullanılacak.

2. **JobOrder ve PlannedOrder:**

   - ✅ MVP için sadece **JobOrder** yeterli. PlannedOrder gelecekte eklenebilir.
   - **Neden:** İş emirlerinin basit ve hızlı bir şekilde oluşturulması öncelikli.

3. **Makine Uyumluluğu:**

   - ✅ Parça tanımında `compatibleMachines` alanı olacak.
   - **Neden:** İş emri oluştururken sadece uyumlu makineler gösterilecek.

4. **Hata Tipleri:**

   - ✅ MVP için sabit hata tipleri kullanılacak: "scratch", "dimension_error", "incomplete", "other".
   - **Neden:** Gelecekte dinamik hata tipi yönetimi eklenebilir.

5. **Pause/Resume İşlemleri:**

   - ✅ MVP'ye dahil edilecek.
   - **Neden:** Üretim sürecinde duraklatma ve devam ettirme ihtiyacı olabilir (örn: vardiya değişimi, arıza).

6. **Opsiyonel Domainler:**
   - ✅ Stok yönetimi, kalite analizi gibi domainler gelecekte eklenecek.
   - **Neden:** MVP'yi hızlı tamamlamak ve temel işlevselliği test etmek öncelikli.

---

## Yol Haritası (MVP)

### **Faz 1: Parts Domain** ✅ TAMAMLANDI

**Backend:**

- ✅ Part modeli oluştur
- ✅ Part service (CRUD işlemleri)
- ✅ Part controller
- ✅ Parts routes (`/api/parts`)
- ✅ API test (Postman/Thunder Client)

**Frontend:**

- ✅ Parts sayfası (parça listesi + oluşturma formu)
- ✅ Parça düzenleme ve silme işlemleri
- ✅ Kategori/birim/makine uyumluluğu entegrasyonu

---

### **Faz 2: Production Domain** ✅ TAMAMLANDI

**Backend:**

- [x] JobOrder modeli oluştur
- [x] ProductionEvent modeli oluştur
- [x] JobOrder service (CRUD + start/produce/pause/resume/complete)
- [x] JobOrder controller
- [x] Production routes (`/api/production/job-orders`)
- [x] Machine modeline `currentJobOrder` alanı ekle
- [x] API test (Postman/Thunder Client)

**Frontend:**

- [x] Production sayfası (iş emri listesi + oluşturma formu)
- [x] İş emri olayları ve aksiyon butonları (start/pause/resume/produce/complete/cancel)
- [x] Parça seçiminde uyumlu makineleri göster

---

### **Faz 3: Data Generation & OEE Entegrasyonu** ⚠️ KISMEN TAMAMLANDI

**Backend:**

- ✅ MachineTelemetry modeli (0/1 sinyal, timestamp, metrikler)
- ✅ OEE Processor Job (otomatik downtime detection)
- ✅ OeeMachineState modeli (son sinyal, aktif event, sıfır serisi)
- ✅ Data-gen scriptini güncelle (Telemetry simülasyonu)
- ✅ Availability hesaplaması (telemetry bazlı)
- [ ] Performance hesaplaması (JobOrder bazlı, beklemede)
- [ ] Quality hesaplaması (JobOrder bazlı, beklemede)

**Frontend:**

- ✅ Monitoring sayfası (canlı telemetry grafikler, 2sn polling, Recharts)
- ✅ Dashboard'a makine kartları ekle (polling ile güncelleme)
- ✅ Board domain endpoint'leri entegrasyonu
- [ ] Reports sayfasına OEE metrikleri göster (Availability × Performance × Quality)
- [ ] Parça bazlı performans raporları

---

### **Faz 4: Test ve İyileştirme (1-2 Gün)**

- End-to-end test senaryoları
- Bug düzeltmeleri
- UI/UX iyileştirmeleri
- Dokümantasyon güncellemeleri

---

## Özet

Bu roadmap, MES projesinin **temel domainlerini** (Parts ve Production) ve bunların entegrasyonunu tanımlar.

### **Temel Prensipler:**

1. **Modülerlik:** Parts Domain bağımsız bir yapı olarak tasarlanmıştır ve diğer domainler tarafından kullanılabilir.
2. **Ölçeklenebilirlik:** Opsiyonel domainler (Inventory, Quality Analysis, vb.) gelecekte kolayca eklenebilir.
3. **MVP Odaklı:** İlk aşamada temel işlevsellik tamamlanacak, opsiyonel özellikler sonraki fazlarda eklenecek.

### **Beklenen Sonuçlar:**

- Parça tanımlamaları ve iş emirleri oluşturulabilecek.
- Üretim süreçleri izlenebilecek ve OEE metrikleri hesaplanabilecek.
- Dashboard ve raporlama sayfaları üretim verilerini gösterebilecek.
- Gelecekte stok yönetimi, kalite analizi gibi domainler kolayca entegre edilebilecek.

### **Sonraki Adımlar:**

1. Parts Domain implementasyonuna başla (Faz 1).
2. Production Domain'i tamamla (Faz 2).
3. OEE entegrasyonunu yap (Faz 3).
4. Test ve iyileştirmeler (Faz 4).

---

**Not:** Bu roadmap, alınan kararlar doğrultusunda güncellenmiş olup, temel domainler (Parts ve Production) zorunlu, diğer domainler opsiyoneldir.

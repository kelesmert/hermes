# Context Window Geçmişi

> Bu dosya her context window sonunda güncellenir. Tarihsel bir kayıt olarak, her oturumda yapılan işleri, alınan kararları ve sonraki adımları özetler.

## Güncelleme Kuralları

**Ne zaman güncellenir:** Her context window sonunda (token limiti dolduğunda veya oturum bittiğinde).

**Format:**

```markdown
## [Tarih] - Context Window #[Numara]

### Yapılanlar

- Madde madde liste

### Alınan Kararlar

- Madde madde liste

### Sonraki Adımlar

- Madde madde liste
```

**Önemli:** Eski kayıtlar sılınmez, tarihsel log olarak kalır. Context window sayısı sonuçtan başa artan numaralandırma ile tutulur.

---

## 03 Ocak 2026 - Context Window #14

### Yapılanlar

- OEE processor kapasitesi için `oee-rules.json` içinde `aggregation.batchSize` 1000'e çıkarıldı (pollIntervalMs aynı kaldı).
- Shift-sim sonrası MachineEvent gecikmesi azaldı; dashboard duruş tablosu daha erken güncelleniyor.

### Alınan Kararlar

- OEE processor throughput artırımı için ilk tercih batchSize artırımı, pollIntervalMs değişimi gerekirse ikinci adım.

### Sonraki Adımlar

- Gerekirse pollIntervalMs ayarı ve overlap koruması (şimdilik gerek yok).
- Export ve audit log geliştirmeleri.

## 01 Ocak 2026 - Context Window #13

### Yapılanlar

- Mock-batch scripti haftalik ve aylik modlara genisletildi; `--week` ve `--month` bayraklari ile is gunleri uretimi eklendi, `--random` ile deterministik seed kapatildi.
- OEE calculator’da ayni timestamp’li job event’leri icin tie-breaker eklendi; performance > 1 sapmalari onlendi.
- Reports trend grafigi is gunleriyle sinirlandi ve hafta sonu bosluklari cizgi uzerinde birlestirildi.
- Mock-batch akis ve CLI kullanim notlari dokumantasyona islendi.

### Alinan Kararlar

- Yeni karar alinmadi.

### Sonraki Adımlar

- Shift calendar altyapisini makine bazli hale getirmek.
- Raporlama export ve audit log gelistirmeleri.

## 31 Aralık 2025 - Context Window #12

### Yapılanlar

- OEE trend grafiğinde tarih etiketleri `dd/MM/yyyy` formatına çekildi; rapor penceresinde tarih görünümü ortak helper’a bağlandı.
- UI tarih formatı standardı için karar ve standart dokümantasyonu güncellendi.
- OEE trend backend endpoint, job-sim cursor kalıcılığı ve actualDuration pause düşümü gibi öneriler checklist’e işlendi.

### Alınan Kararlar

- UI tarih/saat gösterimleri tek helper üzerinden yönetilecek, API tarafında ISO format korunacak.

### Sonraki Adımlar

- Job-sim cursor state kalıcılığı ve actualDurationMinutes düzeltmesi.
- OEE trend için tek endpoint tasarımı (opsiyonel).

## 31 Aralık 2025 - Context Window #11

### Yapılanlar

- OEE rapor ekranına haftalık ve aylık trend grafiği eklendi, trend başlangıcı ileri tarihe alındı ve tarih etiketleri dd/MM/yyyy formatına çekildi.
- UI tarih formatı tek helper ile standardize edildi (`frontend/src/lib/date-format.js`) ve Reports, Monitoring, Dashboard, Machines, Production, Downtime, Simulations ekranlarına uygulandı.
- Raporlar sayfası ve trend tamamlandı; checklist ve roadmap güncellendi.

### Alınan Kararlar

- UI tarih/saat gösterimleri dd/MM/yyyy ve dd/MM/yyyy HH:mm formatında tek helper üzerinden yapılacak, ISO değerler API/state tarafında korunacak.

### Sonraki Adımlar

- Export ve audit log geliştirmeleri.

## 31 Aralık 2025 - Context Window #10

### Yapılanlar

- Simulation clock servisine merkezi shift schedule ve range window yardımcıları eklendi.
- OEE hesaplaması shift-aware hale getirildi (mesai dışı ve hafta sonu hariç), job aktif semantiği paused dahil olacak şekilde güncellendi.
- OEE dashboard servisi shift penceresini merkezi servisten alacak şekilde güncellendi.
- OEE kararları ve durum listesi `docs/specs/oee-design.md` içinde netleştirildi, checklist ve file-overview güncellendi.

### Alınan Kararlar

- Shift penceresi tek merkezden (simulation-clock-service) alınacak; OEE ve raporlama aynı kaynağı kullanacak.
- `mode=range` plannedTime hesaplaması shift-aware olacak (mesai dışı ve hafta sonu hariç).

### Sonraki Adımlar

- Shift calendar (vardiya şablonları) altyapısını ekle ve makineye bağla.
- OEE rapor ekranını ve haftalık/aylık trend akışını tamamla.

## 17 Aralık 2025 - Context Window #9

### Yapılanlar

- JobOrder modelindeki `orderNo` duplicate schema index warning’i giderildi (tek index tanımı).

### Alınan Kararlar

- Mongoose index tanımı aynı alan için tek yerde yapılır; `unique: true` varken ayrıca `.index({ field: 1 })` tanımı eklenmez.

### Sonraki Adımlar

- Reports, export, audit log ve test altyapısı işleri.

## 17 Aralık 2025 - Context Window #8

### Yapılanlar

- UI üzerinden simülasyon yönetimi eklendi: `/simulations` sayfası ile `data-gen` ve `job-sim` başlat/durdur + log konsolu.
- Backend’e simülasyon kontrol API’si eklendi: `/api/simulations` (status, start/stop, logs, clear) ve prod ortamında env flag ile kapatma.
- Production job order numaralandırması düzeltildi: silme sonrası `orderNo` tekrar üretilip `E11000` hatası vermeyecek şekilde max+retry yaklaşımına geçirildi.
- Checklist, roadmap, requirements, summary, file-overview ve learning-guide güncellendi.

### Alınan Kararlar

- Simülasyonları terminal yerine UI’dan yönetme standardı: loglar UI’da görünür, backend restart olursa loglar sıfırlanır.
- JobOrder `orderNo` üretimi `countDocuments` yerine “max sequence + retry” ile yapılır; user-provided `orderNo` duplicate olursa 409 döner.

### Sonraki Adımlar

- JobOrder `orderNo` için duplicate index warning’ini temizle (tek index tanımı).
- Reports, export, audit log ve test altyapısı işleri.

## 17 Aralık 2025 - Context Window #7

### Yapılanlar

- Downtime v2 backend tamamlandı: planned rule/run modelleri, scheduler job, downtime list/update/split API'leri ve reason katalog endpoint'i eklendi.
- Plansız duruş event yazımı telemetry tarafında Downtime orchestrator üzerinden tek entrypoint'e alındı.
- Planlı duruş sırasında simülatör stopped mode eklendi (planlı event açıkken signal/metrik = 0).
- Frontend'e `/downtimes` sayfası eklendi (Açık, Planlı, Geçmiş sekmeleri) ve Production pause akışı bu sayfaya yönlendirildi.
- Checklist, roadmap, requirements, summary, file-overview, learning-guide, standart dokümanlar ve downtime spec güncellendi.

### Alınan Kararlar

- Plansız duruş telemetry-only, operatör sadece reason sınıflandırır.
- Planlı duruş scheduler ile otomatik başlar ve biter, bitince job resume denenir.
- Duruş reasonCode zorunlu, 5 dk düzeltme penceresi var, pencere sonrası reason değişimi split ile yapılır.
- Permission eşlemesi ilk fazda mevcut izinlerle yapılır (any-of `work_orders.execute` veya `production.manage`).

### Sonraki Adımlar

- Downtime stabilization ve UX polish maddelerini tamamla (bkz `docs/specs/downtime-design-v2.md`).
- Production `pauseJobOrder` endpoint'inde legacy MachineEvent yazımını kaldırma veya ayrı endpoint'e taşıma kararını netleştir.
- Reports, export, audit log ve test altyapısı işleri.

---

## 18 Kasım 2025 - Context Window #6

### Yapılanlar

- Production backend/domain tamamlandı (JobOrder, ProductionEvent, aksiyon endpointleri) ve frontend Production sayfası devreye alındı.
- `job-simulator.js` ile telemetry sinyaline bağlı üretim/defect kayıtları oluşturuldu; data-gen aktif job varken sinyali 1’de tutacak şekilde güncellendi.
- Machine monitoring ve OEE alanlarında yeni iyileştirme turu yapıldı: `data-gen.js` aktif/idle profilleri, `oee-processor.js` ise iş emri farkındalıklı downtime yönetimi kazandı.
- OEE signal-timeout config’i devre dışı bırakıldı; kısa telemetry gecikmeleri makineyi “durdu” yapmıyor.
- Checklist, roadmap, file-overview, learning-guide, summary ve karar dosyaları güncellendi.
- Bu context’te ek olarak simülasyon parametreleri env/README/requirements/project-report dosyalarına işlendi ve doc-maintenance gereksinimleri uygulandı.

### Alınan Kararlar

- Üretim simülasyonu `data-gen` + `job-sim` sıralı akışına bağlandı; telemetry sinyali 1 değilse üretim yapılmıyor.
- Frontend Production sayfası TanStack Table + aksiyon dialog pattern’i ile zorunlu standart olarak tanımlandı.
- OEE processor yalnızca aktif iş emri yürütülürken sinyal 0 serilerinde downtime açacak, job yoksa makine status’ü IDLE’da kalacak.
- Data-gen script’i makinenin `status/currentJobOrder` bilgisine göre aktif/idle metrik profilleri arasında `DATA_GEN_TRANSITION_MS` süresince ramp-up/ramp-down uygulayacak; telemetry değerleri monitoring grafiğinde hızlı tepki verecek.

### Sonraki Adımlar

- Reports backend/frontend genişletmesi ve export/audit ekranları.
- Production telemetri/makine durum senkronunun gözlemlenmesi; gerekirse OEE/config/data-gen iyileştirmeleri (saha verisi ile ince ayar).
- Test/lint altyapısı ve cookie tabanlı auth hazırlıkları.

---

## 17 Kasım 2025 - Context Window #5

### Yapılanlar

- Tüm doküman güncelleme kurallarını içerik ile karşılaştırma yapıldı
- 21 MD dosyası kontrol edildi (içerik + güncelleme kuralları uyumu)
- decision-log.md tarih alanı kaldırılması doğrulandı
- project-checklist.md checkbox format örnekleri korundu doğrulandı
- doc-maintenance.md'ye "Genel Markdown Kuralları" bölümü eklendi (3 zorunlu kural)
- decision-log.md'ye "Markdown Doküman Kuralları" kararı eklendi

### Alınan Kararlar

- **Doküman sistemi tamamlandı:** doc-maintenance.md = trigger/router, her MD = kendi format kuralı
- **Güncelleme kuralları optimize edildi:** Descriptive ve detailed format korundu, minimizasyon yapılmadı
- **chat-summary.md güncel tutulacak:** Her context window sonunda oturum kaydı eklenecek
- **Markdown kuralları zorunlu:** (1) Başlıklarda noktalama yok, (2) Emoji yok, (3) Kod bloklarında dil belirt (text/bash/javascript vb.)

### Dokümantasyon Durumu

- 20/21 dosya güncelleme kurallarına %100 uyumlu
- decision-log.md: Tarih alanı yok (Domain/Karar/Gerekçe/Etki) + Markdown kuralları kararı eklendi
- project-checklist.md: Checkbox format örnekleri korunmuş
- Tüm MD dosyaları "Güncelleme Kuralları" bölümüne sahip
- doc-maintenance.md: Genel Markdown Kuralları bölümü eklendi

### Sonraki Adımlar

- Production domain implementasyonu (JobOrder + ProductionEvent modelleri)
- Reports backend entegrasyonu
- Audit Log UI geliştirmesi

---

## 16 Kasım 2025 - Context Window #4

### Yapılanlar

- Context başlatma sistemi yeniden yapılandırıldı
- `context-initialization-prompt.md` sadeleştirildi (sadece yol haritası kaldı)
- `chat-summary.md` tarihsel log formatına çevrildi
- Backend/Frontend detayları `file-overview.md`'ye yönlendirildi
- Cross-domain bağımlılıklar `doc-maintenance.md`'ye referans verildi

### Alınan Kararlar

- **Context init rolü:** Sadece "hangi dosyalar okunmalı" rehberi olacak
- **Chat summary rolü:** Her context window sonunda güncellenen tarihsel kayıt
- **Detay kaynakları:** file-overview, learning-guide, doc-maintenance dosyaları kullanılacak

### Dokümantasyon Güncellemeleri

- `context-initialization-prompt.md` → 600+ satırdan ~200 satıra düştü
- `chat-summary.md` → Yeni format uygulandı
- `doc-maintenance.md` → Cross-domain referansları eklendi
- `project-guidelines.md` → Doküman haritası güncellendi

### Sonraki Adım

Reports backend entegrasyonu veya Audit Log UI geliştirmesi

---

## 15 Kasım 2025 - Context Window #3

### Yapılanlar

- Monitoring UI tamamlandı (canlı telemetry grafikler, 2sn polling)
- Monitoring grafikleri time-scale X ekseni ile güncellendi
- Dashboard gerçek veriye bağlandı (10sn polling)
- Parts domain kategori sistemi eklendi (fasteners, electronics, mechanical_plastics)
- OEE background job devreye alındı

### Alınan Kararlar

- **Monitoring grafikler:** `telemetryWindowMs` backend'den alınacak, frontend senkron çalışacak
- **Parts kategorileri:** Sabit sözlük olacak, dinamik kategori ekleme ileride değerlendirilecek
- **OEE job:** Her 2 saniyede telemetry batch işleme yapacak

### Teknik Detaylar

- Recharts `type="number" scale="time"` kullanıldı
- `part-categories.js` constants dosyası oluşturuldu
- `oee-processor-job.js` server başlangıcında çalışıyor

### Sonraki Adım

Dashboard metrik kartlarını test et, Reports backend entegrasyonuna başla

---

## 14 Kasım 2025 - Context Window #2

### Yapılanlar

- Machines domain tamamlandı (CRUD + events)
- OEE domain modelleri oluşturuldu (telemetry işleme altyapısı)
- Board domain API'si hazırlandı (`/api/board/metrics`)
- Parts domain CRUD tamamlandı
- Data generation script eklendi (`npm run data:gen`)

### Alınan Kararlar

- **Machine status:** Denormalize alanlar kullanılacak (`lastEventAt`, `status`)
- **Telemetry:** `machine_telemetry` koleksiyonu, 0/1 sinyal değeri
- **OEE işleme:** Batch processing, `oee-rules.json` ile konfigure edilecek

### Teknik Detaylar

- `machine-model.js`: code (unique), name, status, lastEventAt
- `machine-telemetry-model.js`: signalValue, timestamp, metrics
- `oee-processor.js`: Downtime algılama mantığı

### Sonraki Adım

Monitoring UI geliştir, Dashboard'u gerçek veriye bağla

---

## 13 Kasım 2025 - Context Window #1

### Yapılanlar

- Backend domain yapısına geçiş yapıldı
- Auth, Users, Access Control domainleri oluşturuldu
- Frontend auth entegrasyonu tamamlandı (SessionProvider)
- Users yönetim ekranı TanStack Table ile geliştirildi
- RBAC yönetim UI'sı eklendi (rol/permission CRUD)

### Alınan Kararlar

- **Domain yapısı:** `src/domains/<domain>/` klasör organizasyonu
- **Username bazlı login:** E-posta opsiyonel, username zorunlu
- **Viewer fallback:** Rol silindiğinde kullanıcılar viewer rolüne atanacak
- **Frontend auth:** localStorage + refresh token, cookie geçişi opsiyonel

### Teknik Detaylar

- JWT access token (kısa ömür) + refresh token (MongoDB'de hash'li)
- RBAC: `permissions → roles → users` zinciri
- SessionProvider backend yanıtını normalize ediyor
- axios interceptors 401'de session temizliyor

### Sonraki Adım

Machines domain geliştir, OEE altyapısını kur

---

## Daha Eski Kayıtlar

Daha önceki context window kayıtları için

```text
/home/kelesmert/Desktop/projects/hermes/docs/logs/chat-summary-OLD-BACKUP.md
```

---

**Son güncelleme:** 17 Aralık 2025
**Context window sayısı:** 8
**Proje durumu:** Downtime ve simülasyon yönetimi tamamlandı; Reports/Audit çalışmaları sırada

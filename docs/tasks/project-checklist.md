# MES MVP Checklist

## Güncelleme Kuralları

**Ne zaman güncellenir:**

- Yeni bir feature/task tamamlandığında: `[ ]` → `[x]` işaretle
- Yeni bir görev kararı alındığında: İlgili bölüme (Backend/Frontend/Test) ekle
- Gelecek için planlanan işler: `[ ] (İleride)` etiketi ile ekle
- Opsiyonel iyileştirmeler: `[ ] (Opsiyonel)` etiketi ile ekle

**Format:**

- `[x]` Tamamlanan görev açıklaması
- `[ ]` Bekleyen görev açıklaması
- `[ ] (İleride)` Gelecek için planlanan görev açıklaması
- `[ ] (Opsiyonel)` Zorunlu olmayan iyileştirme açıklaması

**Önemli:**

- Görevler asla silinmez, sadece işaretlenir
- Her tamamlanan görev mutlaka `[x]` ile işaretlenmeli
- Yeni görevler eklenirken ilgili bölüme (Hazırlık/Backend/Frontend/Test ve Dağıtım) ekle
- Her context window sonunda checklist durumu gözden geçirilmeli

---

## Hazırlık

- [x] Kararlar ve kurallar dokümanı (`docs/project-guidelines.md`)
- [x] Yol haritası dokümanı (`docs/specs/project-roadmap.md`)
- [x] Tez raporu şablonu (`docs/specs/project-report.md`)
- [x] Gereksinim detaylandırması (`docs/specs/requirements.md` veya eşdeğeri)
- [x] Teknoloji seçimleri ve gerekçeleri dokümanı (`docs/logs/tech-decision-logs.md`)
- [x] Repo yapısının oluşturulması (backend/frontend klasörleri, ortak yapılandırmalar)
- [x] `.env.example` dosyaları (backend/frontend)
- [ ] Lint/test scriptleri ve temel proje ayarları (ilgili proje kurulumu tamamlandıktan sonra)
- [x] Lokal doğrulama (seed + dev sunucu + `/api/health` ve `/api/auth/login`)

## Backend

- [x] Node.js + Express projesi kurulumu
- [x] MongoDB bağlantısı ve konfigürasyonu
- [x] Kullanıcı, rol ve session modelleri
- [x] JWT tabanlı auth akışı (register/login/refresh/logout)
- [x] RBAC middleware ve korunan endpoint örnekleri
- [x] Admin kullanıcı seed script’i
- [ ] (Opsiyonel) Tokenları cookie tabanlı yönetime geçir (HTTP-only, Secure, SameSite), CSRF koruması ekle ve çoklu cihaz oturum yönetimi + aktif refresh listesi hazırla
- [x] Roller/izinler için CRUD endpoint’leri ve permission yönetim API’si
- [x] Makine domaini Faz 1: `machines` + `machine_events` modelleri, CRUD ve event API'leri, denormalize durum alanları
- [x] Makine domaini Faz 2: Veri simülasyon script'i (cron/scheduler) ve API'ye entegre event üretimi
- [x] MachineTelemetry modeli: 0/1 sinyal değeri, timestamp, metrikler (sıcaklık, tork, enerji)
- [x] OEE Processor Job: Telemetry batch processing, otomatik downtime detection (sıfır serisi > threshold → MachineEvent)
- [x] OeeMachineState modeli: Makine başına son sinyal, aktif event, sıfır serisi başlangıç zamanı
- [x] OEE shift penceresini merkezi kaynaktan al (simulation-clock-service) ve hafta ici filtresi uygula
- [x] Board domain: Dashboard metrik endpoint'leri (`/api/board/metrics`, `/api/board/machines/:id/metrics`, `/api/board/machines/:id/telemetry`)
- [x] Parts domaini: model + CRUD endpointleri + RBAC izinleri ve seed verileri
- [x] Production domaini: JobOrder + ProductionEvent modelleri, CRUD + start/pause/resume/produce endpointleri ve telemetry bağlı job-simulator scripti
- [x] Downtime domaini v2: PlannedDowntimeRule/Run modelleri, rule CRUD + run list endpointleri ve scheduler job (feature-flag)
- [x] Downtime API: açık/geçmiş duruş listesi, 5 dk düzeltme (PATCH) ve split endpointi
- [x] Telemetry ve scheduler event yazımını DowntimeService entrypoint'inde toplama (doğrudan `MachineEvent.create` yok)
- [x] Operatör manuel plansız duruş başlatma endpoint'i (`POST /api/downtimes/manual-start`) ve aktif job kontrolü
- [x] Uzun plansız duruş “onay bekliyor” işareti + onay endpoint'i (`POST /api/downtimes/:id/confirm`)
- [x] Reason katalog API'si (`GET /api/oee/reasons`) ve reasonCatalog genişletmesi (planned|unplanned + fallback kodlar)
- [x] Data-gen planned stopped mode (planlı duruş açıkken signal/metrik = 0)
- [x] JobOrder orderNo üretimi: silme sonrası duplicate engelle (max sequence + retry)
- [x] Simülasyon kontrol API'si: `/api/simulations` (başlat/durdur/log) + permission guard + env flag
- [x] JobOrder orderNo duplicate index warning'ini temizle (tek index tanımı)
- [x] Shift-sim: hızlandırılmış vardiya telemetry simülatörü (`npm run shift:sim`) + `simulationRunId` tagging + data-gen ile aynı anda çalıştırmama kuralı
- [x] Shift end policy: shift-sim bitince `in_progress` job `paused` olur (reason: `shift_end`), açık event’ler vardiya bitişinde kapanır ve makine `idle` durumuna çekilir
- [x] Simulation Clock: shift-sim sanal takvim state’i (epoch date, resume, next-day) + reset desteği
- [x] Telemetry kayıtlarına `jobOrder` alanı ekleme (data-gen + shift-sim) ve job-sim tarafında jobOrder filtresi ile üretim
- [x] Job-sim telemetry kaynağı explicit seçimi (`JOB_SIM_TELEMETRY_SOURCE`) ve job event zaman ekseni seçimi (`JOB_TIME_SOURCE`)
- [x] Shift-sim test downtime schedule’ı env ile kontrol etme (on/off + süre)
- [x] Board telemetry source seçimi: `source` paramı + shift-sim için shift view, data-gen için live view
- [x] OEE processor telemetry source izolasyonu: `OEE_PROCESSOR_TELEMETRY_SOURCE` ile shift-sim odaklı işleme
- [x] OEE source filtresine `mock-batch` kaynagini ekle (API `source` parametresi genisletme)
- [x] Mock-batch tek seferlik veri uretim scripti (OEE icin)
- [ ] (Opsiyonel) JobOrder silmede ilgili telemetry kayıtlarını da temizle (purge parametresi veya admin aksiyonu)
- [ ] (İleride) OEE processor processedAt gecikmesi ve shift-sim wait süresi optimizasyonu (oee-rules.json `pollIntervalMs` + `batchSize`, `OEE_PROCESSOR_TELEMETRY_SOURCE` uyumu, `SHIFT_SIM_WAIT_FOR_PROCESSING_MS` düşürme/0, işlenmeyen telemetry için uyarı)
- [ ] (Opsiyonel) Monitoring periyot/bucket endpoint'i (vardiya görünümü için ayrı endpoint ve UI)
- [ ] Event zamanlarının lokal timezone desteği (UTC+3 gibi) için helper/formatlama katmanı
- [ ] Raporlama endpointleri (verimlilik, duruş süreleri vb.)
- [ ] (İleride) Job-sim cursor state’ini DB’de kalıcılaştır (restart sonrası tekrar işleme riskini azalt)
- [ ] (İleride) JobOrder `actualDurationMinutes` hesabında pause sürelerini düş (gerçek çalışma süresi)
- [ ] (Opsiyonel) OEE trend için tek endpoint (T2 toplam + coverage) tasarla
- [ ] CSV/Excel export servisi
- [ ] Audit log middleware’i ve kayıt koleksiyonu
- [ ] AI analiz modülü (kural tabanlı veya model entegrasyonu)
- [ ] Dashboard/rapor veri kaynaklarını gerçek makine/event akışıyla besleyecek polling/push servisleri _(Board domain ile kısmen tamamlandı; raporlama beklemede)_
- [ ] Auth akışı için refresh/logout endpoint testleri ve Postman senaryoları
- [ ] (İleride) Data-gen sinyal/metrik profillerini saha verisine göre ince ayarla (ramp-up/down parametreleri)

## Frontend

- [x] Frontend teknoloji kararları (Vite + React (JS), MUI, React Router v7, TanStack Query, axios, React Hook Form + Zod, TanStack Table + MUI, Recharts, react-hot-toast, Context/Zustand stratejisi)
- [x] Import alias konfigürasyonu (frontend `@/`)
- [ ] (Opsiyonel) Backend `@/` alias geçişi (module-alias veya eşdeğer yapı)
- [x] React (Vite) projesi kurulumu ve temel yapı
- [x] UI kit seçimi ve tema ayarları
- [x] App layout (sol sidebar + üst header + breadcrumbs + notifications dropdown)
- [x] Header genel arama ve bildirim dropdown placeholder bileşenleri
- [x] Auth sayfaları (login, logout, rol yönlendirmeleri)
- [x] Geçici localStorage tabanlı refresh token yönetimi (cookie geçişine hazırlık)
- [x] `/api/users` listesini TanStack Table ile entegre et; aktif/pasif toggle, rol atama ve filtreleme akışlarını tamamla
- [x] Dashboard layout ve genel metrik kartları (Board domain endpoint'leri, polling)
- [x] Makine kartları (durum renkleri, polling/React Query refetchInterval)
- [x] Monitoring sayfası: Seçili makine için canlı telemetry grafikler (2sn polling, kayan pencere, Recharts)
- [x] Monitoring source seçimi: Auto/shift-sim/data-gen toggle + shift view (07:00–18:00) ve live view ayrımı
- [ ] (Opsiyonel) Monitoring vardiya/periyot görünümü (15/30 dk bucket veya downsample)
- [x] Parça yönetimi sayfası (liste + ekle/düzenle/sil formları, kategori/birim/makine uyumluluğu)
- [x] Production/İş Emirleri sayfası (liste, form dialog ve start/pause/resume/produce/complete aksiyon butonları)
- [x] Downtime sayfası (`/downtimes`): Açık/Planlı/Geçmiş tabları, reason sınıflandırma (5 dk edit + split), planlı kural CRUD ve run geçmişi
- [x] Downtime UI: Operatör manuel plansız duruş başlatma dialogu + uzun plansız duruş “Onay Bekliyor”/Onayla akışı
- [x] Sidebar'a `Duruşlar` menüsü ve any-of permission guard (`work_orders.execute` veya `production.manage`)
- [x] Production pause UX'i downtime yazmaz, Duruşlar sayfasına yönlendirir
- [x] Simülasyonlar sayfası (`/simulations`): shift-sim/data-gen/job-sim başlat-durdur + log konsolu
- [x] Simülasyonlar: shift-sim reset aksiyonu (sim kaynaklı telemetry ve event temizliği)
- [x] Raporlama sayfası + filtreler
- [x] OEE rapor ekraninda kaynak secimi (shift-sim | data-gen | mock-batch)
- [x] Roller/izinler için yönetim ekranı; permission set düzenleme ve kullanıcıya rol atama modalları
- [x] Dashboard/rapor placeholder’larını gerçek makine/event verileriyle besleyip React Query polling/WebSocket desteği ekle _(dashboard ve rapor ekranı tamamlandı)_
- [x] UI tarih formatını tek helper ile standartlaştır (`dd/MM/yyyy`, `dd/MM/yyyy HH:mm`)
- [ ] CSV/Excel export butonları ve kullanıcı geri bildirimi
- [ ] Audit log görüntüleme ekranı
- [ ] AI analiz sonuçlarını gösteren bileşen
- [ ] Opsiyonel çok dillilik altyapısına hazırlık

## Test ve Dağıtım

- [ ] Backend için birim/entegrasyon testleri (Jest/Supertest)
- [ ] Frontend için temel component testleri (React Testing Library)
- [ ] ESLint + Prettier kurulumları, `npm run lint`/`format` script’leri ve dokümantasyonu
- [ ] Manual end-to-end senaryoların listesi
- [x] Downtime manuel smoke senaryoları (`docs/dev-notes/downtime-smoke.md`)
- [ ] (Opsiyonel) Downtime stabilization ve UX polish maddeleri (bkz `docs/specs/downtime-design-v2.md`)
- [ ] Lokal çalıştırma rehberi (README güncellemesi)
- [ ] Docker/Docker Compose dosyaları (opsiyonel)
- [ ] Nihai raporlama ve gelecek iş listesi güncellemesi
- [ ] (Opsiyonel) Postman: cookie tabanlı login/refresh/logout senaryoları ve otomasyon testleri

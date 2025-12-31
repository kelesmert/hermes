# Dosya Yapısı ve Açıklamaları

Bu doküman, **projedeki TÜM önemli dosya ve klasörlerin** konumunu ve amacını listeler.
Yeni geliştirici projeyi anlamak için bu dosyaya bakmalıdır.

## Kapsam

- **Backend:** Tüm domain'ler (models/services/controllers/routes), config, middleware, utils, constants, scripts
- **Frontend:** Tüm feature modülleri, ana bileşenler, lib klasörü, app providers, routing
- **Docs:** Tüm dokümantasyon dosyaları ve klasör yapısı

## Güncelleme Kuralı

- **Her yeni dosya eklendiğinde** ilgili bölüme ekle (domain, model, service, controller, route, component, vb.)
- **Format:** Dosya yolu + Ne yapar? (1-2 satır, kısa ve öz)
- **Küçük helper/util dosyaları:** Önemliyse ekle, çok spesifik ise opsiyonel
- **Her context window sonunda** gözden geçirilmeli

## Kök Dizin

- `.gitignore`: Git tarafından takip edilmemesi gereken dosya/klasörleri listeler (ör. `node_modules`, `.env`).
- `backend/`: Node.js + Express tabanlı API uygulaması.
- `frontend/`: React tabanlı istemci uygulaması; auth akışı, dashboard placeholder’ları ve kullanıcı/rol yönetimi ekranlarını barındırır.
- `docs/`: Gereksinimler, yol haritası, rapor ve genel notlar gibi bütün dokümanlar.
- `.specstory/`: IDE veya otomasyon araçlarının kullandığı yardımcı dosyalar.

## Backend

- `backend/package.json`: Backend projesinin bağımlılıkları ve script’leri (`npm run dev`, `npm run seed` vb.).
- `backend/.env.example`: Backend için gerekli ortam değişkenlerinin şablonu (Mongo URI, JWT secret, simülasyon parametreleri ve seed admin bilgileri).
- `backend/src/app.js`: Express uygulamasının ana tanımı; middleware’ler, `/` route’u ve hata yakalama burada.
- `backend/src/server.js`: HTTP sunucusunu oluşturur, MongoDB bağlantısını başlatır ve app’i dinlemeye açar.
- `backend/src/config/index.js`: Ortam değişkenlerini okuyup yapılandırma nesnesi sunar (port, client URL, JWT süreleri vb.).
- `backend/src/config/database.js`: Mongoose ile MongoDB bağlantısını kuran yardımcı fonksiyon.
- `backend/src/routes/index.js`: Tüm API rotalarını birleştirir (`/health`, `/auth`, `/users`, `/roles`, `/permissions`, `/machines`, `/parts`, `/production`, `/board`, `/oee`, `/downtimes`, `/planned-downtime-rules`, `/planned-downtime-runs`, `/simulations`).
- `backend/src/routes/health-routes.js`: `/api/health` uç noktasını içerir; servis durumu için basit yanıt verir.
- `backend/src/domains/auth/`: Auth & RBAC domain’i; `controllers`, `services` (auth-service, token-service), `routes` (`auth-routes`), `models` (user, role, permission, refresh-token) klasörlerini içerir.
- `backend/src/domains/access-control/`: Rol ve permission yönetimi için controller/service/route dosyaları (`roles-routes`, `permissions-routes`).
- `backend/src/domains/users/`: Kullanıcı yönetimi domain’i; `users-controller`, `users-routes` burada bulunur.
- `backend/src/domains/machines/`: Makine domain’i; `machines`, `machine_events` ve `machine_telemetry` modelleri ile birlikte controller/service/route katmanlarını içerir.
- `backend/src/domains/machines/models/machine-telemetry-model.js`: Makineye ait telemetry/sinyal kayıtlarını (`machine_telemetry` koleksiyonu) saklar; 0/1 sinyal değeri, timestamp, metrikler, `source`, `intervalMs`, `jobOrder` ve simülasyon koşuları için `simulationRunId` içerir. OEE processor akışı için `processedAt` alanı bulunur.
- `backend/src/domains/parts/`: Parça tanımları için domain; `models/part-model.js` parça, ideal süre ve üretilebildiği makineleri tutar, `constants/part-categories.js` kategori/birim/varsayılan makine ayarı sözlüğünü barındırır.
- `backend/src/domains/production/`: JobOrder ve ProductionEvent modelleri, servisler ve rotalar; iş emirleri için CRUD + start/pause/resume/produce/complete aksiyonları içerir ve makine/part/operatör ilişkilerini doğrular.
- `backend/src/domains/downtime/`: Duruş domain’i; planlı duruş rule/run modelleri, scheduler ve downtime listesi ile reason düzeltme/split API’lerini içerir.
- `backend/src/domains/simulations/`: Simülasyon kontrol domain’i; `data-gen`, `shift-sim` ve `job-sim` script’lerini UI’dan başlat/durdurmak için process yönetimi ve log buffer API’lerini içerir; `data-gen` ile `shift-sim` aynı anda çalıştırılmaz.
- `backend/src/domains/simulations/routes/simulations-routes.js`: Simülasyon kontrol endpoint’leri (`/api/simulations/*`); başlat/durdur/log akışlarına ek olarak `shift-sim` için reset endpoint’ini içerir; `production.manage` ile korunur ve prod ortamında env flag ile kapatılabilir.
- `backend/src/domains/simulations/services/simulations-service.js`: Child process spawn/stop (SIGTERM/SIGKILL), in-memory ring buffer log toplama ve status raporlama.
- `backend/src/domains/simulations/models/simulation-state-model.js`: Kalıcı simülasyon state’i; özellikle shift-sim “Simulation Clock” (virtual day, cursorAt, runId) bilgisini saklar.
- `backend/src/domains/simulations/services/simulation-clock-service.js`: Shift-sim sanal takvimini yönetir (epoch date, resume, next-day), `getShiftSimNow` ile sim-clock timestamp üretir, `shift-sim` reset işlemini uygular ve OEE için shift penceresi ile range penceresi hesaplar.
- `backend/src/domains/oee/config/oee-rules.json`: OEE/sinyal işleme domaini için downtime eşikleri, reason kod haritaları ve aggregation ayarlarının tutulduğu JSON konfigurasyonu.
- `backend/src/domains/oee/models/oee-machine-state-model.js`: Her makine için son sinyal değerini, aktif duruş event’ini ve sıfır (0) serisinin başlangıcını tutar; OEE job’u bu tabloyu kullanır.
- `backend/src/domains/oee/services/oee-processor.js`: Telemetry kayıtlarını batch halinde okuyup kuralları uygulayan servis; `OEE_PROCESSOR_TELEMETRY_SOURCE` ile kaynak bazlı çalıştırılabilir (tez demosunda varsayılan `shift-sim`), plansız duruş timing’ini üretir ve event yazımını downtime domain üzerinden orkestre eder.
- `backend/src/domains/oee/services/oee-dashboard-service.js`: Telemetry/OEE verilerinden dashboard için gerekli ortalama, toplam ve trend verilerini üretir; shift view hesapları için merkezi shift penceresini kullanır.
- `backend/src/domains/oee/services/oee-calculator-service.js`: OEE hesaplamasını yapar; shift ve range pencereleri, job aktif interval’ları, plannedTime/operatingTime ve A/P/Q/OEE metriklerini üretir.
- `backend/src/jobs/oee-processor-job.js`: Sunucu açıldığında çalışan cron benzeri job; belirlenen aralıklarla OEE processor servisini tetikler.
- `backend/src/jobs/planned-downtime-scheduler-job.js`: Planlı duruş scheduler runner; rule/run modeline göre planlı duruş başlatır/bitirir (feature-flag ile).
- `backend/src/domains/board/`: Dashboard’a yönelik metrikleri toplayan domain; `services/board-service.js` telemetry/OEE sonuçlarını birleştirir, `routes/board-routes.js` `/api/board/metrics`, `/api/board/machines/:id/metrics` ve `/api/board/machines/:id/telemetry` endpointlerini sunar.
- `backend/src/middleware/auth-guard.js`: JWT doğrulaması yaparak isteğe `req.auth` bilgisi ekler.
- `backend/src/middleware/permission-guard.js`: İstenen izinlere göre erişim kontrolü yapan middleware.
- `backend/src/models/index.js`: Domain modellerini preload eder (auth, machines, oee, production, downtime, simulations state).
- `backend/src/utils/password.js`: Şifre hash’leme ve doğrulama yardımcıları (bcrypt).
- `backend/src/utils/jwt.js`: JWT access token üretimi ve doğrulama işlevleri.
- `backend/src/utils/token.js`: Rastgele refresh token değeri üretme ve hash’leme yardımcıları.
- `backend/src/utils/app-error.js`: Uygulama içinde kullanılacak özel hata sınıfı (HTTP durum kodlarıyla beraber).
- `backend/src/utils/async-handler.js`: Promise dönen controller fonksiyonlarını sarmalayarak hata yakalamayı kolaylaştırır.
- `backend/src/utils/to-json-transform.js`: Mongoose şemalarında `_id` → `id` dönüşümü ve gereksiz alanları temizleyen ortak JSON transform helper’ı.
- `backend/src/constants/roles.js`: Rol isimlerini merkezi bir yerde tanımlar (`master`, `supervisor`, `maintenance`, `operator`, `viewer`).
- `backend/src/constants/permissions.js`: Sistem genelinde kullanılacak izin anahtarlarını listeler (örn. `machines.read`).
- `backend/src/constants/machine-statuses.js`: Makine durum enum değerlerini (`running`, `idle`, `downtime`, `maintenance`, `unknown`) merkezi olarak paylaşır.
- `backend/scripts/seed.js`: Varsayılan rol kayıtlarını ve `.env` üzerinden verilen admin hesabını oluşturan script (`npm run seed`).
- `backend/scripts/data-gen.js`: Simülasyon amaçlı telemetry/sinyal üretir; `npm run data:gen` ile çalıştırıldığında periyodik olarak `machine_telemetry` koleksiyonuna veri yazar (`source=data-gen`), makinenin `currentJobOrder` + `status` bilgisine göre aktif (yüksek sıcaklık/tork/enerji) ile idle (düşük) profilleri arasında `DATA_GEN_TRANSITION_MS` süresince ramp-up/ramp-down uygular ve aktif makine listesini en geç `DATA_GEN_MACHINE_REFRESH_MS` süresinde yeniden sorgular. `currentJobOrder` varsa telemetry’ye `jobOrder` etiketi ekler. Planlı duruş açıkken `DATA_GEN_PLANNED_STOPPED_MODE` ile signal/metrikleri 0’a kilitleyebilir.
- `backend/scripts/shift-simulator.js`: Hızlandırılmış vardiya telemetry simülatörü; 07:00–18:00 aralığı için deterministik sinyal/telemetry üretir ve `simulationRunId` ile işaretler (`npm run shift:sim`). Sanal takvim `SHIFT_SIM_EPOCH_DATE` + kalıcı Simulation Clock state üzerinden ilerler; yarıda durursa kaldığı yerden devam eder, shift bitince ertesi güne geçer. Sinyal 1 yalnızca `in_progress` job varken üretilir; job `paused` ise sinyal 0 kalır. Telemetry kayıtlarında `jobOrder` etiketi yazılır. Koşu bitince OEE processor telemetry’yi işledikten sonra (maksimum `SHIFT_SIM_WAIT_FOR_PROCESSING_MS`) `shift_end` uygular: `in_progress` job’u `paused` yapar, açık event’leri vardiya bitişinde kapatır ve makineyi `idle` durumuna çeker (`currentJobOrder` korunur). Planlı duruş açıkken `SHIFT_SIM_PLANNED_STOPPED_MODE` ile signal/metrikleri 0’a kilitleyebilir. Test downtime segmentleri env ile kontrol edilebilir.
- `backend/scripts/job-simulator.js`: Aktif JobOrder kayıtları için telemetry’ye bağlı üretim verisi üretir; explicit telemetry kaynağı (`JOB_SIM_TELEMETRY_SOURCE`, default shift-sim) seçer ve telemetry’yi `jobOrder` alanına göre filtreler. Son telemetry timestamp’lerine göre ideal çevrim süresini hesaplayıp `production_events` yazar ve shift-sim koşularında simülasyon timestamp’lerini korur (`npm run job:sim`).

## Docs

- `docs/project-guidelines.md`: Ana rehber; kuralların özeti ve doküman haritası.

### docs/standart

- `docs/standart/backend-decisions.md`: Backend için zorunlu teknoloji ve mimari kurallar.
- `docs/standart/frontend-decisions.md`: Frontend için zorunlu teknoloji ve component/layout kuralları.
- `docs/standart/technical-decisions.md`: DevOps, repo yapısı ve çapraz teknik zorunluluklar.
- `docs/standart/naming-conventions.md`: İsimlendirme standartları ve örnekleri.

### docs/logs

- `docs/logs/decision-log.md`: Alınan kararların gerekçeleri ve etkileri.
- `docs/logs/tech-decision-logs.md`: Kullanılan/planlanan teknolojilerin neden seçildiği.
- `docs/logs/chat-summary.md`: Sohbet özetleri ve hızlı bağlam.

### docs/specs

- `docs/specs/requirements.md`: Proje gereksinimleri, roller, veri modeli.
- `docs/specs/project-report.md`: Tez raporu taslağı ve mimari anlatım.
- `docs/specs/project-roadmap.md`: Geliştirme fazları ve kilometre taşları.
- `docs/specs/oee-downtime-design.md`: OEE ve downtime tasarımı v1; tarihsel kayıt ve OEE notları için korunur, downtime implementasyonu için kaynak değildir.
- `docs/specs/downtime-design-v2.md`: Downtime implementasyonu için ana tasarım; planlı scheduler, plansız telemetry + operatör manuel başlatma semantiği, API ve UI akışları.
- `docs/specs/sim-clock.md`: Shift sim için sanal takvim Simulation Clock tasarımı; deterministik tarih saat, resume ve kaynak seçimi kuralları.

### docs/roadmaps

- `docs/roadmaps/production-roadmap.md`: Parts ve Production domain'i için özel roadmap; gelecek domainler için de benzer dosyalar oluşturulacak.

### docs/tasks

- `docs/tasks/project-checklist.md`: Yapılacak işler listesi; tamamlananlar işaretli kalır.

### docs/meta

- `docs/meta/file-overview.md`: (Bu dosya) Önemli dosya ve klasörlerin kısa açıklamaları.
- `docs/meta/learning-guide.md`: Öğretici rehber; mimari ve akışların adım adım anlatımı.
- `docs/meta/summary.md`: Projeyi hızlıca kavramak için genel bakış dokümanı.
- `docs/meta/doc-maintenance.md`: Kod değişikliklerine göre hangi dokümanların güncelleneceğini anlatan bakım rehberi.
- `docs/meta/context-initialization-prompt.md`: **[YENİ]** Yeni context window açıldığında projeyi tamamen hatırlamak için kapsamlı başlatma promptu. Domain/feature haritası, cross-domain bağımlılıklar, geliştirme senaryoları ve adım adım talimatlar içerir.

### docs/roadmaps

- `docs/roadmaps/production-roadmap.md`: Parts ve Production domain'i için özel roadmap (Model şemaları, API endpoints, fazlar, bağımlılıklar). Gelecek domainler için de benzer dosyalar oluşturulacak.
- **Not:** Roadmap dosyaları kalıcıdır (silinmez); yeni geliştirici onboarding ve benzer domain ekleme template'i olarak kullanılır.

### docs/dev-notes

- `docs/dev-notes/dashboard-next-steps.md`: Telemetry → OEE → board akışındaki gelecek iyileştirme planları ve hızlı bakım notları (TODO'lar tamamlanınca silinir).
- `docs/dev-notes/downtime-smoke.md`: Downtime kapsamındaki manuel smoke test senaryoları.

## Frontend

- `frontend/.env.example`: React/Vite projesi için API adresi, websocket URL’si gibi ortam değişkeni şablonu.
- `frontend/README.md`: Frontend klasörünün kapsamını ve ileride eklenecek komutları özetler.
- `frontend/src/app`: Uygulama sağlayıcıları (QueryClient, Theme, Router, Session) ve route guard’lar.
- `frontend/src/components/layout`: Sidebar, header, breadcrumbs ve kabuk bileşenleri.
- `frontend/src/features/*`: Domain odaklı modüller (auth, dashboard, raporlar, kullanıcılar vb.).
- `frontend/src/features/machines/`: Makine yönetimi modülü; liste, CRUD dialogları ve duruş kayıtlarını içeren bileşenler.
- `frontend/src/features/parts/`: Parça tanımları için liste + CRUD modülü; backend Parts domain’i ile çalışır, makine uyumluluğu ve varsayılan ayarların girildiği form bileşenlerini içerir. `components/part-form-dialog.jsx` kategori sözlüğündeki `defaultValue` alanlarını form alanlarına placeholder olarak işler ve kullanıcı boş bırakırsa aynı değerler otomatik olarak kayda yazılır.
- `frontend/src/features/production/`: İş emirleri (JobOrder) ekranı; liste tablosu, oluştur/düzenle dialogu ve start/resume/produce/complete/cancel aksiyon dialoglarını içerir. “Pause” aksiyonu downtime event yazmaz ve kullanıcıyı `/downtimes` sayfasına yönlendirir.
- `frontend/src/features/downtime/`: Duruşlar sayfası; açık duruş listesi, planlı duruş kural yönetimi ve run geçmişi, geçmiş duruş filtreleri ve reason sınıflandırma akışlarını içerir. Operatör manuel plansız duruş başlatabilir (aktif job şartlı) ve 5 dk’dan uzun telemetry plansız duruşlar “Onay Bekliyor” olarak işaretlenip onaylanabilir.
- `frontend/src/features/simulations/`: Simülasyonlar sayfası; `data-gen` ve `job-sim` script’lerini UI’dan başlat/durdurur, durum kartları ve log konsolu sunar.
- `frontend/src/features/simulations/pages/simulations.jsx`: Simülasyonlar sayfasının UI’ı (kartlar + log konsolu, start/stop/clear aksiyonları).
- `frontend/src/features/simulations/services/simulations-api.js`: `/api/simulations` endpoint’leri için axios client wrapper’ları.
- `frontend/src/features/monitoring/pages/monitoring.jsx`: Makine/hat seçimi yaparak telemetry ve sinyal trendini gösteren izleme sayfası; `Kaynak` seçimi ile `shift-sim` için 07:00–18:00 vardiya görünümü, `data-gen` için live (kayan pencere) görünümü sunar.
- `frontend/src/features/users/components/`: Kullanıcı tablosu, kullanıcı formu, rol/permission yönetimi gibi modüler bileşenler.
- `frontend/src/lib/api/client.js`: Tüm frontend HTTP çağrılarını yapan axios instance; `baseURL` her zaman `VITE_API_URL`'dir.
- `frontend/src/lib/query-client.js`: TanStack Query client konfigürasyonu.
- `frontend/src/lib/storage.js`: LocalStorage helper ve `SESSION_STORAGE_KEY` tanımı.
- `frontend/src/styles/global.css`: Global tema/Reset ayarları.
- Teknoloji seti: Vite + React (JS), MUI, React Router v7, TanStack Query + axios, React Hook Form + Zod, TanStack Table + MUI, Recharts ve react-hot-toast. Tema hafif/sade tutulacak, durum yönetimi Context + custom hook ile başlayacak (gerekirse Zustand).
- Import alias kuralı: Frontend’de `@/` alias’ı kök `src/` klasörüne işaret eder; backend tarafında alias kullanımı opsiyoneldir ve şimdilik relatif path’ler korunur.

> Not: Yeni dosyalar (örneğin RBAC middleware, simülasyon script’i, frontend bileşenleri) eklendikçe bu liste güncellenecek.

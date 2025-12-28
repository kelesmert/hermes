# Backend

## Güncelleme Kuralları

**Ne zaman güncellenir:** Yeni komut/script eklendiğinde, kurulum adımları değiştiğinde, yeni env değişkeni eklendiğinde.

**Format:** Kurulum adımları, npm script'leri, env açıklamaları.

**Önemli:** Bu dosya teknik setup rehberidir. Kısa ve uygulamalı olmalı. Mimari detay `docs/` altında.

---

Node.js + Express tabanlı Hermes API'si bu klasörde yer alır. Mevcut sürüm:

- JWT + refresh token tabanlı auth ve kullanıcı adıyla giriş,
- RBAC yönetim uçları (`/api/users`, `/api/roles`, `/api/permissions`),
- Parts domain'i (`/api/parts`) ile kategori/birim/varsayılan makine ayarı sözlüğüne bağlı parça tanımları,
- Makine domaini için `machines` ve `machine_events` modelleri ile CRUD/event endpointleri,
- OEE/Telemetry altyapısı (telemetry yazımı + OEE processor job ile downtime event üretimi),
- Board domain'i (dashboard metrik endpoint'leri, telemetry serisi),
- Production domain'i (JobOrder + ProductionEvent, aksiyon endpointleri),
- Seed script ile master/supervisor/operator/viewer rollerini, test hesaplarını, örnek makineleri ve örnek parçaları üretir (env'deki şifreler değişirse kayıtlar güncellenir).

## Kurulum

```bash
cd backend
cp .env.example .env
npm install
npm run seed   # roller + master/sys kullanıcıları oluşur
npm run dev    # http://localhost:5000
```

Seed sonrası örnek hesaplar:

- Master: `admin / ChangeMe123!`
- Sys/test: `sys / syssys`
- Viewer: `viewer@hermes.local / Viewer123!` (sadece dashboard + makineler okunabilir)
- Örnek makineler: `MCH-001 (Simülasyon Presi)` ve `MCH-002 (CNC Kesim)` varsayılan olarak eklenir.
- Örnek parçalar: Vida, profil ve anakart seti gibi üç kategori (`fasteners`, `mechanical_plastics`, `electronics`) için kayıtlar eklenir; kategori/birim/varsayılan makine ayarları `src/domains/parts/constants/part-categories.js` sözlüğüne göre doğrulanır.

- Telemetry testi için seed script’i her makineye ait örnek `machine_telemetry` kayıtları oluşturur; OEE job’u ve `/api/board/metrics` endpoint’i bu verilerle hemen doğrulanabilir.
- Telemetri simülasyonu için iki seçenek var (aynı anda çalıştırmayın):
  - Hızlandırılmış vardiya simülasyonu (önerilen, test için): `shift-sim`
    ```bash
    npm run shift:sim
    ```
    Bu script 07:00–18:00 vardiyası için deterministik telemetry üretir ve birkaç dakika içinde tüm vardiya verisini adım adım yazar. Shift-sim sanal takvim (Simulation Clock) kullanır: ilk gün `SHIFT_SIM_EPOCH_DATE` ile başlar, vardiya bitince ertesi güne geçer, yarıda durursa kaldığı yerden devam eder. Sinyal 1 yalnızca makinede `in_progress` bir job varken üretilir; job `paused` ise sinyal 0 kalır.
    - Koşu bittiğinde, OEE processor bu telemetry’yi işledikten sonra (maksimum `SHIFT_SIM_WAIT_FOR_PROCESSING_MS`) sistem “shift_end” uygular: `in_progress` job’ları `paused` yapar (reason: `shift_end`) ve makineyi `idle` state’e çeker. Sonraki vardiyada operatör job’u manuel `resume` eder.
    - Tez demosunda OEE job’u varsayılan olarak sadece shift-sim telemetry’sini işler (`OEE_PROCESSOR_TELEMETRY_SOURCE=shift-sim`); data-gen canlı monitoring için kullanılabilir.
  - Sürekli simülasyon (legacy): `data-gen`
  ```bash
  npm run data:gen
  ```
  Bu script veri tabanına düzenli aralıklarla sinyal/telemetri yazar ve dashboard/monitoring’i canlı tutar (OEE job’unun işlemesi `OEE_PROCESSOR_TELEMETRY_SOURCE` ayarına bağlıdır).
  - Interval değerleri ve sensör oynaklığı `.env` dosyasındaki `DATA_GEN_INTERVAL_MS`, `DATA_GEN_MACHINE_REFRESH_MS`, `DATA_GEN_TEMP_DELTA`, `DATA_GEN_TORQUE_DELTA`, `DATA_GEN_ENERGY_DELTA` değişkenleriyle ayarlanabilir; varsayılan `DATA_GEN_INTERVAL_MS=2000`, `DATA_GEN_MACHINE_REFRESH_MS=5000` olup job başlat/bitir olaylarının telemetry’ye birkaç saniye içinde yansımasını sağlar.
  - Planlı duruş simülasyonu için `DATA_GEN_PLANNED_STOPPED_MODE=true` iken, makinede açık planlı duruş event’i varsa sinyal ve metrikler 0 üretilir; planlı duruş bitince normal profile geri dönülür.
  - Sinyal davranışı için `DATA_GEN_RUNNING_SIGNAL_DROP_PROB`, `DATA_GEN_RUNNING_SIGNAL_RECOVERY_PROB`, `DATA_GEN_IDLE_SIGNAL_DROP_PROB`, `DATA_GEN_IDLE_SIGNAL_RISE_PROB` değişkenleri kullanılabilir; aktif işlerde sinyalin 1’de kalmasını, idle durumda ise daha sık 0 üretmesini sağlar.
  - Isınma/soğuma anındaki metrik geçişi `DATA_GEN_TRANSITION_MS` değişkeniyle kontrol edilir; varsayılan 10 sn boyunca sıcaklık/tork/enerji değerleri hızlıca yeni profile yaklaşır ve monitoring grafikleri gerçekçi ramp-up/ramp-down davranışı sergiler.
  - Üretim simülatörü (`npm run job:sim`) telemetry verisine bağımlıdır; önce shift-sim veya data-gen’i başlat, ardından job-sim’i çalıştır. Telemetry yoksa job-sim üretim yapmaz ve logda uyarı verir.
  - Job-sim üretim hızı ideal cycle time’a göre hesaplanır; rastgelelik için `JOB_SIM_CYCLE_TIME_MIN_FACTOR` ve `JOB_SIM_CYCLE_TIME_MAX_FACTOR` kullanılabilir.
  - UI üzerinden simülasyon yönetimi için `/simulations` sayfası kullanılabilir (backend API: `GET/POST /api/simulations/*`, izin: `production.manage`). `shift-sim` için reset aksiyonu, sim kaynaklı telemetry ve event’leri temizler. Prod ortamında kapatmak için `ENABLE_SIMULATION_CONTROL=false` bırakın.

## Dizin Yapısı

```
backend/
├─ src/
│  ├─ app.js, server.js
│  ├─ config/
│  ├─ constants/
│  ├─ middleware/
│  ├─ utils/
│  ├─ domains/
│  │   ├─ auth/           # login/register/refresh/logout
│  │   ├─ users/          # kullanıcı listesi + CRUD
│  │   ├─ access-control/ # roles & permissions API’leri
│  │   ├─ machines/       # makine CRUD + event API’leri + telemetry modeli
│  │   ├─ oee/            # telemetry processor + OeeMachineState
│  │   ├─ board/          # dashboard metrikleri (board API)
│  │   ├─ parts/          # parts CRUD + kategori sözlüğü
│  │   └─ production/     # job orders + production events + aksiyonlar
└─ scripts/ (seed.js, data-gen.js, shift-simulator.js, job-simulator.js)
```

## Kullanıcı Akışı

- `POST /api/auth/login` yalnızca `username + password` kabul eder (e-posta opsiyoneldir).
- `auth-guard` access token’ı doğrular; `permission-guard` `users.manage`, `roles.manage` gibi izinleri kontrol eder.
- `/api/users` uçları listeleme, oluşturma, güncelleme ve silme işlemlerini sağlar; viewer rolü fallback olarak korunur.
- `/api/roles` ve `/api/permissions` uçları rol şablonlarını ve izin sözlüğünü yönetir; master/viewer rolleri seed tarafından silinemez.
- `/api/board/*` endpoint'leri dashboard/monitoring için metrik ve telemetry serisi sağlar.
- `/api/production/job-orders/*` endpoint'leri job order CRUD + start/pause/resume/produce/complete/cancel aksiyonlarını sağlar; üretim event'leri `production_events` koleksiyonuna yazılır.

## Yararlı Komutlar

| Komut          | Açıklama                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------ |
| `npm run dev`  | Nodemon ile geliştirme sunucusu                                                            |
| `npm run seed` | Permission/role + master/sys kullanıcıları ve örnek makine kayıtlarını oluşturur/günceller |
| `npm run data:gen` | Makine telemetry verisi simüle eder; OEE ve monitoring için sinyal üretir (legacy)      |
| `npm run shift:sim` | 07:00–18:00 vardiyası için hızlandırılmış deterministik telemetry üretir (test için)  |
| `npm run job:sim`  | Aktif job order’lar için üretim (good/defect) verisi üretir; telemetry sinyaline bakar  |
| `npm test`     | (Planlı)                                                                                   |

Yeni bağımlılık veya mimari karar eklemeden önce `docs/standart/backend-decisions.md` dosyasını güncelleyip onay alın.

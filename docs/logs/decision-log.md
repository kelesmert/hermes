# Karar Kaydı (Decision Log)

Bu dosya, projede alınan mimarî ve teknolojik kararları, gerekçelerini ve beklenen etkilerini tek yerde toplar. Tez yazımı veya gelecekteki tartışmalar sırasında "neden böyle yaptık?" sorusuna hızlı cevap vermek için düzenli olarak güncellenecektir.

## Güncelleme Kuralları

**Ne zaman güncellenir:**

- Teknik bir karar alındığında (teknoloji seçimi, mimari tercih, pattern belirleme)
- Standart/kural belirlendiğinde (zorunlu kural değil, karar seviyesi)
- Uygulama yapılırken önemli tasarım kararı alındığında

**Format:**

```markdown
### [Karar Başlığı - Kısa ve Açıklayıcı]

- **Domain:** [Backend/Frontend/Ortak] - [Spesifik domain adı]
- **Karar:** [Ne kararlaştırıldı, kısa ve net]
- **Gerekçe:** [Neden bu karar alındı, hangi sorunu çözüyor]
- **Etki:** [Hangi dosyalar/sistemler etkilenecek, neleri değiştirecek]
```

**Önemli:**

- Domain bölümü hem katman (Backend/Frontend/Ortak) hem de spesifik domain (auth, users, machines, vb.) belirtmeli
- Gerekçe net olmalı, "neden bu kararı aldık?" sorusunu cevaplamalı
- Etki hangi dosyaların/sistemlerin etkileneceğini açıkça belirtmeli
- Kararlar silinmez, tarihsel kayıt olarak kalır

## Backend Kararları

### Node.js + Express API

- **Karar:** Backend, Node.js + Express üzerinde katmanlı yapı (routes → middleware → controllers → services → models → utils) ile kurulacak.
- **Gerekçe:** Ekibin mevcut tecrübesi, esnek middleware mimarisi, geniş ekosistem ve hafif REST API ihtiyaçlarıyla uyumlu.
- **Etkisi:** Hızlı prototipleme, modüler servis yapısı, Express middleware’leri ile genişletilebilirlik.

### MongoDB + Mongoose

- **Karar:** Tüm kalıcı veri için MongoDB kullanılacak, Mongoose ODM ile şemalar yönetilecek.
- **Gerekçe:** Şema doğrulaması, ilişkiler ve hook desteği sayesinde RBAC/makine/audit verileri kolay yönetiliyor; NoSQL yaklaşımı simülasyon verisi için esnek.
- **Etkisi:** Koleksiyon bazlı tasarım (`users`, `roles`, `permissions`, ileride `machines`, `machine_events` vb.), Mongoose middleware ile doğrulamalar.

### JWT + Refresh Token Akışı

- **Karar:** Access token’lar JWT ile, refresh token’lar MongoDB’de hash’li olarak saklanacak; rotation sırasında eski token revoke edilecek.
- **Gerekçe:** Stateles access token performansı ve merkezi refresh kontrolü arasında denge; sonraki aşamada cookie’ye geçiş planı destekleniyor.
- **Etkisi:** `auth-guard` middleware’i için hızlı doğrulama, refresh token revocation listesiyle güvenli oturum yenileme.

### RBAC Yönetim API’si

- **Karar:** `/api/roles`, `/api/permissions` ve `/api/users` (create/update) uç noktaları eklendi; roller CRUD, izin listesi ve kullanıcı yönetimi tamamen API üzerinden yönetilecek. Rol silmelerinde viewer rolü fallback olarak atanıyor.
- **Gerekçe:** Admin panelinden rol/izin yönetimi yapılabilmesi ve yeni rollerin sonradan eklenebilmesi için dinamik uç noktalara ihtiyaç vardı.
- **Etkisi:** Seed edilen roller (master, supervisor, operator, viewer) üzerine yeni roller eklenebilir; sys kullanıcı mock verileri gözlemleyebilir, admin gerçek kurulum yapabilir.

### Makine Domaini Temel Modeli

- **Karar:** `machines` koleksiyonu için bağımsız bir model oluşturuldu; alanlar `code`, `name`, `status`, `lastEventAt`, `tags`, `isActive` ve otomatik timestamp’lerden oluşuyor. `status` enum değerleri (`running`, `idle`, `downtime`, `maintenance`, `unknown`) merkezi sabit olarak tanımlandı.
- **Gerekçe:** Makine verisini kullanıcı/rol domaininden ayrı yöneterek ileride makine eventleri, simülasyon ve raporlama katmanını üzerine inşa edebilmek.
- **Etkisi:** Backend yeni makine domainine hazır; event modelleri ve API’leri bu şema üzerinde geliştirilecek, frontend dashboard verilerini bu koleksiyondan okuyabilecek.

### JSON Transform Helper

- **Karar:** Ortak `_id → id` dönüşümü ve `__v` temizliği için `backend/src/utils/to-json-transform.js` helper’ı tanımlandı; makine ve makine-event şemalarına uygulandı.
- **Gerekçe:** Frontend tarafında manuel map’ler yazmadan tüm API yanıtlarından okunabilir `id` alanı üretmek ve tekrar eden kodu azaltmak.
- **Etkisi:** Makine/MachineEvent response’ları otomatik `id` içeriyor; ileride ihtiyaç duyulan diğer modeller aynı helper’ı kullanarak aynı davranışı kazanabilecek.

### Hızlandırılmış Vardiya Simülasyonu (shift-sim)

- **Domain:** Backend - simulations/machines/oee/board, Frontend - monitoring
- **Karar:** `shift-sim` adlı deterministik, hızlandırılmış vardiya telemetry simülatörü eklendi; telemetry kayıtları `simulationRunId` ile etiketleniyor. `data-gen` ile `shift-sim` aynı anda çalıştırılmaz. `job-sim` üretimi telemetry timestamp’lerine göre hesaplar ve shift-sim koşularında simülasyon zamanını korur. MB-001 için simülasyon üretim hızı `JOB_SIM_PART_MB_001_CYCLE_TIME_SECONDS` ile yavaşlatılabilir (varsayılan 600 sn).
- **Gerekçe:** Gerçek makine erişimi olmadığı için deterministik test verisi gerekli; hızlandırılmış vardiyada üretim/telemetry sıralamasını bozmadan hızlı smoke test yapılabilmeli ve aşırı hızlı üretim (çok düşük cycle time) kontrol edilebilmeli.
- **Etki:** `backend/scripts/shift-simulator.js`, `backend/scripts/job-simulator.js`, `backend/scripts/seed.js`, `backend/src/domains/machines/models/machine-telemetry-model.js`, `backend/src/domains/oee/services/oee-dashboard-service.js`, `backend/.env.example`, `backend/README.md`, `frontend/src/features/monitoring/pages/monitoring.jsx` ve ilgili dokümanlar güncellendi.

### Shift End Semantiği (shift_end)

- **Domain:** Backend - simulations/production/machines/oee
- **Karar:** `shift-sim` koşusu tamamlanınca sistem `shift_end` uygular: `in_progress` job’lar `paused` yapılır (reason: `shift_end`), açık `machine_events` vardiya bitişinde kapanır ve makine `idle` durumuna çekilir. `currentJobOrder` korunur ve üretimin devamı için operatörün job’u manuel `resume` etmesi gerekir.
- **Gerekçe:** Simülasyon bittiğinde makine/job state’in “running” kalmasını ve downtime sürelerinin vardiya dışına taşmasını engellemek; üretimin operatör onayıyla devam etmesini sağlamak.
- **Etki:** `backend/scripts/shift-simulator.js`, `backend/src/domains/oee/services/oee-processor.js`, `backend/.env.example`, `backend/README.md` ve ilgili dokümanlar.

### Simulation Clock ile Sanal Takvim (shift sim)

- **Domain:** Backend - simulations/oee, Frontend - monitoring
- **Karar:** Shift sim için DB’de kalıcı Simulation Clock state tutulacak; `SHIFT_SIM_EPOCH_DATE` ile deterministik başlangıç yapılacak. Resume aynı gün içinde `cursorAt < shiftEndAt` koşuluyla aynı `simulationRunId` ile devam eder, shift bitince bir sonraki start ertesi gün 07:00’den yeni run ile başlar. State ile DB çelişirse DB’deki maksimum shift sim telemetry timestamp’i baz alınır ve state düzeltilir. Monitoring kaynak seçimi `source` bazlı yapılır, shift sim shift view, data gen live view kullanır. OEE downtime processor şimdilik sadece `source=shift-sim` telemetry’sini işler.
- **Gerekçe:** Üretilen verilerin tarih saatlerinin tutarlı olması, restart sonrası kaldığı yerden devam, duplicate veri üretimini engellemek ve sunumda hem canlı data gen hissi hem de tutarlı OEE tarih filtreleri sağlayabilmek.
- **Etki:** Yeni simulation state modeli ve servisleri, `backend/scripts/shift-simulator.js`, `backend/src/domains/oee/services/oee-dashboard-service.js`, `backend/src/domains/oee/services/oee-processor.js`, `frontend/src/features/monitoring/pages/monitoring.jsx` ve dokümanlar.

### Job Event Zaman Ekseni Kaynağa Göre Seçim

- **Domain:** Backend - production/simulations
- **Karar:** Job start/pause/resume/complete event timestamp’leri kaynağa göre yazılır: `shift-sim` için sim-clock, `data-gen` için wall-clock kullanılır (`JOB_TIME_SOURCE` varsayılanı `shift-sim`).
- **Gerekçe:** Job event’lerinin telemetry timeline’ı ile aynı eksende olması; sim-clock ile üretilen veriyi wall-clock ile karıştırmamak.
- **Etki:** `backend/src/domains/production/services/job-order-service.js`, `backend/src/domains/production/controllers/job-order-controller.js`, `backend/src/domains/simulations/services/simulation-clock-service.js`, `backend/.env.example`, `backend/README.md`.

### Job-sim Telemetry Kaynağı Explicit Seçim

- **Domain:** Backend - production/simulations
- **Karar:** Job-sim yalnızca seçilen telemetry kaynağını işler (`JOB_SIM_TELEMETRY_SOURCE`, default `shift-sim`).
- **Gerekçe:** Eski shift-sim verisi varken data-gen’in yanlışlıkla işlenmesini engellemek, test senaryolarını deterministik yapmak.
- **Etki:** `backend/scripts/job-simulator.js`, `backend/.env.example`, `backend/README.md`.

### Telemetry Kayıtlarına jobOrder Etiketi

- **Domain:** Backend - machines/production/simulations
- **Karar:** Telemetry kayıtlarında `jobOrder` alanı tutulur; job-sim üretim yaparken ilgili jobOrder’a ait telemetry’yi okur.
- **Gerekçe:** Aynı makinede ardışık job’ların üretiminin birbirine karışmasını önlemek ve doğru üretim sayımı sağlamak.
- **Etki:** `backend/src/domains/machines/models/machine-telemetry-model.js`, `backend/scripts/data-gen.js`, `backend/scripts/shift-simulator.js`, `backend/scripts/job-simulator.js`.

### Shift-sim Test Downtime Segmentleri Env Kontrollü

- **Domain:** Backend - simulations
- **Karar:** Shift-sim içindeki test amaçlı sabit duruş segmentleri env ile aç/kapa yapılabilir (`SHIFT_SIM_TEST_DOWNTIME_*`).
- **Gerekçe:** Test senaryosu için faydalı ama demo/üretim davranışını şaşırtmamalı.
- **Etki:** `backend/scripts/shift-simulator.js`, `backend/.env.example`, `backend/README.md`.

### OEE Aktif Job Interval Kaynağı Filtreli

- **Domain:** Backend - oee/production
- **Karar:** OEE hesaplamasında aktif job interval’ları `ProductionEvent` verisinden ve `metadata.simulationSource` filtresiyle çıkarılır.
- **Gerekçe:** Simülasyon kaynakları ile operatör event’lerini karıştırmadan deterministik OEE hesaplamak.
- **Etki:** `backend/src/domains/oee/services/oee-calculator-service.js`.

### OEE Range Modu Shift Aware

- **Domain:** Backend - oee
- **Karar:** `mode=range` için plannedTime sadece mesai saatleri ve hafta içi günlerle sınırlandırılır (range ∩ shift penceresi ∩ job aktif).
- **Gerekçe:** Mesai dışı zamanların OEE hesaplarına dahil edilmemesi, shift ve range semantiklerinin tutarlı olması.
- **Etki:** `backend/src/domains/oee/services/oee-calculator-service.js`, `backend/src/domains/simulations/services/simulation-clock-service.js`.

### Shift Penceresi Merkezi Kaynak

- **Domain:** Backend - simulations/oee
- **Karar:** OEE ve raporlama tarafı shift penceresini tek bir merkezden alacak; merkez `simulation-clock-service` ve shift-sim `SimulationState` bilgisi olacak.
- **Gerekçe:** Mesai saatleri ve hafta içi kurallarının tek yerde tutulması; OEE ile simülasyon arasında zaman uyumsuzluğunu önlemek.
- **Etki:** `backend/src/domains/oee/services/oee-calculator-service.js`, `backend/src/domains/oee/services/oee-dashboard-service.js`, `backend/src/domains/simulations/services/simulation-clock-service.js`, ilgili dokümanlar.

## Frontend Kararları

### Vite + React (JavaScript) SPA

- **Karar:** Frontend, Vite + React ile SPA olarak kurulacak; başlangıçta JavaScript, ihtiyaç halinde TypeScript’e geçilebilecek.
- **Gerekçe:** Vite’in hızlı HMR’i ve basit konfigürasyonu, React ekosistemiyle uyum, öğrenme eğrisinin düşük olması.
- **Etkisi:** Kısa sürede iskelet çıkarma, component tabanlı yapı, gerekirse TypeScript’e evrilebilecek altyapı.

### MUI + Destekleyici Kütüphaneler

- **Karar:** UI kiti olarak MUI; veri katmanı için React Router v7, TanStack Query, axios; formlar için React Hook Form + Zod; tablolar için TanStack Table + MUI; grafikler için Recharts; bildirimler için react-hot-toast.
- **Gerekçe:** Dashboard odaklı kurumsal UI’ler için hızlı bileşen üretimi, veri çekme/polling için hazır çözüm, formlarda performanslı validasyon, tablo/grafiklerde React-first yaklaşımlar.
- **Etkisi:** Tutarlı tasarım dili, tekrar kullanılabilir component kütüphanesi, polling/tablo/export gereksinimleri için hazır altyapı.

### Uygulama Kabuk Tasarımı

- **Karar:** Sol sidebar + üst header düzeni kullanılacak; sidebar tüm modül menülerini barındıracak, header’da kullanıcı menüsü, genel arama ve notifications dropdown bulunacak. Breadcrumbs her korumalı sayfada zorunlu.
- **Gerekçe:** MES tarzı dashboard’larda kullanıcılar aynı anda birden fazla modüle ulaşmak istiyor; yönetici bilgileri ve bildirimler header’da olmalı; breadcrumb navigasyon izlenebilirlik sağlıyor.
- **Etkisi:** Layout bileşenleri (AppLayout, Sidebar, Header, Breadcrumbs) standart olacak; yeni sayfalar `Outlet` içinde render edilecek; responsive hedefi tablet uyumluluğu ile sınırlı.

### Token Saklama Stratejisi (Geçiş Dönemi)

- **Karar:** Refresh token tarayıcı `localStorage`’ında tutulacak; uygulama her açıldığında `POST /api/auth/refresh` çağrılarak sessiz login sağlanacak. HttpOnly cookie yapısına geçiş opsiyonel olarak değerlendirilecek.
- **Gerekçe:** Kullanıcıların sayfayı yenileyince tekrar login olmasını engellemek; cookie/CSRF geçişine ancak gerçek ihtiyaç oluştuğunda yatırım yapmak.
- **Etkisi:** Session yönetimi Context + custom hook üzerinden devam edecek; ileride gereksinim doğrulanırsa cookie + CSRF kombinasyonu için ayrıca plan yapılacak ve dokümantasyon güncellenecek.

### Import Alias (`@/`)

- **Karar:** Hem frontend (Vite) hem backend (Node) tarafında `@/` alias’ı kök `src/` dizinine işaret edecek.
- **Gerekçe:** Derin klasör yapılarında `../../services/...` gibi yolları azaltıp okunabilirliği artırmak, taşınabilirliği kolaylaştırmak.
- **Etkisi:** Vite config, jsconfig/tsconfig ve backend tarafında `module-alias` benzeri ayarlar yapılacak; tüm importlar alias standardına geçirilecek.
- **Durum:** Backend alias kullanımı ertelendi; frontend’de alias zorunlu, backend’de relatif path’ler devam ediyor.

### Backend Alias Erteleme

- **Domain:** Ortak - config
- **Karar:** Backend tarafında `@/` alias kullanımı şimdilik ertelendi; frontend’de alias zorunlu, backend’de relatif path’ler devam ediyor.
- **Gerekçe:** Mevcut backend kodu relatif importlarla çalışıyor ve geniş refactor ihtiyacı yok. Alias’a geçiş, ihtiyaç doğduğunda planlanacak.
- **Etki:** `docs/project-guidelines.md`, `docs/standart/backend-decisions.md`, `docs/standart/naming-conventions.md`, `docs/specs/requirements.md`, `docs/specs/project-report.md`, `docs/meta/file-overview.md`, `docs/tasks/project-checklist.md`.

### Durum Yönetimi

- **Karar:** Öncelik Context + custom hook; global karmaşıklık artarsa Zustand devreye alınacak.
- **Gerekçe:** Gereksiz bağımlılık eklememek, ancak gerektiğinde hafif ve test edilebilir bir state yönetimi çözümü hazır tutmak.
- **Etkisi:** Auth/session gibi kritik state’ler önce Context ile çözülecek, ihtiyaç halinde Zustand store’larına taşınabilecek.

### ESLint + Prettier

- **Karar:** Frontend iskeleti kurulduktan hemen sonra ESLint ve Prettier konfigüre edilip `npm run lint` / `npm run format` script’leri eklenecek.
- **Gerekçe:** Kod stilini standartlaştırmak, PR incelemelerini hızlandırmak ve hataları erken yakalamak.
- **Etkisi:** Ortak kural seti dokümante edilecek; VSCode ve CI entegrasyonlarına zemin hazırlayacak.

### Frontend İskeleti (Vite + React)

- **Karar:** Frontend projesi Vite + React (JS) ile kuruldu; `AppProviders` (React Query + MUI Theme + Router + SessionProvider), `AppLayout` (sidebar/header/breadcrumbs), mock login formu ve placeholder dashboard/rapor/kullanıcı sayfaları hazırlandı.
- **Gerekçe:** Backend API’leri tamamlandıkça yalnızca ilgili feature modülleri genişleterek hızlı ilerlemek; layout ve guard yapısını baştan netleştirmek.
- **Etkisi:** Auth oturumu `localStorage` tabanlı `SessionProvider` ile yönetiliyor, izin bazlı guard’lar ve axios client hazır durumda; sonraki adımlar sadece API entegrasyonu ve gerçek veri bağlaması olacak.

### Auth Entegrasyonu (Gerçek API ile)

- **Karar:** Frontend login formu doğrudan `/api/auth/login` endpoint’ine bağlandı; SessionProvider backend yanıtını normalize ederek role string’leri ve izinleri türetiyor. Uygulama açılışında `/api/auth/refresh` çağrısı yapılıyor, logout sırasında `/api/auth/logout` tetikleniyor, axios interceptors 401 durumunda session’ı temizleyip global eventi yayıyor.
- **Gerekçe:** Mock login yerine gerçek kullanıcı oturumunu yönetmek; refresh token rotation ve izin kontrolleriyle tüm korumalı rotalar için altyapıyı hazır hale getirmek.
- **Etkisi:** Login → dashboard, sayfa yenileme, logout gibi akışlar gerçek verilerle çalışıyor; bundan sonra makine/rapor modüllerini API’ye bağlamak için ek bir altyapı ihtiyacı yok.

### RBAC Yönetim UI’sı

- **Karar:** `/api/users` TanStack Table ile bağlandı; kullanıcı oluşturma/düzenleme, rol atama ve aktif/pasif togglesı UI üzerinden yapılabiliyor. Aynı ekranda `roles.manage` iznine sahip kullanıcılar için rol/permission CRUD dialogları mevcut.
- **Gerekçe:** İleride yeni roller/izinler ekleneceği için konfigürasyonun tamamen UI’dan yönetilmesi gerekiyor; ayrıca kullanıcı yönetim ekranının gerçek veriye bağlanması MVP kapsamındaydı.
- **Etkisi:** Adminler yeni roller tanımlayıp izin setlerini kategori bazlı seçebiliyor, rol silme işleminde kullanıcılar otomatik olarak viewer rolüne taşınıyor; SessionProvider backend’den gelen permission listesiyle dinamik guard uygulayabiliyor.

### UI Tarih Formatı Standardı

- **Domain:** Frontend - ortak UI
- **Karar:** UI tarih/saat gösterimleri `dd/MM/yyyy` ve `dd/MM/yyyy HH:mm` formatında, tek bir helper (`frontend/src/lib/date-format.js`) üzerinden yapılır. API/DB için ISO format korunur, input alanları native ISO değerleriyle çalışır.
- **Gerekçe:** Ekranlar arası tutarlı tarih görünümü sağlamak ve sıralama/filtre için ISO değerlerini bozmamak.
- **Etkisi:** Reports, Monitoring, Dashboard, Machines, Production, Downtime ve Simulations ekranlarında tarih gösterimleri ortak helper’a alındı.

### Backend Domain Yapısı

- **Karar:** Backend kodu domain bazlı klasörlere ayrılacak (örn. `src/domains/auth`, `src/domains/users`, ileride `src/domains/machines`); her domain kendi `models/services/controllers/routes` yapılarına sahip olacak. Ortak kod `src/shared` altında tutulacak.
- **Gerekçe:** Monolit yapıyı düzenli ve ölçeklenebilir tutmak; ileride domain’leri ayrı servislere ayırmak gerekirse taşımayı kolaylaştırmak.
- **Etkisi:** Yeni domain eklerken standart klasör yapısı kullanılacak, `backend/standart/backend-decisions.md` ve `project-guidelines` bu kuralla güncellendi.

## Ortak / Diğer Kararlar

### ENV ve Config Standartları

- **Karar:** Backend ve frontend `.env` dosyaları ayrı yönetilecek; frontend tarafında `VITE_API_URL=http://localhost:5000/api` standart olacak, backend `CLIENT_URL=http://localhost:5173`.
- **Gerekçe:** Monorepo içinde net sorumluluk ayrımı, deployment ortamlarında kolay konfig.
- **Etkisi:** Axios `baseURL` otomatik ayarlanacak; ileride cookie’ye geçişte `withCredentials` sadece konfig ile açılacak.

### Dokümantasyon Disiplini

- **Karar:** Alınan her karar ilgili doc’a (guidelines, requirements, roadmap, learning-guide, decision-log) işlenecek.
- **Gerekçe:** Tez yazımı ve ekip içi bilgi transferinde tutarlılık; geçmiş kararların izlenebilirliği.
- **Etkisi:** Bu dosya merkezî referans olacak; değişiklikler commit mesajlarına ve checklist maddelerine yansıtılacak.

---

Yeni kararlar alındıkça bu dosyaya tarih/başlık/gerekçe formatıyla ekleme yapılmalıdır.

### Kullanıcı Adı Bazlı Kimlik Doğrulama

- **Karar:** Kullanıcı girişleri e-posta yerine zorunlu `username` alanı ile yapılacak; e-posta opsiyonel olup sadece bildirim/şifre sıfırlama için saklanacak. Seed script’i admin/sys hesaplarına username tanımlar ve mevcut kullanıcıların eksik username alanlarını doldurur.
- **Gerekçe:** Üretim sahasında kullanıcılar genellikle şirket e-postası kullanmıyor; sade ve benzersiz bir kimlik gerekli.
- **Etkisi:** Auth controller/service, kullanıcı yönetimi ve frontend formlar username üzerinden çalışıyor; yerel depolardaki eski kayıtlar migrasyon ile uyumlu hale getirildi.

### Rol Piramidi ve Yeni Permission Seti

- **Karar:** Varsayılan roller `master > supervisor > operator > viewer` olarak güncellendi; execution ve vardiya yönetimi için yeni permission anahtarları (`work_orders.execute`, `shifts.manage`) eklendi.
- **Gerekçe:** Rol tanımları üretim süreçlerine göre netleştirildi; supervisor operatörleri yönetebilmek, operator ise sadece atanmış istasyonlarda işlem yapabilmek zorunda.
- **Etkisi:** Seed script’i yeni rollerle güncellendi, viewer fallback korundu, frontend fallback haritası ve rol yönetim UI’sı yeni izin kategorilerini gösteriyor.

### Monitoring Grafiklerini Gerçek Zamanlılaştırma

- **Karar:** Monitoring sayfasındaki Recharts temelli sinyal ve telemetry grafiklerinin veri modeli ve zaman ekseni güncellendi. Telemetri noktaları frontend’de normalize edilerek `timestampMs` (epoch) alanı ile tutuluyor; X ekseni `type="number" scale="time"` konfigürasyonu ve sunucudan gelen `telemetryWindowMs` ile hizalanan `chartDomain` üzerinden yönetiliyor.
- **Gerekçe:** 10 dakikalık kayan pencere içinde veri güncellenirken eksen etiketleri “zıplıyor” ve grafik zaman çizgisi gerçek aralığı yansıtmıyordu. Ayrıca sık polling (2 sn) sırasında Date parse işlemleri CPU’ya yük bindiriyordu.
- **Etkisi:** Grafikler artık gerçekte olduğu gibi son 10 dakikalık aralığı sabit genişlikte gösteriyor, yeni örnek geldikçe eksen sürekli kayıyor. Tooltip ve tick formatlayıcıları da aynı normalleştirilmiş zamanı kullanıyor; böylece görsel kayma hissi azaldı ve incremental fetch sonrası state hesapları daha hafif hale geldi.

### Parts Domain ve RBAC İzinleri

- **Karar:** Parça tanımları bağımsız bir Parts domain’i altında modellendi; `/api/parts` için CRUD servis/controller/route eklendi ve `parts.read`/`parts.manage` izinleri tanımlandı.
- **Gerekçe:** Production roadmap’teki job order akışları, makine uyumluluk doğrulamaları ve simülasyon scripti parça bilgisine ihtiyaç duyuyor; aynı zamanda bu domain diğer modüller (inventory, quality vb.) tarafından da kullanılacak.
- **Etkisi:** Supervisor ve üstü roller parçaları yönetebiliyor, operator seviyeleri sadece okuyabiliyor; data-gen ve future job order servisleri tekil kod/kategori/varsayılan ayarlara sahip parçaları referans alabilecek.

### Viewer Hesabı ve Seed Güncellemeleri

- **Karar:** Seed script’e sadece `dashboard.read` ve `machines.read` izinlerine sahip viewer kullanıcısı eklendi; mevcut admin/sys/viewer hesaplarının şifreleri env değiştiğinde yeniden hash’lenip güncelleniyor. Ayrıca seed süreci örnek vida/profil parçalarını database’e yazıyor.
- **Gerekçe:** RBAC doğrulamasını ve read-only kullanıcı deneyimini test etmek için ayrı bir hesap gerekliydi; parça CRUD’unu doğrulamak için de başlangıç verisi gerekiyor.
- **Etkisi:** `npm run seed` çalıştırıldığında admin/sys/viewer hesapları güncel parolalarla hazır hale geliyor, iki örnek parça otomatik oluşuyor ve viewer hesabıyla parçalar veya diğer write endpoint’lerine erişim engeli kolayca test edilebiliyor.

### Parça Kategorileri ve Varsayılan Makine Ayarları

- **Karar:** Laptop fabrikası senaryosuna uygun olarak üç sabit parça kategorisi belirlendi (`fasteners`, `electronics`, `mechanical_plastics`). Her kategori izin verilen birim listesini ve kategoriye özgü varsayılan makine ayarı alanlarını (feed rate, reflow temp, mold temp vb.) tanımlıyor. Backend Parts servisi bu sözlüğe göre validasyon yapıyor; frontend formu da aynı sabitlerden türetilen select/input setleri gösteriyor.
- **Gerekçe:** Parça formunun kategoriden bağımsız serbest metin olması üretim planlamasında yanlış birimlerin kullanılmasına yol açıyordu. Ayrıca farklı kategoriler farklı makine parametreleri talep ediyor (vida = spindle/torque, elektronik = reflow temp vb.), dolayısıyla kategori seçimi somut bir etkiye sahip olmalı.
- **Etkisi:** Parçalar artık yalnızca sözlükteki kategorilerden biri ile oluşturulabiliyor, ilgili birim listesi ve varsayılan makine ayarı alanları otomatik değişiyor. Seed verileri ve frontend sayfası yeni yapıdan besleniyor; ileride kategori eklemek sadece constants dosyalarına kayıt eklemekle mümkün olacak.

### Telemetry Tabanlı Üretim Simülasyonu

- **Domain:** Backend - production/oee
- **Karar:** Production domain için ayrı bir `job-simulator` script'i eklendi; aktif iş emirlerini okuyup ilgili `jobOrder` etiketli telemetry kayıtlarını işler ve good/defect üretim kayıtları yazar. Script telemetry kaynak seçimini explicit olarak yapar (`JOB_SIM_TELEMETRY_SOURCE`), sinyal 1 değilse üretim yazmaz ve fractional cycle hesaplarıyla ideal çevrim süresini simüle eder. Data-gen sinyali, makineye aktif job atanıp atanmadığına göre farklı olasılıklarla 1/0 üretecek şekilde güncellendi.
- **Gerekçe:** Üretim sayacı ile fiziksel sinyalin birbirinden kopmaması gerekiyordu; makine çalışmıyorsa scriptin üretim yazmaması, çalışıyorsa ideal tempoya göre veri üretmesi gerçek sahaya daha yakın bir davranış sağlıyor. Aynı zamanda idle durumunda sinyalin daha sık 0'a düşmesi, job varken 1'de kalması OEE/Production verilerini tutarlı kılıyor.
- **Etki:** `backend/scripts/job-simulator.js`, `backend/scripts/data-gen.js`, `.env.example` ve README güncellendi; `npm run data:gen` + `npm run job:sim` sırasıyla telemetry + üretim verisi üretiyor. Frontend Production sayfası gerçek JobOrder API'leriyle dolduruluyor.

### OEE Signal Timeout Konfigürasyonu

- **Domain:** Backend - oee/machines
- **Karar:** `oee-rules.json` içindeki `signalTimeoutMs` değeri devre dışı bırakıldı; OEE processor yalnızca `downtimeThresholdMs` süresince sinyal 0 kalırsa duruş açacak. Kısa süreli telemetry gecikmelerinde veya 1 değerinde dahi signal timeout tetiklenip makineyi `downtime` göstermeyeceği için Machines ekranı ile Monitoring ekranı senkron kalacak.
- **Gerekçe:** Data-gen kısa aralıklarda sinyal yazdığı halde signal timeout 10s olduğunda OEE worker sürekli “Otomatik tespit edilen duruş” event’i açıyor ve `Machine.status` alanını anlık olarak `downtime` yapıyordu. Bu durum UI’de sürekli duruş etiketi görülmesine yol açıyordu.
- **Etki:** `backend/src/domains/oee/config/oee-rules.json` güncellendi; signal timeout kaynaklı otomatik event'ler kaldırıldı, makine durumları telemetry’nin gerçek 0 serilerine göre değişiyor.
- **Onemlinot** sorun hala cozulemedi.

### OEE Downtime Tetiklemesinde İş Emri Bilinci

- **Domain:** Backend - oee/production
- **Karar:** OEE processor artık yalnızca makine gerçek bir iş emri yürütürken sinyal 0 serilerine göre otomatik duruş açacak; job yoksa veya makine duraklatıldıysa status IDLE’da tutulacak ve açık event’ler kapanacak.
- **Gerekçe:** Job atanmadığı halde telemetry’deki kısa 0 serileri makineyi sürekli “durdu” olarak işaretliyor, Machines kartları ile Monitoring/OEE verileri birbiriyle çelişiyordu.
- **Etki:** `backend/src/domains/oee/services/oee-processor.js` makine kaydını ve `currentJobOrder` alanını kontrol ediyor; downtime event’leri sadece RUNNING durumunda açılıyor, job bitince makine IDLE’a döndürülüyor.

### Data-Gen Aktif/Idle Profil Geçiş Penceresi

- **Domain:** Backend - machines/simulation
- **Karar:** Telemetry generator aktif işlerde yüksek sıcaklık/tork/enerji profiline, idle durumda düşük profile geçiyor; `DATA_GEN_TRANSITION_MS` ile ilk 10 saniyede hızlı ramp-up/down yapılıyor ve değerler daha sonra kademeli oturtuluyor.
- **Gerekçe:** İş emri başlatıldığında metriklerin dakikalarca düşük kalması ve durdurulduktan sonra uzun süre yüksek görünmesi monitoring ekranında gerçek dışı davranış yaratıyordu.
- **Etki:** `backend/scripts/data-gen.js`, `.env.example`, `.env` ve `backend/README.md` güncellendi; simülasyon parametreleri env üzerinden yönetiliyor ve Monitoring/Machines ekranları job start/pause aksiyonlarını kısa sürede yansıtıyor.

### Data-Gen Makine Durumu Yenileme Sıklığı

- **Domain:** Backend - machines/simulation
- **Karar:** Data-gen script’i aktif makineleri en geç 5 saniyede bir yeniden sorgulayarak `status` ve `currentJobOrder` alanlarını taze tutacak; `DATA_GEN_MACHINE_REFRESH_MS` varsayılanı 5000 ms olarak güncellendi.
- **Gerekçe:** Makine listesi yalnızca 60 saniyede bir yenilendiği için job start/completion olayları telemetry’de gecikmeli görünüyor, monitoring ekranı ile üretim sayacı arasında senkron problemi oluşuyordu.
- **Etki:** `backend/scripts/data-gen.js` makine listesini `ensureMachinesUpToDate` fonksiyonu ile periyodik olarak yeniliyor; `.env`, `.env.example` ve `backend/README.md` yeni varsayılan değeri açıklıyor. Job başlatma/durdurma aksiyonları telemetry grafiğine birkaç saniye içinde yansıyor.

### Parça Formu Varsayılan Makine Ayarları

- **Domain:** Frontend - parts
- **Karar:** Parça formu kategori sözlüğündeki `defaultValue` alanlarını varsayılan makine ayarı alanlarında placeholder olarak gösteriyor ve kullanıcı boş bıraktığında aynı değerleri kayda yazıyor.
- **Gerekçe:** Her yeni parçada feed rate/spindle gibi değerleri elle girmek zaman alıyordu; yanlış veya eksik girişler oluyordu.
- **Etki:** `frontend/src/features/parts/constants/part-categories.js` defaultValue alanlarıyla güncellendi, `part-form-dialog.jsx` ise bu değerleri hem placeholder olarak gösteriyor hem de boş alanları otomatik dolduruyor.

### Downtime v2 Planlı ve Plansız Semantiği

- **Domain:** Ortak - downtime/oee/production
- **Karar:** Plansız duruşlar telemetry eşiği ile otomatik açılır ve sinyal 1 gelince kapanır; ayrıca operatör job `in_progress` iken plansız duruşu manuel başlatabilir (reason zorunlu). Telemetry ile açılan plansız duruş 5 dk’dan uzun sürerse kapanışta “onay bekliyor” işaretlenir ve UI’dan onaylanır. Planlı duruşlar scheduler ile otomatik başlar ve otomatik biter; bitişte job resume denenir.
- **Gerekçe:** Operatörün “makineyi şimdi durduruyorum” senaryosunda 10 sn beklemeden duruşu başlatabilmesi ve sebep girebilmesi gerekir. Telemetry ile açılan kısa micro-stop’larda operatörü yormamak, uzun duruşlarda ise kayıt kalitesini artırmak için “onay bekliyor” görünürlüğü gerekir. Planlı duruşların otomatik olması, “uygulanmadı/skipped” ve “çakışma/conflict” gibi gerçek durumların ölçülebilir olmasını sağlar.
- **Etki:** `POST /api/downtimes/manual-start` ile operatör manuel plansız duruş açar; `POST /api/downtimes/:id/confirm` ile uzun plansız duruş onayı yapılır. UI akışı `Duruşlar` sayfasında başlatma + sınıflandırma + plan yönetimi üzerine kurulur.

### Downtime Event Yazımı Tek Kapı

- **Domain:** Backend - downtime/machines/oee/production
- **Karar:** Downtime event’leri (telemetry ve scheduler kaynaklı) doğrudan `MachineEvent.create` ile yazılmaz; tek entrypoint Downtime domain orchestrator/service olur ve altında `machine-event-service` kullanılır.
- **Gerekçe:** Tek açık event kuralı, makine status güncellemesi ve preempt gibi çakışma senaryoları tek bir yerde enforce edilmezse süreler şişer ve “makinenin şu anki state’i” belirsizleşir.
- **Etki:** `oee-processor` ve planlı scheduler, `downtime-orchestrator-service` üzerinden event aç/kapat çağırır; Production pause/resume akışı MachineEvent yazımı yapmaz.

### Downtime Event Snapshot Alanları

- **Domain:** Backend - machines/downtime
- **Karar:** Downtime event’i açılırken `jobOrder` (ObjectId) ve `reasonCategory` (planned|unplanned) değerleri event’e snapshot olarak yazılır; yalnızca `metadata.jobOrderNo` gibi string alanlarla yetinilmez.
- **Gerekçe:** `Machine.currentJobOrder` zaman içinde değişebileceği için geçmiş event’lerin “hangi job sırasında yaşandığı” güvenilir şekilde çıkarılamaz. Katalog değişse bile geçmiş event kategorisi sabit kalmalıdır.
- **Etki:** `MachineEvent` model/svc imzaları genişler; downtime listesi ve raporlama için event geçmişi daha güvenilir olur.

### Reason Kataloğu ve Kategori Modeli

- **Domain:** Ortak - oee/downtime/ui
- **Karar:** Reason katalog iki kategoriye ayrılır (planned/unplanned); `maintenance` planned kabul edilir. İlk faz minimum set + `other_planned` ve `other_unplanned` fallback kodları ile başlar; UI reason listesi `GET /api/oee/reasons` ile servis edilir.
- **Gerekçe:** Reason zorunluluğu varken “kaçış” seçenekleri yoksa kullanıcı akışı kilitlenir. Maintenance’in ayrı kategori olması filtre/OEE tarafında karmaşıklık yaratır.
- **Etki:** `oee-rules.json` reasonCatalog genişler, UI dropdown’ları tek endpoint’ten beslenir; event yazımında `reasonCategory` snapshot uygulanır.

### Düzeltme Penceresi ve Split Politikası

- **Domain:** Backend - downtime
- **Karar:** Reason değişimi normalde split ile yapılır (bitir + yeni event başlat). Yanlış seçimleri hızlı düzeltmek için 5 dk düzeltme penceresinde aynı event üzerinde PATCH izin verilir: event açıksa `startedAt + 5dk`, kapalıysa `endedAt + 5dk`.
- **Gerekçe:** Tek event içinde birden fazla reason süre kırılımını bozar; ancak saha kullanımı için “yanlış seçimi hızlı düzelt” ihtiyacı gerçek.
- **Etki:** `PATCH /api/downtimes/:id` sadece pencere içinde çalışır; pencere dışı değişiklik `POST /api/downtimes/:id/split` ile yapılır.

### Downtime RBAC Eşlemesi ve UI Erişimi

- **Domain:** Ortak - access-control/downtime
- **Karar:** İlk fazda yeni permission eklenmez; planlı kural CRUD `production.manage`, duruş sınıflandırma/düzeltme/split `work_orders.execute` ile korunur. Açık/geçmiş duruş listesi ve planlı run geçmişini operator ve supervisor görebilir.
- **Gerekçe:** MVP’de permission sayısını şişirmeden yetki ayrımını korumak; planlı kural yönetimi supervisor, operasyonel sınıflandırma operator sorumluluğunda.
- **Etki:** Frontend’de “Duruşlar” menüsü ve sayfası any-of guard ile açılır; backend route guard’ları mevcut permissionlarla yönetilir.

### Simülatör Planned Stopped Mode

- **Domain:** Backend - simulation/downtime
- **Karar:** Planlı downtime event açıkken data-gen sinyali ve metrikleri 0’a kilitler (planned stopped mode); planlı event bittiğinde normal mod’a döner.
- **Gerekçe:** Planlı duruş sırasında monitoring ekranında metriklerin “çalışıyor” gibi görünmesi operatör güvenini kırar ve duruşun gerçekliğini sorgulatır.
- **Etki:** `DATA_GEN_PLANNED_STOPPED_MODE` env ile kontrol edilen simülasyon davranışı; smoke test senaryolarında planlı duruş görsel olarak doğrulanabilir.

### Simülasyonları UI Üzerinden Yönetme

- **Domain:** Ortak - simulation/dev-tools
- **Karar:** `data-gen` ve `job-sim` script’leri terminal yerine UI’dan yönetilir: backend `/api/simulations` üzerinden process başlat/durdur yapılır ve stdout/stderr logları in-memory buffer’da tutulup UI’da gösterilir.
- **Gerekçe:** Gerçek makine entegrasyonu olmadığı için sistemin doğrulanması simülasyona bağlı; terminal bağımlılığını kaldırıp tek ekrandan “başlat/durdur + log” akışını standartlaştırmak gerekir.
- **Etki:** Backend’e `GET/POST /api/simulations/*` endpoint’leri eklendi, frontend’e `/simulations` sayfası ve sidebar menüsü eklendi. Endpoint’ler `production.manage` ile korunur; prod ortamında `ENABLE_SIMULATION_CONTROL=true` değilse kontrol kapalıdır. Loglar in-memory olduğu için backend restart’ında sıfırlanır.

### JobOrder orderNo Üretimi Silme Sonrası Güvenli

- **Domain:** Backend - production
- **Karar:** JobOrder `orderNo` otomatik üretimi `countDocuments` tabanlı sıra yerine “günün max sequence’i + 1” yaklaşımıyla yapılır; `E11000 duplicate key (orderNo)` durumunda otomatik numaralı oluşturma 5 denemeye kadar retry eder.
- **Gerekçe:** Completed job order silme sonrası prefix bazlı count düşerek aynı `orderNo` tekrar üretilebiliyor; ayrıca eşzamanlı oluşturmalarda çakışma riski var. Max+retry, ayrı counter koleksiyonu olmadan stabil ve pratik çözüm sağlar.
- **Etki:** `createJobOrder` artık duplicate orderNo’yu kullanıcıya ham `E11000` olarak yansıtmaz. Kullanıcı `orderNo` verirse çakışmada 409 döner, sistem otomatik üretiyorsa retry ile yeni sıra üretir.

### JobOrder orderNo Index Tanımı Tekilleştirme

- **Domain:** Backend - production
- **Karar:** JobOrder `orderNo` için index tanımı tek yerde tutulur; `orderNo` alanındaki `unique: true` yeterlidir, ayrıca `jobOrderSchema.index({ orderNo: 1 })` tanımı eklenmez.
- **Gerekçe:** Aynı index pattern’i iki kez tanımlamak Mongoose tarafında startup sırasında “duplicate schema index” uyarısı üretir ve gereksiz index oluşturma denemelerine yol açar.
- **Etki:** `backend/src/domains/production/models/job-order-model.js` içindeki duplicate `.index` kaldırıldı; unique kuralı korunur.

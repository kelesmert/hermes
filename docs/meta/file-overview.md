# Dosya Açıklamaları

Bu doküman, projedeki önemli dosya ve klasörlerin ne işe yaradığını hızlıca öğrenebilmek için tutulur. Yeni dosyalar eklendikçe güncellenecektir.

## Kök Dizin

- `.gitignore`: Git tarafından takip edilmemesi gereken dosya/klasörleri listeler (ör. `node_modules`, `.env`).
- `backend/`: Node.js + Express tabanlı API uygulaması.
- `frontend/`: React tabanlı istemci uygulaması; auth akışı, dashboard placeholder’ları ve kullanıcı/rol yönetimi ekranlarını barındırır.
- `docs/`: Gereksinimler, yol haritası, rapor ve genel notlar gibi bütün dokümanlar.
- `.specstory/`: IDE veya otomasyon araçlarının kullandığı yardımcı dosyalar.

## Backend

- `backend/package.json`: Backend projesinin bağımlılıkları ve script’leri (`npm run dev`, `npm run seed` vb.).
- `backend/.env.example`: Backend için gerekli ortam değişkenlerinin şablonu (Mongo URI, JWT secret, seed admin bilgileri).
- `backend/src/app.js`: Express uygulamasının ana tanımı; middleware’ler, `/` route’u ve hata yakalama burada.
- `backend/src/server.js`: HTTP sunucusunu oluşturur, MongoDB bağlantısını başlatır ve app’i dinlemeye açar.
- `backend/src/config/index.js`: Ortam değişkenlerini okuyup yapılandırma nesnesi sunar (port, client URL, JWT süreleri vb.).
- `backend/src/config/database.js`: Mongoose ile MongoDB bağlantısını kuran yardımcı fonksiyon.
- `backend/src/routes/index.js`: Tüm API rotalarını birleştirir (`/health`, `/auth`, `/users`, `/roles`, `/permissions`).
- `backend/src/routes/health-routes.js`: `/api/health` uç noktasını içerir; servis durumu için basit yanıt verir.
- `backend/src/domains/auth/`: Auth & RBAC domain’i; `controllers`, `services` (auth-service, token-service), `routes` (`auth-routes`), `models` (user, role, permission, refresh-token) klasörlerini içerir.
- `backend/src/domains/access-control/`: Rol ve permission yönetimi için controller/service/route dosyaları (`roles-routes`, `permissions-routes`).
- `backend/src/domains/users/`: Kullanıcı yönetimi domain’i; `users-controller`, `users-routes` burada bulunur.
- `backend/src/domains/machines/`: Makine domain’i; ilk etapta `models/machine-model.js` ile `machines` koleksiyonunu tanımlar, ileride ilgili controller/service/route dosyaları burada yer alacak.
- `backend/src/domains/machines/models/machine-telemetry-model.js`: Makineye ait anlık telemetry/sinyal kayıtlarını (`machine_telemetry` koleksiyonu) saklar; 0/1 sinyal değeri, timestamp ve metrikler içerir.
- `backend/src/domains/parts/`: Parça tanımları için domain; `models/part-model.js` parça, ideal süre ve üretilebildiği makineleri tutar, `constants/part-categories.js` kategori/birim/varsayılan makine ayarı sözlüğünü barındırır.
- `backend/src/domains/oee/config/oee-rules.json`: OEE/sinyal işleme domaini için downtime eşikleri, reason kod haritaları ve aggregation ayarlarının tutulduğu JSON konfigurasyonu.
- `backend/src/domains/oee/models/oee-machine-state-model.js`: Her makine için son sinyal değerini, aktif duruş event’ini ve sıfır (0) serisinin başlangıcını tutar; OEE job’u bu tabloyu kullanır.
- `backend/src/domains/oee/services/oee-processor.js`: Telemetry kayıtlarını batch halinde okuyup kuralları uygulayan servis; gerektiğinde `machine_events` üzerinde duruş başlatma/bitirme işlemleri yapar.
- `backend/src/domains/oee/services/oee-dashboard-service.js`: Telemetry/OEE verilerinden dashboard için gerekli ortalama, toplam ve trend verilerini üretir; board domain’i bu servis üzerinden API cevaplarını oluşturur.
- `backend/src/jobs/oee-processor-job.js`: Sunucu açıldığında çalışan cron benzeri job; belirlenen aralıklarla OEE processor servisini tetikler.
- `backend/src/domains/board/`: Dashboard’a yönelik metrikleri toplayan domain; `services/board-service.js` telemetry/OEE sonuçlarını birleştirir, `routes/board-routes.js` `/api/board/metrics` ve `/api/board/machines/:id/metrics` endpointlerini sunar.
- `backend/src/middleware/auth-guard.js`: JWT doğrulaması yaparak isteğe `req.auth` bilgisi ekler.
- `backend/src/middleware/permission-guard.js`: İstenen izinlere göre erişim kontrolü yapan middleware.
- `backend/src/models/index.js`: Domain modellerini preload eder (`domains/auth/models/*`).
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
- `backend/scripts/data-gen.js`: Simülasyon amaçlı telemetry/sinyal üretir; `npm run data:gen` ile çalıştırıldığında periyodik olarak `machine_telemetry` koleksiyonuna veri yazar.

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

### docs/tasks
- `docs/tasks/project-checklist.md`: Yapılacak işler listesi; tamamlananlar işaretli kalır.

### docs/meta
- `docs/meta/file-overview.md`: (Bu dosya) Önemli dosya ve klasörlerin kısa açıklamaları.
- `docs/meta/learning-guide.md`: Öğretici rehber; mimari ve akışların adım adım anlatımı.
- `docs/meta/summary.md`: Projeyi hızlıca kavramak için genel bakış dokümanı.
- `docs/meta/doc-maintenance.md`: Kod değişikliklerine göre hangi dokümanların güncelleneceğini anlatan bakım rehberi.

### docs/dev-notes
- `docs/dev-notes/backend-domain-plan.md`: Backend'i domain bazlı klasör yapısına taşımak için geçiş planı ve adımları.
- `docs/dev-notes/dashboard-next-steps.md`: Telemetry → OEE → board akışındaki gelecek iyileştirme planları ve hızlı bakım notları.

## Frontend

- `frontend/.env.example`: React/Vite projesi için API adresi, websocket URL’si gibi ortam değişkeni şablonu.
- `frontend/README.md`: Frontend klasörünün kapsamını ve ileride eklenecek komutları özetler.
- `frontend/src/app`: Uygulama sağlayıcıları (QueryClient, Theme, Router, Session) ve route guard’lar.
- `frontend/src/components/layout`: Sidebar, header, breadcrumbs ve kabuk bileşenleri.
- `frontend/src/features/*`: Domain odaklı modüller (auth, dashboard, raporlar, kullanıcılar vb.).
- `frontend/src/features/machines/`: Makine yönetimi modülü; liste, CRUD dialogları ve duruş kayıtlarını içeren bileşenler.
- `frontend/src/features/parts/`: Parça tanımları için liste + CRUD modülü; backend Parts domain’i ile çalışır, makine uyumluluğu ve varsayılan ayarların girildiği form bileşenlerini içerir.
- `frontend/src/features/monitoring/pages/monitoring.jsx`: Makine/hat seçimi yaparak anlık telemetry ve sinyal trendini gösteren canlı izleme sayfası.
- `frontend/src/features/users/components/`: Kullanıcı tablosu, kullanıcı formu, rol/permission yönetimi gibi modüler bileşenler.
- `frontend/src/lib/api/client.js`: Tüm frontend HTTP çağrılarını yapan axios instance; `baseURL` her zaman `VITE_API_URL`'dir.
- `frontend/src/lib/query-client.js`: TanStack Query client konfigürasyonu.
- `frontend/src/lib/storage.js`: LocalStorage helper ve `SESSION_STORAGE_KEY` tanımı.
- `frontend/src/styles/global.css`: Global tema/Reset ayarları.
- Teknoloji seti: Vite + React (JS), MUI, React Router v6, TanStack Query + axios, React Hook Form + Zod, TanStack Table + MUI, Recharts ve react-hot-toast. Tema hafif/sade tutulacak, durum yönetimi Context + custom hook ile başlayacak (gerekirse Zustand).
- Import alias kuralı: Hem frontend hem backend’de `@/` alias’ı kök `src/` klasörlerine işaret edecek; böylece dosya yapısı uzun relatif yollara ihtiyaç duymadan okunabilir kalacak.

> Not: Yeni dosyalar (örneğin RBAC middleware, simülasyon script’i, frontend bileşenleri) eklendikçe bu liste güncellenecek.

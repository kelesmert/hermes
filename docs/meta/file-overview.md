# Dosya Açıklamaları

Bu doküman, projedeki önemli dosya ve klasörlerin ne işe yaradığını hızlıca öğrenebilmek için tutulur. Yeni dosyalar eklendikçe güncellenecektir.

## Kök Dizin

- `.gitignore`: Git tarafından takip edilmemesi gereken dosya/klasörleri listeler (ör. `node_modules`, `.env`).
- `backend/`: Node.js + Express tabanlı API uygulaması.
- `frontend/`: React tabanlı istemci uygulaması (henüz iskelet aşamasında).
- `docs/`: Gereksinimler, yol haritası, rapor ve genel notlar gibi bütün dokümanlar.
- `.specstory/`: IDE veya otomasyon araçlarının kullandığı yardımcı dosyalar.

## Backend

- `backend/package.json`: Backend projesinin bağımlılıkları ve script’leri (`npm run dev`, `npm run seed` vb.).
- `backend/.env.example`: Backend için gerekli ortam değişkenlerinin şablonu (Mongo URI, JWT secret, seed admin bilgileri).
- `backend/src/app.js`: Express uygulamasının ana tanımı; middleware’ler, `/` route’u ve hata yakalama burada.
- `backend/src/server.js`: HTTP sunucusunu oluşturur, MongoDB bağlantısını başlatır ve app’i dinlemeye açar.
- `backend/src/config/index.js`: Ortam değişkenlerini okuyup yapılandırma nesnesi sunar (port, client URL, JWT süreleri vb.).
- `backend/src/config/database.js`: Mongoose ile MongoDB bağlantısını kuran yardımcı fonksiyon.
- `backend/src/routes/index.js`: Tüm API rotalarını birleştirir (`/health`, `/auth`).
- `backend/src/routes/health-routes.js`: `/api/health` uç noktasını içerir; servis durumu için basit yanıt verir.
- `backend/src/routes/auth-routes.js`: Register/login/refresh/logout HTTP endpoint’lerini tanımlar.
- `backend/src/routes/users-routes.js`: Kullanıcı listesi gibi endpoint’leri içerir; auth ve permission guard ile korunur.
- `backend/src/controllers/auth-controller.js`: Auth isteklerini alır, validasyon yapar ve servis katmanına yönlendirir.
- `backend/src/controllers/users-controller.js`: Yönetici kullanıcılar için kullanıcı listesini dönen controller.
- `backend/src/services/auth-service.js`: Kullanıcı kayıt/giriş, token üretimi ve yenileme gibi bütün auth iş mantığı.
- `backend/src/services/token-service.js`: Refresh token’ların veritabanında saklanması, yenilenmesi ve silinmesi.
- `backend/src/middleware/auth-guard.js`: JWT doğrulaması yaparak isteğe `req.auth` bilgisi ekler.
- `backend/src/middleware/permission-guard.js`: İstenen izinlere göre erişim kontrolü yapan middleware.
- `backend/src/models/permission-model.js`: Sistem genelindeki izinleri tanımlar; roller bu dokümanlara referans verir.
- `backend/src/models/role-model.js`: Roller için Mongoose şeması (isim, label, izinler, varsayılan rol).
- `backend/src/models/user-model.js`: Kullanıcı şeması; şifre hash alanı, birden fazla rol referansı ve `comparePassword` metodu içerir.
- `backend/src/models/refresh-token-model.js`: Refresh token koleksiyonu; token hash’i, kullanıcı ilişkisi ve durum kontrolü.
- `backend/src/utils/password.js`: Şifre hash’leme ve doğrulama yardımcıları (bcrypt).
- `backend/src/utils/jwt.js`: JWT access token üretimi ve doğrulama işlevleri.
- `backend/src/utils/token.js`: Rastgele refresh token değeri üretme ve hash’leme yardımcıları.
- `backend/src/utils/app-error.js`: Uygulama içinde kullanılacak özel hata sınıfı (HTTP durum kodlarıyla beraber).
- `backend/src/utils/async-handler.js`: Promise dönen controller fonksiyonlarını sarmalayarak hata yakalamayı kolaylaştırır.
- `backend/src/constants/roles.js`: Rol isimlerini merkezi bir yerde tanımlar (admin, supervisor, operator, viewer).
- `backend/src/constants/permissions.js`: Sistem genelinde kullanılacak izin anahtarlarını listeler (örn. `machines.read`).
- `backend/scripts/seed.js`: Varsayılan rol kayıtlarını ve `.env` üzerinden verilen admin hesabını oluşturan script (`npm run seed`).

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

## Frontend

- `frontend/.env.example`: React/Vite projesi için API adresi, websocket URL’si gibi ortam değişkeni şablonu.
- `frontend/README.md`: Frontend klasörünün kapsamını ve ileride eklenecek komutları özetler.
- Planlanan teknoloji seti: Vite + React (JS), MUI, React Router v6, TanStack Query + axios, React Hook Form + Zod, TanStack Table + MUI, Recharts ve react-hot-toast. Tema hafif/sade tutulacak, durum yönetimi Context + custom hook ile başlayacak (gerekirse Zustand).
- Import alias kuralı: Hem frontend hem backend’de `@/` alias’ı kök `src/` klasörlerine işaret edecek; böylece dosya yapısı uzun relatif yollara ihtiyaç duymadan okunabilir kalacak.

> Not: Yeni dosyalar (örneğin RBAC middleware, simülasyon script’i, frontend bileşenleri) eklendikçe bu liste güncellenecek.

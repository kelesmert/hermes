# Hermes MES MVP Öğrenim Rehberi

Bu rehber, backend ve frontend'i MVP hedefiyle nasıl kurduğumuzu öğretici şekilde özetler: tercih edilen teknolojiler, yapı taşları, akışlar, doğrulama ve tipik hataların teşhisi.

## Güncelleme Kuralları

**Ne zaman:** Yeni akış/süreç, setup değişikliği, yeni domain pattern

**Format:** Adım adım açıklama, öğretici format

---

## 1) Mimari Genel Bakış

- Monorepo klasörleri: `backend/`, `frontend/`, `docs/`.
- Katmanlar: routes → controllers → services → models → middleware → utils.
- İstek akışı: İstemci → route → (auth/RBAC middleware) → controller → service → model (Mongo) → yanıt.

## 2) Express (Neden ve Nasıl)

- Neden: Minimal, esnek, geniş ekosistem; REST API için ideal.
- Nasıl kullandık:
  - Uygulama kurulum: `backend/src/app.js` (JSON parse, CORS, 404 ve hata yakalama).
  - Sunucu: `backend/src/server.js` (HTTP server + Mongo bağlantısı + modelleri yükleme).
  - Rotalar: `backend/src/routes/*` (sağlık, auth, users).

## 3) Ortam Değişkenleri ve Konfigürasyon

- Şablon: `backend/.env.example` → gerçek değerler: `backend/.env`.
- Konfig okuma: `backend/src/config/index.js` (port, JWT süreleri vb.).
- Mongo bağlantısı: `backend/src/config/database.js` (`MONGO_URI`, `MONGO_DB_NAME`).
- Önemli anahtarlar: `PORT`, `MONGO_URI`, `MONGO_DB_NAME`, `JWT_SECRET`, `REFRESH_TOKEN_SECRET`, `TOKEN_EXPIRES_IN`, `REFRESH_TOKEN_EXPIRES_IN`.

## 4) MongoDB + Mongoose (ODM)

- Neden: Şema, doğrulama, ilişkiler, middleware desteği.
- Modeller:
  - `backend/src/domains/auth/models/permission-model.js`: İzinler (ör. `users.manage`).
  - `backend/src/domains/auth/models/role-model.js`: Roller, birden çok permission referansı.
  - `backend/src/domains/auth/models/user-model.js`: Kullanıcılar, birden çok rol referansı (en az bir rol şartı).
  - `backend/src/domains/auth/models/refresh-token-model.js`: Refresh token kayıtları (hash’li).
- Model yükleme: `backend/src/models/index.js` tüm domain modellerini require eder; `backend/src/server.js` başında yüklenir (MissingSchemaError çözümü).

## 5) Kimlik Doğrulama (Auth)

- Şifre: `bcryptjs` ile hash/karşılaştırma (`backend/src/utils/password.js`).
- JWT access token: `backend/src/utils/jwt.js` (kısa ömür, payload’da `sub` + `roles`).
- Refresh token: `backend/src/domains/auth/services/token-service.js` (crypto → SHA-256 → Mongo; yenilemede eskisi revoke edilir).
- Servisler: `backend/src/domains/auth/services/auth-service.js` (register/login/refresh/logout).
- Controller ve rotalar: `backend/src/domains/auth/controllers/auth-controller.js`, `backend/src/domains/auth/routes/auth-routes.js`.

## 6) RBAC (Role-Based Access Control)

- İlişki modeli: `permissions → roles → users`.
- Middleware:
  - `backend/src/middleware/auth-guard.js`: JWT doğrular, kullanıcıyı roller+izinlerle `req.auth` içine koyar.
  - `backend/src/middleware/permission-guard.js`: İstenen izin(ler) `req.auth.permissions` içinde mi?
- Örnek korunan rota: `GET /api/users` → `users.manage` izni gerekir.

## 7) Seed Script (Başlangıç Verileri)

- Dosya: `backend/scripts/seed.js`.
- Yapar: Permission/rol upsert, `.env` bazlı admin & sys hesaplarını güncelleme, yalnızca `dashboard.read + machines.read` iznine sahip viewer hesabı oluşturma, örnek makineler + parçalar + telemetry kayıtları ekleme. Seed tekrar çalıştırıldığında mevcut hesapların şifreleri `.env` değerine göre otomatik güncellenir.
- Çalıştırma: `cd backend && npm run seed`.

## 8) API’ler (Şu Ana Kadar)

- Sağlık: `GET /api/health` → servis durumu.
- Auth:
  - `POST /api/auth/login` → access + refresh token döner.
  - `POST /api/auth/refresh` → body: `{ "refreshToken": "..." }` → yeni token seti döner.
  - `POST /api/auth/logout` → body: `{ "refreshToken": "..." }` → ilgili refresh token iptal edilir.
- Kullanıcılar (`/api/users` → `users.manage` izni):
  - `GET /api/users` → tüm kullanıcıları listeler.
  - `POST /api/users` → yeni kullanıcı oluşturur.
  - `PATCH /api/users/:id` → kullanıcı bilgilerini/rollerini günceller.
  - `DELETE /api/users/:id` → kullanıcı siler.
- Roller & İzinler:
  - `GET /api/roles` → tüm rol kayıtlarını döner (`roles.manage` veya `users.manage` izni gerektirir).
  - `POST /api/roles`, `PATCH /api/roles/:id`, `DELETE /api/roles/:id` → rol CRUD işlemleri (`roles.manage`).
  - `GET /api/permissions` → izin sözlüğünü döner (`roles.manage` veya `users.manage`).
- Parçalar (`/api/parts`):
  - `GET /api/parts` → parça listesi, kategori/makine filtreleri (`parts.read`).
  - `POST /api/parts`, `PATCH /api/parts/:id`, `DELETE /api/parts/:id` → parça CRUD işlemleri (`parts.manage`).
  - Kategoriler/birimler/varsayılan makine ayarı alanları `backend/src/domains/parts/constants/part-categories.js` sözlüğünden doğrulanır; frontend formu da aynı sözlükle (kopya) beslenir.

## 9) Doğrulama (Postman)

- Login: `POST /api/auth/login` (JSON body: `username` + `password`) → `tokens.accessToken`’ı kopyala.
- Korumalı istek: `GET /api/users` → Authorization sekmesi `Bearer Token`, sadece token’ı gir (köşeli parantez yok).
- Refresh: `POST /api/auth/refresh` (body’de refresh token) → yeni access/refresh alırsın.

## 10) Hata Yönetimi ve Teşhis

- Hata yakalama: `backend/src/app.js` sonunda genel error middleware.
- Özel hata sınıfı: `backend/src/utils/app-error.js` (HTTP kodu + mesaj).
- Tipik hatalar:
  - 401: `Authorization` başlığı yok/bozuk/expired.
  - 403: Gerekli izin yok (permission guard engelledi).
  - MissingSchemaError: Model dosyası yüklenmemiş → `models/index.js` ile çözüldü.
  - “Kullanıcının en az bir rolü olmalıdır”: Eski tekil `role` verisini `roles` dizisine taşıdık (seed + login sırasında göç).

## 11) Standartlar ve Kurallar

- İsimlendirme: kebab-case (dosya/klasör/env anahtarı için kural olarak belirlendi).
- Kod: Modüler ve DRY; anlaşılması zor fonksiyonlarda kısa yorumlar.
- Test aracı: Postman varsayılan; farklı araç gerekirse özellikle belirtilecek.

## Not: Cookie Tabanlı Token Yönetimi (Opsiyonel)

- Şimdilik access token `Authorization: Bearer` ile gönderiliyor.
- Gereksinim doğarsa access/refresh token’lar HTTP-only, Secure, SameSite cookie’lerde saklanacak.
- Böyle bir geçiş yapılırsa CSRF koruması (double-submit token veya özel CSRF header) zorunlu olacak.
- Refresh akışı o senaryoda cookie rotation (eski refresh revoke, yenisi set) + oturum kapamada cookie’lerin temizlenmesi adımlarını izleyecek.

## 12) Hızlı Başlangıç

1. `mongod` çalışıyor olsun. 2) `cp backend/.env.example backend/.env` → değerleri doldur. 3) `cd backend && npm i && npm run seed && npm run dev`. 4) Postman ile `POST /api/auth/login` ve `GET /api/users` dene.

## 13) Sıradaki Adımlar (Öneri)

- Backend lint/test (ESLint + Jest/Supertest) ve Postman koleksiyonu.
- Makine modeli + olay kayıtları + simülasyon script’i.
- Frontend (Vite + React) iskeleti ve login akışı.

## 14) Frontend İskeleti ve Teknoloji Kararları

- Mimari: Vite + React (SPA) ve JavaScript; ihtiyaç halinde TypeScript’e geçilecek.
- UI: MUI bileşenleri; formlar/grafikler gerektiğinde farklı kütüphanelerle desteklenebilir.
- Router & Veri Katmanı: React Router v6, TanStack Query; HTTP çağrıları axios ile yapılacak, `baseURL = VITE_API_URL`.
- Formlar: React Hook Form + Zod doğrulama şemaları.
- Tablolar & Grafikler: TanStack Table + MUI compose, Recharts grafikler.
- Bildirimler: react-hot-toast.
- Tema: Hafif ve sade bir tema hedefleniyor; tasarım aşamasında netleşecek.
- Durum yönetimi: Öncelik Context + custom hook; karmaşık ihtiyaçta Zustand devreye alınacak.
- Ortam değişkenleri: `frontend/.env` içinde `VITE_API_URL=http://localhost:5000/api`; cookie tabanlı auth gerekirse `axios.withCredentials` aktif edilecek.
- Token saklama: Refresh token şimdilik `localStorage`’da tutulacak ve uygulama açılışında otomatik `refresh` çağrısı yapılacak; HttpOnly cookie’lere geçiş opsiyonel TODO olarak takip ediliyor.
- Import alias: Frontend’de `@/` alias’ı `src/` köküne işaret eder; backend tarafında şimdilik relatif path’ler kullanılmaya devam ediyor (alias geçişi plan çıktığı anda güncellenecek).
- App layout: Sol sidebar tüm navigasyonu barındıracak, üst header’da kullanıcı menüsü, genel arama ve notifications dropdown bulunacak; breadcrumbs zorunlu, mobil hedef değil fakat tablet uyumu sağlanacak.
- ESLint + Prettier: Frontend iskeletinin hemen ardından konfigüre edilip script’leri eklenecek; dokümantasyon güncel tutulacak.

## 15) Frontend Öğrenim Notları

- Detaylı dizin yapısı ve kurulum için `frontend/README.md` dosyasına bak.
- Auth entegrasyonu:
  - Login formu `/api/auth/login` endpoint’i ile çalışır; kullanıcılar kullanıcı adı + şifre girer (e-posta opsiyoneldir). SessionProvider backend’den gelen rol + permission detaylarını saklar (`ROLE_PERMISSIONS` yalnızca varsayılan roller için fallback olarak kullanılır).
  - Uygulama açılışında localStorage’daki refresh token ile otomatik `/api/auth/refresh` çağrısı yapılır; başarısız olursa session temizlenir.
  - Logout sırasında `/api/auth/logout` tetiklenir; axios interceptors 401 durumunda storage’ı silip `hermes:session-expired` event’i yayar.
- `Users` sayfasındaki TanStack Table gerçek `/api/users` verisini gösterir; aynı ekrandaki roller sekmesi `roles.manage` iznine sahip kullanıcılar için rol/permission CRUD akışını sunar.

## 16) Makine Domaini (Yeni)

- Model: `backend/src/domains/machines/models/machine-model.js` alanları `code`, `name`, `status`, `lastEventAt`, `tags`, `isActive` ve otomatik timestamp’lerden oluşur. `code` benzersizdir; UI aramalarında kullanılır.
- Durum enumları `backend/src/constants/machine-statuses.js` içinde tutulur (running/idle/downtime/maintenance/unknown) ve event sistemi bu değerleri kullanarak makine kaydındaki `status` + `lastEventAt` alanlarını güncelleyecektir.
- Event’ler ayrı koleksiyonda (`machine_events`, yapım aşamasında) saklanacak; makine modeli sadece son durumu özetlemek için denormalize alanlara sahiptir.
- Telemetry kayıtları `backend/src/domains/machines/models/machine-telemetry-model.js` ile `machine_telemetry` koleksiyonunda tutulur; her kayıt makine id’si, sinyal (0/1), timestamp ve seçili metrikleri içerir. Sinyal/OEE domain’i bu veriyi izleyip kuralları çalıştırır.
- `backend/src/domains/parts/models/part-model.js` parça tanımlarını ve hangi makinelerde üretilebileceğini tutar; production/job order akışı başlamadan önce bu domain’in geçerliliği kontrol edilmelidir.
- `backend/src/domains/oee/services/oee-processor.js` telemetry verilerini JSON konfigine göre işler; sinyal zaman aşımı kuralı sayesinde belirli süre veri gelmeyen makineler otomatik duruşa alınır. `backend/src/jobs/oee-processor-job.js` belirli aralıklarla bu servisi tetikler ve duruş eventlerini otomatik oluşturur/kapatır.
- `backend/src/domains/board/services/board-service.js` OEE sonuçları + telemetry ortalamalarını birleştirerek `/api/board/metrics` endpoint’ine veri sağlar (Dashboard izinli kullanıcılar varsayılan 2 sn polling ile tüketir; değer çevresel olarak ayarlanabilir).

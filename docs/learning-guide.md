# Hermes MES MVP Öğrenim Rehberi

Bu rehber, backend’i MVP hedefiyle nasıl kurduğumuzu öğretici şekilde özetler: tercih edilen teknolojiler, yapı taşları, akışlar, doğrulama ve tipik hataların teşhisi.

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
  - `backend/src/models/permission-model.js`: İzinler (ör. `users.manage`).
  - `backend/src/models/role-model.js`: Roller, birden çok permission referansı.
  - `backend/src/models/user-model.js`: Kullanıcılar, birden çok rol referansı (en az bir rol şartı).
  - `backend/src/models/refresh-token-model.js`: Refresh token kayıtları (hash’li).
- Model yükleme: `backend/src/models/index.js` tüm modelleri require eder; `backend/src/server.js` başında yüklenir (MissingSchemaError çözümü).

## 5) Kimlik Doğrulama (Auth)
- Şifre: `bcryptjs` ile hash/karşılaştırma (`backend/src/utils/password.js`).
- JWT access token: `backend/src/utils/jwt.js` (kısa ömür, payload’da `sub` + `roles`).
- Refresh token: `backend/src/services/token-service.js` (crypto ile rastgele değer → SHA-256 hash → DB; yenilemede eskisi iptal edilir).
- Servisler: `backend/src/services/auth-service.js` (register/login/refresh/logout).
- Controller ve rotalar: `backend/src/controllers/auth-controller.js`, `backend/src/routes/auth-routes.js`.

## 6) RBAC (Role-Based Access Control)
- İlişki modeli: `permissions → roles → users`.
- Middleware:
  - `backend/src/middleware/auth-guard.js`: JWT doğrular, kullanıcıyı roller+izinlerle `req.auth` içine koyar.
  - `backend/src/middleware/permission-guard.js`: İstenen izin(ler) `req.auth.permissions` içinde mi?
- Örnek korunan rota: `GET /api/users` → `users.manage` izni gerekir.

## 7) Seed Script (Başlangıç Verileri)
- Dosya: `backend/scripts/seed.js`.
- Yapar: Permission’ları ve rolleri upsert eder; `.env` ile verilen admin hesabını oluşturur/günceller.
- Çalıştırma: `cd backend && npm run seed`.

## 8) API’ler (Şu Ana Kadar)
- Sağlık: `GET /api/health` → servis durumu.
- Auth:
  - `POST /api/auth/login` → access + refresh token döner.
  - `POST /api/auth/refresh` → body: `{ "refreshToken": "..." }` → yeni token seti döner.
  - `POST /api/auth/logout` → body: `{ "refreshToken": "..." }` → ilgili refresh token iptal edilir.
- Kullanıcılar:
  - `GET /api/users` → korumalı; header: `Authorization: Bearer <accessToken>`.

## 9) Doğrulama (Postman)
- Login: `POST /api/auth/login` (JSON body: email+password) → `tokens.accessToken`’ı kopyala.
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

## Not: Cookie Tabanlı Token Yönetimi (Planlı)
- Şimdilik access token `Authorization: Bearer` ile gönderiliyor.
- İleride access/refresh token’lar HTTP-only, Secure, SameSite cookie’lerde saklanacak.
- Bu geçişte CSRF koruması zorunlu: double-submit token veya özel CSRF header.
- Refresh akışı: cookie rotation (eski refresh revoke, yenisi set) + oturum kapamada cookie’lerin temizlenmesi.

## 12) Hızlı Başlangıç
1) `mongod` çalışıyor olsun. 2) `cp backend/.env.example backend/.env` → değerleri doldur. 3) `cd backend && npm i && npm run seed && npm run dev`. 4) Postman ile `POST /api/auth/login` ve `GET /api/users` dene.

## 13) Sıradaki Adımlar (Öneri)
- Backend lint/test (ESLint + Jest/Supertest) ve Postman koleksiyonu.
- Makine modeli + olay kayıtları + simülasyon script’i.
- Frontend (Vite + React) iskeleti ve login akışı.

# Backend Zorunlu Standartları

> Bu dosya **BACKEND için ZORUNLU standartları** içerir.
>
> - Kesin kullanılacak teknolojiler ve bağımlılıklar
> - Klasör ve dosya yapısı standartları
> - Kritik metodların kullanım şekli ve örnekleri
>
> Buradaki kurallar, güncellenene kadar **değiştirilemez** kabul edilir.
> Neden böyle seçildiğini merak edersen `../logs/decision-log.md` ve `../logs/tech-decision-logs.md` dosyalarındaki kayıtları oku.

## 1. Temel Teknolojiler

- **Runtime & Framework:** Node.js (LTS) + Express 5.
- **Veritabanı:** MongoDB, Mongoose ODM ile birlikte.
- **Kimlik Doğrulama:** JWT access token + MongoDB’de saklanan hash’li refresh token mimarisi.
- **Şifreleme:** bcryptjs, minimum 10 salt round.
- **Konfigürasyon:** dotenv üzerinden `.env`, yapı `src/config` altında.
- **Geliştirme:** nodemon ile `npm run dev`.

Bu teknolojiler zorunludur; değiştirilmesi gerekiyorsa önce bu dosya güncellenir.

## 2. Proje Yapısı

```text
backend/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── middleware/
│   ├── models/
│   ├── utils/
│   └── constants/
├── scripts/
│   └── seed.js
└── package.json
```

- Tüm yeni kod ilgili klasöre (route/controller/service/middleware) yerleşir; “misc” klasörü oluşturulmaz.
- Model tanımları `src/models/` altında olmalı ve `src/models/index.js` üzerinden preload edilir.

## 3. Auth & RBAC Kuralları

- Access token `Authorization: Bearer <token>` başlığında taşınır.
- Refresh token kaydı `RefreshToken` koleksiyonunda SHA-256 hash ile tutulur; rotation sırasında eski kayıt revoke edilir.
- Her korumalı endpoint önce `auth-guard`, ardından gerekiyorsa `permission-guard` kullanır.
- İzin zinciri `permissions → roles → users` şeklindedir; kullanıcıların en az bir rolü olmak zorundadır.

## 4. Seed ve Konfigürasyon

- `npm run seed` komutu varsayılan permission/role ve admin kullanıcısını oluşturmak zorundadır.
- `.env.example` içindeki anahtarlar: `PORT`, `MONGO_URI`, `MONGO_DB_NAME`, `JWT_SECRET`, `REFRESH_TOKEN_SECRET`, `TOKEN_EXPIRES_IN`, `REFRESH_TOKEN_EXPIRES_IN`, seed admin bilgileri.
- Seed script’i eksik permission/role gördüğünde hata fırlatmak yerine upsert eder.

## 5. Hata Yönetimi

- `src/utils/app-error.js` sınıfı kullanılmadan genel `Error` fırlatılmayacak; HTTP kodu içeren `AppError` tercih edilir.
- `src/utils/async-handler.js` ile tüm async route/controller fonksiyonları sarılır.
- `app.js` içinde tanımlanan global error middleware kaldırılmayacak; loglama ileride geliştirilebilir ama middleware kalır.

## 6. Kod Standartları

- Tüm dosyalar kebab-case, yalnızca mongoose modelleri PascalCase sınıf isimlerine sahiptir.
- Importlarda `@/` alias’ı `backend/src/` dizinine işaret eder (`@/services/token-service` vb.).
- Tekrarlayan iş mantığı servis katmanında tutulur; controller’lar sadece doğrulama ve response’la ilgilenir.

## 7. API Sözleşmesi

- Versiyonlama: Şimdilik `/api` prefix’i, değişirse konfigden okunacak (`config.apiPrefix`).
- Health check route’u `/api/health` olarak kalır.
- Auth endpoint’leri: `/api/auth/register|login|refresh|logout`, başka path kullanılmaz.

Bu kurallar ihlal edilmemeli; değişiklik ihtiyacı olduğunda önce bu dosya güncellenir, ardından uygulama kodu.

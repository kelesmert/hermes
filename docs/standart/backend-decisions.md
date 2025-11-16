# Backend Zorunlu Standartları

> Bu dosya **BACKEND için ZORUNLU standartları** içerir.
>
> - Kesin kullanılacak teknolojiler ve bağımlılıklar
> - Klasör ve dosya yapısı standartları
> - Kritik metodların kullanım şekli ve örnekleri
>
> Buradaki kurallar, güncellenene kadar **değiştirilemez** kabul edilir.
> Neden böyle seçildiğini merak edersen `../logs/decision-log.md` ve `../logs/tech-decision-logs.md` dosyalarındaki kayıtları oku.

## Güncelleme Kuralları

**Ne zaman güncellenir:**

- Yeni backend standardı/kuralı belirlendiğinde
- Mimari pattern değiştiğinde
- Yeni domain pattern'i eklendiğinde
- Zorunlu kural ekleme/değişikliği yapıldığında

**Format:**

- Her kural bölüm başlığı altında olmalı (## Domain Yapısı, ## Auth & RBAC vb.)
- Zorunluluk seviyesini belirt: "zorunlu", "önerilen", "opsiyonel"
- Örnek kod varsa ekle
- Gerekçeyi kısa açıkla

**Önemli:**

- Bu dosya zorunlu kuralları içerir, kararlar `docs/logs/decision-log.md`'de
- Kurallar implementation bitmeden önce eklenmeli
- Her kural `docs/project-guidelines.md`'de referans edilmeli

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
│   ├── middleware/
│   ├── utils/
│   ├── constants/
│   ├── domains/
│   │   ├── auth/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── routes/
│   │   │   └── models/
│   │   ├── users/
│   │   └── ... (diğer domain klasörleri)
│   └── shared/ (ortak helperlar, event emitters vb. gerektiğinde)
├── scripts/
│   └── seed.js
└── package.json
```

- Domain bazlı yapı: Her domain (örn. `auth`, `users`, `machines`, `reports`) `src/domains/<domain>` altında kendi `models/services/controllers/routes` klasörlerine sahip olur. Domain dışı ortak kodlar `src/shared` altında tutulur.
- Model tanımları ilgili domain klasöründe bulunur ve `src/domains/<domain>/models/index.js` üzerinden preload edilir; gerekirse tüm domain modelleri `src/domains/index.js` içinde toplanabilir.

## 3. Auth & RBAC Kuralları

- Access token `Authorization: Bearer <token>` başlığında taşınır.
- Refresh token kaydı `RefreshToken` koleksiyonunda SHA-256 hash ile tutulur; rotation sırasında eski kayıt revoke edilir.
- Her korumalı endpoint önce `auth-guard`, ardından gerekiyorsa `permission-guard` kullanır.
- İzin zinciri `permissions → roles → users` şeklindedir; kullanıcıların en az bir rolü olmak zorundadır.
- Kullanıcı kayıtlarında `username` alanı zorunlu ve unique’tir. E-posta alanı opsiyoneldir ve yalnızca bildirim/şifre sıfırlama gibi süreçlerde kullanılır.
- Varsayılan rol piramidi `master > supervisor > operator > viewer` olarak tanımlıdır; master tüm izinlere sahiptir, supervisor üretim/operatör yönetimi yapar, operator yalnızca atanmış istasyonda iş yürütür.
- RBAC yönetimi için `domains/access-control` altında rol ve permission CRUD endpointleri bulunur (`/api/roles`, `/api/permissions`); kullanıcı yönetimi `/api/users` üzerinden yapılır.
- Makine domaini `domains/machines` altında konumlandırılacak; model katmanı `machines`, `machine_events` ve `machine_telemetry` koleksiyonlarını içerir, durum enumları `src/constants/machine-statuses.js` dosyasından okunur. Event oluşturulduğunda makine kaydındaki `status` + `lastEventAt` alanları güncellenir.
- **MachineTelemetry sistemi:** Her makine için 0/1 sinyal değeri, timestamp ve metrikler (sıcaklık, tork, enerji) `machine_telemetry` koleksiyonunda saklanır. `scripts/data-gen.js` bu verileri 2 saniye aralıklarla simüle eder.
- **OEE Domain:** `domains/oee` altında `OeeMachineState` modeli ve processor job bulunur. OEE Processor Job (`src/jobs/oee-processor-job.js`) telemetry verilerini batch olarak işler ve belirli süre (threshold) 0 sinyali algılandığında otomatik downtime kaydı (`machine_events`) oluşturur. `OeeMachineState` modeli her makine için son sinyal değeri, aktif duruş event'i ve sıfır serisi başlangıç zamanını tutar.
- **Board Domain:** `domains/board` altında dashboard için özet metrik endpoint'leri bulunur (`/api/board/metrics`, `/api/board/machines/:id/metrics`, `/api/board/machines/:id/telemetry`). Bu endpoint'ler frontend'in polling ile güncel veri çekmesini sağlar.
- **Parts Domain:** `domains/parts` altında parça yönetimi bulunur. Parçalar sabit kategoriler (fasteners, electronics, mechanical_plastics) üzerinden tanımlanır. Her kategori, izin verilen birim listesi ve varsayılan makine ayarı alanlarını (spindle hızı, reflow sıcaklığı, kalıp sıcaklığı) `src/parts/constants/part-categories.js` dosyasından okur. Bir parça birden fazla makineyle eşleştirilebilir; backend bu uyumluluğu doğrular.

## 4. Seed ve Konfigürasyon

- `npm run seed` komutu varsayılan permission/role ve sistem kullanıcılarını (master/admin ve sys/test) oluşturmak zorundadır.
- `.env.example` içindeki anahtarlar: `PORT`, `MONGO_URI`, `MONGO_DB_NAME`, `JWT_SECRET`, `REFRESH_TOKEN_SECRET`, `TOKEN_EXPIRES_IN`, `REFRESH_TOKEN_EXPIRES_IN`, seed kullanıcı bilgileri (`SEED_*_USERNAME`, `SEED_*_EMAIL`, `SEED_*_PASSWORD` vb.).
- Seed script’i eksik permission/role gördüğünde hata fırlatmak yerine upsert eder; username alanı boş olan kullanıcıları otomatik doldurur ve silinemez roller (master/viewer) için koruma uygular.

## 5. Hata Yönetimi

- `src/utils/app-error.js` sınıfı kullanılmadan genel `Error` fırlatılmayacak; HTTP kodu içeren `AppError` tercih edilir.
- `src/utils/async-handler.js` ile tüm async route/controller fonksiyonları sarılır.
- `app.js` içinde tanımlanan global error middleware kaldırılmayacak; loglama ileride geliştirilebilir ama middleware kalır.
- Tüm yeni Mongoose modelleri ortak `applyDefaultToJSON` helper’ını kullanarak `_id` → `id` dönüşümü yapmalı; `_id` alanına ihtiyaç duyulan özel modellerde helper dışarıda bırakılabilir.

## 6. Kod Standartları

- Tüm dosyalar kebab-case, yalnızca mongoose modelleri PascalCase sınıf isimlerine sahiptir.
- Importlarda `@/` alias’ı `backend/src/` dizinine işaret eder (`@/services/token-service` vb.).
- Tekrarlayan iş mantığı servis katmanında tutulur; controller’lar sadece doğrulama ve response’la ilgilenir.

## 7. API Sözleşmesi

- Versiyonlama: Şimdilik `/api` prefix’i, değişirse konfigden okunacak (`config.apiPrefix`).
- Health check route’u `/api/health` olarak kalır.
- Auth endpoint’leri: `/api/auth/register|login|refresh|logout`, başka path kullanılmaz.

Bu kurallar ihlal edilmemeli; değişiklik ihtiyacı olduğunda önce bu dosya güncellenir, ardından uygulama kodu.

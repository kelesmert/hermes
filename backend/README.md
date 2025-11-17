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
- Canlı telemetri simülasyonu için:
  ```bash
  npm run data:gen
  ```
  Bu script veri tabanına düzenli aralıklarla sinyal/telemetri yazar, OEE job’unu ve dashboard’u canlı tutar.
  - Interval değerleri ve sensör oynaklığı `.env` dosyasındaki `DATA_GEN_INTERVAL_MS`, `DATA_GEN_MACHINE_REFRESH_MS`, `DATA_GEN_TEMP_DELTA`, `DATA_GEN_TORQUE_DELTA`, `DATA_GEN_ENERGY_DELTA` değişkenleriyle ayarlanabilir; varsayılan `DATA_GEN_INTERVAL_MS=2000` olup frontend monitoring + OEE job polling’iyle hizalı tutulur.

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
│  │   └─ machines/       # makine ve durum kayıtları domaini
└─ scripts/seed.js
```

## Kullanıcı Akışı

- `POST /api/auth/login` yalnızca `username + password` kabul eder (e-posta opsiyoneldir).
- `auth-guard` access token’ı doğrular; `permission-guard` `users.manage`, `roles.manage` gibi izinleri kontrol eder.
- `/api/users` uçları listeleme, oluşturma, güncelleme ve silme işlemlerini sağlar; viewer rolü fallback olarak korunur.
- `/api/roles` ve `/api/permissions` uçları rol şablonlarını ve izin sözlüğünü yönetir; master/viewer rolleri seed tarafından silinemez.

## Yararlı Komutlar

| Komut          | Açıklama                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------ |
| `npm run dev`  | Nodemon ile geliştirme sunucusu                                                            |
| `npm run seed` | Permission/role + master/sys kullanıcıları ve örnek makine kayıtlarını oluşturur/günceller |
| `npm test`     | (Planlı)                                                                                   |

Yeni bağımlılık veya mimari karar eklemeden önce `docs/standart/backend-decisions.md` dosyasını güncelleyip onay alın.

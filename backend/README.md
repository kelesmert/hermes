# Backend

Node.js + Express tabanlı Hermes API’si bu klasörde yer alır. Mevcut sürüm:
- JWT + refresh token tabanlı auth ve kullanıcı adıyla giriş,
- RBAC yönetim uçları (`/api/users`, `/api/roles`, `/api/permissions`),
- Makine domaini için `machines` ve `machine_events` modelleri ile CRUD/event endpointleri,
- Seed script ile master/supervisor/operator/viewer rollerini, test hesaplarını ve örnek makineleri üretir.

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
 - Örnek makineler: `MCH-001 (Simülasyon Presi)` ve `MCH-002 (CNC Kesim)` varsayılan olarak eklenir.

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
| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Nodemon ile geliştirme sunucusu |
| `npm run seed` | Permission/role + master/sys kullanıcıları ve örnek makine kayıtlarını oluşturur/günceller |
| `npm test` | (Planlı) |

Yeni bağımlılık veya mimari karar eklemeden önce `docs/standart/backend-decisions.md` dosyasını güncelleyip onay alın.

# Hermes MES MVP

Hermes, mezuniyet projesi kapsamında geliştirilen hafif bir Manufacturing Execution System (MES) MVP’sidir. Amaç; Node.js/Express tabanlı backend, React tabanlı frontend ve MongoDB veritabanıyla kullanıcı kimlik doğrulaması, rol/izin yönetimi, makine izleme, raporlama ve AI destekli içgörüleri içeren modüler bir çözüm sunmaktır.

## Durum
- ✅ Backend temel iskeleti, JWT + refresh token tabanlı auth ve kullanıcı adıyla giriş yapan RBAC yönetimi (roles/permissions/users endpointleri + seed script) hazır.
- ✅ Frontend `/users` sayfası TanStack Table ve rol/izin yönetimi sekmesiyle gerçek API’lere bağlı; kullanıcı ekleme/düzenleme/silme ve viewer fallback akışları çalışıyor.
- 📋 Makine servisleri, raporlama, audit, AI ve diğer domainler roadmap’te planlı.
- 📝 Tüm zorunlu kurallar `docs/standart/` altında; karar günlükleri ve gereksinimler güncel tutuluyor.

## Teknoloji Yığını
| Katman | Teknolojiler |
| --- | --- |
| Backend | Node.js (LTS), Express 5, MongoDB + Mongoose, JWT, bcryptjs |
| Frontend | Vite + React (JS), MUI, React Router v6, TanStack Query, axios, React Hook Form + Zod, TanStack Table + MUI, Recharts, react-hot-toast |
| Ortak | dotenv, nodemon, `@/` import alias, ESLint + Prettier (planlı) |

## Depo Yapısı
```
hermes/
├── backend/        # Node.js + Express API
├── frontend/       # React uygulaması (Vite + React iskeleti hazır)
└── docs/           # Tüm proje dokümantasyonu
```

### Dokümantasyon Klasörleri
- `project-guidelines.md` – Ana rehber; iletişim kuralları, mimari özetler, doküman haritası.
- `standart/`
  - `backend-decisions.md`, `frontend-decisions.md`, `technical-decisions.md`, `naming-conventions.md` – Zorunlu kurallar.
- `logs/`
  - `decision-log.md`, `tech-decision-logs.md`, `chat-summary.md` – Neden/nasıl kayıtları, sohbet özetleri.
- `specs/`
  - `requirements.md`, `project-report.md`, `project-roadmap.md` – Gereksinimler, tez raporu, faz planı.
- `tasks/`
  - `project-checklist.md` – Yapılacaklar listesi (tamamlananlar işaretli kalır).
- `meta/`
  - `file-overview.md`, `learning-guide.md` – Dosya açıklamaları ve öğretici rehber.

Her çalışmaya başlamadan önce `docs/project-guidelines.md` içindeki yönlendirmeler izlenmeli; değişiklik gerektiren kurallar ilgili `docs/standart/` dosyalarında güncellenmelidir.

## Backend’i Çalıştırma
1. Gereksinimler: Node.js LTS, MongoDB.
2. Ortam dosyası:
   ```bash
   cd backend
   cp .env.example .env
   # .env içindeki Mongo/seed/JWT değerlerini doldur
   ```
3. Bağımlılıklar ve seed:
   ```bash
   npm install
   npm run seed
   ```
   > Seed script’i varsayılan roller + iki kullanıcıyı üretir:
   > - Master hesap: `admin / ChangeMe123!`
   > - Sys test hesabı: `sys / syssys`
4. Geliştirme sunucusu:
   ```bash
   npm run dev
   ```
   - Sağlık kontrolü: `GET http://localhost:5000/api/health`
   - Auth testleri: `POST http://localhost:5000/api/auth/login`

## Frontend’i Çalıştırma
1. Gereksinimler: Node.js LTS.
2. Ortam dosyası:
   ```bash
   cd frontend
   cp .env.example .env
   ```
3. Bağımlılıklar:
   ```bash
   npm install
   ```
4. Geliştirme sunucusu:
   ```bash
   npm run dev
   ```
   - Varsayılan adres: `http://localhost:5173/`
   - Login ekranında kullanıcı adı + şifre ile giriş yapılır (örn. `admin / ChangeMe123!`). `/users` sayfası kullanıcı/rol yönetimi ve izin sekmesini içerir.

> Not: Alias ve provider iskeleti hazır; UI bileşenlerini genişletmeden önce `docs/standart/frontend-decisions.md` kurallarını gözden geçirin. Yeni bağımlılıklar için `npm install <paket>` komutlarını manuel çalıştırmanız gerekebilir.

## Katkı ve İş Akışı
1. Güncel kurallar için `docs/project-guidelines.md` → `docs/standart/*.md` dosyalarını oku.
2. Karar değişikliği gerekiyorsa önce ilgili standart dosyasını güncelle, ardından implementasyon yap.
3. Her yeni teknoloji veya mimari tercih için `docs/logs/decision-log.md` / `docs/logs/tech-decision-logs.md` dosyalarına kayıt düş.
4. Görevleri `docs/tasks/project-checklist.md` üzerinden takip et; tamamlananları işaretlemeyi unutma.

## Lisans
Bu proje için lisans belirtilmedi. Kullanım koşulları proje sahibinin yönlendirmesine tabidir.

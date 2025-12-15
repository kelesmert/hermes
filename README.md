# Hermes MES MVP

## Güncelleme Kuralları

**Ne zaman güncellenir:** Proje durumu değiştiğinde, büyük milestone tamamlandığında, teknoloji stack'i değiştiğinde.

**Format:** Durum bölümü (✅/📋), teknoloji tablosu, kurulum adımları.

**Önemli:** Bu dosya projenin "vitrini"dir. Kısa, öz ve yeni geliştiriciler için ilk okuma kaynağı olmalı.

---

Hermes, mezuniyet projesi kapsamında geliştirilen hafif bir Manufacturing Execution System (MES) MVP'sidir. Amaç; Node.js/Express tabanlı backend, React tabanlı frontend ve MongoDB veritabanıyla kullanıcı kimlik doğrulaması, rol/izin yönetimi, makine izleme, raporlama ve AI destekli içgörüleri içeren modüler bir çözüm sunmaktır.

## Durum

- ✅ Backend: Auth + RBAC, Users, Access Control, Machines, Parts, OEE/Telemetry, Board (dashboard metrics API) ve Production (JobOrder + ProductionEvent) domainleri hazır; `data-gen` ve `job-sim` script'leri simülasyon verisi üretiyor.
- ✅ Frontend: Login, Users/Roles/Permissions, Machines, Parts, Dashboard, Monitoring ve Production/İş Emirleri ekranları gerçek API'lere bağlı.
- 📋 Reports + export, Audit log UI, AI içgörü modülü, cookie tabanlı token yönetimi ve test/lint altyapısı roadmap’te planlı.
- 📝 Tüm zorunlu kurallar `docs/standart/` altında; karar günlükleri ve gereksinimler güncel tutuluyor.

## Teknoloji Yığını

| Katman   | Teknolojiler                                                                                                                           |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Backend  | Node.js (LTS), Express 5, MongoDB + Mongoose, JWT, bcryptjs                                                                            |
| Frontend | Vite + React (JS), MUI, React Router v6, TanStack Query, axios, React Hook Form + Zod, TanStack Table + MUI, Recharts, react-hot-toast |
| Ortak    | dotenv, nodemon, `@/` import alias, ESLint (frontend), Prettier (planlı)                                                               |

## Depo Yapısı

```
hermes/
├── backend/        # Node.js + Express API
├── frontend/       # React uygulaması (Vite + React)
└── docs/           # Tüm proje dokümantasyonu
```

### Dokümantasyon Klasörleri

- `docs/project-guidelines.md` – Ana rehber; iletişim kuralları, mimari özetler, doküman haritası.
- `docs/meta/context-initialization-prompt.md` – Yeni oturumda context yükleme rehberi (hangi dosyalar okunmalı).
- `docs/standart/` – Zorunlu standartlar (backend/frontend/teknik/isimlendirme).
- `docs/logs/` – Karar ve teknik günlükler, context window kayıtları.
- `docs/specs/` – Gereksinimler, tez raporu, faz planı.
- `docs/tasks/` – Checklist (tamamlananlar işaretli kalır).
- `docs/meta/` – File overview + learning guide + bakım rehberi.

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
   >
   > - Master hesap: `admin / ChangeMe123!`
   > - Sys test hesabı: `sys / syssys`
4. Geliştirme sunucusu:
   ```bash
   npm run dev
   ```
   - Sağlık kontrolü: `GET http://localhost:5000/api/health`
   - Auth testleri: `POST http://localhost:5000/api/auth/login`
5. (Opsiyonel) Simülasyon:
   ```bash
   npm run data:gen
   npm run job:sim
   ```

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
   - Login ekranında kullanıcı adı + şifre ile giriş yapılır (örn. `admin / ChangeMe123!`); Dashboard/Monitoring/Production ekranları gerçek API’lerden beslenir.

> Not: UI tarafında kararlar ve zorunlu kurallar için `docs/standart/frontend-decisions.md` dosyasını kontrol edin. Yeni bağımlılık eklemeden önce ilgili dokümantasyonu güncelleyin.

## Katkı ve İş Akışı

1. Güncel kurallar için `docs/project-guidelines.md` → `docs/standart/*.md` dosyalarını oku.
2. Karar değişikliği gerekiyorsa önce ilgili standart dosyasını güncelle, ardından implementasyon yap.
3. Her yeni teknoloji veya mimari tercih için `docs/logs/decision-log.md` / `docs/logs/tech-decision-logs.md` dosyalarına kayıt düş.
4. Görevleri `docs/tasks/project-checklist.md` üzerinden takip et; tamamlananları işaretlemeyi unutma.

## Lisans

Bu proje için lisans belirtilmedi. Kullanım koşulları proje sahibinin yönlendirmesine tabidir.

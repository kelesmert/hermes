# Hermes MES – Hızlı Özet

Bu doküman, yeni bir geliştiricinin projeyi en kısa sürede kavraması için hazırlanmış bir "ön okuma"dır. Daha detaylı bilgi için ilgili dokümanlara yönlendirmeler içerir.

## Güncelleme Kuralları

**Ne zaman güncellenir:**

- Büyük bir domain tamamlandığında veya mimari yaklaşım değiştiğinde
- Teknoloji stack'i veya doküman bölümleri (deployment, test vb.) değiştiğinde

**Format:**

- Kısa ve öz (maksimum 60 satır), tablo formatını koru ve "Kaynak Dosyalar" referanslarını güncel tut

**Önemli:**

- Bu dosya özet olarak kalmalı, detay diğer dosyalara taşınmalı
- Her context window başında okunacak kısa bir "ön bilgi" sağlamalı

## 1. Amaç ve Kapsam

- Hermes, üretim sahaları için hafif bir Manufacturing Execution System (MES) MVP’sidir.
- Amaç: RBAC tabanlı kimlik doğrulama, kullanıcı/rol yönetimi, makine izleme, raporlama ve ileride AI destekli içgörüler sunmak.
- Veri kaynağı: Gerçek makineler yerine simülasyon script’i (roadmap’te).

## 2. Mimarî Panorama

| Katman   | Teknolojiler                                                                                                           | Kapsam                                                                                      |
| -------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Backend  | Node.js (Express 5), MongoDB + Mongoose, JWT + refresh tokens, bcrypt                                                  | Auth, RBAC, Machines/Parts/Production/OEE/Board/Downtime domainleri, seed + simülasyon scriptleri |
| Frontend | Vite + React (JS), MUI, React Router v7, TanStack Query/Table, axios, React Hook Form + Zod, Recharts, react-hot-toast | Auth akışı, yönetim ekranları, dashboard, monitoring, production, downtimes ve simulations sayfaları |
| Ortak    | dotenv, nodemon, `@/` alias (frontend), planlı ESLint/Prettier                                                         | Config, geliştirme deneyimi                                                                 |

## 3. Kaynak Dosyalar

- Readme ve kurulum: `README.md`, `backend/README.md`, `frontend/README.md`
- Repo haritası: `docs/meta/file-overview.md`, `docs/meta/learning-guide.md`
- Kapsam ve plan: `docs/specs/requirements.md`, `docs/specs/project-roadmap.md`, `docs/tasks/project-checklist.md`
- Downtime tasarım kaynağı: `docs/specs/downtime-design-v2.md`
- Simülasyon zamanı tasarımı: `docs/specs/sim-clock.md`
- Süreç ve standartlar: `docs/project-guidelines.md`, `docs/meta/doc-maintenance.md`, `docs/standart/*.md`

## 4. Öne Çıkan Özellikler

1. **RBAC ve Auth**: `permissions → roles → users`, username login, JWT access + refresh token rotation
2. **Telemetry Pipeline**: `shift-sim` (Simulation Clock) / `data-gen` + `machine_telemetry` + OEE processor (varsayılan shift-sim) + Board metrikleri + Monitoring grafikleri (Kaynak seçimi: shift vs live). Shift-sim koşusu bitince `shift_end` uygulanır (job `paused`, makine `idle`)
3. **Production**: JobOrder akışı (start/pause/resume/produce/complete) + telemetry tabanlı job simülatörü
4. **Downtime v2**: Planlı duruş scheduler (rule/run) + plansız duruş telemetry eşiği + `/downtimes` UI (sınıflandırma, 5 dk edit, split)
5. **Yönetim UI**: Sidebar layout + izin bazlı guard’lar, kullanıcı/rol/izin yönetimi ve domain CRUD ekranları
6. **Simülasyon Yönetimi**: `/simulations` sayfası ile `shift-sim`/`data-gen` ve `job-sim` başlat/durdur + log konsolu + shift-sim reset

## 5. Roadmap ve Eksikler

- **Tamamlanan:** Auth, Users, Machines, Parts, Production, OEE, Board, Downtime; Dashboard, Monitoring, Production, Downtimes ve Simulations sayfaları
- **Sıradaki:** Reports ekranı, export + audit log + AI işleri (detay: `docs/specs/project-roadmap.md`, `docs/specs/requirements.md`)

## 6. Nasıl Başlanır

1. `README.md` + `docs/meta/file-overview.md` ile repo yapısını kavra
2. `docs/specs/requirements.md` + `docs/specs/project-roadmap.md` ile kapsamı netleştir
3. README’lere göre ortamı çalıştır ve checklist ile doğrula (`docs/tasks/project-checklist.md`)

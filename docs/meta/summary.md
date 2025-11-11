# Hermes MES – Hızlı Özet

Bu doküman, yeni bir geliştiricinin projeyi en kısa sürede kavraması için hazırlanmış bir “ön okuma”dır. Daha detaylı bilgi için ilgili dokümanlara yönlendirmeler içerir.

## 1. Amaç ve Kapsam
- Hermes, üretim sahaları için hafif bir Manufacturing Execution System (MES) MVP’sidir.
- Amaç: RBAC tabanlı kimlik doğrulama, kullanıcı/rol yönetimi, makine izleme, raporlama ve ileride AI destekli içgörüler sunmak.
- Veri kaynağı: Gerçek makineler yerine simülasyon script’i (roadmap’te).

## 2. Mimarî Panorama
| Katman | Teknolojiler | Kapsam |
| --- | --- | --- |
| Backend | Node.js (Express 5), MongoDB + Mongoose, JWT + refresh tokens, bcrypt | Auth, RBAC, kullanıcı/rol/permission API’leri, seed script, ileride makine/rapor servisleri |
| Frontend | Vite + React (JS), MUI, React Router v6, TanStack Query/Table, axios, React Hook Form + Zod, Recharts, react-hot-toast | Login akışı, kullanıcı & rol yönetimi ekranları, dashboard/rapor placeholder’ları |
| Ortak | dotenv, nodemon, `@/` alias (frontend), planlı ESLint/Prettier | Config, geliştirme deneyimi |

## 3. Kaynak Dosyalar
- `README.md`: Repo yapısı, kurulum adımları ve teknoloji listesi.
- `backend/README.md` & `frontend/README.md`: Her katmanın çalışma talimatları.
- `docs/project-guidelines.md`: Dil, iletişim ve süreç kuralları; doküman haritası.
- `docs/meta/file-overview.md`: Önemli dosya/klasörlerin açıklamaları.
- `docs/meta/learning-guide.md`: Backend/frontend akışları ve doğrulama adımları.
- `docs/meta/doc-maintenance.md`: Kod değişikliğinde hangi dokümanların güncelleneceği.
- `docs/meta/summary.md` (bu dosya): Genel bakış; önce bunu oku.

## 4. Öne Çıkan Özellikler
1. **RBAC**: `permissions → roles → users` zinciri; kullanıcılar en az bir role sahip.
2. **Auth Akışı**: Username + şifre, JWT access token, Mongo’da saklanan hash’li refresh token, rotation destekli.
3. **API’ler**: `/api/auth/*`, `/api/users`, `/api/roles`, `/api/permissions`, `/api/health`, **/api/machines + /api/machines/:id/events** (makine domaini eklendi; rapor endpointleri roadmap’te).
4. **Seed Script**: Default roller (master/supervisor/operator/viewer) ve admin/sys kullanıcılarını üretir.
5. **Frontend UI**: Sidebar + header layout, guarded routing (PrivateRoute + PermissionGuard), TanStack Table tabanlı kullanıcı listesi, rol & izin yönetim modalları.
6. **Makine Domaini (Yeni)**: `machines` koleksiyonu (code, name, status, lastEventAt, tags, isActive) ve event modelleri hazır; endpointler makine CRUD’u ve event kaydını destekliyor, status güncellemeleri backend’de otomatik gerçekleşiyor, frontend’de `/machines` sayfası üzerinden yönetilebiliyor.

## 5. Roadmap ve Eksikler
- Makine modeli + simülasyon script’i + raporlama endpointleri.
- Dashboard/rapor ekranlarını gerçek veriye bağlama, export fonksiyonları.
- Audit log, AI içgörü modülü, cookie tabanlı token yönetimi, test/lint altyapısı.
- Ayrıntılar: `docs/specs/project-roadmap.md`, `docs/specs/requirements.md`.

## 6. Nasıl Başlanır?
1. `README.md` ve bu dosyayı oku; proje yapısını kavra.
2. Gereksinimler & roadmap (#5’teki dosyalar) ile kapsamı netleştir.
3. Backend & frontend README’lerine göre ortamı çalıştır (`npm run seed`, `npm run dev`).
4. Güncel kararlar ve standartlar için `docs/project-guidelines.md`, `docs/standart/*.md` dosyalarını kontrol et.
5. Kod veya doküman güncellemesi yaparken `docs/meta/doc-maintenance.md` rehberini takip et.

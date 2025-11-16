# MES MVP Yol Haritası

## 1. Genel Bakış

Amaç, Node.js/Express backend, React frontend ve MongoDB veritabanı kullanarak hafif ama işlevsel bir MES MVP'si geliştirmektir. Sistem kullanıcı kimlik doğrulama/rol yönetimi, makine durumu takibi, raporlama + AI destekli analiz ve audit log altyapısını kapsar. Tüm veri makine simülasyon script'i üzerinden üretilecektir.

## 2. Mimari Tasarım

- **Backend (Node.js + Express):** Auth/RBAC middleware, makine durum API'leri, raporlama ve AI analiz servisleri, audit log pipeline'ı.
- **Frontend (React):** Vite + React (JS) SPA; MUI bileşenleri, React Router v6, TanStack Query + axios, React Hook Form + Zod, TanStack Table + MUI, Recharts ve react-hot-toast ile auth akışı, dashboard, makine kartları, raporlama/analiz ekranları, audit log görünümü, opsiyonel çok dillilik altyapısı.
- **Veritabanı (MongoDB):** `users`, `roles`, `permissions`, `machines`, `machine_events`, `machine_telemetry`, `parts`, `reports`, `audit_logs` koleksiyonları.
- **Veri Simülasyonu:** `backend/scripts/data-gen.js` makine telemetry/sinyal verilerini üretir; OEE processor job bu verileri işler.
- **Dağıtım:** Lokal geliştirme öncelikli; Docker tabanlı dağıtım dokümantasyonu opsiyonel.

## 3. Geliştirme Fazları ve Milestones

### ✅ Tamamlanan Fazlar:

1. **Gün 1-2 - Hazırlık:** Gereksinim dokümantasyonu, repo yapısı, ortak config (lint, test, `.env.example`), kararların kaydı → **Tamamlandı**
2. **Gün 3-4 - Backend Temeli:** Express setup, Mongo bağlantısı, kullanıcı/rol şemaları, JWT auth ve RBAC middleware, admin seed script'i → **Tamamlandı**
3. **Gün 5-6 - Makine Servisleri:** Makine modeli, durum geçiş API'leri, olay geçmişi, veri simülasyon script'i (`data-gen.js`), örnek veriler → **Tamamlandı**
4. **Gün 7-9 - Frontend İskeleti:** Vite + React (JS), MUI layout, React Router v6, TanStack Query + axios, login sayfası, dashboard, makine kartları, polling altyapısı → **Tamamlandı**
5. **OEE & Telemetry (Ek):** Telemetry modeli, OEE processor job, Board domain (dashboard metrikleri), Monitoring sayfası (2s polling + Recharts grafikler) → **Tamamlandı**
6. **Parts Domain (Ek):** Parça tanımları, kategori sözlüğü (fasteners/electronics/mechanical_plastics), Parts CRUD API ve UI → **Tamamlandı**

### 🔄 Devam Eden Fazlar:

7. **Production Domain:** İş emirleri (JobOrder), üretim olayları, Parts entegrasyonu → **Devam ediyor** (Detay: `docs/roadmaps/production-roadmap.md`)

### ⏳ Planlanan Fazlar:

8. **Gün 10-11 - Raporlama & Export:** Backend agregasyon endpointleri, CSV/Excel export servisleri, frontend rapor ekranı genişletmesi ve filtreler, header'daki global arama.
9. **Gün 12-13 - Audit & AI:** Audit middleware ve log UI'sı, AI analiz prototipi (kural tabanlı veya hazır model entegrasyonu).
10. **Gün 14 - Kapanış:** End-to-end testler, dokümantasyon, lokal çalışma rehberi, opsiyonel docker-compose.

## 4. Riskler ve Notlar

- Tek kişilik ekip ve kısa süre nedeniyle özellik kapsamı MVP düzeyinde tutulmalı.
- AI modülü için hazır modeller veya basit kural bazlı analizler tercih edilmeli; daha karmaşık modeller sonraki fazlara bırakılabilir.
- Audit log ve raporlama altyapısının ileride gerçek zamanlı entegrasyonlara uyum sağlayacak şekilde tasarlanması önerilir.
- Domain bazlı roadmap'ler `docs/roadmaps/` klasörü altında ayrı dosyalar olarak tutulacak (örn: `production-roadmap.md`).

## 5. Güncel Durum

- **Tamamlanan Domainler:** Auth, Users, Access-Control, Machines, Parts, OEE, Board
- **Frontend Sayfaları:** Login, Dashboard, Monitoring, Users, Machines, Parts (CRUD ekranları hazır)
- **Telemetry/OEE Altyapısı:** Data-gen script çalışıyor, OEE job otomatik downtime algılıyor, Board API metrikleri sunuyor
- **Sıradaki:** Production domain implementasyonu, Reports sayfası genişletmesi

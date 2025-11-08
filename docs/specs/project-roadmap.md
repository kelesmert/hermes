# MES MVP Yol Haritası

## 1. Genel Bakış

Amaç, 10‑14 gün içinde Node.js/Express backend, React frontend ve MongoDB veritabanı kullanarak hafif ama işlevsel bir MES MVP’si geliştirmektir. Sistem kullanıcı kimlik doğrulama/rol yönetimi, makine durumu takibi, raporlama + AI destekli analiz ve audit log altyapısını kapsar. Tüm veri makine simülasyon script’i üzerinden üretilecektir.

## 2. Mimari Tasarım

- **Backend (Node.js + Express):** Auth/RBAC middleware, makine durum API’leri, raporlama ve AI analiz servisleri, audit log pipeline’ı.
- **Frontend (React):** Vite + React (JS) SPA; MUI bileşenleri, React Router v6, TanStack Query + axios, React Hook Form + Zod, TanStack Table + MUI, Recharts ve react-hot-toast ile auth akışı, dashboard, makine kartları, raporlama/analiz ekranları, audit log görünümü, opsiyonel çok dillilik altyapısı.
- **Veritabanı (MongoDB):** `users`, `roles`, `machines`, `machine_events`, `reports`, `audit_logs` koleksiyonları.
- **Veri Simülasyonu:** Ayrı bir Node script’i veya cron görevi; makine olayları üretip API veya direkt Mongo üzerinden kaydeder.
- **Dağıtım:** Lokal geliştirme öncelikli; Docker tabanlı dağıtım dokümantasyonu opsiyonel.

## 3. Geliştirme Fazları ve Milestones

1. **Gün 1‑2 – Hazırlık:** Gereksinim dokümantasyonu, repo yapısı, ortak config (lint, test, `.env.example`), kararların kaydı.
2. **Gün 3‑4 – Backend Temeli:** Express setup, Mongo bağlantısı, kullanıcı/rol şemaları, JWT auth ve RBAC middleware, admin seed script’i.
3. **Gün 5‑6 – Makine Servisleri:** Makine modeli, durum geçiş API’leri, olay geçmişi, veri simülasyon script’i, örnek veriler.
4. **Gün 7‑9 – Frontend İskeleti:** Vite + React (JS) kurulumu, `@/` alias konfigürasyonu, MUI tabanlı layout (sidebar + header + breadcrumbs + notifications dropdown), React Router v6 ile yönlendirme, TanStack Query + axios altyapısı, React Hook Form + Zod ile login sayfası, dashboard ve makine kartları için temel bileşenler (polling hazırlığı).
5. **Gün 10‑11 – Raporlama & Export:** Backend agregasyon endpointleri, CSV/Excel export servisleri, frontend rapor ekranı ve filtreler, header’daki global arama deneyiminin ilk versiyonu.
6. **Gün 12‑13 – Audit & AI:** Audit middleware ve log UI’sı, AI analiz prototipi (kural tabanlı veya hazır model entegrasyonu), sonuçların gösterimi.
7. **Gün 14 – Kapanış:** En-to-end testler, dokümantasyon, lokal çalışma rehberi, opsiyonel docker-compose hazırlığı ve gelecek iş listesi.

## 4. Riskler ve Notlar

- Tek kişilik ekip ve kısa süre nedeniyle özellik kapsamı MVP düzeyinde tutulmalı.
- AI modülü için hazır modeller veya basit kural bazlı analizler tercih edilmeli; daha karmaşık modeller sonraki fazlara bırakılabilir.
- Audit log ve raporlama altyapısının ileride gerçek zamanlı entegrasyonlara uyum sağlayacak şekilde tasarlanması önerilir.

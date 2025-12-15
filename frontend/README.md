# Hermes Frontend (Vite + React)

## Güncelleme Kuralları

**Ne zaman güncellenir:** Yeni komut/script eklendiğinde, kurulum adımları değiştiğinde, yeni env değişkeni eklendiğinde.

**Format:** Kurulum adımları, npm script'leri, env açıklamaları.

**Önemli:** Bu dosya teknik setup rehberidir. Kısa ve uygulamalı olmalı. Mimari detay `docs/` altında.

---

Bu klasör Hermes MES MVP'nin React tabanlı kullanıcı arayüzünü barındırır. Teknoloji seçimleri ve zorunlu kurallar için `docs/standart/frontend-decisions.md` dosyasını referans alın.

## Kurulum

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Varsayılan adres: `http://localhost:5173/`

- Login ekranında kullanıcı adı + şifre kullanılır (örn. `admin / ChangeMe123!`).
- Route erişimleri permission guard ile kontrol edilir; sidebar menüsü de permission'a göre filtrelenir.
- Mevcut sayfalar:
  - `/dashboard` (dashboard.read): global metrikler + seçili makine telemetry özeti
  - `/monitoring` (dashboard.read): canlı telemetry grafikler (2sn polling, kayan pencere)
  - `/production` (production.read): job order listesi + aksiyonlar (start/pause/resume/produce/complete/cancel)
  - `/machines` (machines.read): makine CRUD + event diyaloğu
  - `/parts` (parts.read): parça CRUD (kategori/birim/makine uyumluluğu)
  - `/users` (users.manage): kullanıcı yönetimi; roller/izinler sekmesi `roles.manage` izni ile açılır
  - `/reports` (reports.read): placeholder (raporlama genişletmesi planlı)

## Yapı

- `src/app` → Providers, tema ve route guard bileşenleri.
- `src/components/layout` → Sidebar, header, breadcrumbs ve kabuk bileşenleri.
- `src/features/*` → Domain odaklı modüller (auth, dashboard, raporlar, kullanıcılar, makineler, parçalar vb.).
- `src/lib` → axios client, query client ve yardımcılar.
- `src/styles/global.css` → Global CSS reset/tema ayarları.

`@/` alias’ı `src/` dizinine işaret eder; karmaşık relatif yollar yerine bu alias kullanılmalıdır.

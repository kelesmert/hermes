# Frontend Zorunlu Standartları

> Bu dosya **FRONTEND için ZORUNLU standartları** içerir.
>
> - Kesin kullanılacak teknolojiler
> - Klasör ve component yapısı standartları
> - Kritik UI / state yönetimi pattern'lerinin kullanım örnekleri
>
> Buradaki kurallar, güncellenene kadar **değiştirilemez** kabul edilir.
> Neden böyle seçildiğini merak edersen `../logs/decision-log.md` ve `../logs/tech-decision-logs.md` dosyalarındaki kayıtları oku.

## Güncelleme Kuralları

**Ne zaman güncellenir:**

- Yeni frontend standardı/kuralı belirlendiğinde
- Component pattern değiştiğinde
- Yeni feature pattern'i eklendiğinde
- Zorunlu kural ekleme/değişikliği yapıldığında

**Format:**

- Her kural bölüm başlığı altında olmalı (## Feature Yapısı, ## Component Kuralları vb.)
- Zorunluluk seviyesini belirt: "zorunlu", "önerilen", "opsiyonel"
- Örnek kod varsa ekle
- Gerekçeyi kısa açıkla

**Önemli:**

- Bu dosya zorunlu kuralları içerir, kararlar `docs/logs/decision-log.md`'de
- Kurallar implementation bitmeden önce eklenmeli
- Her kural `docs/project-guidelines.md`'de referans edilmeli

## 1. Temel Teknolojiler

- **Build Tool:** Vite (React + JavaScript template). TypeScript’e geçiş gerekiyorsa bu dosya güncellenecek.
- **UI Kiti:** MUI temel bileşenleri. Farklı form/grafik kütüphanesi eklemek gerekiyorsa önce gerekçesiyle burada belirtilir.
- **Router:** React Router v6.
- **Data Fetching:** TanStack Query (React Query) + axios.
- **Formlar:** React Hook Form + Zod.
- **Tablolar & Grafikler:** TanStack Table + MUI kombinasyonu ve Recharts.
- **Bildirim:** react-hot-toast.

Bu bağımlılıklar zorunludur; farklı kütüphane eklenmesi gerekiyorsa önce buraya yazılır.

## 2. Proje Yapısı

```text
frontend/
├── src/
│   ├── app/          (App providers, router, theme)
│   ├── features/     (domain odaklı modüller, örn. auth, dashboard)
│   ├── components/   (layout ve ortak UI)
│   ├── lib/          (axios instance, helpers, storage)
│   ├── hooks/        (paylaşılan custom hook'lar)
│   ├── styles/
│   └── assets/
└── vite.config.js
```

- Modül mantığı `src/features/<feature-name>` klasörleri ile yönetilir; feature dışında component eklenmez.
- Absolute import alias’ı `@/` → `src/`.

## 3. Layout & Navigasyon

- Uygulamanın ana kabuğu `AppLayout` bileşeniyle sağlanır: sol sidebar + üst header.
- Sidebar tüm modül menülerini içerir; icon + label formatı zorunludur.
- Header bölümleri: kullanıcı menüsü, genel arama alanı, notifications dropdown. Placeholder dahi olsa bu yapıyı korur.
- Breadcrumbs her korumalı sayfada görünür; React Router konfigürasyonu breadcrumb bilgisini route meta’sından alacak şekilde tasarlanır.
- Mobil tam destek zorunlu değil ancak tablet (≥768px) görünümü bozulmamalı.

## 4. Auth & State Yönetimi

- Access token bellek içinde tutulur; refresh token cookie’ye geçene kadar `localStorage`’da saklanır ve uygulama yüklenince `POST /api/auth/refresh` çağrısı yapılır.
- Auth girişleri kullanıcı adı + şifre ile yapılır. Login formu yalnızca `username` ve `password` alanlarını içermelidir (e-posta opsiyoneldir).
- Auth bilgisi `SessionProvider + useSession` ile yönetilir. Gerektiğinde Zustand kullanılabilir, ancak önce bu dosya güncellenecek.
- SessionProvider backend’den gelen rol + permission detaylarını saklar; `ROLE_PERMISSIONS` yalnızca varsayılan roller için fallback olarak tutulur.
- Route guard’lar:
  - `PrivateRoute`: kimlik doğrulaması gerekli sayfalar.
  - `PermissionGuard`: `requiredPermissions` dizisindeki tüm izinlerin varlığını kontrol eder (backend ile uyumlu).
- `/users` rotası TanStack Table ile kullanıcı listesini gösterir; kullanıcı silme/düzenleme dialogları yalnızca `users.manage` iznine sahip kullanıcılar için aktiftir. Aynı sayfadaki “Roller & İzinler” sekmesi `roles.manage` iznine sahip kullanıcılara açıktır.
- `/machines` rotası makine tablosu, CRUD modalları ve event diyaloğunu içerir; menüde `machines.read` izni ile görünür. Durum kaydı ekleyebilmek için kullanıcıların `machines.write` iznine sahip olması zorunludur.
- **Monitoring Sayfası (`/monitoring`):** Seçili makinenin canlı telemetry grafiklerini gösterir. TanStack Query `refetchInterval: 2000` ile backend'den telemetry serisi çeker. 10 dakikalık kayan pencere (telemetryWindowMs) içindeki veriler Recharts kütüphanesi ile görselleştirilir. Metrikler: Sinyal durumu (0/1), sıcaklık, tork, enerji tüketimi.
- **Dashboard Makine Kartları (`/dashboard`):** Board domain endpoint'leri (`/api/board/metrics`, `/api/board/machines/:id/metrics`) üzerinden veri alır. React Query `refetchInterval` ile polling yapılır; kart bileşenleri MUI Card + Grid yapısı kullanır.
- **Parts Sayfası (`/parts`):** Parça listesi TanStack Table ile gösterilir. CRUD modalları kategori/birim/makine uyumluluğu seçimlerini içerir. Kategori seçimi yapıldığında frontend `part-categories.js` konfigürasyonuna göre izin verilen birim ve makine ayarı alanlarını dinamik olarak gösterir.

## 5. Veri Erişimi ve Hata Yönetimi

- Tüm HTTP çağrıları `src/lib/api/client.js` içindeki axios instance üzerinden yapılır; baseURL `import.meta.env.VITE_API_URL` olarak belirlenir.
- axios interceptors: 401 durumunda otomatik logout veya login yönlendirmesi yapılır; request öncesinde access token header’a eklenir.
- TanStack Query query key konvansiyonu: `['machines', id]`, `['reports', filters]` vb. Tekil string kullanılmaz.
- Polling gerekiyorsa Query’nin `refetchInterval` özelliği kullanılır; manuel `setInterval` yasaktır.

## 6. Kod Standartları

- Dosya adları kebab-case; React bileşen dosyaları PascalCase ismini içerir (`machine-card.jsx` değil, `MachineCard.jsx`).
- Componentler `function ComponentName()` şeklinde tanımlanır; arrow component kullanılmazsa bile export satırında default değil named export tercih edilir.
- Styling: MUI `sx` prop’ları veya theme tabanlı stil dosyaları; rastgele inline style kullanılmaz.
- Tüm yeni bağımlılıklar `package.json` script’lerine uygun `npm` komutlarıyla eklenir.

## 7. ESLint & Prettier

- Frontend iskeleti çıktıktan sonra ESLint + Prettier konfigürasyonları hazır hale getirilecek.
- `npm run lint` ve `npm run format` script’leri `package.json` içinde bulunmak zorunda.
- VSCode ayarları (varsa) `.vscode/settings.json` ile paylaşılacak; fakat proje dışı araçlara bağımlı kalınmayacak.

Bu kurallar değişmeden uygulanır; revizyon gerektiğinde bu dosya güncellenir ve commit mesajında açıklanır.

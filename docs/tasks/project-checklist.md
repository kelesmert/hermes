# MES MVP Checklist

## Güncelleme Kuralları

**Ne zaman güncellenir:**

- Yeni bir feature/task tamamlandığında: `[ ]` → `[x]` işaretle
- Yeni bir görev kararı alındığında: İlgili bölüme (Backend/Frontend/Test) ekle
- Gelecek için planlanan işler: `[ ] (İleride)` etiketi ile ekle
- Opsiyonel iyileştirmeler: `[ ] (Opsiyonel)` etiketi ile ekle

**Format:**

- `[x]` Tamamlanan görev açıklaması
- `[ ]` Bekleyen görev açıklaması
- `[ ] (İleride)` Gelecek için planlanan görev açıklaması
- `[ ] (Opsiyonel)` Zorunlu olmayan iyileştirme açıklaması

**Önemli:**

- Görevler asla silinmez, sadece işaretlenir
- Her tamamlanan görev mutlaka `[x]` ile işaretlenmeli
- Yeni görevler eklenirken ilgili bölüme (Hazırlık/Backend/Frontend/Test ve Dağıtım) ekle
- Her context window sonunda checklist durumu gözden geçirilmeli

---

## Hazırlık

- [x] Kararlar ve kurallar dokümanı (`docs/project-guidelines.md`)
- [x] Yol haritası dokümanı (`docs/specs/project-roadmap.md`)
- [x] Tez raporu şablonu (`docs/specs/project-report.md`)
- [x] Gereksinim detaylandırması (`docs/specs/requirements.md` veya eşdeğeri)
- [x] Teknoloji seçimleri ve gerekçeleri dokümanı (`docs/logs/tech-decision-logs.md`)
- [x] Repo yapısının oluşturulması (backend/frontend klasörleri, ortak yapılandırmalar)
- [x] `.env.example` dosyaları (backend/frontend)
- [ ] Lint/test scriptleri ve temel proje ayarları (ilgili proje kurulumu tamamlandıktan sonra)
- [x] Lokal doğrulama (seed + dev sunucu + `/api/health` ve `/api/auth/login`)

## Backend

- [x] Node.js + Express projesi kurulumu
- [x] MongoDB bağlantısı ve konfigürasyonu
- [x] Kullanıcı, rol ve session modelleri
- [x] JWT tabanlı auth akışı (register/login/refresh/logout)
- [x] RBAC middleware ve korunan endpoint örnekleri
- [x] Admin kullanıcı seed script’i
- [ ] (Opsiyonel) Tokenları cookie tabanlı yönetime geçir (HTTP-only, Secure, SameSite), CSRF koruması ekle ve çoklu cihaz oturum yönetimi + aktif refresh listesi hazırla
- [x] Roller/izinler için CRUD endpoint’leri ve permission yönetim API’si
- [x] Makine domaini Faz 1: `machines` + `machine_events` modelleri, CRUD ve event API'leri, denormalize durum alanları
- [x] Makine domaini Faz 2: Veri simülasyon script'i (cron/scheduler) ve API'ye entegre event üretimi
- [x] MachineTelemetry modeli: 0/1 sinyal değeri, timestamp, metrikler (sıcaklık, tork, enerji)
- [x] OEE Processor Job: Telemetry batch processing, otomatik downtime detection (sıfır serisi > threshold → MachineEvent)
- [x] OeeMachineState modeli: Makine başına son sinyal, aktif event, sıfır serisi başlangıç zamanı
- [x] Board domain: Dashboard metrik endpoint'leri (`/api/board/metrics`, `/api/board/machines/:id/metrics`, `/api/board/machines/:id/telemetry`)
- [x] Parts domaini: model + CRUD endpointleri + RBAC izinleri ve seed verileri
- [x] Production domaini: JobOrder + ProductionEvent modelleri, CRUD + start/pause/resume/produce endpointleri ve telemetry bağlı job-simulator scripti
- [ ] Event zamanlarının lokal timezone desteği (UTC+3 gibi) için helper/formatlama katmanı
- [ ] Raporlama endpointleri (verimlilik, duruş süreleri vb.)
- [ ] CSV/Excel export servisi
- [ ] Audit log middleware’i ve kayıt koleksiyonu
- [ ] AI analiz modülü (kural tabanlı veya model entegrasyonu)
- [ ] Dashboard/rapor veri kaynaklarını gerçek makine/event akışıyla besleyecek polling/push servisleri _(Board domain ile kısmen tamamlandı; raporlama beklemede)_
- [ ] Auth akışı için refresh/logout endpoint testleri ve Postman senaryoları
- [ ] (İleride) Data-gen sinyal/metrik profillerini saha verisine göre ince ayarla (ramp-up/down parametreleri)

## Frontend

- [x] Frontend teknoloji kararları (Vite + React (JS), MUI, React Router v6, TanStack Query, axios, React Hook Form + Zod, TanStack Table + MUI, Recharts, react-hot-toast, Context/Zustand stratejisi)
- [x] Import alias konfigürasyonu (`@/` kısayolu hem frontend hem backend)
- [x] React (Vite) projesi kurulumu ve temel yapı
- [x] UI kit seçimi ve tema ayarları
- [x] App layout (sol sidebar + üst header + breadcrumbs + notifications dropdown)
- [x] Header genel arama ve bildirim dropdown placeholder bileşenleri
- [x] Auth sayfaları (login, logout, rol yönlendirmeleri)
- [x] Geçici localStorage tabanlı refresh token yönetimi (cookie geçişine hazırlık)
- [x] `/api/users` listesini TanStack Table ile entegre et; aktif/pasif toggle, rol atama ve filtreleme akışlarını tamamla
- [x] Dashboard layout ve genel metrik kartları (Board domain endpoint'leri, polling)
- [x] Makine kartları (durum renkleri, polling/React Query refetchInterval)
- [x] Monitoring sayfası: Seçili makine için canlı telemetry grafikler (2sn polling, 10dk kayan pencere, Recharts)
- [x] Parça yönetimi sayfası (liste + ekle/düzenle/sil formları, kategori/birim/makine uyumluluğu)
- [x] Production/İş Emirleri sayfası (liste, form dialog ve start/pause/resume/produce/complete aksiyon butonları)
- [ ] Raporlama sayfası + filtreler
- [x] Roller/izinler için yönetim ekranı; permission set düzenleme ve kullanıcıya rol atama modalları
- [x] Dashboard/rapor placeholder’larını gerçek makine/event verileriyle besleyip React Query polling/WebSocket desteği ekle _(dashboard kısmı tamamlandı, rapor ekranı beklemede)_
- [ ] CSV/Excel export butonları ve kullanıcı geri bildirimi
- [ ] Audit log görüntüleme ekranı
- [ ] AI analiz sonuçlarını gösteren bileşen
- [ ] Opsiyonel çok dillilik altyapısına hazırlık

## Test ve Dağıtım

- [ ] Backend için birim/entegrasyon testleri (Jest/Supertest)
- [ ] Frontend için temel component testleri (React Testing Library)
- [ ] ESLint + Prettier kurulumları, `npm run lint`/`format` script’leri ve dokümantasyonu
- [ ] Manual end-to-end senaryoların listesi
- [ ] Lokal çalıştırma rehberi (README güncellemesi)
- [ ] Docker/Docker Compose dosyaları (opsiyonel)
- [ ] Nihai raporlama ve gelecek iş listesi güncellemesi
- [ ] (Opsiyonel) Postman: cookie tabanlı login/refresh/logout senaryoları ve otomasyon testleri

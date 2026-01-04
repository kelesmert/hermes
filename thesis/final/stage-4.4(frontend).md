1) Sayfa Haritası (route’lar)

- /login (public)
- /dashboard (dashboard.read)
- /reports (reports.read)
- /ai (reports.read veya machines.read)
- /monitoring (dashboard.read)
- /users (users.manage)
- /machines (machines.read)
- /parts (parts.read)
- /production (production.read)
- /downtimes (work_orders.execute veya production.manage)
- /simulations (production.manage)
- / (redirect → /dashboard)
- * (not found)
KANIT: frontend/src/App.jsx

2) Sayfa Amaçları (tablo)

| Route | Sayfa | Amaç | Temel İşlemler | Backend Etkileşimi | Kanıt |
| --- | --- | --- | --- | --- | --- |
| /login | Login | Kullanıcı girişi | Giriş, token yenileme, çıkış | /api/auth/login, /api/auth/refresh, /api/auth/logout | frontend/src/features/auth/services/auth-api.js |
| /dashboard | Dashboard (Operasyon) | Anlık operasyon özeti | Kaynak/shift seçimi, makine durumları, duruş listesi | /api/board/operations, /api/board/metrics | frontend/src/features/dashboard/services/board-api.js |
| /monitoring | İzleme | Telemetry grafikleri | Makine seçimi, sinyal/metrik trendi | /api/board/machines/:id/telemetry | frontend/src/features/dashboard/services/board-api.js |
| /reports | Raporlar (OEE) | OEE özet ve trend | Makine/shift/range filtreleri, OEE trend, AI analizi | /api/oee/stats, /api/ai/oee-insight, /api/ai/insights/latest | frontend/src/features/reports/services/oee-api.js, frontend/src/lib/api/ai-api.js |
| /ai | AI Asistanı (Hub) | AI use case görünümü | Son analiz listesi, U1/U2/U3 kartları | /api/ai/insights, /api/ai/insights/:id | frontend/src/lib/api/ai-api.js |
| /users | Kullanıcı Yönetimi | Kullanıcı/rol/izin yönetimi | Listeleme, ekleme, güncelleme, silme | /api/users, /api/roles, /api/permissions | frontend/src/features/users/services/users-api.js |
| /machines | Makine Yönetimi | Makine listesi ve olaylar | Makine CRUD, event görüntüleme | /api/machines, /api/machines/:id/events | frontend/src/features/machines/services/machines-api.js |
| /parts | Parça Yönetimi | Parça listesi ve ideal süre | Parça CRUD | /api/parts | frontend/src/features/parts/services/parts-api.js |
| /production | İş Emirleri | Job order yönetimi | Job CRUD, start/pause/resume/produce/complete | /api/production/job-orders, /api/production/job-orders/:id/* | frontend/src/features/production/services/job-orders-api.js |
| /downtimes | Duruşlar | Planlı/plansız duruş yönetimi | Duruş listeleme, reason düzeltme, split, planlı kural yönetimi | /api/downtimes, /api/oee/reasons, /api/planned-downtime-rules, /api/planned-downtime-runs | frontend/src/features/downtime/services/downtime-api.js |
| /simulations | Simülasyonlar | Simülasyon kontrolü | Başlat/durdur/reset, log izleme | /api/simulations, /api/simulations/:name/* | frontend/src/features/simulations/services/simulations-api.js |

3) Kullanıcı Akışları (3–5 akış)

Login → Dashboard:
Kullanıcı giriş ekranından kullanıcı adı ve şifre ile oturum açar. Başarılı giriş sonrası uygulama ana kabuğa yönlenir ve dashboard sayfası yüklenir. Yetki kontrolü route seviyesinde yapılır ve erişim izni yoksa ilgili sayfaya girilemez. Dashboard, seçili kaynağa göre operasyonel KPI ve duruş listelerini gösterir. Kullanıcı burada kaynak ve shift tarihi seçerek güncel veriye bakabilir. Bu akış, auth ve board API’leri ile bütünleşiktir.
KANIT: frontend/src/App.jsx, frontend/src/features/auth/services/auth-api.js, frontend/src/features/dashboard/services/board-api.js

Monitoring → detay/istatistik:
İzleme ekranında kullanıcı makine seçer ve telemetry grafikleri görüntüler. Grafikler sinyal değeri ve metrikleri (sıcaklık/tork/enerji gibi) zaman ekseninde gösterir. Kaynak seçimi ile data-gen ve shift-sim akışları arasında geçiş yapılabilir. Veri, board telemetry endpoint’inden periyodik olarak çekilir. Bu ekran daha çok “anlık görünürlük” sağlayan bir izleme katmanı olarak çalışır. İstatistik ve özet metrikler rapor ekranına bırakılmıştır.
KANIT: frontend/src/features/monitoring/pages/monitoring.jsx, frontend/src/features/dashboard/services/board-api.js

Production/Job order yönetimi:
İş emirleri ekranında mevcut job order kayıtları listelenir ve yeni iş emri oluşturulabilir. Seçilen iş emri için start/pause/resume/produce/complete gibi aksiyonlar tetiklenir. Üretim event geçmişi ayrı bir liste/modal üzerinden izlenebilir. Bu akış üretim domain’i ile doğrudan entegredir ve rol bazlı yetki gerektirir. İş emri, parça ve makine ilişkisi kullanıcı arayüzünde doğrulanır. Böylece üretim süreci uçtan uca izlenebilir hale gelir.
KANIT: frontend/src/features/production/services/job-orders-api.js, backend/src/domains/production/routes/job-order-routes.js

Downtime yönetimi (reason/split/confirm):
Duruşlar sayfası, açık ve geçmiş duruşları listeler. Operatör, plansız duruşlar için reasonCode seçebilir ve düzeltme/split işlemleri yapabilir. Planlı duruş kuralları ayrı bir bölümde yönetilir ve run kayıtları görüntülenir. Reason katalog, OEE domain’inden alınır ve UI’da sınıflandırma için kullanılır. Bu akış, downtime ve planned downtime API’lerini birlikte kullanır. Duruş verileri OEE hesaplamasında da referans olarak kullanılır.
KANIT: frontend/src/features/downtime/services/downtime-api.js, backend/src/domains/downtime/routes/downtime-routes.js

Simulation çalıştırma & sonuç görüntüleme:
Simülasyonlar sayfasında data-gen, shift-sim ve job-sim gibi script’ler yönetilir. Kullanıcı simülasyonları başlatır/durdurur ve log konsolunda çıktıları izler. Reset aksiyonu, simülasyon verilerini sıfırlamak için kullanılır. Bu akış, simülasyonların gerçek cihazsız veri üretimi sağlamasına yardımcı olur. Simülasyon çıktıları, monitoring ve raporlama ekranlarında görünür hale gelir. Böylece demo ve tez senaryoları kısa sürede üretilebilir olur.
KANIT: frontend/src/features/simulations/services/simulations-api.js, docs/specs/sim-clock.md, docs/specs/mock-data.md

KANIT: frontend/src/App.jsx, frontend/src/features/**

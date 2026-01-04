1) API Yüzeyi Özeti (domain’lere göre)

Backend API yüzeyi, auth, kullanıcı/rol yönetimi, makine/telemetry, üretim, duruş, OEE, board (dashboard), simülasyon ve AI domain’lerine ayrılmıştır. Her domain kendi route dosyası üzerinden ` /api` öneki altında yayınlanır. Auth domain’i kamuya açık giriş/yenileme uçları sunarken, diğer domain’ler auth ve permission guard ile korunur. Üretim ve duruş süreçleri, hem operasyonel akış hem de raporlama için kritik verileri sağlar. OEE ve board domain’leri, telemetry ve event verilerinden metrik üretip UI tarafında kullanıma sunar. AI domain’i, U1 OEE Insight başta olmak üzere farklı use case’leri kapsayan ayrı bir API katmanı olarak konumlanmıştır.
KANIT: backend/src/app.js, backend/src/routes/index.js, backend/src/domains/**/routes/*.js

2) Endpoint Envanteri (tablo)

| METHOD | PATH | AUTH? | ROLE? | Amaç | Kanıt |
| --- | --- | --- | --- | --- | --- |
| GET | /api/health | Hayır | — | Sağlık kontrolü | backend/src/routes/health-routes.js |
| POST | /api/auth/register | Hayır | — | Kullanıcı kaydı | backend/src/domains/auth/routes/auth-routes.js |
| POST | /api/auth/login | Hayır | — | Giriş | backend/src/domains/auth/routes/auth-routes.js |
| POST | /api/auth/refresh | Hayır | — | Token yenileme | backend/src/domains/auth/routes/auth-routes.js |
| POST | /api/auth/logout | Hayır | — | Çıkış | backend/src/domains/auth/routes/auth-routes.js |
| GET | /api/users | Evet | users.manage | Kullanıcı listeleme | backend/src/domains/users/routes/users-routes.js |
| POST | /api/users | Evet | users.manage | Kullanıcı oluşturma | backend/src/domains/users/routes/users-routes.js |
| PATCH | /api/users/:id | Evet | users.manage | Kullanıcı güncelleme | backend/src/domains/users/routes/users-routes.js |
| DELETE | /api/users/:id | Evet | users.manage | Kullanıcı silme | backend/src/domains/users/routes/users-routes.js |
| GET | /api/roles | Evet | roles.manage veya users.manage | Rol listeleme | backend/src/domains/access-control/routes/roles-routes.js |
| POST | /api/roles | Evet | roles.manage | Rol oluşturma | backend/src/domains/access-control/routes/roles-routes.js |
| PATCH | /api/roles/:id | Evet | roles.manage | Rol güncelleme | backend/src/domains/access-control/routes/roles-routes.js |
| DELETE | /api/roles/:id | Evet | roles.manage | Rol silme | backend/src/domains/access-control/routes/roles-routes.js |
| GET | /api/permissions | Evet | roles.manage veya users.manage | İzin listeleme | backend/src/domains/access-control/routes/permissions-routes.js |
| GET | /api/machines | Evet | machines.read veya machines.write | Makine listeleme | backend/src/domains/machines/routes/machines-routes.js |
| POST | /api/machines | Evet | machines.write | Makine oluşturma | backend/src/domains/machines/routes/machines-routes.js |
| GET | /api/machines/:id | Evet | machines.read veya machines.write | Makine detayı | backend/src/domains/machines/routes/machines-routes.js |
| PATCH | /api/machines/:id | Evet | machines.write | Makine güncelleme | backend/src/domains/machines/routes/machines-routes.js |
| DELETE | /api/machines/:id | Evet | machines.write | Makine silme | backend/src/domains/machines/routes/machines-routes.js |
| GET | /api/machines/:id/events | Evet | machines.read veya machines.write | Makine event listesi | backend/src/domains/machines/routes/machines-routes.js |
| POST | /api/machines/:id/events | Evet | machines.write | Makine event oluşturma | backend/src/domains/machines/routes/machines-routes.js |
| GET | /api/parts | Evet | parts.read | Parça listeleme | backend/src/domains/parts/routes/part-routes.js |
| POST | /api/parts | Evet | parts.manage | Parça oluşturma | backend/src/domains/parts/routes/part-routes.js |
| GET | /api/parts/:id | Evet | parts.read | Parça detayı | backend/src/domains/parts/routes/part-routes.js |
| PATCH | /api/parts/:id | Evet | parts.manage | Parça güncelleme | backend/src/domains/parts/routes/part-routes.js |
| DELETE | /api/parts/:id | Evet | parts.manage | Parça silme | backend/src/domains/parts/routes/part-routes.js |
| GET | /api/production/job-orders | Evet | production.read/production.manage/work_orders.execute | İş emri listesi | backend/src/domains/production/routes/job-order-routes.js |
| POST | /api/production/job-orders | Evet | production.manage | İş emri oluşturma | backend/src/domains/production/routes/job-order-routes.js |
| GET | /api/production/job-orders/:id | Evet | production.read/production.manage/work_orders.execute | İş emri detayı | backend/src/domains/production/routes/job-order-routes.js |
| PATCH | /api/production/job-orders/:id | Evet | production.manage | İş emri güncelleme | backend/src/domains/production/routes/job-order-routes.js |
| DELETE | /api/production/job-orders/:id | Evet | production.manage | İş emri silme | backend/src/domains/production/routes/job-order-routes.js |
| GET | /api/production/job-orders/:id/events | Evet | production.read/production.manage/work_orders.execute | Üretim event listesi | backend/src/domains/production/routes/job-order-routes.js |
| POST | /api/production/job-orders/:id/start | Evet | production.manage veya work_orders.execute | İş emri başlatma | backend/src/domains/production/routes/job-order-routes.js |
| POST | /api/production/job-orders/:id/pause | Evet | production.manage veya work_orders.execute | İş emri duraklatma | backend/src/domains/production/routes/job-order-routes.js |
| POST | /api/production/job-orders/:id/resume | Evet | production.manage veya work_orders.execute | İş emri devam | backend/src/domains/production/routes/job-order-routes.js |
| POST | /api/production/job-orders/:id/complete | Evet | production.manage veya work_orders.execute | İş emri tamamlama | backend/src/domains/production/routes/job-order-routes.js |
| POST | /api/production/job-orders/:id/cancel | Evet | production.manage | İş emri iptal | backend/src/domains/production/routes/job-order-routes.js |
| POST | /api/production/job-orders/:id/produce | Evet | production.manage veya work_orders.execute | Üretim kaydı | backend/src/domains/production/routes/job-order-routes.js |
| GET | /api/downtimes | Evet | work_orders.execute veya production.manage | Duruş listesi | backend/src/domains/downtime/routes/downtime-routes.js |
| POST | /api/downtimes/manual-start | Evet | work_orders.execute veya production.manage | Manuel plansız duruş başlatma | backend/src/domains/downtime/routes/downtime-routes.js |
| POST | /api/downtimes/:id/confirm | Evet | work_orders.execute veya production.manage | Duruş onayı | backend/src/domains/downtime/routes/downtime-routes.js |
| PATCH | /api/downtimes/:id | Evet | work_orders.execute veya production.manage | Duruş güncelleme | backend/src/domains/downtime/routes/downtime-routes.js |
| POST | /api/downtimes/:id/split | Evet | work_orders.execute veya production.manage | Duruş split | backend/src/domains/downtime/routes/downtime-routes.js |
| GET | /api/planned-downtime-rules | Evet | work_orders.execute veya production.manage | Planlı duruş kuralları | backend/src/domains/downtime/routes/planned-downtime-rule-routes.js |
| POST | /api/planned-downtime-rules | Evet | production.manage | Planlı duruş kuralı oluşturma | backend/src/domains/downtime/routes/planned-downtime-rule-routes.js |
| PATCH | /api/planned-downtime-rules/:id | Evet | production.manage | Planlı duruş kuralı güncelleme | backend/src/domains/downtime/routes/planned-downtime-rule-routes.js |
| DELETE | /api/planned-downtime-rules/:id | Evet | production.manage | Planlı duruş kuralı silme | backend/src/domains/downtime/routes/planned-downtime-rule-routes.js |
| GET | /api/planned-downtime-runs | Evet | work_orders.execute veya production.manage | Planlı duruş run listesi | backend/src/domains/downtime/routes/planned-downtime-run-routes.js |
| GET | /api/oee/reasons | Evet | work_orders.execute veya production.manage | Reason katalog | backend/src/domains/oee/routes/oee-routes.js |
| GET | /api/oee/stats | Evet | dashboard.read | OEE istatistikleri | backend/src/domains/oee/routes/oee-routes.js |
| GET | /api/board/metrics | Evet | dashboard.read | Dashboard metrikleri | backend/src/domains/board/routes/board-routes.js |
| GET | /api/board/machines/:id/metrics | Evet | dashboard.read | Makine metrikleri | backend/src/domains/board/routes/board-routes.js |
| GET | /api/board/machines/:id/telemetry | Evet | dashboard.read | Telemetry serisi | backend/src/domains/board/routes/board-routes.js |
| GET | /api/board/operations | Evet | dashboard.read | Operasyon dashboard verisi | backend/src/domains/board/routes/board-routes.js |
| GET | /api/simulations | Evet | production.manage | Simülasyon listesi | backend/src/domains/simulations/routes/simulations-routes.js |
| POST | /api/simulations/:name/start | Evet | production.manage | Simülasyon başlatma | backend/src/domains/simulations/routes/simulations-routes.js |
| POST | /api/simulations/:name/stop | Evet | production.manage | Simülasyon durdurma | backend/src/domains/simulations/routes/simulations-routes.js |
| POST | /api/simulations/:name/reset | Evet | production.manage | Simülasyon veri reset | backend/src/domains/simulations/routes/simulations-routes.js |
| GET | /api/simulations/:name/logs | Evet | production.manage | Simülasyon logları | backend/src/domains/simulations/routes/simulations-routes.js |
| POST | /api/simulations/:name/logs/clear | Evet | production.manage | Log temizleme | backend/src/domains/simulations/routes/simulations-routes.js |
| GET | /api/ai/health | Evet | reports.read veya machines.read | AI sağlık | backend/src/domains/ai/routes/ai-routes.js |
| GET | /api/ai/insights | Evet | reports.read veya machines.read | AI analiz listesi | backend/src/domains/ai/routes/ai-routes.js |
| GET | /api/ai/insights/latest | Evet | reports.read veya machines.read | Son AI analiz | backend/src/domains/ai/routes/ai-routes.js |
| GET | /api/ai/insights/:id | Evet | reports.read veya machines.read | AI analiz detayı | backend/src/domains/ai/routes/ai-routes.js |
| POST | /api/ai/oee-insight | Evet | reports.read | OEE insight üretimi | backend/src/domains/ai/routes/ai-routes.js |
| POST | /api/ai/downtime-reason | Evet | machines.read | Duruş reason önerisi | backend/src/domains/ai/routes/ai-routes.js |
| POST | /api/ai/anomaly-risk | Evet | machines.read | Anomali risk analizi | backend/src/domains/ai/routes/ai-routes.js |

3) Çekirdek İş Akışları (kavramsal)

Kimlik doğrulama & yetkilendirme akışı: Kullanıcı giriş yaparak erişim token’ı alır ve tüm korumalı API’ler bu token ile çağrılır. Rollere bağlı permission listesi üzerinden endpoint erişimi sınırlandırılır. Kullanıcı yönetimi ekranı ile kullanıcılar, roller ve izinler yönetilir. Bu akış, auth ve kullanıcı/rol API’leriyle bütünleşik çalışır. Kritik API’ler: /api/auth/login, /api/auth/refresh, /api/users, /api/roles. Bu akış tamamlanmış durumdadır.
KANIT: backend/src/domains/auth/routes/auth-routes.js, backend/src/domains/users/routes/users-routes.js, backend/src/domains/access-control/routes/roles-routes.js

Makine/telemetry kayıt akışı: Simülasyonlar tarafından üretilen telemetry verileri veritabanına yazılır ve monitoring ekranlarında görüntülenir. Makine durumu ve event kayıtları telemetry işleme katmanı üzerinden güncellenir. Board domain’i, makine ve telemetry verilerinden dashboard metriklerini üretir. Monitoring ve dashboard ekranları bu akıştan beslenir. Kritik API’ler: /api/board/machines/:id/telemetry, /api/board/metrics, /api/board/operations. Bu akış tamamlanmış ve simülasyon kaynaklarıyla doğrulanmıştır.
KANIT: backend/src/domains/board/routes/board-routes.js, docs/specs/sim-clock.md, docs/specs/mock-data.md

Duruş (planlı/plansız) yönetim akışı: Plansız duruşlar telemetry eşiğiyle tespit edilip makine event’leri üzerinden kaydedilir. Planlı duruşlar ise rule/run modeliyle zamanlanır ve kural bazlı başlar/bitirir. Operatör, duruşları reasonCode ile sınıflandırabilir ve gerektiğinde split yapabilir. Duruş kayıtları raporlama ve OEE tarafında kullanılmak üzere saklanır. Kritik API’ler: /api/downtimes, /api/downtimes/:id/confirm, /api/planned-downtime-rules, /api/planned-downtime-runs. Bu akış tamamlanmış durumdadır.
KANIT: backend/src/domains/downtime/routes/downtime-routes.js, backend/src/domains/downtime/routes/planned-downtime-rule-routes.js, docs/specs/downtime-design-v2.md

OEE/mekanik metrik üretim akışı: OEE stats API’si seçilen pencere için planned/operating time ve A/P/Q hesaplarını döndürür. OEE hesaplama, telemetry, üretim event ve duruş kayıtlarını birlikte kullanır. Reports ekranı bu metrikleri özet ve trend olarak sunar. AI U1 insight servisi, OEE stats üzerinden açıklayıcı analiz üretir. Kritik API’ler: /api/oee/stats, /api/oee/reasons, /api/ai/oee-insight. OEE akışı tamamlanmış, AI U1 tamamlanmış, U2/U3 planlanmıştır.
KANIT: backend/src/domains/oee/routes/oee-routes.js, backend/src/domains/ai/routes/ai-routes.js, docs/specs/oee-design.md, docs/specs/ai-dev.md

4) Hata yönetimi / doğrulama / güvenlik notları (varsa dokümandan)

API katmanında auth guard ve permission guard ile rol bazlı erişim kontrolü uygulanır. JWT tabanlı erişim modeli ve refresh token yaklaşımı dokümantasyonda yer alır. Uygulama, merkezi bir hata yakalama katmanı ile 404 ve beklenmeyen hataları standart JSON formatında döndürür. CORS ve JSON payload limitleri temel güvenlik önlemleri olarak yapılandırılmıştır. Dokümantasyon, büyük değişikliklerin karar loglarına yansıtılmasını ve güvenlik varsayımlarının korunmasını önerir.
KANIT: backend/src/app.js, backend/src/middleware/auth-guard.js, docs/specs/requirements.md, docs/standart/backend-decisions.md

# MES MVP Gereksinim Dokümanı

## Güncelleme Kuralları

**Ne zaman güncellenir:** Gereksinim değiştiğinde, yeni özellik eklendiğinde, risk/açık soru ortaya çıktığında.

**Format:** Bölüm başlıklarına ekle (örn: ## Fonksiyonel Gereksinimler, ## Açık Sorular & Riskler), maddeli liste kullan.

**Önemli:** Büyük değişiklikler `decision-log.md`'ye de yansıtılmalı. Gerçekleşen gereksinimler silinmez, "Tamamlandı" işareti ile işaretlenir.

---

## 1. Proje Özeti

Bu proje, Node.js/Express backend, React frontend ve MongoDB veritabanı kullanarak hafif fakat işlevsel bir Manufacturing Execution System (MES) prototipi geliştirmeyi amaçlar. Sistem sahadaki gerçek makineler yerine bir simülasyon script’i tarafından üretilen verilerle beslenecek; kullanıcı yönetimi, makine izleme, raporlama ve temel yapay zekâ analizleri sağlayacaktır.

## 2. Kapsam

- **Dahil:** RBAC tabanlı kimlik doğrulama, dashboard, makine durum takibi, veri simülasyonu, raporlama/export, AI destekli içgörü, audit log, lokal çalışma/dokümantasyon.
- **Hariç:** Gerçek cihaz entegrasyonları, karmaşık üretim planlama modülleri, mobil uygulamalar, yüksek hacimli load testing, kurumsal SSO/OAuth (ileride eklenebilir).

## 3. Kullanıcı Rolleri

| Rol        | Açıklama                       | Yetkiler                                                                                                   |
| ---------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Master     | Sistemdeki tüm yetkilere sahip | Tüm modüllere erişim, kullanıcı/rol yönetimi, rapor/audit/AI onayı                                         |
| Supervisor | Üretim yöneticisi              | Dashboard (read), makineler (read/write), iş emri & vardiya kontrolü, rapor görüntüleme, operatör yönetimi |
| Operator   | Saha operatörü                 | Atanmış istasyonda iş emri yürütme, makine durum güncelleme, telemetri girişi                              |
| Viewer     | Misafir/izleyici               | Dashboard ve rapor ekranlarını görüntüler                                                                  |

> Not: Her kullanıcı en az bir role sahip olmak zorunda olup ihtiyaç halinde birden fazla rol atanabilir. Roller, merkezi bir izin (permission) koleksiyonuna bağlı olarak yetki kazanır.

## 4. Fonksiyonel Gereksinimler

1. **Kimlik Doğrulama & RBAC**
   - JWT tabanlı login/logout.
   - Tüm oturumlar kullanıcı adı + şifre ile açılır; e-posta adresi opsiyonel olup yalnızca bildirim/sıfırlama gibi durumlar için saklanır.
   - Refresh token mekanizması (opsiyonel ama önerilir).
   - Rol bazlı middleware ile endpoint koruması.
2. **Kullanıcı Yönetimi**
   - Admin tarafından kullanıcı oluşturma/düzenleme/silme.
   - Roller arası geçiş ve yetki ayarlama arayüzü.
3. **Dashboard**
   - Aktif makine sayısı, duruş süreleri, uyarılar gibi özet metrikler.
   - Son olaylar listesi ve hızlı aksiyon butonları.
4. **Makine İzleme**
   - Makine listesi ve durum renk kodları (Running/Idle/Downtime).
   - Detay ekranında geçmiş olaylar, notlar ve durum değiştirme aksiyonları.
   - MachineTelemetry sistemi: Her makine için 0/1 sinyal değeri, timestamp ve metrikler (sıcaklık, tork, enerji) kaydedilir.
   - OEE Processor Job: Telemetry verilerini arka planda işler, belirli süre 0 sinyali algılandığında **yalnızca makine aktif iş emri yürütüyorsa** otomatik downtime kaydı oluşturur; job yoksa veya makine duraklatıldıysa status IDLE’da kalır.
   - OeeMachineState: Her makine için son sinyal değeri, aktif duruş event'i ve sıfır serisi başlangıcını tutar.
5. **Canlı İzleme (Monitoring)**
   - Monitoring sayfası: Seçili makinenin canlı telemetry grafiklerini gösterir (Recharts).
   - 2 saniye polling interval ile backend'den telemetry serisi çekilir.
   - 10 dakikalık kayan pencere (telemetryWindowMs) içindeki veriler görüntülenir.
   - Metrikler: Sinyal durumu, sıcaklık, tork, enerji tüketimi.
6. **Dashboard**
   - Aktif makine sayısı, duruş süreleri, ortalama telemetry metrikleri gibi özet bilgiler.
   - Board domain endpoint'leri (`/api/board/metrics`, `/api/board/machines/:id/metrics`) üzerinden veri alır.
   - Makine kartları polling ile güncellenir (React Query refetchInterval).
7. **Parça Yönetimi**
   - Laptop fabrikası senaryosuna uygun sabit kategoriler (fasteners, electronics, mechanical_plastics) üzerinden parçalar tanımlanır.
   - Her kategori izin verilen birim listesini ve varsayılan makine ayarı alanlarını (ör. spindle hızı, reflow sıcaklığı, kalıp sıcaklığı) belirler; kullanıcı formda kategori seçince ilgili birim/ayar seçenekleri gösterilir.
   - Bir parça birden fazla makineyle eşleştirilebilir; backend bu uyumluluğu doğrular ve job order planlamasında kullanılacak kategori snapshot’ını saklar.
8. **Üretim (JobOrder) Yönetimi**
   - Supervisor rolü bir parça seçip uyumlu makineler arasından hedef makineyi belirleyerek iş emri oluşturur.
   - Start/pause/resume/produce/complete/cancel aksiyonları API tarafında ayrı endpoint’lerle sağlanır; izin kontrolleri `production.manage` ve `work_orders.execute` üzerinden yapılır.
   - `ProductionEvent` kayıtları her aksiyonu, üretim miktarını ve (varsa) hata tipini loglar; frontend’de olay geçmişi modalı üzerinden görüntülenir.
9. **Duruş Yönetimi (Downtime)**
   - Planlı ve plansız duruşlar `machine_events` timeline’ında tutulur, aynı anda 1 makinede yalnızca 1 açık event kuralı uygulanır.
   - Plansız duruşlar sadece telemetry eşiği ile açılır (minor stop eleme): makine aktif job yürütürken sinyal 0 serisi `downtimeThresholdMs` (varsayılan 10 sn) aşarsa açılır, sinyal 1 gelince kapanır.
   - Operatör plansız duruş başlatıp bitirmez, yalnızca reasonCode ile sınıflandırır. ReasonCode zorunludur; yanlış seçim için 5 dk düzeltme penceresi vardır, pencere sonrası reason değişimi split ile yapılır.
   - Planlı duruşlar scheduler ile otomatik başlar ve biter. Planlı kural modeli günlük tekrar (recurrence) ve tek seferlik tarih aralığını destekler; saat dilimi `Europe/Istanbul` olarak ele alınır.
   - Planlı duruş kuralı yalnızca seçili makineler için geçerlidir. Varsayılan öğle arası kuralı otomatik eklenmez, supervisor seçip ekler.
   - Çakışma yönetimi: kullanıcı planlı > öğle arası planlı > plansız. Planlı başlarken plansız açıksa kapatılır ve planlı başlar.
   - Yetki ayrımı: planlı kural CRUD supervisor, sınıflandırma/düzeltme/split operator ve supervisor (ilk fazda mevcut permissionlarla).
10. **Veri Simülasyonu**
   - `npm run shift:sim`: 07:00–18:00 vardiyası için deterministik, hızlandırılmış telemetry üretir (birkaç dakikada tüm vardiya). Kayıtlar `simulationRunId` ile etiketlenir. `data-gen` ile aynı anda çalıştırılmaz.
   - `npm run data:gen`: (Legacy) Her makine için telemetry sinyali (0/1) ve metrikler üretir. Aktif job varken sinyalin 1’de kalma olasılığı artırılmıştır, idle makinelerde rastgele 0/1 üretilir.
   - Sinyal/mount profili `DATA_GEN_TRANSITION_MS` ile yönetilir; varsayılan 10 saniye içinde sıcaklık/tork/enerji değerleri yeni moda hızlıca yaklaşır ve monitoring ekranları ramp-up/ramp-down davranışı gösterir.
   - `npm run job:sim`: Aktif JobOrder kayıtlarını okuyup telemetry timestamp’lerine göre ideal çevrim süresinden üretim miktarı hesaplar ve good/defect üretim eventleri oluşturur; sinyal 1 değilse üretim yazılmaz. Shift-sim koşularında üretim event’leri simülasyon zamanını korur.
   - OEE processor yalnızca `downtimeThresholdMs` boyunca sinyal 0 olduğunda duruş açar; signal timeout devre dışı bırakılmıştır.
11. **Raporlama & Export**
   - Verimlilik, OEE benzeri metrikler veya makine bazlı uptime/downtime süreleri.
   - Zaman aralığı/rol/etiket filtreleri.
   - CSV veya Excel çıktısı indirme.
12. **AI Destekli Analiz**
    - Toplanan verilerden “en stabil makine”, “duruş sebebi tahmini” gibi özetler.
    - İlk etapta kural tabanlı veya hazır servis kullanımı; ileride model genişletilebilir.
13. **Audit Log**
    - Login, kritik CRUD işlemleri, rol değişimleri gibi aksiyonlar kaydedilecek.
    - Basit arama/filtre arayüzü ile görüntülenebilecek.
14. **Bildirimler (Opsiyonel)**

- Kritik duruşlarda e-posta veya sistem içi uyarılar (MVP’de sadece dashboard bildirimleri).

## 5. İşlevsel Olmayan Gereksinimler

- **Performans:** Aynı anda onlarca kullanıcıyı sorunsuz idare edecek; istek başına < 500ms hedefi.
- **Güvenlik:** Şifreler bcrypt ile hash’lenecek, env değişkenleri gizli tutulacak, CORS ve rate limit ayarları yapılacak.
- **Denetlenebilirlik:** Audit log ve rapor sorguları geriye dönük analiz imkânı sunacak.
- **Bakım Kolaylığı:** Kod modüler olacak, config dosyaları ayrılacak, dokümantasyon güncel tutulacak.
- **Kullanılabilirlik:** UI bileşenleri anlaşılır, renk kodları standart; mobil uyumluluk temel düzeyde.
- **Dağıtılabilirlik:** Lokal çalıştırma yanında Docker ile hızlı kurulum opsiyonu.

## 6. Veri Modeli (Taslak)

- `users`: ad, soyad, e-posta, şifre hash, roller dizisi (en az bir rol), aktiflik durumu.
- `roles`: rol adı, açıklama, permission referansları, varsayılan rol bilgisi.
- `permissions`: sistem genelindeki aksiyonların (örn. `machines.read`, `reports.export`) tanımı; roller bu koleksiyondan izin referansı alır.
- `machines`: makine adı/kodu, açıklama, bağlı operatörler, mevcut durum.
- `machine_events`: makine, state, başlangıç/bitiş zamanları, reasonCode ve reasonCategory (planned|unplanned), jobOrder snapshot, metadata (plannedRuleId/runId, autoDetected vb.).
- `machine_telemetry`: makine id, timestamp, sinyal değeri (0/1), metrikler (sıcaklık, tork, enerji), kaynak bilgisi (simulator/edge_gateway), `intervalMs` ve simülasyon koşuları için `simulationRunId`.
- `oee_machine_states`: Makine başına son sinyal değeri, aktif downtime event referansı, sıfır serisi başlangıç zamanı; OEE processor job tarafından kullanılır.
- `parts`: parça adı/kodu, kategori, birim, ideal cycle time, uyumlu makineler, varsayılan makine ayarları.
- `planned_downtime_rules`: planlı duruş kuralları (machineIds, recurrence/one_time, timezone, priority, reasonCode, createdBy).
- `planned_downtime_runs`: planlı duruş çalıştırma kayıtları (scheduledStart/End, status, machineEventId, jobOrderId snapshot, debug).
- `reports`: rapor tipi, filtreler, sonuç özeti, oluşturulma tarihi.
- `audit_logs`: kullanıcı, aksiyon tipi, hedef kaynak, timestamp, ek bilgiler.
- `ai_insights`: algoritma tipi, çıktı, güven skoru, oluşturulma zamanı.

## 7. API Taslağı

- **Auth:** `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/register` (sadece admin).
- **Users:** `GET/POST/PATCH/DELETE /users`, `PATCH /users/:id/role`.
- **Machines:** `GET /machines`, `POST /machines`, `PATCH /machines/:id`, `POST /machines/:id/state`, `GET /machines/:id/events`.
- **Parts:** `GET /parts`, `POST /parts`, `PATCH /parts/:id`, `DELETE /parts/:id`, `GET /parts/:id/compatible-machines`.
- **Production:** `GET/POST /production/job-orders`, `PATCH /production/job-orders/:id`, `POST /production/job-orders/:id/start|pause|resume|produce|complete|cancel`, `GET /production/job-orders/:id/events`.
- **Board (Dashboard):** `GET /board/metrics` (global metrikler), `GET /board/machines/:id/metrics` (tekil makine), `GET /board/machines/:id/telemetry` (telemetry serisi).
- **OEE:** `GET /oee/reasons` (reason katalog).
- **Downtime:** `GET /downtimes`, `PATCH /downtimes/:id`, `POST /downtimes/:id/split`, `GET/POST/PATCH/DELETE /planned-downtime-rules`, `GET /planned-downtime-runs`.
- **Reports:** `GET /reports/summary`, `GET /reports/export`.
- **AI Insights:** `GET /insights/latest`, `POST /insights/recompute` (admin).
- **Audit:** `GET /audit?user=&action=&date=`.
- **Simulations:** `GET /simulations`, `POST /simulations/:name/start|stop`, `GET /simulations/:name/logs`, `POST /simulations/:name/logs/clear` (dev tool, `production.manage`).

## 8. Frontend Modülleri

- Auth sayfaları (login, şifre sıfırlama placeholder).
- Role-based yönlendirme guard'ları.
- Dashboard (özet kartlar, makine kartları, polling ile güncelleme).
- Monitoring sayfası (canlı telemetry grafikler, 2sn polling, Recharts).
- Makine listesi + detay modal/ekranı.
- Parts listesi + CRUD modal/ekranı (kategori/birim/makine uyumluluğu).
- Duruşlar sayfası: Açık duruşlar, planlı duruş kural yönetimi ve run geçmişi, geçmiş duruş filtreleri, reason sınıflandırma (5 dk edit + split).
- Simülasyonlar sayfası: `data-gen` ve `job-sim` script’lerini başlat/durdur, log konsolu.
- Raporlama ekranı (filtreler + tablo/grafik + export butonu).
- AI içgörü paneli.
- Kullanıcı yönetimi ekranları.
- Audit log tablosu.

## 9. Veri Simülasyon Gereksinimleri

- Çalışma aralığı konfigüre edilebilir olmalı (örn. her 30 saniye).
- Script tek seferde birden fazla makineyi güncelleyebilmeli.
- Oluşturulan olaylar, kaynağın “simulator” olduğu bilgisiyle etiketlenecek.
- Script ayrı bir Node süreci veya cron job olarak çalıştırılabilecek; CLI parametreleri desteklenecek.
- Opsiyonel: UI üzerinden simülasyonları yönetmek için `/simulations` sayfası ve ilgili backend API’leri kullanılabilir; prod ortamında bu kontrol env flag ile kapatılabilmelidir.

## 10. Test & Doğrulama

- Auth, makine ve raporlama endpoint’leri için birim/entegrasyon testleri (Jest/Supertest).
- Frontend kritik bileşenleri için React Testing Library ile smoke testler.
- Manuel senaryolar: login → dashboard → makine durumu güncelle → rapor indir → audit log kontrolü.
- Simülasyon script’i için dry-run modu (console çıktısı ile doğrulama).

## 11. Açık Sorular & Riskler

- AI analizinin kapsamı kural tabanlı mı kalacak, yoksa dış servis kullanımı mı gerekecek? (Karar verilmedi.)
- WebSocket gerçek zamanlılık gerekli mi, yoksa kısa aralıklı polling yeterli mi? (Şimdilik polling planlandı.)
- Deployment sadece lokal mi olacak yoksa basit bir bulut ortamı mı hedeflenecek? (Daha sonra kararlaştırılacak.)

## 12. Frontend Teknik Kararları

- Mimari: Vite + React (SPA) ve JavaScript; gerektiğinde TypeScript’e geçiş yapılacak.
- UI: MUI temel bileşenleri, ihtiyaç halinde spesifik formlar/grafikler için ek kütüphaneler kullanılacak.
- Router: React Router v7.
- Veri çekme: TanStack Query (React Query) + axios (`baseURL = VITE_API_URL`, gerekirse cookie tabanlı auth için `withCredentials` desteği devreye alınacak).
- Form doğrulama: React Hook Form + Zod.
- Tablo/Grafik: TanStack Table + MUI bileşenleri, Recharts.
- Bildirim: react-hot-toast.
- Durum yönetimi: Öncelik Context + custom hook; gerekirse Zustand devreye alınacak.
- Tema: Hafif ve sade yaklaşım hedefleniyor, detay kararı tasarım aşamasında verilecek.
- Env: `VITE_API_URL=http://localhost:5000/api` (backend ile uyumlu).
- Auth oturumu: Refresh token şimdilik `localStorage` içinde saklanacak; uygulama açıldığında otomatik `POST /api/auth/refresh` ile sessiz yenileme yapılacak. HttpOnly cookie yapısına geçiş opsiyonel bir iyileştirme olarak değerlendirilecek.
- Import alias: Hem frontend hem backend tarafında `@/` alias’ı tanımlanacak, uzun relatif yollar yerine bu kısayol kullanılacak.
- Layout: Sol sidebar + üst header ana kabuk olacak; sidebar tüm modül menülerini barındıracak, header’da kullanıcı menüsü, genel arama alanı ve notifications dropdown bulunacak. Breadcrumbs her korumalı sayfada gösterilecek. Mobil öncelik değil; tablet boyutu desteklenecek.
- Bildirim menüsü (header) ve genel arama için placeholder bileşenler ilk fazda hazırlanacak.
- ESLint ve Prettier, temel iskelet kurulduktan sonra eklenecek ve ortak kural seti oluşturulacak.

> Not: Bu doküman yaşayan bir kaynaktır; yeni gereksinimler veya kararlar alındıkça güncellenecektir.

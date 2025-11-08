# MES MVP Gereksinim Dokümanı

## 1. Proje Özeti
Bu proje, Node.js/Express backend, React frontend ve MongoDB veritabanı kullanarak hafif fakat işlevsel bir Manufacturing Execution System (MES) prototipi geliştirmeyi amaçlar. Sistem sahadaki gerçek makineler yerine bir simülasyon script’i tarafından üretilen verilerle beslenecek; kullanıcı yönetimi, makine izleme, raporlama ve temel yapay zekâ analizleri sağlayacaktır.

## 2. Kapsam
- **Dahil:** RBAC tabanlı kimlik doğrulama, dashboard, makine durum takibi, veri simülasyonu, raporlama/export, AI destekli içgörü, audit log, lokal çalışma/dokümantasyon.
- **Hariç:** Gerçek cihaz entegrasyonları, karmaşık üretim planlama modülleri, mobil uygulamalar, yüksek hacimli load testing, kurumsal SSO/OAuth (ileride eklenebilir).

## 3. Kullanıcı Rolleri
| Rol      | Açıklama | Yetkiler |
|----------|----------|----------|
| Admin    | Sistemin tamamını yönetir | Kullanıcı oluşturma/silme, rol atama, makine CRUD, rapor/audit görüntüleme, AI sonuçlarını onaylama |
| Supervisor | Üretim yöneticisi | Dashboard, makine durum değişimleri, rapor indirme, AI önerilerini görme |
| Operator | Makine operatörü | Kendine atanmış makineleri görüntüleme, durum güncelleme, not ekleme |
| Viewer   | Sadece okuma | Dashboard ve rapor ekranlarını görüntüler |

> Not: Her kullanıcı en az bir role sahip olmak zorunda olup ihtiyaç halinde birden fazla rol atanabilir. Roller, merkezi bir izin (permission) koleksiyonuna bağlı olarak yetki kazanır.

## 4. Fonksiyonel Gereksinimler
1. **Kimlik Doğrulama & RBAC**
   - JWT tabanlı login/logout.
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
5. **Veri Simülasyonu**
   - Script belirli aralıklarla rastgele durum değişiklikleri üretir.
   - Üretilen olaylar MongoDB’ye kaydedilir; gerekirse API üzerinden sisteme iletilir.
6. **Raporlama & Export**
   - Verimlilik, OEE benzeri metrikler veya makine bazlı uptime/downtime süreleri.
   - Zaman aralığı/rol/etiket filtreleri.
   - CSV veya Excel çıktısı indirme.
7. **AI Destekli Analiz**
   - Toplanan verilerden “en stabil makine”, “duruş sebebi tahmini” gibi özetler.
   - İlk etapta kural tabanlı veya hazır servis kullanımı; ileride model genişletilebilir.
8. **Audit Log**
   - Login, kritik CRUD işlemleri, rol değişimleri gibi aksiyonlar kaydedilecek.
   - Basit arama/filtre arayüzü ile görüntülenebilecek.
9. **Bildirimler (Opsiyonel)**
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
- `machine_events`: makine, durum, başlangıç/bitiş zamanları, notlar, tetikleyen kullanıcı/script bilgisi.
- `reports`: rapor tipi, filtreler, sonuç özeti, oluşturulma tarihi.
- `audit_logs`: kullanıcı, aksiyon tipi, hedef kaynak, timestamp, ek bilgiler.
- `ai_insights`: algoritma tipi, çıktı, güven skoru, oluşturulma zamanı.

## 7. API Taslağı
- **Auth:** `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/register` (sadece admin).
- **Users:** `GET/POST/PATCH/DELETE /users`, `PATCH /users/:id/role`.
- **Machines:** `GET /machines`, `POST /machines`, `PATCH /machines/:id`, `POST /machines/:id/state`, `GET /machines/:id/events`.
- **Reports:** `GET /reports/summary`, `GET /reports/export`.
- **AI Insights:** `GET /insights/latest`, `POST /insights/recompute` (admin).
- **Audit:** `GET /audit?user=&action=&date=`.
- **Simulation:** `POST /simulator/trigger` (opsiyonel manuel tetikleme).

## 8. Frontend Modülleri
- Auth sayfaları (login, şifre sıfırlama placeholder).
- Role-based yönlendirme guard’ları.
- Dashboard (özet kartlar, grafikler, uyarı listesi).
- Makine listesi + detay modal/ekranı.
- Raporlama ekranı (filtreler + tablo/grafik + export butonu).
- AI içgörü paneli.
- Kullanıcı yönetimi ekranları.
- Audit log tablosu.

## 9. Veri Simülasyon Gereksinimleri
- Çalışma aralığı konfigüre edilebilir olmalı (örn. her 30 saniye).
- Script tek seferde birden fazla makineyi güncelleyebilmeli.
- Oluşturulan olaylar, kaynağın “simulator” olduğu bilgisiyle etiketlenecek.
- Script ayrı bir Node süreci veya cron job olarak çalıştırılabilecek; CLI parametreleri desteklenecek.

## 10. Test & Doğrulama
- Auth, makine ve raporlama endpoint’leri için birim/entegrasyon testleri (Jest/Supertest).
- Frontend kritik bileşenleri için React Testing Library ile smoke testler.
- Manuel senaryolar: login → dashboard → makine durumu güncelle → rapor indir → audit log kontrolü.
- Simülasyon script’i için dry-run modu (console çıktısı ile doğrulama).

## 11. Açık Sorular & Riskler
- AI analizinin kapsamı kural tabanlı mı kalacak, yoksa dış servis kullanımı mı gerekecek? (Karar verilmedi.)
- WebSocket gerçek zamanlılık gerekli mi, yoksa kısa aralıklı polling yeterli mi? (Şimdilik polling planlandı.)
- Deployment sadece lokal mi olacak yoksa basit bir bulut ortamı mı hedeflenecek? (Daha sonra kararlaştırılacak.)

> Not: Bu doküman yaşayan bir kaynaktır; yeni gereksinimler veya kararlar alındıkça güncellenecektir.

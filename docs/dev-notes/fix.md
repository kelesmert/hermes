# Tutarsızlıklar ve Çözüm Seçenekleri

## Amaç

Bu doküman, repoda tespit edilen doküman kod ve konfigürasyon tutarsızlıklarını listeler.
Her tutarsızlık için gözlem, etkiler ve uygulanabilir çözüm seçenekleri sunar.
Bu dosya bir uygulama değildir ve herhangi bir kod değişikliği içermez.

## Okuma Notu

- Bu değerlendirme hazırlanırken `docs/specs/oee-downtime-design.md` dosyası bilinçli olarak okunmadı.

## Özet

| Id | Başlık | Öncelik | Risk tipi |
| --- | --- | --- | --- |
| T01 | Auth register endpoint erişimi | Yüksek | Güvenlik |
| T02 | React Router sürüm tutarsızlığı | Orta | Bakım uyumu |
| T03 | Monitoring polling standardı ihlali | Orta | Standart uyumu |
| T04 | Sys kullanıcı şifresi doküman tutarsızlığı | Düşük | Operasyonel |
| T05 | DATA_GEN delta env değişkenleri kullanılmıyor | Düşük | Operasyonel |
| T06 | Frontend role permissions fallback uyumsuzluğu | Orta | Yetkilendirme UX |
| T07 | Backend import alias standardı uygulanmıyor | Düşük | Kod okunabilirliği |
| T08 | Frontend export standardı ile kod farklı | Düşük | Stil standardı |

## T01 Auth register endpoint erişimi

### Gözlem

- `POST /api/auth/register` endpoint’i public görünüyor ve `auth-guard` ile korunmuyor.
- Register servisinde role input kabul ediliyor ve rol adı doğrulanıp kullanıcıya atanabiliyor.

Kaynaklar

- `backend/src/domains/auth/routes/auth-routes.js`
- `backend/src/domains/auth/controllers/auth-controller.js`
- `backend/src/domains/auth/services/auth-service.js`

### Etki

- Self sign up hedeflenmiyorsa yetkisiz kullanıcı oluşturma riski doğar.
- Role seçimi kontrolsüz kalıyorsa, yanlış yapılandırma durumunda yüksek yetkili rol atanması gibi kritik bir güvenlik açığı oluşabilir.
- Ürün gereksinimi ile gerçek davranış birbirinden kopar.

### Çözüm Seçenekleri

Seçenek A Admin only kayıt

- `register` endpoint’ini `auth-guard` arkasına al ve `users.manage` veya `roles.manage` ile kısıtla.
- Payload’dan rol seçimini kaldır veya sadece admin izinli kullanıcıların rol atamasına izin ver.

Seçenek B Sınırlı self registration

- `register` endpoint’i public kalır ama rol seçimi tamamen backend tarafından sabitlenir.
- Örnek yaklaşım: her kayıt otomatik `operator` default rolü ile açılır, dışarıdan rol parametresi kabul edilmez.

Seçenek C Feature flag ile kapatma

- Üretim ortamında `register` endpoint’ini devre dışı bırakacak bir config flag eklenir.
- Lokal demo ortamında açık kalabilir.

### Dokümantasyon Etkisi

Karar verilince aşağıdaki dokümanların güncellenmesi gerekir

- `docs/specs/requirements.md`
- `docs/project-guidelines.md`
- `docs/logs/decision-log.md`

### Kabul Kriterleri

- Yetkisiz kullanıcılar `register` ile hesap oluşturamıyor veya oluşturabiliyorsa rol kontrolü backend tarafından güvenli şekilde sabitleniyor.
- İstenen akış dokümanda net ve kod ile birebir uyumlu.

## T02 React Router sürüm tutarsızlığı

### Gözlem

- Dokümanlarda React Router v6 geçiyor.
- Frontend bağımlılığında `react-router-dom` sürümü v7 görünüyor.

Kaynaklar

- `docs/standart/frontend-decisions.md`
- `docs/project-guidelines.md`
- `README.md`
- `frontend/package.json`

### Etki

- Yeni geliştirme yapılırken yanlış dokümana göre hareket edilmesi riski.
- V6 ve V7 arasında API farkları varsa ileride refactor maliyeti ve bug riski.

### Çözüm Seçenekleri

Seçenek A Dokümanı gerçekle hizalama

- Projede v7 kullanılmaya devam eder.
- İlgili dokümanlar v7 olarak güncellenir ve varsa v6 referansları kaldırılır.

Seçenek B Dependency downgrade

- Dokümanlar v6 ise frontend dependency v6’ya çekilir.
- V7 ile gelen davranışlar varsa uygulama kodu uyumlanır.

Seçenek C Versiyon politikası ekleme

- Dokümanlarda sadece major hedef belirtilir ve `package.json` tek doğruluk kaynağı ilan edilir.
- Sürüm yükseltme düşürme kararları `decision-log` ile takip edilir.

### Dokümantasyon Etkisi

- `docs/standart/frontend-decisions.md`
- `docs/project-guidelines.md`
- `README.md`
- `docs/logs/decision-log.md`

### Kabul Kriterleri

- Dokümanlarda yazan router major sürümü ile `frontend/package.json` uyumlu.
- Router kullanım pattern’i seçilen sürüme göre örneklerle net.

## T03 Monitoring polling standardı ihlali

### Gözlem

- Frontend standardı polling için React Query `refetchInterval` kullanılmasını ve manuel `setInterval` kullanılmamasını söylüyor.
- Monitoring sayfasında telemetry incremental fetch için manuel `setInterval` kullanılıyor.

Kaynaklar

- `docs/standart/frontend-decisions.md`
- `frontend/src/features/monitoring/pages/monitoring.jsx`

### Etki

- Proje standardı ile kod tabanı arasında tutarsızlık oluşur.
- Polling davranışı farklı sayfalarda farklılaşır, bakım maliyeti artar.

### Çözüm Seçenekleri

Seçenek A Standardı uygulamaya uydurma

- Telemetry fetch’i React Query ile yönetilir.
- Incremental yaklaşım gerekiyorsa `useInfiniteQuery` veya `queryFn` içinde `since` kullanımı ve client-side merge stratejisi belirlenir.

Seçenek B Standardı revize etme

- Monitoring için incremental ve yüksek frekanslı akışlarda manuel interval istisnası tanımlanır.
- Bu istisnanın kapsamı ve gerekçesi dokümana eklenir.

Seçenek C Alternatif gerçek zaman yaklaşımı

- Polling yerine server push değerlendirilir.
- Bu seçenek kapsam dışı kalacaksa dokümanda açıkça hariç bırakılır.

### Dokümantasyon Etkisi

- `docs/standart/frontend-decisions.md`
- `docs/logs/decision-log.md`

### Kabul Kriterleri

- Seçilen yaklaşım ile monitoring polling mekanizması standarda uyuyor veya standarda kontrollü istisna olarak tanımlanıyor.

## T04 Sys kullanıcı şifresi doküman tutarsızlığı

### Gözlem

- Root README ve backend README’de sys kullanıcı şifresi farklı görünüyor.
- `.env.example` içindeki default sys şifresi ile README uyuşmuyor.

Kaynaklar

- `README.md`
- `backend/README.md`
- `backend/.env.example`

### Etki

- Kurulum yapan kişi yanlış şifre ile giriş denemesi yapar, onboarding yavaşlar.
- Seed davranışı ile doküman arasında güven kaybı oluşur.

### Çözüm Seçenekleri

Seçenek A `.env.example` tek doğruluk kaynağı

- README’lerde sys şifresi `.env.example` ile aynı olacak şekilde güncellenir.

Seçenek B README tek doğruluk kaynağı

- `.env.example` README’de yazan değerle hizalanır.

Seçenek C Şifreyi dokümandan kaldırma

- README’lerde sadece env değişkenlerinin nerede ayarlanacağı anlatılır.
- Default şifreler yerine kullanıcıdan explicit set etmesi istenir.

### Dokümantasyon Etkisi

- `README.md`
- `backend/README.md`
- `docs/meta/doc-maintenance.md` kapsamında gerekirse ilgili log kayıtları

### Kabul Kriterleri

- Seed sonrası örnek hesap bilgileri tüm dokümanlarda aynı.

## T05 DATA_GEN delta env değişkenleri kullanılmıyor

### Gözlem

- `.env.example` ve backend README’de `DATA_GEN_TEMP_DELTA` benzeri env değişkenleri anlatılıyor.
- `data-gen` script’inde bu env değişkenleri okunmuyor.

Kaynaklar

- `backend/.env.example`
- `backend/README.md`
- `backend/scripts/data-gen.js`

### Etki

- Konfigürasyon beklentisi ile gerçek davranış uyuşmaz.
- Demo ortamında telemetry davranışı ayarlanmak istendiğinde ayarların etkisiz kalması kafa karıştırır.

### Çözüm Seçenekleri

Seçenek A Dokümantasyonu gerçekle hizalama

- Kullanılmayan env değişkenleri `.env.example` ve README’den kaldırılır.
- Yerine `data-gen` script’inin gerçekten kullandığı parametreler dokümante edilir.

Seçenek B Script’i env ile parametrize etme

- `DATA_GEN_*_DELTA` gibi env’ler script’e entegre edilir.
- Hangi parametrelerin hangi profile alanlarını etkilediği net tanımlanır.

Seçenek C Hibrit

- Minimum gerekli env’ler tutulur, geri kalanlar kaldırılır.
- İleri seviye tuning için opsiyonel config dosyası kullanımı değerlendirilir.

### Dokümantasyon Etkisi

- `backend/.env.example`
- `backend/README.md`
- `docs/standart/backend-decisions.md` ilgili bölüm
- `docs/logs/decision-log.md`

### Kabul Kriterleri

- Dokümanda anlatılan her `DATA_GEN_*` env değişkeni ya gerçekten script’i etkiliyor ya da dokümandan kaldırılmış.

## T06 Frontend role permissions fallback uyumsuzluğu

### Gözlem

- Frontend `ROLE_PERMISSIONS` fallback listeleri backend seed rollerindeki izinlerle birebir örtüşmüyor.
- Session permission türetiminde backend’den role permission detayları gelmezse fallback davranışı menü ve buton görünürlüğünü etkileyebilir.

Kaynaklar

- `frontend/src/constants/role-permissions.js`
- `frontend/src/features/auth/context/session-context.jsx`
- `backend/scripts/seed.js`

### Etki

- Kullanıcı yetkileri doğru olsa bile UI öğeleri yanlış gizlenebilir veya yanlış görünebilir.
- Özellikle ilk kurulum ve seed demo senaryosunda kullanıcı deneyimi bozulur.

### Çözüm Seçenekleri

Seçenek A Fallback listesini seed ile hizalama

- Backend seed’deki rol izinleri referans alınır ve frontend fallback aynen güncellenir.
- Fallback yalnızca backend permission detayları yoksa devreye girer.

Seçenek B Fallback’ı minimal hale getirme

- Fallback sadece en temel görünürlük için kullanılır.
- Kritik aksiyonlarda backend permission listesi zorunlu tutulur.

Seçenek C Fallback’ı kaldırma

- Permission kaynağı olarak sadece backend’den gelen permission listesi kullanılır.
- Offline veya legacy session taşıma senaryoları için migration stratejisi eklenir.

### Dokümantasyon Etkisi

- `docs/standart/frontend-decisions.md` içinde fallback stratejisi netleştirilmeli
- `docs/logs/decision-log.md`

### Kabul Kriterleri

- Seed ile gelen rollerle login olunca UI menüsü ve aksiyonları backend yetkileriyle tutarlı.

## T07 Backend import alias standardı uygulanmıyor

### Gözlem

- Dokümanlarda backend için `@/` import alias standardı hedeflenmiş.
- Backend kaynak kodunda bu alias kullanımı ve konfigürasyonu bulunmuyor.

Kaynaklar

- `docs/project-guidelines.md`
- `docs/standart/backend-decisions.md`
- `backend/src` altındaki import pattern’leri

### Etki

- Standart doküman ile pratik kullanım ayrışır.
- Uzun relatif path kullanımı arttıkça kod okunabilirliği azalır.

### Çözüm Seçenekleri

Seçenek A Standardı revize etme

- Backend tarafında alias zorunluluğu kaldırılır veya opsiyonel yapılır.
- Frontend alias standardı korunur.

Seçenek B Backend’de alias implement etme

- CommonJS için uygun bir alias çözümü seçilir.
- Alias devreye alındığında import yolları kademeli olarak dönüştürülür.

### Dokümantasyon Etkisi

- `docs/standart/backend-decisions.md`
- `docs/project-guidelines.md`
- `docs/logs/decision-log.md`

### Kabul Kriterleri

- Seçilen standarda göre backend import stratejisi dokümanda net ve kod ile uyumlu.

## T08 Frontend export standardı ile kod farklı

### Gözlem

- Frontend standardında named export tercih edildiği yazıyor.
- Uygulamada birçok modül default export ile çıkıyor.

Kaynaklar

- `docs/standart/frontend-decisions.md`
- `frontend/src` altındaki component ve page exportları

### Etki

- Kod review ve yeni katkılarda standarda uyum tartışması çıkar.
- Tutarsız import biçimleri oluşur.

### Çözüm Seçenekleri

Seçenek A Standardı kodla hizalama

- Default export kullanımının kabul edildiği açıkça yazılır.
- Named export yalnızca belirli modüller için zorunlu kılınır.

Seçenek B Kodu standarda uydurma

- Default exportlar kademeli olarak named export’a çevrilir.
- Barrel export yaklaşımı netleştirilir.

### Dokümantasyon Etkisi

- `docs/standart/frontend-decisions.md`
- `docs/logs/decision-log.md`

### Kabul Kriterleri

- Yeni dosya ekleyen geliştirici için export standardı net.
- Kod tabanında export biçimi tutarlı.

## Önerilen Önceliklendirme

1. T01 güvenlik riski nedeniyle önce karar verilmeli
2. T02 ve T03 standart uyumu için ikinci aşamada ele alınmalı
3. T04 ve T05 onboarding ve operasyonel tutarlılık için hızlı dokümantasyon düzeltmeleri olarak planlanabilir
4. T06 UI yetkilendirme doğruluğu için T01 sonrasında ele alınmalı
5. T07 ve T08 bakım ve stil standardı olarak düşük öncelikte tutulabilir


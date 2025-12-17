# Downtime Design v2

## Güncelleme Kuralları

**Ne zaman güncellenir**

- Duruş türleri, reasonCode kataloğu veya öncelik kuralları değiştiğinde
- Duruşların job order ile ilişkisi veya event lifecycle akışı değiştiğinde
- Planlı duruş planlama modeli ve scheduler davranışı değiştiğinde
- RBAC izinleri ve UI akışları değiştiğinde

**Format**

- Her karar için kısa gerekçe ve uygulanacak teknik yaklaşım yaz
- İş kuralları değiştiyse “İş Kuralları” ve “Edge Case” bölümlerini birlikte güncelle
- Endpoint veya model değiştiyse “Veri Modeli” ve “API Tasarımı” bölümlerini birlikte güncelle

**Önemli**

- Bu doküman geliştirmeyi yöneten ana tasarımdır
- Uygulama başlamadan önce bu dokümanla kodun birebir uyumlu olması hedeflenir

## Amaç

Hermes MES içinde planlı ve plansız duruşların uçtan uca tasarımını tanımlamak.
Bu tasarım, OEE hesaplaması yapılmadan önce duruşların doğru ve tutarlı şekilde toplanmasını sağlar.
OEE hesaplaması daha sonra ekleneceği için, veri modeli ve akışlar OEE’ye hazır kurgulanır.

## Kapsam

Bu doküman şunları kapsar

- Planlı duruş ve plansız duruş tanımları
- Duruş event timeline modelinin nasıl tutulacağı
- Otomatik plansız duruş tespiti ve operatör reason sınıflandırma düzeltme akışı
- Planlı duruşların otomatik başlatma bitirme mantığı ve günlük tekrar
- Duruşlar sayfası UI akışı, yetkilendirme ve sayfalar arası yönlendirme

Bu doküman şunları kapsamaz

- OEE Availability Performance Quality formül implementasyonu
- Shift takvimi ve çalışılmayan günlerin OEE dışında tutulması
- Report export ve raporlama ekranları

## Mevcut Durum Özeti

Şu an sistemde duruşa yakın parçalar var

- `MachineEvent` modeli makine durum eventlerini tutuyor
- `machine-event-service` yeni event açmadan önce açık eventleri kapatıyor ve `Machine.status` güncelliyor
- Telemetry işleyici (`oee-processor`) sinyal 0 serisi eşiği aşınca otomatik `downtime` event açabiliyor
- Production `pause` akışı makineye `downtime` event yazıyor (mevcut durum)

Bu tasarımın hedefi, bu parçaları bir araya getirip tek bir tutarlı “duruş sistemi” haline getirmektir.

Bu dokümandaki hedef durum

- Downtime event yazımı sadece DowntimeService üzerinden yapılır
- Production domain job order state değiştirir, downtime event yazmaz
- `pauseJobOrder` ve `resumeJobOrder` UI aksiyonu değildir, DowntimeService iç adımıdır
- UI’da “Pause Job” yerine Duruşlar sayfasına yönlendirme bulunur

## Temel Tanımlar

### Planlı duruş

- Üretimin planlı bir etkinlik nedeniyle durdurulduğu zaman aralığı
- Örnekler: öğle arası, planlı bakım, temizlik, kalite kontrol
- Bu projede planlı duruşların kaynağı bir “plan” kaydıdır
- Planlı duruşlar otomatik başlar ve otomatik biter

### Plansız duruş

- Üretim sırasında beklenmedik bir nedenle oluşan duruş
- Örnekler: malzeme bitti, arıza, takım değişimi
- Bu projede plansız duruş event lifecycle’ı telemetry ile otomatik yönetilir
  - Başlangıç: sinyal 0 serisi 10 sn eşiğini aşınca
  - Bitiş: sinyal 1 gelince
- Operatör plansız duruşu başlatıp bitirmez
  - Sadece reasonCode ve not ile sınıflandırır, düzeltir, gerekirse split ile reason değiştirir

### Aktif job

Bu dokümanda “aktif job” şu anlama gelir

- Makinede bir `currentJobOrder` vardır
- Job order durumu terminal değildir
  - Terminal olmayan durumlar: `in_progress`, `paused`
  - Terminal durumlar: `completed`, `cancelled`

Not

- Plansız duruş otomatik tespiti sadece makine gerçekten çalışırken devreye girmelidir
- Bu yüzden otomatik tespit için ek koşul vardır: `Machine.status` değeri `running` olmalıdır

### Timeline invariants

Tüm tasarım şu invariants üzerine kuruludur

- Bir makinede aynı anda en fazla 1 açık `MachineEvent` bulunur
  - Açık event: `endedAt` alanı olmayan event
- Makinenin `status` değeri her zaman en son açık eventin state değerini temsil eder
- Duruş eventleri `reasonCode` olmadan açılamaz
- Duruş eventlerinde job ilişkisi snapshot olarak tutulur

## İş Kuralları

### Kural 1 Planlı duruş job gerektirir

- Planlı duruş yalnızca makinede aktif job varsa başlatılır
- Aktif job yoksa downtime event açılmaz
- Plan occurrence “skipped” olarak kaydedilir

Gerekçe

- Bu proje duruşları OEE için kullanmayı hedefliyor
- Job yokken makineyi “duruşta” saymak yanlış KPI üretir ve dashboard göstergelerini bozar

### Kural 2 ReasonCode zorunludur

- Planlı ve plansız tüm duruşlarda `reasonCode` seçimi zorunludur
- “Genel” durumlar için minimum iki fallback reasonCode tanımlanır
  - `other_planned`
  - `other_unplanned`

### Kural 3 Reason değişimi event split ile yapılır

- Duruş devam ederken reason değiştirilemez
- Normal akışta reason değişimi split ile yapılır
  - Mevcut açık duruş kapatılır ve aynı anda yeni reason ile yeni duruş başlatılır
- İstisna olarak “düzeltme penceresi” içinde reasonCode aynı event içinde güncellenebilir

Gerekçe

- Tek bir event içine birden fazla reason yazmak süre kırılımını bozar
- OEE ve raporlamada reason bazlı süre hesapları net olmalıdır

### Kural 4 Otomatik plansız duruş tespiti

- Koşullar
  - Makinede aktif job vardır
  - Makine durumu `running`dir
  - Telemetry sinyali 0 değerini kesintisiz şekilde eşiğin üzerinde üretir
- Eşik
  - `downtimeThresholdMs = 10000`
- Başlangıç
  - Eşik aşılınca plansız duruş açılır
  - `reasonCode = unplanned_stop`
  - `source = system`
- Bitiş
  - Sinyal 1 gelince duruş kapanır
  - Makine tekrar `running` duruma döner

Not

- Planlı duruş bitince sinyal hala 0 ise plansız duruş hemen başlamaz
- Planlı bitişten sonra sıfır serisi sayacı resetlenir ve yeniden 10 sn eşiği işletilir

### Kural 5 Planlı duruş otomatik başlar ve otomatik biter

- Planlı duruş başlangıcı scheduler tarafından yönetilir
- Başlangıçta yapılacaklar
  - Eğer makinede aktif job yoksa: event açma, skipped yaz
  - Eğer aktif job varsa: job pause + downtime event aç
- Bitişte yapılacaklar
  - Planlı downtime event kapat
  - Job resume dene
  - Resume mümkün değilse makine `idle` duruma döner

### Kural 6 Öncelik ve çakışma yönetimi

Planlı ve plansız duruşlar çakışabilir.
Bu sistemde öncelik sırası şu şekildedir

1. Kullanıcı tarafından oluşturulan planlı duruş
2. Öğle arası gibi global planlı duruş
3. Plansız duruş

Çakışma davranışı

- Planlı duruş başlarken açık bir plansız duruş varsa, plansız duruş o anda kapatılır ve planlı duruş başlar
- Aynı anda birden fazla planlı duruş penceresi varsa, daha yüksek öncelikli olan aktif olur ve diğerleri conflict olarak işaretlenir

## ReasonCode Kataloğu

### Kategori modeli

ReasonCode kataloğu iki işlev görür

- UI’da seçilebilir reason listesini sağlar
- Her reason’un “planlı” veya “plansız” kategorisini tanımlar

Not

- Katalog ilk fazda statik tutulabilir
- İleride supervisor tarafından yönetilebilir hale getirilebilir

### İlk faz önerilen reason listesi

Planlı

- `planned_break` öğle arası
- `maintenance` planlı bakım
- `cleaning` temizlik
- `quality_check` kalite kontrol
- `other_planned` diğer planlı

Plansız

- `unplanned_stop` otomatik tespit edilen duruş
- `material_shortage` malzeme bitti
- `breakdown` arıza
- `tooling_change` takım değişimi
- `other_unplanned` diğer plansız

## Veri Modeli

### MachineEvent genişletmesi

Mevcut `MachineEvent` modeli duruş için yeterli çekirdeğe sahip.
Ancak OEE ve raporlama için kritik iki alan eksik

- Duruşun hangi job sırasında yaşandığı
- Duruşun planlı mı plansız mı olduğunun tarihsel snapshot’ı

Önerilen ek alanlar

- `jobOrder` opsiyonel `ObjectId` referansı
  - Duruş açıldığı an makinedeki job order id’si buraya yazılır
  - Bu bir snapshot’tır, sonradan `Machine.currentJobOrder` değişse bile event ilişkisi korunur
- `reasonCategory` opsiyonel string
  - `planned` veya `unplanned`
  - Katalog değişse bile geçmiş event kategorisi değişmemelidir

Metadata alanına yazılması önerilen ek bilgiler

- `jobOrderNo`
- `plannedRuleId`
- `plannedRunId`
- `autoDetected` true false

### PlannedDowntimeRule modeli

Planlı duruşlar için bir “kural” modeli gerekir.
Bu model hem günlük tekrar hem de tek seferlik planları kapsar.

Alanlar

- `name` kısa ad
- `machineIds` seçili makineler
- `reasonCode` zorunlu
- `reasonCategory` sabit `planned`
- `priority` sayı
  - Kullanıcı planı yüksek, öğle arası daha düşük
- `timezone` `Europe/Istanbul`
- `type`
  - `recurring_daily`
  - `one_time`
- `recurrence`
  - `startTime` `HH:mm`
  - `endTime` `HH:mm`
  - `daysOfWeek` isteğe bağlı
- `startAt` `endAt` tek seferlik için
- `isActive`
- `createdBy`

Varsayılan öğle arası kuralı

- Sistem bir “öğle arası” şablonu sağlar
  - Her gün 12:00 13:00
  - Reason `planned_break`
  - Priority global plan seviyesi
  - Timezone `Europe/Istanbul`
- Bu şablon otomatik olarak hiçbir makineye uygulanmaz
- Supervisor Duruşlar sayfasından seçili makineler için kuralı oluşturur veya aktive eder

### PlannedDowntimeRun modeli

Planlı duruşlar “skipped” olabildiği için yalnızca MachineEvent yeterli değildir.
Event açılmayan durumda da kayıt tutulmalıdır.

Alanlar

- `ruleId`
- `machineId`
- `scheduledStartAt` `scheduledEndAt`
- `status`
  - `scheduled`
  - `started`
  - `ended`
  - `skipped_no_active_job`
  - `skipped_conflict`
- `machineEventId` varsa
- `jobOrderId` snapshot varsa
- `notes` ve `debug` alanı

## Servis Katmanı Tasarımı

### Tek doğruluk kaynağı DowntimeService

Mevcut yapıda farklı yerler `MachineEvent` üretiyor.
Duruş sisteminde tek bir orkestrasyon servisi olmalıdır

- `DowntimeService`

Sorumluluklar

- Planlı scheduler sırasında job order pause resume yönetimi
- Telemetry kaynaklı plansız duruş aç kapat orkestrasyonu
- Duruş reason düzeltme ve split işlemleri
- MachineEvent oluşturma ve kapatma
- Planned scheduler telemetry ve operatör müdahalelerinin çakışmasını engelleme
- Snapshot alanlarını doldurma

### MachineEvent oluşturma kuralı

Tüm event oluşturma işlemleri `machine-event-service` üzerinden geçmelidir.
Gerekçe

- Tek açık event invariant’ını bu servis garanti ediyor
- Makine status ve lastEventAt güncellemesini tek yerden yapıyor

Bu nedenle

- Telemetry tespiti ve planned scheduler doğrudan `MachineEvent.create` kullanmamalı
- DowntimeService `createMachineEvent` benzeri tek bir entry point kullanmalı

## Scheduler Tasarımı

### Çalışma şekli

- Scheduler belirli aralıklarla çalışır
- Her çalışmada yaklaşan planlı duruş başlangıç ve bitişlerini kontrol eder

Önerilen interval

- 30 sn veya 60 sn

### Zaman ve saat dilimi

- Tüm recurrence hesapları `Europe/Istanbul` ile yapılır
- DB’de `Date` olarak saklanan tüm zamanlar UTC olur
- UI’da gösterim Istanbul saatine göre yapılır

### Idempotency

- Aynı planın aynı makine için iki kere başlatılmasını engellemek gerekir
- `PlannedDowntimeRun` kaydı bunun için kullanılır
  - Aynı `ruleId + machineId + scheduledStartAt` kombinasyonu bir kere işlenir

### Başlangıç akışı

Örnek pseudo akış

```text
for each due planned window
  if run already exists -> continue
  if no active job -> create run status skipped_no_active_job
  else
    if open event exists
      if open event is unplanned -> close it at now
      else if open event is planned and higher priority -> create run skipped_conflict
      else if open event is planned and lower priority -> close it at now
    pause job if job is in_progress
    open planned downtime event with reasonCode
    create run status started
```

### Bitiş akışı

```text
for each planned run that should end
  close planned downtime event at scheduled end
  reset telemetry zero sequence state
  try resume job
    if resume ok -> machine running
    else -> machine idle
  mark run ended
```

## Telemetry ve simülatör

### Planlı duruşta stopped mode

Planlı duruş sırasında Monitoring ekranında sinyal ve metriklerin “çalışıyor” gibi görünmemesi gerekir.
Bu yüzden simülasyon ortamında planlı duruş açıkken telemetry “stopped mode” davranışı uygulanır.

- Planlı duruş açıkken simülatör sinyal değerini 0 üretir ve metrikleri düşük sabit profilde tutar
- Planlı duruş bittiğinde simülatör normal telemetry moduna döner
- Gerçek PLC entegrasyonunda bu davranış opsiyoneldir, çünkü saha sinyali zaten duruşu yansıtır

## API Tasarımı

Bu bölüm öneri seviyesindedir.
Endpoint isimleri ve permission mapping kod yazımında finalize edilir.

### Duruş listesi ve durum

- `GET /api/downtimes`
  - Filtreler: `machineId`, `from`, `to`, `status` `open|closed`, `reasonCode`, `category`
  - Kullanım: Duruşlar sayfası geçmiş ve açık duruş listesi

### Duruş düzeltme

- `PATCH /api/downtimes/:id`
  - Sadece 5 dk kuralı içinde
  - Pencere hesabı: `endedAt` varsa `endedAt + 5 dk`, yoksa `startedAt + 5 dk`
  - Alanlar: `reasonCode`, `notes`

Not

- Reason değişimi normalde split ile yapılır
- Bu endpoint “yanlış seçimi hızlı düzeltme” içindir

### Reason değişimi split

- `POST /api/downtimes/:id/split`
  - Body
    - `reasonCode`
    - `notes` opsiyonel
    - `splitAt` opsiyonel, default now
  - İşlem
    - Event açık olmalı
    - Eski event `endedAt = splitAt` ile kapanır
    - Aynı makinede aynı `splitAt` ile yeni downtime event açılır

### Reason kataloğu

- `GET /api/oee/reasons`
  - UI dropdown’ları için reasonCode ve kategori listesini döner

### Planlı duruş kuralları

- `GET /api/planned-downtime-rules`
- `POST /api/planned-downtime-rules`
- `DELETE /api/planned-downtime-rules/:id`

### Planlı duruş run kaydı

- `GET /api/planned-downtime-runs`
  - Filtreler: `machineId`, `from`, `to`, `status`

## Yetkilendirme

Kararlaştırılan yetki ayrımı

- Planlı duruş oluşturma ve silme supervisor
- Duruş reason sınıflandırma düzeltme split operator ve supervisor

Uygulama için iki seçenek vardır

Seçenek A Var olan permissionlarla

- Planlı kural yönetimi: `production.manage`
- Duruş sınıflandırma düzeltme split: `work_orders.execute`

Seçenek B Yeni permission ekleme

- Planlı kural yönetimi: `downtime.manage`
- Duruş sınıflandırma düzeltme split: `downtime.execute`

Öneri

- İlk fazda Seçenek A ile başlanabilir
- Sonradan domain büyürse permissionlar ayrıştırılır

## UI Tasarımı

### Sidebar

- Sol menüye “Duruşlar” bölümü eklenir
- Görünürlük: duruşları görüntüleme ve sınıflandırma yetkisi olanlar

### Duruşlar sayfası hedefleri

- Açık duruşları listele
- Otomatik açılan plansız duruşu reasonCode ile sınıflandır ve gerekirse split ile değiştir
- Planlı duruş takvimini görüntüle ve supervisor için plan ekle sil
- Geçmiş duruşları filtrele ve düzeltme penceresi içinde düzenle

### Sayfa bölümleri

1. Hızlı özet
   - Seçili makine
   - Aktif job bilgisi
   - Açık duruş varsa reason ve süresi
2. Plansız duruş aksiyonları
   - Açık plansız duruş varsa reason seçimi ve not girme
   - 5 dk içinde düzeltme
   - Reason değişimi split
3. Planlı duruş planlama
   - Öğle arası şablonu görünür
   - Supervisor seçili makineler için aktive eder
   - Supervisor tek seferlik plan ekler
   - Supervisor kuralı seçili makineler için aktive deaktive eder
4. Geçmiş
   - Tarih aralığı filtresi
   - Makine filtresi
   - Planlı plansız filtresi
   - Reason filtresi
   - Kayıtların jobOrder ilişkisi

### Sayfalar arası yönlendirme

- Production sayfasında “pause” aksiyonu Duruşlar sayfasına yönlendirir
  - Query ile context taşınır: `machineId`, `jobOrderId`
- Machines sayfasında “Duruşları gör” linki Duruşlar sayfasına gider

## Edge Case Senaryoları

### Planlı başlarken plansız açık

- Plansız event kapatılır
- Planlı event açılır
- Job zaten paused ise tekrar pause yapılmaz
- Run kaydı started olur

### Planlı başlarken aktif job yok

- Event açılmaz
- Run kaydı skipped_no_active_job olur

### Planlı bitince job resume edilemez

- Planlı event kapanır
- Machine idle event açılır
- Run ended olur

### Planlı bitince sinyal 0 kalmaya devam eder

- Telemetry sıfır serisi sayacı resetlenir
- Plansız duruş için 10 sn eşiği yeniden işletilir

### Düzeltme penceresi

- Kullanıcı yanlış reason seçtiyse 5 dk içinde düzeltir
- 5 dk geçerse split kuralı uygulanır

## Kod Haritası

Bu bölüm, dokümandaki kavramların repo içinde nerelere denk geldiğini hızlıca gösterir.
İsimler değişirse bu liste güncellenmelidir.

Backend

- `backend/src/domains/machines/services/machine-event-service.js` tek açık event kuralı ve `Machine.status` güncellemesi
- `backend/src/domains/oee/services/oee-processor.js` telemetry işleyici ve mevcut otomatik plansız duruş yazımı
- `backend/src/domains/oee/config/oee-rules.json` `downtimeThresholdMs` ve reason katalog kaynağı
- `backend/src/domains/production/services/job-order-service.js` job status akışları, pause resume ve mevcut downtime yazımı ayrıştırma noktası
- `backend/src/jobs/oee-processor-job.js` telemetry job runner

Frontend

- `frontend/src/App.jsx` uygulama route mount noktası
- `frontend/src/app/routes` sayfa rotaları ve guard yapısı

## Geliştirme Planı

Bu tasarımın uygulanması için önerilen adımlar

1. Reason katalog ve kategorilerinin netleştirilmesi
2. Reason katalog API’sinin eklenmesi `GET /api/oee/reasons`
3. `MachineEvent` modeline job snapshot alanlarının eklenmesi
4. `PlannedDowntimeRule` ve `PlannedDowntimeRun` modellerinin eklenmesi
5. `DowntimeService` ile orkestrasyonun tek serviste toplanması
6. Planlı downtime scheduler job’unun eklenmesi
7. Simülatörde planlı duruş stopped mode davranışının eklenmesi
8. Production pause akışının downtime event yazmaktan ayrıştırılması
9. Duruş sınıflandırma düzeltme split API’lerinin eklenmesi
10. Duruşlar sayfası ve sidebar entegrasyonu
11. Production sayfasından duruş sayfasına yönlendirme
12. Telemetry işleyicinin event oluşturmasını DowntimeService üzerinden yapacak şekilde refactor

## Doğrulama Senaryoları

Minimum manuel test senaryoları

- Job `in_progress` iken 12:00 geldiğinde planlı duruş başlar, 13:00’te biter, job resume olur
- 12:00 geldiğinde aktif job yoksa planlı duruş event açılmaz, run skipped olur
- Job çalışırken sinyal 0 10 sn aşınca plansız duruş açılır, sinyal 1 ile kapanır
- Plansız açıkken 12:00 gelince plansız kapanır ve planlı başlar
- Planlı bittikten sonra sinyal 0 kalırsa plansız hemen başlamaz, 10 sn sonra başlar
- Yanlış reason seçimi 5 dk içinde düzeltilir, 5 dk sonrası split ile yapılır

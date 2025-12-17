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
- Telemetry işleyici (`oee-processor`) sinyal 0 serisi eşiği aşınca plansız duruş timing’ini üretip downtime domain üzerinden event açıp kapatıyor
- Planlı duruş scheduler job’u rule run modeline göre planlı duruşları otomatik başlatıp bitiriyor (feature-flag ile)
- Production `pause/resume` endpoint’leri job state değiştirir; MachineEvent yazımı kapatılmıştır (downtime event yazımı Downtime domain sorumluluğudur)

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
- Bu projede plansız duruş iki şekilde oluşabilir
  - Telemetry ile otomatik tespit
    - Başlangıç: sinyal 0 serisi 10 sn eşiğini aşınca
    - Bitiş: sinyal 1 gelince
  - Operatör manuel başlatır
    - Mesai içinde operatör “makineyi durdurma” ihtiyacını sistemde kayıt altına alır
    - Başlangıç: operatör reasonCode seçip duruş başlatır
    - Bitiş: sinyal 1 gelince duruş kapanır (makine status doğru kalsın diye)
      - “Onay bekliyor” kuralı telemetry ile açılan plansız duruşlar için uygulanır (Kural 4.2)
- Operatör plansız duruşu “her zaman” manuel bitirmek zorunda değildir
  - Sistem sinyal 1’i görünce gerçek bitiş zamanında kapanışı yapar
  - Operatörün görevi reasonCode ve not ile sınıflandırmak, düzeltmek, gerekirse split ile reason değiştirmektir

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

### Kural 4.1 Operatör manuel plansız duruş başlatabilir

- Operatör plansız duruş başlatabilir
  - Amaç “telemetry 10 sn beklemeden” duruşu anında başlatabilmek ve sebep girebilmektir
- Koşullar
  - Makinede aktif job vardır
  - Makine durumu `running`dir
  - `reasonCode` zorunludur ve kategorisi `unplanned` olmalıdır
- Başlangıç
  - Yeni `MachineEvent(state=downtime, reasonCategory=unplanned)` açılır
  - Event metadata içinde “manuel başlatıldı” işareti tutulur
- Bitiş
  - Sinyal 1 gelince duruş kapanır

### Kural 4.2 Uzun plansız duruş kapanışında “onay bekliyor”

- Plansız duruş kapanınca (sinyal 1) süre hesaplanır
- Süre 5 dk’dan uzunsa event’e “onay bekliyor” işareti eklenir
  - İlk fazda bu kural sadece `source=system` (telemetry ile açılan) plansız duruşlara uygulanır
- Amaç
  - Kısa micro-stop’larda operatörü yormamak
  - Uzun duruşlarda “bu kayıt doğru mu” teyidini UI’da görünür kılmak

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

### Tek doğruluk kaynağı Downtime domaini

Mevcut yapıda farklı yerler `MachineEvent` üretiyor.
Duruş sisteminde tek bir orkestrasyon servisi olmalıdır

- Telemetry ve scheduler için: `downtime-orchestrator-service`
- API işlemleri için: `downtime-service`

Sorumluluklar

- Telemetry kaynaklı plansız duruş aç kapat orkestrasyonu
- Planlı scheduler sırasında job order pause resume yönetimi ve planlı duruş başlat bitir
- Duruş listesi, reason düzeltme ve split işlemleri
- MachineEvent oluşturma ve kapatma
- Preempt ve conflict senaryolarında tek açık event invariant’ını koruma
- Snapshot alanlarını doldurma (`jobOrder`, `reasonCategory`, metadata)

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
- Bu davranış `DATA_GEN_PLANNED_STOPPED_MODE` env ile kontrol edilir (default true)
- Gerçek PLC entegrasyonunda bu davranış opsiyoneldir, çünkü saha sinyali zaten duruşu yansıtır

## API Sözleşmesi

Bu bölüm, downtime v2 kapsamındaki uygulanmış endpoint’leri ve temel sözleşmeyi özetler.

Genel kurallar

- Tüm endpoint’ler `/api` prefix’i altındadır
- Tüm endpoint’ler `authGuard` ile korunur
- Görüntüleme yetkisi (operator + supervisor): `requireAnyPermission(work_orders.execute, production.manage)`
- Planlı kural CRUD yetkisi (supervisor): `requirePermissions(production.manage)`

### Duruş listesi ve durum

- `GET /api/downtimes`
  - Permission: any-of `work_orders.execute` veya `production.manage`
  - Filtreler: `machineId`, `from`, `to`, `status` `open|closed`, `reasonCode`, `category` `planned|unplanned`, `limit`
  - Kullanım: Duruşlar sayfası geçmiş ve açık duruş listesi
  - Response: `{ downtimes: MachineEvent[] }`

### Operatör manuel plansız duruş başlatma

- `POST /api/downtimes/manual-start`
  - Permission: any-of `work_orders.execute` veya `production.manage`
  - Body
    - `machineId`
    - `reasonCode` (unplanned)
    - `notes` opsiyonel
  - İşlem
    - Makinede aktif job yoksa `409` döner
    - Makine `running` değilse `409` döner
    - Eğer açık planlı duruş varsa `409` döner
  - Response: `201 { downtime: MachineEvent }`

### Duruş düzeltme

- `PATCH /api/downtimes/:id`
  - Permission: any-of `work_orders.execute` veya `production.manage`
  - Sadece 5 dk kuralı içinde
  - Pencere hesabı: `endedAt` varsa `endedAt + 5 dk`, yoksa `startedAt + 5 dk`
  - Alanlar: `reasonCode`, `notes`
  - Response: `{ downtime: MachineEvent }`

Not

- Reason değişimi normalde split ile yapılır
- Bu endpoint “yanlış seçimi hızlı düzeltme” içindir

### Reason değişimi split

- `POST /api/downtimes/:id/split`
  - Permission: any-of `work_orders.execute` veya `production.manage`
  - Body
    - `reasonCode`
    - `notes` opsiyonel
    - `splitAt` opsiyonel, default now
  - İşlem
    - Event açık olmalı
    - Eski event `endedAt = splitAt` ile kapanır
    - Aynı makinede aynı `splitAt` ile yeni downtime event açılır
  - Response: `201 { downtime: MachineEvent }` (yeni event)

### Reason kataloğu

- `GET /api/oee/reasons`
  - Permission: any-of `work_orders.execute` veya `production.manage`
  - UI dropdown’ları için reasonCode ve kategori listesini döner
  - Response: `ReasonCatalogItem[]` (direkt array)

### Planlı duruş kuralları

- `GET /api/planned-downtime-rules`
  - Permission: any-of `work_orders.execute` veya `production.manage`
  - Filtreler: `machineId`, `isActive`
  - Response: `{ rules: PlannedDowntimeRule[] }`
- `POST /api/planned-downtime-rules`
  - Permission: `production.manage`
  - Response: `201 { rule: PlannedDowntimeRule }`
- `PATCH /api/planned-downtime-rules/:id`
  - Permission: `production.manage`
  - Response: `{ rule: PlannedDowntimeRule }`
- `DELETE /api/planned-downtime-rules/:id`
  - Permission: `production.manage`
  - Response: `204` (no body)

### Planlı duruş run kaydı

- `GET /api/planned-downtime-runs`
  - Permission: any-of `work_orders.execute` veya `production.manage`
  - Filtreler: `machineId`, `from`, `to`, `status`
  - Response: `{ runs: PlannedDowntimeRun[] }`

## Yetkilendirme

Kararlaştırılan yetki ayrımı

- Planlı duruş kural CRUD supervisor
- Duruş listesi ve planlı run geçmişi görüntüleme operator ve supervisor
- Duruş reason sınıflandırma, düzeltme ve split operator ve supervisor

Uygulanan permission eşlemesi

- Planlı kural create update delete: `production.manage`
- Duruş listesi ve reason işlemleri: any-of `work_orders.execute` veya `production.manage`

Not

- İleride ihtiyaç olursa `downtime.manage` ve `downtime.execute` gibi yeni permission’lara ayrıştırılabilir

## UI Tasarımı

### Sidebar

- Sol menüye “Duruşlar” bölümü eklenir
- Görünürlük: duruşları görüntüleme ve sınıflandırma yetkisi olanlar

### Duruşlar sayfası hedefleri

- Açık duruşları listele
- Otomatik açılan plansız duruşu reasonCode ile sınıflandır ve gerekirse split ile değiştir
- Operatörün manuel plansız duruş başlatmasını sağla (reason zorunlu)
- Planlı duruş takvimini görüntüle ve supervisor için plan ekle sil
- Geçmiş duruşları filtrele ve düzeltme penceresi içinde düzenle
  - 5 dk’dan uzun telemetry plansız duruşlar “onay bekliyor” olarak işaretlenir ve UI’da onaylanabilir

### Sayfa yapısı

Sayfa üç ana sekmeden oluşur

1. Açık duruşlar
   - Açık (`endedAt` yok) downtime event’leri listelenir
   - Duruş kartında makine, job snapshot, reason ve süre görünür
   - Operatör ve supervisor reason sınıflandırma akışını buradan yürütür
     - 5 dk düzeltme penceresi içindeyse PATCH
     - Pencere dışındaysa split
   - Operatör için “Plansız Duruş Başlat” aksiyonu bulunur
     - Machine filter seçili değilse dialog içinde makine seçtirilir
     - Aktif job yoksa UI hata gösterir
2. Planlı duruşlar
   - Alt sekmeler
     - Kurallar: planlı duruş rule listesi
       - Operator yalnızca görüntüler
       - Supervisor oluşturur günceller siler
     - Run geçmişi: planlı duruş run kayıtları ve statüleri (started, ended, skipped)
3. Geçmiş
   - Kapalı downtime event’leri listelenir
   - Filtreler: tarih aralığı, makine, planned/unplanned, reasonCode
   - 5 dk düzeltme penceresi dolmuş kayıtlarda edit UI kapalıdır
   - `onay bekliyor` kayıtlarında ayrıca “Onayla” aksiyonu bulunur

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

- `backend/src/domains/downtime/services/downtime-orchestrator-service.js` telemetry ve scheduler için event aç kapat entrypoint’i
- `backend/src/domains/downtime/services/downtime-service.js` downtime listesi, düzeltme ve split işlemleri
- `backend/src/domains/downtime/services/planned-downtime-scheduler-service.js` planlı duruş pencere hesapları ve run lifecycle
- `backend/src/jobs/planned-downtime-scheduler-job.js` planlı duruş scheduler runner (feature-flag)
- `backend/src/domains/downtime/routes/downtime-routes.js` downtime list update split API’leri
- `backend/src/domains/downtime/routes/planned-downtime-rule-routes.js` planlı kural CRUD API’leri
- `backend/src/domains/downtime/routes/planned-downtime-run-routes.js` planlı run list API’si
- `backend/src/domains/machines/services/machine-event-service.js` tek açık event kuralı ve `Machine.status` güncellemesi
- `backend/src/domains/oee/services/oee-processor.js` telemetry işleyici ve plansız duruş tespiti
- `backend/src/domains/oee/routes/oee-routes.js` reason katalog endpoint’i
- `backend/src/domains/oee/config/oee-rules.json` `downtimeThresholdMs` ve reason katalog kaynağı
- `backend/src/domains/production/services/job-order-service.js` job status akışları, pause resume ve legacy downtime yazımı ayrıştırma noktası
- `backend/src/jobs/oee-processor-job.js` telemetry job runner

Frontend

- `frontend/src/App.jsx` uygulama route mount noktası
- `frontend/src/app/routes/private-route.jsx` auth bazlı guard
- `frontend/src/app/routes/permission-guard.jsx` permission guard (any-of destekler)
- `frontend/src/features/downtime/pages/downtimes.jsx` Duruşlar sayfası ve sekmeler
- `frontend/src/features/downtime/services/downtime-api.js` downtime API client
- `frontend/src/constants/navigation.js` sidebar menü tanımı

## Geliştirme Planı

Bu tasarımın uygulanması için önerilen adımlar

- [x] Reason katalog ve kategorilerinin netleştirilmesi
- [x] Reason katalog API’sinin eklenmesi `GET /api/oee/reasons`
- [x] `MachineEvent` modeline job snapshot alanlarının eklenmesi
- [x] `PlannedDowntimeRule` ve `PlannedDowntimeRun` modellerinin eklenmesi
- [x] Downtime orkestrasyonunun tek entrypoint’te toplanması (orchestrator + downtime service)
- [x] Planlı downtime scheduler job’unun eklenmesi
- [x] Simülatörde planlı duruş stopped mode davranışının eklenmesi
- [x] Production UI pause akışının downtime event yazmaktan ayrıştırılması (duruş sayfasına yönlendirme)
- [x] Production `pause/resume` endpoint’lerinde MachineEvent yazımının kapatılması (job state değişir, downtime domain event yazar)
- [x] Duruş sınıflandırma düzeltme split API’lerinin eklenmesi
- [x] Duruşlar sayfası ve sidebar entegrasyonu
- [x] Telemetry işleyicinin event oluşturmasını downtime orchestrator üzerinden yapacak şekilde refactor
- [x] Operatör manuel plansız duruş başlatma (job şartlı) + UI akışı
- [x] Uzun plansız duruş kapanışında “onay bekliyor” işareti + onay endpoint’i + UI aksiyonu

## Doğrulama Senaryoları

Minimum manuel test senaryoları

- Job `in_progress` iken 12:00 geldiğinde planlı duruş başlar, 13:00’te biter, job resume olur
- 12:00 geldiğinde aktif job yoksa planlı duruş event açılmaz, run skipped olur
- Job çalışırken sinyal 0 10 sn aşınca plansız duruş açılır, sinyal 1 ile kapanır
- Job çalışırken operatör manuel plansız duruş başlatabilir, reason zorunludur
- Telemetry ile açılan plansız duruş 5 dk’dan uzun sürerse kapanışta “onay bekliyor” görünür ve UI’dan onaylanır
- Plansız açıkken 12:00 gelince plansız kapanır ve planlı başlar
- Planlı bittikten sonra sinyal 0 kalırsa plansız hemen başlamaz, 10 sn sonra başlar
- Yanlış reason seçimi 5 dk içinde düzeltilir, 5 dk sonrası split ile yapılır

Not

- Adım adım smoke checklist: `docs/dev-notes/downtime-smoke.md`

## Stabilizasyon ve UX Polish

Bu bölüm, downtime v2’nin sahada kullanılabilir hale gelmesi için yapılacak stabilizasyon ve UX polish işlerini listeler.
OEE KPI (Availability Performance Quality) kapsam dışıdır, bu bölüm sadece downtime davranışının güvenilirliği ve operatör deneyimi ile ilgilidir.

### Stabilizasyon hedefleri

- Tek açık event invariant’ının her durumda korunması
- Scheduler ve telemetry yarışlarında deterministik sonuç üretmek (preempt, conflict, skipped)
- Duruş geçmişinin raporlamaya hazır ve tutarlı olması (reason kırılımı, job snapshot)

### Backend stabilizasyon checklist

- [x] Tek açık event kuralı `machine-event-service` üzerinden enforce edilir
- [x] Planlı duruş idempotency için run unique index kullanılır (`ruleId + machineId + scheduledStartAt`)
- [x] Planlı duruş scheduler feature-flag ile kontrollüdür (`ENABLE_PLANNED_DOWNTIME_SCHEDULER`)
- [x] Planlı duruş geçişlerinde telemetry zero-sequence state resetlenir (planlı bitince plansız hemen başlamaz)
- [ ] (Opsiyonel) Downtime düzeltme ve split işlemleri için ayrı audit log kaydı ekle
- [ ] (Opsiyonel) `GET /api/downtimes` ve `GET /api/planned-downtime-runs` için pagination eklensin (limit yerine page/offset)
- [ ] (Opsiyonel) Scheduler decision debug alanlarını standartlaştır (preempt reason, conflict ruleId, endedAt reason)

### Frontend UX polish checklist

- [x] `/downtimes` sayfası Açık Planlı Geçmiş sekmeleri ile tek giriş noktasıdır
- [x] 5 dk düzeltme penceresi dolunca edit UI kapalıdır ve split akışı önerilir
- [ ] (Opsiyonel) Düzeltme penceresi için UI’da geri sayım veya “deadline” bilgisi göster
- [ ] (Opsiyonel) Reason seçimini category bazlı grupla ve hızlı arama ekle
- [ ] (Opsiyonel) Boş durumlar ve hata durumları için tutarlı empty state ve retry aksiyonları ekle
- [ ] (Opsiyonel) Planlı kurallar için “öğle arası şablonu” hızlı oluşturma butonu ekle

### Test ve gözlem

- Deterministik plansız duruş testleri için data-gen env’leri kullanılabilir (bkz `docs/dev-notes/downtime-smoke.md`)
- Planlı duruş testinde scheduler interval’ını kısa tut (`PLANNED_DOWNTIME_SCHEDULER_INTERVAL_MS`)
- Planlı duruş sırasında monitoring doğrulaması için `DATA_GEN_PLANNED_STOPPED_MODE=true` kullan
### Uzun plansız duruş onayı

- `POST /api/downtimes/:id/confirm`
  - Permission: any-of `work_orders.execute` veya `production.manage`
  - İşlem
    - Event kapalı olmalı (`endedAt` var)
    - Event `onay bekliyor` işaretli olmalı
    - Event metadata içine `confirmedAt`, `confirmedBy` yazılır
  - Response: `{ downtime: MachineEvent }`
### Operatör manuel plansız başlatırken planlı açık

- Event açılmaz
- UI “planlı duruş devam ederken plansız başlatılamaz” hatası gösterir

### Uzun plansız duruş kapanınca onay

- Telemetry ile açılan plansız duruş 5 dk’dan uzun sürerse kapanışta event metadata `confirmationRequired=true` olur
- UI geçmiş listede “Onay bekliyor” badge gösterir ve kullanıcı `confirm` endpoint’i ile onaylar

# OEE ve Downtime Tasarımı

## Güncelleme Kuralları

**Ne zaman güncellenir**

- OEE formülü ve KPI kapsamı netleştiğinde
- Downtime tasarımında v1 notlarına referans verilmesi gerektiğinde
- Bu dokümanın “tarihsel kayıt” rolü değiştiğinde

**Önemli**

- Downtime implementasyonu için ana kaynak `docs/specs/downtime-design-v2.md` dokümanıdır
- Bu doküman v1 tasarım notlarını ve OEE ile ilgili arka planı korumak için tutulur

## Durum

- Downtime kısmı için kaynak: `docs/specs/downtime-design-v2.md`
- OEE KPI (Availability Performance Quality) implementasyonu bu projede daha sonra ele alınacaktır

## Amaç

Bu doküman Hermes MES içinde OEE ve downtime özelliklerini tasarlamak için hazırlanmıştır.
Hedef, mevcut telemetry ve production verisini kullanarak planlı ve plansız duruşları doğru şekilde modellemek, raporlamak ve ileride OEE hesaplarına temel oluşturmaktır.

## Kapsam

Bu doküman şunları kapsar:

- OEE kavramı, alt bileşenleri ve hesaplama yaklaşımı
- Downtime sınıfları ve sözlük yapısı
- Mevcut sistemdeki veri kaynakları ve etkileyen akışlar
- Planlı duruş akışı ve job order ile senkronizasyon
- Kısa duruş (minor stop) yaklaşımı
- API ve veri modeli önerileri
- Faz planı ve doğrulama kriterleri
- Açık sorular ve riskler

Bu doküman şunları kapsamaz:

- Tam OEE formülünün implementasyonu ve nihai rapor ekranları
- Vardiya planlama ve zaman çizelgesi detayları (yalnızca tasarım notları)

## Onaylı Tasarım Kararları

Bu bölüm, bu doküman yazılırken birlikte netleştirilen kararları özetler.
Uygulama başlamadan önce bu kararlar referans alınmalıdır.

### Machine events sahipliği ve tek yazım kapısı

- `machine_events` makine timeline verisi için tek gerçek kaynaktır
- `machine_events` yazımı tek bir servis kapısından yapılır
- Hiçbir domain doğrudan `MachineEvent.create` veya `MachineEvent.findByIdAndUpdate` çağrısı yapmaz
- Tek yazım kapısı olarak `backend/src/domains/machines/services/machine-event-service.js` baz alınır ve gerekiyorsa genişletilir

### Event yazım kapısının kapsamı

Tek yazım kapısı yalnızca teknik bir create helper değildir, gateway olarak davranır.
Bu gateway, tek açık event kuralını ve downtime sınıflandırma kurallarını tek noktadan enforce eder.

Gateway sorumlulukları:

- Tek açık event kuralını uygular
- `state = downtime` event’lerinde `reasonCode` zorunluluğunu uygular
- Planlı duruş açıkken plansız duruş tespitini bastırır
- Tekrarlı çağrılara karşı basit idempotency sağlar

Not:

- İleride opsiyonel olarak “policy” ve “write” katmanlarına ayırmak değerlendirilebilir
- Bu ayrım yapılırsa `machine-event-service` write katmanı olur, iş kuralları ayrı bir policy katmanına taşınır

### MachineEvent modeli ve tek açık event kuralı

- Her makine için aynı anda en fazla bir açık `MachineEvent` bulunur
- Yeni bir event açıldığında aynı makinedeki tüm açık event’ler kapatılır ve yeni event başlatılır

### Planlı duruş başlama bitme semantiği

- Planlı duruş manuel başlatılabilir ve manuel bitirilir
- Planlı duruş bitince sistem job’u otomatik resume etmez, kullanıcı resume eder

### Planlı duruş job order ile bağ

- Planlı duruş başladığında makinede aktif job varsa sistem job order’ı otomatik pause eder

### Plansız duruş tespiti

- Plansız duruşlar kullanıcı tarafından oluşturulmaz
- Plansız duruş event’i, yalnızca telemetry’de `signalValue = 0` serisi `downtimeThresholdMs` süresini aşınca açılır
- Planlı bir duruş açıkken plansız duruş tespiti bastırılır, planlı duruş varken plansız duruş event’i açılmaz

### downtimeThresholdMs

- İlk faz için `downtimeThresholdMs = 5000` olarak kabul edilir
- Test ve gözlem sonuçlarına göre 10 veya 30 saniyeye çekilebilir

### reasonCode defaultları

- Plansız duruş için default reasonCode: `unplanned_stop`
- Planlı duruşlar kullanıcı seçimi ile başlar
  - İlk faz planlı reasonCode seti: `planned_break`, `maintenance`
- `maintenance` bu tasarımda planlı duruş olarak kabul edilir (OEE availability kaybına girer)
- `planned_break` ve vardiya dışı saatler OEE’yi etkilemez
  - Bu süreler “non-working time” olarak ele alınır ve OEE paydasından dışlanır
  - Timeline/Monitoring için event olarak tutulabilir, fakat OEE tarafında kayıp olarak sayılmaz

### Planlı duruş job bağımsızlığı

- Planlı duruşlar aktif bir job order olmasa da başlatılabilir ve bitirilebilir
- Makinede aktif job yoksa planlı duruş başlatma akışında job pause adımı uygulanmaz

### UI giriş noktası

- Planlı duruş yönetimi ayrı bir Downtime ekranından yapılır

### Downtime ekranı minimum kapsam

İlk fazda Downtime ekranı minimum şu aksiyonları içerir:

- Planlı duruş başlat
- Planlı duruş bitir
- Açık duruşları listele (makine bazlı)

Not:

- Geçmiş listeleme ve detay raporlar kısa vadede gereklidir ancak ilk faz minimum kapsam değildir

### Planlı duruşta machine status

- Planlı duruş başladığında `machine.status` değeri `downtime` olarak set edilir
- Planlı duruş türü ve kırılımı `reasonCode` üzerinden yapılır, `maintenance` gibi ayrı bir status kullanılmaz

### Planlı duruş sırasında telemetry davranışı

- Planlı duruş açıkken telemetry “stopped” moduna geçer
  - Sinyal her tick 0 olarak üretilir
  - Telemetry metrikleri “idle” profilinden daha düşük ve daha stabil “stopped” profiline düşer
  - Mod değişimlerinde mevcut transition mantığı (ramp-down ramp-up) korunur
- Amaç, Monitoring ekranında planlı duruş görünürken sinyal ve metriklerin “çalışıyor” gibi görünmesini engellemektir

### Yetkilendirme

- Planlı duruşları Operator veya Supervisor başlatıp bitirebilir
- Manuel planlı duruş start ve end işlemlerinde `triggeredBy` zorunludur

### Planlı duruş schedule

- İlk fazda yalnızca manuel planlı duruş desteklenir
- Otomatik planlı duruş schedule modeli ileride opsiyonel olarak ele alınacaktır

### Audit log

- İlk fazda ayrı bir audit log koleksiyonu yoktur
- Manuel işlemler `triggeredBy` ve `source` alanlarıyla izlenebilir olmalıdır

### Done kriteri

- İlk faz “downtimes” tamamlandı sayılmadan OEE KPI hesaplamasına geçilmez
- “Downtimes tamamlandı” tanımı için doğrulama senaryoları ve kontrol listesi bu dokümanda bulunur

## OEE Kavramı

Makine ve ekipmanların etkinlik düzeyini belirlemek ve izlemek üzere kullanılan temel performans göstergelerinden biri OEE (Toplam Ekipman Etkinliği) olarak kabul edilir.
OEE, bir üretim operasyonunun planlanan süre içinde ne kadar verimli kullanıldığını ölçen matematiksel bir yaklaşımdır.

OEE değeri üç alt değerlendirme anahtarına bağlı olarak hesaplanır:

- Kullanılabilirlik (availability)
- Performans (performance)
- Kalite (quality)

Bu ayrım, iyileştirme ve izleme sürecinde kayıp türlerinin kök nedenini bulmaya yardımcı olur.

### Kullanılabilirlik availability

Kullanılabilirlik, makinenin çalışma süresinin planlı üretim süresine oranıdır.
Duruş kayıplarına işaret eder.

Tanım:

- Planlı üretim süresi = incelenen vardiya veya pencere süresi
- Çalışma süresi = planlı üretim süresi eksi duruş süreleri

Not:

- Planned production time içinde kalan bakım gibi planlı duruşlar ve plansız duruşlar kullanılabilirliği etkiler
- Öğle arası ve mesai dışı saatler gibi non-working time kullanılabilirliği etkilemez (paydadan dışlanır)
- İleride opsiyonel olarak sadece plansız duruşların kullanılabilirliği etkilemesi seçeneği değerlendirilecektir

### Performans performance

Performans, gerçekleşen üretim miktarının teorik olarak üretilmesi gereken miktara oranıdır.
Hız kayıplarına işaret eder.

Pratikte iki eşdeğer form kullanılabilir:

- Performans = Gerçekleşen üretim / Teorik üretim
- Teorik üretim = Çalışma süresi boyunca ideal hız ile üretilebilecek miktar

### Kalite quality

Kalite, kalite kontrol onayı almış üretim miktarının gerçekleşen üretim miktarına oranıdır.
Kalite kaybına işaret eder.

## OEE Nasıl Hesaplanır

OEE, kullanılabilirlik performans ve kalite çarpanlarının çarpımıdır.

Yüzde bazlı ifade:

- A P Q değerleri yüzde olarak hesaplanır
- OEE yüzdesi = A × P × Q / 10000

Not:

- UI ve raporlarda OEE A P Q değerleri yüzde olarak gösterilir
- Hesaplamada oran bazlı temsil kullanılabilir ancak dışa yansıyan değerler yüzde olmalıdır

## OEE Örnek Hesap

Bir vardiya için örnek değerler:

| Alan | Değer |
| --- | --- |
| Vardiya süresi | 720 dk |
| Planlı duruş | 28 dk |
| Plansız duruş | 16 dk |
| Makine hızı | 60 adet dk |
| Toplam ürün | 37500 |
| Kaliteli ürün | 35000 |

Bu örnekte planlı duruş (örneğin bakım) ve plansız duruş, planned production time içinde kabul edilmiştir:

- Çalışma süresi = 720 - 28 - 16 = 676 dk
- Kullanılabilirlik = 676 / 720 = yüzde 93.8
- Teorik üretim = 676 × 60 = 40560 adet
- Performans = 37500 / 40560 = yüzde 92.4
- Kalite = 35000 / 37500 = yüzde 93.3
- OEE yüzdesi = 93.8 × 92.4 × 93.3 / 10000 = yüzde 80.86

Opsiyonel politika olarak sadece plansız duruşların kullanılabilirliği etkilemesi durumunda:

- Planlı üretim süresi = 720 - 28 = 692 dk
- Çalışma süresi = 692 - 16 = 676 dk
- Kullanılabilirlik = 676 / 692 = yüzde 97.6
- Performans ve kalite tanımı aynı kalır

## Kısa Duruş Notu

Kısa duruşlar ileride ayrıca ele alınacaktır.
İlk fazda sistem, yalnızca belirlenen threshold süresini aşan sinyal 0 serilerini plansız duruş olarak kaydeder.

## Mevcut Durum

### Veri kaynakları

- `machine_telemetry`
  - Kaynak: `backend/scripts/data-gen.js`
  - İçerik: `signalValue` (0/1), timestamp, metrikler
- `machine_events`
  - Kaynak:
    - Otomatik downtime: `backend/src/domains/oee/services/oee-processor.js`
    - Operasyonel aksiyonlar: `backend/src/domains/production/services/job-order-service.js` (pause, resume, complete, cancel sırasında makine event’i yazılır)
- `job_orders` ve `production_events`
  - Kaynak: `backend/src/domains/production/*` + `backend/scripts/job-simulator.js`
  - İçerik: üretim adetleri, good ve defective ayrımı, event geçmişi

### Mevcut metrikler

Board API şu metrikleri döner:

- makine sayıları (running, downtime, idle)
- son pencere telemetry ortalamaları
- son pencerede toplam downtime süresi

Not: A P Q ve OEE yüzdesi gibi KPI’lar mevcut değil.

## Hedef Tanımlar

## MachineEvent Modeli

Bu tasarımda `machine_events` makinenin durum geçmişi için tek gerçek kaynaktır.
Event’ler zaman aralığı olarak tutulur ve makinenin anlık durumu en son event üzerinden türetilir.

### Yazım kapısı

`machine_events` yazımı için tek bir write gateway kullanılır.
Amaç, tek açık event kuralını, `machine.status` güncellemelerini ve downtime sınıflandırma kurallarını tek noktadan enforce etmektir.

Bu yaklaşımın sonucu:

- OEE processor ve Production akışları event yazarken bu kapıyı kullanmak zorundadır
- Doğrudan Mongoose model çağrıları ile event yazımı yapılmaz

### Tek açık event kuralı

Her makine için aynı anda en fazla bir açık event bulunur.

- Açık event tanımı: `endedAt` alanı olmayan event
- Yeni event açılınca aynı makinedeki açık event’ler kapatılır ve yeni event başlatılır

Bu kuralın etkisi:

- Makine state’i parça parça değil, event dizisi üzerinden okunur
- Raporlama için “downtime süresi” gibi hesaplar event zamanlarından elde edilir

### Downtime türleri

- Planlı duruş
  - Üretim için planlı olunan sürede planlı faaliyet nedeniyle duruş
  - Örnek: yemek molası, çay molası, planlı bakım, temizlik, kalite kontrol
- Plansız duruş
  - Run sinyalinin 0 olması ile başlar, 1 olması ile biter
  - Kullanıcı tarafından oluşturulamaz
  - OEE kullanılabilirlik çarpanından düşer

### Plansız duruş örnekleri

Plansız duruşlar üretim sırasında beklenmeyen kayıplardır ve kullanıcı tarafından oluşturulmaz.
Örnekler:

- ekipman arızası
- planlanmamış bakım
- operatör eksikliği
- elektrik arızası
- makine hazırlık süresi
- plansız ikmal doldurma süresi

Not:

- Bazı örnekler (örneğin hazırlık veya ikmal) sahadaki süreçlere göre planlı veya plansız sınıfına çekilebilir
- Bu doküman, sınıflandırmanın `reasonCode` sözlüğü üzerinden yönetilmesini hedefler

### Planlı duruş örnekleri

Planlı duruşlar, ekipmanın üretim için planlandığı ancak planlı etkinlikler nedeniyle çalışmadığı zamandır.
Örnekler:

- yemek molası
- çay molası
- planlı bakım

Not:

- Vardiya dışı ve üretim yapılmayan günler “non-working time” olarak ele alınır ve OEE paydasına girmez
- Bu ihtiyaç vardiya takvimi ve planned production time modelini gerektirir

### Planlı duruş türleri

Planlı duruşlar iki farklı şekilde gerçekleşebilir:

- Manuel planlı duruş
  - Duruş önceden planlanır ve zamanı geldiğinde operatör paneline düşer
  - Duruşun gerçekten başlaması ve bitmesi sahadaki operatörün manuel aksiyonu ile olur
- Otomatik planlı duruş
  - Duruş önceden planlanır
  - Belirtilen tarih ve zamanda operatöre ihtiyaç olmadan otomatik başlar ve biter

### Telemetry modları

Telemetry simülasyonu makinenin durumuna göre farklı profiller üretecek şekilde ele alınır.
Bu modlar UI’daki “makine durumu”ndan bağımsız olarak, Monitoring ekranında beklenen davranışı sağlamak için kullanılır.

- running
  - Aktif iş emri vardır ve üretim yürütülür
  - Metrikler yüksek profilde seyreder, sinyal ağırlıklı olarak 1’dir
- idle
  - Aktif üretim yürütülmez
  - Metrikler düşük profilde seyreder, sinyal daha sık 0 üretir
- stopped
  - Makinede açık bir planlı duruş vardır
  - Sinyal her tick zorunlu 0 üretilir
  - Metrikler “idle” profilinden daha düşük ve daha stabil “stopped” profiline düşer
  - Mod değişimlerinde transition mantığı (ramp-down ramp-up) korunur

### Simülasyon kontrol notu

Bu projede gerçek PLC bağlantısı olmadığı için `signalValue` ve telemetry profilleri simülatör tarafından üretilir.
Bu nedenle, “makineyi kasıtlı durdurma” gibi senaryoları test edebilmek için simülasyon verisini kontrollü şekilde değiştirebilmeliyiz.

Hedef prensip:

- İş kuralları gerçek sistemle aynı kalır
- Simülatör sadece “sinyali üretme” katmanıdır, `machine_events` yazmaz
- Plansız duruş event’i yine `signalValue=0` serisi ile ve threshold ile açılır, kullanıcı plansız duruşu “başlatmaz”, sadece reasonCode ile sınıflandırır

Minimum ihtiyaç:

- Planlı duruş açıkken simülatör otomatik stopped moduna geçer
- Dev ortamında, bir makine için belirli süre `signalValue=0` üretecek bir “simulate stop” kontrolü bulunur
  - Örnek senaryo: malzeme bittiği için operatör makineyi durdurdu, sistem plansız duruş açtı, operatör reasonCode olarak `material_shortage` seçti

Not:

- Bu kontrol backend’te “simulator only” bir API veya admin ekranı olabilir
- Üretim ortamında bu kontrol devre dışı bırakılır (ortam değişkeni veya role ile)

### OEE policy notu

İlk faz hedefi downtime standardizasyonudur, OEE hesapları daha sonra ele alınacaktır.
Temel prensipler:

- OEE paydası “planned production time” olmalıdır
- Mesai dışı saatler ve öğle arası gibi “non-working time” OEE’yi etkilemez (paydadan dışlanır)
- Planned production time içinde kalan bakım gibi planlı duruşlar ve plansız duruşlar OEE availability kaybıdır
- İleride opsiyonel olarak “sadece plansız duruşların availability’i etkilemesi” seçeneği değerlendirilebilir

## Downtime sözlüğü ve reasonCode standardı

### Neden reasonCode zorunlu olmalı

Downtime raporlaması ve OEE hesapları için her downtime event’inin makine tarafından anlaşılabilir bir sınıflandırması olmalıdır.
Serbest metin (örneğin `metadata.reason`) raporlama için güvenilir değildir.

Bu nedenle:

- `MachineEvent.state = downtime` olduğunda `MachineEvent.reasonCode` zorunlu olmalıdır
- `reasonCode` değerleri merkezi bir sözlükten gelmelidir
- UI, planlı duruş oluştururken reasonCode seçimini dropdown ile yaptırmalıdır

### Sözlük kaynağı

Sözlük `backend/src/domains/oee/config/oee-rules.json` içinde tutulur ve backend bunu okuyarak doğrular.

İlk faz reasonCode kümesi:

- `unplanned_stop` plansız duruş
- `planned_break` planlı mola
- `maintenance` bakım (planlı)

Not: Ek planlı reasonCode’lar (örneğin temizlik, kalite kontrol) ihtiyaç oldukça sözlüğe eklenebilir.

## Akışlar

### Çakışma politikası

Makinede açık bir planlı duruş varken plansız duruş tespiti bastırılır.
Bu tasarımda planlı duruş, makinenin zaten duruyor olduğu anlamına gelir ve aynı zaman aralığı için ek bir plansız duruş event’i açılmaz.

### Production ve machine events sınırı

Production domain makine timeline’ını yalnızca “running” ve “idle” state’leri üzerinden günceller.
Downtime state’i Production tarafından yazılmaz.

- Production job aksiyonları:
  - `start` ve `resume` sırasında makine `running` event’i yazılır
  - `complete` ve `cancel` sırasında makine `idle` event’i yazılır
  - `pause` aksiyonu makine `downtime` event’i yazmaz
- Downtime event’leri:
  - Planlı duruşlar: Operator veya Supervisor tarafından başlatılır ve bitirilir, `reasonCode` zorunludur
  - Plansız duruşlar: telemetry üzerinden tespit edilir, `reasonCode = unplanned_stop` ile açılır

### Production UI kısayolu (Planlı Duruş Başlat)

Kullanıcı deneyimi için Production ekranında bir kısayol butonu bulunabilir.
Bu butonun anlamı “job’u pause et” değildir, doğrudan “planlı duruş başlat”tır.
Ana yönetim noktası Downtime ekranıdır; Production tarafındaki buton sadece kısayoldur.

Kararlar:

- Production ekranında `Planlı Duruş Başlat` kısayolu bulunur
- Kısayol tıklandığında küçük bir modal ile reasonCode seçimi yapılır
  - İlk faz: `maintenance` veya `planned_break`
- Bu kısayol Production pause endpoint’ini çağırmaz
  - Downtime domain planned start API’sini çağırır
  - Downtime domain içeride aktif job varsa job’u pause eder

Bu sayede:

- “Pause” semantiği tekleşir ve kullanıcı açısından “neden durdum” akışı downtime üzerinden yürür
- Downtime sahipliği bozulmaz, Production ekranı sadece bir giriş noktası olur

### pauseJobOrder endpoint politikası

Mevcut sistemde Production domain içinde `pauseJobOrder` gibi bir aksiyon bulunur.
Ancak bu tasarımda “kullanıcının üretimi durdurması” planlı duruş üzerinden yapılır.

Karar:

- `pauseJobOrder` kullanıcıya açık bir UX aksiyonu değildir
- Job pause, planlı duruş başlatma akışının iç adımı olarak kullanılır
- Kullanıcı arayüzünde “Pause Job” gibi ayrı bir aksiyon sunulmaz

Sonuç:

- Kullanıcı “durdurma” yapmak istediğinde planlı duruş başlatır
- Plansız duruş başlatma kullanıcı aksiyonu değildir; plansız duruşu sistem açar, kullanıcı sadece reasonCode ile sınıflandırır

Not:

- Teknik olarak endpoint bir süre daha var olabilir (geriye dönük uyumluluk)
- Ancak UI sözleşmesinde `pauseJobOrder` çağrısı yapılmayacak şekilde ilerlenir

### Köşe durum: açık plansız duruş varken planlı duruş başlatma

Makine zaten plansız downtime içindeyken kullanıcı planlı duruş başlatmak isteyebilir (örneğin arıza gibi görünen durum aslında bakım başlangıcı).

Karar:

- Reddetmek yerine, aynı timestamp’te “dönüştürme” yapılır
  - Açık plansız event kapanır
  - Aynı anda planlı downtime event’i açılır (seçilen reasonCode ile)
- Tek açık event kuralı korunur ve timeline sınıflandırması netleşir

### A Planlı duruş manuel başlatma

Aktör: Operator veya Supervisor

Hedef davranış:

1. Duruş planlanır ve zamanı geldiğinde operatör paneline düşer veya kullanıcı makineyi seçerek planlı duruş başlatır
2. Kullanıcı reasonCode seçer ve opsiyonel açıklama girer
3. Sistem `machine_events` içinde planlı downtime event’i açar
4. Makinede aktif job varsa sistem job order’ı otomatik pause eder
5. Job’un tekrar başlaması kullanıcı tarafından resume ile yapılır

Notlar:

- Planlı duruşun “başlatılması” makine state’ini downtime yapar
- Üretimin yazılmaması için job’un `paused` olması gerekir
- Planlı duruş sırasında telemetry stopped modunda üretilir, sinyal 0 olur

### B Planlı duruş manuel bitirme

Aktör: Operator veya Supervisor

Hedef davranış:

1. Kullanıcı ilgili makinedeki açık planlı downtime event’ini bitirir
2. Sistem `machine_events.endedAt` alanını kapatır
3. Sistem job’u otomatik resume etmez
4. Kullanıcı job’u resume ederek üretimi devam ettirir

### E Planlı duruş otomatik gerçekleşme

Aktör: Sistem

Hedef davranış:

Bu akış ilk fazın parçası değildir.
Planlı duruş schedule desteği ileride opsiyonel olarak ele alınacaktır.

### C Plansız duruş otomatik tespit

Aktör: Sistem

Ön koşul:

- Makinede aktif job order vardır
- Makine state `running` durumundadır
- Makinede açık bir planlı duruş event’i yoktur

Hedef davranış:

- Telemetry’de signalValue 0 serisi `downtimeThresholdMs` üstüne çıkarsa sistem `machine_events` içinde plansız downtime açar
- Signal 1’e döndüğünde ilgili downtime event’i kapanır

### D Kısa duruş

Kısa duruşların sınıflandırması ve OEE performans çarpanına yansıtılması ileride ayrıca ele alınacaktır.
İlk fazda kısa duruşlar ayrı bir event olarak işlenmez.

## Önerilen API yüzeyi

Not: Endpoint isimleri tasarım seviyesindedir.

### Planned downtime yönetimi

```text
POST   /api/downtimes/planned/start
POST   /api/downtimes/planned/:id/end
GET    /api/downtimes/planned?machineId=&status=open|closed&from=&to=
```

Bu API:

- machine event açar veya kapatır
- gerekiyorsa ilgili job order’ı pause eder

### Downtime sözlüğü

```text
GET /api/oee/reasons
```

Amaç:

- `reasonCatalog` listesini UI’a sunmak
- UI dropdown’larını backend ile aynı sözlüğe bağlamak

### Simülatör kontrol yüzeyi (dev-only)

Not: Bu endpoint’ler prod için değil, simülasyon/test için düşünülür.

```text
POST /api/simulator/machines/:machineId/force-telemetry
Body: { mode: "running"|"idle"|"stopped", durationMs?: number }

POST /api/simulator/machines/:machineId/force-signal
Body: { signalValue: 0|1, durationMs: number }
```

### Downtime ekranı

Downtime ekranı minimum kapsamı için `Onaylı Tasarım Kararları` bölümündeki checklist uygulanır.

## Veri modeli önerileri

### MachineEvent zorunlulukları

- `state = downtime` olduğunda:
  - `reasonCode` zorunlu
  - `source` zorunlu (`operator|system|simulator`)
- Manuel planlı duruş start ve end işlemlerinde:
  - `triggeredBy` zorunlu
- `metadata` içine serbest açıklama ve ek bağlam konabilir

### Planned downtime tanımı

Planned downtime için iki yaklaşım vardır:

1. Planned downtime ayrı bir koleksiyonda tutulmaz
   - Sadece `machine_events` üzerinde `reasonCode` ile ayırt edilir
   - Basit, hızlı, tek gerçek kaynak
2. Planned downtime schedule için ayrı koleksiyon eklenir
   - Gelecekte “zamanı gelince otomatik duruş” için gereklidir
   - machine_events yine gerçek zamanlı kayıt olarak kalır

İlk faz için yaklaşım 1 yeterlidir.
Schedule ihtiyacı netleşince yaklaşım 2 eklenebilir.

## Faz planı

### Faz 1 Downtime standardizasyonu

- `machine_events` için tek yazım kapısını kesinleştir ve mevcut akışları bu kapıya bağla
- Tek açık event kuralının tüm machine event yazımlarında korunması
- `state = downtime` event’lerinde `reasonCode` zorunluluğu ve sözlük doğrulaması
- machine_events üzerinde reasonCode standardı ve doğrulama
- planlı duruş manuel başlatma ve bitirme
- planlı duruş başladığında job order otomatik pause
- planlı duruş bittiğinde job order otomatik resume yok

### Faz 2 Kısa duruş kararı

- kısa duruşu event olarak mı tutacağız kararını netleştirme
- eşik süresi ve merge davranışı belirleme
- rapor metriklerinin taslağı

### Faz 3 OEE hesaplarına hazırlık

- availability için planlı ve plansız duruş toplamları
- performance için minor stop etkisi tasarımı
- quality için production_events good ve defect ayrımı

## Doğrulama senaryoları

```text
Senaryo 1 Planlı bakım
- job in_progress
- operator maintenance başlatır
Beklenen:
- machine_events downtime açılır reasonCode=maintenance
- job paused olur
- üretim event’i yazılmaz

Senaryo 2 Plansız duruş
- job in_progress
- signal 0 serisi downtimeThresholdMs üstü
Beklenen:
- machine_events downtime açılır reasonCode=unplanned_stop
- signal 1 olunca event kapanır

Senaryo 3 Planlı duruş sonrası devam
- planlı downtime kapatılır
Beklenen:
- job otomatik resume olmaz
- kullanıcı resume ile devam eder
```

## Done Kriteri

Downtime tarafı “tamamlandı” sayılmadan OEE KPI hesaplaması implementasyonuna geçilmez.
Bu bölüm, ilk faz için minimum kabul kriterlerini tanımlar.

### Fonksiyonel kriterler

- Planlı duruş manuel başlatma ve bitirme akışı çalışır
- Planlı duruş başladığında makinede aktif job varsa job otomatik pause olur
- Planlı duruş bittiğinde job otomatik resume olmaz
- Plansız duruşlar yalnızca telemetry üzerinden ve `downtimeThresholdMs` ile tetiklenir
- Planlı duruş açıkken telemetry stopped modunda üretilir, sinyal 0 olur
- Production job aksiyonları makine timeline’ını yalnızca running ve idle state’leri ile günceller, downtime state’i Production tarafından yazılmaz

### Veri ve sınıflandırma kriterleri

- `machine_events` üzerinde tek açık event kuralı korunur
- `state = downtime` olan her event için `reasonCode` doludur
- `reasonCode` yalnızca merkezi sözlükten gelir

### Gözlemlenebilirlik kriterleri

- Kullanıcı makine event geçmişinden planlı/plansız duruşları ve reasonCode’larını görebilir
- Dashboard metrikleri downtime sürelerini tutarlı şekilde yansıtır

## Açık sorular

- Kısa duruşlar için threshold ve kayıt stratejisi nasıl olacak (ilk faz dışı)
- Vardiya ve planned production time modeli netleşmeli
  - Non-working time (mesai dışı, öğle arası, tatil) hangi modelle temsil edilecek (takvim mi, schedule mı, reasonCode mu)
  - Shift bazlı raporlama için minimum `ShiftCalendar` alanları ne olacak (vardiya aralıkları, break aralıkları, tatiller)
- Plansız duruşlarda reasonCode sınıflandırma akışı netleşmeli
  - Kullanıcı “reasonCode güncelleme” yapabilecek mi, kimler yapabilecek (Operator/Supervisor)
  - reasonCode “event kapanmadan önce zorunlu” mu olacak, yoksa daha sonra düzeltilebilir mi
- Simülasyon kontrol yüzeyi netleşmeli (dev-only)
  - “Force signal 0/1” ve “force telemetry mode” aksiyonları API mı olacak, admin ekran mı

## Riskler

- Event sayısı büyümesi ve rapor sorgularının maliyeti
- Telemetry dalgalanması nedeniyle yanlış duruş sınıflandırması
- Planlı duruş ve otomatik plansız duruş çakışmalarının yönetimi

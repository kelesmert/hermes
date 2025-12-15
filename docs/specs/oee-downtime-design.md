# OEE ve Downtime Tasarımı

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

### Yetkilendirme

- Planlı duruşları Operator veya Supervisor başlatıp bitirebilir

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

- İlk fazda planlı ve plansız duruşlar birlikte kullanılabilirliği etkiler
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

İlk faz politikası ile planlı ve plansız duruşlar OEE kullanılabilirliğini etkiler:

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
- tatil günleri ve üretim yapılmayan günler
- planlı bakım

Not:

- Belirli vardiyalarda veya belirli günlerde çalışılması gerekmiyorsa bu sürelerin OEE hesabının paydasına girmemesi önemlidir
- Bu ihtiyaç vardiya takvimi ve planned production time modelini gerektirir

### Planlı duruş türleri

Planlı duruşlar iki farklı şekilde gerçekleşebilir:

- Manuel planlı duruş
  - Duruş önceden planlanır ve zamanı geldiğinde operatör paneline düşer
  - Duruşun gerçekten başlaması ve bitmesi sahadaki operatörün manuel aksiyonu ile olur
- Otomatik planlı duruş
  - Duruş önceden planlanır
  - Belirtilen tarih ve zamanda operatöre ihtiyaç olmadan otomatik başlar ve biter

### OEE policy notu

İlk fazda OEE kullanılabilirlik hesabında planlı ve plansız duruşlar birlikte değerlendirilir.
İleride opsiyonel olarak sadece plansız duruşların kullanılabilirliği etkilemesi seçeneği değerlendirilecektir.

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

Örnek reasonCode kümesi:

- `unplanned_stop` plansız duruş
- `planned_break` planlı mola
- `maintenance` bakım
- `minor_stop` kısa duruş

Not: `maintenance` kategori kararı daha sonra netleştirilecektir.

## Akışlar

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
- Telemetry sinyali planlı duruş sırasında 0 olmak zorunda mı sorusu ileride netleştirilecek

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

1. Planlı duruş bir schedule kaydı üzerinden tanımlanır
2. Başlangıç zamanı geldiğinde sistem `machine_events` içinde planlı downtime event’i açar
3. Makinede aktif job varsa sistem job order’ı otomatik pause eder
4. Bitiş zamanı geldiğinde sistem downtime event’ini kapatır
5. Sistem job’u otomatik resume etmez, kullanıcı resume eder

### C Plansız duruş otomatik tespit

Aktör: Sistem

Ön koşul:

- Makinede aktif job order vardır
- Makine state `running` durumundadır

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

## Veri modeli önerileri

### MachineEvent zorunlulukları

- `state = downtime` olduğunda:
  - `reasonCode` zorunlu
  - `source` zorunlu (`operator|system|simulator`)
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

### Veri ve sınıflandırma kriterleri

- `machine_events` üzerinde tek açık event kuralı korunur
- `state = downtime` olan her event için `reasonCode` doludur
- `reasonCode` yalnızca merkezi sözlükten gelir

### Gözlemlenebilirlik kriterleri

- Kullanıcı makine event geçmişinden planlı/plansız duruşları ve reasonCode’larını görebilir
- Dashboard metrikleri downtime sürelerini tutarlı şekilde yansıtır

## Açık sorular

- Planlı duruş sırasında telemetry sinyali 0 zorunlu mu olmalı
- `maintenance` kategori politikası nasıl olacak
- Kısa duruşlar için threshold ve kayıt stratejisi nasıl olacak
- Job order ile downtime ilişkisinde “pauseReasonCode” gibi ek alan gerekli mi
- Vardiya ve planned production time modeli nasıl olacak

## Riskler

- Event sayısı büyümesi ve rapor sorgularının maliyeti
- Telemetry dalgalanması nedeniyle yanlış duruş sınıflandırması
- Planlı duruş ve otomatik plansız duruş çakışmalarının yönetimi

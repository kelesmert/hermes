# HERMES MES SİSTEMİ KAPSAMLI ANALİZ RAPORU

Bu doküman, Hermes MES sisteminin mevcut durumunu, tespit edilen kritik hataları, mimari tutarsızlıkları ve önerilen çözüm yollarını detaylı şekilde açıklamaktadır.

---

## BİRİNCİ BÖLÜM: MİMARİ ÖZET

### Simülasyon Katmanı Yapısı

Hermes MES sisteminde üç adet bağımsız simülasyon scripti bulunmaktadır. Bu scriptler birbirinden bağımsız çalışan Node.js process'leri olarak tasarlanmıştır.

Birinci script olan data-gen.js, gerçek zamanlı telemetri üretimi için kullanılmaktadır. Her iki saniyede bir tüm aktif makineler için telemetri verisi üretir. Ürettiği verilerin source alanı "data-gen" olarak işaretlenir. Bu script herhangi bir dış bağımlılığı olmadan bağımsız çalışabilir.

İkinci script olan shift-simulator.js, hızlandırılmış vardiya simülasyonu için tasarlanmıştır. Gerçek hayatta 11 saat süren bir vardiyayı yaklaşık 3 dakikada simüle eder. Ürettiği verilerin source alanı "shift-sim" olarak işaretlenir. Sanal bir zaman kavramı kullanır ve virtualDay adı verilen bir tarih değerini takip eder. Bu script de bağımsız çalışabilir ancak SimulationState modelini kullanarak durumunu veritabanında saklar.

Üçüncü script olan job-simulator.js, üretim event'i üretimi için kullanılır. Kendisi telemetri üretmez, bunun yerine data-gen veya shift-sim tarafından üretilen telemetri verilerini okur ve bu verileri ProductionEvent kayıtlarına dönüştürür. Bu script, diğer iki scriptten birine bağımlıdır çünkü işleyeceği telemetri verisi olmadan çalışamaz.

**Not (test schedule):** Shift-sim içinde test amaçlı sabit bir zaman çizelgesi bulunmaktadır (07:00–08:00 çalışır, 08:00–08:30 durur, 08:30–18:00 tekrar çalışır). Bu davranış test odaklıdır ve üretim davranışı gibi algılanmamalıdır; env ile kontrol edilmesi önerilir.

### Temel Veri Modelleri

Sistemde kullanılan temel veri modelleri şunlardır:

JobOrder modeli iş emirlerini temsil eder. Her iş emri bir parça, bir makine, hedef miktar ve üretim durumu bilgilerini içerir. Durum değerleri pending, in_progress, paused, completed ve cancelled olabilir.

MachineTelemetry modeli makine telemetri verilerini saklar. Her kayıt bir makineye ait olup, timestamp, sinyal değeri, metrikler ve source bilgisi içerir. simulationRunId alanı hangi simülasyon çalıştırmasına ait olduğunu belirtir.

ProductionEvent modeli üretim olaylarını saklar. Her kayıt bir iş emrine ve makineye bağlıdır. Üretilen miktar, kalite durumu ve hata tipi gibi bilgileri içerir.

SimulationState modeli simülasyon durumunu saklar. Önemli bir nokta olarak, bu model tüm sistem için tek bir kayıt tutar. virtualDay, shiftStartAt, shiftEndAt ve simulationRunId gibi alanları içerir.

Machine modeli makine bilgilerini saklar. currentJobOrder alanı o an makinede çalışan iş emrini referans eder. status alanı makinenin mevcut durumunu belirtir.

---

## İKİNCİ BÖLÜM: VERİ AKIŞI

### Normal Çalışma Senaryosu

Sistemin normal çalışma akışı şu şekilde gerçekleşir:

İlk adımda kullanıcı bir iş emri oluşturur. Bu iş emri pending durumunda veritabanına kaydedilir. Henüz herhangi bir makine ile ilişkilendirilmemiştir yani makinenin currentJobOrder alanı boştur.

İkinci adımda kullanıcı iş emrini başlatır. Bu noktada job-order-service içindeki startJobOrder fonksiyonu çağrılır. Bu fonksiyon iş emrinin startTime alanını o anki gerçek zamana ayarlar, durumu in_progress yapar ve makinenin currentJobOrder alanını bu iş emri ile günceller.

Üçüncü adımda simülasyon scriptleri telemetri üretmeye başlar. data-gen veya shift-sim scripti çalışıyorsa, makineler için telemetri verileri üretilir. Bu telemetri verileri MachineTelemetry koleksiyonuna kaydedilir.

Dördüncü adımda job-simulator telemetriyi işler. job-sim scripti sürekli olarak MachineTelemetry koleksiyonunu tarar. Henüz işlenmemiş telemetri kayıtlarını bulur ve bunları ProductionEvent kayıtlarına dönüştürür. Her başarılı üretim için iş emrinin producedQuantity değerini artırır.

Beşinci adımda hedef miktara ulaşılır. producedQuantity değeri targetQuantity değerine ulaştığında veya aştığında, iş emri otomatik olarak completed durumuna geçirilir.

### Sorunlu Akış

Mevcut sistemde bu akış birçok noktada bozulmaktadır. En kritik sorun, telemetri verilerinin hangi iş emrine ait olduğunun bilinmemesidir. Telemetri sadece makine bilgisi taşır, iş emri bilgisi taşımaz. Bu durum özellikle bir simülasyon durdurulup yeniden başlatıldığında büyük sorunlara yol açar.

---

## ÜÇÜNCÜ BÖLÜM: KRİTİK HATALAR

### Hata Bir: İş Emri Anında Tamamlanıyor

Bu hata sistemdeki en kritik ve kullanıcı tarafından doğrudan gözlemlenen hatadır.

Hatanın ortaya çıkış senaryosu şu şekildedir: Kullanıcı shift-sim simülasyonunu başlatır. Simülasyon çalışırken yüzlerce veya binlerce telemetri kaydı oluşturulur. Kullanıcı simülasyonu durdurur. Ardından yeni bir iş emri oluşturur ve bu iş emrini başlatır. Son olarak simülasyonu tekrar başlatır. Bu noktada iş emri anında veya birkaç saniye içinde tamamlanır.

Hatanın kök nedeni job-simulator.js dosyasında bulunan cursor yönetim mantığının iş emrinin başlangıç zamanını dikkate almamasıdır. İlgili kod şu şekildedir:

```javascript
const [earliestTimestamp, lastProducedAt] = await Promise.all([
  fetchEarliestTelemetryTimestampForRun(jobOrder.machine._id, latestRunId),
  fetchLatestProductionTimestamp(jobOrder._id, latestRunId),
]);
const baseTimestamp =
  lastProducedAt && lastProducedAt.getTime() < latest.timestamp.getTime()
    ? lastProducedAt
    : earliestTimestamp || latest.timestamp;
```

Bu kodda kritik bir mantık hatası vardır. fetchEarliestTelemetryTimestampForRun fonksiyonu simülasyon run'ının en erken telemetrisini arar, iş emrinin startTime değerini değil. Bu nedenle aynı run içinde bile, iş emri örneğin saat 10:00'da başlatılmış olsa dahi, sistem saat 07:00'dan itibaren vardiya başından beri biriken tüm telemetriyi işler.

Örnek senaryo olarak: Simülasyon saat 07:00'da başlar ve telemetri üretir. Kullanıcı saat 10:00'da yeni bir iş emri başlatır. job-sim, iş emrinin startTime değerini kontrol etmeden, run'ın başlangıcından yani saat 07:00'dan itibaren tüm telemetriyi işler. 3 saatlik telemetri backlog'u anında işlendiğinden iş emri saniyeler içinde tamamlanır.

Çözüm önerisi olarak, cursor başlangıcı hesaplanırken iş emrinin startTime değeri dikkate alınmalıdır. En minimal çözüm şu şekildedir:

```javascript
const jobStartTime =
  jobOrder.startTime || earliestTimestamp || latest.timestamp;
const baseTimestamp = lastProducedAt
  ? lastProducedAt
  : new Date(
      Math.max(
        jobStartTime.getTime(),
        (earliestTimestamp || latest.timestamp).getTime()
      )
    );
```

Bu değişiklik ile job-sim sadece iş emri başladıktan sonraki telemetriyi işleyecek ve anında tamamlanma sorunu çözülecektir.

### Tasarım Notu İki: SimulationState Global Olarak Tasarlanmış

Not: Bu bir hata değil, bilinçli bir tasarım kararıdır. Mevcut kullanım senaryosu için uygundur.

SimulationState modeli tüm sistem için tek bir kayıt tutacak şekilde tasarlanmıştır.

```javascript
key: {
  type: String,
  required: true,
  trim: true,
  unique: true,
  index: true,
}
```

key alanı unique constraint'e sahiptir ve sistemde sadece "shift-sim" anahtarıyla tek bir kayıt bulunmaktadır. Bu tasarım kararının sonuçları şunlardır:

Birincisi, tüm makineler aynı sanal günü paylaşır. virtualDay değeri tek bir kayıtta tutulduğu için tüm makineler aynı vardiyayı simüle eder. İkincisi, farklı iş emirleri için farklı simülasyon tarihleri kullanılamaz. Üçüncüsü, paralel simülasyon çalıştırma imkanı yoktur.

Bu tasarım "tek fabrika, tek vardiya, tüm makineler aynı anda çalışıyor" senaryosu için uygundur ve çoğu MES kullanım durumunu karşılar. Eğer gelecekte farklı vardiya profilleri veya per-job simülasyon gerekirse, mevcut yapı üzerine machine bazlı offset veya shift profile eklenebilir.

JobSimulationSession gibi tamamen yeni bir model oluşturmak büyük bir mimari değişiklik gerektirir ve mevcut ihtiyaçlar için gereksiz kompleksite ekler. Bu nedenle global SimulationState yapısı korunmalı, gerekirse kademeli olarak genişletilmelidir.

### Hata Üç: Job-Sim Cursor Bellekte Tutuluyor

job-simulator.js dosyasında telemetri cursor'ı bir JavaScript Map yapısında bellekte tutulmaktadır.

```javascript
const telemetryCursorByMachine = new Map();
```

Bu tasarımın ciddi sonuçları vardır. job-sim process'i herhangi bir nedenle yeniden başlatıldığında tüm cursor bilgileri kaybolur. Cursor kaybolduğunda sistem hangi telemetrinin işlendiğini bilemez. Bu durum aynı telemetrinin tekrar işlenmesine ve duplicate üretim kayıtlarına yol açar.

Çözüm önerisi olarak, cursor bilgisi veritabanında kalıcı olarak saklanmalıdır. Bu amaçla JobSimulationSession modelinde telemetryCursor alanı kullanılabilir veya ayrı bir TelemetryCursor koleksiyonu oluşturulabilir.

### Hata Dört: Telemetri JobOrder ile İlişkilendirilmemiş

MachineTelemetry modeli incelendiğinde jobOrder referansının olmadığı görülmektedir.

```javascript
const telemetrySchema = new mongoose.Schema({
  machine: { type: ObjectId, ref: "Machine", required: true },
  timestamp: { type: Date, required: true },
  signalValue: { type: Number, enum: [0, 1], required: true },
  metrics: { type: Mixed, default: {} },
  source: { type: String },
  simulationRunId: { type: String },
  // jobOrder alanı YOK
});
```

Bu eksikliğin sonuçları çok geniş kapsamlıdır. Hangi telemetrinin hangi iş emrine ait olduğu bilinemez. Bir iş emri için OEE hesaplarken hangi telemetrilerin kullanılacağı belirsizdir. Eski telemetriler yanlışlıkla yeni iş emirleri için işlenebilir.

Çözüm önerisi olarak, telemetry schema'ya jobOrder alanı eklenmeli ve shift-sim telemetri üretirken bu alanı doldurmalıdır.

### Hata Beş: startTime Gerçek Zaman Kullanıyor

job-order-service.js dosyasındaki startJobOrder fonksiyonu incelendiğinde, startTime değerinin gerçek zamandan alındığı görülmektedir.

```javascript
const startJobOrder = async (id, { requestedBy } = {}) => {
  const now = new Date();
  // ... diğer kodlar ...
  jobOrder.startTime = parseEventTime(now);
};
```

Bu durumun sonuçları oldukça karmaşıktır. shift-sim örneğin 2024-01-15 tarihini simüle ediyor olabilir. Ancak iş emri başlatıldığında startTime 2025-01-10 gibi gerçek tarih olarak kaydedilir. Bu durum tarih bazlı raporlarda tutarsızlıklara yol açar. OEE hesaplamalarında yanlış zaman aralıkları kullanılır.

Çözüm önerisi olarak, startJobOrder fonksiyonu opsiyonel bir simulationDate parametresi almalıdır. Bu parametre verildiğinde, startTime simülasyon tarihinden hesaplanmalıdır.

### Hata Altı: actualDurationMinutes Pause Süresini İçeriyor

completeJobOrder fonksiyonu incelendiğinde, toplam süre hesaplamasının hatalı olduğu görülmektedir.

```javascript
const completeJobOrder = async (id, { requestedBy } = {}) => {
  const now = new Date();
  // ... diğer kodlar ...
  if (jobOrder.startTime) {
    const actualMs = now.getTime() - jobOrder.startTime.getTime();
    jobOrder.actualDurationMinutes = Math.round(actualMs / 60000);
  }
};
```

Bu hesaplama startTime ile endTime arasındaki toplam süreyi alır. Ancak bu süre içinde iş emrinin paused durumda geçirdiği süreler de dahildir. Gerçek üretim süresi hesaplanmış olmaz.

Bu durumun sonuçları performans metriklerini doğrudan etkiler. OEE performance hesaplaması için net üretim süresi gereklidir. Mevcut hesaplama ile performance değeri olması gerekenden düşük çıkar.

Çözüm önerisi olarak, pause ve resume işlemlerinde süre takibi yapılmalıdır. totalPauseDurationMinutes gibi bir alan eklenmeli ve actualDurationMinutes hesaplanırken bu değer çıkarılmalıdır.

### Dokümantasyon Notu Yedi: Planned Downtime affectsOee Mantığı Kodda Mevcut

Not: Bu bir kod hatası değil, dokümantasyon eksikliğidir. affectsOee mantığı kodda doğru şekilde implement edilmiştir.

oee-calculator-service.js dosyasında affectsOee mantığı, reason catalog + MachineEvent sorgusu ile uygulanmaktadır:

- Reason catalog içinden `category=planned` ve `affectsOee=false` reasonCode’lar seçilir.
- Bu reasonCode’lara sahip planned downtime event’leri `MachineEvent` üzerinden bulunur.
- Bulunan event’lerin aktif job interval’larıyla çakışan süreleri plannedTime’dan düşülür.

Özet davranış: `affectsOee: false` olan planned duruşlar availability’yi düşürmez; plannedTime’dan çıkarılır.

Eksik olan sadece bu davranışın dokümante edilmesidir. Downtime oluştururken hangi durumlarda `affectsOee: false` kullanılacağı açıklanmalıdır. Örneğin: planlı bakım OEE'yi etkiler (`affectsOee: true`), öğle arası OEE'yi etkilemez (`affectsOee: false`).

### Tasarım Kararı Sekiz: Vardiya Sonu Politikası - Manuel Resume

Not: Bu bir hata değil, bilinçli bir operasyonel karardır. Manuel müdahale gereksinimi güvenlik amacıyla tercih edilmiştir.

shift-simulator.js dosyasındaki applyShiftEndPolicy fonksiyonu vardiya sonunda çalışan tüm iş emirlerini duraklatır.

```javascript
const applyShiftEndPolicy = async () => {
  const jobs = await JobOrder.find({ status: JOB_STATUSES.IN_PROGRESS });
  for (const job of jobs) {
    await jobOrderService.pauseJobOrder(job._id, {
      reason: "Vardiya sonu - otomatik duraklatma",
    });
  }
};
```

Bu tasarım kararının arkasındaki mantık şudur:

1. **Güvenlik**: Gerçek üretim ortamında vardiya sonu otomatik pause güvenli bir yaklaşımdır
2. **Kontrol**: Operatör ertesi gün hangi işlerin devam edeceğine karar verebilir
3. **Esneklik**: Bazı işler iptal edilebilir, bazıları farklı öncelikle devam edebilir

simulation-clock-service.js zaten resume mantığı sağlar; `SimulationState.cursorAt` üzerinden kaldığı yerden devam edilir ve `prepareShiftSimRun` bir `nextCursorAt` değeri döndürür.  
Eğer otomatik resume istenirse, simülasyon başlangıcına ek bir adım konulabilir. Ancak mevcut davranış bir bug değil, operasyonel tercihtir.

---

## DÖRDÜNCÜ BÖLÜM: MİMARİ TUTARSIZLIKLAR

### Zaman Yönetimi Karmaşası

Sistemde beş farklı zaman konsepti birbirine karışmış durumdadır.

Birincisi shift-sim'in kullandığı virtualDay kavramıdır. Bu değer YYYY-MM-DD formatında bir string olarak tutulur ve simülasyonun hangi günü temsil ettiğini belirtir.

İkincisi shift-sim'in kullandığı shiftStartAt ve shiftEndAt değerleridir. Bunlar Date tipinde tutulur ve vardiya başlangıç ve bitiş zamanlarını UTC olarak saklar.

Üçüncüsü job-sim'in telemetri timestamp'lerini kullanmasıdır. job-sim telemetrileri işlerken doğrudan telemetrinin timestamp alanını kullanır.

Dördüncüsü job-order-service'in new Date() kullanmasıdır. İş emri başlatma, duraklatma, tamamlama gibi işlemlerde gerçek sistem zamanı kullanılır.

Beşincisi oee-calculator'ın vardiya penceresini İstanbul zaman ofseti ile hesaplamasıdır (computeDayWindowUtc). Bu hesaplama job-order-service'in wall-clock zamanlarıyla karışınca tarih tutarsızlığına yol açar.

Bu farklı zaman konseptlerinin bir arada kullanılması ciddi tutarsızlıklara yol açmaktadır. Bir iş emrinin startTime değeri 2025-01-10 iken, o iş emri için üretilen telemetrilerin timestamp değeri 2024-01-15 olabilir. Bu durum tarih bazlı filtreleme ve raporlamada sorunlara neden olur.

Çözüm önerisi olarak, merkezi bir zaman yönetim servisi oluşturulmalıdır. Bu servis simülasyon modundayken simülasyon zamanını, gerçek modda ise sistem zamanını döndürmelidir. Tüm servisler bu merkezi servisi kullanmalıdır.

### Source Değeri Karmaşası

Sistemde telemetri verilerinin kaynağını belirten source alanı için farklı değerler kullanılmaktadır.

data-gen scripti ürettiği telemetrilere "data-gen" source değerini atar. shift-sim scripti "shift-sim" değerini kullanır. Eski kodlardan kalan "simulator" değeri hala bazı yerlerde desteklenmektedir. seed.js dosyasından gelen veriler "seed" değerini kullanır.

oee-dashboard-service.js dosyasında bu karmaşayı yönetmek için özel bir array tanımlanmıştır:

```javascript
const LEGACY_DATA_GEN_SOURCES = ["data-gen", "simulator"];
```

Bu array data-gen için yapılan sorgularda hem "data-gen" hem de "simulator" değerlerini kabul etmek amacıyla kullanılmaktadır. Ancak "simulator" değerinin nereden geldiği ve hala kullanılıp kullanılmadığı belirsizdir.

#### Kritik Bug: job-sim Source Seçimi (Gerçek Davranış)

job-simulator.js içinde telemetry kaynağı makine alanlarından seçilmiyor. Gerçek davranış şu:

- Eğer makine için **shift-sim kaynaklı telemetry** bulunuyorsa, job-sim bunu öncelikli kabul ediyor.
- shift-sim telemetry yoksa, en son telemetry’ye düşüyor (data-gen dahil).

Bu durum, eski shift-sim verileri varken data-gen çalışsa bile job-sim’in shift-sim üzerinden üretim yapmasına neden olabilir.

Çözüm önerisi olarak, source değerleri bir constants dosyasında merkezi olarak tanımlanmalıdır. Eski değerler için migration yapılmalı ve tek tip kullanıma geçilmelidir. job-sim source seçim mantığı netleştirilmelidir.

### OEE Hesaplama Eksiklikleri

Mevcut OEE calculator servisi temel hesaplamaları yapabilmektedir ancak endüstri standardı olan bazı önemli metrikler eksiktir.

#### Kritik Bug: collectJobActiveIntervals Source Filtresi Eksik

oee-calculator-service.js dosyasında collectJobActiveIntervals fonksiyonu source filtresi kullanmıyor. Bu yüzden:

- shift-sim + data-gen event’leri karışabiliyor
- aktif job interval’ları yanlış hesaplanabiliyor

Mevcut sorgu (özet):

```javascript
const events = await ProductionEvent.find({
  machine: machineId,
  eventType: { $in: [...] },
  timestamp: { $lte: windowEnd },
})
```

Bu sorguya, seçilen source’a göre filtre eklenmesi gerekir. Örn:
- shift-sim için `source: 'simulator'` + `metadata.simulationSource: 'shift-sim'`
- data-gen için `source: 'operator'` veya farklı bir ayrım kuralı

Bu eksiklik nedeniyle:

- shift-sim ve data-gen verileri karıştırılabilir
- OEE hesaplaması yanlış veri setinden yapılabilir
- Kaynak bazlı izole test yapılamaz

Çözüm: collectJobActiveIntervals sorgusuna seçilen source’a göre filtre eklenmeli.

#### Diğer Eksik Metrikler

Availability hesaplaması mevcuttur ve planned time ile actual running time oranını verir. Ancak availability loss yani ne kadar süre kaybedildiği ayrı olarak raporlanmamaktadır.

Performance hesaplaması için idealCycleTimeSeconds değeri Part modelinde tanımlanmıştır. Ancak actual cycle time yani gerçek üretim süresi her parça için kaydedilmemektedir. Bu nedenle performance hesaplaması teorik değerlere dayanmaktadır.

Quality hesaplaması doğru çalışmaktadır. goodQuantity ve defectiveQuantity değerleri üzerinden hesaplanır.

Eksik olan metrikler şunlardır: Availability Loss Minutes, Performance Loss breakdown olarak speed loss ve minor stops ayrımı, Quality Loss breakdown olarak rework ve scrap ayrımı, Effective Production Time hesaplaması.

Çözüm önerisi olarak, ProductionEvent modeline actualCycleTimeMs alanı eklenmeli ve her üretim için gerçek süre kaydedilmelidir. OEE calculator loss kategorilerini ayrı ayrı hesaplamalı ve raporlamalıdır.

---

## BEŞİNCİ BÖLÜM: FRONTEND-BACKEND UYUMSUZLUKLARI

### Simulations Sayfası Reset Kısıtlaması

Frontend'deki simulations sayfasında Reset butonu sadece shift-sim için görünür durumdadır. İlgili kod şu şekildedir:

```jsx
{
  simulation.name === "shift-sim" && (
    <Button onClick={() => resetMutation.mutate(simulation.name)}>Reset</Button>
  );
}
```

Bu tasarım kararının sonuçları şunlardır: data-gen tarafından üretilen telemetri verileri temizlenemez. Kullanıcı test senaryolarını sıfırlamak istediğinde kısıtlı seçeneklere sahip olur. Veritabanında gereksiz veri birikir.

Çözüm önerisi olarak, tüm simülasyon tipleri için reset seçeneği eklenmeli veya "Reset All" butonu ile tüm simülasyon verilerinin temizlenmesi sağlanmalıdır.

### Monitoring Sayfası Auto Source Belirsizliği

Monitoring sayfasında kaynak seçimi için auto seçeneği bulunmaktadır. Ancak auto seçildiğinde backend'in nasıl karar verdiği kullanıcıya gösterilmemektedir.

Backend'deki resolveAutoSource fonksiyonu en son telemetriyi kontrol eder ve onun source değerini döndürür. Bu mantık kullanıcı için şeffaf değildir.

Bu durumun sonuçları kullanıcının hangi veriyi gördüğünü anlayamamasına neden olur. Beklenmeyen davranışlar kafasını karıştırır. Debug yapmak zorlaşır.

Çözüm önerisi olarak, UI'da seçilen source'un yanında hangi kaynağın aktif olarak kullanıldığı gösterilmelidir. Örneğin "Auto (shift-sim kullanılıyor)" şeklinde bilgi verilebilir.

### Job Order Başlatma Tarih Parametresi Eksikliği

Frontend'deki job-orders-api.js dosyasında startJobOrder fonksiyonu hiçbir parametre almamaktadır:

```javascript
export const startJobOrder = (id) => postJobOrderAction(id, "start");
```

Bu durum kullanıcının simülasyon tarihi seçememesi anlamına gelir. İş emri her zaman gerçek zamanlı olarak başlatılır.

Bu eksikliğin sonuçları şunlardır: Kullanıcı geçmiş bir tarih için simülasyon yapamaz. Test senaryoları için belirli tarihler seçilemez. Simülasyon tarihi ile iş emri tarihi uyumsuz kalır.

Çözüm önerisi olarak, startJobOrder fonksiyonu opsiyonel bir options parametresi almalıdır. Bu parametre içinde simulationDate gönderilebilmelidir. Frontend'de tarih seçici eklenmeli ve kullanıcının tarih seçmesi sağlanmalıdır.

---

## ALTINCI BÖLÜM: ÖNERİLEN ÇÖZÜM MİMARİSİ

### Pragmatik Yaklaşım: Minimal Değişiklik

Mevcut sistem mimarisi "tek fabrika, tek vardiya, tüm makineler aynı anda" senaryosu için yeterlidir. JobSimulationSession gibi tamamen yeni bir model eklemek yerine, mevcut yapıda küçük ama etkili düzeltmeler yapılmalıdır.

#### Kritik Düzeltme: Cursor Başlangıç Noktası

job-simulator.js dosyasındaki cursor mantığı düzeltilmelidir. Mevcut kod:

```javascript
const baseTimestamp = lastProducedAt
  ? lastProducedAt
  : earliestTimestamp || latest.timestamp;
```

Düzeltilmiş kod:

```javascript
const jobStartTime =
  jobOrder.startTime || earliestTimestamp || latest.timestamp;
const baseTimestamp = lastProducedAt
  ? lastProducedAt
  : new Date(
      Math.max(
        jobStartTime.getTime(),
        (earliestTimestamp || latest.timestamp).getTime()
      )
    );
```

Bu değişiklik cursor'ın iş emri başlangıç zamanından önceki telemetrileri işlemesini engeller. Tek satırlık bir değişiklik ile ana sorun çözülür.

#### OEE Source Filtresi Düzeltmesi

oee-calculator-service.js dosyasındaki collectJobActiveIntervals fonksiyonuna source filtresi eklenmelidir:

```javascript
// Mevcut (özet):
const events = await ProductionEvent.find({
  machine: machineId,
  timestamp: { $lte: windowEnd },
}).sort({ timestamp: 1 });

// Düzeltilmiş (öneri):
const query = {
  machine: machineId,
  timestamp: { $lte: windowEnd },
};
if (source === "shift-sim") {
  query.source = "simulator";
  query["metadata.simulationSource"] = "shift-sim";
}
const events = await ProductionEvent.find(query).sort({ timestamp: 1 });
```

### Gelecekte Gerekirse: Kademeli Genişletme

Eğer ileride per-job simülasyon veya farklı vardiya profilleri gerekirse, mevcut SimulationState yapısı üzerine kademeli olarak eklemeler yapılabilir:

1. Machine bazlı offset ekleme (machine.simulationOffset)
2. ShiftProfile modeli ekleme (farklı vardiya tanımları)
3. SimulationState'e machine bazlı cursor Map ekleme

Bu yaklaşım "YAGNI" (You Aren't Gonna Need It) prensibine uygundur ve gereksiz kompleksite eklemez.

### Frontend-Backend Senkronizasyonu (İsteğe Bağlı)

Kullanıcı deneyimini iyileştirmek için yapılabilecek opsiyonel değişiklikler:

1. Monitoring sayfasında "Auto (shift-sim kullanılıyor)" bilgisi gösterme
2. Reset All Data butonu ekleme
3. Job order başlatırken simulationDate seçme imkanı (gelecek ihtiyaç)

---

## YEDİNCİ BÖLÜM: REFACTOR ÖNCELİK SIRASI

### Birinci Öncelik: Kritik Bug Düzeltmeleri (Hemen)

Bu düzeltmeler minimum kod değişikliği ile maksimum etki sağlar:

**1. job-sim cursor startTime düzeltmesi**

- Dosya: job-simulator.js satır 268-286
- Değişiklik: baseTimestamp hesaplamasına jobOrder.startTime kontrolü ekleme
- Etki: Ana sorun çözülür, eski telemetri işlenmez

**2. OEE collectJobActiveIntervals source filtresi**

- Dosya: oee-calculator-service.js satır 168-175
- Değişiklik: ProductionEvent sorgusuna source filtresi ekleme
- Etki: shift-sim ve data-gen verileri karışmaz

### İkinci Öncelik: Dokümantasyon (Kısa Vadeli)

Kodda mevcut olan ama dokümante edilmemiş davranışlar:

1. `affectsOee` alanının kullanımı ve anlamı
2. `CLEAR_BEFORE_START` ve resume mekanizması
3. Source değerlerinin anlamları ve kullanım senaryoları
4. Vardiya sonu politikası ve manuel resume gerekliliği

### Üçüncü Öncelik: UX İyileştirmeleri (Orta Vadeli)

Kullanıcı deneyimini artıracak opsiyonel değişiklikler:

1. Monitoring sayfasında aktif source bilgisi gösterme
2. Reset All Data butonu ekleme
3. Source constants dosyası oluşturma ve legacy cleanup

### Dördüncü Öncelik: Mimari Genişletme (İhtiyaç Halinde)

Sadece yeni gereksinimler ortaya çıkarsa yapılacak değişiklikler:

1. Per-machine simülasyon offset desteği
2. Çoklu shift profile desteği
3. SimulationDate parametresi ile iş emri başlatma
4. Çok günlük iş emri desteği

---

## SEKİZİNCİ BÖLÜM: RİSK ANALİZİ

### Mevcut Verilerle Uyumsuzluk Riski

Bu risk yüksek olasılıklıdır ancak orta seviye etkiye sahiptir.

Yeni model yapısına geçildiğinde mevcut veriler eski formatta kalacaktır. MachineTelemetry'e jobOrder alanı eklendiğinde eski kayıtlarda bu alan boş olacaktır. JobSimulationSession tablosu eklendiğinde mevcut iş emirlerinin oturumu olmayacaktır.

Mitigasyon için migration script yazılmalıdır. Mevcut veriler mümkün olduğunca yeni yapıya dönüştürülmeli, dönüştürülemeyen veriler için fallback mekanizması uygulanmalıdır.

### Performans Degradasyonu Riski

Bu risk orta olasılıklıdır ve düşük seviye etkiye sahiptir.

Yeni eklenecek alanlar ve sorgular performansı etkileyebilir. Özellikle telemetri sorgularında ek filtreleme gerekecektir.

Mitigasyon için uygun index'ler oluşturulmalıdır. MachineTelemetry için jobOrder ve machine kombinasyonu index'lenmelidir. Sorgu performansı test edilmeli ve gerekirse optimize edilmelidir.

### Frontend-Backend Sync Kaybı Riski

Bu risk düşük olasılıklıdır ancak yüksek seviye etkiye sahiptir.

API değişiklikleri frontend ile uyumsuzluğa neden olabilir. Örneğin startJobOrder endpoint'ine simulationDate parametresi eklendiğinde frontend güncellenmezse sorun yaşanabilir.

Mitigasyon için API versiyonlama uygulanmalıdır. Breaking change'ler için deprecation süreci işletilmelidir. Frontend ve backend değişiklikleri koordineli olarak deploy edilmelidir.

### Regression Riski

Bu risk orta olasılıklıdır ve yüksek seviye etkiye sahiptir.

Mevcut işlevsellik bozulabilir. Özellikle job-sim ve shift-sim değişiklikleri beklenmeyen yan etkilere neden olabilir.

Mitigasyon için kapsamlı E2E test coverage sağlanmalıdır. Her değişiklik öncesi mevcut testler çalıştırılmalıdır. Manuel test senaryoları dokümante edilmeli ve uygulanmalıdır.

---

## SONUÇ

Hermes MES sistemi temel MES işlevselliğini sağlayabilecek sağlam bir altyapıya sahiptir. Yapılan analiz sonucunda tespit edilen sorunların çoğunun büyük mimari değişiklikler gerektirmediği görülmüştür.

### Gerçek Buglar (Acil Düzeltme)

1. **job-sim cursor başlangıç noktası**: jobOrder.startTime dikkate alınmıyor - tek satır düzeltme
2. **OEE source filtresi eksik**: collectJobActiveIntervals source filtresi yok - basit sorgu düzeltmesi
3. **job-sim source seçimi**: shift-sim her zaman tercih ediliyor - koşul mantığı düzeltmesi

### Tasarım Kararları (Bug Değil)

1. **Global SimulationState**: "Tek vardiya, tüm makineler" senaryosu için uygundur
2. **Vardiya sonu manuel resume**: Operasyonel güvenlik için bilinçli tercih
3. **CLEAR_BEFORE_START default false**: Resume mekanizması zaten mevcut

### Dokümantasyon Eksiklikleri

1. **affectsOee kullanımı**: Kodda implement ancak dokümante değil
2. **Source değerleri**: Hangi source ne zaman kullanılır belirsiz
3. **Resume mekanizması**: Var ama kullanımı dokümante değil

### Önerilen Yaklaşım

JobSimulationSession gibi yeni modeller eklemek yerine, mevcut yapıda minimal değişikliklerle ana sorunlar çözülmelidir. İki kritik düzeltme (cursor startTime ve OEE source filtresi) sistemin güvenilirliğini önemli ölçüde artıracaktır.

Gelecekte yeni gereksinimler ortaya çıkarsa (per-job simülasyon, farklı vardiya profilleri), mevcut yapı kademeli olarak genişletilebilir.
[text](system-analysis-report.md)

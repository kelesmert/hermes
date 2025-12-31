# HERMES MES SİSTEMİ KAPSAMLI ANALİZ RAPORU

Bu doküman, Hermes MES sisteminin mevcut durumunu, tespit edilen kritik hataları, mimari tutarsızlıkları ve önerilen çözüm yollarını detaylı şekilde açıklamaktadır.

---

## BİRİNCİ BÖLÜM: MİMARİ ÖZET

### Simülasyon Katmanı Yapısı

Hermes MES sisteminde üç adet bağımsız simülasyon scripti bulunmaktadır. Bu scriptler birbirinden bağımsız çalışan Node.js process'leri olarak tasarlanmıştır.

Birinci script olan data-gen.js, gerçek zamanlı telemetri üretimi için kullanılmaktadır. Her iki saniyede bir tüm aktif makineler için telemetri verisi üretir. Ürettiği verilerin source alanı "data-gen" olarak işaretlenir. Bu script herhangi bir dış bağımlılığı olmadan bağımsız çalışabilir.

İkinci script olan shift-simulator.js, hızlandırılmış vardiya simülasyonu için tasarlanmıştır. Gerçek hayatta 11 saat süren bir vardiyayı yaklaşık 3 dakikada simüle eder. Ürettiği verilerin source alanı "shift-sim" olarak işaretlenir. Sanal bir zaman kavramı kullanır ve virtualDay adı verilen bir tarih değerini takip eder. Bu script de bağımsız çalışabilir ancak SimulationState modelini kullanarak durumunu veritabanında saklar.

Üçüncü script olan job-simulator.js, üretim event'i üretimi için kullanılır. Kendisi telemetri üretmez, bunun yerine data-gen veya shift-sim tarafından üretilen telemetri verilerini okur ve bu verileri ProductionEvent kayıtlarına dönüştürür. Bu script, diğer iki scriptten birine bağımlıdır çünkü işleyeceği telemetri verisi olmadan çalışamaz.

**Not (test schedule):** Shift-sim içinde test amaçlı sabit bir zaman çizelgesi bulunmaktadır (07:00–08:00 çalışır, 08:00–08:30 durur, 08:30–18:00 tekrar çalışır). Bu davranış test odaklıdır ve üretim davranışı gibi algılanmamalıdır; env ile kontrol edilir.

### Temel Veri Modelleri

Sistemde kullanılan temel veri modelleri şunlardır:

JobOrder modeli iş emirlerini temsil eder. Her iş emri bir parça, bir makine, hedef miktar ve üretim durumu bilgilerini içerir. Durum değerleri pending, in_progress, paused, completed ve cancelled olabilir.

MachineTelemetry modeli makine telemetri verilerini saklar. Her kayıt bir makineye ait olup, timestamp, sinyal değeri, metrikler, source, `jobOrder` ve `processedAt` bilgilerini içerir. simulationRunId alanı hangi simülasyon çalıştırmasına ait olduğunu belirtir. Eski kayıtlar jobOrder alanı boş olabilir.

ProductionEvent modeli üretim olaylarını saklar. Her kayıt bir iş emrine ve makineye bağlıdır. Üretilen miktar, kalite durumu ve hata tipi gibi bilgileri içerir.

SimulationState modeli simülasyon durumunu saklar. Önemli bir nokta olarak, bu model tüm sistem için tek bir kayıt tutar. virtualDay, shiftStartAt, shiftEndAt ve simulationRunId gibi alanları içerir.

Machine modeli makine bilgilerini saklar. currentJobOrder alanı o an makinede çalışan iş emrini referans eder. status alanı makinenin mevcut durumunu belirtir.

---

## İKİNCİ BÖLÜM: VERİ AKIŞI

### Normal Çalışma Senaryosu

Sistemin normal çalışma akışı şu şekilde gerçekleşir:

İlk adımda kullanıcı bir iş emri oluşturur. Bu iş emri pending durumunda veritabanına kaydedilir. Henüz herhangi bir makine ile ilişkilendirilmemiştir yani makinenin currentJobOrder alanı boştur.

İkinci adımda kullanıcı iş emrini başlatır. Bu noktada job-order-service içindeki startJobOrder fonksiyonu çağrılır. Bu fonksiyon job event zamanını kaynak seçimine göre belirler: shift-sim için sim-clock, data-gen için wall-clock kullanılır (`JOB_TIME_SOURCE`). Ardından iş emrini in_progress yapar ve makinenin currentJobOrder alanını bu iş emri ile günceller.

Üçüncü adımda simülasyon scriptleri telemetri üretmeye başlar. data-gen veya shift-sim scripti çalışıyorsa, makineler için telemetri verileri üretilir. Bu telemetri verileri MachineTelemetry koleksiyonuna kaydedilir.

Dördüncü adımda job-simulator telemetriyi işler. job-sim scripti sürekli olarak MachineTelemetry koleksiyonunu tarar. Henüz işlenmemiş telemetri kayıtlarını bulur ve bunları ProductionEvent kayıtlarına dönüştürür. Her başarılı üretim için iş emrinin producedQuantity değerini artırır.

Beşinci adımda hedef miktara ulaşılır. producedQuantity değeri targetQuantity değerine ulaştığında veya aştığında, iş emri otomatik olarak completed durumuna geçirilir.

### Sorunlu Akış

Önceki sürümlerde kritik sorun, telemetri verilerinin hangi iş emrine ait olduğunun bilinmemesiydi. Bu nedenle telemetri sadece makine bilgisi taşıyor ve iş emriyle ilişkilendirilemiyordu. Güncel yapıda telemetry kayıtlarına `jobOrder` alanı eklendi ve hem data-gen hem shift-sim bu alanı dolduruyor. job-sim yalnızca ilgili jobOrder’a ait telemetry’yi işlediği için bu problem büyük ölçüde giderildi. Eski verilerde jobOrder boş olabilir; bu kayıtlar job-sim tarafından işlenmez.

---

## ÜÇÜNCÜ BÖLÜM: KRİTİK HATALAR

### Hata Bir: İş Emri Çok Hızlı Tamamlanıyor

Önceki sürümlerde bu davranış, telemetry kayıtlarının jobOrder ile ilişkilendirilmemesi ve job-sim cursor’un job start zamanını dikkate almaması nedeniyle ortaya çıkıyordu. Bu nedenle aynı simülasyon run’ında iş emri sonradan başlasa bile, vardiyanın başından itibaren biriken telemetri işlenip üretim hızlıca tamamlanabiliyordu.

Güncel durumda telemetry kayıtları `jobOrder` alanı ile etiketleniyor ve job-sim yalnızca ilgili jobOrder’a ait telemetry’yi işler. Ayrıca job-sim kaynak seçimi explicit (`JOB_SIM_TELEMETRY_SOURCE`) ve cursor job bazlı tutulur. Bu nedenle “yanlış job’a ait backlog” problemi büyük ölçüde giderilmiştir.

Hâlâ “anında tamamlanıyor” gibi görünen senaryolar çoğunlukla simülasyon hızından kaynaklanır:

- Shift-sim 11 saatlik veriyi birkaç dakikada üretir
- Kısa ideal cycle time (örn 5 sn) ile üretim çok hızlı görünür
- Job-sim tek tick’te yüksek sayıda telemetry kaydı işlediği için üretim hızlı artar

Bu durum teknik bir bug değil, simülasyon hızının doğal sonucudur. Test sırasında hız yönetimi için:

- Parçanın ideal cycle time değerini artır
- `JOB_SIM_CYCLE_TIME_MIN_FACTOR` ve `JOB_SIM_CYCLE_TIME_MAX_FACTOR` ile dağılımı genişlet
- `JOB_SIM_MAX_TELEMETRY_RECORDS` veya `SHIFT_SIM_REAL_DURATION_SECONDS` ile işleme hızını düşür

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

job-simulator.js dosyasında telemetri cursor’ı bir JavaScript Map yapısında bellekte tutulmaktadır.

```javascript
const telemetryCursorByJob = new Map();
```

Bu tasarımın sonucu şudur: job-sim process’i yeniden başlatıldığında cursor bilgisi kaybolur. Cursor kaybolduğunda sistem hangi telemetrinin işlendiğini bilemez; aynı telemetry’nin tekrar işlenmesi ve duplicate üretim kayıtları riski oluşur.

Çözüm önerisi olarak, cursor bilgisinin veritabanında kalıcı saklanması değerlendirilebilir (ör. JobSimulationSession veya ayrı bir TelemetryCursor koleksiyonu).

### Hata Dört: Telemetri JobOrder ile İlişkilendirilmemiş

Bu sorun önceki sürümlerde mevcuttu; artık düzeltilmiştir. MachineTelemetry modeline `jobOrder` alanı eklendi ve data-gen / shift-sim telemetry üretirken bu alanı doldurur.

Örnek şema (güncel):

```javascript
const telemetrySchema = new mongoose.Schema({
  machine: { type: ObjectId, ref: "Machine", required: true },
  jobOrder: { type: ObjectId, ref: "JobOrder" },
  timestamp: { type: Date, required: true },
  signalValue: { type: Number, enum: [0, 1], required: true },
  metrics: { type: Mixed, default: {} },
  source: { type: String },
  simulationRunId: { type: String },
});
```

Sonuç: job-sim yalnızca ilgili jobOrder’a ait telemetry’yi işlediği için yanlış job’a üretim yazma riski büyük ölçüde azalmıştır. Eski verilerde jobOrder boş olabilir; bu kayıtlar işlenmez.

### Job Event Zaman Ekseni Kaynağa Göre Seçim

Bu sorun güncel kodda düzeltilmiştir. Job event zamanları artık kaynak seçimine göre belirlenir:

- Shift-sim kullanıldığında sim-clock zamanı yazılır
- Data-gen kullanıldığında wall-clock zamanı yazılır

Bu davranış `JOB_TIME_SOURCE` ile yönetilir ve job-order-service `resolveEventTime` üzerinden sim-clock’a bağlanır. Böylece shift-sim telemetrisi ile job event’leri aynı zaman ekseninde tutulur. İsteğe bağlı olarak UI’dan timeSource geçmek ileride eklenebilir, ancak mevcut yapı tutarlıdır.

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

Dördüncüsü job-order-service'in event zamanı için kaynak bazlı seçim yapmasıdır. Shift-sim koşularında sim-clock, data-gen koşularında wall-clock kullanılır (`JOB_TIME_SOURCE`).

Beşincisi oee-calculator'ın vardiya penceresini İstanbul zaman ofseti ile hesaplamasıdır (computeDayWindowUtc). Bu hesaplama job-order-service'in wall-clock zamanlarıyla karışınca tarih tutarsızlığına yol açar.

Bu farklı zaman konseptlerinin birlikte çalışması hâlâ dikkat gerektirir, ancak temel tutarsızlıklar giderilmiştir. Job event zamanları sim-clock ile hizalandığı için shift-sim telemetri timeline’ı ile uyuşur. Kalan risk, farklı kaynakların (shift-sim + data-gen) aynı anda raporlanmasıdır; bu durum source filtreleriyle kontrol edilmelidir.

Merkezi zaman yönetimi yaklaşımı uygulamaya alınmıştır: simülasyon modunda sim-clock, canlı modda wall-clock kullanılır. İleride timeSource seçimini UI’dan yönetmek opsiyonel bir iyileştirmedir.

### Source Değeri Karmaşası

Sistemde telemetri verilerinin kaynağını belirten source alanı için farklı değerler kullanılmaktadır.

data-gen scripti ürettiği telemetrilere "data-gen" source değerini atar. shift-sim scripti "shift-sim" değerini kullanır. Eski kodlardan kalan "simulator" değeri hala bazı yerlerde desteklenmektedir. seed.js dosyasından gelen veriler "seed" değerini kullanır.

oee-dashboard-service.js dosyasında bu karmaşayı yönetmek için özel bir array tanımlanmıştır:

```javascript
const LEGACY_DATA_GEN_SOURCES = ["data-gen", "simulator"];
```

Bu array data-gen için yapılan sorgularda hem "data-gen" hem de "simulator" değerlerini kabul etmek amacıyla kullanılmaktadır. Ancak "simulator" değerinin nereden geldiği ve hala kullanılıp kullanılmadığı belirsizdir.

#### Kritik Bug: job-sim Source Seçimi

Bu sorun güncel kodda düzeltilmiştir. job-sim telemetry kaynağı artık explicit seçilir (`JOB_SIM_TELEMETRY_SOURCE`). Böylece:

- Shift-sim verisi varken data-gen yanlışlıkla işlenmez
- Test senaryoları deterministik hale gelir
- Kaynak seçimi açıkça yönetilir

Kaynak değerlerinin merkezi bir constants dosyasında toplanması ve legacy `simulator` değerlerinin temizlenmesi hâlâ opsiyonel bir iyileştirme olarak değerlendirilebilir.

### OEE Hesaplama Eksiklikleri

Mevcut OEE calculator servisi temel hesaplamaları yapabilmektedir ancak endüstri standardı olan bazı önemli metrikler eksiktir.

#### Kritik Bug: collectJobActiveIntervals Source Filtresi Eksik

Bu sorun güncel kodda düzeltilmiştir. `collectJobActiveIntervals` artık `metadata.simulationSource` filtresi ile çalışır ve seçilen telemetry kaynağına göre ProductionEvent’leri izole eder. Böylece shift-sim ve data-gen event’leri karışmaz.

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

Frontend’de startJobOrder hâlâ parametre almıyor; ancak backend tarafında zaman ekseni `JOB_TIME_SOURCE` ile yönetildiği için bu durum artık kritik bir hata değil. Shift-sim koşularında event zamanları sim-clock üzerinden yazılır.

Yine de test senaryoları için kullanıcıya zaman seçimi sunmak faydalı olabilir. Bu, opsiyonel bir UX iyileştirmesi olarak değerlendirilebilir.

---

## ALTINCI BÖLÜM: ÖNERİLEN ÇÖZÜM MİMARİSİ

### Pragmatik Yaklaşım: Minimal Değişiklik

Mevcut sistem mimarisi "tek fabrika, tek vardiya, tüm makineler aynı anda" senaryosu için yeterlidir. JobSimulationSession gibi tamamen yeni bir model eklemek yerine, mevcut yapıda küçük ama etkili düzeltmeler yapılmalıdır.

#### Kritik Düzeltme: Cursor Başlangıç Noktası

Bu başlık önceki sürüm için geçerliydi. Güncel yapıda telemetry `jobOrder` ile etiketlendiği ve job-sim yalnızca ilgili jobOrder’a ait telemetry’yi işlediği için “vardiya başından gelen backlog” sorunu büyük ölçüde giderildi. Cursor hâlâ bellek içinde tutulur; kalıcı hale getirme opsiyonel bir geliştirme olarak durmaktadır.

#### OEE Source Filtresi Düzeltmesi

Bu düzeltme uygulanmıştır. collectJobActiveIntervals sorgusu `metadata.simulationSource` filtresi ile çalışır ve kaynaklar birbirine karışmaz.

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

### Birinci Öncelik: Kritik Bug Düzeltmeleri

Bu başlıktaki iki ana madde güncel kodda uygulanmıştır:

1. job-sim üretim akışı telemetry `jobOrder` filtresi ile çalışır ve job bazlı cursor tutar
2. OEE collectJobActiveIntervals sorgusu `metadata.simulationSource` filtresi içerir

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

### Düzeltildi Olanlar

1. **job-sim source seçimi**: explicit kaynak seçimi (`JOB_SIM_TELEMETRY_SOURCE`)
2. **OEE source filtresi**: collectJobActiveIntervals `metadata.simulationSource` filtresi
3. **Telemetry jobOrder etiketi**: job-sim yalnızca ilgili job telemetry’sini işler

### Tasarım Kararları (Bug Değil)

1. **Global SimulationState**: "Tek vardiya, tüm makineler" senaryosu için uygundur
2. **Vardiya sonu manuel resume**: Operasyonel güvenlik için bilinçli tercih
3. **CLEAR_BEFORE_START default false**: Resume mekanizması zaten mevcut

### Açık Konular

1. **job-sim cursor kalıcılığı**: Cursor yalnızca memory’de; restart sonrası tekrar işleme riski var
2. **actualDurationMinutes**: pause süreleri düşülmüyor
3. **Legacy source temizliği**: `simulator` gibi eski source değerleri için temizlik/migrasyon opsiyonu

### Dokümantasyon Durumu

1. **affectsOee kullanımı**: Dokümante edildi, ancak reason katalog örnekleri genişletilebilir
2. **Source değerleri**: Belgelendi (shift-sim/data-gen + explicit seçim)
3. **Resume mekanizması**: sim-clock ve shift_end akışı belgede mevcut

### Önerilen Yaklaşım

Kritik düzeltmeler uygulandıktan sonra mevcut yapı sunum hedefleri için yeterlidir. İhtiyaç oluşursa:

1. Cursor kalıcılığı için küçük bir state modeli eklenebilir
2. actualDurationMinutes hesabı pause sürelerini çıkaracak şekilde genişletilebilir
3. Source değerleri tekil bir constants dosyasında merkezileştirilebilir
[text](system-analysis-report.md)

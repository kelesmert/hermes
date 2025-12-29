# HERMES MES SİSTEMİ KAPSAMLI ANALİZ RAPORU

Bu doküman, Hermes MES sisteminin mevcut durumunu, tespit edilen kritik hataları, mimari tutarsızlıkları ve önerilen çözüm yollarını detaylı şekilde açıklamaktadır.

---

## BİRİNCİ BÖLÜM: MİMARİ ÖZET

### Simülasyon Katmanı Yapısı

Hermes MES sisteminde üç adet bağımsız simülasyon scripti bulunmaktadır. Bu scriptler birbirinden bağımsız çalışan Node.js process'leri olarak tasarlanmıştır.

Birinci script olan data-gen.js, gerçek zamanlı telemetri üretimi için kullanılmaktadır. Her iki saniyede bir tüm aktif makineler için telemetri verisi üretir. Ürettiği verilerin source alanı "data-gen" olarak işaretlenir. Bu script herhangi bir dış bağımlılığı olmadan bağımsız çalışabilir.

İkinci script olan shift-simulator.js, hızlandırılmış vardiya simülasyonu için tasarlanmıştır. Gerçek hayatta 11 saat süren bir vardiyayı yaklaşık 3 dakikada simüle eder. Ürettiği verilerin source alanı "shift-sim" olarak işaretlenir. Sanal bir zaman kavramı kullanır ve virtualDay adı verilen bir tarih değerini takip eder. Bu script de bağımsız çalışabilir ancak SimulationState modelini kullanarak durumunu veritabanında saklar.

Üçüncü script olan job-simulator.js, üretim event'i üretimi için kullanılır. Kendisi telemetri üretmez, bunun yerine data-gen veya shift-sim tarafından üretilen telemetri verilerini okur ve bu verileri ProductionEvent kayıtlarına dönüştürür. Bu script, diğer iki scriptten birine bağımlıdır çünkü işleyeceği telemetri verisi olmadan çalışamaz.

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

Hatanın kök nedeni job-simulator.js dosyasında bulunan cursor yönetim mantığındadır. İlgili kod şu şekildedir:

```javascript
if (!cursorEntry || cursorEntry.simulationRunId !== latestRunId) {
  const [earliestTimestamp, lastProducedAt] = await Promise.all([
    MachineTelemetry.findOne({
      machine: job.machine,
      source: TELEMETRY_SOURCE,
      simulationRunId: latestRunId,
    })
      .sort({ timestamp: 1 })
      .select({ timestamp: 1 })
      .lean()
      .then((doc) => doc?.timestamp),
    ProductionEvent.findOne({
      jobOrder: job._id,
      source: 'simulator',
    })
      .sort({ timestamp: -1 })
      .select({ timestamp: 1 })
      .lean()
      .then((doc) => doc?.timestamp),
  ]);

  const effectiveStart =
    lastProducedAt || earliestTimestamp || latest.timestamp;
```

Bu kodda kritik bir mantık hatası vardır. Yeni bir simulationRunId tespit edildiğinde cursor sıfırlanır. earliestTimestamp sorgusu yeni run için telemetri arar ama henüz yeni run'da telemetri olmayabilir. lastProducedAt sorgusu bu iş emri için üretim kaydı arar ama yeni iş emri için üretim kaydı yoktur. Her ikisi de null döndüğünde, latest.timestamp kullanılır ki bu eski run'dan kalan son telemetrinin timestamp'idir.

Sonuç olarak sistem, tarihsel olarak eski run'a ait tüm telemetriyi yeni iş emri için işler. Bu telemetriler zaten veritabanında mevcuttur ve anında okunup işlenebilir. Bu nedenle iş emri saniyeler içinde tamamlanır.

Çözüm önerisi olarak, telemetri kayıtlarına jobOrder referansı eklenmeli ve job-sim sadece kendi iş emrine ait telemetriyi işlemelidir.

### Hata İki: SimulationState Global Olarak Tasarlanmış

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

Birincisi, tüm makineler aynı sanal günü paylaşır. virtualDay değeri tek bir kayıtta tutulduğu için, bir makine için simülasyon ilerletildiğinde tüm makineler etkilenir. İkincisi, farklı iş emirleri için farklı simülasyon tarihleri kullanılamaz. Üçüncüsü, paralel simülasyon çalıştırma imkanı yoktur.

Çözüm önerisi olarak, SimulationState yerine JobSimulationSession adında yeni bir model oluşturulmalıdır. Bu model her iş emri için ayrı bir kayıt tutmalı ve iş emrine özel simülasyon durumunu saklamalıdır.

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

### Hata Yedi: Planned Downtime affectsOee Mantığı Belirsiz

OEE hesaplamalarında planned downtime'ların nasıl işlendiği belirsizdir. oee-calculator-service.js dosyasında bu konuda net bir mantık görülmemektedir.

affectsOee alanı true olan planned downtime'lar teoride availability hesaplamasını etkilemelidir. Ancak mevcut kodda bu durumun nasıl ele alındığı açık değildir. Planned time'dan çıkarılıp çıkarılmadığı, availability loss olarak sayılıp sayılmadığı belirsizdir.

Bu belirsizliğin sonucu olarak OEE değerleri tutarsız olabilir. Aynı durum için farklı hesaplamalar yapılabilir. Kullanıcılar OEE değerlerinin ne anlama geldiğini anlayamaz.

Çözüm önerisi olarak, affectsOee mantığı açıkça dokümante edilmeli ve kod içinde tutarlı şekilde uygulanmalıdır. Planned downtime'ların availability hesaplamasına etkisi netleştirilmelidir.

### Hata Sekiz: Vardiya Sonu Politikası Manuel Müdahale Gerektiriyor

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

Bu fonksiyon çalıştığında tüm in_progress iş emirleri paused durumuna geçer. Ancak ertesi gün simülasyon yeniden başlatıldığında bu iş emirleri hala paused durumundadır. Kullanıcının manuel olarak her iş emrini resume etmesi gerekir.

Bu durumun sonuçları kullanıcı deneyimini olumsuz etkiler. Her simülasyon başlangıcında manuel işlem gerekir. Çok sayıda iş emri varsa bu işlem zahmetli olur. Unutulan iş emirleri paused kalır ve simülasyon beklendiği gibi çalışmaz.

Çözüm önerisi olarak, simülasyon başlatıldığında otomatik resume mekanizması eklenmelidir. Alternatif olarak, vardiya başı politikası tanımlanmalı ve bu politikaya göre iş emirleri otomatik olarak devam ettirilmelidir.

---

## DÖRDÜNCÜ BÖLÜM: MİMARİ TUTARSIZLIKLAR

### Zaman Yönetimi Karmaşası

Sistemde beş farklı zaman konsepti birbirine karışmış durumdadır.

Birincisi shift-sim'in kullandığı virtualDay kavramıdır. Bu değer YYYY-MM-DD formatında bir string olarak tutulur ve simülasyonun hangi günü temsil ettiğini belirtir.

İkincisi shift-sim'in kullandığı shiftStartAt ve shiftEndAt değerleridir. Bunlar Date tipinde tutulur ve vardiya başlangıç ve bitiş zamanlarını UTC olarak saklar.

Üçüncüsü job-sim'in telemetri timestamp'lerini kullanmasıdır. job-sim telemetrileri işlerken doğrudan telemetrinin timestamp alanını kullanır.

Dördüncüsü job-order-service'in new Date() kullanmasıdır. İş emri başlatma, duraklatma, tamamlama gibi işlemlerde gerçek sistem zamanı kullanılır.

Beşincisi oee-calculator'ın parseEventTime fonksiyonunu kullanmasıdır. Bu fonksiyon UTC+3 offset'i uygular.

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

Bu karmaşanın sonuçları sorguların karmaşıklaşmasına neden olur. Yeni geliştirici hangi source değerini kullanacağını bilemez. Veri tutarlılığı sağlanamaz.

Çözüm önerisi olarak, source değerleri bir constants dosyasında merkezi olarak tanımlanmalıdır. Eski değerler için migration yapılmalı ve tek tip kullanıma geçilmelidir. Legacy desteği kaldırılmalıdır.

### OEE Hesaplama Eksiklikleri

Mevcut OEE calculator servisi temel hesaplamaları yapabilmektedir ancak endüstri standardı olan bazı önemli metrikler eksiktir.

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

### JobOrder Merkezli Simülasyon Yaklaşımı

Mevcut sistemde simülasyon global olarak yönetilmektedir. Önerilen yaklaşımda her iş emri kendi simülasyon oturumunu yönetmelidir.

Bu amaçla JobSimulationSession adında yeni bir model oluşturulmalıdır. Bu model şu alanları içermelidir: jobOrder referansı olarak iş emrine bağlantı, simulationDate olarak simüle edilen tarih, currentSimulationDay olarak çok günlük işler için gün sayacı, shiftStartAt ve shiftEndAt olarak vardiya başlangıç ve bitiş zamanları, cursorAt olarak simülasyondaki mevcut zaman, simulationRunId olarak benzersiz çalıştırma kimliği, telemetryCursor olarak son işlenen telemetri referansı, status olarak oturum durumu.

Bu model ile her iş emri bağımsız olarak simüle edilebilir. Bir iş emrinin simülasyonu diğerlerini etkilemez. Cursor bilgisi kalıcı olarak saklanır.

### Telemetri-JobOrder İlişkilendirmesi

MachineTelemetry modeline jobOrder alanı eklenerek her telemetri kaydının hangi iş emrine ait olduğu belirlenmelidir.

shift-sim telemetri üretirken, makinenin currentJobOrder değerini telemetri kaydına yazmalıdır. job-sim telemetri işlerken, sadece ilgili iş emrine ait telemetrileri filtrelemelidir.

Bu değişiklikle eski telemetrinin yeni iş emirlerine karışması önlenir. OEE hesaplamaları doğru telemetri setini kullanır.

### Yeni Başlatma Akışı

Önerilen yeni başlatma akışı şu şekilde olmalıdır:

İlk adımda kullanıcı startJobOrder endpoint'ini çağırır ve opsiyonel olarak simulationDate parametresi gönderir.

İkinci adımda backend JobSimulationSession kaydı oluşturur. Bu kayıt iş emrine bağlanır ve simülasyon tarihi kaydedilir.

Üçüncü adımda shift-sim bu iş emri için telemetri üretmeye başlar. Telemetrilere jobOrder referansı eklenir. Tarih olarak simulationDate kullanılır.

Dördüncü adımda job-sim sadece bu iş emrine ait telemetriyi işler. İşlenen son telemetrinin ID'si JobSimulationSession'a kaydedilir.

Beşinci adımda hedef miktara ulaşıldığında iş emri tamamlanır. JobSimulationSession status'ü completed olarak güncellenir.

### Çok Günlük İş Desteği

Bazı iş emirleri birden fazla vardiyada tamamlanabilir. Bu durum için currentSimulationDay alanı kullanılmalıdır.

İlk gün simülasyonu tamamlandığında ve iş emri hala tamamlanmamışsa, currentSimulationDay bir artırılır. Ertesi gün simülasyonu başlatıldığında, sistem kaldığı yerden devam eder. Her gün için ayrı telemetri seti üretilir ancak hepsi aynı iş emrine bağlıdır.

---

## YEDİNCİ BÖLÜM: REFACTOR ÖNCELİK SIRASI

### Birinci Öncelik Grubu: Kritik Bug Düzeltmeleri

Bu gruptaki değişiklikler sistemin temel işlevselliğini sağlamak için zorunludur.

İlk düzeltme telemetri izolasyonudur. job-sim'in eski telemetriyi işlemesini engellemek için telemetri-job order bağlantısı kurulmalıdır.

İkinci düzeltme cursor persistence'dır. telemetryCursorByMachine Map yapısı yerine veritabanında kalıcı saklama uygulanmalıdır.

Üçüncü düzeltme SimulationSession per JobOrder yaklaşımıdır. Global SimulationState yerine iş emri bazlı oturum yönetimine geçilmelidir.

### İkinci Öncelik Grubu: Zaman Yönetimi

Bu gruptaki değişiklikler sistemin tutarlılığını artırmak için gereklidir.

İlk değişiklik simulationDate parametresinin eklenmesidir. startJobOrder endpoint'i bu parametreyi almalıdır.

İkinci değişiklik tüm timestamp'lerin simulationDate'e bağlanmasıdır. İş emri, telemetri ve üretim kayıtları tutarlı tarih kullanmalıdır.

Üçüncü değişiklik OEE Calculator'da simülasyon zamanı kullanılmasıdır. Hesaplamalar için simülasyon tarih aralığı kullanılmalıdır.

### Üçüncü Öncelik Grubu: OEE Geliştirmeleri

Bu gruptaki değişiklikler raporlama kalitesini artırmak için önemlidir.

İlk geliştirme Loss Categories eklemesidir. Availability, Performance ve Quality loss breakdown'ları ayrı ayrı hesaplanmalıdır.

İkinci geliştirme Actual Cycle Time kaydıdır. Her parça için gerçek üretim süresi ProductionEvent'e kaydedilmelidir.

Üçüncü geliştirme affectsOee mantığının netleştirilmesidir. Planned downtime'ların OEE etkisi açıkça dokümante edilmeli ve tutarlı uygulanmalıdır.

### Dördüncü Öncelik Grubu: UX İyileştirmeleri

Bu gruptaki değişiklikler kullanıcı deneyimini iyileştirmek için faydalıdır.

İlk iyileştirme tarih seçici eklemesidir. İş emri başlatırken kullanıcı simülasyon tarihi seçebilmelidir.

İkinci iyileştirme Reset All Data seçeneğidir. Tüm simülasyon verilerini tek seferde temizleme imkanı sağlanmalıdır.

Üçüncü iyileştirme çok günlük job desteğinin UI'da görünür olmasıdır. currentSimulationDay bilgisi kullanıcıya gösterilmelidir.

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

Hermes MES sistemi temel MES işlevselliğini sağlayabilecek bir altyapıya sahiptir. Ancak simülasyon-iş emri senkronizasyonu kritik seviyede bozuktur. Anında tamamlanan iş emirleri, tarih tutarsızlıkları ve cursor kayıpları sistemin güvenilirliğini ciddi şekilde etkilemektedir.

Acil aksiyon olarak job-sim'in cursor yönetimi düzeltilmeli ve telemetri-job order bağlantısı kurulmalıdır. Bu değişiklikler mevcut bug'ların büyük kısmını çözecektir.

Orta vadeli hedef olarak tüm zaman yönetimi merkezi bir servise taşınmalı ve JobSimulationSession modeli implement edilmelidir. Bu değişiklikler sistemin mimarisini sağlamlaştıracak ve gelecekteki geliştirmeler için temel oluşturacaktır.

Uzun vadeli hedef olarak OEE hesaplamaları endüstri standartlarına uygun hale getirilmeli ve loss kategorizasyonu eklenmelidir. Bu geliştirmeler sistemin raporlama değerini artıracaktır.

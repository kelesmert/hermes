# 3. SİSTEM TASARIMI VE TEKNOLOJİLER

Bu bölümde, projenin teknik yapısı “nasıl tasarlandı ve neden bu yaklaşım seçildi?” soruları üzerinden açıklanmaktadır. Anlatım, kod belgelemesi yapmak yerine; sistemin katmanlarını, veri akışını ve tasarım kararlarının gerekçelerini okunabilir bir bütün olarak sunmayı hedefler. Bu kapsamda genel mimari yaklaşım (3.1), backend tasarımı (3.2), frontend tasarımı (3.3) ve veritabanı tasarımı (3.4) başlıkları ele alınmıştır.

## 3.1 Genel Sistem Mimarisi

Bu proje, üretim operasyonlarını izlenebilir ve yönetilebilir kılmayı hedefleyen web tabanlı bir uygulama olarak tasarlanmıştır. Mimari yaklaşım, kullanıcı arayüzü ile iş mantığı katmanının ayrıştırıldığı istemci–sunucu modeline dayanır. Bu ayrım; kullanıcı deneyimi, güvenlik ve sürdürülebilir geliştirme hedeflerinin birlikte yürütülebilmesi için temel bir tasarım tercihi olarak değerlendirilmiştir.

Sistem genelinde “tek bir ekrandan operasyonun fotoğrafını görmek” ile “ayrıntılı modül işlemlerini yürütmek” ihtiyaçları aynı uygulama çatısı altında ele alınır. Bu nedenle mimari, bir yandan hızlı geri bildirim üreten UI akışlarını desteklerken; diğer yandan hesaplama, veri doğrulama ve erişim kontrolü gibi sorumlulukları sunucu tarafında merkezi biçimde tutmayı amaçlar.

### 3.1.1 Monorepo Yapısı

Proje, tek bir Git deposu altında birden fazla bileşenin birlikte yönetildiği monorepo yaklaşımıyla organize edilmiştir. Bu yapı, backend ve frontend gibi birbiriyle sıkı ilişkili bileşenlerin eşzamanlı geliştirilmesini kolaylaştırırken; dokümantasyon ve tez çıktılarının da aynı sürümleme sürecine dahil edilmesini sağlar. Böylece mimari kararlar, uygulama davranışı ve rapor metni arasında tutarlılık korunabilir.

Monorepo yaklaşımının önemli katkılarından biri, proje ölçeği büyüdükçe “dağınık repo” yönetim maliyetini azaltmasıdır. Tek bir depo içinde değişikliklerin izlenmesi, aynı özellik üzerinde çalışan ekip bileşenlerinin koordinasyonunu güçlendirir. Ayrıca her bileşenin kendi bağımlılık ve çalışma komutlarını koruması, geliştirme sürecinde bağımsız çalışabilme esnekliğini de sürdürür.

### 3.1.2 İstemci-Sunucu Mimarisi

İstemci–sunucu mimarisinde istemci tarafı, kullanıcı etkileşimlerini ve ekran akışlarını yönetirken; sunucu tarafı iş kuralları, veri erişimi ve güvenlik kontrollerini yürütür. Bu projede istemci, tek sayfa uygulama (SPA) yaklaşımıyla tasarlanmış; sunucu ise REST benzeri bir HTTP API üzerinden JSON formatında veri alışverişi yapacak şekilde kurgulanmıştır. Böylece ekranların ihtiyaç duyduğu veriler, belirli bir arayüz sözleşmesi (request/response) üzerinden taşınır ve veri bütünlüğü sunucu tarafında korunur.

Bu ayrım, özellikle erişim kontrolü ve doğrulama gibi kritik sorumlulukların tek bir noktada toplanmasına imkân verir. İstemci tarafında kullanıcı deneyimi açısından route/ekran erişim kısıtları uygulanırken; sunucu tarafında aynı kural setinin API düzeyinde de geçerli olması hedeflenir. Sonuç olarak, yetkisiz erişim denemelerinin yalnızca UI seviyesinde engellenmesiyle yetinilmez; güvenlik denetimi bütüncül biçimde ele alınır.

**Görsel Önerileri**

- İstemci–sunucu mimari diyagramı (web client → API server → database akışı)
- Monorepo yerleşim diyagramı (repo kökünde backend/frontend/docs/tez bileşenleri)

## 3.2 Backend Tasarımı ve Teknolojileri

Backend katmanı, uygulamanın merkezi iş mantığını ve veri erişimini yöneten HTTP sunucusu olarak tasarlanmıştır. Bu katmanda amaç; modüllerin birbirini minimum düzeyde etkileyeceği bir organizasyon kurmak, güvenlik ve doğrulama adımlarını standartlaştırmak ve raporlama/analiz gibi hesaplamaya dayalı işlevleri tek bir merkezden sürdürebilmektir. Bu nedenle backend tasarımında, “tek bir büyük uygulama” yerine alan (domain) odaklı bir ayrıştırma benimsenmiştir.

### 3.2.1 Web/API Katmanı (Node.js, Express.js)

Web/API katmanı, gelen HTTP isteklerini karşılayan ve yanıt üreten giriş noktasıdır. Node.js çalışma ortamı üzerinde Express.js çerçevesi kullanılarak; routing, middleware zinciri ve hata yakalama gibi temel web sunucusu ihtiyaçları yönetilir. Middleware yaklaşımı, ortak sorumlulukların (ör. isteğin gövdesinin ayrıştırılması, çapraz origin erişim (CORS) ayarları, hata yanıt formatının standartlaşması) her endpoint için tekrar yazılmadan tek bir yerde ele alınmasını sağlar.

API tasarımında, uç noktaların tek bir API kökü altında toplanması ve isteklerin bu kök üzerinden modüllere yönlendirilmesi tercih edilmiştir. Böylece sistem, dış dünyaya karşı “tek bir giriş noktası” davranışı sergiler; sürümleme, loglama veya güvenlik gibi çapraz ihtiyaçların ileride genişletilmesi daha yönetilebilir hale gelir.

### 3.2.2 Alan Modülleri ve API Organizasyonu (Domain tabanlı yapı, Router)

Alan modülleri yaklaşımı, Domain-Driven Design (DDD) bakış açısıyla farklı iş sorumluluklarını ayrı modüller altında toplayarak kodun ölçeklenebilirliğini artırmayı hedefler. Örneğin kullanıcı ve erişim yönetimi, makine yönetimi, üretim takibi, duruş yönetimi ve raporlama gibi iş alanları; kendi sınırları içinde controller/service/model gibi bileşenlerle ayrıştırılır. Bu sayede her modül, kendi iş kurallarını mümkün olduğunca “kendi içinde” tutar ve yeni gereksinimler eklendiğinde değişikliğin etkilediği alan daha net belirlenir.

Router temelli organizasyon, endpoint’lerin domain bazında gruplanmasını sağlayarak API yapısının okunabilirliğini artırır. Modüler routing yaklaşımı, aynı zamanda test edilebilirlik ve bakım maliyeti açısından da avantaj sağlar; çünkü bir modülün davranışı, diğer modüllerin detaylarına bağlı olmadan geliştirilebilir.

### 3.2.3 Veri Katmanı (MongoDB, Mongoose)

Backend tarafında veri kalıcılığı, MongoDB doküman modeli üzerinden sağlanmış ve Mongoose ile şema/validasyon yönetimi ele alınmıştır. Bu yaklaşım, özellikle operasyonel varlıkların (kullanıcı, makine, parça, iş emri) tanımlı şemalarla kontrol edilmesini; telemetry ve event gibi esnek veri tiplerinin ise kontrollü biçimde genişletilebilmesini mümkün kılar.

Veri katmanında temel hedef, uygulama modüllerinin “aynı veriyi farklı şekilde yorumlamasını” önlemektir. Bu nedenle kritik tanımlayıcılar için benzersizlik ve doğrulama kuralları uygulanır; referans ilişkileriyle veri tekrarının azaltılması amaçlanır. Veritabanı tasarımının ayrıntıları, 3.4 başlığı altında kapsamlı biçimde ele alınmıştır.

### 3.2.4 Kimlik Doğrulama ve Yetkilendirme (JWT, Guard yapısı)

Kimlik doğrulama mekanizması, token tabanlı bir yaklaşım üzerine kuruludur. Bu yapı, kullanıcının oturum bilgisinin istemci tarafında taşınabilmesini ve API isteklerinin bu oturum bilgisiyle yetkilendirilebilmesini sağlar. Oturum sürekliliği ise kısa ömürlü `accessToken` ile daha uzun ömürlü `refreshToken` kombinasyonu üzerinden yönetilerek, hem güvenlik hem de kullanıcı deneyimi açısından dengeli bir çözüm hedeflenmiştir.

Yetkilendirme tarafında rol tabanlı erişim kontrolü (RBAC) benimsenmiştir. Böylece kullanıcıların sistemde hangi aksiyonlara erişebileceği, rol ve izin kavramları üzerinden merkezi biçimde tanımlanır. Guard yaklaşımıyla erişim kontrolünün hem UI hem de API seviyesinde uygulanması, güvenliğin “tek katmanlı” bir kontrol olarak kalmamasını ve sistem davranışının tutarlı olmasını amaçlar.

**Görsel Önerileri**

- İstek işleme akışı (request → middleware zinciri → controller/service → response)
- Domain bazlı API organizasyonu şeması (modül sınırları ve router yönlendirmesi)
- Kimlik doğrulama/Yetkilendirme akışı (login → accessToken/refreshToken → RBAC kontrol)

## 3.3 Frontend Tasarımı ve Teknolojileri

Frontend katmanı, kullanıcının sistemle etkileşime girdiği tüm ekranları ve iş akışlarını kapsar. Tasarım hedefi; operasyonel verilerin anlaşılır bir görsel dile dönüştürülmesi, kullanıcıya doğru bağlamın (zaman penceresi, kaynak, makine seçimi vb.) açık biçimde sunulması ve yetkiye bağlı ekran erişimlerinin tutarlı biçimde yönetilmesidir. Bu nedenle frontend mimarisinde, hem bileşen bazlı yeniden kullanım hem de modül bazlı ayrıştırma birlikte ele alınmıştır.

### 3.3.1 React ve Vite

Uygulama arayüzü, React ile bileşen tabanlı bir yaklaşımla inşa edilmiştir. Bileşen yaklaşımı, ekranların ortak parçalarını (formlar, tablolar, dialog’lar, kartlar) tekrar kullanılabilir hale getirerek geliştirme sürecini hızlandırır ve UI tutarlılığını destekler. Tek sayfa uygulama (SPA) kurgusu sayesinde kullanıcı, modüller arasında gezinirken sayfa yenileme ihtiyacı olmadan akıcı bir deneyim elde eder.

Vite, geliştirme ve build süreçlerinde hızlı geri bildirim üreten bir araç zinciri sunarak geliştirme verimliliğini artırmayı hedefler. Bu tercih, özellikle UI üzerinde iteratif geliştirme yapılan senaryolarda, değişikliklerin hızlı doğrulanabilmesini ve proje kapsamının daha kısa sürede olgunlaştırılabilmesini destekler.

### 3.3.2 Feature-Based Yapı

Frontend kod tabanı, ekranların “iş alanlarına göre” gruplanacağı feature-based bir organizasyonla kurgulanmıştır. Böylece her modül; sayfa bileşenleri, alt bileşenler ve API etkileşimi gibi parçalarıyla birlikte kendi bağlamında yönetilebilir. Bu yaklaşım, büyük bir uygulamada tek bir “ortak components” havuzuna aşırı yük binmesini engeller; değişikliklerin hangi iş alanını etkilediği daha net izlenebilir hale gelir.

Feature-based yapı, aynı zamanda ekip çalışması açısından da avantaj sağlar. Bir modül üzerinde çalışan geliştirici, çoğunlukla aynı klasör ağacı içinde kalarak ilgili sayfa, form ve servis katmanını birlikte güncelleyebilir. Bu, özellikle yeni modül ekleme veya mevcut modülü genişletme süreçlerinde kodun okunabilirliğini artırır.

### 3.3.3 Material-UI (MUI)

Arayüz bileşenleri, tasarım tutarlılığını ve erişilebilirliği desteklemek amacıyla MUI bileşen kütüphanesi üzerine kurulmuştur. Bu yaklaşım, tablolar, dialog’lar, form bileşenleri ve layout yapılarında ortak bir görsel dil oluşmasını sağlar. Tema (theme) desteği ile renk, tipografi ve boşluk gibi UI kararları merkezi biçimde yönetilebilir; böylece modüller arası görsel uyumsuzlukların azaltılması hedeflenir.

MUI kullanımı, “yeniden kullanılabilir bileşen” yaklaşımını güçlendirirken, aynı zamanda ekranların responsive davranışının standart bir sistem üzerinden ele alınmasına katkı sağlar. Bu sayede uygulama, farklı ekran boyutlarında temel okunabilirliği koruyacak şekilde geliştirilebilir.

### 3.3.4 TanStack Query ve State Management

Uygulamada veriyle ilgili state yönetimi, “server state” ve “UI state” ayrımı üzerinden kurgulanmıştır. Server state; API’den alınan verilerin cache’lenmesi, yeniden fetch edilmesi ve hata/yüklenme durumlarının yönetilmesi gibi ihtiyaçları içerir. TanStack Query bu ihtiyaçları standartlaştırarak, her ekranın kendi içinde tekrar eden veri yönetimi kodu yazmasını azaltmayı hedefler.

Bu yaklaşım, özellikle listeler, rapor ekranları ve dashboard gibi “verinin sık değiştiği” alanlarda kullanıcı deneyimini iyileştirir. Cache ve invalidation mekanizmaları sayesinde ekran, gerektiğinde veriyi yeniden alır; loading/error durumları daha tutarlı bir biçimde kullanıcıya yansıtılır. UI state (seçim, filtreler, açık/kapalı dialog’lar vb.) ise ekran bileşenleri içinde daha yerel bir biçimde yönetilerek karmaşıklığın kontrol altında tutulması amaçlanır.

**Görsel Önerileri**

- Frontend uygulama akış diyagramı (route → layout → ekran bileşenleri)
- Feature-based klasörleme şeması (modül bazlı sayfa/bileşen/servis ayrımı)
- “Server state vs UI state” şeması (TanStack Query cache + ekran içi state)

## 3.4 Veritabanı Tasarımı

Projenin veritabanı tasarımı, aynı anda iki tür ihtiyacı karşılayacak şekilde kurgulanmıştır: (i) kullanıcı, makine, parça ve iş emri gibi operasyonel varlıkların tutarlı biçimde yönetilmesi ve (ii) üretim sırasında oluşan durum değişimleri ile telemetry benzeri zaman serisi verilerinin yüksek hacimde izlenebilmesi. Bu nedenle tasarım, statik tanım verileri ile dinamik “event/time series” verilerini aynı model içinde karıştırmak yerine, her veri sınıfının doğasına uygun bir saklama yaklaşımı benimser.

Bu projede kalıcılık katmanı için MongoDB doküman modeli tercih edilmiş ve Mongoose ile şema doğrulama/ilişki referanslama gibi ihtiyaçlar yönetilmiştir. Doküman yaklaşımı, özellikle telemetry gibi esnek metrik setlerinin taşındığı verilerde şemanın kontrollü biçimde evrilebilmesini kolaylaştırırken; kritik yönetim verilerinde (kullanıcı, rol vb.) ise şema ve benzersizlik kuralları ile veri kalitesinin korunması amaçlanmıştır.

### 3.4.1 Veri Modelleri ve İlişkiler

Veri modeli; yönetim, operasyon ve analiz katmanlarının birbirini beslediği bir ilişkiler ağı şeklinde tasarlanmıştır. “İlişki” kavramı, doküman tabanlı yapıda çoğunlukla ObjectId referansları ile kurulmuş; böylece tekrar eden verinin dokümanlar arasında kopyalanması yerine, merkezi varlıkların tekil kimlik üzerinden paylaşılması hedeflenmiştir. Bu yaklaşım, hem güncellemelerde tutarlılığı artırır hem de ekranların ihtiyaç duyduğu bağlamın (ör. bir duruşun hangi makine ve hangi job ile ilişkili olduğu) güvenilir biçimde taşınmasını sağlar.

Kimlik ve erişim yönetiminde User–Role–Permission ilişkisi temel alınmıştır. Kullanıcıların bir veya birden fazla role sahip olabilmesi, erişim kontrolünün “tek tek kullanıcı yetkisi” yerine “rol kümeleri” üzerinden yönetilmesini sağlar. Rol dokümanlarının Permission referansları taşıması ise yetkilerin kategorize edilerek sürdürülebilir biçimde genişletilebilmesini destekler. Oturum sürekliliği tarafında `refreshToken` kayıtları ayrı bir koleksiyonda tutulur; bu ayrım, kimlik verilerini büyütmeden oturum yönetimini izlenebilir kılar.

Operasyonel katmanda Machine, sistemin merkezî varlıklarından biridir. Bir makinenin “anlık durumu” (running/idle/downtime/unknown gibi) tekil makine kaydı üzerinde taşınırken; bu durumun nasıl oluştuğunu açıklayan tarihsel izler event kayıtlarında tutulur. Machine üzerinde `currentJobOrder` gibi referans alanları, “şu an hangi iş yürütülüyor?” sorusunun hızlı yanıtlanabilmesi için pratik bir bağlam sağlayarak ekran performansını destekler.

Üretim takibi tarafında Part ve JobOrder, veri modelinin bir diğer omurgasını oluşturur. Part kaydı, ideal çevrim süresi ve varsayılan ayarlar gibi üretim hesabını etkileyen parametreleri taşıyarak planlamanın tutarlı başlamasını sağlar. JobOrder ise part ve machine referansları üzerinden üretimi bağlamsallaştırır; hedef/gerçekleşen üretim sayıları gibi alanların aynı dokümanda tutulması, raporlama ekranlarının temel metriklere tek noktadan erişebilmesini kolaylaştırır. Buna ek olarak üretim sırasında gerçekleşen aksiyonlar ve miktar değişimleri ProductionEvent kaydı olarak saklanır; böylece hem iş emrinin yaşam döngüsü izlenebilir hale gelir hem de geriye dönük analizler için “olay izi” korunur.

Duruş yönetimi, ayrı bir “downtime” koleksiyonu oluşturmaktan ziyade MachineEvent yaklaşımıyla ele alınmıştır. MachineEvent, makine durum değişimlerini bir event log şeklinde saklayarak; duruş kayıtlarının da aynı yapı içinde reasonCode, kategori (planned/unplanned) ve ilişkili job bağlamıyla tutulmasına olanak verir. Planlı duruşlarda PlannedDowntimeRule ve PlannedDowntimeRun yapıları, “kural tanımı” ile “kuralın fiili çalıştırma çıktısı”nı birbirinden ayırır; bu ayrım hem yönetimsel kontrolü hem de izlenebilirliği artırmayı amaçlar.

Zaman serisi verilerde MachineTelemetry modeli kullanılmıştır. Bu koleksiyonda machine/job bağlamı, zaman damgası ve sinyal/metric değerleri birlikte saklanır. Telemetry verisinin operasyonel kayıtlardan ayrıştırılması, yüksek hacimli veri üzerinde sorgulama ve index tasarımını daha kontrollü hale getirir. OEE gibi metriklerin üretiminde ihtiyaç duyulan “makinenin son sinyali” ve “açık event” gibi türetilmiş bilgiler ise OeeMachineState benzeri özet bir modelde tutulur; bu yaklaşım, hesaplama katmanının her seferinde ham veriyi baştan taramasını azaltmayı hedefler.

Projedeki simülasyon ve AI bileşenleri de veritabanında iz bırakacak şekilde tasarlanmıştır. SimulationState, simülasyonun zaman bağlamını ve çalıştırma durumunu saklayarak test/demonstrasyon senaryolarının daha tekrarlanabilir yürütülmesine yardımcı olur. AiInsight ve AiUsage kayıtları ise üretilen AI çıktılarını ve kullanım metriklerini izlenebilir kılar; özellikle “analiz hangi pencere ve hangi veri snapshot’ı üzerinden üretildi?” sorusunu cevaplayacak şekilde window ve hash benzeri bağlam alanları taşır. Ayrıca bu kayıtların belirli bir süre sonunda otomatik temizlenebilmesi, uzun vadede veri büyümesini kontrol altında tutmaya yönelik bir saklama politikası olarak değerlendirilebilir.

### 3.4.2 Veritabanı Şeması

Veritabanı şeması, işlevsel ihtiyaçlara göre gruplanmış bir koleksiyonlar seti olarak düşünülebilir. Yönetim verileri (User/Role/Permission/RefreshToken) sistemin erişim güvenliğini ve oturum yönetimini taşırken; operasyonel veriler (Machine/Part/JobOrder) üretimin “tanım ve plan” katmanını temsil eder. Bu iki grubun yanında, üretim sırasında oluşan değişimlerin kalıcı kaydını tutan event/time series koleksiyonları (MachineEvent, ProductionEvent, MachineTelemetry) sistemin izlenebilirlik ve raporlama hedefini doğrudan destekler. OeeMachineState gibi türetilmiş/özet modeller ise performans ve hesaplama verimliliği açısından ara katman rolü üstlenir.

Şema tasarımında, kritik tanımlayıcı alanlar için benzersizlik (unique) yaklaşımı öne çıkar. Örneğin kullanıcı adı, makine kodu, parça kodu ve iş emri numarası gibi alanların tekil olması; kullanıcı arayüzünde arama/filtreleme akışlarının kararlı çalışmasını ve veri bütünlüğünün korunmasını sağlar. Zaman serisi ve event kayıtlarında ise sorgu performansını desteklemek için tarih alanları üzerinden index stratejileri kullanılır; bu sayede “belirli bir makine için son N kayıt” veya “belirli bir pencere içindeki telemetry” gibi tipik raporlama sorguları daha verimli yürütülebilir.

Özetle, bu projede veritabanı tasarımı; (i) operasyonel varlıkların tekil ve tutarlı tanımlanması, (ii) üretim sürecindeki değişimlerin event/time series olarak izlenebilir biçimde saklanması ve (iii) raporlama/analiz bileşenlerinin ihtiyaç duyduğu bağlamın performanslı şekilde okunabilmesi hedeflerini bir arada karşılayacak biçimde kurgulanmıştır.

**Görsel Önerileri**

- Mantıksal veri modeli diyagramı (User–Role–Permission, Machine–JobOrder–Part ilişkileri ve event/time series katmanı)
- “Event + Time Series” veri akışı şeması (MachineTelemetry + MachineEvent + ProductionEvent → OEE/raporlama)
- Koleksiyonlar özeti tablosu (koleksiyon adı, amacı, temel alanlar, referans ilişkileri, saklama politikası)

## Simgeler ve Kısaltmalar

- AI = Artificial Intelligence
- API = Application Programming Interface
- CRUD = Create, Read, Update, Delete
- CORS = Cross-Origin Resource Sharing
- DDD = Domain-Driven Design
- HTTP = Hypertext Transfer Protocol
- JSON = JavaScript Object Notation
- JWT = JSON Web Token
- `accessToken` = Access Token
- `refreshToken` = Refresh Token
- RBAC = Role-Based Access Control
- OEE = Overall Equipment Effectiveness
- ODM = Object-Document Mapping
- REST = Representational State Transfer
- SPA = Single Page Application
- UI = User Interface
- `collection` = Collection (MongoDB tablo karşılığı)
- `document` = Document (MongoDB kayıt karşılığı)
- `schema` = Schema
- ObjectId = MongoDB ObjectId
- `event log` = Event log (olay kaydı yaklaşımı)
- `time series` = Time series
- `telemetry` = Telemetry
- `index` = Index
- TTL = Time To Live (otomatik silme politikası)

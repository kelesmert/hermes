# 4. UYGULAMA

Bu bölümde, sistemin kullanıcıya sunulan işlevleri modül bazında açıklanmaktadır. Anlatım; kullanıcı akışları, erişim kısıtları ve ekranların işlevsel rolü üzerinden yürütülmüş; teknik ayrıntılar ancak konunun anlaşılması için gerekli olduğu ölçüde kullanılmıştır.

## 4.1 Kullanıcı ve Erişim Yönetimi Modülü

Kullanıcı ve erişim yönetimi modülü, sistemin güvenli kullanımını sağlayan temel bileşendir. Bu modül; sisteme kimlik doğrulama ile giriş yapılmasını, kullanıcıların rol ve izinler üzerinden yetkilendirilmesini ve yönetimsel işlemlerin kontrollü biçimde yürütülmesini amaçlar. Uygulama modüllerinin tamamı, bu modülde tanımlanan erişim kurallarına bağlı olarak çalıştığı için, kullanıcı deneyiminin tutarlılığı ve veri güvenliği açısından kritik bir rol üstlenir.

### 4.1.1 Kimlik Doğrulama Sistemi

Kimlik doğrulama süreci, kullanıcının sisteme erişmeden önce kimliğinin doğrulanmasını sağlayan ilk adımdır. Bu projede giriş ekranı üzerinden kullanıcı adı ve şifre bilgileri alınır; doğrulama başarılı olduğunda kullanıcı oturumu başlatılır ve kullanıcı uygulama içinde yetkili olduğu alanlara yönlendirilir. Bu akış, kullanıcıların sisteme kontrollü bir biçimde erişmesini sağlarken, kimlik doğrulaması yapılmamış erişim denemelerini de engeller.

Oturum yönetimi, kısa ömürlü `accessToken` ve daha uzun ömürlü `refreshToken` yaklaşımıyla ele alınmıştır. `accessToken` isteklerde kimlik doğrulama amacıyla kullanılırken, `refreshToken` oturumun devamlılığını sağlamak için devreye alınır. Bu sayede kullanıcı, uygulama içinde gezinirken oturum durumunun merkezi biçimde yönetilmesi ve yetkisiz bir durumda oturumun güvenli şekilde sonlandırılması hedeflenmiştir.

### 4.1.2 Rol Tabanlı Erişim Kontrolü (RBAC)

Rol tabanlı erişim kontrolü, kullanıcıların sistemde hangi işlemleri yapabileceğini “rol” ve “izin” kavramları üzerinden belirleyen yaklaşımdır. Bu projede yetkilendirme; kullanıcının sahip olduğu rollerin sistemde tanımlı izinlerle eşleştirilmesiyle yürütülmüştür. Böylece kullanıcıya doğrudan tek tek yetki atamak yerine, rol kümeleri üzerinden yönetilebilir bir erişim modeli oluşturulmuştur.

Yetkilendirme yaklaşımı iki düzeyde ele alınmıştır. Birinci düzeyde, kullanıcı arayüzü tarafında yetkisiz kullanıcıların ilgili ekranlara erişmesi engellenerek kullanıcı deneyimi tutarlı hale getirilir. İkinci düzeyde ise sunucu tarafında, aynı yetki kontrolü API çağrılarında da uygulanır; böylece yalnızca istemci tarafında yapılan bir kısıtlama ile yetinilmez ve güvenlik denetimi bütüncül biçimde sağlanır. Bu çift katmanlı yaklaşım, uygulama güvenliğinin yanı sıra yönetilebilirlik açısından da temel bir tasarım kararıdır.

### 4.1.3 Kullanıcı Yönetimi Ekranları

Kullanıcı yönetimi ekranları, yönetici yetkisine sahip kullanıcıların sistemdeki kullanıcı hesaplarını yönetebilmesini sağlar. Bu kapsamda kullanıcılar listelenebilir, yeni kullanıcı oluşturulabilir, kullanıcı bilgileri güncellenebilir ve gerekli durumlarda kullanıcı hesabı pasif hale getirilebilir. Kullanıcıların bir veya birden fazla role sahip olabilmesi, erişim kontrolünün rol tabanlı yapıyla uyumlu biçimde işletilmesine imkan verir.

Arayüz tasarımında kullanıcı yönetimi ile rol/izin yönetimi birbirini tamamlayan iki süreç olarak ele alınmıştır. Kullanıcı tarafında hesap bilgileri ve rol atamaları yönetilirken, rol yönetimi tarafında rollerin kapsamı ve izinleri düzenlenir. Bu ayrım, hem yönetimsel işlemleri daha anlaşılır hale getirir hem de hatalı yetkilendirme riskini azaltarak erişim denetiminin daha kontrollü yapılmasına katkı sağlar.

**Görsel Önerileri**

- Şekil 4.1 (genel): RBAC modeli (Kullanıcı -> Rol -> İzin ilişkisi)
- Resim 4.1: Giriş ekranı (kimlik doğrulama formu, hata/başarı geri bildirimi)
- Resim 4.2: Kullanıcı listesi (arama, rol bilgisi, aktif/pasif durum, işlem butonları)
- Resim 4.3: Kullanıcı oluşturma/düzenleme penceresi (rol seçimi ve zorunlu alanlar)
- Resim 4.4: Roller ve izinler ekranı (rol listesi + rol oluşturma/düzenleme penceresinde izin seçimi)

## 4.2 Makine Yönetimi Modülü

Makine yönetimi modülü, üretim ortamında izlenen ekipmanların sistemde tekil varlıklar olarak tanımlanmasını ve operasyonel durumlarının takip edilebilir hale getirilmesini amaçlar. Bu modül, hem yönetimsel envanter ihtiyacını karşılamakta hem de diğer modüllerin (ör. izleme ve raporlama ekranlarının) doğru makine referanslarıyla çalışmasına temel oluşturmaktadır. Bu nedenle makine kaydı; yalnızca “bir liste” değil, üretim verilerinin bağlandığı ana kimlik katmanı olarak ele alınmıştır.

### 4.2.1 Makine Tanımlama ve Durum Takibi

Makine tanımlama işlevi, sahadaki ekipmanın sistemde standart bir tanımla yer almasını sağlar. Bu projede her makine için ayırt edici bir kod ve açıklayıcı bir ad bilgisi tutulur; ayrıca gerektiğinde sınıflandırma amacıyla etiketler kullanılabilir ve sorumluluk ataması yapılabilir. Bu yaklaşım, özellikle makine sayısı arttıkça envanterin düzenli kalmasını ve kullanıcıların doğru kayda hızlı biçimde erişebilmesini destekler.

Durum takibi ise makinenin operasyonel görünürlüğünü sağlar. Makinenin “çalışıyor/boşta/duruş/bakım” gibi durumları sistemde güncellenebilir; bu durumlar son değişiklik zamanı ile birlikte sunularak sahadaki değişimlerin yönetimsel olarak izlenmesi kolaylaştırılır. Buna ek olarak makinenin aktif/pasif olarak işaretlenebilmesi, geçici olarak devre dışı kalan ekipmanın raporlama ve izleme ekranlarında kontrollü biçimde ele alınmasına imkân verir.

### 4.2.2 Makine Listesi ve Detay Ekranları

Makine listesi ekranı, envanterin tek noktadan görüntülenmesini ve temel yönetim işlemlerinin yürütülmesini sağlar. Liste görünümünde makine kodu ve adıyla birlikte mevcut durum bilgisi, son durum değişikliği ve etiketler gibi karar vermeyi kolaylaştıran özet alanlar sunulur. Kullanıcı, yetkisine bağlı olarak makine oluşturma, güncelleme ve silme gibi işlemleri bu ekran üzerinden gerçekleştirebilir.

Detay inceleme, bu projede ayrı bir sayfa yerine “durum kayıtları” üzerinden ele alınmıştır. Makineye ilişkin durum değişimlerinin zaman bilgisiyle kaydedilmesi ve geriye dönük incelenebilmesi; hem izlenebilirlik hem de operasyonel değerlendirme açısından önemlidir. Bu kayıtların görüntülenmesi, kullanıcıların “makinenin hangi koşullarda ne zaman hangi duruma geçtiği” sorusuna hızlı bir şekilde yanıt bulmasına katkı sağlar.

### 4.2.3 Canlı İzleme (Monitoring)

Canlı izleme ekranı, makineye ait telemetry verilerinin ve operasyonel özet metriklerin görselleştirilerek izlenmesini amaçlar. Kullanıcı, izlemek istediği makineyi seçerek anlık durum göstergelerini ve time series grafiklerini aynı bağlamda takip edebilir. Böylece üretim ortamında oluşabilecek sapmaların erken fark edilmesi ve değerlendirilmesi için uygulama içinde bütünleşik bir izleme deneyimi sağlanır.

İzleme tasarımında, veri kaynağı seçimi ve time window yaklaşımı önemlidir. Bu projede kullanıcı, live data ile shift window'a göre özetlenmiş veri gibi farklı görünümler arasında geçiş yaparak hem anlık tepkiselliği hem de vardiya bazlı değerlendirmeyi birlikte yürütebilir. Ayrıca arayüzde hata ve bağlantı problemlerinin açık biçimde raporlanması, izleme sürecinin güvenilirliğini artırmak ve kullanıcıyı belirsizlikten uzak tutmak açısından bilinçli bir tercih olarak ele alınmıştır.

**Görsel Önerileri**

- Şekil 4.2 (genel): Makine yaşam döngüsü ve durum geçişleri (çalışıyor/boşta/duruş/bakım)
- Resim 4.5: Makine listesi ekranı (durum etiketleri, aktif/pasif anahtarı, etiketler)
- Resim 4.6: Makine oluşturma/düzenleme penceresi (kod/ad alanları, etiketler, sorumlu ataması)
- Resim 4.7: Makine durum kayıtları penceresi (son kayıtlar, başlangıç/bitiş bilgileri)
- Resim 4.8: Canlı izleme ekranı (makine seçimi + telemetry grafikleri + özet metric card'ları)

## 4.3 Üretim Takibi Modülü

Üretim takibi modülü, üretim planının sahaya “iş emri” üzerinden aktarılmasını ve gerçekleşen üretimin ölçülebilir bir biçimde kayda geçirilmesini hedefler. Bu modülün temel yaklaşımı, üretim sürecini parça tanımlarıyla başlatmak; ardından parçayı bir makine ve hedef miktar ile ilişkilendirerek izlenebilir bir iş akışına dönüştürmektir. Böylece hem operasyonel görünürlük sağlanmakta hem de raporlama katmanına girdi üretecek standart bir veri zemini oluşturulmaktadır.

### 4.3.1 Parça Yönetimi

Parça yönetimi, üretim takibinin başlangıç noktasıdır ve üretilecek ürün/yarı mamul tanımlarının tutarlı biçimde tutulmasını sağlar. Bu projede parçalar; kod ve ad gibi tanımlayıcı alanların yanında kategori, birim, açıklama ve etiketlerle zenginleştirilebilmektedir. Bu yapı, kullanıcıların benzer parçaları sınıflandırmasını ve üretim planlama aşamasında doğru parça seçimini kolaylaştırır.

Parça tanımında öne çıkan unsur, üretime ilişkin bazı varsayımların standartlaştırılabilmesidir. İdeal çevrim süresi gibi üretim hızını etkileyen parametreler ve makineye özel varsayılan ayarların parçaya bağlanabilmesi, iş emirleri oluşturulurken daha tutarlı bir başlangıç çerçevesi sağlar. Ayrıca bir parçanın hangi makinelerle uyumlu olduğunun tanımlanması, iş emri oluşturma sürecinde hatalı eşleşmelerin önüne geçmeyi amaçlayan bir tasarım tercihi olarak değerlendirilmiştir.

### 4.3.2 İş Emirleri ve Üretim Kayıtları

İş emirleri, üretimin planlanabilir ve izlenebilir bir akışa dönüşmesini sağlayan temel varlıklardır. Bu projede bir iş emri; üretilecek parça, kullanılacak makine, hedef miktar ve isteğe bağlı operatör ataması üzerinden tanımlanır. İş emirlerinin bu şekilde modellenmesi, “ne üretilecek, nerede üretilecek ve ne kadar üretülecek” sorularını tek bir kayıt altında netleştirerek operasyonel koordinasyonu destekler.

İş emri yaşam döngüsü, sahadaki gerçek üretim akışını yansıtacak şekilde durum geçişleriyle yönetilmektedir. İş emri başlatılabilir, üretim sırasında duraklatılabilir, yeniden devam ettirilebilir; tamamlandığında veya iptal edildiğinde süreç sonlandırılabilir. Üretim kayıtları, yalnızca miktar bilgisini değil, kalite durumunu da içerecek biçimde ele alınmıştır. Böylece gerçekleşen üretim hedefe karşı izlenebilir hale gelirken, sağlam ve hatalı ürün ayrımı da raporlama için anlamlı bir veri üretir. İş emrine ilişkin olay geçmişinin görüntülenebilmesi ise, süreç boyunca yapılan işlemlerin geriye dönük incelenmesine imkan vererek izlenebilirlik hedefini tamamlayan bir mekanizma sunar.

Bu modülde duraklatma davranışı, duruş yönetimiyle birlikte ele alınmıştır. Uygulama perspektifinden bakıldığında duraklatma, sadece iş emrinin “beklemeye alınması” değil; aynı zamanda üretim kaybına neden olan koşulların daha sonra analiz edilebilmesi için gerekçelendirilmesi gereken bir operasyon olarak görülmüştür. Bu yaklaşım, üretim takibi ile duruş analizi arasında tutarlı bir bağ kurarak sonraki raporlama adımlarına altyapı hazırlar.

### 4.3.3 Üretim Panosu (Board)

Üretim Panosu (Board), üretim takibinin yönetsel görünürlüğünü artırmak amacıyla tasarlanmış özet bir izleme ekranıdır. Bu ekran, seçili time window içinde tüm makinelerin mevcut durumunu, duruşları ve devam eden iş emirlerini tek bir sayfada birleştirerek “sahada şu an ne oluyor?” sorusuna hızlı bir yanıt üretmeyi amaçlar. Bu nedenle Board, detaylı işlem ekranlarının yerine geçmekten ziyade; yönlendirme ve erken uyarı rolü üstlenir.

Board tasarımında iki boyut öne çıkar: time window ve veri kaynağı seçimi. Kullanıcı, shift window'a göre özetlenen bir görünüm üzerinden duruşların süresini ve etkisini değerlendirebilir; makine durum dağılımını grafiksel olarak izleyebilir ve arama/filtreleme ile sorunlu noktalara odaklanabilir. Bu yaklaşım, üretim takibini tekil kayıtlar üzerinden değil, “operasyon fotoğrafı” üzerinden okumayı mümkün kılarak karar verme süreçlerini destekler.

**Görsel Önerileri**

- Şekil 4.3 (genel): Üretim takibi veri akışı (Parça -> İş Emri -> Üretim Kaydı -> Board/Reporting)
- Resim 4.9: Parça listesi ekranı (kategori, birim, ideal çevrim, uyumlu makineler)
- Resim 4.10: Parça oluşturma/düzenleme penceresi (kategoriye bağlı alanlar ve varsayılan ayarlar)
- Resim 4.11: İş emri listesi ekranı (durum, hedef/gerçekleşen üretim, operatör ataması)
- Resim 4.12: İş emri oluşturma/düzenleme penceresi (parça-makine eşleşmesi ve hedef miktar)
- Resim 4.13: Üretim kaydı penceresi (miktar + kalite seçimi, hatalı ürün sınıflandırması)
- Resim 4.14: İş emri olay geçmişi penceresi (başlatma/üretim/duraklatma vb. zaman çizelgesi)
- Resim 4.15: Board ekranı (durum dağılımı, duruş listesi, makine listesi)

## 4.4 OEE Hesaplama ve Raporlama Modülü

OEE (Overall Equipment Effectiveness) modülü, üretim performansının tek bir göstergede özetlenebilmesini ve bu göstergenin alt bileşenleri üzerinden yorumlanabilmesini amaçlar. Bu modülde temel hedef, yalnızca “bir yüzde üretmek” değil; hesaplamanın hangi time window için yapıldığını, hangi verilerle beslendiğini ve hangi koşullarda anlamlı hale geldiğini kullanıcıya açık biçimde gösterebilmektir. Bu nedenle modül, hesaplama mantığı ile raporlama/görselleştirme katmanını birlikte ele alan bütünleşik bir yapıda tasarlanmıştır.

### 4.4.1 OEE Hesaplama Algoritması

Bu projede OEE hesaplaması, shift window temelli bir üretim zaman modeli üzerine kurulmuştur. Yaklaşımın merkezinde “planlı üretim süresi” kavramı yer alır: hesaplama, yalnızca vardiya zamanları içinde ve üretimin aktif olduğu kabul edilen aralıklar için anlamlıdır. Böyle bir kısıtlama, üretim yapılmayan zamanların metrikleri yapay olarak düşürmesini engelleyerek, değerlendirmenin üretim bağlamına bağlı kalmasını sağlar.

Hesaplamada üç ana veri kaynağı birlikte kullanılır: (i) makine telemetry'sinden elde edilen çalışma sinyali, (ii) üretim kayıtlarından türetilen gerçekleşen adet bilgileri ve (iii) duruş kayıtları üzerinden planlı/plansız kayıp süreleri. Bu kaynakların birlikte ele alınması, OEE’nin tek bir katmandan “tahmin” edilmesi yerine, üretimdeki gerçek operasyon akışını yansıtan bir bileşik metrik olarak üretilmesini hedefler. Ayrıca planlı duruşların OEE’ye etkisinin “etkiler/etkilemez” ayrımıyla yönetilmesi, metriklerin işletme pratiğine daha yakın bir biçimde yorumlanabilmesini mümkün kılar.

### 4.4.2 Availability, Performance, Quality Hesaplamaları

OEE, kullanılabilirlik (Availability), performans (Performance) ve kalite (Quality) bileşenlerinin çarpımı olarak ele alınır. Kullanılabilirlik, planlı üretim süresi içinde makinenin gerçekten çalıştığı zamanın oranını temsil eder. Bu bileşen, üretimin aktif olduğu aralıklarda telemetry üzerinden gözlenen çalışma sinyalinin süreye dönüştürülmesiyle elde edilerek “gerçek çalışma” vurgusunu öne çıkarır.

Performans bileşeni, gerçekleşen üretimin ideal çevrim süresi üzerinden beklenen teorik süre ile fiili çalışma süresi arasındaki ilişkiyi ifade eder. Bu yaklaşımda ideal çevrim süresi parça tanımından alınır ve üretim kayıtlarıyla birlikte değerlendirilir. Kalite bileşeni ise, sağlam ürün adedinin toplam üretim adedine oranı olarak hesaplanır. Bu üç bileşenin birlikte ele alınması, kayıpların yalnızca duruşlardan değil; hız düşüşleri ve kalite kayıplarından da kaynaklanabileceği varsayımıyla uyumlu, daha dengeli bir performans okuması sunar.

### 4.4.3 OEE Dashboard

OEE dashboard ekranı, seçili makine ve time window için hesaplanan metrikleri özetleyen bir görünüm sunar. Bu ekranın temel katkısı, OEE değerini tek başına vermek yerine; Availability/Performance/Quality bileşenlerini aynı bağlamda görünür kılarak “hangi tür kayıp baskın?” sorusuna hızlı bir cevap üretmesidir. Böylece kullanıcı, tek bir yüzde değer yerine, karar vermeyi destekleyen bir bileşen ayrıştırmasıyla karşılaşır.

Ekran tasarımında öne çıkan nokta, hesaplamanın bağlamının açık biçimde sunulmasıdır. Seçilen tarih/shift window ve makine bilgisi metriklerle birlikte gösterilerek, farklı günlerin veya farklı veri kaynaklarının birbiriyle karıştırılmasının önüne geçilir. Ayrıca kullanıcı, aynı ekranda operatör bazlı kırılımları da görebildiği için, performansın yalnız makine değil süreç/rol dağılımı üzerinden de değerlendirilebilmesi hedeflenmiştir.

### 4.4.4 OEE Raporları ve Grafikler

Raporlama bileşeni, OEE ölçümünü tek bir anlık değer olmaktan çıkarıp eğilim analizi yapılabilir hale getirmeyi amaçlar. Bu projede raporlar, iki temel kullanım senaryosunu destekler: (i) belirli bir vardiya gününe odaklanarak ayrıntılı metrik incelemesi yapmak ve (ii) tarih aralığı veya periyot perspektifiyle metriklerin değişimini izlemek. Özellikle trend charts, zaman içinde oluşan iyileşme/bozulma davranışlarının daha erken fark edilmesine katkı sağlar.

Trend üretiminde coverage kavramının görünür kılınması, raporlamanın güvenilirliğini artıran önemli bir tasarım kararıdır. Çünkü üretim yapılmayan günler veya veri bulunmayan time window'lar, metriklerin ortalamasını doğrudan temsil etmeyebilir. Bu nedenle raporlar, yalnızca hesaplanabilir günleri hesaba katıp bunu kullanıcıya açık biçimde göstererek, sonuçların yanlış yorumlanma riskini azaltmayı hedefler.

**Görsel Önerileri**

- Şekil 4.4 (genel): OEE hesap akışı (Vardiya penceresi + üretim aktif aralıklar -> A/P/Q -> OEE)
- Şekil 4.5 (genel): A/P/Q bileşenlerinin formül şeması (oran ilişkileri ve veri kaynakları)
- Resim 4.16: OEE rapor ekranı filtreleri (makine seçimi + time window + kaynak)
- Resim 4.17: OEE özeti kartları (OEE, kullanılabilirlik, performans, kalite)
- Resim 4.18: Operatör kırılımı tablosu (operatör bazlı A/P/Q/OEE ve adetler)
- Resim 4.19: Trend özeti + coverage göstergesi
- Resim 4.20: Trend chart (OEE ve alt bileşenlerin time series)

## 4.5 Duruş Yönetimi Modülü

Duruş yönetimi modülü, üretim kayıplarının izlenebilir ve analiz edilebilir bir biçimde kayda alınmasını amaçlar. Bu modülün odağında, duruşların “ne kadar sürdüğü” kadar “neden gerçekleştiği” sorusu da yer alır. Bu nedenle sistem, duruş kayıtlarını standart bir neden kataloğu üzerinden sınıflandırmayı ve sınıflandırma sürecini operatörün iş akışına doğal biçimde eklemeyi hedefler.

Modül tasarımında iki temel duruş türü ayrımı yapılır: planlı duruşlar (ör. mola veya planlı bakım gibi öngörülebilir duruşlar) ve plansız duruşlar (ör. arıza veya malzeme bekleme gibi beklenmedik duruşlar). Bu ayrım, hem kullanıcı arayüzünde süreçlerin ayrı yönetilmesine hem de raporlama katmanında metriklerin doğru yorumlanmasına olanak sağlar.

### 4.5.1 Planlı Duruş Tanımlama

Planlı duruşlar, tekrarlayan veya tek seferlik time window'lar üzerinden önceden tanımlanabilen duruşlardır. Bu projede planlı duruş tanımı, belirli makineler için bir plan kuralı oluşturma yaklaşımıyla ele alınmıştır. Böylece plan, yalnızca bir “hatırlatma” olarak değil; üretim akışında otomatik olarak devreye giren ve tutarlı kayıt üreten bir mekanizma olarak değerlendirilir.

Planlı duruş yönetiminde iki ayrı ihtiyaç öne çıkar: (i) planların kolay oluşturulup güncellenebilmesi ve (ii) planların sahada gerçekten ne şekilde uygulandığının izlenebilmesi. Bu nedenle arayüz, kural tanımları ile kuralın çalıştırma geçmişini birbirinden ayırır. Çalıştırma geçmişi, planların fiili yürütümünü görünür kılarak beklenen ile gerçekleşen arasındaki farkların takip edilebilmesini hedefler.

### 4.5.2 Plansız Duruş Kayıt ve Takibi

Plansız duruşlar, üretim sırasında oluşan beklenmedik kesintileri temsil eder ve çoğu zaman analiz açısından en kritik veri kaynağıdır. Bu projede plansız duruşların kaydı iki biçimde ele alınmıştır: kullanıcı tarafından manuel başlatılan duruşlar ve sistem tarafından tespit edilip kayda alınan duruşlar. Bu iki kaynağın birlikte ele alınması, hem sahada “anında kayıt” ihtiyacını karşılar hem de operatörün gözünden kaçabilecek kısa kesintilerin sistem tarafından yakalanabilmesini destekler.

Sınıflandırma süreci, plansız duruşların anlamlı hale gelmesini sağlayan temel adımdır. Duruş kaydı, bir neden (reason) seçimi ve isteğe bağlı bir not ile zenginleştirilerek daha sonra yapılacak analizlere uygun hale getirilir. Bu süreçte veri bütünlüğünü korumak amacıyla, geçmiş kayıtların kontrolsüz biçimde değiştirilmesi yerine; sınırlı bir düzeltme penceresi ve gerektiğinde “split” yaklaşımıyla düzeltme mantığı benimsenmiştir. Böylece hem hatalı ilk sınıflandırmalar düzeltilebilir hem de duruş süresi, birden fazla nedene bölünerek daha doğru raporlama üretir.

Ek olarak, bazı plansız duruşların kapanışında “onay” ihtiyacının görünür kılınması, veri kalitesini artırmaya yönelik bir mekanizma olarak ele alınmıştır. Bu yaklaşım, özellikle otomatik tespit edilen uzun duruşların yanlış anlaşılmasını veya hatalı sınıflandırılmasını azaltmayı hedefler ve kullanıcının dikkatini “kontrol edilmesi gereken” kayıtlara yönlendirir.

### 4.5.3 Duruş Analizi ve Raporlama

Duruş analizinde temel ihtiyaç, geçmiş kayıtların esnek bir biçimde filtrelenebilmesi ve tekrar gözden geçirilebilmesidir. Bu projede analiz, öncelikle zaman aralığı ve kategori/neden filtreleri üzerinden yürütülen bir geçmiş görünümü ile sağlanır. Bu görünüm, duruşların makine ve iş emri bağlamıyla birlikte ele alınmasına imkan vererek, operasyonel sorunların izini sürmeyi kolaylaştırır.

Analiz katmanında ikinci odak, sınıflandırma kalitesini güçlendirmektir. Bu kapsamda, kapalı plansız duruşlar için yapay zekâ destekli bir yardımcı değerlendirme akışı eklenmiş; duruşun bağlamına göre özet, olası patternlar ve önerilen aksiyonlar gibi çıktılar sunulmuştur. Bu yaklaşım, klasik raporlama yerine “yorumlanabilirlik” hedefini destekleyen, karar vericinin hızlı bir ilk değerlendirme yapmasına yardımcı olan tamamlayıcı bir unsur olarak konumlandırılmıştır.

**Görsel Önerileri**

- Şekil 4.6 (genel): Duruş yaşam döngüsü (planlı/plansız) ve durum geçişleri
- Şekil 4.7 (genel): Planlı duruş kuralı → çalıştırma geçmişi → duruş kaydı ilişkisi
- Resim 4.21: Duruşlar ekranı (Açık Duruşlar sekmesi)
- Resim 4.22: Plansız duruş başlatma penceresi (makine + reason + not)
- Resim 4.23: Duruş sınıflandırma/düzeltme penceresi (reason + not, split/düzeltme uyarısı)
- Resim 4.24: Geçmiş duruş listesi (filtreler + “onay bekliyor/onaylandı” etiketleri)
- Resim 4.25: Planlı duruş kuralları listesi (kural adı, tekrar tipi, zaman aralığı, öncelik)
- Resim 4.26: Planlı duruş kuralı oluşturma/düzenleme penceresi
- Resim 4.27: Planlı duruş çalıştırma geçmişi (run listesi ve durumları)
- Resim 4.28: AI duruş analizi penceresi (özet + pattern + aksiyonlar)

## 4.6 Simülasyon Sistemi

Simülasyon sistemi, gerçek saha verisine ihtiyaç duymadan sistemin uçtan uca davranışının gözlemlenebilmesini amaçlayan yardımcı bir bileşendir. Bu bileşen sayesinde izleme (telemetry), üretim kayıtları ve bu kayıtların raporlama metriklerine etkisi kontrollü biçimde üretilebilir; böylece geliştirme, demo ve doğrulama süreçlerinde tekrarlanabilir senaryolar elde edilir. Tasarımın temel prensibi, “gerçeği birebir taklit etmek” yerine; üretim ortamında beklenen veri akışlarını temsil eden, ayarlanabilir ve denetlenebilir bir davranış uzayı sunmaktır.

Simülasyon iki ana katmanda ele alınmıştır. Birinci katman, zamanın simülasyon bağlamında tutarlı biçimde ilerlemesini sağlayan simülasyon saati yaklaşımıdır. İkinci katman ise vardiya ve üretim akışlarını besleyen veri üreticileridir: telemetry üretimi ve bu telemetry'ye bağlı üretim olaylarının oluşturulması. Bu ayrım, zaman senkronizasyonu ile veri üretimini bağımsız tasarlamayı mümkün kılarak, senaryoların hem hızlandırılabilir hem de tekrar oynatılabilir olmasını destekler.

### 4.6.1 Simülasyon Saati (Simulation Clock)

Bu projede simülasyon saatinin amacı, hızlandırılmış senaryolarda “gerçek zaman” ile “simülasyon zamanı” arasındaki farkı yönetilebilir hale getirmektir. Özellikle bir vardiya senaryosunun kısa sürede oynatılması istendiğinde, sistemin diğer modülleri (ör. raporlama ve analiz) tutarlı bir zaman ekseni üzerinden çalışmak zorundadır. Simülasyon saati, bu tutarlılığı sağlayan ortak referans noktası olarak ele alınmıştır.

Yaklaşım, bir başlangıç günü (epoch) ve shift time window üzerinden ilerleyen bir “sanal gün” kavramına dayanır. Senaryo çalışırken zaman imleci (cursor) telemetry örnekleriyle birlikte ilerler; senaryo durdurulup tekrar başlatıldığında ise kaldığı noktadan devam edebilmesi hedeflenir. Böylece senaryonun yarıda kesilmesi, simülasyonun zaman çizelgesini belirsiz hale getirmez; zaman durumu korunur ve tekrarlanabilirlik güçlenir.

Simülasyon saati aynı zamanda güvenli “reset” ihtiyacını da karşılar. Bazı senaryolarda, daha önce üretilen simülasyon verilerinin temizlenip aynı vardiyanın yeniden oynatılması gerekebilir. Bu durumda saat, yalnızca bir sayaç değil; senaryonun veri bütünlüğünü koruyan bir kontrol noktası olarak değerlendirilir. Reset işlemi, simülasyon kaynaklı verilerin temizlenmesi ve zaman durumunun başlangıç koşullarına alınmasıyla, yeni bir koşunun tutarlı biçimde başlatılmasını sağlar.

### 4.6.2 Vardiya ve Üretim Simülasyonu

Bu projede simülasyon, veri akışını iki düzeyde üretir: (i) makine davranışını temsil eden telemetry sinyali ve metrikleri, (ii) telemetry sinyaline bağlı olarak oluşan üretim olayları (sağlam/hatalı adet). Bu iki düzeyin ayrıştırılması, “makine çalışıyor mu?” bilgisinin ayrı bir kaynak olarak ele alınmasını ve üretim hesaplarının bu kaynaktan türetilmesini sağlar. Böylece üretim çıktısı, rastgele bir sayı üretiminden ziyade; çalışma sinyali ile ilişkilendirilmiş tutarlı bir akış olarak modellenir.

Telemetry üretimi için iki farklı çalışma modu vardır. Birinci mod, gerçek zamanla ilerleyen ve makine sinyalinin olasılıksal geçişlerle (çalışma–bekleme gibi) değiştirildiği veri üretim modudur. Bu mod, sistemin genel dayanıklılığını ve ekranların live data altında davranışını gözlemlemek için uygundur. İkinci mod ise shift window üzerinde hızlandırılmış biçimde çalışan vardiya simülasyonudur; burada amaç, bir vardiyanın kısa sürede oynatılarak raporlama ve metrik hesaplarının uçtan uca sınanabilmesidir. Vardiya simülasyonunda tekrarlanabilirlik ön planda tutulduğundan, aynı koşullarda benzer örüntülerin üretilebilmesi hedeflenir.

Üretim simülasyonu (job simulation), telemetry sinyali “çalışıyor” durumundayken üretim olayları üretir ve bu üretimi parça tanımındaki ideal cycle time etrafında değişkenlik gösterecek biçimde modeller. Buradaki değişkenlik, sahadaki doğal dalgalanmayı temsil etmek üzere ideal cycle time etrafında üçgen (triangular) dağılım benzeri bir örnekleme ile ele alınır; ayrıca belirli bir defect rate üzerinden hatalı üretim olayları da oluşturulur. Bu sayede OEE gibi metriklerde yalnızca duruşların değil, hız ve kalite kayıplarının da simülasyon senaryosuna yansıtılması mümkün olur. Üretilen toplam miktar, hedeflenen üretim adedini aşmayacak şekilde sınırlandırılarak senaryonun “kontrollü” kalması sağlanır.

Operasyonel güvenilirlik açısından, telemetry üreten modların aynı anda çalıştırılmaması önemli bir tasarım kısıtıdır. Aksi durumda aynı makine için birden fazla kaynaktan sinyal üretilmesi, sistemde çelişkili durumlara yol açabilir. Benzer biçimde üretim simülasyonu, telemetry kaynağına bağımlı olduğu için, önce telemetry akışının başlatılması beklenir. Bu bağımlılıkların açık biçimde yönetilmesi, simülasyonun diğer modüllere “gerçekçi ama kontrollü” veri sağlaması açısından kritik görülmüştür.

**Görsel Önerileri**

- Şekil 4.8 (genel): Simülasyon mimarisi (simülasyon saati → telemetry üretimi → üretim olayları → raporlama akışı)
- Şekil 4.9 (genel): Gerçek zaman / simülasyon zamanı eşlemesi (shift window'un hızlandırılmış oynatımı)
- Resim 4.29: Simülasyonlar ekranı (durum kartları ve genel görünüm)
- Resim 4.30: Simülasyon kontrolü kapalı uyarısı (yetkilendirme/ortam kısıtı görünümü)
- Resim 4.31: Vardiya simülasyonu reset onayı (veri temizleme uyarısı)
- Resim 4.32: Log konsolu (canlı akış, sekmeler)
- Resim 4.33: Log kontrol anahtarları (canlı/auto-scroll davranışı)

## 4.7 AI Destekli Analiz Modülü

AI destekli analiz modülü, raporlama çıktılarının yorumlanabilirliğini artırmak ve kullanıcıya karar destek niteliğinde özetler sunmak amacıyla sisteme eklenmiştir. Bu modülün odağında “otomatik karar verme” değil; kullanıcıya mevcut verinin kısa bir özetini, öne çıkan bulguları ve uygulanabilir aksiyon önerilerini tutarlı bir formatta sunmak yer alır. Dolayısıyla üretilen içerikler, kullanıcı arayüzünde açık biçimde “analiz çıktısı” olarak konumlandırılmış ve kullanıcı onayı olmadan iş akışını değiştiren bir otomasyon kurgulanmamıştır.

Modül, belirli use case'ler etrafında tasarlanmıştır. Her senaryoda analiz; sistemin zaten ürettiği metriklerin, seçilen time window ve veri kaynağı bağlamında derlenmesiyle başlar; ardından elde edilen özet veri, metin üretim modeli ile yapılandırılmış bir çıktıya dönüştürülür. Bu yapı, aynı altyapının farklı modüllerde (ör. raporlar ve duruş analizi) yeniden kullanılabilmesini ve analiz çıktılarının tek bir merkezden izlenebilmesini sağlar.

### 4.7.1 LLM Entegrasyonu

Bu projede LLM entegrasyonu, sunucu tarafında merkezi bir servis yaklaşımı ile ele alınmıştır. Analiz talebi geldiğinde sistem, ilgili ekranın bağlamına uygun şekilde gerekli metrikleri ve özet verileri hazırlar; modelden ise serbest metin yerine önceden tanımlı bir JSON şemasına uyan çıktı bekler. Böylece kullanıcı arayüzünde özet, bulgular, aksiyonlar ve uyarılar gibi alanlar tutarlı bir biçimde gösterilebilir; ayrıca farklı analiz türleri arasında ortak bir sunum dili korunur.

Operasyonel açıdan iki mekanizma öne çıkar. Birincisi, aynı snapshot için tekrarlı model çağrılarını azaltmak üzere caching yaklaşımıdır; ikincisi ise kullanımın kontrol altında tutulması için rate limiting ve gözlemlenebilirlik amaçlı usage logging yaklaşımıdır. Bu sayede analiz talebi hem yönetilebilir bir maliyet profili içinde kalır hem de kullanıcı “yeniden analiz” gibi kontrollü aksiyonlarla çıktıyı güncelleyebilir. Ayrıca OEE analizlerinde, veri değiştiğinde mevcut analizin eski olabileceğini işaretleyen bir stale check bulunur; böylece kullanıcıya yeniden analiz önerisi sunulabilir.

LLM entegrasyonunun kullanıcı tarafındaki karşılığı, merkezi bir “AI Asistanı” sayfasıdır. Bu sayfada use case'ler card'lar halinde özetlenir ve geçmiş analizler filtrelenebilir bir liste üzerinden incelenebilir. Böylece AI çıktıları, tek bir modüle gömülü kalmak yerine, sistem genelinde izlenebilir bir yardımcı katman olarak konumlandırılmıştır.

Not olarak, canlı izleme için “anomaly risk” türünde bir analiz prototipi bulunmakla birlikte, bu senaryo henüz tamamlanmış bir ürünleşme kapsamına alınmamış ve ana anlatımda değerlendirme dışı tutulmuştur.

### 4.7.2 OEE Insight Özelliği (U1)

OEE Insight özelliği, rapor ekranında hesaplanan OEE metriklerinin kullanıcı tarafından daha hızlı yorumlanabilmesini amaçlar. Kullanıcı, makine ve time window seçiminden sonra AI analizini tetikleyerek, OEE’nin hangi bileşenlerden etkilendiğini, hangi loss type'ların baskın olduğunu ve hangi aksiyonların önceliklendirilebileceğini özetleyen bir çıktı elde eder. Bu çıktı; kısa bir özet, birkaç madde halinde öne çıkan bulgular, uygulanabilir aksiyon önerileri ve gerektiğinde uyarılar şeklinde yapılandırılmıştır.

Bu özellikte iki kullanım biçimi bulunmaktadır. “Analiz Et” aksiyonu, uygun olduğunda cache'den faydalanarak hızlı bir geri dönüş sunmayı hedefler. “Yeniden Analiz” aksiyonu ise, kullanıcı isteğiyle cache'i bypass ederek güncel veri ile yeni bir analiz üretir. Ek olarak, rapor verisi değiştiğinde (ör. aynı time window için yeni üretim/duruş verileri oluştuğunda) sistem, mevcut analizin güncelliğini sorgulayarak kullanıcıyı uyarabilir; bu da rapor yorumunun yanlış bağlama taşınmasını azaltmaya yönelik bir önlemdir.

### 4.7.3 Duruş Post-Mortem Analizi (U2)

Bu projede U2 senaryosu, kapatılmış plansız duruş kayıtlarının daha anlamlı biçimde yorumlanabilmesini desteklemek amacıyla eklenmiştir. Bu senaryoda sistem, duruşun seçilmiş nedeni üzerinden “neden tahmini” yapmaz; bunun yerine, kapanmış duruşun öncesi ve duruş süresince gözlemlenen telemetry özetlerini ve son dönem benzer duruş örüntülerini kullanarak kısa bir post-mortem değerlendirme üretir. Böylece kullanıcı, tekil bir kaydı yalnızca “süre” veya “reason” alanlarıyla değil; bağlamsal ipuçları ve tekrar eden örüntüler üzerinden değerlendirebilir.

Uygulama akışında analiz, duruş detay/düzenleme penceresinden tetiklenir ve sonuçlar ayrı bir dialog penceresinde özet, patternlar, aksiyon önerileri ve uyarılar biçiminde sunulur. Veri kalitesini korumak amacıyla açık (kapanmamış) duruşlarda analiz çalıştırılmaz; ayrıca planlı duruşlar veya reason seçilmemiş kayıtlar için analiz devre dışı bırakılır. Bu sınırlar, AI çıktısının yanlış bağlamda yorumlanmasını azaltmaya yönelik bir tasarım tercihidir.

**Görsel Önerileri**

- Şekil 4.10 (genel): AI analiz akışı (metrik/snapshot → analiz servisi → model çıktısı → kayıt + UI sunumu)
- Resim 4.34: AI Asistanı ekranı (use case kartları ve son analizler listesi)
- Resim 4.35: AI Asistanı filtreleri (use case/makine/kaynak/tarih) ve sayfalama görünümü
- Resim 4.36: Raporlar ekranı AI Analizi kartı (Analiz Et / Yeniden Analiz aksiyonları)
- Resim 4.37: OEE Insight çıktısı (özet + bulgular + aksiyonlar + uyarı alanları)
- Resim 4.38: Duruş detay/düzenleme penceresi (AI Analiz aksiyonu)
- Resim 4.39: AI Duruş Analizi diyaloğu (özet + patternlar + aksiyonlar)

## Simgeler ve Kısaltmalar

- A = Availability (Kullanılabilirlik)
- AI = Artificial Intelligence (Yapay Zekâ)
- API = Application Programming Interface (Uygulama Programlama Arayüzü)
- JSON = JavaScript Object Notation (Veri değişim formatı)
- LLM = Large Language Model (Büyük Dil Modeli)
- OEE = Overall Equipment Effectiveness (Toplam Ekipman Etkinliği)
- P = Performance (Performans)
- Q = Quality (Kalite)
- RBAC = Role-Based Access Control (Rol Tabanlı Erişim Kontrolü)
- U1/U2 = Use Case 1/2 (Kullanım Senaryosu)
- accessToken = Access Token (Erişim token'i)
- refreshToken = Refresh Token (Yenileme token'i)

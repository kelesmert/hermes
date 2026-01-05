# 4. UYGULAMA — UI/Ekran ve Bileşen Detayları

Bu doküman, `tez/4-uygulama.md` bölümündeki modül anlatımlarını kullanıcı arayüzü (UI) düzeyinde detaylandırır. Amaç; tezde kullanılacak ekran görüntülerinin hangi bağlamı temsil ettiğini açıklamak ve her ekranın kullanıcıya sunduğu bilgi/aksiyon setini anlaşılır bir şekilde ifade etmektir. Anlatım, kod belgelemesi değildir; ekranların işlevi ve kullanıcı akışı odaklıdır.

## Genel Ekran Düzeni (Uygulama Kabuğu)

Giriş ekranı haricinde uygulama, sol tarafta modüllere erişim sağlayan bir navigasyon menüsü ve üstte kullanıcı oturumu bilgilerini taşıyan bir header ile çalışır. İçerik alanında breadcrumbs kullanılarak kullanıcının uygulama içindeki konumu görünür kılınır. Bu kabuk yapı, rol ve izinlere bağlı olarak menü öğelerinin değişebilmesine rağmen, ekranların yerleşimini tutarlı tutmayı hedefler.

---

## 4.1 Kullanıcı ve Erişim Yönetimi Modülü — UI Detayları

### Giriş Ekranı

Giriş ekranı, kullanıcıyı uygulama kabuğu açılmadan önce kimlik doğrulama akışına yönlendirir. Ekranda kullanıcı adı ve şifre alanları ile birlikte bir giriş butonu yer alır; form alanlarında doğrulama hatası oluştuğunda ilgili alanın altında açıklayıcı yardımcı metin gösterilir. Giriş işlemi başlatıldığında buton üzerinde yüklenme durumu görünür olur; başarısız denemelerde ise kullanıcı, hata mesajı ile bilgilendirilir. Bu tasarım, kullanıcıdan beklenen minimum bilgiyi net biçimde tanımlayarak ilk temas noktasında belirsizliği azaltmayı amaçlar.

### Kullanıcılar Sekmesi (Liste)

Kullanıcı yönetimi ekranı, sistemdeki kullanıcıların tek bir tablo üzerinde listelenmesini sağlar. Tablo satırlarında kullanıcının ad-soyad ve kullanıcı adı bilgileri birlikte sunulur; kullanıcı birden fazla role sahipse roller chip’ler ile görselleştirilir. Liste üzerinde arama alanı kullanılarak isim/kullanıcı adı/e-posta üzerinden filtreleme yapılabilir. Kullanıcının aktif/pasif durumu bir anahtar (switch) üzerinden yönetilir; satır bazlı aksiyonlar (düzenleme/silme) ise ikon butonlarla verilir. Kayıt bulunmadığında veya arama sonucu boş geldiğinde, ekran kullanıcıyı “veri yok” durumuna uygun bir metinle yönlendirir.

### Kullanıcı Formu (Oluşturma/Düzenleme)

Kullanıcı formu bir dialog içerisinde açılır ve temel kimlik alanları (kullanıcı adı, ad, soyad, e-posta) ile parola alanını içerir. Düzenleme senaryosunda parolanın boş bırakılması halinde şifre değişikliğinin yapılmadığı bilgisi kullanıcıya iletilir. Rol ataması çoklu seçim (multi-select) şeklinde tasarlanmıştır; böylece aynı kullanıcıya birden fazla rol atanabilir. Ayrıca “aktif” anahtarı ile hesabın devre dışı bırakılabilmesi, yönetimsel operasyonların geri döndürülebilir ve kontrollü yürütülmesine hizmet eder.

### Roller & İzinler Sekmesi

Rol yönetimi ekranında her rol, kart yapısı içinde kısa açıklama ve yetkilerin özetini taşıyacak biçimde sunulur. Rol üzerindeki izinler, ekranda chip’ler üzerinden bir “hızlı görünüm” olarak verilir; izin sayısı fazla olduğunda “+N izin” benzeri bir özet kullanılarak görsel yoğunluk kontrol altında tutulur. Rol oluşturma/düzenleme işlemleri dialog üzerinden yürütülür; kritik roller için silme aksiyonunun kısıtlanması, yanlış yapılandırma riskini azaltmaya yönelik bir güvenlik tedbiri olarak değerlendirilir.

### Rol Formu (Yetki Matrisi Mantığı)

Rol formu; rolün görünen adı, açıklaması ve “varsayılan rol” gibi yönetimsel niteliklerini içerir. İzin seçim alanı, izinleri kategori bazlı gruplandırarak checkbox’lar üzerinden seçim yapılmasına olanak tanır. Bu tasarım, çok sayıda iznin olduğu senaryolarda kullanıcıyı tek bir uzun listede kaybetmek yerine, anlamlı kümeler üzerinden karar vermeye yönlendirir.

**Görsel Önerileri**

- Giriş formu (başarılı giriş ve doğrulama hatası örneği)
- Kullanıcı listesi (arama + rol chip’leri + aktif/pasif anahtarı)
- Kullanıcı oluşturma/düzenleme dialog’u (rol ataması ve parola davranışı)
- Rol kartları görünümü (izin özet chip’leri)
- Rol oluşturma/düzenleme dialog’u (kategori bazlı izin seçimi)

---

## 4.2 Makine Yönetimi Modülü — UI Detayları

### Makine Listesi

Makine listesi ekranı, üretim ortamında takip edilen ekipmanı tablo üzerinde görünür kılar. Tablo; makine kodu, makine adı, durum, son değişiklik zamanı, etiketler ve aktiflik bilgilerini birlikte sunar. Durum alanı chip ile vurgulanır; chip altında “son değişiklik” bilgisinin göreli zaman ifadesiyle verilmesi, kullanıcının “ne kadar süredir bu durumda?” sorusuna hızlı yanıt üretir. Ekran üst aksiyonları üzerinden liste yenilenebilir ve yeni makine tanımı başlatılabilir; satır bazında ise düzenleme, silme ve durum kayıtlarına erişim gibi işlemler ikonlarla sağlanır.

### Makine Formu (Oluşturma/Düzenleme)

Makine tanımlama dialog’u, kod ve ad gibi temel kimlik alanlarını zorunlu tutar; etiketler, virgülle ayrılmış bir giriş modeliyle çoklu değer kabul eder. Sorumlu kullanıcı alanı, ilgili makinenin operasyonel sahipliğini veya takip sorumluluğunu tanımlamak için kullanılır. Düzenleme senaryosunda makine kodunun değiştirilememesi, referans bütünlüğünü korumaya yönelik bir tasarım tercihi olarak okunabilir.

### Durum Kayıtları (Event) Diyaloğu

Durum kayıtları ekranı, seçili makine için geçmişte girilmiş durum değişimlerinin listelendiği bir dialog olarak çalışır. Yetkili kullanıcılarda aynı dialog içinde yeni bir durum kaydı ekleme formu bulunur; burada durum seçimi, isteğe bağlı başlangıç zamanı ve açıklayıcı alanlar ile kayıt oluşturulur. Alt bölümde son kayıtların zaman bilgileriyle gösterilmesi, geriye dönük izlenebilirliği güçlendirir ve “makine hangi aralıkta ne yaşadı?” sorusunu ekran üzerinden cevaplanabilir hale getirir.

### Canlı İzleme (Monitoring)

Canlı izleme ekranı, tek bir makine bağlamında telemetry verilerini ve temel durum özetlerini birlikte sunar. Üst bölümde kaynak (source) ve makine seçimi yapılır; seçime bağlı olarak sayfadaki kartlar ve grafikler güncellenir. “Anlık Durum” kartı, seçili pencereye ilişkin özet metrikleri (ör. ortalama değerler) ve son sinyal bilgisini verir. Grafik alanında ise sinyal ve sayısal telemetry metrikleri time series olarak gösterilir; bu sayede kullanıcı, anlık değerler ile zaman içindeki değişimi aynı ekranda birlikte değerlendirebilir. Ekranda ayrıca “anomali riski” için bir uyarı bandı yer alır; risk tespit edildiğinde özet bilgi sunulur ve detay dialog’u üzerinden etkilenmiş metrikler ile önerilen aksiyonlar görüntülenebilir.

**Görsel Önerileri**

- Makine listesi (durum chip’i + etiketler + aktiflik anahtarı)
- Makine oluşturma/düzenleme dialog’u (sorumlu kullanıcı ve etiket alanları)
- Durum kayıtları dialog’u (kayıt listesi ve yeni kayıt ekleme formu)
- Canlı izleme ekranı (seçim kontrolleri + özet kart + telemetry grafikleri)
- Anomali riski uyarı bandı ve detay dialog’u (risk seviyesi ve etkilenen metrikler)

---

## 4.3 Üretim Takibi Modülü — UI Detayları

### Parçalar Ekranı

Parçalar ekranı, üretimde takip edilecek ürün/yarı mamul tanımlarının tablo halinde yönetildiği bir arayüz sunar. Listede parça kodu ve adıyla birlikte kategori, birim, ideal çevrim süresi, etiketler ve uyumlu makineler gibi karar destek alanları yer alır. “Varsayılan ayarlar” bölümü, kategoriye bağlı parametrelerin parça üzerinde standartlaştırılmasını sağlayarak iş emri oluşturma sürecinde tutarlı bir başlangıç noktası oluşturur. Liste boşsa kullanıcı, parça kaydı bulunmadığı bilgisiyle yönlendirilir; yönetim yetkisi olan kullanıcılar için oluşturma/düzenleme/silme aksiyonları görünür olur.

### Parça Formu (Kategoriye Göre Alanlar)

Parça oluşturma/düzenleme dialog’u, temel kimlik alanlarının yanında kategori, birim ve ideal çevrim süresi gibi üretim hesabını etkileyen alanları zorunlu kılar. “Uyumlu makineler” çoklu seçim ile belirlenir; böylece parça–makine eşleşmesi iş emri oluşturma sırasında kısıtlanabilir. Formun alt bölümünde kategoriye göre değişen “varsayılan makine ayarları” alanları yer alır; bu yaklaşım, tüm parçalar için tek tip bir form yerine, anlamlı parametreleri bağlama göre sunarak kullanıcı yükünü azaltmayı hedefler.

### İş Emirleri Ekranı (Liste + Aksiyonlar)

İş emirleri ekranı, üretimin planlama ve yürütüm adımlarını tek bir tablo üzerinden izlenebilir hale getirir. Satırlarda parça, makine ve sorumlu operatör bilgileri ile birlikte iş emrinin durumu chip ile vurgulanır; hedef üretim miktarı ile gerçekleşen üretim miktarı aynı blok içinde karşılaştırmalı gösterilir. Ekran, iş emrinin yaşam döngüsüne göre değişen aksiyonlar sunar: başlatma, devam ettirme, üretim kaydı girme, tamamlama ve iptal etme işlemleri ikonlar üzerinden tetiklenir. Üretim kaydı akışında kullanıcıdan miktar ve ürün durumu bilgisi alınır; hatalı (defective) kayıtlar için hata tipi seçimi ek bir alan olarak açılarak veri kalitesi korunur. Duruş yönetimi ihtiyacı ise iş emri ekranında ayrı bir “duruşlar” aksiyonu ile ele alınır ve kullanıcı ilgili duruş ekranına yönlendirilir.

### İş Emri Formu (Oluşturma/Düzenleme)

İş emri formu, parça–makine eşleşmesini seçilebilir alanlar üzerinden kurar; parça seçimine bağlı olarak makine seçeneklerinin kısıtlanması, hatalı eşleşmeleri önlemeye yardımcı olur. Hedef miktar, üretimin ölçülebilir hedefini tanımlarken; notlar alanı operasyona ilişkin bağlam bilgisinin kayda alınmasını sağlar. Formda ideal çevrim süresinin ayrıca gösterilmesi, planlama sırasında hız varsayımının görünür olmasına katkı verir.

### İş Emri Olay Geçmişi

İş emri olay geçmişi dialog’u, iş emri üzerinde gerçekleşen aksiyonların zaman çizelgesi şeklinde izlenmesini sağlar. Olaylar; tür bilgisini taşıyan bir chip, zaman damgası ve ilgili miktar/not alanları ile listelenir. Bu ekran, üretim akışında “hangi adım ne zaman gerçekleşti?” sorusunu kullanıcı açısından doğrulanabilir kılar ve sonradan yapılacak analizler için iz bırakır.

### Üretim Panosu (Board)

Üretim panosu, uygulama açılışında operasyonun genel fotoğrafını sunan özet ekrandır. Üst bölümde source ve shift tarihi gibi bağlam seçimleri yer alır; pencerenin başlangıç/bitiş ve “as-of” bilgisi ekranda ayrıca gösterilerek metriklerin hangi zaman dilimine ait olduğu netleştirilir. Orta bölümde KPI kartları ve durum dağılımı grafiği ile makinelerin running/downtime/idle/unknown kırılımı hızlı okunabilir hale getirilir. Alt bölümdeki “Duruşlar” tablosu, kayıtları süreye göre sıralı ve arama destekli biçimde sunar; açık duruşlar görsel olarak vurgulanır. “Makineler” tablosu ise makine bazında as-of durum, açık duruş süresi ve son telemetry zamanı gibi alanlarla, kullanıcının detay ekranlara geçmeden önce odak noktalarını belirlemesini sağlar.

**Görsel Önerileri**

- Parça listesi (kategori, ideal çevrim süresi, uyumlu makineler ve varsayılan ayarlar)
- Parça oluşturma/düzenleme dialog’u (kategoriye bağlı alanlar)
- İş emri listesi (durum chip’leri ve hedef/gerçekleşen üretim karşılaştırması)
- Üretim kaydı dialog’u (good/defective seçimi ve defect type alanı)
- İş emri olay geçmişi dialog’u (zaman damgası ve olay türleri)
- Üretim panosu (KPI kartları + durum dağılımı + duruşlar/makineler tabloları)

---

## 4.4 OEE Hesaplama ve Raporlama Modülü — UI Detayları

### OEE Raporu Filtre Paneli

OEE rapor ekranı, hesaplamanın bağlamını kuran bir filtre paneli ile başlar. Kullanıcı makine seçimi yapar ve iki moddan birini seçerek ilerler: shift bazlı inceleme veya tarih aralığı bazlı inceleme. Ek olarak, kullanılan veri kaynağı (source) seçimi ile raporun hangi veri seti üzerinden üretileceği belirlenir. Bu panelin ana hedefi, rapor çıktılarının yanlış zaman penceresi veya yanlış kaynakla yorumlanmasını önlemektir.

### Operatör Performansı Tablosu

Operatör performansı bölümü, seçili pencere için operatör bazlı OEE ve alt bileşenlerin (Availability/Performance/Quality) karşılaştırmasını tablo halinde sunar. Tablo; planlı süre, çalışma süresi ve üretim adetleri gibi alanları birlikte göstererek yalnızca oranları değil, oranların dayandığı hacmi de görünür kılar. Operatör verisi bulunmadığında ekran, “veri yok” durumunu açık biçimde ifade ederek kullanıcıyı yanıltıcı boş görselleştirmelerden kaçınır.

### OEE Özeti

OEE özeti bölümü, metrikleri kartlar üzerinden okunabilir hale getirir: OEE ve A/P/Q bileşenleri ayrı kartlarda yer alır. Alt kısımda planlı süre, çalışma süresi ve good/defect üretim adetleri gibi yardımcı metrikler sunulur; ayrıca kullanılan pencerenin başlangıç-bitiş zamanları ekranda gösterilerek metriklerin bağlamı netleştirilir. Bu tasarım, bir metrik değerini tek başına yorumlamak yerine, değerlerin dayandığı operasyonel bağlamı aynı ekranda vermeyi amaçlar.

### AI Analizi (U1)

OEE rapor ekranında ayrıca bir “AI Analizi” kartı bulunur. Bu kart, seçili makine ve pencere için üretilen bir özet, öne çıkan bulgular ve önerilen aksiyonlar gibi çıktıları metin formatında sunar. Kullanıcı, “Analiz Et” ve “Yeniden Analiz” butonları ile çıktıyı talep edebilir; cache kullanımı, prompt sürümü ve “stale” olma durumu chip/uyarı yapılarıyla görünür kılınır. Böylece kullanıcı, yalnızca analiz sonucunu değil, analiz sonucunun güncelliğini ve güvenilirliğini etkileyen bağlamı da değerlendirebilir.

### OEE Trend

Trend bölümü, OEE ve alt bileşenlerin zaman içindeki değişimini line chart üzerinden gösterir. Kullanıcı haftalık/aylık gibi bir periyot seçerek trend penceresini belirler; ekranda coverage bilgisi ayrıca verilerek, seçilen pencerede kaç gün için hesap yapılabildiği açıkça ifade edilir. Trend grafiğinin bileşenleri aynı eksen üzerinde gösterilerek, değişimin kaynağı (Availability mi düşmüş, Performance mı gerilemiş vb.) görsel olarak ayırt edilebilir hale gelir.

**Görsel Önerileri**

- OEE rapor filtre paneli (mode ve source seçimleri)
- Operatör performansı tablosu (A/P/Q/OEE ve hacim metrikleri)
- OEE özet kartları + pencere bilgisi
- AI Analizi kartı (özet + aksiyonlar + stale uyarısı örneği)
- OEE Trend (coverage bilgisi ve line chart görünümü)

---

## 4.5 Duruş Yönetimi Modülü — UI Detayları

### Üst Filtre ve Tab Yapısı

Duruş yönetimi ekranı, aynı sayfa üzerinde farklı ihtiyaçları kapsamak üzere tab yapısı ile tasarlanmıştır. Üstte yer alan makine filtresi, ekranı belirli bir makine bağlamında daraltmaya imkân verir; filtre aktifken ekranda bir chip ile görünür kılınır ve tek tıkla temizlenebilir. Ana tab’lar “açık duruşlar”, “planlı duruşlar” ve “geçmiş” görünümünü ayırır; planlı duruşlar sekmesi içinde ayrıca “kurallar” ve “run geçmişi” alt tab’ları yer alır. Bu hiyerarşi, operasyonel anlık müdahale ile yönetimsel planlama/raporlama ihtiyaçlarını karıştırmadan aynı modül içinde sunmayı amaçlar.

### Açık Duruşlar (Operasyonel Takip)

“Açık duruşlar” tab’ında, henüz kapanmamış duruş kayıtları listelenir. Kullanıcı, manuel olarak plansız duruş başlatma dialog’unu açabilir ve ilgili makine için reason seçerek kaydı başlatabilir. Liste tablosunda makine, başlangıç zamanı, reason ve ilişkilendirilmiş iş emri bilgisi birlikte gösterilir; satır bazındaki “sınıflandır” aksiyonu, duruş kaydının reason ve not ile zenginleştirilmesini sağlar. Bu ekran, duruşların “gerçek zamanlı kayıt” ihtiyacına odaklanır.

### Planlı Duruş Kuralları (Yönetim)

Planlı duruşlar, kural tanımı üzerinden yönetilir. “Kurallar” alt tab’ında her kural; ad, tip (günlük tekrar veya tek sefer), reason, kapsamındaki makine sayısı ve aktiflik durumu ile listelenir. Yönetim yetkisi olan kullanıcılar yeni plan oluşturabilir, mevcut planı düzenleyebilir veya silebilir. “Öncelik” ve “aktif” gibi alanların görünür olması, çakışan planların kontrol edilebilir bir şekilde yönetilmesini hedefler.

### Planlı Duruş Run Geçmişi (İzlenebilirlik)

Planlı duruşların sahada nasıl çalıştırıldığını izlemek için “run geçmişi” alt tab’ı kullanılır. Bu bölümde zaman aralığı ve durum (status) filtreleri yer alır; liste tablosu, seçili aralıkta hangi makinede hangi planın hangi zaman penceresiyle çalıştığını ve run sonucunu gösterir. “Scheduled/Started/Ended/Skipped” gibi durum etiketleri, planın fiili yürütümünün izlenebilir olmasını sağlar.

### Geçmiş Duruşlar (Analiz ve Düzeltme)

“Geçmiş” tab’ı, kapanmış duruşların analiz ve veri kalitesi yönetimine odaklanır. Tarih aralığı, kategori (planned/unplanned) ve reason filtreleri ile kullanıcı ilgili kayıtları daraltabilir. Liste tablosunda reason, kategoriye göre renklendirilmiş chip ile gösterilir; bazı kayıtlar için “onay bekliyor/onaylandı” gibi durum chip’leri görünür olabilir. Satır bazında, kısa bir düzeltme penceresi içinde kalan kayıtlar için düzeltme aksiyonu sunulur; kapanmış kayıtlar için ayrıca AI analiz dialog’u açılabilir. Bu ekran, geçmiş verinin “tekrar yorumlanabilir ve güvenilir” kalmasını destekleyen araçları bir araya getirir.

### Duruş Düzenleme/Sınıflandırma Diyaloğu

Duruş düzenleme dialog’u, seçili duruş kaydının makine bilgisi ve süresini özetleyerek başlar; ardından reason seçimi ve not alanı ile kayıt zenginleştirilir. Düzeltme mantığı, veri bütünlüğünü korumak üzere kontrollü tasarlanmıştır: kısa düzeltme penceresi içinde kayıt doğrudan güncellenebilir; bu pencere aşıldığında ise açık duruşlarda “split” yaklaşımıyla reason değişimi yapılır, kapanmış kayıtların kontrolsüz değiştirilmesi ise engellenir. Diyalog üzerinde AI analiz açma aksiyonunun yer alması, özellikle plansız duruşların post-mortem değerlendirmesine hızlı geçiş imkânı sağlar.

### AI Duruş Analizi (U2)

AI duruş analizi diyaloğu, kapanmış plansız duruşlar için özet, pattern ve önerilen aksiyonları metin tabanlı bir çıktı olarak sunar. Duruş kapanmamışsa veya reason seçilmemişse sistem, analizin neden üretilemediğini açıklayan bir uyarı mesajı gösterir. Analiz üretildiğinde çıktı; özet, patternlar, aksiyonlar ve uyarılar şeklinde bölümlenerek kullanıcıya sunulur; gerektiğinde yeniden analiz tetiklenebilir. Bu tasarım, duruş kaydını yalnızca “süre” olarak değil, “iyileştirme girdisi” olarak da değerlendirmeyi hedefler.

**Görsel Önerileri**

- Duruş ekranı üst filtre + tab yapısı (makine filtresi ve sekmeler)
- Açık duruş listesi (sınıflandırma aksiyonu)
- Plansız duruş başlatma dialog’u (machine + reason + not)
- Planlı duruş kuralları listesi (tip, reason, aktiflik ve öncelik)
- Planlı duruş oluşturma/düzenleme dialog’u (günlük tekrar vs tek sefer)
- Run geçmişi tab’ı (status filtreleri ve run tablosu)
- Geçmiş duruş tab’ı (kategori/reason filtreleri ve “onay bekliyor” örneği)
- Duruş düzenleme dialog’u (düzeltme penceresi / split uyarısı)
- AI duruş analizi diyaloğu (özet + aksiyonlar + uyarılar)

---

## 4.6 Simülasyon Sistemi — UI Detayları

### Simülasyon Kontrol Ekranı

Simülasyon ekranı, telemetry ve üretim senaryolarının UI üzerinden yönetilebildiği bir kontrol paneli olarak tasarlanmıştır. Sayfanın üst bölümünde ekranın amacı kısa bir metinle verilir ve kullanıcıya yenileme aksiyonu sağlanır. Kontrol özelliği kapalı olduğunda uyarı bandı gösterilerek, kullanıcının “neden başlatamıyorum?” sorusu proaktif şekilde cevaplanır. Sol tarafta her simülasyon için ayrı bir kart yer alır; kartlar simülasyonun kısa açıklamasını, çalışma durumunu ve PID/başlangıç zamanı/son çıkış kodu gibi teknik özet bilgileri içerir. Kart üzerindeki aksiyonlar (başlat/durdur/reset/log temizle) ile operasyon, terminal gerektirmeden yönetilebilir hale gelir.

Ekranın sağ tarafında log konsolu bulunur. Kullanıcı, canlı log takibini açıp kapatabilir ve auto-scroll davranışını kontrol edebilir. Log’lar simülasyon bazında tab’lar üzerinden ayrılır; karanlık arka plan ve monospaced yazı tipi kullanımı, uzun log akışlarının okunabilirliğini artırmaya yöneliktir. Hata/uyarı benzeri log satırlarının renkle ayrıştırılması, hızlı teşhisi destekleyen bir sunum tercihidir.

**Görsel Önerileri**

- Simülasyon kontrol paneli genel görünüm (kartlar + log konsolu birlikte)
- Kontrol kapalı uyarısı (warning band)
- shift-sim reset onayı (kullanıcı onay penceresi)
- Log konsolu (canlı takip ve auto-scroll anahtarları)

---

## 4.7 AI Destekli Analiz Modülü — UI Detayları

### AI Hub (Merkezi Görünüm)

AI Hub ekranı, uygulama içinde dağınık biçimde yer alan AI use case’lerini tek bir merkezden görünür kılmayı amaçlar. Sayfa üst bölümünde özet metrikler (son günlerdeki analiz sayısı ve kapsanan makine sayısı gibi) kart yapısında sunulur. Orta bölümde use case kartları yer alır; her kart ilgili use case’in kısa açıklamasını, durumunu ve son analiz zamanını gösterir ve kullanıcıyı ilgili sayfaya yönlendirir. Bu yaklaşım, AI özelliklerinin “nerede” ve “hangi amaçla” kullanıldığını kullanıcı açısından daha erişilebilir hale getirir.

Sayfanın alt bölümünde “son analizler” tablosu bulunur. Tablo; use case, makine, source, pencere (window) ve oluşturulma zamanı gibi alanlarla geçmiş kayıtları listeler; filtre paneli üzerinden use case/makine/source ve tarih aralığına göre daraltma yapılabilir. Bazı use case’lerde analiz sonucunun güncelliğini değerlendirmek üzere “stale” kontrolü sunulur; ayrıca kullanıcı, uygun use case’lerde “yeniden analiz” aksiyonu ile aynı bağlam için yeni bir çıktı üretebilir. Böylece AI çıktıları, tek seferlik bir öneri olmaktan çıkarılıp izlenebilir ve tekrar üretilebilir bir yapıya taşınır.

**Görsel Önerileri**

- AI Hub use case kartları (U1/U2/U3 görünümü)
- Son analizler tablosu (filtreler ve “yeniden analiz” aksiyonu)
- Stale kontrolü sonucu (stale/yeni analiz var/güncel chip örneği)

---

## Simgeler ve Kısaltmalar

- AI = Artificial Intelligence
- API = Application Programming Interface
- CRUD = Create, Read, Update, Delete
- KPI = Key Performance Indicator
- UI = User Interface
- UX = User Experience
- JWT = JSON Web Token
- `accessToken` = Access Token
- `refreshToken` = Refresh Token
- RBAC = Role-Based Access Control
- OEE = Overall Equipment Effectiveness
- Availability = Kullanılabilirlik (OEE bileşeni)
- Performance = Performans (OEE bileşeni)
- Quality = Kalite (OEE bileşeni)
- LLM = Large Language Model
- `cache` = Cache (tekrarlanan isteklerde hızlı yanıt amacıyla ara bellek)
- `stale` = Stale (çıktının veri değişimi nedeniyle güncelliğini yitirme durumu)
- `rate limit` = Rate limiting (kota/limit nedeniyle istek sıklığının kısıtlanması)
- `polling` = Polling (belirli aralıklarla veri sorgulama yaklaşımı)
- `time series` = Time series (zaman ekseninde veri görselleştirme)
- `time window` = Time window (hesaplama/görselleştirme penceresi)
- `shift window` = Shift window (vardiya bazlı zaman penceresi)
- `coverage` = Coverage (seçili pencerede hesaplanabilir gün oranı)
- PID = Process Identifier
- ISO = ISO 8601 (tarih-zaman gösterim standardı)


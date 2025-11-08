# Teknoloji Notları

Bu doküman projede kullanılan veya ileride kullanılacak teknolojileri, neden seçildiklerini ve temel görevlerini kayıt altına almak için tutulur. Yeni bağımlılık eklendiğinde ilgili başlık güncellenecektir.

## Backend Bağımlılıkları

### express
- **Neden?** REST tabanlı API geliştirmek için hızlı, geniş ekosistemli bir framework; orta seviye MVC katmanı oluşturmamıza izin veriyor.
- **Görev:** HTTP isteklerini karşılamak, routing mekanizması sağlamak, middleware zinciri oluşturmak.

### cors
- **Neden?** Frontend (React) ile backend farklı portlarda çalışacağından tarayıcı CORS kısıtlarını yönetmek gerekiyor.
- **Görev:** `Access-Control-Allow-*` başlıklarını ayarlayarak hangi origin’lerin API’ye erişebileceğini belirler; kimlik doğrulamada `credentials` desteği sunar.

### dotenv
- **Neden?** Ortam değişkenlerinin `.env` dosyalarından okunması için basit ve yaygın bir çözüm.
- **Görev:** Uygulama başlatılırken `.env` içindeki değerleri `process.env`’e yükler; konfigürasyon yönetimini kolaylaştırır.

### bcryptjs
- **Neden?** Kullanıcı şifrelerini güvenli şekilde hash’lemek için hafif ve saf JavaScript tabanlı bir kütüphane.
- **Görev:** Şifreleri tuzlayarak hash’ler, giriş sırasında gelen şifre ile hash’i karşılaştırır.

### jsonwebtoken
- **Neden?** API erişimini kontrol etmek için JWT tabanlı access token üretimi gerekiyor.
- **Görev:** Kullanıcı kimliğini ve rol bilgisini içeren imzalı access token’lar oluşturur ve doğrular.

### ms
- **Neden?** `15m`, `7d` gibi süre ifadelerini milisaniyeye çevirmeyi kolaylaştırır; token süresi hesaplanırken kullanılır.
- **Görev:** İnsan okunur süreleri sayısal milisaniyeye dönüştürür.

### mongoose
- **Neden?** MongoDB koleksiyonları için şemalar, doğrulama ve hook’lar sağlayarak kullanıcı/makine modellerini düzenli yönetmemize yardım eder.
- **Görev:** ODM (Object Data Modeling) katmanı; modeller tanımlanır, CRUD operasyonları helper metodlarla yapılır, doğrulama ve middleware desteği sunar.

### nodemon (devDependency)
- **Neden?** Geliştirme sırasında dosya değişikliklerinde sunucuyu otomatik yeniden başlatmak için.
- **Görev:** `npm run dev` komutu altında dosya sistemi izlenir, değişiklikte Node süreci restart edilir; üretimde kullanılmaz.

## Genel Not
- Yeni kütüphaneler/araçlar eklendikçe bu dosyaya kısa açıklama ve gerekçe eklenmelidir; böylece tez raporu ve teknik değerlendirme sırasında hangi teknolojinin neden seçildiği kolayca izah edilebilir.

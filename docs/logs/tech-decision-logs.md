# Teknoloji Karar Günlükleri

Bu doküman projede kullanılan veya ileride kullanılacak teknolojileri, neden seçildiklerini ve temel görevlerini kayıt altına almak için tutulur. Yeni bağımlılık eklendiğinde ilgili başlık güncellenecektir.

## Güncelleme Kuralları

**Ne zaman güncellenir:** Yeni npm paketi eklendiğinde, mevcut paket versiyonu güncellendiğinde, teknoloji değiştiğinde.

**Format:**

```markdown
### [paket-adı]

- **Neden?** [Seçim gerekçesi]
- **Görev:** [Ne işe yarıyor]
```

**Önemli:** Her paket için "Neden?" ve "Görev" mutlaka belirtilmeli. Büyük paket değişiklikleri `decision-log.md`'ye de eklenmeli.

---

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

## Frontend Bağımlılıkları

### Vite

- **Neden?** Modern bundle mimarisi, çok hızlı HMR ve düşük konfigürasyonla React projelerini ayağa kaldırmak için ideal.
- **Görev:** React SPA için geliştirme sunucusu ve build pipeline’ı sağlar; `vite.config.js` üzerinden alias/env yönetimi yapılır.

### React

- **Neden?** Bileşen tabanlı UI yaklaşımı, geniş ekosistem ve mevcut ekip tecrübesi.
- **Görev:** SPA arayüzünün temelini oluşturur; MUI, React Router ve diğer kütüphaneler React bileşenleri üzerinden çalışır.

### @mui/material (MUI)

- **Neden?** Zengin bileşen seti, tema sistemi ve kurumsal dashboard’lar için hazır tasarım bileşenleri sağlar.
- **Görev:** Layout, form kontrolleri, tablo/grafik kapsayıcıları ve genel UI elemanlarını sunar.

### React Router v6

- **Neden?** SPA içinde sayfa/rota yönetimini deklaratif şekilde kurmak için modern bir çözüm.
- **Görev:** Auth guard’ları, rol bazlı erişim ve nested layout yapılarının temelini oluşturur.

### @tanstack/react-query

- **Neden?** API verilerini cache’leyip otomatik yeniden fetch, hata/geri deneme, polling gibi ihtiyaçları kutudan çıktığı gibi sağlar.
- **Görev:** Backend API yanıtlarını yönetir; dashboard/makine ekranlarında belirli aralıklarla veri yenileme yapılır.

### axios

- **Neden?** HTTP interceptor desteği, `baseURL` konfigürasyonu ve JSON handling kolaylığı.
- **Görev:** Auth header’ları ekleyip backend ile haberleşir; 401 durumunda yönlendirme gibi merkezi davranışları yönetir.

### React Hook Form + Zod

- **Neden?** Performanslı form yönetimi ve tip güvenli doğrulama şemaları.
- **Görev:** Login formu ve ilerideki filtre/CRUD formları için validation + state kontrolü sağlar.

### @tanstack/react-table

- **Neden?** Kolon, filtre ve sayfalama üzerinde ince kontrol; MUI ile uyumlu render desenleri.
- **Görev:** Rapor, kullanıcı, makine ve audit listelerini esnek şekilde oluşturmak.

### Recharts

- **Neden?** React bileşenleriyle kolay grafik çizimi, dashboard’lar için yeterli özelleştirme.
- **Görev:** Dashboard metrikleri, rapor ekranları ve AI içgörü grafiklerini render etmek.

### react-hot-toast

- **Neden?** Hafif, modern ve özelleştirilebilir bildirimler sunar.
- **Görev:** API başarı/başarısızlık mesajlarını kullanıcıya hızlıca iletmek.

### Zustand (opsiyonel)

- **Neden?** Gerektiğinde global state’i minimum boilerplate ile yönetmek için hafif bir alternatif.
- **Görev:** Auth session veya çapraz bileşen paylaşımlı state ihtiyaçlarında Context’e alternatif olarak kullanılabilir (şimdilik ihtiyaç halinde devreye girecek).

### ESLint + Prettier (planlı)

- **Neden?** Kod stilini standartlaştırmak ve hataları erken yakalamak; ekip içinde aynı formatı korumak.
- **Görev:** `npm run lint` ve `npm run format` komutlarıyla frontend kod tabanını doğrulamak; Vite/React projesi kurulduktan sonra eklenecek.

### Path Alias (`@/`)

- **Neden?** Kökten başlayan import’larla karmaşık relatif yolları (`../../..`) ortadan kaldırmak.
- **Görev:** Hem Vite hem Node tarafında `@/` alias’ı `src/` (veya eşdeğer) klasörüne işaret edecek; örn. `@/features/auth/hooks/use-session`.

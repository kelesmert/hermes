# MES MVP Proje Raporu

## 1. Giriş ve Amaç
Bu doküman, mezuniyet projesi kapsamında geliştirilecek olan hafif bir Manufacturing Execution System (MES) prototipinin teknik zeminini ve uygulama sürecini anlatmak için hazırlanmıştır. Amaç, Node.js/Express tabanlı bir backend, React tabanlı bir frontend ve MongoDB veritabanı ile çalışan; kullanıcı kimlik doğrulaması, rol bazlı yetkilendirme, makine durumu takibi ve temel raporlama fonksiyonlarını içeren bir MVP ortaya koymaktır. Proje gerçek makine verisine bağlı değildir; makine olayları bir simülasyon script’i ile üretilecek ve veritabanına işlenecektir. Bu rapor, tez yazımında referans alınabilecek kararları, mimari yaklaşımları ve ilerleyen aşamalarda yapılacak genişletmeleri kayıt altında tutmayı hedefler.

## 2. Gereksinimler

### 2.1 Fonksiyonel Gereksinimler
- **Kimlik Doğrulama ve RBAC:** Kullanıcılar (Admin, Operator vb.) JWT tabanlı oturum açacak, roller aracılığıyla yetkiler belirlenecek, kullanıcı yönetimi (oluşturma, silme, güncelleme) dinamik olacak.
- **Ana Dashboard:** Giriş sonrası kullanıcı rolüne uygun özet metrikler, makine durum özetleri ve kritik uyarılar tek ekranda listelenecek.
- **Makine İzleme:** Her makinenin çalışma/durma/bekleme durumları, olay geçmişi ve ilgili aksiyonlar (ör. yeniden başlatma, not ekleme) görüntülenecek; veri kaynağı simülasyon script’i olacak.
- **Raporlama ve Analiz:** Makine verimliliği, duruş süreleri gibi toplu metrikleri sağlayan API’ler üretilecek; frontend tarafında filtrelenebilir rapor ekranı ile CSV/Excel dışa aktarma desteklenecek.
- **AI Destekli İçgörü:** Toplanan rapor verileri basit bir analiz modülü (kural tabanlı veya hazır model entegrasyonu) üzerinden işlenerek “en verimli makine” gibi çıkarımlar sunacak.
- **Audit Log:** Kritik kullanıcı aksiyonları ve sistem olayları ayrı bir koleksiyonda saklanacak; ilerleyen adımlarda arayüzden izlenebilecek.

### 2.2 İşlevsel Olmayan Gereksinimler
- **Performans:** Sistem eşzamanlı onlarca kullanıcıyı destekleyecek şekilde tasarlanacak; milyonlarca kayıt hedeflenmediği için standart ölçeklenebilirlik pratikleri yeterli olacak.
- **Güvenlik:** Şifreler hash’lenecek, JWT saklama politikaları belirtilecek, rol bazlı middleware her hassas endpoint’i koruyacak.
- **Denetlenebilirlik:** Audit log altyapısı sayesinde kullanıcı işlemleri izlenebilir olacak; log tasarımı mimari bölümünde detaylandırılacak.
- **Çok Dillilik (Opsiyonel):** Arayüz tek dil (Türkçe) ile başlayacak, ancak bileşen mimarisi ileride çok dilliliğe uyarlanabilecek şekilde modüler tutulacak.
- **Dağıtım:** Öncelikli hedef lokal ortamda çalıştırma; ancak Docker tabanlı basit bir dağıtım senaryosu için dokümantasyon sağlanacak.

## 3. Mimari Tasarım (Taslak)
Bu bölümde backend, frontend, veri tabanı şemaları ve entegrasyon akışları ayrıntılandırılacaktır. (Güncellenecek.)

## 4. Uygulama Aşamaları

### 4.1 Hazırlık
- Proje kuralları, yol haritası ve gereksinim dokümanları oluşturularak kapsam netleştirildi.
- Monorepo yaklaşımı (tek repo içinde `backend/` ve `frontend/` klasörleri) benimsendi.
- Gereksinim detay dokümanı üzerinden roller, fonksiyonel ve işlevsel ihtiyaçlar kayıt altına alındı.
- Kullanılan teknolojilerin gerekçeleri için `docs/technology-notes.md` dokümanı açılarak bağımlılıkların açıklaması yazılmaya başlandı.

### 4.2 Backend İskeleti
- `backend/` klasöründe ayrı bir Node.js projesi başlatıldı (`npm init -y`).
- Express, CORS ve dotenv bağımlılıkları eklendi; nodemon geliştirme süreci için devDependency olarak kurulmuş durumda.
- `.env.example` dosyası ile gerekli ortam değişkenleri listelendi.
- `src/app.js`, `src/server.js` ve `src/routes/health-routes.js` dosyaları oluşturularak temel API iskeleti hazırlandı, `/api/health` uç noktası üzerinden sağlık kontrolü yapılabiliyor.
- Kök `.gitignore` dosyası ile `node_modules/`, `.env` ve benzeri artefaktlar hariç tutuldu.
- MongoDB bağlantısı için Mongoose entegrasyonu yapıldı; `connectDatabase` helper’ı `.env` üzerinden `MONGO_URI` bekliyor ve sunucu başlarken bağlantıyı kuruyor.
- Lokal ortamda `hermes_dev` veritabanı oluşturularak `.env` dosyası ayarlandı; `npm run dev` sonrası `/api/health` isteği ile bağlantı ve servis çalışması doğrulandı.
- Auth altyapısı için kullanıcı, rol ve refresh token şemaları tanımlandı; bcryptjs ile şifre hash’leme, JWT tabanlı access token üretimi ve Mongo’da saklanan refresh token sistemi kuruldu.
- `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout` endpoint’leri eklendi; token yenileme ve iptal akışı servis katmanı üzerinden modüler şekilde yönetiliyor.
- `npm run seed` komutu ile çalıştırılan script, varsayılan rol kayıtlarını ve `.env` üzerinden tanımlanan admin hesabını otomatik oluşturuyor.
- Lokal doğrulama sürecinde `.env` değerleri güncellenip `npm run seed` ve `npm run dev` çalıştırılarak `/api/health` ve `/api/auth/login` (seed edilen admin hesabıyla) test edildi; backend auth katmanının çalıştığı teyit edildi.
- RBAC mimarisi genişletildi: permissions koleksiyonu eklendi, roller permission referansları taşıyor ve kullanıcılar birden fazla rol alabiliyor; seed script’i yeni izin kayıtlarını da oluşturacak şekilde güncellendi.
- JWT doğrulaması yapan `auth-guard` ve izin kontrolü sağlayan `permission-guard` middleware’leri eklendi; `GET /api/users` gibi korunan endpoint’ler yalnızca `users.manage` yetkisi olan kullanıcılara açıldı.

## 5. Test ve Doğrulama (Taslak)
Planlanan birim/entegrasyon testleri ve manuel senaryolar burada toplanacaktır. (Güncellenecek.)

## 6. Sonuç ve Gelecek Çalışmalar (Taslak)
Proje tamamlandığında elde edilen bulgular ve geliştirme önerileri bu bölümde yer alacaktır. (Güncellenecek.)

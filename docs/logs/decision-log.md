# Karar Kaydı (Decision Log)

Bu dosya, projede alınan mimarî ve teknolojik kararları, gerekçelerini ve beklenen etkilerini tek yerde toplar. Tez yazımı veya gelecekteki tartışmalar sırasında “neden böyle yaptık?” sorusuna hızlı cevap vermek için düzenli olarak güncellenecektir.

## Backend Kararları

### Node.js + Express API

- **Karar:** Backend, Node.js + Express üzerinde katmanlı yapı (routes → middleware → controllers → services → models → utils) ile kurulacak.
- **Gerekçe:** Ekibin mevcut tecrübesi, esnek middleware mimarisi, geniş ekosistem ve hafif REST API ihtiyaçlarıyla uyumlu.
- **Etkisi:** Hızlı prototipleme, modüler servis yapısı, Express middleware’leri ile genişletilebilirlik.

### MongoDB + Mongoose

- **Karar:** Tüm kalıcı veri için MongoDB kullanılacak, Mongoose ODM ile şemalar yönetilecek.
- **Gerekçe:** Şema doğrulaması, ilişkiler ve hook desteği sayesinde RBAC/makine/audit verileri kolay yönetiliyor; NoSQL yaklaşımı simülasyon verisi için esnek.
- **Etkisi:** Koleksiyon bazlı tasarım (`users`, `roles`, `permissions`, ileride `machines`, `machine_events` vb.), Mongoose middleware ile doğrulamalar.

### JWT + Refresh Token Akışı

- **Karar:** Access token’lar JWT ile, refresh token’lar MongoDB’de hash’li olarak saklanacak; rotation sırasında eski token revoke edilecek.
- **Gerekçe:** Stateles access token performansı ve merkezi refresh kontrolü arasında denge; sonraki aşamada cookie’ye geçiş planı destekleniyor.
- **Etkisi:** `auth-guard` middleware’i için hızlı doğrulama, refresh token revocation listesiyle güvenli oturum yenileme.

### RBAC Yönetim API’si

- **Karar:** `/api/roles`, `/api/permissions` ve `/api/users` (create/update) uç noktaları eklendi; roller CRUD, izin listesi ve kullanıcı yönetimi tamamen API üzerinden yönetilecek. Rol silmelerinde viewer rolü fallback olarak atanıyor.
- **Gerekçe:** Admin panelinden rol/izin yönetimi yapılabilmesi ve yeni rollerin sonradan eklenebilmesi için dinamik uç noktalara ihtiyaç vardı.
- **Etkisi:** Seed edilen roller (master, supervisor, operator, viewer) üzerine yeni roller eklenebilir; sys kullanıcı mock verileri gözlemleyebilir, admin gerçek kurulum yapabilir.

### Makine Domaini Temel Modeli

- **Karar:** `machines` koleksiyonu için bağımsız bir model oluşturuldu; alanlar `code`, `name`, `status`, `lastEventAt`, `tags`, `isActive` ve otomatik timestamp’lerden oluşuyor. `status` enum değerleri (`running`, `idle`, `downtime`, `maintenance`, `unknown`) merkezi sabit olarak tanımlandı.
- **Gerekçe:** Makine verisini kullanıcı/rol domaininden ayrı yöneterek ileride makine eventleri, simülasyon ve raporlama katmanını üzerine inşa edebilmek.
- **Etkisi:** Backend yeni makine domainine hazır; event modelleri ve API’leri bu şema üzerinde geliştirilecek, frontend dashboard verilerini bu koleksiyondan okuyabilecek.

## Frontend Kararları

### Vite + React (JavaScript) SPA

- **Karar:** Frontend, Vite + React ile SPA olarak kurulacak; başlangıçta JavaScript, ihtiyaç halinde TypeScript’e geçilebilecek.
- **Gerekçe:** Vite’in hızlı HMR’i ve basit konfigürasyonu, React ekosistemiyle uyum, öğrenme eğrisinin düşük olması.
- **Etkisi:** Kısa sürede iskelet çıkarma, component tabanlı yapı, gerekirse TypeScript’e evrilebilecek altyapı.

### MUI + Destekleyici Kütüphaneler

- **Karar:** UI kiti olarak MUI; veri katmanı için React Router v6, TanStack Query, axios; formlar için React Hook Form + Zod; tablolar için TanStack Table + MUI; grafikler için Recharts; bildirimler için react-hot-toast.
- **Gerekçe:** Dashboard odaklı kurumsal UI’ler için hızlı bileşen üretimi, veri çekme/polling için hazır çözüm, formlarda performanslı validasyon, tablo/grafiklerde React-first yaklaşımlar.
- **Etkisi:** Tutarlı tasarım dili, tekrar kullanılabilir component kütüphanesi, polling/tablo/export gereksinimleri için hazır altyapı.

### Uygulama Kabuk Tasarımı

- **Karar:** Sol sidebar + üst header düzeni kullanılacak; sidebar tüm modül menülerini barındıracak, header’da kullanıcı menüsü, genel arama ve notifications dropdown bulunacak. Breadcrumbs her korumalı sayfada zorunlu.
- **Gerekçe:** MES tarzı dashboard’larda kullanıcılar aynı anda birden fazla modüle ulaşmak istiyor; yönetici bilgileri ve bildirimler header’da olmalı; breadcrumb navigasyon izlenebilirlik sağlıyor.
- **Etkisi:** Layout bileşenleri (AppLayout, Sidebar, Header, Breadcrumbs) standart olacak; yeni sayfalar `Outlet` içinde render edilecek; responsive hedefi tablet uyumluluğu ile sınırlı.

### Token Saklama Stratejisi (Geçiş Dönemi)

- **Karar:** Refresh token tarayıcı `localStorage`’ında tutulacak; uygulama her açıldığında `POST /api/auth/refresh` çağrılarak sessiz login sağlanacak. HttpOnly cookie yapısına geçiş opsiyonel olarak değerlendirilecek.
- **Gerekçe:** Kullanıcıların sayfayı yenileyince tekrar login olmasını engellemek; cookie/CSRF geçişine ancak gerçek ihtiyaç oluştuğunda yatırım yapmak.
- **Etkisi:** Session yönetimi Context + custom hook üzerinden devam edecek; ileride gereksinim doğrulanırsa cookie + CSRF kombinasyonu için ayrıca plan yapılacak ve dokümantasyon güncellenecek.

### Import Alias (`@/`)

- **Karar:** Hem frontend (Vite) hem backend (Node) tarafında `@/` alias’ı kök `src/` dizinine işaret edecek.
- **Gerekçe:** Derin klasör yapılarında `../../services/...` gibi yolları azaltıp okunabilirliği artırmak, taşınabilirliği kolaylaştırmak.
- **Etkisi:** Vite config, jsconfig/tsconfig ve backend tarafında `module-alias` benzeri ayarlar yapılacak; tüm importlar alias standardına geçirilecek.

### Durum Yönetimi

- **Karar:** Öncelik Context + custom hook; global karmaşıklık artarsa Zustand devreye alınacak.
- **Gerekçe:** Gereksiz bağımlılık eklememek, ancak gerektiğinde hafif ve test edilebilir bir state yönetimi çözümü hazır tutmak.
- **Etkisi:** Auth/session gibi kritik state’ler önce Context ile çözülecek, ihtiyaç halinde Zustand store’larına taşınabilecek.

### ESLint + Prettier

- **Karar:** Frontend iskeleti kurulduktan hemen sonra ESLint ve Prettier konfigüre edilip `npm run lint` / `npm run format` script’leri eklenecek.
- **Gerekçe:** Kod stilini standartlaştırmak, PR incelemelerini hızlandırmak ve hataları erken yakalamak.
- **Etkisi:** Ortak kural seti dokümante edilecek; VSCode ve CI entegrasyonlarına zemin hazırlayacak.

### Frontend İskeleti (Vite + React)

- **Karar:** Frontend projesi Vite + React (JS) ile kuruldu; `AppProviders` (React Query + MUI Theme + Router + SessionProvider), `AppLayout` (sidebar/header/breadcrumbs), mock login formu ve placeholder dashboard/rapor/kullanıcı sayfaları hazırlandı.
- **Gerekçe:** Backend API’leri tamamlandıkça yalnızca ilgili feature modülleri genişleterek hızlı ilerlemek; layout ve guard yapısını baştan netleştirmek.
- **Etkisi:** Auth oturumu `localStorage` tabanlı `SessionProvider` ile yönetiliyor, izin bazlı guard’lar ve axios client hazır durumda; sonraki adımlar sadece API entegrasyonu ve gerçek veri bağlaması olacak.

### Auth Entegrasyonu (Gerçek API ile)

- **Karar:** Frontend login formu doğrudan `/api/auth/login` endpoint’ine bağlandı; SessionProvider backend yanıtını normalize ederek role string’leri ve izinleri türetiyor. Uygulama açılışında `/api/auth/refresh` çağrısı yapılıyor, logout sırasında `/api/auth/logout` tetikleniyor, axios interceptors 401 durumunda session’ı temizleyip global eventi yayıyor.
- **Gerekçe:** Mock login yerine gerçek kullanıcı oturumunu yönetmek; refresh token rotation ve izin kontrolleriyle tüm korumalı rotalar için altyapıyı hazır hale getirmek.
- **Etkisi:** Login → dashboard, sayfa yenileme, logout gibi akışlar gerçek verilerle çalışıyor; bundan sonra makine/rapor modüllerini API’ye bağlamak için ek bir altyapı ihtiyacı yok.

### RBAC Yönetim UI’sı

- **Karar:** `/api/users` TanStack Table ile bağlandı; kullanıcı oluşturma/düzenleme, rol atama ve aktif/pasif togglesı UI üzerinden yapılabiliyor. Aynı ekranda `roles.manage` iznine sahip kullanıcılar için rol/permission CRUD dialogları mevcut.
- **Gerekçe:** İleride yeni roller/izinler ekleneceği için konfigürasyonun tamamen UI’dan yönetilmesi gerekiyor; ayrıca kullanıcı yönetim ekranının gerçek veriye bağlanması MVP kapsamındaydı.
- **Etkisi:** Adminler yeni roller tanımlayıp izin setlerini kategori bazlı seçebiliyor, rol silme işleminde kullanıcılar otomatik olarak viewer rolüne taşınıyor; SessionProvider backend’den gelen permission listesiyle dinamik guard uygulayabiliyor.

### Backend Domain Yapısı

- **Karar:** Backend kodu domain bazlı klasörlere ayrılacak (örn. `src/domains/auth`, `src/domains/users`, ileride `src/domains/machines`); her domain kendi `models/services/controllers/routes` yapılarına sahip olacak. Ortak kod `src/shared` altında tutulacak.
- **Gerekçe:** Monolit yapıyı düzenli ve ölçeklenebilir tutmak; ileride domain’leri ayrı servislere ayırmak gerekirse taşımayı kolaylaştırmak.
- **Etkisi:** Yeni domain eklerken standart klasör yapısı kullanılacak, `backend/standart/backend-decisions.md` ve `project-guidelines` bu kuralla güncellendi.

## Ortak / Diğer Kararlar

### ENV ve Config Standartları

- **Karar:** Backend ve frontend `.env` dosyaları ayrı yönetilecek; frontend tarafında `VITE_API_URL=http://localhost:5000/api` standart olacak, backend `CLIENT_URL=http://localhost:5173`.
- **Gerekçe:** Monorepo içinde net sorumluluk ayrımı, deployment ortamlarında kolay konfig.
- **Etkisi:** Axios `baseURL` otomatik ayarlanacak; ileride cookie’ye geçişte `withCredentials` sadece konfig ile açılacak.

### Dokümantasyon Disiplini

- **Karar:** Alınan her karar ilgili doc’a (guidelines, requirements, roadmap, learning-guide, decision-log) işlenecek.
- **Gerekçe:** Tez yazımı ve ekip içi bilgi transferinde tutarlılık; geçmiş kararların izlenebilirliği.
- **Etkisi:** Bu dosya merkezî referans olacak; değişiklikler commit mesajlarına ve checklist maddelerine yansıtılacak.

---

Yeni kararlar alındıkça bu dosyaya tarih/başlık/gerekçe formatıyla ekleme yapılmalıdır.
- ### Kullanıcı Adı Bazlı Kimlik Doğrulama

- **Karar:** Kullanıcı girişleri e-posta yerine zorunlu `username` alanı ile yapılacak; e-posta opsiyonel olup sadece bildirim/şifre sıfırlama için saklanacak. Seed script’i admin/sys hesaplarına username tanımlar ve mevcut kullanıcıların eksik username alanlarını doldurur.
- **Gerekçe:** Üretim sahasında kullanıcılar genellikle şirket e-postası kullanmıyor; sade ve benzersiz bir kimlik gerekli.
- **Etkisi:** Auth controller/service, kullanıcı yönetimi ve frontend formlar username üzerinden çalışıyor; yerel depolardaki eski kayıtlar migrasyon ile uyumlu hale getirildi.

### Rol Piramidi ve Yeni Permission Seti

- **Karar:** Varsayılan roller `master > supervisor > operator > viewer` olarak güncellendi; execution ve vardiya yönetimi için yeni permission anahtarları (`work_orders.execute`, `shifts.manage`) eklendi.
- **Gerekçe:** Rol tanımları üretim süreçlerine göre netleştirildi; supervisor operatörleri yönetebilmek, operator ise sadece atanmış istasyonlarda işlem yapabilmek zorunda.
- **Etkisi:** Seed script’i yeni rollerle güncellendi, viewer fallback korundu, frontend fallback haritası ve rol yönetim UI’sı yeni izin kategorilerini gösteriyor.

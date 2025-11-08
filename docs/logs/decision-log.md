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

- **Karar:** Backend HttpOnly cookie yapısı hazır olana kadar refresh token tarayıcı `localStorage`’ında tutulacak; uygulama her açıldığında `POST /api/auth/refresh` çağrılarak sessiz login sağlanacak.
- **Gerekçe:** Kullanıcıların sayfayı yenileyince tekrar login olmasını engellemek; kısa vadede XSS riskini bilerek kabul etmek, uzun vadede cookie/CSRF geçişini planlamak.
- **Etkisi:** Session yönetimi Context + custom hook üzerinden yapılacak; transition tamamlandığında localStorage kullanımı kaldırılacak ve dokümantasyon güncellenecek.

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

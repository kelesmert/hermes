# Proje Kuralları ve Kararlar

## İletişim Kuralları

- Tüm yanıtlar Türkçe olacak.
- Her soruya tek tek cevap verilecek; hiçbir madde atlanmayacak.
- Yapılan ilerlemeler, önemli kararlar ve değişiklikler dokümana veya ilgili kayda eklenerek unutulmaması sağlanacak.
- Asla veri tahmini yapılmayacak; belirsizlik durumunda soru sorulacak ve Merte’den onay alınacak.
- Karar verilmesi gereken konularda her zaman sorgulayıcı olunacak ve netleştirmeden ilerlenmeyecek.
- API testlerinde varsayılan olarak Postman kullanılacak; farklı araçlara geçilmesi gerekirse önceden belirtilmeli.

## Teknoloji ve Mimarî Kararlar

- Backend Node.js + Express ile geliştirilecek.
- Frontend React (tercihen Vite tabanlı) ile kurulacak.
- Veritabanı MongoDB olacak.
- Repo yapısı tek bir monorepo içinde `backend/` ve `frontend/` klasörleri şeklinde organize edilecek.
- MongoDB erişimi için Mongoose ODM kullanılacak.
- Frontend için güncel kararlar:
  - Proje iskeleti Vite + React (SPA) ve JavaScript ile kurulacak; ihtiyaç halinde TypeScript’e geçilecek.
  - UI kiti olarak temel MUI bileşenleri kullanılacak; formlar veya grafiklerde gerektiğinde farklı kütüphaneler tercih edilebilecek.
  - React Router v6 yönlendirme, TanStack Query veri çekme, axios HTTP istemcisi olacak.
  - Formlar React Hook Form + Zod ile yönetilecek; tablolar TanStack Table + MUI, grafikler Recharts ile render edilecek.
  - Bildirimler için react-hot-toast kullanılacak.
  - Refresh token, backend cookie stratejisi tamamlanana kadar geçici olarak `localStorage` içinde saklanacak; uygulama açılışında otomatik `POST /api/auth/refresh` çağrısı yapılacak. HttpOnly cookie yapısı hazırlandığında bu yaklaşım güncellenecek.
  - Tema seçimi ilerleyen aşamada netleştirilecek; hedef hafif ve sade bir görünüm.
  - Durum yönetimi ihtiyaç oldukça belirlenecek; mümkünse Context + custom hook, gerektiğinde Zustand.
  - `VITE_API_URL` ile backend (`http://localhost:5000/api`) adresi konfigüre edilecek; `axios.withCredentials` ilerideki cookie geçişine hazır tutulacak.
- Kodda `@/` import alias’ı kullanılacak; hem frontend’de Vite alias’ı hem de backend’de Node path alias’ı tanımlanacak, böylece `../../` zincirleri yerine `@/services/token-service` gibi okunabilir yollar tercih edilecek.
- Layout kararı: Uygulama kabuğu sol sidebar + üst header kombinasyonundan oluşacak; sidebar tüm modül menülerini barındıracak, header içinde kullanıcı menüsü, genel arama alanı ve bildirim (notifications dropdown) bulunacak. Breadcrumbs zorunlu olacak; mobil tam destek zorunlu değil fakat tablet boyutlarında düzgün görünmesi sağlanacak.
- ESLint ve Prettier iskelet kurulduktan hemen sonra projeye eklenecek; kuralların ve kullanılan komutların dokümantasyonu güncel tutulacak.
- RBAC yapısı `permissions -> roles -> users` şeklinde organize edilecek; her kullanıcı birden fazla role sahip olabilir, roller izin koleksiyonuna referans verir.
- Kimlik doğrulama JWT tabanlı olacak, rol bazlı yetkilendirme (RBAC) zorunlu.
- Makine verisi gerçek cihazlardan değil, simülasyon script’i tarafından üretilecek.
- Audit log altyapısı planın ilerleyen aşamalarında kurulacak.
- Raporlama katmanında verimlilik ve duruş analizleri sağlanacak; AI temelli kısa içgörü üretilmesi hedeflenecek.
- İsimlendirmelerde şirket/proje adı olan “hermes” kullanılacak (örn. `hermes_dev` veritabanı); “mes” etiketi sadece konsepti açıklamak için kullanılacak.
- Token saklama stratejisi: Şimdilik `Authorization: Bearer` başlığı ile gönderilen access token ve `localStorage`’da tutulan refresh token (uygulama yüklenince otomatik `refresh`) kullanılacak; ileride access/refresh token yönetimi HTTP-only, Secure, SameSite cookie’lere taşınacak ve uygun CSRF koruması (örn. double-submit token veya CSRF header) eklenecek.

## Dokümantasyon ve Kayıt

- Her faz tamamlandığında ilgili dokümanlar güncellenecek.
- Karar değişiklikleri bu dosyaya veya ilgili bölümüne eklenerek kayda geçirilecek.
- `docs/project-report.md` tez yazımı için ana referans dokümanı.
- `docs/decision-log.md` projedeki önemli kararları ve gerekçelerini kayıt altına alır; yeni tercihlerin tamamı burada güncellenir.
- `docs/technology-notes.md` kullanılan teknolojilerin neden seçildiğini açıklar; yeni bağımlılıklar eklendikçe güncellenecek.
- `docs/file-overview.md` proje dosyalarının görevlerini özetler.
- `docs/learning-guide.md` öğretici rehber; mimari, auth/RBAC, seed ve doğrulama akışlarını adım adım açıklar.
- `docs/project-checklist.md` tanımlanan görevler chechliste yazılacak.Tamamlanan her adım görev listesinde işaretlenerek güncel durum korunacak.

## Kod Kalitesi ve Tasarım Prensipleri

- Kod yapısı modüler ve DRY olacak; tekrar eden mantıklar ortak helper/service katmanlarına taşınacak.
- Fonksiyon veya dosya davranışı açık değilse kısa yorum satırlarıyla açıklanacak, gereksiz yorum eklenmeyecek.
- İsimlendirme yapılırken (dosya, klasör, env anahtarı vb.) kebab-case (`this-is-kebab-case`) tercih edilecek; mevcut standartların dışına çıkılması gerekiyorsa önce onay alınacak.

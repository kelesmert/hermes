# Proje Kuralları ve Kararlar

## Güncelleme Kuralları

**Ne zaman güncellenir:** Politika seviyesinde kural değiştiğinde, doküman harita güncellemesi gerektiğinde, iletişim kuralları değiştiğinde.

**Format:** Bölüm başlıklarına ekle (örn: ## İletişim Kuralları, ## Doküman Haritası), maddeli liste kullan.

**Önemli:** Bu dosya politika seviyesi kuralları içerir. Teknik kurallar `docs/standart/` altında.

---

## İletişim Kuralları

- Tüm yanıtlar Türkçe olacak.
- Her soruya tek tek cevap verilecek; hiçbir madde atlanmayacak.
- Yapılan ilerlemeler, önemli kararlar ve değişiklikler dokümana veya ilgili kayda eklenerek unutulmaması sağlanacak.
- Asla veri tahmini yapılmayacak; belirsizlik durumunda soru sorulacak ve Merte’den onay alınacak.
- Karar verilmesi gereken konularda her zaman sorgulayıcı olunacak ve netleştirmeden ilerlenmeyecek.
- API testlerinde varsayılan olarak Postman kullanılacak; farklı araçlara geçilmesi gerekirse önceden belirtilmeli.
- `docs/logs/chat-summary.md` güncellenirken eski maddeler silinmeyecek; yeni bilgiler sohbet bağlamına uygun başlık açılarak (örn. "Frontend API") eklenir.

## Teknoloji ve Mimarî Kararlar

- Backend Node.js + Express ile geliştirilecek.
- Frontend React (tercihen Vite tabanlı) ile kurulacak.
- Veritabanı MongoDB olacak.
- Repo yapısı tek bir monorepo içinde `backend/` ve `frontend/` klasörleri şeklinde organize edilecek.
- MongoDB erişimi için Mongoose ODM kullanılacak; backend kodu domain bazlı klasör yapısına (örn. `src/domains/auth`, `src/domains/users` vb.) göre organize edilecek.
- Frontend için güncel kararlar:
  - Proje iskeleti Vite + React (SPA) ve JavaScript ile kurulacak; ihtiyaç halinde TypeScript’e geçilecek.
  - UI kiti olarak temel MUI bileşenleri kullanılacak; formlar veya grafiklerde gerektiğinde farklı kütüphaneler tercih edilebilecek.
  - React Router v7 yönlendirme, TanStack Query veri çekme, axios HTTP istemcisi olacak.
  - Formlar React Hook Form + Zod ile yönetilecek; tablolar TanStack Table + MUI, grafikler Recharts ile render edilecek.
  - Bildirimler için react-hot-toast kullanılacak.
- Refresh token şimdilik `localStorage` içinde saklanacak ve uygulama açılışında otomatik `POST /api/auth/refresh` çağrısı yapılacak; HttpOnly cookie yapısına geçiş opsiyonel olup gereksinim ortaya çıkarsa ayrıca planlanacak.
- Uygulama girişleri kullanıcı adı + şifre ile yapılır; e-posta adresi opsiyoneldir ve bildirim/şifre sıfırlama gibi senaryolar için saklanır.
  - Tema seçimi ilerleyen aşamada netleştirilecek; hedef hafif ve sade bir görünüm.
  - Durum yönetimi ihtiyaç oldukça belirlenecek; mümkünse Context + custom hook, gerektiğinde Zustand.
  - `VITE_API_URL` ile backend (`http://localhost:5000/api`) adresi konfigüre edilecek; `axios.withCredentials` ilerideki cookie geçişine hazır tutulacak.
  - `src/lib/api/client.js` altındaki axios instance her zaman `VITE_API_URL` değerini `baseURL` olarak kullanır ve tüm frontend API çağrıları bu client üzerinden geçer.
- Kodda `@/` import alias’ı frontend için zorunludur; backend tarafında alias kullanımı opsiyoneldir ve ayrı bir refactor işi olarak değerlendirilir. Bu sayede frontend’de `../../` zincirleri yerine `@/features/...` kullanılır.
- Layout kararı: Uygulama kabuğu sol sidebar + üst header kombinasyonundan oluşacak; sidebar tüm modül menülerini barındıracak, header içinde kullanıcı menüsü, genel arama alanı ve bildirim (notifications dropdown) bulunacak. Breadcrumbs zorunlu olacak; mobil tam destek zorunlu değil fakat tablet boyutlarında düzgün görünmesi sağlanacak.
- ESLint ve Prettier iskelet kurulduktan hemen sonra projeye eklenecek; kuralların ve kullanılan komutların dokümantasyonu güncel tutulacak.
- Frontend iskeleti oluşturuldu: `AppProviders` (QueryClient + MUI Theme + Router + SessionProvider), `AppLayout` (sidebar + header + breadcrumbs), mock login formu ve placeholder dashboard/rapor/kullanıcı sayfaları hazır. Backend API’leri açıldıkça yalnızca ilgili feature modülleri genişletmek yeterli olacak.
- RBAC yapısı `permissions -> roles -> users` şeklinde organize edilecek; her kullanıcı birden fazla role sahip olabilir, roller izin koleksiyonuna referans verir.
- Kimlik doğrulama JWT tabanlı olacak, rol bazlı yetkilendirme (RBAC) zorunlu.
- Makine verisi gerçek cihazlardan değil, simülasyon script’i tarafından üretilecek; parça tanımları `backend/src/domains/parts/constants/part-categories.js` içindeki sabit kategorilere (fasteners, electronics, mechanical_plastics) göre yapılacak ve frontend formu da aynı sözlükten beslenecek. Seed script her seed çalıştırıldığında örnek parçaları bu sözlükten üretir ve env’deki şifreler değişmişse kullanıcı kayıtlarını günceller.
- Audit log altyapısı planın ilerleyen aşamalarında kurulacak.
- Raporlama katmanında verimlilik ve duruş analizleri sağlanacak; AI temelli kısa içgörü üretilmesi hedeflenecek.
- İsimlendirmelerde şirket/proje adı olan “hermes” kullanılacak (örn. `hermes_dev` veritabanı); “mes” etiketi sadece konsepti açıklamak için kullanılacak.
- Token saklama stratejisi: Şimdilik `Authorization: Bearer` başlığı ile gönderilen access token ve `localStorage`’da tutulan refresh token (uygulama yüklenince otomatik `refresh`) kullanılacak; HttpOnly, Secure, SameSite cookie’lere geçiş opsiyonel bir iyileştirme olarak değerlendirilecek ve gerekirse CSRF korumasıyla birlikte ele alınacak.

## Dokümantasyon ve Kayıt

- Her faz tamamlandığında ilgili dokümanlar güncellenecek.
- Karar değişiklikleri bu dosyaya veya ilgili bölümüne eklenerek kayda geçirilecek.
- Standart dosyalar (`docs/standart/*.md`) bağlayıcı kuralları içerir; kod yazmadan önce güncel oldukları doğrulanır.
- Kod değişikliği sonrasında `docs/meta/doc-maintenance.md` içindeki eşleştirmeler takip edilerek güncellenmesi gereken dokümanlar gözden geçirilir.
- Log dosyaları (`docs/logs/*.md`) bilgi amaçlıdır; “neden” sorusunun cevabını verir fakat kural niteliği taşımaz.

### Doküman Haritası

- [project-guidelines.md](project-guidelines.md): Ana rehber (bu dosya); diğer dokümanların yol haritası ve özet kurallar.
- [standart/backend-decisions.md](standart/backend-decisions.md): Backend için zorunlu teknoloji ve mimari kurallar.
- [standart/frontend-decisions.md](standart/frontend-decisions.md): Frontend için zorunlu teknoloji ve component/layout kuralları.
- [standart/technical-decisions.md](standart/technical-decisions.md): DevOps, repo yapısı ve çapraz teknik zorunluluklar.
- [standart/naming-conventions.md](standart/naming-conventions.md): Detaylı isimlendirme kuralları ve örnekleri.
- [logs/decision-log.md](logs/decision-log.md): Alınan kararların gerekçeleri ve beklenen etkileri; günlük niteliğinde.
- [logs/tech-decision-logs.md](logs/tech-decision-logs.md): Kullanılan/planlanan teknolojilerin neden seçildiği; bilgi amaçlı.
- [logs/chat-summary.md](logs/chat-summary.md): **[ESKİ FORMAT - ARTİK KULLANILMIYOR]** Yeni context window için `meta/context-initialization-prompt.md` kullanın.
- [specs/requirements.md](specs/requirements.md): Ürün gereksinimleri, roller, veri modeli ve açık sorular.
- [specs/downtime-design-v2.md](specs/downtime-design-v2.md): Downtime implementasyonu için ana tasarım ve yol haritası.
- [specs/project-report.md](specs/project-report.md): Tez raporu taslağı; mimari ve bulguların akademik anlatımı.
- [specs/project-roadmap.md](specs/project-roadmap.md): Faz planları ve kilometre taşları.
- [tasks/project-checklist.md](tasks/project-checklist.md): Somut görevlerin listesi; tamamlananlar işaretlenir, silinmez.
- [meta/file-overview.md](meta/file-overview.md): Dosya/klasör açıklamaları; hafıza rehberi.
- [meta/learning-guide.md](meta/learning-guide.md): Öğretici rehber; akışların adım adım açıklaması.
- [meta/summary.md](meta/summary.md): Projenin hızlı panoraması; yeni geliştiriciler için ilk okunacak dosya.
- [meta/doc-maintenance.md](meta/doc-maintenance.md): Kod değişikliklerine göre hangi dokümanların güncelleneceğini belirleyen bakım rehberi.
- [meta/context-initialization-prompt.md](meta/context-initialization-prompt.md): **[YENİ - ÖNEMLİ]** Yeni context window başlatma promptu. Proje durumu, domain/feature haritası, cross-domain bağımlılıklar, geliştirme senaryoları ve adım adım hafıza yükleme talimatları. **Yeni bir AI oturumu açıldığında bu dosyayı kullan!**
- `frontend/README.md`: Frontend kurulumu (Vite + React), dizin yapısı ve alias kullanımına dair hızlı rehber.

## Kod Kalitesi ve Tasarım Prensipleri

- Kod yapısı **modüler** olacak ve **DRY (Don't Repeat Yourself)** prensibine uygun geliştirilecektir.  
  Tekrar eden mantıklar, ortak **helper** veya **service** katmanlarına taşınmalıdır.
- Fonksiyon veya dosya davranışı açık değilse **kısa yorum satırları** ile açıklama yapılmalıdır.  
  Gereksiz veya tekrarlayan yorumlar eklenmemelidir.
- Yeni bir **dosya**, **klasör**, **dosya içeriği** veya **kod parçası** oluşturulurken,  
  düzgün ve tutarlı isimlendirme için aşağıdaki doküman incelenmeli ve kurallar uygulanmalıdır:  
  [`docs/standart/naming-conventions.md`](standart/naming-conventions.md)

---

### İsimlendirme Kuralları

1. **Dosya Adları:** `kebab-case` (tüm projede zorunlu)
2. **React Bileşenleri:** `PascalCase` (zorunlu istisna)
3. **Kod İçi:**
   - Fonksiyon / değişken: `camelCase`
   - Sabitler: `UPPER_SNAKE_CASE`
   - Sınıf / Model: `PascalCase`
4. **Env Variables:** `UPPER_SNAKE_CASE`
5. **API URLs:** `kebab-case`

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
- RBAC yapısı `permissions -> roles -> users` şeklinde organize edilecek; her kullanıcı birden fazla role sahip olabilir, roller izin koleksiyonuna referans verir.
- Kimlik doğrulama JWT tabanlı olacak, rol bazlı yetkilendirme (RBAC) zorunlu.
- Makine verisi gerçek cihazlardan değil, simülasyon script’i tarafından üretilecek.
- Audit log altyapısı planın ilerleyen aşamalarında kurulacak.
- Raporlama katmanında verimlilik ve duruş analizleri sağlanacak; AI temelli kısa içgörü üretilmesi hedeflenecek.
- İsimlendirmelerde şirket/proje adı olan “hermes” kullanılacak (örn. `hermes_dev` veritabanı); “mes” etiketi sadece konsepti açıklamak için kullanılacak.
- Token saklama stratejisi: Şimdilik `Authorization: Bearer` başlığı ile gönderilen access token kullanılacak; ileride access/refresh token yönetimi HTTP-only, Secure, SameSite cookie’lere taşınacak ve uygun CSRF koruması (örn. double-submit token veya CSRF header) eklenecek.

## Dokümantasyon ve Kayıt
- `docs/project-report.md` tez yazımı için ana referans dokümanı.
- `docs/technology-notes.md` kullanılan teknolojilerin neden seçildiğini açıklar; yeni bağımlılıklar eklendikçe güncellenecek.
- `docs/file-overview.md` proje dosyalarının görevlerini özetler.
- `docs/learning-guide.md` öğretici rehber; mimari, auth/RBAC, seed ve doğrulama akışlarını adım adım açıklar.
- Her faz tamamlandığında ilgili dokümanlar güncellenecek.
- Karar değişiklikleri bu dosyaya veya ilgili bölümüne eklenerek kayda geçirilecek.
- Tamamlanan her adım görev listesinde (`docs/project-checklist.md`) işaretlenerek güncel durum korunacak.
- Lint/test scriptleri ve konfigürasyon ayarları ilgili proje (backend veya frontend) temel kurulumu tamamlandıktan sonra eklenecek.

## Kod Kalitesi ve Tasarım Prensipleri
- Kod yapısı modüler ve DRY olacak; tekrar eden mantıklar ortak helper/service katmanlarına taşınacak.
- Fonksiyon veya dosya davranışı açık değilse kısa yorum satırlarıyla açıklanacak, gereksiz yorum eklenmeyecek.
- İsimlendirme yapılırken (dosya, klasör, env anahtarı vb.) kebab-case (`this-is-kebab-case`) tercih edilecek; mevcut standartların dışına çıkılması gerekiyorsa önce onay alınacak.

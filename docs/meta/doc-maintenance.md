# Doküman Bakım Rehberi

Bu rehberin amacı, kod tabanında yapılan her değişiklikte hangi dokümanların gözden geçirilmesi ve güncellenmesi gerektiğini netleştirmektir. Yeni bir geliştirme tamamlandığında bu kontrol listesini uygulayarak depo içindeki bilgi kaynağını tutarlı tutabilirsiniz.

## Nasıl Kullanılır?

1. Özelliği tamamladıktan sonra bu dosyayı aç.
2. Yaptığın değişikliğin kapsamına uyan satırları bul (backend, frontend, altyapı, karar vb.).
3. Satırlarda listelenen dokümanları incele ve gerekiyorsa güncelle.
4. Güncellediğin dokümanları commit mesajında ve PR açıklamasında belirt.

> Not: Bir değişiklik birden fazla satırla ilişkili olabilir; hepsini kontrol etmek gerekir.

**Yeni backend domain'i, model veya route eklendi**  
→ `docs/standart/backend-decisions.md`, `docs/logs/decision-log.md`, `docs/meta/file-overview.md`, `docs/meta/learning-guide.md`  
Yeni kurallar → backend-decisions; kalıcı karar → decision-log; yeni dosya → file-overview; akış/guideline → learning-guide.

**Backend'e yeni dosya eklendi (model, service, controller, route, middleware, util, constant, script)**  
→ `docs/meta/file-overview.md`  
Dosya yolunu ve ne yaptığını 1-2 satırda açıkla. Örnekler: "JWT doğrulaması yapar", "Makine telemetry verilerini saklar", "Parça kategorileri enum'ları tutar".

**Backend'de dosya taşındı/bölündü/birleştirildi veya işlevi değişti**  
→ `docs/meta/file-overview.md`, `docs/logs/decision-log.md` (önemli refactor ise)  
Dosyanın yeni konumu, adı veya işlevi file-overview'da güncellenmelidir. Örnek: Bir service 2 ayrı service'e bölündü → her dosyanın güncel işlevi yazılmalı.

**Frontend'e yeni dosya eklendi (feature, page, component, hook, context, lib)**  
→ `docs/meta/file-overview.md`  
Dosya yolunu ve ne yaptığını 1-2 satırda açıkla. Örnekler: "Kullanıcı listesi tablosu", "Canlı telemetry grafikler", "Auth session yönetimi".

**Frontend'de dosya taşındı/bölündü/birleştirildi veya işlevi değişti**  
→ `docs/meta/file-overview.md`, `docs/logs/decision-log.md` (önemli refactor ise)  
Dosyanın yeni konumu, adı veya işlevi file-overview'da güncellenmelidir. Component'ler yeniden organize edildiyse, feature klasör yapısı değiştiyse mutlaka güncellenmelidir.

**Backend konfigürasyonu, env veya seed değerleri değişti**  
→ `backend/README.md`, `backend/.env.example`, `docs/standart/technical-decisions.md`, `docs/meta/learning-guide.md`  
Env anahtarı eklendiğinde hem `.env.example` hem README güncellenmeli.

**Backend davranışında önemli karar/kısıt güncellendi**  
→ `docs/logs/decision-log.md`, `docs/project-guidelines.md` (gerekirse), `docs/tasks/project-checklist.md` (yeni görev varsa)  
Decision-log gerekçeyi içermeli; kalıcı kural olduysa guidelines/standart dosyalarına yansıt.

**Frontend'de yeni feature, sayfa veya paylaşılmış bileşen eklendi**  
→ `docs/standart/frontend-decisions.md`, `docs/logs/decision-log.md`, `docs/meta/file-overview.md`, `docs/meta/learning-guide.md`, `frontend/README.md`  
Yeni bağımlılık/karar → frontend-decisions; kullanıcı akışı → learning-guide; yeni klasör/dosya → file-overview.

**Frontend ortam değişkeni veya build komutu değişti**  
→ `frontend/.env.example`, `frontend/README.md`, `docs/standart/technical-decisions.md`  
`VITE_*` anahtarları mutlaka `.env.example` içinde yer almalı.

**Gereksinimler, kapsam veya roadmap etkilendi**  
→ `docs/specs/requirements.md`, `docs/specs/project-roadmap.md`, `docs/tasks/project-checklist.md`  
Gereksinim değişiklikleri roadmap ve checklist'e yansıtılmalı.

**Herhangi bir görev/feature tamamlandı veya yeni görev/karar eklendi**  
→ `docs/tasks/project-checklist.md`

- Tamamlanan iş varsa: `[ ]` → `[x]` işaretle
- Yeni somut görev kararı alındıysa (kod yaz, endpoint ekle, sayfa yap): İlgili bölüme (Backend/Frontend/Test) ekle, durumuna göre `[ ]` veya `[x]` işaretle
- Araştırma/değerlendirme/alternatif inceleme kararı alındıysa: `[ ] (İleride)` etiketiyle ekle. Örnekler: "MUI alternatifleri değerlendir", "Cookie auth geçişi araştır", "WebSocket real-time desteği incele"
- Teknik borç/iyileştirme kararı alındıysa: `[ ] (Opsiyonel)` veya `[ ] (İleride)` etiketiyle ekle
- Checklist'te olmayan bir iş tamamlandıysa: Önce maddeyi ekle, sonra `[x]` işaretle
- Her context window sonunda chat-summary.md güncellenirken checklist durumu da kontrol edilmeli

**Yeni teknoloji/bileşen seçildi veya mevcut teknoloji değiştirildi**  
→ `docs/logs/tech-decision-logs.md`, ilgili `docs/standart/*.md`, `docs/logs/decision-log.md`  
Tech-decision-logs neden seçildiğini anlatır; standart dosyalar zorunlu kurala döner.

**Ortak/politika seviyesinde karar alındı (örn. dokümantasyon kuralı, kod standardı)**  
→ `docs/project-guidelines.md`, ilgili `docs/standart/*.md`, `docs/logs/decision-log.md`  
Önce standart dosyada kuralı tanımla, ardından decision-log'da gerekçeyi yaz.

**İsimlendirme veya stil kuralları değişti**  
→ `docs/standart/naming-conventions.md`, `docs/project-guidelines.md` (gerekiyorsa)  
Yeni örnekler ve zorunlu formatlar bu dosyada tutulur.

**Yeni script, araç veya süreç eklendi**  
→ `docs/standart/technical-decisions.md`, `docs/meta/file-overview.md`, (gerekiyorsa) `docs/meta/learning-guide.md`  
Script nasıl çalıştırılır → README veya learning-guide'da kısa not bırak.

**Bilinen bir risk, açık soru veya önemli not ortaya çıktı**  
→ `docs/logs/chat-summary.md`, `docs/logs/decision-log.md`, `docs/specs/requirements.md` (risk/gereksinimse)  
Chat-summary her context window sonunda güncellenir, yapılan işleri tarihsel olarak kaydeder.

**Tez raporu veya uzun form dokümantasyon etkilendi**  
→ `docs/specs/project-report.md`, ilgili `docs/specs/*.md`  
Akademik rapor ana akış değişikliklerini burada güncelle.

**Yeni büyük domain implementasyonu planlandı (örn: Production, Inventory, Quality)**  
→ `docs/roadmaps/{domain-name}-roadmap.md` oluştur, `docs/meta/file-overview.md` güncelle

- **Ne zaman:** Birden fazla model/API/UI gerektiren büyük domain eklenecekse
- **İçerik:** Model şemaları (örnek), API endpoint listesi, fazlar (Faz 1-4), bağımlılıklar, yol haritası
- **Format:** Detaylı, resmi (tez/dokümantasyon için)
- **Amaç:** Tarihsel kayıt, onboarding materyali, benzer domain ekleme template'i
- **Güncelleme:** Domain implementasyonu sırasında "Implementation Status" bölümünü güncelle (✅ Tamamlandı, 🔄 Devam ediyor, ⏳ Henüz başlanmadı)
- **Silme:** **SİLİNMEZ** - Kalıcı dokümantasyon olarak arşivde kalır
- **Not:** Roadmap'ler zorunlu kural değildir (kurallar `docs/standart/` içinde); sadece "nasıl planlandı" bilgisi içerir, gerçek implementasyon farklı olabilir
- **İlgili dosyalar:** `docs/specs/project-roadmap.md`, `docs/specs/requirements.md`, `docs/logs/decision-log.md`, `docs/standart/backend-decisions.md`

**Küçük geliştirme/iyileştirme TODO'ları ortaya çıktı (bug fix, UI iyileştirme, deneysel plan)**  
→ `docs/dev-notes/{konu-adı}.md` oluştur veya güncelle, `docs/meta/file-overview.md` güncelle

- **Ne zaman:** Birkaç günlük küçük görevler, deneysel planlama, hızlı notlar
- **İçerik:** Bullet point TODO listesi, hızlı notlar, dosya referansları
- **Format:** Casual, hızlı not formatı (checkbox listeleri)
- **Güncelleme:** TODO'lar tamamlandıkça işaretle veya sil
- **Silme:** **TODO'LAR TAMAMLANINCA SİL** - Geçici notlar, kalıcı olmamalı
- **Referans:** `docs/meta/learning-guide.md`, `docs/meta/file-overview.md`

**Cross-domain değişiklik (bir domain'deki değişiklik diğerlerini etkiliyor)**  
→ Bu dosya (doc-maintenance.md) + etkilenen domain dosyaları + `docs/meta/file-overview.md`  
**Örnek bağımlılıklar:** Makine durumu değişirse → machines, oee, board domainleri + dashboard/monitoring UI etkilenir. Parts kategori eklenirse → parts domain + parts UI + seed script etkilenir. User RBAC değişirse → auth, access-control, users domainleri + tüm permission guardlar etkilenir. Detaylı akışlar için `docs/dev-notes/*.md` ve `docs/meta/learning-guide.md` dosyalarına bak.

## Ek Hatırlatmalar

- Doküman güncellemesi gerektirmeyen bir değişiklik yaptıysan bile bu rehberi kontrol ettiğini PR açıklamasında belirt.
- Yeni dosya/klasör eklerken `docs/meta/file-overview.md` içinde konumunu ve amacını açıklamayı ihmal etme.
- Her yeni karar veya varsayım, önce `decision-log`'a kısa başlık + gerekçe + beklenen etki formatında eklenmeli.
- `docs/tasks/project-checklist.md` içindeki görevler **silinmez**, tamamlananlar `[x]` ile işaretlenir.

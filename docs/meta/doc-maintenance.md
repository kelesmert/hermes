# Doküman Bakım Rehberi

Bu rehberin amacı, kod tabanında yapılan her değişiklikte hangi dokümanların gözden geçirilmesi ve güncellenmesi gerektiğini netleştirmektir. Yeni bir geliştirme tamamlandığında bu kontrol listesini uygulayarak depo içindeki bilgi kaynağını tutarlı tutabilirsiniz.

## Nasıl Kullanılır?
1. Özelliği tamamladıktan sonra bu dosyayı aç.
2. Yaptığın değişikliğin kapsamına uyan satırları bul (backend, frontend, altyapı, karar vb.).
3. Satırlarda listelenen dokümanları incele ve gerekiyorsa güncelle.
4. Güncellediğin dokümanları commit mesajında ve PR açıklamasında belirt.

> Not: Bir değişiklik birden fazla satırla ilişkili olabilir; hepsini kontrol etmek gerekir.

## Doküman Eşleştirmeleri

| Değişiklik Tipi | Güncellenecek / Kontrol Edilecek Dokümanlar | Notlar |
| --- | --- | --- |
| Yeni backend domain’i, model veya route eklendi | `docs/standart/backend-decisions.md`, `docs/logs/decision-log.md`, `docs/meta/file-overview.md`, `docs/meta/learning-guide.md` | Yeni kurallar → backend-decisions; kalıcı karar → decision-log; yeni dosya → file-overview; akış/guideline → learning-guide. |
| Backend konfigürasyonu, env veya seed değerleri değişti | `backend/README.md`, `backend/.env.example`, `docs/standart/technical-decisions.md`, `docs/meta/learning-guide.md` | Env anahtarı eklendiğinde hem `.env.example` hem README güncellenmeli. |
| Backend davranışında önemli karar/kısıt güncellendi | `docs/logs/decision-log.md`, `docs/project-guidelines.md` (gerekirse), `docs/tasks/project-checklist.md` (yeni görev varsa) | Decision-log gerekçeyi içermeli; kalıcı kural olduysa guidelines/standart dosyalarına yansıt. |
| Frontend’de yeni feature, sayfa veya paylaşılmış bileşen eklendi | `docs/standart/frontend-decisions.md`, `docs/logs/decision-log.md`, `docs/meta/file-overview.md`, `docs/meta/learning-guide.md`, `frontend/README.md` | Yeni bağımlılık/karar → frontend-decisions; kullanıcı akışı → learning-guide; yeni klasör/dosya → file-overview. |
| Frontend ortam değişkeni veya build komutu değişti | `frontend/.env.example`, `frontend/README.md`, `docs/standart/technical-decisions.md` | `VITE_*` anahtarları mutlaka `.env.example` içinde yer almalı. |
| Gereksinimler, kapsam veya roadmap etkilendi | `docs/specs/requirements.md`, `docs/specs/project-roadmap.md`, `docs/tasks/project-checklist.md` | Gereksinim değişiklikleri roadmap ve checklist’e yansıtılmalı. |
| Yeni teknoloji/bileşen seçildi veya mevcut teknoloji değiştirildi | `docs/logs/tech-decision-logs.md`, ilgili `docs/standart/*.md`, `docs/logs/decision-log.md` | Tech-decision-logs neden seçildiğini anlatır; standart dosyalar zorunlu kurala döner. |
| Ortak/politika seviyesinde karar alındı (örn. dokümantasyon kuralı, kod standardı) | `docs/project-guidelines.md`, ilgili `docs/standart/*.md`, `docs/logs/decision-log.md` | Önce standart dosyada kuralı tanımla, ardından decision-log’da gerekçeyi yaz. |
| İsimlendirme veya stil kuralları değişti | `docs/standart/naming-conventions.md`, `docs/project-guidelines.md` (gerekiyorsa) | Yeni örnekler ve zorunlu formatlar bu dosyada tutulur. |
| Yeni script, araç veya süreç eklendi | `docs/standart/technical-decisions.md`, `docs/meta/file-overview.md`, (gerekiyorsa) `docs/meta/learning-guide.md` | Script nasıl çalıştırılır → README veya learning-guide’da kısa not bırak. |
| Bilinen bir risk, açık soru veya önemli not ortaya çıktı | `docs/logs/chat-summary.md`, `docs/logs/decision-log.md`, `docs/specs/requirements.md` (risk/gereksinimse) | Chat-summary mevcut oturumun bağlamını korur. |
| Tez raporu veya uzun form dokümantasyon etkilendi | `docs/specs/project-report.md`, ilgili `docs/specs/*.md` | Akademik rapor ana akış değişikliklerini burada güncelle. |
| Geliştirme planı / dev-notes güncellendi | `docs/dev-notes/*.md`, `docs/meta/file-overview.md` | Plan veya deneme notu eklersen dev-notes altında kayıt altına al. |

## Ek Hatırlatmalar
- Doküman güncellemesi gerektirmeyen bir değişiklik yaptıysan bile bu rehberi kontrol ettiğini PR açıklamasında belirt.
- Yeni dosya/klasör eklerken `docs/meta/file-overview.md` içinde konumunu ve amacını açıklamayı ihmal etme.
- Her yeni karar veya varsayım, önce `decision-log`’a kısa başlık + gerekçe + beklenen etki formatında eklenmeli.
- `docs/tasks/project-checklist.md` içindeki görevler **silinmez**, tamamlananlar `[x]` ile işaretlenir.

# Doküman Bakım ve Güncelleme Rehberi

## Amaç

Bu rehber, sohbet sırasında alınan kararları, tamamlanan işlemleri ve gelecek planları ilgili dokümanlara otomatik aktarmak için kullanılır.

Kullanıcı "doc-maintenance'a göre güncelle" veya benzeri bir ifade kullandığında, AI:

1. Son sohbeti analiz eder (ne konuşuldu, ne kararlaştırıldı)
2. Hangi tür güncelleme gerektiğini tespit eder (Karar/Tamamlandı/Gelecek)
3. İlgili dokümanları uygun formatta günceller (her dosyanın kendi "Güncelleme Kuralları" bölümüne bak)
4. Güncellenen dosyaların listesini verir

**ÖNEMLİ:** Her MD dosyasının kendi başında "Güncelleme Kuralları" bölümü var. Format detayları orada. Bu dosya sadece tetikleyici ve yönlendiricidir.

## Genel Markdown Kuralları

Tüm MD dosyalarına uygulanacak zorunlu kurallar:

- **Başlıklarda noktalama işareti yok:** Başlık sonuna nokta, soru işareti, ünlem vb. konulmaz (MD026 uyumluluğu)
- **Emoji kullanma:** Dokümanlarda emoji kullanılmaz, sadece düz metin
- **Kod bloklarında dil belirt:** Fenced code block'larda (```) mutlaka dil belirtilmeli (MD040 uyumluluğu)
  - Dosya yolları için: `text` veya `bash`
  - Komutlar için: `bash`
  - Kod için: `javascript`, `python`, `json` vb.
  - Çıktılar için: `text`
- **Örnek:**
  - ✅ DOĞRU: `## Amaç` ve ` ```bash` veya ` ```text`
  - ❌ YANLIŞ: `## Amaç.` veya `## Neden?` veya `## 🎯 Amaç` veya ` ``` ` (dil yok)

---

## Güncelleme Türleri ve Tetikleyiciler

### Tür 1: Karar Alındı

**Ne zaman:**

- Teknik bir karar alındığında
- Standart/kural belirlendiğinde
- Mimari tercih yapıldığında
- Bir yaklaşım/teknoloji seçildiğinde

**Bağlamdan anlama:** AI "olsun", "yapalım", "standart olarak" gibi ifadeleri ve genel bağlamı değerlendirmeli.

**Güncellenmesi gereken dokümanlar:**

ZORUNLU:

- `docs/logs/decision-log.md` → Dosyanın başındaki "Güncelleme Kuralları" bölümüne bak
- `docs/standart/` altında ilgili dosya:
  - Backend kararı → `backend-decisions.md`
  - Frontend kararı → `frontend-decisions.md`
  - Ortak/operasyonel → `technical-decisions.md`
  - İsimlendirme → `naming-conventions.md`
- `docs/tasks/project-checklist.md` → İmplementasyon görevi ekle

DURUMA GÖRE:

- `docs/specs/requirements.md` → Gereksinim değişiyorsa
- `docs/meta/summary.md` → Büyük değişiklikse
- `docs/project-guidelines.md` → Politika seviyesinde kural ise

---

### Tür 2: İşlem/Domain Tamamlandı

**Ne zaman:**

- Bir feature implementasyonu bittiğinde
- Domain ekleme işi tamamlandığında
- API endpoint'leri hazır ve test edildiğinde
- Bir sayfa/component çalışır duruma geldiğinde

**Bağlamdan anlama:** AI "tamamlandı", "bitti", "çalışıyor" gibi ifadeleri ve genel bağlamı değerlendirmeli.

**Güncellenmesi gereken dokümanlar:**

ZORUNLU:

- `docs/tasks/project-checklist.md` → [ ] → [x] işaretle
- `docs/specs/project-roadmap.md` → Status güncelle
- `docs/meta/file-overview.md` → Yeni dosyaları listele VE mevcut dosyaların açıklamalarını güncelle (davranış/parametre değişikliği varsa)
- `docs/logs/decision-log.md` → Implementation kararlarını kaydet

DURUMA GÖRE:

- `docs/meta/summary.md` → Büyük özellikse
- `docs/meta/learning-guide.md` → Yeni akış/süreç eklendiyse
- `docs/roadmaps/[domain]-roadmap.md` → İlgili domain varsa
- `backend/README.md` veya `frontend/README.md` → Yeni komut/setup eklendiyse

---

### Tür 3: Gelecek Planlama / Erteleme / Opsiyonel

**Ne zaman:**

- Bir özellik şimdilik eklenmeyecekse
- "İleride konuşuruz" dendiğinde
- Opsiyonel iyileştirme önerildiğinde
- Değerlendirilmesi gereken bir konu olduğunda

**Bağlamdan anlama:** AI "ileride", "sonra", "opsiyonel", "düşünelim" gibi ifadeleri ve genel bağlamı değerlendirmeli.

**Güncellenmesi gereken dokümanlar:**

ZORUNLU:

- `docs/tasks/project-checklist.md` → "(İleride)" veya "(Opsiyonel)" etiketi ile ekle

DURUMA GÖRE:

- `docs/logs/decision-log.md` → Önemli erteleme gerekçesi varsa
- `docs/specs/requirements.md` → "Açık Sorular & Riskler" bölümüne ekle
- `docs/dev-notes/[konu].md` → Geçici notlar için (TODO tamamlanınca sil)

---

## Domain ve Konu Tespiti

AI, sohbetteki bağlamdan konuyu otomatik tespit etmelidir:

**Backend Domain'leri:** auth, users, access-control, machines, oee, board, parts, production, reports

**Frontend Domain'leri:** auth, dashboard, monitoring, machines, parts, users, reports

**Ortak Konular:** config, docs, tests, deployment, seed

**Tespit Yöntemleri:**

1. Dosya yollarına bak (`backend/src/domains/parts/` → Parts)
2. API endpoint'lerine bak (`/api/parts` → Parts)
3. Terminolojiye bak (makine, telemetry → Machines/OEE)
4. Bağlamdan backend/frontend/ortak'ı anla

---

## Özel Durumlar

### 1. Dosya Yapısı Değişiklikleri

**Ne zaman:** Dosya taşındı/bölündü/yeniden organize edildi

**Güncelleme:**

- `docs/meta/file-overview.md`
- `docs/logs/decision-log.md` (önemliyse)

---

### 2. Cross-Domain Değişiklikler

**Ne zaman:** Bir domain değişikliği diğerlerini etkiliyor

**Örnekler:**

- Makine durumu enum değişti → machines, oee, board + UI
- Parts kategori eklendi → parts domain + UI + seed
- RBAC izinleri değişti → auth, access-control, users + guardlar

**Güncelleme:**

- Tüm etkilenen domain dosyalarını güncelle
- `docs/logs/decision-log.md`'de bağımlılıkları açıkla
- `docs/meta/file-overview.md`'de ilgili dosyaları güncelle

---

### 3. Yeni Büyük Domain Ekleme

**Ne zaman:** Birden fazla model/API/UI gerektiren büyük domain

**Güncelleme:**

- `docs/roadmaps/[domain-name]-roadmap.md` oluştur
- `docs/meta/file-overview.md`'ye tüm yeni dosyaları ekle
- `docs/project-guidelines.md`'deki doküman haritasını güncelle
- `docs/specs/project-roadmap.md`'ye yeni fazı ekle

**NOT:** Roadmap dosyaları SİLİNMEZ, tarihsel kayıt olarak kalır.

---

### 4. Geçici Notlar ve TODO'lar

**Ne zaman:** Birkaç günlük küçük görevler, bug fix listesi

**Güncelleme:**

- `docs/dev-notes/[konu-adi].md` oluştur veya güncelle
- Checkbox formatı kullan: [ ] / [x]
- `docs/meta/file-overview.md`'ye dosyayı ekle

**ÖNEMLİ:** TODO'lar tamamlanınca dev-notes dosyasını SİL.

---

### 5. Konfigürasyon ve Env Değişiklikleri

**Ne zaman:** Yeni env değişkeni eklendi/değişti

**Güncelleme:**

- `backend/.env.example` veya `frontend/.env.example`
- `backend/README.md` veya `frontend/README.md`
- `docs/standart/technical-decisions.md` (env yönetimi kuralı değiştiyse)
- `docs/meta/learning-guide.md` (setup adımları değiştiyse)

---

### 6. Test Altyapısı Değişiklikleri

**Ne zaman:** Test framework/script eklendi/değişti

**Güncelleme:**

- `docs/tasks/project-checklist.md`
- `backend/README.md` veya `frontend/README.md` (test komutları)
- `docs/standart/technical-decisions.md` (test stratejisi)
- `docs/logs/decision-log.md` (framework seçim gerekçesi)

---

### 7. Bağımlılık Ekleme/Güncelleme

**Ne zaman:** Yeni npm paketi eklendi/güncellendi

**Güncelleme:**

- `docs/logs/tech-decision-logs.md` (neden bu paket seçildi)
- `docs/standart/` (kullanım zorunlu mu?)
- `backend/README.md` veya `frontend/README.md` (yeni paket kurulumu)
- `docs/logs/decision-log.md` (büyük değişiklikse)

---

### 8. Deployment ve DevOps Değişiklikleri

**Ne zaman:** Docker/CI/CD/production setup değişti

**Güncelleme:**

- `docs/standart/technical-decisions.md`
- `README.md` (root - Docker kurulumu)
- `docs/tasks/project-checklist.md`
- `docs/meta/file-overview.md`

---

### 9. Dokümantasyon Yapısı Değişiklikleri

**Ne zaman:** Yeni doküman kategorisi/dosya yeniden organize edildi

**Güncelleme:**

- `docs/project-guidelines.md` (doküman haritası)
- `docs/meta/file-overview.md`
- `docs/meta/doc-maintenance.md` (bu dosya - yeni kural eklendiyse)
- `docs/logs/decision-log.md`

---

### 10. Güvenlik ve Performans Değişiklikleri

**Ne zaman:** Güvenlik açığı kapatıldı/performans optimizasyonu yapıldı

**Güncelleme:**

- `docs/logs/decision-log.md`
- `docs/standart/technical-decisions.md`
- `docs/specs/requirements.md` (non-fonksiyonel gereksinimler)
- `docs/tasks/project-checklist.md`

---

### 11. Mevcut Dosya Davranış/Mantık Değişikliği

**Ne zaman:**

- Mevcut fonksiyon/servis mantığı değişti
- Yeni parametre/env değişkeni eklendi
- Dosyanın sorumluluğu genişledi veya değişti
- Yeni davranış profili eklendi (örn: idle/active mod, debug/production mod)
- Fonksiyon imzası değişti (yeni parametre, dönen değer formatı)
- Algoritma/hesaplama mantığı güncellendi

**Güncelleme:**

ZORUNLU:

- `docs/meta/file-overview.md` → İlgili dosyanın açıklamasını güncelle, yeni davranışı/parametreleri ekle
- `docs/logs/decision-log.md` → Değişiklik gerekçesini kaydet (önemliyse)
- `backend/README.md` veya `frontend/README.md` → Yeni env değişkenleri/komutlar varsa ekle

DURUMA GÖRE:

- `.env.example` → Yeni env değişkeni eklendiyse
- `docs/meta/learning-guide.md` → Akış değiştiyse güncelle
- `docs/standart/` → Yeni pattern/kural oluştuysa

**Örnekler:**

- Script'e yeni env değişkeni eklendi (DATA_GEN_TRANSITION_MS)
- Servis fonksiyonu artık başka bir koleksiyona da bakıyor
- Util fonksiyonu yeni parametre alıyor
- Component yeni prop kabul ediyor
- API endpoint yeni query parametresi destekliyor

---

## Context Window Sonunda

Her context window bittiğinde:

**Güncellenmesi gereken:**

- `docs/logs/chat-summary.md` → Tarihsel kayıt, ne yapıldı/ne kararlaştırıldı

**Format:** Her dosyanın başındaki "Güncelleme Kuralları" bölümünde.

---

## Doküman Listesi (Referans)

### Logs (Tarihsel Kayıt)

- `docs/logs/decision-log.md` - Tüm kararlar (tarih + gerekçe + etki)
- `docs/logs/tech-decision-logs.md` - Teknoloji/paket seçimleri
- `docs/logs/chat-summary.md` - Context window geçmişi

### Standart (Zorunlu Kurallar)

- `docs/standart/backend-decisions.md` - Backend zorunlu kuralları
- `docs/standart/frontend-decisions.md` - Frontend zorunlu kuralları
- `docs/standart/technical-decisions.md` - Ortak teknik kurallar
- `docs/standart/naming-conventions.md` - İsimlendirme kuralları

### Specs (Gereksinimler ve Roadmap)

- `docs/specs/requirements.md` - Proje gereksinimleri
- `docs/specs/project-roadmap.md` - Ana roadmap
- `docs/specs/project-report.md` - Tez raporu

### Tasks (Görevler)

- `docs/tasks/project-checklist.md` - Checkbox ile görev takibi

### Meta (Proje Bilgileri)

- `docs/meta/summary.md` - Hızlı özet
- `docs/meta/file-overview.md` - Tüm dosyaların listesi ve açıklamaları
- `docs/meta/learning-guide.md` - Öğretici rehber
- `docs/meta/doc-maintenance.md` - Bu dosya
- `docs/meta/context-initialization-prompt.md` - Context window başlatma

### Roadmaps (Domain-Specific)

- `docs/roadmaps/production-roadmap.md` - Production domain roadmap
- (İleride: inventory, quality, maintenance roadmap'leri eklenebilir)

### Dev Notes (Geçici)

- `docs/dev-notes/dashboard-next-steps.md` - Dashboard TODO'ları
- (Diğer geçici notlar)

### README Dosyaları

- `README.md` - Root README
- `backend/README.md` - Backend kurulum
- `frontend/README.md` - Frontend kurulum

### Diğer

- `docs/project-guidelines.md` - Politika ve iletişim kuralları

---

## AI Güncelleme Süreci

### Adım 1: Sohbet Analizi

- Son 10-20 mesajı tara
- Hangi konular tartışıldı?
- Ne tür kararlar alındı?
- Hangi işlemler tamamlandı?
- Nelerin gelecekte yapılması planlandı?

### Adım 2: Güncelleme Türü Tespiti

- Karar alındı mı? (Tür 1)
- İşlem tamamlandı mı? (Tür 2)
- Gelecek plan mı? (Tür 3)
- Birden fazla tür olabilir

### Adım 3: Domain Tespiti

- Hangi backend/frontend domain'leri?
- Ortak bir konu mu?
- Cross-domain etki var mı?

### Adım 4: Özel Durum Kontrolü

- Dosya yapısı değişti mi?
- Cross-domain etki var mı?
- Yeni domain mi?
- Config/env/test/deployment değişikliği mi?
- Mevcut dosya davranışı değişti mi? (fonksiyon mantığı, yeni parametre, algoritma değişikliği)

### Adım 5: Doküman Listesi Oluştur

- Yukarıdaki "Güncellenmesi gereken dokümanlar" bölümlerine bak
- ZORUNLU dosyaları dahil et
- DURUMA GÖRE dosyalar için bağlama göre karar ver

### Adım 6: Her Dosyayı Güncelle

- Dosyayı oku
- Dosyanın başındaki "Güncelleme Kuralları" bölümünü kontrol et
- Uygun formatı kullan
- Doğru yere ekle

### Adım 7: Özet Rapor Ver

- Hangi dosyalar güncellendi
- Ne tür değişiklikler yapıldı
- Kullanıcı kontrol etsin

---

## Kontrol Listesi

Her güncelleme sonrası AI kendine şu soruları sormalı:

- [ ] Her dosyanın başındaki "Güncelleme Kuralları"na baktım mı?
- [ ] decision-log.md'ye tarih ekledim mi?
- [ ] Yeni dosyaları file-overview.md'ye ekledim mi?
- [ ] Mevcut dosyaların açıklamalarını güncelledim mi? (davranış değişikliği varsa)
- [ ] Yeni env değişkenlerini README'ye ve .env.example'a ekledim mi?
- [ ] Checklist'te [ ] ve [x] doğru kullandım mı?
- [ ] Roadmap status'leri tutarlı mı?
- [ ] Tekrar eden bilgi var mı?
- [ ] Güncelleme özeti net ve açık mı?
- [ ] Özel durumlar kontrol edildi mi?
- [ ] Cross-domain etkiler göz önünde bulunduruldu mu?
- [ ] Gereksiz güncelleme yapılmadı mı?

---

## Önemli Notlar

1. **Her dosyanın kendi formatı var:** Dosyanın başındaki "Güncelleme Kuralları" bölümüne bak.

2. **Bağlam her şeydir:** AI anahtar kelimelerle sınırlı kalmamalı, sohbetin bağlamını anlamalı.

3. **Minimalizm:** Her değişiklik her dosyayı etkilemez. Sadece gerçekten gerekli güncellemeleri yap.

4. **Tutarlılık:** Aynı bilgiyi birden fazla yerde tekrar etme.

5. **Tarih önemli:** decision-log.md'de mutlaka tarih ekle.

6. **Kalıcı vs Geçici:** dev-notes geçicidir (tamamlanınca sil), diğer dokümanlar kalıcıdır.

7. **Roadmap dosyaları özeldir:** Büyük domain'ler için roadmap oluştur, ama SİLME.

8. **Özel durumları unutma:** Cross-domain, config, test gibi özel durumlar için yukarıdaki bölümleri kontrol et.

- "erteleyebiliriz", "şimdi yapmaya gerek yok"

**Güncellenmesi gereken dokümanlar:**

ZORUNLU:

- `docs/tasks/project-checklist.md` - "(İleride)" veya "(Opsiyonel)" etiketi ile ekle

DURUMA GÖRE:

- `docs/logs/decision-log.md` - Önemli erteleme gerekçesi varsa kaydet
- `docs/specs/requirements.md` - Çok önemliyse "Açık Sorular & Riskler" bölümüne ekle
- `docs/dev-notes/[konu].md` - Geçici notlar için kullan (TODO tamamlanınca sil)

---

## Domain ve Konu Tespiti

AI, sohbetteki bağlamdan konuyu otomatik tespit etmelidir. İpuçları:

### Backend Domain'leri:

- **auth, users, access-control**: Kimlik doğrulama, JWT, refresh token, RBAC, kullanıcı/rol yönetimi
- **machines**: Makine CRUD, event'ler, durum değişiklikleri, machine_events koleksiyonu
- **oee**: OEE processor job, telemetry işleme, otomatik downtime detection, OeeMachineState
- **board**: Dashboard metrikleri, özet endpoint'leri (/api/board/\*)
- **parts**: Parça tanımları, kategoriler (fasteners/electronics/mechanical_plastics), makine uyumluluğu
- **production**: Job orders, ProductionEvent, üretim süreçleri (planlı, henüz eklenmedi)
- **reports**: Raporlama servisleri, export (planlı, henüz eklenmedi)

### Frontend Domain'leri:

- **auth**: Login, session, SessionProvider, refresh token yönetimi
- **dashboard**: Ana sayfa, metrik kartları, board API kullanımı, özet bilgiler
- **monitoring**: Canlı telemetry grafikler, real-time veri, Recharts, 2sn polling
- **machines**: Makine listesi, CRUD dialogları, durum değiştirme
- **parts**: Parça listesi, kategori formları, makine uyumluluğu seçimi
- **users**: Kullanıcı/rol yönetimi ekranları, permission yönetimi
- **reports**: Rapor görüntüleme sayfası (planlı, henüz eklenmedi)

### Ortak Konular:

- **config**: Env değişkenleri, .env.example, konfigürasyon dosyaları
- **docs**: Dokümantasyon güncellemeleri, meta dosyalar
- **tests**: Test altyapısı, Jest, React Testing Library, test script'leri
- **deployment**: CI/CD, Docker, docker-compose, production setup
- **seed**: Seed script'leri, örnek veri, default roller/kullanıcılar

### Domain Tespit Yöntemleri:

1. Sohbette geçen dosya yollarına bak (`backend/src/domains/parts/` → Parts domain)
2. Bahsedilen API endpoint'lerine bak (`/api/parts` → Parts, `/api/board/metrics` → Board)
3. Kullanılan terminolojiye bak (makine, telemetry, OEE → Machines/OEE; grafik, canlı, chart → Monitoring)
4. Yapılan değişikliklerin backend/frontend/ortak olduğunu bağlamdan anla

---

## Güncelleme Formatları

### decision-log.md için format:

```markdown
### [Karar Başlığı - Kısa ve Açıklayıcı]

- **Tarih:** YYYY-MM-DD
- **Domain:** [Backend/Frontend/Ortak] - [Spesifik domain adı]
- **Karar:** [Ne kararlaştırıldı, kısa ve net]
- **Gerekçe:** [Neden bu karar alındı, hangi sorunu çözüyor]
- **Etki:** [Hangi dosyalar/sistemler etkilenecek, neleri değiştirecek]
```

### project-checklist.md için format:

Her bölümde (Backend/Frontend/Test ve Dağıtım) uygun yere ekle:

```markdown
- [x] Tamamlanan görev açıklaması
- [ ] Bekleyen görev açıklaması
- [ ] (İleride) Gelecek için planlanan görev açıklaması
- [ ] (Opsiyonel) Zorunlu olmayan iyileştirme açıklaması
```

### file-overview.md için format:

**Yeni dosya eklendiğinde:**

İlgili bölüme (Backend/Frontend/Docs) ekle:

```markdown
- `dosya/yolu/dosya-adi.js`: Ne yapar, hangi sorumluluğu var (1-2 cümle, kısa ve öz)
```

**Mevcut dosya davranışı değiştiğinde:**

1. İlgili dosyanın mevcut açıklamasını bul
2. Yeni davranışı/parametreleri ekle (örn: "artık X modu destekliyor", "Y env değişkeniyle kontrol edilir")
3. Eski açıklama yetersizse tamamen yeniden yaz
4. Davranış değişikliği önemliyse decision-log'a referans ekle

**Örnek güncelleme:**

Önce:

```markdown
- `backend/scripts/data-gen.js`: Simülasyon amaçlı telemetry/sinyal üretir.
```

Sonra:

```markdown
- `backend/scripts/data-gen.js`: Simülasyon amaçlı telemetry/sinyal üretir; makine durumuna (RUNNING/IDLE) göre ayrı profiller kullanarak sıcaklık/tork/enerji değerlerini ayarlar. `DATA_GEN_TRANSITION_MS` ile job başlama/durma anında 10 sn içinde metrikleri hızla yeni profile geçirir.
```

### project-roadmap.md için format:

Status değişiklikleri:

- İlgili fazı bul
- Checkbox durumunu güncelle: [ ] → [x]
- Status etiketini güncelle: "Planlanan" → "Devam Ediyor" → "Tamamlandı"

### standart/\*.md dosyaları için:

- İlgili bölümü bul (örn: backend-decisions.md içinde "Auth & RBAC Kuralları")
- Yeni kuralı ekle veya mevcut kuralı güncelle
- Örnek kod varsa ekle
- Zorunluluk seviyesini belirt ("zorunlu", "önerilen", "opsiyonel")

---

## Özel Durumlar

### 1. Dosya Yapısı Değişiklikleri

**Ne zaman:**

- Dosya taşındı, yeniden adlandırıldı
- Bir service 2 ayrı service'e bölündü
- Component'ler yeniden organize edildi
- Klasör yapısı değişti

**Güncelleme:**

- `docs/meta/file-overview.md`: Eski dosyayı sil/güncelle, yeni dosyaları ekle
- `docs/logs/decision-log.md`: Refactor gerekçesini yaz (önemliyse)
- `docs/meta/doc-maintenance.md`: Pattern değiştiyse bu dosyayı da güncelle

---

### 2. Cross-Domain Değişiklikler

**Ne zaman:**

- Bir domain'deki değişiklik diğer domain'leri etkiliyor
- Ortak bir model/util/constant değişti
- API contract değişti ve frontend'i etkiliyor

**Örnekler:**

- Makine durumu enum değişti → machines, oee, board domainleri + dashboard/monitoring UI etkilenir
- Parts kategori eklendi → parts domain + parts UI + seed script etkilenir
- User RBAC izinleri değişti → auth, access-control, users domainleri + tüm permission guardlar etkilenir

**Güncelleme:**

- Tüm etkilenen domain'lerin dosyalarını güncelle
- `docs/logs/decision-log.md`'de bağımlılıkları açıkla
- `docs/meta/file-overview.md`'de ilgili dosyaları güncelle

---

### 3. Yeni Büyük Domain Ekleme

**Ne zaman:**

- Birden fazla model/API/UI gerektiren büyük bir domain eklenecekse
- Örnek: Production, Inventory, Quality, Maintenance

**Güncelleme:**

- `docs/roadmaps/[domain-name]-roadmap.md` oluştur:
  - Model şemaları (örnek)
  - API endpoint listesi
  - Fazlar (Faz 1-4)
  - Bağımlılıklar
  - Implementation status
- `docs/meta/file-overview.md`'ye tüm yeni dosyaları ekle
- `docs/project-guidelines.md`'deki doküman haritasını güncelle
- `docs/specs/project-roadmap.md`'ye yeni fazı ekle

**Not:** Roadmap dosyaları kalıcıdır, SİLİNMEZ. Tarihsel kayıt ve onboarding materyali olarak kullanılır.

---

### 4. Geçici Notlar ve TODO'lar

**Ne zaman:**

- Birkaç günlük küçük görevler var
- Bug fix listesi tutulacak
- Deneysel planlama yapılacak
- Hızlı notlar gerekli

**Güncelleme:**

- `docs/dev-notes/[konu-adi].md` oluştur veya güncelle
- Bullet point TODO listesi kullan
- Checkbox formatı kullan: [ ] yapılacak, [x] tamamlandı
- `docs/meta/file-overview.md`'ye dosyayı ekle

**ÖNEMLI:** TODO'lar tamamlanınca dev-notes dosyasını SİL. Kalıcı bilgiler diğer dokümanlara taşınmalı.

---

### 5. Konfigürasyon ve Env Değişiklikleri

**Ne zaman:**

- Yeni env değişkeni eklendi
- Mevcut env değişkeni değişti veya silindi
- .env.example güncellenmeli
- Setup süreci değişti

**Güncelleme:**

- `backend/.env.example` veya `frontend/.env.example`: Yeni değişkeni ekle, açıklama yaz
- `backend/README.md` veya `frontend/README.md`: Env değişkenini açıkla, örnek değer göster
- `docs/standart/technical-decisions.md`: Env yönetimi kuralı değiştiyse güncelle
- `docs/meta/learning-guide.md`: Setup adımları değiştiyse güncelle

---

### 6. Test Altyapısı Değişiklikleri

**Ne zaman:**

- Test framework'ü eklendi/değişti (Jest, React Testing Library)
- Yeni test script'i eklendi
- Test stratejisi değişti
- CI/CD pipeline'ında test adımı eklendi

**Güncelleme:**

- `docs/tasks/project-checklist.md`: Test görevlerini güncelle
- `backend/README.md` veya `frontend/README.md`: Test komutlarını ekle
- `docs/standart/technical-decisions.md`: Test stratejisini belirt
- `docs/logs/decision-log.md`: Test framework seçim gerekçesini yaz

---

### 7. Bağımlılık Ekleme/Güncelleme

**Ne zaman:**

- Yeni npm paketi eklendi
- Mevcut paket versiyonu güncellendi
- Kritik bir bağımlılık değişti

**Güncelleme:**

- `docs/logs/tech-decision-logs.md`: Neden bu paket seçildi açıkla
- `docs/standart/` (ilgili dosya): Kullanım zorunlu mu? Standart ne?
- `backend/README.md` veya `frontend/README.md`: Yeni paket kurulum gerekiyorsa ekle
- `docs/logs/decision-log.md`: Büyük paket değişikliği ise gerekçeyi yaz

---

### 8. Deployment ve DevOps Değişiklikleri

**Ne zaman:**

- Docker dosyaları eklendi/değişti
- CI/CD pipeline yapılandırıldı
- Production setup değişti
- Environment strategy değişti (dev/staging/prod)

**Güncelleme:**

- `docs/standart/technical-decisions.md`: Deployment stratejisini güncelle
- `README.md` (root): Docker kurulumunu ekle
- `docs/tasks/project-checklist.md`: Deployment görevlerini işaretle
- `docs/meta/file-overview.md`: Yeni config dosyalarını ekle

---

### 9. Dokümantasyon Yapısı Değişiklikleri

**Ne zaman:**

- Yeni doküman kategorisi eklendi
- Dosyalar yeniden organize edildi
- Doküman haritası değişti

**Güncelleme:**

- `docs/project-guidelines.md`: Doküman haritasını güncelle
- `docs/meta/file-overview.md`: Yeni dokümanları ekle
- `docs/meta/doc-maintenance.md` (bu dosya): Yeni güncelleme kuralları ekle
- `docs/logs/decision-log.md`: Yapısal değişiklik gerekçesini yaz

---

### 10. Güvenlik ve Performans Değişiklikleri

**Ne zaman:**

- Güvenlik açığı kapatıldı
- Performans optimizasyonu yapıldı
- Rate limiting eklendi
- CORS ayarları değişti

**Güncelleme:**

- `docs/logs/decision-log.md`: Değişiklik gerekçesini ve etkisini yaz
- `docs/standart/technical-decisions.md`: Güvenlik kurallarını güncelle
- `docs/specs/requirements.md`: Non-fonksiyonel gereksinimleri güncelle
- `docs/tasks/project-checklist.md`: İlgili görevleri işaretle

---

## AI Güncelleme Süreci

Kullanıcı "doc-maintenance'a göre güncelle" veya benzeri ifade kullandığında:

### Adım 1: Sohbet Analizi

- Son 10-20 mesajı tara
- Hangi konular tartışıldı?
- Ne tür kararlar alındı?
- Hangi işlemler tamamlandı?
- Nelerin gelecekte yapılması planlandı?
- Hangi dosyalar/domain'ler etkilendi?

### Adım 2: Güncelleme Türü Tespiti

- Karar alındı mı? (Tür 1)
- İşlem tamamlandı mı? (Tür 2)
- Gelecek plan mı? (Tür 3)
- Birden fazla tür olabilir, hepsini tespit et

### Adım 3: Domain Tespiti

- Hangi backend domain'leri etkilendi?
- Hangi frontend feature'lar etkilendi?
- Ortak bir konu mu?
- Cross-domain etki var mı?

### Adım 4: Özel Durum Kontrolü

- Dosya yapısı değişti mi?
- Cross-domain etki var mı?
- Yeni domain mi ekleniyor?
- Config/env değişikliği mi?
- Test/deployment değişikliği mi?

### Adım 5: Doküman Listesi Oluştur

- Yukarıdaki "Güncellenmesi gereken dokümanlar" bölümlerine bak
- ZORUNLU dosyaları mutlaka dahil et
- DURUMA GÖRE dosyalar için bağlama göre karar ver
- Özel durumlar için ilgili bölümü kontrol et

### Adım 6: Her Dosyayı Güncelle

- Dosyayı oku (mevcut içeriği al)
- Uygun formatı kullan (yukarıdaki format bölümüne bak)
- Yeni içeriği doğru yere ekle
- Çakışma/tekrar kontrolü yap
- Tarih ekle (decision-log için)

### Adım 7: Özet Rapor Ver

- Hangi dosyalar güncellendi
- Ne tür değişiklikler yapıldı
- Hangi özel durumlar tespit edildi
- Kullanıcı kontrol etsin

---

## Kontrol Listesi

Her güncelleme sonrası AI kendine şu soruları sormalı:

- [ ] decision-log.md'ye tarih ekledim mi?
- [ ] Yeni dosyaları file-overview.md'ye ekledim mi?
- [ ] Checklist'te [ ] ve [x] doğru kullandım mı?
- [ ] Roadmap status'leri tutarlı mı?
- [ ] Tekrar eden bilgi var mı? (varsa birleştir veya kaldır)
- [ ] Güncelleme özeti net ve açık mı?
- [ ] Özel durumlar kontrol edildi mi?
- [ ] Cross-domain etkiler göz önünde bulunduruldu mu?
- [ ] Format kurallarına uyuldu mu?
- [ ] Gereksiz güncelleme yapılmadı mı? (her değişiklik her dosyayı etkilemez)

---

## Önemli Notlar

1. **Bağlam her şeydir**: AI anahtar kelimelerle sınırlı kalmamalı, sohbetin bağlamını anlamalı.

2. **Minimalizm**: Her değişiklik her dosyayı etkilemez. Sadece gerçekten gerekli güncellemeleri yap.

3. **Tutarlılık**: Aynı bilgiyi birden fazla yerde tekrar etme, cross-reference kullan.

4. **Tarih önemli**: decision-log.md'de mutlaka tarih ekle.

5. **Format kuralları**: Her dosyanın kendine özgü formatı var, onu koru.

6. **Kalıcı vs Geçici**: dev-notes geçicidir (tamamlanınca sil), diğer dokümanlar kalıcıdır.

7. **Roadmap dosyaları özeldir**: Büyük domain'ler için roadmap oluştur, ama SİLME (arşiv olarak kalır).

8. **Özel durumları unutma**: Cross-domain, config, test gibi özel durumlar için yukarıdaki bölümleri kontrol et.

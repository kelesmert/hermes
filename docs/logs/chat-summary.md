# Context Window Geçmişi

> Bu dosya her context window sonunda güncellenir. Tarihsel bir kayıt olarak, her oturumda yapılan işleri, alınan kararları ve sonraki adımları özetler.

## Güncelleme Kuralları

**Ne zaman güncellenir:** Her context window sonunda (token limiti dolduğunda veya oturum bittiğinde).

**Format:**

```markdown
## 📅 [Tarih] - Context Window #[Numara]

### Yapılanlar

- Madde madde liste

### Alınan Kararlar

- Madde madde liste

### Sonraki Adımlar

- Madde madde liste
```

**Önemli:** Eski kayıtlar sılınmez, tarihsel log olarak kalır. Context window sayısı sonuçtan başa artan numaralandırma ile tutulur.

---

## 📅 18 Kasım 2025 - Context Window #6

### Yapılanlar

- Production backend/domain tamamlandı (JobOrder, ProductionEvent, aksiyon endpointleri) ve frontend Production sayfası devreye alındı.
- `job-simulator.js` ile telemetry sinyaline bağlı üretim/defect kayıtları oluşturuldu; data-gen aktif job varken sinyali 1’de tutacak şekilde güncellendi.
- Machine monitoring ve OEE alanlarında yeni iyileştirme turu yapıldı: `data-gen.js` aktif/idle profilleri, `oee-processor.js` ise iş emri farkındalıklı downtime yönetimi kazandı.
- OEE signal-timeout config’i devre dışı bırakıldı; kısa telemetry gecikmeleri makineyi “durdu” yapmıyor.
- Checklist, roadmap, file-overview, learning-guide, summary ve karar dosyaları güncellendi.
- Bu context’te ek olarak simülasyon parametreleri env/README/requirements/project-report dosyalarına işlendi ve doc-maintenance gereksinimleri uygulandı.
- Monitoring ekranı için dinamik 1/6/12/24 saatlik telemetry pencereleri ve son 7 güne ait saatlik ortalama + uptime trend kartı eklendi; backend `/board/machines/:id/telemetry` ve yeni `/board/machines/:id/trend` endpointleri bu akışı destekliyor.

### Alınan Kararlar

- Üretim simülasyonu `data-gen` + `job-sim` sıralı akışına bağlandı; telemetry sinyali 1 değilse üretim yapılmıyor.
- Frontend Production sayfası TanStack Table + aksiyon dialog pattern’i ile zorunlu standart olarak tanımlandı.
- OEE processor yalnızca aktif iş emri yürütülürken sinyal 0 serilerinde downtime açacak, job yoksa makine status’ü IDLE’da kalacak.
- Data-gen script’i makinenin `status/currentJobOrder` bilgisine göre aktif/idle metrik profilleri arasında `DATA_GEN_TRANSITION_MS` süresince ramp-up/ramp-down uygulayacak; telemetry değerleri monitoring grafiğinde hızlı tepki verecek.
- Monitoring ekranı kullanıcıya zaman aralığı seçtirme (1/6/12/24 saat) ve Trend kartında gerçek telemetry ortalamalarını + uptime yüzdesini gösterme kararıyla genişletildi.

### Sonraki Adımlar

- Reports backend/frontend genişletmesi ve export/audit ekranları.
- Production telemetri/makine durum senkronunun gözlemlenmesi; gerekirse OEE/config/data-gen iyileştirmeleri (saha verisi ile ince ayar).
- Test/lint altyapısı ve cookie tabanlı auth hazırlıkları.
- Monitoring trend ekranı için saha verisine göre metrik setini genişletme, Reports modülü için entegrasyon.

---

## 📅 17 Kasım 2025 - Context Window #5

### Yapılanlar

- Tüm doküman güncelleme kurallarını içerik ile karşılaştırma yapıldı
- 21 MD dosyası kontrol edildi (içerik + güncelleme kuralları uyumu)
- decision-log.md tarih alanı kaldırılması doğrulandı
- project-checklist.md checkbox format örnekleri korundu doğrulandı
- doc-maintenance.md'ye "Genel Markdown Kuralları" bölümü eklendi (3 zorunlu kural)
- decision-log.md'ye "Markdown Doküman Kuralları" kararı eklendi

### Alınan Kararlar

- **Doküman sistemi tamamlandı:** doc-maintenance.md = trigger/router, her MD = kendi format kuralı
- **Güncelleme kuralları optimize edildi:** Descriptive ve detailed format korundu, minimizasyon yapılmadı
- **chat-summary.md güncel tutulacak:** Her context window sonunda oturum kaydı eklenecek
- **Markdown kuralları zorunlu:** (1) Başlıklarda noktalama yok, (2) Emoji yok, (3) Kod bloklarında dil belirt (text/bash/javascript vb.)

### Dokümantasyon Durumu

- ✅ 20/21 dosya güncelleme kurallarına %100 uyumlu
- ✅ decision-log.md: Tarih alanı yok (Domain/Karar/Gerekçe/Etki) + Markdown kuralları kararı eklendi
- ✅ project-checklist.md: Checkbox format örnekleri korunmuş
- ✅ Tüm MD dosyaları "Güncelleme Kuralları" bölümüne sahip
- ✅ doc-maintenance.md: Genel Markdown Kuralları bölümü eklendi

### Sonraki Adımlar

- Production domain implementasyonu (JobOrder + ProductionEvent modelleri)
- Reports backend entegrasyonu
- Audit Log UI geliştirmesi

---

## 📅 16 Kasım 2025 - Context Window #4

### Yapılanlar

- Context başlatma sistemi yeniden yapılandırıldı
- `context-initialization-prompt.md` sadeleştirildi (sadece yol haritası kaldı)
- `chat-summary.md` tarihsel log formatına çevrildi
- Backend/Frontend detayları `file-overview.md`'ye yönlendirildi
- Cross-domain bağımlılıklar `doc-maintenance.md`'ye referans verildi

### Alınan Kararlar

- **Context init rolü:** Sadece "hangi dosyalar okunmalı" rehberi olacak
- **Chat summary rolü:** Her context window sonunda güncellenen tarihsel kayıt
- **Detay kaynakları:** file-overview, learning-guide, doc-maintenance dosyaları kullanılacak

### Dokümantasyon Güncellemeleri

- ✅ `context-initialization-prompt.md` → 600+ satırdan ~200 satıra düştü
- ✅ `chat-summary.md` → Yeni format uygulandı
- ✅ `doc-maintenance.md` → Cross-domain referansları eklendi
- ✅ `project-guidelines.md` → Doküman haritası güncellendi

### Sonraki Adım

Reports backend entegrasyonu veya Audit Log UI geliştirmesi

---

## 📅 15 Kasım 2025 - Context Window #3

### Yapılanlar

- Monitoring UI tamamlandı (canlı telemetry grafikler, 2sn polling)
- Monitoring grafikleri time-scale X ekseni ile güncellendi
- Dashboard gerçek veriye bağlandı (10sn polling)
- Parts domain kategori sistemi eklendi (fasteners, electronics, mechanical_plastics)
- OEE background job devreye alındı

### Alınan Kararlar

- **Monitoring grafikler:** `telemetryWindowMs` backend'den alınacak, frontend senkron çalışacak
- **Parts kategorileri:** Sabit sözlük olacak, dinamik kategori ekleme ileride değerlendirilecek
- **OEE job:** Her 2 saniyede telemetry batch işleme yapacak

### Teknik Detaylar

- Recharts `type="number" scale="time"` kullanıldı
- `part-categories.js` constants dosyası oluşturuldu
- `oee-processor-job.js` server başlangıcında çalışıyor

### Sonraki Adım

Dashboard metrik kartlarını test et, Reports backend entegrasyonuna başla

---

## 📅 14 Kasım 2025 - Context Window #2

### Yapılanlar

- Machines domain tamamlandı (CRUD + events)
- OEE domain modelleri oluşturuldu (telemetry işleme altyapısı)
- Board domain API'si hazırlandı (`/api/board/metrics`)
- Parts domain CRUD tamamlandı
- Data generation script eklendi (`npm run data:gen`)

### Alınan Kararlar

- **Machine status:** Denormalize alanlar kullanılacak (`lastEventAt`, `status`)
- **Telemetry:** `machine_telemetry` koleksiyonu, 0/1 sinyal değeri
- **OEE işleme:** Batch processing, `oee-rules.json` ile konfigure edilecek

### Teknik Detaylar

- `machine-model.js`: code (unique), name, status, lastEventAt
- `machine-telemetry-model.js`: signalValue, timestamp, metrics
- `oee-processor.js`: Downtime algılama mantığı

### Sonraki Adım

Monitoring UI geliştir, Dashboard'u gerçek veriye bağla

---

## 📅 13 Kasım 2025 - Context Window #1

### Yapılanlar

- Backend domain yapısına geçiş yapıldı
- Auth, Users, Access Control domainleri oluşturuldu
- Frontend auth entegrasyonu tamamlandı (SessionProvider)
- Users yönetim ekranı TanStack Table ile geliştirildi
- RBAC yönetim UI'sı eklendi (rol/permission CRUD)

### Alınan Kararlar

- **Domain yapısı:** `src/domains/<domain>/` klasör organizasyonu
- **Username bazlı login:** E-posta opsiyonel, username zorunlu
- **Viewer fallback:** Rol silindiğinde kullanıcılar viewer rolüne atanacak
- **Frontend auth:** localStorage + refresh token, cookie geçişi opsiyonel

### Teknik Detaylar

- JWT access token (kısa ömür) + refresh token (MongoDB'de hash'li)
- RBAC: `permissions → roles → users` zinciri
- SessionProvider backend yanıtını normalize ediyor
- axios interceptors 401'de session temizliyor

### Sonraki Adım

Machines domain geliştir, OEE altyapısını kur

---

## 📝 Daha Eski Kayıtlar

Daha önceki context window kayıtları için:

```
/home/kelesmert/Desktop/projects/hermes/docs/logs/chat-summary-OLD-BACKUP.md
```

---

**Son güncelleme:** 18 Kasım 2025  
**Context window sayısı:** 6  
**Proje durumu:** Production domain tamamlandı; Reports/Audit çalışmaları sırada

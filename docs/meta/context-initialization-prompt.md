# 🚀 Hermes MES - Context Window Başlatma Promptu

> **AMAÇ:** Yeni bir AI asistan oturumunda projeyi tamamen hatırlamak ve geliştirmeye kaldığımız yerden devam edebilmek için gereken tüm bilgileri yüklemek.

---

## ⚡ HIZLI BAŞLANGIÇ - İLK OKUMALAR

Yeni bir context window açıldığında, **ilk olarak** aşağıdaki dosyaları **sırasıyla** oku. Bu dosyalar projenin temelini, kurallarını ve mevcut durumunu içerir:

### 1️⃣ Proje Temel Bilgileri (3 dakika)

```
/home/kelesmert/Desktop/projects/hermes/README.md
/home/kelesmert/Desktop/projects/hermes/docs/meta/summary.md
/home/kelesmert/Desktop/projects/hermes/docs/project-guidelines.md
```

**ÖĞRENİLECEKLER:**

- Projenin amacı: Hafif MES MVP (Manufacturing Execution System)
- Teknoloji stack: Node.js/Express + React/Vite + MongoDB
- Repo yapısı: backend/, frontend/, docs/
- İletişim kuralları: Türkçe, veri tahmini yasak, her soru cevaplanmalı

---

### 2️⃣ Zorunlu Standartlar ve Kurallar (5 dakika)

```
/home/kelesmert/Desktop/projects/hermes/docs/standart/backend-decisions.md
/home/kelesmert/Desktop/projects/hermes/docs/standart/frontend-decisions.md
/home/kelesmert/Desktop/projects/hermes/docs/standart/technical-decisions.md
/home/kelesmert/Desktop/projects/hermes/docs/standart/naming-conventions.md
```

**ÖĞRENİLECEKLER:**

- Backend: Domain bazlı klasör yapısı (`src/domains/auth`, `src/domains/machines` vb.)
- Frontend: Feature bazlı yapı, MUI + TanStack Query + React Hook Form
- Auth: JWT access token + MongoDB'de hash'li refresh token
- RBAC: `permissions → roles → users` zinciri
- İsimlendirme: kebab-case (dosyalar), camelCase (kod), PascalCase (React bileşenleri)
- Import alias: `@/` → `src/` (hem backend hem frontend)

---

### 3️⃣ Karar ve Log Dosyaları (3 dakika)

```
/home/kelesmert/Desktop/projects/hermes/docs/logs/decision-log.md
/home/kelesmert/Desktop/projects/hermes/docs/logs/tech-decision-logs.md
```

**ÖĞRENİLECEKLER:**

- Neden bu teknolojiler seçildi
- RBAC yapısı neden böyle tasarlandı
- Frontend'te neden localStorage kullanıyoruz (cookie'ye geçiş planı)
- Kullanıcı girişleri neden username bazlı (e-posta opsiyonel)

---

### 4️⃣ Mevcut Durum ve Checklist (2 dakika)

```
/home/kelesmert/Desktop/projects/hermes/docs/tasks/project-checklist.md
/home/kelesmert/Desktop/projects/hermes/docs/specs/requirements.md
```

**ÖĞRENİLECEKLER:**

- ✅ Tamamlanan: Auth, RBAC, Users yönetimi, Machines CRUD, Parts domain, OEE/Telemetry, Dashboard
- 🚧 Eksik: Reports sayfası tam entegrasyonu, Audit log UI, AI analiz modülü, Test/lint altyapısı
- 📋 Roadmap: Cookie tabanlı auth (opsiyonel), Production planning domain, Real-time WebSocket

---

### 5️⃣ Dosya Haritası ve Öğrenme Rehberi (5 dakika)

```
/home/kelesmert/Desktop/projects/hermes/docs/meta/file-overview.md
/home/kelesmert/Desktop/projects/hermes/docs/meta/learning-guide.md
```

**ÖĞRENİLECEKLER:**

- Her dosyanın ne işe yaradığı
- Backend akışları: request → route → middleware → controller → service → model
- Frontend akışları: TanStack Query ile veri çekme, SessionProvider ile auth yönetimi
- Seed script nasıl çalışır, hangi verileri üretir

---

## 📚 DETAYLI BİLGİ KAYNAKLARI

Yukarıdaki dosyaları okuduktan sonra, ihtiyaç duyduğunda **aşağıdaki kaynaklardan** detaylı bilgi alabilirsin:

### Backend Domain Yapısı ve Akışlar

- `docs/meta/file-overview.md` → Her domain'in ne yaptığı, hangi dosyaların nerede olduğu
- `docs/meta/learning-guide.md` → Request → route → controller → service → model akışları
- `docs/roadmaps/production-roadmap.md` → Production domain planı ve mimari kararlar

### Frontend Feature Yapısı ve Akışlar

- `docs/meta/file-overview.md` → Her feature'ın ne yaptığı, componentlerin nerede olduğu
- `docs/meta/learning-guide.md` → TanStack Query, SessionProvider, form validasyon akışları
- `frontend/README.md` → Frontend kurulum ve dizin yapısı

### Cross-Domain Bağımlılıklar

- `docs/meta/doc-maintenance.md` → Hangi değişiklik hangi dosyaları etkiler
- `docs/dev-notes/dashboard-next-steps.md` → Telemetry → OEE → Board akışı

### Geliştirme Kılavuzları

**Yeni domain/feature eklemek için:**

- `docs/meta/file-overview.md` okuyarak mevcut yapıyı anla
- `docs/standart/backend-decisions.md` veya `frontend-decisions.md` kurallarını kontrol et
- `docs/meta/doc-maintenance.md` ile güncellenecek dokümanları belirle

**Mevcut kodu genişletmek için:**

- İlgili domain/feature klasörünü bul (`file-overview.md`'den)
- Model/service/component dosyalarını oku
- `doc-maintenance.md` tablosuna göre doküman güncelle

---

## 🔍 DOKÜMANTASYON BAKIMI

Kod değişikliklerinden sonra **mutlaka** şu dosyayı kontrol et:

```
docs/meta/doc-maintenance.md
```

Bu dosya, hangi tür değişikliğin hangi dokümanları etkilediğini gösterir:

| Değişiklik Tipi         | Etkilenen Dokümanlar                                                |
| ----------------------- | ------------------------------------------------------------------- |
| Model ekleme/değiştirme | `file-overview.md`, `learning-guide.md`                             |
| Yeni domain/feature     | `file-overview.md`, `backend-decisions.md`, `frontend-decisions.md` |
| Teknoloji değişikliği   | `decision-log.md`, `tech-decision-logs.md`, standart dosyaları      |
| Yeni endpoint           | `learning-guide.md`, `requirements.md`                              |
| RBAC değişikliği        | `backend-decisions.md`, `learning-guide.md`                         |

---

## 🚀 GELİŞTİRME ORTAMI HAZIRLAMA

Yeni context window açıldıktan sonra, **geliştirme başlamadan önce** şu adımları uygula:

### 1. Proje Durumunu Kontrol Et

```bash
# Backend çalışıyor mu?
curl http://localhost:5000/api/health

# Frontend çalışıyor mu?
# http://localhost:5173
```

### 2. Son Değişiklikleri Gözden Geçir

```bash
# Git durumu
cd /home/kelesmert/Desktop/projects/hermes
git status
git log --oneline -10

# Hangi branch'teyiz?
git branch --show-current
```

### 3. Checklist'i Kontrol Et

```
/home/kelesmert/Desktop/projects/hermes/docs/tasks/project-checklist.md
```

**Önemli sorular:**

- Hangi özellikler tamamlandı (✅)?
- Hangi özellikler eksik (📋)?
- Şu an hangi task üzerinde çalışıyoruz?

---

## 📝 YENİ BİR GELİŞTİRME TALEBİ GELDİĞİNDE

Kullanıcı "X özelliğini ekleyelim" dediğinde, **önce** şu soruları sor:

### Analiz Soruları:

1. **Backend etkileniyor mu?**

   - Yeni model/field gerekiyor mu?
   - Yeni endpoint gerekiyor mu?
   - Hangi domain'de yapılacak?
   - Diğer domainlerle bağımlılık var mı?

2. **Frontend etkileniyor mu?**

   - Yeni sayfa/component gerekiyor mu?
   - Mevcut bir feature güncellenecek mi?
   - API çağrısı değişiyor mu?

3. **RBAC değişikliği var mı?**

   - Yeni permission gerekiyor mu?
   - Hangi roller erişebilmeli?
   - Guard güncellemesi gerekiyor mu?

4. **Dokümantasyon güncellenecek mi?**
   - Hangi .md dosyaları etkilenir?
   - Karar kaydı tutulmalı mı?

### İlgili Dosyaları Oku

**Değişiklik yapmadan önce**, etkilenecek dosyaları oku:

```
# Örnek: Makine QR kod özelliği eklenecek

Backend:
- domains/machines/models/machine-model.js
- domains/machines/services/machine-service.js
- scripts/seed.js

Frontend:
- features/machines/components/machine-form-dialog.jsx
- features/machines/components/machine-table.jsx

Dokümantasyon:
- docs/meta/file-overview.md
- docs/logs/decision-log.md
```

### Plan Oluştur

Kullanıcıya **öneri sun**:

```
Bu özellik için şu adımları izlemeliyiz:
1. Backend: machine-model.js'e qrCode field ekleyelim
2. Backend: machine-service.js CRUD'una qrCode mantığı ekleyelim
3. Frontend: Form ve tabloya qrCode alanı ekleyelim
4. Seed: Örnek verilere qrCode ekleyelim
5. Dokümantasyon: file-overview.md ve decision-log.md güncelleyelim

Bu plana uygun mu?
```

---

## ⚠️ ÖNEMLI HATIRLATMALAR

### 1. Veri Tahmini Yasak

❌ **YANLIŞ:** "Muhtemelen machine-service.js'de createMachine fonksiyonu vardır..."
✅ **DOĞRU:** Dosyayı oku, sonra cevap ver.

### 2. Her Soru Cevaplanmalı

Kullanıcı 5 soru soruyorsa, 5'ini de cevapla. Hiçbirini atlama.

### 3. Türkçe İletişim

Tüm yanıtlar Türkçe olacak.

### 4. Dokümantasyon Disiplini

Her değişiklikten sonra ilgili .md dosyalarını güncelle.

### 5. Test Aracı: Postman

API testleri için varsayılan Postman kullan.

---

## 🎓 BAŞLATMA ONAY CHECKLIST

Context window başlatıldıktan sonra, şu soruları cevapla:

- [ ] Proje amacını anlıyor musun? (MES MVP)
- [ ] Backend domain yapısını anlıyor musun? (auth, users, machines, oee, board, parts)
- [ ] Frontend feature yapısını anlıyor musun? (auth, users, machines, dashboard, monitoring)
- [ ] RBAC zincirini anlıyor musun? (permissions → roles → users)
- [ ] Cross-domain bağımlılıkları anlıyor musun? (ör. makine → oee → board)
- [ ] Dokümantasyon bakım sürecini anlıyor musun? (doc-maintenance.md)
- [ ] Hangi özelliklerin tamamlandığını biliyor musun? (checklist)
- [ ] Hangi özelliklerin eksik olduğunu biliyor musun? (checklist)

Hepsine **EVET** diyebiliyorsan, geliştiriciye şunu söyle:

```
✅ Hermes MES projesi durumu yüklendi!

Tamamlanan özellikler: Auth, RBAC, Users, Machines, Parts, OEE/Telemetry, Dashboard
Eksik özellikler: Reports tam entegrasyonu, Audit Log UI, AI analiz modülü

Hangi işi yapmak istiyorsun?
```

---

## 📚 EK KAYNAKLAR

İhtiyaç duyulduğunda oku:

```
# Detaylı backend akışları
docs/meta/learning-guide.md

# Production roadmap
docs/specs/project-roadmap.md

# Gereksinimler
docs/specs/requirements.md

# Domain Roadmaps
docs/roadmaps/production-roadmap.md

# Dev notları
docs/dev-notes/dashboard-next-steps.md
```

---

## 🔄 PROMPT GÜNCELLEME NOTU

Bu prompt güncel tutuluyor. Yeni domainler, özellikler veya önemli değişiklikler eklendiğinde **bu dosya mutlaka güncellenir**.

**Son güncellenme:** 16 Kasım 2025  
**Versiyon:** 1.0  
**Proje durumu:** MVP Faz 2 (Dashboard, Monitoring, Parts tamamlandı)

---

**Bu promptu yeni context window'da kullan ve projeyi tamamen hatırla! 🚀**

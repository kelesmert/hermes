# Hermes MES - Context Window Başlatma Promptu

> **AMAÇ:** Yeni bir AI asistan oturumunda projeyi verimli şekilde yüklemek. İlk okuma ile temel yapıyı anla, sonra task bazlı detaylı okumalar yap.

## Güncelleme Kuralları

**Ne zaman güncellenir:** Yeni kritik dosya eklendiğinde, okuma sırası değiştiğinde, büyük yapısal değişiklik olduğunda.

**Format:** Dosya yolu + "Ne öğrenilecek" açıklaması, önem sırasına göre sırala.

**Önemli:** Bu dosya sadece "hangi dosyalar okunmalı" rehberidir. Detay bilgi içermez, sadece yönlendirir.

---

## STRATEJI: Verimli Context Yükleme

**İlk Aşama (TEMEL YÜKLEME):**

- Projenin temelini anlamak için minimum dosya oku
- Amaç: "Ne yapıyoruz, nasıl yapıyoruz, nerede kaldık?" sorularını cevapla
- Detaylara girme, sadece genel yapıyı kavra

**İkinci Aşama (TASK BAZLI DETAY):**

- Kullanıcı spesifik task/soru sorduğunda ilgili dosyaları TAM detay ile oku
- Örnek: "Parts domain'i genişlet" → parts ile ilgili TÜM dosyaları oku
- Örnek: "Dashboard'a yeni metrik ekle" → dashboard/board/oee dosyalarını oku

**Bu yaklaşım neden verimli:**

- Token tasarrufu: İlk aşamada minimum okuma
- Yüksek kalite: Task geldiğinde tam detay okuma
- Hızlı başlangıç: Kullanıcı beklemeden hazır

---

## AŞAMA 1: TEMEL YÜKLEME

Yeni context window açıldığında şu dosyaları sırasıyla oku:

```text
docs/meta/summary.md
docs/project-guidelines.md
docs/specs/requirements.md
docs/tasks/project-checklist.md
docs/meta/file-overview.md
docs/meta/doc-maintenance.md
docs/logs/chat-summary.md
```

**Bu 7 dosyadan öğrenilecekler:**

### summary.md

- Projenin amacı: MES MVP
- Teknoloji stack: Node.js/Express + React/Vite + MongoDB
- Repo yapısı: backend/, frontend/, docs/
- Tamamlanan domainler: Auth, Access Control, Users, Machines, Parts, Production, OEE, Board, Downtime, Dashboard

### project-guidelines.md

- İletişim kuralları: Türkçe, veri tahmini yasak, her soru cevaplanmalı
- Doküman haritası: Hangi dosya nerede
- Temel mimari kararlar
- Politika kuralları

### requirements.md

- Fonksiyonel gereksinimler: Auth, RBAC, Dashboard, Makine İzleme, Parts, Raporlama, AI
- Kullanıcı rolleri: Master, Supervisor, Operator, Viewer
- Veri modeli: users, roles, permissions, machines, machine_events, machine_telemetry, parts, job_orders, production_events, planned_downtime_rules, planned_downtime_runs
- RBAC zinciri: permissions → roles → users
- Cross-domain ilişkiler: Machines → Parts → JobOrders

### project-checklist.md

- Nerede kaldık: Tamamlanan taskler
- Ne eksik: Bekleyen taskler
- İleride: Opsiyonel taskler

### file-overview.md

- Hangi dosya nerede: Backend domain yapısı, Frontend feature yapısı
- Her dosyanın görevi: Model/service/controller/component açıklamaları
- Klasör organizasyonu: src/domains/, src/features/, scripts/

### doc-maintenance.md

- Hangi değişiklik hangi dokümanları etkiler
- Güncelleme türleri: Karar/Tamamlandı/Gelecek
- Domain tespiti
- Markdown kuralları (noktalama yok, emoji yok, kod bloklarında dil belirt)

### chat-summary.md

- Önceki context'lerde neler konuşuldu
- Hangi kararlar alındı
- Tarihsel gelişim

**SONUÇ:** Bu 7 dosyayla proje %80-85 anlaşılır. Gereksinimler, veri modeli, dosya yapısı ve tamamlanan işler bilinir. Detaylara girmeden geliştirmeye başlayabilirsin.

---

## AŞAMA 2: TASK BAZLI DETAY OKUMA

Kullanıcı spesifik bir task/soru sorduğunda, o konuyla ilgili dosyaları TAM detay ile oku.

### Backend Task İçin Oku

```text
docs/standart/backend-decisions.md
docs/standart/naming-conventions.md
docs/meta/file-overview.md (backend bölümü)
docs/meta/learning-guide.md (backend akışları)
docs/logs/decision-log.md (backend kararları)
backend/README.md
```

**İlgili domain için:**

```text
backend/src/domains/[domain]/models/
backend/src/domains/[domain]/services/
backend/src/domains/[domain]/controllers/
backend/src/domains/[domain]/routes/
```

### Frontend Task İçin Oku

```text
docs/standart/frontend-decisions.md
docs/standart/naming-conventions.md
docs/meta/file-overview.md (frontend bölümü)
docs/meta/learning-guide.md (frontend akışları)
docs/logs/decision-log.md (frontend kararları)
frontend/README.md
```

**İlgili feature için:**

```text
frontend/src/features/[feature]/
frontend/src/components/
```

### Ortak/Teknik Task İçin Oku

```text
docs/standart/technical-decisions.md
docs/specs/requirements.md
docs/specs/project-roadmap.md
docs/logs/tech-decision-logs.md
```

### Cross-Domain Task İçin Oku

```text
docs/roadmaps/production-roadmap.md
docs/specs/downtime-design-v2.md
docs/dev-notes/downtime-smoke.md
docs/dev-notes/dashboard-next-steps.md
docs/meta/file-overview.md (TÜM dosya)
```

---

## HIZLI BAŞLANGIÇ SEÇENEKLERİ

Duruma göre farklı başlangıç seviyeleri:

### Seviye 1: Tam Yükleme (İlk Oturum)

```text
AŞAMA 1 (7 dosya) + docs/standart/ klasörünün tamamı
```

Proje %100 anlaşılır, her detay bilinir.

### Seviye 2: Hızlı Yükleme (Günlük Çalışma)

```text
AŞAMA 1 (7 dosya)
```

Temel bilgiler yüklenir, task gelince detay okunur.

### Seviye 3: Süper Hızlı (Kısa Kesinti)

```text
project-checklist.md + chat-summary.md (son entry)
```

Sadece nerede kaldık + son konuşmalar.

---

## GELIŞTIRME WORKFLOW

### 1. Kullanıcı Task/Soru Sorduğunda

**Önce analiz et:**

- Backend mi? Frontend mi? Ortak mı?
- Hangi domain/feature etkileniyor?
- Cross-domain bağımlılık var mı?

**Sonra ilgili dosyaları oku:**

- AŞAMA 2'deki ilgili bölüme git
- O konuyla ilgili TÜM dosyaları oku
- Kod dosyalarını da oku (gerekirse)

**Örnek: "Machines domain'ine QR kod ekle" talebi geldi**

1. Backend task olduğunu anla
2. Oku:
   - `backend-decisions.md`
   - `naming-conventions.md`
   - `backend/src/domains/machines/models/machine-model.js`
   - `backend/src/domains/machines/services/machine-service.js`
   - `backend/src/domains/machines/controllers/machine-controller.js`
   - `scripts/seed.js`
3. Frontend'i de etkilediğini anla
4. Oku:
   - `frontend/src/features/machines/`
5. Plan oluştur, uygula

### 2. Kod Değişikliği Yaptıktan Sonra

**doc-maintenance.md'ye bak:**

- Hangi dokümanlar güncellenmeli?
- Format nasıl olmalı?

**İlgili dokümanları güncelle:**

- decision-log.md (karar alındıysa)
- file-overview.md (yeni dosya eklendiyse)
- project-checklist.md (task tamamlandıysa)

---

## ÖNEMLI HATIRLATMALAR

### Veri Tahmini Yasak

Dosyayı okumadan asla tahmin yapma. "Muhtemelen X vardır" deme, oku ve kontrol et.

### Her Soru Cevaplanmalı

Kullanıcı 5 soru soruyorsa, 5'ini de cevapla. Hiçbirini atlama.

### Türkçe İletişim

Tüm yanıtlar Türkçe.

### Dokümantasyon Disiplini

Her değişiklikten sonra ilgili MD dosyalarını güncelle. doc-maintenance.md rehber.

### Markdown Kuralları

- Başlıklarda noktalama işareti yok
- Emoji kullanma
- Kod bloklarında dil belirt (text/bash/javascript/json vb.)

---

## BAŞLATMA ONAY CHECKLIST

Context yüklendikten sonra kendine sor:

- [ ] Proje amacını anlıyor musun? (MES MVP)
- [ ] Backend domain yapısını anlıyor musun? (auth, access-control, users, machines, oee, board, parts, production)
- [ ] Frontend feature yapısını anlıyor musun? (auth, users, machines, parts, production, dashboard, monitoring, reports)
- [ ] RBAC zincirini anlıyor musun? (permissions → roles → users)
- [ ] Hangi özelliklerin tamamlandığını biliyor musun?
- [ ] Hangi özelliklerin eksik olduğunu biliyor musun?
- [ ] doc-maintenance sistemini anlıyor musun?
- [ ] Markdown kurallarını biliyor musun?

Hepsine EVET ise kullanıcıya söyle:

```text
Hermes MES projesi yüklendi.

Tamamlanan: Auth, RBAC, Users, Machines, Parts, OEE/Telemetry, Board, Production, Dashboard, Monitoring
Eksik: Reports tam entegrasyonu, Audit Log UI, AI analiz modülü
Roadmap: cookie auth (opsiyonel)

Hangi konuda çalışmak istiyorsun?
```

---

## REFERANS: TÜM DOKÜMAN LİSTESİ

### Zorunlu Okuma (İlk Aşama)

```text
docs/meta/summary.md
docs/project-guidelines.md
docs/specs/requirements.md
docs/tasks/project-checklist.md
docs/meta/file-overview.md
docs/meta/doc-maintenance.md
docs/logs/chat-summary.md
```

### Backend İçin

```text
docs/standart/backend-decisions.md
docs/standart/naming-conventions.md
docs/meta/file-overview.md
docs/meta/learning-guide.md
docs/logs/decision-log.md
backend/README.md
```

### Frontend İçin

```text
docs/standart/frontend-decisions.md
docs/standart/naming-conventions.md
docs/meta/file-overview.md
docs/meta/learning-guide.md
docs/logs/decision-log.md
frontend/README.md
```

### Ortak/Teknik

```text
docs/standart/technical-decisions.md
docs/specs/requirements.md
docs/specs/project-roadmap.md
docs/logs/tech-decision-logs.md
README.md
```

### Domain Roadmaps

```text
docs/roadmaps/production-roadmap.md
docs/dev-notes/dashboard-next-steps.md
```

---

**Son Güncelleme:** 17 Kasım 2025
**Versiyon:** 1.1
**Proje Durumu:** MVP Faz 2 (Auth, Users, Machines, Parts, OEE, Board, Production, Dashboard, Monitoring tamamlandı)

---

**STRATEJİ ÖZET:** Temel yükle (5 dosya) → Task gelince detay oku → Verimli context kullanımı

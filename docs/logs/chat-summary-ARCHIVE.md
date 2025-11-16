# Konuşma Özeti (Context Window)

> **⚠️ UYARI:** Bu dosya artık eski format. Detaylı proje durumu için **`docs/meta/context-initialization-prompt.md`** dosyasını kullan.

---

## 📊 Mevcut Proje Durumu (16 Kasım 2025)

### ✅ Tamamlanan Domainler

**Backend:**

- ✅ **Auth Domain:** JWT + refresh token, login/logout/refresh akışı çalışıyor
- ✅ **Users Domain:** Kullanıcı CRUD, rol atama, aktif/pasif toggle
- ✅ **Access Control Domain:** Rol ve permission yönetimi API'si (CRUD)
- ✅ **Machines Domain:** Makine CRUD, event yönetimi, durum takibi
- ✅ **Parts Domain:** Parça tanımları, kategori bazlı validasyon (fasteners, electronics, mechanical_plastics)
- ✅ **OEE Domain:** Telemetry işleme, downtime algılama, background job
- ✅ **Board Domain:** Dashboard metrikleri API'si (/api/board/metrics)

**Frontend:**

- ✅ **Auth Feature:** Login/logout, SessionProvider, token refresh
- ✅ **Users Feature:** TanStack Table ile liste, CRUD dialogları, rol/permission yönetimi
- ✅ **Machines Feature:** Makine listesi, CRUD, event diyaloğu
- ✅ **Parts Feature:** Parça listesi, kategori bazlı form, CRUD
- ✅ **Dashboard Feature:** Metrik kartları, makine trend grafikleri, 10sn polling
- ✅ **Monitoring Feature:** Canlı telemetry izleme, Recharts grafikler, 2sn polling

### 🚧 Eksik/Bekleyen Özellikler

- ⏳ **Reports Feature:** UI placeholder var, backend entegrasyonu eksik
- ⏳ **Audit Log:** Middleware planlandı, UI yok
- ⏳ **AI Analysis Module:** Roadmap'te, henüz başlanmadı
- ⏳ **Test/Lint Altyapısı:** ESLint/Prettier/Jest konfigürasyonu beklemede
- ⏳ **Cookie-based Auth:** Opsiyonel iyileştirme, şimdilik localStorage kullanılıyor

---

## 🏗️ Mimari Özet

### Backend Domain Yapısı

```
domains/
├── auth/          → JWT, refresh token, RBAC
├── users/         → Kullanıcı CRUD
├── access-control/ → Rol/permission yönetimi
├── machines/      → Makine + event + telemetry
├── parts/         → Parça tanımları
├── oee/           → Telemetry işleme, downtime algılama
└── board/         → Dashboard metrikleri
```

### Frontend Feature Yapısı

```
features/
├── auth/          → Login/logout akışı
├── users/         → Kullanıcı yönetimi UI
├── machines/      → Makine yönetimi UI
├── parts/         → Parça yönetimi UI
├── dashboard/     → Metrik kartları
├── monitoring/    → Canlı telemetry grafikler
└── reports/       → Raporlama (placeholder)
```

---

## 🔗 Kritik Bağımlılıklar

### Telemetry → OEE → Dashboard Akışı

```
1. data-gen.js (scripts)
   → MachineTelemetry koleksiyonu

2. oee-processor.js (background job)
   → Telemetry batch işleme
   → Downtime algılama
   → MachineEvent oluşturma

3. oee-dashboard-service.js
   → Metrik hesaplama
   → board-service.js → /api/board/metrics

4. Dashboard (frontend)
   → 10sn polling ile metrik kartları güncelleme
```

### Auth → RBAC Zinciri

```
permissions (machines.read, users.manage vb.)
    ↓
roles (master, supervisor, operator, viewer)
    ↓
users (en az bir rol zorunlu)
    ↓
SessionProvider (frontend)
    ↓
PermissionGuard (route protection)
```

---

## 📝 Son Önemli Değişiklikler

1. **Parts Domain Kategorileri:** Sabit kategori sözlüğü eklendi (fasteners, electronics, mechanical_plastics)
2. **Monitoring Grafikler:** Time-scale X ekseni, backend `telemetryWindowMs` ile senkron çalışıyor
3. **OEE Job:** Background job ile telemetry otomatik işleniyor, downtime otomatik algılanıyor
4. **Username Bazlı Login:** E-posta opsiyonel, kullanıcı adı zorunlu
5. **Viewer Fallback:** Rol silindiğinde kullanıcılar otomatik viewer rolüne atanıyor

---

## 🚀 Yeni Context Window İçin

**Bu dosya yerine şu promptu kullan:**

```
/home/kelesmert/Desktop/projects/hermes/docs/meta/context-initialization-prompt.md
```

Bu prompt:

- ✅ Tüm domain/feature yapısını detaylı açıklıyor
- ✅ Cross-domain bağımlılıkları haritalıyor
- ✅ Geliştirme senaryoları sunuyor
- ✅ Dokümantasyon bakım rehberi içeriyor
- ✅ Adım adım başlatma talimatları veriyor

---

## 📚 Hızlı Referans

| İhtiyaç              | Dosya                                            |
| -------------------- | ------------------------------------------------ |
| Proje özeti          | `docs/meta/summary.md`                           |
| Backend kuralları    | `docs/standart/backend-decisions.md`             |
| Frontend kuralları   | `docs/standart/frontend-decisions.md`            |
| Kararlar             | `docs/logs/decision-log.md`                      |
| Checklist            | `docs/tasks/project-checklist.md`                |
| Dosya haritası       | `docs/meta/file-overview.md`                     |
| Öğrenme rehberi      | `docs/meta/learning-guide.md`                    |
| **Context başlatma** | **`docs/meta/context-initialization-prompt.md`** |

---

**Son güncelleme:** 16 Kasım 2025  
**Durum:** MVP Faz 2 tamamlandı (Dashboard, Monitoring, Parts)  
**Sonraki adım:** Reports backend entegrasyonu veya Audit Log UI

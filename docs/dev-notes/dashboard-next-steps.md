# Dashboard / Telemetry – Sıradaki Adımlar

## Güncelleme Kuralları

**Ne zaman güncellenir:** Yeni TODO/bug/iyileştirme eklendiğinde, TODO tamamlandığında.

**Format:** Maddeli liste, checkbox kullan ([ ] / [x]), kısa ve öz.

**Önemli:** Bu dosya GEÇİCİ notlardır. TODO'lar tamamlanınca dosya sılınebilir veya arkaive taşınabilir. Kalıcı bilgiler diğer dokümanlara taşınmalı.

---

Bu not, telemetry → OEE → board akışına dair planlanan iyileştirmeleri ve nerede tutulduklarını hızlıca hatırlatmak için yazıldı.

## Bugs / İyileştirmeler

- **Reason Code & OEE genişletmesi:** `oee-rules.json` içindeki reason sözlüğü detaylandırılacak, planlı/plansız/sla ihlali gibi kategori eşlemeleri netleşecek. OEE servisinin `/api/board/machines/:id/metrics` yanıtına duruş sayısı/süresi eklenecek.
- **Reports ekranı:** `/reports` sayfası board/OEE verisine bağlanacak; downtime listesi, telemetry trend tablosu vb. için API ihtiyaçları belirlenecek (muhtemel yeni endpoint: `/api/reports/downtimes`).
- **Data-gen gerçekçilik:** Delta ayarları `.env` ile yönetiliyor (`DATA_GEN_*_DELTA`); ileride makine bazlı profil veya iş emri entegrasyonu gerektiğinde script genişletilecek.
- **Veri yok → alarm:** OEE tarafındaki `signalTimeoutMs` kuralı downtime oluşturuyor; ayrıca “telemetry akışı kesildi” alarmını board veya ayrı bir endpoint üzerinden raporlamak planlandı.
- **Monitoring grafikleri:** Frontend monitoring ekranı artık backend’in `telemetryWindowMs` değeriyle senkron çalışan time-scale X eksenine sahip. Sonraki adım olarak çoklu makine karşılaştırması, gradient vurgular veya alarm eşikleri için referans çizgileri eklenebilir (`frontend/src/features/monitoring/pages/monitoring.jsx`).
- **OEE Job Order Entegrasyonu:** OEE domain’ine iş emri (job order) yönetimi eklenecek; belirli duruş tiplerinde otomatik iş emri açma/güncelleme akışı tasarlanacak (ileride detaylandırılacak).

## Referanslar

- `scripts/data-gen.js` – Telemetry üretimi (`npm run data:gen`).
- `domains/oee/services/oee-processor.js` – Sinyal kuralları + downtime yönetimi.
- `domains/oee/services/oee-dashboard-service.js` – Dashboard hesaplamaları ve smoothing.
- `domains/board/routes/board-routes.js` – `/api/board/metrics`, `/api/board/machines/:id/metrics`, `/api/board/machines/:id/telemetry`.

Bu dosya yeni kararlar alındıkça güncellenecek; detaylı rehber için `docs/meta/learning-guide.md` ve `docs/meta/file-overview.md` dosyalarına bak.

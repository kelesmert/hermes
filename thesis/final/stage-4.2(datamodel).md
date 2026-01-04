1) Temel Varlıklar (Entity) ve Amaçları (kısa)

- Kullanıcı, rol ve izin varlıkları; kimlik doğrulama ve yetkilendirme için temel yapı taşlarını sağlar.
- Makine, telemetry ve makine event varlıkları; durum takibi, duruş kayıtları ve zaman serisi ölçümlerini saklar.
- Parça, iş emri ve üretim event varlıkları; üretim planı, çıktı ve kalite kayıtlarını izlenebilir hale getirir.
- Planlı duruş kuralı ve çalıştırma kayıtları; vardiya içinde otomatik planlı duruşların izini tutar.
- OEE makine durumu ve simülasyon state varlıkları; sinyal işleme ve simülasyon zaman ekseni için temel referans sağlar.
- AI insight ve kullanım kayıtları; üretilen içgörüleri ve maliyet/limit takibini kalıcılaştırır.
KANIT: backend/src/domains/**/models/*.js, docs/meta/file-overview.md

2) Model Listesi (tablo)

| Model | Domain | Amaç | Önemli Alanlar (top-level) | İlişkiler (ref) | Kanıt |
| --- | --- | --- | --- | --- | --- |
| User | auth | Kullanıcı hesabı ve kimlik bilgileri | username, firstName, lastName, email, passwordHash, roles, isActive, lastLoginAt | roles → Role | backend/src/domains/auth/models/user-model.js |
| Role | auth | Rol tanımı ve izin bağlama | name, label, description, permissions, isDefault | permissions → Permission | backend/src/domains/auth/models/role-model.js |
| Permission | auth | Sistem izinleri | name, label, description, category | — | backend/src/domains/auth/models/permission-model.js |
| RefreshToken | auth | Oturum yenileme kaydı | user, tokenHash, userAgent, ipAddress, expiresAt, revokedAt | user → User | backend/src/domains/auth/models/refresh-token-model.js |
| Machine | machines | Makine kimliği ve durumu | code, name, status, lastEventAt, tags, isActive, currentJobOrder, responsibleUser | currentJobOrder → JobOrder, responsibleUser → User | backend/src/domains/machines/models/machine-model.js |
| MachineTelemetry | machines | Makine zaman serisi ölçümleri | machine, jobOrder, timestamp, signalValue, metrics, intervalMs, source, simulationRunId, processedAt | machine → Machine, jobOrder → JobOrder | backend/src/domains/machines/models/machine-telemetry-model.js |
| MachineEvent | machines | Makine durum olayları / duruşlar | machine, state, reasonCode, reasonCategory, jobOrder, startedAt, endedAt, triggeredBy, source, metadata | machine → Machine, jobOrder → JobOrder, triggeredBy → User | backend/src/domains/machines/models/machine-event-model.js |
| Part | parts | Parça tanımı ve ideal süre | code, name, description, idealCycleTime, category, unit, tags, compatibleMachines, createdBy | compatibleMachines → Machine, createdBy → User | backend/src/domains/parts/models/part-model.js |
| JobOrder | production | İş emri ve üretim hedefi | orderNo, part, machine, targetQuantity, producedQuantity, goodQuantity, defectiveQuantity, status, assignedOperator, createdBy, startTime, endTime, metadata | part → Part, machine → Machine, assignedOperator → User, createdBy → User | backend/src/domains/production/models/job-order-model.js |
| ProductionEvent | production | Üretim ve kalite olayları | jobOrder, machine, eventType, quantity, qualityStatus, defectType, operator, timestamp, source | jobOrder → JobOrder, machine → Machine, operator → User | backend/src/domains/production/models/production-event-model.js |
| PlannedDowntimeRule | downtime | Planlı duruş kuralı | name, machineIds, reasonCode, reasonCategory, priority, timezone, type, recurrence, startAt, endAt, isActive, createdBy | machineIds → Machine, createdBy → User | backend/src/domains/downtime/models/planned-downtime-rule-model.js |
| PlannedDowntimeRun | downtime | Planlı duruş çalıştırma kaydı | ruleId, machineId, scheduledStartAt, scheduledEndAt, status, machineEventId, jobOrderId, notes | ruleId → PlannedDowntimeRule, machineId → Machine, machineEventId → MachineEvent, jobOrderId → JobOrder | backend/src/domains/downtime/models/planned-downtime-run-model.js |
| OeeMachineState | oee | Sinyal işleme durumu | machine, lastSignalValue, lastSignalAt, zeroSequenceStart, currentState, openEvent | machine → Machine, openEvent → MachineEvent | backend/src/domains/oee/models/oee-machine-state-model.js |
| SimulationState | simulations | Simülasyon takvimi ve cursor | key, timezone, epochDate, shiftStart, shiftEnd, virtualDay, shiftStartAt, shiftEndAt, cursorAt, simulationRunId, status, metadata | — | backend/src/domains/simulations/models/simulation-state-model.js |
| AiInsight | ai | AI analiz sonuç kaydı | useCase, createdBy, machineId, downtimeId, source, window, windowKey, dataSnapshotHash, promptVersion, model, output, generatedAt, expiresAt | createdBy → User, machineId → Machine, downtimeId → MachineEvent | backend/src/domains/ai/models/ai-insight-model.js |
| AiUsage | ai | AI kullanım ve limit kaydı | createdBy, useCase, source, machineId, downtimeId, windowKey, promptVersion, model, cacheHit, latencyMs, tokensIn/out, estimatedCostUsd, rateLimitState, expiresAt | createdBy → User, machineId → Machine, downtimeId → MachineEvent, insightId → AiInsight | backend/src/domains/ai/models/ai-usage-model.js |

3) Zaman Serisi / Olay Kaydı Yaklaşımı (telemetry/event)

Makine telemetry kayıtları zaman serisi mantığında tutulur ve her kayıt bir timestamp ile ilişkilidir. Makine event kayıtları ise durum değişimi veya duruş gibi olayları başlangıç/bitiş zamanlarıyla temsil eder. Üretim event’leri, iş emri üzerinde gerçekleşen üretim ve kalite olaylarını ayrı bir zaman çizgisinde kaydeder. Bu yaklaşım, “ham sinyal” ile “yorumlanan olay” katmanlarını ayırır ve metrik hesaplamaların izlenebilir olmasını sağlar. Simülasyon state kaydı, zaman ekseninin deterministik ve tekrar üretilebilir şekilde ilerlemesine hizmet eder. AI insight ve kullanım kayıtları ise analizlerin tarihsel izini sürer ve tekrar kullanım/caching için referans oluşturur.
KANIT: backend/src/domains/machines/models/machine-telemetry-model.js, backend/src/domains/machines/models/machine-event-model.js, backend/src/domains/production/models/production-event-model.js, backend/src/domains/simulations/models/simulation-state-model.js, backend/src/domains/ai/models/ai-insight-model.js

4) Veri Tutarlılığı ve İzlenebilirlik İlkeleri (repo dokümanlarından)

Duruşların planned/unplanned ayrımı ve reasonCode kullanımı, OEE’nin açıklanabilirliğini artırmak için dokümantasyon düzeyinde tanımlanmıştır. Telemetry kaynakları (shift-sim, data-gen, mock-batch) ile üretim ve OEE penceresi arasında uyum hedeflenir ve kaynak seçimi UI üzerinden kontrol edilir. Job order ve production event kayıtları, üretim miktarı ve kalite verisini izlenebilir kılacak şekilde tasarlanmıştır. Simülasyon clock yaklaşımı, tarih-saat tutarlılığını ve tekrarlanabilirliği sağlar. OEE hesaplama pencereleri ve shift kuralları, dokümanlarda tek kaynak olarak tanımlanmış ve tutarlılık ilkesi vurgulanmıştır. AI analizlerinde data snapshot hash kullanımı, verinin değişip değişmediğini kontrol ederek doğrulanabilirlik sağlar.
KANIT: docs/specs/downtime-design-v2.md, docs/specs/oee-design.md, docs/specs/sim-clock.md, docs/specs/mock-data.md, docs/specs/ai-dev.md, docs/meta/summary.md

KANIT: backend/src/domains/**/models/*.js, docs/meta/file-overview.md, docs/specs/requirements.md

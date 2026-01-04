1) Mimari Genel Bakış

Sistem, backend, frontend ve veri katmanından oluşan üç katmanlı bir mimari ile tasarlanmıştır. Backend Node.js/Express ve MongoDB üzerinde çalışır; frontend ise React tabanlı tek sayfa uygulamasıdır. Veri üretimi gerçek cihazlardan değil, simülasyon script’lerinden gelir ve bu veriler sistemin tüm akışını besler. Mimari yaklaşım, bir mezuniyet projesi kapsamında çekirdek işlevleri gösteren “hafif MES MVP” hedefiyle uyumludur. Tamamlanan kısımlar arasında kimlik doğrulama, rol/izin yönetimi, üretim akışı, duruş yönetimi ve OEE hesapları yer alır. Planlanan kısımlar arasında export/audit log ve ileri seviye AI use case’leri bulunmaktadır.
KANIT: README.md, docs/meta/summary.md, docs/specs/project-roadmap.md

2) Backend Katmanları ve Sorumluluklar

Backend, domain bazlı modüler bir yapıda organize edilmiştir ve her domain kendi API, iş kuralları ve veri modelini barındırır. Kimlik doğrulama ve RBAC katmanı, tüm domain’lere erişim kontrolü sağlar. Üretim, duruş ve OEE gibi süreçler ayrı domain’ler olarak ele alınmış, bu sayede sorumluluklar ayrıştırılmıştır. Telemetry ve event verileri, OEE hesaplama ve dashboard metriklerinde ortak bir veri akışına bağlanır. Tamamlanan backend domain’leri; auth, users, machines, parts, production, downtime, simulations, board ve OEE olarak görünmektedir. AI domain’i temel seviyede (U1) uygulanmış, ileri use case’ler planlıdır.
KANIT: backend/src/routes/index.js, backend/src/domains, docs/meta/file-overview.md, docs/specs/project-roadmap.md

3) Frontend Katmanları ve Sorumluluklar

Frontend, feature modülleri üzerinden ilerleyen bir ekran mimarisiyle tasarlanmıştır. Her sayfa, ilgili backend domain’leriyle API üzerinden haberleşir ve yetki kontrolü route seviyesinde yapılır. İzleme, raporlama, üretim ve duruş yönetimi gibi iş akışları ayrı sayfalarda toplanmıştır. Simülasyon yönetimi ve AI hub gibi destekleyici ekranlar da uygulamaya eklenmiştir. Tamamlanan ekranlar arasında dashboard, monitoring, reports, job orders ve downtimes bulunur. Planlanan ekranlar arasında export ve audit log gibi rapor genişletmeleri yer alır.
KANIT: frontend/src/App.jsx, frontend/src/features, docs/meta/summary.md, docs/specs/project-roadmap.md

4) Domain/Feature Modülerlik Haritası

Domain modülerlik yaklaşımı, backend’de auth, users, access-control, machines, parts, production, downtime, oee, simulations, board ve ai olarak ayrışmaktadır. Frontend tarafında bu domain’ler, feature klasörleri ile paralel şekilde organize edilmiştir. Bu eşleşme, işlevsel bağımsızlık ve bakım kolaylığı sağlar. Üretim akışı (job order + production events) ve duruş yönetimi (planned/unplanned) ayrı domain’ler olarak yönetilmektedir. OEE hesaplama, telemetry ve event verilerini bir araya getiren üst seviye bir domain olarak konumlanmıştır. AI domain’i, diğer domain’lerden veri toplayan merkezî bir katman olarak tasarlanmıştır.
KANIT: backend/src/domains, frontend/src/features, docs/meta/file-overview.md

5) Veri Akışı: Telemetry → Event → Metrik → UI (kavramsal)

Simülasyon script’leri, makine telemetry verilerini üretir ve veritabanına yazar. Telemetry verileri, OEE processor tarafından işlenir ve duruş/event kayıtlarına dönüştürülür. Üretim akışı, job order ve production event kayıtlarıyla izlenebilir hale gelir. OEE hesaplama servisi, telemetry, event ve üretim verilerini birleştirerek A/P/Q metriklerini üretir. Bu metrikler rapor ekranlarında gösterilirken, dashboard ve monitoring ekranları daha çok anlık görünürlüğe odaklanır. Böylece veri akışı, ham telemetry’den metrik ve görselleştirmeye kadar bütünleşik bir zincir oluşturur.
KANIT: docs/meta/summary.md, docs/specs/oee-design.md, docs/specs/downtime-design-v2.md, backend/src/domains/oee, backend/src/domains/machines

6) Genişletilebilirlik Noktaları (planlananlar dahil, etiketle)

Mevcut mimari, yeni domain veya ekran eklemeyi kolaylaştıracak şekilde modüler yapıdadır. Planlanan genişletmeler arasında rapor export, audit log ekranı ve AI U2/U3 use case’leri bulunmaktadır. Shift şablonları ve daha gelişmiş vardiya yönetimi, üretim planlama tarafında olası genişleme alanlarıdır. Ayrıca, veri kaynağı çeşitliliği (real-time vs mock) mimari düzeyde desteklendiği için farklı senaryolar eklenebilir. AI katmanının prompt ve sonuç versiyonlama yapısı, yeni analiz tiplerini eklemeyi mümkün kılar. Bu genişletilebilirlik, hem tez kapsamında hem de olası ileri geliştirmelerde yol gösterici bir yapı sunar.
KANIT: docs/specs/project-roadmap.md, docs/specs/ai-dev.md, docs/specs/oee-design.md, docs/specs/sim-clock.md

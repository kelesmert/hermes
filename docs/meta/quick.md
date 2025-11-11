# Telemetry & Sinyal İşleme Notları

## Telemetry Koleksiyonu Kararları

- Koleksiyon adı `machine_telemetry` olacak.
- Temel alanlar:
  - `machineId`: Mongoose ObjectId referansı.
  - `timestamp` (veya `capturedAt`): Ölçümün alındığı kesin zaman.
  - `signalValue`: 0 (stop) / 1 (run) gibi ham sinyal.
  - `metrics`: Esnek nesne; makinenin desteklediği sensörlere göre alanlar içerir. İlk etapta `temperatureC`, `torqueNm`, `energyKwh` zorunlu; ileride farklı metrikler eklenebilir.
  - Opsiyonel `intervalMs`: Ölçümün üretildiği periyot.
  - Opsiyonel `source`: Veriyi üreten kaynağı belirtir (`simulator`, `edge_gateway` vb.).
- Her makine oluşturulurken hangi metrikleri desteklediği seçilecek; bu seçim constants sözlüğünden gelecek. Telemetry kaydı yalnızca bu metrikleri doldurur.

## Event vs Telemetry Ayrımı

- Event dokümanı makinenin anlamlı durum değişimlerini taşır (`running`, `downtime`, `maintenance` vb.). `startedAt` ve `endedAt` süre hesapları ve OEE için kritik.
- Telemetry, makineden gelen ham sinyal ve sensör değerlerini taşır; event statüsü telemetry’den türetilecek.
- Event dokümanına telemetry snapshot embed edilmeyecek; tüm sensör verisi `machine_telemetry` koleksiyonunda tutulacak. Gerektiğinde OEE/domain servisleri event zamanlarıyla telemetry kayıtlarını eşleştirir.
- Event şeması şimdilik `state`, `startedAt`, `endedAt`, `reasonCode`, `description`, `source` gibi alanlarla sınırlı kalacak. Planlı/plansız duruş kategorisi reason sözlüğü üzerinden OEE domain’inde türetilecek; ileride gerekirse `reasonCategory` gibi alanlar eklenebilir.

## Sinyal İşleme Domaini

- 0/1 sinyalini değerlendiren kurallar (örn. 30 sn boyunca 0 → plansız duruş) makine domaininden bağımsız bir domain (`domains/oee`) altında çalışacak. Bu domain:
  1. Ham telemetry kayıtlarını dinler/okur.
  2. Konfigüre edilen kuralları uygular.
  3. Gerektiğinde yeni `machine_events` kayıtları oluşturur veya kapatır.
  4. OEE ve duruş analizlerini üretir.
- Bu domain telemetry kayıtlarını tüketir, kuralları uygular, gerektiğinde machine_events koleksiyonuna yeni kayıt açar/kapatır ve OEE hesaplarını dayanıklı biçimde sağlar.
- Kuralların parametrik olması (ör. downtime eşiği 30 sn) için JSON tabanlı bir konfigürasyon dosyası/collection kullanılacak; gerektiğinde yalnızca bu JSON düzenlenerek eşikler güncellenebilecek. İleride sadece duruş kurallarını yöneten ayrı bir domain kurgulamak mümkün.
- Kısa vadede telemetry tüketimi cron + polling yaklaşımıyla yapılacak: belirli aralıklarla (örn. 5-10 sn) son işlenen timestamp’ten sonraki kayıtlar çekilip kurallar uygulanır.
- Yoğun senaryoda telemetry queue + sliding window yaklaşımına geçilecek: yeni kayıtlar FIFO işlenir, time bucket’lar halinde batch’lenir, işlenen kayıtlar flag’lenir/arşivlenir ve özet tablolar güncellenir. Gerekirse bu yapı ileride mesaj kuyruğu veya change stream ile desteklenebilir.

## Dashboard / Board Domaini

- `domains/board` adıyla ayrı bir katman kurulacak; OEE domaininin ürettiği özet metrikleri toplayıp frontend’e özel endpointler (/api/board/metrics vb.) üzerinden sunacak.
- Dashboard tarafı başlangıçta 5-10 sn aralıklarla polling yapacak; ileride gerekirse websocket/SSE ile canlılık artırılabilir.

## Data Generator (data-gen)

- Sadece ham telemetry + sinyal değerlerini üretir; gerçek makine verisi gelene kadar sistemi canlı tutmak için kullanılacak.
- Uygulama ayaktayken ayrı bir süreç gibi çalıştırılır (seed değil); başlatıldığında periyodik olarak `machine_telemetry` koleksiyonuna yazmaya devam eder.
- Üretilen veriler `machine_telemetry` koleksiyonuna doğrudan Mongo insert olarak düşer; kurallar backend’de uygulanır. İleride ihtiyaç olursa ingest endpoint’i eklenebilir.

## Sonraki Adımlar

1. Telemetry şemasını kod tarafında tanımla (`machine_telemetry` modeli).
2. Machine event dokümanı için hangi ek alanlara ihtiyaç olduğuna karar ver (örn. reasonCategory).
3. Sinyal işleme/OEE domain yapısını ve konfig stratejisini tasarla.
4. Board API’sinin telemetriyi nasıl tüketeceğini belirle.

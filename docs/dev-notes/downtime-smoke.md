# Downtime Manuel Smoke Test

Bu doküman, sadece downtime kapsamındaki geliştirmeleri hızlıca doğrulamak için adım adım manuel test senaryoları içerir.
OEE KPI (Availability/Performance/Quality) hesaplamaları kapsam dışıdır.

## Ön Koşullar

4 ayrı terminal önerilir.

Backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

Frontend

```bash
cd frontend
npm install
npm run dev
```

Telemetri simülatörü

```bash
cd backend
npm run data:gen
```

Alternatif (test için, hızlandırılmış vardiya verisi)

```bash
cd backend
npm run shift:sim
```

Not

- Aşağıdaki senaryoların çoğu `data-gen` env değişkenleriyle sinyal davranışını kontrol ettiği için varsayılan olarak `data-gen` üstünden anlatılır.
- `shift-sim` ile test yapacaksan, senaryolardaki “probability” adımlarını atlayıp vardiya desenine göre duruşların oluştuğunu gözlemleyebilirsin.
- `shift-sim` koşusu tamamlandığında sistem `shift_end` uygular: `in_progress` job `paused` olur (reason: `shift_end`) ve makine `idle` durumuna çekilir. Üretimin devamı için operatörün job’u manuel `resume` etmesi gerekir.

Üretim simülatörü (opsiyonel)

```bash
cd backend
npm run job:sim
```

Alternatif

- UI’daki `/simulations` sayfasından `data-gen` ve `job-sim` script’lerini başlatıp logları ekrandan takip edebilirsin (izin: `production.manage`).

Login (seed)

- Supervisor: `supervisor / Supervisor123!`
- Operator: default rol `operator` ama örnek kullanıcı seed’e göre değişebilir

## Ortak Kontroller

- UI’da `Duruşlar` sayfası açılıyor
- `Açık Duruşlar` listesi doluyor (en az bir makinede signal 0 üretimi olursa)
- `Planlı Duruşlar` sekmesinde operator “Run Geçmişi”ni görebiliyor, supervisor kural CRUD yapabiliyor

## Senaryo 1 Plansız duruş threshold ile açılır

Amaç

- Job `in_progress` iken signal 0 en az 10 sn sürünce plansız duruş açılmalı

Adımlar

1. UI `İş Emirleri` sayfasından bir job oluştur ve `Başlat`
2. Telemetry’yi deterministik hale getir
   - Terminalde `data:gen`i kapat (`Ctrl+C`)
   - Şu şekilde başlat:
     ```bash
     DATA_GEN_RUNNING_SIGNAL_DROP_PROB=1 DATA_GEN_RUNNING_SIGNAL_RECOVERY_PROB=0 npm run data:gen
     ```
3. 10–15 sn bekle
4. UI `Duruşlar -> Açık Duruşlar` içinde ilgili makinede `unplanned_stop` (veya label’ı) gör

Beklenen

- `GET /api/downtimes?status=open` içinde 1 adet açık duruş görünür
- Event alanları:
  - `state=downtime`
  - `reasonCategory=unplanned`
  - `jobOrder` snapshot dolu (job aktifse)

## Senaryo 2 Plansız duruş signal 1 ile kapanır

Amaç

- Signal 1’e dönünce plansız duruş kapanmalı ve makine `running` olmalı

Adımlar

1. Terminalde `data:gen`i kapat (`Ctrl+C`)
2. Şu şekilde başlat:
   ```bash
   DATA_GEN_RUNNING_SIGNAL_DROP_PROB=0 DATA_GEN_RUNNING_SIGNAL_RECOVERY_PROB=1 npm run data:gen
   ```
3. 2–5 sn içinde açık duruşun kapandığını gözlemle

Beklenen

- `Açık Duruşlar` listesinde ilgili kayıt kaybolur
- `Geçmiş` tabında kayıt görünür

## Senaryo 3 Reason düzeltme 5 dk içinde PATCH

Amaç

- Duruş açıldıktan sonra 5 dk içinde reason değişimi aynı event içinde yapılmalı

Adımlar

1. `Açık Duruşlar` listesinde bir duruş seç ve `Sınıflandır`
2. `reasonCode` seç (örn `breakdown`) ve not gir
3. Kaydet

Beklenen

- Event’in `reasonCode` ve `reasonCategory` alanı güncellenir
- UI toast: “Duruş güncellendi”

## Senaryo 3.1 Operatör manuel plansız duruş başlatır

Amaç

- Operatör job aktifken plansız duruşu manuel başlatabilmeli ve reason girebilmeli

Adımlar

1. UI `İş Emirleri` sayfasından bir job oluştur ve `Başlat` (job `in_progress`)
2. UI `Duruşlar -> Açık Duruşlar` tabına git
3. `Plansız Duruş Başlat` butonuna bas
4. Makine ve plansız bir reason seç (örn `material_shortage`) ve `Başlat`

Beklenen

- `GET /api/downtimes?status=open` içinde yeni bir kayıt görünür
- Kayıt alanları
  - `state=downtime`
  - `reasonCategory=unplanned`
  - `reasonCode` seçilen değer
  - `source=operator`
- Makine `status=downtime` olur

## Senaryo 4 Reason düzeltme 5 dk sonrası split

Amaç

- 5 dk penceresi dolunca “reason değişimi” yeni event açarak (split) yapılmalı

Not

- 5 dk beklemek istemezsen, test DB’sinde ilgili downtime event’inin `startedAt` değerini 6 dk geriye çekebilirsin.

Adımlar (bekleyerek)

1. Duruş açıldıktan sonra 5 dk bekle
2. `Açık Duruşlar` içinden `Sınıflandır` ile farklı reason seç

Beklenen

- UI toast: “Duruş split ile güncellendi”
- Makine event geçmişinde aynı makine için:
  - Eski downtime event kapanır
  - Yeni downtime event başlar

## Senaryo 4.1 Uzun plansız duruş kapanınca “onay bekliyor”

Amaç

- Telemetry ile açılan plansız duruş 5 dk’dan uzun sürerse kapanışta “onay bekliyor” işaretlenmeli ve UI’dan onaylanabilmeli

Not

- 5 dk beklemek istemezsen, açık duruşun `startedAt` değerini test DB’sinde 6 dk geriye çekebilirsin.

Adımlar (hızlı)

1. Senaryo 1 ile açık plansız duruş oluştur
2. MongoDB’de açık duruşun `startedAt` alanını 6 dk geriye çek
3. Senaryo 2 ile sinyal 1’e dön ve duruşun kapanmasını sağla
4. UI `Duruşlar -> Geçmiş` tabına git

Beklenen

- İlgili satırda `Onay Bekliyor` etiketi görünür
- `Onayla` aksiyonuna basınca:
  - UI toast: “Duruş onaylandı”
  - Etiket `Onaylandı` olur veya `Onay Bekliyor` kaybolur

## Senaryo 5 Planlı duruş scheduler ile başlar biter

Amaç

- Planlı duruş otomatik başlar/biter, bitince job resume denenir

Hazırlık

- `backend/.env` içine ekle:
  - `ENABLE_PLANNED_DOWNTIME_SCHEDULER=true`
  - `PLANNED_DOWNTIME_SCHEDULER_INTERVAL_MS=5000`
- Backend’i restart et

Adımlar

1. UI’da bir job’u `Başlat` (in_progress)
2. `Duruşlar -> Planlı Duruşlar -> Kurallar` kısmından “Tek Sefer” plan ekle
   - Başlangıç: 1–2 dk sonrası
   - Bitiş: başlangıçtan 1–2 dk sonrası
   - Makine: job aktif olan makine
3. Başlangıç anında makinenin `downtime (planned)` event’ine geçtiğini gözlemle
4. Bitişte job’un resume olduğunu gözlemle

Beklenen

- Planlı duruş boyunca simülatör `signalValue=0` ve metrikler `0` yazar (`DATA_GEN_PLANNED_STOPPED_MODE=true` default)
- `Planlı Duruşlar -> Run Geçmişi` tabında run görünür (`started` sonra `ended`)

## Senaryo 6 Planlı duruş preempt

Amaç

- Aynı anda iki plan çakışırsa daha yüksek `priority` olan diğerini preempt etmeli

Adımlar

1. Düşük öncelikli plan oluştur (örn priority 5), “Tek Sefer” ve hemen başlayacak şekilde
2. Aynı makineye daha yüksek öncelikli plan oluştur (örn priority 10), düşük planla çakışacak şekilde

Beklenen

- Run geçmişinde düşük öncelikli run `ended (preempted)` olur
- Yüksek öncelikli run `started` olur

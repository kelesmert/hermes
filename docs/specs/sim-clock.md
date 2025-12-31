# Simulation Clock

## Güncelleme Kuralları

**Ne zaman güncellenir**

- Shift sim ve data gen zaman stratejisi değiştiğinde
- Telemetry `source` seçimi, monitoring `view` mantığı veya API kontratı değiştiğinde
- Simülasyonların kaldığı yerden devam kuralları veya reset politikası değiştiğinde
- OEE downtime processor için hangi kaynağın işlendiği değiştiğinde

**Format**

- Her karar için kısa gerekçe ve uygulanacak teknik yaklaşım yaz
- Problem ve Kararlar bölümleri kod değişikliğiyle tutarlı olmalı
- Yeni env parametresi veya API eklendiyse ilgili bölümlere ekle

## Amaç

Shift sim ve data gen birlikte varken, üretilen telemetry verisinin tarih saatlerinin tutarlı, deterministik ve OEE filtreleriyle uyumlu olmasını sağlamak.

Bu doküman, sanal takvim kavramını tanımlar ve shift sim koşularının restart sonrası kaldığı yerden devam etmesini ve günler arası lineer ilerlemesini garanti eden yaklaşımı belirler.

## Kapsam

Bu doküman şunları kapsar

- Shift sim için kalıcı Simulation Clock state modeli ve kuralları
- Monitoring tarafında shift sim ve data gen verisinin nasıl seçileceği
- OEE downtime processor’un shift sim verisini izole işlemesi kararı
- Reset ve veri temizleme politikası

Bu doküman şunları kapsamaz

- OEE Availability Performance Quality formül implementasyonu
- Vardiya takvimi, çoklu vardiya veya resmi tatil planlaması
- Aggregation bucket modeli veya yeni grafik UI tasarımı

## Mevcut Durum Özeti

Sistemde üç simülasyon script’i var

- `data-gen` sürekli telemetry üretir ve timestamp olarak sistem saatini kullanır
- `shift-sim` 07:00–18:00 aralığı için deterministik telemetry üretir ve hızlandırılmış koşabilir
- `job-sim` telemetry timestamp’lerini takip ederek üretim event’leri yazar

Sorun, shift sim’in simülasyon dünyasında bugün hangi gün ve saat bilgisini kalıcı olarak tutmaması ve bazı hesaplarda wall clock kullanmasıyla ortaya çıkar.

## Problem Tanımı

### Tutarsız tarih saat

- Shift sim, her start’ta gerçek `now` üzerinden bugünün vardiyasını hesaplayınca aynı takvim gününe tekrar yazma veya beklenmeyen tarih üretebilir
- Bu tutarsızlık monitoring ve OEE tarih filtreleri için veri kalitesini bozar

### Kaldığı yerden devam edememe

- Simülasyon yarıda kesilince hangi timestamp’te kaldığı bilinmez
- Yeniden başlatınca tekrar 07:00’dan üretmek veri çakışmasına veya verinin silinmesine yol açar

### Shift sim sonrası data gen görünümü

- DB’de shift sim verileri kalsın istenir
- Ama data gen çalıştırınca monitoring ekranında shift sim’den kalan veriler görülür
- Bu sorun temelde silme değil hangi kaynağı gösteriyoruz seçimidir

### Processor cursor riski

- OEE downtime processor tek bir timeline varsayımıyla çalışıyorsa, data gen’in daha yeni timestamp’leri cursor’u ileri iterek shift sim verisinin işlenmesini bozabilir

## Hedef Davranış

- Shift sim verisi sanal takvimle lineer ilerler
- Restart sonrası kaldığı yerden devam eder
- Shift bitince bir sonraki çalıştırma ertesi gün 07:00’den başlar
- Shift sim ve data gen verileri DB’de birlikte kalabilir, monitoring kaynağı seçebilir
- OEE downtime processor şimdilik sadece shift sim telemetry’sini işler

## Temel Kavramlar

### Wall clock

Uygulamanın çalıştığı makinenin gerçek zamanı. `data-gen` bu zamanı kullanır.

### Virtual clock

Shift sim’in kullandığı sanal zaman. DB’de kalıcı state olarak tutulur ve restart sonrası korunur.

### Source

Telemetry kaydının üretim kaynağı

- `shift-sim`
- `data-gen`

### Simulation run

Shift sim’in bir gün içi vardiya koşusu. Aynı gün içinde resume yapılırsa `simulationRunId` aynı kalır.

## Kararlar

### Kalıcı Simulation Clock state

- **Karar:** Shift sim için DB’de kalıcı bir state tutulacak
- **Gerekçe:** Wall clock bağımlılığını kaldırmak, kaldığı yerden devam etmek ve deterministik takvim sağlamak
- **Teknik yaklaşım:** `simulation_states` benzeri tek doküman koleksiyonu ve `key=shift-sim`

### Epoch date ile deterministik başlangıç

- **Karar:** İlk state yoksa başlangıç tarihi env ile belirlenir
- **Parametre:** `SHIFT_SIM_EPOCH_DATE=YYYY-MM-DD`
- **Gerekçe:** Tez sunumu ve testlerde aynı timeline’ı yeniden üretebilmek

### Resume ve next day kuralı

- **Karar:** Aynı gün içinde resume edilir, shift bitince ertesi güne geçilir
- **Kural:**
  - `cursorAt < shiftEndAt` ise aynı gün devam ve `simulationRunId` değişmez
  - `cursorAt >= shiftEndAt` ise ertesi gün 07:00’den başlanır ve yeni `simulationRunId` üretilir
- **Gerekçe:** Duplicate üretmek gap’ten daha kötüdür, tarih aralığı filtreleri için lineer takvim şarttır

### DB maksimum timestamp safety check

- **Karar:** State ile DB çelişirse DB maksimum timestamp baz alınır
- **Kural:** `dbMaxShiftSimTimestamp > state.cursorAt` ise loglanır, state DB’ye göre güncellenir, devam edilir
- **Gerekçe:** Çakışan üretimi önlemek, veri kalitesini korumak

### Gece aralığı boş

- **Karar:** 18:00–07:00 aralığında veri üretilmez
- **Gerekçe:** Shift view 07:00–18:00 penceresi üzerinden çalışır, geceyi doldurmak gereksiz gürültüdür

### Shift sim ve data gen verileri silinmez

- **Karar:** Mod değiştirirken veri silme zorunlu değil
- **Gerekçe:** Amaç ekranda doğru kaynağı göstermek, veriyi yok etmek değil

### Monitoring kaynak seçimi

- **Karar:** Monitoring, shift sim için shift view, data gen için live view kullanacak
- **Kural:**
  - Shift sim: `source=shift-sim`, `view=shift` ve son virtual gün penceresi
  - Data gen: `source=data-gen`, `view=live` ve wall clock’a göre kayan pencere
  - Opsiyonel: `source=auto` son gelen veriye göre seçim yapar
- **Gerekçe:** Shift sim sabit 07:00–18:00 eksen ister, data gen wall clock ile gerçek zaman hissi verir

### Job start/resume zaman ekseni (source bazlı)

- **Karar:** Job start/resume zaman ekseni kaynağa göre seçilir.
  - Shift sim kullanılırken job event timestamp’leri **virtual clock** ile hizalanır.
  - Data gen kullanılırken job event timestamp’leri **wall clock** (gerçek zaman) ile yazılır.
- **Gerekçe:** Shift sim verisi sanal takvimle deterministik ilerler; job event’leri aynı eksende olmalıdır. Data gen ise canlı veri hissini korur.
- **Konfigürasyon:** `JOB_TIME_SOURCE=shift-sim|data-gen|auto`

### Job-sim telemetry kaynağı (explicit seçim)

- **Karar:** Job-sim, telemetry kaynağını explicit olarak seçer; default `shift-sim` olur, data-gen opsiyonel olarak desteklenir.
- **Gerekçe:** Eski shift-sim verisi varken data-gen’in yanlışlıkla işlenmesini önlemek, test senaryolarını deterministik yapmak.
- **Not:** Uygulama katmanında env veya UI seçimiyle kontrol edilmesi planlanır.
- **Konfigürasyon:** `JOB_SIM_TELEMETRY_SOURCE=shift-sim|data-gen|auto`

### Shift-sim test downtime schedule (kontrollü)

- **Karar:** Shift-sim içindeki test amaçlı sabit duruşlar env ile kontrol edilir ve dokümante edilir.
- **Gerekçe:** Test senaryoları için faydalı; ancak üretim/demo davranışıyla karışmamalıdır.
- **Konfigürasyon:** `SHIFT_SIM_TEST_DOWNTIME_ENABLED`, `SHIFT_SIM_TEST_DOWNTIME_AFTER_MINUTES`, `SHIFT_SIM_TEST_DOWNTIME_MINUTES`

### OEE downtime processor izolasyonu

- **Karar:** Şimdilik downtime tespiti ve event üretimi sadece shift sim telemetry’sinden yapılacak
- **Gerekçe:** Sunumda hem canlı data gen hissi hem de tutarlı OEE tarih filtreleri isteniyor
- **Konfigürasyon:** `OEE_PROCESSOR_TELEMETRY_SOURCE=shift-sim` (opsiyonel: `all`)
- **Not:** İleride gerekirse data gen için ayrı cursor veya ayrı processor eklenebilir

### Reset politikası

- **Karar:** Default silme yok, sadece explicit Reset shift sim aksiyonu var
- **Kural:** Reset yalnızca shift sim’e ait verileri ve shift sim clock state’ini temizler, data gen’e dokunmaz
- **API:** `POST /api/simulations/shift-sim/reset` (şimdilik sadece `shift-sim` desteklenir)

## Önerilen Veri Modeli

`simulation_states` koleksiyonunda tek doküman

```json
{
  "key": "shift-sim",
  "timezone": "Europe/Istanbul",
  "epochDate": "2025-01-01",
  "shiftStart": "07:00",
  "shiftEnd": "18:00",
  "virtualDay": "2025-01-01",
  "shiftStartAt": "2025-01-01T04:00:00.000Z",
  "shiftEndAt": "2025-01-01T15:00:00.000Z",
  "cursorAt": "2025-01-01T07:15:32.000Z",
  "simulationRunId": "SS-20250101-xxxxxx",
  "status": "running",
  "updatedAt": "2025-01-01T15:00:00.000Z"
}
```

Notlar

- `virtualDay` local gün temsil eder, DB’de tarih saatler UTC saklanır
- `cursorAt` üretilen son telemetry timestamp’idir
- `shiftStartAt` ve `shiftEndAt` her start’ta `virtualDay` + saatlerden yeniden hesaplanabilir

## Akışlar

### Shift sim start

1. `simulation_states[key=shift-sim]` oku, yoksa epoch ile oluştur
2. DB safety check yap, gerekirse state’i güncelle
3. `cursorAt` shift bitimindeyse virtualDay’ı bir gün ileri al, `cursorAt = shiftStartAt` yap
4. `cursorAt` shift içindeyse aynı run ile devam et

### Shift sim stop

- Script stop edildiğinde state’e `cursorAt` ve `status` yazılır
- Yeniden start edildiğinde kaldığı yerden devam edilir

### Shift sim tamamlandı

- `cursorAt = shiftEndAt` yazılır ve state `completed` olur
- Domain tarafında `shift_end` semantiği uygulanır
  - `in_progress` job order `paused` yapılır (reason: `shift_end`)
  - makine `idle` olur
  - açık downtime event varsa `endedAt = shiftEndAt`

### Data gen start

- Data gen wall clock ile telemetry üretir
- Shift sim verileri DB’de kalır
- Monitoring live view ile data gen verisini gösterir

## Monitoring ve API Notları

### UI beklentisi

- Data gen sunumda canlı akış hissi verir, live view ile gösterilir
- Shift sim deterministik tarih saat üretir, shift view ile gösterilir
- UI’da kaynak seçimi yapılabilmelidir
  - `auto`, `shift-sim`, `data-gen`

### Backend beklentisi

- Board telemetry endpoint’i `source` ve `view` parametrelerini desteklemelidir
- Shift view penceresi son virtual güne göre hesaplanmalıdır

## OEE Hazırlık Notları

OEE hesaplaması date range ile çalışacağı için şu iki prensip kritik

- Shift sim verisi lineer, çakışmasız ve timezone tutarlı olmalı
- Processor telemetry okuması kaynak bazlı ayrılmalı

Şimdilik hedef

- Downtime tespiti ve event üretimi sadece `source=shift-sim` telemetry üzerinden yapılır
- Data gen, monitoring demo için kullanılabilir ancak OEE verisini kirletmez

## Riskler ve Önlemler

### Duplicate veri üretimi

- State DB safety check ile önlenir
- Çelişki halinde loglanır ve state düzeltilir

### Zaman dilimi hataları

- Tüm 07:00–18:00 hesapları `Europe/Istanbul` üzerinden yapılır
- DB kayıtları UTC saklanır, UI local gösterim yapar

### Kaynak karışımı

- OEE processor `source=shift-sim` filtresiyle izole edilir
- Monitoring varsayılanı `auto` olabilir, manuel override UI’da bulunur

## Uygulama Planı

Bu doküman onaylandıktan sonra yapılacak işler

1. `simulation_states` modeli ve service ekle
2. `shift-simulator` clock state üzerinden `virtualDay` ve `cursorAt` ile çalışsın
3. Shift view endpoint’i virtualDay penceresini clock’tan alsın
4. Monitoring için `source` seçimi ve data gen live view ekle
5. OEE downtime processor telemetry query’sine `source=shift-sim` filtresi ekle
6. Reset shift sim aksiyonu ekle (shift sim verisi + clock state)

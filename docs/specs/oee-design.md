# OEE Design (Work in Progress)

Bu dokuman, OEE (Availability / Performance / Quality) tasarimi icin alinan kararlarin
ve acik kalan sorularin tek kaynagi olacak. Her yeni karar bu dosyaya eklenecek.

## Güncelleme Kuralları

**Ne zaman güncellenir**

- OEE tanimlari, formuller veya N A politikasi degistiginde
- OEE hesap penceresi, kaynak filtresi `source` veya shift takvimi kararlari degistiginde
- OEE endpoint veya response formati degistiginde
- OEE’yi besleyen veri modeli degistiginde (Part ideal cycle time, reason catalog affectsOee, ProductionEvent, telemetry alanlari)
- OEE UI ve trend stratejisi degistiginde

**Format**

- Yeni kararlar `Alinan Kararlar` altina gerekce ve etkisiyle eklenir
- Kod degisince `Durum ve Yapilacaklar` birlikte guncellenir

**Önemli**

- Bu dokuman OEE gelistirmesinin kilavuzudur
- Dokuman ile kod arasinda fark varsa `Durum ve Yapilacaklar` bolumunde acikca yazilir

## Amaç
- Projede tam calisan OEE hesaplamasi eklemek.
- OEE hesaplarini izlenebilir, nedenleri aciklanabilir hale getirmek.
- Tez sunumunda guvenilir ve tutarli veri gostermek.

## Kapsam
- Availability, Performance, Quality hesaplari ve OEE skoru.
- Planli uretim zamani + duruslar + uretim eventleri.
- Simulasyonlarin (shift-sim / job-sim) OEE'ye dogru veri saglamasi.

## Alinan Kararlar (Net)

### 1) Planli uretim zamani = shift penceresi
- OEE sadece planli uretim zamaninda hesaplanir.
- Job yokken planli sure OEE icin disarida kalir.
- MVP icin global sabit vardiya kullanilir (Pzt-Cuma 07:00-18:00).

### 1.1) Opsiyonel vardiya sablonlari (A/B)
- Vardiya sablonlari Merkezi Ayarlar'da tanimlanir.
- Makine kartindan sablon secilir.
- Secilmezse global varsayilan kullanilir.

### 1.2) Job aktif semantigi ve plannedTime tanimi

Amaç: Job yokken OEE hesaplamamak, job varken ise durusların Availability’ye dogru yansımasını saglamak.

- **Job aktif** kabul edilen durumlar: `in_progress + paused`
  - Gerekçe: Job “devam eden bir is” ise, duruslar job aktifken yasaniyor kabul edilmeli.
  - Not: Durusların OEE’ye etkisini `affectsOee` belirler (yemek molasi etkilesin mi gibi).
- **plannedTime tanimi:** `plannedTime = Shift ∩ (job aktif sureleri)`
  - Job yoksa plannedTime = 0 olur ve OEE skoru N/A olur (beklenen davranis).
  - paused sureleri de job aktif surelerine dahildir; planli duruslarda `affectsOee=false` olan kisim plannedTime’dan dusulur.

### 2) Planli duruslarin OEE etkisi
- Reason catalog icinde `affectsOee: true/false` alani olacak.
- Etkilesin / etkilemesin ayrimi reason seviyesinde yapilacak.
- Ornek: `planned_break`, `lunch`, `routine_maintenance` -> false
- Ornek: "usta yarin gelecek" gibi kayip yaratan planli duruslar -> true

#### 2.1) affectsOee mantiginin Availability etkisi
- `affectsOee=false` planli reason'lar: plannedTime’dan dusulur (Availability’yi dusurmez)
- `affectsOee=true` planli reason'lar: plannedTime’da kalir (Availability’yi dusurur)
- Plansiz duruslar: availability’yi dusurur (operatingTime azalir)

### 3) Ideal cevrim suresi
- Tek kaynak: `part.idealCycleTime`.
- Ideal cycle time yoksa job baslatilamaz.
- Part olustururken idealCycleTime zorunlu olmali.

### 4) Kalite verisi
- Manuel kalite girisi yok.
- Kaynak: production events (good/defect).
- Job-sim defect uretmeli (rastgele, env ile kontrol edilebilir oranla).

### 5) Eksik veri politikasi
- Quality verisi yoksa OEE sonucu **N/A** olacak (hesaplanmaz).
- Availability/Performance tek basina gosterilebilir, ama OEE skoru cikmaz.

### 6) OEE hesap penceresi ve UI modeli
- OEE hesaplamasi hem shift bazli hem tarih araligi bazli desteklemeli.
- UI daha sonra tasarlanacak; mimari bu ikisini kapsayacak.
- Hedef UI: makine secimi + haftalik/aylik OEE gorunumu.

### 6.1) OEE API pencere modeli (karar)
- `mode=shift|range`
- Default: `shift`
- `shiftDate=YYYY-MM-DD` (verilmezse son telemetry gunu)
- `from` + `to` (ISO tarih, range modu icin)
- `source=shift-sim|data-gen|mock-batch|auto`
- UI tarafinda kaynak secimi olacak (shift-sim, data-gen, mock-batch)
- UI default `source=shift-sim` gonderir (tutarli tarih ve deterministik hesap icin)
- API’de `source` verilmezse backend `auto` ile son telemetry kaynagini baz alir
- `machineId` MVP icin zorunlu
- Yanit formatinda tek obje: `availability`, `performance`, `quality`, `oee`,
  `plannedTime`, `operatingTime`, `totalCount`, `goodCount`, `defectCount`

### 6.2) OEE formulleri

Not: A/P/Q hepsi hesaplanabiliyorsa `oee = A * P * Q` doner. Eksik veri varsa `oee = N/A` olur.

- **Availability (A):** `operatingTime / plannedTime`
  - plannedTime: Shift ∩ (job aktif sureleri) - (affectsOee=false planned durus overlap)
  - operatingTime: job aktif sureleri icinde telemetry `signalValue=1` gelen araliklarin toplam suresi
- **Performance (P):** `totalIdealTime / operatingTime`
  - totalIdealTime: pencere icindeki uretim (good+defect) miktari * ilgili part ideal cycle time
- **Quality (Q):** `goodCount / totalCount`

### 6.2.1) Range modu semantigi

Karar: **Range modu shift-aware olacak**

- `mode=range` icin plannedTime, **range ∩ shift penceresi ∩ job aktif** olarak hesaplanir
- Mesai disi saatler plannedTime’a dahil edilmez
- Hafta sonu gunleri plannedTime’a dahil edilmez
- Shift penceresi kaynagi
  - MVP: global sabit vardiya (Pzt-Cuma 07:00-18:00)
  - Opsiyonel vardiya sablonlari geldikten sonra: makineye bagli sablon onceliklidir

### 6.2.2) Shift penceresi kaynagi ve tek merkez

Karar: **Shift penceresi tek merkezden alinacak**

- OEE ve raporlama tarafi shift penceresini tek bir servis kaynagindan alir
- Bu servis, shift-sim’in SimulationState bilgisini baz alir
- Hedef: OEE, shift-sim ve dashboard ayni vardiya penceresini kullanir
- Gerekce
  - Saat ve hafta ici kurali tek yerde tutulur
  - OEE ile simulasyon arasinda zaman uyumsuzlugu engellenir

### 6.3) Trend hesaplama stratejisi

Hedef: Haftalik ve aylik OEE trendi, gunluk OEE’den daha dogru ve aciklanabilir sekilde uretilmeli.

- MVP icin trend stratejisi: **T2 Toplamlardan yeniden hesap**
  - Haftalik veya aylik aralik icin once gun gun ya da tum aralik icin su toplamlar uretilir
    - `plannedTime = sum(plannedTime)`
    - `operatingTime = sum(operatingTime)`
    - `totalIdealTime = sum(totalIdealTime)` veya production event’lerden tekrar hesap
    - `goodCount/defectCount/totalCount = sum(counts)`
  - Sonra A P Q tekrar hesaplanir
    - `A = operatingTime / plannedTime`
    - `P = totalIdealTime / operatingTime`
    - `Q = goodCount / totalCount`
    - `OEE = A * P * Q`
  - Gerekce
    - Gunlerin uzunlugu farkli olsa bile dogru agirliklandirma yapar
    - Haftalik aylik OEE daha aciklanabilir olur

### 6.4) N A gunleri ve coverage

Hedef: Job olmayan gunler veya veri olmayan gunler trendi bozmasin.

- N A gun politikasi: **N1 Hariç tut + coverage goster**
  - Haftalik veya aylik hesapta `plannedTime = 0` olan gunler trend ortalamasina dahil edilmez
  - UI coverage gosterir
    - Ornek: `coverageDays=5`, `windowDays=7`
  - Gerekce
    - N A gunleri 0 saymak OEE’yi yapay dusurur
    - Tum haftayi N A yapmak cok kati olur

### 6.5) Job zaman ekseni karari

Hedef: Job event zamanlari ile telemetry zamanlari ayni eksende olsun ki interval hesaplari dogru ciksin.

- Karar: **J3 Mod bazli zaman ekseni**
  - Job order hangi simulasyon modunda calisacak bilgisini tasir
    - `jobOrder.metadata.simulationSource = shift-sim | data-gen`
  - Job start resume pause event timestamp’i bu moda gore yazilir
    - `shift-sim` ise sim clock zamani
    - `data-gen` ise wall clock zamani
  - Gerekce
    - Shift-sim ile tutarli sanal takvim korunur
    - Data-gen ile gercek zaman demo akisi korunur
    - Interval hesaplarinda iki zaman ekseni karismasi engellenir

### 6.6) Performance gosterim karari

Karar: **P1 API raw, UI opsiyonel clamp**

- API `performance` degerini oldugu gibi dondurur
- UI isterse gorsel olarak %100’e clamp edebilir, ama hesap gercegi saklanmaz

### 7) Job-sim cycle time olasilik dagilimi
Ideal cycle time icin hedeflenen dagilim:
- Min = 0.8 * ideal
- Max = 1.4 * ideal
- Idealden kisa olma ihtimali, idealden uzun olma ihtimalinden dusuk.
- Uclara yaklastikca olasilik azalir.
- 8 olasiligi < 9 olasiligi, 14 olasiligi < 12 olasiligi (ornek: ideal=10).

Matematiksel karsiligi:
- Asimetrik triangular dagilim
- min = 0.8 * ideal, mode = ideal, max = 1.4 * ideal

Bu dagilimda beklenen oran:
- P(kisa) ~ %33
- P(uzun) ~ %67
- Uclarda olasilik sifira iner

### 8) Job-sim rastgele cycle time uygulama noktasi
- Rastgelelik job-sim icinde uygulanacak.
- Telemetry degistirilmeyecek; uretim miktari job-sim tarafinda hesaplanacak.
- Rastgelelik per-interval uygulanacak (telemetry sample araligi bazli).
- Uretim adedi job order targetQuantity ile sinirli kalacak (asmaz).
- Actual cycle time OEE'de `OperatingTime / TotalCount` ile turetilecek.

### 9) Job-sim kalite rastgeleligi
- Job-sim her uretimde good/bad ayrimi yapacak.
- Good olma ihtimali yuksek olacak, defect oranini env ile ayarlayacagiz.
- Kalite rastgeleligi cycle time rastgeleliginden bagimsiz olacak.
- Simdilik hedef adet: `good + defect = targetQuantity` olacak.
- Not: Ileride hedefin "goodQuantity" olmasi (defect varsa ekstra uretim) opsiyonu
  degerlendirilecek.

## Acik Sorular (Netlesecek)
- Su anda acik soru kalmadi.

## Durum ve Yapilacaklar

### Tamamlandi

- [x] Ideal cycle time kaynagi `part.idealCycleTime` ve zorunlu alan (Part modeli)
- [x] Reason catalog icinde `affectsOee` alani ve planned downtime etkisi (OEE hesaplamasi)
- [x] OEE hesaplama servisi + `GET /api/oee/stats` endpoint’i
- [x] Job-sim cycle time rastgeleligi (asimetrik triangular)
- [x] Job-sim defect rastgeleligi (env kontrollu oran)
- [x] Uretim adedi targetQuantity ile sinirli, job tamamlandiginda `good + defect = targetQuantity` ve asla asmaz
- [x] Job aktif semantigi `in_progress + paused` olacak sekilde interval hesaplandi
- [x] Shift penceresi hafta ici (Pzt-Cuma) filtresi OEE tarafinda uygulandi
- [x] Range modu shift-aware planli sure hesaplamasi uygulandi (mesai disi saatler ve hafta sonu haric)
- [x] OEE shift penceresi tek merkezden aliniyor (simulation-clock-service)
- [x] OEE API pencere modeli: `mode/shiftDate/from/to/source` var; UI default `source=shift-sim` gonderiyor, API source verilmezse `auto`
- [x] Reports tarafinda OEE ekrani (makine secimi + gunluk shift gorunumu)
- [x] Haftalik ve aylik trend (T2 toplamlar + N1 coverage) UI tarafinda uygulandi

### Yapilacaklar

#### Öncelik 1 OEE semantigi ve dogruluk

- [ ] Shift calendar (vardiya sablonlari) altyapisini ekle ve makineye bagla

#### Öncelik 2 OEE raporlama ve trend

- [ ] Opsiyonel E2 snapshot tablosu icin tasarim notu ve gecis plani ekle
- [ ] (Opsiyonel) OEE trend icin tek endpoint (T2 toplam + coverage) tasarla

#### Öncelik 3 Aciklamalilik ve analiz

- [ ] Availability kayiplarini reason bazinda breakdown edecek bir servis tasarla (opsiyonel ama UI debug icin cok faydali)

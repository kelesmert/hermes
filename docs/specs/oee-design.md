# OEE Design (Work in Progress)

Bu dokuman, OEE (Availability / Performance / Quality) tasarimi icin alinan kararlarin
ve acik kalan sorularin tek kaynagi olacak. Her yeni karar bu dosyaya eklenecek.

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

### 2) Planli duruslarin OEE etkisi
- Reason catalog icinde `affectsOee: true/false` alani olacak.
- Etkilesin / etkilemesin ayrimi reason seviyesinde yapilacak.
- Ornek: `planned_break`, `lunch`, `routine_maintenance` -> false
- Ornek: "usta yarin gelecek" gibi kayip yaratan planli duruslar -> true

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

### A) OEE API pencere modeli
- Shift bazli ve tarih araligi bazli hesap icin API parametreleri netlesmeli.

## Sonraki Adimlar
- Job-sim defect uretimi (env kontrollu oran) implement edilecek.
- OEE hesap servisi (A/P/Q) icin veri akisi ve pencere modeli tanimlanacak.
- OEE API icin shift + tarih araligi parametreleri tasarlanacak.

# Mock Data Generator (WIP)

Bu dokuman, tek seferlik mock veri ureten scriptin kapsamini, kararlarini ve
uygulama adimlarini kaydeder. Amac: shift-sim + job-sim calistirilmis gibi
veri uretip DB'ye yazmak ve OEE raporlarinda secilen tarihte goruntulemek.

## Guncelleme Kurallari

- Yeni karar alinirsa `Kararlar` bolumune ekle
- Script davranisi degisirse `Uretilecek Veri` ve `Akis` bolumlerini guncelle
- Bekleyen sorular `Acik Sorular` bolumunde tutulur

## Amac

- Gercek zamanli simulasyon olmadan, tek seferlik veri uretmek
- OEE hesaplarinda kullanilabilecek minimum veri setini yazmak
- Rapor ekraninda secilen tarihte veri gorulebilmesini saglamak

## Kapsam (Ilk Faz)

- Tek gunluk veri uretimi (tek seferlik script, simulasyon degil)
- Opsiyonel haftalik veri uretimi (5 is gunu, `--week` ile)
- Opsiyonel aylik veri uretimi (20 is gunu, `--month` ile)
- Tek makine: `MCH-001`
- Planli ogle arasi: 12:00-13:00 (planned_break)
- Kaynak uyumu: OEE icin ayrik kaynak (`source=mock-batch`)
- Rapor ekraninda tarih secildiginde bu veri gorunmeli (mevcut API/format ile uyumlu)

## Uretilecek Veri

1) MachineTelemetry
- `source`: mock-batch
- `timestamp`: secilen gunun shift penceresi icinde (07:00-18:00 TR)
- `signalValue`: 1/0 (planli mola + rastgele plansiz duruslarla)
- `intervalMs`: belirlenen ornekleme araligi
- `jobOrder`: ilgili job id
- `simulationRunId`: mock-batch formatina uygun

2) JobOrder + ProductionEvent
- JobOrder olusacak ve `metadata.simulationSource=mock-batch` olacak
- JobOrder `assignedOperator` rastgele operator, `createdBy` rastgele supervisor olacak
- ProductionEvent:
  - `START` (shift basinda)
  - `AUTO_PAUSE` (shift sonunda)
  - `PRODUCE/DEFECT` (uretim adetleri)

3) MachineEvent (planli mola)
- Ilk fazda URETILMEYECEK (duruş sayfasına düşmemesi için)
- Not: Bu durumda ogle arasi plannedTime’dan dusulmez; bu fark sonradan
  "gizli planned event" veya UI filtre ile duzeltilecek

## Rastgelelik Kurallari

- Job suresi degisken olacak:
  - Bazi joblar 1 gunden kisa
  - Bazi joblar 2+ gun surer
  - Ilk fazda tek gun veya 5 is gunu uretimi var, joblar bu aralikta coklu olabilir
- Minimum job suresi: 4 saat
- Maksimum job suresi (haftalik mod): 5 is gunu
- Maksimum job suresi (aylik mod): 8 is gunu
- 1-3 gun arasi sureler daha sik, 4-5+ gun daha nadir
- Kalite orani joba gore degisir
- Plansiz durus miktari gun/gun degisebilir (gercekci dagilim hedeflenir)
- Ayni tarih icin deterministik cikti (default) veya `--random` ile farkli cikti secilebilir
- Telemetry ornekleme sikligi dusuk olabilir (OEE icin yeterli olmasi yeterli)

## Akis (Oneri)

1) Parametreleri belirle
- shiftDate (YYYY-MM-DD)
- intervalMs (telemetry ornekleme)
- targetQuantity / idealCycleTime secimi
- kalite ve durus dagilim parametreleri

2) DB kontrolu
- MCH-001 var mi? yoksa hata ver
- Parca/idealCycleTime mevcut mu? yoksa hata ver

3) Veri uretimi
- Shift pencerelerinde telemetry üret
- 12:00-13:00 planned_break olustur
- Her gun icin plansiz durus bloklari uret (gun bazli degisen profil)
- Uretim eventleri (produce/defect) yaz
- Job eventlerini yaz (start/auto_pause/auto_resume/complete)

4) Ozet cikti
- Uretilen telemetry sayisi
- Uretilen good/defect toplam
- Job durumu (complete mi, ongoing mi)

## Calistirma (CLI)

```bash
node scripts/mock-batch.js --date 2025-01-03
node scripts/mock-batch.js --date 2025-01-03 --week
node scripts/mock-batch.js --date 2025-01-03 --month
node scripts/mock-batch.js --date 2025-01-03 --week --random
node scripts/mock-batch.js --from 2025-01-03 --to 2025-01-07
```

## Kararlar (Net)

- Ilk faz: 1 gunluk veri uretimi
- Kaynak uyumu: `source=mock-batch`
- Planli mola: 12:00-13:00 `planned_break`
- Tek makine: `MCH-001`
- OEE uyumu icin ProductionEvent ve telemetry birlikte yazilacak
- Script tek seferlik calisacak (real-time degil)
- Parca: `PART-MB-001`
- Monitoring hedef degil; telemetry sikligi dusuk tutulabilir
- OEE UI'da kaynak secimi olacak (mock-batch secilebilecek)
- Duruş sayfasina düşmemesi için mock-batch scripti MachineEvent üretmeyecek
- Shift tarihi CLI arg ile verilecek:
  - Tek tarih -> 1 gunluk veri (ilk faz)
  - `--week` -> verilen tarihten itibaren 5 is gunu
  - `--month` -> verilen tarihten itibaren 20 is gunu
  - Tarih araligi -> o gunler arasinda veri (ileride)
- Hafta sonu baslangici hatadir, kaydirma yapilmaz (uyari verilir)
- Cakisma olursa eski veri ustune yazilacak (aynı kaynak/tarih araligi icin overwrite)
- Telemetry intervalMs: 60 sn
- Plansiz durus dagilimi (ilk faz): gun bazli agirlikli profil
  - low: 1 durus, 5-10 dk
  - medium: 1-2 durus, 5-20 dk, %15 ihtimalle 30 dk
  - high: 2-4 durus, 10-25 dk, %25 ihtimalle 30 dk
  - Gun profili haftaya gore degisir (Pzt daha yogun, Carsamba daha sakin)
- Defect orani (ilk faz): %2 - %8 (gun bazli degisecek)
- Job akisi (ilk faz): 07:00 START, gun sonunda AUTO_PAUSE; devam eden job ertesi gun AUTO_RESUME ile surer
- Randomlik modu: varsayilan deterministik, `--random` ile ayni tarihte farkli cikti
- Mock job atamalari: `assignedOperator` rastgele operator, `createdBy` rastgele supervisor

## Acik Sorular

- Su an acik soru kalmadi.

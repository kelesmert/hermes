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
  - Ilk fazda sadece 1 gunluk job yazilir (1 gunluk veri)
- Kalite orani joba gore degisir
- Plansiz durus miktari gun/gun degisebilir (gercekci dagilim hedeflenir)
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
- Shift penceresinde telemetry üret
- 12:00-13:00 planned_break olustur
- Uretim eventleri (produce/defect) yaz
- Job eventlerini yaz (start/pause)

4) Ozet cikti
- Uretilen telemetry sayisi
- Uretilen good/defect toplam
- Job durumu (complete mi, ongoing mi)

## Kararlar (Net)

- Ilk faz: 1 gunluk veri uretimi
- Kaynak uyumu: `source=mock-batch`
- Planli mola: 12:00-13:00 `planned_break`
- Tek makine: `MCH-001`
- OEE uyumu icin ProductionEvent ve telemetry birlikte yazilacak
- Script tek seferlik calisacak (real-time degil)
- Parca: `MB-001`
- Monitoring hedef degil; telemetry sikligi dusuk tutulabilir
- OEE UI'da kaynak secimi olacak (mock-batch secilebilecek)
- Duruş sayfasina düşmemesi için mock-batch scripti MachineEvent üretmeyecek
- Shift tarihi CLI arg ile verilecek:
  - Tek tarih -> 1 gunluk veri (ilk faz)
  - Tarih araligi -> o gunler arasinda veri (ileride)
- Cakisma olursa eski veri ustune yazilacak (aynı kaynak/arih araligi icin overwrite)
- Telemetry intervalMs: 60 sn
- Plansiz durus dagilimi: gun bazli degisir (ileride farkli gunlerde farkli siklik)
- Defect orani: gun bazli degisir (ileride farkli gunlerde farkli oran)
- Job akisi (ilk faz): 07:00 START, gun sonunda AUTO_PAUSE; target dolarsa COMPLETE

## Acik Sorular

- Plansiz durus dagilimi (ilk fazda gun icinde kac adet / sure araligi netlestirilecek)
- Defect orani (ilk fazda hangi aralik kullanilacak netlestirilecek)

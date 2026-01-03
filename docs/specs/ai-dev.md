# AI Gelistirme Rehberi

Bu dokuman, projede AI entegrasyonu icin tek kaynak olacak.
Hedef, sadece bu dosyayi okuyarak AI gelistirmesine baslayabilecek kadar net bir kilavuz tutmak.

Bu asamada use case secimi yapilmadi.
Bu dosya, kararlar netlestikce doldurulecek bir iskelet olarak basladi.

## Dokuman Meta

- Versiyon 0.1
- Son guncelleme 2026-01-03
- Degisiklik ozeti
  - Dokuman iskeleti guclendirildi
  - Proje baglami ve dosya haritasi eklendi
  - Karar kaydi sablonu eklendi
  - Teknik tasarim ve test iskeleti eklendi

## Dokumanin Amaci

- AI ile neyi hedefledigimizi netlestirmek
- Alinan kararlar ile acik sorulari tek yerde toplamak
- Implementasyon adimlarini ve test planini checklist olarak takip etmek

## Kullanim Akisi

Bu dosyayi gelistirme kilavuzu yapmak icin onerilen sira

1 `Acik Sorular ve Opsiyonlar` bolumunden use case sec
2 Secilen use case icin veri kaynagi ve cikti semasini netlestir
3 `Checklist` icindeki karar maddelerini tamamla
4 Implementasyon adimlarini ayni checklist uzerinden ilerlet
5 Her kod degisikliginde bu dokumani guncelle

## Proje Baglami

Hermes, mezuniyet projesi kapsaminda gelistirilen hafif bir MES MVPsidir.
Makine telemetrisi ve uretim akisi simule edilir, downtime ve OEE gibi metrikler uzerinden raporlama yapilir.

Tech stack ozeti

- Backend Node.js Express MongoDB Mongoose
- Frontend React Vite MUI React Query Recharts

AI entegrasyon hedefi icin ilgili domainler

- OEE oee stats ve dashboard
- Downtime planned unplanned eventler ve reason catalog
- Production job order ve production events
- Machines telemetry ve machine state
- Simulations shift sim data gen job sim mock batch
- Access control permissions ve roller

## Kapsam

- OpenAI API ile entegrasyon
- Backend ve frontend tarafinda AI akisi icin gerekli kararlar
- Guvenlik gizlilik ve maliyet kontrolu yaklasimi

## Kapsam Disi

- AI use case secilmeden kod implementasyonu
- Model egitimi veya fine tuning
- Makine telemetrisi uzerinden ham veri ile model egitimi
  - Ileride gerekli olursa ayrica kararlasirilacak

## Guncelleme Kurallari

**Ne zaman guncellenir**

- AI ile ilgili yeni karar alindiginda
- Secilen AI use case degistiginde
- OpenAI modeli veya prompt stratejisi degistiginde
- Guvenlik gizlilik veya maliyet politikalari degistiginde
- AI endpoint request response semasi veya ornekleri degistiginde

**Format**

- Netlesmis kararlar `Net Kararlar` altina yazilir
- Cevaplanmamis konular `Acik Sorular ve Opsiyonlar` altinda tutulur
- Yapilan ve yapilacak adimlar `Checklist` icinde takip edilir
- Ornek request response bolumu taslaktan gercege tasinmis ise, kod ile birebir uyumlu tutulur

**Celiski durumunda oncelik**

1 Sistem talimatlari
2 Kullanici talimatlari ve bu dokumandaki net kararlar
3 Kod gercekligi
4 Diger dokumanlar ve notlar

## AI Entegrasyonu Amaci

- Tez sunumunda ekranlari daha aciklayici hale getirmek
- Deterministik hesaplari bozmadan karar destek katmani eklemek

## Mevcut Durum

- [x] Bu dokumanin iskeleti olusturuldu
- [x] Provider olarak OpenAI secildi
- [ ] Ilk AI use case secimi yapilmadi
- [ ] Backend AI domaini veya endpointleri yok
- [ ] Frontend AI gosterimi yok

## Okuma Haritasi

Bu bolum, gelistirmeye baslamadan once hangi dokuman ve kod dosyalarinin okunmasi gerektigini gosterir.
Use case secimine gore sadece ilgili alt listeyi okumak yeterli olmalidir.

Genel dokumanlar

- `docs/meta/doc-maintenance.md`
- `docs/specs/oee-design.md`
- `docs/specs/downtime-design-v2.md`
- `docs/specs/sim-clock.md`

Backend kodu genel

- `backend/src/constants/permissions.js`
- `backend/src/domains/access-control`
- `backend/src/domains/oee/services/oee-calculator-service.js`
- `backend/src/domains/oee/services/oee-dashboard-service.js`
- `backend/src/domains/oee/services/oee-processor.js`
- `backend/src/domains/downtime`
- `backend/src/domains/production`
- `backend/src/domains/machines`
- `backend/src/domains/simulations`

Frontend kodu genel

- `frontend/src/features/reports/pages/reports.jsx`
- `frontend/src/features/dashboard/pages/dashboard.jsx`
- `frontend/src/features/downtime`
- `frontend/src/features/machines`
- `frontend/src/features/monitoring/pages/monitoring.jsx`

Use case bazli okuma

- U1 OEE aciklama asistani
  - `docs/specs/oee-design.md`
  - `backend/src/domains/oee/services/oee-calculator-service.js`
  - `frontend/src/features/reports/pages/reports.jsx`
- U2 Durus reason onerisi
  - `docs/specs/downtime-design-v2.md`
  - `backend/src/domains/downtime`
  - `frontend/src/features/downtime`
- U3 Anomali tespiti ve aciklama
  - `backend/src/domains/machines`
  - `backend/src/domains/oee/services/oee-processor.js`
  - `frontend/src/features/monitoring/pages/monitoring.jsx`
- U4 Serbest soru cevap yardimcisi
  - `backend/src/constants/permissions.js`
  - `backend/src/domains/auth`
  - `frontend/src/features/auth`

## Karar Kaydi Formati

Yeni kararlar asagidaki formatta yazilacak

```text
Karar

- Tarih YYYY MM DD
- Konu
- Karar
- Gerekce
- Alternatifler
- Etki alani
- Degisebilir mi
```

## Net Kararlar

### Provider ve ana kural

- OpenAI API kullanilacak
- OpenAI API key sadece backend tarafinda `.env` icinde tutulacak
- Frontend tarafina API key asla gonderilmeyecek

## Acik Sorular ve Opsiyonlar

### Ilk use case hangisi olacak

- Opsiyon U1 OEE aciklama asistani
  - Artisi OEE ve durus verilerini insan diline cevirir demo icin etkisi yuksek
  - Eksisi Dogru bir aciklama icin loss breakdown verisi gerekebilir
- Opsiyon U2 Durus reason onerisi
  - Artisi Reason kalitesini artirir OEE aciklanabilirligi guclenir
  - Eksisi Yanlis oneriler operatorde guven kaybi yaratabilir onay akisi gerektirir
- Opsiyon U3 Anomali tespiti ve aciklama
  - Artisi Tez icin yenilik algisi yuksek
  - Eksisi Ham telemetry uzerinden yanlis pozitif riski daha yuksek
- Opsiyon U4 Serbest soru cevap yardimcisi
  - Artisi Kullaniciya sohbet deneyimi verir
  - Eksisi Yetki veri sizarma ve dogruluk riski en yuksek

### Nerede gosterilecek

- Opsiyon G1 Reports icinde AI karti veya modal
- Opsiyon G2 Dashboard icinde kisa ozet karti
- Opsiyon G3 Downtimes icinde reason ve etkiler icin ozet
- Opsiyon G4 Ayrı AI sayfasi

Karar kriteri

- MVP icin en az riskli yer genelde Reports olur
- Operasyon ekrani icin gecikme ve dogruluk daha kritiktir

### Veri kaynagi ve kapsam

- Prompt icine hangi domain verileri girecek
  - OEE stats mi downtime list mi production events mi
- Ham telemetry modele gonderilecek mi
  - MVP onerisi ham telemetry gonderme
- Cikti semasi ne olacak
  - Serbest metin mi yoksa JSON semasi mi

### Yetki modeli

- Hangi izin ile korunacak
  - `reports.read` ile mi yoksa yeni bir permission mi
- Viewer rolu AI sonucunu gorebilir mi

### Loglama ve gizlilik

- Prompt response kaydi tutulacak mi
  - Opsiyon L1 Kapali
  - Opsiyon L2 Sadece metadata
  - Opsiyon L3 Tam icerik
- PII ve token alanlari prompttan kesinlikle cikacak mi

### Teknik entegrasyon sekli

- Opsiyon T1 AI sadece aciklama uretir hesaplara dokunmaz
- Opsiyon T2 AI oneri uretir insan onayi olmadan kayit degistirmez
- Opsiyon T3 AI otomatik aksiyon alir

MVP onerisi

- T1 ile basla
- T2 sadece onay akisi olan yerlerde dusun
- T3 MVP disi

## Onerilen Ilkeler

Bu bolum karar degildir, secim yaparken referans olmasi icin yazildi

- Hesaplar backend tarafinda deterministik kalir, AI sadece aciklama uretir
- Prompt icine gizli bilgi girilmez
- AI sonucu UI tarafinda etiketli ve ayri gosterilir
- Cache ve timeout ile maliyet ve gecikme kontrolu yapilir
- Basarisiz olursa sistem normal calismaya devam eder AI opsiyoneldir

## Teknik Tasarim Taslagi

Bu bolum, use case secilmeden de doldurulabilir bir taslak sunar.
Secilen use case ile birlikte somut endpoint ve promptlar bu bolume yazilacak.

## Taslak Uyarisi

Bu dokumandaki ornek request response ve semalar, use case secilmeden hazirlanan taslaklardir.
Projede yeni veri kaynaklari veya alanlar eklendikce bu ornekler guncellenecek.
Kod ile dokuman uyusmuyorsa dokuman guncellenir.

### Mimari genel gorunum

```text
Frontend UI
  -> Backend AI endpoint
    -> OpenAI API
  <- Response
```

### Veri akisi

- UI secili pencere ve kaynagi backend e gonderir
- Backend ilgili domain servislerinden veriyi toplar
- Prompt input uretir ve OpenAI a cagrı yapar
- Response semasini dogrular
- UI a gosterim icin normalize edilmis sonucu dondurur

### Endpoint taslagi

Not Use case secilince path ve schema netlesecek

- `POST /api/ai/analyze`
  - Request useCase source window machineId payload
  - Response schema versioned JSON

### Response semasi taslagi

```json
{
  "useCase": "replace_me",
  "generatedAt": "2026-01-03T20:00:00.000Z",
  "summary": "replace_me",
  "highlights": [
    "replace_me"
  ],
  "actions": [
    {
      "title": "replace_me",
      "reason": "replace_me"
    }
  ],
  "warnings": [
    "replace_me"
  ]
}
```

### Ornek request ve response

Not Bu ornekler taslaktir ve su anki kod ile birebir uyum garantisi vermez.
Use case secilince ve endpoint gercekten yazilinca bu bolum guncellenir.

Ornek request

```json
{
  "useCase": "oee_explain",
  "source": "mock-batch",
  "window": {
    "mode": "shift",
    "shiftDate": "2025-05-05",
    "timezone": "Europe/Istanbul"
  },
  "machineId": "replace_me",
  "inputs": {
    "oee": {
      "availability": 0.85,
      "performance": 0.92,
      "quality": 0.98,
      "plannedTimeMs": 39600000,
      "operatingTimeMs": 34000000,
      "goodCount": 250,
      "defectCount": 10
    }
  }
}
```

Ornek response

```json
{
  "useCase": "oee_explain",
  "generatedAt": "2026-01-03T20:00:00.000Z",
  "summary": "replace_me",
  "highlights": [
    "replace_me"
  ],
  "actions": [
    {
      "title": "replace_me",
      "reason": "replace_me"
    }
  ],
  "warnings": [
    "replace_me"
  ]
}
```

### Hata ve fallback stratejisi

- Timeout olursa AI sonucunu gosterme UI normal akista kalir
- Model veya API hatasi olursa tek satirlik hata mesajı gosterilir
- Response schema uymazsa hata sayilir ve loglanir

### Cache maliyet kontrolu

- Aynı input icin belirli bir TTL ile cache
- Kullanici manuel refresh ile yeniden uretebilir

## Prompt Taslaklari

Bu bolum use case secilince doldurulacak prompt sablonlarini tutar.

### U1 OEE aciklama asistani taslagi

```text
Sen bir uretim analisti asistanisin.
Asagidaki OEE verilerini Turkce kisa bir ozet halinde acikla.

Kurallar
- Maksimum 3 cumle
- En kritik nedeni vurgula
- 1 adet uygulanabilir aksiyon oner

Veri
- Makine {{machineName}}
- Pencere {{windowLabel}}
- Kaynak {{source}}
- Availability {{availability}}
- Performance {{performance}}
- Quality {{quality}}
- OEE {{oee}}
- PlannedTime {{plannedTime}}
- OperatingTime {{operatingTime}}
- Good {{goodCount}}
- Defect {{defectCount}}
```

### U2 Durus reason onerisi taslagi

```text
Asagidaki durus bilgisine gore en uygun reason oner.
Oneri bir tahmindir ve operator onayi olmadan kaydedilemez.

Veri
- Makine {{machineName}}
- Baslangic {{startedAt}}
- Sure {{durationMinutes}}
- Mevcut reason {{currentReason}}
- Makine durumu {{machineState}}
```

## Taslak Env Degiskenleri

Degerler use case secilince netlesecek

```bash
OPENAI_API_KEY=replace_me
OPENAI_MODEL=replace_me
OPENAI_TIMEOUT_MS=replace_me
AI_CACHE_TTL_MS=replace_me
AI_LOG_MODE=replace_me
```

## Test ve Dogrulama

MVP icin minimum dogrulama adimlari

- Yetkisiz kullanici endpoint e erisememeli
- Timeout oldugunda UI hata vermeden devam etmeli
- Kaynak degisince cache dogru ayrilmali
- Prompt icinde gizli alanlar olmamali

## Checklist

### Karar asamasi

- [ ] Ilk AI use case karari
- [ ] Kullanilacak ekran ve akis karari
- [ ] Yetki modeli karari
- [ ] Prompt input ve output semasi karari
- [ ] Loglama ve maliyet politikalari karari

### Implementasyon asamasi

- [ ] Backend AI domain taslagi
- [ ] Endpoint ve response semasi
- [ ] Frontend gosterim ve hata akisi
- [ ] Guvenlik loglama ve maliyet kontrolu
- [ ] Basit dogrulama testleri

## Notlar ve Parking Lot

- Model secimi benchmark ile netlestirilecek
- Prompt versiyonlama ihtiyaci use case sayisi artinca tekrar degerlendirilecek

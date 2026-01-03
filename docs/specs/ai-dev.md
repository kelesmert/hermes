# AI Gelistirme Rehberi

Bu dokuman, projede AI entegrasyonu icin tek kaynak olacak.
Hedef, sadece bu dosyayi okuyarak AI gelistirmesine baslayabilecek kadar net bir kilavuz tutmak.

Bu asamada MVP icin hedeflenen use case seti netlestirildi.
Implementasyon henuz baslamadi ve bu dosya gelistirme kilavuzu olarak tutulacak.

## Dokuman Meta

- Versiyon 0.5
- Son guncelleme 2026-01-03
- Degisiklik ozeti
  - Dokuman iskeleti guclendirildi
  - Proje baglami ve dosya haritasi eklendi
  - Karar kaydi sablonu eklendi
  - Teknik tasarim ve test iskeleti eklendi
  - Net kararlar detaylandirildi
  - U1 loss breakdown veri kaynagi netlestirildi
  - Use case bazli TTL ve expiresAt karari eklendi
  - POST cache ve forceRefresh semantigi eklendi
  - Latest endpoint semantigi pencere bazli netlestirildi
  - Ham prompt saklamama karari eklendi
  - U3 baseline N ve source ayrimi karari eklendi
  - Hub yetki modeli filtered list olarak netlestirildi
  - Rate limit ve aylik maliyet limiti netlestirildi
  - Rate limit soft warning ve hard block netlestirildi
  - Rate limit scope hibrit netlestirildi
  - OpenAI timeout retry politikalari netlestirildi

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
- [x] MVP icin hedef use case seti netlesti
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

### Mimari yaklasim

- Backend tarafinda tek bir AI domain olacak
  - OpenAI client yonetimi tek noktada
  - Prompt template ve versiyonlama tek noktada
  - Diger domainlerden deterministik veri toplama
  - Cache rate limiting maliyet kontrolu
- Frontend tarafinda use case bazli componentler olacak
  - OeeInsightCard ReasonSuggestion AnomalyAlert gibi
  - Ortak AI API client `ai-api.js`
- AI icin ayrica bir hub sayfasi olacak
  - Ama ana kullanim ilgili sayfalardaki kartlar uzerinden olacak

### Endpoint tasarimi

- API sekli use case basina endpoint olacak
- POST ile analiz uretilecek, GET ile gecmis analizler gosterilecek

POST endpointleri taslagi

- `POST /api/ai/oee-insight`
- `POST /api/ai/downtime-reason`
- `POST /api/ai/anomaly-risk`

GET endpointleri taslagi

- `GET /api/ai/insights`
- `GET /api/ai/insights/latest`
- `GET /api/ai/insights/:id`

Latest endpoint semantigi

- `latest` pencere bazli calisacak
- UI hangi pencereyi kullaniyorsa ayni parametrelerle `latest` sorgulanacak
- Amaç kesin eslesme ve debug edilebilirlik

Ornek sorgular

```text
GET /api/ai/insights/latest?useCase=oee-insight&machineId=...&source=shift-sim&mode=shift&shiftDate=2026-01-03
```

```text
GET /api/ai/insights/latest?useCase=oee-insight&machineId=...&source=shift-sim&mode=range&from=2026-01-01T00:00:00.000Z&to=2026-01-07T00:00:00.000Z
```

POST tekrar analiz ve cache davranisi

- Ayni input icin tekrar analiz istendiginde backend cache kontrolu yapacak
- UI `forceRefresh` ile cache bypass edebilecek

Davranis ozeti

- Varsayilan `forceRefresh false`
- Backend
  - Son 1 saat icinde ayni input icin kayit var mi bakar
  - `dataSnapshotHash` eslesiyor mu kontrol eder
  - Eslesiyorsa cached sonucu `cacheHit true` ile dondurur
  - Yoksa veya stale ise yeni analiz uretir, kaydeder ve `cacheHit false` dondurur
- `forceRefresh true` ise her zaman yeni analiz uretilir ve yeni dokuman olusur

### Kalici kayit ve retention

- AI analizleri MongoDB icinde `ai_insights` koleksiyonunda kalici saklanacak
- Her yeniden analiz yeni bir dokuman olusturacak
- Retention politikasi
  - U1 U2 icin 90 gun
  - U3 icin 7 gun
- Kullanici basina son 50 analiz limiti uygulanacak, eskiler silinecek

Use case bazli TTL icin yontem

- `expiresAt` alani + TTL index
  - Index `expireAfterSeconds 0` olacak
  - Silme davranisi `expiresAt` tarihine gore olur
- U1 U2 icin `expiresAt = generatedAt + 90 gun`
- U3 icin `expiresAt = generatedAt + 7 gun`

Ham prompt saklama karari

- Ham prompt metni DB ye kaydedilmeyecek
- Sadece normalized input ozetleri ve output saklanacak
- Prompt hangi template ile calisti `promptVersion` ile izlenebilir

### Prompt versiyonlama

- Prompt versiyonu kod icinde sabit tutulacak
- Response icinde `promptVersion` donulecek

### Yetki modeli

- Yeni permission eklenmeyecek
- Mevcut permissionlar ile korunacak

Use case permission mapping

- U1 OEE Insight reports.read
- U2 Reason Suggestion machines.read
- U2 Reason Onay machines.write
- U3 Anomaly machines.read
- Hub sayfasi filtered list olarak calisacak
  - Navigation tarafinda permission array patterni kullanilacak
  - Kullanici hub a girebiliyorsa sadece erisebildigi use caseleri gorecek

### Stale veri uyarisi

- Her kayitta input verisinin ozet hash degeri `dataSnapshotHash` saklanacak
- UI mevcut veri ile hash karsilastiracak
  - Eslesmezse uyari gosterilecek
  - Yeniden analiz et aksiyonu sunulacak

dataSnapshotHash ana alanlari

- U1 availability performance quality oee plannedTimeMs operatingTimeMs goodCount defectCount top3Reasons
- U2 machineId downtimeId durationMinutes reasonCode
- U3 machineId affectedMetrics riskLevel

### AI SDK secimi

- MVP implementasyonda OpenAI SDK + kendi wrapper kullanilacak
- LangChain CommonJS , ECMAjs uyumu daha sonra kararlasirilacak
- Langchain kullanabilmek icin ECMA refactoru dusunulecek.
- LangGraph kullanilmayacak

### Hub sayfasi yetkisi

- Hub sayfasi tek bir permission ile korunmayacak
- Hub sayfasi navigation da permission array ile gorunur olacak
- Kullanici sadece erisebildigi use caseleri gorecek
  - UI `hasPermission` ile use case kartlarini filtreleyecek
  - API tarafinda da list response kullanicinin erisebildigi use case ler ile filtrelenecek

### Rate limiting ve maliyet kontrolu

Genel karar

- Rate limit icin memory store yeterli
- Bu tez projesi tek instance oldugu icin memory store kabul edilir
- Mongo tabanli rate limit kutuphaneleri kullanilmayacak
  - Ornek rate limit mongo kutuphaneleri uzun suredir guncellenmiyor

Maliyet ve kullanim izleme

- Kullanim kaydi icin `ai_usage` koleksiyonu olacak
  - Rate limit icin zorunlu degil
  - Ama maliyet ve raporlama icin faydali

Limit profili

- Varsayilan profil A Conservative olacak
- Limitler env ile ayarlanabilir olacak
- Limit e yaklasinca UI soft warning gosterecek

Varsayilan limitler

- Saatlik limitler
  - U1 5 per hour
  - U2 15 per hour
  - U3 10 per hour
- Gunluk global limit 200
- Aylik maliyet limiti 10 dolar

Rate limit scope

- Hibrit
  - Hourly limit per user
  - Daily ve monthly limit global

Soft warning ve hard block

- Soft warning esigi yuzde 80
  - UI tarafinda uyari goster
- Hard block yuzde 100
  - Limit asildiginda yeni AI cagrisi yapma

OpenAI timeout ve retry politikalari

- Timeout 30 saniye
- Max retry 3
- Backoff exponential 1 saniye 2 saniye 4 saniye
- 429 rate limit durumunda Retry After header varsa ona uy
- Sadece gecici hata siniflarinda retry
  - 429
  - 500
  - 503
  - Network timeout gibi gecici hatalar

### U1 OEE Insight Asistani

- Amac OEE verisini dogal dile cevirmek ve aksiyon onerisi vermek
- U7 trend ozeti bu use case icine dahil edildi
  - Haftalik veya aylik gorunumde onceki doneme gore karsilastirma yapilacak
  - AI gecen haftaya veya aya gore degisimi yorumlayacak
- Prompt stratejisi tek prompt ve JSON cikti olacak
- Loss breakdown verisi top 3 reason ve kategori toplam seklinde gelecek
  - Kaynak AI domain icinde deterministik MachineEvent aggregation olacak
  - OEE calculator degistirilmeden ayri bir fonksiyon ile hesaplanacak
  - affectsOee false olan planli reasonlar top 3 listesine dahil edilmeyecek
- Operator karsilastirma deterministik siralama ile yapilacak, AI sadece yorum yazacak

### U2 Durus Reason Onerisi

- Tetikleyici modal acilinca lazy olacak
- reasonCode unplanned_stop degilse AI cagrisi yapilmayacak
- Telemetry ham veri gonderilmeyecek, sadece ozet featurelar gonderilecek
- Confidence format band olacak high medium low

### U3 Anomali Risk Uyarisi

- U6 kalite korelasyonu bu use case icine dahil edildi
  - Telemetry metrikleri ile defect orani arasindaki iliski raporlanacak
  - Ornegin sicaklik X ustunde defect orani artiyor gibi
- mock batch kaynagi opsiyonel olarak dusunulecek
  - Hazir uretilmis veriden de AI analizi yapilabilir
  - Canli izleme senaryosunda baseline hesabi farkli olabilir
  - Onemli kisit mock batch anlik veri uretmedigi icin gercek zamanli uyari alamaz
    - Ornegin 14 00 de durus olabilir gibi proaktif uyari yapilamaz
    - Ama gecmis veri uzerinden pattern analizi ve retrospektif insight yapilabilir
- Baseline memory + TTL 1 saat olacak
  - Restart sonrasi baseline sifirlanmasi kabul
- Baseline ornek sayisi `N 500` olacak
- Baseline source bazli ayri tutulacak
  - shift sim ve data gen farkli baseline ile izlenecek
- Metrikler temperatureC torqueNm energyKwh
- Esik z score 2.5 ustu
  - Ek kosul en az 2 metrik anormal veya tek metrik z 3.5 ustu

## Acik Sorular ve Opsiyonlar

### Opsiyonel use case

- U4 Serbest soru cevap yardimcisi
  - Ama tez demo etkisi yuksek
  - Ama yetki ve veri sizdirma riski en yuksek

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

Bu bolum taslaktir, net kararlar bolumundeki endpoint listesi referanstir

- `POST /api/ai/oee-insight`
- `POST /api/ai/downtime-reason`
- `POST /api/ai/anomaly-risk`
- `GET /api/ai/insights`
- `GET /api/ai/insights/latest`
- `GET /api/ai/insights/:id`

### Response semasi taslagi

```json
{
  "useCase": "replace_me",
  "generatedAt": "2026-01-03T20:00:00.000Z",
  "summary": "replace_me",
  "highlights": ["replace_me"],
  "actions": [
    {
      "title": "replace_me",
      "reason": "replace_me"
    }
  ],
  "warnings": ["replace_me"]
}
```

### Ornek request ve response

Not Bu ornekler taslaktir ve su anki kod ile birebir uyum garantisi vermez.
Use case secilince ve endpoint gercekten yazilinca bu bolum guncellenir.

Ornek request U1 OEE Insight

```json
{
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

Ornek response U1 OEE Insight

```json
{
  "useCase": "oee_insight",
  "promptVersion": "replace_me",
  "dataSnapshotHash": "replace_me",
  "generatedAt": "2026-01-03T20:00:00.000Z",
  "summary": "replace_me",
  "highlights": ["replace_me"],
  "actions": [
    {
      "title": "replace_me",
      "reason": "replace_me"
    }
  ],
  "warnings": ["replace_me"]
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
- JSON formatinda cikti uret

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
- Sadece katalogdan sec
- Cikti confidence band olacak
```

### U3 Anomali risk uyarisi taslagi

```text
Asagidaki ozet featurelara gore risk seviyesini yorumla.
Tahmin degil uyari yaz, kanit olarak hangi metriklerin anormal oldugunu belirt.

Veri
- Makine {{machineName}}
- Kaynak {{source}}
- Anormal metrikler {{affectedMetrics}}
- Z score degerleri {{zScores}}
- Risk seviyesi {{riskLevel}}
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

- [x] Ilk AI use case karari
- [x] Kullanilacak ekran ve akis karari
- [x] Yetki modeli karari
- [x] Prompt input ve output semasi karari
- [x] Use case bazli TTL expiresAt karari
- [x] POST cache ve forceRefresh semantigi karari
- [x] Latest endpoint semantigi karari
- [x] Ham prompt saklamama karari
- [x] U3 baseline N ve source ayrimi karari
- [x] Hub sayfasi permission karari
- [x] Rate limiting ve maliyet politikalari karari

### Implementasyon asamasi

- [ ] Backend AI domain taslagi
- [ ] Endpoint ve response semasi
- [ ] Frontend gosterim ve hata akisi
- [ ] Guvenlik loglama ve maliyet kontrolu
- [ ] Basit dogrulama testleri

## Notlar ve Parking Lot

- Model secimi benchmark ile netlestirilecek
- Prompt versiyonlama ihtiyaci use case sayisi artinca tekrar degerlendirilecek

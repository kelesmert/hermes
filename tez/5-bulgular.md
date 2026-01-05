# 5. BULGULAR

Bu bölümde, çalışmada geliştirilen sistemin ürettiği somut çıktılar örnek senaryolar üzerinden sunulmaktadır. Bulgular; belirli bir başlangıç verisi (girdi), sistemin uyguladığı işlem ve elde edilen çıktı şeklinde yapılandırılmış; her bir senaryo ilgili ekran görüntüsü veya şema ile desteklenecek biçimde kurgulanmıştır. Bu yaklaşımın amacı, sistemin işlevlerini tekrar anlatmak değil; ölçülebilir çıktıların izlenebilir bir formatta raporlanmasını sağlamaktır.

## 5.1 OEE Metrikleri ve Örnek Hesaplamalar

**Girdi:** Seçili bir makine için belirli bir time window içinde oluşmuş üretim kayıtları (sağlam/hatalı adet) ve aynı time window'u kapsayan çalışma sinyali/duruş kayıtları.

**İşlem:** Sistem, seçili time window için OEE bileşenlerini (Availability, Performance, Quality) hesaplar ve bu bileşenleri çarpım ilişkisi içinde OEE değerine dönüştürür. Hesaplama bağlamı (makine, time window, veri kaynağı) rapor kartları üzerinde görünür şekilde sunulur.

**Çıktı:** OEE ve alt bileşen değerleri; ayrıca seçili time window için özet adet bilgileri (toplam üretim, sağlam, hatalı). Değerler rapor ekranından okunarak Çizelge 5.1’e aktarılır.

**Görsel:** Resim 5.1 (OEE rapor ekranı özet kartları), Resim 5.2 (filtreler ve pencere seçimi), Çizelge 5.1 (OEE sonuç özeti).

**Girdi:** Aynı makine için birden fazla gün/shift window (en az 7 iş günü) ve bu window'larda hesaplanmış OEE sonuçları.

**İşlem:** Sistem, her time window için OEE hesaplayarak bir time series (trend) üretir; veri bulunmayan window'lar coverage yaklaşımı ile görünür kılınır.

**Çıktı:** OEE trend grafiği ve gün bazlı özet tablo. Trend grafiği ve coverage göstergesi ekran görüntüsü olarak alınır.

**Görsel:** Resim 5.3 (OEE trend grafiği), Resim 5.4 (coverage/özet alanı), Çizelge 5.2 (trend özet tablosu).

## 5.2 Duruş Analizi Örneği

**Girdi:** Seçili bir makine için kapanmış duruş kayıtları (en az 10 kayıt) ve bu kayıtların planlı/plansız sınıflandırması ile reason bilgileri.

**İşlem:** Sistem, duruşları filtrelenebilir bir geçmiş görünümünde listeler; reason/kategori bazında gruplama ve süre odaklı sıralama ile analiz edilebilir bir çıktı üretir.

**Çıktı:** Duruşların kategori/reason dağılımı ve en yüksek süreye sahip duruşların listesi. Bu çıktı, geçmiş duruş ekranından alınan ekran görüntüsü ve Çizelge 5.3 ile raporlanır.

**Görsel:** Resim 5.5 (duruş geçmişi filtreleri ve liste), Resim 5.6 (en yüksek süreli duruşlar örneği), Çizelge 5.3 (duruş dağılımı özeti).

**Girdi:** Kapanmış tekil bir plansız duruş kaydı ve aynı makine için önceki benzer kayıtlar (son 30 gün).

**İşlem:** Sistem, duruş kaydına ait bağlamsal bilgileri (başlangıç/bitiş, duration, seçili reason) temel alarak post-mortem analiz çıktısını üretir ve ayrı bir dialog içinde sunar (U2).

**Çıktı:** Özet + patternlar + aksiyon önerileri (+ varsa uyarılar) şeklinde yapılandırılmış analiz çıktısı.

**Görsel:** Resim 5.7 (AI Duruş Analizi diyaloğu).

## 5.3 Simülasyon Çıktıları

**Girdi:** Başlangıçta boş veya sınırlı veri içeren bir çalışma ortamı; simulation bileşeninin çalıştırılması ile üretilecek telemetry ve üretim akışına yönelik senaryo.

**İşlem:** Telemetry ve üretim akışını temsil eden simulation süreçleri başlatılır; sistem, izleme ekranlarında telemetry serisini ve raporlama ekranlarında metrikleri oluşturacak veri akışını üretir.

**Çıktı:** İzleme ekranında sinyal ve metrik trend serileri; rapor ekranında ilgili pencere için hesaplanabilir OEE çıktısı. Bu senaryo, “veri üretimi → izleme → rapor” zincirinin uçtan uca çalıştığını gösterir.

**Görsel:** Resim 5.8 (simulation kontrol ekranı), Resim 5.9 (izleme ekranı sinyal grafiği), Resim 5.10 (telemetry metrik grafikleri).

## 5.4 AI Modülü Çıktıları

**Girdi:** Seçili bir makine için raporlama ekranında hesaplanmış OEE çıktısı (time window ve veri kaynağı belirli) ve AI analizinin tetiklenmesi.

**İşlem:** Sistem, rapor bağlamını özetleyen bir snapshot oluşturur; bu girdi üzerinden LLM’den yapılandırılmış (JSON şemasına uyan) bir açıklama çıktısı alınır. Uygun durumda aynı veri için cache'den yararlanılabilir; veri değiştiğinde ise analiz stale uyarısı ile işaretlenebilir.

**Çıktı:** OEE Insight (U1) çıktısı: kısa özet, öne çıkanlar, aksiyon önerileri ve uyarılar. Çıktı, rapor ekranındaki AI kartından ekran görüntüsü olarak alınır.

**Görsel:** Resim 5.11 (OEE Insight çıktısı), Resim 5.12 (stale uyarısı / yeniden analiz örneği).

**Girdi:** Kapanmış plansız duruş kaydı ve duruş analizinin tetiklenmesi (U2).

**İşlem:** Sistem, duruşa ait özet veriyi ve sınırlı bağlamsal sinyalleri derleyerek post-mortem analiz çıktısı üretir; açık duruşlarda analiz üretilmez.

**Çıktı:** U2 çıktısı: özet + patternlar + aksiyonlar (+ varsa uyarılar). Çıktı, duruş analiz diyaloğundan ekran görüntüsü olarak alınır.

**Görsel:** Resim 5.13 (U2 post-mortem analiz çıktısı).

**Görsel Önerileri**

- Çizelge 5.1: OEE sonuç özeti (A/P/Q/OEE + üretim adetleri)
- Çizelge 5.2: OEE trend özet tablosu (gün/shift bazlı)
- Çizelge 5.3: Duruş dağılımı özeti (kategori/reason + toplam süre)
- Şekil 5.1 (genel): “Simülasyon → izleme → rapor → AI” veri akışı zinciri

## Simgeler ve Kısaltmalar

- A = Availability (Kullanılabilirlik)
- AI = Artificial Intelligence (Yapay Zekâ)
- JSON = JavaScript Object Notation (Veri değişim formatı)
- LLM = Large Language Model (Büyük Dil Modeli)
- OEE = Overall Equipment Effectiveness (Toplam Ekipman Etkinliği)
- P = Performance (Performans)
- Q = Quality (Kalite)
- U1/U2 = Use Case 1/2 (Kullanım Senaryosu)

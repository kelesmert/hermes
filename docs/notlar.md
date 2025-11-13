# Mevcut Domainler ve Görevleri

1. AUTH Domain
   Login (username + password)
   Register (admin-only)
   Token refresh (rotation ile)
   Logout (refresh token iptal)
2. USERS Domain
   Kullanıcı listesi
   Kullanıcı oluştur
   Kullanıcı güncelle (roller, aktif/pasif)
   Kullanıcı sil
3. ACCESS-CONTROL Domain
   Rol listesi
   Rol oluştur
   Rol güncelle (permissions ata)
   Rol sil
   Permission listesi
4. MACHINES Domain
   Makine listesi
   Makine oluştur
   Makine güncelle
   Makine sil
   Makine event'leri listele (duruşlar)
   Makine event oluştur (manuel duruş kaydı)
5. BOARD Domain
   Dashboard metrikleri (makine sayıları, ortalama telemetry)
   Tek makine metrikleri
   Makine telemetry serisi (grafikler için)
   Aslında sadece OEE domain'ini çağırıyor (proxy)
6. OEE Domain
   Telemetry verilerini işle (background job)
   Otomatik downtime algıla
   Makine durumunu güncelle
   Dashboard için metrik hesapla
   Routes/controllers YOK, sadece service + job
   Özet
   Auth → Kimlik doğrulama
   Users → Kullanıcı yönetimi
   Access-Control → Rol/yetki yönetimi
   Machines → Makine & event CRUD
   Board → Dashboard proxy
   OEE → Arka planda telemetry analizi + metrik hesaplama (API yok)

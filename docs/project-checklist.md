# MES MVP Checklist

## Hazırlık
- [x] Kararlar ve kurallar dokümanı (`docs/project-guidelines.md`)
- [x] Yol haritası dokümanı (`docs/project-roadmap.md`)
- [x] Tez raporu şablonu (`docs/project-report.md`)
- [x] Gereksinim detaylandırması (`docs/requirements.md` veya eşdeğeri)
- [x] Teknoloji seçimleri ve gerekçeleri dokümanı (`docs/technology-notes.md`)
- [x] Repo yapısının oluşturulması (backend/frontend klasörleri, ortak yapılandırmalar)
- [x] `.env.example` dosyaları (backend/frontend)
- [ ] Lint/test scriptleri ve temel proje ayarları (ilgili proje kurulumu tamamlandıktan sonra)
- [x] Lokal doğrulama (seed + dev sunucu + `/api/health` ve `/api/auth/login`)

## Backend
- [x] Node.js + Express projesi kurulumu
- [x] MongoDB bağlantısı ve konfigürasyonu
- [x] Kullanıcı, rol ve session modelleri
- [x] JWT tabanlı auth akışı (register/login/refresh/logout)
- [x] RBAC middleware ve korunan endpoint örnekleri
- [x] Admin kullanıcı seed script’i
- [ ] Tokenları cookie tabanlı yönetime geçir (HTTP-only, Secure, SameSite) ve CSRF koruması ekle
- [ ] Makine modeli, durum geçişleri ve olay kayıtları API’leri
- [ ] Veri simülasyon script’i (cron veya scheduler)
- [ ] Raporlama endpointleri (verimlilik, duruş süreleri vb.)
- [ ] CSV/Excel export servisi
- [ ] Audit log middleware’i ve kayıt koleksiyonu
- [ ] AI analiz modülü (kural tabanlı veya model entegrasyonu)
- [ ] Auth akışı için refresh/logout endpoint testleri ve Postman senaryoları

## Frontend
- [ ] React (Vite) projesi kurulumu ve temel yapı
- [ ] UI kit seçimi ve tema ayarları
- [ ] Auth sayfaları (login, logout, rol yönlendirmeleri)
- [ ] Dashboard layout ve genel metrik kartları
- [ ] Makine kartları (durum renkleri, aksiyon butonları, polling/WS)
- [ ] Raporlama sayfası + filtreler
- [ ] CSV/Excel export butonları ve kullanıcı geri bildirimi
- [ ] Audit log görüntüleme ekranı
- [ ] AI analiz sonuçlarını gösteren bileşen
- [ ] Opsiyonel çok dillilik altyapısına hazırlık

## Test ve Dağıtım
- [ ] Backend için birim/entegrasyon testleri (Jest/Supertest)
- [ ] Frontend için temel component testleri (React Testing Library)
- [ ] Manual end-to-end senaryoların listesi
- [ ] Lokal çalıştırma rehberi (README güncellemesi)
- [ ] Docker/Docker Compose dosyaları (opsiyonel)
- [ ] Nihai raporlama ve gelecek iş listesi güncellemesi
- [ ] Postman: cookie tabanlı login/refresh/logout senaryoları ve otomasyon testleri

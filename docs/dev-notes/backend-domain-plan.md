# Backend Domain Yapısı Planı

## Hedef
Mevcut monolit backend'i domain bazlı klasörlere ayırarak kod organizasyonunu güçlendirmek, yeni domain eklemeyi kolaylaştırmak ve ileride mikroservis dönüşümünü basitleştirmek.

## Önerilen Dizin Yapısı
```
backend/src/
├── app.js
├── server.js
├── config/
├── middleware/
├── utils/
├── constants/
├── shared/              # domainler arası reusable helperlar (mailer, events, validation, vb.)
├── domains/
│   ├── auth/
│   │   ├── controllers/
│   │   │   └── auth-controller.js
│   │   ├── services/
│   │   │   └── auth-service.js
│   │   ├── routes/
│   │   │   └── auth-routes.js
│   │   ├── models/
│   │   │   ├── user-model.js
│   │   │   ├── role-model.js
│   │   │   └── permission-model.js
│   │   └── index.js (opsiyonel, domain exportları)
│   ├── users/
│   │   ├── controllers/users-controller.js
│   │   ├── services/users-service.js
│   │   ├── routes/users-routes.js
│   │   └── models/index.js (ileride makine/rapor domain'leri eklenecek)
│   └── ...
└── domains/index.js (tüm domain routerlarını toplayan nokta)
```

## Geçiş Adımları
1. `src/domains/` klasörü oluşturulacak.
2. Mevcut auth dosyaları (model/service/controller/route) `src/domains/auth` altına taşınacak; import path'leri `@/domains/auth/...` olarak güncellenecek.
3. `users` ile ilgili dosyalar `src/domains/users` altına alınacak.
4. `src/routes/index.js` yerine `src/domains/index.js` kullanılacak; tüm domain routerları burada toplanacak.
5. Model preload işlemi domain bazlı hale getirilecek (her domain `models/index.js`'inde kendi modellerini require eder; `domains/index.js` bunları çağırır).
6. Alias ve lint ayarları yeni path'lere göre güncellenecek; dokümantasyon (backend decisions) bu planı yansıtacak.
7. Yeni domain eklenirken seed script, permission sabitleri ve Postman koleksiyonları da güncellenmeli.

## Notlar
- Şimdilik tek MongoDB instance'ı kullanılmaya devam edecek; domainler aynı veritabanını paylaşacak.
- `shared/` sadece domainler arasında tekrar kullanılacak helperlar içindir; domain özel logic orada tutulmayacak.
- Plan aşamasında; fiziksel taşıma yapılırken her adım commit/PR üzerinden izlenmeli.

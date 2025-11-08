# Teknik / Operasyonel Zorunlu Kararlar

> Bu dosya, frontend ve backend’e doğrudan bağlı olmayan,
> ancak proje için zorunlu olan **teknik/operasyonel kararları** içerir
> (örneğin DevOps, CI/CD, container imajları, izleme araçları vb.).
>
> - Kesin kullanılacak teknolojiler ve servisler
> - Ortak klasör / repo yapısı standartları
> - Kritik komut, pipeline veya metod kullanım örnekleri
>
> Buradaki kurallar, güncellenene kadar **değiştirilemez** kabul edilir.
> Genel kültür veya “Türkçe / İngilizce dili” gibi kurallar
> `project-guidelines.md` içinde tutulur.
> Neden böyle seçildiğini görmek için `../logs/decision-log.md` ve
> `../logs/tech-decision-logs.md` dosyalarına bak.

## 1. Repo Yapısı

- Monorepo: `backend/`, `frontend/`, `docs/` ana klasörleri zorunludur.
- Tüm dokümantasyon `docs/` altında belirtilen klasör yapısına göre tutulur (`standart/`, `logs/`, `specs/`, `tasks/`, `meta/`).
- Ortak script veya konfig dosyaları (`.editorconfig`, `.gitignore`, `README.md`) repo kökünde yer alır.

## 2. Ortam Değişkenleri

- Backend `.env` dosyaları `backend/.envexample` şablonunu takip eder; frontend `VITE_` prefix’li env kullanır.
- `VITE_API_URL` değeri backend API kökünü gösterir (lokalde `http://localhost:5000/api`).
- Access/refresh token cookie mimarisine geçildiğinde hem backend hem frontend `.env` şablonları aynı anda güncellenir.

## 3. Versiyon Kontrolü

- Git branch isimleri kebab-case formatında (`feature/add-machine-api`).
- `main` branch her zaman çalışan sürümü temsil eder; büyük değişiklikler feature branch’lerde yapılır.
- Commit mesajları açıklayıcı olmalı; “fix” gibi belirsiz mesajlar kullanılmaz.

## 4. CLI & Script Kullanımı

- Node script’leri `npm` üzerinden çağrılır (`npm run dev`, `npm run seed`). Doğrudan `node src/server.js` komutu paylaşılmaz.
- Seed ve migrate gibi kritik script’ler `package.json` içinde tanımlanır ve README’de açıklanır.
- Test/lint script’leri hem backend hem frontend’de zorunlu hale geldiğinde CI pipeline’ına eklenecek.

## 5. Dokümantasyon Disiplini

- Her karar `docs/logs/decision-log.md` içine kaydedilir; teknoloji gerekçeleri `docs/logs/tech-decision-logs.md`’a eklenir.
- Standart dosyalar (`docs/standart/*.md`) güncellenmeden kod değişikliği yapılmaz; önce kural güncellenir, sonra implementasyon yapılır.
- `project-guidelines.md` doküman haritasını ve yüksek seviye özetleri içerir; güncel tutmak zorunlu.

## 6. İzleme ve Sağlık

- Health check endpoint’i `/api/health` hem manuel testlerde hem de ileride eklenecek monitörlerde kullanılacak.
- Geliştirme ortamında MongoDB bağlantısı başarısız olursa uygulama `process.exit(1)` ile sonlanır; sessiz hata kabul edilmez.

## 7. Güvenlik Esasları

- API isteklerinde CORS ayarları `config/clientUrl` değerine göre belirlenir; `*` izin verilmez.
- Env dosyaları Git’e commitlenmez; sadece `.env.example` sürümü paylaşılır.
- Geçici olarak `localStorage` kullanılan refresh token, cookie yapısı hazır olur olmaz kaldırılacak; bu değişim `decision-log`’a kaydedilecek.

Bu kurallar tüm ekip tarafından uygulanmak zorundadır; değişiklik gerekiyorsa önce bu dosya güncellenir.

# Hermes Frontend (Vite + React)

Bu klasör Hermes MES MVP’nin React tabanlı kullanıcı arayüzünü barındırır. Teknoloji seçimleri ve zorunlu kurallar için `docs/standart/frontend-decisions.md` dosyasını referans alın.

## Kurulum

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Varsayılan adres: `http://localhost:5173/`
- Login ekranında kullanıcı adı + şifre kullanılır (örn. `admin / ChangeMe123!`). `/users` rotasında kullanıcı tablosu ve `roles.manage` izni olanlar için rol/permission sekmesi bulunur.

## Yapı
- `src/app` → Providers, tema ve route guard bileşenleri.
- `src/components/layout` → Sidebar, header, breadcrumbs ve kabuk bileşenleri.
- `src/features/*` → Domain odaklı modüller (auth, dashboard, raporlar, kullanıcılar vb.).
- `src/lib` → axios client, query client ve yardımcılar.
- `src/styles/global.css` → Global CSS reset/tema ayarları.

`@/` alias’ı `src/` dizinine işaret eder; karmaşık relatif yollar yerine bu alias kullanılmalıdır.

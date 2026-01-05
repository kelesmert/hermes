# Tez yazim notlari

Bu dosya, tez yazimi sirasinda uyulacak temel kaynaklari ve kisa hatirlatmalari ozetler.

## Birincil referanslar

- tez/rapor.md: resmi format ve sayfa duzeni kurallari
- tez/yazim-rehberi.md: yazim kurallari, kanit odakli yazim, kaynak sistemi
- tez/bolum-yapisi.md: bolum ve alt baslik yapisi (nihai)
- tez/ekranlar.md: 4.x modulleri icin ekran goruntusu eslesmeleri
- tez/tez-context.md: proje ve tez baglami, kararlar ve ilerleme

## Ikincil referanslar

- tez/ornek1.md, tez/ornek2.md: yalnizca yapi ve stil icin, resmi kural degil

## Sekil onermeleri 3.1

- Sekil 3.1: Istemci sunucu mimari diyagrami (genel, web client -> API server -> database akisi)
- Sekil 3.2: Monorepo yapi diyagrami (projeye ozel, repo kokunde backend, frontend, docs, tez bloklari)

## Ek yazim kurallari (Hermes odakli)

- 1 paragraf = 1 ana iddia; ayni faydayi farkli cumlelerle tekrar etme
- Soyut fayda cumlesi tek basina yazilmaz; kritikse somut mekanizma/isim eklenir
- Hermes'e ozgu oge kullanimi zorunlu degil; akisi bolmeyecek sekilde, yalnizca gerekli yerlerde gecirilir
- Tekrar filtresi: ayni anahtar kelime 2. kez geliyorsa ya sil ya somut detayla degistir
- Genel cumle -> Hermes cumlesi: sadece kritik noktalarda eklenir, her cumlede zorunlu degil
- Paragraf ritmi: 2-5 cumle, tek akista; dosya/route/env adlarini listeleme
- Akademik ton: "Hermes" yerine "bu proje" / "bu calisma" kullan
- Kod detayi filtresi: bu bolumlerde route/dosya/adim isimleri yalnizca kritikse anilir, aksi halde genel ifade kullanilir

## Ana yazim kurallari (tez anlati odakli)

- Amac anlatimi, kod belgelemesi degildir; metin "nasil bir sistem tasarlandi ve neden" sorusunu yanitlar
- Katman ve yaklasim odakli yaz; web/api, veri, kimlik/yetki gibi islevsel basliklar kullan
- En fazla iki seviye alt baslik kullan (or. 3.2 -> 3.2.1-3.2.4)
- Teknoloji kataloglama yok; "X nedir" anlatimi baslik olmaz, gerekirse tek cumleyle gecilir
- Her paragraf tek bir ana fikre hizmet eder; ayni faydayi tekrar etme
- Genel ama savunulabilir dil kullan; "amaclanmistir/tercih edilmistir/tasarlanmistir" gibi fiiller
- Proje ozel baglam yeterlidir; isim vermek zorunlu degildir, kritikse tek isim anilir
- Tekrar filtresi uygula; ayni anahtar kelime ikinci kez geliyorsa sil ya da somutlastir
- Birlesik anlatim esastir; ayni katmandaki teknolojileri tek akista anlat
- Okunabilirlik onceliklidir; metin katalog gibi degil, teknik ama akici olur
- Her metin uretiminden sonra: varsa sekil/cizelge/grafik/resim (ekran goruntusu) onerilerini ayri olarak belirt

# 6. SONUÇ VE ÖNERİLER

Bu bölümde, çalışmanın ortaya koyduğu sistemin genel değerlendirmesi yapılmakta; elde edilen kazanımlar, uygulama sürecinde karşılaşılan zorluklar ve geleceğe dönük geliştirme önerileri özetlenmektedir. Amaç, önceki bölümlerde ayrıntılandırılan tasarım ve uygulama kararlarının proje hedefleri açısından ne ölçüde karşılandığını netleştirmek ve olası iyileştirme alanlarını somut bir yol haritası şeklinde ortaya koymaktır.

## 6.1 Projenin Özeti

Bu çalışma kapsamında, üretim ortamında makine durumu, üretim kayıtları ve duruş verilerinin bütünleşik biçimde izlenebildiği, raporlanabildiği ve kullanıcı rollerine göre kontrollü erişim sağlayan bir web tabanlı sistem tasarlanmış ve geliştirilmiştir. Sistem; kullanıcı/erişim yönetimi, makine yönetimi, üretim takibi, duruş yönetimi ve OEE raporlama bileşenlerini tek bir uygulama çatısı altında birleştirerek, farklı operasyon ihtiyaçlarını ortak bir veri modeli üzerinde ele almayı hedeflemiştir.

Uygulama katmanında, kullanıcı akışları modül bazında kurgulanmış; ekranlar üzerinden gerçekleştirilen işlemler hem veri bütünlüğünü hem de kullanım kolaylığını destekleyecek şekilde organize edilmiştir. Raporlama tarafında ise metriklerin yalnızca sunulması değil, ilgili time window ve veri kaynağı bağlamıyla birlikte yorumlanabilir hale getirilmesi amaçlanmıştır. Bu yaklaşım, üretim performansının tekil göstergeler yerine bileşenlerine ayrıştırılarak anlaşılmasına imkan vermektedir.

Geliştirme ve doğrulama süreçlerinde, gerçek saha verisine ihtiyaç duymadan tekrarlanabilir senaryolar oluşturabilmek için simulation bileşeni kullanılmıştır. Simulation, telemetry ve üretim olayları gibi temel veri akışlarını kontrollü biçimde üreterek, hem kullanıcı arayüzü davranışlarının hem de raporlama çıktılarının uçtan uca gözlemlenebilmesini sağlamıştır. Buna ek olarak, raporların yorumlanabilirliğini artırmak amacıyla AI destekli analiz senaryoları sisteme entegre edilmiştir; ancak bu entegrasyon, karar verme otomasyonu yerine açıklama ve karar destek üretimi sınırlarında tutulmuştur.

## 6.2 Elde Edilen Kazanımlar

Çalışmanın en temel kazanımı, üretim bağlamındaki farklı veri türlerinin (makine sinyali, üretim olayları, duruş kayıtları ve kullanıcı aksiyonları) aynı sistem içinde ilişkilendirilebilir hale getirilmesidir. Bu sayede izleme ekranlarında görülen bir durumun, raporlama tarafında metriklere nasıl yansıdığı daha şeffaf biçimde izlenebilmektedir. Uygulama modüllerinin ortak bir erişim modeliyle yönetilmesi, güvenlik ve yönetilebilirlik açısından bütüncül bir yapı sağlamıştır.

Raporlama katmanında elde edilen kazanım, OEE gibi metriklerin “tek sayı” olarak sunulmasının ötesine geçilerek, alt bileşenleri ve loss type'lar üzerinden okunabilir hale getirilmesidir. Kullanıcı, aynı rapor bağlamında hem özet metrikleri hem de trend odaklı çıktıları değerlendirebildiğinde, performans değişimlerinin nedenlerini daha hızlı ayırt edebilmektedir. Böylece sistem, yalnızca kayıt tutma aracı değil; aynı zamanda operasyonel değerlendirmeyi destekleyen bir karar destek yüzeyi haline gelmektedir.

Simulation altyapısının sisteme dahil edilmesi, geliştirme ve demo süreçlerinde önemli bir pratik kazanım sunmuştur. Tekrarlanabilir veri akışı, farklı modüllerin birbirine bağımlı davranışlarının (örneğin izleme verisinin rapor ekranına etkisi) kontrollü biçimde gözlemlenmesine imkan tanımıştır. Bu yaklaşım, ileride gerçek saha verisi ile entegrasyon yapıldığında da test ve regression senaryolarının kurgulanması için güçlü bir temel oluşturmaktadır.

AI destekli analiz tarafında elde edilen kazanım, rapor çıktılarının kullanıcı tarafından daha hızlı yorumlanmasına yardımcı olacak yapılandırılmış özetlerin sisteme eklenmesidir. Buradaki amaç, analizi “otorite” olarak konumlandırmak değil; kullanıcının dikkatini kritik alanlara yönlendiren bir yardımcı katman sunmaktır. Bu doğrultuda, analiz çıktılarının kayıt altına alınması ve kullanıcı tarafından yeniden üretilebilir olması, izlenebilirlik açısından ek bir fayda sağlamaktadır.

## 6.3 Karşılaşılan Zorluklar

Üretim verilerinin doğası gereği, farklı kaynaklardan gelen kayıtların aynı zaman ekseninde tutarlı biçimde ele alınması önemli bir zorluk alanıdır. Özellikle shift window'lar, veri kaynakları ve kayıtların gecikmeli/eksik gelmesi gibi durumlar, raporların güvenilirliğini doğrudan etkileyebilir. Bu nedenle raporlama katmanında, “hangi time window ve hangi kaynakla” hesap yapıldığının açık biçimde görünür kılınması kritik hale gelmiştir.

Duruş kayıtları, veri kalitesi açısından yüksek hassasiyet gerektiren bir alan olarak öne çıkmıştır. Duruşların sınıflandırılması, çoğu zaman operatör yorumuna bağlı olduğundan, yanlış veya eksik etiketleme rapor sonuçlarını anlamlı biçimde değiştirebilir. Bu zorluk, kullanıcı arayüzünde kontrollü düzeltme akışları ve veri bütünlüğünü koruyan düzenleme sınırları ile yönetilmeye çalışılmıştır.

AI entegrasyonu tarafında ise iki temel zorluk belirginleşmiştir: (i) maliyet ve performans yönetimi, (ii) üretilen çıktının yanlış bağlamda kesin hüküm gibi algılanma riski. Bu nedenle analizler, yapılandırılmış formatta ve sınırlı kapsamla sunulmuş; kullanıcı kontrolünü önceleyen bir etkileşim modeli benimsenmiştir. Buna rağmen, özellikle canlı izleme gibi hızlı değişen bağlamlarda “analiz” kavramının sınırlarının doğru çizilmesi, dikkat gerektiren bir tasarım konusu olarak değerlendirilmiştir.

## 6.4 Gelecek Geliştirme Önerileri

İlerleyen aşamada sistemin saha kullanımına daha yakın hale getirilmesi için gerçek veri toplama katmanının güçlendirilmesi önerilmektedir. Bu kapsamda farklı veri kaynaklarının (sensör, PLC, dış sistem) entegrasyonu için standartlaştırılmış bir veri alım katmanı ve messaging/queue tabanlı mimari seçenekleri değerlendirilebilir. Böyle bir genişleme, canlı izleme ve raporlamanın ölçeklenebilirliğini artıracaktır.

Raporlama tarafında, dışa aktarma (export) ve denetim izi (audit log) gibi kurumsal ihtiyaçları tamamlayacak bileşenlerin sistemle bütünleşik hale getirilmesi önerilir. Özellikle raporların paylaşımı ve düzenleyici gereksinimler açısından kullanıcı aksiyonlarının izlenebilirliği önemlidir. Bu geliştirmeler, sistemin yalnızca operasyonel değil aynı zamanda yönetsel ihtiyaçlara da yanıt vermesini sağlar.

AI tarafında, mevcut senaryoların ürünleşmesi için kapsam ve sorumluluk sınırlarının daha net belirlenmesi önerilmektedir. Öncelik, mevcut U1 ve U2 senaryolarının kullanıcı geri bildirimi ile rafine edilmesi ve çıktının doğruluğunun izlenebilir şekilde ölçülmesidir. Canlı izleme için anomaly risk senaryosu, prototype seviyesinden çıkarılacaksa; yanlış pozitif/negatif etkilerini azaltan bir değerlendirme yaklaşımı ve saha geri bildirimi ile doğrulama mekanizmaları eklenmelidir.

Son olarak, bakım maliyetini azaltmak için test automation ve kalite güvencesi süreçlerinin güçlendirilmesi önerilir. Modül bazlı senaryoların otomatik testlerle kapsanması, simulation akışlarının regression testi olarak kullanılması ve performans gözlemlenebilirliğinin artırılması, sistemin sürdürülebilirliğini doğrudan destekleyecektir.

**Görsel Önerileri**

- Çizelge 6.1: Proje hedefleri → geliştirilen modüller → sağlanan çıktılar (özet eşleme tablosu)
- Çizelge 6.2: Gelecek geliştirme önerileri (kısa/orta/uzun vadeli önceliklendirme)
- Şekil 6.1 (genel): Mevcut sistem bileşenleri ve önerilen genişleme alanları (veri alım katmanı, audit/export, AI ürünleşmesi)

## Simgeler ve Kısaltmalar

- AI = Artificial Intelligence (Yapay Zekâ)
- OEE = Overall Equipment Effectiveness (Toplam Ekipman Etkinliği)
- PLC = Programmable Logic Controller (Programlanabilir Lojik Kontrolör)
- U1/U2 = Use Case 1/2 (Kullanım Senaryosu)

1. Çözülen Problem (Endüstriyel Bağlamda)

Üretim ortamlarında makine durumu, duruş nedenleri ve üretim çıktıları parçalı sistemlerde tutulduğu için izlenebilirlik ve metrik tutarlılığı zayıflayabilmektedir. Bu proje, üretim sürecinin temel bileşenlerini tek bir hafif MES çatısı altında birleştirerek bu kopukluğu azaltmayı hedefler. “Hafif MES MVP” yaklaşımı, tez kapsamındaki sınırlı süre ve kaynak koşullarında, çekirdek işlevleri önceliklendirmek için tercih edilmiştir. Gerçek cihaz erişimi olmadığı için simülasyon tabanlı veri üretimi benimsenmiş; bu sayede makine telemetrisi, iş emri akışı ve duruşlar tutarlı bir senaryo üzerinden tekrar üretilebilir hale gelmiştir. Böylece endüstriyel bağlamda gözlemlenebilir, sınanabilir ve doğrulanabilir bir akış oluşturulmuştur.
KANIT: README.md, docs/meta/summary.md, docs/specs/requirements.md, docs/specs/sim-clock.md, docs/specs/mock-data.md

2. Problemin Önemi (Neden Bu Çalışma Gerekli?)

OEE, duruş yönetimi ve anlık görünürlük; üretim verimliliğini ölçmek ve iyileştirmek için kritik göstergelerdir. Bu metriklerin anlamlı olabilmesi, duruşların doğru sınıflandırılması ve neden kodlarının tutarlı kullanılmasıyla mümkündür. ReasonCode gibi sınıflandırma mekanizmaları olmadan aynı olaylar farklı şekilde yorumlanabilir ve karar alma süreci zayıflar. Tez kapsamında ölçülebilir ve tekrar üretilebilir veri üretimi, metodolojik olarak güvenilir değerlendirme yapılabilmesi için gereklidir. Bu nedenle simülasyon ve kural setleri, veri tutarlılığını koruyacak şekilde tasarlanmıştır.
KANIT: docs/specs/oee-design.md, docs/specs/downtime-design-v2.md, docs/specs/requirements.md

3. Projenin Genel Amacı

Bu mezuniyet projesinin temel amacı, üretim sahası için işlevsel bir MES MVP geliştirerek uçtan uca bir veri akışını gösterebilmektir. Backend katmanı Node.js/Express ve MongoDB ile; frontend katmanı React tabanlı bir arayüzle tasarlanmıştır. Sistem; kimlik doğrulama, rol/izin yönetimi, makine izleme, iş emri yönetimi, duruş kayıtları ve raporlama gibi temel süreçleri kapsar. Veriler simülasyon script’leri ile üretilir ve böylece gerçek makine bağımlılığı olmadan bütün akış doğrulanabilir. Bu sayede OEE ve performans göstergeleri gibi metrikler uçtan uca hesaplanabilir hale gelir. AI bileşeni ise deterministik hesapları açıklayıcı bir katman olarak hedeflenmiş, merkezi rol üstlenmemesi amaçlanmıştır.
KANIT: README.md, docs/meta/summary.md, docs/specs/requirements.md, docs/specs/project-roadmap.md

4. Projenin Kapsamı

Projeye dahil edilen ana fonksiyonlar; kullanıcı/rol yönetimi, makine izleme, parça ve iş emri yönetimi, duruş yönetimi, simülasyonlar ve raporlamadır. Kimlik doğrulama ve RBAC altyapısı tamamlanmış, temel üretim ve OEE metrikleri hesaplanabilir hale getirilmiştir. Simülasyon yönetimi ve rapor ekranları uygulama içinde yer almaktadır. Buna karşılık export, audit log UI ve ileri seviye AI senaryoları planlanan kapsamda tutulmaktadır. Frontend, bu alanların CRUD ve izleme ekranlarını; backend ise veri modeli, API ve hesaplama katmanlarını üstlenir.
KANIT: README.md, docs/meta/summary.md, docs/specs/project-roadmap.md, docs/specs/requirements.md

5. Projenin Sınırları

Gerçek cihaz entegrasyonları bu çalışma kapsamında bilinçli olarak dışarıda bırakılmıştır. Kurumsal ERP/SSO entegrasyonları ve ölçeklenebilir üretim planlama modülleri MVP hedefleri içinde değildir. Performans, yük testleri ve dağıtım senaryoları yalnızca dokümantasyon seviyesinde değerlendirilmiştir. Mobil uygulama ve gelişmiş bildirim altyapıları da kapsam dışı tutulmuştur. Bu sınırlar, tez sürecinin zaman ve kaynak kısıtlarıyla uyumludur.
KANIT: docs/specs/requirements.md, README.md

6. Çalışmanın Katkısı (Mezuniyet Projesi Düzeyinde)

Çalışma, modüler bir mimari üzerinde üretim verisini uçtan uca izlenebilir hale getiren bir MVP ortaya koymaktadır. Deterministik simülasyon yaklaşımı, ölçülebilir ve tekrar üretilebilir senaryolar üretmeyi mümkün kılmıştır. OEE, duruş ve üretim verileri aynı zaman ekseninde izlenebilmekte, bu da tutarlı raporlama üretmektedir. Proje, hem backend hem frontend katmanında fonksiyonel akışları doğrulanabilir şekilde sunar. AI yaklaşımı ise genişletilebilir bir çerçeve olarak konumlandırılmıştır ve ileride yeni senaryoları destekleyebilecek bir altyapı hedefi taşır.
KANIT: docs/meta/summary.md, docs/specs/sim-clock.md, docs/specs/oee-design.md, docs/specs/mock-data.md, README.md

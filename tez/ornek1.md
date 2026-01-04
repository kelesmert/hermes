T.C.

MUĞLA SITKI KOÇMAN ÜNİVERSİTESİ

TEKNOLOJİ FAKÜLTESİ

BİLİŞİM SİSTEMLERİ MÜHENDİSLİĞİ BÖLÜMÜ

LİSANS MÜHENDİSLİK PROJESİ

YAZILIM GELİŞTİRİCİ MAAŞLARININ BELİRLENMESİNDE YAPAY ZEKA DESTEĞİ İLE ÖNGÖRÜDE BULUNMA

Hazırlayan

Berkay SALLAMACI

Danışman

Prof. Dr. İlhan TARIMER

15 Ocak 2025

Berkay SALLAMACI tarafından hazırlanan Yazılım Geliştirici Maaşlarının Belirlenmesinde Yapay Zeka Desteği ile Öngörü adlı bu çalışmanın, Lisans Mühendislik Projesi olarak uygun olduğunu onaylarım.

                                                                                      Prof. Dr. İlhan TARIMER

Bu çalışma, jürimiz tarafından, Bilişim Sistemleri Mühendisliği Bölümü’nde Lisans Mühendislik Projesi olarak kabul edilmiştir.

Başkan:********\_\_\_\_******** İmza:********\_\_\_********

Üye: **********\_\_********** İmza:********\_\_\_********

Üye: **********\_\_********** İmza:********\_\_\_********

Bu Mühendislik Projesi, Muğla Sıtkı Koçman Üniversitesi Teknoloji Fakültesi Bilişim Sistemleri Mühendisliği Bölümü bitirme çalışması yazım kurallarına uygun biçimde hazırlanmıştır.

MÜHENDİSLİK PROJESİ BİLDİRİMİ

Bu çalışmadaki bütün bilgilerin etik davranış ve akademik kurallar çerçevesinde elde edilerek sunulduğunu, ayrıca yazım kurallarına uygun olarak hazırlanan bu çalışmada yararlanılan her türlü kaynağa eksiksiz atıf yapıldığını bildiririm.

                               						Berkay SALLAMACI

YAZILIM GELİŞTİRİCİ MAAŞLARININ BELİRLENMESİNDE YAPAY ZEKA DESTEĞİ İLE ÖNGÖRÜDE BULUNMA  
(Lisans Mühendislik Projesi)

Berkay SALLAMACI

MUĞLA SITKI KOÇMAN ÜNİVERSİTESİ TEKNOLOJİ FAKÜLTESİ
BİLİŞİM SİSTEMLERİ MÜHENDİSLİĞİ BÖLÜMÜ

15 Ocak 2025

ÖZET

Bu çalışma, yazılım geliştiricilerin maaş trendlerini analiz etmek ve gelecekteki maaş seviyelerini tahmin etmek amacıyla geliştirilmiştir. Bu çalışma, geniş bir maaş verisi seti üzerinde detaylı analizler gerçekleştirerek, deneyim, uzmanlık alanı, coğrafi konum ve diğer demografik faktörlere bağlı olarak maaşların nasıl değişebileceğini öngörmeyi hedeflemektedir. Hem geleneksel veri analiz yöntemleri hem de yapay zeka tabanlı algoritmalar (örneğin, makine öğrenimi modelleri) kullanılarak maaşlar üzerindeki farklı faktörlerin etkisi incelenmiş, tahmin modelleri oluşturulmuş ve bu bilgiler kullanıcı dostu bir arayüzde görselleştirilmiştir. Bu bağlamda, proje, yazılım sektöründeki profesyonellerin kariyer planlamalarını desteklemeyi ve işverenlerin sektördeki maaş dinamiklerini daha iyi anlamalarına katkıda bulunmayı amaçlayan yenilikçi bir çözüm sunmaktadır.

Anahtar Kelimeler : Yapay Zeka, Makine Öğrenimi ,Veri Analizi

Sayfa Adedi : 44

Bitirme Çalışma Yöneticisi : Prof. Dr. İlhan TARIMER

PREDICTING SOFTWARE DEVELOPER SALARIES USING ARTIFICIAL INTELLIGENCE SUPPORT
(B. Sc. Thesis)

Berkay SALLAMACI

MUGLA SITKI KOÇMAN UNIVERSITY
TECHNOLOGY FACULTY
INFORMATION SYSTEMS ENGINEERING DEPARTMENT

15 January 2025

ABSTRACT

This study was developed to analyze salary trends for software developers and predict future salary levels. It aims to forecast how salaries may vary based on experience, area of expertise, geographic location, and other demographic factors by performing detailed analyses on a large dataset of salary information. Using both traditional data analysis methods and AI-based algorithms (e.g., machine learning models), the effects of various factors on salaries have been examined, prediction models have been created, and these insights have been visualized through a user-friendly interface. In this context, the project offers an innovative solution designed to support career planning for professionals in the software industry and help employers better understand salary dynamics in the sector.
Keywords : Artificial Intelligence, Machine Learning, Data Analysis

Page Number : 44

Advisor : Prof. Dr. İlhan TARIMER

TEŞEKKÜR

Çalışmalarım boyunca değerli yardım ve katkılarıyla beni yönlendiren danışmanım Prof. Dr. İlhan TARIMER’e ve manevi destekleriyle beni hiçbir zaman yalnız bırakmayan aileme teşekkürü bir borç bilirim.

Berkay SALLAMACI

İÇİNDEKİLER
Sayfa
KABUL VE ONAY SAYFASI I
MÜHENDİSLİK PROJESİ BİLDİRİMİ II
ÖZET III
ABSTRACT IV
TEŞEKKÜR V
İÇİNDEKİLER VI
ŞEKİLLERİN LİSTESİ VIII
RESİMLERİN LİSTESİ IX
DENKLEMLERİN LİSTESİ X
SİMGELER VE KISALTMALAR XI

1. GİRİŞ 1
   1.1. Projenin Amacı ve Kapsamı 1
   1.2. Problem Tanımı 2
   1.3. Literatür Taraması 3
   1.4. Projenin Aşamaları 4
2. KULLANILAN TEKNOLOJİLER VE YÖNTEMLER 5
   2.1. Geliştirme Ortamı 5
   2.1.1. Visual Studio Code 5
   2.2. Veri Analizi Ve Görselleştirme Araçları 5
   2.2.1. Pandas 6
   2.2.2. NumPy 6
   2.2.3. Matplotlib ve Seaborn 6
   2.3. Makine Öğrenimi Modelleri ve Algoritmaları 6
   2.3.1. Decision Tree 7
   2.3.2. Gradient Boosting 7
   2.3.3. Linear Regression 7
   2.3.4. Random Forest 7
   2.3.5. XGBoost 7
   2.4. Kullanıcı Arayüzü Ve Web Teknolojileri 8
   2.4.1 Streamlit 8
   2.5. Veri Bilimi Ekosistemi 8
3. VERİ SETİNİN GÖRSELLEŞTİRİLMESİ İLE BİRLİKTE ANALİZİ VE MAKİNE ÖĞRENİMİNİN UYGULANMASI 9
   3.1. Veri Analizi Süreci 9
   3.1.1 Gerekli Paketlerin Eklenmesi ve Verisetinin Yüklenmesi 9
   3.1.2. Zaman Kolonunun Silinmesi ve Eksik Verilerin Kontrolü 10
   3.1.3. Maaş Kolonunun Düzenlenmesi 11
   3.1.4. Eksik Değerlerin Düzenlenmesi 12
   3.1.5. Eksik Max_Salary Değerlerinin Tamamlanması 12
   3.1.6. Ortalama Maaşın Hesaplanması 13
   3.1.7. Çalışma Şekli Kolonunun Düzenlenmesi 13
   3.1.8. Çalışma Yöntemleri ve Deneyim Düzeylerine Göre Dağılımı 14
   3.1.9. Türkiye’deki ve Yurt Dışındaki Yazılımcıların Deneyim Düzeylerine Göre Dağılımları 17
   3.1.10. Türkiyedeki Yazılım Şirketlerinin Çalışan Sayılarına Göre Dağılımları 19
   3.1.11. Türkiye’deki Yazılım Geliştiricilerinin Deneyim Sürelerine Göre Dağılımları 20
   3.2. Maaş Analizinin Yapılması, Türkiye ve Yurt Dışı Karşılaştırmaları 21
   3.2.1. Türkiye’deki ve Yurt Dışındaki Deneyim Düzeylerine Göre Ortalama Maaş Dağılımları 21
   3.2.2. Türkiye’deki ve Yurt Dışındaki Ortalama Maaşların Karşılaştırılması 24
   3.2.3. Türkiye’deki ve Yurt Dışındaki Yazılımcıların Pozisyonlarının Sektördeki Dağılımı 25
   3.2.4. Türkiye’deki ve Yurt Dışındaki Yazılımcıların Çalışma Şeklinin Maaş ve Deneyim Seviyesine Göre Etkisi ve Karşılaştırılması 27
   3.2.5. Türkiye ve Yurt Dışındaki Yazılım Geliştirme Sektörüne İlişkin Sonuçlar 28
   3.3. Makine Öğreniminin Uygulanması, Kullanılan Algoritmalar 29
   3.3.1. Decision Tree 29
   3.3.2. Random Forest 31
   3.3.3. Linear Regression 32
   3.3.4 XGBoost (Extreme Gradient Boosting) 32
   3.3.5 Gradient Boosting 33
   3.3.6. Algoritmaların Performans Karşılaştırması 35
4. MAAŞ TAHMİNİ UYGULAMASININ YAPILMASI 36
   4.1. Kullanılan Teknolojiler ve Araçlar 36
   4.2. Kodun Ana Fonksiyonları 37
   4.2.1. Uygulamanın Çalışma Akışı 38
5. SONUÇ VE ÖNERİLER 42
   5.1. Projenin Başarıları 40
   5.2. Karşılaşılan Zorluklar 40
   5.3. Gelecek Geliştirmeler 41
   5.4. Sonuç 41
   KAYNAKLAR 42
   EKLER 43
   ÖZGEÇMİŞ 44

ŞEKİLLERİN LİSTESİ

Şekil Sayfa

Şekil-3.1. Çalışma Yöntemlerine Göre Dağılımın Çubuk Grafiği 14
Şekil-3.2. Deneyim Düzeylerine Göre Dağılımın Pasta Grafiği 15
Şekil-3.3. Deneyim Seviyelerine Göre Dağılımların Çubuk Grafiği 16
Şekil-3.4. Türkiyede Yazılımcıların Deneyim Sürelerine Göre Dağılımlarının Pasta Grafiği 17
Şekil-3.5. Yurt Dışında Deneyim Düzeylerine Göre Dağılımlarının Grafiği 18
Şekil-3.6. Türkiyede Yazılım Şirketlerinde Çalışan Sayılarına Göre Dağılımları Pasta Grafiği 19
Şekil-3.7. Türkiye’deki Yazılım Geliştiricilerinin Deneyim Sürelerine Göre Dağılımı 20
Şekil-3.8. Türkiye’deki Deneyim Düzeylerine Göre Ortalama Maaş Dağılımları Grafiği 22
Şekil-3.9. Yurt Dışındaki Deneyim Düzeylerine Göre Ortalama Maaş Dağılımları Grafiği 24
Şekil-3.10. Türkiye’deki Ve Yurt Dışındaki Ortalama Maaşın Karşılaştırılması Grafiği 25
Şekil-3.11. Türkiye’deki Yazılımcıların Sektördeki Pozisyon Dağılımları 25
Şekil-3.12. Yurt Dışındaki Yazılımcıların Sektördeki Pozisyon Dağılımları 26
Şekil-3.13. Çalışma Şeklinin Maaş ve Deneyim Seviyesine Göre Etkisi 27
Şekil-3.14. Random Forest İşleyişi 31
Şekil-3.15. Gradient Boosting İşleyişi 34
Şekil-3.15. Algoritmaların Performans Karşılaştırması 35

RESİMLERİN LİSTESİ

Resim Sayfa

Resim-3.1. Gerekli Paketlerin Eklenmesi 10
Resim-3.2. Verisetinin Yüklenmesi ve Okunması 10
Resim-3.3. “Time” Adlı Sütunun Kaldırılması ve Veriseti Hakkında Bilgi 10
Resim-3.4. Eksik Verilerin Sayısını Hesaplama 11
Resim-3.5. Maaş bilgisinin, Max ve Min Maaş Olarak Ayrılması 11
Resim-3.6. Eksik Değerleri Düzenleme ve Kontrol Etme 12
Resim-3.7. Eksik Maaş Verilerinin Tamamlanması 12
Resim-3.8. Ortalama Maaşın Hesaplanması ve Tam Sayıya Dönüştürme 13
Resim-3.9. Çalışma Şekli Kolonunun Düzenlenmesi 14
Resim-4.1. Maaş Tahmin Uygulaması 38
Resim-4.2. Maaş Tahmin Uygulaması 39

DENKLEMLERİN LİSTESİ
Denklem Sayfa

Denklem-3.1. Entropi Hesabı 29
Denklem-3.2. Bilgi Kazancının Hesaplanması 30
Denklem-3.3. Gini İndeksinin Hesaplanması 30
Denklem-3.4. Linear Regression Hesaplanması 32
Denklem-3.5. XGBoost Hesaplanması 33
Denklem-3.6. Gradient Boosting Hesaplanması 34
Denklem-3.7. MAE Hesaplanması 36
Denklem-3.8. MSE Hesaplanması 36
Denklem-3.9. R² Hesaplanması 36

SİMGELER VE KISALTMALAR

Bu çalışmada kullanılmış bazı simgeler ve kısaltmalar, açıklamaları ile birlikte aşağıda sunulmuştur.

MAX Maximum (Maksimum)
MIN Minumum
DF DataFrame ( Veri Çerçevesi )
INT Integer (Boyut,Tam Sayı Cinsinde Veriler İçin Kullanılır)
UI User Interface (Kullanıcı Arayüzü)
UX User Experience (Kullanıcı Deneyimi)
DevOps Development (Geliştirme) ve Operations (İşletim)
XGBoost Extreme Gradient Boosting (Aşırı Gradyan Artırma Algoritması)
MSE Mean Squared Error (Ortalama Kare Hata)
MAE Mean Absolute Error (Ortalama Mutlak Hata)
R² R-squared (Determinasyon Katsayısı):
NumPy Numerical Python extensions (Sayısal Python Uzantıları)

    1. GİRİŞ

1.1. Projenin Amacı ve Kapsamı
Bu proje, kullanıcıların seyahat deneyimlerini modern web teknolojileri kullanarak etkili bir şekilde yönetmelerini sağlayacak bir platform geliştirmeyi hedeflemektedir. Günümüzde, seyahat etme ihtiyacı gerek iş gerekse turistik amaçlarla hızla artış göstermektedir. Bu artış, kişisel seyahat geçmişinin düzenli ve erişilebilir bir şekilde yönetilmesi gerekliliğini ortaya çıkarmaktadır. Seyahat verilerinin doğru ve hızlı bir şekilde görselleştirilmesi, kullanıcıların geçmiş deneyimlerini daha iyi analiz etmelerine ve gelecek planlarını daha etkili bir şekilde organize etmelerine olanak tanır.

Proje, kullanıcıların seyahat ettikleri ülkeleri interaktif bir dünya haritası üzerinde işaretleyebilmesini, her bir ülkeye dair detaylı bilgiye erişebilmesini ve vize gereksinimlerini kolayca öğrenebilmesini mümkün kılmaktadır. Aynı zamanda, kullanıcıların kişisel seyahat istatistiklerine erişimini sağlayarak, bireysel seyahat alışkanlıklarını analiz etmelerine olanak tanır. Bunun yanı sıra, sistemin öneri mekanizması, kullanıcılara ilgi alanlarına ve seyahat geçmişlerine uygun ülke tavsiyeleri sunar.

Bu kapsamda geliştirilen uygulama, dijital dönüşüm sürecinde kişiselleştirilmiş veri yönetimi ve analizine olan talebi karşılamayı amaçlamaktadır. Proje, React.js ve Firebase gibi modern web teknolojilerini kullanarak, hızlı, güvenli ve kullanıcı dostu bir platform oluşturmayı hedeflemektedir. Kullanıcı arayüzünden veri yönetimine kadar her aşama, kullanıcı deneyimini iyileştirmek ve seyahat sürecini daha keyifli ve düzenli hale getirmek amacıyla tasarlanmıştır.

1.2. Problem Tanımı

Bu proje, yazılım geliştiricilerin maaş trendlerini modern veri analitiği ve yapay zeka teknolojilerini kullanarak analiz eden ve gelecekteki maaş seviyelerini tahmin eden bir sistem geliştirmeyi hedeflemektedir. Günümüzde yazılım sektörü hızla büyümekte ve bu büyüme, sektördeki maaş dinamiklerinin daha iyi anlaşılmasını ve kariyer planlamasının veriye dayalı bir şekilde yapılmasını önemli hale getirmektedir. Yazılım geliştiricilerin maaşlarını etkileyen faktörlerin doğru ve hızlı bir şekilde analiz edilmesi, hem bireysel profesyonellere hem de işverenlere değerli içgörüler sunmaktadır.
Proje kapsamında, yazılım geliştiricilerin deneyim düzeyi, uzmanlık alanı, coğrafi konum ve diğer özellikler gibi değişkenlerin maaşlar üzerindeki etkisi detaylı bir şekilde analiz edilmektedir. Bu veriler, makine öğrenimi algoritmaları ile işlenerek maaş tahminleri yapılmakta ve sonuçlar kullanıcı dostu bir arayüzle görselleştirilmektedir. Ayrıca, sistem işverenlerin sektördeki maaş eğilimlerini anlamalarına yardımcı olurken, bireysel kullanıcılar için kariyer planlaması ve sektörel karşılaştırmalar yapma imkanı sunmaktadır.
Bu kapsamda geliştirilen platform, Python ve modern web teknolojileri gibi araçlar kullanılarak oluşturulmuş, hızlı, güvenilir ve ölçeklenebilir bir çözüm sunmaktadır. Her aşama, kullanıcı deneyimini iyileştirmek, sektöre dair içgörü sağlamak ve yazılım geliştiricilerin maaş dinamiklerini daha şeffaf bir şekilde ortaya koymak amacıyla tasarlanmıştır.

1.3. Literatür Taraması

Yazılım geliştirici maaşlarını tahmin etme konusunda yapılan çalışmalar, sektörel farklılıkları, coğrafi bölgelere göre değişen maaş aralıklarını ve iş deneyimi gibi çeşitli parametreleri temel faktörler olarak ele almaktadır. Bu alanda yapay zeka ve makine öğrenmesi tabanlı yöntemler, maaş tahminlerinde öne çıkmış ve büyük ölçekte veri analizi yapma kabiliyetiyle dikkat çekmiştir.

Birçok çalışma, yapay zeka algoritmaları kullanarak maaş tahminlerini geliştirmenin özellikle şirketlerin maaş politikası oluşturmasına ve sektördeki genel eğilimleri anlamasına yardımcı olduğunu belirtmektedir. Umut Akbulut [1] ve Kerimcan Yektek’in [7] yaptığı gibi çalışmalar, coğrafi farklılıkları öne çıkararak bu farklılıkların tahmin modellerine etkisini vurgulamıştır. Benzer şekilde, Geleceği Yazanlar [4] ve AppMaster.io [2] tarafından ele alınan çalışmalar, deneyim seviyesi ve rol farklılıklarının maaş tahminlerindeki kritik etkisini detaylandırmıştır.

Ek olarak, Reddit [5] gibi platformlardan toplanan topluluk verileri de çalışmalarda kullanılmış ve bu tür verilerin modelleme süreçlerinde önemli bir veri kaynağı sağlayabileceği gösterilmiştir. Murat Çelebi [10] ve Uğur Yılmaz [9] yaptığı çalışmalarda ise makine öğrenmesi ile geliştirilen modellerin, veri setlerinin çeşitliliği ve doğruluğu ile yakından ilişkili olduğunu ortaya koymuştur.

Bu literatür taraması, yazılım geliştirici maaşları tahmininde çeşitli parametrelerin etkisini ve bu alanda yapay zekanın kullanım potansiyelini ortaya koyarak, gelecekteki çalışmalar için önemli bir temel oluşturmaktadır.

1.4. Projenin Aşamaları

Bu proje, yazılım geliştiricilerin maaşlarını tahmin etmeye yönelik bir sistem geliştirilmesini kapsamaktadır. Çalışma, beş ana aşamadan oluşmaktadır ve her aşama projenin bütünlüğünü sağlamak ve hedeflenen sonuçlara ulaşmak amacıyla titizlikle planlanmıştır:

    1- GİRİŞ
    2- KULLANILAN TEKNOLOJİLER ve YÖNTEMLER
    3- VERİ SETİNİN GÖRSELLEŞTİRİLMESİ ile BİRLİKTE ANALİZİ ve MAKİNE ÖĞRENİMİNİN UYGULANMASI
    4- MAAŞ TAHMİNİ UYGULAMASININ YAPILMASI
    5- SONUÇ VE ÖNERİLER

    5-

    2. KULLANILAN TEKNOLOJİLER VE YÖNTEMLER

Bu bölümde, projemi geliştirmek için kullanılan temel teknolojiler detaylı bir şekilde ele alınmaktadır. Projenin veri analizi, veri yönetimi ve makine öğrenimi gibi farklı bileşenlerini destekleyen bu teknolojiler, proje hedeflerine ulaşmak için stratejik olarak seçilmiştir.

2.1. Geliştirme Ortamı

Bu proje, yazılım geliştiricilerin maaş tahmini yapmak amacıyla çeşitli teknolojiler ve araçlar kullanılarak geliştirilmiştir. Geliştirme ortamı, projenin gereksinimlerini karşılamak ve verimli bir çalışma süreci sağlamak için dikkatle seçilmiştir. Aşağıda kullanılan araçlar ve ortamınn detaylı açıklamaları yer almaktadır.

2.1.1. Visual Studio Code

Visual Studio Code, projenin geliştirilmesinde kullanılan güçlü bir kod düzenleme ve geliştirme ortamıdır. Esnek yapılandırılabilirliği ve zengin eklenti desteği sayesinde Python geliştirme süreçlerini kolaylaştırır. Ayrıca, hata ayıklama, sürüm kontrol entegrasyonu ve terminal desteği gibi özellikleri ile proje geliştirme sürecini hızlandırmıştır.

2.2. Veri Analizi ve Görselleştirme Araçları

Bu projede, yazılım geliştiricilerin maaş tahminine yönelik verilerin analiz edilmesi ve görselleştirilmesi için çeşitli araçlar ve kütüphaneler kullanılmıştır. Bu araçlar, verilerin incelenmesi, trendlerin belirlenmesi ve tahmin modellerine uygun hale getirilmesi açısından kritik bir rol oynamıştır.

2.2.1. Pandas

Pandas, veri işleme ve analizinde kullanılan güçlü bir Python kütüphanesidir. Bu proje kapsamında, maaş verilerinin temizlenmesi, dönüştürülmesi ve analizi için kullanılmıştır. Verilerin tablolar halinde düzenlenmesi ve istatistiksel özetlerin oluşturulması için etkili bir araç sunar.

2.2.2. NumPy

NumPy, büyük boyutlu veri kümeleri üzerinde matematiksel işlemler gerçekleştirmek için kullanılan bir Python kütüphanesidir. Bu projede, çok boyutlu veri yapılarını işlemek ve matematiksel hesaplamaları optimize etmek için kullanılmıştır.

2.2.3. Matplotlib ve Seaborn

Matplotlib ve Seaborn, verilerin görselleştirilmesi için kullanılan Python kütüphaneleridir. Matplotlib, grafik oluşturma için temel bir altyapı sağlarken, Seaborn daha estetik ve detaylı görseller üretmek için kullanılmıştır. Bu proje kapsamında, maaş trendlerini ve faktörlerin etkisini analiz etmek için çeşitli grafikler oluşturulmuştur.

2.3. Makine Öğrenimi Modelleri ve Algoritmaları

Bu projede, yazılım geliştiricilerin maaş tahmini için makine öğrenimi teknikleri kullanılmıştır. Farklı algoritmalar ve modeller, veriler üzerinde eğitilerek en iyi tahmin performansını elde etmek amacıyla değerlendirilmiştir. Aşağıda kullanılan başlıca makine öğrenimi modelleri ve algoritmalarına ilişkin açıklamalar bulunmaktadır:

2.3.1. Decision Tree

Decision Tree algoritması, sınıflandırma ve regresyon analizlerinde kullanılan bir yöntemdir. Bu projede, maaş tahmininde kullanılacak özelliklerin etkisini anlamak ve açıklanabilir modeller geliştirmek için denenmiştir.

2.3.2. Gradient Boosting

Gradient Boosting, tahmin hatalarını minimize etmek için bir dizi zayıf öğreniciyi ardışık olarak eğiten güçlü bir makine öğrenimi algoritmasıdır. Bu proje kapsamında, maaş tahmininde yüksek doğruluk elde etmek için kullanılmıştır.

2.3.3. Linear Regression

Linear Regression, bağımsız değişkenler ile bağımlı değişken arasındaki doğrusal ilişkiyi modellemek için kullanılan temel bir algoritmadır. Maaş tahmininde basit ve etkili bir yöntem olarak projede yer almıştır.

2.3.4. Random Forest

Random Forest, birden fazla karar ağacını bir araya getirerek daha doğru ve genellenebilir tahminler yapmayı sağlayan bir algoritmadır. Bu projede, maaş tahmininde hata oranını düşürmek için denenmiştir.

2.3.5. XGBoost
XGBoost, hız ve doğruluk açısından optimize edilmiş bir Gradient Boosting algoritmasıdır. Proje kapsamında, büyük veri setlerinde yüksek performanslı tahmin modelleri oluşturmak için denenmiştir.

2.4. Kullanıcı Arayüzü Ve Web Teknolojileri

Bu projede, kullanıcıların maaş tahmini modeline kolayca erişebilmesi ve sonuçları görselleştirebilmesi için kullanıcı dostu bir arayüz geliştirilmiştir. Web tabanlı bir uygulama olarak tasarlanan bu arayüz, kullanıcıların modeli sorunsuz bir şekilde kullanmasını sağlamak amacıyla çeşitli modern teknolojiler ve araçlarla oluşturulmuştur.

2.4.1. Streamlit

Streamlit, veri bilimcilerinin hızlı bir şekilde etkileşimli web uygulamaları geliştirmelerine olanak tanıyan bir Python kütüphanesidir. Bu projede, kullanıcı dostu bir arayüz oluşturmak ve makine öğrenimi modelinin tahmin sonuçlarını görselleştirmek için kullanılmıştır. Streamlit, düşük kod gereksinimi ile kullanıcı etkileşimini artıran ve hızlı prototipleme imkanı sağlayan güçlü bir araçtır. Bu sayede, kullanıcıların maaş tahminlerini görselleştirmeleri ve analiz etmeleri kolaylaştırılmıştır.

2.5. Veri Bilimi Ekosistemi

Bu proje, veri bilimi uygulamalarında yaygın olarak kullanılan Python dilini temel almıştır. Pandas, NumPy ve Seaborn gibi kütüphaneler, verilerin işlenmesi ve görselleştirilmesi için kullanılırken, makine öğrenimi modellerinin geliştirilmesi ve değerlendirilmesinde Decision Tree, Random Forest, XGBoost ve Gradient Boosting gibi yöntemler stratejik olarak tercih edilmiştir. Streamlit ise, kullanıcıların etkileşimli bir şekilde sonuçları görmesini sağlayan bir arayüzün geliştirilmesinde kullanılmıştır.

    3.  VERİ SETİNİNİN GÖRSELLEŞTİRİLMESİ İLE BİRLİKTE ANALİZİ VE MAKİNE ÖĞRENİMİNİN UYGULANMASI

Bu projede, yazılım geliştiricilerin maaş tahminine yönelik veri analizi ve makine öğrenimi süreçleri dikkatle planlanmış ve uygulanmıştır. Süreç, veri setinin temizlenmesiyle başlayarak, görselleştirme ve detaylı analiz ve bu analizle birlikte çıkarımda bulunma aşamalarını, ardından makine öğrenimi algoritmalarının denenmesini ve uygulanmasını içermektedir.

3.1. Veri Analizi Süreci
Veri analizi süreci, ham verilerin işlenmesi ve anlamlı hale getirilmesi için bir dizi sistematik adımdan oluşmaktadır. Bu süreçte, veri setleri üzerinde temizlik, dönüşüm ve görselleştirme gibi temel işlemler gerçekleştirilmiştir. Amaç, verilerin doğru bir şekilde analiz edilerek kullanıcılar için değerli içgörüler sunmaktır.

3.1.1. Gerekli Paketlerin Eklenmesi ve Verisetinin Yüklenmesi

Bu bölümde, projenin geliştirilmesi için gerekli olan Python paketleri tanıtılmaktadır.
Uygulamanın veri analizi, görselleştirme ve istatiksel adımlarını etkin bir şekilde gerçekleştirebilmesi için bazı önemli kütüphaneler kullanılmıştır. Pandas kütüphanesi, verilerin işlenmesi ve düzenlenmesi için tercih edilmiştir. Böylece veriler kolayca bir dataframe formatına dönüştürülüp, üzerinde işlem yapılabilir hale getirilmiştir. NumPy ise sayısal verilerle yapılan hesaplamalar için kullanılmıştır. Matplotlib ve Seaborn kütüphaneleri ise, veri görselleştirme ve grafikler oluşturmak için kullanılmış, böylece verilerin daha anlaşılır ve görsel bir şekilde sunulması sağlanmıştır. Bu paketlerin entegrasyonu, projeye güçlü bir veri analizi ve görselleştirme altyapısı kazandırarak, kullanıcıların analiz ve tahmin süreçlerinde daha verimli olmalarını mümkün kılmaktadır. Bu kısımlar Resim 3.1’de gösterilmiştir. Kullandığımız veri setinin yüklenmesi ve okunması ise Resim 3.2’de verilmiştir.

import pandas as pd #verisetlerini pandas dataframe'ine çevirmek için
import numpy as np #veriler arasında sayısal işlemleri yapabilmek için
import matplotlib.pyplot as plt #grafik çıkarmak için
import seaborn as sns #grafik çıkarmak için

                                      Resim 3.1. Gerekli Paketlerin Eklenmesi

df = pd.read_csv('salary.csv') #Pandas kütüphanesini kullanarak bir CSV (Comma-Separated Values) dosyasını Python'da bir DataFrame olarak okumak için kullanılır.

                                    Resim 3.2. Verisetinin Yüklenmesi ve Okunması

3.1.2. Zaman Kolonunun Silinmesi ve Eksik Verilerin Kontrolü
Bu adımda, verisetindeki 'Time' adlı gereksiz sütun, df.drop('Time', axis=1, inplace=True) komutu ile kaldırılmaktadır. Bu işlem, verisetinin gereksiz bilgileri içermemesini sağlar ve yalnızca önemli verilerin analiz için kullanılmasına imkan tanır. Ardından, df.info() komutu ile veri çerçevesinin genel durumu kontrol edilerek, her bir sütunun veri tipi ve kaç eksik veri bulunduğu hakkında bilgi edinilir. df.isnull().sum() fonksiyonu ise, her sütundaki eksik verilerin sayısını hesaplar ve bu verilerle nasıl başa çıkılacağına karar verilmesini sağlar. Bu kısımlar Resim 3.3. ve Resim 3.4’de gösterilmiştir.

df.drop('Time', axis=1, inplace=True)
df.info()

                              Resim 3.3. “Time” Adlı Sütunun Kaldırılması

df.isnull().sum()
Position 0
Level 0
Experience 0
Technology 0
Location 0
Way_of_working 0
Employees_number 0
Salary_type 0
Salary 0
dtype: int64
DataFrame deki her sütünda bulunan eksik(null) değerlerinin sayısını gösteririr.

                               Resim 3.4. Eksik Verilerin Sayısını Hesaplama

3.1.3. Maaş Kolonunun Düzenlenmesi

Maaş bilgisinin, minimum ve maksimum maaş olarak ayrılması için Salary kolonundaki veriler işlenmiştir. df['Min_Salary'] ve df['Max_Salary'] kolonları, maaş aralıkları üzerinden yapılan işlemlerle oluşturulmuştur. apply() fonksiyonu kullanılarak her bir maaş değeri, 'split' fonksiyonu ile ayrılmış ve uygun şekilde işlenmiştir. Bu adımda, maaş aralıklarının düzenlenmesi ve eksik değerlerin ele alınması sağlanmıştır. Ayrıca, verideki noktalama işaretleri ('k', 'T') gibi semboller temizlenmiş ve her iki kolon da sayısal değerlere dönüştürülmüştür. df['Min_Salary'] ve df['Max_Salary'] kolonlarındaki veriler astype(int) komutlarıyla tam sayıya dönüştürülmüştür.Bu bölüm Resim 3.5.’de gösterilmiştir.

df['Min_Salary'] = df['Min_Salary'].apply(lambda x: x.replace('.',''))
df['Max_Salary'] = df['Max_Salary'].apply(lambda x: x.replace('.','') if x is not np.nan else x)

Resim 3.5. Maaş bilgisinin, Max ve Min Maaş Olarak Ayrılması

3.1.4. Eksik Değerlerin Düzenlenmesi

Bu adımda, verisetindeki bazı Min_Salary değerlerinde yer alan 200000+ T gibi anormal ifadeler, daha anlamlı bir değere dönüştürülmüştür. Bu tür anormal veriler, df['Min_Salary'] = df['Min_Salary'].apply(lambda x: '200000' if x == '200000+ T' else x) kodu ile düzenlenmiştir. Böylece, belirtilen değerlerin yerine daha mantıklı bir sayı olan 200000 değeri yerleştirilmiştir. Ardından, df['Min_Salary'].unique() komutu ile bu değerin doğru şekilde yansıtılıp yansıtılmadığı kontrol edilmiştir.Bu kısım Resim 3.6’ da gösterilmiştir.

df['Min_Salary'] = df['Min_Salary'].apply(lambda x: '200000' if x=='200000+ T' else x)
df['Min_Salary'].unique()

                       Resim 3.6. Eksik Değerleri Düzenleme ve Kontrol Etme

3.1.5. Eksik Max_Salary Değerlerinin Tamamlanması

Bazı Max_Salary değerlerinde eksiklikler gözlemlenmiştir. Bu eksik değerlerin tamamlanabilmesi için, Max_Salary kolonu NaN olan satırlar tespit edilmiştir. max_null_value_index = df[df['Max_Salary'].isnull()]['Max_Salary'].index komutu ile bu satırlar bulunmuş ve her bir eksik değerin yerine, o satırdaki Min_Salary değeri atanmıştır. Bu işlem, döngü ile df['Max_Salary'][i] = df['Min_Salary'][i] şeklinde gerçekleştirilmiştir. Bu sayede, eksik maaş verileri tamamlanmış ve veri seti tutarlı hale getirilmiştir.Bu kısım Resim 3.7.’ de gösterilmiştir.

max_null_value_index = df[df['Max_Salary'].isnull()]['Max_Salary'].index
for i in max_null_value_index:
    df['Max_Salary'][i] = df['Min_Salary'][i]

                           Resim 3.7. Eksik Maaş Verilerinin Tamamlanması

3.1.6. Ortalama Maaşın Hesaplanması

Min_Salary ve Max_Salary kolonları kullanılarak, her bir satır için ortalama maaş hesaplanmıştır. df['Avg_Salary'] = (df['Min_Salary'].astype(int) + df['Max_Salary'].astype(int)) / 2 komutuyla, her iki maaş değeri toplanıp ikiye bölünerek ortalama maaş değeri elde edilmiştir. Hesaplanan bu değer, daha sonra df['Avg_Salary'] = df['Avg_Salary'].astype(int) kodu ile tam sayıya dönüştürülmüştür. Aynı şekilde, Min_Salary ve Max_Salary kolonları da astype(int) komutu ile tam sayıya dönüştürülmüştür. Bu işlem, veri türlerinin tutarlı olmasını sağlar ve veri analizi sürecinde hataların önüne geçilmesine yardımcı olur. Bu kısım Resim 3.8. ‘de verilmiştir.

df['Avg_Salary'] = (df['Min_Salary'].astype(int) + df['Max_Salary'].astype(int)) / 2
df['Avg_Salary']=df['Avg_Salary'].astype(int)
df['Min_Salary'] = df['Min_Salary'].astype(int)
df['Max_Salary'] = df['Max_Salary'].astype(int)

             Resim 3.8. Ortalama Maaşın Hesaplanması ve Tam Sayıya Dönüştürme

3.1.7. Çalışma Şekli Kolonunun Düzenlenmesi

Way_of_working kolonu, kullanıcıların çalışma şekillerini ifade etmektedir. Bu kolondaki verilerde, / gibi gereksiz semboller bulunduğu için bu semboller temizlenmiştir. df['Way_of_working'] = df['Way_of_working'].apply(lambda x: x.replace('/','') if '/' in x else x) kodu ile bu semboller kaldırılmıştır. Ayrıca, df['Way_of_working'] = df['Way_of_working'].apply(lambda x: x.split(' ')[0] if len(x.split(' ')) > 1 else x) komutu ile fazla boşluklar ve kelimeler temizlenmiş ve yalnızca ilk kelime alınmıştır. Son olarak, 'Yerinde' yerine 'Ofiste' ifadesi eklenmiştir: df['Way_of_working'] = df['Way_of_working'].apply(lambda x: x.replace('Yerinde','Ofiste') if 'Yerinde' in x else x). Bu adım, veri setinin tutarlı hale gelmesini sağlayarak, kullanıcıların çalışma şekli bilgilerini daha düzgün bir formatta analiz etmeye imkan tanımaktadır.Bu kısım Resim 3.9’da verilmiştir
df['Way_of_working'] = df['Way_of_working'].apply(lambda x: x.replace('/','') if '/' in x else x)
df['Way_of_working'] = df['Way_of_working'].apply(lambda x: x.split(' ')[0] if len(x.split(' ')) > 1 else x)
df['Way_of_working'] = df['Way_of_working'].apply(lambda x: x.replace('Yerinde','Ofiste') if 'Yerinde' in x else x)

Resim 3.9. Çalışma Şekli Kolonunun Düzenlenmesi

3.1.8. Çalışma Yöntemleri ve Deneyim Düzeylerine Göre Dağılım

Çalışma yöntemlerine göre dağılım için en yüksek çubuk, "Remote" (uzaktan) çalışma şekli için gözlemlenmiştir. Yaklaşık 600 çalışan, uzaktan çalışma modeli tercih etmektedir."Hybrid" çalışma şekli, ikinci en yüksek çubuğa sahiptir ve yaklaşık 350 çalışanı temsil eder."Ofiste" çalışma modeli, en düşük çubuğa sahiptir ve bu da yaklaşık 250 çalışanı temsil etmektedir. Şekil 3.1.’ de gösterilmiştir.

Şekil 3.1. Çalışma Yöntemlerine Göre Dağılımın Çubuk Grafiği

Deneyim düzeylerine göre dağılım için en büyük dilim, Junior düzeyindeki çalışanları temsil ediyor ve toplamın %40.5'ini(446 kişi) oluşturuyor. Mid düzeyindeki çalışanlar, toplamın %33.1'ini(375 kişi) temsil ediyor. Bu oran, sektörün yeterli deneyime sahip profesyonellerle dolu olduğunu, kariyer basamaklarını ilerletmiş kişilerin de sayısının yüksek olduğunu gösteriyor. Senior düzeyindeki çalışanlar, toplamın %26.4'ünü(299) oluşturuyor. Bu oran, deneyimli profesyonellerin sayısının daha az olduğunu ve genellikle daha tecrübeli çalışanların sektörde daha az temsil edildiğini gösteriyor. Bu verileri kategoriler arasında yüzdesel bir dağılım olarak göstermek istedik. Bu bağlamda, deneyim düzeylerine göre çalışan dağılımını ve her bir düzeyin toplamdaki oranını net bir şekilde göstermek için pasta grafiği kullandık. Şekil 3.2’de gösterilmiştir.

                  Şekil 3.2. Deneyim Düzeylerine Göre Dağılımın Pasta Grafiği

Şekil 3.3.’ de Junior (Turuncu) seviyesindeki çalışan sayısının oldukça yüksek olması, sektöre yeni katılan genç yeteneklerin fazlalığını gösteriyor. Bu, yazılım alanında eğitim alan ve kariyerine yeni başlayan birçok kişinin olduğunu ortaya koyuyor. Mid (mavi)seviyesindeki çalışan sayısı da önemli bir oranda. Bu grup, belirli bir deneyime sahip olan ve iş gücüne katkı sağlayan profesyonellerden oluşuyor. Senior(yeşil) düzeyindeki çalışan sayısının azlığı ise dikkat çekici. Deneyimli profesyonellerin sektörde sınırlı sayıda olması, iş gücünde bir tecrübe açığı olduğunu gösteriyor. Çalışan sayısını ve deneyim seviyelerinin birbirine oranla ne kadar yaygın olduğunu, aynı zamanda Junior düzeyindeki çalışan sayısının fazla olması ve Senior düzeyindeki azlık gibi trendleri belirgin şekilde sunmak için en uygun görsel araç olarak çubuk grafiği kullandık. Bu çubuk grafiği Şekil 3.3’ de verilmiştir.

    Şekil 3.3. Deneyim Seviyelerine Göre Dağılımların Çubuk Grafiği

3.1.9. Türkiye’deki ve Yurt Dışındaki Yazılımcıların Deneyim Düzeylerine Göre Dağılımları

Şekil 3.4.’deki grafik, yurt içindeki yazılımcıların deneyim düzeylerine göre dağılımını pasta grafiği ile gösteriyor. Farklı dilimlerin yüzdeleri, her deneyim seviyesinin toplam içindeki oranını temsil ediyor. Pasta dilimlerinin en büyük olanı, %41.9 oranıyla Junior seviyesindeki çalışanları ifade ediyor. Bu, sektöre yeni adım atan veya kariyerinin başında olan yazılımcıların sayısının oldukça fazla olduğunu gösteriyor. %34.0’lık bir oranla Mid düzeyindeki çalışanlar ikinci en büyük dilimi oluşturuyor. Bu, belirli bir deneyime sahip profesyonellerin önemli bir kısmının sektörde yer aldığını gösteriyor. Pasta diliminin en küçük kısmını, %24.0 ile Senior düzeyindeki çalışanlar alıyor. Bu, deneyimli profesyonellerin sayısının az olduğunu ve sektördeki kıdemli pozisyonların doldurulmasında zorluk yaşandığını gösteriyor.

Şekil 3.4. Türkiyede Yazılımcıların Deneyim Sürelerine Göre Dağılımlarının Pasta Grafiği

Şekil 3.5.’deki grafik, yurt dışındaki yazılımcıların deneyim düzeylerine göre dağılımını çubuk grafiği ile gösteriyor. Üç ana düzey olan Junior, Mid ve Senior çalışanlarının sayıları arasındaki farkları net bir şekilde ortaya koyuyor. Yurt dışında çalışan Senior düzeyindeki yazılımcılar, en yüksek sayıya sahip ve grafik üzerinde 60 civarında bir değerle belirgin bir şekilde öne çıkıyor. Bu durum, deneyimli profesyonellerin yurt dışında daha fazla fırsat bulduğunu ve sektördeki tecrübe açığını kapatabilecek potansiyele sahip olduğunu gösteriyor. Junior çalışan sayısı, yaklaşık 30 civarında. Bu seviye, sektöre yeni giren yazılımcıları temsil ediyor. Junior düzeyindeki sayının, Senior düzeyine göre daha düşük olması, deneyimli profesyonellerin sektördeki ihtiyaçları karşıladığını, ancak gençlerin yurt dışında daha az fırsata sahip olduğunu gösteriyor. Mid düzeyindeki çalışan sayısı da Junior seviyesine yakın bir seviyede yer alıyor, yaklaşık 30. Bu durum, deneyimli çalışanların olduğu kadar, belirli bir deneyime sahip profesyonellerin de yurt dışındaki iş gücünde önemli bir yere sahip olduğunu gösteriyor.

          Şekil 3.5. Yurt Dışında Deneyim Düzeylerine Göre Dağılımlarının Grafiği

3.1.10. Türkiyedeki Yazılım Şirketlerinin Çalışan Sayılarına Göre Dağılımları

Grafikteki sayılar, Türkiye'deki yazılımcıların çalışan sayısının belirli aralıklara göre dağılımını gösteriyor. "0-10" aralığı, en fazla 10 çalışanı olan küçük ekipleri temsil ederken, "10-30" aralığı biraz daha büyük grupları ifade ediyor. "30-50" ve "50-100" aralıkları, belirli bir deneyime sahip profesyonellerin bulunduğu orta ölçekli şirketleri gösteriyor.

"100-300" aralığı, daha büyük organizasyonlardaki çalışan sayısını belirtirken, "300-1000" ve "1000-2000" dilimleri, önemli iş gücüne sahip büyük şirketleri temsil ediyor. Son olarak, "2000+" dilimi, sektördeki çok büyük organizasyonların varlığını işaret ediyor. Bu dağılım, yazılım sektöründeki iş gücünün yapısını anlamamıza yardımcı oluyor.Şekil 3.6.’ da bu kısım gösterildi.

Şekil 3.6.Türkiyede Yazılım Şirketlerinde Çalışan Sayılarına Göre Dağılımları Pasta Grafiği

3.1.11 Türkiye’deki Yazılım Geliştiricilerinin Deneyim Sürelerine Göre Dağılımları

Grafik, Türkiye'deki yazılımcıların deneyim sürelerine göre dağılımını gösteriyor. "0-1 Yıl" deneyim süresi, grafik üzerindeki dilimlerden biri ve bu dilim %23'lük bir paya sahip. En büyük dilim ise "1-3 Yıl" deneyim süresine ait ve %37.6'lık bir oranla grafik üzerinde öne çıkıyor. Bu durum, belirli bir deneyime sahip yazılımcıların sayısının fazla olduğunu ve kariyerlerinde ilerleyen genç profesyonellerin varlığını ortaya koyuyor. 4-6 Yıl" deneyim süresi %19.2'lik bir paya sahip. Bu seviye, yeterli deneyime sahip çalışanları temsil ediyor, ancak bu oranın daha düşük olması, belirli bir aşamada kariyer geçişlerinin zorlaştığını gösterebilir. "10+ Yıl" deneyim süresi %11.5 oranıyla daha az sayıda çalışanı kapsıyor. Bu, sektördeki deneyimli profesyonellerin sayısının sınırlı olduğunu gösteriyor.

Şekil 3.7. Türkiye’deki Yazılım Geliştiricilerinin Deneyim Sürelerine Göre Dağılımı

3.2. Maaş Analizinin Yapılması, Türkiye ve Yurtdışı Karşılaştırmaları

Bu bölümde, yazılım geliştirme alanındaki maaş seviyeleri analiz edilerek Türkiye'deki ve yurtdışındaki maaş düzeyleri karşılaştırılmıştır. Analiz, farklı deneyim seviyelerine ve çalışma modellerine göre maaş farklılıklarını ortaya koyarak, sektördeki eğilimler hakkında derinlemesine bir bakış sunmaktadır.

3.2.1. Türkiye’deki ve Yurt Dışındaki Deneyim Düzeylerine Göre Ortalama Maaş Dağılımları

Şekil 3.8.’deki Grafik, Türkiye'deki yazılımcıların deneyim düzeylerine göre ortalama maaş dağılımını kutu grafiği ile göstermektedir. Üç ana deneyim seviyesi olan Junior, Mid ve Senior düzeyindeki çalışanların ortalama maaşları arasındaki farkları açıkça ortaya koyuyor.

Junior Düzeyi: Kutu grafiğinde Junior düzeyindeki çalışanların ortalama maaşları en düşük seviyededir. Kutu içindeki medyan değeri, diğer iki düzeye göre belirgin bir şekilde aşağıda yer alıyor. Bu durum, sektöre yeni giren yazılımcıların genellikle daha az kazandığını ve bu seviyedeki maaşların daha geniş bir dağılım gösterdiğini ortaya koyuyor. Ayrıca, uç noktalar (outlier) mevcut; bu da bazı Junior çalışanların beklenenden daha yüksek maaşlar aldığını, ancak bu durumun genel eğilimi yansıtmadığını gösteriyor.

Mid Düzeyi: Mid düzeyindeki çalışanların maaşları, Junior seviyesine göre belirgin bir artış göstermekte. Medyan maaş, yaklaşık 25.000 TL civarındadır ve bu seviye, sektörde belirli bir deneyime sahip olan yazılımcıları ifade ediyor. Ancak, bu düzeydeki maaş dağılımında da bazı uç noktalar var, bu da bazı Mid çalışanlarının daha yüksek maaş aldığını gösteriyor. Genel olarak, Mid düzeyindeki çalışanların maaşları, kariyer gelişiminde önemli bir aşamayı temsil ediyor.

Senior Düzeyi: Kutu grafiğinde Senior çalışanların ortalama maaşları, diğer iki düzeye göre en yüksek seviyededir. Medyan değeri, 50.000 TL civarında, bu da deneyimli yazılımcıların sektördeki değerini yansıtmaktadır. Senior düzeyindeki dağılım daha az değişkenlik gösteriyor; bu, bu seviyedeki çalışanların genellikle yüksek ve stabil maaşlar aldığını işaret ediyor. Ayrıca, uç noktalar az sayıda bulunuyor, bu da Senior pozisyonlarındaki maaşların genel olarak daha tutarlı olduğunu gösteriyor.

Şekil 3.8. Türkiye’deki Deneyim Düzeylerine Göre Ortalama Maaş Dağılımları Grafiği

Şekil 3.9. daki Grafik, yurt dışında çalışan yazılımcıların deneyim düzeylerine göre ortalama maaş dağılımını kutu grafiği ile gösteriyor. Bu grafik, farklı deneyim seviyelerindeki çalışanların maaşlarının nasıl değiştiğini açık bir şekilde ortaya koyuyor.

Junior Düzeyi: Yurt dışında çalışan Junior düzeyindeki yazılımcıların maaşları, ortalama olarak en düşük seviyede. Kutu içindeki medyan, 25.000 TL civarında ve bu, sektöre yeni girenlerin genellikle daha düşük maaşlar aldığını gösteriyor. Ancak, bu seviye için kutu grafiğinde uç noktalar (outlier) gözlemleniyor. Bu durum, bazı Junior çalışanların beklenenden daha yüksek maaşlar aldığını ancak çoğunluğun düşük maaşlarla sınırlı kaldığını gösteriyor.

Mid Düzeyi: Mid düzeyindeki çalışanlar, Junior seviyesine göre belirgin bir maaş artışına sahip. Medyan maaş, yaklaşık 50.000 TL civarındadır ve bu durum, Mid düzeyindeki yazılımcıların deneyim ve bilgi birikimleriyle daha iyi maaşlar kazandığını gösteriyor. Kutu grafiğindeki dağılım, Mid çalışanların maaşlarının belirli bir istikrar gösterdiğini ve daha az uç noktaya sahip olduğunu ortaya koyuyor.

Senior Düzeyi: Kutu grafiğinde Senior düzeyindeki çalışanların ortalama maaşları diğer iki düzeye göre en yüksek seviyededir. Medyan değeri, 75.000 TL civarındadır, bu da deneyimli profesyonellerin sektördeki değerinin yüksek olduğunu yansıtıyor. Senior düzeyindeki çalışanlar, genellikle daha az değişkenliğe sahip bir maaş dağılımı gösteriyor, bu da sektördeki deneyimlerinin ve bilgi birikimlerinin karşılığını daha tutarlı bir şekilde aldıklarını gösteriyor.

Şekil 3.9. Yurt Dışındaki Deneyim Düzeylerine Göre Ortalama Maaş Dağılımları Grafiği

3.2.2. Türkiye’deki ve Yurt Dışındaki Ortalama Maaşın Karşılaştırılması

Şekil 3.10.’daki Grafik, Türkiye ve yurt dışındaki yazılımcıların ortalama maaşlarının dağılımını kutu grafiği ile gösteriyor. İki farklı lokasyonun maaş yapısını karşılaştırarak, her birinin maaş aralıkları ve olası uç noktalarını inceleme fırsatı sunuyor.
Kutu grafiğinde Türkiye'deki yazılımcıların ortalama maaşları belirgin bir şekilde daha düşük. Medyan değer, yaklaşık 25.000 TL civarında olup, bu durum Türkiye'deki yazılımcıların genellikle daha düşük maaşlarla çalıştığını gösteriyor. Kutu içindeki üst ve alt çeyrekler, Türkiye'deki maaşların geniş bir dağılım gösterdiğini, bazı uç noktaların (outlier) var olduğunu ortaya koyuyor. Uç noktalar, Türkiye'deki belirli pozisyonların, diğerlerine göre çok daha yüksek maaşlar aldığı anlamına geliyor.
Yurt dışındaki yazılımcıların ortalama maaşları ise belirgin bir şekilde daha yüksektir. Medyan değer, yaklaşık 50.000 TL civarındadır. Bu, yurt dışında çalışan yazılımcıların, Türkiye'dekilere göre daha yüksek maaş aldığını gösteriyor. Yurt dışındaki maaş dağılımı da benzer şekilde, üst çeyrekte bazı yüksek uç noktalar içermekte, bu da bazı pozisyonların daha fazla değer gördüğünü işaret ediyor.

           Şekil 3.10. Türkiye’deki Ve Yurt Dışındaki Ortalama Maaşın Karşılaştırılması Grafiği

3.2.3. Türkiye’deki ve Yurt Dışındaki Yazılımcıların Pozisyonlarının Sektördeki Dağılımı

Şekil 3.11’deki grafik, Türkiye'deki yazılımcıların pozisyonlarının sektördeki dağılımını yansıtmaktadır. Backend ve Fullstack Developer pozisyonları, sektördeki iş gücünün büyük bir kısmını temsil ederken, Frontend Developer pozisyonu da önemli bir yere sahiptir. Diğer pozisyonlar, daha niş alanlara odaklanan uzmanlık gereksinimlerini karşılamaktadır.

             Şekil 3.11. Türkiye’deki Yazılımcıların Sektördeki Pozisyon Dağılımları

Şekil 3.12’deki Grafik, yurt dışındaki yazılımcıların pozisyonlarının dağılımını net bir şekilde ortaya koyuyor. Backend ve Fullstack Developer pozisyonları, yurt dışındaki yazılım iş gücünün önemli bir kısmını oluştururken, Frontend Developer pozisyonu da önemli bir yer tutmaktadır. Diğer pozisyonlar, daha niş alanlara odaklanan uzmanlık gereksinimlerini karşılamaktadır. Bu dağılım, yurt dışındaki yazılım sektörü için, deneyimli ve çok yönlü profesyonellere olan talebin arttığını gösteriyor.

Şekil 3.12. Yurt Dışındaki Yazılımcıların Sektördeki Pozisyon Dağılımları

3.2.4. Türkiye’deki ve Yurt Dışındaki Yazılımcıların Çalışma Şeklinin Maaş ve Deneyim Seviyesine Göre Etkisi ve Karşılaştırılması

Şekil 3.13.’te Türkiye'deki ve yurtdışına hizmet veren çalışanlar için hibrit, uzaktan ve ofiste çalışma modellerine göre ortalama maaşlar karşılaştırılmıştır. Genel olarak, yurtdışına hizmet veren çalışanların maaşlarının tüm çalışma modellerinde ve deneyim seviyelerinde Türkiye'dekilere kıyasla belirgin şekilde daha yüksek olduğu görülmüştür. Hibrit modelde maaşlar en yüksek seviyeye ulaşırken, uzaktan çalışma modeli ikinci sırada yer almıştır. Ofiste çalışma modeli ise genellikle en düşük maaş seviyelerine sahiptir. Bu durum, yurtdışına hizmet verme avantajının yanı sıra çalışma modelinin maaşlar üzerindeki etkisini açıkça ortaya koymaktadır.

Şekil 3.13. Çalışma Şeklinin Maaş ve Deneyim Seviyesine Göre Etkisi

3.2.5. Türkiye ve Yurt Dışındaki Yazılım Geliştirme Sektörüne İlişkin Sonuçlar
Veri analizi sonuçlarına dayanarak Türkiye ve yurt dışındaki yazılım geliştirme sektörüne ilişkin önemli bulgular elde edilmiştir.
Türkiye'deki yazılım geliştirme maaşları, yurt dışındaki maaşlarla karşılaştırıldığında genel olarak daha düşüktür. Yurt dışında ortalama maaşların daha yüksek olması, bu bölgelerdeki iş gücü talebinin artış göstermesi ve yaşam standartlarının farklılığına bağlı olarak açıklanabilir.
Örneğin, yurt dışında bir "Frontend Developer" pozisyonunun maaşı, Türkiye'deki karşılığına göre belirgin bir farkla yüksektir.Türkiye'deki yazılım geliştiricilerin deneyim seviyelerine göre dağılımı, yurt dışına göre daha fazla "Junior" ve "Mid" seviyedeki pozisyonlardan oluşmaktadır. Yurt dışında "Senior" pozisyonları daha fazla görülmektedir; bu durum, yurt dışındaki iş gücü yapısının daha olgunlaşmış olduğunu göstermektedir. Yurt dışında "Senior" seviyesindeki çalışanlar, projelerde daha fazla deneyime ve liderlik yetkinliğine sahip oldukları için yüksek maaşları hak etmektedir.
Yurt dışındaki pozisyon dağılımı incelendiğinde, "Backend Developer" ve "Fullstack Developer" pozisyonlarının ön planda olduğu görülmektedir. Bu durum, teknolojik yeniliklerin ve dijital dönüşüm süreçlerinin etkisini yansıtmaktadır.Türkiye'de ise benzer pozisyonların yanı sıra "Frontend Developer" ve "Data Scientist" pozisyonları da dikkate değer bir yer tutmaktadır. Ancak "Junior" ve "Mid" seviyesindeki pozisyonların fazlalığı, sektördeki büyümenin sürdüğünü göstermektedir.
Sonuç olarak, Türkiye ve yurt dışındaki yazılım geliştirme sektörleri arasında belirgin farklar bulunmaktadır. Yurt dışındaki maaşlar, pozisyonların deneyim seviyeleri ve dağılımları, Türkiye'deki durumu önemli ölçüde etkilemektedir. Türkiye'deki yazılım sektörü büyümeye devam etmekle birlikte, deneyim kazanmanın ve uzmanlaşmanın sektördeki gelişim için kritik öneme sahip olduğu görülmektedir. Bu analiz, iş gücü planlaması ve kariyer gelişimi için önemli bilgiler sunmaktadır.

3.3 Makine Öğreniminin Uygulanması , Kullanılan Algoritmalar

Uygulamanın makine öğrenimi kısmı, yazılım geliştiricilerin maaş tahminlerini ve kariyer planlamalarını desteklemek amacıyla tasarlanmıştır. Bu aşamada, veriler üzerinde çeşitli makine öğrenimi algoritmaları uygulanmış ve anlamlı öngörüler elde edilmiştir. Kullanılan algoritmalar arasında Karar Ağaçları (Decision Trees), Rastgele Orman (Random Forest), Gradient Boosting, XGBoost ve Lineer Regresyon gibi modeller yer almaktadır.
Makine öğrenimi modelleri, deneyim süresi, teknoloji bilgisi, çalışma şekli gibi değişkenleri kullanarak bir yazılım geliştiricinin tahmini maaşını belirler. Elde edilen tahmin sonuçları, kullanıcıların kariyer hedeflerini şekillendirmelerine ve maaş beklentilerini daha gerçekçi bir şekilde oluşturmalarına yardımcı olmaktadır.

3.3.1. Decision Tree

Karar ağaçları, bir karar problemini çözmek için kullanılan ağaç yapısındaki bir modeldir. Bu ağaç yapısında, her bir düğüm bir karar noktası veya koşulu, dallar ise bu karara verilen cevapları temsil eder. Karar ağaçlarında genelde kullanılan matematiksel formüller, bilgi kazancı ve entropi gibi ölçütlere dayanır.
1.Entropi Hesabı

Entropi, bir düğümdeki veri setinin düzensizliğini veya belirsizliğini ölçer. Şu şekilde hesaplanır:

= Veri Kümesi
= S’deki sınıfının olasılığı
n = Sınıf Sayısı

                                              Denklem 3.1. Entropi Hesabı

2.Bilgi Kazancı

Bilgi kazancı, bir özelliğin veri setini ne kadar iyi böldüğünü ölçer. Şu şekilde hesaplanır:

= Özellik bilgi kazancı
= Tüm veri setinin entropisi
= Özellik değerine sahip alt kümesi
= Alt kümenin tüm veri setine oranı

                                    Denklem 3.2. Bilgi Kazancı Hesaplanması

3.Gini İndeksi

Gini indeksi, bir düğümdeki verinin saflığını ölçmek için kullanılır. Şu şekilde hesaplanır:

= Gini indeksi
= S’deki sınıfının olasılığı
n = Sınıf Sayısı

                                       Denklem 3.3. Gini İndeksinin Hesaplanması

3.3.2. Random Forest

Birden fazla karar ağacını bir araya getirerek sınıflandırma veya regresyon problemlerini çözer. Temel olarak bagging (bootstrap aggregating) ve rastgele özellik seçimine dayanır. Nasıl Çalışır?
1-Bootstrap Örnekleme: Veri setinden rastgele ve tekrarlı örneklemelerle her bir karar ağacı için farklı veri alt kümeleri oluşturulur.
2-Rasgele Özellik Seçimi: Her düğümde, yalnızca rastgele seçilmiş bir alt özellik kümesiyle en iyi bölme noktası bulunur.
3-Karar Ağaçları Eğitimi: Oluşturulan her alt küme ile bir karar ağacı eğitilir.
4-Tahmin:
-Sınıflandırma: Her ağaç oylama yapar, çoğunluğun seçimi son tahmin olur.
-Regresyon: Ağaçların tahminlerinin ortalaması alınır.
5-(OOB) Hatası: Model, bootstrap örneklemine dahil edilmeyen verilerle doğruluk hesaplar.

                                     Şekil 3.14. Random Forest İşleyişi

3.3.3 Linear Regression

Lineer Regresyon, bağımlı bir değişkenin (y) bağımsız bir veya birden fazla değişkenle (x) doğrusal bir ilişki içinde olduğu bir regresyon modelidir. Amaç, bu doğrusal ilişkiyi modellemek ve gelecekteki değerleri tahmin etmektir. Formülü şu şekildedir:

y = bağımlı değişken (tahmin edilmek istenen değer)
x = bağımsız değişken (girdi)
= Y-eksenini kestiği nokta (intercept)
= Eğitim katsayısı (slope) x’in y üzerindeki etkisini temsil eder
= Hata terimi (modelin tahminlerinin gerçek verilere ne kadar uzak olduğunu gösterir)

                               Denklem 3.4. Linear Regression Hesaplanması

3.3.4. XGBoost (Extreme Gradient Boosting)

XGBoost (Extreme Gradient Boosting), yüksek doğruluk ve hızlı öğrenme süresi ile bilinen bir güçlü ve etkili makine öğrenimi modelidir. Özellikle ensemble learning (topluluk öğrenmesi) yöntemine dayalıdır ve gradient boosting algoritmasını kullanır. XGBoost, çeşitli model optimizasyon teknikleri ve düzenlemeler (regularization) ile daha hızlı ve daha doğru sonuçlar sağlar.

Nasıl Çalışır?
Gradient Boosting: XGBoost, ardışık zayıf öğreniciler (genellikle karar ağaçları) ekler ve her yeni model, önceki modellerin hatalarını düzeltmeye çalışır.
Ağaç Yapıları: Her bir model (veya ağaç) önceki modellerin hatalarını minimize etmeye çalışarak öğrenir.
Hata Azaltma: Hedef, her iterasyonda hataları (kalanları) azaltarak en iyi tahmin modelini oluşturmak.
Regularization: XGBoost, modelin karmaşıklığını kontrol etmek için L1 (Lasso) ve L2 (Ridge) düzenleme yöntemlerini içerir.

= -inci gözlem için tahmin
= k-inci modelin (genellikle ağaç) tahmini
K = Toplam model (ağaç) sayısı

                                             Denklem 3.5. XGBoost Hesaplanması

3.3.5. Gradient Boosting

Gradient Boosting, zayıf öğrenicileri (genellikle karar ağaçları) ardışık olarak eğitip birleştirerek güçlü bir tahmin modeli oluşturan bir topluluk öğrenme (ensemble learning) yöntemidir. Temel olarak, her yeni model (veya ağaç) önceki modelin hatalarını (kalanlarını) düzeltmeye çalışır. Bu süreçte, her iterasyonda hata azalmaya çalışılır ve model giderek daha doğru hale gelir.

Gradient Boosting, hataları minimize etmek için genellikle şu formülle çalışır:

= k-inci modelin tahmini
= Önceki modelin tahmini
= Öğrenme oranı
= Önceki modelin hatalarının gradyanı, yani modelin hata fonksiyonunun türevini temsil eder.
= Önceki modelin kayıp fonksiyonu
y = gerçek etiket

                                 Denklem 3.6. Gradient Boosting Hesaplanması




                                           Şekil 3.15. Gradient Boosting İşleyişi

3.3.6. Algoritmaların Performans Karşılaştırması

                       Şekil 3.16. Algoritmaların Performans Karşılaştırması

Şekil 4.9’a Göre Daha Düşük Hata Oranları: En düşük MAE (9322.70) , MSE (235,030,248.88) ve en yüksek R² skoru değerleri ile Gradient Boosting en hassas ve doğru tahminleri yapmıştır.

MAE (Mean Absolute Error - Ortalama Mutlak Hata): Modelin tahmin ettiği değerler ile gerçek değerler arasındaki mutlak farkların ortalamasıdır. Düşük MAE, modelin daha doğru tahminler yaptığını gösterir.

MSE (Mean Squared Error - Ortalama Kare Hata): Gerçek değerler ile tahmin edilen değerler arasındaki farkların karesinin ortalamasıdır. MSE, büyük hataları daha fazla cezalandırdığı için, modelin büyük hatalardan kaçınmasını sağlar.

R² (R-squared - Determinasyon Katsayısı): Modelin açıklayıcı gücünü ölçen bir metriktir. R², modelin verideki varyansın ne kadarını açıkladığını gösterir. 1'e yakın bir R² değeri, modelin veriyi iyi açıkladığını gösterir.

Denklem 3.7. MAE Hesaplanması

Denklem 3.8. MSE Hesaplanması

Denklem 3.9. R² Hesaplanması

    4. MAAŞ TAHMİNİ UYGULAMASININ YAPILMASI

Kullanıcıdan alınan pozisyon, seviye, deneyim, teknoloji, lokasyon, çalışma şekli, çalışan sayısı ve maaş türü gibi bilgileri kullanarak bir Gradient Boosting modelinden maaş tahmini web uygulaması yapıldı.

4.1. Kullanılan Teknolojiler ve Araçlar

Streamlit: Kullanıcı arayüzü geliştirme.
Pandas: Veri işleme ve yönetimi.
Joblib: Model ve dönüştürme araçlarının yüklenmesi.
Scikit-learn: Özellik ölçeklendirme ve modelleme.
Numpy: Matematiksel işlemler.

4.2. Kodun Ana Fonksiyonları

1-Model ve Dönüşüm Araçlarının Yüklenmesi

Gradient Boosting modeli (gradient_boosting_model.pkl) kullanılarak maaş tahmini yapılır.
LabelEncoder ve StandardScaler nesneleri (label_encoders_gb.pkl, scaler_gb.pkl) kategorik ve sayısal verilerin işlenmesinde kullanılır.

2. Kullanıcıdan Veri Girişi

Kullanıcı aşağıdaki bilgileri girer:
Pozisyon, Seviye, Tecrübe, Teknoloji, Lokasyon, Çalışma Şekli, Çalışan Sayısı, Maaş Türü

3. Veri İşleme

Kategorik Değerler: LabelEncoder ile dönüştürülür. Yeni veya bilinmeyen değerler "unknown" olarak işaretlenir.
Sayısal Değerler: StandardScaler ile ölçeklendirilir.

4. Tahmin Yapma

Kullanıcıdan alınan veriler işlenir ve model üzerinden tahmin yapılır.
Tahmin edilen maaş, 2022 yılı için gösterilir. 2024 yılı tahmini, %87 artış varsayımı(dolar katsayısı değişimi) ile hesaplanır.

5. Sonuçların Gösterimi
   Maaş tahmini, Türk Lirası cinsinden görselleştirilir.

4.2.1 Uygulamanın Çalışma Akışı

Uygulamayı çalıştırmak için “streamlit run app.py” komutunu kullanmamız gerekir.
1-Kullanıcı, belirtilen alanlara bilgilerini girer.
2-"Maaşı Tahmin Et" butonuna basar.
3-Giriş verileri işlenir ve model üzerinden tahmin yapılır.
4-Sonuç kullanıcıya iki ayrı yıl için gösterilir:
2022: Model çıktısı.
2024: Tahmini %87 artış ile hesaplanan değer.
Uygulamayı çalıştırmak için “streamlit run app.py” komutunu kullanmamız gerekir.

Resim 4.1. Maaş Tahmin Uygulaması

Resim 4.2. Maaş Tahmin Uygulaması

5.SONUÇ VE ÖNERİLER

Bu bölümde, projenin genel değerlendirmesi yapılacak, elde edilen başarılar ve karşılaşılan zorluklar ele alınacak ve gelecekte yapılabilecek geliştirmeler için öneriler sunulacaktır.

5.1. Projenin Başarıları

Bu projede, yazılım geliştiricilerin maaşlarını tahmin edebilen bir sistem geliştirilmiştir. Kullanıcılar, çeşitli faktörleri (deneyim yılı, eğitim durumu, iş türü, coğrafi konum gibi) göz önünde bulundurarak maaş tahmini alabilmektedir. Proje, veri bilimi tekniklerini, özellikle makine öğrenimi algoritmalarını kullanarak kullanıcıların doğru ve güvenilir maaş tahminleri almasını sağlamıştır.

Sistemde kullanılan veriler, yazılım geliştirme endüstrisinin geniş bir yelpazesinde toplanmış ve bu sayede modelin doğruluğu artırılmıştır. Proje, kullanıcı dostu bir arayüz ile kullanıcıların hızlıca tahmin alabilmelerini sağlamaktadır. Ayrıca, tahminlerin güvenilirliğini artırmak için sürekli olarak güncellenen veriler kullanılarak sistemin doğruluğu arttırılmıştır.

5.2. Karşılaşılan Zorluklar

Proje sürecinde bazı zorluklarla karşılaşılmıştır. Öncelikle, veri kaynaklarının çeşitliliği ve kalitesi, modelin doğruluğunu etkileyen önemli bir faktör olmuştur. Farklı şirketlerden ve coğrafi bölgelerden elde edilen verilerin standardizasyonu zaman alıcı bir süreç olmuştur. Ayrıca, bazı verilerin eksik veya hatalı olması, modelin tahmin doğruluğunu olumsuz etkilemiştir.

Bir diğer zorluk ise, kullanıcıların beklentilerini doğru bir şekilde yönetebilmek olmuştur. Özellikle maaş tahminlerinin belirsizliğini azaltmak için modelin daha fazla özelleştirilmesi gerekmiştir. Bununla birlikte, bazı özelliklerin (örneğin, sektörün gelecekteki eğilimleri) modele dahil edilmesi, tahminlerin doğruluğunu artırabilirdi.

5.3. Gelecek Geliştirmeler

Projenin gelecekte daha fazla geliştirilebilmesi ve kullanıcı deneyiminin iyileştirilmesi için bazı öneriler sunulmuştur. Öncelikle, daha fazla veri kaynağının entegrasyonu, modelin doğruluğunu artırabilir. Bu, farklı sektörlerden alınan verilerle daha geniş bir perspektif sunarak daha güvenilir tahminler elde edilmesini sağlayacaktır.

Yapay zeka destekli, dinamik bir maaş tahmin sistemi eklenmesi, modelin gelişen trendlere göre daha esnek ve doğru sonuçlar vermesini sağlayabilir. Ayrıca, kullanıcıların kendi profil bilgilerini girerek daha kişisel ve hassas tahminler alabilmeleri için daha ayrıntılı parametreler eklenebilir.

Gelecekte, kullanıcıların daha fazla etkileşimde bulunabileceği bir arayüz tasarımı ile tahminlerin görselleştirilmesi önerilmektedir. Kullanıcılar, kendi verilerini ve tahminlerini daha kolay şekilde analiz edebilirler. Ayrıca, farklı coğrafi bölgelerdeki maaş farklarını daha net bir şekilde gösteren harita tabanlı bir arayüz tasarımı, sistemin işlevselliğini artırabilir.

5.4. Sonuç

Proje, yazılım geliştiricilerinin maaşlarını tahmin etmek için güçlü bir platform oluşturmuş ve bu platform sayesinde kullanıcılara değerli bilgiler sunmuştur. Verilerin doğru işlenmesi ve analiz edilmesi, yazılım geliştiricilerin maaş beklentilerini daha bilinçli bir şekilde yönetebilmelerini sağlamaktadır. Uygulama, sektörün dinamiklerine ve kullanıcı geri bildirimlerine dayalı olarak sürekli gelişmeye açıktır.

KAYNAKLAR

    1. Akbulut, Umut. "2025'te Yazılımcı Maaşları: Türkiye, Avrupa, ABD ve Daha Fazlası." Medium, 2024

    2. AppMaster.io. "Bir Yazılım Geliştirici Ne Kadar Kazanır? Maaş Çeklerinin Analizi." AppMaster.io Blog, 2022

    3. Key of Change. "Yaklaşık Yazılımcı Maaşları (2023)." Key of Change, 2023.

    4. Geleceği Yazanlar. "Hangi Geliştirici Ne Kadar Kazanıyor?" Geleceği Yazanlar Blog, 2021.

    5. Reddit Kullanıcısı. "3 Yıllık Maaş Grafiğim." Reddit r/CodingTR, 2023.

    6. CodeGym. "Değerini Bil. Yazılım Geliştiricisinin Pazar Değerini Tahmin Etmenin Yolları." CodeGym Blog, 2021.

    7. Yektek, Kerimcan “2025’te Yazılımcılar Ne Kadar Maaş Alıyor?” Patika.dev, 2025

    8. Özkan, Sude “2024 Yazılımcı Maaş Anketi Sonuçları” Patika.dev, 2024.

    9. Yılmaz, Uğur “2025 Yazılımcı Maaş Tahminleri!” teknogelecek, 2024

    10. Çelebi, Murat “Makine Öğrenmesi ile Maaş Tahmin Modeli Oluşturma” Medium 2022

    11. Nacar, Emine Nur “Makine Öğrenmesi Algoritmaları ile Satış Tahmini” Ankara Yıldırım Beyazıt Üniversitesi 2021

EKLER
EK-1(a). Proje Kaynak Kodları

Bu tezde kullanılan yazılım geliştirme projelerine ait kaynak kodlarına aşağıdaki GitHub bağlantısından ulaşabilirsiniz:

GitHub Bağlantısı: https://github.com/berkayslc/salary_prediction_app

Bu bağlantı, proje kodlarının tamamını ve ilgili belgeleri içerir. Kodlar, açık kaynak lisansı altında paylaşılmıştır ve dileyen herkesin incelemesi ve geliştirmesi için erişime açıktır.

ÖZGEÇMİŞ

Berkay SALLAMACI 2001 yılında Bursa’da doğdu. İlk öğrenimini Bursa’nın Orhangazi ilçesinde Atatürk İlkokulu’nda, Orta öğrenimini ise Bursa’nın Orhangazi ilçesinde Atatürk Ortaokulu’nda tamamladı. Eğitim hayatına erken yaşlarda matematiğe olan ilgisiyle yön veren Berkay, bu alandaki yetkinliğini geliştirmek için sayısal bölüme yöneldi. 2019 yılında Uzmanlar Koleji Sayısal Bölümü’nden mezun oldu. Sonrasıda ise 2021 yılında Muğla Sıtkı Koçman Üniversitesi Teknoloji Fakültesi Bilişim Sistemleri Mühendisliği Bölümü’nü kazandı. Halen aynı bölümün 4. Sınıf öğrencisidir. Berkayın kariyer hedefi, bilişim teknolojileri alanında derinlemesine bilgi sahibi olmak ve sektördeki yenilikçi projelerde aktif rol alarak teknolojiyi insan hayatına entegre etmek.

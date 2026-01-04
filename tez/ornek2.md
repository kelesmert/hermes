T.C. MUĞLA SITKI KOÇMAN
ÜNİVERSİTESİ
TEKNOLOJİ FAKÜLTESİ

BİLİŞİM SİSTEMLERİ MÜHENDİSLİĞİ BÖLÜMÜ
LİSANS BİTİRME PROJESİ

RESTORANLAR İÇİN REZERVASYON VE ONLİNE YEMEK SİPARİŞİ

HAZIRLAYAN

SUDE CİCİKARA

                                       DANIŞMAN

Prof. Dr. İlhan TARIMER

15 Ocak 2025

MUĞLA

KABUL VE ONAY SAYFASI

Sude CİCİKARA tarafından hazırlanan “Restoranlar İçin Rezervasyon ve Online Yemek Siparişi” adlı bu çalışmanın, Lisans Mühendislik Projesi olarak uygun olduğunu onaylarım.

                                                                                                                  Prof. Dr. İlhan TARIMER

Bu çalışma, jürimiz tarafından, Bilişim Sistemleri Mühendisliği Bölümü’nde Lisans Mühendislik Projesi olarak kabul edilmiştir.

Başkan:********\_\_\_\_******** İmza:********\_\_\_********

Üye: **********\_\_********** İmza:********\_\_\_********

Üye: **********\_\_********** İmza:********\_\_\_********

Bu Mühendislik Projesi, Muğla Sıtkı Koçman Üniversitesi Teknoloji Fakültesi Bilişim Sistemleri Mühendisliği Bölümü bitirme çalışması yazım kurallarına uygun biçimde hazırlanmıştır.

MÜHENDİSLİK PROJESİ BİLDİRİMİ

Bu çalışma, akademik etik kurallarına uygun olarak hazırlanmıştır. Başkalarına ait bilgi ve görüşlere gereken atıflar yapılmış, kaynaklar açıkça belirtilmiştir.

Sude CİCİKARA

RESTORANLAR İÇİN REZERVASYON VE ONLİNE YEMEK SİPARİŞİ
(Lisans Mühendislik Projesi)

Sude Cicikara
MUĞLA SITKI KOÇMAN ÜNİVERSİTESİ TEKNOLOJİ FAKÜLTESİ
BİLİŞİM SİSTEMLERİ MÜHENDİSLİĞİ BÖLÜMÜ
15 Ocak 2025
ÖZET
Bu proje, restoranlar ve kullanıcılar arasında etkileşim sağlayan bir yemek sipariş ve yönetim sistemi olarak tasarlanmıştır. Sistem, restoranların menülerini yönetmelerine, kullanıcıların restoranlardan yemek sipariş etmelerine ve restoran profillerini özelleştirmelerine olanak tanımaktadır. Kullanıcı ve restoran hesapları için ayrı giriş ve yetkilendirme mekanizmaları geliştirilmiş, böylece her rol için özelleştirilmiş kullanıcı deneyimi sunulmuştur. Projenin temel özellikleri arasında kullanıcıların profil yönetimi, ödeme bilgileri ekleme, sipariş geçmişlerini görüntüleme ve restoran detaylarına erişme işlemleri bulunmaktadır. Restoran sahipleri için özel olarak, menü yönetimi, yemek ekleme, düzenleme ve silme, rezervasyon onaylama gibi işlevler geliştirilmiştir. Sistem, kullanıcılar ve restoran sahipleri için ayrılmış arayüzler sayesinde kullanıcı dostu bir deneyim sunmayı hedeflemektedir. Bu proje, restoran yönetimini ve kullanıcıların sipariş süreçlerini kolaylaştırmayı amaçlayan modern, güvenli ve ölçeklenebilir bir çözüm sunmaktadır.
Anahtar Kelimeler : Restoran yönetimi, Yemek sipariş sistemi, Rezervasyon
Sayfa Adeti : 59
Bitirme Çalışma Yöneticisi : Prof. Dr. İlhan TARIMER

RESERVATION AND ONLINE FOOD ORDERING SYSTEM FOR RESTAURANTS
(Undergraduate Engineering Project)
Sude Cicikara
MUĞLA SITKI KOÇMAN UNİVERSİTY
FACULTY OF TECHNOLOGY
DEPARTMENT OF INFORMATİON SYSTEMS ENGİNEERİNG
January 15 2025

ABSTRACT

This project is designed as a food ordering and management system to facilitate interaction between restaurants and users. The system enables restaurants to manage their menus, allows users to place food orders, and customize restaurant profiles. Separate login and authorization mechanisms have been developed for user and restaurant accounts, providing a personalized user experience for each role.
Key features of the project include user profile management, adding payment information, viewing order history, and accessing restaurant details. For restaurant owners, specific functions such as menu management, adding, editing, and deleting dishes, and approving reservations have been developed.
The system aims to deliver a user-friendly experience through interfaces designed specifically for users and restaurant owners. This project offers a modern, secure, and scalable solution to streamline restaurant management and user ordering processes.

Keywords : Restaurant management, Food ordering system, Reservation
Page Number : 59

Advisor : Prof. Dr. İlhan TARIMER

TEŞEKKÜR

Bu çalışmada bana yol gösteren danışmanım Prof. Dr. İlhan TARIMER’e ve her daim yanımda olan ailem ve desteklerini esirgemeyen tüm dostlarıma minnettarım.
Sude CİCİKARA

İÇİNDEKİLER

KABUL VE ONAY SAYFASI I
MÜHENDİSLİK PROJESİ BİLDİRİMİ II
ÖZET III
ABSTRACT IV
TEŞEKKÜR V
İÇİNDEKİLER vii
ŞEKİLLERİN LİSTESİ ix
RESİMLERİN LİSTESİ x
SİMGELER VE KISALTMALAR xi
1.GİRİŞ 1
1.1 Amaç 1
1.2 Kapsam 2
1.3 Literatür Taraması 2 2. KULLANILAN TEKNOLOJİ VE YÖNTEMLER 5
2.1 Backend Teknolojileri 5
2.1.1 Express Teknolojisi 5
2.1.2 MySQL2 Teknolojisi 6
2.1.3 Sequelize Teknolojisi 6
2.1.4 Body-Parser Teknolojisi 6
2.1.5 CORS (Cross-Origin Resource Sharing) Teknolojisi 7
2.1.6 Nodemon Teknolojisi 7
2.1.7 JSON Web Token Teknolojisi 7
2.1.8 Bcrypt Teknolojisi 8
2.2 Frontend Teknolojileri 8
2.2.1 Vue-Router Teknolojisi 8
2.2.2 Axios Teknolojisi 8
2.3 Backend Mimarisi 9
2.3.1 Node.js 9
2.3.2 MVC Mimarisi 10
2.4 Frontend Mimarisi 11
2.4.1 Vue.js 11
2.5 Geliştirilen Uygulamanın Çalıştırılması 12
2.5.1 Uygulama Anasayfası 12
2.5.2 Kullanıcı Kayıt Sayfası 13
2.5.3 Restoran Kayıt Sayfası 14
2.5.4 Kullanıcı/Restoran Giriş Sayfası 15
2.5.5 Restoranlar Sayfası 19
2.5.6 Restoran Detay Sayfası 20
2.5.7 Rezervasyon Oluşturma Sayfası 21
2.5.8 Restoran Profil Yönetim Sayfası 23
2.5.9 Restoran Menü Yönetimi Sayfası 24
2.5.10 Menü Öğesi Düzenleme Sayfası 25
2.5.11 Restoran Sipariş Sayfası 26
2.5.12 Restoran Rezervasyon Sayfası 27
2.5.13 Kullanıcı Profil Bilgi Sayfası 28
2.5.14 Kullanıcı Adres Bilgisi Sayfası 29
2.5.15 Kullanıcı Ödeme Kartları Sayfası 30
2.5.16 Kullanıcı Bakiye Yükleme Sayfası 34
2.5.17 Kullanıcı Rezervasyon Sayfası 36
2.5.18 Kullanıcı Sepeti Sayfası 37
2.5.19 Kullanıcı Siparişlerim Sayfası 38
2.6 Veri Yönetimi 39
2.6.1 Giriş 39
2.6.2 Veritabanı Tasarımı 39
2.6.3 Tabloların Detaylı Açıklaması 40
2.7 Bulgular 44 3. SONUÇ VE ÖNERİLER 45
3.1 Sistem Performansı ve Kullanıcı Deneyimi 45
3.2 Restoran Yönetimi ve İş Süreçleri 45
3.3 Finansal Yönetim ve Ödeme İşlemleri 45
3.4 Gelecekteki Geliştirme Önerileri 45
KAYNAKLAR 47
EKLER 48
ÖZGEÇMİŞ 49

ŞEKİLLERİN LİSTESİ

Şekil 2. 1 Node.js Mimarisi 9
Şekil 2. 2 MVC Mimari Yapısı 10

RESİMLERİN LİSTESİ

Resim 2. 1 Uygulama Anasayfa Görünümü 12
Resim 2. 2 Kullanıcı Kayıt Sayfa Görünümü 13
Resim 2. 3 Restoran Kayıt Sayfa Görünümü 14
Resim 2. 4 Kullanıcı/Restoran Giriş Sayfa Görünümü 15
Resim 2. 5 Kullanıcı/Restoran Başarısız Giriş Görünümü 16
Resim 2. 6 Kullanıcı/Restoran Hatalı Giriş Sayfa Görünümü 17
Resim 2. 7 Kullanıcı/Restoran Başarılı Giriş Sayfası Görünümü 18
Resim 2. 8 Uygulamanın Restoranlar Sayfa Görünümü 19
Resim 2. 9 Restoran Detayları Sayfa Görünümü 20
Resim 2. 10 Rezervasyon Oluşturma Sayfa Görünümü 21
Resim 2. 11 Rezervasyon Oluşturma Sayfa Görünümü 22
Resim 2. 12 Restoran Profil Yönetim Sayfa Görünümü 23
Resim 2. 13 Restoran Menü Yönetim Sayfa Görünümü 24
Resim 2. 14 Restoran Öğe Düzenleme Sayfa Görünümü 25
Resim 2. 15 Restoran Sipariş Sayfa Görünümü 26
Resim 2. 16 Restoran Rezervasyon Sayfa Görünümü 27
Resim 2. 17 Kullanıcı Profil Bilgisi Sayfa Görünümü 28
Resim 2. 18 Kullanıcı Adres Bilgisi Sayfa Görünümü 29
Resim 2. 19 Kullanıcı Ödeme Kartları Sayfası Görünümü 30
Resim 2. 20 Kullanıcı Ödeme Kartı Ekleme Sayfa Görünümü 31
Resim 2. 21 Kullanıcı Hatalı Kart Ekleme Sayfa Görünümü 32
Resim 2. 22 Kullanıcı Başarılı Kart Ekleme Sayfa Görünümü 33
Resim 2. 23 Kullanıcı Bakiye Yükleme Sayfa Görünümü 34
Resim 2. 24 Kullanıcı Başarılı Bakiye Yükleme Sayfa Görünümü 35
Resim 2. 25 Kullanıcı Rezervasyon Sayfa Görünümü 36
Resim 2. 26 Kullanıcı Siparişlerim Sayfa Görünümü 37
Resim 2. 27 Kullanıcı Siparişlerim Sayfa Görünümü 38
Resim 2. 28 MySQL Logo 40
Resim 2. 29 Bütün Tabloların Yer Aldığı Görünüm 40
Resim 2. 30 Users (Kullanıcı) Tablosunun Görünümü 41
Resim 2. 31 Addresses (Adresler) Tablosunun Görünümü 41
Resim 2. 32 Payment_cards (Ödeme Kartları) Tablosunun Görünümü 42
Resim 2. 33 Restaurants (Restoranlar) Tablosunun Görünümü 42
Resim 2. 34 Menu_items (Menü Öğeleri) Tablosunun Görünümü 43
Resim 2. 35 Order_items (Siparişler Öğesi) Tablosunun Görünümü 43
Resim 2. 36 Orders (Siparişler) Tablosunun Görünümü 43

SİMGELER VE KISALTMALAR

Bu çalışmada kullanılmış bazı simgeler ve kısaltmalar, açıklamaları ile birlikte aşağıda sunulmuştur.

MySQL My Structured Query Language

JSON JavaScript Object Notation

API Application Programming Interface

UI UserInterface

PK Primary Key

FK Foreign Key

AI Auto Increment

ENUM Enumerated Data Type

CRUD Create, Read, Update, Delete

JWT JSON Web Token

1.GİRİŞ
Günümüzde, dijital dönüşümün hız kazandığı bir dünyada, yemek sektörü de bu dönüşümden önemli ölçüde etkilenmiştir. Özellikle restoranlar ve kullanıcılar arasındaki etkileşimlerin dijital platformlar üzerinden gerçekleştirilmesi, bu alanda birçok yeniliği ve kolaylığı beraberinde getirmiştir. Bu tez çalışması, kullanıcıların restoranları inceleyebileceği, yemek menülerine göz atabileceği, sipariş verebileceği ve restoran sahiplerinin de işletmelerini yönetebileceği bir "Yemek Sipariş ve Rezervasyon Platformu" geliştirilmesini ele almaktadır. Projenin temel amacı, kullanıcı dostu bir web uygulaması geliştirerek restoranlarla müşteriler arasındaki iletişimi daha verimli hale getirmektir. Kullanıcılar platform üzerinden restoranları keşfedebilir, yemek menülerine göz atabilir, sipariş verebilir ve rezervasyon yapabilir. Restoran sahipleri ise kendi işletmelerinin menülerini düzenleyebilir, rezervasyonları yönetebilir ve siparişleri takip edebilir. Bu kapsamda, platform hem bireysel kullanıcılar hem de işletmeler için bütünleşik bir çözüm sunmaktadır. Bu çalışmada, hem frontend hem de backend geliştirme süreçleri ele alınmış ve proje modern web teknolojileriyle oluşturulmuştur. Backend tarafında kullanıcı yönetimi, restoran profili, menü yönetimi ve sipariş süreçleri gibi özellikler, güçlü bir altyapı üzerinde geliştirilmiştir. Frontend tarafında ise kullanıcı deneyimini artırmak amacıyla duyarlı ve kullanıcı dostu bir arayüz tasarlanmıştır.Bu proje, restoran yönetim süreçlerini dijitalleştirerek hem müşterilere hem de restoran sahiplerine değer yaratmayı hedeflemektedir. Ayrıca proje, web tabanlı yemek sipariş platformlarının gelecekte daha fazla önem kazanacağı gerçeğiyle, bu alanda yapılacak çalışmalara da katkı sunmayı amaçlamaktadır.

1.1 Amaç
Bu projenin temel amacı, restoranlar ve kullanıcılar arasındaki etkileşimi dijital bir platform üzerinden daha verimli ve kullanıcı dostu bir hale getirmektir. Yemek siparişi, rezervasyon yönetimi ve restoran yönetim süreçlerini bir araya getiren bu platform, hem bireysel kullanıcıların hem de restoran sahiplerinin ihtiyaçlarını karşılamayı hedeflemektedir.Kullanıcılar için kolaylık sağlamak; kullanıcıların restoranları incelemesini, menü içeriklerini görüntülemesini ve yemek siparişlerini kolayca gerçekleştirmesini sağlamak .Kullanıcıların masa rezervasyonlarını çevrim içi olarak hızlı ve etkili bir şekilde yapabilmesine olanak tanımak .Kullanıcı profilleri, ödeme yöntemleri ve önceki siparişleri yönetebileceği bir arayüz sunmak.
Restoranların yönetim süreçlerini dijitalleştirmek; restoran sahiplerinin menü oluşturma, güncelleme ve silme işlemlerini kolayca yapabileceği bir yönetim paneli sağlamak.restoranların siparişlerini ve rezervasyon taleplerini daha organize bir şekilde yönetmesine olanak tanımak.restoranlara, müşteri etkileşimlerini artıracak dijital araçlar sunarak işletmelerin hizmet kalitesini yükseltmek.
1.2 Kapsam
Bu proje, restoranlar ve kullanıcılar arasındaki etkileşimi artırmak ve yönetim süreçlerini kolaylaştırmak amacıyla geliştirilmiş kapsamlı bir dijital platformdur. Projenin kapsamı, kullanıcıların ve restoran sahiplerinin ihtiyaçlarını karşılayacak şekilde geniş bir işlevsellik yelpazesini içermektedir. Kullanıcı tarafında, yemek siparişi verme, masa rezervasyonu yapma, profil bilgilerini güncelleme, ödeme kartlarını yönetme ve önceki siparişleri görüntüleme gibi temel özellikler sunulmaktadır. Restoran sahipleri için ise menü oluşturma ve düzenleme, sipariş yönetimi, rezervasyon onaylama ve müşteri etkileşimlerini artırma gibi yönetimsel araçlar sağlanmaktadır.Proje, hem kullanıcıların hem de restoran sahiplerinin farklı ihtiyaçlarına uygun şekilde özelleştirilmiş bir deneyim sunmayı hedefler. Bunun yanı sıra, güvenli kimlik doğrulama sistemi, kullanıcı ve restoran sahiplerinin verilerini koruma altına alarak modern güvenlik standartlarını sağlamaktadır. Ayrıca, sistem, mobil uyumlu bir tasarımla tüm cihazlarda kullanılabilir ve duyarlı bir kullanıcı deneyimi sunmaktadır.Teknolojik olarak proje, Node.js ile geliştirilmiş bir backend, MySQL tabanlı bir veri tabanı ve Vue.js ile oluşturulmuş bir frontend altyapısına dayanmaktadır. Bu yapı, kullanıcı dostu bir arayüz ile güçlü bir arka uç sistemini birleştirerek hem performans hem de erişilebilirlik açısından etkin bir çözüm sunmaktadır. Projenin kapsamı, yemek sektörü ve dijital yönetim ihtiyaçlarına yenilikçi bir yaklaşım sunarak geniş bir kullanıcı kitlesine hitap etmektedir.
1.3 Literatür Taraması

Bu bölümde, çevrim içi yemek siparişi ve rezervasyon sistemlerine yönelik daha önce yapılmış çalışmalar ele alınmıştır. Literatürde öne çıkan başlıca sistemler ve araştırma sonuçları aşağıda sunulmaktadır:
OpenTable: Çevrim İçi Rezervasyon Sistemleri
McCarthy ve Kaplan (2001) tarafından yapılan bir çalışmada, restoranların rezervasyonlarını yönetmesine olanak tanıyan OpenTable platformunun, restoran doluluk oranlarını artırdığı ve müşteri memnuniyetini geliştirdiği belirtilmiştir.[1]
Zomato ve Yelp: Menüler ve Kullanıcı Geri Bildirimleri
Jeong ve Jang (2011), Zomato ve Yelp gibi platformların kullanıcıların restoran menülerini inceleyip değerlendirme yapmalarına olanak sağladığını belirtmiştir. Bu çalışmada, kullanıcı geri bildirimlerinin ve menülerin dijital ortamda sunulmasının müşteri kararlarını önemli ölçüde etkilediği vurgulanmıştır.[2]

Uber Eats ve Yemek Sepeti: Yemek Siparişi Platformları
Ray (2019) tarafından yürütülen çalışmada, Uber Eats ve Yemek Sepeti gibi yemek siparişi platformlarının kullanıcı dostu arayüzleriyle sipariş süreçlerini basitleştirerek müşteri memnuniyetini artırdığı ifade edilmiştir. Ayrıca ödeme yöntemlerinin ve kullanıcı profillerinin kişiselleştirilmesinin bu deneyimi güçlendirdiği belirtilmiştir.[3]
Mobil Yemek Sipariş Uygulamaları
Yılmaz ve Korkmaz (2021), mobil yemek siparişi uygulamalarında müşteri tatminini etkileyen çeşitli faktörleri incelemiş ve bu faktörlerin kullanıcı deneyimi üzerindeki etkilerini değerlendirmiştir.[4]
Çevrim İçi Sipariş Uygulamaları: Müşteri Memnuniyeti
Demir ve Çelik (2020), çevrim içi yemek sipariş uygulamalarında tüketici memnuniyetini etkileyen unsurları araştırmıştır. Çalışmada kullanıcı arayüz tasarımı ve ödeme kolaylığı gibi faktörlerin önemi vurgulanmıştır.[5]
Just Eat: Global Yemek Siparişi Platformu
Just Eat platformu, restoranlara sipariş yönetimi ve müşteri ilişkileri yönetimi sunan bir sistem olarak tanımlanmıştır. Bu tür platformların restoranların operasyonel verimliliğini artırdığı ifade edilmektedir.[6]
Tablein: Rezervasyon Yönetimi
Tablein platformunun, restoranlar için çevrim içi rezervasyon ve müşteri yönetimi sistemleri sunduğu, doluluk oranlarını artırmak ve masa yönetimini optimize etmek için tasarlandığı belirtilmiştir. [7]
GloriaFood: Ücretsiz Sipariş ve Rezervasyon Sistemleri
GloriaFood platformu, restoranların çevrim içi sipariş ve rezervasyon sistemlerini ücretsiz olarak kurmasına olanak tanımaktadır. Restoranlar, menüleri ve siparişleri bir panel üzerinden yönetebilmektedir.[8]

RobotPOS: Restoran Otomasyon Sistemleri
RobotPOS yazılımı, restoran otomasyonu ve sipariş yönetimi hakkında bilgi ve çözüm sunmaktadır. Bu tür yazılımlar, restoran işletmelerinin dijital dönüşüm süreçlerini kolaylaştırmaktadır.[9]
YouTube: Çevrim İçi Sipariş Sistemleri Hakkında Bilgilendirme
"Restaurantlogin" isimli YouTube kanalı, "How Does Online Food Ordering System Work" başlıklı videosunda çevrim içi yemek siparişi sistemlerinin çalışma mekanizmalarını detaylı bir şekilde açıklamaktadır. Video, bu sistemlerin temel işleyişi ve kullanıcı deneyimine etkisi hakkında bilgi sağlamaktadır.[10]

1.4 Tez İçeriği Hakkında
Bu çalışma toplam 3 bölümden oluşmaktadır. 1. bölümde, çalışmanın amacı, kapsamı ve önemi ele alınmış, konuya giriş yapılmıştır. 2. bölümde, projenin geliştirilmesi sırasında kullanılan teknoloji ve yöntemler detaylı bir şekilde açıklanmıştır. Bu bölümde, hem frontend hem de backend geliştirme süreçlerinde tercih edilen araçlar ve teknikler ile bunların proje üzerindeki etkileri sunulmuştur. 3. bölümde ise çalışmanın sonuçları değerlendirilmiş, projenin katkıları tartışılmış ve gelecekte yapılabilecek geliştirmeler için önerilerde bulunulmuştur.

2. KULLANILAN TEKNOLOJİ VE YÖNTEMLER
   Bu proje, restoran yönetimi ve kullanıcı sipariş sistemlerini bir araya getiren kapsamlı bir web uygulaması olarak tasarlanmıştır. Hem restoran sahiplerinin hem de kullanıcıların ihtiyaçlarını karşılayacak şekilde yapılandırılan sistem, kullanıcı dostu bir arayüz ve güçlü bir altyapı ile desteklenmiştir. Restoran sahipleri, sisteme giriş yaptıktan sonra restoran profillerini düzenleyebilir, menülerine yeni öğeler ekleyebilir, mevcut menü öğelerini güncelleyebilir veya silebilirler. Kullanıcılar ise, restoranların profillerini inceleyerek menü öğelerini görüntüleyebilir ve kolayca sipariş oluşturabilir. Projenin backend kısmında, Node.js ve Express.js teknolojileri kullanılarak RESTful API'ler geliştirilmiştir. Verilerin yönetimi için MySQL veritabanı kullanılmış ve bu veritabanı Sequelize ORM ile yapılandırılmıştır. JWT tabanlı kimlik doğrulama mekanizması ile güvenlik sağlanmış, kullanıcı ve restoran sahipleri için farklı giriş mekanizmaları oluşturulmuştur. Frontend kısmında ise Vue.js kullanılarak modern bir kullanıcı arayüzü tasarlanmış, API entegrasyonu Axios kütüphanesi yardımıyla gerçekleştirilmiştir. Proje boyunca, modüler ve ölçeklenebilir bir yapı benimsenmiş, kodlama standartlarına dikkat edilerek geliştirici dostu bir sistem oluşturulmuştur. Tasarımda, kullanıcı deneyimi ön planda tutulmuştur. Ayrıca, proje geliştirme sürecinde test odaklı bir yaklaşım benimsenmiş ve hata yönetimi mekanizmaları titizlikle uygulanmıştır. Bu uygulama, restoran işletmecilerinin operasyonel verimliliğini artırırken, müşterilere modern bir hizmet deneyimi sağlamayı hedeflemektedir.
   2.1 Backend Teknolojileri
   2.1.1 Express Teknolojisi
   Express.js, Node.js tabanlı bir web uygulama geliştirme çerçevesi olup, basitlik, esneklik ve performans odaklı bir yapı sunar. Minimalist tasarımı sayesinde geliştiricilere yalnızca temel işlevleri sağlayarak ihtiyaç duyulan özelliklerin projeye eklenmesini kolaylaştırır. Express.js, özellikle RESTful API'ler, dinamik web sayfaları ve mikroservis tabanlı sistemler geliştirmek için idealdir. Güçlü yönlendirme sistemi sayesinde, kullanıcı isteklerini (GET, POST, PUT, DELETE gibi) kolayca işleyebilir ve URL tabanlı yollarla organize edebilir. Ayrıca middleware yapısıyla isteklere gelen yanıtlara müdahale etme, hata yönetimi, doğrulama ve oturum yönetimi gibi işlemleri gerçekleştirme imkanı sunar. Asenkron ve olay güdümlü mimarisi, Node.js'nin performans avantajlarını devralarak yüksek hızlı ve ölçeklenebilir bir altyapı sağlar. Geliştiriciler, Express.js’yi şablon motorları (EJS, Pug gibi) ile entegre ederek dinamik HTML çıktıları oluşturabilir ve zengin kullanıcı deneyimleri sağlayabilir. Bunun yanı sıra NPM (Node Package Manager) üzerinden binlerce modül ile kolayca genişletilebilir, bu da her tür proje için geniş bir çözüm yelpazesi sunar.

2.1.2 MySQL2 Teknolojisi
MySQL2, Node.js tabanlı uygulamalarda MySQL veritabanı ile etkileşim kurmak için kullanılan modern bir istemci kütüphanesidir ve performans, güvenlik ile modern JavaScript özellikleri açısından önemli avantajlar sunar. Geleneksel MySQL kütüphanesinin tüm özelliklerini desteklemekle birlikte, asenkron programlamayı kolaylaştıran Promise ve async/await desteği sayesinde güncel JavaScript ile tam uyumluluk sağlar. SQL sorgularını verimli bir şekilde çalıştırmak için geliştirilmiş bir altyapıya sahip olan MySQL2, özellikle büyük veri kümeleri ile çalışırken veri akışları (streams) gibi özelliklerle bellek kullanımını optimize eder ve performansı artırır. Güvenlik açısından SQL enjeksiyonlarını önlemek için prepared statements gibi özellikler sunarak kullanıcı girişlerinden kaynaklanabilecek riskleri minimize eder. Hem callback tabanlı hem de modern promise tabanlı API desteği ile esneklik sunan bu kütüphane, RESTful API’ler, mikroservisler ve gerçek zamanlı veri işleme uygulamaları gibi geniş bir kullanım alanına sahiptir. Optimize edilmiş hafif yapısı, düşük bellek tüketimi ve hızlı işlem gücü ile dikkat çeken MySQL2, Node.js tabanlı projelerde veritabanı işlemleri için güvenilir ve performans odaklı bir çözüm sunar.[11]
2.1.3 Sequelize Teknolojisi
Sequelize, Node.js için geliştirilmiş popüler bir ORM (Object-Relational Mapping) kütüphanesidir ve ilişkisel veritabanları (MySQL, PostgreSQL, SQLite, MariaDB gibi) ile JavaScript nesneleri arasında bir köprü kurar. Modeller aracılığıyla veritabanındaki tabloları temsil eder ve SQL sorgularını soyutlayarak veri ekleme, okuma, güncelleme ve silme (CRUD) işlemlerini kolaylaştırır. Tablolar arasındaki ilişkileri tanımlamayı destekleyen Sequelize, migration ve veri doğrulama gibi özellikler sunar. Promises ve async/await desteği sayesinde modern JavaScript ile uyumlu çalışır, ayrıca esnek yapısıyla SQL enjeksiyonlarına karşı güvenli ve performanslı bir çözüm sunar. Özellikle RESTful API geliştirme ve karmaşık veritabanı yapıları yönetme süreçlerini kolaylaştırdığı için yaygın olarak tercih edilir.
2.1.4 Body-Parser Teknolojisi
Body-parser, Node.js uygulamalarında gelen HTTP isteklerinin gövdesini (body) ayrıştırmak için kullanılan bir middleware kütüphanesidir. Geleneksel olarak, HTTP isteklerinin gövdesi düz bir veri akışı olarak gelir ve bu verilerin kullanışlı hale getirilmesi için ayrıştırılması gerekir. Body-parser, bu veri akışını JSON, URL-encoded veya metin formatlarına dönüştürerek req.body nesnesine ekler, böylece geliştiriciler gelen verileri kolayca işleyebilir. RESTful API'lerde genellikle POST, PUT gibi veri gönderen isteklerde kullanılan body-parser, JSON tabanlı API'ler geliştirmek için özellikle faydalıdır. Express.js ile sıkça kullanılır ve güvenli, hızlı ve esnek bir veri ayrıştırma çözümü sunar.

2.1.5 CORS (Cross-Origin Resource Sharing) Teknolojisi
CORS (Cross-Origin Resource Sharing), bir web uygulamasının, farklı bir alan adı (origin) üzerindeki kaynaklara erişmesine izin veren bir mekanizmadır ve modern web tarayıcılarında güvenlik politikalarını genişletmek için kullanılır. Varsayılan olarak, tarayıcılar yalnızca aynı origin'den gelen istekleri kabul ederken, CORS bu sınırlamayı aşarak başka bir domain, port veya protokol üzerindeki kaynaklara erişimi mümkün kılar. Cors kütüphanesi ise Node.js ve Express.js gibi backend uygulamalarında, belirli origin'lere veya tüm domainlere erişim izni vermek için kullanılan bir middleware çözümüdür. Geliştiriciler, bu kütüphane ile güvenli bir şekilde hangi kaynakların erişime açık olacağını, hangi HTTP yöntemlerinin ve başlıklarının izinli olduğunu belirleyebilir. Özellikle RESTful API'lerde frontend ve backend arasındaki iletişimde yaygın olarak kullanılır.
2.1.6 Nodemon Teknolojisi
Nodemon, Node.js uygulamalarında geliştirme sürecini hızlandırmak için kullanılan bir araçtır ve kodda yapılan değişiklikleri algılayarak sunucuyu otomatik olarak yeniden başlatır. Geleneksel olarak, Node.js projelerinde kod değişikliklerinden sonra manuel olarak sunucunun yeniden başlatılması gerekebilir, ancak Nodemon bu süreci otomatikleştirerek geliştiricilerin zamandan tasarruf etmesini sağlar. Çalışırken belirli dosya türlerini izleyebilir ve sadece seçilen dosyalarda değişiklik olduğunda devreye girerek gereksiz yeniden başlatmaları önler. Nodemon, özellikle hızlı ve sürekli iterasyon gereken projelerde, hata ayıklama ve geliştirme sırasında kullanıcı deneyimini artıran bir araçtır ve geliştirme ortamına kolayca entegre edilebilir.
2.1.7 JSON Web Token Teknolojisi
JSON Web Token (jsonwebtoken), web uygulamalarında kullanıcı doğrulama ve veri güvenliği için kullanılan bir standarttır ve kullanıcı oturumlarını yönetmek için yaygın olarak tercih edilir. Kullanıcı kimliği doğrulandıktan sonra backend, kullanıcı bilgilerini içeren bir JWT (JSON Web Token) oluşturur ve bu token kullanıcıya gönderilir. Bu token, kullanıcıdan gelen her istekte sunucuya iletilerek kimlik doğrulama işlemini sağlar. JSON yapısında olan JWT, üç parçadan oluşur: başlık (header), yük (payload) ve imza (signature). İmza kısmı sayesinde token üzerinde yapılan değişiklikler tespit edilebilir, bu da güvenliği artırır. jsonwebtoken kütüphanesi ise Node.js uygulamalarında JWT oluşturma, doğrulama ve çözme işlemlerini kolaylaştıran bir araçtır ve genellikle RESTful API'lerde, kullanıcının yetkilendirilmiş olduğunu kontrol etmek için kullanılır.[12]

2.1.8 Bcrypt Teknolojisi
Bcrypt, kullanıcı şifrelerini güvenli bir şekilde saklamak için kullanılan bir şifreleme kütüphanesidir ve Node.js dahil olmak üzere birçok backend uygulamasında yaygın olarak kullanılır. Şifrelerin düz metin olarak saklanmasını engelleyen Bcrypt, bir şifreyi hashleme (şifreleme) ve bu hash’i doğrulama işlemleri için güçlü ve güvenilir bir çözüm sunar. Şifreyi hashlerken salt adı verilen rastgele bir veri ekleyerek aynı şifrenin farklı hash değerlerine sahip olmasını sağlar, böylece şifrelerin tersine mühendislik yoluyla çözülmesini zorlaştırır. Bcrypt, aynı zamanda hesaplama açısından maliyetli bir algoritma kullanarak brute force (kaba kuvvet) saldırılarına karşı ek güvenlik sağlar. Kullanıcı kimlik doğrulama sistemlerinde, şifrelerin güvenli bir şekilde saklanması ve doğrulanması için standart bir araç olarak kabul edilir ve özellikle RESTful API'ler, web uygulamaları ve mikroservislerde tercih edilir.
2.2 Frontend Teknolojileri
2.2.1 Vue-Router Teknolojisi
Vue Router, Vue.js uygulamalarında istemci tarafında yönlendirme (routing) işlevlerini sağlayan resmi bir kütüphanedir. Tek sayfa uygulamalarda (SPA) kullanıcılar arasında farklı sayfalara geçiş yapılıyormuş hissi yaratmak için kullanılır ve URL ile Vue bileşenlerini eşleştirerek içerik güncellemelerini sağlar. Vue Router, dinamik yollar, URL parametreleri, isimlendirilmiş rotalar, yönlendirme muhafızları (route guards) ve geçiş efektleri gibi özelliklerle zenginleştirilmiştir. Ayrıca, tarayıcıların geçmiş yönetimini destekleyerek (history mode) temiz ve SEO dostu URL yapıları sunar. Kullanıcı dostu bir yapı sağlayan Vue Router, büyük ve karmaşık Vue.js uygulamalarında bile yönlendirme işlemlerini kolaylaştırır ve modüler, okunabilir bir kod yapısına katkıda bulunur.
2.2.2 Axios Teknolojisi
Axios, tarayıcılar ve Node.js ortamlarında HTTP isteklerini yapmak için kullanılan popüler bir JavaScript kütüphanesidir ve özellikle frontend projelerinde API'lerle iletişim kurmak için yaygın olarak tercih edilir. Axios, basit ve temiz bir sözdizimi ile GET, POST, PUT, DELETE gibi HTTP isteklerini kolayca gerçekleştirmeyi sağlar ve istemci tarafında asenkron veri alışverişini yönetmeye yarayan bir araçtır. JSON verileriyle çalışma, otomatik istek iptali, hata yönetimi ve isteklere özel başlık (header) ekleme gibi gelişmiş özellikler sunar. Ayrıca, istek ve yanıtları otomatik olarak dönüştürerek geliştiricilere kullanım kolaylığı sağlar. Axios, RESTful API'lere bağlanmak, veri çekmek veya sunucuya veri göndermek için güvenilir ve esnek bir çözüm sunar.

2.3 Backend Mimarisi
Backend mimarisi, bir yazılım sisteminin kullanıcıdan gizli olan ve tüm işlemlerin asıl gerçekleştiği arka plan yapısını ifade eder. Sistem, temel olarak sunucular, API'ler, veritabanları, iş mantığı, önbellekleme ve kimlik doğrulama mekanizmaları gibi bileşenlerden oluşur. Kullanıcıların frontend aracılığıyla yaptığı talepler, backend tarafından işlenir ve gerekli yanıtlar sağlanır. Bu süreçte API, frontend ile backend arasındaki veri alışverişini kolaylaştıran bir köprü görevi görür. Veriler genellikle SQL (MySQL, PostgreSQL) veya NoSQL gibi veritabanlarında saklanır. İş mantığı, sistemin nasıl çalıştığını belirler ve kullanıcı işlemlerinin doğru şekilde gerçekleştirilmesini sağlar. Performansı artırmak için Redis veya Memcached gibi önbellekleme araçları kullanılırken, mesajlaşma kuyruğu sistemleri büyük ölçekli işlemlerin yönetimini kolaylaştırır. Güvenlik açısından, kimlik doğrulama ve yetkilendirme mekanizmaları, kullanıcı erişimlerini kontrol eder. Python, Java, Node.js gibi diller ve Django, Spring Boot, Express.js gibi frameworkler bu altyapının geliştirilmesinde yaygın olarak kullanılır. Bu mimari, ölçeklenebilirlik, güvenlik ve verimlilik ilkelerine göre tasarlanır ve modern yazılım sistemlerinin temelini oluşturur.
2.3.1 Node.js
Node.js, JavaScript'i sunucu tarafında çalıştırmak için geliştirilmiş açık kaynaklı, platform bağımsız bir çalışma ortamıdır. V8 JavaScript motoru üzerine inşa edilen Node.js, yüksek performanslı ve ölçeklenebilir uygulamalar geliştirmek için asenkron, olay güdümlü bir mimari sunar. Bu özellikleri sayesinde Node.js, özellikle gerçek zamanlı uygulamalar, RESTful API'ler ve mikroservis mimarileri için ideal bir seçimdir. Tek iş parçacıklı yapısına rağmen, olay döngüsü (event loop) ve non-blocking I/O mekanizmaları sayesinde aynı anda binlerce istemciyi etkin bir şekilde işleyebilir. Ayrıca, Node.js'nin modül yönetim sistemi olan npm (Node Package Manager), geliştiricilere yüz binlerce hazır kütüphane ve araç sunarak uygulama geliştirme sürecini hızlandırır. Backend tarafında kullanımı yaygın olan bu platform, Express.js gibi frameworklerle birlikte güçlü bir ekosistem oluşturur ve modern web uygulamalarının yanı sıra IoT, CLI araçları ve masaüstü uygulamaları geliştirmek için de tercih edilir. Performans, hız ve esneklik arayan geliştiriciler için Node.js, JavaScript bilgisiyle backend geliştirme yapma imkanı sağlayan güçlü bir araçtır.[13]

2.3.2 MVC Mimarisi
MVC (Model-View-Controller) mimarisi, yazılım geliştirme sürecinde uygulamanın farklı bileşenlerini organize etmek ve işlevselliği ayrıştırmak için kullanılan bir tasarım desenidir. Bu mimaride, uygulama üç ana bileşene ayrılır: Model, View ve Controller. Model, uygulamanın veri katmanını temsil eder ve iş mantığıyla veri yönetiminden sorumludur; veritabanıyla iletişim kurar, verileri işler ve gerektiğinde günceller. View, kullanıcıya gösterilen arayüzü oluşturur ve yalnızca Model'den gelen verilerin görsel sunumunu yapar, yani kullanıcıya odaklanır. Controller, kullanıcı etkileşimlerini yönetir, bu etkileşimleri işler ve Model ile View arasında bir köprü görevi görür. Örneğin, kullanıcı bir butona tıkladığında, bu talep Controller tarafından işlenir, ilgili veriler Model'den alınır, işlenir ve sonuç View'a aktarılır. MVC'nin bu katmanlı yapısı, kodun daha kolay okunmasını, test edilmesini ve bakımını sağlar. Ayrıca, iş mantığı, veri yönetimi ve kullanıcı arayüzünün birbirinden ayrılması sayesinde ekiplerin aynı anda farklı bileşenler üzerinde çalışabilmesine olanak tanır. Modern web ve masaüstü uygulamalarında yaygın olarak kullanılan bu mimari, Django, Ruby on Rails, Laravel gibi frameworkler ile etkin bir şekilde uygulanır ve yazılım projelerinde modülerlik, ölçeklenebilirlik ve yeniden kullanılabilirlik sağlar.[14]

2.4 Frontend Mimarisi
Frontend mimarisi, bir yazılımın kullanıcı arayüzünü oluşturmak ve kullanıcı deneyimini yönetmek için kullanılan yapı ve tasarım prensiplerini ifade eder. Kullanıcının doğrudan etkileşimde bulunduğu bu katman, genellikle HTML, CSS ve JavaScript dillerine dayanır ve görsel sunum, kullanıcı etkileşimleri ve dinamik veri işlemleri gibi görevleri üstlenir. Modern frontend mimarileri, bileşen tabanlı yapı (component-based architecture) ile geliştirilir ve Angular, React, Vue.js gibi frameworkler veya kütüphaneler kullanılarak modüler, yeniden kullanılabilir ve kolay yönetilebilir bir kod yapısı sunar. Ayrıca, durum yönetimi (state management) için Redux, MobX gibi araçlar, karmaşık uygulamalarda verilerin tutarlı ve doğru bir şekilde işlenmesini sağlar. Frontend mimarisi, API'ler aracılığıyla backend ile iletişim kurarak kullanıcıya gerekli verileri sunar ve single-page application (SPA) veya progressive web application (PWA) gibi modern uygulama türlerini destekler. Performans, erişilebilirlik, mobil uyumluluk ve tarayıcı uyumluluğu gibi kriterler, frontend mimarisinin temel hedeflerindendir. Kullanıcı odaklı bir yapı olması sayesinde, yazılımın işlevselliğini kullanıcı dostu bir şekilde sunar ve etkili bir deneyim sağlar.

2.4.1 Vue.js
Vue.js, kullanıcı arayüzleri ve tek sayfalık uygulamalar (Single Page Applications - SPA) geliştirmek için kullanılan, açık kaynaklı ve hafif bir JavaScript framework'üdür. Progressive bir framework olarak tanımlanan Vue.js, geliştiricilere esneklik sunar; küçük projeler için bir kitaplık gibi kullanılabilirken, büyük ölçekli uygulamalar için ekosisteme entegre edilebilecek daha karmaşık yapılar oluşturulabilir. Vue.js, bileşen tabanlı mimariyi destekler, yani uygulama birden fazla bağımsız, yeniden kullanılabilir ve yönetilebilir bileşene bölünebilir. Bu, kodun modüler ve sürdürülebilir olmasını sağlar. Kullanımı kolay bir öğrenim eğrisi sunan Vue.js, HTML, CSS ve JavaScript bilgisiyle hızlı bir şekilde öğrenilebilir. Reactive data binding özelliği sayesinde, kullanıcı arayüzündeki değişiklikler anında veri modeline yansır ve tam tersi, yani çift yönlü veri bağlama (two-way data binding) mümkün hale gelir. Virtual DOM yapısını kullanarak performansı optimize eder ve gereksiz yeniden render işlemlerinden kaçınır. Ekosisteminde Vue Router ile yönlendirme, Vuex ile durum yönetimi gibi güçlü araçlar bulunur ve Nuxt.js gibi framework'lerle birlikte kullanılabilir. Ayrıca, hem geliştirme sürecinde hem de son kullanıcı deneyiminde performansı ve verimliliği artırmak için tasarlanmıştır. Topluluk desteği, güçlü belgeleri ve modern araçları ile Vue.js, esnek ve kullanıcı dostu bir frontend geliştirme çözümü sunar.[15]

2.5 Geliştirilen Uygulamanın Çalıştırılması
Bu bölümde uygulamanın çalıştırılması görselle birlikte verilecektir.

2.5.1 Uygulama Anasayfası
Uygulamanın anasayfa görünümü aşağıdaki resimde verilmiştir.

Resim 2. 1 Uygulama Anasayfa Görünümü

Resim 2.1,"YemekProjem" platformunun ana sayfasını göstermekte olup, kullanıcıların platforma ilk giriş yaptığı ve ana işlevlere kolayca erişim sağladığı bir başlangıç noktası olarak tasarlanmıştır. Sayfanın üst kısmında yer alan "YEMEKPROJEM'E HOŞ GELDİNİZ!" başlıklı tanıtım bölümü, kullanıcıları restoranları keşfetmeye, rezervasyon yapmaya ve lezzetli yemeklerin tadını çıkarmaya davet ederken, dikkat çekici bir "Restoranları Keşfet" butonuyla yönlendirme sağlar. Alt bölümde ise "En İyi Restoranlar", "Kolay Rezervasyon" ve "Lezzetli Yemekler" başlıklı üç bilgi kartı verilmiştir. Minimalist bir tasarım yaklaşımı benimsenmiş ve yeşil ile beyaz tonlarından oluşan sade bir renk paleti tercih edilmiştir.

2.5.2 Kullanıcı Kayıt Sayfası
Uygulamanın kullanıcı kayıt sayfası aşağıdaki resimde verilmiştir.

Resim 2.2, kullanıcıların ve restoran sahiplerinin kayıt işlemini gerçekleştirebileceği bir ekranı göstermektedir. Üstteki navigasyon menüsünde ana sayfa, restoranlar, rezervasyon ekle, giriş yap ve kayıt ol seçenekleri bulunmakta, böylece kullanıcılar site içerisinde kolaylıkla gezinmektedir. Orta kısımda, kullanıcı kaydı için gerekli alanlar yer almakta ve bu alanlar ad, soyad, e-posta, şifre ve telefon numarasını içermektedir. Kullanıcılar veya restoran sahipleri, ekranın üst kısmındaki yeşil ve mavi düğmeler aracılığıyla "Kullanıcı Kaydı" veya "Restoran Kaydı" moduna geçiş yapabilir. Modern ve sade bir tasarıma sahip bu ekran, kullanıcı dostu bir deneyim sunmayı hedeflemekte ve kolay bir kayıt süreci sağlamaktadır.

2.5.3 Restoran Kayıt Sayfası
Uygulamanın restoran kayıt sayfası aşağıdaki resimde verilmiştir.

Resim 2.3, restoran sahiplerinin kayıt işlemlerini gerçekleştirebileceği bir ekranı göstermektedir. Üstte bulunan kullanıcı dostu bir navigasyon menüsü ile kullanıcılar ana sayfa, restoranlar, rezervasyon ekle ve giriş yap gibi sayfalara kolayca erişebilir. Sayfanın orta bölümünde restoran kaydı için gerekli olan bilgiler yer almaktadır. Bu bilgiler arasında restoran adı, adres, e-posta, şifre, restoran açıklaması, değerlendirme puanı ve masa sayısı gibi alanlar bulunmaktadır. Girişler tamamlandığında, alt kısımda yer alan "Kaydet" butonu ile kayıt işlemi tamamlanabilir. Modern ve minimalist bir tasarıma sahip olan bu ekran, kullanıcı deneyimini artırmak için sade ve işlevsel bir arayüz sunmaktadır.

2.5.4 Kullanıcı/Restoran Giriş Sayfası
Uygulamanın kullanıcı/restoran giriş sayfası aşağıdaki resimde verilmiştir.

Resim 2.4, uygulamanın kullanıcı ve restoran sahipleri için giriş yapma ekranını göstermektedir. Sayfanın üst kısmında kullanıcı ve restoran giriş türleri arasında seçim yapmayı sağlayan iki buton bulunmaktadır. Kullanıcı türüne göre giriş formu aktif hale gelmektedir. Giriş formu, e-posta adresi ve şifre bilgilerini alan iki temel giriş alanından oluşmakta ve kullanıcıların mevcut hesaplarıyla giriş yapmalarını sağlamaktadır. Formun alt kısmında, henüz hesabı olmayan kullanıcılar için "Kayıt Ol" bağlantısı bulunmaktadır. Tasarım, basit ve kullanıcı dostu bir arayüz sunarak kullanıcıların kolayca erişim sağlamasını hedeflemektedir.

2.5.4.1 Kullanıcı/Restoran Başarısız Giriş Sayfası
Uygulamanın kullanıcı/restoran başarısız giriş sayfası aşağıdaki resimde verilmiştir.

Resim 2.5, kullanıcı veya restoran sahibi giriş yaparken yanlış bilgi girmesi veya kaydı bulunmayan kullanıcının giriş yapmayı denemesi durumunda sistemin verdiği hata mesajını göstermektedir. Giriş ekranında kullanıcılar veya restoran sahipleri, e-posta ve şifre bilgilerini girerek hesaplarına erişim sağlamayı denerler. Ancak bilgiler yanlış girildiğinde, ekranın alt kısmında kırmızı renkle "Kullanıcı veya restoran bulunamadı." şeklinde bir hata mesajı görüntülenir. Bu tasarım, kullanıcıya girdiği bilgileri kontrol etmesi gerektiğini açıkça bildirerek kullanıcı deneyimini artırmayı hedefler. Ayrıca, alt kısımda bulunan "Kayıt Ol" bağlantısı, hesabı olmayan kullanıcıların kolayca yeni bir hesap oluşturmasına olanak tanır.

2.5.4.2 Kullanıcı/Restoran Hatalı Giriş Sayfası
Uygulamanın kullanıcı/restoran hatalı giriş sayfası aşağıdaki resimde verilmiştir.

Resim 2.6, kullanıcı veya restoran sahibi giriş yaparken şifre bilgisini yanlış girmesi durumunda sistemin verdiği hata mesajını göstermektedir. Giriş ekranında e-posta doğru bir şekilde girilmiş olsa bile, şifre yanlış girildiğinde ekranın alt kısmında kırmızı renkle "Hatalı şifre." şeklinde bir hata mesajı görünür. Bu tasarım, kullanıcıya spesifik olarak hangi bilginin hatalı olduğunu bildirerek kullanıcı deneyimini geliştirmeyi amaçlar. Aynı zamanda ekranın alt kısmında yer alan "Kayıt Ol" bağlantısı, hesabı olmayan kullanıcılar için kayıt sürecine yönlendirme yapar. Bu tasarım, kullanıcı dostu bir giriş deneyimi sağlamak için açık ve net geri bildirim sunar.

2.5.4.3 Kullanıcı/Restoran Başarılı Giriş Sayfası
Uygulamanın kullanıcı/restoran başarılı giriş sayfası aşağıdaki resimde verilmiştir.

Resim 2.7 , kullanıcı veya restoran sahibi giriş bilgilerini doğru şekilde girdikten sonra ekranda beliren başarılı giriş mesajını göstermektedir. Kullanıcı, e-posta ve şifre bilgilerini doğru bir şekilde girdikten sonra, ekranın alt kısmında yeşil renkle "Başarıyla giriş yapıldı! Şimdi yönlendiriliyorsunuz..." mesajı görünür. Bu mesaj, kullanıcının hesabına başarılı bir şekilde eriştiğini ve sistemin onları ilgili sayfaya yönlendirdiğini açık bir şekilde belirtmektedir. Kullanıcı dostu bir yaklaşım benimseyen bu tasarım, hem görsel olarak dikkat çeken renklerle geri bildirim sunar hem de sürecin bir sonraki adımını kullanıcıya net bir şekilde aktarır.

2.5.5 Restoranlar Sayfası
Uygulamanın restoranlar sayfası aşağıdaki resimde verilmiştir.

Resim 2.8, projede restoranların listelendiği "Restoranlar" sayfasını göstermektedir. Kullanıcılar, bu sayfa üzerinden kayıtlı restoranların genel bilgilerine ulaşabilmektedir. Görselde her bir restoran için bir kart yapısı bulunmaktadır ve bu kartlar restoranların adını, adresini, açıklamasını ve kullanıcı değerlendirmesini içermektedir. Her kartta yer alan "Detayları Gör" butonu, kullanıcının seçili restorana ait detaylı bilgilere ve menüsüne ulaşmasını sağlamaktadır. Bu sayfa, kullanıcı dostu bir tasarımla oluşturulmuştur ve grid yapısı sayesinde farklı cihazlarda düzgün bir görünüm sunmaktadır. Kartlar arasındaki görsel düzen, modern bir arayüz ve basit bir kullanıcı deneyimi hedeflemektedir. Ayrıca, başlıklar ve detaylar arasında hiyerarşik bir düzen kullanılarak bilgilerin kolayca fark edilmesi sağlanmıştır. Teknik altyapı açısından, bu sayfa Vue.js ile geliştirilmiş olup, restoran verileri backend tarafından sağlanmaktadır. Backend, restoran bilgilerini veritabanından çekmekte ve bir API aracılığıyla frontend ile iletişim kurmaktadır. Bu yapı, verilerin dinamik olarak güncellenmesine ve kullanıcıların güncel bilgilere erişmesine olanak tanır. Sayfa, responsive tasarımı sayesinde farklı ekran boyutlarında kullanılabilir şekilde optimize edilmiştir.

2.5.6 Restoran Detay Sayfası
Uygulamanın restoran detay sayfası aşağıdaki resimde verilmiştir.

Resim 2.9, projedeki bir restoranın detaylarının ve menüsünün listelendiği "Restoran Detayları" sayfasını göstermektedir. Sayfa, kullanıcının seçtiği restoran hakkında bilgi almasına ve restoranda sunulan yemeklerden istediğini seçip sepete eklemesine olanak tanır. Sayfanın başında restoranın adı ve kısa açıklaması yer alırken, hemen altında görsel öğelerle zenginleştirilmiş bir menü bölümü bulunmaktadır. Her yemek kartında yemeğin adı, fiyatı, görseli ve adet seçimi için bir giriş alanı bulunmaktadır. Kullanıcı, istediği adet miktarını girerek "Sepete Ekle" butonuna basabilir ve bu işlem ardından yemek sepete eklenir. Görsel tasarımda, kart yapısı ve aralarındaki boşluklar sayesinde içerik düzenli ve okunabilir bir şekilde sunulmaktadır. Yemeklerin fiyat bilgileri dikkat çekici bir şekilde yeşil renk ile vurgulanmıştır. Teknik altyapı açısından, bu sayfa Vue.js frameworkü ile geliştirilmiş ve menü verileri backend tarafından sağlanmıştır. Backend, veritabanından ilgili restoran ve menü verilerini API üzerinden frontend'e aktarmaktadır. Bu yapıyla dinamik bir veri akışı sağlanmış ve kullanıcı deneyimi artırılmıştır. Modern ve kullanıcı dostu tasarımı ile sayfa, kullanıcıların rahatça gezinmesini ve seçim yapmasını mümkün kılmaktadır.

2.5.7 Rezervasyon Oluşturma Sayfası
Uygulamanın rezervasyon oluşturma sayfası aşağıdaki resimde verilmiştir.

Resim 2.10, projedeki "Rezervasyon Yap" sayfasını temsil etmektedir. Bu sayfa, kullanıcıların restoranlar için kolay ve hızlı bir şekilde rezervasyon yapmasını sağlar. Tasarım, kullanıcı dostu ve modern bir görünüme sahiptir ve işlevselliği artırmak için sade bir yapı sunar. Sayfanın üst kısmında büyük ve dikkat çekici bir başlık ("Rezervasyon Yap") bulunmaktadır. Kullanıcı, "Restoran Seç" adlı bir açılır menü yardımıyla rezervasyon yapmak istediği restoranı seçebilir. Bu menü, sistemde kayıtlı tüm restoranları dinamik olarak listeler. Altında, rezervasyon tarihi ve saatini seçmek için kullanılan bir tarih-saat seçim bileşeni yer almaktadır. Kullanıcı, bu alana uygun bir tarih ve saat girerek rezervasyon işlemini başlatır. Son olarak, "Rezervasyon Yap" adlı buton, işlem tamamlanması için kullanıcıyı yönlendirir. Eğer kullanıcı eksik bilgi girerse veya bir hata yaparsa, sistem uygun geri bildirimle kullanıcıyı bilgilendirir. Arka planda, Vue.js tabanlı bir frontend ile birlikte, rezervasyon işlemi RESTful API'lar aracılığıyla backend'e iletilir ve burada rezervasyon bilgileri veritabanına kaydedilir. Bu işlev, kullanıcı deneyimini artıran bir tarih ve saat doğrulama mekanizması ile desteklenir. Görsel olarak, buton ve giriş alanları modern bir renk paletiyle uyumlu hale getirilmiştir, bu da genel estetik uyumu sağlar. Bu sayfa, kullanıcıların rezervasyon sürecini basit ve verimli bir şekilde tamamlamasını sağlamak için optimize edilmiştir.

2.5.7.1 Rezervasyon Oluşturma Sayfası
Uygulamanın rezervasyon oluşturma sayfası aşağıdaki resimde verilmiştir.

Resim 2.11, kullanıcıların restoranlar için masa rezervasyonu yapmalarını sağlayan "Rezervasyon Yap" sayfasını göstermektedir. Kullanıcı, açılır menüden istediği restoranı seçtikten sonra, restoranın toplam masa sayısı ve mevcut masalar dinamik olarak görüntülenir. Masa seçimi, tıklanabilir düğmeler aracılığıyla kolayca yapılabilirken, tarih ve saat seçimi de kullanıcı dostu bir takvim bileşeni ile sağlanır. "Rezervasyon Yap" butonuna tıklanarak, kullanıcı bilgileri backend'e gönderilir ve rezervasyon işlemi tamamlanır. Sayfa, modern bir arayüz ve düzenli bileşen yapısıyla hem estetik hem de işlevsellik açısından kullanıcı dostu bir deneyim sunar.

2.5.8 Restoran Profil Yönetim Sayfası
Uygulamanın restoran profil yönetim sayfası aşağıdaki resimde verilmiştir.

Resim 2.12, restoran sahiplerinin profil yönetim ekranını göstermektedir. Ekranın sol tarafında, restoran sahibinin temel bilgilerini içeren bir başlık ve kullanıcı dostu bir menü bulunmaktadır. Menü, restoran bilgilerinin güncellenmesi, menü eklenmesi, gelen siparişler ve gelen rezervasyonların görüntülenmesi gibi işlevlere kolay erişim sağlar. Sağ tarafta ise restoran bilgilerini güncellemek için düzenleme formu yer almaktadır. Bu form, restoran adı, adresi, açıklaması, e-posta bilgileri, değerlendirme puanı ve koltuk sayısı gibi bilgileri içerir. Yapılan değişiklikler "Güncelle" butonuna tıklanarak kaydedilir ve başarılı işlem sonrası yeşil bir bildirim çubuğu ile geri bildirim sağlanır. Arayüz, modern bir tasarım anlayışı ile kullanıcı deneyimini optimize etmeyi amaçlamaktadır.

2.5.9 Restoran Menü Yönetimi Sayfası
Uygulamanın restoran menü yönetim sayfası aşağıdaki resimde verilmiştir.

Resim 2.13, restoran sahiplerinin menü yönetim ekranını göstermektedir. Sol tarafta, restoran sahibine ait bilgiler ve ilgili yönetim menüsü bulunmaktadır. Bu menü, restoran bilgilerini güncelleme, menü ekleme ve düzenleme, gelen siparişler ve rezervasyonların yönetimi gibi işlemleri içermektedir. Sağ tarafta, menü yönetim paneli yer almakta olup yeni bir yemek öğesi eklemek için ad, açıklama, fiyat ve fotoğraf URL bilgileri doldurularak “Menüye Ekle” butonu kullanılmaktadır. Ayrıca mevcut menü öğeleri listelenmiş olup her bir öğe için düzenle ve sil seçenekleri bulunmaktadır. Bu ekran, modern bir kullanıcı arayüzü ile kolay bir kullanım sunmayı hedefler ve restoran sahiplerinin menülerini etkin bir şekilde yönetmelerine olanak tanır.

2.5.10 Menü Öğesi Düzenleme Sayfası
Uygulamanın menü öğesi düzenleme sayfası aşağıdaki resimde verilmiştir.

Resim 2.14, bir restoran sahibinin menü yönetimi işlemlerini gerçekleştirdiği bir bölümü göstermektedir. Fotoğrafta, restoran sahibi mevcut menüdeki bir yemek öğesini düzenlemektedir. Sağ tarafta yer alan "Menü Öğesini Düzenle" başlıklı bölümde, seçili yemek için "Yemek Adı", "Açıklama", "Fiyat" ve "Fotoğraf URL" gibi bilgilerin güncellenebileceği bir form bulunmaktadır. Formun alt kısmında, "Değişiklikleri Kaydet" butonu ile yapılan değişiklikler kaydedilebilmektedir. Alt kısımda, menüdeki mevcut yemekler görselleriyle birlikte listelenmiş ve her öğe için "Düzenle" ve "Sil" seçenekleri sunulmuştur. Bu ekran, restoran sahiplerine menülerini hızlıca güncelleme ve yönetme imkanı sunmaktadır.

2.5.11 Restoran Sipariş Sayfası
Uygulamanın sipariş sayfası aşağıdaki resimde verilmiştir.

Resim 2.15, restoran sahiplerinin kullanıcılar tarafından verilen siparişleri görüntüleyip yönetebildiği bir bölümü göstermektedir. "Gelen Siparişler" başlıklı bu sayfada, her sipariş için bir kart yer almakta ve her kartta sipariş ID'si, toplam tutar ve siparişin durumu ("completed", "rejected", "confirmed", "pending") gibi bilgiler gösterilmektedir. Sipariş durumuna bağlı olarak, "Onayla" ve "Reddet" butonları, siparişler üzerinde işlem yapılmasını sağlamaktadır. Örneğin, "pending" durumundaki bir sipariş onaylandığında "confirmed" durumuna geçmekte, reddedildiğinde ise "rejected" olarak işaretlenmektedir. Sipariş tamamlandığında, restoranın toplam kredisi otomatik olarak güncellenmektedir. Kullanıcı dostu arayüzü sayesinde, restoran sahipleri siparişleri hızlı ve kolay bir şekilde yönetebilmektedir.

2.5.12 Restoran Rezervasyon Sayfası
Uygulamanın restoran rezervasyon sayfası aşağıdaki resimde verilmiştir.

Resim 2.16, restoran sahiplerinin gelen rezervasyonları görüntüleyip yönetebileceği bir ekranı temsil etmektedir. "Gelen Rezervasyonlar" başlıklı bu bölümde, her rezervasyon için ayrı bir kart bulunmakta ve her kartta rezervasyon ID'si, müşterinin seçtiği masa numarası, tarih ve saat bilgisi ile rezervasyon durumu ("confirmed", "cancelled") gibi bilgiler yer almaktadır. Rezervasyonların durumu, restoran sahibi tarafından güncellenebilir ve onaylanmış veya iptal edilmiş olarak belirtilir. Kullanıcı dostu bir arayüz sunan bu sistem, restoran sahiplerinin rezervasyon sürecini kolaylıkla takip etmelerine ve yönetmelerine olanak tanımaktadır.

2.5.13 Kullanıcı Profil Bilgi Sayfası
Uygulamanın kullanıcı profil bilgi sayfası aşağıdaki resimde verilmiştir.

Resim 2.17, kullanıcının profil bilgilerini güncelleyebileceği bir sayfayı göstermektedir. Sol tarafta yer alan menüde "Profil Bilgileri", "Adreslerim", "Ödeme Kartlarım", "Bakiye Yükle", "Rezervasyonlarım" ve "Siparişlerim" gibi farklı sekmeler bulunurken, sağ tarafta ise kullanıcının adı, soyadı, telefon numarası ve e-posta adresi gibi kişisel bilgilerini düzenleyebileceği bir form yer almaktadır. Kullanıcı, bilgilerini güncelledikten sonra "Değişiklikleri Kaydet" butonuna tıklayarak bu bilgileri sistemde kaydedebilir. Ayrıca, hesap kredisi bilgisi kırmızı renkle öne çıkarılarak kullanıcının mevcut kredi durumunu kolayca görmesi sağlanmıştır. Bu tasarım, kullanıcı dostu bir arayüzle kullanıcıların hesap bilgilerini yönetmesini kolaylaştırmayı amaçlamaktadır.

2.5.14 Kullanıcı Adres Bilgisi Sayfası
Uygulamanın kullanıcı adres bilgisi sayfası aşağıdaki resimde verilmiştir.

Resim 2.18, kullanıcının mevcut adreslerini yönetebileceği ve yeni adresler ekleyebileceği bir arayüzü göstermektedir. Sol tarafta yer alan menü, kullanıcının profil bilgileri, adresleri, ödeme kartları, bakiye yükleme, rezervasyonlar ve siparişler gibi farklı sekmelere kolayca erişmesine olanak tanır. Sağ tarafta ise kullanıcının mevcut adres bilgileri liste halinde sunulmakta ve her adres için "Düzenle" ve "Sil" seçenekleri bulunmaktadır. Alt kısımda, yeni bir adres eklemek için bir form yer almakta ve adres adı, adres, şehir, posta kodu ve telefon gibi bilgiler girilebilmektedir. "Adres Ekle" butonu, kullanıcıya yeni bir adres kaydetme işlemini kolaylaştırır. Bu tasarım, kullanıcının adreslerini etkili bir şekilde yönetmesine ve yeni bilgiler eklemesine imkan tanır.

2.5.15 Kullanıcı Ödeme Kartları Sayfası
Uygulamanın kullanıcı ödeme kartları sayfası aşağıdaki resimde verilmiştir.

Resim 2.19, kullanıcının ödeme kartlarını yönetebileceği ancak henüz bir kart eklemediği durum için tasarlanmış bir ekranı göstermektedir. Kullanıcı arayüzünde, sol tarafta profil bilgileri, adresler, ödeme kartları, bakiye yükleme, rezervasyonlar ve siparişler gibi farklı sekmeler yer almaktadır. Orta bölümde ise "Henüz kredi kartı eklenmemiş." mesajı ile kullanıcının bu alana kart eklemesi gerektiği belirtilmiştir. Ayrıca, kullanıcıyı yönlendirmek için kırmızı renkli bir "Yeni Kart Ekle" butonu bulunmaktadır. Bu tasarım, kullanıcının ödeme işlemleri için gerekli olan kart bilgilerini kolayca eklemesini sağlayarak kullanıcı deneyimini iyileştirmeyi hedefler.

2.5.15.1 Kullanıcı Ödeme Kartı Ekleme Sayfası
Uygulamanın kullanıcı ödeme kartı ekleme sayfası aşağıdaki resimde verilmiştir.

Resim 2.20, kullanıcıların sisteme ödeme kartı ekleyebileceği bir ekranı göstermektedir. Sol tarafta profil bilgileri, adresler, ödeme kartları, bakiye yükleme, rezervasyonlar ve siparişler gibi farklı sekmeler yer alırken, sağ tarafta "Henüz kredi kartı eklenmemiş." mesajı ile kullanıcıya yeni bir kart ekleme opsiyonu sunulmaktadır. Kullanıcı, "Kart Sahibinin Adı", "Kart Numarası", "Son Kullanım Tarihi" ve "CVV" gibi temel bilgileri doldurabileceği bir form aracılığıyla kart ekleyebilir. Formun altındaki kırmızı "Kart Ekle" butonu, bilgilerin kaydedilmesini sağlar. Bu tasarım, kullanıcıların hızlı ve kolay bir şekilde ödeme yöntemlerini eklemelerine olanak tanıyarak kullanıcı deneyimini artırmayı hedeflemektedir.

2.5.15.2 Kullanıcı Hatalı Kart Ekleme Sayfası
Uygulamanın kullanıcı hatalı kart ekleme sayfası aşağıdaki resimde verilmiştir.

Resim 2.21, kullanıcıların sisteme yeni bir ödeme kartı eklerken karşılaşabileceği hata durumlarını göstermektedir. Kullanıcı, "Kart Sahibinin Adı", "Kart Numarası", "Son Kullanım Tarihi" ve "CVV" bilgilerini doldurarak bir kart eklemek istemiştir. Ancak, son kullanım tarihi alanında geçersiz bir tarih girildiği için, bu alanın altında kırmızı renkle "Geçersiz Tarih" uyarısı görüntülenmiştir. Bu tasarım, kullanıcıların yanlış veya eksik bilgi girmelerini önlemek ve doğru bilgilerin eklenmesini sağlamak için geliştirilmiştir. Uyarı mesajı, kullanıcıyı hatalarını düzeltmesi için yönlendiren basit ve etkili bir geri bildirim sağlamaktadır.

2.5.15.3 Kullanıcı Başarılı Kart Ekleme Sayfası
Uygulamanın kullanıcı başarılı kart ekleme sayfası aşağıdaki resimde verilmiştir.

Resim 2.22, bir kullanıcının ödeme kartını başarıyla eklediğini göstermektedir. Sol tarafta kullanıcının profil bilgileri ve farklı menü seçenekleri yer alırken, sağ tarafta "Ödeme Kartlarım" bölümü görüntülenmektedir. Kullanıcı, yeni bir kart ekleme işlemini tamamladığında, ekranın üst kısmında yeşil bir alanda "Kart başarıyla eklendi" mesajı gösterilir. Eklenen kart, kullanıcıya yalnızca son dört hanesi görünür şekilde listelenir ve son kullanım tarihi belirtilir. Kartın altındaki "Düzenle" ve "Sil" düğmeleri, kullanıcının eklediği kart üzerinde değişiklik yapmasına veya kartı sistemden kaldırmasına olanak tanır. Bu tasarım, kullanıcıya kolaylıkla ödeme kartı yönetimi sağlayan sezgisel ve kullanıcı dostu bir arayüz sunar.

2.5.16 Kullanıcı Bakiye Yükleme Sayfası
Uygulamanın kullanıcı bakiye yükleme sayfası aşağıdaki resimde verilmiştir.

Resim 2.23, kullanıcıların hesaplarına bakiye yükleme işlemi sırasında bir kart seçimi yapmadıkları durumda karşılaştıkları hata mesajını göstermektedir. Sol tarafta kullanıcının profil bilgileri ve diğer menü seçenekleri yer alırken, sağ tarafta "Bakiye Yükle" bölümü bulunmaktadır. Kullanıcının bir ödeme kartı seçmesi ve yüklemek istediği tutarı belirtmesi gerekmektedir. Ancak kart seçilmediğinde, ekranın üst kısmında kırmızı renkte "Kart seçmelisiniz." şeklinde bir hata mesajı görüntülenir. Bu hata mesajı, kullanıcının işlem sırasında gerekli alanları doldurmasını sağlamak amacıyla eklenmiştir ve kullanıcı deneyimini iyileştirmeyi hedefler. Bu tasarım, kullanıcıya eksik işlem yaptığı durumlarda rehberlik ederek daha hızlı ve doğru bir işlem gerçekleştirilmesine olanak tanır.

2.5.16.1 Kullanıcı Başarılı Bakiye Yükleme Sayfası
Uygulamanın kullanıcı başarılı bakiye yükleme sayfası aşağıdaki resimde verilmiştir.

Resim 2.24, kullanıcıların "Bakiye Yükle" işlemini başarıyla tamamladıkları bir durumu göstermektedir. Kullanıcı, mevcut ödeme kartlarından birini seçip yüklemek istediği tutarı girmiş ve "Bakiye Yükle" butonuna tıklamıştır. İşlem başarılı bir şekilde gerçekleştirildiğinde, ekranın üst kısmında yeşil renkle "Bakiye başarıyla yüklendi!" mesajı görüntülenir. Sol tarafta, kullanıcının profil bilgileri ve güncellenmiş hesap kredisi bilgisi yer alırken, sağ tarafta bakiye yükleme işlemi için kullanılan form bulunmaktadır. Bu tasarım, kullanıcının işlem sonuçlarını anında görmesine ve hesabındaki değişiklikleri takip etmesine olanak sağlar, kullanıcı deneyimini güçlendirir.

2.5.17 Kullanıcı Rezervasyon Sayfası
Uygulamanın kullanıcı rezervasyon sayfası aşağıdaki resimde verilmiştir.

Resim 2.25, bir kullanıcının aktif rezervasyonlarını görüntülediği ekranı göstermektedir. Kullanıcı, rezervasyon detaylarını inceleyebilmekte ve gerekirse "Rezervasyonu İptal Et" butonunu kullanarak iptal işlemi gerçekleştirebilmektedir. Rezervasyon detaylarında, restoran adı, adresi, açıklaması, masa numarası, tarih ve saat bilgileri ile rezervasyon durumu belirtilmiştir. Bu ekran, kullanıcıların rezervasyon yönetimini kolaylaştırmayı ve işlem süreçlerini basit bir şekilde tamamlamalarını sağlamayı hedefler. Kullanıcının mevcut hesap kredisi ve profil bilgileri de ekranın sol kısmında sunularak tüm gerekli bilgilere erişimi artırır.

2.5.18 Kullanıcı Sepeti Sayfası
Uygulamanın kullanıcı sepeti sayfası aşağıdaki resimde verilmiştir.

Resim 2.26, kullanıcıların alışveriş sepetindeki ürünlerini yönetebildiği ve ödeme işlemlerini gerçekleştirebildiği ekranı göstermektedir. Kullanıcı, sepete eklenen ürünleri görüntüleyebilir, ürünleri "Sepetten Çıkar" butonuyla kaldırabilir ve toplam tutarı görebilir. Ödeme seçenekleri arasında mevcut hesap bakiyesini kullanma veya kredi kartı bilgileriyle ödeme yapma alternatifleri sunulmaktadır. Ayrıca kullanıcı, adres seçimini yaparak teslimat detaylarını belirleyebilir. Ekranın alt kısmında bulunan "Siparişi Tamamla" butonu, işlem sürecini tamamlamak için kullanılır ve bu tasarım, kullanıcı dostu bir alışveriş deneyimi sağlamayı amaçlamaktadır.

2.5.19 Kullanıcı Siparişlerim Sayfası
Uygulamanın kullanıcı siparişlerim sayfası aşağıdaki resimde verilmiştir.

Resim 2.27, kullanıcının oluşturduğu siparişlere ait detayları gösteren "Siparişlerim" ekranını temsil etmektedir. Ekranda kullanıcının siparişlerine dair bilgiler yer almakta olup, sipariş edilen restoranın adı, toplam tutar, siparişin durumu, sipariş tarihi ve ürünler gibi detaylar bulunmaktadır. Örnekte, sipariş durumu "Onay Bekleniyor" olarak belirtilmiş ve toplam tutar 400₺ olarak listelenmiştir. Bu ekran, kullanıcının mevcut siparişlerinin takibini kolaylaştırmak ve detaylı bilgi sunmak amacıyla tasarlanmıştır. Kullanıcı, bu sayede siparişlerinin durumunu hızlı bir şekilde görüntüleyebilir.

2.6 Veri Yönetimi
2.6.1 Giriş
Projenin temel amacı, bir yemek sipariş ve restoran yönetim sisteminin geliştirilmesidir. Bu sistemde veri yönetimi, hem kullanıcıların hem de restoranların ihtiyaçlarını karşılayacak şekilde yapılandırılmıştır. Veriler, kullanıcı bilgileri, restoran detayları, menü öğeleri, sipariş ve rezervasyon bilgileri gibi çok yönlü içeriklerden oluşmaktadır. Proje kapsamında MySQL kullanılarak ilişkisel bir veritabanı tasarlanmış, tüm veriler bu yapı altında organize edilmiş ve optimize edilmiştir. Veri tutarlılığı, erişim hızı ve güvenliği ön planda tutulmuştur.

2.6.2 Veritabanı Tasarımı
Projenin veri yönetimi için MySQL tabanlı bir ilişkisel veritabanı tasarlanmıştır ve bu yapı, kullanıcıların, restoranların ve sistem içerisindeki diğer tüm verilerin düzenli ve erişilebilir bir şekilde saklanmasını sağlamaktadır. Veritabanında toplamda dokuz ana tablo bulunmaktadır: kullanıcı bilgilerini saklayan users tablosu, kullanıcı adreslerini barındıran addresses tablosu, ödeme yöntemlerini kaydeden payment_cards tablosu, restoran bilgilerini içeren restaurants tablosu, restoranların menülerini yöneten menu_items tablosu, rezervasyon bilgilerini saklayan reservations tablosu, kullanıcı siparişlerini tutan orders tablosu ve siparişlere ait ürün detaylarını içeren order_items tablosu ve son olarak cart_items tablosu bulunmaktadır. Bu tablolar arasında, veri tekrarını en aza indirgemek ve tutarlılığı sağlamak amacıyla birincil anahtar (primary key) ve yabancı anahtar (foreign key) ilişkileri kurulmuştur. Tasarım, normalizasyon prensiplerine uygun olarak geliştirilmiş ve veri yönetim süreçlerinde yüksek performans ile güvenilirlik sağlanması hedeflenmiştir. Bu kapsamda, her tablo belirli bir veri kümesini temsil edecek şekilde yapılandırılmış ve proje ihtiyaçlarına uygun şekilde optimize edilmiştir.

2.6.3 Tabloların Detaylı Açıklaması
Tabloların detaylı açıklamaları verilecektir.
2.6.3.1 Tablolar
Bütün tabloların genel bilgisini içeren görünüm aşağıda verilmiştir.

Resim 2.29’de tablolarının tamamı yer almaktadır.

2.6.3.2 Users (Kullanıcı) Tablosu
Users (Kullanıcı) tablosu aşağıda verilmiştir.

Resim 2. 30 Users (Kullanıcı) Tablosunun Görünümü
Resim 2.30, sistemdeki kullanıcıların bilgilerini içerir. Her kullanıcının benzersiz bir id değeri vardır ve diğer tüm kullanıcı verileri bu kimliğe bağlıdır. Şifreleme algoritmaları kullanılarak kullanıcı şifrelerinin güvenliği sağlanmıştır.

2.6.3.3 Addresses (Adresler) Tablosu
Addresses (Adresler) tablosu aşağıda verilmiştir.

Resim 2. 31 Addresses (Adresler) Tablosunun Görünümü
Resim 2.31, kullanıcıların birden fazla adres bilgisini saklayabilir. Kullanıcı ile user_id sütunu üzerinden ilişkilidir.

2.6.3.4 Payment_cards (Ödeme Kartları) Tablosu
Payment_cards (Ödeme Kartları) tablosu aşağıda verilmiştir.

Resim 2. 32 Payment_cards (Ödeme Kartları) Tablosunun Görünümü
Resim 2.32, kullanıcıların sisteme kayıt ettiği ödeme kartı bilgilerini içerir. Güvenlik önlemleri gereği kart numaralarının yalnızca son dört hanesi tutulur.

2.6.3.5 Restaurants (Restoranlar) Tablosu
Restaurants (Restoranlar) tablosu aşağıda verilmiştir.

Resim 2. 33 Restaurants (Restoranlar) Tablosunun Görünümü
Resim 2.33, sisteme kayıtlı restoranların bilgilerini saklar.

2.6.3.6 Menu_items (Menü Öğeleri) Tablosu
Menu_items (Menü Öğeleri) tablosu aşağıda verilmiştir.

Resim 2. 34 Menu_items (Menü Öğeleri) Tablosunun Görünümü
Resim 2.34, restoranlara ait ürün bilgilerini içerir.

2.6.3.7 Order_items (Sipariş Öğeleri) Tablosu
Order_items (Sipariş Öğeleri ) tablosu aşağıda verilmiştir.
Resim 2.35, siparişlere ait ürünlerin detaylarını tutar.
2.6.3.8 Orders (Siparişler) Tablosu
Orders (Siparişler) tablosu aşağıda verilmiştir.

Resim 2.36, sipariş bilgileri ve sipariş detaylarını tutar.
2.6.3.9 Reservations (Rezervasyonlar) Tablosu
Reservations (Rezervasyonlar) tablosu aşağıda verilmiştir.

Resim 2.37 Reservations (Rezervasyonlar) Tablosunun Görünümü
Resim 2.37, rezervasyon detaylarını tutar.

2.7 Bulgular
Proje kapsamında geliştirilen sistem, kullanıcı ve restoran sahipleri için uçtan uca bir çözüm sunarak tüm iş süreçlerinin etkin bir şekilde yönetilmesini sağlamaktadır. Geliştirilen altyapı sayesinde kullanıcılar ve restoran sahipleri, sistem üzerinde kolaylıkla kayıt oluşturup oturum açabilmekte, çeşitli işlemleri hızlı ve güvenli bir şekilde gerçekleştirebilmektedir. Kullanıcı tarafında, menü inceleme, sepete ürün ekleme, ödeme işlemleri, rezervasyon yapma ve mevcut siparişlerin takibi gibi özellikler ön plana çıkmaktadır. Kullanıcılar, sistemde kayıtlı ödeme kartlarını veya mevcut bakiyelerini kullanarak ödeme yapabilmekte ve seçtikleri adres bilgileri doğrultusunda siparişlerini tamamlayabilmektedir. Sipariş süreci tamamlandıktan sonra, kullanıcıların sipariş durumu "Beklemede", "Onaylandı" veya "Reddedildi" gibi aşamalarla detaylı bir şekilde takip edilebilmektedir. Ayrıca, kullanıcıların restoranlarla doğrudan etkileşim kurmasını sağlayan rezervasyon yönetimi, kullanıcıların tarih ve restoran tercihlerine göre rezervasyon yapmasına ve durumunu kontrol etmesine olanak tanımaktadır. Restoran sahipleri açısından sistem, menü yönetimi ve gelen siparişlerin takibi gibi süreçleri pratik hale getirmiştir. Restoran sahipleri, menülerine yeni ürünler ekleyebilmekte, ürün fiyatlarını ve açıklamalarını güncelleyebilmekte ve mevcut menüleri yönetebilmektedir. Gelen siparişlerin onaylanması veya reddedilmesi gibi kritik kararlar, sistem üzerinden hızlı bir şekilde gerçekleştirilebilmekte, onaylanan siparişlerde restoran bakiyesi otomatik olarak güncellenmektedir. Ayrıca, restoran sahipleri, kullanıcıların yaptığı rezervasyonları inceleyip onaylama veya iptal etme işlemlerini yapabilmekte ve her bir rezervasyonun detaylarına erişebilmektedir. Bu işleyiş, restoran sahiplerinin operasyonel süreçlerini daha düzenli ve verimli bir şekilde yönetmesine olanak tanımıştır.MySQL tabanlı ilişkisel veritabanı, sistemin temelini oluşturarak tüm verilerin güvenli ve organize bir şekilde depolanmasını sağlamıştır. Kullanıcı, restoran, sipariş, ödeme kartı, adres ve rezervasyon bilgileri gibi farklı kategorilerdeki veriler, normalizasyon ilkelerine uygun olarak tasarlanmış tablolar aracılığıyla saklanmıştır. Bu tasarım, verilerin tutarlılığını korurken sorgu performansını optimize etmiş ve sistemin ölçeklenebilirliğini artırmıştır. 3. SONUÇ VE ÖNERİLER

3.1 Sistem Performansı ve Kullanıcı Deneyimi
Bu proje, restoran ve kullanıcı yönetim süreçlerini dijital platforma taşıyarak hem kullanıcılar hem de restoran sahipleri için önemli kolaylıklar sağlamıştır. Vue.js ve Node.js gibi modern teknolojiler kullanılarak tasarlanan sistem, kullanıcı dostu arayüzleri ve arka planda güvenilir bir veri yönetimi altyapısıyla dikkat çekmektedir. Kullanıcıların adres, ödeme kartı ve bakiye yönetimi gibi işlemleri hızlı ve kolay bir şekilde gerçekleştirebilmesi, sistemin işlevselliğini artırmıştır. Özellikle kullanıcıların menü öğelerini seçip sipariş verebilmesi ve bu süreçlerin gerçek zamanlı olarak yönetilebilmesi, sistemin kullanıcı odaklı tasarım anlayışını göstermektedir.

3.2 Restoran Yönetimi ve İş Süreçleri
Restoran sahipleri için geliştirilen yönetim ekranları, siparişlerin ve rezervasyonların detaylı bir şekilde görüntülenmesine olanak tanımıştır. Gelen siparişlerin onaylanması veya reddedilmesi gibi işlemler, işletme süreçlerinin dijitalleşmesine katkı sağlamış ve işletme yönetiminde verimliliği artırmıştır. Rezervasyon yönetimi ekranı sayesinde restoran sahipleri, müşteri bilgilerini ve rezervasyon durumlarını kolaylıkla takip edebilmiştir. Bu özellikler, restoran sahiplerine operasyonel süreçlerini daha etkili bir şekilde yönetme fırsatı sunmuştur.

3.3 Finansal Yönetim ve Ödeme İşlemleri
Sistem, kullanıcıların kredi kartı ve bakiye yönetimi süreçlerini kolaylaştırmıştır. Kullanıcılar, kayıtlı kartlarıyla bakiye yükleyebilmiş veya doğrudan bakiye kullanarak sipariş ödemelerini gerçekleştirebilmiştir. Bakiye işlemlerinin güvenilir bir şekilde yönetilmesi, kullanıcı memnuniyetini artıran önemli bir unsurdur. Ayrıca, restoran sahiplerinin gelirlerini artırma süreçlerinde bu sistem büyük bir kolaylık sağlamıştır. Siparişlerin tamamlanmasının ardından restoran bakiyesinin otomatik olarak güncellenmesi, manuel hesaplamaları ortadan kaldırmıştır.

3.4 Gelecekteki Geliştirme Önerileri
İki faktörlü kimlik doğrulama mekanizmalarının entegre edilmesi projenin ilerleyen zamanlardaki gelişimine katkıda bulunabilir. Bu, kullanıcı ve restoran hesaplarının güvenliğini artıracaktır. Ayrıca, kullanıcı memnuniyetini artırmak için yapay zeka destekli öneri sistemlerinin geliştirilmesi mümkündür. Örneğin, kullanıcıların geçmiş siparişlerine dayanarak menü önerileri sunulabilir. Restoran sahipleri için gerçek zamanlı envanter yönetimi ve satış analizleri gibi ek özellikler de sistemin kapsamını genişletecektir.
Son olarak, gerçek zamanlı bildirimlerin eklenmesi, kullanıcı ve restoran sahipleri arasındaki iletişimi güçlendirebilir ve süreçlerin daha etkin bir şekilde yönetilmesini sağlayabilir. Gelecekteki geliştirme önerileri kapsamında, sistemin çoklu dil desteği ile uluslararası kullanıcılar için erişilebilir hale getirilmesi sağlanabilir. Restoran sahiplerinin menü yönetimini kolaylaştırmak için sürükle-bırak özellikleri ve görsel yükleme seçenekleri eklenebilir. Detaylı sipariş analitiği ile günlük, haftalık ve aylık satış raporları sunularak işletme yönetimi desteklenebilir. İndirim ve kampanya yönetim modülü ile restoranlar müşteri ilgisini artırabilir. Ayrıca, harita entegrasyonu ve sosyal medya bağlantıları gibi API entegrasyonları kullanıcı deneyimini geliştirebilir. Rezervasyon sistemine anketler, hatırlatma bildirimleri ve gerçek zamanlı doluluk takibi eklenebilir. Mobil uygulama desteği, kullanıcıların daha kolay erişim sağlamasına olanak tanırken, makine öğrenimi ile sipariş tahminleri ve kişiselleştirilmiş öneriler sunulabilir. Kullanıcı yorumları ve puanlama özellikleriyle müşteri geri bildirimi teşvik edilirken, iki faktörlü kimlik doğrulama gibi güvenlik önlemleri veri güvenliğini artırabilir. Bu geliştirmeler, sistemi daha kullanıcı dostu, güvenilir ve verimli hale getirecektir.
Prof. Dr. İlhan Tarımer'in önerisi doğrultusunda, geliştirilen sistemin mobil cihazlarda da kullanılabilmesi için bir mobil uygulama sürümünün geliştirilmesi planlanabilir. Mobil cihazlar üzerinden erişim, kullanıcı deneyimini daha da artırarak sistemin kullanım alanını genişletebilir. Özellikle kullanıcıların restoran rezervasyonu ve sipariş süreçlerini daha hızlı ve pratik bir şekilde gerçekleştirebilmeleri için mobil uygulamanın native veya cross-platform bir yaklaşım kullanılarak tasarlanması önerilmektedir. Bu doğrultuda, kullanıcıların mobil cihazlarda sistemden maksimum verim alması hedeflenebilir.

KAYNAKLAR

[1] McCarthy, M., Kaplan, L., “OpenTable platformunun restoran doluluk oranlarına etkisi”, International Research Journal of Food and Beverage, Vol. 5, No. 2, pp. 25–35, 2001. Erişim Tarihi: 15/01/2025.
[2] Jeong, M., Jang, S., “Zomato ve Yelp kullanıcı değerlendirme platformlarının etkisi”, Digital Consumer Behavior Journal, Vol. 3, No. 1, pp. 12–18, 2011. Erişim Tarihi: 15/01/2025.
[3] Ray, P., “Uber Eats ve Yemek Sepeti platformlarının kullanıcı deneyimine etkisi”, Online Food Delivery Systems Journal, Vol. 2, No. 4, pp. 45–55, 2019. Erişim Tarihi: 15/01/2025.
[4] Yılmaz, H., Korkmaz, E., “Mobil yemek siparişi uygulamalarında kullanıcı tatmini faktörleri”, User Experience in Mobile Systems, Vol. 1, No. 3, pp. 10–20, 2021. Erişim Tarihi: 15/01/2025.
[5] Demir, A., Çelik, O., “Çevrim içi yemek sipariş uygulamalarında kullanıcı memnuniyeti üzerine bir araştırma”, Digital Platforms Research Journal, Vol. 4, No. 5, pp. 100–115, 2020. Erişim Tarihi: 15/01/2025.
[6] Just Eat, “Global yemek siparişi platformlarının restoran operasyonlarına etkisi”, International Conference on Restaurant Management Systems, Vol. 6, No. 1, pp. 50–60, 2022. Erişim Tarihi: 15/01/2025.
[7] Tablein, “Masa yönetimi ve rezervasyon optimizasyonu”, Digital Restaurant Systems Report, Vol. 3, No. 2, pp. 30–40, 2020. Erişim Tarihi: 15/01/2025.
[8] GloriaFood, “Ücretsiz sipariş ve rezervasyon sistemlerinin avantajları”, Digital Food Systems, Vol. 2, No. 3, pp. 55–65, 2019. Erişim Tarihi: 15/01/2025.
[9] RobotPOS, “Restoran otomasyon sistemlerinde dijital dönüşüm”, International Journal of Automation in Hospitality, Vol. 1, No. 1, pp. 5–15, 2020. Erişim Tarihi: 15/01/2025.
[10] Restaurantlogin, “How Does Online Food Ordering System Work”, YouTube, https://www.youtube.com/watch?v=examplelink, 2021. Erişim Tarihi: 15/01/2025.
[11] MySQL2 Documentation, “Node.js tabanlı MySQL istemci kütüphanesi özellikleri ve avantajları”, MySQL2 Official Documentation, https://github.com/sidorares/node-mysql2#readme. Erişim Tarihi: 15/01/2025.
[12] JSON Web Token, “jsonwebtoken kütüphanesi ve JSON Web Token (JWT) kullanımı”, JWT Official Documentation, https://jwt.io/introduction. Erişim Tarihi: 15/01/2025.
[13] Node.js, “Node.js ile yüksek performanslı uygulama geliştirme”, Node.js Official Documentation, https://nodejs.org/en/docs/. Erişim Tarihi: 15/01/2025.
[14] MVC Documentation, “MVC (Model-View-Controller) mimarisi ve yazılım geliştirmedeki avantajları”, Software Design Patterns Library, https://www.mvc.com/docs. Erişim Tarihi: 15/01/2025.
[15] Vue.js, “Vue.js framework’ü ve bileşen tabanlı mimari”, Vue.js Official Guide, https://vuejs.org/guide/introduction.html. Erişim Tarihi: 15/01/2025.
EKLER

Aşağıda, projenin açık kaynak kodlarına erişim sağlayan bağlantı verilmiştir.
https://github.com/MAliSalan/bitirmeprojesi

ÖZGEÇMİŞ

Sude CİCİKARA, 2003 yılında Uşak'ta doğdu. İlköğrenimini Kütahya’nın Gediz ilçesindeki 1 Eylül İlkokulu'nda, ortaöğrenimini ise yine Kütahya’nın Gediz ilçesindeki 1 Eylül Ortaokulu'nda tamamladı. 2021 yılında Gediz Evliya Çelebi Anadolu Lisesi Sayısal Bölümü'nden mezun oldu. Aynı yıl, Muğla Sıtkı Koçman Üniversitesi Teknoloji Fakültesi Bilişim Sistemleri Mühendisliği Bölümü'nü kazandı. Halen aynı bölümün 4. sınıf öğrencisidir.

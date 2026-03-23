# Haftalık İlerleme Dokümanı - Dijital Gardırop

## Öğrenci Bilgileri
- **Ad Soyad:** Emine Bülbül
- **Ders:** Mobil Programlama / React Native Projesi
- **Proje Adı:** Dijital Gardırop
- **GIT Repo Linki:** https://github.com/eminebulbul/DigitalWardrobe
- **Video Linki:**  https://youtu.be/BmEYuUqrrTc
---

## 1. Hafta İlerleme Raporu

### Tamamlananlar
- React Native proje kurulumu yapıldı ve Expo ortamı hazırlandı.
- Alt sekme (tab) tabanlı Navigation yapısı kuruldu.
- Temel ekran taslakları (Ana Sayfa, Kıyafet Ekle, Koleksiyon) çalışır hale getirildi.

### Yapılan İşlemler ve Kod Yapısı
- **`App.js`:** NavigationContainer ile uygulama sarıldı, genel tema renkleri tanımlandı.
- **`AppNavigator.js`:** 3 ana sekme ve detay ekranı (Kategori Galerisi) bağlandı.
- **Ekranlar:** Ana ekranda kombin oluşturma alanı, kıyafet ekleme formu ve koleksiyon ekranı kodlandı. Kullanıcı menüler arasında sorunsuz gezinebiliyor.
- **YZ Kullanımı:** Ekran bileşenlerinin düzenli ayrılması ve navigasyon akışının hatasız kurulmasında YZ desteği alındı.

- Kıyafet kategorileri tanımlandı.
- AsyncStorage ile cihaz içi veri saklama ve rastgele (shuffle) kombin üretme özellikleri tamamlandı.

- **`AddClothingScreen.js`:** Kamera/galeri izinleri alınarak kategori, etiket ve açıklama içeren kıyafet ekleme formu oluşturuldu.
- **`storage.js`:** AsyncStorage ile kıyafet ve kombin verilerinin telefonda kalıcı olarak saklanması sağlandı.
- **`shuffle.js`:** Kategorilere göre ayrılmış kıyafetlerden rastgele parçalar seçerek kombin üreten algoritma yazıldı.
- **YZ Kullanımı:** AsyncStorage fonksiyonlarının temiz yazılması, shuffle algoritmasının optimizasyonu için YZ'den yardım alındı.

---

## Genel Değerlendirme ve Sonraki Adımlar

İlk iki haftalık süreçte proje iskeleti tamamlandı, ekranlar oluşturuldu ve verilerin cihazda tutulduğu temel akış çalışır hale getirildi. Sonraki haftalar için planlanan adımlar:

1. Eklenen kıyafetleri ve kombinleri silme/düzenleme özellikleri.
2. Arayüzde (UI/UX) kullanıcı deneyimini artıracak iyileştirmeler.
3. Gerekirse bulut senkronizasyonu için altyapı araştırması yapılması.
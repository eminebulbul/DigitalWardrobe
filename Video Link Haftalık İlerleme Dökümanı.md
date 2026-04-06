# Haftalık İlerleme Dokümanı - Dijital Gardırop

## Öğrenci Bilgileri
- **Ad Soyad:** Emine Bülbül
- **Ders:** Mobil Programlama / React Native Projesi
- **Proje Adı:** Dijital Gardırop
- **GIT Repo Linki:** https://github.com/eminebulbul/DigitalWardrobe
- **1. Video Linki:**  https://youtu.be/BmEYuUqrrTc
- **2. Video Linki:**  https://youtu.be/Tqgt2mkIw6g
- **3. Video Linki:**  https://youtu.be/eG7ZVWCF51M
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

---

## 2. Hafta Kıyafet Modülü Güncel Geliştirmeler

Bu hafta kıyafet ekleme ve yönetme tarafında uygulamayı doğrudan etkileyen önemli geliştirmeler yapıldı.

### Tamamlanan Özellikler
- Kıyafet ekleme ekranı modern bir tasarıma taşındı (hero kart, daha düzenli alanlar, geliştirilmiş butonlar).
- Kategori seçimi, daha kullanışlı olması için açılır/kapanır liste (dropdown) yapısına dönüştürüldü.
- Etiket alanı kaldırılarak veri modeli sadeleştirildi; kıyafet notları açıklama alanında toplanmaya başladı.
- Kıyafet silme özelliği eklendi ve kategori galerisi ekranından tek tek silme işlemi aktif hale getirildi.
- Kıyafet silindiğinde bu kıyafeti kullanan kayıtlı kombinlerin otomatik olarak güncellenmesi sağlandı.
- Arkaplan silme özelliği eklendi: seçilen fotoğraf backend üzerinden remove.bg servisine gönderilip temizlenmiş görsel olarak geri alınıyor.
- Arkaplan silme akışı için mobil servis katmanı yazıldı ve cache dosyasına kaydedilen sonuç görseli uygulama içinde tekrar kullanılır hale getirildi.

### Teknik Olarak Yapılanlar
- `AddClothingScreen.js` içinde kamera/galeri akışı, açıklama alanı, kategori dropdown yapısı ve arkaplan silme butonu birleştirildi.
- `backgroundRemoval.js` servisi ile mobil istemci-backend iletişimi kuruldu.
- `backend/server.js` üzerinde `/api/remove-background` endpoint'i ile remove.bg entegrasyonu yapıldı.
- `storage.js` içinde kıyafet silme sonrası kombin temizliği sağlayan fonksiyon eklendi.

### Arayüz ve Kullanıcı Deneyimi İyileştirmeleri
- Kıyafet ekranlarında renk dili ve tasarım bütünlüğü güncellendi.
- Metinler Türkçe karakter desteğiyle düzeltildi (kıyafet, kombin, açıklama vb.).
- Koleksiyon ekranı sekmeli yapıya geçirildiği için kullanıcılar kıyafetlerini ve kombinlerini daha düzenli görüntüleyebiliyor.

### Sonuç
Kıyafet modülü; ekleme, listeleme, silme, açıklama ile yönetim ve arkaplan temizleme özellikleriyle daha üretime yakın ve kullanıcı dostu bir yapıya ulaştı.

---

## 3. Hafta Shuffle Geliştirmeleri

Bu hafta kombin oluşturma (shuffle) mekanizması daha gerçekçi kombin kurallarıyla güncellendi.

### Kısaca Yapılanlar
- Shuffle algoritması kategori bazlı slot mantığına geçirildi: üst, alt, tek parça, ayakkabı, aksesuar ve dış giyim ayrımı yapıldı.
- Tek parça (elbise/tulum vb.) ürünler için üst+alt yerine kullanılabilen ayrı bir kural eklendi.
- Yetersiz veri durumunda (ne üst+alt ne de tek parça yoksa) boş sonuç dönülerek kullanıcıya uyarı gösterilmesi sağlandı.
- Dış giyim için olasılıksal ekleme (%50) ile kombin sonuçları daha doğal hale getirildi.
- Oluşturulan kombinlerin isim verilerek kaydedilmesi ve kayıtlı ekranlarda isimle listelenmesi tamamlandı.

### Teknik Not
- Shuffle kural motoru `src/utils/shuffle.js` içinde güncellendi.
- Shuffle çağrısı ve isimli kayıt akışı `src/screens/CreateOutfitScreen.js` içinde yönetiliyor.
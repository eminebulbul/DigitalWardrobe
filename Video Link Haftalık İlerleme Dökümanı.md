# 👗 Dijital Gardırop - Haftalık İlerleme Raporu

> **Mobil Programlama / React Native Projesi** kapsamında geliştirilen "Dijital Gardırop" uygulamasının haftalık gelişim, hata ayıklama ve mimari tasarım süreçlerini içeren dokümandır.

## 👤 Öğrenci Bilgileri
- **Ad Soyad:** Emine Bülbül
- **Proje Adı:** Dijital Gardırop
- **GIT Repo Linki:** [DigitalWardrobe (GitHub)](https://github.com/eminebulbul/DigitalWardrobe)

### 📺 Proje Video Günlükleri
- [1. Hafta Videosu](https://youtu.be/BmEYuUqrrTc)
- [2. Hafta Videosu](https://youtu.be/Tqgt2mkIw6g)
- [3. Hafta Videosu](https://youtu.be/eG7ZVWCF51M)
- [4. Hafta Videosu](https://youtu.be/kr-2wAUSk0k)
- [5., 6. ve 7. Hafta Videosu](https://youtu.be/ruip0A65qUU)
- [8. Hafta Videosu](https://youtu.be/u3b4JVTZ0I0)
- [9. Hafta Videosu](https://youtu.be/E30fnj5sqY0)
- [10. Hafta Videosu](https://youtu.be/eTSbfBzp3zk)

---

## 📅 1. Hafta: Proje İskeleti ve Temel Kurulum

### Tamamlananlar
- React Native proje kurulumu yapıldı ve Expo ortamı hazırlandı.
- Alt sekme (tab) tabanlı Navigation yapısı kuruldu.
- Temel ekran taslakları (Ana Sayfa, Kıyafet Ekle, Koleksiyon) çalışır hale getirildi.
- Kıyafet kategorileri tanımlandı.
- `AsyncStorage` ile cihaz içi veri saklama ve rastgele (shuffle) kombin üretme özellikleri tamamlandı.

### Yapılan İşlemler ve Kod Yapısı
- **`App.js`:** `NavigationContainer` ile uygulama sarıldı, genel tema renkleri tanımlandı.
- **`AppNavigator.js`:** 3 ana sekme ve detay ekranı (Kategori Galerisi) bağlandı.
- **`AddClothingScreen.js`:** Kamera/galeri izinleri alınarak kategori, etiket ve açıklama içeren kıyafet ekleme formu oluşturuldu.
- **`storage.js`:** `AsyncStorage` ile kıyafet ve kombin verilerinin telefonda kalıcı olarak saklanması sağlandı.
- **`shuffle.js`:** Kategorilere göre ayrılmış kıyafetlerden rastgele parçalar seçerek kombin üreten algoritma yazıldı.
- **YZ Kullanımı:** Ekran bileşenlerinin düzenli ayrılması, navigasyon akışının hatasız kurulması ve shuffle algoritmasının optimizasyonu için yapay zeka desteği alındı.

---

## 📅 2. Hafta: Kıyafet Modülü Güncel Geliştirmeler

Bu hafta kıyafet ekleme ve yönetme tarafında uygulamayı doğrudan etkileyen önemli geliştirmeler yapıldı.

### Tamamlanan Özellikler ve Kullanıcı Deneyimi
- Kıyafet ekleme ekranı modern bir tasarıma taşındı (hero kart, daha düzenli alanlar, geliştirilmiş butonlar).
- Kategori seçimi, daha kullanışlı olması için açılır/kapanır liste (dropdown) yapısına dönüştürüldü.
- Etiket alanı kaldırılarak veri modeli sadeleştirildi; kıyafet notları açıklama alanında toplanmaya başladı.
- Kıyafet silme özelliği eklendi ve kategori galerisi ekranından tek tek silme işlemi aktif hale getirildi.
- **Arkaplan Silme (Remove.bg):** Seçilen fotoğraf backend üzerinden remove.bg servisine gönderilip temizlenmiş görsel olarak geri alınıyor. Mobil servis katmanı yazıldı ve cache dosyasına kaydedilen sonuç görseli uygulama içinde tekrar kullanılır hale getirildi.
- Metinler Türkçe karakter desteğiyle düzeltildi, Koleksiyon ekranı sekmeli yapıya geçirilerek düzen sağlandı.

### Teknik Olarak Yapılanlar
- `AddClothingScreen.js` içinde kamera/galeri akışı, açıklama alanı, kategori dropdown yapısı ve arkaplan silme butonu birleştirildi.
- `backgroundRemoval.js` servisi ile mobil istemci-backend iletişimi kuruldu.
- `backend/server.js` üzerinde `/api/remove-background` endpoint'i entegre edildi.
- `storage.js` içine kıyafet silme sonrası silinen parçayı kullanan kombinlerin de otomatik güncellenmesini (temizliğini) sağlayan fonksiyon eklendi.

---

## 📅 3. Hafta: Shuffle Geliştirmeleri

Bu hafta kombin oluşturma (shuffle) mekanizması daha gerçekçi kombin kurallarıyla güncellendi.

- **Kategori Bazlı Slot Mantığı:** Shuffle algoritması üst, alt, tek parça, ayakkabı, aksesuar ve dış giyim olarak ayrıldı.
- **Tek Parça Mantığı:** Elbise/tulum vb. ürünler için "üst+alt" yerine kullanılabilen ayrı bir kural eklendi.
- **Veri Validasyonu:** Yetersiz veri durumunda boş sonuç dönülerek kullanıcıya uyarı gösterilmesi sağlandı.
- **Doğal Kombinasyonlar:** Dış giyim için olasılıksal ekleme (%50) ile kombin sonuçları daha doğal hale getirildi.
- **Kayıt Sistemi:** Oluşturulan kombinlerin isim verilerek kaydedilmesi ve listelenmesi tamamlandı. *(Kural motoru `src/utils/shuffle.js` içinde güncellendi ve `src/screens/CreateOutfitScreen.js` ile bağlandı).*

---

## 📅 4. Hafta: Optimizasyon ve Hata Ayıklama

- **Kombin İyileştirmeleri:** Shuffle mantığı iyileştirildi, kombinleri isimle kaydetme akışı netleştirildi.
- **Koleksiyon Düzeni:** Kombinlerim/Koleksiyon tarafında listeleme, silme ve geri alma deneyimi düzenlendi.
- **Akış Stabilizasyonu:** Crop -> Önizleme -> Arkaplan silme akışı tekrar çalışır ve daha tutarlı hale getirildi.
- **Sıralama ve Arama:** Kategori seçimlerinde ve kıyafet listelerinde alfabetik düzen sağlandı, "Kıyafetlerim" tarafına arama desteği eklendi.
- **Demo Hazırlığı:** Demo için genel hata temizliği yapıldı, kırılan noktalar toparlandı.

---

## 📅 5-6-7. Haftalar: Arayüz İyileştirmeleri, Algoritma ve Bulut Planlaması

Bu üç haftada uygulamanın UX/UI kalitesi artırıldı, shuffle algoritması akıllı hale getirildi ve bulut altyapısı tasarlandı.

### 🎨 5. Hafta: Arayüz İyileştirmeleri
- **Floating Tab Bar:** Alt gezinme uyumlu, animasyonlu geçişler ve aktif durum göstergeleri eklendi.
- **Modern Tasarım:** Kıyafet/kombin kartlarına shadow efektleri, border radiuslar ve tutarlı bir renk şeması (#F89DAC, #EAF7FF) uygulandı.
- **Kategori Galerisi:** Koleksiyondan kategori seçimi yapılınca filtreli gösterim yapan detaylı galeri ekranı açılıyor.

### 🧠 6. Hafta: Shuffle Algoritması İyileştirmesi
- **Ağırlıklı Seçim (Weighted Selection):** Son kullanılan kıyafetlerin daha az seçilmesi sağlandı (`1/(1+usageCount)` formülü).
- **Çoklu Deneme (Multi-attempt):** Algoritma 10-12 aday üretiyor ve en düşük kullanım skorlu kombinasyonu seçiyor.

### ☁️ 7. Hafta: Bulut Sistemi Planlama ve Araştırma
- **Altyapı Kararı:** PostgreSQL + Express backend mimarisi seçildi.
- **Veritabanı (Schema):** `users`, `clothes`, `outfits`, `profiles` tabloları `user_id` izolasyonuyla planlandı.
- **Güvenlik (Auth):** 7 gün geçerli JWT tabanlı authentication ve bcrypt şifreleme (password hashing) stratejisi oluşturuldu.
- **Hibrid Model:** AsyncStorage + Cloud hibrit modeli yapılandırıldı (Token varsa cloud-first, yoksa local fallback).
- **Storage:** AWS S3, Wasabi, Minio desteği için S3 uyumlu esnek görsel depolama altyapısı hazırlandı.

---

## 📅 8. Hafta: Cloud Sistemi Uygulama ve Entegrasyon

7. haftada tasarlanan bulut sistemi tam olarak uygulandı ve production-ready hale getirildi.

### Backend Geliştirmeleri
- **JWT Auth Akışı:** `/api/auth/login` ve `/register` endpoint'leri tamamlandı. `requireAuth` middleware'i ile request'lere kullanıcı yetkisi atandı.
- **Veri İzolasyonu:** Her query'de `WHERE user_id = $1` filtresi zorunlu kılındı.
- **S3 Görsel Yönetimi:** Resimler S3'e veya local'e kaydediliyor. `GET /api/clothes/:id/image` proxy'si ile token doğrulanıp görsel güvenli şekilde servis ediliyor.
- **Hata Yönetimi (Error Handling):** Timeout, token expiry gibi edge case'ler için tutarlı JSON dönüş formatları ayarlandı.

### Frontend Geliştirmeleri
- **Context API:** `AuthContext.js` ile login durumu, token yönetimi ve `bootstrapAsync` mekanizması kuruldu.
- **Hibrid Veri Senkronizasyonu:** `getAuthToken()` kontrolüyle API'ye veya `AsyncStorage`'a yazma işlemleri (`addClothing`,
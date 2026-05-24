# Haftalık İlerleme Dokümanı - Dijital Gardırop

## Öğrenci Bilgileri
- **Ad Soyad:** Emine Bülbül
- **Ders:** Mobil Programlama / React Native Projesi
- **Proje Adı:** Dijital Gardırop
- **GIT Repo Linki:** https://github.com/eminebulbul/DigitalWardrobe
- **1. Video Linki:**  https://youtu.be/BmEYuUqrrTc
- **2. Video Linki:**  https://youtu.be/Tqgt2mkIw6g
- **3. Video Linki:**  https://youtu.be/eG7ZVWCF51M
- **4. Video Linki:**  https://youtu.be/kr-2wAUSk0k
- **5.,6.,7. Video Linki:**  https://youtu.be/ruip0A65qUU
- **8. Video Linki:**  https://youtu.be/u3b4JVTZ0I0
- **9. Video Linki** https://youtu.be/E30fnj5sqY0
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

## 4. hafta
Bugün kısaca şunları tamamladık:

Kombin tarafını güçlendirdik: shuffle mantığını iyileştirdik, kombinleri isimle kaydetme akışını netleştirdik.
Kombin ekranlarını toparladık: Kombinlerim/Koleksiyon tarafında listeleme, silme ve geri alma deneyimini düzenledik.
Kıyafet ekleme akışını stabilize ettik: crop-önizleme-arkaplan silme akışını tekrar çalışır ve daha tutarlı hale getirdik.
Sıralama ve arama geliştirmesi yaptık: kategori seçimlerinde ve kıyafet listelerinde alfabetik düzeni ekledik, Kıyafetlerim tarafında arama desteği ekledik.
Demo için genel hata temizliği yaptık: kırılan noktaları toparlayıp ekranların tekrar sorunsuz açılmasını sağladık.

---

## 5-6-7. HAFTALAR: ARAYÜZ İYİLEŞTİRMELERİ, SHUFFLE OPTİMİZASYONU VE BULUT PLANLAMASI

Bu üç haftada uygulamanın kullanıcı deneyimini iyileştirdik, kombin oluşturma algoritmasını daha akıllı hale getirdik ve bulut depolama altyapısını araştırıp tasarladık.

### Tamamlanan Özellikler

**5. Hafta - Arayüz İyileştirmeleri:**
- Floating tab bar tasarımı: Alt gezinme uyumlu, animasyonlu geçişler ve aktif durum göstergeleri eklendi.
- Kıyafet ve kombin kartlarının modern tasarımı: Shadow efektleri, border radiuslar ve consistent color scheme (#F89DAC, #EAF7FF) uygulandı.
- Boş durum mesajları: Kullanıcı verisi yokken aydınlatıcı uyarılar gösterilmesi sağlandı.
- Kategori galerisi: Koleksiyondan kategori seçimi yapılınca detaylı galeri ekranı açılıyor, tıklanılan kategoriye göre filtreli gösterim yapılıyor.

**6. Hafta - Shuffle Algoritması İyileştirmesi:**
- Ağırlıklı seçim (weighted selection) eklendi: Son kullanılan kıyafetler daha az seçiliyor (1/(1+usageCount) formula).
- Çok deneme yapısı (multi-attempt): Algoritma 10-12 aday üzetiyor ve en düşük kullanım skorlu kombinasyonu seçiyor.
- Kategori validasyonu: Slot kontrolü yapılıyor (üst+alt vb.), yetersiz veri durumunda alert gösteriliyor.
- İntegrasyon: CreateOutfitScreen'de shuffle iyileştirilmiş algoritma kullanıyor.

**7. Hafta - Bulut Sistemi Planlama ve Araştırma:**
- Firebase vs. Supabase vs. Kendi Backend kararı verildi: PostgreSQL + Express backend seçildi.
- Database schema tasarlandı: users, clothes, outfits, profiles tabloları user_id izolasyonuyla planlandı.
- JWT authentication stratejisi oluşturuldu: 7 gün geçerli token, bcrypt password hashing.
- AsyncStorage + Cloud hibrid model yapılandırıldı: Token varsa cloud-first, yoksa local fallback.
- S3-compatible flexible image storage: AWS S3, Wasabi, Minio desteği için altyapı hazırlandı.

### Teknik Olarak Yapılanlar

**Frontend (React Native):**
- `src/components/FloatingTabBar.js`: Animated Pressable ile tab geçişleri, spring animasyonları.
- `src/utils/shuffle.js`: Weighted selection, multi-attempt candidate generation, scoreOutfit logic.
- `src/services/storage.js`: Hibrid logic (token check → cloud or local).
- `src/context/AuthContext.js`: Token state, login/register/logout.
- `src/services/api.js`: Error parsing, API response normalization.
- `src/components/RemoteImage.js`: Smart image fetching (public URL vs. token auth proxy).

**Backend (Node.js + Express + PostgreSQL):**
- `backend/server.js`: Auth endpoints (/api/auth/login, /api/auth/register), clothes/outfits CRUD, image proxy, S3 integration.
- `backend/schema.sql`: User isolation (user_id references), clothes/outfits/profiles tables.
- JWT middleware (requireAuth): Token verification, user_id extraction, request attachment.
- Error handling: Consistent response format (ok, message, details).
- S3 client optional: env variable kontrolü ile local/S3 fallback.

### Kullanıcı Deneyimi

- Gezinme: Şeffaf bottom tab bar, sekme animasyonları, responsive layout.
- Kıyafet yönetimi: Kategori bazlı filtreleme, ara, silme, açıklama düzenleme.
- Kombin üretimi: Daha az tekrarlayan, mantıklı kombinler (category rules + weighted random).
- İnternet bağlantısı: Offline modda AsyncStorage'dan veri, online olunca cloud'dan güncel veri.

### Sonuç

5-6-7. haftalarda uygulamanın omurgası tamamlandı: Arayüz modern ve responsive, shuffle algoritması akıllı ve verimli, bulut altyapısı güvenli ve esnektir. Frontend ve backend ayrıştırılmış, multi-tenant yapı hazır. JWT auth ile şifre güvenliği, S3 ile görsel esnekliği sağlandı.

---

## 8. HAFTA: CLOUD SİSTEMİ UYGULAMA

Bu haftada, 7. haftada tasarladığımız bulut sistemi tam olarak uygulandı ve işlemsel hale getirildi.

### Tamamlanan Özellikler

- **JWT Authentication Akışı:** Login ve register endpoint'leri tamamlanıp, token oluşturma ve doğrulama mekanizması kuruldu.
- **User ID İzolasyonu:** Her clothes ve outfits kaydı user_id'ye bağlandı. Tüm query'lerde WHERE user_id = $1 filtresi zorunlu hale getirildi.
- **Hibrid Veri Senkronizasyonu:** `addClothing()`, `addOutfit()` gibi fonksiyonlarda token varsa API'ye, yoksa AsyncStorage'a yazılması sağlandı.
- **Görsel Yönetimi:** POST /api/clothes'te resim S3'e (env ayarlıysa) veya local uploads klasörüne kaydediliyor. GET /api/clothes/:id/image proxy'de token doğrulanıp görsel served ediliyor.
- **Hata Yönetimi:** Timeout, token expiry, upload failure, concurrent writes gibi edge case'ler handle ediliyor. Consistent error format uygulandı.
- **Senkronizasyon Stratejisi:** Timestamp bazlı Last-Write-Wins mekanizması altyapı olarak kurulandı.
- **Deployment Konfigürasyonu:** Environment variable'lar (JWT_SECRET, DATABASE_URL, S3 credentials) production/development ayrımıyla hazırlandı.

### Teknik Olarak Yapılanlar

**Backend Tamamlama:**
- `backend/server.js`: /api/auth/login, /api/auth/register, /api/clothes (GET/POST/DELETE), /api/outfits (GET/POST/DELETE), /api/profile/me, /api/clothes/:id/image proxy.
- requireAuth middleware: Gelen token doğrula, user_id extract et, req.user attach et.
- S3Client optional: S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY env'den okunup s3Client initialized.
- Error responses: Tüm endpoint'lerde try-catch + consistent format (ok, message, details).

**Frontend Tamamlama:**
- `src/context/AuthContext.js`: bootstrapAsync ile login state restore, login/register/logout fonksiyonları, token/user state management.
- `src/services/storage.js`: getAuthToken() kontrol → token varsa API call, yoksa local fallback. `getClothes()`, `addClothing()`, `removeClothing()`, `getOutfits()`, `addOutfit()`, `removeOutfit()` hibrid fonksiyonları.
- `src/components/RemoteImage.js`: Gelen publicUri test → public ise direkt, validated değilse token ile proxy URL oluştur.
- `src/services/api.js`: parseApiResponse() error handling, buildApiError() user-friendly message.
- `src/navigation/AppNavigator.js`: isSignedIn check → token varsa AppTabs, yoksa AuthStack (Login/Register).

**Database Schema:**
- `backend/schema.sql`: users (id, name, email, password_hash, created_at), profiles (user_id ref), clothes (user_id ref, image_url), outfits (user_id ref, clothes_ids array).
- Foreign key constraints: ON DELETE CASCADE, data integrity enforced.

### Kullanıcı Deneyimi

- **Giriş/Kayıt:** LoginScreen, RegisterScreen ile kullanıcı girişi, token AsyncStorage'a kaydediliyor.
- **Veri Güvenliği:** Her user sadece kendi veri görebiliyor (user_id isolation), şifreler bcrypt hashed, API token ile protected.
- **Offline Mode:** Token olmadığında AsyncStorage fallback, offline çalışma möğkün. Token eklenince cloud'dan güncellenmiş veri çekiliyor.
- **Görsel Upload:** Kamera/galeri → arkaplan silme → kategori seçimi → kaydedildi. Görsel S3'te (prod) veya local'de (dev).

### Sonuç

8. hafta sonunda proje production-ready bir cloud mimarisine ulaştı: Güvenli JWT auth, user_id izolasyonu, hibrid local/cloud sync, flexible image storage ve comprehensive error handling. Uygulama online/offline her ortamda çalışıyor, veri encryption ve privacy sağlanıyor.


9. Hafta profil ekrani eklendi. online platforma dönüştürüldü.
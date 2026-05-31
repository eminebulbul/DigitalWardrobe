# 👗 Dijital Gardırop (React Native + Node.js)
Kıyafetleri dijital ortamda saklama, yönetme ve akıllı algoritmalarla (Shuffle) yeni kombinler oluşturma amacıyla hazırlanmış tam yığın (full-stack) mobil uygulama projesi.

## ✨ Özellikler ve Ekranlar

- **Kıyafet Yönetimi:** Kameradan veya galeriden fotoğraf ekleme, arka planı (Remove.bg) otomatik silme ve kategoriye göre saklama.
- **Gardırobum:** Tüm kıyafetlerin listesi ve kategoriye göre dinamik filtreleme.
- **Akıllı Kombin (Shuffle):** Gardırobunuzdaki parçalardan kurallara uygun rastgele kombinler üretme.
- **Kombinlerim:** Üretilen kombinleri isimlendirerek kaydetme ve daha sonra görüntüleme.
- **Profil:** Kullanıcı bilgilerini ve paylaşılan içerikleri görüntüleme.
- **Hibrit Senkronizasyon:** Hem cihazda (`AsyncStorage`) hem de bulutta veri saklama.

## 🛠️ Kullanılan Teknolojiler

- **Mobil Frontend:** React Native, Expo, React Navigation
- **Backend Sunucu:** Node.js, Express.js
- **Veritabanı:** PostgreSQL
- **Güvenlik & Kimlik Doğrulama:** JWT (JSON Web Tokens), Bcrypt
- **Medya Depolama:** Cloudflare R2 / S3 Uyumlu Depolama (Opsiyonel lokal depolama)

## 🏗️ Veri Modelleri

Sistem Firebase yerine kendi backend mimarimizi kullanır. Görseller veritabanında tutulmaz; S3/R2 veya lokalde saklanır, veritabanında sadece URL ve metadata yer alır.

**Kullanıcı (User)**

```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "avatar_url": "string"
}
```

**Kıyafet (Clothing)**

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "image_url": "string",
  "category": "string",
  "description": "string"
}
```

**Kombin (Outfit)**

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "string",
  "clothes_ids": ["uuid"]
}
```

## 🚀 Kurulum Rehberi

### Ön Koşullar

- Node.js 16+
- PostgreSQL 12+
- npm veya yarn
- Expo CLI

### 1. Backend Kurulumu
Terminali açın ve backend klasörüne gidin:

```bash
cd backend
npm install
cp .env.example .env
```

**Veritabanı Ayarları:**

PostgreSQL'de veritabanını oluşturun ve şemayı çalıştırın:

```bash
createdb digital_wardrobe
psql digital_wardrobe < schema.sql
```

**Sunucuyu Başlatma:**

```bash
npm run dev    # Geliştirme ortamı için
npm start      # Canlı ortam (Prod) için
```

### 2. Frontend (Mobil) Kurulumu
Ana proje dizininde yeni bir terminal açın:

```bash
npm install
cp .env.example .env
```

**Uygulamayı Başlatma:**

```bash
npm start
```

Açılan menüden `a` tuşu ile Android, `i` tuşu ile iOS simülatöründe başlatabilirsiniz.

## ⚙️ Ortam Değişkenleri (.env)

### Frontend (`/.env`)

| Değişken | Örnek Değer | Açıklama |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | `http://localhost:3001` | Backend temel adresi (Cihaz testleri için lokal IP girin) |
| `EXPO_PUBLIC_BG_API_URL` | `http://localhost:3001` | Arka plan silme API adresi |

### Backend (`/backend/.env`)

| Değişken | Örnek Değer | Durum |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@localhost/dbname` | Zorunlu |
| `JWT_SECRET` | `rastgele-32-karakterli-sifre` | Zorunlu |
| `PORT` | `3001` | İsteğe Bağlı |
| `REMOVE_BG_API_KEY` | `api-anahtariniz` | İsteğe Bağlı |
| `AWS_S3_BUCKET` | `sizin-bucket-adiniz` | İsteğe Bağlı (S3 için) |

*(Not: S3 değişkenlerini boş bırakırsanız sistem fotoğrafları otomatik olarak lokal `/uploads` klasörüne kaydeder).*

## 📚 API Dokümantasyonu

### Kimlik Doğrulama (Auth)

- `POST /api/auth/register` - Yeni hesap oluşturma
- `POST /api/auth/login` - Giriş yapma ve JWT token alma

### Kıyafetler (Clothes)

- `GET /api/clothes` - Kullanıcının kıyafetlerini listeleme (Auth gerekli)
- `POST /api/clothes` - Kıyafet ekleme (Auth ve multipart görsel gerekli)
- `DELETE /api/clothes/:id` - Kıyafet silme (Auth gerekli)

### Kombinler (Outfits)

- `GET /api/outfits` - Kullanıcının kombinlerini listeleme (Auth gerekli)
- `POST /api/outfits` - Kombin oluşturma (Auth gerekli)
- `DELETE /api/outfits/:id` - Kombin silme (Auth gerekli)

## 🛡️ Güvenlik ve Sorun Giderme

- **Güvenlik Uyarısı:** `.env` dosyalarınızı asla GitHub'a yüklemeyin (`.gitignore` içinde tutun). Canlı ortamda `JWT_SECRET` için güçlü bir anahtar kullanın.
- **Bağlantı Hatası Alıyorsanız:** Mobil uygulamada `EXPO_PUBLIC_API_URL` kısmına `localhost` yerine bilgisayarınızın yerel IP adresini (örn: `192.168.1.x`) yazın.
- **Görseller Yüklenmiyorsa:** S3/R2 kullanmıyorsanız backend tarafındaki `.env` dosyasında S3 ile ilgili satırları tamamen temizleyin.
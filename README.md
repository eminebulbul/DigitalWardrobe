# Dijital Kiyafet Dolabi (React Native + Expo)

1. Hafta videosu; https://youtu.be/BmEYuUqrrTc

Bu proje, kiyafetleri dijital ortamda saklama ve gardiroptan kombin olusturma amaciyla hazirlanmis bir mobil uygulama iskeletidir.

## Ozellikler

- Kiyafet fotografi ekleme (galeri veya kamera)
- Kategoriye gore kiyafet saklama
- Gardiropta kiyafet listeleme ve filtreleme
- Rastgele kombin olusturma (shuffle)
- Kombin kaydetme ve kayitli kombinleri goruntuleme
- Oturum bilgisini `AsyncStorage` ile saklama
- Kiyafet ve kombin verisini backend + PostgreSQL ile saklama
- Görselleri Cloudflare R2 (veya S3 uyumlu depolama) üzerinde saklama

## Ekranlar

- `Gardirobum`: Tum kiyafetlerin listesi ve kategori filtreleme
- `Kiyafet Ekle`: Foto cekme/secme, kategori secme, kaydetme
- `Kombin`: Shuffle ile kombin uretme ve kaydetme
- `Kombinlerim`: Kaydedilen kombinleri gorme

## Veri Modeli

Kiyafet objesi:

```json
{
  "id": "string",
  "userId": "string",
  "imageUri": "string",
  "category": "string"
}
```

Kombin objesi:

```json
{
  "id": "string",
  "userId": "string",
  "clothesIds": ["string"],
  "createdAt": "ISO-8601"
}
```

## Kurulum

```bash
npm install
npm run start
```

Ardindan Expo ekranindan iOS simulatoru veya fiziksel cihaz ile uygulamayi acabilirsin.

## Backend Mimarisi

Bu proje için Firebase yerine kendi backend yapisini kullanıyoruz.

- Backend: Node.js + Express
- Veritabanı: PostgreSQL
- Görseller: Cloudflare R2 (önerilen) veya backend içindeki `uploads/` klasörü
- Database içinde: sadece `image_url` ve diğer metadata alanları
- Kimlik doğrulama: JWT tabanlı giriş sistemi

## Veri Modeli

Kullanıcı:

```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "avatar_url": "string",
  "bio": "string"
}
```

Kıyafet:

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "image_url": "string",
  "category": "string",
  "description": "string"
}
```

Kombin:

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "string",
  "clothes_ids": ["uuid"]
}
```

## Backend Kurulumu

```bash
cd backend
npm install
cp .env.example .env
```

`schema.sql` dosyasini PostgreSQL'de calistir ve tabloları olustur.

`.env` dosyasina en az su alanları ekle:

```bash
PORT=3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/DgtalWardrope
JWT_SECRET=change-me
REMOVE_BG_API_KEY=your-removebg-key
AWS_S3_BUCKET=your-r2-bucket
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=auto
S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
```

Ardindan backend'i baslat:

```bash
npm run dev
```

Mobil uygulamada backend adresini ayarlamak icin Expo ortam degiskeni kullan:

```bash
EXPO_PUBLIC_API_URL=http://<LOCAL_IP>:3001
```

Not: Fiziksel cihaz kullanıyorsan `localhost` yerine bilgisayarının IP adresini yazman gerekir.

## Kullanilan Teknolojiler

- React Native
- Expo
- React Navigation (Bottom Tabs)
- Express
- PostgreSQL
- JWT
- Multer
- Expo Image Picker
- Cloudflare R2 / S3 uyumlu object storage

## Notlar

- Varsayilan kullanici kimligi artik local demo yerine JWT tabanli olacak.
- Görseller veritabanında tutulmaz; dosya olarak R2 veya backend'de saklanır, database'de sadece URL saklanır.

1. Hafta videosu: 
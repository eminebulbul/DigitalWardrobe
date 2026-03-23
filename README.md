# Dijital Kiyafet Dolabi (React Native + Expo)

1. Hafta videosu; https://youtu.be/BmEYuUqrrTc

Bu proje, kiyafetleri dijital ortamda saklama ve gardiroptan kombin olusturma amaciyla hazirlanmis bir mobil uygulama iskeletidir.

## Ozellikler

- Kiyafet fotografi ekleme (galeri veya kamera)
- Kategoriye gore kiyafet saklama
- Gardiropta kiyafet listeleme ve filtreleme
- Rastgele kombin olusturma (shuffle)
- Kombin kaydetme ve kayitli kombinleri goruntuleme
- Verileri cihazda `AsyncStorage` ile saklama

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

## Kullanilan Teknolojiler

- React Native
- Expo
- React Navigation (Bottom Tabs)
- AsyncStorage
- Expo Image Picker

## Notlar

- Varsayilan kullanici kimligi: `demo-user-1`
- Bu yapi, ileride cloud entegrasyonu (Firebase/Supabase) icin genisletilebilir.

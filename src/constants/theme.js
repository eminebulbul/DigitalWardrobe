/**
 * Blooming Garden Theme
 * Canlı, enerjik ve pembe/mor ağırlıklı yeni tema
 */

export const theme = {
  // ========== RENKLER ==========
  colors: {
    // Ana Vurgu (Deep Cerise) - Butonlar, Headers, Primary Actionlar
    primary: "#cb4d8c",        
    primaryLight: "#E86EAE",   // Tıklanma efekti için açığı
    primaryDark: "#AA2D6B",    // Daha koyu tonu
    
    // İkincil Vurgu (Lavender Violet) - İkonlar, Alt Seçenekler
    secondary: "#7758A3",      
    secondaryLight: "#9579BE", 
    secondaryDark: "#58407A",  
    
    // Arka Plan - Pembenin çok uçuk hali, temanın her yerde hissedilmesi için
    background: "#FFF0F6",     
    
    // Card/Surface - Kart Arka Planları
    surface: "#FFFFFF",        // Okunabilirlik için kart içleri temiz beyaz
    surfaceLight: "#FFAFEB",   // Lavender Rose - Vurgulu/renkli kartlar için
    surfaceDark: "#F6C45C",    // Honey Gold - Etiketler, rozetler veya dikkat çekici alanlar için
    
    // Accent / Info (Ruddy Blue) - Dikkat çekici küçük detaylar için
    accent: "#66A5ED",

    // Metinler
    text: {
      primary: "#3D2B52",      // Lavender Violet'in okunabilirlik için çok koyulaştırılmış mor-siyah hali
      secondary: "#7758A3",    // Alt başlıklar ve açıklamalar için Lavender Violet
      tertiary: "#A897BE",     // Pasif metinler/placeholder'lar
      light: "#FFFFFF",        // Pembe butonların üzerindeki yazılar için beyaz
    },
    
    // Utility Colors 
    success: "#4CAF50",        // Başarı/onay için standart yeşil (UX için gerekli)
    warning: "#F6C45C",        // Honey Gold (Sarı/Turuncu uyarı)
    error: "#DB3E8C",          // Hatalar için Deep Cerise
    info: "#66A5ED",           // Ruddy Blue (Bilgilendirme)
    
    // Neutral
    white: "#ffffff",
    black: "#000000",
    border: "#EAD9E3",         // Pembe alt tonlu yumuşak kenarlıklar
    divider: "#F2E6ED",        // Arayüz ayırıcı çizgileri
  },

  // ========== SPACING ==========
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },

  // ========== BORDER RADIUS ==========
  border: {
    radius: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
      round: 999,  // Fully rounded
    },
  },

  // ========== TİPOGRAFİ (Font Sizes & Weights) ==========
  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
    weights: {
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  },

  // ========== GÖLGELERİ (Shadows - Android için elevation, iOS için shadowOpacity) ==========
  shadows: {
    sm: {
      shadowColor: "#3D2B52",  // Gölgelere mor bir derinlik kattık
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2.0,
      elevation: 1,
    },
    md: {
      shadowColor: "#3D2B52",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3.84,
      elevation: 5,
    },
    lg: {
      shadowColor: "#3D2B52",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 4.65,
      elevation: 8,
    },
    xl: {
      shadowColor: "#3D2B52",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 7.49,
      elevation: 12,
    },
  },
};

export default theme;
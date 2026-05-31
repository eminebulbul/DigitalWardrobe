/**
 * Sundown Harvest Theme
 * Merkezi tema yapılandırması - tüm ekranlar bu dosyadan renkler ve değerler çeker
 */

export const theme = {
  // ========== RENKLER ==========
  colors: {
    // Ana Vurgu - Butonlar, Headers, Primary Actionlar
    primary: "#D05353",        // Indian Red
    primaryLight: "#E07373",
    primaryDark: "#B83D3D",
    
    // İkincil Vurgu - Aktif İkonlar, Secondary Buttons
    secondary: "#E58F65",      // Dark Salmon
    secondaryLight: "#F0A87F",
    secondaryDark: "#D67A52",
    
    // Arka Plan - Main Background, Large Surfaces
    background: "#F9E784",     // Cornsilk
    
    // Card/Surface - Kart Arka Planları, Container Boxları
    surface: "#F1E8B8",        // Light Khaki
    surfaceLight: "#F7F4D4",
    surfaceDark: "#E8DFA0",
    
    // Metinler
    text: {
      primary: "#1a1a1a",      // Koyu gri/siyah - başlıklar, ana metinler
      secondary: "#4a4a4a",    // Orta gri - açıklamalar, alt metinler
      tertiary: "#7a7a7a",     // Açık gri - placeholder, disabled text
      light: "#f5f5f5",        // Açık - dark background üzerinde text
    },
    
    // Utility Colors
    success: "#10b981",        // Yeşil - başarı, kaydedildi
    warning: "#f59e0b",        // Turuncu - uyarı
    error: "#ef4444",          // Kırmızı - hata
    info: "#3b82f6",           // Mavi - bilgi
    
    // Neutral
    white: "#ffffff",
    black: "#000000",
    border: "#e5e5e5",         // Light gray borders
    divider: "#d9d9d9",        // Divider color
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
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
    xl: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.37,
      shadowRadius: 7.49,
      elevation: 12,
    },
  },

  // ========== SADELIĞIN ÖNESİ ==========
  // Örnek kullanım:
  // const styles = StyleSheet.create({
  //   button: {
  //     backgroundColor: theme.colors.primary,
  //     borderRadius: theme.border.radius.md,
  //     padding: theme.spacing.md,
  //   },
  //   card: {
  //     backgroundColor: theme.colors.surface,
  //     borderRadius: theme.border.radius.lg,
  //     padding: theme.spacing.lg,
  //     ...theme.shadows.md,
  //   },
  //   text: {
  //     color: theme.colors.text.primary,
  //     fontSize: theme.typography.sizes.base,
  //     fontWeight: theme.typography.weights.normal,
  //   },
  // });
};

export default theme;

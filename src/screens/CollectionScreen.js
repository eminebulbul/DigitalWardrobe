import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RemoteImage from "../components/RemoteImage";
import { useFocusEffect } from "@react-navigation/native";
import { CATEGORIES } from "../constants/categories";
import {
  addOutfit,
  getClothes,
  getOutfits,
  removeOutfit,
  removeClothing,
  getFavoriteOutfits,
  getFavoriteClothes,
  toggleFavoriteOutfit,
  toggleOutfitVisibility,
  updateClothingVisibility,
} from "../services/storage";
import theme from "../constants/theme";
import OutfitCard from "../components/OutfitCard";

export default function CollectionScreen({ navigation }) {
  const [clothes, setClothes] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [favoriteClothes, setFavoriteClothes] = useState([]);
  const [activeView, setActiveView] = useState("outfits");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");

  const categoryOptions = useMemo(
    () => {
      const sorted = [...CATEGORIES].sort((a, b) =>
        a.localeCompare(b, "tr-TR", { sensitivity: "base" })
      );
      return ["Tümü", ...sorted];
    },
    []
  );

  const filteredClothes = useMemo(() => {
    const base =
      selectedCategory === "Tümü"
        ? clothes
        : clothes.filter((item) => item.category === selectedCategory);

    return base.slice().sort((a, b) => {
      const categoryCompare = (a.category || "").localeCompare(b.category || "", "tr-TR", {
        sensitivity: "base",
      });

      if (categoryCompare !== 0) {
        return categoryCompare;
      }

      return (a.description || "").localeCompare(b.description || "", "tr-TR", {
        sensitivity: "base",
      });
    });
  }, [clothes, selectedCategory]);

  const loadData = useCallback(async () => {
    try {
      const [savedClothes, savedOutfits, mySavedOutfits, myFavoriteClothes] = await Promise.all([
        getClothes(),
        getOutfits(),
        getFavoriteOutfits().catch(() => []),
        getFavoriteClothes().catch(() => []),
      ]);
      console.log("CollectionScreen.loadData -> clothes:", savedClothes.length, "outfits:", savedOutfits.length);
      setClothes(savedClothes);
      setOutfits(savedOutfits.slice().reverse());
      setSavedOutfits(mySavedOutfits.slice().reverse());
      setFavoriteClothes(myFavoriteClothes.slice().reverse());
    } catch (error) {
      console.error("CollectionScreen.loadData ERROR:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  function handleDeleteOutfit(outfit) {
    Alert.alert("Kombini Sil", "Bu kombin koleksiyondan kaldırılacak. Emin misin?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          await removeOutfit(outfit.id);
          await loadData();

          Alert.alert("Kombin silindi", "İstersen geri alabilirsin.", [
            { text: "Kapat", style: "cancel" },
            {
              text: "Geri Al",
              onPress: async () => {
                await addOutfit(outfit);
                await loadData();
              },
            },
          ]);
        },
      },
    ]);
  }

  function handleDeleteCloth(item) {
    Alert.alert("Kıyafeti Sil", "Bu kıyafet koleksiyonundan kaldırılacak. Emin misin?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            await removeClothing(item.id);
            await loadData();
          } catch (error) {
            Alert.alert("Hata", error.message || "Kıyafet silinemedi");
          }
        },
      },
    ]);
  }

  async function handleToggleOutfitVisibility(outfit) {
    const previousVisibility = outfit.visibility;
    const nextVisibility = previousVisibility === "public" ? "private" : "public";

    setOutfits((prev) =>
      prev.map((item) =>
        item.id === outfit.id ? { ...item, visibility: nextVisibility } : item
      )
    );

    try {
      await toggleOutfitVisibility(outfit.id, previousVisibility);
    } catch (error) {
      setOutfits((prev) =>
        prev.map((item) =>
          item.id === outfit.id ? { ...item, visibility: previousVisibility } : item
        )
      );
      Alert.alert("Hata", error.message || "Gorunurluk guncellenemedi");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.kicker}>DİJİTAL GARDIROP</Text>
          <Text style={styles.heroTitle}>Koleksiyon</Text>
          <Text style={styles.heroSubtitle}>Kombinlerini ve kıyafetlerini tek ekrandan yönet.</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{clothes.length}</Text>
              <Text style={styles.statLabel}>Kıyafet</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{outfits.length}</Text>
              <Text style={styles.statLabel}>Kombin</Text>
            </View>
          </View>
        </View>

        <View style={styles.segmentWrap}>
          <TouchableOpacity
            style={[styles.segmentButton, activeView === "outfits" && styles.segmentButtonActive]}
            onPress={() => setActiveView("outfits")}
          >
            <Text
              style={[
                styles.segmentText,
                activeView === "outfits" && styles.segmentTextActive,
              ]}
            >
              Kombinlerim
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentButton, activeView === "saved" && styles.segmentButtonActive]}
            onPress={() => setActiveView("saved")}
          >
            <Text
              style={[
                styles.segmentText,
                activeView === "saved" && styles.segmentTextActive,
              ]}
            >
              Favoriler
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentButton, activeView === "clothes" && styles.segmentButtonActive]}
            onPress={() => setActiveView("clothes")}
          >
            <Text
              style={[
                styles.segmentText,
                activeView === "clothes" && styles.segmentTextActive,
              ]}
            >
              Kıyafetlerim
            </Text>
          </TouchableOpacity>
        </View>

        {activeView === "clothes" ? (
          <View style={styles.panelCard}>
            <Text style={styles.sectionTitle}>Kategori Seç</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {categoryOptions.map((category) => {
                const isActive = selectedCategory === category;
                return (
                  <TouchableOpacity
                    key={category}
                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {!filteredClothes.length ? (
              <Text style={styles.emptyText}>Bu filtrede henüz kıyafet bulunmuyor.</Text>
            ) : (
              <View style={styles.clothesGrid}>
                {filteredClothes.map((item) => (
                  <View key={item.id} style={styles.clothCard}>
                    <RemoteImage publicUri={item.imageUri} clothId={item.id} style={styles.clothImage} />
                    <Text style={styles.clothCategory}>{item.category}</Text>
                    {!!item.description && (
                      <Text numberOfLines={2} style={styles.clothDescription}>
                        {item.description}
                      </Text>
                    )}
                    <View style={styles.clothActionsRow}>
                      <TouchableOpacity
                        style={[
                          styles.shareButton,
                          styles.clothActionButton,
                          item.visibility === "public" && styles.shareButtonActive,
                        ]}
                        onPress={async () => {
                          try {
                            const newVisibility =
                              item.visibility === "public" ? "private" : "public";
                            await updateClothingVisibility(item.id, newVisibility);
                            await loadData();
                          } catch (error) {
                            Alert.alert("Hata", error.message || "Paylaş işlemi başarısız");
                          }
                        }}
                      >
                        <Text style={styles.shareButtonText}>
                          {item.visibility === "public" ? "🌐 Paylaşılıyor" : "🔒 Özel"}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.deleteButton, styles.clothActionButton]}
                        onPress={() => handleDeleteCloth(item)}
                      >
                        <Text style={styles.deleteButtonText}>Sil</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : activeView === "saved" ? (
          <View style={styles.panelCard}>
            <Text style={styles.sectionTitle}>Favori Kombinler</Text>
            {!savedOutfits.length ? (
              <Text style={styles.emptyText}>Henüz favori kombin bulunmuyor.</Text>
            ) : (
              savedOutfits.map((outfit, index) => {
                return (
                  <OutfitCard
                    key={outfit.id}
                    outfit={{
                      name: outfit.name?.trim() || `Favori Kombin #${savedOutfits.length - index}`,
                      createdAt: outfit.savedAt || outfit.createdAt,
                      pieces: Array.isArray(outfit.clothes) ? outfit.clothes : [],
                    }}
                    creatorName={outfit.creatorName}
                    onPress={() => navigation.navigate("OutfitDetail", { outfitId: outfit.id })}
                    actionButton={
                      <TouchableOpacity
                        style={[styles.deleteButton, styles.deleteButtonRed]}
                        onPress={() => {
                          Alert.alert("Favoriden Kaldır", "Bu kombin favorilerinizden kaldırılacak. Emin misin?", [
                            { text: "Vazgeç", style: "cancel" },
                            {
                              text: "Kaldır",
                              style: "destructive",
                              onPress: async () => {
                                await toggleFavoriteOutfit(outfit.id);
                                await loadData();
                              },
                            },
                          ]);
                        }}
                      >
                        <Text style={styles.deleteButtonText}>Favoriden Kaldır</Text>
                      </TouchableOpacity>
                    }
                  />
                );
              })
            )}

            <Text style={[styles.sectionTitle, { marginTop: theme.spacing.lg }]}>Favori Kıyafetler</Text>
            {!favoriteClothes.length ? (
              <Text style={styles.emptyText}>Henüz favori kıyafet bulunmuyor.</Text>
            ) : (
              <View style={styles.clothesGrid}>
                {favoriteClothes.map((item) => (
                  <View key={item.id} style={styles.clothCard}>
                    {console.log(
                      "CollectionScreen favorite imageUri:",
                      item.id,
                      item.imageUri || item.image_url || item.cloth?.image_url
                    )}
                    <RemoteImage
                      publicUri={item.imageUri || item.image_url || item.cloth?.image_url}
                      clothId={item.id}
                      style={styles.clothImage}
                    />
                    <Text style={styles.clothCategory}>{item.category}</Text>
                    {!!item.description && (
                      <Text numberOfLines={2} style={styles.clothDescription}>
                        {item.description}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.panelCard}>
            <Text style={styles.sectionTitle}>Kombinlerim</Text>
            {!outfits.length ? (
              <Text style={styles.emptyText}>Henüz kayıtlı kombin bulunmuyor.</Text>
            ) : (
              outfits.map((outfit, index) => {
                return (
                  <OutfitCard
                    key={outfit.id}
                    outfit={{
                      name: outfit.name?.trim() || `Kayıtlı Kombin #${outfits.length - index}`,
                      createdAt: outfit.createdAt,
                      pieces: Array.isArray(outfit.clothes) ? outfit.clothes : [],
                    }}
                    creatorName={null}
                    onPress={() =>
                      navigation.navigate("OutfitDetail", {
                        outfitId: outfit.id,
                      })
                    }
                    actionButton={
                      <View style={styles.outfitActionsRow}>
                        <TouchableOpacity
                          style={[styles.deleteButton, styles.outfitActionButton]}
                          onPress={() => handleDeleteOutfit(outfit)}
                        >
                          <Text style={styles.deleteButtonText}>Sil</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.outfitVisibilityButton,
                            styles.outfitActionButton,
                            outfit.visibility === "public" && styles.outfitVisibilityButtonActive,
                          ]}
                          onPress={() => handleToggleOutfitVisibility(outfit)}
                        >
                          <Text
                            style={[
                              styles.outfitVisibilityButtonText,
                              outfit.visibility === "public" && styles.outfitVisibilityButtonTextActive,
                            ]}
                          >
                            {outfit.visibility === "public" ? "Gizle" : "Paylaş"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    }
                  />
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: 110,
  },
  heroCard: {
    borderRadius: theme.border.radius.lg,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  kicker: {
    color: theme.colors.white,
    fontWeight: theme.typography.weights.bold,
    fontSize: theme.typography.sizes.xs,
    letterSpacing: 1,
    marginBottom: theme.spacing.xs,
  },
  heroTitle: {
    fontSize: theme.typography.sizes.xxxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
    marginBottom: theme.spacing.sm,
  },
  heroSubtitle: {
    marginTop: 0,
    marginBottom: theme.spacing.md,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: theme.typography.weights.semibold,
    fontSize: theme.typography.sizes.sm,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: theme.typography.weights.semibold,
    fontSize: theme.typography.sizes.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: theme.spacing.lg,
  },
  panelCard: {
    borderRadius: theme.border.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  segmentWrap: {
    flexDirection: "row",
    borderRadius: theme.border.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  segmentButton: {
    flex: 1,
    borderRadius: theme.border.radius.md,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
  },
  segmentButtonActive: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  segmentText: {
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.weights.bold,
  },
  segmentTextActive: {
    color: theme.colors.white,
  },
  filterRow: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  filterChip: {
    borderRadius: theme.border.radius.round,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  filterChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  filterChipText: {
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.weights.bold,
    fontSize: theme.typography.sizes.xs,
  },
  filterChipTextActive: {
    color: theme.colors.white,
  },
  clothesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  clothCard: {
    width: "48%",
    borderRadius: theme.border.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    overflow: "hidden",
    marginBottom: theme.spacing.xs,
    ...theme.shadows.sm,
  },
  clothImage: {
    width: "100%",
    height: 160,
    backgroundColor: theme.colors.background,
  },
  clothCategory: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
  },
  clothDescription: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
    paddingHorizontal: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
  },
  emptyText: {
    color: theme.colors.text.secondary,
    paddingVertical: theme.spacing.md,
  },
  outfitCard: {
    borderRadius: theme.border.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  outfitTitle: {
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    fontSize: theme.typography.sizes.base,
  },
  outfitMeta: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    marginBottom: theme.spacing.md,
  },
  piecesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
  },
  pieceCard: {
    width: "31%",
    borderRadius: theme.border.radius.md,
    backgroundColor: theme.colors.background,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  image: {
    width: "100%",
    height: 84,
    backgroundColor: theme.colors.background,
  },
  category: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  description: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
    paddingHorizontal: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  shareButton: {
    marginTop: theme.spacing.md,
    borderRadius: theme.border.radius.md,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
  },
  shareButtonActive: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.secondary,
  },
  shareButtonText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
  clothActionsRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  clothActionButton: {
    flex: 1,
    marginTop: theme.spacing.sm,
  },
  deleteButton: {
    marginTop: theme.spacing.md,
    borderRadius: theme.border.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.error,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
  },
  deleteButtonRed: {
    borderColor: theme.colors.error,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  deleteButtonText: {
    color: theme.colors.error,
    fontWeight: theme.typography.weights.bold,
    fontSize: theme.typography.sizes.xs,
  },
  outfitActionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  outfitActionButton: {
    flex: 1,
  },
  outfitVisibilityButton: {
    marginTop: theme.spacing.md,
    borderRadius: theme.border.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
  },
  outfitVisibilityButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  outfitVisibilityButtonText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.bold,
    fontSize: theme.typography.sizes.xs,
  },
  outfitVisibilityButtonTextActive: {
    color: theme.colors.white,
  },
});

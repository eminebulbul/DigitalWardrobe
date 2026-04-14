import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { CATEGORIES } from "../constants/categories";
import {
  addOutfit,
  getClothes,
  getOutfits,
  removeOutfit,
} from "../services/storage";

export default function CollectionScreen({ navigation }) {
  const [clothes, setClothes] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [activeView, setActiveView] = useState("outfits");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");

  function formatOutfitDate(isoDate) {
    if (!isoDate) return null;
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString("tr-TR");
  }

  const clothesMap = useMemo(
    () =>
      clothes.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {}),
    [clothes]
  );

  const categoryOptions = useMemo(
    () =>
      ["Tümü", ...CATEGORIES].sort((a, b) =>
        a.localeCompare(b, "tr-TR", { sensitivity: "base" })
      ),
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
    const [savedClothes, savedOutfits] = await Promise.all([
      getClothes(),
      getOutfits(),
    ]);
    setClothes(savedClothes);
    setOutfits(savedOutfits.slice().reverse());
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
                  <TouchableOpacity
                    key={item.id}
                    style={styles.clothCard}
                    onPress={() =>
                      navigation.navigate("Kategori Galerisi", {
                        categoryName: item.category,
                      })
                    }
                  >
                    <Image source={{ uri: item.imageUri }} style={styles.clothImage} />
                    <Text style={styles.clothCategory}>{item.category}</Text>
                    {!!item.description && (
                      <Text numberOfLines={2} style={styles.clothDescription}>
                        {item.description}
                      </Text>
                    )}
                  </TouchableOpacity>
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
                const pieces = outfit.clothesIds
                  .map((id) => clothesMap[id])
                  .filter(Boolean);
                const title = outfit.name?.trim() || `Kayıtlı Kombin #${outfits.length - index}`;
                const dateText = formatOutfitDate(outfit.createdAt);
                const metaText = `${pieces.length} parça${dateText ? ` • ${dateText}` : ""}`;

                return (
                  <View key={outfit.id} style={styles.outfitCard}>
                    <Text style={styles.outfitTitle}>{title}</Text>
                    <Text style={styles.outfitMeta}>{metaText}</Text>
                    <View style={styles.piecesRow}>
                      {pieces.map((piece) => (
                        <View key={piece.id} style={styles.pieceCard}>
                          <Image source={{ uri: piece.imageUri }} style={styles.image} />
                          <Text style={styles.category}>{piece.category}</Text>
                          {!!piece.description && (
                            <Text style={styles.description}>{piece.description}</Text>
                          )}
                        </View>
                      ))}
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteOutfit(outfit)}
                    >
                      <Text style={styles.deleteButtonText}>Kombini Sil</Text>
                    </TouchableOpacity>
                  </View>
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
    backgroundColor: "#f1ede5",
  },
  content: {
    padding: 16,
    paddingBottom: 110,
  },
  heroCard: {
    borderRadius: 18,
    backgroundColor: "#a855a8",
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: 14,
    shadowColor: "#a855a8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  kicker: {
    color: "#f3e5f5",
    fontWeight: "800",
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
  },
  heroSubtitle: {
    marginTop: 0,
    marginBottom: 14,
    color: "#f3e5f5",
    fontWeight: "500",
    fontSize: 13,
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
    fontSize: 24,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 2,
  },
  statLabel: {
    color: "#f3e5f5",
    fontWeight: "600",
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 16,
  },
  panelCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e8dfd3",
    backgroundColor: "#fff",
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#3f3932",
    marginBottom: 10,
  },
  segmentWrap: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e7dfd3",
    backgroundColor: "#f9f6f0",
    padding: 4,
    marginBottom: 12,
  },
  segmentButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  segmentButtonActive: {
    backgroundColor: "#a855a8",
    shadowColor: "#a855a8",
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
  },
  segmentText: {
    color: "#6a6157",
    fontWeight: "700",
  },
  segmentTextActive: {
    color: "#fff",
  },
  filterRow: {
    gap: 8,
    paddingBottom: 6,
    marginBottom: 8,
  },
  filterChip: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#d8cebf",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterChipActive: {
    borderColor: "#a855a8",
    backgroundColor: "#f3e5f5",
  },
  filterChipText: {
    color: "#5e564c",
    fontWeight: "700",
    fontSize: 12,
  },
  filterChipTextActive: {
    color: "#a855a8",
  },
  clothesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 2,
  },
  clothCard: {
    width: "48%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e8dfd3",
    backgroundColor: "#fff",
    overflow: "hidden",
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  clothImage: {
    width: "100%",
    height: 160,
    backgroundColor: "#ece5db",
  },
  clothCategory: {
    fontSize: 12,
    fontWeight: "800",
    color: "#585148",
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  clothDescription: {
    fontSize: 11,
    color: "#6a6157",
    paddingHorizontal: 8,
    paddingBottom: 8,
    paddingTop: 3,
  },
  emptyText: {
    color: "#6d655c",
    paddingVertical: 8,
  },
  outfitCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e8dfd3",
    backgroundColor: "#fcfaf6",
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  outfitTitle: {
    fontWeight: "800",
    color: "#413b34",
    marginBottom: 4,
    fontSize: 14,
  },
  outfitMeta: {
    color: "#7a7267",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 10,
  },
  piecesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pieceCard: {
    width: "31%",
    borderRadius: 10,
    backgroundColor: "#fbf9f4",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e8dfd3",
  },
  image: {
    width: "100%",
    height: 84,
    backgroundColor: "#ece5db",
  },
  category: {
    fontSize: 11,
    fontWeight: "700",
    color: "#585148",
    paddingHorizontal: 6,
    paddingVertical: 6,
    backgroundColor: "#f9f7f2",
  },
  description: {
    fontSize: 10,
    color: "#5f574d",
    paddingHorizontal: 6,
    paddingBottom: 6,
  },
  deleteButton: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#efd5d5",
    backgroundColor: "#fff5f5",
    alignItems: "center",
    paddingVertical: 8,
  },
  deleteButtonText: {
    color: "#b34747",
    fontWeight: "800",
    fontSize: 12,
  },
});

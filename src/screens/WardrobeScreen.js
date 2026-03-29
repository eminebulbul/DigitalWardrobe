import React, { useCallback, useState } from "react";
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import ClothingCard from "../components/ClothingCard";
import { CATEGORIES } from "../constants/categories";
import { getClothes } from "../services/storage";

export default function WardrobeScreen() {
  const [clothes, setClothes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Tüm");

  const loadClothes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClothes();
      setClothes(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadClothes();
    }, [loadClothes])
  );

  const filters = ["Tüm", ...CATEGORIES];
  const filtered =
    activeCategory === "Tüm"
      ? clothes
      : clothes.filter((item) => item.category === activeCategory);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.heroKicker}>GARDIROB YÖNETİMİ</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{clothes.length}</Text>
            <Text style={styles.statLabel}>Kıyafet</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{Object.keys(CATEGORIES).length}</Text>
            <Text style={styles.statLabel}>Kategori</Text>
          </View>
        </View>
      </View>

      <View style={styles.panelCard}>
        <Text style={styles.filterTitle}>Kategoriye Göre Ara</Text>
        <View style={styles.filterRow}>
          {filters.map((category) => {
            const active = category === activeCategory;
            return (
              <TouchableOpacity
                key={category}
                style={[styles.filterButton, active && styles.filterButtonActive]}
                onPress={() => setActiveCategory(category)}
              >
                <Text
                  style={[styles.filterText, active && styles.filterTextActive]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {filtered.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>Gardırobunda kıyafet yok</Text>
          <Text style={styles.emptyText}>
            Kıyafet eklemek için "Kıyafet Ekle" sekmesini kullan.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ClothingCard item={item} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadClothes} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1ede5",
    paddingHorizontal: 14,
    paddingTop: 10,
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
  heroKicker: {
    fontSize: 11,
    fontWeight: "700",
    color: "#f3e5f5",
    letterSpacing: 1.2,
    marginBottom: 10,
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
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#f3e5f5",
    fontWeight: "600",
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
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  filterTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6e685f",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterButton: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd4c9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#fff",
  },
  filterButtonActive: {
    backgroundColor: "#a855a8",
    borderColor: "#a855a8",
  },
  filterText: {
    color: "#5b554d",
    fontWeight: "600",
    fontSize: 12,
  },
  filterTextActive: {
    color: "#fff",
  },
  listContent: {
    paddingBottom: 30,
  },
  emptyBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#332f2a",
    marginBottom: 8,
  },
  emptyText: {
    textAlign: "center",
    color: "#6e685f",
  },
});

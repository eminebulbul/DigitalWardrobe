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
  const [activeCategory, setActiveCategory] = useState("Tum");

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

  const filters = ["Tum", ...CATEGORIES];
  const filtered =
    activeCategory === "Tum"
      ? clothes
      : clothes.filter((item) => item.category === activeCategory);

  return (
    <SafeAreaView style={styles.container}>
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

      {filtered.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>Gardirobunda kiyafet yok</Text>
          <Text style={styles.emptyText}>
            Kiyafet eklemek icin "Kiyafet Ekle" sekmesini kullan.
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
    backgroundColor: "#f5f3ef",
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
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
    backgroundColor: "#2f6f5e",
    borderColor: "#2f6f5e",
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

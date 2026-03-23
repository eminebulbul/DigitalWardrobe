import React, { useCallback, useMemo, useState } from "react";
import {
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
import { getClothes, getOutfits } from "../services/storage";

export default function CollectionScreen({ navigation }) {
  const [clothes, setClothes] = useState([]);
  const [outfits, setOutfits] = useState([]);

  const clothesMap = useMemo(
    () =>
      clothes.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {}),
    [clothes]
  );

  const categoryCounts = useMemo(
    () =>
      CATEGORIES.map((name) => ({
        name,
        count: clothes.filter((item) => item.category === name).length,
      })),
    [clothes]
  );

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Koleksiyon</Text>
        <Text style={styles.subtitleTop}>Kategorilere gir, galeriyi gez, kayitli kombinleri incele.</Text>

        <Text style={styles.sectionTitle}>Kiyafet Kutuphanesi</Text>
        <View style={styles.libraryGrid}>
          {categoryCounts.map((category) => (
            <TouchableOpacity
              key={category.name}
              style={styles.categoryCard}
              onPress={() =>
                navigation.navigate("Kategori Galerisi", {
                  categoryName: category.name,
                })
              }
            >
              <Text style={styles.categoryCountLabel}>{category.count}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryCount}>{"Galeriye Git >"}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Kombin Deposu</Text>
        {!outfits.length ? (
          <Text style={styles.emptyText}>Henuz kayitli kombin bulunmuyor.</Text>
        ) : (
          outfits.map((outfit, index) => {
            const pieces = outfit.clothesIds
              .map((id) => clothesMap[id])
              .filter(Boolean);

            return (
              <View key={outfit.id} style={styles.outfitCard}>
                <Text style={styles.outfitTitle}>Kayitli Kombin #{outfits.length - index}</Text>
                <View style={styles.piecesRow}>
                  {pieces.map((piece) => (
                    <View key={piece.id} style={styles.pieceCard}>
                      <Image source={{ uri: piece.imageUri }} style={styles.image} />
                      <Text style={styles.category}>{piece.category}</Text>
                      {!!piece.tag && <Text style={styles.tag}>{piece.tag}</Text>}
                    </View>
                  ))}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f2ed",
  },
  content: {
    padding: 16,
    paddingBottom: 110,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#282420",
  },
  subtitleTop: {
    marginTop: 4,
    marginBottom: 12,
    color: "#6f685f",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#3f3932",
    marginBottom: 8,
  },
  libraryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  categoryCard: {
    width: "48%",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e7dfd3",
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 10,
    minHeight: 102,
    justifyContent: "space-between",
  },
  categoryCountLabel: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2d6a5a",
  },
  categoryName: {
    fontWeight: "700",
    color: "#4b453e",
  },
  categoryCount: {
    color: "#70685d",
    fontWeight: "600",
    fontSize: 12,
  },
  emptyText: {
    color: "#6d655c",
  },
  outfitCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e7dfd3",
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 12,
  },
  outfitTitle: {
    fontWeight: "800",
    color: "#413b34",
    marginBottom: 8,
  },
  piecesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pieceCard: {
    width: "31%",
    borderRadius: 10,
    backgroundColor: "#fcfaf6",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee5d9",
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
    paddingTop: 6,
  },
  tag: {
    fontSize: 10,
    color: "#2f6f5e",
    fontWeight: "700",
    paddingHorizontal: 6,
    paddingBottom: 6,
  },
});

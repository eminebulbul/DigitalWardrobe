import React, { useCallback, useMemo, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getClothes, getOutfits } from "../services/storage";

export default function SavedOutfitsScreen() {
  const [outfits, setOutfits] = useState([]);
  const [clothes, setClothes] = useState([]);

  const clothesMap = useMemo(
    () =>
      clothes.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {}),
    [clothes]
  );

  const loadData = useCallback(async () => {
    const [savedOutfits, savedClothes] = await Promise.all([
      getOutfits(),
      getClothes(),
    ]);
    setOutfits(savedOutfits.reverse());
    setClothes(savedClothes);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Kaydedilen Kombinler</Text>

        {!outfits.length ? (
          <Text style={styles.emptyText}>Henuz kayitli kombin bulunmuyor.</Text>
        ) : (
          outfits.map((outfit, index) => {
            const pieces = outfit.clothesIds
              .map((id) => clothesMap[id])
              .filter(Boolean);

            return (
              <View key={outfit.id} style={styles.outfitCard}>
                <Text style={styles.outfitTitle}>Kombin #{outfits.length - index}</Text>
                <View style={styles.piecesRow}>
                  {pieces.map((piece) => (
                    <View key={piece.id} style={styles.pieceCard}>
                      <Image source={{ uri: piece.imageUri }} style={styles.image} />
                      <Text style={styles.category}>{piece.category}</Text>
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
    backgroundColor: "#f5f3ef",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#282420",
    marginBottom: 12,
  },
  emptyText: {
    color: "#6d655c",
  },
  outfitCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e6ddd1",
    backgroundColor: "#fff",
    padding: 10,
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
    padding: 6,
  },
});

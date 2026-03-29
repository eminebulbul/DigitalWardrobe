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
        <View style={styles.heroCard}>
          <Text style={styles.heroKicker}>KOMBILER</Text>
          <Text style={styles.heroTitle}>Kaydedilen Kombinler</Text>
          <Text style={styles.heroSubtitle}>Daha önce oluşturduğun kombinlara buradan erişebilirsin</Text>
        </View>

        {!outfits.length ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Henüz kombin yok</Text>
            <Text style={styles.emptyText}>Kombin oluşturmak için "Kombin Shuffle" sekmesini kullan.</Text>
          </View>
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
    backgroundColor: "#f1ede5",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
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
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    color: "#f3e5f5",
    fontWeight: "500",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#282420",
    marginBottom: 12,
  },
  emptyBox: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e8dfd3",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyTitle: {
    fontWeight: "800",
    color: "#3f3a34",
    marginBottom: 6,
    fontSize: 16,
  },
  emptyText: {
    color: "#7d756b",
    textAlign: "center",
    fontSize: 14,
  },
  outfitCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e8dfd3",
    backgroundColor: "#fff",
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
    marginBottom: 10,
    fontSize: 14,
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
    padding: 6,
    backgroundColor: "#f9f7f2",
  },
});

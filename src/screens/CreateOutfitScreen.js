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
import { buildRandomOutfit } from "../utils/shuffle";
import { addOutfit, CURRENT_USER_ID, getClothes } from "../services/storage";

export default function CreateOutfitScreen() {
  const [clothes, setClothes] = useState([]);
  const [randomOutfit, setRandomOutfit] = useState([]);

  const canShuffle = clothes.length > 0;

  const loadClothes = useCallback(async () => {
    const data = await getClothes();
    setClothes(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadClothes();
    }, [loadClothes])
  );

  const summaryText = useMemo(() => {
    if (!randomOutfit.length) {
      return "Henuz bir kombin olusturulmadI.";
    }
    return `${randomOutfit.length} parca secildi`;
  }, [randomOutfit]);

  function shuffleOutfit() {
    const result = buildRandomOutfit(clothes);
    if (!result.length) {
      Alert.alert("Yetersiz veri", "Kombin icin once kiyafet eklemelisin.");
      return;
    }
    setRandomOutfit(result);
  }

  async function saveCurrentOutfit() {
    if (!randomOutfit.length) {
      Alert.alert("Kombin yok", "Kaydetmeden once kombin olustur.");
      return;
    }

    await addOutfit({
      id: Date.now().toString(),
      userId: CURRENT_USER_ID,
      clothesIds: randomOutfit.map((item) => item.id),
      createdAt: new Date().toISOString(),
    });

    Alert.alert("Kaydedildi", "Kombin Koleksiyon ekranina eklendi.");
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.kicker}>GUNUN KOMBINI</Text>
          <Text style={styles.title}>Kombin Shuffle</Text>
          <Text style={styles.subtitle}>Gardirobundan otomatik kombin olustur.</Text>
          <Text style={styles.summary}>{summaryText}</Text>

          <TouchableOpacity
            style={[styles.shuffleButton, !canShuffle && styles.disabledButton]}
            onPress={shuffleOutfit}
            disabled={!canShuffle}
          >
            <Text style={styles.shuffleText}>Kombini Shuffle Et</Text>
          </TouchableOpacity>
        </View>

        {!randomOutfit.length ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Kombin henuz hazir degil</Text>
            <Text style={styles.emptyText}>Yukaridaki butonla rastgele kombin olustur.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {randomOutfit.map((item) => (
              <View key={item.id} style={styles.card}>
                <Image source={{ uri: item.imageUri }} style={styles.image} />
                <Text style={styles.category}>{item.category}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.saveButton, !randomOutfit.length && styles.disabledButton]}
          onPress={saveCurrentOutfit}
          disabled={!randomOutfit.length}
        >
          <Text style={styles.saveText}>Kombini Kaydet</Text>
        </TouchableOpacity>
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
  heroCard: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e7e0d4",
    marginBottom: 14,
  },
  kicker: {
    color: "#2d6a5a",
    fontWeight: "800",
    letterSpacing: 0.8,
    fontSize: 11,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#26211d",
  },
  subtitle: {
    marginTop: 4,
    color: "#6e665c",
  },
  summary: {
    marginTop: 10,
    marginBottom: 12,
    color: "#5a534a",
    fontWeight: "700",
  },
  shuffleButton: {
    backgroundColor: "#2d6a5a",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  shuffleText: {
    color: "#fff",
    fontWeight: "800",
  },
  emptyBox: {
    borderRadius: 16,
    padding: 18,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e7e0d4",
    marginBottom: 14,
  },
  emptyTitle: {
    fontWeight: "800",
    color: "#2d2924",
    marginBottom: 6,
  },
  emptyText: {
    color: "#6e675d",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  card: {
    width: "48%",
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e7e0d4",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 170,
    backgroundColor: "#ece4d8",
  },
  category: {
    padding: 10,
    fontWeight: "700",
    color: "#514a41",
    fontSize: 13,
  },
  saveButton: {
    backgroundColor: "#1f4b40",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  saveText: {
    color: "#fff",
    fontWeight: "800",
  },
  disabledButton: {
    opacity: 0.5,
  },
});

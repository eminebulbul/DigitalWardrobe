import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
      return "Henüz bir kombin oluşturulmadı.";
    }
    return `${randomOutfit.length} parça seçildi`;
  }, [randomOutfit]);

  function shuffleOutfit() {
    const result = buildRandomOutfit(clothes);
    if (!result.length) {
      Alert.alert("Yetersiz veri", "Kombin için önce kıyafet eklemelisin.");
      return;
    }
    setRandomOutfit(result);
  }

  async function saveCurrentOutfit() {
    if (!randomOutfit.length) {
      Alert.alert("Kombin yok", "Kaydetmeden önce kombin oluştur.");
      return;
    }

    await addOutfit({
      id: Date.now().toString(),
      userId: CURRENT_USER_ID,
      clothesIds: randomOutfit.map((item) => item.id),
      createdAt: new Date().toISOString(),
    });

    Alert.alert("Kaydedildi", "Kombin Koleksiyon ekranına eklendi.");
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.kicker}>GÜNÜN KOMBİNİ</Text>
          <Text style={styles.title}>Kombin Shuffle</Text>
          <Text style={styles.subtitle}>Gardırobundan otomatik kombin oluştur.</Text>
          <Text style={styles.summary}>{summaryText}</Text>

          <TouchableOpacity
            style={[styles.shuffleButton, !canShuffle && styles.disabledButton]}
            onPress={shuffleOutfit}
            disabled={!canShuffle}
          >
            <Text style={styles.shuffleText}>Kombini Karıştır</Text>
          </TouchableOpacity>
        </View>

        {!randomOutfit.length ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Kombin henüz hazır değil</Text>
            <Text style={styles.emptyText}>Yukarıdaki butonla rastgele kombin oluştur.</Text>
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
    backgroundColor: "#f1ede5",
  },
  content: {
    padding: 16,
    paddingBottom: 110,
  },
  heroCard: {
    backgroundColor: "#a855a8",
    borderRadius: 18,
    padding: 18,
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
    letterSpacing: 1.2,
    fontSize: 11,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 2,
  },
  subtitle: {
    marginTop: 4,
    color: "#f3e5f5",
    fontWeight: "500",
    fontSize: 13,
  },
  summary: {
    marginTop: 10,
    marginBottom: 12,
    color: "#f3e5f5",
    fontWeight: "700",
    fontSize: 13,
  },
  shuffleButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shuffleText: {
    color: "#a855a8",
    fontWeight: "800",
    fontSize: 15,
  },
  emptyBox: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e8dfd3",
    marginBottom: 14,
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
    fontSize: 14,
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
    borderColor: "#e8dfd3",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
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
    backgroundColor: "#f9f7f2",
  },
  saveButton: {
    backgroundColor: "#a855a8",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
    shadowColor: "#a855a8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  saveText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

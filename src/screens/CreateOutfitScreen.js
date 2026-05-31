import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { buildRandomOutfit } from "../utils/shuffle";
import RemoteImage from "../components/RemoteImage";
import {
  addOutfit,
  CURRENT_USER_ID,
  getClothes,
  getOutfits,
} from "../services/storage";
import theme from "../constants/theme";

export default function CreateOutfitScreen({ navigation }) {
  const [clothes, setClothes] = useState([]);
  const [recentOutfits, setRecentOutfits] = useState([]);
  const [randomOutfit, setRandomOutfit] = useState([]);
  const [outfitName, setOutfitName] = useState("");
  const [savingOutfit, setSavingOutfit] = useState(false);

  const canShuffle = clothes.length > 0;

  const loadData = useCallback(async () => {
    const [savedClothes, savedOutfits] = await Promise.all([
      getClothes(),
      getOutfits(),
    ]);
    setClothes(savedClothes);
    setRecentOutfits(savedOutfits.slice().reverse());
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const summaryText = useMemo(() => {
    if (!randomOutfit.length) {
      return "Henüz bir kombin oluşturulmadı.";
    }
    return `${randomOutfit.length} parça seçildi`;
  }, [randomOutfit]);

  function shuffleOutfit() {
    const result = buildRandomOutfit(clothes, {
      recentOutfits,
      attempts: 12,
    });
    if (!result.length) {
      Alert.alert("Yetersiz veri", "Kombin için önce kıyafet eklemelisin.");
      return;
    }
    setRandomOutfit(result);
  }

  async function saveCurrentOutfit() {
    if (savingOutfit) {
      return;
    }

    if (!randomOutfit.length) {
      Alert.alert("Kombin yok", "Kaydetmeden önce kombin oluştur.");
      return;
    }

    const trimmedName = outfitName.trim();
    if (!trimmedName) {
      Alert.alert("İsim gerekli", "Kombini kaydetmeden önce bir isim yaz.");
      return;
    }

    setSavingOutfit(true);
    try {
      const newOutfit = {
        id: Date.now().toString(),
        userId: CURRENT_USER_ID,
        name: trimmedName,
        clothesIds: randomOutfit.map((item) => item.id),
        createdAt: new Date().toISOString(),
      };

      await addOutfit(newOutfit);

      setOutfitName("");
      setRandomOutfit([]);
      setRecentOutfits((prev) => [newOutfit, ...prev].slice(0, 10));

      Alert.alert("Kaydedildi", "Kombin Koleksiyon ekranına eklendi.", [
        { text: "Tamam", style: "cancel" },
      ]);
    } catch (error) {
      Alert.alert("Hata", "Kombin kaydedilemedi: " + error.message);
    } finally {
      setSavingOutfit(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.kicker}>🎯 GÜNÜN KOMBİNİ</Text>
          <Text style={styles.title}>Kombin Shuffle</Text>
          <Text style={styles.subtitle}>Gardırobundan otomatik kombin oluştur.</Text>
          <Text style={styles.summary}>{summaryText}</Text>

          <TouchableOpacity
            style={[styles.shuffleButton, !canShuffle && styles.disabledButton]}
            onPress={shuffleOutfit}
            disabled={!canShuffle}
          >
            <Text style={styles.shuffleText}>🔀 Kombini Karıştır</Text>
          </TouchableOpacity>
        </View>

        {!randomOutfit.length ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Kombin henüz hazır değil</Text>
            <Text style={styles.emptyText}>
              {canShuffle
                ? "Yukarıdaki butonla rastgele kombin oluştur."
                : "Önce gardırobuna kıyafet ekleyip sonra kombin üret."}
            </Text>
            {!canShuffle && (
              <TouchableOpacity
                style={styles.emptyActionButton}
                onPress={() => navigation.navigate("Kıyafet Ekle")}
              >
                <Text style={styles.emptyActionText}>Kıyafet Ekleye Git</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.grid}>
            {randomOutfit.map((item) => (
              <View key={item.id} style={styles.card}>
                {console.log("CreateOutfitScreen imageUri:", item.id, item.imageUri)}
                <RemoteImage publicUri={item.imageUri} clothId={item.id} style={styles.image} />
                <Text style={styles.category}>{item.category}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.nameInputWrap}>
          <Text style={styles.nameLabel}>Kombin İsmi</Text>
          <TextInput
            value={outfitName}
            onChangeText={setOutfitName}
            placeholder="Örn: Bahar Kampüs Kombini"
            placeholderTextColor={theme.colors.text.tertiary}
            style={styles.nameInput}
            maxLength={50}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            (!randomOutfit.length || savingOutfit) && styles.disabledButton,
          ]}
          onPress={saveCurrentOutfit}
          disabled={!randomOutfit.length || savingOutfit}
        >
          <Text style={styles.saveText}>{savingOutfit ? "Kaydediliyor..." : "💾 Kombini Kaydet"}</Text>
        </TouchableOpacity>
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
    padding: theme.spacing.lg,
    paddingBottom: 110,
  },
  heroCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.border.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  kicker: {
    color: theme.colors.white,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 1.2,
    fontSize: theme.typography.sizes.xs,
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.sizes.xxxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    marginTop: theme.spacing.sm,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: theme.typography.weights.medium,
    fontSize: theme.typography.sizes.sm,
  },
  summary: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: theme.typography.weights.bold,
    fontSize: theme.typography.sizes.sm,
  },
  shuffleButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.border.radius.md,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
    ...theme.shadows.sm,
  },
  shuffleText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.bold,
    fontSize: theme.typography.sizes.base,
  },
  emptyBox: {
    borderRadius: theme.border.radius.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  emptyTitle: {
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    fontSize: theme.typography.sizes.base,
  },
  emptyText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.sizes.sm,
  },
  emptyActionButton: {
    marginTop: theme.spacing.md,
    borderRadius: theme.border.radius.md,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  emptyActionText: {
    color: theme.colors.white,
    fontWeight: theme.typography.weights.bold,
    fontSize: theme.typography.sizes.sm,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  card: {
    width: "48%",
    borderRadius: theme.border.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
    ...theme.shadows.sm,
  },
  image: {
    width: "100%",
    height: 170,
    backgroundColor: theme.colors.background,
  },
  category: {
    padding: theme.spacing.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    fontSize: theme.typography.sizes.sm,
    backgroundColor: theme.colors.surface,
  },
  nameInputWrap: {
    marginBottom: theme.spacing.md,
  },
  nameLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.border.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text.primary,
    fontSize: theme.typography.sizes.base,
  },
  saveButton: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.border.radius.md,
    paddingVertical: theme.spacing.lg,
    alignItems: "center",
    marginTop: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  saveText: {
    color: theme.colors.white,
    fontWeight: theme.typography.weights.bold,
    fontSize: theme.typography.sizes.base,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

import React, { useState, useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import RemoteImage from "../components/RemoteImage";
import { getPublicOutfits, getPublicClothes, getUserProfile, saveOutfit, removeSavedOutfit } from "../services/storage";

export default function OutfitDetailScreen({ route, navigation }) {
  const { outfitId, userId } = route.params;

  const [outfit, setOutfit] = useState(null);
  const [clothes, setClothes] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [savingLoading, setSavingLoading] = useState(false);

  const loadDetails = useCallback(async () => {
    try {
      setLoading(true);
      const [outfitsData, clothesData, profileData] = await Promise.all([
        getPublicOutfits(userId),
        getPublicClothes(userId),
        getUserProfile(userId),
      ]);

      const outfitItem = outfitsData.find((o) => o.id === outfitId);
      if (outfitItem) {
        setOutfit(outfitItem);

        // Filter clothes that are in this outfit
        const outfitClothes = clothesData.filter((c) =>
          Array.isArray(outfitItem.clothesIds) && outfitItem.clothesIds.includes(c.id)
        );
        setClothes(outfitClothes);
      }

      setUserProfile(profileData);
    } catch (error) {
      console.error("Failed to load outfit details:", error);
      Alert.alert("Hata", "Kombin detayları yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [outfitId, userId]);

  useFocusEffect(
    useCallback(() => {
      loadDetails();
    }, [loadDetails])
  );

  const handleToggleSaveOutfit = async () => {
    setSavingLoading(true);
    try {
      if (isSaved) {
        await removeSavedOutfit(outfitId);
        setIsSaved(false);
        Alert.alert("Başarılı", "Kombin kaydınızdan kaldırıldı.");
      } else {
        await saveOutfit(outfitId);
        setIsSaved(true);
        Alert.alert("Başarılı", "Kombin kaydedildi!");
      }
    } catch (error) {
      Alert.alert("Hata", error.message || "İşlem başarısız.");
    } finally {
      setSavingLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F89DAC" />
        </View>
      </SafeAreaView>
    );
  }

  if (!outfit || !userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Kombin bulunamadı</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonText}>Geri Dön</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Header */}
        <View style={styles.heroHeader}>
          <View style={styles.heroPlaceholder}>
            <Text style={styles.heroEmoji}>✨</Text>
          </View>
          <Text style={styles.outfitName}>{outfit.name}</Text>
          <Text style={styles.outfitSubtitle}>{clothes.length} kıyafet</Text>
        </View>

        {/* Creator Card */}
        <View style={styles.creatorCard}>
          <View style={styles.creatorAvatarSection}>
            <View style={styles.creatorAvatar}>
              <Text style={styles.creatorAvatarEmoji}>👤</Text>
            </View>
            <View style={styles.creatorMeta}>
              <Text style={styles.creatorName}>{userProfile.name || "Kullanıcı"}</Text>
              {userProfile.display_name && (
                <Text style={styles.creatorHandle}>@{userProfile.display_name}</Text>
              )}
            </View>
          </View>

          {userProfile.bio && (
            <Text style={styles.creatorBio}>{userProfile.bio}</Text>
          )}

          {userProfile.location && (
            <Text style={styles.creatorLocation}>📍 {userProfile.location}</Text>
          )}

          <TouchableOpacity
            style={styles.visitProfileBtn}
            onPress={() =>
              navigation.navigate("OtherUserProfile", { userId: userProfile.id || userId })
            }
          >
            <Text style={styles.visitProfileBtnText}>Profili Ziyaret Et →</Text>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            isSaved && styles.saveButtonSaved,
          ]}
          onPress={handleToggleSaveOutfit}
          disabled={savingLoading}
        >
          <Text style={styles.saveButtonText}>
            {savingLoading ? "İşleniyor..." : isSaved ? "✓ Kaydedildi" : "💾 Kaydet"}
          </Text>
        </TouchableOpacity>

        {/* Clothes Grid */}
        {clothes.length > 0 ? (
          <View style={styles.clothesSection}>
            <Text style={styles.sectionTitle}>👕 Kıyafetler</Text>
            <View style={styles.clothGrid}>
              {clothes.map((cloth) => (
                <TouchableOpacity
                  key={cloth.id}
                  style={styles.clothGridItem}
                  onPress={() =>
                    navigation.navigate("ClothDetail", {
                      clothId: cloth.id,
                      userId: userId,
                    })
                  }
                >
                  <View style={styles.clothGridCard}>
                    <RemoteImage
                      publicUri={cloth.imageUri}
                      clothId={cloth.id}
                      style={styles.gridClothImage}
                    />
                    <View style={styles.gridClothOverlay} />
                    <Text style={styles.gridClothLabel}>{cloth.category}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.emptyClothes}>
            <Text style={styles.emptyClothesEmoji}>👕</Text>
            <Text style={styles.emptyClothesText}>Bu kombide kıyafet yok</Text>
          </View>
        )}

        {/* Details */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Paylaşılan Tarih</Text>
            <Text style={styles.detailValue}>
              {new Date(outfit.createdAt).toLocaleDateString("tr-TR")}
            </Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Durum</Text>
            <Text style={styles.detailValue}>
              {outfit.visibility === "public" ? "🌍 Herkese Açık" : "🔒 Gizli"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  content: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heroHeader: {
    backgroundColor: "#fff",
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginBottom: 1,
  },
  heroPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 14,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  heroEmoji: {
    fontSize: 32,
  },
  outfitName: {
    fontSize: 22,
    fontWeight: "900",
    color: "#000",
    marginBottom: 4,
    textAlign: "center",
  },
  outfitSubtitle: {
    fontSize: 13,
    color: "#999",
    fontWeight: "600",
  },
  creatorCard: {
    marginHorizontal: 12,
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  creatorAvatarSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 12,
  },
  creatorAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: "#FFE5ED",
    justifyContent: "center",
    alignItems: "center",
  },
  creatorAvatarEmoji: {
    fontSize: 20,
  },
  creatorMeta: {
    flex: 1,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#000",
    marginBottom: 2,
  },
  creatorHandle: {
    fontSize: 12,
    color: "#999",
    fontWeight: "600",
  },
  creatorBio: {
    fontSize: 13,
    color: "#555",
    fontWeight: "500",
    lineHeight: 18,
    marginBottom: 8,
  },
  creatorLocation: {
    fontSize: 11,
    color: "#FF6B9D",
    fontWeight: "700",
    marginBottom: 12,
  },
  visitProfileBtn: {
    backgroundColor: "#FF6B9D",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  visitProfileBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
  },
  saveButton: {
    marginHorizontal: 12,
    marginTop: 12,
    backgroundColor: "#FF6B9D",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonSaved: {
    backgroundColor: "#4CAF50",
    shadowColor: "#4CAF50",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
  clothesSection: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#000",
    marginBottom: 12,
  },
  clothGrid: {
    gap: 8,
  },
  clothGridItem: {
    marginBottom: 8,
  },
  clothGridCard: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  gridClothImage: {
    width: "100%",
    height: 140,
    backgroundColor: "#f5f5f5",
  },
  gridClothOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.08)",
  },
  gridClothLabel: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 4,
    textAlign: "center",
  },
  emptyClothes: {
    paddingVertical: 50,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  emptyClothesEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyClothesText: {
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },
  detailsCard: {
    marginHorizontal: 12,
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#666",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  detailDivider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 12,
  },
  emptyState: {
    paddingVertical: 80,
    alignItems: "center",
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },
});

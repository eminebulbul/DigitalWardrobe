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
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import RemoteImage from "../components/RemoteImage";
import { getPublicClothes, getUserProfile } from "../services/storage";

export default function ClothDetailScreen({ route, navigation }) {
  const { clothId, userId, hideStatus = false } = route.params;

  const [cloth, setCloth] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDetails = useCallback(async () => {
    try {
      setLoading(true);
      const [profileData, clothesData] = await Promise.all([
        getUserProfile(userId),
        getPublicClothes(userId),
      ]);

      const clothItem = clothesData.find((c) => c.id === clothId);
      if (clothItem) {
        setCloth(clothItem);
      }

      setUserProfile(profileData);
    } catch (error) {
      console.error("Failed to load cloth details:", error);
      Alert.alert("Hata", "Kıyafet detayları yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [clothId, userId]);

  useFocusEffect(
    useCallback(() => {
      loadDetails();
    }, [loadDetails])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B9D" />
        </View>
      </SafeAreaView>
    );
  }

  if (!cloth || !userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>Kıyafet bulunamadı</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <RemoteImage
            publicUri={cloth.imageUri}
            clothId={cloth.id}
            style={styles.mainImage}
          />
          <View style={styles.imageOverlay} />
          
          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{cloth.category}</Text>
          </View>
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

        {/* Description */}
        {cloth.description && (
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionLabel}>✍️ Açıklama</Text>
            <Text style={styles.descriptionText}>{cloth.description}</Text>
          </View>
        )}

        {/* Details */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Paylaşılan Tarih</Text>
            <Text style={styles.detailValue}>
              {new Date(cloth.createdAt).toLocaleDateString("tr-TR")}
            </Text>
          </View>
          {!hideStatus && (
            <>
              <View style={styles.detailDivider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Durum</Text>
                <Text style={styles.detailValue}>
                  {cloth.visibility === "public" ? "🌍 Herkese Açık" : "🔒 Gizli"}
                </Text>
              </View>
            </>
          )}
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
  imageContainer: {
    backgroundColor: "#fff",
    position: "relative",
    marginBottom: 1,
  },
  mainImage: {
    width: "100%",
    height: 350,
    backgroundColor: "#f5f5f5",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  categoryBadge: {
    position: "absolute",
    bottom: 16,
    left: 16,
    backgroundColor: "#FF6B9D",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryBadgeText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#fff",
  },
  creatorCard: {
    marginHorizontal: 12,
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
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
    marginBottom: 12,
    gap: 12,
  },
  creatorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFE5ED",
    justifyContent: "center",
    alignItems: "center",
  },
  creatorAvatarEmoji: {
    fontSize: 24,
  },
  creatorMeta: {
    flex: 1,
    justifyContent: "center",
  },
  creatorName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#000",
    marginBottom: 2,
  },
  creatorHandle: {
    fontSize: 13,
    color: "#999",
    fontWeight: "600",
  },
  creatorBio: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
    lineHeight: 20,
    marginBottom: 10,
  },
  creatorLocation: {
    fontSize: 12,
    color: "#FF6B9D",
    fontWeight: "700",
    marginBottom: 14,
  },
  visitProfileBtn: {
    backgroundColor: "#FF6B9D",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  visitProfileBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },
  descriptionCard: {
    marginHorizontal: 12,
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  descriptionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#666",
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
    lineHeight: 22,
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

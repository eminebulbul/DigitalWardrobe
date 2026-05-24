import React, { useState, useCallback, useMemo } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import RemoteImage from "../components/RemoteImage";
import { getPublicClothes, getPublicOutfits, getUserProfile } from "../services/storage";

export default function OtherUserProfileScreen({ route, navigation }) {
  const { userId } = route.params;

  const [userProfile, setUserProfile] = useState(null);
  const [clothes, setClothes] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contentTab, setContentTab] = useState("clothes");

  const loadUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      const [profile, clothesData, outfitsData] = await Promise.all([
        getUserProfile(userId),
        getPublicClothes(userId),
        getPublicOutfits(userId),
      ]);

      setUserProfile(profile);
      setClothes(clothesData);
      setOutfits(outfitsData);
    } catch (error) {
      console.error("Failed to load user profile:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadUserProfile();
    }, [loadUserProfile])
  );

  const renderClothItem = ({ item }) => (
    <TouchableOpacity
      style={styles.clothGridItem}
      onPress={() =>
        navigation.navigate("ClothDetail", {
          clothId: item.id,
          userId: userId,
        })
      }
    >
      <View style={styles.clothGridCard}>
        <RemoteImage
          publicUri={item.imageUri}
          clothId={item.id}
          style={styles.gridClothImage}
        />
        <View style={styles.gridClothOverlay} />
        <Text style={styles.gridClothLabel}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderOutfitItem = ({ item }) => (
    <TouchableOpacity
      style={styles.outfitListItem}
      onPress={() =>
        navigation.navigate("OutfitDetail", {
          outfitId: item.id,
          userId: userId,
        })
      }
    >
      <View style={styles.outfitCard}>
        <View style={styles.outfitPlaceholder}>
          <Text style={styles.outfitEmoji}>✨</Text>
        </View>
        <View style={styles.outfitInfo}>
          <Text style={styles.outfitName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.outfitItemCount}>
            {Array.isArray(item.clothesIds) ? item.clothesIds.length : 0} kıyafet
          </Text>
        </View>
        <Text style={styles.outfitArrow}>→</Text>
      </View>
    </TouchableOpacity>
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

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>Profil bulunamadı</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarEmojiLarge}>👤</Text>
          </View>

          <Text style={styles.userName}>{userProfile.name || "Kullanıcı"}</Text>

          {userProfile.display_name && (
            <Text style={styles.userHandle}>@{userProfile.display_name}</Text>
          )}

          {userProfile.bio && (
            <Text style={styles.userBio}>{userProfile.bio}</Text>
          )}

          {userProfile.location && (
            <View style={styles.locationBadge}>
              <Text style={styles.locationText}>📍 {userProfile.location}</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{clothes.length}</Text>
            <Text style={styles.statLabel}>Kıyafet</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{outfits.length}</Text>
            <Text style={styles.statLabel}>Kombin</Text>
          </View>
        </View>

        {/* Content Tabs */}
        <View style={styles.tabsGroup}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              contentTab === "clothes" && styles.tabButtonActive,
            ]}
            onPress={() => setContentTab("clothes")}
          >
            <Text
              style={[
                styles.tabButtonText,
                contentTab === "clothes" && styles.tabButtonTextActive,
              ]}
            >
              👕 Kıyafetler
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              contentTab === "outfits" && styles.tabButtonActive,
            ]}
            onPress={() => setContentTab("outfits")}
          >
            <Text
              style={[
                styles.tabButtonText,
                contentTab === "outfits" && styles.tabButtonTextActive,
              ]}
            >
              ✨ Kombinler
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {contentTab === "clothes" ? (
          <View>
            {clothes.length > 0 ? (
              <FlatList
                data={clothes}
                keyExtractor={(item) => item.id}
                renderItem={renderClothItem}
                numColumns={3}
                columnWrapperStyle={styles.clothGrid}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyContent}>
                <Text style={styles.emptyContentText}>Henüz kıyafet paylaşılmadı</Text>
              </View>
            )}
          </View>
        ) : (
          <View>
            {outfits.length > 0 ? (
              <FlatList
                data={outfits}
                keyExtractor={(item) => item.id}
                renderItem={renderOutfitItem}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyContent}>
                <Text style={styles.emptyContentText}>Henüz kombin paylaşılmadı</Text>
              </View>
            )}
          </View>
        )}
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
  profileHeader: {
    backgroundColor: "#fff",
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFE5ED",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarEmojiLarge: {
    fontSize: 40,
  },
  userName: {
    fontSize: 24,
    fontWeight: "900",
    color: "#000",
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
    marginBottom: 8,
  },
  userBio: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 12,
  },
  locationBadge: {
    backgroundColor: "#FFE5ED",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  locationText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FF6B9D",
  },
  statsContainer: {
    backgroundColor: "#fff",
    flexDirection: "row",
    marginTop: 1,
    paddingVertical: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#000",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#f0f0f0",
  },
  tabsGroup: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginTop: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: "#FF6B9D",
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#666",
  },
  tabButtonTextActive: {
    color: "#fff",
  },
  clothGrid: {
    gap: 8,
    paddingHorizontal: 12,
    marginTop: 12,
  },
  clothGridItem: {
    flex: 1,
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
    height: 150,
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
  outfitListItem: {
    marginHorizontal: 12,
    marginBottom: 10,
  },
  outfitCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  outfitPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
  },
  outfitEmoji: {
    fontSize: 24,
  },
  outfitInfo: {
    flex: 1,
  },
  outfitName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    marginBottom: 2,
  },
  outfitItemCount: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  outfitArrow: {
    fontSize: 18,
    color: "#FF6B9D",
    fontWeight: "700",
  },
  emptyContent: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyContentText: {
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
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

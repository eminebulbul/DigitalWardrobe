import React, { useState, useCallback } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getDiscoverOutfits, getDiscoverClothes, saveOutfit, removeSavedOutfit } from "../services/storage";
import RemoteImage from "../components/RemoteImage";

export default function DiscoverScreen({ navigation }) {
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sort, setSort] = useState("recent");
  const [savedMap, setSavedMap] = useState({});
  const [page, setPage] = useState(1);

  const loadAllContent = useCallback(async (pageNum = 1) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      }

      const [
        { outfits, pagination: outfitPagination },
        { clothes, pagination: clothesPagination },
      ] = await Promise.all([
        getDiscoverOutfits(pageNum, sort),
        getDiscoverClothes(pageNum, sort),
      ]);

      // Mix outfits and clothes
      const mixed = [];
      const maxLen = Math.max(outfits.length, clothes.length);
      for (let i = 0; i < maxLen; i++) {
        if (i < outfits.length) {
          mixed.push({ ...outfits[i], type: "outfit" });
        }
        if (i < clothes.length) {
          mixed.push({ ...clothes[i], type: "cloth" });
        }
      }

      if (pageNum === 1) {
        setAllItems(mixed);
      } else {
        setAllItems((prev) => [...prev, ...mixed]);
      }

      setPage(pageNum);
    } catch (error) {
      console.error("Load content failed:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sort]);

  useFocusEffect(
    useCallback(() => {
      loadAllContent(1);
    }, [sort, loadAllContent])
  );

  async function handleSaveOutfit(outfitId) {
    try {
      if (savedMap[outfitId]) {
        await removeSavedOutfit(outfitId);
        setSavedMap((prev) => {
          const next = { ...prev };
          delete next[outfitId];
          return next;
        });
      } else {
        await saveOutfit(outfitId);
        setSavedMap((prev) => ({ ...prev, [outfitId]: true }));
      }
    } catch (error) {
      alert("İşlem başarısız");
    }
  }

  const renderOutfitCard = (item) => (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() =>
        navigation.navigate("OutfitDetail", {
          outfitId: item.id,
          userId: item.user_id,
        })
      }
      activeOpacity={0.8}
    >
      <View style={styles.card}>
        <View style={styles.outfitBg}>
          <Text style={styles.outfitEmoji}>✨</Text>
        </View>
        <View style={styles.overlay} />
        <View style={styles.cardContent}>
          <View style={styles.creatorRow}>
            <View style={styles.avatarSmall}>
              <Text style={styles.avatar}>👤</Text>
            </View>
            <View style={styles.textContent}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("OtherUserProfile", { userId: item.user_id })
                }
              >
                <Text style={styles.creatorName}>{item.creator_name}</Text>
              </TouchableOpacity>
              <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
            </View>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>💾 {item.save_count}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.actionBtn, savedMap[item.id] && styles.actionBtnSaved]}
          onPress={() => handleSaveOutfit(item.id)}
        >
          <Text style={styles.actionBtnText}>{savedMap[item.id] ? "✓" : "💾"}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderClothCard = (item) => (
    <TouchableOpacity
      style={styles.clothContainer}
      onPress={() =>
        navigation.navigate("ClothDetail", {
          clothId: item.id,
          userId: item.userId,
        })
      }
      activeOpacity={0.8}
    >
      <View style={styles.clothCard}>
        <RemoteImage
          publicUri={item.imageUri}
          clothId={item.id}
          style={styles.clothImage}
        />
        <View style={styles.clothOverlay} />
        <View style={styles.clothInfo}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("OtherUserProfile", { userId: item.userId })
            }
          >
            <Text style={styles.clothCreator} numberOfLines={1}>{item.creatorName}</Text>
          </TouchableOpacity>
          <Text style={styles.clothCategory}>{item.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => {
    return item.type === "outfit" ? renderOutfitCard(item) : renderClothCard(item);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Keşfet</Text>
        <Text style={styles.headerSubtitle}>Yeni Trendler</Text>
      </View>

      <View style={styles.sortBar}>
        <TouchableOpacity
          style={[styles.sortBtn, sort === "recent" && styles.sortBtnActive]}
          onPress={() => {
            setSort("recent");
            setAllItems([]);
            setPage(1);
          }}
        >
          <Text style={styles.sortBtnText}>🕐 Yeni</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortBtn, sort === "trending" && styles.sortBtnActive]}
          onPress={() => {
            setSort("trending");
            setAllItems([]);
            setPage(1);
          }}
        >
          <Text style={styles.sortBtnText}>🔥 Trend</Text>
        </TouchableOpacity>
      </View>

      {loading && allItems.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF6B9D" />
        </View>
      ) : (
        <FlatList
          data={allItems}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          renderItem={renderItem}
          onEndReached={() => {
            if (!loading && allItems.length > 0) {
              loadAllContent(page + 1);
            }
          }}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadAllContent(1);
              }}
              tintColor="#FF6B9D"
            />
          }
          ListFooterComponent={
            loading && allItems.length > 0 ? (
              <View style={styles.footer}>
                <ActivityIndicator size="small" color="#FF6B9D" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>🌟</Text>
                <Text style={styles.emptyText}>Henüz içerik yok</Text>
              </View>
            ) : null
          }
          contentContainerStyle={styles.listContent}
          scrollEventThrottle={16}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#000",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#999",
    fontWeight: "600",
  },
  sortBar: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    gap: 8,
  },
  sortBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  sortBtnActive: {
    backgroundColor: "#FF6B9D",
  },
  sortBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#666",
  },
  listContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  cardContainer: {
    marginBottom: 12,
    marginHorizontal: 4,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 200,
  },
  outfitBg: {
    width: "100%",
    height: 140,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
  },
  outfitEmoji: {
    fontSize: 50,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  cardContent: {
    padding: 12,
    paddingBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  creatorRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginRight: 8,
  },
  avatarSmall: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    fontSize: 16,
  },
  textContent: {
    flex: 1,
  },
  creatorName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#000",
    marginBottom: 2,
  },
  title: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
  },
  badge: {
    backgroundColor: "#FFE5ED",
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FF6B9D",
  },
  actionBtn: {
    position: "absolute",
    bottom: 14,
    right: 14,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FF6B9D",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  actionBtnSaved: {
    backgroundColor: "#4CAF50",
  },
  actionBtnText: {
    fontSize: 18,
    color: "#fff",
  },
  clothContainer: {
    flex: 1,
    marginBottom: 10,
    marginHorizontal: 4,
  },
  clothCard: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  clothImage: {
    width: "100%",
    height: 180,
    backgroundColor: "#f5f5f5",
  },
  clothOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.12)",
  },
  clothInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  clothCreator: {
    fontSize: 11,
    fontWeight: "700",
    color: "#000",
    marginBottom: 2,
  },
  clothCategory: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FF6B9D",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  empty: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
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

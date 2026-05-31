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
import { getDiscoverOutfits, getDiscoverClothes, toggleFavoriteOutfit, toggleFavoriteCloth } from "../services/storage";
import RemoteImage from "../components/RemoteImage";
import OutfitCard from "../components/OutfitCard";
import theme from "../constants/theme";

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
      const previousSaved = Boolean(savedMap[outfitId]);
      setSavedMap((prev) => ({
        ...prev,
        [outfitId]: !previousSaved,
      }));

      await toggleFavoriteOutfit(outfitId);
      setSavedMap((prev) => ({
        ...prev,
        [outfitId]: true,
      }));
    } catch (error) {
      setSavedMap((prev) => ({
        ...prev,
        [outfitId]: Boolean(savedMap[outfitId]),
      }));
      alert("İşlem başarısız");
    }
  }

  async function handleSaveCloth(item) {
    try {
      const previousSaved = Boolean(savedMap[`cloth-${item.id}`]);
      setSavedMap((prev) => ({
        ...prev,
        [`cloth-${item.id}`]: !previousSaved,
      }));

      const result = await toggleFavoriteCloth(item.id);
      setSavedMap((prev) => {
        const next = { ...prev };
        if (result.favorite) {
          next[`cloth-${item.id}`] = true;
        } else {
          delete next[`cloth-${item.id}`];
        }
        return next;
      });
    } catch (error) {
      console.error("Save cloth failed:", error);
      setSavedMap((prev) => ({
        ...prev,
        [`cloth-${item.id}`]: Boolean(savedMap[`cloth-${item.id}`]),
      }));
      alert(error.message || "İşlem başarısız oldu");
    }
  }

  const renderOutfitCard = (item) => {
    return (
      <OutfitCard
        outfit={{
          name: item.name,
          createdAt: item.createdAt,
          pieces: Array.isArray(item.clothes) ? item.clothes : [],
        }}
        creatorName={item.creatorName || "Anonim"}
        onPress={() =>
          navigation.navigate("OutfitDetail", {
            outfitId: item.id,
          })
        }
        actionButton={
          <TouchableOpacity
            style={[styles.saveButton, savedMap[item.id] && styles.saveButtonActive]}
            onPress={() => handleSaveOutfit(item.id)}
            activeOpacity={0.85}
          >
            <Text style={[styles.saveButtonText, savedMap[item.id] && styles.saveButtonTextActive]}>
              Favorile
            </Text>
          </TouchableOpacity>
        }
      />
    );
  };

  const renderClothCard = (item) => (
    <TouchableOpacity
      style={styles.clothContainer}
      onPress={() =>
        navigation.navigate("ClothDetail", {
          clothId: item.id,
          userId: item.userId,
          hideStatus: true,
        })
      }
      activeOpacity={0.8}
    >
      <View style={styles.clothCard}>
        <RemoteImage
          publicUri={item.imageUri}
          clothId={item.id}
          style={styles.clothImage}
          isPublic={item.visibility === "public"}
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
          <TouchableOpacity
            style={[styles.saveButton, savedMap[`cloth-${item.id}`] && styles.saveButtonActive]}
            onPress={() => handleSaveCloth(item)}
            activeOpacity={0.85}
          >
            <Text style={[styles.saveButtonText, savedMap[`cloth-${item.id}`] && styles.saveButtonTextActive]}>
              {savedMap[`cloth-${item.id}`] ? "Favorilendi" : "Favorile"}
            </Text>
          </TouchableOpacity>
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
        <Text style={styles.headerTitle}>🔍 Keşfet</Text>
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
          <Text style={[styles.sortBtnText, sort === "recent" && styles.sortBtnTextActive]}>
            🕐 Yeni
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortBtn, sort === "trending" && styles.sortBtnActive]}
          onPress={() => {
            setSort("trending");
            setAllItems([]);
            setPage(1);
          }}
        >
          <Text style={[styles.sortBtnText, sort === "trending" && styles.sortBtnTextActive]}>
            🔥 Trend
          </Text>
        </TouchableOpacity>
      </View>

      {loading && allItems.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
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
              tintColor={theme.colors.primary}
            />
          }
          ListFooterComponent={
            loading && allItems.length > 0 ? (
              <View style={styles.footer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
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
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.xxxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  headerSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.tertiary,
    fontWeight: theme.typography.weights.semibold,
  },
  sortBar: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.sm,
  },
  sortBtn: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.border.radius.round,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
  },
  sortBtnActive: {
    backgroundColor: theme.colors.primary,
  },
  sortBtnText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.secondary,
  },
  sortBtnTextActive: {
    color: theme.colors.white,
  },
  listContent: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  clothContainer: {
    flex: 1,
    marginBottom: theme.spacing.md,
    marginHorizontal: theme.spacing.sm,
  },
  clothCard: {
    borderRadius: theme.border.radius.md,
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  clothImage: {
    width: "100%",
    height: 180,
    backgroundColor: theme.colors.background,
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
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  clothCreator: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  clothCategory: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primary,
  },
  saveButton: {
    marginTop: theme.spacing.xs,
    alignSelf: "flex-start",
    borderRadius: theme.border.radius.round,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  saveButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  saveButtonText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  saveButtonTextActive: {
    color: theme.colors.white,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    paddingVertical: theme.spacing.xl,
    alignItems: "center",
  },
  empty: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyEmoji: {
    fontSize: theme.typography.sizes.xxxl,
    marginBottom: theme.spacing.lg,
  },
  emptyText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.tertiary,
    fontWeight: theme.typography.weights.medium,
  },
});

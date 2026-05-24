// =====================
// SOCIAL FEATURES - Frontend Screens
// =====================

// === 1. DiscoverScreen.js (NEW) ===
// Keşfet sayfası - public kombinleri görüntüle, kaydet/beğen

import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { getDiscoverOutfits, saveOutfit } from "../services/storage";

export default function DiscoverScreen() {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("recent"); // 'recent' | 'trending'
  const [savedMap, setSavedMap] = useState({});

  useEffect(() => {
    loadDiscoverOutfits();
  }, [sort]);

  async function loadDiscoverOutfits() {
    setLoading(true);
    try {
      const { outfits: newOutfits, pagination } = await getDiscoverOutfits(1, sort);
      setOutfits(newOutfits);
      setPage(1);
    } catch (error) {
      console.error("Discover load failed:", error);
      alert("Keşfet yüklenemedi");
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    try {
      const { outfits: newOutfits } = await getDiscoverOutfits(page + 1, sort);
      setOutfits([...outfits, ...newOutfits]);
      setPage(page + 1);
    } catch (error) {
      console.error("Load more failed:", error);
    }
  }

  async function handleSaveOutfit(outfitId) {
    try {
      await saveOutfit(outfitId);
      setSavedMap({ ...savedMap, [outfitId]: true });
    } catch (error) {
      alert("Kombin kaydedilemedi");
    }
  }

  const renderOutfitCard = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.creatorName}>{item.creator_name}</Text>
      <Text style={styles.outfitName}>{item.name}</Text>
      <Text style={styles.saveCount}>💾 {item.save_count} kişi kaydetti</Text>
      
      <TouchableOpacity
        style={[styles.button, savedMap[item.id] && styles.buttonSaved]}
        onPress={() => handleSaveOutfit(item.id)}
      >
        <Text style={styles.buttonText}>
          {savedMap[item.id] ? "✓ Kaydedildi" : "Kaydet"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && outfits.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sort tabs */}
      <View style={styles.sortTabs}>
        <TouchableOpacity
          style={[styles.tab, sort === "recent" && styles.tabActive]}
          onPress={() => setSort("recent")}
        >
          <Text style={styles.tabText}>Yeni</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, sort === "trending" && styles.tabActive]}
          onPress={() => setSort("trending")}
        >
          <Text style={styles.tabText}>Trend</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={outfits}
        keyExtractor={(item) => item.id}
        renderItem={renderOutfitCard}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading && <ActivityIndicator />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  sortTabs: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderBottomWidth: 2,
    borderColor: "transparent",
  },
  tabActive: {
    borderColor: "#1E90FF",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  card: {
    margin: 10,
    padding: 12,
    backgroundColor: "white",
    borderRadius: 8,
    elevation: 2,
  },
  creatorName: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  outfitName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  saveCount: {
    fontSize: 12,
    color: "#999",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#1E90FF",
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 6,
  },
  buttonSaved: {
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});

// ===================================

// === 2. ProfileScreen.js (UPDATE) ===
// Profil sayfası - şu an temel ama tab structure gerekli

// Mevcut ProfileScreen'e eklenecekler:
// - UserProfileScreen (başka user'ın profili)
// - MyProfileScreen (kendi profilim - tab: Dolabım vs Profilim)

// === 3. CollectionScreen.js (UPDATE) ===
// Koleksiyon sayfası - iki tab: Kendi Kombinler + Kaydedilenler

// Mevcut CollectionScreen'e eklenecekler:
// - Tab 1: Kendi kombinlerim (existing)
// - Tab 2: Kaydedilenler (yeni)

// Örnek yapı:
/*
import React, { useEffect, useState } from "react";
import { View, FlatList } from "react-native";
import { getSavedOutfits } from "../services/storage";

export default function CollectionScreen() {
  const [tab, setTab] = useState("myOutfits"); // 'myOutfits' | 'saved'
  const [savedOutfits, setSavedOutfits] = useState([]);

  useEffect(() => {
    if (tab === "saved") {
      loadSavedOutfits();
    }
  }, [tab]);

  async function loadSavedOutfits() {
    try {
      const saved = await getSavedOutfits();
      setSavedOutfits(saved);
    } catch (error) {
      console.error("Failed to load saved outfits:", error);
    }
  }

  return (
    <View>
      {tab === "myOutfits" && <MyOutfitsTab />}
      {tab === "saved" && <SavedOutfitsTab outfits={savedOutfits} />}
    </View>
  );
}
*/

// ===================================

// === 4. ClothingCard.js & OutfitCard.js (UPDATE) ===
// Kartlara visibility toggle ve share button ekle

// Örnek visibility toggle button:
/*
<TouchableOpacity 
  onPress={() => updateClothingVisibility(item.id, 
    item.visibility === 'public' ? 'private' : 'public'
  )}
  style={styles.visibilityButton}
>
  <Text>{item.visibility === 'public' ? '🌐' : '🔒'}</Text>
</TouchableOpacity>
*/

// ===================================

// === 5. RemoteImage.js (UPDATE) ===
// Zaten mevcut ve public/authenticated URL fallback yapıyor
// Değişiklik gerekmeyebilir ama test et

// ===================================
// SCREEN HIERARCHY AFTER SOCIAL FEATURES:
// ===================================
/*
AppNavigator (Bottom Tab)
├─ WardrobeScreen (Dolabım)
├─ CreateOutfitScreen (Kombini Oluştur)
├─ DiscoverScreen (NEW - Keşfet)
├─ CollectionScreen (Koleksiyonum)
│  ├─ Tab 1: My Outfits
│  └─ Tab 2: Saved Outfits (NEW)
├─ ProfileScreen (Profil)
│  ├─ View 1: My Profile (Tab)
│  │  ├─ Dolabım (all clothes public+private)
│  │  └─ Profilim (only public clothes + profile info)
│  └─ View 2: Other User Profile (when navigating to user/:id)
│     ├─ Public Clothes
│     ├─ Public Outfits
│     └─ Profile Info (read-only)
└─ LoginScreen (existing)

MODAL/STACK SCREENS:
└─ CategoryGalleryScreen (existing)
*/

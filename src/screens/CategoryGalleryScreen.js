import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getClothes, removeClothing } from "../services/storage";

export default function CategoryGalleryScreen({ route }) {
  const { categoryName } = route.params || {};
  const [items, setItems] = useState([]);

  const loadItems = useCallback(async () => {
    const all = await getClothes();
    setItems(all.filter((item) => item.category === categoryName));
  }, [categoryName]);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  function handleDelete(item) {
    Alert.alert(
      "Kıyafeti Sil",
      "Bu kıyafet koleksiyondan kaldırılacak. Emin misin?",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            await removeClothing(item.id);
            await loadItems();
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{categoryName || "Kategori"}</Text>
      <Text style={styles.subtitle}>Bu kategoriye ait tüm kıyafetler</Text>

      {!items.length ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Bu kategoride henüz kıyafet yok.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.imageUri }} style={styles.image} />
              <Text style={styles.category}>{item.category}</Text>
              {!!item.description && (
                <Text numberOfLines={2} style={styles.description}>
                  {item.description}
                </Text>
              )}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item)}
              >
                <Text style={styles.deleteButtonText}>Sil</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f2ed",
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2b2622",
  },
  subtitle: {
    marginTop: 3,
    marginBottom: 12,
    color: "#6f685f",
  },
  listContent: {
    paddingBottom: 110,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 10,
  },
  card: {
    width: "48%",
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e7dfd3",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 180,
    backgroundColor: "#ece4d8",
  },
  category: {
    fontSize: 12,
    fontWeight: "800",
    color: "#4d463f",
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  description: {
    fontSize: 11,
    color: "#7a7166",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  deleteButton: {
    marginHorizontal: 8,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#efd5d5",
    backgroundColor: "#fff5f5",
    alignItems: "center",
    paddingVertical: 6,
  },
  deleteButtonText: {
    color: "#b34747",
    fontWeight: "800",
    fontSize: 12,
  },
  emptyBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#70685d",
  },
});

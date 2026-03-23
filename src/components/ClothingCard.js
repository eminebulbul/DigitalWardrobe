import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function ClothingCard({ item }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUri }} style={styles.image} />
      <View style={styles.metaRow}>
        <Text style={styles.category}>{item.category}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ece6dc",
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    backgroundColor: "#e8e4dc",
  },
  metaRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  category: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4f4a43",
  },
});

import React, { useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { CATEGORIES } from "../constants/categories";
import { addClothing, CURRENT_USER_ID } from "../services/storage";

export default function AddClothingScreen() {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [imageUri, setImageUri] = useState(null);
  const [tag, setTag] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function pickImageFromLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Izin gerekli", "Galeriye erisim izni verilmedi.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      aspect: [3, 4],
    });

    if (!result.canceled && result.assets?.length) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Izin gerekli", "Kameraya erisim izni verilmedi.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      aspect: [3, 4],
    });

    if (!result.canceled && result.assets?.length) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function saveClothing() {
    if (!imageUri) {
      Alert.alert("Eksik bilgi", "Lutfen bir kiyafet fotografi sec.");
      return;
    }

    setSaving(true);
    try {
      await addClothing({
        id: Date.now().toString(),
        userId: CURRENT_USER_ID,
        imageUri,
        category: selectedCategory,
        tag: tag.trim(),
        description: description.trim(),
      });
      setImageUri(null);
      setTag("");
      setDescription("");
      Alert.alert("Basarili", "Kiyafet gardirobuna eklendi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Kiyafet Ekle</Text>
        <Text style={styles.subtitleTop}>Fotograf sec, etiketle ve koleksiyona kaydet.</Text>

        <View style={styles.sectionCard}>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.button} onPress={pickImageFromLibrary}>
              <Text style={styles.buttonText}>Galeriden Sec</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={takePhoto}>
              <Text style={styles.buttonText}>Kamera ile Cek</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.previewBox}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : (
              <Text style={styles.previewText}>Once bir fotograf sec</Text>
            )}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.subtitle}>Kategori</Text>
          <View style={styles.categoriesRow}>
            {CATEGORIES.map((category) => {
              const active = category === selectedCategory;
              return (
                <TouchableOpacity
                  key={category}
                  style={[styles.categoryChip, active && styles.categoryChipActive]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[styles.categoryText, active && styles.categoryTextActive]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.subtitle}>Etiket</Text>
          <TextInput
            style={styles.input}
            value={tag}
            onChangeText={setTag}
            placeholder="Ornek: Spor, Ofis, Gunluk"
            placeholderTextColor="#90887c"
          />

          <Text style={styles.subtitle}>Aciklama</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Kiyafetin notu, mevsim bilgisi veya kombin onerisi"
            placeholderTextColor="#90887c"
            multiline
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={saveClothing}
          disabled={saving}
        >
          <Text style={styles.saveText}>{saving ? "Kaydediliyor..." : "Kaydet"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f2ed",
  },
  content: {
    padding: 16,
    paddingBottom: 110,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#27221e",
  },
  subtitleTop: {
    marginTop: 4,
    marginBottom: 12,
    color: "#6f685f",
  },
  sectionCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e7dfd3",
    backgroundColor: "#fff",
    padding: 14,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#2d6a5a",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
  previewBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e7dfd3",
    backgroundColor: "#fbf9f4",
    minHeight: 280,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 16,
  },
  previewImage: {
    width: "100%",
    height: 320,
  },
  previewText: {
    color: "#8a8176",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3f3a34",
    marginBottom: 8,
    marginTop: 8,
  },
  categoriesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#d8cebf",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  categoryChipActive: {
    borderColor: "#2f6f5e",
    backgroundColor: "#e8f1ee",
  },
  categoryText: {
    fontWeight: "600",
    color: "#635c53",
  },
  categoryTextActive: {
    color: "#2f6f5e",
  },
  input: {
    marginTop: 2,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd3c3",
    borderRadius: 12,
    backgroundColor: "#fcfaf6",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#2d2925",
  },
  textArea: {
    minHeight: 100,
  },
  saveButton: {
    marginTop: 4,
    backgroundColor: "#1f4b40",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
});

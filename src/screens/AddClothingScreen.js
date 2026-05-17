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
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { CATEGORIES } from "../constants/categories";
import { addClothing, CURRENT_USER_ID } from "../services/storage";
import { removeBackgroundFromImage } from "../services/backgroundRemoval";

const SORTED_CATEGORIES = CATEGORIES.slice().sort((a, b) =>
  a.localeCompare(b, "tr-TR", { sensitivity: "base" })
);

export default function AddClothingScreen() {
  const [selectedCategory, setSelectedCategory] = useState(SORTED_CATEGORIES[0]);
  const [isCategoryListOpen, setIsCategoryListOpen] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [removingBackground, setRemovingBackground] = useState(false);
  const [isBackgroundRemoved, setIsBackgroundRemoved] = useState(false);

  async function fitImageToCanvas(uri) {
    if (!uri) {
      return null;
    }

    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1080 } }],
      { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
    );

    return manipulated.uri;
  }

  async function pickImageFromLibrary() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("İzin gerekli", "Galeriye erişim izni verilmedi.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets?.length) {
        const fittedUri = await fitImageToCanvas(result.assets[0].uri);
        setImageUri(fittedUri || result.assets[0].uri);
        setIsBackgroundRemoved(false);
      }
    } catch (error) {
      if (error?.message !== "User cancelled") {
        Alert.alert("Hata", "Fotoğraf seçilemedi: " + error.message);
      }
    }
  }

  async function takePhoto() {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("İzin gerekli", "Kameraya erişim izni verilmedi.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets?.length) {
        const fittedUri = await fitImageToCanvas(result.assets[0].uri);
        setImageUri(fittedUri || result.assets[0].uri);
        setIsBackgroundRemoved(false);
      }
    } catch (error) {
      if (error?.message !== "User cancelled") {
        Alert.alert("Hata", "Fotoğraf çekilemedi: " + error.message);
      }
    }
  }

  async function handleRemoveBackground() {
    if (!imageUri) {
      Alert.alert("Eksik bilgi", "Önce bir fotoğraf seçmelisin.");
      return;
    }

    setRemovingBackground(true);
    try {
      const processedUri = await removeBackgroundFromImage(imageUri);
      setImageUri(processedUri);
      setIsBackgroundRemoved(true);
      Alert.alert("Başarılı", "Arkaplan silindi. Önizlemeyi kontrol edip kaydedebilirsin.");
    } catch (error) {
      Alert.alert("Hata", "Arkaplan silinemedi: " + error.message);
    } finally {
      setRemovingBackground(false);
    }
  }

  async function saveClothing() {
    if (!imageUri) {
      Alert.alert("Eksik bilgi", "Lütfen bir kıyafet fotoğrafı seç.");
      return;
    }

    setSaving(true);
    try {
      await addClothing({
        id: Date.now().toString(),
        userId: CURRENT_USER_ID,
        imageUri,
        category: selectedCategory,
        description: description.trim(),
      });
      setImageUri(null);
      setDescription("");
      setIsBackgroundRemoved(false);
      Alert.alert("Başarılı", "Kıyafet gardıroba eklendi.");
    } catch (error) {
      console.error("Error saving clothing:", error);
      Alert.alert("Hata", "Kıyafet kaydedilemedi: " + error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.heroKicker}>GARDIROB GENIŞLET</Text>
          <Text style={styles.heroTitle}>Yeni Kıyafet Ekle</Text>
          <Text style={styles.heroDescription}>Fotoğraf seç, temizle ve koleksiyona kaydet</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Fotoğraf</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.button} onPress={pickImageFromLibrary}>
              <Text style={styles.buttonText}>Galeriden Seç</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={takePhoto}>
              <Text style={styles.buttonText}>Kamera ile Çek</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.previewBox}>
            {imageUri ? (
              <>
                <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="contain" />
                <View style={styles.previewOverlay} pointerEvents="box-none">
                  <TouchableOpacity
                    style={[
                      styles.previewActionButton,
                      (removingBackground || saving) && styles.saveButtonDisabled,
                    ]}
                    onPress={handleRemoveBackground}
                    disabled={removingBackground || saving}
                  >
                    <Text style={styles.previewActionText}>
                      {removingBackground
                        ? "Siliniyor..."
                        : isBackgroundRemoved
                          ? "✓ Silindi"
                          : "Arkaplanı Sil"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <Text style={styles.previewText}>Önce bir fotoğraf seç</Text>
            )}
          </View>

          <Text style={styles.processHint}>
            {isBackgroundRemoved
              ? "✓ Arkaplan temizlendi. Şimdi kaydedebilirsin."
              : "Fotoğrafı seçip crop ekranında düzenleyebilir, sonra arkaplanı silebilirsin."}
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Kategori</Text>
          <Text style={styles.sectionDescription}>Kıyafeti en uygun kategoriye al ve düzenli tut.</Text>

          <TouchableOpacity
            style={styles.categoryDropdownTrigger}
            onPress={() => setIsCategoryListOpen((prev) => !prev)}
          >
            <Text style={styles.categoryDropdownText}>{selectedCategory}</Text>
            <Text style={styles.categoryDropdownArrow}>{isCategoryListOpen ? "▲" : "▼"}</Text>
          </TouchableOpacity>

          {isCategoryListOpen && (
            <View style={styles.categoryBlockGrid}>
              {SORTED_CATEGORIES.map((category) => {
                const active = category === selectedCategory;
                return (
                  <TouchableOpacity
                    key={category}
                    style={[styles.categoryBlock, active && styles.categoryBlockActive]}
                    onPress={() => {
                      setSelectedCategory(category);
                      setIsCategoryListOpen(false);
                    }}
                  >
                    <Text
                      style={[styles.categoryBlockText, active && styles.categoryBlockTextActive]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Açıklama</Text>
          <Text style={styles.sectionDescription}>Kıyafetin notu, mevsim bilgisi veya kombin önerisi</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Notlarını yaz..."
            placeholderTextColor="#90887c"
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.primaryActionsRow}>
          <TouchableOpacity
            style={[
              styles.primaryActionButton,
              styles.saveActionButton,
              saving && styles.saveButtonDisabled,
            ]}
            onPress={saveClothing}
            disabled={saving}
          >
            <Text style={styles.primaryActionText}>{saving ? "Kaydediliyor..." : "Kaydet"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAF7FF",
  },
  content: {
    padding: 16,
    paddingBottom: 110,
  },
  heroCard: {
    borderRadius: 18,
    backgroundColor: "#F89DAC",
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: 14,
    shadowColor: "#F89DAC",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  heroKicker: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFF4F7",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
  },
  heroDescription: {
    fontSize: 13,
    color: "#FFF4F7",
    fontWeight: "500",
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#CFE8F7",
    backgroundColor: "#fff",
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: "#3f3a34",
    marginBottom: 6,
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
    backgroundColor: "#F89DAC",
    alignItems: "center",
    shadowColor: "#F89DAC",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  previewBox: {
    position: "relative",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#CFE8F7",
    backgroundColor: "#F5FBFF",
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
  previewOverlay: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    alignItems: "flex-end",
  },
  previewActionButton: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "rgba(248, 157, 172, 0.95)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
    elevation: 3,
  },
  previewActionText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
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
  sectionDescription: {
    color: "#7d756b",
    marginBottom: 10,
    fontSize: 12,
    fontWeight: "500",
  },
  categoryDropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CFE8F7",
    backgroundColor: "#F5FBFF",
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginBottom: 10,
  },
  categoryDropdownText: {
    color: "#3d3731",
    fontSize: 13,
    fontWeight: "800",
  },
  categoryDropdownArrow: {
    color: "#F89DAC",
    fontWeight: "800",
    fontSize: 12,
  },
  categoryBlockGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  categoryBlock: {
    minWidth: "30%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CFE8F7",
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#F5FBFF",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryBlockActive: {
    borderColor: "#F89DAC",
    backgroundColor: "#FFF4F7",
  },
  categoryBlockText: {
    fontWeight: "700",
    color: "#5f584f",
    fontSize: 12,
  },
  categoryBlockTextActive: {
    color: "#F89DAC",
  },
  input: {
    marginTop: 2,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#CFE8F7",
    borderRadius: 12,
    backgroundColor: "#F5FBFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#2d2925",
  },
  textArea: {
    minHeight: 100,
  },
  processHint: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CFE8F7",
    backgroundColor: "#F5FBFF",
    color: "#547A91",
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: "500",
  },
  primaryActionsRow: {
    marginTop: 4,
    flexDirection: "row",
    gap: 10,
  },
  primaryActionButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  saveActionButton: {
    backgroundColor: "#F89DAC",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  primaryActionText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
});

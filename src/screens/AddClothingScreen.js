import React, { useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
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
import theme from "../constants/theme";

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
  const [isPublic, setIsPublic] = useState(false); // NEW: Kıyafet herkese açık mı?

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
        is_public: isPublic, // NEW: Kıyafet herkese açık mı?
      });
      setImageUri(null);
      setDescription("");
      setIsBackgroundRemoved(false);
      setIsPublic(false);
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
          <Text style={styles.heroKicker}>👕 GARDIROB GENIŞLET</Text>
          <Text style={styles.heroTitle}>Yeni Kıyafet Ekle</Text>
          <Text style={styles.heroDescription}>Fotoğraf seç, temizle ve koleksiyona kaydet</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>📸 Fotoğraf</Text>
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
          <Text style={styles.sectionHeading}>📦 Kategori</Text>
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
          <Text style={styles.sectionHeading}>✍️ Açıklama</Text>
          <Text style={styles.sectionDescription}>Kıyafetin notu, mevsim bilgisi veya kombin önerisi</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Notlarını yaz..."
            placeholderTextColor={theme.colors.text.tertiary}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* NEW: Visibility / is_public section */}
        <View style={styles.sectionCard}>
          <View style={styles.visibilityRow}>
            <View style={styles.visibilityTextGroup}>
              <Text style={styles.sectionHeading}>🌐 Profilde Görünsün</Text>
              <Text style={styles.sectionDescription}>
                Bu kıyafeti profilde herkese açık göster
              </Text>
            </View>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={isPublic ? theme.colors.secondary : theme.colors.white}
            />
          </View>
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
            <Text style={styles.primaryActionText}>{saving ? "Kaydediliyor..." : "💾 Kaydet"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 110,
  },
  heroCard: {
    borderRadius: theme.border.radius.lg,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  heroKicker: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
    letterSpacing: 1.2,
    marginBottom: theme.spacing.sm,
  },
  heroTitle: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
    marginBottom: theme.spacing.md,
  },
  heroDescription: {
    fontSize: theme.typography.sizes.sm,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: theme.typography.weights.medium,
  },
  sectionCard: {
    borderRadius: theme.border.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  sectionHeading: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  actionRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.border.radius.md,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    ...theme.shadows.sm,
  },
  buttonText: {
    color: theme.colors.white,
    fontWeight: theme.typography.weights.bold,
    fontSize: theme.typography.sizes.sm,
  },
  previewBox: {
    position: "relative",
    borderRadius: theme.border.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    minHeight: 280,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: theme.spacing.lg,
  },
  previewImage: {
    width: "100%",
    height: 320,
  },
  previewOverlay: {
    position: "absolute",
    left: theme.spacing.md,
    right: theme.spacing.md,
    bottom: theme.spacing.md,
    alignItems: "flex-end",
  },
  previewActionButton: {
    borderRadius: theme.border.radius.round,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  previewActionText: {
    color: theme.colors.white,
    fontWeight: theme.typography.weights.bold,
    fontSize: theme.typography.sizes.sm,
  },
  previewText: {
    color: theme.colors.text.secondary,
  },
  sectionDescription: {
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
  },
  categoryDropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: theme.border.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  categoryDropdownText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
  },
  categoryDropdownArrow: {
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.bold,
    fontSize: theme.typography.sizes.xs,
  },
  categoryBlockGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  categoryBlock: {
    minWidth: "30%",
    borderRadius: theme.border.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryBlockActive: {
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(208, 83, 83, 0.1)",
  },
  categoryBlockText: {
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.secondary,
    fontSize: theme.typography.sizes.xs,
  },
  categoryBlockTextActive: {
    color: theme.colors.primary,
  },
  input: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.border.radius.md,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  textArea: {
    minHeight: 100,
  },
  processHint: {
    borderRadius: theme.border.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    backgroundColor: "rgba(229, 143, 101, 0.1)",
    color: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
  },
  primaryActionsRow: {
    marginTop: theme.spacing.sm,
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  primaryActionButton: {
    flex: 1,
    borderRadius: theme.border.radius.md,
    paddingVertical: theme.spacing.lg,
    alignItems: "center",
    ...theme.shadows.sm,
  },
  saveActionButton: {
    backgroundColor: theme.colors.primary,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  primaryActionText: {
    color: theme.colors.white,
    fontWeight: theme.typography.weights.bold,
    fontSize: theme.typography.sizes.base,
  },
  // NEW: Visibility switch styles
  visibilityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  visibilityTextGroup: {
    flex: 1,
  },
});


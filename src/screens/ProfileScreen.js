import React, { useState, useCallback, useMemo } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { buildApiError, parseApiResponse, resolveApiBaseUrl } from "../services/api";
import RemoteImage from "../components/RemoteImage";
import theme from "../constants/theme";
import {
  getClothes,
  getOutfits,
  deleteClothing,
  deleteOutfit,
} from "../services/storage";

const API_BASE = resolveApiBaseUrl();

export default function ProfileScreen({ navigation }) {
  const { user, token, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [clothes, setClothes] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [contentTab, setContentTab] = useState("clothes");

  const loadProfile = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/api/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await parseApiResponse(response);
      if (data.ok && data.profile) {
        setProfile(data.profile);
        setDisplayName(data.profile.display_name || "");
        setBio(data.profile.bio || "");
        setLocation(data.profile.location || "");
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  }, [token]);

  const loadContent = useCallback(async () => {
    try {
      setLoadingContent(true);
      const [clothesData, outfitsData] = await Promise.all([
        getClothes(),
        getOutfits(),
      ]);
      setClothes(clothesData);
      setOutfits(outfitsData);
    } catch (error) {
      console.error("Failed to load content:", error);
    } finally {
      setLoadingContent(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
      loadContent();
    }, [loadProfile, loadContent])
  );

  async function handleUpdateProfile() {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/profile/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          displayName: displayName || null,
          bio: bio || null,
          location: location || null,
        }),
      });

      const data = await parseApiResponse(response);
      if (response.ok && data?.ok) {
        setProfile(data.profile);
        setEditing(false);
        Alert.alert("Başarılı", "Profil güncellendi.");
      } else {
        throw buildApiError(data, "Güncelleme başarısız.");
      }
    } catch (error) {
      Alert.alert("Hata", error.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    Alert.alert("Çıkış Yap", "Çıkış yapmak istediğinden emin misin?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Çıkış Yap",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  }

  async function handleDeleteClothing(clothId) {
    Alert.alert("Kıyafet Sil", "Bu kıyafeti silmek istediğinden emin misin?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteClothing(clothId);
            setClothes((prev) => prev.filter((c) => c.id !== clothId));
            Alert.alert("Başarılı", "Kıyafet silindi.");
          } catch (error) {
            Alert.alert("Hata", error.message || "Silme başarısız.");
          }
        },
      },
    ]);
  }

  async function handleDeleteOutfit(outfitId) {
    Alert.alert("Kombin Sil", "Bu kombini silmek istediğinden emin misin?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteOutfit(outfitId);
            setOutfits((prev) => prev.filter((o) => o.id !== outfitId));
            Alert.alert("Başarılı", "Kombin silindi.");
          } catch (error) {
            Alert.alert("Hata", error.message || "Silme başarısız.");
          }
        },
      },
    ]);
  }

  const publicClothes = useMemo(
    () => clothes.filter((item) => item.visibility === "public"),
    [clothes]
  );
  const publicOutfits = useMemo(
    () => outfits.filter((item) => item.visibility === "public"),
    [outfits]
  );

  const renderClothItem = ({ item }) => (
    <TouchableOpacity style={styles.clothGridItem}>
      <View style={styles.clothGridCard}>
        <RemoteImage
          publicUri={item.imageUri}
          clothId={item.id}
          style={styles.gridClothImage}
        />
        <View style={styles.gridClothOverlay} />
        <TouchableOpacity
          style={styles.deleteClothBtn}
          onPress={() => handleDeleteClothing(item.id)}
        >
          <Text style={styles.deleteClothBtnText}>🗑</Text>
        </TouchableOpacity>
        <View style={styles.gridClothLabel}>
          <Text style={styles.gridClothLabelText}>{item.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderOutfitItem = ({ item }) => (
    <TouchableOpacity style={styles.outfitListItem}>
      <View style={styles.outfitListCard}>
        <View style={styles.outfitPlaceholder}>
          <Text style={styles.outfitPlaceholderEmoji}>✨</Text>
        </View>
        <View style={styles.outfitListInfo}>
          <Text style={styles.outfitListName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.outfitListCount}>
            {Array.isArray(item.clothesIds) ? item.clothesIds.length : 0} kıyafet
          </Text>
          <View style={styles.outfitListBadge}>
            <Text style={styles.outfitListBadgeText}>
              🌍 Herkese Açık
            </Text>
          </View>
        </View>
        <View style={styles.outfitActionButtons}>
          <TouchableOpacity
            style={styles.outfitDeleteBtn}
            onPress={() => handleDeleteOutfit(item.id)}
          >
            <Text style={styles.outfitDeleteBtnText}>🗑</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarEmojiLarge}>👤</Text>
          </View>

          <Text style={styles.profileName}>{user?.name || "Kullanıcı"}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>

          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{publicClothes.length}</Text>
              <Text style={styles.statLabel}>Kıyafet</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{publicOutfits.length}</Text>
              <Text style={styles.statLabel}>Kombin</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{publicClothes.length + publicOutfits.length}</Text>
              <Text style={styles.statLabel}>Paylaşılan</Text>
            </View>
          </View>
        </View>

        {/* Edit Profile Form or Info */}
        {editing ? (
          <View style={styles.editCard}>
            <Text style={styles.editTitle}>✏️ Profili Düzenle</Text>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Görünen Ad</Text>
              <TextInput
                style={styles.formInput}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Görünen adını gir"
                placeholderTextColor="#ccc"
                editable={!loading}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Bio</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                value={bio}
                onChangeText={setBio}
                placeholder="Kısa bir açıklama yaz"
                placeholderTextColor="#ccc"
                multiline
                editable={!loading}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Konum</Text>
              <TextInput
                style={styles.formInput}
                value={location}
                onChangeText={setLocation}
                placeholder="Bulunduğun yeri gir"
                placeholderTextColor="#ccc"
                editable={!loading}
              />
            </View>

            <View style={styles.formButtonRow}>
              <TouchableOpacity
                style={styles.formBtnSecondary}
                onPress={() => setEditing(false)}
                disabled={loading}
              >
                <Text style={styles.formBtnSecondaryText}>Vazgeç</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.formBtnPrimary, loading && styles.formBtnDisabled]}
                onPress={handleUpdateProfile}
                disabled={loading}
              >
                <Text style={styles.formBtnPrimaryText}>
                  {loading ? "Kaydediliyor..." : "✓ Kaydet"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View>
            {/* Profile Info Card */}
            <View style={styles.profileInfoCard}>
              {profile?.display_name && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>👤 Görünen Ad</Text>
                  <Text style={styles.infoValue}>{profile.display_name}</Text>
                </View>
              )}

              {profile?.bio && (
                <View style={[styles.infoItem, profile?.display_name && styles.infoItemBorder]}>
                  <Text style={styles.infoLabel}>✍️ Bio</Text>
                  <Text style={styles.infoValue}>{profile.bio}</Text>
                </View>
              )}

              {profile?.location && (
                <View style={[styles.infoItem, (profile?.display_name || profile?.bio) && styles.infoItemBorder]}>
                  <Text style={styles.infoLabel}>📍 Konum</Text>
                  <Text style={styles.infoValue}>{profile.location}</Text>
                </View>
              )}

              {!profile?.display_name && !profile?.bio && !profile?.location && (
                <Text style={styles.infoEmpty}>Profil bilgisi henüz ayarlanmadı</Text>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => setEditing(true)}
              >
                <Text style={styles.actionBtnText}>✏️ Profili Düzenle</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnDanger]}
                onPress={handleLogout}
              >
                <Text style={[styles.actionBtnText, styles.actionBtnDangerText]}>🚪 Çıkış Yap</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Content Tabs */}
        {!editing && (
          <>
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
            {loadingContent ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B9D" />
              </View>
            ) : (
              <>
                {contentTab === "clothes" && (
                  <View>
                    {publicClothes.length > 0 && (
                      <View style={styles.contentSection}>
                        <Text style={styles.sectionTitle}>Kıyafetler ({publicClothes.length})</Text>
                        <View style={styles.clothGrid}>
                          {publicClothes.map((cloth) => (
                            <View key={cloth.id}>
                              {renderClothItem({ item: cloth })}
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {publicClothes.length === 0 && (
                      <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>👕</Text>
                        <Text style={styles.emptyText}>Herkese acik kiyafet bulunmuyor</Text>
                      </View>
                    )}
                  </View>
                )}

                {contentTab === "outfits" && (
                  <View>
                    {publicOutfits.length > 0 && (
                      <View style={styles.contentSection}>
                        <Text style={styles.sectionTitle}>Kombinler ({publicOutfits.length})</Text>
                        {publicOutfits.map((outfit) => (
                          <View key={outfit.id}>
                            {renderOutfitItem({ item: outfit })}
                          </View>
                        ))}
                      </View>
                    )}

                    {publicOutfits.length === 0 && (
                      <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>✨</Text>
                        <Text style={styles.emptyText}>Herkese acik kombin bulunmuyor</Text>
                      </View>
                    )}
                  </View>
                )}
              </>
            )}
          </>
        )}
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
    paddingBottom: 40,
  },
  profileHeader: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(208, 83, 83, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  avatarEmojiLarge: {
    fontSize: 40,
  },
  profileName: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  profileEmail: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.weights.medium,
    marginBottom: theme.spacing.lg,
  },
  statsBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.weights.medium,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
  },
  profileInfoCard: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.border.radius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.sm,
  },
  infoItem: {
    paddingVertical: theme.spacing.md,
  },
  infoItemBorder: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
  },
  infoLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  infoValue: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
    lineHeight: 20,
  },
  infoEmpty: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.tertiary,
    fontWeight: theme.typography.weights.medium,
    textAlign: "center",
    paddingVertical: theme.spacing.lg,
  },
  actionButtons: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  actionBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.border.radius.md,
    paddingVertical: theme.spacing.lg,
    alignItems: "center",
    ...theme.shadows.sm,
  },
  actionBtnDanger: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.error,
  },
  actionBtnText: {
    color: theme.colors.white,
    fontWeight: theme.typography.weights.bold,
    fontSize: theme.typography.sizes.sm,
  },
  actionBtnDangerText: {
    color: theme.colors.error,
  },
  editCard: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.border.radius.lg,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.sm,
  },
  editTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  formGroup: {
    marginBottom: theme.spacing.lg,
  },
  formLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  formInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.border.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background,
  },
  formTextArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  formButtonRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  formBtnSecondary: {
    flex: 1,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.border.radius.md,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
  },
  formBtnSecondaryText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.secondary,
  },
  formBtnPrimary: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.border.radius.md,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
    ...theme.shadows.sm,
  },
  formBtnPrimaryText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.white,
  },
  formBtnDisabled: {
    opacity: 0.6,
  },
  tabsGroup: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    marginTop: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  tabButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.border.radius.md,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  tabButtonText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.secondary,
  },
  tabButtonTextActive: {
    color: theme.colors.white,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  contentSection: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  clothGrid: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  clothGridItem: {
    marginBottom: theme.spacing.sm,
  },
  clothGridCard: {
    borderRadius: theme.border.radius.md,
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
    position: "relative",
  },
  gridClothImage: {
    width: "100%",
    height: 120,
    backgroundColor: theme.colors.surface,
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
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gridClothLabelText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    flex: 1,
  },
  outfitListItem: {
    marginBottom: theme.spacing.md,
  },
  outfitListCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.border.radius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    ...theme.shadows.sm,
  },
  outfitPlaceholder: {
    width: 45,
    height: 45,
    borderRadius: theme.border.radius.md,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  outfitPlaceholderEmoji: {
    fontSize: theme.typography.sizes.xl,
  },
  outfitListInfo: {
    flex: 1,
  },
  outfitListName: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  outfitListCount: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.tertiary,
    fontWeight: theme.typography.weights.medium,
    marginBottom: theme.spacing.sm,
  },
  outfitListBadge: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.border.radius.sm,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    alignSelf: "flex-start",
  },
  outfitListBadgeText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.secondary,
  },
  deleteClothBtn: {
    position: "absolute",
    top: theme.spacing.sm,
    left: theme.spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.error,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteClothBtnText: {
    fontSize: theme.typography.sizes.base,
  },
  outfitActionButtons: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  outfitDeleteBtn: {
    backgroundColor: theme.colors.error,
    borderRadius: theme.border.radius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  outfitDeleteBtnText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
  },
  emptyState: {
    paddingVertical: 60,
    paddingHorizontal: theme.spacing.md,
    alignItems: "center",
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.weights.medium,
  },
});

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
import {
  getClothes,
  getOutfits,
  updateClothingVisibility,
  updateOutfitVisibility,
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

  async function handleToggleClothingVisibility(clothId, currentVisibility) {
    try {
      const newVisibility = currentVisibility === "public" ? "private" : "public";
      await updateClothingVisibility(clothId, newVisibility);
      setClothes((prev) =>
        prev.map((c) =>
          c.id === clothId ? { ...c, visibility: newVisibility } : c
        )
      );
      Alert.alert(
        "Başarılı",
        `Kıyafet ${newVisibility === "public" ? "herkese açık" : "gizli"} olarak ayarlandı.`
      );
    } catch (error) {
      Alert.alert("Hata", error.message || "İşlem başarısız.");
    }
  }

  async function handleToggleOutfitVisibility(outfitId, currentVisibility) {
    try {
      const newVisibility = currentVisibility === "public" ? "private" : "public";
      await updateOutfitVisibility(outfitId, newVisibility);
      setOutfits((prev) =>
        prev.map((o) =>
          o.id === outfitId ? { ...o, visibility: newVisibility } : o
        )
      );
      Alert.alert(
        "Başarılı",
        `Kombin ${newVisibility === "public" ? "herkese açık" : "gizli"} olarak ayarlandı.`
      );
    } catch (error) {
      Alert.alert("Hata", error.message || "İşlem başarısız.");
    }
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

  const publicClothes = useMemo(() => clothes.filter((c) => c.visibility === "public"), [clothes]);
  const privateClothes = useMemo(() => clothes.filter((c) => c.visibility === "private"), [clothes]);
  const publicOutfits = useMemo(() => outfits.filter((o) => o.visibility === "public"), [outfits]);
  const privateOutfits = useMemo(() => outfits.filter((o) => o.visibility === "private"), [outfits]);

  const renderClothItem = ({ item, isPublic }) => (
    <TouchableOpacity style={styles.clothGridItem}>
      <View style={styles.clothGridCard}>
        <RemoteImage
          publicUri={item.imageUri}
          clothId={item.id}
          style={styles.gridClothImage}
        />
        <View style={styles.gridClothOverlay} />
        <View style={styles.gridClothBadge}>
          <Text style={styles.gridClothBadgeText}>{isPublic ? "🌍" : "🔒"}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteClothBtn}
          onPress={() => handleDeleteClothing(item.id)}
        >
          <Text style={styles.deleteClothBtnText}>🗑</Text>
        </TouchableOpacity>
        <View style={styles.gridClothLabel}>
          <Text style={styles.gridClothLabelText}>{item.category}</Text>
          <TouchableOpacity
            style={styles.toggleClothBtn}
            onPress={() =>
              handleToggleClothingVisibility(item.id, item.visibility)
            }
          >
            <Text style={styles.toggleClothBtnText}>
              {isPublic ? "Gizle" : "Paylaş"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderOutfitItem = ({ item, isPublic }) => (
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
              {isPublic ? "🌍 Herkese Açık" : "🔒 Gizli"}
            </Text>
          </View>
        </View>
        <View style={styles.outfitActionButtons}>
          <TouchableOpacity
            style={styles.outfitToggleBtn}
            onPress={() =>
              handleToggleOutfitVisibility(item.id, item.visibility)
            }
          >
            <Text style={styles.outfitToggleBtnText}>
              {isPublic ? "Gizle" : "Paylaş"}
            </Text>
          </TouchableOpacity>
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
              <Text style={styles.statValue}>{clothes.length}</Text>
              <Text style={styles.statLabel}>Kıyafet</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{outfits.length}</Text>
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
                        <Text style={styles.sectionTitle}>🌍 Herkese Açık ({publicClothes.length})</Text>
                        <View style={styles.clothGrid}>
                          {publicClothes.map((cloth) => (
                            <View key={cloth.id}>
                              {renderClothItem({ item: cloth, isPublic: true })}
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {privateClothes.length > 0 && (
                      <View style={styles.contentSection}>
                        <Text style={styles.sectionTitle}>🔒 Gizli ({privateClothes.length})</Text>
                        <View style={styles.clothGrid}>
                          {privateClothes.map((cloth) => (
                            <View key={cloth.id}>
                              {renderClothItem({ item: cloth, isPublic: false })}
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {clothes.length === 0 && (
                      <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>👕</Text>
                        <Text style={styles.emptyText}>Henüz kıyafet eklenmedi</Text>
                      </View>
                    )}
                  </View>
                )}

                {contentTab === "outfits" && (
                  <View>
                    {publicOutfits.length > 0 && (
                      <View style={styles.contentSection}>
                        <Text style={styles.sectionTitle}>🌍 Herkese Açık ({publicOutfits.length})</Text>
                        {publicOutfits.map((outfit) => (
                          <View key={outfit.id}>
                            {renderOutfitItem({ item: outfit, isPublic: true })}
                          </View>
                        ))}
                      </View>
                    )}

                    {privateOutfits.length > 0 && (
                      <View style={styles.contentSection}>
                        <Text style={styles.sectionTitle}>🔒 Gizli ({privateOutfits.length})</Text>
                        {privateOutfits.map((outfit) => (
                          <View key={outfit.id}>
                            {renderOutfitItem({ item: outfit, isPublic: false })}
                          </View>
                        ))}
                      </View>
                    )}

                    {outfits.length === 0 && (
                      <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>✨</Text>
                        <Text style={styles.emptyText}>Henüz kombin oluşturulmadı</Text>
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
    backgroundColor: "#FAFAFA",
  },
  content: {
    paddingBottom: 40,
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
  profileName: {
    fontSize: 24,
    fontWeight: "900",
    color: "#000",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
    marginBottom: 16,
  },
  statsBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#000",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "#999",
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#f0f0f0",
  },
  profileInfoCard: {
    marginHorizontal: 12,
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  infoItem: {
    paddingVertical: 10,
  },
  infoItemBorder: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#666",
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    lineHeight: 20,
  },
  infoEmpty: {
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
    textAlign: "center",
    paddingVertical: 16,
  },
  actionButtons: {
    marginHorizontal: 12,
    marginTop: 12,
    gap: 10,
  },
  actionBtn: {
    backgroundColor: "#FF6B9D",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  actionBtnDanger: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#ff4444",
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },
  actionBtnDangerText: {
    color: "#ff4444",
  },
  editCard: {
    marginHorizontal: 12,
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  editTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#000",
    marginBottom: 14,
  },
  formGroup: {
    marginBottom: 14,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#666",
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
  },
  formTextArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  formButtonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  formBtnSecondary: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  formBtnSecondaryText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#666",
  },
  formBtnPrimary: {
    flex: 1,
    backgroundColor: "#FF6B9D",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  formBtnPrimaryText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  formBtnDisabled: {
    opacity: 0.6,
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
  loadingContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  contentSection: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#000",
    marginBottom: 10,
  },
  clothGrid: {
    gap: 8,
    marginBottom: 12,
  },
  clothGridItem: {
    marginBottom: 8,
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
    position: "relative",
  },
  gridClothImage: {
    width: "100%",
    height: 120,
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
  gridClothBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  gridClothBadgeText: {
    fontSize: 14,
  },
  gridClothLabel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gridClothLabelText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    flex: 1,
  },
  toggleClothBtn: {
    backgroundColor: "#FF6B9D",
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  toggleClothBtnText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
  outfitListItem: {
    marginBottom: 10,
  },
  outfitListCard: {
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
    width: 45,
    height: 45,
    borderRadius: 8,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
  },
  outfitPlaceholderEmoji: {
    fontSize: 20,
  },
  outfitListInfo: {
    flex: 1,
  },
  outfitListName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    marginBottom: 2,
  },
  outfitListCount: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
    marginBottom: 4,
  },
  outfitListBadge: {
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 8,
    alignSelf: "flex-start",
  },
  outfitListBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#666",
  },
  outfitToggleBtn: {
    backgroundColor: "#FF6B9D",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  outfitToggleBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  deleteClothBtn: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteClothBtnText: {
    fontSize: 16,
  },
  outfitActionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  outfitDeleteBtn: {
    backgroundColor: "rgba(255, 0, 0, 0.8)",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  outfitDeleteBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },
  emptyState: {
    paddingVertical: 60,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },
});

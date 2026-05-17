import React, { useState, useCallback } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { buildApiError, parseApiResponse, resolveApiBaseUrl } from "../services/api";

const API_BASE = resolveApiBaseUrl();

export default function ProfileScreen() {
  const { user, token, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

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

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.heroKicker}>PROFİL</Text>
          <Text style={styles.heroTitle}>{user?.name || "Kullanıcı"}</Text>
          <Text style={styles.heroSubtitle}>{user?.email}</Text>
        </View>

        {editing ? (
          <View style={styles.formCard}>
            <Text style={styles.label}>Görünen Ad</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Görünen adını gir"
              placeholderTextColor="#999"
              editable={!loading}
            />

            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Kısa bir açıklama yaz"
              placeholderTextColor="#999"
              multiline
              editable={!loading}
            />

            <Text style={styles.label}>Konum</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Bulunduğun yeri gir"
              placeholderTextColor="#999"
              editable={!loading}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => setEditing(false)}
                disabled={loading}
              >
                <Text style={styles.buttonSecondaryText}>Vazgeç</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleUpdateProfile}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Kaydediliyor..." : "Kaydet"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Görünen Ad:</Text>
              <Text style={styles.infoValue}>
                {profile?.display_name || "Ayarlanmadı"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Bio:</Text>
              <Text style={styles.infoValue}>{profile?.bio || "Ayarlanmadı"}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Konum:</Text>
              <Text style={styles.infoValue}>
                {profile?.location || "Ayarlanmadı"}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={() => setEditing(true)}
            >
              <Text style={styles.buttonText}>Profili Düzenle</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, styles.buttonLogout]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonLogoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
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
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: "#F89DAC",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 24,
    marginBottom: 16,
    alignItems: "center",
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
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: "#FFF4F7",
    fontWeight: "500",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#CFE8F7",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#666",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#CFE8F7",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CFE8F7",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
    backgroundColor: "#F5FBFF",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  button: {
    backgroundColor: "#F89DAC",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    shadowColor: "#F89DAC",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: "#F5FBFF",
    borderWidth: 1,
    borderColor: "#CFE8F7",
  },
  buttonSecondaryText: {
    color: "#F89DAC",
    fontWeight: "800",
    fontSize: 14,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonLogout: {
    backgroundColor: "#ff6b6b",
    marginTop: 8,
  },
  buttonLogoutText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },
});

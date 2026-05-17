import React, { useState } from "react";
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
import { useAuth } from "../context/AuthContext";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Hata", "Email ve şifre gereklidir.");
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      if (!result.ok) {
        Alert.alert("Giriş Başarısız", result.message || "Lütfen tekrar deneyin.");
      }
    } catch (error) {
      Alert.alert("Hata", error.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.title}>Dijital Gardırob</Text>
          <Text style={styles.subtitle}>Giriş Yap</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="seni@example.com"
            placeholderTextColor="#999"
            keyboardType="email-address"
            editable={!loading}
          />

          <Text style={styles.label}>Şifre</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Şifreni gir"
            placeholderTextColor="#999"
            secureTextEntry
            autoComplete="off"
            textContentType="none"
            importantForAutofill="no"
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Hesabın yok mu? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")} disabled={loading}>
              <Text style={[styles.footerLink, loading && styles.disabled]}>
                Kayıt Ol
              </Text>
            </TouchableOpacity>
          </View>
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
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: "#F89DAC",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 24,
    marginBottom: 24,
    alignItems: "center",
    shadowColor: "#F89DAC",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#FFF4F7",
    fontWeight: "600",
  },
  form: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#CFE8F7",
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
  button: {
    backgroundColor: "#F89DAC",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#F89DAC",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  footerText: {
    color: "#666",
    fontSize: 14,
  },
  footerLink: {
    color: "#F89DAC",
    fontWeight: "700",
    fontSize: 14,
  },
  disabled: {
    opacity: 0.5,
  },
});

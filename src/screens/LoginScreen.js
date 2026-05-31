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
import theme from "../constants/theme";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { login } = useAuth();

  const getInputStyle = (field) => [
    styles.input,
    focusedField === field && styles.inputFocused,
  ];

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
            style={getInputStyle("email")}
            value={email}
            onChangeText={setEmail}
            placeholder="seni@example.com"
            placeholderTextColor={theme.colors.text.tertiary}
            keyboardType="email-address"
            editable={!loading}
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
          />

          <Text style={styles.label}>Şifre</Text>
          <TextInput
            style={getInputStyle("password")}
            value={password}
            onChangeText={setPassword}
            placeholder="Şifreni gir"
            placeholderTextColor={theme.colors.text.tertiary}
            secureTextEntry
            autoComplete="off"
            textContentType="none"
            importantForAutofill="no"
            editable={!loading}
            onFocus={() => setFocusedField("password")}
            onBlur={() => setFocusedField(null)}
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
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  heroCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.border.radius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    alignItems: "center",
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: theme.typography.sizes.xxxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.light,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.light,
    fontWeight: theme.typography.weights.semibold,
  },
  form: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.border.radius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.text.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.border.radius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.surface,
  },
  inputFocused: {
    borderColor: theme.colors.primary,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.border.radius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
    marginTop: theme.spacing.xl,
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: theme.colors.text.light,
    fontWeight: theme.typography.weights.semibold,
    fontSize: theme.typography.sizes.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: theme.spacing.lg,
  },
  footerText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.sizes.sm,
  },
  footerLink: {
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.semibold,
    fontSize: theme.typography.sizes.sm,
  },
  disabled: {
    opacity: 0.5,
  },
});

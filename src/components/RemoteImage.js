import React, { useEffect, useState } from "react";
import { Image, View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import { resolveApiBaseUrl } from "../services/api";

const API_BASE = resolveApiBaseUrl();

export default function RemoteImage({ publicUri, clothId, style, fallback }) {
  const { token } = useAuth();
  const [src, setSrc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    async function probe() {
      try {
        if (!publicUri) {
          setSrc(null);
          setLoading(false);
          return;
        }

        // If the provided URI already points to our proxy, use it directly
        if (publicUri.includes("/api/clothes/") && publicUri.includes("/image")) {
          if (mounted) setSrc(publicUri);
          return;
        }

        // Try fetching the public URI (small HEAD-like request)
        const res = await fetch(publicUri, { method: "GET", signal: controller.signal });
        if (res.ok) {
          if (mounted) setSrc(publicUri);
        } else {
          // fallback to proxy with token if available
          const proxy = `${API_BASE}/api/clothes/${clothId}/image${token ? `?token=${encodeURIComponent(token)}` : ""}`;
          if (mounted) setSrc(proxy);
        }
      } catch (error) {
        const proxy = `${API_BASE}/api/clothes/${clothId}/image${token ? `?token=${encodeURIComponent(token)}` : ""}`;
        if (mounted) setSrc(proxy);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    probe();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [publicUri, clothId, token]);

  if (loading) {
    return (
      <View style={[styles.center, style]}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!src) {
    return (
      <View style={[styles.center, style]}>
        {fallback}
      </View>
    );
  }

  return <Image source={{ uri: src }} style={style} />;
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
});

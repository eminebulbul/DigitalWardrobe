import React, { useEffect, useState } from "react";
import { Image, View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import { resolveApiBaseUrl } from "../services/api";

const API_BASE = resolveApiBaseUrl();

export default function RemoteImage({ publicUri, clothId, style, fallback, isPublic = false }) {
  const { token } = useAuth();
  const [src, setSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usedFallbackProxy, setUsedFallbackProxy] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!publicUri) {
      setSrc(null);
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    // Absolute URLs can be loaded directly. Relative/private URLs can still
    // use the authenticated proxy endpoint.
    if (publicUri.startsWith("http://") || publicUri.startsWith("https://")) {
      setSrc(publicUri);
    } else if (publicUri.includes("/api/clothes/") && publicUri.includes("/image")) {
      setSrc(publicUri);
    } else {
      const proxy = `${API_BASE}/api/clothes/${clothId}/image${!isPublic && token ? `?token=${encodeURIComponent(token)}` : ""}`;
      setSrc(proxy);
    }

    setUsedFallbackProxy(false);
    setLoading(false);

    return () => {
      mounted = false;
    };
  }, [publicUri, clothId, token, isPublic]);

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

  return (
    <Image
      source={{ uri: src }}
      style={style}
      onError={() => {
        if (usedFallbackProxy) {
          return;
        }

        const proxy = `${API_BASE}/api/clothes/${clothId}/image${!isPublic && token ? `?token=${encodeURIComponent(token)}` : ""}`;
        setUsedFallbackProxy(true);
        setSrc(proxy);
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
});

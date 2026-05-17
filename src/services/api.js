import Constants from "expo-constants";
import { NativeModules } from "react-native";

export function resolveApiBaseUrl(envKey = "EXPO_PUBLIC_API_URL") {
  const envUrl = process.env[envKey] || process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri;

  if (hostUri) {
    // hostUri can be like "exp://192.168.1.5:19000" or "http://192.168.1.5:19000"
    // extract the hostname part safely (protocol://hostname:port)
    const match = hostUri.match(/^[a-z0-9+.-]+:\/\/([^/:]+)/i);
    // If match found, use the captured hostname (without port). Otherwise
    // fallback to splitting by ':' to remove any appended port if present.
    const host = match?.[1] || hostUri.split(":")[0];
    return `http://${host}:3001`;
  }

  const scriptURL = NativeModules.SourceCode?.scriptURL;
  if (scriptURL) {
    const match = scriptURL.match(/https?:\/\/([^/:]+)/);
    if (match?.[1]) {
      return `http://${match[1]}:3001`;
    }
  }

  return "http://localhost:3001";
}

export async function parseApiResponse(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return { ok: false, message: text };
  }
}

export function buildApiError(data, fallbackMessage) {
  const parts = [data?.message, data?.details].filter(Boolean);
  return new Error(parts.length ? parts.join(": ") : fallbackMessage);
}

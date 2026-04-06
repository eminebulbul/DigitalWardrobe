import * as FileSystem from "expo-file-system/legacy";
import Constants from "expo-constants";
import { NativeModules } from "react-native";

function resolveBackendBaseUrl() {
  const envUrl = process.env.EXPO_PUBLIC_BG_API_URL;
  if (envUrl) {
    return envUrl;
  }

  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri;

  if (hostUri) {
    const host = hostUri.split(":")[0];
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

const BACKEND_BASE_URL = resolveBackendBaseUrl();

export async function removeBackgroundFromImage(imageUri) {
  const formData = new FormData();
  formData.append("image", {
    uri: imageUri,
    type: "image/jpeg",
    name: "clothing.jpg",
  });

  const response = await fetch(`${BACKEND_BASE_URL}/api/remove-background`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok || !data?.ok) {
    throw new Error(data?.details || data?.message || "Arkaplan silme başarısız.");
  }

  const targetUri = `${FileSystem.cacheDirectory}bg-removed-${Date.now()}.png`;
  await FileSystem.writeAsStringAsync(targetUri, data.imageBase64, {
    encoding: "base64",
  });

  return targetUri;
}

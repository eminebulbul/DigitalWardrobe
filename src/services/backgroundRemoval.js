import * as FileSystem from "expo-file-system/legacy";
import { buildApiError, parseApiResponse, resolveApiBaseUrl } from "./api";

const BACKEND_BASE_URL = resolveApiBaseUrl("EXPO_PUBLIC_BG_API_URL");

export async function removeBackgroundFromImage(imageUri) {
  try {
    console.log("removeBackgroundFromImage -> backend:", BACKEND_BASE_URL);

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

    const data = await parseApiResponse(response);

    if (!response.ok || !data?.ok) {
      throw buildApiError(data, "Arkaplan silme başarısız.");
    }

    const targetUri = `${FileSystem.cacheDirectory}bg-removed-${Date.now()}.png`;
    await FileSystem.writeAsStringAsync(targetUri, data.imageBase64, {
      encoding: "base64",
    });

    return targetUri;
  } catch (error) {
    console.error("removeBackgroundFromImage error:", error);
    throw new Error(
      error?.message || "Arkaplan silme sırasında bilinmeyen bir hata oluştu"
    );
  }
}

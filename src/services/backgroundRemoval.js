import * as FileSystem from "expo-file-system/legacy";

const BACKEND_BASE_URL = "http://172.16.1.140:3001";

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

import AsyncStorage from "@react-native-async-storage/async-storage";
import { buildApiError, parseApiResponse, resolveApiBaseUrl } from "./api";

const CLOTHES_KEY = "@digital_wardrobe_clothes";
const OUTFITS_KEY = "@digital_wardrobe_outfits";

export const CURRENT_USER_ID = "demo-user-1";

const API_BASE = resolveApiBaseUrl();

function safeParse(value, fallback = []) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    return fallback;
  }
}

function normalizeImageUrl(imageUrl) {
  if (!imageUrl) {
    return imageUrl;
  }

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  if (imageUrl.startsWith("/")) {
    return `${API_BASE}${imageUrl}`;
  }

  return `${API_BASE}/${imageUrl.replace(/^\/+/, "")}`;
}

function mapClothingImageUrl(clothing, token = null) {
  if (!clothing?.image_url) {
    return clothing?.image_url;
  }

  if (clothing.image_url.startsWith("/")) {
    return normalizeImageUrl(clothing.image_url);
  }

  if (clothing.image_url.startsWith("http://") || clothing.image_url.startsWith("https://")) {
    // Public URLs (for example r2.dev or other CDN links) can be used directly.
    // Private R2 endpoint URLs should still go through the authenticated proxy.
    if (!clothing.image_url.includes(".r2.cloudflarestorage.com")) {
      return clothing.image_url;
    }

    const baseProxyUrl = `${API_BASE}/api/clothes/${clothing.id}/image`;
    if (!token) {
      return baseProxyUrl;
    }
    return `${baseProxyUrl}?token=${encodeURIComponent(token)}`;
  }

  return normalizeImageUrl(clothing.image_url);
}

async function getAuthToken() {
  try {
    return await AsyncStorage.getItem("authToken");
  } catch (error) {
    return null;
  }
}

function getImageUploadMeta(uri, id) {
  const cleanUri = (uri || "").split("?")[0].toLowerCase();
  const isPng = cleanUri.endsWith(".png");
  const extension = isPng ? "png" : "jpg";

  return {
    name: id ? `${id}.${extension}` : `photo.${extension}`,
    type: isPng ? "image/png" : "image/jpeg",
  };
}

export async function getClothes(userId = CURRENT_USER_ID) {
  const token = await getAuthToken();
  if (token) {
    const res = await fetch(`${API_BASE}/api/clothes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await parseApiResponse(res);
    if (!res.ok || !data?.ok) {
      throw buildApiError(data, "Failed to load clothes");
    }
    // normalize to previous local shape
    return data.clothes.map((c) => ({
      id: c.id,
      userId: c.user_id,
      imageUri: mapClothingImageUrl(c, token),
      category: c.category,
      description: c.description,
      createdAt: c.created_at,
    }));
  }

  const raw = await AsyncStorage.getItem(CLOTHES_KEY);
  const all = safeParse(raw);
  return all.filter((item) => item.userId === userId);
}

export async function addClothing(item) {
  const token = await getAuthToken();
  if (token) {
    const form = new FormData();
    const imageMeta = getImageUploadMeta(item.imageUri, item.id);
    form.append("image", {
      uri: item.imageUri,
      name: imageMeta.name,
      type: imageMeta.type,
    });
    if (item.category) form.append("category", item.category);
    if (item.description) form.append("description", item.description);

    const res = await fetch(`${API_BASE}/api/clothes`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });

    const data = await parseApiResponse(res);
    if (!res.ok || !data?.ok) {
      throw buildApiError(data, "Failed to upload clothing");
    }
    return {
      id: data.cloth.id,
      userId: data.cloth.user_id,
      imageUri: mapClothingImageUrl(data.cloth, token),
      category: data.cloth.category,
      description: data.cloth.description,
      createdAt: data.cloth.created_at,
    };
  }

  const raw = await AsyncStorage.getItem(CLOTHES_KEY);
  const all = safeParse(raw);
  all.push(item);
  await AsyncStorage.setItem(CLOTHES_KEY, JSON.stringify(all));
}

export async function removeClothing(clothingId, userId = CURRENT_USER_ID) {
  const token = await getAuthToken();
  if (token) {
    await fetch(`${API_BASE}/api/clothes/${clothingId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return;
  }

  const raw = await AsyncStorage.getItem(CLOTHES_KEY);
  const all = safeParse(raw);
  const nextClothes = all.filter(
    (item) => !(item.userId === userId && item.id === clothingId)
  );
  await AsyncStorage.setItem(CLOTHES_KEY, JSON.stringify(nextClothes));

  // Silinen kıyafeti kullanan kayıtlı kombinleri de temizle.
  const outfitsRaw = await AsyncStorage.getItem(OUTFITS_KEY);
  const outfits = safeParse(outfitsRaw);
  const nextOutfits = outfits
    .map((outfit) => ({
      ...outfit,
      clothesIds: Array.isArray(outfit.clothesIds)
        ? outfit.clothesIds.filter((id) => id !== clothingId)
        : [],
    }))
    .filter((outfit) => outfit.clothesIds.length > 0);

  await AsyncStorage.setItem(OUTFITS_KEY, JSON.stringify(nextOutfits));
}

export async function getOutfits(userId = CURRENT_USER_ID) {
  const token = await getAuthToken();
  if (token) {
    const res = await fetch(`${API_BASE}/api/outfits`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await parseApiResponse(res);
    if (!res.ok || !data?.ok) throw buildApiError(data, "Failed to load outfits");
    return data.outfits.map((o) => ({
      id: o.id,
      userId: o.user_id,
      name: o.name,
      clothesIds: o.clothes_ids,
      createdAt: o.created_at,
    }));
  }

  const raw = await AsyncStorage.getItem(OUTFITS_KEY);
  const all = safeParse(raw);
  return all.filter((item) => item.userId === userId);
}

export async function addOutfit(outfit) {
  const token = await getAuthToken();
  if (token) {
    const res = await fetch(`${API_BASE}/api/outfits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: outfit.name, clothesIds: outfit.clothesIds }),
    });
    const data = await parseApiResponse(res);
    if (!res.ok || !data?.ok) throw buildApiError(data, "Failed to save outfit");
    return data.outfit;
  }

  const raw = await AsyncStorage.getItem(OUTFITS_KEY);
  const all = safeParse(raw);
  all.push(outfit);
  await AsyncStorage.setItem(OUTFITS_KEY, JSON.stringify(all));
}

export async function removeOutfit(outfitId, userId = CURRENT_USER_ID) {
  const token = await getAuthToken();
  if (token) {
    await fetch(`${API_BASE}/api/outfits/${outfitId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return;
  }

  const raw = await AsyncStorage.getItem(OUTFITS_KEY);
  const all = safeParse(raw);
  const nextOutfits = all.filter(
    (item) => !(item.userId === userId && item.id === outfitId)
  );
  await AsyncStorage.setItem(OUTFITS_KEY, JSON.stringify(nextOutfits));
}

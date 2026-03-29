import AsyncStorage from "@react-native-async-storage/async-storage";

const CLOTHES_KEY = "@digital_wardrobe_clothes";
const OUTFITS_KEY = "@digital_wardrobe_outfits";

export const CURRENT_USER_ID = "demo-user-1";

function safeParse(value, fallback = []) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    return fallback;
  }
}

export async function getClothes(userId = CURRENT_USER_ID) {
  const raw = await AsyncStorage.getItem(CLOTHES_KEY);
  const all = safeParse(raw);
  return all.filter((item) => item.userId === userId);
}

export async function addClothing(item) {
  const raw = await AsyncStorage.getItem(CLOTHES_KEY);
  const all = safeParse(raw);
  all.push(item);
  await AsyncStorage.setItem(CLOTHES_KEY, JSON.stringify(all));
}

export async function removeClothing(clothingId, userId = CURRENT_USER_ID) {
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
  const raw = await AsyncStorage.getItem(OUTFITS_KEY);
  const all = safeParse(raw);
  return all.filter((item) => item.userId === userId);
}

export async function addOutfit(outfit) {
  const raw = await AsyncStorage.getItem(OUTFITS_KEY);
  const all = safeParse(raw);
  all.push(outfit);
  await AsyncStorage.setItem(OUTFITS_KEY, JSON.stringify(all));
}

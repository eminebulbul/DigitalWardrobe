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

const TOP_CATEGORIES = new Set([
  "Tişört",
  "Gömlek",
  "Bluz",
  "Kazak",
  "Sweatshirt",
  "Hırka",
  "Yelek",
]);

const BOTTOM_CATEGORIES = new Set(["Pantolon", "Şort", "Etek", "Tayt"]);

const ONE_PIECE_CATEGORIES = new Set(["Elbise", "Tulum", "Pijama"]);

const ACCESSORY_CATEGORIES = new Set(["Aksesuar", "Çanta"]);

const SHOE_CATEGORIES = new Set(["Ayakkabı", "Terlik", "Sandalet", "Çizme"]);

const OUTERWEAR_CATEGORIES = new Set(["Ceket", "Mont", "Kaban"]);

function pickRandom(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * items.length);
  return items[randomIndex];
}

export function buildRandomOutfit(clothes) {
  if (!Array.isArray(clothes) || clothes.length === 0) {
    return [];
  }

  const slots = clothes.reduce(
    (acc, item) => {
      const category = item?.category;

      if (ONE_PIECE_CATEGORIES.has(category)) {
        acc.onePiece.push(item);
      } else if (TOP_CATEGORIES.has(category)) {
        acc.top.push(item);
      } else if (BOTTOM_CATEGORIES.has(category)) {
        acc.bottom.push(item);
      } else if (ACCESSORY_CATEGORIES.has(category)) {
        acc.accessory.push(item);
      } else if (SHOE_CATEGORIES.has(category)) {
        acc.shoes.push(item);
      } else if (OUTERWEAR_CATEGORIES.has(category)) {
        acc.outerwear.push(item);
      } else {
        acc.accessory.push(item);
      }

      return acc;
    },
    {
      top: [],
      bottom: [],
      onePiece: [],
      accessory: [],
      shoes: [],
      outerwear: [],
    }
  );

  const outfit = [];

  // Tek parça varsa üst+alt yerine kullanılabilir.
  const canUseTopBottom = slots.top.length > 0 && slots.bottom.length > 0;
  const canUseOnePiece = slots.onePiece.length > 0;

  if (!canUseTopBottom && !canUseOnePiece) {
    return [];
  }

  if (canUseOnePiece && (!canUseTopBottom || Math.random() < 0.5)) {
    outfit.push(pickRandom(slots.onePiece));
  } else {
    outfit.push(pickRandom(slots.top));
    outfit.push(pickRandom(slots.bottom));
  }

  if (slots.shoes.length > 0) {
    outfit.push(pickRandom(slots.shoes));
  }

  if (slots.accessory.length > 0) {
    outfit.push(pickRandom(slots.accessory));
  }

  if (slots.outerwear.length > 0 && Math.random() < 0.5) {
    outfit.push(pickRandom(slots.outerwear));
  }

  return outfit.filter(Boolean);
}

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

function buildRecentUsageMap(recentOutfits) {
  const usageMap = new Map();

  if (!Array.isArray(recentOutfits)) {
    return usageMap;
  }

  recentOutfits.forEach((outfit) => {
    const ids = Array.isArray(outfit?.clothesIds) ? outfit.clothesIds : [];
    ids.forEach((id) => {
      usageMap.set(id, (usageMap.get(id) || 0) + 1);
    });
  });

  return usageMap;
}

function pickWeightedByUsage(items, usageMap, usedIds = new Set()) {
  const candidates = (Array.isArray(items) ? items : []).filter(
    (item) => item && !usedIds.has(item.id)
  );

  if (!candidates.length) {
    return null;
  }

  const weights = candidates.map((item) => {
    const usageCount = usageMap.get(item.id) || 0;
    return 1 / (1 + usageCount);
  });

  const totalWeight = weights.reduce((sum, value) => sum + value, 0);
  let threshold = Math.random() * totalWeight;

  for (let i = 0; i < candidates.length; i += 1) {
    threshold -= weights[i];
    if (threshold <= 0) {
      return candidates[i];
    }
  }

  return candidates[candidates.length - 1];
}

function buildCandidateOutfit(slots, usageMap) {
  const outfit = [];
  const usedIds = new Set();

  const canUseTopBottom = slots.top.length > 0 && slots.bottom.length > 0;
  const canUseOnePiece = slots.onePiece.length > 0;

  if (!canUseTopBottom && !canUseOnePiece) {
    return [];
  }

  if (canUseOnePiece && (!canUseTopBottom || Math.random() < 0.5)) {
    const onePiece = pickWeightedByUsage(slots.onePiece, usageMap, usedIds);
    if (onePiece) {
      outfit.push(onePiece);
      usedIds.add(onePiece.id);
    }
  } else {
    const top = pickWeightedByUsage(slots.top, usageMap, usedIds);
    if (top) {
      outfit.push(top);
      usedIds.add(top.id);
    }

    const bottom = pickWeightedByUsage(slots.bottom, usageMap, usedIds);
    if (bottom) {
      outfit.push(bottom);
      usedIds.add(bottom.id);
    }
  }

  const shoes = pickWeightedByUsage(slots.shoes, usageMap, usedIds);
  if (shoes) {
    outfit.push(shoes);
    usedIds.add(shoes.id);
  }

  const accessory = pickWeightedByUsage(slots.accessory, usageMap, usedIds);
  if (accessory) {
    outfit.push(accessory);
    usedIds.add(accessory.id);
  }

  if (slots.outerwear.length > 0 && Math.random() < 0.5) {
    const outerwear = pickWeightedByUsage(slots.outerwear, usageMap, usedIds);
    if (outerwear) {
      outfit.push(outerwear);
    }
  }

  return outfit.filter(Boolean);
}

function scoreOutfit(outfit, usageMap) {
  return outfit.reduce((score, item) => score + (usageMap.get(item.id) || 0), 0);
}

export function buildRandomOutfit(clothes, options = {}) {
  if (!Array.isArray(clothes) || clothes.length === 0) {
    return [];
  }

  const attempts = Math.max(1, options.attempts || 10);
  const recentOutfits = Array.isArray(options.recentOutfits)
    ? options.recentOutfits.slice(-5)
    : [];
  const usageMap = buildRecentUsageMap(recentOutfits);

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

  const canUseTopBottom = slots.top.length > 0 && slots.bottom.length > 0;
  const canUseOnePiece = slots.onePiece.length > 0;
  if (!canUseTopBottom && !canUseOnePiece) {
    return [];
  }

  const candidates = [];
  for (let i = 0; i < attempts; i += 1) {
    const candidate = buildCandidateOutfit(slots, usageMap);
    if (candidate.length > 0) {
      candidates.push(candidate);
    }
  }

  if (!candidates.length) {
    return [];
  }

  const scored = candidates
    .map((outfit) => ({ outfit, score: scoreOutfit(outfit, usageMap) }))
    .sort((a, b) => a.score - b.score);

  const bestScore = scored[0].score;
  const nearBest = scored.filter((item) => item.score <= bestScore + 1);
  const selected = pickRandom(nearBest) || scored[0];

  return selected.outfit;
}

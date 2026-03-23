export function buildRandomOutfit(clothes) {
  if (!Array.isArray(clothes) || clothes.length === 0) {
    return [];
  }

  const grouped = clothes.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  const categories = Object.keys(grouped);
  return categories
    .map((category) => {
      const options = grouped[category];
      if (!options || options.length === 0) {
        return null;
      }
      const randomIndex = Math.floor(Math.random() * options.length);
      return options[randomIndex];
    })
    .filter(Boolean);
}

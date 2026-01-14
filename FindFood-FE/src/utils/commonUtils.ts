const getPriceSymbol = (level: string | undefined): string => {
  const priceMap: { [key: string]: string } = {
    PRICE_LEVEL_INEXPENSIVE: '₹',
    PRICE_LEVEL_MODERATE: '₹₹',
    PRICE_LEVEL_EXPENSIVE: '₹₹₹',
    PRICE_LEVEL_VERY_EXPENSIVE: '₹₹₹₹',
  };

  // Fallback to '₹₹' if level is undefined or not in the map
  return level ? priceMap[level] || '₹₹' : '₹₹';
};

const categories = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'restaurant', label: 'Food', emoji: '🍕' },
  { id: 'cafe', label: 'Cafes', emoji: '☕' },
  { id: 'pub', label: 'Drinks', emoji: '🍺' },
  { id: 'park', label: 'Parks', emoji: '🌳' },
  { id: 'museum', label: 'Art', emoji: '🖼️' },
];

export { getPriceSymbol, categories };

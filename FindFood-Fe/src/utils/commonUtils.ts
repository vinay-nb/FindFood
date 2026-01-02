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

export { getPriceSymbol };

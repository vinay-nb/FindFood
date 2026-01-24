export function haversineDistance(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371000; // meters
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const x =
    sinDLat * sinDLat + sinDLon * sinDLon * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c;
}

export const DEFAULT_MEETUP_TYPES = [
  "restaurant",
  "cafe",
  "park",
  "shopping_mall",
  "tourist_attraction",
];

export const FOOD_CATEGORIES = ["restaurant", "cafe", "bakery", "bar", "pub"];

export const pureVegTypes = ["vegetarian_restaurant", "vegan_restaurant"];

export const meatHeavyTypes = [
  "steak_house",
  "barbecue_restaurant",
  "hamburger_restaurant",
  "seafood_restaurant",
  "brazilian_restaurant",
];

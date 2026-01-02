import axios from "axios";
import { ROUTES } from "../routes";
import { config } from "../../config/index";

interface Location {
  lat: number;
  lng: number;
}
interface Places {
  id: string;
  name: string;
  location: string;
  rating: number;
  userRatingCount: number;
  types: string[];
  summary: string;
  avgTravelTimeMinutes: number;
  fairnessScore: number;
  totalScore: number;
}

interface Place {
  editorialSummary?: {
    text: string;
  };
  formattedAddress: string;
  types: string[];
  rating: number;
  priceLevel: number;
  servesVegetarianFood: boolean;
  displayName: {
    text: string;
  };
  location: {
    lat: number;
    lng: number;
  };
  userRatingCount: number;
  photos: any[];
  reviews: any[];
  googleMapsUri: string;
  id: string;
}

const GOOGLE_API_KEY = config.google.apiKey;

// 1. Math Utility: Calculate Standard Deviation
function getStandardDeviation(numbers: number[]): number {
  const n = numbers.length;
  if (n < 2) return 0;
  const avg = numbers.reduce((a, b) => a + b) / n;
  return Math.sqrt(
    numbers.map((x) => Math.pow(x - avg, 2)).reduce((a, b) => a + b) / n
  );
}

function calculateFairnessPercentage(stdDevSeconds: number) {
  // If stdDev is 0, it's 100% fair. If stdDev is 15 mins (900s), fairness drops significantly.
  const score = 100 - (stdDevSeconds / 60) * 5;
  return Math.max(0, Math.min(100, Math.round(score)));
}

const generateDescription = (place: Place) => {
  if (place.editorialSummary?.text) return place.editorialSummary.text;

  const type = place.types[0]?.replace("_", " ") || "establishment";
  const rating = place.rating > 4.5 ? "highly-rated" : "popular";
  const price = place.priceLevel ? " affordable" : "";

  return `A ${rating}${price} ${type} in ${
    place.formattedAddress.split(",")[0]
  }, perfect for a group meetup.`;
};

export async function handleLocations(req: any, res: any) {
  try {
    const { locations } = req.body; // Array of {lat, lng}

    // Calculate Centroid (Your existing logic)
    const centerLat =
      locations.reduce((s: number, l: Location) => s + l.lat, 0) /
      locations.length;
    const centerLng =
      locations.reduce((s: number, l: Location) => s + l.lng, 0) /
      locations.length;
    const centroid = { lat: centerLat, lng: centerLng };

    //  Fetch Candidate Restaurants (Places API New)
    // We search near the centroid for the best candidates
    const placesResponse = await axios.post(
      `${ROUTES.THIRD_PARTY.SEARCH_NEARBY}`,
      {
        includedTypes: ["restaurant", "cafe"],
        maxResultCount: 10,
        locationRestriction: {
          circle: {
            center: {
              latitude: centroid.lat,
              longitude: centroid.lng,
            },
            radius: 2500.0,
          },
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_API_KEY,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.priceLevel,places.editorialSummary,places.photos,places.types,places.servesVegetarianFood,places.googleMapsUri,places.reviews",
        },
      }
    );

    const candidates = placesResponse.data.places;
    if (!candidates || candidates.length === 0) {
      return res.json({
        message: "No places found near the center",
        center: centroid,
      });
    }

    // Step C: Calculate Travel Times (Distance Matrix API)
    // Origins: Friends' locations | Destinations: Candidate restaurants
    // 1. Prepare the origins and destinations for Routes API
    const origins = locations.map((l: any) => ({
      waypoint: { location: { latLng: { latitude: l.lat, longitude: l.lng } } },
    }));

    const destinations = candidates.map((p: any) => ({
      waypoint: { placeId: p.id },
    }));

    const routesResponse = await axios.post(
      `${ROUTES.THIRD_PARTY.DISTANCE_MATRIX}`,
      {
        origins: origins,
        destinations: destinations,
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_AWARE",
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_API_KEY,
          // Fieldmask is CRITICAL here to define what data you want back
          "X-Goog-FieldMask":
            "originIndex,destinationIndex,duration,distanceMeters,status,condition",
        },
      }
    );

    // Step D: Apply the Fairness Logic with Enriched Data
    const rankedResults = candidates
      .map((place: any, destIndex: number) => {
        // 1. Extract travel times (The "Math" part)
        const travelTimes = routesResponse.data
          .filter((item: any) => item.destinationIndex === destIndex)
          .map((item: any) => {
            // Safety check for v2/v1 duration strings
            const durationStr = item.duration?.duration || item.duration;
            return durationStr
              ? parseInt(durationStr.replace("s", ""), 10)
              : null;
          })
          .filter((t: any) => t !== null);

        // 2. Handle failure cases
        if (travelTimes.length === 0) {
          return { name: place.displayName?.text, totalScore: Infinity };
        }

        // 3. Fairness Calculations
        const avgTime =
          travelTimes.reduce((a: number, b: number) => a + b, 0) /
          travelTimes.length;
        const stdDev = getStandardDeviation(travelTimes);

        // fallback
        // Define lists of specific types
        const pureVegTypes = ["vegetarian_restaurant", "vegan_restaurant"];

        // 1. Is it definitely Veg?
        const isVeg =
          place.servesVegetarianFood ||
          place.types.some((t: string) => pureVegTypes.includes(t));

        // 2. Is it likely Non-Veg?
        // We check if it's NOT a pure veg place AND it belongs to categories that usually serve meat
        const meatHeavyTypes = [
          "steak_house",
          "barbecue_restaurant",
          "hamburger_restaurant",
          "seafood_restaurant",
          "brazilian_restaurant",
        ];

        const isLikelyMeat = place.types.some((t: string) =>
          meatHeavyTypes.includes(t)
        );

        // 3. The "Smart" Non-Veg Flag
        // If it's a restaurant, not pure veg, and hasn't explicitly flagged itself as "Veg Only"
        const isNonVeg =
          !pureVegTypes.some((t: string) => place.types.includes(t)) &&
          (isLikelyMeat || !place.servesVegetarianFood);

        // 4. Return Object
        return {
          id: place.id,
          name: place.displayName?.text,
          description: generateDescription(place),
          address: place.formattedAddress,
          coordinates: place.location,
          rating: place.rating,
          reviewCount: place.userRatingCount,
          priceLevel: place.priceLevel,
          isVeg: isVeg,
          isNonVeg: isNonVeg,
          isPureVeg: isVeg && !isNonVeg,
          type: place.types[0],

          // PHOTOS: Ensure send the full resource name
          photos: place.photos?.map((p: any) => p.name) || [],

          // REVIEWS: Map the top 3 reviews
          reviews:
            place.reviews?.map((r: any) => ({
              text: r.text?.text,
              author: r.authorAttribution?.displayName,
              rating: r.rating,
              time: r.relativePublishTimeDescription,
            })) || [],

          navigationUrl: place.googleMapsUri,
          avgTravelTimeMinutes: Math.round(avgTime / 60),
          fairnessScore: calculateFairnessPercentage(stdDev),
          totalScore: avgTime + stdDev * 1.5,
        };
      })
      .filter(Boolean);

    // Sort and filter out reachable places
    const finalRecommendation = rankedResults
      .filter((r: Places) => r.totalScore !== Infinity)
      .sort((a: Places, b: Places) => a.totalScore - b.totalScore);

    return res.json({
      centroid,
      recommendations: finalRecommendation,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

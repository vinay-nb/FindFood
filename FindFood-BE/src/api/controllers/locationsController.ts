import axios from "axios";
import { ROUTES } from "../routes";
import { config } from "../../config/index";

interface Location {
  lat: number;
  lng: number;
}
interface Places {
  name: string;
  location: string;
  rating: number;
  avgTravelTimeMinutes: number;
  fairnessScore: number;
  totalScore: number;
}

const GOOGLE_API_KEY = config.google.apiKey;

// 1. Math Utility: Calculate Standard Deviation
function getStandardDeviation(numbers: number[]): number {
  const n = numbers.length;
  const mean = numbers.reduce((a, b) => a + b) / n;
  return Math.sqrt(
    numbers.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n
  );
}

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
            radius: 2000.0,
          },
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_API_KEY,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.location,places.rating",
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
    const origins = locations
      .map((l: Location) => `${l.lat},${l.lng}`)
      .join("|");
    const destinations = candidates
      .map((p: any) => `place_id:${p.id}`)
      .join("|");

    const matrixResponse = await axios.get(
      `${ROUTES.THIRD_PARTY.DISTANCE_MATRIX}?origins=${origins}&destinations=${destinations}&key=${GOOGLE_API_KEY}`
    );

    // Step D: Apply the Fairness Logic
    const rankedResults = candidates.map((place: any, destIndex: number) => {
      // Extract all travel times from every friend to this specific restaurant
      const travelTimes = matrixResponse.data.rows.map(
        (row: any) => row.elements[destIndex].duration.value // value in seconds
      );

      const avgTime =
        travelTimes.reduce((a: number, b: number) => a + b) /
        travelTimes.length;
      const stdDev = getStandardDeviation(travelTimes);

      return {
        name: place.displayName.text,
        location: place.location,
        rating: place.rating,
        avgTravelTimeMinutes: Math.round(avgTime / 60),
        fairnessScore: stdDev, // Lower is better
        // A combined score: prioritize low average time AND low deviation
        totalScore: avgTime + stdDev * 1.5,
      };
    });

    // Sort by totalScore ascending (Best "Fair" place first)
    const finalRecommendation = rankedResults.sort(
      (a: Places, b: Places) => a.totalScore - b.totalScore
    );

    return res.json({
      centroid,
      recommendations: finalRecommendation,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

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
    const rankedResults = candidates.map((place: any, destIndex: number) => {
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

      // 4. Return Enriched Object (The "Product" part)
      return {
        id: place.id,
        name: place.displayName?.text,
        location: place.location,
        rating: place.rating,
        userRatingCount: place.userRatingCount, // Added
        types: place.types, // Added (useful for icons like 'pizza' or 'bar')
        summary: place.editorialSummary?.text, // Added (the "vibe" description)

        // Performance Metrics
        avgTravelTimeMinutes: Math.round(avgTime / 60),
        fairnessScore: Math.round(stdDev / 60), // standard deviation in minutes

        // The Ranking Score
        totalScore: avgTime + stdDev * 1.5,
      };
    });

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

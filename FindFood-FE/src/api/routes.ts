import Config from "@/config";
import { Platform } from "react-native";

const BASE_URL =
  Platform.OS === "android" ? "http://10.0.2.2:4444" : "http://localhost:4444";

export const API = {
  BASE: BASE_URL,
  POST_LOCATION: `${BASE_URL}/api/locations`,
  THIRD_PARTY: {
    GOOGLE_PLACES_PHOTO: "https://places.googleapis.com/v1",
  },
};

export default API;

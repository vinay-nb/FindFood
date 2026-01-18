import Config from "@/config";

const BASE_URL = Config.apiUrl
  ? Config.apiUrl
  : 'http://localhost:4444';

export const API = {
  BASE: BASE_URL,
  POST_LOCATION: `${BASE_URL}/api/locations`,
  THIRD_PARTY: {
    GOOGLE_PLACES_PHOTO: 'https://places.googleapis.com/v1',
  },
};

export default API;

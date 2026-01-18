
const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL
  ? process.env.EXPO_PUBLIC_BACKEND_URL
  : 'http://localhost:4444';

export const API = {
  BASE: BASE_URL,
  POST_LOCATION: `${BASE_URL}/api/locations`,
  THIRD_PARTY: {
    GOOGLE_PLACES_PHOTO: 'https://places.googleapis.com/v1',
  },
};

export default API;

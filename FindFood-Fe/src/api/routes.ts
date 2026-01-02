import { BACKEND_URL } from '@env';

const BASE_URL = BACKEND_URL ? BACKEND_URL : 'http://localhost:4444';

export const API = {
  BASE: BASE_URL,
  POST_LOCATION: `${BASE_URL}/api/locations`,
  THIRD_PARTY: {
    GOOGLE_PLACES_PHOTO: 'https://places.googleapis.com/v1',
  },
};

export default API;

// Centralized route path constants for the backend API.
// Use these wherever you need to mount or refer to routes so a change
// to the path is reflected app-wide.
export const ROUTES = {
  LOCATIONS: "/api/locations",

  THIRD_PARTY: {
    SEARCH_NEARBY: "https://places.googleapis.com/v1/places:searchNearby",
    DISTANCE_MATRIX: "https://maps.googleapis.com/maps/api/distancematrix/json",
  },
};

export default ROUTES;

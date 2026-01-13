import 'dotenv/config';

export default {
  expo: {
    name: 'FindFood',
    slug: 'findfood',
    version: '1.0.0',
    ios: {
      bundleIdentifier: 'org.reactjs.native.example.FindFood',
      supportsTablet: true,
      googleServicesFile: './GoogleService-Info.plist',
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
      },
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'This app uses your location to find the fairest midway meeting point for you and your friends.',
        NSLocationAlwaysUsageDescription:
          'This app uses your location to find the fairest midway meeting point for you and your friends.',
      },
    },
    android: {
      permissions: [
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.ACCESS_FINE_LOCATION',
      ],
      package: 'org.reactjs.xnative.example.FindFood',
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
        },
      },
    },
    plugins: [
      '@react-native-google-signin/google-signin',
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission:
            'Allow FindFood to use your location...',
          isAndroidBackgroundLocationEnabled: false,
        },
      ],
      // Use the direct path to the plugin
      ['./node_modules/react-native-maps/app.plugin.js', { googleMaps: true }],
    ],
  },
};

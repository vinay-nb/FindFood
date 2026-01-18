import path from 'path';
import dotenv from 'dotenv';

// 1. Determine which file to load
const appEnv = process.env.APP_ENV || 'dev';
const envFile = appEnv === 'production' ? '.env.production' : '.env.dev';

// 2. Manually load the specific file
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

export default ({ config }) => {
  const appEnv = process.env.APP_ENV || 'dev';

  return {
    ...config,
    name: 'FindFood',
    slug: 'findfood',
    version: '1.0.0',
    extra: {
      APP_ENV: appEnv,
      apiUrl:
        appEnv === 'production'
          ? process.env.EXPO_PROD_BACKEND_URL
          : process.env.EXPO_PUBLIC_BACKEND_URL,
      supabaseUrl:
        appEnv === 'production'
          ? process.env.EXPO_PROD_SUPABASE_URL
          : process.env.EXPO_PUBLIC_SUPABASE_URL,
      annonKey:
        appEnv === 'production'
          ? process.env.EXPO_PROD_SUPABASE_ANON_KEY
          : process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      googleApiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
      webClientId: process.env.EXPO_PUBLIC_WEB_GOOGLE_CLIENT_ID,
      googleSsoIosClientId: process.env.EXPO_PUBLIC_GOOGLE_SSO_IOS_CLIENT_ID,
    },
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
    ],
  };
};

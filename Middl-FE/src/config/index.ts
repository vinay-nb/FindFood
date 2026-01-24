import Constants from 'expo-constants';

// 1. Grab the injected 'extra' object from the Expo Manifest
const extra = Constants.expoConfig?.extra;

// 2. Identify the environment name
const APP_ENV = extra?.APP_ENV || 'dev';

// 3. map the extra values
const Config = {
  googleApiKey: extra?.googleApiKey,
  apiUrl: extra?.apiUrl,
  googleSsoIosClientId: extra?.googleSsoIosClientId,
  supabaseUrl: extra?.supabaseUrl,
  annonKey: extra?.annonKey,
  webClientId: extra?.webClientId,
  isProd: APP_ENV === 'production',
};

// This will now log the actual values injected by app.config.js
console.log(`[FindFood] Running in ${APP_ENV} mode. API: ${Config.apiUrl}`);

export default Config;

import 'react-native-url-polyfill/auto'; // Essential for mobile networking
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import Config from '@/config';

const supabaseUrl = Config.supabaseUrl || '';
const supabaseAnonKey = Config.annonKey || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Stores the session in the phone's storage
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Required for mobile OAuth
  },
});

// Tell Supabase to refresh tokens only when the app is active
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', state => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}

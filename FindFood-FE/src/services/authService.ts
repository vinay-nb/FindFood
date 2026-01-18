import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { supabase } from '../api/supbase';

export const authService = {
  signInWithGoogle: async () => {
    try {
      // 1. Check if Google Play Services are available (Android only, ignored on iOS)
      await GoogleSignin.hasPlayServices();

      // 2. Trigger the native Google Login modal
      const userInfo = await GoogleSignin.signIn();

      // 3. Extract the ID Token
      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        throw new Error('No ID Token found from Google');
      }

      // 4. Send the ID Token to Supabase to create/login the user
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('SSO Handshake Error:', error);
      throw error;
    }
  },

  signOut: async () => {
    await GoogleSignin.signOut();
    await supabase.auth.signOut();
  },
};

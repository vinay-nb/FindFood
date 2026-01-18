import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { supabase } from '../api/supbase';
import * as Crypto from 'expo-crypto';

export const authService = {
  signInWithGoogle: async () => {
    try {
      const randomBytes = await Crypto.getRandomBytesAsync(32);
      const rawNonce = btoa(String.fromCharCode(...randomBytes))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/[=]/g, '');

      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce,
      );

      await GoogleSignin.hasPlayServices();

      // In v16+, this is the standard configuration
      const userInfo = await GoogleSignin.signIn({
        nonce: hashedNonce,
      } as any);

      // v16 structure uses .data
      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        throw new Error('No ID Token found from Google');
      }

      // Pass the token AND the nonce provided by the SDK
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
        nonce: rawNonce,
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

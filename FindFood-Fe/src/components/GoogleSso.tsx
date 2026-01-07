import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authService } from '../services/authService';

interface Props {
  navigation: any;
  route: any;
}

export default function AuthScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const { pendingAction } = route.params || {};

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await authService.signInWithGoogle();
      // If login success, go back to finish the "Find Best Spots" action
      navigation.goBack();
    } catch (error) {
      throw new Error('Something went wrong with Google Login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Hero Section */}
      <View style={styles.heroContainer}>
        <ImageBackground
          source={{
            uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1000',
          }}
          style={styles.heroBackground}
        >
          <View style={styles.darkOverlay} />
          <View
            style={[styles.heroTextContainer, { paddingTop: insets.top + 60 }]}
          >
            <Text style={styles.heroTitle}>One last step</Text>
            <Text style={styles.heroSubtitle}>
              Save your group history and share links
            </Text>
          </View>
        </ImageBackground>
      </View>

      {/* Login Card */}
      <View style={styles.loginCard}>
        <View style={styles.content}>
          <Text style={styles.description}>
            To keep your midway results private and allow sharing with friends,
            please sign in with your Google account.
          </Text>

          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <View style={styles.btnContent}>
                {/* You can add a Google Icon here */}
                <Text style={styles.googleBtnText}>Continue with Google</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.maybeLater}
          >
            <Text style={styles.maybeLaterText}>Maybe later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  heroContainer: { height: 400 },
  heroBackground: { width: '100%', height: 400 },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  heroTextContainer: { paddingHorizontal: 24 },
  heroTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -1,
  },
  heroSubtitle: { fontSize: 18, color: 'rgba(255,255,255,0.85)', marginTop: 8 },

  loginCard: {
    flex: 1,
    marginTop: -50,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
  },
  content: { marginTop: 20, alignItems: 'center' },
  description: {
    fontSize: 16,
    color: '#636366',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  googleBtn: {
    width: '100%',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  googleBtnText: { color: '#000', fontWeight: '700', fontSize: 17 },
  maybeLater: { marginTop: 20 },
  maybeLaterText: { color: '#8E8E93', fontWeight: '600' },
  btnContent: { flexDirection: 'row', alignItems: 'center' },
});

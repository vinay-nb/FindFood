import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ImageBackground,
  FlatList,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  LayoutAnimation,
  Keyboard,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LocationInput from './LocationInput';
import { supabase } from '../api/supbase';
import API from '../api/routes';
import { Session } from '@supabase/supabase-js';
import * as Location from 'expo-location';
import { categories } from '@/utils/commonUtils';

type Location = {
  name: string;
  lat: number;
  lng: number;
};

type LocationEntry = {
  id: string;
  data: Location | null;
};

export default function MultiLocationInputs() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const lastSearchTimestamp = useRef<number | null>(null);
  const [locations, setLocations] = useState<LocationEntry[]>([
    { id: Math.random().toString(), data: null },
    { id: Math.random().toString(), data: null },
  ]);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    type: 'all', // default
    isVeg: false,
  });

  // AUTO-DETECT LOCATION FOR PERSON 1
  const detectFirstPerson = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    let location = await Location.getCurrentPositionAsync({});
    const address = await Location.reverseGeocodeAsync(location.coords);
    const name =
      address.length > 0
        ? `${address[0].name || address[0].street}`
        : 'Current Location';

    // Set the first item to current location automatically
    setLocations(prev => {
      const newLocs = [...prev];
      newLocs[0] = {
        ...newLocs[0],
        data: {
          name,
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        },
      };
      return newLocs;
    });
  };

  useEffect(() => {
    detectFirstPerson();
  }, []);

  useEffect(() => {
    let mounted = true;
    // 1. Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setAuthLoading(false);

      // If no session, redirect to Auth immediately
      if (!session) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Auth' }],
        });
      }
    });

    // 2. Listen for auth changes (Login/Logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Auth' }],
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      const twoHours = 2 * 60 * 60 * 1000;

      // If they haven't searched in 2 hours, reset the form
      if (
        lastSearchTimestamp.current &&
        now - lastSearchTimestamp.current > twoHours
      ) {
        resetForm();
      }
    }, []),
  );

  const renderHeader = useMemo(
    () => (
      <View style={styles.inputCardContent}>
        <Text style={styles.label}>What's the vibe?</Text>

        <FlatList
          horizontal
          data={categories}
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const isActive = preferences.type === item.id;
            return (
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.premiumChip,
                  isActive && styles.premiumChipActive,
                ]}
                onPress={() => {
                  LayoutAnimation.configureNext(
                    LayoutAnimation.Presets.easeInEaseOut,
                  );
                  setPreferences(prev => ({ ...prev, type: item.id }));
                }}
              >
                <Text style={styles.chipEmoji}>{item.emoji || '📍'}</Text>
                <Text
                  style={[
                    styles.premiumChipText,
                    isActive && styles.premiumChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        {/* --- NEW: DIETARY TOGGLE (Visible only for food/cafes) --- */}
        {(preferences.type === 'restaurant' || preferences.type === 'cafe') && (
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.vegToggle}
            onPress={() => {
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut,
              );
              setPreferences(prev => ({ ...prev, isVeg: !prev.isVeg }));
            }}
          >
            <View
              style={[
                styles.toggleCircle,
                preferences.isVeg && styles.toggleCircleActive,
              ]}
            >
              {preferences.isVeg && <View style={styles.innerDot} />}
            </View>
            <Text style={styles.vegToggleText}>Show Only Vegetarian Spots</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.label}>Group Members</Text>

        {locations.map((loc, index) => (
          <View
            key={loc.id}
            style={[styles.inputRow, { zIndex: locations.length - index }]}
          >
            <View
              style={[
                styles.inputWrapper,
                loc.data && styles.inputWrapperSuccess, // Visual cue for selection
              ]}
            >
              <LocationInput
                value={loc.data?.name}
                placeholder={`Where is person ${index + 1}?`}
                onSelect={value => updateLocationAt(loc.id, value)}
              />
              {loc.data && <Text style={styles.checkIcon}>✓</Text>}
            </View>
            {locations.length > 2 && (
              <TouchableOpacity
                onPress={() => removeLocationInput(loc.id)}
                style={styles.removeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.removeBtnText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        <View style={styles.actionRow}>
          <TouchableOpacity onPress={addLocationInput} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Add another person</Text>
          </TouchableOpacity>

          {locations.some(l => l.data) && (
            <TouchableOpacity onPress={resetForm} style={styles.resetBtn}>
              <Text style={styles.resetBtnText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
        {sendError ? <Text style={styles.errorText}>{sendError}</Text> : null}
      </View>
    ),
    [locations, sendError, preferences],
  );

  if (authLoading || !session) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#1C1C1E" />
      </View>
    );
  }

  if (!session) {
    navigation.navigate('Auth');
    return;
  }

  function resetForm() {
    setLocations([
      { id: Math.random().toString(), data: null },
      { id: Math.random().toString(), data: null },
    ]);
    setSendError(null);
  }

  function updateLocationAt(id: string, value: Location | null) {
    setLocations(prev =>
      prev.map(loc => (loc.id === id ? { ...loc, data: value } : loc)),
    );
  }

  function addLocationInput() {
    setLocations(prev => [
      ...prev,
      { id: Math.random().toString(), data: null },
    ]);
  }

  function removeLocationInput(id: string) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setLocations(prev => prev.filter(loc => loc.id !== id));
  }

  async function sendLocationsToBackend() {
    const coords = locations
      .filter(loc => loc.data !== null)
      .map(loc => ({
        lat: loc.data!.lat,
        lng: loc.data!.lng,
      }));

    if (coords.length < 2) {
      setSendError(
        'Please add at least 2 people locations, to find a midway spot.',
      );
      return;
    }

    setSendError(null);
    setSending(true);

    try {
      const res = await fetch(API?.POST_LOCATION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          locations: coords,
          preferences: {
            type: preferences.type,
            isVeg: preferences.isVeg,
          },
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        setSendError(json?.error || 'Something went wrong');
      } else {
        const validResults = json.recommendations.filter(
          (r: any) => r.totalScore !== Infinity,
        );
        navigation.navigate('Results', { recommendations: validResults });
      }
    } catch (err: any) {
      setSendError('Network error. Check your connection.');
    } finally {
      setSending(false);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* 1. Immersive Hero Background */}
      <View style={styles.heroContainer}>
        <ImageBackground
          source={{
            uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1000',
          }}
          style={styles.heroBackground}
        >
          <View style={styles.darkOverlay} />
          <View
            style={[styles.heroTextContainer, { paddingTop: insets.top + 40 }]}
          >
            <Text style={styles.heroTitle}>Meet Midway</Text>
            <Text style={styles.heroSubtitle}>
              Find the fairest spot for the whole group
            </Text>
          </View>
        </ImageBackground>
      </View>

      {/* 2. The Form (Now as a FlatList to prevent nesting errors) */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <FlatList
          data={[]} // Empty array because the form is in the Header
          renderItem={null}
          ListHeaderComponent={renderHeader}
          style={styles.inputCard}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled" // Critical for Google Places selection
          onScroll={() => Keyboard.dismiss()}
        />

        {/* 3. Bottom Action Bar */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity
            onPress={sendLocationsToBackend}
            style={styles.primaryBtn}
            disabled={sending}
          >
            {sending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Find Best Spots</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  heroContainer: {
    height: 350,
  },
  container: { flex: 1, backgroundColor: '#FFF' },
  heroBackground: { width: '100%', height: 350 },
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  heroTextContainer: { paddingHorizontal: 24 },
  heroTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 8,
    fontWeight: '500',
  },

  keyboardView: { flex: 1, marginTop: -60 },
  inputCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  inputCardContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 100,
  },
  scrollContent: { paddingTop: 32, paddingBottom: 20, flexGrow: 1 },

  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingLeft: 0,
    paddingRight: 12,
    height: 54,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F2F2F7',
    paddingHorizontal: 12,
    overflow: 'visible',
  },
  inputWrapperSuccess: {
    backgroundColor: '#FFFFFF',
    borderColor: '#4CAF50',
    borderWidth: 1.5,
    shadowColor: '#4CAF50',
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkIcon: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '800',
  },
  removeBtn: {
    marginLeft: 12,
    width: 36,
    height: 36,
    backgroundColor: '#FFF1F0',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFCFCC',
  },

  removeBtnText: { color: '#FF3B30', fontWeight: 'bold', fontSize: 14 },

  addBtn: { paddingVertical: 12, alignItems: 'center' },
  addBtnText: { color: '#007AFF', fontWeight: '600', fontSize: 16 },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  resetBtn: {
    paddingVertical: 12,
  },
  resetBtnText: {
    color: '#FF3B30',
    fontWeight: '600',
    fontSize: 14,
  },

  footer: { paddingHorizontal: 24, backgroundColor: '#FFF' },
  primaryBtn: {
    backgroundColor: '#1C1C1E',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: { color: '#FFF', fontWeight: '700', fontSize: 18 },
  errorText: {
    color: '#FF3B30',
    marginTop: 12,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  filterChipActive: {
    backgroundColor: '#1C1C1E',
    borderColor: '#1C1C1E',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  filterTextActive: {
    color: '#FFF',
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleCircleActive: {
    borderColor: '#4CAF50',
  },
  innerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  chipEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  premiumChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A3A3C',
  },
  premiumChipTextActive: {
    color: '#FFFFFF',
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  filterList: {
    marginBottom: 12,
    paddingRight: 20,
    paddingVertical: 8,
    paddingLeft: 4,
  },
  premiumChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  premiumChipActive: {
    backgroundColor: '#1C1C1E',
    borderColor: '#1C1C1E',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    transform: [{ scale: 1.02 }],
  },
  vegToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  vegToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#444',
  },
});

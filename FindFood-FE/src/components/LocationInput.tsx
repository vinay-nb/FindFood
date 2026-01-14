import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import MapPickerModal from './mapPickerModal/MapPickerModal';

interface Props {
  placeholder: string;
  onSelect: (value: any | null) => void;
  value?: string;
  autoFocus?: boolean;
}

const LocationInput: React.FC<Props> = ({
  placeholder,
  onSelect,
  value,
  autoFocus,
}) => {
  const ref = useRef<any>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);

  useEffect(() => {
    if (ref.current) ref.current.setAddressText(value || '');
  }, [value]);

  useEffect(() => {
    const keyboardListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsOpen(false); // Clean up UI if keyboard is dismissed via swipe
    });
    return () => keyboardListener.remove();
  }, []);

  const handleAction = async (type: 'current' | 'map') => {
    if (type === 'map') {
      setIsOpen(false); // Close the dropdown
      setMapVisible(true);
      return;
    }

    try {
      setIsLocating(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const address = await Location.reverseGeocodeAsync(location.coords);

      const name =
        address.length > 0
          ? `${address[0].name || address[0].street}, ${address[0].city}`
          : 'Current Location';

      onSelect({
        name,
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
      ref.current?.blur();
    } catch (e) {
      console.warn(e);
    } finally {
      setIsLocating(false);
    }
  };

  const handleBlur = () => {
    setIsOpen(false);
    ref.current?.blur();
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        style={styles.actionItem}
        onPress={() => handleAction('current')}
      >
        <View style={[styles.iconBox, { backgroundColor: '#E5F1FF' }]}>
          {isLocating ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Ionicons name="navigate" size={18} color="#007AFF" />
          )}
        </View>
        <Text style={styles.actionText}>Current Location</Text>
      </TouchableOpacity>

      <View style={styles.verticalDivider} />

      <TouchableOpacity
        style={styles.actionItem}
        onPress={() => handleAction('map')}
      >
        <View style={[styles.iconBox, { backgroundColor: '#F2F2F7' }]}>
          <Ionicons name="map" size={18} color="#1C1C1E" />
        </View>
        <Text style={[styles.actionText, { color: '#1C1C1E' }]}>
          Set on Map
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {isOpen && (
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleBlur}
        />
      )}
      <GooglePlacesAutocomplete
        ref={ref}
        placeholder={placeholder}
        fetchDetails={true}
        onPress={(data, details = null) => {
          setIsOpen(false);
          if (details)
            onSelect({
              name: data.description,
              lat: details.geometry.location.lat,
              lng: details.geometry.location.lng,
            });
        }}
        query={{ key: process.env.EXPO_PUBLIC_GOOGLE_API_KEY, language: 'en' }}
        renderHeaderComponent={renderHeader}
        textInputProps={{
          autoFocus,
          onFocus: () => setIsOpen(true), // Trigger backdrop when user taps input
          clearButtonMode: 'while-editing',
        }}
        styles={{
          textInput: styles.input,
          listView: styles.listView,
          row: styles.row,
          description: styles.description,
          separator: styles.separator,
        }}
        enablePoweredByContainer={false}
        suppressDefaultStyles={true}
      />

      <MapPickerModal
        visible={mapVisible}
        onClose={() => setMapVisible(false)}
        onConfirm={data => {
          onSelect(data);
          setMapVisible(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  input: { height: 54, fontSize: 16, color: '#1C1C1E', paddingLeft: 12 },
  listView: {
    backgroundColor: '#FFF',
    top: 55,
    left: 0,
    right: 0,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    zIndex: 999,
    width: 350,
    position: 'absolute',
  },
  headerContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    backgroundColor: '#F9F9F9',
  },
  actionItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  actionText: { fontSize: 13, fontWeight: '700', color: '#007AFF' },
  verticalDivider: { width: 1, backgroundColor: '#F2F2F7', height: '100%' },
  row: { padding: 15, flexDirection: 'row' },
  description: { fontSize: 14, color: '#3A3A3C' },
  separator: { height: 1, backgroundColor: '#F2F2F7' },
  backdrop: {
    position: 'absolute',
    top: -500,
    left: -50,
    right: -50,
    bottom: -1000,
    backgroundColor: 'transparent',
    zIndex: 998,
  },
});

export default LocationInput;

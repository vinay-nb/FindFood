import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_API_KEY } from '@env';

interface Location {
  name: string;
  lat: number;
  lng: number;
}

interface Props {
  placeholder: string;
  onSelect: (value: Location | null) => void;
  value?: string; // Add the missing prop
}

const LocationInput: React.FC<Props> = ({ placeholder, onSelect, value }) => {
  const ref = useRef<any>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.setAddressText(value || '');
    }
  }, [value]);

  return (
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        ref={ref}
        placeholder={placeholder}
        fetchDetails={true}
        minLength={2}
        debounce={200}
        listViewDisplayed="auto"
        suppressDefaultStyles={true}
        enablePoweredByContainer={false}
        textInputProps={{
          numberOfLines: 1,
          ellipsizeMode: 'tail',
        }}
        onPress={(data, details = null) => {
          if (!details) return;
          onSelect({
            name: data.description,
            lat: details.geometry.location.lat,
            lng: details.geometry.location.lng,
          });
        }}
        onFail={error => {
          console.warn('GooglePlacesAutocomplete onFail:', error);
        }}
        query={{
          key: GOOGLE_API_KEY,
          language: 'en',
        }}
        styles={{
          container: styles.autocompleteContainer,
          textInput: styles.input,
          listView: styles.listView,
          row: styles.row,
          description: styles.description,
          separator: styles.separator,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Take up all space inside the Wrapper
    position: 'relative',
  },
  autocompleteContainer: {
    flex: 1,
    width: '100%',
    zIndex: 9999,
  },
  input: {
    height: 54,
    fontSize: 16,
    color: '#1C1C1E',
    paddingLeft: 12,
    backgroundColor: 'transparent',
    width: '100%',
  },
  listView: {
    backgroundColor: '#FFF',
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    zIndex: 9999,
    width: 350,
  },
  row: {
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    width: 320,
    overflow: 'hidden',
  },
  description: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    flex: 1,
  },
  separator: {
    height: 0.5,
    backgroundColor: '#E5E5EA',
    marginLeft: 15,
  },
});

export default LocationInput;

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_API_KEY } from '@env';

type Location = {
  name: string;
  lat: number;
  lng: number;
};

type Props = {
  placeholder: string;
  onSelect: (location: Location) => void;
};

const LocationInput: React.FC<Props> = ({ placeholder, onSelect }) => {
  return (
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        placeholder={placeholder}
        fetchDetails={true}
        minLength={2}
        debounce={200}
        listViewDisplayed="auto"
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
        enablePoweredByContainer={false}
        styles={{
          container: styles.container,
          textInputContainer: styles.textInputContainer,
          textInput: styles.input,
          listView: styles.listView,
          description: styles.description,
          row: styles.row,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 0,
    width: '100%',
  },
  row: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  description: {
    color: '#135DFC',
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 6,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#efddddff',
  },
  listView: {
    backgroundColor: '#fff',
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  textInputContainer: {
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
});

export default LocationInput;

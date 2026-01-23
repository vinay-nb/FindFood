import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Keyboard,
  Dimensions,
  Linking,
  Alert,
} from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import MapPickerModal from "./mapPickerModal/MapPickerModal";
import Config from "@/config";

const SCREEN_WIDTH = Dimensions.get("window").width;
const MAX_TEXT_WIDTH = SCREEN_WIDTH - 120;
interface Props {
  placeholder: string;
  onSelect: (value: any | null) => void;
  value?: string;
  autoFocus?: boolean;
  isSelected?: boolean;
}

const LocationInput: React.FC<Props> = ({
  placeholder,
  onSelect,
  value,
  autoFocus,
  isSelected,
}) => {
  const ref = useRef<any>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [initialMapLocation, setInitialMapLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    if (ref.current) ref.current.setAddressText(value || "");
  }, [value]);

  useEffect(() => {
    const keyboardListener = Keyboard.addListener("keyboardDidHide", () => {
      setIsOpen(false); // Clean up UI if keyboard is dismissed via swipe
    });
    return () => keyboardListener.remove();
  }, []);

  const handleAction = async (type: "current" | "map") => {
    if (type === "map") {
      setIsOpen(false);
      setMapVisible(true);
      return;
    }
    try {
      setIsLocating(true);
      // Check Services & Permissions
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        Alert.alert("Location Disabled", "Please turn on GPS.");
        setIsLocating(false);
        return;
      }

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "We need location access.", [
          { text: "Settings", onPress: () => Linking.openSettings() },
        ]);
        setIsLocating(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const address = await Location.reverseGeocodeAsync(location.coords);
      const name =
        address.length > 0
          ? `${address[0].name || address[0].street}, ${address[0].city}`
          : "Current Location";

      onSelect({
        name,
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });

      ref.current?.setAddressText(name);
      setIsOpen(false);
    } catch (e) {
      Alert.alert("Error", "Could not detect location.");
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
        onPress={() => handleAction("current")}
      >
        <View style={[styles.iconBox, { backgroundColor: "#E5F1FF" }]}>
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
        onPress={() => handleAction("map")}
      >
        <View style={[styles.iconBox, { backgroundColor: "#F2F2F7" }]}>
          <Ionicons name="map" size={18} color="#1C1C1E" />
        </View>
        <Text style={[styles.actionText, { color: "#1C1C1E" }]}>
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
      <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
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
          query={{ key: Config.googleApiKey, language: "en" }}
          renderHeaderComponent={renderHeader}
          textInputProps={{
            autoFocus,
            onFocus: () => setIsOpen(true), // Trigger backdrop when user taps input
            clearButtonMode: "while-editing",
            numberOfLines: 1,
            ellipsizeMode: "tail",
          }}
          renderRow={(data) => (
            <View style={styles.row}>
              <Ionicons
                name="location-sharp"
                size={18}
                color="#8E8E93"
                style={styles.rowIcon}
              />
              <View style={{ flex: 1 }}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={styles.description}
                >
                  {data.description}
                </Text>
              </View>
            </View>
          )}
          styles={{
            container: { flex: 1, width: "100%" },
            textInputContainer: { width: "100%" },
            textInput: styles.input,
            listView: styles.listView,
            separator: styles.separator,
          }}
          enablePoweredByContainer={false}
          suppressDefaultStyles={true}
        />
        {isSelected && (
          <View pointerEvents="none" style={styles.checkIconWrapper}>
            <Text style={styles.internalCheckIcon}>✓</Text>
          </View>
        )}
      </View>
      <MapPickerModal
        initialLocation={initialMapLocation}
        visible={mapVisible}
        onClose={() => setMapVisible(false)}
        onConfirm={(data) => {
          onSelect(data);
          setMapVisible(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, position: "relative", width: "100%" },
  input: {
    height: 54,
    fontSize: 16,
    color: "#1C1C1E",
    paddingLeft: 16,
    paddingRight: 45,
    width: "100%",
  },
  listView: {
    backgroundColor: "#FFF",
    top: 56,
    left: 0,
    right: 0,
    borderRadius: 16,
    elevation: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    zIndex: 9999,
    position: "absolute",
    width: "100%",
    maxHeight: 300,
    overflow: "hidden",
  },
  headerContainer: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
    backgroundColor: "#F9F9F9",
    // borderTopLeftRadius: 12,
    // borderTopRightRadius: 12,
  },
  internalCheckIcon: {
    position: "absolute",
    right: 12,
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "800",
  },
  actionItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  actionText: { fontSize: 13, fontWeight: "700", color: "#007AFF" },
  verticalDivider: { width: 1, backgroundColor: "#F2F2F7", height: "100%" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    width: "100%",
  },
  description: {
    fontSize: 14,
    color: "#3A3A3C",
    maxWidth: MAX_TEXT_WIDTH,
  },
  separator: { height: 1, backgroundColor: "#F2F2F7" },
  backdrop: {
    position: "absolute",
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    backgroundColor: "transparent",
    zIndex: 998,
  },
  checkIconWrapper: {
    position: "absolute",
    right: 2,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    zIndex: 10,
  },
  rowIcon: {
    marginRight: 12,
  },
});

export default LocationInput;

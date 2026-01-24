import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

interface MapPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (data: { name: string; lat: number; lng: number }) => void;
  initialLocation: { lat: number; lng: number } | null;
}

const MapPickerModal: React.FC<MapPickerModalProps> = ({
  visible,
  onClose,
  onConfirm,
  initialLocation,
}) => {
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState({
    latitude: 12.9716, // Default (e.g., Bengaluru)
    longitude: 77.5946,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [address, setAddress] = useState("Locating...");
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!visible) return; // Guard clause: do nothing if modal is hidden
    initializeMap();
  }, [visible, initialLocation]);

  const initializeMap = async () => {
    setLoading(true);

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setLoading(false);
      onClose(); // Close if we can't get permission
      return;
    }

    if (initialLocation) {
      // SCENARIO A: Location already exists (from parent or previous state)
      const newRegion = {
        ...region,
        latitude: initialLocation.lat,
        longitude: initialLocation.lng,
      };
      setRegion(newRegion);

      // Animate immediately since we have data
      mapRef.current?.animateToRegion(newRegion, 500);
      await fetchAddress(initialLocation.lat, initialLocation.lng);
      setLoading(false);
    } else {
      // SCENARIO B: No location yet, fetch it now
      await getCurrentLocation();
    }
  };

  const getCurrentLocation = async () => {
    try {
      // Check permission first
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLoading(false);
        onClose();
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setRegion(newRegion);
      // to ensure the MapView has mounted fully.
      setTimeout(() => {
        mapRef.current?.animateToRegion(newRegion, 1000);
      }, 100);

      await fetchAddress(newRegion.latitude, newRegion.longitude);
    } catch (error) {
      console.error("MapPicker Error:", error);
      setAddress("Location Unavailable");
    } finally {
      setLoading(false);
    }
  };

  const fetchAddress = async (latitude: number, longitude: number) => {
    try {
      const res = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (res.length > 0) {
        const p = res[0];
        setAddress(
          `${p.name || p.street || "Selected Location"}, ${p.city || ""}`,
        );
      }
    } catch (e) {
      setAddress("Unknown Location");
    }
  };

  const handleRegionChange = (newRegion: Region) => {
    setRegion(newRegion);
    setLoading(true);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      await fetchAddress(newRegion.latitude, newRegion.longitude);
      setLoading(false);
    }, 800);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <MapView
          provider={undefined} //todo: fix it to use the Google maps provider (ios build not including Google maps currently)
          style={styles.map}
          initialRegion={region}
          onRegionChangeComplete={handleRegionChange}
        />

        {/* Center Marker */}
        <View style={styles.markerFixed} pointerEvents="none">
          <Ionicons name="location" size={40} color="#FF3B30" />
        </View>

        {/* Top Header */}
        <TouchableOpacity style={styles.backBtn} onPress={onClose}>
          <Ionicons name="arrow-back" size={24} color="#1C1C1E" />
        </TouchableOpacity>

        {/* Bottom Info Card */}
        <View style={styles.bottomCard}>
          <Text style={styles.addressLabel}>Select Location</Text>
          <View style={styles.addressRow}>
            {loading ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Text numberOfLines={2} style={styles.addressText}>
                {address}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={() =>
              onConfirm({
                name: address,
                lat: region.latitude,
                lng: region.longitude,
              })
            }
          >
            <Text style={styles.confirmBtnText}>Confirm Location</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  markerFixed: {
    left: "50%",
    marginLeft: -20,
    marginTop: -40,
    position: "absolute",
    top: "50%",
  },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 25,
    elevation: 5,
    shadowOpacity: 0.1,
  },
  bottomCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8E8E93",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  addressRow: { height: 50, justifyContent: "center" },
  addressText: { fontSize: 16, fontWeight: "600", color: "#1C1C1E" },
  confirmBtn: {
    backgroundColor: "#1C1C1E",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  confirmBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});

export default MapPickerModal;

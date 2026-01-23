import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  StatusBar,
  LayoutAnimation,
  Platform,
  UIManager,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import API from "../api/routes";
import { useNavigation } from "@react-navigation/native";
import { getPriceSymbol } from "../utils/commonUtils";
import Ionicons from "@expo/vector-icons/Ionicons";
import Config from "@/config";

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const GOOGLE_API_KEY = Config.googleApiKey || "";

interface Details {
  id: string;
  name: string;
  description: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  rating: number;
  reviewCount: number;
  priceLevel: string | undefined;
  isVeg: boolean;
  isNonVeg: boolean;
  isPureVeg: boolean;
  type: string | undefined;
  photos: Array<string>;
  reviews: Array<{
    text: string;
    author: string | undefined;
    rating: number | undefined;
    time: string | undefined;
  }>;
  navigationUrl: string;
  avgTravelTimeMinutes: number;
  fairnessScore: number;
  totalScore: number;
}

export default function ResultsScreen({ route }: any) {
  const { recommendations } = route.params;
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [expandedDescriptions, setExpandedDescriptions] = useState<
    Record<string, boolean>
  >({});
  const [canExpandMap, setCanExpandMap] = useState<Record<string, boolean>>({});

  // The logical check function
  const handleTextLayout = (id: string, event: any) => {
    const { lines } = event.nativeEvent;
    // If the text is more than 2 lines long, we enable the "Show More" button
    if (lines.length > 2 && !canExpandMap[id]) {
      setCanExpandMap((prev) => ({ ...prev, [id]: true }));
    }
  };

  const toggleDescription = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedDescriptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const navigateToDetails = (item: Details) => {
    const highResPhotoUrl = `${API?.THIRD_PARTY?.GOOGLE_PLACES_PHOTO}/${item.photos[0]}/media?key=${GOOGLE_API_KEY}&maxHeightPx=1000`;

    if (item.photos?.length > 0) {
      Image.prefetch(highResPhotoUrl).catch((err) =>
        console.log("Prefetch failed", err),
      );
    }
    navigation.navigate("PlaceDetail", { place: item });
  };

  const getPhotoUrl = (photoName: string) => {
    if (!photoName) return null;

    return `${API?.THIRD_PARTY?.GOOGLE_PLACES_PHOTO}/${photoName}/media?key=${GOOGLE_API_KEY}&maxHeightPx=1000`;
  };

  const onShare = async (item: Details) => {
    try {
      const shareMessage =
        `📍 *Found a Midway Spot!* \n\n` +
        `Hey guys, let's meet at *${item.name}*.\n` +
        `It's a ${item.fairnessScore}% fair match for our group with an avg. ${item.avgTravelTimeMinutes} min travel time.\n\n` +
        `🗺️ View on Maps: ${item.navigationUrl}`;

      const result = await Share.share({
        message: shareMessage,
        url: item.navigationUrl, // URL parameter helps with the preview on iOS
        title: `Meetup at ${item.name}`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      }
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const renderItem = ({ item }: { item: Details }) => {
    const photoUrl =
      item.photos?.length > 0 ? getPhotoUrl(item.photos[0]) : null;

    return (
      <View style={[styles.card]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigateToDetails(item)}
        >
          {/* Cover Image */}
          <View style={styles.imageContainer}>
            {photoUrl ? (
              <Image
                source={{ uri: photoUrl }}
                style={styles.coverImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.coverImage, styles.placeholderImage]}>
                <Text style={{ color: "#8E8E93" }}>📸 No Image Available</Text>
              </View>
            )}

            {/* Premium Badges */}
            <View style={styles.badgeOverlay}>
              {item.isVeg && (
                <View style={[styles.pill, styles.vegPill]}>
                  <View style={styles.vegDot} />
                  <Text style={styles.pillText}>Veg</Text>
                </View>
              )}
              {item.isNonVeg && (
                <View style={[styles.pill, styles.nonVegPill]}>
                  <View style={styles.nonVegDot} />
                  <Text style={styles.pillText}>Non-Veg</Text>
                </View>
              )}
              {item.priceLevel && (
                <View style={[styles.pill, styles.pricePill]}>
                  <Text style={styles.pillText}>
                    {getPriceSymbol(item.priceLevel)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingText}>
                  ★ {item.rating?.toFixed(1) ?? "4.0"}
                </Text>
              </View>
            </View>

            <Text style={styles.typeText}>{item.type?.replace("_", " ")}</Text>

            {/* Show full description if expanded, otherwise 2 lines */}
            <View style={styles.descriptionWrapper}>
              <Text
                style={styles.description}
                numberOfLines={expandedDescriptions[item.id] ? undefined : 2}
                onTextLayout={(e) => handleTextLayout(item.id, e)} // Measure the text
              >
                {item.description}
              </Text>

              {/* Only show the button if the text actually exceeds 2 lines */}
              {canExpandMap[item.id] && (
                <TouchableOpacity
                  onPress={() => toggleDescription(item.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.showMoreText}>
                    {expandedDescriptions[item.id] ? "Show less" : "Read more"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.fairnessContainer}>
              <View style={styles.fairnessBarBackground}>
                <View
                  style={[
                    styles.fairnessBarFill,
                    {
                      width: `${item.fairnessScore}%`,
                      backgroundColor:
                        item.fairnessScore > 80 ? "#00C853" : "#FFD600",
                    },
                  ]}
                />
              </View>
              <Text style={styles.fairnessLabel}>
                {item.fairnessScore}% Fair Match for Group
              </Text>
            </View>

            <View style={styles.footer}>
              <View style={styles.timeBox}>
                <Text style={styles.timeLabel}>Avg. Travel</Text>
                <Text style={styles.timeValue}>
                  {item.avgTravelTimeMinutes} mins
                </Text>
              </View>
              <View style={styles.actionGroup}>
                {/* SHARE BUTTON */}
                <TouchableOpacity
                  activeOpacity={0.6}
                  style={styles.transparentShareBtn}
                  onPress={() => onShare(item)}
                >
                  <Ionicons name="share-social" size={24} color="black" />
                </TouchableOpacity>
                {/* NAVIGATE BUTTON */}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => Linking.openURL(item.navigationUrl)}
                >
                  <Text style={styles.actionText}>Navigate</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View
        style={[
          styles.customHeader,
          {
            paddingTop:
              Platform.OS === "ios"
                ? insets.top
                : (StatusBar.currentHeight || 0) + 10,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitleText}>Fairness Rankings</Text>
        <View style={{ width: 40 }} />
      </View>
      <FlatList
        data={recommendations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        // Add top padding so the first card isn't hidden under the header
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 40,
          paddingTop: Platform.OS === "ios" ? insets.top + 60 : 80,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={styles.listHeaderPadding}>
            <Text style={styles.mainTitle}>Best Midway Spots</Text>
            <Text style={styles.subtitle}>
              {recommendations.length} curated matches for your group
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FB" },

  // Custom Header Styles
  customHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: "rgba(248, 249, 251, 0.9)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E5EA",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  headerTitleText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1C1C1E",
  },

  // List Typography
  listHeaderPadding: {
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1C1C1E",
  },
  subtitle: {
    fontSize: 15,
    color: "#8E8E93",
    marginTop: 4,
  },

  title: { fontSize: 28, fontWeight: "800", color: "#1C1C1E" },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    marginBottom: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    // Premium iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  imageContainer: { width: "100%", height: 200 },
  coverImage: { width: "100%", height: "100%" },
  placeholderImage: {
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    gap: 6,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  vegPill: { borderColor: "#4CAF50" },
  nonVegPill: { borderColor: "#E53935" },
  pricePill: { borderColor: "#AEAEB2" },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginRight: 6,
  },
  nonVegDot: {
    width: 8,
    height: 8,
    borderRadius: 1,
    backgroundColor: "#E53935",
    marginRight: 6,
  }, // Square dot for non-veg
  pillText: { fontSize: 11, fontWeight: "700", color: "#1C1C1E" },
  content: { padding: 18 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: { fontSize: 20, fontWeight: "700", color: "#1C1C1E", flex: 1 },
  ratingContainer: {
    backgroundColor: "#FF9500",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: { fontSize: 14, fontWeight: "bold", color: "#FFF" },
  typeText: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    textAlign: "justify",
  },
  descriptionWrapper: {
    marginTop: 8,
  },
  showMoreText: {
    color: "#007AFF",
    fontWeight: "700",
    fontSize: 13,
    marginTop: 2,
    alignSelf: "flex-start",
  },

  expandedSection: { marginTop: 16 },
  divider: { height: 1, backgroundColor: "#F2F2F7", marginBottom: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 12,
  },
  reviewItem: {
    marginBottom: 12,
    backgroundColor: "#F8F9FB",
    padding: 12,
    borderRadius: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  reviewAuthor: { fontSize: 13, fontWeight: "600", color: "#1C1C1E" },
  reviewRating: { fontSize: 12, color: "#FF9500", fontWeight: "700" },
  reviewText: { fontSize: 13, color: "#636366", fontStyle: "italic" },
  noDataText: {
    fontSize: 13,
    color: "#8E8E93",
    textAlign: "center",
    marginVertical: 10,
  },

  fairnessContainer: { marginTop: 18 },
  fairnessBarBackground: {
    height: 6,
    backgroundColor: "#E5E5EA",
    borderRadius: 3,
  },
  fairnessBarFill: { height: "100%", borderRadius: 3 },
  fairnessLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#8E8E93",
    marginTop: 8,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  timeBox: { flexDirection: "column" },
  timeLabel: {
    fontSize: 10,
    color: "#8E8E93",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  timeValue: { fontSize: 18, fontWeight: "700", color: "#1C1C1E" },
  actionButton: {
    backgroundColor: "#1C1C1E",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  actionGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionText: { color: "#FFF", fontWeight: "700", fontSize: 14 },
  transparentShareBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E5E5EA",
  },
});

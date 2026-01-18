import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Linking,
  TouchableOpacity,
  StatusBar,
  Platform,
  Dimensions,
  Share,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import API from '../api/routes';
import { getPriceSymbol } from '../utils/commonUtils';
import Ionicons from '@expo/vector-icons/Ionicons';
import Config from '@/config';

const GOOGLE_API_KEY = Config.googleApiKey || '';

export default function PlaceDetailScreen({ route }: any) {
  const { place } = route.params;
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0); // Track current page

  useEffect(() => {
    if (place.photos && place.photos.length > 1) {
      // Skip the first one (already prefetched in ResultsScreen)
      place.photos.slice(1, 5).forEach((photoName: string) => {
        const url = getPhotoUrl(photoName);
        Image.prefetch(url);
      });
    }
  }, []);

  // Calculate index based on scroll position
  const handleScroll = (event: any) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(scrollOffset / width);
    setActiveIndex(currentIndex);
  };

  const onShare = async () => {
    try {
      const shareMessage =
        `📍 *Let's meet at ${place.name}!*\n\n` +
        `It's a ${place.fairnessScore}% fair match for the group.\n` +
        `Avg. travel time: ${place.avgTravelTimeMinutes} mins.\n\n` +
        `Check it out here: ${place.navigationUrl}`;

      await Share.share({
        message: shareMessage,
        url: place.navigationUrl, // iOS uses this for the preview
        title: `Meetup at ${place.name}`,
      });
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const getPhotoUrl = (photoName: string) => {
    return `${API.THIRD_PARTY.GOOGLE_PLACES_PHOTO}/${photoName}/media?key=${GOOGLE_API_KEY}&maxHeightPx=1000`;
  };

  const renderHeroImage = ({ item }: { item: string }) => (
    <View style={styles.imageContainer}>
      <Image
        source={{ uri: getPhotoUrl(item) }}
        style={styles.heroImage}
        fadeDuration={300}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 1. Floating Top Header (Immediate Action) */}
      <View
        style={[
          styles.floatingHeader,
          {
            paddingTop:
              Platform.OS === 'ios'
                ? insets.top
                : (StatusBar.currentHeight || 0) + 10,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.circleButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.iconText}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.circleButtonShare, styles.shareBtn]}
            onPress={onShare}
          >
            <Ionicons name="share-social" size={24} color="black" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navigateAction}
            onPress={() => Linking.openURL(place.navigationUrl)}
          >
            <Text style={styles.navigateActionText}>Navigate</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* 2. Hero Image with Overlaid Badges */}
        <View style={styles.carouselContainer}>
          <FlatList
            data={place.photos}
            renderItem={renderHeroImage}
            keyExtractor={item => item}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            bounces={false}
            decelerationRate="fast"
          />

          {/* 3. Pagination Dots Overlay */}
          {place.photos.length > 1 && (
            <View style={styles.paginationOverlay}>
              <Text style={styles.photoCountText}>
                {activeIndex + 1} / {place.photos.length}
              </Text>
            </View>
          )}
          <View style={styles.badgeOverlay}>
            {place.isVeg && (
              <View style={[styles.pill, styles.vegPill]}>
                <View style={styles.vegDot} />
                <Text style={styles.pillText}>Veg</Text>
              </View>
            )}
            {place.isNonVeg && (
              <View style={[styles.pill, styles.nonVegPill]}>
                <View style={styles.nonVegDot} />
                <Text style={styles.pillText}>Non-Veg</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.contentCard}>
          {/* 3. Title & Rating Row */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{place.name}</Text>
              <View style={styles.subHeaderRow}>
                <Text style={styles.typeText}>
                  {place.type?.replace('_', ' ')}
                </Text>
                {/* Price Info Added Here */}
                {place.priceLevel && (
                  <Text style={styles.priceText}>
                    • {getPriceSymbol(place.priceLevel)}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingValue}>{place.rating}</Text>
              <Text style={styles.star}>★</Text>
            </View>
          </View>

          {/* 4. Group Fairness Insight */}
          <View style={styles.fairnessBanner}>
            <View style={styles.fairnessInfo}>
              <Text style={styles.fairnessTitle}>✨ Group Fairness Match</Text>
              <Text style={styles.fairnessDesc}>
                Optimized at{' '}
                <Text style={styles.boldText}>{place.fairnessScore}%</Text> for
                your group. Average travel:{' '}
                <Text style={styles.boldText}>
                  {place.avgTravelTimeMinutes}m
                </Text>
                .
              </Text>
            </View>
          </View>

          {/* 5. Details Section */}
          <Text style={styles.sectionTitle}>Information</Text>
          <Text style={styles.descriptionText}>{place.description}</Text>
          <Text style={styles.addressText}>📍 {place.address}</Text>

          <View style={styles.divider} />

          {/* 6. Premium Reviews */}
          <View style={styles.reviewHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <Text style={styles.reviewCount}>{place.reviewCount} total</Text>
          </View>

          {place.reviews.map((rev: any, i: number) => (
            <View key={i} style={styles.premiumReviewCard}>
              <View style={styles.reviewUserRow}>
                <View style={styles.avatarPlaceholder}>
                  <Text>{rev.author?.[0]}</Text>
                </View>
                <View>
                  <Text style={styles.authorName}>{rev.author}</Text>
                  <Text style={styles.reviewDate}>{rev.time || 'Recent'}</Text>
                </View>
                <View style={styles.userRating}>
                  <Text style={styles.userRatingText}>{rev.rating} ★</Text>
                </View>
              </View>
              <Text style={styles.reviewBody}>{rev.text}</Text>
            </View>
          ))}

          {/* Bottom Padding for Scroll */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </View>
  );
}
const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  // Floating Top Bar
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100, // Ensure it's above the image
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleButtonShare: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  iconText: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  navigateAction: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  navigateActionText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 14,
    alignContent: 'center',
  },

  // Image & Badges
  imageContainer: {
    width: width,
    height: 450,
    backgroundColor: '#000',
  },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  badgeOverlay: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    flexDirection: 'row',
    gap: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  nonVegDot: {
    width: 8,
    height: 8,
    borderRadius: 1,
    backgroundColor: '#E53935',
    marginRight: 6,
  },
  pillText: { fontSize: 12, fontWeight: '700', color: '#000' },

  contentCard: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    marginTop: -30,
    padding: 24,
    minHeight: 600,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: '900', color: '#1C1C1E', marginBottom: 5 },
  typeText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  priceText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '600',
    marginLeft: 4,
  },
  ratingBadge: {
    backgroundColor: '#FF9500',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    height: 45,
  },
  ratingValue: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  star: { color: '#FFF', marginLeft: 2, fontSize: 14 },

  // Insight Banner
  fairnessBanner: {
    backgroundColor: '#F2F2F7',
    padding: 18,
    borderRadius: 20,
    marginBottom: 25,
  },
  fairnessInfo: {
    flex: 1,
  },
  fairnessTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 5,
  },
  fairnessDesc: { fontSize: 14, color: '#3A3A3C', lineHeight: 20 },
  boldText: { fontWeight: '700', color: '#000' },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 15,
  },
  descriptionText: {
    fontSize: 16,
    color: '#48484A',
    lineHeight: 24,
    marginBottom: 15,
  },
  addressText: { fontSize: 14, color: '#8E8E93', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F2F2F7', marginVertical: 25 },

  // Reviews
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  reviewCount: { color: '#8E8E93', fontWeight: '600' },
  premiumReviewCard: {
    backgroundColor: '#F8F9FB',
    padding: 16,
    borderRadius: 20,
    marginBottom: 15,
  },
  reviewUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  authorName: { fontWeight: '700', fontSize: 15, color: '#1C1C1E' },
  reviewDate: { fontSize: 12, color: '#8E8E93' },
  userRating: {
    marginLeft: 'auto',
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  userRatingText: { fontWeight: 'bold', fontSize: 12 },
  reviewBody: { fontSize: 14, color: '#3A3A3C', lineHeight: 20 },
  vegPill: { borderColor: '#4CAF50' },
  nonVegPill: { borderColor: '#E53935' },
  shareBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  carouselContainer: {
    width: width,
    height: 450,
    backgroundColor: '#000',
  },
  paginationOverlay: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  photoCountText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

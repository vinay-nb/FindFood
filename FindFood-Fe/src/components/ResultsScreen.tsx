import React from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';

export default function ResultsScreen({ route }: any) {
  const { recommendations } = route.params;

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>★ {item.rating ?? 'N/A'}</Text>
        </View>
      </View>

      <Text style={styles.summary} numberOfLines={2}>
        {item.summary ?? 'Perfect spot for your group meetup.'}
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Avg. Travel</Text>
          <Text style={styles.statValue}>{item.avgTravelTimeMinutes} mins</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Fairness Score</Text>
          <Text
            style={[
              styles.statValue,
              { color: item.fairnessScore < 10 ? '#2ecc71' : '#f39c12' },
            ]}
          >
            {item.fairnessScore < 10 ? 'Highly Fair' : 'Moderate'}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Top Recommendations</Text>
      <FlatList
        data={recommendations}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1a1a1a',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  ratingBadge: {
    backgroundColor: '#fff9c4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingText: { color: '#fbc02d', fontWeight: 'bold' },
  summary: { fontSize: 14, color: '#666', marginVertical: 8, lineHeight: 20 },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    marginTop: 4,
  },
  stat: { flex: 1 },
  statLabel: { fontSize: 12, color: '#999', textTransform: 'uppercase' },
  statValue: { fontSize: 15, fontWeight: '600', color: '#2f95dc' },
});

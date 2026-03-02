import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@apollo/client';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, borderRadius } from '../theme';
import { GET_PODS } from '../graphql/queries';

interface Pod {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  feePerPerson: number;
  location: string;
  maxSeats: number;
  currentSeats: number;
  status: string;
  host: { id: string; name: string; avatar: string };
}

interface PodNavigationCallback {
  (podId: string): void;
}

interface ExploreScreenProps {
  onPodPress?: PodNavigationCallback;
}

const CATEGORIES = ['All', 'Social', 'Learning', 'Outdoor'];

const ExploreScreen: React.FC<ExploreScreenProps> = ({ onPodPress }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const { data, loading, refetch } = useQuery(GET_PODS, {
    variables: {
      page: 1,
      limit: 50,
      search: search.trim() || undefined,
      category: activeCategory === 'All' ? undefined : activeCategory,
    },
    fetchPolicy: 'cache-and-network',
  });

  const pods: Pod[] = data?.pods?.items ?? [];

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Explore</Text>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={18} color={colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search pods..."
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <MaterialIcons name="close" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.categoryRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryTab, activeCategory === cat && styles.categoryTabActive]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text
              style={[styles.categoryTabText, activeCategory === cat && styles.categoryTabTextActive]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && pods.length === 0 && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      <FlatList
        data={pods}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.centered}>
              <MaterialIcons name="search-off" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No pods found</Text>
              <Text style={styles.emptySubtitle}>Try a different search or category</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => onPodPress?.(item.id)}
          >
            <Image
              source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400' }}
              style={styles.cardImage}
            />
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              <View style={styles.locationRow}>
                <MaterialIcons name="place" size={12} color={colors.textSecondary} />
                <Text style={styles.cardLocation} numberOfLines={1}>{item.location}</Text>
              </View>
              <View style={styles.cardMeta}>
                <Text style={styles.cardCategory}>{item.category}</Text>
                <Text style={styles.cardFee}>₹{item.feePerPerson}</Text>
              </View>
              <View style={styles.seatsRow}>
                <View style={styles.seatsBarBg}>
                  <View
                    style={[styles.seatsBarFill, { width: `${Math.min((item.currentSeats / item.maxSeats) * 100, 100)}%` }]}
                  />
                </View>
                <Text style={styles.seatsText}>{item.currentSeats}/{item.maxSeats}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    marginBottom: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.text },
  categoryRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  categoryTab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryTabText: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  categoryTabTextActive: { color: colors.white, fontWeight: '600' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: spacing.xs, marginTop: spacing.md },
  emptySubtitle: { fontSize: 14, color: colors.textSecondary },
  grid: { paddingHorizontal: spacing.xl, paddingBottom: 100 },
  row: { gap: spacing.md, marginBottom: spacing.md },
  card: {
    flex: 1,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardImage: { width: '100%', height: 120 },
  statusBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  statusText: { color: colors.white, fontSize: 10, fontWeight: '600' },
  cardContent: { padding: spacing.md },
  cardTitle: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: spacing.xs },
  cardLocation: { fontSize: 11, color: colors.textSecondary },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  cardCategory: { fontSize: 12, color: colors.textSecondary },
  cardFee: { fontSize: 12, fontWeight: '700', color: colors.primary },
  seatsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  seatsBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 2,
    overflow: 'hidden',
  },
  seatsBarFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 2 },
  seatsText: { fontSize: 10, color: colors.textTertiary },
});

export default ExploreScreen;

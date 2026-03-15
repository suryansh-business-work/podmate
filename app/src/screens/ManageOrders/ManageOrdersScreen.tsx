import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@apollo/client';
import { MaterialIcons } from '@expo/vector-icons';

import { GET_PODS } from '../../graphql/queries';
import { GET_MY_PLACES } from '../../graphql/queries/misc.queries';
import { ManageOrdersScreenProps, BookingFilter, BOOKING_FILTERS } from './ManageOrders.types';
import { createStyles } from './ManageOrders.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

interface PodItem {
  id: string;
  title: string;
  imageUrl: string;
  status: string;
  feePerPerson: number;
  maxSeats: number;
  currentSeats: number;
  dateTime: string;
  placeId: string;
}

interface PlaceItem {
  id: string;
  name: string;
  status: string;
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: '#10B981',
  CONFIRMED: '#2563EB',
  COMPLETED: '#6B7280',
  CANCELLED: '#EF4444',
  PENDING: '#F59E0B',
  NEW: '#9333EA',
  CLOSED: '#6B7280',
};

const ManageOrdersScreen: React.FC<ManageOrdersScreenProps> = ({ onBack, onPodPress }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const [activeFilter, setActiveFilter] = useState<BookingFilter>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const { data: placesData } = useQuery(GET_MY_PLACES, { fetchPolicy: 'cache-and-network' });
  const myPlaces: PlaceItem[] = (placesData?.myPlaces ?? []).filter(
    (p: PlaceItem) => p.status === 'APPROVED',
  );
  const placeIds = new Set(myPlaces.map((p: PlaceItem) => p.id));
  const placeLookup = new Map(myPlaces.map((p: PlaceItem) => [p.id, p.name]));

  const { data: podsData, refetch: refetchPods } = useQuery(GET_PODS, {
    variables: { page: 1, limit: 100 },
    fetchPolicy: 'cache-and-network',
  });

  const allPods: PodItem[] = (podsData?.pods?.items ?? []).filter(
    (pod: PodItem) => pod.placeId && placeIds.has(pod.placeId),
  );

  const filteredPods = allPods.filter((pod) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'UPCOMING')
      return ['OPEN', 'CONFIRMED', 'NEW', 'PENDING'].includes(pod.status);
    if (activeFilter === 'COMPLETED') return pod.status === 'COMPLETED';
    if (activeFilter === 'CANCELLED') return pod.status === 'CANCELLED';
    return true;
  });

  const stats = {
    total: allPods.length,
    upcoming: allPods.filter((p) => ['OPEN', 'CONFIRMED', 'NEW', 'PENDING'].includes(p.status))
      .length,
    completed: allPods.filter((p) => p.status === 'COMPLETED').length,
    revenue: allPods.reduce((sum, p) => sum + p.feePerPerson * p.currentSeats, 0),
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchPods();
    setRefreshing(false);
  }, [refetchPods]);

  const renderBooking = ({ item }: { item: PodItem }) => {
    const statusColor = STATUS_COLORS[item.status] ?? colors.textTertiary;
    return (
      <TouchableOpacity
        style={styles.bookingCard}
        activeOpacity={0.7}
        onPress={() => onPodPress?.(item.id)}
      >
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.bookingImage} />
        ) : (
          <View style={styles.bookingImagePlaceholder}>
            <MaterialIcons name="celebration" size={40} color={colors.textTertiary} />
          </View>
        )}
        <View style={styles.bookingBody}>
          <Text style={styles.bookingTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.bookingVenue} numberOfLines={1}>
            {placeLookup.get(item.placeId) ?? 'Unknown Venue'}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
          </View>
          <View style={styles.bookingFooter}>
            <Text style={styles.bookingSeats}>
              {item.currentSeats}/{item.maxSeats} seats
            </Text>
            <Text style={styles.bookingFee}>
              ₹{item.feePerPerson}
              <Text style={styles.bookingSeats}>/person</Text>
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Orders</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { value: `${stats.total}`, label: 'Total', color: colors.text },
          { value: `${stats.upcoming}`, label: 'Upcoming', color: '#2563EB' },
          { value: `${stats.completed}`, label: 'Completed', color: '#10B981' },
          { value: `₹${stats.revenue}`, label: 'Revenue', color: colors.primary },
        ].map((s) => (
          <View key={s.label} style={styles.statCard}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {BOOKING_FILTERS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.filterChip, activeFilter === tab.key && styles.filterChipActive]}
            onPress={() => setActiveFilter(tab.key)}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === tab.key && styles.filterChipTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {filteredPods.length === 0 ? (
        <View style={styles.centered}>
          <MaterialIcons name="receipt-long" size={56} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>No bookings yet</Text>
          <Text style={styles.emptySubtitle}>
            Bookings will appear here when pods are created at your venues.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPods}
          keyExtractor={(item) => item.id}
          renderItem={renderBooking}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default ManageOrdersScreen;

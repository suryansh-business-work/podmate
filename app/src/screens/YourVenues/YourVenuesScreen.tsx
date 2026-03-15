import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@apollo/client';
import { MaterialIcons } from '@expo/vector-icons';

import { GET_MY_PLACES } from '../../graphql/queries/misc.queries';
import {
  YourVenuesScreenProps,
  VenueItem,
  FilterTab,
  FILTER_TABS,
  STATUS_CONFIG,
} from './YourVenues.types';
import { createStyles } from './YourVenues.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

const YourVenuesScreen: React.FC<YourVenuesScreenProps> = ({
  onBack,
  onRegisterVenue,
  onVenuePress,
}) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const { data, loading, refetch } = useQuery(GET_MY_PLACES, {
    fetchPolicy: 'cache-and-network',
  });

  const venues: VenueItem[] = data?.myPlaces ?? [];

  const filteredVenues =
    activeFilter === 'ALL' ? venues : venues.filter((v) => v.status === activeFilter);

  const stats = {
    total: venues.length,
    approved: venues.filter((v) => v.status === 'APPROVED').length,
    pending: venues.filter((v) => v.status === 'PENDING').length,
    rejected: venues.filter((v) => v.status === 'REJECTED').length,
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderVenue = ({ item }: { item: VenueItem }) => {
    const statusCfg = STATUS_CONFIG[item.status];
    return (
      <TouchableOpacity
        style={styles.venueCard}
        activeOpacity={0.7}
        onPress={() => onVenuePress?.(item.id)}
      >
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.venueImage} />
        ) : (
          <View style={styles.venueImagePlaceholder}>
            <MaterialIcons name="store" size={32} color={colors.textTertiary} />
          </View>
        )}
        <View style={styles.venueInfo}>
          <Text style={styles.venueName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.venueAddress} numberOfLines={1}>
            {item.address}, {item.city}
          </Text>
          {item.category ? (
            <Text style={styles.venueCategory}>{item.category}</Text>
          ) : null}
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.color + '18' }]}>
            <MaterialIcons name={statusCfg.icon} size={12} color={statusCfg.color} />
            <Text style={[styles.statusText, { color: statusCfg.color }]}>{item.status}</Text>
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
        <Text style={styles.headerTitle}>Your Venues</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { value: stats.total, label: 'Total', color: colors.text },
          { value: stats.approved, label: 'Approved', color: '#10B981' },
          { value: stats.pending, label: 'Pending', color: '#F59E0B' },
          { value: stats.rejected, label: 'Rejected', color: '#EF4444' },
        ].map((s) => (
          <View key={s.label} style={styles.statCard}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTER_TABS.map((tab) => (
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
      {!loading && filteredVenues.length === 0 ? (
        <View style={styles.centered}>
          <MaterialIcons name="store" size={56} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>No venues registered yet</Text>
          <Text style={styles.emptySubtitle}>
            Register your first venue and start hosting amazing pods!
          </Text>
          <TouchableOpacity style={styles.registerBtn} onPress={onRegisterVenue}>
            <Text style={styles.registerBtnText}>Register Your First Venue</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredVenues}
          keyExtractor={(item) => item.id}
          renderItem={renderVenue}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}

      {venues.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={onRegisterVenue} activeOpacity={0.8}>
          <MaterialIcons name="add" size={28} color={colors.white} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default YourVenuesScreen;

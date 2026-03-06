import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@apollo/client';
import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { CategoryChip } from '../../components/CategoryChip';
import { EventCard } from '../../components/EventCard';
import { SkeletonFeed } from '../../components/Skeleton';
import { useDebounce } from '../../hooks/useDebounce';
import { useLocation } from '../../hooks/useLocation';
import { GET_PODS, GET_ME } from '../../graphql/queries';
import { PodItem, PodsQueryData, HomeScreenProps, CATEGORIES } from './Home.types';
import { createStyles } from './Home.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

const PAGE_SIZE = 20;

const HomeScreen: React.FC<HomeScreenProps> = ({ onPodPress, onMenuPress }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);
  const isFetchingMore = useRef(false);
  const { location, loading: locationLoading, requestLocation } = useLocation();

  const { data: meData } = useQuery(GET_ME, { fetchPolicy: 'cache-first' });
  const currentUserId: string = (meData?.me?.id as string) ?? '';

  const handleGpsPress = useCallback(async () => {
    const result = await requestLocation();
    if (result?.address) {
      setSearchQuery(result.address);
    }
  }, [requestLocation]);

  const { data, loading, error, refetch, fetchMore } = useQuery<PodsQueryData>(GET_PODS, {
    variables: {
      category: selectedCategory === 'All' ? undefined : selectedCategory,
      search: debouncedSearch || undefined,
      page: 1,
      limit: PAGE_SIZE,
    },
    fetchPolicy: 'cache-and-network',
  });

  const pods = data?.pods?.items ?? [];
  const currentPage = data?.pods?.page ?? 1;
  const totalPages = data?.pods?.totalPages ?? 1;
  const hasMore = currentPage < totalPages;

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleEndReached = useCallback(() => {
    if (!hasMore || loading || isFetchingMore.current) return;
    isFetchingMore.current = true;
    fetchMore({
      variables: { page: currentPage + 1 },
      updateQuery: (prev, { fetchMoreResult }) => {
        isFetchingMore.current = false;
        if (!fetchMoreResult) return prev;
        return {
          pods: {
            ...fetchMoreResult.pods,
            items: [...prev.pods.items, ...fetchMoreResult.pods.items],
          },
        };
      },
    }).catch(() => {
      isFetchingMore.current = false;
    });
  }, [hasMore, loading, currentPage, fetchMore]);

  const renderItem = useCallback(
    ({ item }: { item: PodItem }) => {
      const isJoined = item.attendees?.some((a) => a.id === currentUserId) ?? false;
      return (
        <EventCard
          id={item.id}
          title={item.title}
          imageUrl={item.imageUrl}
          feePerPerson={item.feePerPerson}
          maxSeats={item.maxSeats}
          currentSeats={item.currentSeats}
          dateTime={item.dateTime}
          rating={item.rating}
          status={item.status}
          category={item.category}
          hostName={item.host.name}
          hostAvatar={item.host.avatar}
          mediaUrls={item.mediaUrls}
          isJoined={isJoined}
          onPress={onPodPress}
        />
      );
    },
    [currentUserId, onPodPress],
  );

  const ListHeader = (
    <>
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={18} color={colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Find hiking, dining, tech..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="close" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {location && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 4 }}>
          <MaterialIcons name="place" size={14} color={colors.primary} />
          <Text style={{ fontSize: 12, color: colors.textSecondary }}>{location.address}</Text>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map((cat) => (
          <CategoryChip
            key={cat}
            label={cat}
            selected={selectedCategory === cat}
            onPress={() => setSelectedCategory(cat)}
          />
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Popular near you</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>VIEW ALL</Text>
        </TouchableOpacity>
      </View>

      {loading && pods.length === 0 && <SkeletonFeed />}
    </>
  );

  const ListFooter = hasMore ? (
    <View style={{ paddingVertical: 16, alignItems: 'center' }}>
      <ActivityIndicator size="small" color={colors.primary} />
    </View>
  ) : null;

  const ListEmpty =
    !loading && !error ? (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="ticket-outline" size={48} color={colors.textTertiary} />
        <Text style={styles.emptyTitle}>No pods found</Text>
        <Text style={styles.emptySubtitle}>Try a different category or search term</Text>
      </View>
    ) : !loading && error ? (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="cloud-off" size={48} color={colors.error} />
        <Text style={styles.emptyTitle}>Something went wrong</Text>
        <Text style={styles.emptySubtitle}>{error.message}</Text>
      </View>
    ) : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn}>
            <MaterialIcons name="menu" size={24} color={colors.text} />
          </TouchableOpacity>
          <LinearGradient
            colors={[colors.primaryLight, colors.primary]}
            style={styles.headerLogo}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons name="account-group" size={18} color={colors.white} />
          </LinearGradient>
          <Text style={styles.headerTitle}>PartyWings</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            style={styles.notificationBtn}
            onPress={handleGpsPress}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <MaterialIcons
                name="my-location"
                size={22}
                color={location ? colors.primary : colors.text}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.notificationBtn}>
            <MaterialIcons name="notifications-none" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={pods}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={ListEmpty}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 20 }}
        windowSize={5}
        maxToRenderPerBatch={5}
        initialNumToRender={4}
        removeClippedSubviews
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
      />
    </SafeAreaView>
  );
};

export default HomeScreen;

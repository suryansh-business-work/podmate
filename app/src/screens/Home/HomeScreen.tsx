import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@apollo/client';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

import { CategoryChip } from '../../components/CategoryChip';
import { SubCategoryBar } from '../../components/SubCategoryBar';
import { EventCard } from '../../components/EventCard';
import { SkeletonFeed } from '../../components/Skeleton';
import HomeSlider from '../../components/HomeSlider';
import LocationSelector from './LocationSelector';
import { useDebounce } from '../../hooks/useDebounce';
import { useLocation } from '../../hooks/useLocation';
import { GET_PODS, GET_ME, GET_ACTIVE_SLIDERS, GET_ACTIVE_CATEGORIES } from '../../graphql/queries';
import { PodItem, PodsQueryData, HomeScreenProps, CategoryItem } from './Home.types';
import { createStyles } from './Home.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

const PAGE_SIZE = 20;

const HomeScreen: React.FC<HomeScreenProps> = ({
  onPodPress,
  onMenuPress,
  onNotificationPress,
  onChatbotPress,
}) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);
  const isFetchingMore = useRef(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const { location, loading: locationLoading } = useLocation();

  const { data: meData } = useQuery(GET_ME, { fetchPolicy: 'cache-first' });
  const currentUserId: string = (meData?.me?.id as string) ?? '';
  const userAvatar: string = (meData?.me?.avatar as string) ?? '';

  const { data: categoriesData } = useQuery<{ activeCategories: CategoryItem[] }>(
    GET_ACTIVE_CATEGORIES,
    { fetchPolicy: 'cache-and-network' },
  );
  const categories: CategoryItem[] = categoriesData?.activeCategories ?? [];

  const activeSubcategories = useMemo(() => {
    if (selectedCategory === 'All') return [];
    const cat = categories.find((c) => c.name === selectedCategory);
    return cat?.subcategories ?? [];
  }, [categories, selectedCategory]);

  const handleCategorySelect = useCallback((catName: string) => {
    setSelectedCategory(catName);
    setSelectedSubCategoryId(null);
  }, []);

  const displayCity = selectedCity || location?.matchedCityName || location?.city || 'Select Location';

  const { data: sliderData } = useQuery(GET_ACTIVE_SLIDERS, {
    variables: { city: selectedCity || location?.address || undefined },
    fetchPolicy: 'cache-and-network',
  });
  const sliders =
    (sliderData?.activeSliders as Array<{
      id: string;
      title: string;
      subtitle: string;
      imageUrl: string;
      ctaText: string;
      ctaLink: string;
      category: string;
    }>) ?? [];

  const handleSelectCity = useCallback((city: string, area?: string) => {
    setSelectedCity(city);
    setSelectedArea(area ?? '');
  }, []);

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

  const happeningSoon = useMemo(() => {
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    return pods.filter((p) => {
      const podTime = new Date(p.dateTime).getTime();
      return podTime > now && podTime - now <= oneWeek;
    });
  }, [pods]);

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
          location={item.location}
          hostName={item.host.name}
          hostAvatar={item.host.avatar}
          hostId={item.host.id}
          mediaUrls={item.mediaUrls}
          isJoined={isJoined}
          onPress={onPodPress}
        />
      );
    },
    [currentUserId, onPodPress],
  );

  const renderHappeningSoonCard = useCallback(
    (item: PodItem) => {
      const isJoined = item.attendees?.some((a) => a.id === currentUserId) ?? false;
      const podDate = new Date(item.dateTime);
      const month = podDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
      const day = podDate.getDate();
      const spotsLeft = item.maxSeats - item.currentSeats;
      return (
        <TouchableOpacity
          key={item.id}
          style={styles.happeningSoonCard}
          activeOpacity={0.88}
          onPress={() => onPodPress(item.id)}
        >
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.happeningSoonImage}
            resizeMode="cover"
          />
          {isJoined && (
            <View style={[styles.happeningSoonBadge, { backgroundColor: colors.success }]}>
              <Text style={styles.happeningSoonBadgeText}>Joined</Text>
            </View>
          )}
          <View style={styles.happeningSoonContent}>
            <Text style={styles.happeningSoonDate}>
              {month} {day}
            </Text>
            <Text style={styles.happeningSoonTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.happeningSoonMeta}>
              {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full'}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [currentUserId, onPodPress, styles, colors],
  );

  const ListHeader = (
    <>
      {sliders.length > 0 && <HomeSlider items={sliders} />}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        <CategoryChip
          key="all"
          label="All"
          selected={selectedCategory === 'All'}
          onPress={() => handleCategorySelect('All')}
        />
        {categories.map((cat) => (
          <CategoryChip
            key={cat.id}
            label={cat.name}
            iconUrl={cat.iconUrl || undefined}
            selected={selectedCategory === cat.name}
            onPress={() => handleCategorySelect(cat.name)}
          />
        ))}
      </ScrollView>

      {activeSubcategories.length > 0 && (
        <SubCategoryBar
          items={activeSubcategories}
          selectedId={selectedSubCategoryId}
          onSelect={setSelectedSubCategoryId}
        />
      )}

      {happeningSoon.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Happening Soon 🔥</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.happeningSoonScroll}
            contentContainerStyle={styles.happeningSoonScrollContent}
          >
            {happeningSoon.map(renderHappeningSoonCard)}
          </ScrollView>
        </>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>All Pods</Text>
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
        <TouchableOpacity style={styles.headerLeft} onPress={() => setShowLocationSelector(true)}>
          <MaterialIcons name="place" size={20} color={colors.primary} />
          <View>
            <Text style={styles.headerCity} numberOfLines={1}>
              {displayCity}
            </Text>
            {selectedArea ? (
              <Text style={styles.headerArea} numberOfLines={1}>
                {selectedArea}
              </Text>
            ) : null}
          </View>
          <MaterialIcons name="keyboard-arrow-down" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIconBtn} onPress={() => setShowSearch((p) => !p)}>
            <MaterialIcons name="search" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn} onPress={onNotificationPress}>
            <MaterialIcons name="notifications-none" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileBtn} onPress={onMenuPress}>
            {userAvatar ? (
              <Image source={{ uri: userAvatar }} style={styles.profileAvatar} />
            ) : (
              <MaterialIcons name="person" size={20} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {showSearch && (
        <View style={styles.searchBarRow}>
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={18} color={colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Find hiking, dining, tech..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialIcons name="close" size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

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

      <LocationSelector
        visible={showLocationSelector}
        onClose={() => setShowLocationSelector(false)}
        onSelectCity={handleSelectCity}
        currentCity={selectedCity || location?.city}
        currentArea={selectedArea || location?.area}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;

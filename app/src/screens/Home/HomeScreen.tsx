import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@apollo/client';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme';
import { CategoryChip } from '../../components/CategoryChip';
import { EventCard } from '../../components/EventCard';
import { SkeletonFeed } from '../../components/Skeleton';
import { useDebounce } from '../../hooks/useDebounce';
import { GET_PODS } from '../../graphql/queries';
import { PodsQueryData, HomeScreenProps, CATEGORIES } from './Home.types';
import { styles } from './Home.styles';

const HomeScreen: React.FC<HomeScreenProps> = ({ onPodPress, onMenuPress }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);

  const { data, loading, error, refetch } = useQuery<PodsQueryData>(GET_PODS, {
    variables: {
      category: selectedCategory === 'All' ? undefined : selectedCategory,
      search: debouncedSearch || undefined,
      page: 1,
      limit: 20,
    },
    fetchPolicy: 'cache-and-network',
  });

  const pods = data?.pods?.items ?? [];

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

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
        <TouchableOpacity style={styles.notificationBtn}>
          <MaterialIcons name="notifications-none" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />}
      >
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={18} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Find hiking, dining, tech..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((cat) => (
            <CategoryChip key={cat} label={cat} selected={selectedCategory === cat} onPress={() => setSelectedCategory(cat)} />
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular near you</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>VIEW ALL</Text>
          </TouchableOpacity>
        </View>

        {loading && pods.length === 0 && <SkeletonFeed />}

        {!loading && error && (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="cloud-off" size={48} color={colors.error} />
            <Text style={styles.emptyTitle}>Something went wrong</Text>
            <Text style={styles.emptySubtitle}>{error.message}</Text>
          </View>
        )}

        {!loading && !error && pods.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="ticket-outline" size={48} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>No pods found</Text>
            <Text style={styles.emptySubtitle}>Try a different category or search term</Text>
          </View>
        )}

        {pods.map((pod) => (
          <EventCard
            key={pod.id}
            id={pod.id}
            title={pod.title}
            imageUrl={pod.imageUrl}
            feePerPerson={pod.feePerPerson}
            maxSeats={pod.maxSeats}
            currentSeats={pod.currentSeats}
            dateTime={pod.dateTime}
            rating={pod.rating}
            status={pod.status}
            category={pod.category}
            hostName={pod.host.name}
            hostAvatar={pod.host.avatar}
            onPress={onPodPress}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

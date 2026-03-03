import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StatusBar, ActivityIndicator, RefreshControl } from 'react-native';
import { useQuery } from '@apollo/client';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing } from '../../theme';
import { GET_PODS, GET_ME } from '../../graphql/queries';
import { Pod, ExploreScreenProps } from './Explore.types';
import { styles, getSlideHeight } from './Explore.styles';
import PodCard from './PodCard';

const ExploreScreen: React.FC<ExploreScreenProps> = ({ onPodPress, onCheckout }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const tabBarHeight = useBottomTabBarHeight();
  const slideHeight = getSlideHeight(tabBarHeight);

  const { data: meData } = useQuery(GET_ME, { fetchPolicy: 'cache-first' });
  const currentUserId: string = (meData?.me?.id as string) ?? '';

  const { data, loading, error, refetch } = useQuery(GET_PODS, {
    variables: {
      page: 1,
      limit: 50,
      category: activeCategory === 'All' ? undefined : activeCategory,
    },
    fetchPolicy: 'cache-and-network',
  });

  const pods: Pod[] = data?.pods?.items ?? [];

  const handleJoin = useCallback((podId: string) => {
    if (onCheckout) {
      onCheckout(podId);
    }
  }, [onCheckout]);

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (loading && pods.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error && pods.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons name="cloud-off" size={64} color={colors.error} />
        <Text style={[styles.podTitle, { textAlign: 'center', marginTop: spacing.md, color: colors.error }]}>Failed to load</Text>
        <Text style={[styles.podDesc, { textAlign: 'center' }]}>{error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <FlatList
        data={pods}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PodCard
            item={item}
            activeCategory={activeCategory}
            currentUserId={currentUserId}
            onCategoryChange={setActiveCategory}
            onDetailPress={onPodPress}
            onJoinPress={handleJoin}
            slideHeight={slideHeight}
          />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={slideHeight}
        decelerationRate="fast"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={[styles.slide, { height: slideHeight, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.darkBg }]}>
            <MaterialIcons name="explore-off" size={64} color={colors.textTertiary} />
            <Text style={[styles.podTitle, { textAlign: 'center', marginTop: spacing.md }]}>No pods found</Text>
            <Text style={[styles.podDesc, { textAlign: 'center' }]}>Try a different category</Text>
          </View>
        }
      />
    </View>
  );
};

export default ExploreScreen;

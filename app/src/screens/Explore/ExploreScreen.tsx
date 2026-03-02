import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StatusBar, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useMutation, useQuery } from '@apollo/client';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing } from '../../theme';
import { GET_PODS } from '../../graphql/queries';
import { JOIN_POD } from '../../graphql/mutations';
import { Pod, ExploreScreenProps } from './Explore.types';
import { styles, SCREEN_H } from './Explore.styles';
import PodCard from './PodCard';

const ExploreScreen: React.FC<ExploreScreenProps> = ({ onPodPress }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery(GET_PODS, {
    variables: {
      page: 1,
      limit: 50,
      category: activeCategory === 'All' ? undefined : activeCategory,
    },
    fetchPolicy: 'cache-and-network',
  });

  const [joinPodMutation] = useMutation(JOIN_POD);

  const pods: Pod[] = data?.pods?.items ?? [];

  const handleJoin = useCallback(async (podId: string) => {
    setJoiningId(podId);
    try {
      await joinPodMutation({ variables: { podId } });
      await refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to join pod';
      Alert.alert('Error', msg);
    } finally {
      setJoiningId(null);
    }
  }, [joinPodMutation, refetch]);

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
            onCategoryChange={setActiveCategory}
            onDetailPress={onPodPress}
            onJoinPress={handleJoin}
            joiningId={joiningId}
          />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_H}
        decelerationRate="fast"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={[styles.slide, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.darkBg }]}>
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

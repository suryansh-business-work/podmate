import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@apollo/client';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { GET_MOMENTS } from '../../graphql/queries';
import { GET_ME } from '../../graphql/queries';
import type { PaginatedMomentsData, MomentItem } from './Moments.types';
import MomentCard from './MomentCard';
import CommentSheet from './CommentSheet';
import { createStyles } from './Moments.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

interface MomentsScreenProps {
  onCreateMoment?: () => void;
}

const MomentsScreen: React.FC<MomentsScreenProps> = ({ onCreateMoment }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const [refreshing, setRefreshing] = useState(false);
  const [commentMomentId, setCommentMomentId] = useState<string | null>(null);

  const { data: meData } = useQuery<{ me: { id: string } }>(GET_ME, {
    fetchPolicy: 'cache-first',
  });

  const { data, loading, error, refetch, fetchMore } = useQuery<PaginatedMomentsData>(GET_MOMENTS, {
    variables: { page: 1, limit: 20 },
    fetchPolicy: 'cache-and-network',
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch({ page: 1, limit: 20 });
    setRefreshing(false);
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (!data?.moments) return;
    const { page, totalPages } = data.moments;
    if (page >= totalPages) return;
    fetchMore({ variables: { page: page + 1, limit: 20 } });
  }, [data, fetchMore]);

  const currentUserId = meData?.me?.id ?? '';

  const renderItem = useCallback(
    ({ item }: { item: MomentItem }) => (
      <MomentCard item={item} currentUserId={currentUserId} onCommentPress={setCommentMomentId} />
    ),
    [currentUserId],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Moments</Text>

      {loading && !data && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {!loading && error && (
        <View style={styles.centered}>
          <MaterialIcons name="cloud-off" size={48} color={colors.error} />
          <Text style={styles.emptyTitle}>Failed to load moments</Text>
          <Text style={styles.emptySubtitle}>{error.message}</Text>
        </View>
      )}

      {data?.moments && data.moments.items.length === 0 && (
        <View style={styles.centered}>
          <MaterialIcons name="auto-awesome" size={48} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>No moments yet</Text>
          <Text style={styles.emptySubtitle}>Share your first moment with the community!</Text>
        </View>
      )}

      <FlatList
        data={data?.moments?.items ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
      />

      {onCreateMoment && (
        <TouchableOpacity activeOpacity={0.85} onPress={onCreateMoment} style={styles.fab}>
          <LinearGradient
            colors={[colors.primaryLight, colors.primary]}
            style={styles.fabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialIcons name="add-a-photo" size={26} color={colors.white} />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {commentMomentId && (
        <CommentSheet momentId={commentMomentId} onClose={() => setCommentMomentId(null)} />
      )}
    </SafeAreaView>
  );
};

export default MomentsScreen;

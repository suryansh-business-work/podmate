import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@apollo/client';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import SafeImage from '../../components/SafeImage';
import { GET_MY_PODS } from '../../graphql/queries';
import { MyPodItem, MyPodsScreenProps } from './MyPods.types';
import { createStyles } from './MyPods.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

const getStatusConfig = (
  colors: Record<string, string>,
): Record<string, { bg: string; color: string }> => ({
  CONFIRMED: { bg: colors.success + '20', color: colors.success },
  PENDING: { bg: colors.warning + '20', color: colors.warning },
  NEW: { bg: colors.primary + '20', color: colors.primary },
  CANCELLED: { bg: colors.error + '20', color: colors.error },
});

const MyPodsScreen: React.FC<MyPodsScreenProps> = ({ onBack, onPodPress }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const { data, loading, error, refetch } = useQuery<{ myPods: MyPodItem[] }>(GET_MY_PODS, {
    fetchPolicy: 'cache-and-network',
  });

  const pods = data?.myPods ?? [];

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderPodCard = ({ item }: { item: MyPodItem }) => {
    const STATUS_CONFIG = getStatusConfig(colors as unknown as Record<string, string>);
    const statusConf = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.PENDING;
    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={() => onPodPress(item.id)}>
        <SafeImage
          uri={item.imageUrl}
          style={styles.cardImage}
          fallbackIcon="celebration"
          fallbackIconSize={32}
        />
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.cardCategory}>{item.category}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusConf.bg }]}>
            <Text style={[styles.statusText, { color: statusConf.color }]}>{item.status}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Pods</Text>
        <View style={styles.headerRight} />
      </View>

      {loading && pods.length === 0 && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {error && pods.length === 0 && (
        <View style={styles.centered}>
          <MaterialIcons name="cloud-off" size={48} color={colors.error} />
          <Text style={styles.emptyTitle}>Failed to load</Text>
          <Text style={styles.emptySubtitle}>{error.message}</Text>
        </View>
      )}

      <FlatList
        data={pods}
        keyExtractor={(item) => item.id}
        renderItem={renderPodCard}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          !loading && !error ? (
            <View style={styles.centered}>
              <MaterialIcons name="celebration" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No pods yet</Text>
              <Text style={styles.emptySubtitle}>
                Pods you create will appear here. Tap Create a Pod to get started!
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default MyPodsScreen;

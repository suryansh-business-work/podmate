import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@apollo/client';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { GET_NOTIFICATIONS } from '../../graphql/queries';
import { MARK_NOTIFICATION_READ, MARK_ALL_NOTIFICATIONS_READ } from '../../graphql/mutations';
import { Notification, NotificationsScreenProps, NOTIFICATION_ICON_MAP } from './Notifications.types';
import { createStyles } from './Notifications.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

interface NotificationsResponse {
  notifications: {
    items: Notification[];
    total: number;
    page: number;
    totalPages: number;
  };
}

const formatTimeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onBack }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const { data, loading, error, refetch } = useQuery<NotificationsResponse>(GET_NOTIFICATIONS, {
    variables: { page: 1, limit: 50 },
    fetchPolicy: 'cache-and-network',
  });

  const [markRead] = useMutation(MARK_NOTIFICATION_READ);
  const [markAllRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ);

  const notifications: Notification[] = data?.notifications?.items ?? [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = useCallback(async (id: string) => {
    try {
      await markRead({ variables: { notificationId: id } });
      await refetch();
    } catch { /* silent */ }
  }, [markRead, refetch]);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllRead();
      await refetch();
    } catch { /* silent */ }
  }, [markAllRead, refetch]);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderIcon = (type: string) => {
    const iconConfig = NOTIFICATION_ICON_MAP[type] ?? { name: 'notifications', family: 'material' };
    if (iconConfig.family === 'community') {
      return <MaterialCommunityIcons name={iconConfig.name} size={18} color={colors.primary} />;
    }
    return <MaterialIcons name={iconConfig.name} size={18} color={colors.primary} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markAllRead}>Mark all read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 80 }} />
        )}
      </View>

      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadBannerText}>
            {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {loading && notifications.length === 0 && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {!loading && error && notifications.length === 0 && (
        <View style={styles.centered}>
          <MaterialIcons name="cloud-off" size={48} color={colors.error} />
          <Text style={styles.emptyTitle}>Failed to load</Text>
          <Text style={styles.emptySubtitle}>{error.message}</Text>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.notificationRow, !item.read && styles.notificationUnread]}
            onPress={() => !item.read && handleMarkRead(item.id)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              {renderIcon(item.type)}
            </View>
            <View style={styles.notificationContent}>
              <View style={styles.notificationTop}>
                <Text style={[styles.notificationTitle, !item.read && styles.notificationTitleUnread]}>{item.title}</Text>
                <Text style={styles.notificationTime}>{formatTimeAgo(item.createdAt)}</Text>
              </View>
              <Text style={styles.notificationMessage} numberOfLines={2}>{item.message}</Text>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          !loading && !error ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="notifications-none" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptySubtitle}>You&apos;re all caught up! New notifications will appear here.</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default NotificationsScreen;

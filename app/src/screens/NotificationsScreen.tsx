import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@apollo/client';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, borderRadius } from '../theme';
import { GET_MY_PODS } from '../graphql/queries';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const NOTIFICATION_ICON_MAP: Record<string, { name: string; family: 'material' | 'community' }> = {
  pod_join: { name: 'group', family: 'material' },
  pod_update: { name: 'confirmation-number', family: 'material' },
  invite: { name: 'email', family: 'material' },
  system: { name: 'notifications', family: 'material' },
  payment: { name: 'attach-money', family: 'material' },
};

interface NotificationsScreenProps {
  onBack: () => void;
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onBack }) => {
  const { data, loading, error, refetch } = useQuery(GET_MY_PODS, { fetchPolicy: 'cache-and-network' });

  const notifications: Notification[] = (data?.myPods ?? []).map(
    (pod: { id: string; title: string; status: string; category: string }, index: number) => ({
      id: `notif-${pod.id}`,
      type: index % 2 === 0 ? 'pod_update' : 'pod_join',
      title: pod.status === 'ACTIVE' ? 'Pod Active' : 'Pod Update',
      message: `"${pod.title}" - ${pod.category} pod is ${pod.status.toLowerCase()}.`,
      time: 'Recently',
      read: pod.status !== 'ACTIVE',
    }),
  );

  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const unreadCount = notifications.filter((n) => !n.read && !readIds.has(n.id)).length;

  const markAsRead = (id: string) => {
    setReadIds((prev) => new Set([...prev, id]));
  };

  const markAllRead = () => {
    setReadIds(new Set(notifications.map((n) => n.id)));
  };

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
          <TouchableOpacity onPress={markAllRead}>
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
        renderItem={({ item }) => {
          const isRead = item.read || readIds.has(item.id);
          return (
            <TouchableOpacity
              style={[styles.notificationRow, !isRead && styles.notificationUnread]}
              onPress={() => markAsRead(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                {renderIcon(item.type)}
              </View>
              <View style={styles.notificationContent}>
                <View style={styles.notificationTop}>
                  <Text style={[styles.notificationTitle, !isRead && styles.notificationTitleUnread]}>{item.title}</Text>
                  <Text style={styles.notificationTime}>{item.time}</Text>
                </View>
                <Text style={styles.notificationMessage} numberOfLines={2}>{item.message}</Text>
              </View>
              {!isRead && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          !loading ? (
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  markAllRead: { fontSize: 13, fontWeight: '600', color: colors.primary },
  unreadBanner: { backgroundColor: colors.primary + '10', paddingVertical: spacing.sm, paddingHorizontal: spacing.xl },
  unreadBannerText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  list: { paddingHorizontal: spacing.xl },
  notificationRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: spacing.lg, gap: spacing.md },
  notificationUnread: { backgroundColor: colors.surface, marginHorizontal: -spacing.xl, paddingHorizontal: spacing.xl },
  iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceVariant, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  notificationContent: { flex: 1 },
  notificationTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  notificationTitle: { fontSize: 14, fontWeight: '500', color: colors.text },
  notificationTitleUnread: { fontWeight: '700' },
  notificationTime: { fontSize: 12, color: colors.textTertiary },
  notificationMessage: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 8 },
  separator: { height: 1, backgroundColor: colors.surfaceVariant },
  emptyContainer: { alignItems: 'center', paddingTop: 80, paddingHorizontal: spacing.xxxl },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.sm, marginTop: spacing.lg },
  emptySubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
});

export default NotificationsScreen;

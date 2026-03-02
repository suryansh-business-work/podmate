import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../theme';

interface Notification {
  id: string;
  type: 'pod_join' | 'pod_update' | 'invite' | 'system' | 'payment';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'pod_join',
    title: 'New Attendee',
    message: 'Alex D. joined your pod "Omakase & Sake Night"',
    time: '2m ago',
    read: false,
  },
  {
    id: '2',
    type: 'pod_update',
    title: 'Pod Confirmed',
    message: '"Startup Networking Hike" has reached minimum members and is confirmed!',
    time: '1h ago',
    read: false,
  },
  {
    id: '3',
    type: 'invite',
    title: 'Pod Invitation',
    message: 'Chef Kenji invited you to "Tokyo-Style Sushi Masterclass"',
    time: '3h ago',
    read: false,
  },
  {
    id: '4',
    type: 'payment',
    title: 'Payment Received',
    message: '₹1,200 payment received for "Omakase & Sake Night"',
    time: '5h ago',
    read: true,
  },
  {
    id: '5',
    type: 'system',
    title: 'Welcome to PartyWings!',
    message: 'Start exploring pods near you or host your first event.',
    time: '1d ago',
    read: true,
  },
  {
    id: '6',
    type: 'pod_update',
    title: 'Reminder',
    message: '"Premium Wine Tasting Evening" starts tomorrow at 6:30 PM',
    time: '1d ago',
    read: true,
  },
];

const NOTIFICATION_ICONS: Record<string, string> = {
  pod_join: '👥',
  pod_update: '🎫',
  invite: '✉️',
  system: '🔔',
  payment: '💰',
};

interface NotificationsScreenProps {
  onBack: () => void;
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onBack }) => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [refreshing, setRefreshing] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
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

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.notificationRow, !item.read && styles.notificationUnread]}
            onPress={() => markAsRead(item.id)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.notificationIcon}>{NOTIFICATION_ICONS[item.type]}</Text>
            </View>
            <View style={styles.notificationContent}>
              <View style={styles.notificationTop}>
                <Text style={[styles.notificationTitle, !item.read && styles.notificationTitleUnread]}>
                  {item.title}
                </Text>
                <Text style={styles.notificationTime}>{item.time}</Text>
              </View>
              <Text style={styles.notificationMessage} numberOfLines={2}>
                {item.message}
              </Text>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySubtitle}>
              You&apos;re all caught up! New notifications will appear here.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 22,
    color: colors.text,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  markAllRead: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  unreadBanner: {
    backgroundColor: colors.primary + '10',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  unreadBannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  list: {
    paddingHorizontal: spacing.xl,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  notificationUnread: {
    backgroundColor: colors.surface,
    marginHorizontal: -spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  notificationIcon: {
    fontSize: 18,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  notificationTitleUnread: {
    fontWeight: '700',
  },
  notificationTime: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 8,
  },
  separator: {
    height: 1,
    backgroundColor: colors.surfaceVariant,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: spacing.xxxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default NotificationsScreen;

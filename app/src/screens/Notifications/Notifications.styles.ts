import { StyleSheet } from 'react-native';

import { ThemeUtils } from '../../hooks/useThemedStyles';

export const createStyles = ({ colors, spacing, borderRadius }: ThemeUtils) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.white },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
    },
    backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
    markAllRead: { fontSize: 13, fontWeight: '600', color: colors.primary },
    unreadBanner: {
      backgroundColor: colors.primary + '10',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xl,
    },
    unreadBannerText: { fontSize: 13, fontWeight: '600', color: colors.primary },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
    list: { paddingHorizontal: spacing.xl },
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
    notificationContent: { flex: 1 },
    notificationTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    notificationTitle: { fontSize: 14, fontWeight: '500', color: colors.text },
    notificationTitleUnread: { fontWeight: '700' },
    notificationTime: { fontSize: 12, color: colors.textTertiary },
    notificationMessage: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
      marginTop: 8,
    },
    separator: { height: 1, backgroundColor: colors.surfaceVariant },
    emptyContainer: { alignItems: 'center', paddingTop: 80, paddingHorizontal: spacing.xxxl },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.sm,
      marginTop: spacing.lg,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
  });

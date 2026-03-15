import { StyleSheet } from 'react-native';

import { ThemeUtils } from '../../hooks/useThemedStyles';

const createStyles = ({ colors, spacing, borderRadius }: ThemeUtils) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.surfaceVariant,
    },
    backBtn: { padding: spacing.xs },
    headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
    headerRight: { width: 40 },

    /* Venue selector */
    venueSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: spacing.lg,
      marginVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
      backgroundColor: colors.surface,
    },
    venueSelectorText: { fontSize: 15, fontWeight: '600', color: colors.text, flex: 1 },

    /* Category tabs */
    categoryRow: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.md,
      gap: spacing.sm,
    },
    categoryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      backgroundColor: colors.surfaceVariant,
    },
    categoryChipActive: { backgroundColor: colors.primary },
    categoryChipText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
    categoryChipTextActive: { color: colors.white },

    /* Menu item card */
    menuCard: {
      flexDirection: 'row',
      marginHorizontal: spacing.lg,
      marginBottom: spacing.md,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
      gap: spacing.md,
    },
    menuImage: {
      width: 70,
      height: 70,
      borderRadius: borderRadius.sm,
    },
    menuImagePlaceholder: {
      width: 70,
      height: 70,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
    },
    menuInfo: { flex: 1, justifyContent: 'center' },
    menuName: { fontSize: 15, fontWeight: '700', color: colors.text },
    menuDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    menuPriceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.xs,
    },
    menuPrice: { fontSize: 16, fontWeight: '700', color: colors.primary },
    activeBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.full,
    },
    activeBadgeText: { fontSize: 10, fontWeight: '700' },

    /* Empty + FAB */
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: spacing.lg },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginTop: spacing.sm,
    },
    fab: {
      position: 'absolute',
      bottom: 24,
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 6,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },

    /* Coming soon overlay */
    comingSoon: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    comingSoonBadge: {
      paddingHorizontal: spacing.xxl,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.full,
      backgroundColor: colors.primary,
    },
    comingSoonText: { fontSize: 14, fontWeight: '700', color: colors.white },
  });

export { createStyles };

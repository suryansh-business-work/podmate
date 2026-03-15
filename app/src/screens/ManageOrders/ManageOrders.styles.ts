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

    /* Stats */
    statsRow: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      gap: spacing.sm,
    },
    statCard: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
    },
    statValue: { fontSize: 20, fontWeight: '700', color: colors.text },
    statLabel: { fontSize: 10, fontWeight: '600', color: colors.textTertiary, marginTop: 2 },

    /* Filters */
    filterRow: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.md,
      gap: spacing.sm,
    },
    filterChip: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      backgroundColor: colors.surfaceVariant,
    },
    filterChipActive: { backgroundColor: colors.primary },
    filterChipText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
    filterChipTextActive: { color: colors.white },

    /* Booking card */
    bookingCard: {
      marginHorizontal: spacing.lg,
      marginBottom: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
      overflow: 'hidden',
    },
    bookingImage: { width: '100%', height: 120 },
    bookingImagePlaceholder: {
      width: '100%',
      height: 120,
      backgroundColor: colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
    },
    bookingBody: { padding: spacing.md },
    bookingTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
    bookingVenue: { fontSize: 13, color: colors.primary, marginTop: 2 },
    bookingMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    bookingHostRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    bookingHostAvatar: { width: 24, height: 24, borderRadius: 12 },
    bookingHostName: { fontSize: 13, color: colors.textSecondary },
    bookingDate: { fontSize: 12, color: colors.textTertiary },
    bookingFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.surfaceVariant,
    },
    bookingSeats: { fontSize: 13, color: colors.textSecondary },
    bookingFee: { fontSize: 16, fontWeight: '700', color: colors.primary },
    statusBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.full,
      marginTop: spacing.xs,
    },
    statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' as const },

    /* Empty */
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: spacing.lg },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginTop: spacing.sm,
    },
  });

export { createStyles };

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
    },
    venueSelectorText: { fontSize: 15, fontWeight: '600', color: colors.text, flex: 1 },

    /* Moment card */
    momentCard: {
      marginHorizontal: spacing.lg,
      marginBottom: spacing.lg,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
      overflow: 'hidden',
    },
    momentImage: { width: '100%', height: 200 },
    momentImagePlaceholder: {
      width: '100%',
      height: 200,
      backgroundColor: colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
    },
    momentBody: { padding: spacing.md },
    momentUserRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    momentAvatar: { width: 32, height: 32, borderRadius: 16 },
    momentAvatarPlaceholder: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
    },
    momentUserName: { fontSize: 14, fontWeight: '600', color: colors.text },
    momentDate: { fontSize: 11, color: colors.textTertiary },
    momentCaption: { fontSize: 14, color: colors.text, lineHeight: 20 },
    momentActions: {
      flexDirection: 'row',
      gap: spacing.lg,
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.surfaceVariant,
    },
    momentActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    momentActionText: { fontSize: 13, color: colors.textSecondary },

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

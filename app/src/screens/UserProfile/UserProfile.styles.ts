import { StyleSheet } from 'react-native';

import { ThemeUtils } from '../../hooks/useThemedStyles';

export const createStyles = ({ colors, spacing, borderRadius }: ThemeUtils) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.white },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.surfaceVariant,
      backgroundColor: colors.white,
      gap: spacing.sm,
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text, flex: 1 },

    /* Profile header */
    profileHeader: {
      alignItems: 'center',
      paddingVertical: spacing.xxl,
      paddingHorizontal: spacing.lg,
    },
    avatar: { width: 80, height: 80, borderRadius: 40 },
    avatarPlaceholder: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    userName: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginTop: spacing.md,
    },

    /* Stats row */
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.xxxl,
      marginTop: spacing.lg,
    },
    statItem: { alignItems: 'center' },
    statCount: { fontSize: 18, fontWeight: '700', color: colors.text },
    statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

    /* Follow button */
    followBtn: {
      marginTop: spacing.lg,
      paddingHorizontal: spacing.xxxl,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      backgroundColor: colors.primary,
    },
    followBtnText: { color: colors.white, fontSize: 15, fontWeight: '600' },
    followingBtn: {
      marginTop: spacing.lg,
      paddingHorizontal: spacing.xxxl,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      backgroundColor: colors.surfaceVariant,
      borderWidth: 1,
      borderColor: colors.border,
    },
    followingBtnText: { color: colors.text, fontSize: 15, fontWeight: '600' },

    /* Section */
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.lg,
      paddingBottom: spacing.sm,
    },

    /* Pod card (horizontal) */
    podCard: {
      width: 220,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
      marginRight: spacing.md,
    },
    podImage: { width: 220, height: 130 },
    podImagePlaceholder: {
      width: 220,
      height: 130,
      backgroundColor: colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
    },
    podBody: { padding: spacing.sm },
    podTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
    podDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    podRating: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: spacing.xs,
    },
    podRatingText: { fontSize: 12, color: colors.textSecondary },

    podsList: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg },

    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      padding: spacing.xl,
    },
  });

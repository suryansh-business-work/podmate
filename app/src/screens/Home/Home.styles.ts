import { StyleSheet, Dimensions } from 'react-native';

import { ThemeUtils } from '../../hooks/useThemedStyles';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const createStyles = ({ colors, spacing, borderRadius }: ThemeUtils) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      flex: 1,
    },
    headerCity: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      maxWidth: 160,
    },
    headerArea: {
      fontSize: 11,
      color: colors.textSecondary,
      maxWidth: 160,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    headerIconBtn: {
      width: 36,
      height: 36,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 18,
    },
    profileBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    profileAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
    },
    searchBarRow: {
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.sm,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.sm,
    },
    searchInput: { flex: 1, fontSize: 15, color: colors.text },
    scrollView: { flex: 1, paddingHorizontal: spacing.xl },
    categoriesContainer: { marginBottom: spacing.lg },
    categoriesContent: { paddingRight: spacing.xl },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
    viewAll: { fontSize: 13, fontWeight: '700', color: colors.secondary, letterSpacing: 0.5 },
    loadingContainer: { paddingVertical: 60, alignItems: 'center' },
    emptyContainer: { alignItems: 'center', paddingTop: 60, paddingHorizontal: spacing.xxxl },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.sm,
      marginTop: spacing.lg,
    },
    emptySubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
    /* ── Happening Soon Horizontal Section ── */
    happeningSoonScroll: {
      marginBottom: spacing.xl,
      marginHorizontal: -20,
    },
    happeningSoonScrollContent: {
      paddingHorizontal: 20,
      gap: 12,
    },
    happeningSoonCard: {
      width: SCREEN_WIDTH * 0.42,
      borderRadius: borderRadius.lg,
      backgroundColor: colors.surface,
      overflow: 'hidden',
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 3,
    },
    happeningSoonImage: {
      width: '100%',
      height: 100,
    },
    happeningSoonBadge: {
      position: 'absolute',
      top: 6,
      left: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: borderRadius.sm,
    },
    happeningSoonBadgeText: {
      color: colors.white,
      fontSize: 10,
      fontWeight: '700',
    },
    happeningSoonContent: {
      padding: spacing.sm,
    },
    happeningSoonDate: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
      marginBottom: 2,
    },
    happeningSoonTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      lineHeight: 17,
    },
    happeningSoonMeta: {
      fontSize: 11,
      color: colors.textTertiary,
      marginTop: 4,
    },
  });

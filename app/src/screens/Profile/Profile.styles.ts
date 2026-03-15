import { StyleSheet, Dimensions } from 'react-native';

import { ThemeUtils } from '../../hooks/useThemedStyles';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_GAP = 2;
const GRID_COLUMNS = 3;
const GRID_ITEM_SIZE = (SCREEN_WIDTH - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

export const createStyles = ({ colors, spacing, borderRadius }: ThemeUtils) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    /* ── Instagram-style header ── */
    profileHeader: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xl,
      paddingBottom: spacing.md,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarSection: { marginRight: spacing.xl },
    avatarGradient: {
      width: 88,
      height: 88,
      borderRadius: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: colors.white },
    statsRow: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    statItem: { alignItems: 'center' },
    statValue: { fontSize: 18, fontWeight: '700', color: colors.text },
    statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    statDivider: { width: 1, height: 28, backgroundColor: colors.border },

    /* ── Name & Bio section ── */
    nameSection: { marginTop: spacing.md, paddingHorizontal: spacing.xl },
    userName: { fontSize: 16, fontWeight: '700', color: colors.text },
    usernameText: { fontSize: 14, color: colors.textSecondary, marginTop: 1 },
    userPhone: { fontSize: 13, color: colors.textTertiary, marginTop: 2 },
    verifiedBadge: {
      marginTop: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      backgroundColor: colors.success + '20',
      borderRadius: borderRadius.full,
      alignSelf: 'flex-start',
    },
    verifiedBadgeText: { fontSize: 12, fontWeight: '600', color: colors.success },

    /* ── Action buttons ── */
    actionRow: {
      flexDirection: 'row',
      paddingHorizontal: spacing.xl,
      marginTop: spacing.md,
      gap: spacing.sm,
    },
    editProfileBtn: {
      flex: 1,
      paddingVertical: spacing.sm + 2,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surfaceVariant,
      alignItems: 'center',
    },
    editProfileBtnText: { fontSize: 14, fontWeight: '600', color: colors.text },
    shareProfileBtn: {
      paddingVertical: spacing.sm + 2,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },

    /* ── Tab bar (Grid / Menu) ── */
    tabBar: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: colors.border,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginTop: spacing.md,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: spacing.md,
    },
    tabActive: {
      borderBottomWidth: 2,
      borderBottomColor: colors.text,
    },

    /* ── Photo/Moments grid ── */
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap' },
    gridItem: {
      width: GRID_ITEM_SIZE,
      height: GRID_ITEM_SIZE,
      marginRight: GRID_GAP,
      marginBottom: GRID_GAP,
    },
    gridItemImage: { width: '100%', height: '100%' },
    gridVideoOverlay: {
      position: 'absolute',
      top: 6,
      right: 6,
    },
    gridEmptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xxxl + spacing.xl,
    },
    gridEmptyText: {
      fontSize: 14,
      color: colors.textTertiary,
      marginTop: spacing.md,
    },
    uploadBtn: {
      marginTop: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.full,
      backgroundColor: colors.primary,
    },
    uploadBtnText: { fontSize: 14, fontWeight: '600', color: colors.white },

    /* ── Menu section ── */
    menuContainer: { paddingHorizontal: spacing.xl, marginTop: spacing.md },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.surfaceVariant,
      gap: spacing.md,
    },
    menuContent: { flex: 1 },
    menuLabel: { fontSize: 16, fontWeight: '600', color: colors.text },
    menuSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 1 },

    /* ── Logout & footer ── */
    logoutButton: {
      marginHorizontal: spacing.xl,
      marginTop: spacing.xxl,
      paddingVertical: spacing.lg,
      borderRadius: borderRadius.md,
      borderWidth: 1.5,
      borderColor: colors.error,
      alignItems: 'center',
    },
    logoutText: { fontSize: 16, fontWeight: '600', color: colors.error },
    version: {
      textAlign: 'center',
      fontSize: 12,
      color: colors.textTertiary,
      marginTop: spacing.lg,
      marginBottom: spacing.xxxl,
    },
  });

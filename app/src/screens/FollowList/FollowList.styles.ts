import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../../theme';

export const styles = StyleSheet.create({
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

  /* Tabs */
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.primary },

  content: { paddingBottom: spacing.xxxl },

  /* User row */
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  userAvatar: { width: 48, height: 48, borderRadius: 24 },
  userAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '600', color: colors.text },
  userDate: { fontSize: 12, color: colors.textTertiary, marginTop: 2 },

  followBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  followBtnText: { color: colors.white, fontSize: 13, fontWeight: '600' },
  followingBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceVariant,
  },
  followingBtnText: { color: colors.text, fontSize: 13, fontWeight: '600' },

  separator: { height: 1, backgroundColor: colors.surfaceVariant, marginLeft: 76 },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.text, marginTop: spacing.md },
  emptySubtext: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center' },
});

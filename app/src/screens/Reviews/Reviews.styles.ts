import { StyleSheet } from 'react-native';

import { ThemeUtils } from '../../hooks/useThemedStyles';

export const createStyles = ({ colors, spacing, borderRadius }: ThemeUtils) => StyleSheet.create({
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
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: 100 },

  /* Stats section */
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl },
  bigRating: { fontSize: 48, fontWeight: '700', color: colors.text },
  starsRow: { flexDirection: 'row', gap: 2 },
  totalText: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  distributionCol: { flex: 1, gap: 4 },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  distLabel: { fontSize: 12, color: colors.textSecondary, width: 12 },
  distBar: { flex: 1, height: 6, backgroundColor: colors.surfaceVariant, borderRadius: 3, overflow: 'hidden' },
  distFill: { height: 6, backgroundColor: colors.warning, borderRadius: 3 },

  /* Review card */
  reviewCard: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18 },
  reviewAvatarPlaceholder: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  reviewName: { fontSize: 14, fontWeight: '600', color: colors.text, flex: 1 },
  reviewDate: { fontSize: 11, color: colors.textTertiary },
  reviewComment: { fontSize: 14, color: colors.text, lineHeight: 20, marginTop: spacing.xs },
  actionsRow: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: 12, color: colors.textSecondary },

  /* Replies */
  repliesContainer: { marginLeft: spacing.xl, marginTop: spacing.sm },
  replyCard: { paddingVertical: spacing.xs },
  replyHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  replyName: { fontSize: 12, fontWeight: '600', color: colors.text },
  replyDate: { fontSize: 10, color: colors.textTertiary },
  replyText: { fontSize: 13, color: colors.text, marginTop: 2, lineHeight: 18 },

  /* Write review */
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  ratingSelector: { flexDirection: 'row', justifyContent: 'center', gap: spacing.md, marginBottom: spacing.lg },
  commentInput: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 100,
    fontSize: 14,
    color: colors.text,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  submitBtnText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  submitBtnDisabled: { opacity: 0.5 },

  /* Empty / centered */
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.text, marginTop: spacing.md },
  emptySubtext: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center' },
});

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
    content: { padding: spacing.md, paddingBottom: 100 },

    /* Type selector chips */
    chipRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    chip: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      backgroundColor: colors.surfaceVariant,
    },
    chipActive: {
      backgroundColor: colors.primary,
    },
    chipText: { fontSize: 13, fontWeight: '600', color: colors.text },
    chipTextActive: { color: colors.white },

    /* Status badge */
    badge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.full,
      alignSelf: 'flex-start',
    },
    badgePending: { backgroundColor: colors.warning + '20' },
    badgeReviewed: { backgroundColor: colors.accent + '20' },
    badgeResolved: { backgroundColor: colors.success + '20' },
    badgeText: { fontSize: 11, fontWeight: '600' },
    badgePendingText: { color: colors.warning },
    badgeReviewedText: { color: colors.accent },
    badgeResolvedText: { color: colors.success },

    /* Feedback card */
    feedbackCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    feedbackCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    typeLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.primary,
      textTransform: 'uppercase',
    },
    feedbackTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    feedbackDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
    feedbackDate: { fontSize: 11, color: colors.textTertiary, marginTop: spacing.sm },
    adminNotesLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.accent,
      marginTop: spacing.sm,
    },
    adminNotesText: { fontSize: 13, color: colors.text, marginTop: 2, fontStyle: 'italic' },

    /* FAB + Modal */
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
    input: {
      backgroundColor: colors.surfaceVariant,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      fontSize: 14,
      color: colors.text,
      marginBottom: spacing.md,
    },
    textArea: {
      minHeight: 100,
      textAlignVertical: 'top',
    },
    submitBtn: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      alignItems: 'center',
      marginTop: spacing.xs,
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
    emptySubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: spacing.xs,
      textAlign: 'center',
    },
  });

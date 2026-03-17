import { StyleSheet } from 'react-native';

import { ThemeUtils } from '../../hooks/useThemedStyles';

const createStyles = ({ colors, spacing, borderRadius }: ThemeUtils) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.surfaceVariant,
    },
    backBtn: { padding: spacing.xs },
    headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
    headerRight: { width: 40 },

    /* Earnings card */
    earningsCard: {
      marginHorizontal: spacing.lg,
      marginTop: spacing.lg,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
    },
    earningsGradient: {
      padding: spacing.xl,
    },
    earningsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    earningItem: { alignItems: 'center', flex: 1 },
    earningValue: { fontSize: 22, fontWeight: '800', color: '#FFF' },
    earningLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
    withdrawBtn: {
      alignSelf: 'center',
      paddingHorizontal: spacing.xxl,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.full,
      backgroundColor: 'rgba(255,255,255,0.25)',
      marginTop: spacing.sm,
    },
    withdrawBtnDisabled: { opacity: 0.5 },
    withdrawBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },

    /* Bank info */
    bankSection: {
      marginHorizontal: spacing.lg,
      marginTop: spacing.xl,
      padding: spacing.lg,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
    },
    bankTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
    bankRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
    },
    bankText: { fontSize: 14, color: colors.textSecondary, flex: 1 },
    addBankBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
    },
    addBankText: { fontSize: 14, fontWeight: '600', color: colors.primary },

    /* Bank form */
    bankForm: {
      marginTop: spacing.sm,
      gap: spacing.sm,
    },
    bankInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      fontSize: 14,
      color: colors.text,
      backgroundColor: colors.surface,
    },
    bankFormActions: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    bankFormCancelBtn: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    bankFormCancelText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
    bankFormSubmitBtn: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      backgroundColor: colors.primary,
      alignItems: 'center',
    },
    bankFormSubmitText: { fontSize: 14, fontWeight: '600', color: colors.white },

    /* Filters */
    filterRow: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      marginTop: spacing.xl,
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

    /* Transaction card */
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.sm,
    },
    txnCard: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: spacing.lg,
      marginBottom: spacing.sm,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
      gap: spacing.md,
    },
    txnIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    txnInfo: { flex: 1 },
    txnDesc: { fontSize: 14, fontWeight: '600', color: colors.text },
    txnDate: { fontSize: 12, color: colors.textTertiary, marginTop: 2 },
    txnRefId: { fontSize: 10, color: colors.textTertiary, marginTop: 1 },
    txnRight: { alignItems: 'flex-end' },
    txnAmount: { fontSize: 16, fontWeight: '700' },
    txnStatus: { fontSize: 10, fontWeight: '600', marginTop: 2 },

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
    comingSoonBadge: {
      marginTop: spacing.lg,
      paddingHorizontal: spacing.xxl,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.full,
      backgroundColor: colors.primary,
    },
    comingSoonText: { fontSize: 14, fontWeight: '700', color: colors.white },
  });

export { createStyles };

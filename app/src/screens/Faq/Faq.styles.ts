import { StyleSheet, Dimensions } from 'react-native';
import { ThemeUtils } from '../../hooks/useThemedStyles';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = 56;

const createStyles = ({ colors, spacing, borderRadius }: ThemeUtils) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.white },
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
    bodyRow: {
      flex: 1,
      flexDirection: 'row',
    },
    sidebar: {
      width: SIDEBAR_WIDTH,
      backgroundColor: colors.surface,
      borderRightWidth: 1,
      borderRightColor: colors.surfaceVariant,
      paddingTop: spacing.sm,
    },
    sidebarTab: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
      marginHorizontal: 4,
      marginBottom: 2,
      borderRadius: borderRadius.sm,
    },
    sidebarTabActive: {
      backgroundColor: colors.primary + '15',
    },
    sidebarTabLabel: {
      fontSize: 8,
      fontWeight: '600',
      color: colors.textTertiary,
      marginTop: 2,
      textAlign: 'center',
    },
    sidebarTabLabelActive: {
      color: colors.primary,
      fontWeight: '700',
    },
    contentArea: {
      flex: 1,
    },
    scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: 100, paddingTop: spacing.md },
    loadingWrap: { paddingVertical: spacing.xxxl, alignItems: 'center' },
    emptyWrap: { paddingVertical: spacing.xxxl, alignItems: 'center', gap: spacing.sm },
    emptyText: { fontSize: 14, color: colors.textSecondary },
    faqItem: {
      paddingVertical: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.surfaceVariant,
    },
    faqHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    faqQuestion: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
      marginRight: spacing.sm,
    },
    faqAnswer: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 22 },
    policyCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
    },
    policyTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
    policyContent: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
    /* Callback form */
    callbackCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.xl,
      marginBottom: spacing.xl,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
    },
    callbackTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    callbackSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: spacing.xl,
      lineHeight: 20,
    },
    inputLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
      letterSpacing: 0.5,
      marginBottom: spacing.xs,
      marginTop: spacing.md,
    },
    textInput: {
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      fontSize: 15,
      color: colors.text,
    },
    textArea: { minHeight: 100 },
    errorText: { fontSize: 12, color: colors.error, marginTop: spacing.xs },
    callbackBtn: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.lg,
      alignItems: 'center',
      marginTop: spacing.xl,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    callbackBtnDisabled: { opacity: 0.5 },
    callbackBtnText: { fontSize: 16, fontWeight: '600', color: colors.white },
    /* Support section (embedded) */
    supportHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    supportTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
    newTicketBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
    },
    newTicketBtnText: { color: colors.white, fontSize: 13, fontWeight: '600' },
    /* Callback list (existing requests) */
    callbackRequestCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
    },
    callbackStatusBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.full,
    },
    callbackStatusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  });

export { createStyles };

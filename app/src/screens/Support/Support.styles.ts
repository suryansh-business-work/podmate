import { StyleSheet } from 'react-native';

import { ThemeUtils } from '../../hooks/useThemedStyles';

const createStyles = ({ colors, spacing, borderRadius }: ThemeUtils) => StyleSheet.create({
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
  addBtn: { padding: spacing.xs },
  scrollContent: { padding: spacing.xl, paddingBottom: 100 },
  centeredWrap: { paddingVertical: spacing.xxxl, alignItems: 'center', gap: spacing.sm },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  emptySubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },

  /* Form */
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
  },
  formTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.lg },
  label: { fontSize: 12, fontWeight: '600', color: colors.text, letterSpacing: 0.5, marginBottom: spacing.xs, marginTop: spacing.md },
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
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { fontSize: 16, fontWeight: '600', color: colors.white },

  /* Ticket card */
  ticketCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
  },
  ticketHeader: { marginBottom: spacing.sm },
  ticketTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ticketSubject: { fontSize: 15, fontWeight: '600', color: colors.text, flex: 1, marginRight: spacing.sm },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  ticketDate: { fontSize: 12, color: colors.textTertiary, marginTop: 2 },
  ticketMessage: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  replyBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primary + '08',
    borderRadius: borderRadius.sm,
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  replyText: { fontSize: 14, color: colors.text, flex: 1, lineHeight: 20 },
});

export { createStyles };

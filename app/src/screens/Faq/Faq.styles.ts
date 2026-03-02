import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../../theme';

const styles = StyleSheet.create({
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
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceVariant,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.white },
  scrollContent: { paddingHorizontal: spacing.xl, paddingBottom: 100 },
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
  faqQuestion: { fontSize: 15, fontWeight: '600', color: colors.text, flex: 1, marginRight: spacing.sm },
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
});

export default styles;

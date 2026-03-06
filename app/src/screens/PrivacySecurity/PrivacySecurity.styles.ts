import { StyleSheet } from 'react-native';

import { ThemeUtils } from '../../hooks/useThemedStyles';

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
    headerRight: { width: 40 },
    scrollContent: { paddingBottom: 100 },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xxl,
      paddingBottom: spacing.md,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.lg,
      gap: spacing.md,
    },
    settingIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
    },
    settingContent: { flex: 1 },
    settingLabel: { fontSize: 15, fontWeight: '600', color: colors.text },
    settingSubtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    divider: {
      height: 1,
      backgroundColor: colors.surfaceVariant,
      marginHorizontal: spacing.xl,
    },
    dangerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.lg,
      gap: spacing.md,
    },
    dangerIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.error + '15',
      justifyContent: 'center',
      alignItems: 'center',
    },
    dangerLabel: { fontSize: 15, fontWeight: '600', color: colors.error },
    dangerSubtitle: { fontSize: 12, color: colors.error + 'AA', marginTop: 2 },
  });

export { createStyles };

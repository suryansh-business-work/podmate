import { StyleSheet } from 'react-native';

import { ThemeUtils } from '../../hooks/useThemedStyles';

const createStyles = ({ colors, spacing, borderRadius }: ThemeUtils) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    content: { flex: 1, paddingHorizontal: spacing.xl },
    topSection: { paddingTop: 60 },
    logoBox: {
      width: 64,
      height: 64,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.xxl,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.sm,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      lineHeight: 24,
      marginBottom: spacing.xxxl,
    },
    inputLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
      letterSpacing: 1,
      marginBottom: spacing.sm,
      marginTop: spacing.lg,
    },
    textInput: {
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      padding: spacing.lg,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.surface,
    },
    textInputError: { borderColor: colors.error },
    errorText: {
      fontSize: 12,
      color: colors.error,
      marginTop: spacing.xs,
      marginLeft: spacing.xs,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.xxl,
      marginBottom: spacing.xxl,
    },
    infoText: {
      flex: 1,
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
  });

export { createStyles };

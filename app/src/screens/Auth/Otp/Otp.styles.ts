import { StyleSheet } from 'react-native';
import { ThemeUtils } from '../../../hooks/useThemedStyles';

export const createStyles = ({ colors, spacing, borderRadius }: ThemeUtils) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.white,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.xxl,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      lineHeight: 24,
      marginBottom: spacing.xxxl,
    },
    phoneHighlight: {
      color: colors.text,
      fontWeight: '600',
    },
    otpContainer: {
      marginBottom: spacing.xxxl,
    },
    resendContainer: {
      alignItems: 'center',
      marginBottom: spacing.xxxl,
    },
    resendTimer: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    timerHighlight: {
      color: colors.primary,
      fontWeight: '600',
    },
    resendActive: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '600',
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: '#FEF2F2',
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      marginBottom: spacing.lg,
    },
    errorText: {
      fontSize: 13,
      color: colors.error,
      flex: 1,
    },
  });

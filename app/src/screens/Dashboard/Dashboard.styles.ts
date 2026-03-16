import { StyleSheet } from 'react-native';
import { ThemeUtils } from '../../hooks/useThemedStyles';

export const createStyles = ({ colors, spacing, borderRadius }: ThemeUtils) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    headerIconBtn: {
      width: 38,
      height: 38,
      borderRadius: borderRadius.full,
      backgroundColor: colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xxxxl,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginTop: spacing.xl,
      marginBottom: spacing.md,
    },
    registerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    registerBtnText: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.white,
    },
    errorContainer: {
      padding: spacing.lg,
      alignItems: 'center',
    },
    errorText: {
      fontSize: 14,
      color: colors.error,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
  });

export const createCardStyles = ({ colors, spacing, borderRadius }: ThemeUtils) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.lg,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    content: {
      flex: 1,
    },
    title: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textSecondary,
      marginBottom: 2,
    },
    value: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    hintBtn: {
      width: 28,
      height: 28,
      borderRadius: borderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    skeleton: {
      height: 72,
      backgroundColor: colors.surfaceVariant,
      borderRadius: borderRadius.md,
      marginBottom: spacing.sm,
    },
    tooltip: {
      position: 'absolute',
      right: 0,
      top: -48,
      backgroundColor: colors.text,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      minWidth: 200,
      maxWidth: 260,
      zIndex: 10,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 6,
    },
    tooltipText: {
      fontSize: 13,
      lineHeight: 18,
      color: colors.background,
    },
  });

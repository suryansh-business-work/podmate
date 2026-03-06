import { StyleSheet } from 'react-native';

import { ThemeUtils } from '../../hooks/useThemedStyles';

export const createStyles = ({ colors, spacing, borderRadius }: ThemeUtils) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.surfaceVariant,
    },
    headerTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginRight: 40,
    },
    scrollContent: {
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xxxl,
    },
    avatarSection: {
      alignItems: 'center',
      paddingVertical: spacing.xxl,
    },
    avatarContainer: {
      position: 'relative',
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 3,
      borderColor: colors.primaryLight,
    },
    avatarPlaceholder: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: colors.primaryLight,
    },
    cameraButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.white,
    },
    uploadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
    },
    fieldContainer: {
      marginBottom: spacing.xl,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    inputError: {
      borderColor: colors.error,
    },
    disabledInput: {
      backgroundColor: colors.surfaceVariant,
      color: colors.textTertiary,
    },
    errorText: {
      fontSize: 12,
      color: colors.error,
      marginTop: spacing.xs,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.xl,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      width: 80,
    },
    infoValue: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
    saveButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.lg,
      alignItems: 'center',
      marginTop: spacing.lg,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.white,
    },
  });

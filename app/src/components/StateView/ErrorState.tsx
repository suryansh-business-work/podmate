import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppColors } from '../../hooks/useThemedStyles';
import { spacing, borderRadius } from '../../theme';
import type { ErrorStateProps } from './StateView.types';

/**
 * Shown when a query or operation fails.
 */
export const ErrorState: React.FC<ErrorStateProps> = memo(function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
  testID,
}) {
  const colors = useAppColors();

  return (
    <View
      style={styles.wrapper}
      accessibilityRole="alert"
      accessibilityLabel={message}
      testID={testID}
    >
      <View style={[styles.iconCircle, { backgroundColor: colors.errorBg }]}>
        <MaterialIcons name="error-outline" size={40} color={colors.error} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>Oops!</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      {onRetry ? (
        <TouchableOpacity
          onPress={onRetry}
          style={[styles.retryBtn, { backgroundColor: colors.primary }]}
          accessibilityRole="button"
          accessibilityLabel="Retry"
        >
          <MaterialIcons name="refresh" size={18} color={colors.white} />
          <Text style={[styles.retryText, { color: colors.white }]}>Retry</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxxxl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: spacing.lg,
  },
  message: {
    fontSize: 14,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.full,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

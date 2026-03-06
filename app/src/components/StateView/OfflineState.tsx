import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppColors } from '../../hooks/useThemedStyles';
import { spacing, borderRadius } from '../../theme';
import type { OfflineStateProps } from './StateView.types';

/**
 * Shown when the device is offline and data is unavailable.
 */
export const OfflineState: React.FC<OfflineStateProps> = memo(function OfflineState({
  onRetry,
  testID,
}) {
  const colors = useAppColors();

  return (
    <View
      style={styles.wrapper}
      accessibilityRole="alert"
      accessibilityLabel="You are offline. Check your internet connection and try again."
      testID={testID}
    >
      <MaterialIcons name="wifi-off" size={56} color={colors.textTertiary} />
      <Text style={[styles.title, { color: colors.text }]}>You're Offline</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Check your internet connection and try again.
      </Text>
      {onRetry ? (
        <TouchableOpacity
          onPress={onRetry}
          style={[styles.retryBtn, { backgroundColor: colors.primary }]}
          accessibilityRole="button"
          accessibilityLabel="Retry connection"
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: spacing.lg,
  },
  subtitle: {
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

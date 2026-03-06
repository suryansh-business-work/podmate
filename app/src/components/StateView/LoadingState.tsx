import React, { memo } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAppColors } from '../../hooks/useThemedStyles';
import { spacing } from '../../theme';
import type { LoadingStateProps } from './StateView.types';

/**
 * Centered spinner with an optional message, for full-screen or section loading.
 */
export const LoadingState: React.FC<LoadingStateProps> = memo(function LoadingState({
  message,
  testID,
}) {
  const colors = useAppColors();

  return (
    <View
      style={styles.wrapper}
      accessibilityRole="progressbar"
      accessibilityLabel={message ?? 'Loading'}
      testID={testID}
    >
      <ActivityIndicator size="large" color={colors.primary} />
      {message ? (
        <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxxl,
  },
  message: {
    fontSize: 14,
    marginTop: spacing.lg,
  },
});

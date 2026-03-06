import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppColors } from '../../hooks/useThemedStyles';
import { spacing, borderRadius } from '../../theme';
import type { EmptyStateProps } from './StateView.types';

/**
 * Shown when a list or section has no data.
 */
export const EmptyState: React.FC<EmptyStateProps> = memo(function EmptyState({
  icon = 'inbox',
  title,
  subtitle,
  actionLabel,
  onAction,
  testID,
}) {
  const colors = useAppColors();

  return (
    <View
      style={styles.wrapper}
      accessibilityRole="text"
      accessibilityLabel={`${title}. ${subtitle ?? ''}`}
      testID={testID}
    >
      <MaterialIcons name={icon} size={56} color={colors.textTertiary} />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <TouchableOpacity
          onPress={onAction}
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={[styles.actionText, { color: colors.white }]}>{actionLabel}</Text>
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionBtn: {
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.full,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

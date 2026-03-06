import React, { memo } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppColors } from '../../../hooks/useThemedStyles';
import type { IconButtonProps } from './IconButton.types';

const MIN_TOUCH_TARGET = 44;

/**
 * A reusable icon-only pressable with a 44×44 pt minimum touch target,
 * hitSlop for comfortable tapping, and built-in accessibility props.
 */
export const IconButton: React.FC<IconButtonProps> = memo(function IconButton({
  icon,
  onPress,
  size = 24,
  color,
  style,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  testID,
}) {
  const colors = useAppColors();
  const resolvedColor = color ?? colors.textSecondary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={[styles.container, disabled && styles.disabled, style]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      testID={testID}
    >
      <MaterialIcons name={icon} size={size} color={resolvedColor} />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
});

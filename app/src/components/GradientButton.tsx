import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemedStyles, useAppColors, ThemeUtils } from '../hooks/useThemedStyles';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: object;
  children?: React.ReactNode;
  testID?: string;
}

export const GradientButton: React.FC<GradientButtonProps> = memo(function GradientButton({
  title,
  onPress,
  disabled = false,
  style,
  children,
  testID,
}) {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
    >
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, disabled && styles.disabled]}
      >
        {children || <Text style={styles.text}>{title}</Text>}
      </LinearGradient>
    </TouchableOpacity>
  );
});

const createStyles = ({ colors }: ThemeUtils) =>
  StyleSheet.create({
    container: {
      borderRadius: 28,
      overflow: 'hidden',
    },
    gradient: {
      paddingVertical: 16,
      paddingHorizontal: 32,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 28,
    },
    disabled: {
      opacity: 0.5,
    },
    text: {
      color: colors.white,
      fontSize: 18,
      fontWeight: '600',
      letterSpacing: 0.5,
    },
  });

import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useThemedStyles, ThemeUtils } from '../hooks/useThemedStyles';

interface CategoryChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export const CategoryChip: React.FC<CategoryChipProps> = memo(function CategoryChip({ label, selected, onPress }) {
  const styles = useThemedStyles(createStyles);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.chip, selected && styles.chipSelected]}
      accessibilityRole="button"
      accessibilityLabel={`${label} category${selected ? ', selected' : ''}`}
      accessibilityState={{ selected }}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
});

const createStyles = ({ colors, spacing, borderRadius }: ThemeUtils) =>
  StyleSheet.create({
    chip: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      borderWidth: 1.5,
      borderColor: colors.border,
      marginRight: spacing.sm,
      backgroundColor: colors.surface,
    },
    chipSelected: {
      backgroundColor: colors.text,
      borderColor: colors.text,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
    labelSelected: {
      color: colors.white,
    },
  });

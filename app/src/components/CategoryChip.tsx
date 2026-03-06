import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { borderRadius, spacing } from '../theme';
import { useThemedStyles, useAppColors, ThemeUtils } from '../hooks/useThemedStyles';

interface CategoryChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({ label, selected, onPress }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
};

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

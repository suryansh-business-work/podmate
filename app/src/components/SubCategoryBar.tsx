import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, ScrollView, View } from 'react-native';
import { useThemedStyles, ThemeUtils } from '../hooks/useThemedStyles';

interface SubCategoryBarProps {
  items: { id: string; name: string }[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export const SubCategoryBar: React.FC<SubCategoryBarProps> = memo(function SubCategoryBar({
  items,
  selectedId,
  onSelect,
}) {
  const styles = useThemedStyles(createStyles);

  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <TouchableOpacity
          style={[styles.pill, !selectedId && styles.pillActive]}
          onPress={() => onSelect(null)}
          activeOpacity={0.7}
        >
          <Text style={[styles.pillText, !selectedId && styles.pillTextActive]}>All</Text>
        </TouchableOpacity>
        {items.map((sub) => (
          <TouchableOpacity
            key={sub.id}
            style={[styles.pill, selectedId === sub.id && styles.pillActive]}
            onPress={() => onSelect(selectedId === sub.id ? null : sub.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.pillText, selectedId === sub.id && styles.pillTextActive]}>
              {sub.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

const createStyles = ({ colors, spacing, borderRadius }: ThemeUtils) =>
  StyleSheet.create({
    container: {
      marginBottom: spacing.md,
    },
    content: {
      paddingRight: spacing.xl,
    },
    pill: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: spacing.xs,
    },
    pillActive: {
      backgroundColor: colors.secondary,
      borderColor: colors.secondary,
    },
    pillText: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    pillTextActive: {
      color: colors.white,
    },
  });

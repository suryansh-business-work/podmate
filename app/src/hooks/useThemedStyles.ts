import { useMemo } from 'react';
import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { useThemeMode } from '../contexts/ThemeContext';

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

/**
 * Create a theme-aware stylesheet. The factory receives the current appColors.
 * Memoized to avoid re-creating styles on every render unless the theme changes.
 */
export function useThemedStyles<T extends NamedStyles<T>>(
  factory: (appColors: ReturnType<typeof useThemeMode>['appColors']) => T,
): T {
  const { appColors, isDark } = useThemeMode();
  return useMemo(() => StyleSheet.create(factory(appColors)) as unknown as T, [isDark]);
}

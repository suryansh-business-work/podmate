import { useMemo } from 'react';
import { useThemeMode } from '../contexts/ThemeContext';
import { spacing, borderRadius } from '../theme';

type AppColors = ReturnType<typeof useThemeMode>['appColors'];

export interface ThemeUtils {
  colors: AppColors;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
}

/**
 * Create a theme-aware stylesheet. The factory receives the current appColors
 * plus spacing & borderRadius for convenience.
 * Each factory should call StyleSheet.create internally.
 * Memoized so styles only rebuild when the theme mode changes.
 */
export function useThemedStyles<T>(factory: (utils: ThemeUtils) => T): T {
  const { appColors, mode } = useThemeMode();
  return useMemo(
    () => factory({ colors: appColors, spacing, borderRadius }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode],
  );
}

/**
 * Hook to get current theme colors for inline styles.
 */
export function useAppColors(): AppColors {
  const { appColors } = useThemeMode();
  return appColors;
}

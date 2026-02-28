import { MD3LightTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
  displayLarge: {
    fontFamily: 'System',
    fontSize: 32,
    fontWeight: '700' as const,
    letterSpacing: 0,
  },
  displayMedium: {
    fontFamily: 'System',
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: 0,
  },
  displaySmall: {
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: 0,
  },
  headlineLarge: {
    fontFamily: 'System',
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: 0,
  },
  headlineMedium: {
    fontFamily: 'System',
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: 0,
  },
  headlineSmall: {
    fontFamily: 'System',
    fontSize: 18,
    fontWeight: '600' as const,
    letterSpacing: 0,
  },
  titleLarge: { fontFamily: 'System', fontSize: 18, fontWeight: '600' as const, letterSpacing: 0 },
  titleMedium: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.15,
  },
  titleSmall: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
  },
  bodyLarge: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.15,
  },
  bodyMedium: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0.25,
  },
  bodySmall: { fontFamily: 'System', fontSize: 12, fontWeight: '400' as const, letterSpacing: 0.4 },
  labelLarge: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontFamily: 'System',
    fontSize: 10,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
  },
};

export const colors = {
  primary: '#5B4CDB',
  primaryLight: '#7B6EE8',
  primaryDark: '#4338B8',
  secondary: '#F97316',
  secondaryLight: '#FB923C',
  accent: '#6366F1',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  surfaceVariant: '#F1F3F5',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  white: '#FFFFFF',
  black: '#000000',
  gradientStart: '#5B4CDB',
  gradientEnd: '#A78BFA',
  cardShadow: 'rgba(0, 0, 0, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,
    error: colors.error,
    onPrimary: colors.white,
    onSecondary: colors.white,
    onBackground: colors.text,
    onSurface: colors.text,
    outline: colors.border,
  },
  fonts: configureFonts({ config: fontConfig }),
};

export type AppTheme = typeof theme;

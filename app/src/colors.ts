/**
 * Centralized color configuration for the PartyWings app.
 * Both light and dark palettes are defined here so every screen
 * can share a single source of truth via the `useAppColors()` hook.
 */

export interface AppColorPalette {
  [key: string]: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  accent: string;
  accentPink: string;
  background: string;
  surface: string;
  surfaceVariant: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  white: string;
  black: string;
  darkBg: string;
  lightBg: string;
  gradientStart: string;
  gradientEnd: string;
  cardShadow: string;
  overlay: string;
}

export const lightColors: AppColorPalette = {
  primary: '#F50247',
  primaryLight: '#FF3370',
  primaryDark: '#C7003A',
  secondary: '#9333EA',
  secondaryLight: '#A855F7',
  accent: '#2563EB',
  accentPink: '#EC4899',
  background: '#FFF1F5',
  surface: '#FFF5F8',
  surfaceVariant: '#FFE4ED',
  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  border: '#FECDD3',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  white: '#FFFFFF',
  black: '#000000',
  darkBg: '#111827',
  lightBg: '#FFF1F5',
  gradientStart: '#F50247',
  gradientEnd: '#9333EA',
  cardShadow: 'rgba(0, 0, 0, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const darkColors: AppColorPalette = {
  primary: '#F50247',
  primaryLight: '#FF3370',
  primaryDark: '#C7003A',
  secondary: '#9333EA',
  secondaryLight: '#A855F7',
  accent: '#2563EB',
  accentPink: '#EC4899',
  background: '#0F0F14',
  surface: '#1A1A24',
  surfaceVariant: '#252533',
  text: '#F3F4F6',
  textSecondary: '#9CA3AF',
  textTertiary: '#6B7280',
  border: '#374151',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  white: '#FFFFFF',
  black: '#000000',
  darkBg: '#0F0F14',
  lightBg: '#0F0F14',
  gradientStart: '#F50247',
  gradientEnd: '#9333EA',
  cardShadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

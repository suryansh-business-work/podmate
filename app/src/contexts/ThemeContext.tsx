import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ME } from '../graphql/queries';
import { UPDATE_THEME_PREFERENCE } from '../graphql/mutations';
import { lightColors, darkColors } from '../colors';
import { fontConfig } from '../fonts';

const THEME_STORAGE_KEY = '@partywings_theme_mode';

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: lightColors.primary,
    secondary: lightColors.secondary,
    background: lightColors.background,
    surface: lightColors.surface,
    surfaceVariant: lightColors.surfaceVariant,
    error: lightColors.error,
    onPrimary: lightColors.white,
    onSecondary: lightColors.white,
    onBackground: lightColors.text,
    onSurface: lightColors.text,
    outline: lightColors.border,
  },
  fonts: configureFonts({ config: fontConfig }),
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: darkColors.primary,
    secondary: darkColors.secondary,
    background: darkColors.background,
    surface: darkColors.surface,
    surfaceVariant: darkColors.surfaceVariant,
    error: darkColors.error,
    onPrimary: darkColors.white,
    onSecondary: darkColors.white,
    onBackground: darkColors.text,
    onSurface: darkColors.text,
    outline: darkColors.border,
  },
  fonts: configureFonts({ config: fontConfig }),
};

type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  paperTheme: typeof lightTheme;
  appColors: typeof lightColors;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  isDark: false,
  paperTheme: lightTheme,
  appColors: lightColors,
  toggleTheme: () => {},
  setMode: () => {},
});

export const useThemeMode = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  return ctx;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [loaded, setLoaded] = useState(false);

  const { data: meData } = useQuery(GET_ME, { fetchPolicy: 'cache-first' });
  const [updateThemeMutation] = useMutation(UPDATE_THEME_PREFERENCE);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'dark' || stored === 'light') {
          setModeState(stored);
        }
      } catch {
        // Use default light mode
      } finally {
        setLoaded(true);
      }
    };
    load();
  }, []);

  // Sync from server when user data arrives
  useEffect(() => {
    const serverPref = meData?.me?.themePreference as string | undefined;
    if (serverPref === 'dark' || serverPref === 'light') {
      setModeState(serverPref);
      AsyncStorage.setItem(THEME_STORAGE_KEY, serverPref).catch(() => {});
    }
  }, [meData?.me?.themePreference]);

  const setMode = useCallback(
    async (newMode: ThemeMode) => {
      setModeState(newMode);
      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
      } catch {
        // Silent fail
      }
      // Persist to server
      updateThemeMutation({ variables: { themePreference: newMode } }).catch(() => {});
    },
    [updateThemeMutation],
  );

  const toggleTheme = useCallback(() => {
    setMode(mode === 'light' ? 'dark' : 'light');
  }, [mode, setMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      isDark: mode === 'dark',
      paperTheme: mode === 'dark' ? darkTheme : lightTheme,
      appColors: mode === 'dark' ? darkColors : lightColors,
      toggleTheme,
      setMode,
    }),
    [mode, toggleTheme, setMode],
  );

  if (!loaded) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

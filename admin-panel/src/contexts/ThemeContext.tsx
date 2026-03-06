import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider, Theme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ADMIN_ME } from '../graphql/queries';
import { UPDATE_THEME_PREFERENCE } from '../graphql/mutations';

type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'admin-theme-mode';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#F50247', light: '#FF3370', dark: '#C7003A' },
    secondary: { main: '#9333EA', light: '#A855F7' },
    background: { default: '#FFF1F5', paper: '#FFFFFF' },
    text: { primary: '#111827', secondary: '#6B7280' },
    error: { main: '#EF4444' },
    success: { main: '#10B981' },
    warning: { main: '#F59E0B' },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 10, padding: '10px 24px' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
      },
    },
    MuiTextField: { defaultProps: { variant: 'outlined', fullWidth: true } },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#FF3370', light: '#FF5C8D', dark: '#F50247' },
    secondary: { main: '#A855F7', light: '#C084FC' },
    background: { default: '#0F0F14', paper: '#1A1A24' },
    text: { primary: '#F3F4F6', secondary: '#9CA3AF' },
    error: { main: '#EF4444' },
    success: { main: '#10B981' },
    warning: { main: '#F59E0B' },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 10, padding: '10px 24px' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.2)' },
      },
    },
    MuiTextField: { defaultProps: { variant: 'outlined', fullWidth: true } },
  },
});

interface AdminThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  muiTheme: Theme;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

const AdminThemeContext = createContext<AdminThemeContextValue>({
  mode: 'light',
  isDark: false,
  muiTheme: lightTheme,
  toggleTheme: () => {},
  setMode: () => {},
});

export const useAdminTheme = (): AdminThemeContextValue => useContext(AdminThemeContext);

interface AdminThemeProviderProps {
  children: React.ReactNode;
}

export const AdminThemeProvider: React.FC<AdminThemeProviderProps> = ({ children }) => {
  const stored = localStorage.getItem(STORAGE_KEY);
  const initial: ThemeMode = stored === 'dark' ? 'dark' : 'light';
  const [mode, setModeState] = useState<ThemeMode>(initial);

  const { data: meData } = useQuery(GET_ADMIN_ME, { fetchPolicy: 'cache-first' });
  const [updateThemeMutation] = useMutation(UPDATE_THEME_PREFERENCE);

  // Sync from server when user data arrives
  useEffect(() => {
    const serverPref = meData?.me?.themePreference as string | undefined;
    if (serverPref === 'dark' || serverPref === 'light') {
      setModeState(serverPref);
      localStorage.setItem(STORAGE_KEY, serverPref);
    }
  }, [meData?.me?.themePreference]);

  const setMode = useCallback(
    (newMode: ThemeMode) => {
      setModeState(newMode);
      localStorage.setItem(STORAGE_KEY, newMode);
      updateThemeMutation({ variables: { themePreference: newMode } }).catch(() => {});
    },
    [updateThemeMutation],
  );

  const toggleTheme = useCallback(() => {
    setMode(mode === 'light' ? 'dark' : 'light');
  }, [mode, setMode]);

  const value = useMemo<AdminThemeContextValue>(
    () => ({
      mode,
      isDark: mode === 'dark',
      muiTheme: mode === 'dark' ? darkTheme : lightTheme,
      toggleTheme,
      setMode,
    }),
    [mode, toggleTheme, setMode],
  );

  return (
    <AdminThemeContext.Provider value={value}>
      <MuiThemeProvider theme={value.muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </AdminThemeContext.Provider>
  );
};

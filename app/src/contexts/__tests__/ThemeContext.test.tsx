import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@apollo/client';

// We need to unmock useThemedStyles for ThemeContext test since ThemeContext uses it internally
// but ThemeContext itself is what we're testing. We'll test the Provider + useThemeMode contract.

// Re-mock ThemeContext to NOT be auto-mocked so we test the real implementation
jest.unmock('../../contexts/ThemeContext');
// But we still need the theme hooks mock for child components
// ThemeContext imports useQuery/useMutation which are already mocked

import { ThemeProvider, useThemeMode } from '../../contexts/ThemeContext';

const TestConsumer: React.FC = () => {
  const { mode, isDark, toggleTheme, setMode, appColors } = useThemeMode();
  return (
    <>
      <Text testID="mode">{mode}</Text>
      <Text testID="isDark">{isDark ? 'true' : 'false'}</Text>
      <Text testID="primary">{appColors.primary}</Text>
      <Text testID="toggle" onPress={toggleTheme}>
        Toggle
      </Text>
      <Text testID="setDark" onPress={() => setMode('dark')}>
        Set Dark
      </Text>
      <Text testID="setLight" onPress={() => setMode('light')}>
        Set Light
      </Text>
    </>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });
    const mockMutate = jest.fn().mockResolvedValue({});
    (useMutation as jest.Mock).mockReturnValue([mockMutate, { loading: false }]);
  });

  it('provides default light mode', async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(getByTestId('mode').props.children).toBe('light');
    });
    expect(getByTestId('isDark').props.children).toBe('false');
  });

  it('provides appColors object', async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(getByTestId('primary').props.children).toBeTruthy();
    });
  });

  it('toggles between light and dark mode', async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(getByTestId('mode').props.children).toBe('light');
    });

    fireEvent.press(getByTestId('toggle'));

    await waitFor(() => {
      expect(getByTestId('mode').props.children).toBe('dark');
    });
    expect(getByTestId('isDark').props.children).toBe('true');
  });

  it('sets mode directly via setMode', async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(getByTestId('mode').props.children).toBe('light');
    });

    fireEvent.press(getByTestId('setDark'));

    await waitFor(() => {
      expect(getByTestId('mode').props.children).toBe('dark');
    });
  });

  it('persists theme to AsyncStorage on change', async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(getByTestId('mode').props.children).toBe('light');
    });

    fireEvent.press(getByTestId('setDark'));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@partywings_theme_mode', 'dark');
    });
  });

  it('loads stored theme from AsyncStorage on mount', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('dark');

    const { getByTestId } = render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(getByTestId('mode').props.children).toBe('dark');
    });
  });

  it('syncs theme from server when user data arrives', async () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: { me: { themePreference: 'dark' } },
      loading: false,
      error: null,
    });

    const { getByTestId } = render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(getByTestId('mode').props.children).toBe('dark');
    });
  });

  it('returns null while loading from storage', () => {
    // Make getItem never resolve to keep loaded=false
    (AsyncStorage.getItem as jest.Mock).mockReturnValue(new Promise(() => {}));

    const { queryByTestId } = render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    // Provider should return null while not loaded
    expect(queryByTestId('mode')).toBeNull();
  });
});

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Shared test mocks for screen-level tests.
 * Re-exported by individual screen setup files.
 */
import React from 'react';
import { render } from '@testing-library/react-native';

// Mock expo-video so it doesn't try to load native modules
jest.mock('expo-video', () => {
  const mockReact = require('react');
  const { View } = require('react-native');
  return {
    useVideoPlayer: jest.fn(() => ({
      play: jest.fn(),
      pause: jest.fn(),
      muted: false,
      loop: false,
      addListener: jest.fn(() => ({ remove: jest.fn() })),
    })),
    VideoView: ({ children, ...props }: any) =>
      mockReact.createElement(View, { ...props, testID: 'mock-video' }, children),
  };
});

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: true, assets: [] }),
  MediaType: { Images: 'images', Videos: 'videos' },
}));

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: 28.6, longitude: 77.2 },
  }),
  reverseGeocodeAsync: jest.fn().mockResolvedValue([
    { city: 'Delhi', region: 'Delhi', postalCode: '110001' },
  ]),
}));

// Mock expo-contacts
jest.mock('expo-contacts', () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getContactsAsync: jest.fn().mockResolvedValue({ data: [] }),
}));

// Mock useLocation hook
jest.mock('../../hooks/useLocation', () => ({
  useLocation: () => ({
    location: null,
    loading: false,
    error: null,
    isInServiceArea: false,
    requestLocation: jest.fn(),
    requestCachedLocation: jest.fn(),
    searchByPincode: jest.fn(),
  }),
}));

// Mock useImageKitUpload hook
jest.mock('../../hooks/useImageKitUpload', () => ({
  useImageKitUpload: () => ({
    pickAndUploadImage: jest.fn(),
    pickAndUploadVideo: jest.fn(),
    uploading: false,
    progress: 0,
  }),
}));

// Mock ThemeContext
jest.mock('../../contexts/ThemeContext', () => ({
  useThemeMode: () => ({
    mode: 'light',
    isDark: false,
    toggleTheme: jest.fn(),
    setMode: jest.fn(),
    appColors: {
      primary: '#6C5CE7',
      primaryLight: '#A29BFE',
      text: '#1A1A2E',
      textSecondary: '#666',
      textTertiary: '#999',
      white: '#FFF',
      surface: '#F8F9FA',
      surfaceVariant: '#E9ECEF',
      border: '#DEE2E6',
      error: '#E74C3C',
      success: '#27AE60',
      warning: '#F59E0B',
      overlay: 'rgba(0,0,0,0.5)',
      black: '#000',
      secondary: '#9333EA',
      indigoAccent: '#6366F1',
    },
    paperTheme: {},
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

/**
 * Helper to render a screen component with common mocks already in place.
 */
export function renderScreen<P extends Record<string, unknown>>(
  Component: React.ComponentType<P>,
  props: P,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return render(React.createElement(Component, props) as any);
}

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const mockReact = require('react');
  const { View } = require('react-native');
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }: { children: any }) => children,
    SafeAreaView: ({ children, ...props }: { children: any; [key: string]: any }) => 
      mockReact.createElement(View, props, children),
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
  const mockReact = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }: { children: any; [key: string]: any }) => 
      mockReact.createElement(View, props, children),
  };
});

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'MaterialIcons');
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');

// Mock @apollo/client
jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useQuery: jest.fn(() => ({
    data: null,
    loading: false,
    error: null,
  })),
  useMutation: jest.fn(() => [jest.fn(), { data: null, loading: false, error: null }]),
  gql: jest.fn((query: TemplateStringsArray) => query),
}));

// Mock async storage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock useThemedStyles hook
jest.mock('./src/hooks/useThemedStyles', () => ({
  useThemedStyles: (createStyles: Function) =>
    createStyles({
      colors: {
        primary: '#6C5CE7',
        primaryLight: '#A29BFE',
        text: '#1A1A2E',
        textSecondary: '#666666',
        textTertiary: '#999999',
        white: '#FFFFFF',
        surface: '#F8F9FA',
        surfaceVariant: '#E9ECEF',
        border: '#DEE2E6',
        error: '#E74C3C',
        success: '#27AE60',
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        xxl: 32,
        xxxl: 48,
      },
      borderRadius: {
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        full: 9999,
      },
    }),
  useAppColors: () => ({
    primary: '#6C5CE7',
    primaryLight: '#A29BFE',
    text: '#1A1A2E',
    textSecondary: '#666666',
    textTertiary: '#999999',
    white: '#FFFFFF',
    surface: '#F8F9FA',
    surfaceVariant: '#E9ECEF',
    border: '#DEE2E6',
    error: '#E74C3C',
    success: '#27AE60',
  }),
  ThemeUtils: {},
}));

// Silence console warnings during tests
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('componentWillReceiveProps') ||
        args[0].includes('componentWillMount'))
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };

  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: An update to')
    ) {
      return;
    }
    originalError.apply(console, args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});

// Setup fake timers for testing intervals and timeouts
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
});

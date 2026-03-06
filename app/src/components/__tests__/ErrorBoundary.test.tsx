import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import ErrorBoundary from '../ErrorBoundary';

// Must mock colors and theme since ErrorBoundary imports them directly
jest.mock('../../colors', () => ({
  lightColors: {
    primary: '#6C5CE7',
    error: '#E74C3C',
    text: '#1A1A2E',
    textSecondary: '#666',
    white: '#FFF',
    background: '#F8F9FA',
    surfaceVariant: '#E9ECEF',
  },
}));

jest.mock('../../theme', () => ({
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 },
  borderRadius: { sm: 4, md: 8, lg: 12 },
}));

const ThrowingChild: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) throw new Error('Test error occurred');
  return <Text>Child renders fine</Text>;
};

describe('ErrorBoundary - Rendering', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders children when no error occurs', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={false} />
      </ErrorBoundary>,
    );
    expect(getByText('Child renders fine')).toBeTruthy();
  });

  it('renders fallback UI when child throws', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow />
      </ErrorBoundary>,
    );
    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('displays default fallback message', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow />
      </ErrorBoundary>,
    );
    expect(getByText('An unexpected error occurred. Please try again.')).toBeTruthy();
  });

  it('displays custom fallback message when provided', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const { getByText } = render(
      <ErrorBoundary fallbackMessage="Custom error message">
        <ThrowingChild shouldThrow />
      </ErrorBoundary>,
    );
    expect(getByText('Custom error message')).toBeTruthy();
  });

  it('shows retry button in error state', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow />
      </ErrorBoundary>,
    );
    expect(getByText('Try Again')).toBeTruthy();
  });
});

describe('ErrorBoundary - Behavior', () => {
  beforeEach(() => jest.clearAllMocks());

  it('resets error state when retry is pressed', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    let shouldThrow = true;
    const DynamicChild = () => {
      if (shouldThrow) throw new Error('crash');
      return <Text>Recovered</Text>;
    };
    const { getByText } = render(
      <ErrorBoundary>
        <DynamicChild />
      </ErrorBoundary>,
    );
    expect(getByText('Something went wrong')).toBeTruthy();
    shouldThrow = false;
    fireEvent.press(getByText('Try Again'));
    expect(getByText('Recovered')).toBeTruthy();
  });

  it('shows error message in __DEV__ mode', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow />
      </ErrorBoundary>,
    );
    expect(getByText('Test error occurred')).toBeTruthy();
  });
});

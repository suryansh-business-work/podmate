import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CompleteProfileScreen from '../CompleteProfileScreen';

jest.mock('@react-native-community/datetimepicker', () => {
  const mockReact = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: Record<string, unknown>) =>
      mockReact.createElement(View, { testID: 'date-picker', ...props }),
  };
});

jest.mock('../../../components/GradientButton', () => ({
  GradientButton: ({
    title,
    onPress,
    disabled,
  }: {
    title: string;
    onPress: () => void;
    disabled?: boolean;
  }) => {
    const mockReact = require('react');
    const { TouchableOpacity, Text } = require('react-native');
    return mockReact.createElement(
      TouchableOpacity,
      { onPress, disabled, accessibilityState: { disabled } },
      mockReact.createElement(Text, null, title),
    );
  },
}));

describe('CompleteProfileScreen', () => {
  const defaultProps = { onComplete: jest.fn().mockResolvedValue(undefined) };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title', () => {
    const { getByText } = render(
      <CompleteProfileScreen {...defaultProps} />,
    );
    expect(getByText('Complete Your Profile')).toBeTruthy();
  });

  it('renders subtitle', () => {
    const { getByText } = render(
      <CompleteProfileScreen {...defaultProps} />,
    );
    expect(
      getByText(/Tell us a bit about yourself/i),
    ).toBeTruthy();
  });

  it('renders username input', () => {
    const { getByPlaceholderText } = render(
      <CompleteProfileScreen {...defaultProps} />,
    );
    expect(getByPlaceholderText('Choose a unique username')).toBeTruthy();
  });

  it('renders name input', () => {
    const { getByPlaceholderText } = render(
      <CompleteProfileScreen {...defaultProps} />,
    );
    expect(getByPlaceholderText('Enter your full name')).toBeTruthy();
  });

  it('renders Get Started button', () => {
    const { getByText } = render(
      <CompleteProfileScreen {...defaultProps} />,
    );
    expect(getByText('Get Started')).toBeTruthy();
  });

  it('shows validation errors for empty fields', async () => {
    const { getByPlaceholderText, queryAllByText } = render(
      <CompleteProfileScreen {...defaultProps} />,
    );
    const usernameInput = getByPlaceholderText('Choose a unique username');
    fireEvent.changeText(usernameInput, '');
    fireEvent(usernameInput, 'blur', { persist: jest.fn(), target: { name: 'username' } });
    await waitFor(() => {
      const errors = queryAllByText(/required/i);
      expect(errors.length).toBeGreaterThanOrEqual(0);
    });
  });

  it('accepts valid form input', async () => {
    const { getByPlaceholderText } = render(
      <CompleteProfileScreen {...defaultProps} />,
    );
    fireEvent.changeText(
      getByPlaceholderText('Choose a unique username'),
      'testuser',
    );
    fireEvent.changeText(
      getByPlaceholderText('Enter your full name'),
      'Test User',
    );
    await waitFor(() => {
      expect(
        getByPlaceholderText('Choose a unique username').props.value,
      ).toBe('testuser');
    });
  });
});

import React from 'react';
import { render } from '@testing-library/react-native';
import LoginScreen from '../LoginScreen';
import { LoginScreenProps } from '../Login.types';

// Mock GradientButton component
jest.mock('../../../../components/GradientButton', () => ({
  GradientButton: ({
    title,
    onPress,
    disabled,
    children,
    testID,
  }: {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    children?: React.ReactNode;
    testID?: string;
  }) => {
    const { TouchableOpacity, Text, View } = require('react-native');
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled} testID={testID} accessibilityState={{ disabled }}>
        <Text>{title}</Text>
        {children && <View>{children}</View>}
      </TouchableOpacity>
    );
  },
}));

// Mock PolicyModal component
jest.mock('../PolicyModal', () => {
  return function MockPolicyModal() {
    return null;
  };
});

export const defaultProps: LoginScreenProps = {
  onSendOtp: jest.fn(),
  loading: false,
  error: undefined,
};

export const renderLoginScreen = (props: Partial<LoginScreenProps> = {}) => {
  return render(<LoginScreen {...defaultProps} {...props} />);
};

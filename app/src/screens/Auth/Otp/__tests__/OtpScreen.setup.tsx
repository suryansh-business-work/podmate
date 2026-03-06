import React from 'react';
import { render } from '@testing-library/react-native';
import OtpScreen from '../OtpScreen';
import { OtpScreenProps } from '../Otp.types';

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
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        testID={testID}
        accessibilityState={{ disabled }}
      >
        <Text>{title}</Text>
        {children && <View testID={`${testID}-children`}>{children}</View>}
      </TouchableOpacity>
    );
  },
}));

// Mock OtpInput component
jest.mock('../../../../components/OtpInput', () => ({
  OtpInput: ({
    onComplete,
    testID,
    length = 6,
  }: {
    onComplete: (otp: string) => void;
    testID?: string;
    length?: number;
  }) => {
    const ReactModule = require('react');
    const { View, TextInput } = require('react-native');
    const [otp, setOtp] = ReactModule.useState('');

    const handleChange = (text: string) => {
      setOtp(text);
      if (text.length === length) {
        onComplete(text);
      }
    };

    return (
      <View testID={testID}>
        <TextInput
          testID={`${testID}-field`}
          value={otp}
          onChangeText={handleChange}
          maxLength={length}
          keyboardType="number-pad"
        />
      </View>
    );
  },
}));

export const defaultOtpProps: OtpScreenProps = {
  phone: '+919876543210',
  onVerify: jest.fn(),
  onBack: jest.fn(),
  onResend: jest.fn(),
  loading: false,
  error: undefined,
};

export const renderOtpScreen = (props: Partial<OtpScreenProps> = {}) => {
  return render(<OtpScreen {...defaultOtpProps} {...props} />);
};

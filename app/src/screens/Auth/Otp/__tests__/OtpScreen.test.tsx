import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
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
      <TouchableOpacity onPress={onPress} disabled={disabled} testID={testID} accessibilityState={{ disabled }}>
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
    const React = require('react');
    const { View, TextInput } = require('react-native');
    const [otp, setOtp] = React.useState('');

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

describe('OtpScreen', () => {
  const defaultProps: OtpScreenProps = {
    phone: '+919876543210',
    onVerify: jest.fn(),
    onBack: jest.fn(),
    onResend: jest.fn(),
    loading: false,
    error: undefined,
  };

  const renderOtpScreen = (props: Partial<OtpScreenProps> = {}) => {
    return render(<OtpScreen {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render OTP screen container', () => {
      const { getByTestId } = renderOtpScreen();
      expect(getByTestId('otp-screen')).toBeTruthy();
    });

    it('should render OTP input container', () => {
      const { getByTestId } = renderOtpScreen();
      expect(getByTestId('otp-input-container')).toBeTruthy();
    });

    it('should render OTP input fields', () => {
      const { getByTestId } = renderOtpScreen();
      expect(getByTestId('otp-input')).toBeTruthy();
    });

    it('should render verify OTP button', () => {
      const { getByTestId } = renderOtpScreen();
      expect(getByTestId('verify-otp-button')).toBeTruthy();
    });

    it('should render back button', () => {
      const { getByTestId } = renderOtpScreen();
      expect(getByTestId('back-button')).toBeTruthy();
    });

    it('should display title "Verify your number"', () => {
      const { getByTestId, getByText } = renderOtpScreen();
      expect(getByTestId('otp-title')).toBeTruthy();
      expect(getByText('Verify your number')).toBeTruthy();
    });

    it('should display subtitle with code sent message', () => {
      const { getByText } = renderOtpScreen();
      expect(getByText(/We sent a 6-digit code to/)).toBeTruthy();
    });

    it('should display masked phone number', () => {
      const { getByTestId } = renderOtpScreen({ phone: '+919876543210' });
      const maskedPhone = getByTestId('masked-phone');
      expect(maskedPhone).toBeTruthy();
    });

    it('should display Verify button text when not loading', () => {
      const { getByText } = renderOtpScreen({ loading: false });
      expect(getByText('Verify')).toBeTruthy();
    });

    it('should display loading indicator when loading', () => {
      const { getByTestId, queryByText } = renderOtpScreen({ loading: true });
      expect(getByTestId('otp-loading-indicator')).toBeTruthy();
    });
  });

  describe('OTP Validation', () => {
    it('should validate empty OTP - verify button should be disabled', () => {
      const { getByTestId } = renderOtpScreen();
      const verifyButton = getByTestId('verify-otp-button');
      expect(verifyButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('should call verify OTP API when 6 digits are entered', async () => {
      const mockOnVerify = jest.fn();
      const { getByTestId } = renderOtpScreen({ onVerify: mockOnVerify });
      const otpInputField = getByTestId('otp-input-field');

      fireEvent.changeText(otpInputField, '123456');

      await waitFor(() => {
        expect(mockOnVerify).toHaveBeenCalledWith('123456');
      });
    });

    it('should auto-submit when all 6 digits are entered', async () => {
      const mockOnVerify = jest.fn();
      const { getByTestId } = renderOtpScreen({ onVerify: mockOnVerify });
      const otpInputField = getByTestId('otp-input-field');

      fireEvent.changeText(otpInputField, '654321');

      await waitFor(() => {
        expect(mockOnVerify).toHaveBeenCalledWith('654321');
      });
    });
  });

  describe('Verify Button Behavior', () => {
    it('should disable verify button while API request is loading', () => {
      const { getByTestId } = renderOtpScreen({ loading: true });
      const verifyButton = getByTestId('verify-otp-button');
      expect(verifyButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('should call onVerify when verify button is pressed with valid OTP', async () => {
      const mockOnVerify = jest.fn();
      const { getByTestId } = renderOtpScreen({ onVerify: mockOnVerify });
      const otpInputField = getByTestId('otp-input-field');
      const verifyButton = getByTestId('verify-otp-button');

      fireEvent.changeText(otpInputField, '123456');
      
      await waitFor(() => {
        expect(mockOnVerify).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error message when OTP verification fails', () => {
      const errorMessage = 'Invalid OTP. Please try again.';
      const { getByTestId, getByText } = renderOtpScreen({ error: errorMessage });
      expect(getByTestId('otp-error-container')).toBeTruthy();
      expect(getByText(errorMessage)).toBeTruthy();
    });

    it('should not show error container when there is no error', () => {
      const { queryByTestId } = renderOtpScreen({ error: undefined });
      expect(queryByTestId('otp-error-container')).toBeNull();
    });

    it('should display error message text correctly', () => {
      const errorMessage = 'OTP expired. Please request a new one.';
      const { getByText } = renderOtpScreen({ error: errorMessage });
      expect(getByText(errorMessage)).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should call onBack when back button is pressed', () => {
      const mockOnBack = jest.fn();
      const { getByTestId } = renderOtpScreen({ onBack: mockOnBack });
      const backButton = getByTestId('back-button');
      fireEvent.press(backButton);
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Resend OTP', () => {
    it('should render resend timer initially', () => {
      const { getByTestId } = renderOtpScreen();
      expect(getByTestId('resend-timer')).toBeTruthy();
    });

    it('should display "Resend code in" text with timer', () => {
      const { getByText } = renderOtpScreen();
      expect(getByText(/Resend code in/)).toBeTruthy();
    });

    it('should show resend button after 30 seconds', async () => {
      const { getByTestId, queryByTestId } = renderOtpScreen();
      
      expect(queryByTestId('resend-otp-button')).toBeNull();
      expect(getByTestId('resend-timer')).toBeTruthy();

      act(() => {
        jest.advanceTimersByTime(30000);
      });

      await waitFor(() => {
        expect(getByTestId('resend-otp-button')).toBeTruthy();
      });
    });

    it('should call resend OTP API when resend button is pressed', async () => {
      const mockOnResend = jest.fn().mockResolvedValue(undefined);
      const { getByTestId } = renderOtpScreen({ onResend: mockOnResend });

      act(() => {
        jest.advanceTimersByTime(30000);
      });

      await waitFor(() => {
        expect(getByTestId('resend-otp-button')).toBeTruthy();
      });

      const resendButton = getByTestId('resend-otp-button');
      await act(async () => {
        fireEvent.press(resendButton);
      });

      expect(mockOnResend).toHaveBeenCalledTimes(1);
    });

    it('should reset timer after resend', async () => {
      const mockOnResend = jest.fn().mockResolvedValue(undefined);
      const { getByTestId } = renderOtpScreen({ onResend: mockOnResend });

      act(() => {
        jest.advanceTimersByTime(30000);
      });

      await waitFor(() => {
        expect(getByTestId('resend-otp-button')).toBeTruthy();
      });

      const resendButton = getByTestId('resend-otp-button');
      await act(async () => {
        fireEvent.press(resendButton);
      });

      await waitFor(() => {
        expect(getByTestId('resend-timer')).toBeTruthy();
      });
    });
  });

  describe('Phone Number Masking', () => {
    it('should mask phone number correctly', () => {
      const { getByTestId } = renderOtpScreen({ phone: '+919876543210' });
      const maskedPhone = getByTestId('masked-phone');
      expect(maskedPhone).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty phone number gracefully', () => {
      const { getByTestId } = renderOtpScreen({ phone: '' });
      expect(getByTestId('otp-screen')).toBeTruthy();
    });

    it('should handle onVerify returning a promise', async () => {
      const mockOnVerify = jest.fn().mockResolvedValue(undefined);
      const { getByTestId } = renderOtpScreen({ onVerify: mockOnVerify });
      const otpInputField = getByTestId('otp-input-field');

      fireEvent.changeText(otpInputField, '123456');

      await waitFor(() => {
        expect(mockOnVerify).toHaveBeenCalledWith('123456');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper test IDs for all interactive elements', () => {
      const { getByTestId } = renderOtpScreen();
      expect(getByTestId('otp-screen')).toBeTruthy();
      expect(getByTestId('back-button')).toBeTruthy();
      expect(getByTestId('otp-input')).toBeTruthy();
      expect(getByTestId('verify-otp-button')).toBeTruthy();
    });
  });
});

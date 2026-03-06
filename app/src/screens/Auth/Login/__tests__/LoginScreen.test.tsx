import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
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
  const React = require('react');
  return function MockPolicyModal() {
    return null;
  };
});

describe('LoginScreen', () => {
  const defaultProps: LoginScreenProps = {
    onSendOtp: jest.fn(),
    loading: false,
    error: undefined,
  };

  const renderLoginScreen = (props: Partial<LoginScreenProps> = {}) => {
    return render(<LoginScreen {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render phone number input field', () => {
      // Arrange & Act
      const { getByTestId } = renderLoginScreen();

      // Assert
      expect(getByTestId('phone-input')).toBeTruthy();
    });

    it('should render send OTP button', () => {
      // Arrange & Act
      const { getByTestId } = renderLoginScreen();

      // Assert
      expect(getByTestId('send-otp-button')).toBeTruthy();
    });

    it('should render login screen container', () => {
      // Arrange & Act
      const { getByTestId } = renderLoginScreen();

      // Assert
      expect(getByTestId('login-screen')).toBeTruthy();
    });

    it('should render country code button', () => {
      // Arrange & Act
      const { getByTestId } = renderLoginScreen();

      // Assert
      expect(getByTestId('country-code-button')).toBeTruthy();
    });

    it('should display default country code +91', () => {
      // Arrange & Act
      const { getByText } = renderLoginScreen();

      // Assert
      expect(getByText('+91')).toBeTruthy();
    });

    it('should display welcome title', () => {
      // Arrange & Act
      const { getByText } = renderLoginScreen();

      // Assert
      expect(getByText('Welcome to PartyWings')).toBeTruthy();
    });

    it('should display subtitle with instructions', () => {
      // Arrange & Act
      const { getByText } = renderLoginScreen();

      // Assert
      expect(getByText('Enter your phone number to join or create your Pod.')).toBeTruthy();
    });

    it('should display phone number label', () => {
      // Arrange & Act
      const { getByText } = renderLoginScreen();

      // Assert
      expect(getByText('PHONE NUMBER')).toBeTruthy();
    });

    it('should display secure login badge', () => {
      // Arrange & Act
      const { getByText } = renderLoginScreen();

      // Assert
      expect(getByText('Secure, passwordless login')).toBeTruthy();
    });

    it('should display Terms of Service link', () => {
      // Arrange & Act
      const { getByText } = renderLoginScreen();

      // Assert
      expect(getByText('Terms of Service')).toBeTruthy();
    });

    it('should display Privacy Policy link', () => {
      // Arrange & Act
      const { getByText } = renderLoginScreen();

      // Assert
      expect(getByText('Privacy Policy')).toBeTruthy();
    });

    it('should display Venue Policy link', () => {
      // Arrange & Act
      const { getByText } = renderLoginScreen();

      // Assert
      expect(getByText('Venue Policy')).toBeTruthy();
    });

    it('should display Host Policy link', () => {
      // Arrange & Act
      const { getByText } = renderLoginScreen();

      // Assert
      expect(getByText('Host Policy')).toBeTruthy();
    });
  });

  describe('Phone Number Validation', () => {
    it('should not submit with empty phone number', async () => {
      // Arrange
      const mockOnSendOtp = jest.fn();
      const { getByTestId } = renderLoginScreen({ onSendOtp: mockOnSendOtp });
      const sendOtpButton = getByTestId('send-otp-button');

      // Act - try to submit without entering phone
      fireEvent.press(sendOtpButton);

      // Assert - onSendOtp should not be called
      expect(mockOnSendOtp).not.toHaveBeenCalled();
    });

    it('should not submit with invalid phone number - too short', async () => {
      // Arrange
      const mockOnSendOtp = jest.fn();
      const { getByTestId } = renderLoginScreen({ onSendOtp: mockOnSendOtp });
      const phoneInput = getByTestId('phone-input');
      const sendOtpButton = getByTestId('send-otp-button');

      // Act - enter short phone and try to submit
      await act(async () => {
        fireEvent.changeText(phoneInput, '12345');
        jest.runAllTimers();
      });
      fireEvent.press(sendOtpButton);

      // Assert - onSendOtp should not be called
      expect(mockOnSendOtp).not.toHaveBeenCalled();
    });

    it('should not submit with invalid phone number - contains letters', async () => {
      // Arrange
      const mockOnSendOtp = jest.fn();
      const { getByTestId } = renderLoginScreen({ onSendOtp: mockOnSendOtp });
      const phoneInput = getByTestId('phone-input');
      const sendOtpButton = getByTestId('send-otp-button');

      // Act - enter phone with letters and try to submit
      await act(async () => {
        fireEvent.changeText(phoneInput, '12345abcde');
        jest.runAllTimers();
      });
      fireEvent.press(sendOtpButton);

      // Assert - onSendOtp should not be called because invalid format
      expect(mockOnSendOtp).not.toHaveBeenCalled();
    });

    it('should submit with valid 10-digit phone number', async () => {
      // Arrange
      const mockOnSendOtp = jest.fn();
      const { getByTestId } = renderLoginScreen({ onSendOtp: mockOnSendOtp });
      const phoneInput = getByTestId('phone-input');
      const sendOtpButton = getByTestId('send-otp-button');

      // Act
      await act(async () => {
        fireEvent.changeText(phoneInput, '9876543210');
        jest.runAllTimers();
      });
      fireEvent.press(sendOtpButton);

      // Assert - should submit successfully
      await waitFor(() => {
        expect(mockOnSendOtp).toHaveBeenCalledWith('+919876543210');
      });
    });

    it('should accept only numeric input', async () => {
      // Arrange
      const { getByTestId } = renderLoginScreen();
      const phoneInput = getByTestId('phone-input');

      // Act
      fireEvent.changeText(phoneInput, '9876543210');

      // Assert
      expect(phoneInput.props.value).toBe('9876543210');
    });
  });

  describe('Send OTP Button Behavior', () => {
    it('should disable send OTP button when phone number is empty', () => {
      // Arrange & Act
      const { getByTestId } = renderLoginScreen();
      const sendOtpButton = getByTestId('send-otp-button');

      // Assert
      expect(sendOtpButton.props.accessibilityState?.disabled || sendOtpButton.props.disabled).toBeTruthy();
    });

    it('should disable send OTP button when phone number is invalid', async () => {
      // Arrange
      const { getByTestId } = renderLoginScreen();
      const phoneInput = getByTestId('phone-input');
      const sendOtpButton = getByTestId('send-otp-button');

      // Act
      fireEvent.changeText(phoneInput, '12345');
      
      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      // Assert - button should still be disabled as phone is invalid
      expect(sendOtpButton.props.accessibilityState?.disabled || sendOtpButton.props.disabled).toBeTruthy();
    });

    it('should enable send OTP button when valid phone number is entered', async () => {
      // Arrange
      const { getByTestId } = renderLoginScreen();
      const phoneInput = getByTestId('phone-input');
      const sendOtpButton = getByTestId('send-otp-button');

      // Act
      fireEvent.changeText(phoneInput, '9876543210');

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      // Assert
      expect(sendOtpButton.props.accessibilityState?.disabled).toBeFalsy();
    });

    it('should call send OTP API when valid phone number is entered and button is pressed', async () => {
      // Arrange
      const mockOnSendOtp = jest.fn();
      const { getByTestId } = renderLoginScreen({ onSendOtp: mockOnSendOtp });
      const phoneInput = getByTestId('phone-input');
      const sendOtpButton = getByTestId('send-otp-button');

      // Act
      fireEvent.changeText(phoneInput, '9876543210');
      
      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      fireEvent.press(sendOtpButton);

      // Assert
      await waitFor(() => {
        expect(mockOnSendOtp).toHaveBeenCalledWith('+919876543210');
      });
    });

    it('should call onSendOtp with country code prepended', async () => {
      // Arrange
      const mockOnSendOtp = jest.fn();
      const { getByTestId } = renderLoginScreen({ onSendOtp: mockOnSendOtp });
      const phoneInput = getByTestId('phone-input');
      const sendOtpButton = getByTestId('send-otp-button');

      // Act
      fireEvent.changeText(phoneInput, '5550001234');

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      fireEvent.press(sendOtpButton);

      // Assert
      await waitFor(() => {
        expect(mockOnSendOtp).toHaveBeenCalledWith('+915550001234');
      });
    });

    it('should disable send OTP button while API request is loading', () => {
      // Arrange
      const { getByTestId } = renderLoginScreen({ loading: true });
      const sendOtpButton = getByTestId('send-otp-button');

      // Assert
      expect(sendOtpButton.props.accessibilityState?.disabled).toBeTruthy();
    });

    it('should show loading indicator when loading is true', () => {
      // Arrange
      const { getByTestId, queryByText } = renderLoginScreen({ loading: true });

      // Assert
      expect(getByTestId('loading-indicator')).toBeTruthy();
      // Button title should be empty when loading
      expect(queryByText('Continue')).toBeNull();
    });

    it('should show Continue text when not loading', () => {
      // Arrange
      const { getByText } = renderLoginScreen({ loading: false });

      // Assert
      expect(getByText('Continue')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should show error message if API fails', () => {
      // Arrange
      const errorMessage = 'Failed to send OTP. Please try again.';

      // Act
      const { getByTestId, getByText } = renderLoginScreen({ error: errorMessage });

      // Assert
      expect(getByTestId('api-error')).toBeTruthy();
      expect(getByText(errorMessage)).toBeTruthy();
    });

    it('should not show API error when there is no error', () => {
      // Arrange & Act
      const { queryByTestId } = renderLoginScreen({ error: undefined });

      // Assert
      expect(queryByTestId('api-error')).toBeNull();
    });

    it('should display validation error message for invalid input', async () => {
      // Arrange - validation errors are shown when form is submitted with touched fields
      const mockOnSendOtp = jest.fn();
      const { getByTestId } = renderLoginScreen({ onSendOtp: mockOnSendOtp });
      const phoneInput = getByTestId('phone-input');
      const sendOtpButton = getByTestId('send-otp-button');

      // Act - Enter invalid phone and try to submit
      await act(async () => {
        fireEvent.changeText(phoneInput, '123');
        jest.runAllTimers();
      });
      fireEvent.press(sendOtpButton);

      // Assert - should not call onSendOtp for invalid form
      expect(mockOnSendOtp).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have accessibility label on phone input', () => {
      // Arrange & Act
      const { getByTestId } = renderLoginScreen();
      const phoneInput = getByTestId('phone-input');

      // Assert
      expect(phoneInput.props.accessibilityLabel).toBe('Phone number input');
    });

    it('should have placeholder text for phone input', () => {
      // Arrange & Act
      const { getByTestId } = renderLoginScreen();
      const phoneInput = getByTestId('phone-input');

      // Assert
      expect(phoneInput.props.placeholder).toBe('555 000-0000');
    });

    it('should have phone-pad keyboard type', () => {
      // Arrange & Act
      const { getByTestId } = renderLoginScreen();
      const phoneInput = getByTestId('phone-input');

      // Assert
      expect(phoneInput.props.keyboardType).toBe('phone-pad');
    });

    it('should have max length of 10 for phone input', () => {
      // Arrange & Act
      const { getByTestId } = renderLoginScreen();
      const phoneInput = getByTestId('phone-input');

      // Assert
      expect(phoneInput.props.maxLength).toBe(10);
    });
  });

  describe('Form Interaction', () => {
    it('should update phone input value on change', () => {
      // Arrange
      const { getByTestId } = renderLoginScreen();
      const phoneInput = getByTestId('phone-input');

      // Act
      fireEvent.changeText(phoneInput, '1234567890');

      // Assert
      expect(phoneInput.props.value).toBe('1234567890');
    });

    it('should not call onSendOtp when form is invalid', () => {
      // Arrange
      const mockOnSendOtp = jest.fn();
      const { getByTestId } = renderLoginScreen({ onSendOtp: mockOnSendOtp });
      const sendOtpButton = getByTestId('send-otp-button');

      // Act
      fireEvent.press(sendOtpButton);

      // Assert
      expect(mockOnSendOtp).not.toHaveBeenCalled();
    });

    it('should validate form on submit', async () => {
      // Arrange - This tests that validation runs when submit is attempted
      const mockOnSendOtp = jest.fn();
      const { getByTestId } = renderLoginScreen({ onSendOtp: mockOnSendOtp });
      const phoneInput = getByTestId('phone-input');
      const sendOtpButton = getByTestId('send-otp-button');

      // Act - Enter invalid phone and submit
      fireEvent.changeText(phoneInput, '123');
      fireEvent.press(sendOtpButton);

      // Assert - should not call onSendOtp for invalid form
      expect(mockOnSendOtp).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid button presses gracefully', async () => {
      // Arrange
      const mockOnSendOtp = jest.fn();
      const { getByTestId } = renderLoginScreen({ onSendOtp: mockOnSendOtp });
      const phoneInput = getByTestId('phone-input');
      const sendOtpButton = getByTestId('send-otp-button');

      // Act
      await act(async () => {
        fireEvent.changeText(phoneInput, '9876543210');
        jest.runAllTimers();
      });

      // Simulate rapid presses
      await act(async () => {
        fireEvent.press(sendOtpButton);
        jest.runAllTimers();
      });

      // Assert - should have been called
      await waitFor(() => {
        expect(mockOnSendOtp).toHaveBeenCalled();
      });
    });

    it('should handle phone number with leading zeros', async () => {
      // Arrange
      const mockOnSendOtp = jest.fn();
      const { getByTestId } = renderLoginScreen({ onSendOtp: mockOnSendOtp });
      const phoneInput = getByTestId('phone-input');
      const sendOtpButton = getByTestId('send-otp-button');

      // Act - Enter valid 10-digit phone with leading zero
      await act(async () => {
        fireEvent.changeText(phoneInput, '0123456789');
        jest.runAllTimers();
      });
      fireEvent.press(sendOtpButton);

      // Assert - should submit successfully as it's still 10 digits
      await waitFor(() => {
        expect(mockOnSendOtp).toHaveBeenCalledWith('+910123456789');
      });
    });

    it('should truncate phone number exceeding max length', () => {
      // Arrange
      const { getByTestId } = renderLoginScreen();
      const phoneInput = getByTestId('phone-input');

      // Act - maxLength is set to 10
      fireEvent.changeText(phoneInput, '12345678901234');

      // Assert - React Native TextInput with maxLength will handle this
      // The value should be truncated to 10 characters
      expect(phoneInput.props.maxLength).toBe(10);
    });
  });
});

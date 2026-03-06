import React from 'react';
import { fireEvent, waitFor, act } from '@testing-library/react-native';
import { renderLoginScreen } from './LoginScreen.setup';

describe('LoginScreen - Phone Number Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not submit with empty phone number', () => {
    const mockOnSendOtp = jest.fn();
    const { getByTestId } = renderLoginScreen({ onSendOtp: mockOnSendOtp });
    const sendOtpButton = getByTestId('send-otp-button');

    fireEvent.press(sendOtpButton);
    expect(mockOnSendOtp).not.toHaveBeenCalled();
  });

  it('should not submit with invalid phone number - too short', async () => {
    const mockOnSendOtp = jest.fn();
    const { getByTestId } = renderLoginScreen({ onSendOtp: mockOnSendOtp });
    const phoneInput = getByTestId('phone-input');
    const sendOtpButton = getByTestId('send-otp-button');

    await act(async () => {
      fireEvent.changeText(phoneInput, '12345');
      jest.runAllTimers();
    });
    fireEvent.press(sendOtpButton);

    expect(mockOnSendOtp).not.toHaveBeenCalled();
  });

  it('should not submit with invalid phone number - contains letters', async () => {
    const mockOnSendOtp = jest.fn();
    const { getByTestId } = renderLoginScreen({ onSendOtp: mockOnSendOtp });
    const phoneInput = getByTestId('phone-input');
    const sendOtpButton = getByTestId('send-otp-button');

    await act(async () => {
      fireEvent.changeText(phoneInput, '12345abcde');
      jest.runAllTimers();
    });
    fireEvent.press(sendOtpButton);

    expect(mockOnSendOtp).not.toHaveBeenCalled();
  });

  it('should submit with valid 10-digit phone number', async () => {
    const mockOnSendOtp = jest.fn();
    const { getByTestId } = renderLoginScreen({ onSendOtp: mockOnSendOtp });
    const phoneInput = getByTestId('phone-input');
    const sendOtpButton = getByTestId('send-otp-button');

    await act(async () => {
      fireEvent.changeText(phoneInput, '9876543210');
      jest.runAllTimers();
    });
    fireEvent.press(sendOtpButton);

    await waitFor(() => {
      expect(mockOnSendOtp).toHaveBeenCalledWith('+919876543210');
    });
  });

  it('should accept only numeric input', () => {
    const { getByTestId } = renderLoginScreen();
    const phoneInput = getByTestId('phone-input');

    fireEvent.changeText(phoneInput, '9876543210');
    expect(phoneInput.props.value).toBe('9876543210');
  });
});

describe('LoginScreen - Send OTP Button Behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should disable send OTP button when phone number is empty', () => {
    const { getByTestId } = renderLoginScreen();
    const sendOtpButton = getByTestId('send-otp-button');
    expect(sendOtpButton.props.accessibilityState?.disabled || sendOtpButton.props.disabled).toBeTruthy();
  });

  it('should disable send OTP button when phone number is invalid', async () => {
    const { getByTestId } = renderLoginScreen();
    const phoneInput = getByTestId('phone-input');
    const sendOtpButton = getByTestId('send-otp-button');

    fireEvent.changeText(phoneInput, '12345');
    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    expect(sendOtpButton.props.accessibilityState?.disabled || sendOtpButton.props.disabled).toBeTruthy();
  });

  it('should enable send OTP button when valid phone number is entered', async () => {
    const { getByTestId } = renderLoginScreen();
    const phoneInput = getByTestId('phone-input');
    const sendOtpButton = getByTestId('send-otp-button');

    fireEvent.changeText(phoneInput, '9876543210');
    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    expect(sendOtpButton.props.accessibilityState?.disabled).toBeFalsy();
  });

  it('should call send OTP API when valid phone number is entered and button is pressed', async () => {
    const mockOnSendOtp = jest.fn();
    const { getByTestId } = renderLoginScreen({ onSendOtp: mockOnSendOtp });
    const phoneInput = getByTestId('phone-input');
    const sendOtpButton = getByTestId('send-otp-button');

    fireEvent.changeText(phoneInput, '9876543210');
    await act(async () => {
      jest.advanceTimersByTime(100);
    });
    fireEvent.press(sendOtpButton);

    await waitFor(() => {
      expect(mockOnSendOtp).toHaveBeenCalledWith('+919876543210');
    });
  });

  it('should call onSendOtp with country code prepended', async () => {
    const mockOnSendOtp = jest.fn();
    const { getByTestId } = renderLoginScreen({ onSendOtp: mockOnSendOtp });
    const phoneInput = getByTestId('phone-input');
    const sendOtpButton = getByTestId('send-otp-button');

    fireEvent.changeText(phoneInput, '5550001234');
    await act(async () => {
      jest.advanceTimersByTime(100);
    });
    fireEvent.press(sendOtpButton);

    await waitFor(() => {
      expect(mockOnSendOtp).toHaveBeenCalledWith('+915550001234');
    });
  });

  it('should disable send OTP button while API request is loading', () => {
    const { getByTestId } = renderLoginScreen({ loading: true });
    const sendOtpButton = getByTestId('send-otp-button');
    expect(sendOtpButton.props.accessibilityState?.disabled).toBeTruthy();
  });

  it('should show loading indicator when loading is true', () => {
    const { getByTestId, queryByText } = renderLoginScreen({ loading: true });
    expect(getByTestId('loading-indicator')).toBeTruthy();
    expect(queryByText('Continue')).toBeNull();
  });

  it('should show Continue text when not loading', () => {
    const { getByText } = renderLoginScreen({ loading: false });
    expect(getByText('Continue')).toBeTruthy();
  });
});

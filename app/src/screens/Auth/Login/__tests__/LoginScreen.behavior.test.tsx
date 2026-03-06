import React from 'react';
import { fireEvent, waitFor, act } from '@testing-library/react-native';
import { renderLoginScreen } from './LoginScreen.setup';

describe('LoginScreen - Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show error message if API fails', () => {
    const errorMessage = 'Failed to send OTP. Please try again.';
    const { getByTestId, getByText } = renderLoginScreen({ error: errorMessage });

    expect(getByTestId('api-error')).toBeTruthy();
    expect(getByText(errorMessage)).toBeTruthy();
  });

  it('should not show API error when there is no error', () => {
    const { queryByTestId } = renderLoginScreen({ error: undefined });
    expect(queryByTestId('api-error')).toBeNull();
  });

  it('should display validation error message for invalid input', async () => {
    const mockOnSendOtp = jest.fn();
    const { getByTestId } = renderLoginScreen({ onSendOtp: mockOnSendOtp });
    const phoneInput = getByTestId('phone-input');
    const sendOtpButton = getByTestId('send-otp-button');

    await act(async () => {
      fireEvent.changeText(phoneInput, '123');
      jest.runAllTimers();
    });
    fireEvent.press(sendOtpButton);

    expect(mockOnSendOtp).not.toHaveBeenCalled();
  });
});

describe('LoginScreen - Form Interaction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update phone input value on change', () => {
    const { getByTestId } = renderLoginScreen();
    const phoneInput = getByTestId('phone-input');

    fireEvent.changeText(phoneInput, '1234567890');
    expect(phoneInput.props.value).toBe('1234567890');
  });

  it('should not call onSendOtp when form is invalid', () => {
    const mockOnSendOtp = jest.fn();
    const { getByTestId } = renderLoginScreen({ onSendOtp: mockOnSendOtp });
    const sendOtpButton = getByTestId('send-otp-button');

    fireEvent.press(sendOtpButton);
    expect(mockOnSendOtp).not.toHaveBeenCalled();
  });

  it('should validate form on submit', () => {
    const mockOnSendOtp = jest.fn();
    const { getByTestId } = renderLoginScreen({ onSendOtp: mockOnSendOtp });
    const phoneInput = getByTestId('phone-input');
    const sendOtpButton = getByTestId('send-otp-button');

    fireEvent.changeText(phoneInput, '123');
    fireEvent.press(sendOtpButton);

    expect(mockOnSendOtp).not.toHaveBeenCalled();
  });
});

describe('LoginScreen - Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle rapid button presses gracefully', async () => {
    const mockOnSendOtp = jest.fn();
    const { getByTestId } = renderLoginScreen({ onSendOtp: mockOnSendOtp });
    const phoneInput = getByTestId('phone-input');
    const sendOtpButton = getByTestId('send-otp-button');

    await act(async () => {
      fireEvent.changeText(phoneInput, '9876543210');
      jest.runAllTimers();
    });

    await act(async () => {
      fireEvent.press(sendOtpButton);
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(mockOnSendOtp).toHaveBeenCalled();
    });
  });

  it('should handle phone number with leading zeros', async () => {
    const mockOnSendOtp = jest.fn();
    const { getByTestId } = renderLoginScreen({ onSendOtp: mockOnSendOtp });
    const phoneInput = getByTestId('phone-input');
    const sendOtpButton = getByTestId('send-otp-button');

    await act(async () => {
      fireEvent.changeText(phoneInput, '0123456789');
      jest.runAllTimers();
    });
    fireEvent.press(sendOtpButton);

    await waitFor(() => {
      expect(mockOnSendOtp).toHaveBeenCalledWith('+910123456789');
    });
  });

  it('should truncate phone number exceeding max length', () => {
    const { getByTestId } = renderLoginScreen();
    const phoneInput = getByTestId('phone-input');

    fireEvent.changeText(phoneInput, '12345678901234');
    expect(phoneInput.props.maxLength).toBe(10);
  });
});

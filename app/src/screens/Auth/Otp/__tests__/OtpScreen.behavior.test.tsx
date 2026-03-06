import React from 'react';
import { fireEvent, waitFor, act } from '@testing-library/react-native';
import { renderOtpScreen } from './OtpScreen.setup';

describe('OtpScreen - Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

describe('OtpScreen - Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call onBack when back button is pressed', () => {
    const mockOnBack = jest.fn();
    const { getByTestId } = renderOtpScreen({ onBack: mockOnBack });
    const backButton = getByTestId('back-button');
    fireEvent.press(backButton);
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });
});

describe('OtpScreen - Resend OTP', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

describe('OtpScreen - Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should mask phone number correctly', () => {
    const { getByTestId } = renderOtpScreen({ phone: '+919876543210' });
    const maskedPhone = getByTestId('masked-phone');
    expect(maskedPhone).toBeTruthy();
  });

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

  it('should have proper test IDs for all interactive elements', () => {
    const { getByTestId } = renderOtpScreen();
    expect(getByTestId('otp-screen')).toBeTruthy();
    expect(getByTestId('back-button')).toBeTruthy();
    expect(getByTestId('otp-input')).toBeTruthy();
    expect(getByTestId('verify-otp-button')).toBeTruthy();
  });
});

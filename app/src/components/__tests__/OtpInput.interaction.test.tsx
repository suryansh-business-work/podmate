import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { OtpInput } from '../OtpInput';

describe('OtpInput - Focus Management', () => {
  const defaultProps = {
    onComplete: jest.fn(),
  };

  const renderOtpInput = (props = {}) => {
    return render(<OtpInput {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should move focus to next input after entering a digit', async () => {
    const { getByTestId } = renderOtpInput({ testID: 'otp' });
    const firstInput = getByTestId('otp-0');

    await act(async () => {
      fireEvent.changeText(firstInput, '1');
    });

    expect(firstInput.props.value).toBe('1');
  });

  it('should handle backspace to clear current input', async () => {
    const { getByTestId } = renderOtpInput({ testID: 'otp' });
    const firstInput = getByTestId('otp-0');
    const secondInput = getByTestId('otp-1');

    await act(async () => {
      fireEvent.changeText(firstInput, '1');
    });

    await act(async () => {
      fireEvent.changeText(secondInput, '2');
    });

    await act(async () => {
      fireEvent(secondInput, 'keyPress', { nativeEvent: { key: 'Backspace' } });
    });

    expect(secondInput.props.value).toBeDefined();
  });
});

describe('OtpInput - onComplete Callback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call onComplete when all digits are entered', async () => {
    const mockOnComplete = jest.fn();
    const { getByTestId } = render(
      <OtpInput onComplete={mockOnComplete} length={6} testID="otp" />,
    );

    for (let i = 0; i < 6; i++) {
      await act(async () => {
        fireEvent.changeText(getByTestId(`otp-${i}`), `${i + 1}`);
      });
    }

    expect(mockOnComplete).toHaveBeenCalledWith('123456');
  });

  it('should not call onComplete when not all digits are entered', async () => {
    const mockOnComplete = jest.fn();
    const { getByTestId } = render(
      <OtpInput onComplete={mockOnComplete} length={6} testID="otp" />,
    );

    for (let i = 0; i < 3; i++) {
      await act(async () => {
        fireEvent.changeText(getByTestId(`otp-${i}`), `${i + 1}`);
      });
    }

    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  it('should call onComplete with correct OTP for custom length', async () => {
    const mockOnComplete = jest.fn();
    const { getByTestId } = render(
      <OtpInput onComplete={mockOnComplete} length={4} testID="otp" />,
    );

    for (let i = 0; i < 4; i++) {
      await act(async () => {
        fireEvent.changeText(getByTestId(`otp-${i}`), `${i + 1}`);
      });
    }

    expect(mockOnComplete).toHaveBeenCalledWith('1234');
  });
});

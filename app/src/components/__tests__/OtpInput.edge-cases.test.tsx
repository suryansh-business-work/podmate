import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { OtpInput } from '../OtpInput';

describe('OtpInput - Styling', () => {
  const defaultProps = {
    onComplete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should apply filled style when input has value', async () => {
    const { getByTestId } = render(<OtpInput {...defaultProps} testID="otp" />);
    const firstInput = getByTestId('otp-0');

    await act(async () => {
      fireEvent.changeText(firstInput, '1');
    });

    expect(firstInput.props.value).toBe('1');
  });
});

describe('OtpInput - Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle entering all digits sequentially', async () => {
    const mockOnComplete = jest.fn();
    const { getByTestId } = render(
      <OtpInput onComplete={mockOnComplete} length={6} testID="otp" />
    );

    for (let i = 0; i < 6; i++) {
      await act(async () => {
        fireEvent.changeText(getByTestId(`otp-${i}`), `${i + 1}`);
      });
    }

    expect(getByTestId('otp-0').props.value).toBe('1');
    expect(getByTestId('otp-5').props.value).toBe('6');
  });

  it('should handle overwriting existing digit', async () => {
    const defaultProps = { onComplete: jest.fn() };
    const { getByTestId } = render(<OtpInput {...defaultProps} testID="otp" />);
    const firstInput = getByTestId('otp-0');

    await act(async () => {
      fireEvent.changeText(firstInput, '1');
    });

    await act(async () => {
      fireEvent.changeText(firstInput, '9');
    });

    expect(firstInput.props.value).toBe('9');
  });

  it('should handle clearing an input', async () => {
    const defaultProps = { onComplete: jest.fn() };
    const { getByTestId } = render(<OtpInput {...defaultProps} testID="otp" />);
    const firstInput = getByTestId('otp-0');

    await act(async () => {
      fireEvent.changeText(firstInput, '1');
    });

    await act(async () => {
      fireEvent.changeText(firstInput, '');
    });

    expect(firstInput.props.value).toBe('');
  });
});

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { TextInput } from 'react-native';
import { OtpInput } from '../OtpInput';

describe('OtpInput - Rendering', () => {
  const defaultProps = {
    onComplete: jest.fn(),
  };

  const renderOtpInput = (props = {}) => {
    return render(<OtpInput {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render 6 input fields by default', () => {
    const { root } = renderOtpInput();
    const textInputs = root.findAllByType(TextInput);
    expect(textInputs.length).toBe(6);
  });

  it('should render custom number of input fields when length prop is provided', () => {
    const { root } = render(<OtpInput {...defaultProps} length={4} />);
    const textInputs = root.findAllByType(TextInput);
    expect(textInputs.length).toBe(4);
  });

  it('should render with testID when provided', () => {
    const { getByTestId } = renderOtpInput({ testID: 'test-otp-input' });
    expect(getByTestId('test-otp-input')).toBeTruthy();
  });

  it('should render individual input testIDs when main testID is provided', () => {
    const { getByTestId } = renderOtpInput({ testID: 'otp' });
    expect(getByTestId('otp-0')).toBeTruthy();
    expect(getByTestId('otp-1')).toBeTruthy();
    expect(getByTestId('otp-2')).toBeTruthy();
    expect(getByTestId('otp-3')).toBeTruthy();
    expect(getByTestId('otp-4')).toBeTruthy();
    expect(getByTestId('otp-5')).toBeTruthy();
  });
});

describe('OtpInput - Input Behavior', () => {
  const defaultProps = {
    onComplete: jest.fn(),
  };

  const renderOtpInput = (props = {}) => {
    return render(<OtpInput {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should allow single digit input in each field', () => {
    const { getByTestId } = renderOtpInput({ testID: 'otp' });
    const firstInput = getByTestId('otp-0');
    fireEvent.changeText(firstInput, '1');
    expect(firstInput.props.value).toBe('1');
  });

  it('should have maxLength of 1 for each input', () => {
    const { getByTestId } = renderOtpInput({ testID: 'otp' });
    const firstInput = getByTestId('otp-0');
    expect(firstInput.props.maxLength).toBe(1);
  });

  it('should have number-pad keyboard type', () => {
    const { getByTestId } = renderOtpInput({ testID: 'otp' });
    const firstInput = getByTestId('otp-0');
    expect(firstInput.props.keyboardType).toBe('number-pad');
  });

  it('should auto-focus on first input', () => {
    const { getByTestId } = renderOtpInput({ testID: 'otp' });
    const firstInput = getByTestId('otp-0');
    expect(firstInput.props.autoFocus).toBe(true);
  });

  it('should not auto-focus on other inputs', () => {
    const { getByTestId } = renderOtpInput({ testID: 'otp' });
    const secondInput = getByTestId('otp-1');
    expect(secondInput.props.autoFocus).toBeFalsy();
  });
});

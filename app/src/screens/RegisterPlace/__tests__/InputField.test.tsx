import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import InputField from '../InputField';

describe('InputField', () => {
  const defaultProps = {
    label: 'Venue Name',
    icon: 'store' as const,
    value: '',
    onChangeText: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the label text', () => {
    const { getByText } = render(<InputField {...defaultProps} />);
    expect(getByText('Venue Name')).toBeTruthy();
  });

  it('renders the icon name as text (via mock)', () => {
    const { getByText } = render(<InputField {...defaultProps} />);
    expect(getByText('store')).toBeTruthy();
  });

  it('displays the current value', () => {
    const { getByDisplayValue } = render(<InputField {...defaultProps} value="Sky Lounge" />);
    expect(getByDisplayValue('Sky Lounge')).toBeTruthy();
  });

  it('calls onChangeText when typing', () => {
    const onChangeText = jest.fn();
    const { getByDisplayValue } = render(
      <InputField {...defaultProps} value="" onChangeText={onChangeText} placeholder="Enter" />,
    );
    const input = getByDisplayValue('');
    fireEvent.changeText(input, 'Test');
    expect(onChangeText).toHaveBeenCalledWith('Test');
  });

  it('calls onBlur when input loses focus', () => {
    const onBlur = jest.fn();
    const { getByDisplayValue } = render(
      <InputField {...defaultProps} value="x" onBlur={onBlur} />,
    );
    fireEvent(getByDisplayValue('x'), 'blur');
    expect(onBlur).toHaveBeenCalled();
  });

  it('shows error text when error prop is provided', () => {
    const { getByText } = render(<InputField {...defaultProps} error="This field is required" />);
    expect(getByText('This field is required')).toBeTruthy();
  });

  it('does not show error text when error is undefined', () => {
    const { queryByText } = render(<InputField {...defaultProps} />);
    expect(queryByText('This field is required')).toBeNull();
  });

  it('renders placeholder text', () => {
    const { getByPlaceholderText } = render(
      <InputField {...defaultProps} placeholder="e.g. Sky Lounge" />,
    );
    expect(getByPlaceholderText('e.g. Sky Lounge')).toBeTruthy();
  });

  it('passes multiline prop to TextInput', () => {
    const { getByDisplayValue } = render(
      <InputField {...defaultProps} value="multi" multiline numberOfLines={3} />,
    );
    const input = getByDisplayValue('multi');
    expect(input.props.multiline).toBe(true);
    expect(input.props.numberOfLines).toBe(3);
  });

  it('passes keyboardType prop to TextInput', () => {
    const { getByDisplayValue } = render(
      <InputField {...defaultProps} value="123" keyboardType="numeric" />,
    );
    expect(getByDisplayValue('123').props.keyboardType).toBe('numeric');
  });
});

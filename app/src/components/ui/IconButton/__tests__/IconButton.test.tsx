import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { IconButton } from '../IconButton';

describe('IconButton', () => {
  const defaultProps = {
    icon: 'close' as const,
    onPress: jest.fn(),
    accessibilityLabel: 'Close dialog',
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders the icon name via MaterialIcons mock', () => {
    const { getByText } = render(<IconButton {...defaultProps} />);
    expect(getByText('close')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<IconButton {...defaultProps} onPress={onPress} />);
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('has accessibility role button', () => {
    const { getByRole } = render(<IconButton {...defaultProps} />);
    expect(getByRole('button')).toBeTruthy();
  });

  it('sets accessibilityLabel correctly', () => {
    const { getByLabelText } = render(<IconButton {...defaultProps} />);
    expect(getByLabelText('Close dialog')).toBeTruthy();
  });

  it('sets accessibilityHint when provided', () => {
    const { getByLabelText } = render(
      <IconButton {...defaultProps} accessibilityHint="Dismisses the modal" />,
    );
    expect(getByLabelText('Close dialog').props.accessibilityHint).toBe('Dismisses the modal');
  });

  it('does not fire onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<IconButton {...defaultProps} onPress={onPress} disabled />);
    fireEvent.press(getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('reports disabled accessibility state', () => {
    const { getByRole } = render(<IconButton {...defaultProps} disabled />);
    expect(getByRole('button').props.accessibilityState).toEqual({ disabled: true });
  });

  it('accepts a testID prop', () => {
    const { getByTestId } = render(<IconButton {...defaultProps} testID="icon-btn" />);
    expect(getByTestId('icon-btn')).toBeTruthy();
  });

  it('renders with custom icon', () => {
    const { getByText } = render(
      <IconButton {...defaultProps} icon={'search' as const} />,
    );
    expect(getByText('search')).toBeTruthy();
  });
});

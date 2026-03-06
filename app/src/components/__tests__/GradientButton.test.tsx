import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { GradientButton } from '../GradientButton';

describe('GradientButton', () => {
  const defaultProps = { title: 'Continue', onPress: jest.fn() };

  beforeEach(() => jest.clearAllMocks());

  it('renders the title text', () => {
    const { getByText } = render(<GradientButton {...defaultProps} />);
    expect(getByText('Continue')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(<GradientButton title="Go" onPress={onPress} />);
    fireEvent.press(getByText('Go'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('has accessibility role button', () => {
    const { getByRole } = render(<GradientButton {...defaultProps} />);
    expect(getByRole('button')).toBeTruthy();
  });

  it('sets accessibilityLabel to the title', () => {
    const { getByLabelText } = render(<GradientButton {...defaultProps} />);
    expect(getByLabelText('Continue')).toBeTruthy();
  });

  it('reports disabled state in accessibility', () => {
    const { getByRole } = render(<GradientButton {...defaultProps} disabled />);
    expect(getByRole('button').props.accessibilityState).toEqual({ disabled: true });
  });

  it('does not fire onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<GradientButton title="Go" onPress={onPress} disabled />);
    fireEvent.press(getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders children instead of title when children provided', () => {
    const { getByText, queryByText } = render(
      <GradientButton title="Hidden" onPress={jest.fn()}>
        <Text>Custom Content</Text>
      </GradientButton>,
    );
    expect(queryByText('Hidden')).toBeNull();
    expect(getByText('Custom Content')).toBeTruthy();
  });

  it('accepts a testID prop', () => {
    const { getByTestId } = render(<GradientButton {...defaultProps} testID="grad-btn" />);
    expect(getByTestId('grad-btn')).toBeTruthy();
  });
});

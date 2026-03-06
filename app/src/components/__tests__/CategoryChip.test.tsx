import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CategoryChip } from '../CategoryChip';

describe('CategoryChip', () => {
  const defaultProps = {
    label: 'Social',
    selected: false,
    onPress: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders the label text', () => {
    const { getByText } = render(<CategoryChip {...defaultProps} />);
    expect(getByText('Social')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(<CategoryChip {...defaultProps} onPress={onPress} />);
    fireEvent.press(getByText('Social'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('has accessibility role button', () => {
    const { getByRole } = render(<CategoryChip {...defaultProps} />);
    expect(getByRole('button')).toBeTruthy();
  });

  it('includes label in accessibility label when not selected', () => {
    const { getByLabelText } = render(<CategoryChip {...defaultProps} />);
    expect(getByLabelText('Social category')).toBeTruthy();
  });

  it('includes "selected" in accessibility label when selected', () => {
    const { getByLabelText } = render(<CategoryChip {...defaultProps} selected />);
    expect(getByLabelText('Social category, selected')).toBeTruthy();
  });

  it('sets accessibilityState.selected to true when selected', () => {
    const { getByRole } = render(<CategoryChip {...defaultProps} selected />);
    expect(getByRole('button').props.accessibilityState).toEqual({ selected: true });
  });

  it('sets accessibilityState.selected to false when not selected', () => {
    const { getByRole } = render(<CategoryChip {...defaultProps} selected={false} />);
    expect(getByRole('button').props.accessibilityState).toEqual({ selected: false });
  });

  it('renders different labels correctly', () => {
    const { getByText, rerender } = render(<CategoryChip {...defaultProps} label="Outdoor" />);
    expect(getByText('Outdoor')).toBeTruthy();
    rerender(<CategoryChip {...defaultProps} label="Learning" />);
    expect(getByText('Learning')).toBeTruthy();
  });
});

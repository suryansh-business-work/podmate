import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorState } from '../ErrorState';

jest.mock('../../../theme', () => ({
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, xxxxl: 48 },
  borderRadius: { sm: 8, md: 12, lg: 16, full: 999 },
}));

describe('ErrorState', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders default error message', () => {
    const { getByText } = render(<ErrorState />);
    expect(getByText('Something went wrong. Please try again.')).toBeTruthy();
  });

  it('renders custom error message', () => {
    const { getByText } = render(<ErrorState message="Network failed" />);
    expect(getByText('Network failed')).toBeTruthy();
  });

  it('renders "Oops!" title', () => {
    const { getByText } = render(<ErrorState />);
    expect(getByText('Oops!')).toBeTruthy();
  });

  it('renders retry button when onRetry is provided', () => {
    const { getByText } = render(<ErrorState onRetry={jest.fn()} />);
    expect(getByText('Retry')).toBeTruthy();
  });

  it('does not render retry button without onRetry', () => {
    const { queryByText } = render(<ErrorState />);
    expect(queryByText('Retry')).toBeNull();
  });

  it('calls onRetry when retry button is pressed', () => {
    const onRetry = jest.fn();
    const { getByText } = render(<ErrorState onRetry={onRetry} />);
    fireEvent.press(getByText('Retry'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('has accessibility role "alert"', () => {
    const { getByLabelText } = render(<ErrorState />);
    const el = getByLabelText('Something went wrong. Please try again.');
    expect(el.props.accessibilityRole).toBe('alert');
  });

  it('renders with testID', () => {
    const { getByTestId } = render(<ErrorState testID="error-view" />);
    expect(getByTestId('error-view')).toBeTruthy();
  });

  it('renders error-outline icon', () => {
    const { getByText } = render(<ErrorState />);
    expect(getByText('error-outline')).toBeTruthy();
  });
});

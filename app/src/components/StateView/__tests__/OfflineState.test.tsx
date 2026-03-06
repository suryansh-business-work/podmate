import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { OfflineState } from '../OfflineState';

jest.mock('../../../theme', () => ({
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, xxxxl: 48 },
  borderRadius: { sm: 8, md: 12, lg: 16, full: 999 },
}));

describe('OfflineState', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the offline title', () => {
    const { getByText } = render(<OfflineState />);
    expect(getByText("You're Offline")).toBeTruthy();
  });

  it('renders the offline description', () => {
    const { getByText } = render(<OfflineState />);
    expect(getByText('Check your internet connection and try again.')).toBeTruthy();
  });

  it('renders wifi-off icon', () => {
    const { getByText } = render(<OfflineState />);
    expect(getByText('wifi-off')).toBeTruthy();
  });

  it('renders retry button when onRetry is provided', () => {
    const { getByText } = render(<OfflineState onRetry={jest.fn()} />);
    expect(getByText('Retry')).toBeTruthy();
  });

  it('does not render retry button without onRetry', () => {
    const { queryByText } = render(<OfflineState />);
    expect(queryByText('Retry')).toBeNull();
  });

  it('calls onRetry when retry button is pressed', () => {
    const onRetry = jest.fn();
    const { getByText } = render(<OfflineState onRetry={onRetry} />);
    fireEvent.press(getByText('Retry'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('has accessibility role "alert"', () => {
    const { getByLabelText } = render(<OfflineState />);
    const el = getByLabelText('You are offline. Check your internet connection and try again.');
    expect(el.props.accessibilityRole).toBe('alert');
  });

  it('has proper accessibility label for screen readers', () => {
    const { getByLabelText } = render(<OfflineState />);
    expect(
      getByLabelText('You are offline. Check your internet connection and try again.'),
    ).toBeTruthy();
  });

  it('renders with testID', () => {
    const { getByTestId } = render(<OfflineState testID="offline" />);
    expect(getByTestId('offline')).toBeTruthy();
  });
});

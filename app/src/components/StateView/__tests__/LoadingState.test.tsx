import React from 'react';
import { render } from '@testing-library/react-native';
import { LoadingState } from '../LoadingState';

jest.mock('../../../theme', () => ({
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, xxxxl: 48 },
}));

describe('LoadingState', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    const { toJSON } = render(<LoadingState />);
    expect(toJSON()).toBeTruthy();
  });

  it('has accessibility label "Loading"', () => {
    const { getByLabelText } = render(<LoadingState />);
    expect(getByLabelText('Loading')).toBeTruthy();
  });

  it('defaults accessibility label to "Loading"', () => {
    const { getByLabelText } = render(<LoadingState />);
    expect(getByLabelText('Loading')).toBeTruthy();
  });

  it('shows custom message when provided', () => {
    const { getByText } = render(<LoadingState message="Fetching pods..." />);
    expect(getByText('Fetching pods...')).toBeTruthy();
  });

  it('uses message as accessibility label when provided', () => {
    const { getByLabelText } = render(<LoadingState message="Loading data" />);
    expect(getByLabelText('Loading data')).toBeTruthy();
  });

  it('does not show message text when not provided', () => {
    const { queryByText } = render(<LoadingState />);
    expect(queryByText('Fetching')).toBeNull();
  });

  it('renders with testID', () => {
    const { getByTestId } = render(<LoadingState testID="loader" />);
    expect(getByTestId('loader')).toBeTruthy();
  });
});

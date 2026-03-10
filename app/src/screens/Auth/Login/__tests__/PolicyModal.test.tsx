import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useQuery } from '@apollo/client';
import PolicyModal from '../PolicyModal';

describe('PolicyModal', () => {
  beforeEach(() => {
    (useQuery as jest.Mock).mockReturnValue({
      data: {
        policies: [
          { id: 'p1', title: 'Privacy Policy', content: 'Your data is safe...' },
          { id: 'p2', title: 'Usage Terms', content: 'By using this app...' },
        ],
      },
      loading: false,
      error: null,
    });
  });

  it('renders modal when policyType is provided', () => {
    const { getByTestId } = render(<PolicyModal policyType="USER" onClose={jest.fn()} />);
    expect(getByTestId('policy-modal')).toBeTruthy();
  });

  it('shows correct title for USER type', () => {
    const { getByText } = render(<PolicyModal policyType="USER" onClose={jest.fn()} />);
    expect(getByText('Terms of Service')).toBeTruthy();
  });

  it('shows correct title for VENUE type', () => {
    const { getByText } = render(<PolicyModal policyType="VENUE" onClose={jest.fn()} />);
    expect(getByText('Venue Policy')).toBeTruthy();
  });

  it('shows correct title for HOST type', () => {
    const { getByText } = render(<PolicyModal policyType="HOST" onClose={jest.fn()} />);
    expect(getByText('Host Policy')).toBeTruthy();
  });

  it('renders policy cards', () => {
    const { getByTestId, getByText } = render(
      <PolicyModal policyType="USER" onClose={jest.fn()} />,
    );
    expect(getByTestId('policy-card-p1')).toBeTruthy();
    expect(getByText('Privacy Policy')).toBeTruthy();
    expect(getByText('Your data is safe...')).toBeTruthy();
  });

  it('renders multiple policy cards', () => {
    const { getByTestId } = render(<PolicyModal policyType="USER" onClose={jest.fn()} />);
    expect(getByTestId('policy-card-p1')).toBeTruthy();
    expect(getByTestId('policy-card-p2')).toBeTruthy();
  });

  it('calls onClose when close button pressed', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(<PolicyModal policyType="USER" onClose={onClose} />);

    fireEvent.press(getByTestId('modal-close-button'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows loading indicator when data is loading', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    const { getByTestId } = render(<PolicyModal policyType="USER" onClose={jest.fn()} />);
    expect(getByTestId('policy-loading')).toBeTruthy();
  });

  it('shows empty state when no policies available', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: { policies: [] },
      loading: false,
      error: null,
    });

    const { getByTestId } = render(<PolicyModal policyType="USER" onClose={jest.fn()} />);
    expect(getByTestId('no-policy')).toBeTruthy();
  });

  it('does not render modal when policyType is null', () => {
    const { queryByTestId } = render(<PolicyModal policyType={null} onClose={jest.fn()} />);
    // Modal visible=false, so content shouldn't render
    expect(queryByTestId('policy-loading')).toBeNull();
  });
});

import React from 'react';
import { ActivityIndicator } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useQuery, useMutation } from '@apollo/client';
import CheckoutScreen from '../CheckoutScreen';

const mockPod = {
  id: 'pod1',
  title: 'Fun Meetup',
  description: 'A fun social meetup',
  category: 'Social',
  dateTime: new Date(Date.now() + 86400000).toISOString(),
  location: 'Delhi',
  imageUrl: 'https://example.com/pod.jpg',
  feePerPerson: 1200,
  maxSeats: 10,
  currentSeats: 1,
  host: { id: 'h1', name: 'Host Person', avatar: 'https://example.com/host.jpg' },
};

const mockCheckoutPod = jest.fn().mockResolvedValue({
  data: { checkoutPod: { success: true } },
});

describe('CheckoutScreen', () => {
  const defaultProps = {
    podId: 'pod1',
    onBack: jest.fn(),
    onSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useQuery as jest.Mock).mockReturnValue({
      data: { pod: mockPod },
      loading: false,
      error: null,
    });
    (useMutation as jest.Mock).mockReturnValue([
      mockCheckoutPod,
      { loading: false },
    ]);
  });

  it('renders header title', () => {
    const { getByText } = render(<CheckoutScreen {...defaultProps} />);
    expect(getByText('Checkout')).toBeTruthy();
  });

  it('calls onBack when back pressed', () => {
    const { getByText } = render(<CheckoutScreen {...defaultProps} />);
    fireEvent.press(getByText('arrow-back'));
    expect(defaultProps.onBack).toHaveBeenCalled();
  });

  it('shows loading state', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });
    (useMutation as jest.Mock).mockReturnValue([
      mockCheckoutPod,
      { loading: false },
    ]);
    const { UNSAFE_getByType } = render(<CheckoutScreen {...defaultProps} />);
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('renders pod title', () => {
    const { getByText } = render(<CheckoutScreen {...defaultProps} />);
    expect(getByText('Fun Meetup')).toBeTruthy();
  });

  it('renders simulated checkout info badge', () => {
    const { getByText } = render(<CheckoutScreen {...defaultProps} />);
    expect(getByText(/simulated checkout/i)).toBeTruthy();
  });

  it('renders pay button with amount', () => {
    const { getByText } = render(<CheckoutScreen {...defaultProps} />);
    expect(getByText(/Pay ₹/)).toBeTruthy();
  });

  it('calls checkout mutation on pay press', async () => {
    const { getByText } = render(<CheckoutScreen {...defaultProps} />);
    fireEvent.press(getByText(/Pay ₹/));
    await waitFor(() => {
      expect(mockCheckoutPod).toHaveBeenCalled();
    });
  });

  it('shows success view after checkout', async () => {
    const { getByText } = render(<CheckoutScreen {...defaultProps} />);
    fireEvent.press(getByText(/Pay ₹/));
    await waitFor(() => {
      expect(getByText("You're In!")).toBeTruthy();
    });
  });

  it('calls onSuccess from success view', async () => {
    const { getByText } = render(<CheckoutScreen {...defaultProps} />);
    fireEvent.press(getByText(/Pay ₹/));
    await waitFor(() => {
      fireEvent.press(getByText('Go Back'));
      expect(defaultProps.onSuccess).toHaveBeenCalled();
    });
  });
});

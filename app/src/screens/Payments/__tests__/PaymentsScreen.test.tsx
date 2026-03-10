import React from 'react';
import { ActivityIndicator } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { useQuery } from '@apollo/client';
import PaymentsScreen from '../PaymentsScreen';

const mockPayments = [
  {
    id: 'p1',
    type: 'CHECKOUT',
    amount: 1200,
    status: 'COMPLETED',
    createdAt: new Date().toISOString(),
    transactionId: 'TXN123',
    notes: 'Pod fee',
    podTitle: 'Test Pod',
  },
  {
    id: 'p2',
    type: 'REFUND',
    amount: 500,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    transactionId: 'TXN456',
    notes: null,
    podTitle: 'Other Pod',
  },
];

const mockRefetch = jest.fn();

describe('PaymentsScreen', () => {
  const defaultProps = { onBack: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (useQuery as jest.Mock).mockReturnValue({
      data: {
        myPayments: { items: mockPayments, total: 2, page: 1, totalPages: 1 },
      },
      loading: false,
      error: null,
      refetch: mockRefetch,
    });
  });

  it('renders header title', () => {
    const { getByText } = render(<PaymentsScreen {...defaultProps} />);
    expect(getByText('Payment History')).toBeTruthy();
  });

  it('calls onBack when back button pressed', () => {
    const { getByText } = render(<PaymentsScreen {...defaultProps} />);
    fireEvent.press(getByText('arrow-back'));
    expect(defaultProps.onBack).toHaveBeenCalled();
  });

  it('shows loading indicator', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: mockRefetch,
    });
    const { UNSAFE_getByType } = render(<PaymentsScreen {...defaultProps} />);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    expect(UNSAFE_getByType(ActivityIndicator as any)).toBeTruthy();
  });

  it('shows error state', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: false,
      error: new Error('Failed'),
      refetch: mockRefetch,
    });
    const { getByText } = render(<PaymentsScreen {...defaultProps} />);
    expect(getByText(/Failed to load/i)).toBeTruthy();
  });

  it('shows empty state when no payments', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: { myPayments: { items: [], total: 0, page: 1, totalPages: 1 } },
      loading: false,
      error: null,
      refetch: mockRefetch,
    });
    const { getByText } = render(<PaymentsScreen {...defaultProps} />);
    expect(getByText('No payments yet')).toBeTruthy();
  });

  it('renders payment cards with amounts', () => {
    const { getByText } = render(<PaymentsScreen {...defaultProps} />);
    expect(getByText(/₹1,?200/)).toBeTruthy();
  });

  it('renders transaction IDs', () => {
    const { getByText } = render(<PaymentsScreen {...defaultProps} />);
    expect(getByText(/TXN123/)).toBeTruthy();
  });
});

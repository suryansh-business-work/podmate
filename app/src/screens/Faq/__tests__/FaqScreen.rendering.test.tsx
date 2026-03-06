import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useQuery, useMutation } from '@apollo/client';
import FaqScreen from '../FaqScreen';

jest.mock('../TicketCard', () => {
  const mockReact = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ ticket }: { ticket: { subject: string } }) =>
      mockReact.createElement(Text, { testID: `ticket-${ticket.subject}` }, ticket.subject),
  };
});

const mockPolicies = [
  { id: 'pol1', title: 'Cancellation', content: 'Full refund within 24h', type: 'USER' },
];

const mockTickets = [
  { id: 't1', subject: 'Help me', message: 'Need help', status: 'OPEN', createdAt: new Date().toISOString() },
];

const mockCallbacks = [
  {
    id: 'cb1',
    reason: 'Support',
    phone: '+919999999999',
    preferredTime: 'Morning',
    status: 'PENDING',
    adminNote: null,
    createdAt: new Date().toISOString(),
  },
];

const mockRefetch = jest.fn();
const mockCreateTicket = jest.fn().mockResolvedValue({ data: {} });
const mockRequestCallback = jest.fn().mockResolvedValue({ data: {} });

function setupMocks(): void {
  (useQuery as jest.Mock).mockImplementation((_q, opts) => {
    const type = opts?.variables?.type;
    if (type === 'USER' || type === 'VENUE' || type === 'HOST') {
      return { data: { policies: mockPolicies }, loading: false };
    }
    const skip = opts?.skip;
    if (skip) return { data: null, loading: false, refetch: mockRefetch };
    return {
      data: {
        mySupportTickets: mockTickets,
        myCallbackRequests: mockCallbacks,
      },
      loading: false,
      refetch: mockRefetch,
    };
  });
  (useMutation as jest.Mock)
    .mockReturnValueOnce([mockCreateTicket, { loading: false }])
    .mockReturnValueOnce([mockRequestCallback, { loading: false }]);
}

describe('FaqScreen — rendering', () => {
  const defaultProps = { onBack: jest.fn(), initialTab: 'faq' as const };

  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  it('calls onBack when back pressed', () => {
    const { getByText } = render(<FaqScreen {...defaultProps} />);
    fireEvent.press(getByText('arrow-back'));
    expect(defaultProps.onBack).toHaveBeenCalled();
  });

  it('renders FAQ tab by default', () => {
    const { getByText } = render(<FaqScreen {...defaultProps} />);
    expect(getByText('FAQ')).toBeTruthy();
  });

  it('renders tab navigation items', () => {
    const { getByText } = render(<FaqScreen {...defaultProps} />);
    expect(getByText('FAQ')).toBeTruthy();
  });

  it('shows support tab content when selected', () => {
    const { getByText } = render(
      <FaqScreen {...defaultProps} initialTab="support" />,
    );
    expect(getByText(/Support Tickets/i)).toBeTruthy();
  });
});

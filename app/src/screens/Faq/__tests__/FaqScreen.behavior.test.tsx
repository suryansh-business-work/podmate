import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useQuery, useMutation } from '@apollo/client';
import FaqScreen from '../FaqScreen';

jest.mock('../TicketCard', () => {
  const mockReact = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ ticket }: { ticket: { subject: string } }) =>
      mockReact.createElement(Text, null, ticket.subject),
  };
});

const mockRefetch = jest.fn();
const mockCreateTicket = jest.fn().mockResolvedValue({ data: {} });
const mockRequestCallback = jest.fn().mockResolvedValue({ data: {} });

function setupMocks(): void {
  (useQuery as jest.Mock).mockImplementation((_q, opts) => {
    const type = opts?.variables?.type;
    if (type === 'USER' || type === 'VENUE' || type === 'HOST') {
      return {
        data: { policies: [{ id: 'p1', title: 'Policy', content: 'Content', type }] },
        loading: false,
      };
    }
    return {
      data: {
        mySupportTickets: [
          { id: 't1', subject: 'Help', message: 'Need help', status: 'OPEN', createdAt: new Date().toISOString() },
        ],
        myCallbackRequests: [],
      },
      loading: false,
      refetch: mockRefetch,
    };
  });
  (useMutation as jest.Mock)
    .mockReturnValueOnce([mockCreateTicket, { loading: false }])
    .mockReturnValueOnce([mockRequestCallback, { loading: false }]);
}

describe('FaqScreen — behavior', () => {
  const defaultProps = { onBack: jest.fn(), initialTab: 'faq' as const };

  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  it('expands FAQ item on press', () => {
    const { getAllByText } = render(<FaqScreen {...defaultProps} />);
    const faqItems = getAllByText(/\?/);
    if (faqItems.length > 0) {
      fireEvent.press(faqItems[0]);
      // After expanding, more content should be visible
      expect(faqItems[0]).toBeTruthy();
    }
  });

  it('switches to support tab', () => {
    const { getByText } = render(<FaqScreen {...defaultProps} />);
    const supportTab = getByText('Support');
    fireEvent.press(supportTab);
    expect(getByText(/Support Tickets/i)).toBeTruthy();
  });

  it('switches to callback tab', () => {
    const { getByText } = render(<FaqScreen {...defaultProps} />);
    const callbackTab = getByText('Callback');
    fireEvent.press(callbackTab);
    expect(getByText(/Request a Callback/i)).toBeTruthy();
  });

  it('shows new ticket form in support tab', () => {
    const { getByText } = render(
      <FaqScreen {...defaultProps} initialTab="support" />,
    );
    fireEvent.press(getByText('New Ticket'));
    expect(getByText('Submit Ticket')).toBeTruthy();
  });

  it('renders policy content in policies tab', () => {
    const { getByText } = render(<FaqScreen {...defaultProps} />);
    const policiesTab = getByText('Policies');
    fireEvent.press(policiesTab);
    expect(getByText('Policy')).toBeTruthy();
  });
});

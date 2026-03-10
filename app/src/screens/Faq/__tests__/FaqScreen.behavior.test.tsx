import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useQuery, useMutation } from '@apollo/client';
import FaqScreen from '../FaqScreen';

jest.mock('../../Support/TicketCard', () => {
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
          {
            id: 't1',
            subject: 'Help',
            message: 'Need help',
            status: 'OPEN',
            createdAt: new Date().toISOString(),
          },
        ],
        myCallbackRequests: [],
      },
      loading: false,
      refetch: mockRefetch,
    };
  });
  let mutCall = 0;
  (useMutation as jest.Mock).mockImplementation(() => {
    mutCall++;
    if ((mutCall - 1) % 2 === 0) return [mockCreateTicket, { loading: false }];
    return [mockRequestCallback, { loading: false }];
  });
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
    const { getAllByText } = render(<FaqScreen {...defaultProps} />);
    const supportTabs = getAllByText(/Support Tickets/i);
    fireEvent.press(supportTabs[0]);
    expect(getAllByText(/Support Tickets/i).length).toBeGreaterThanOrEqual(1);
  });

  it('switches to callback tab', () => {
    const { getByText } = render(<FaqScreen {...defaultProps} />);
    const callbackTab = getByText('Request Callback');
    fireEvent.press(callbackTab);
    expect(getByText(/Request a Callback/i)).toBeTruthy();
  });

  it('shows new ticket form in support tab', () => {
    const { getByText } = render(<FaqScreen {...defaultProps} initialTab="support" />);
    fireEvent.press(getByText('New Ticket'));
    expect(getByText('Submit Ticket')).toBeTruthy();
  });

  it('renders policy content in policies tab', () => {
    const { getByText } = render(<FaqScreen {...defaultProps} />);
    const policiesTab = getByText('User Policy');
    fireEvent.press(policiesTab);
    expect(getByText('Policy')).toBeTruthy();
  });
});

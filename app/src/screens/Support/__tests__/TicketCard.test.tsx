import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useMutation } from '@apollo/client';
import TicketCard from '../TicketCard';
import type { SupportTicket } from '../Support.types';

const makeTicket = (overrides: Partial<SupportTicket> = {}): SupportTicket => ({
  id: 't1',
  subject: 'Payment not processed',
  message: 'I paid but did not receive confirmation for my order.',
  status: 'OPEN',
  priority: 'HIGH',
  replies: [],
  createdAt: '2025-01-15T10:00:00Z',
  updatedAt: '2025-01-15T10:00:00Z',
  ...overrides,
});

describe('TicketCard', () => {
  const replyFn = jest.fn().mockResolvedValue({ data: {} });

  beforeEach(() => {
    jest.clearAllMocks();
    (useMutation as jest.Mock).mockReturnValue([replyFn, { loading: false }]);
  });

  it('renders ticket subject', () => {
    const { getByText } = render(<TicketCard ticket={makeTicket()} />);
    expect(getByText('Payment not processed')).toBeTruthy();
  });

  it('renders ticket message', () => {
    const { getByText } = render(<TicketCard ticket={makeTicket()} />);
    expect(getByText(/I paid but did not receive/)).toBeTruthy();
  });

  it('renders status badge', () => {
    const { getByText } = render(<TicketCard ticket={makeTicket()} />);
    expect(getByText('OPEN')).toBeTruthy();
  });

  it('renders IN_PROGRESS status with space', () => {
    const { getByText } = render(
      <TicketCard ticket={makeTicket({ status: 'IN_PROGRESS' })} />,
    );
    expect(getByText('IN PROGRESS')).toBeTruthy();
  });

  it('renders date', () => {
    const ticket = makeTicket();
    const expected = new Date(ticket.createdAt).toLocaleDateString();
    const { getByText } = render(<TicketCard ticket={ticket} />);
    expect(getByText(expected)).toBeTruthy();
  });

  it('shows reply count when collapsed and has replies', () => {
    const ticket = makeTicket({
      replies: [
        { id: 'rp1', senderRole: 'ADMIN', content: 'We are looking into it', createdAt: '2025-01-16T10:00:00Z' },
      ],
    });
    const { getByText } = render(<TicketCard ticket={ticket} />);
    expect(getByText('1 reply')).toBeTruthy();
  });

  it('shows plural replies text', () => {
    const ticket = makeTicket({
      replies: [
        { id: 'rp1', senderRole: 'ADMIN', content: 'Hi', createdAt: '2025-01-16T10:00:00Z' },
        { id: 'rp2', senderRole: 'USER', content: 'Thanks', createdAt: '2025-01-17T10:00:00Z' },
      ],
    });
    const { getByText } = render(<TicketCard ticket={ticket} />);
    expect(getByText('2 replies')).toBeTruthy();
  });

  it('expands on press and shows replies', () => {
    const ticket = makeTicket({
      replies: [
        { id: 'rp1', senderRole: 'ADMIN', content: 'We are on it', createdAt: '2025-01-16T10:00:00Z' },
      ],
    });
    const { getByText, queryByText } = render(<TicketCard ticket={ticket} />);
    // Not expanded yet
    expect(queryByText('We are on it')).toBeNull();
    // Expand
    fireEvent.press(getByText('Payment not processed'));
    expect(getByText('We are on it')).toBeTruthy();
    expect(getByText('Support Team')).toBeTruthy();
  });

  it('shows reply input when expanded and ticket not closed', () => {
    const { getByText, getByPlaceholderText } = render(
      <TicketCard ticket={makeTicket()} />,
    );
    fireEvent.press(getByText('Payment not processed'));
    expect(getByPlaceholderText('Type your reply...')).toBeTruthy();
  });

  it('hides reply input when ticket is CLOSED', () => {
    const { getByText, queryByPlaceholderText } = render(
      <TicketCard ticket={makeTicket({ status: 'CLOSED' })} />,
    );
    fireEvent.press(getByText('Payment not processed'));
    expect(queryByPlaceholderText('Type your reply...')).toBeNull();
  });

  it('hides reply input when ticket is RESOLVED', () => {
    const { getByText, queryByPlaceholderText } = render(
      <TicketCard ticket={makeTicket({ status: 'RESOLVED' })} />,
    );
    fireEvent.press(getByText('Payment not processed'));
    expect(queryByPlaceholderText('Type your reply...')).toBeNull();
  });

  it('calls reply mutation with text', async () => {
    const { getByText, getByPlaceholderText } = render(
      <TicketCard ticket={makeTicket()} />,
    );
    fireEvent.press(getByText('Payment not processed'));
    fireEvent.changeText(getByPlaceholderText('Type your reply...'), 'Hello');
    fireEvent.press(getByText('send'));
    await waitFor(() => {
      expect(replyFn).toHaveBeenCalledWith({
        variables: { ticketId: 't1', content: 'Hello' },
      });
    });
  });

  it('does not send empty reply', () => {
    const { getByText, getByPlaceholderText } = render(
      <TicketCard ticket={makeTicket()} />,
    );
    fireEvent.press(getByText('Payment not processed'));
    fireEvent.changeText(getByPlaceholderText('Type your reply...'), '   ');
    fireEvent.press(getByText('send'));
    expect(replyFn).not.toHaveBeenCalled();
  });

  it('shows USER reply bubble as "You"', () => {
    const ticket = makeTicket({
      replies: [
        { id: 'rp1', senderRole: 'USER', content: 'My reply', createdAt: '2025-01-16T10:00:00Z' },
      ],
    });
    const { getByText } = render(<TicketCard ticket={ticket} />);
    fireEvent.press(getByText('Payment not processed'));
    expect(getByText('You')).toBeTruthy();
    expect(getByText('My reply')).toBeTruthy();
  });
});

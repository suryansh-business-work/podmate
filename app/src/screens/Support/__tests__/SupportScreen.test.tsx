import React from 'react';
import { ActivityIndicator } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useQuery, useMutation } from '@apollo/client';
import SupportScreen from '../SupportScreen';

jest.mock('../TicketForm', () => {
  const mockReact = require('react');
  const { View, TouchableOpacity, Text } = require('react-native');
  return function MockTicketForm({
    onSubmit,
    creating,
  }: {
    onSubmit: (v: { subject: string; message: string }) => void;
    creating: boolean;
  }) {
    return mockReact.createElement(
      View,
      { testID: 'ticket-form' },
      mockReact.createElement(
        TouchableOpacity,
        { onPress: () => onSubmit({ subject: 'Test', message: 'Help' }), testID: 'submit-ticket' },
        mockReact.createElement(Text, null, creating ? 'Creating...' : 'Submit'),
      ),
    );
  };
});

jest.mock('../TicketCard', () => {
  const mockReact = require('react');
  const { Text } = require('react-native');
  return function MockTicketCard({ ticket }: { ticket: { subject: string } }) {
    return mockReact.createElement(Text, null, ticket.subject);
  };
});

const mockRefetch = jest.fn();
const mockCreateTicket = jest.fn().mockResolvedValue({ data: {} });

describe('SupportScreen', () => {
  const defaultProps = { onBack: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });
    (useMutation as jest.Mock).mockReturnValue([mockCreateTicket, { loading: false }]);
  });

  it('renders header title', () => {
    const { getByText } = render(<SupportScreen {...defaultProps} />);
    expect(getByText('Support')).toBeTruthy();
  });

  it('calls onBack when back is pressed', () => {
    const { getByText } = render(<SupportScreen {...defaultProps} />);
    fireEvent.press(getByText('arrow-back'));
    expect(defaultProps.onBack).toHaveBeenCalled();
  });

  it('shows loading indicator when loading with no data', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: mockRefetch,
    });
    const { UNSAFE_getByType } = render(<SupportScreen {...defaultProps} />);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    expect(UNSAFE_getByType(ActivityIndicator as any)).toBeTruthy();
  });

  it('shows empty state when no tickets', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: { mySupportTickets: [] },
      loading: false,
      error: null,
      refetch: mockRefetch,
    });
    const { getByText } = render(<SupportScreen {...defaultProps} />);
    expect(getByText('No tickets yet')).toBeTruthy();
  });

  it('renders ticket cards when data exists', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: {
        mySupportTickets: [
          {
            id: '1',
            subject: 'Bug Report',
            message: 'Crash',
            status: 'OPEN',
            createdAt: new Date().toISOString(),
          },
        ],
      },
      loading: false,
      error: null,
      refetch: mockRefetch,
    });
    const { getByText } = render(<SupportScreen {...defaultProps} />);
    expect(getByText('Bug Report')).toBeTruthy();
  });

  it('toggles ticket form visibility on FAB press', () => {
    const { getByText, queryByTestId } = render(<SupportScreen {...defaultProps} />);
    expect(queryByTestId('ticket-form')).toBeNull();
    fireEvent.press(getByText('add'));
    expect(queryByTestId('ticket-form')).toBeTruthy();
  });

  it('creates ticket on form submit', async () => {
    const { getByText, getByTestId } = render(<SupportScreen {...defaultProps} />);
    fireEvent.press(getByText('add'));
    fireEvent.press(getByTestId('submit-ticket'));
    await waitFor(() => {
      expect(mockCreateTicket).toHaveBeenCalled();
    });
  });
});

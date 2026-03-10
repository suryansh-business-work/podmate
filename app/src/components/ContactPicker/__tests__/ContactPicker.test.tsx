import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useMutation } from '@apollo/client';
import { Alert } from 'react-native';
import ContactPicker from '../ContactPicker';

// Mock useDeviceContacts
const mockRefresh = jest.fn();
jest.mock('../useDeviceContacts', () => ({
  useDeviceContacts: () => ({
    contacts: [
      { id: '1', name: 'Alice Smith', phone: '+919876543210' },
      { id: '2', name: 'Bob Kumar', phone: '+919876543211' },
      { id: '3', name: 'Charlie Verma', phone: '+919876543212' },
    ],
    loading: false,
    permissionDenied: false,
    refresh: mockRefresh,
  }),
}));

describe('ContactPicker', () => {
  const defaultProps = {
    podId: 'pod-123',
    podTitle: 'Sushi Masterclass',
    onDone: jest.fn(),
    onSkip: jest.fn(),
  };

  const mockSendInvites = jest.fn().mockResolvedValue({});

  beforeEach(() => {
    jest.clearAllMocks();
    (useMutation as jest.Mock).mockReturnValue([
      mockSendInvites,
      { loading: false },
    ]);
  });

  it('renders Invite Friends header', () => {
    const { getByText } = render(<ContactPicker {...defaultProps} />);
    expect(getByText('Invite Friends')).toBeTruthy();
  });

  it('renders pod title', () => {
    const { getByText } = render(<ContactPicker {...defaultProps} />);
    expect(getByText(/Sushi Masterclass/)).toBeTruthy();
  });

  it('renders all contacts from device', () => {
    const { getByText } = render(<ContactPicker {...defaultProps} />);
    expect(getByText('Alice Smith')).toBeTruthy();
    expect(getByText('Bob Kumar')).toBeTruthy();
    expect(getByText('Charlie Verma')).toBeTruthy();
  });

  it('renders phone numbers', () => {
    const { getByText } = render(<ContactPicker {...defaultProps} />);
    expect(getByText('+919876543210')).toBeTruthy();
  });

  it('toggles contact selection on press', () => {
    const { getByText } = render(<ContactPicker {...defaultProps} />);

    fireEvent.press(getByText('Alice Smith'));
    expect(getByText('1 contact selected')).toBeTruthy();

    fireEvent.press(getByText('Bob Kumar'));
    expect(getByText('2 contacts selected')).toBeTruthy();
  });

  it('deselects a contact when pressed again', () => {
    const { getByText, queryByText } = render(<ContactPicker {...defaultProps} />);

    fireEvent.press(getByText('Alice Smith'));
    expect(getByText('1 contact selected')).toBeTruthy();

    fireEvent.press(getByText('Alice Smith'));
    expect(queryByText('1 contact selected')).toBeNull();
  });

  it('filters contacts by search query', () => {
    const { getByPlaceholderText, queryByText } = render(
      <ContactPicker {...defaultProps} />,
    );

    const searchInput = getByPlaceholderText('Search contacts...');
    fireEvent.changeText(searchInput, 'Alice');

    expect(queryByText('Alice Smith')).toBeTruthy();
    expect(queryByText('Bob Kumar')).toBeNull();
    expect(queryByText('Charlie Verma')).toBeNull();
  });

  it('filters contacts by phone number', () => {
    const { getByPlaceholderText, queryByText } = render(
      <ContactPicker {...defaultProps} />,
    );

    const searchInput = getByPlaceholderText('Search contacts...');
    fireEvent.changeText(searchInput, '3211');

    expect(queryByText('Alice Smith')).toBeNull();
    expect(queryByText('Bob Kumar')).toBeTruthy();
  });

  it('calls onSkip when Skip is pressed', () => {
    const onSkip = jest.fn();
    const { getAllByText } = render(
      <ContactPicker {...defaultProps} onSkip={onSkip} />,
    );

    // Skip text appears in header
    const skipButtons = getAllByText('Skip');
    fireEvent.press(skipButtons[0]);

    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it('shows send button with correct count when contacts selected', () => {
    const { getByText } = render(<ContactPicker {...defaultProps} />);

    fireEvent.press(getByText('Alice Smith'));
    fireEvent.press(getByText('Bob Kumar'));

    expect(getByText('Send 2 Invites')).toBeTruthy();
  });

  it('hides send button when no contacts are selected', () => {
    const { queryByText } = render(<ContactPicker {...defaultProps} />);
    expect(queryByText(/Send.*Invite/)).toBeNull();
  });

  it('renders contact initials as avatar', () => {
    const { getByText } = render(<ContactPicker {...defaultProps} />);
    expect(getByText('A')).toBeTruthy();
    expect(getByText('B')).toBeTruthy();
    expect(getByText('C')).toBeTruthy();
  });

  it('clears search when close icon pressed', () => {
    const { getByPlaceholderText, getAllByText, getByText } = render(
      <ContactPicker {...defaultProps} />,
    );

    const searchInput = getByPlaceholderText('Search contacts...');
    fireEvent.changeText(searchInput, 'Alice');

    // There are multiple 'close' texts: header close and search clear icon.
    // The search clear icon is the last one rendered.
    const closeIcons = getAllByText('close');
    const searchClearIcon = closeIcons[closeIcons.length - 1];
    fireEvent.press(searchClearIcon);
    expect(getByText('Bob Kumar')).toBeTruthy();
  });
});

import React from 'react';
import { ActivityIndicator } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { useQuery, useMutation } from '@apollo/client';
import NotificationsScreen from '../NotificationsScreen';

const mockNotifications = [
  {
    id: 'n1',
    title: 'New message',
    body: 'John sent you a message',
    type: 'CHAT',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'n2',
    title: 'Pod joined',
    body: 'Welcome to Tech Meetup',
    type: 'POD',
    isRead: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const mockRefetch = jest.fn();
const mockMarkRead = jest.fn().mockResolvedValue({});
const mockMarkAllRead = jest.fn().mockResolvedValue({});

describe('NotificationsScreen', () => {
  const defaultProps = { onBack: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (useQuery as jest.Mock).mockReturnValue({
      data: {
        notifications: {
          items: mockNotifications,
          total: 2,
          page: 1,
          totalPages: 1,
        },
      },
      loading: false,
      error: null,
      refetch: mockRefetch,
    });
    let mutCall = 0;
    (useMutation as jest.Mock).mockImplementation(() => {
      mutCall++;
      return (mutCall - 1) % 2 === 0
        ? [mockMarkRead]
        : [mockMarkAllRead];
    });
  });

  it('renders header title', () => {
    const { getByText } = render(
      <NotificationsScreen {...defaultProps} />,
    );
    expect(getByText('Notifications')).toBeTruthy();
  });

  it('calls onBack when back pressed', () => {
    const { getByText } = render(
      <NotificationsScreen {...defaultProps} />,
    );
    fireEvent.press(getByText('arrow-back'));
    expect(defaultProps.onBack).toHaveBeenCalled();
  });

  it('shows loading indicator', () => {
    (useQuery as jest.Mock).mockReset().mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: mockRefetch,
    });
    let mutCall = 0;
    (useMutation as jest.Mock).mockReset().mockImplementation(() => {
      mutCall++;
      return (mutCall - 1) % 2 === 0 ? [mockMarkRead] : [mockMarkAllRead];
    });
    const { UNSAFE_getByType } = render(
      <NotificationsScreen {...defaultProps} />,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    expect(UNSAFE_getByType(ActivityIndicator as any)).toBeTruthy();
  });

  it('shows error state', () => {
    (useQuery as jest.Mock).mockReset().mockReturnValue({
      data: null,
      loading: false,
      error: new Error('Fail'),
      refetch: mockRefetch,
    });
    let mutCall = 0;
    (useMutation as jest.Mock).mockReset().mockImplementation(() => {
      mutCall++;
      return (mutCall - 1) % 2 === 0 ? [mockMarkRead] : [mockMarkAllRead];
    });
    const { getByText } = render(
      <NotificationsScreen {...defaultProps} />,
    );
    expect(getByText(/Failed to load/i)).toBeTruthy();
  });

  it('shows empty state when no notifications', () => {
    (useQuery as jest.Mock).mockReset().mockReturnValue({
      data: { notifications: { items: [], total: 0, page: 1, totalPages: 1 } },
      loading: false,
      error: null,
      refetch: mockRefetch,
    });
    let mutCall2 = 0;
    (useMutation as jest.Mock).mockReset().mockImplementation(() => {
      mutCall2++;
      return (mutCall2 - 1) % 2 === 0 ? [mockMarkRead] : [mockMarkAllRead];
    });
    const { getByText } = render(
      <NotificationsScreen {...defaultProps} />,
    );
    expect(getByText('No notifications')).toBeTruthy();
  });

  it('renders notification items', () => {
    const { getByText } = render(
      <NotificationsScreen {...defaultProps} />,
    );
    expect(getByText('New message')).toBeTruthy();
    expect(getByText('Pod joined')).toBeTruthy();
  });

  it('shows unread count banner', () => {
    const { getByText } = render(
      <NotificationsScreen {...defaultProps} />,
    );
    expect(getByText(/1 unread notification/i)).toBeTruthy();
  });

  it('shows mark all read button when unread exist', () => {
    const { getByText } = render(
      <NotificationsScreen {...defaultProps} />,
    );
    expect(getByText(/Mark all read/i)).toBeTruthy();
  });
});

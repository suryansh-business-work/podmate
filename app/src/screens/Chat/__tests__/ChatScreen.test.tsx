import React from 'react';
import { ActivityIndicator } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { useQuery } from '@apollo/client';
import ChatScreen from '../ChatScreen';

jest.mock('../ChatRoom', () => {
  const mockReact = require('react');
  const { View, Text } = require('react-native');
  return function MockChatRoom({ pod, onBack }: { pod: { title: string }; onBack: () => void }) {
    return mockReact.createElement(
      View,
      { testID: 'chat-room' },
      mockReact.createElement(Text, null, pod.title),
      mockReact.createElement(
        require('react-native').TouchableOpacity,
        { onPress: onBack, testID: 'chat-back' },
        mockReact.createElement(Text, null, 'Back'),
      ),
    );
  };
});

const mockRefetch = jest.fn();
const mockPods = [
  {
    id: '1',
    title: 'Social Pod',
    imageUrl: 'https://example.com/pod.jpg',
    lastMessage: 'Hey!',
    date: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Tech Meetup',
    imageUrl: null,
    lastMessage: null,
    date: new Date().toISOString(),
  },
];

describe('ChatScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useQuery as jest.Mock).mockReturnValue({
      data: { myPods: mockPods },
      loading: false,
      error: null,
      refetch: mockRefetch,
    });
  });

  it('renders header with Messages title', () => {
    const { getByText } = render(<ChatScreen />);
    expect(getByText('Messages')).toBeTruthy();
  });

  it('shows loading indicator', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: mockRefetch,
    });
    const { UNSAFE_getByType } = render(<ChatScreen />);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    expect(UNSAFE_getByType(ActivityIndicator as any)).toBeTruthy();
  });

  it('shows error state', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: false,
      error: new Error('Oops'),
      refetch: mockRefetch,
    });
    const { getByText } = render(<ChatScreen />);
    expect(getByText('Failed to load chats')).toBeTruthy();
  });

  it('shows empty state when no pods', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: { myPods: [] },
      loading: false,
      error: null,
      refetch: mockRefetch,
    });
    const { getByText } = render(<ChatScreen />);
    expect(getByText('No conversations yet')).toBeTruthy();
  });

  it('renders pod list', () => {
    const { getByText } = render(<ChatScreen />);
    expect(getByText('Social Pod')).toBeTruthy();
    expect(getByText('Tech Meetup')).toBeTruthy();
  });

  it('opens chat room on pod selection', () => {
    const { getByText, getByTestId } = render(<ChatScreen />);
    fireEvent.press(getByText('Social Pod'));
    expect(getByTestId('chat-room')).toBeTruthy();
  });

  it('returns to pod list from chat room', () => {
    const { getByText, getByTestId, queryByTestId } = render(<ChatScreen />);
    fireEvent.press(getByText('Social Pod'));
    expect(getByTestId('chat-room')).toBeTruthy();
    fireEvent.press(getByTestId('chat-back'));
    expect(queryByTestId('chat-room')).toBeNull();
  });
});

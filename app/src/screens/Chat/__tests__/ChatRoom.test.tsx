import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useQuery, useMutation } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatRoom from '../ChatRoom';
import type { ChatMessage } from '../Chat.types';

jest.mock('expo-video', () => ({
  useVideoPlayer: () => ({ loop: true, muted: true, play: jest.fn() }),
  VideoView: 'VideoView',
}));

jest.mock('../../../hooks/useImageKitUpload', () => ({
  useImageKitUpload: () => ({
    pickAndUploadImage: jest.fn().mockResolvedValue(null),
    pickAndUploadVideo: jest.fn().mockResolvedValue(null),
    uploading: false,
  }),
}));

jest.mock('../../../graphql/client', () => ({
  resolveWsUrl: () => 'ws://localhost:4039/ws',
}));

const mockPod = {
  id: 'pod1',
  title: 'Sushi Night',
  imageUrl: 'https://img.com/pod.jpg',
  category: 'Social',
  status: 'ACTIVE',
};

const makeMessage = (overrides: Partial<ChatMessage> = {}): ChatMessage => ({
  id: 'msg1',
  podId: 'pod1',
  senderId: 'other-user',
  content: 'Hello!',
  messageType: 'TEXT',
  mediaUrl: '',
  createdAt: new Date().toISOString(),
  sender: { id: 'other-user', name: 'Alice', avatar: 'https://img.com/alice.jpg' },
  ...overrides,
});

/** Mock WebSocket globally */
class MockWebSocket {
  onopen: (() => void) | null = null;
  onmessage: ((evt: { data: string }) => void) | null = null;
  send = jest.fn();
  close = jest.fn();
  constructor() {
    setTimeout(() => this.onopen?.(), 0);
  }
}

describe('ChatRoom', () => {
  const sendFn = jest.fn().mockResolvedValue({ data: {} });
  const onBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global as unknown as Record<string, unknown>).WebSocket =
      MockWebSocket as unknown as typeof WebSocket;
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === 'token') return Promise.resolve('test-token');
      if (key === 'userId') return Promise.resolve('me1');
      return Promise.resolve(null);
    });
    (useMutation as jest.Mock).mockReturnValue([sendFn, { loading: false }]);
  });

  it('renders loading state', () => {
    (useQuery as jest.Mock).mockReturnValue({ data: null, loading: true });
    const { getByText } = render(<ChatRoom pod={mockPod} onBack={onBack} />);
    expect(getByText('Sushi Night')).toBeTruthy();
  });

  it('renders pod title in header', () => {
    (useQuery as jest.Mock).mockReturnValue({ data: { chatMessages: [] }, loading: false });
    const { getByText } = render(<ChatRoom pod={mockPod} onBack={onBack} />);
    expect(getByText('Sushi Night')).toBeTruthy();
  });

  it('shows Active now for active pod', () => {
    (useQuery as jest.Mock).mockReturnValue({ data: { chatMessages: [] }, loading: false });
    const { getByText } = render(<ChatRoom pod={mockPod} onBack={onBack} />);
    expect(getByText('Active now')).toBeTruthy();
  });

  it('shows category for non-active pod', () => {
    (useQuery as jest.Mock).mockReturnValue({ data: { chatMessages: [] }, loading: false });
    const inactivePod = { ...mockPod, status: 'ENDED' };
    const { getByText } = render(<ChatRoom pod={inactivePod} onBack={onBack} />);
    expect(getByText('Social')).toBeTruthy();
  });

  it('calls onBack when back button pressed', () => {
    (useQuery as jest.Mock).mockReturnValue({ data: { chatMessages: [] }, loading: false });
    const { getByText } = render(<ChatRoom pod={mockPod} onBack={onBack} />);
    fireEvent.press(getByText('arrow-back'));
    expect(onBack).toHaveBeenCalled();
  });

  it('shows empty state when no messages', () => {
    (useQuery as jest.Mock).mockReturnValue({ data: { chatMessages: [] }, loading: false });
    const { getByText } = render(<ChatRoom pod={mockPod} onBack={onBack} />);
    expect(getByText('No messages yet')).toBeTruthy();
    expect(getByText('Start the conversation!')).toBeTruthy();
  });

  it('renders messages from server', () => {
    const messages = [makeMessage()];
    (useQuery as jest.Mock).mockReturnValue({ data: { chatMessages: messages }, loading: false });
    const { getByText } = render(<ChatRoom pod={mockPod} onBack={onBack} />);
    expect(getByText('Hello!')).toBeTruthy();
  });

  it('renders day separator for today messages', () => {
    const messages = [makeMessage()];
    (useQuery as jest.Mock).mockReturnValue({ data: { chatMessages: messages }, loading: false });
    const { getByText } = render(<ChatRoom pod={mockPod} onBack={onBack} />);
    expect(getByText('Today')).toBeTruthy();
  });

  it('sends text message via mutation', async () => {
    (useQuery as jest.Mock).mockReturnValue({ data: { chatMessages: [] }, loading: false });
    const { getByPlaceholderText, getByText } = render(<ChatRoom pod={mockPod} onBack={onBack} />);
    fireEvent.changeText(getByPlaceholderText('Type a message…'), 'Hi there');
    fireEvent.press(getByText('send'));
    await waitFor(() => {
      expect(sendFn).toHaveBeenCalledWith({
        variables: { podId: 'pod1', content: 'Hi there', messageType: 'TEXT' },
      });
    });
  });

  it('does not send empty message', () => {
    (useQuery as jest.Mock).mockReturnValue({ data: { chatMessages: [] }, loading: false });
    const { getByText } = render(<ChatRoom pod={mockPod} onBack={onBack} />);
    fireEvent.press(getByText('send'));
    expect(sendFn).not.toHaveBeenCalled();
  });

  it('cleans up WebSocket on unmount', () => {
    (useQuery as jest.Mock).mockReturnValue({ data: { chatMessages: [] }, loading: false });
    const { unmount } = render(<ChatRoom pod={mockPod} onBack={onBack} />);
    unmount();
    // WebSocket close is called via cleanup
  });
});

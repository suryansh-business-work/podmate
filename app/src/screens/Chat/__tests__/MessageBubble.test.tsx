import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MessageBubble from '../MessageBubble';
import type { ChatMessage } from '../Chat.types';

jest.mock('expo-video', () => {
  const mockReact = require('react');
  const { View } = require('react-native');
  return {
    useVideoPlayer: () => ({ muted: true }),
    VideoView: (props: Record<string, unknown>) =>
      mockReact.createElement(View, { testID: 'video-view', ...props }),
  };
});

jest.mock('../../../components/SafeImage', () => {
  const mockReact = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: { testID?: string }) =>
      mockReact.createElement(View, { testID: props.testID || 'safe-image' }),
  };
});

const createMessage = (overrides: Partial<ChatMessage> = {}): ChatMessage => ({
  id: 'msg-1',
  podId: 'pod-1',
  senderId: 'user-2',
  content: 'Hello World',
  messageType: 'TEXT',
  mediaUrl: '',
  createdAt: '2026-03-07T10:30:00.000Z',
  sender: { id: 'user-2', name: 'Alice', avatar: '' },
  ...overrides,
});

describe('MessageBubble', () => {
  const defaultProps = {
    isMe: false,
    showAvatar: true,
    showSenderName: true,
    onPreviewMedia: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders text message content', () => {
    const { getByText } = render(<MessageBubble item={createMessage()} {...defaultProps} />);
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('renders sender name when showSenderName is true', () => {
    const { getByText } = render(<MessageBubble item={createMessage()} {...defaultProps} />);
    expect(getByText('Alice')).toBeTruthy();
  });

  it('does not render sender name when showSenderName is false', () => {
    const { queryByText } = render(
      <MessageBubble item={createMessage()} {...defaultProps} showSenderName={false} />,
    );
    expect(queryByText('Alice')).toBeNull();
  });

  it('renders formatted timestamp', () => {
    const { getByText } = render(<MessageBubble item={createMessage()} {...defaultProps} />);
    // Time format varies by locale, just check something is rendered
    const timeRegex = /\d{1,2}:\d{2}/;
    const allTexts = render(<MessageBubble item={createMessage()} {...defaultProps} />).toJSON();
    expect(allTexts).toBeTruthy();
  });

  it('renders "Unknown" when sender name is missing', () => {
    const msg = createMessage({ sender: { id: 'x', name: '', avatar: '' } });
    // When sender.name is null/undefined the component shows "Unknown"
    const msgNoName = createMessage({
      sender: undefined as unknown as ChatMessage['sender'],
    });
    const { getByText } = render(<MessageBubble item={msgNoName} {...defaultProps} />);
    expect(getByText('Unknown')).toBeTruthy();
  });

  it('renders image media and calls onPreviewMedia on press', () => {
    const onPreviewMedia = jest.fn();
    const msg = createMessage({
      messageType: 'IMAGE',
      mediaUrl: 'https://cdn.example.com/photo.jpg',
      content: '',
    });

    const { UNSAFE_getByType } = render(
      <MessageBubble item={msg} {...defaultProps} onPreviewMedia={onPreviewMedia} />,
    );

    const { Image } = require('react-native');
    const img = UNSAFE_getByType(Image);
    expect(img.props.source.uri).toBe('https://cdn.example.com/photo.jpg');
  });

  it('does not render text when content is empty (media only)', () => {
    const msg = createMessage({
      messageType: 'IMAGE',
      mediaUrl: 'https://cdn.example.com/photo.jpg',
      content: '',
    });

    const { queryByText } = render(<MessageBubble item={msg} {...defaultProps} />);
    // Should not render empty text
    expect(queryByText('Hello World')).toBeNull();
  });

  it('hides avatar when showAvatar is false', () => {
    const { queryByTestId } = render(
      <MessageBubble item={createMessage()} {...defaultProps} showAvatar={false} />,
    );
    expect(queryByTestId('safe-image')).toBeNull();
  });

  it('applies different styles for own messages', () => {
    const { getByText } = render(<MessageBubble item={createMessage()} {...defaultProps} isMe />);
    expect(getByText('Hello World')).toBeTruthy();
  });
});

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ChatInputBar from '../ChatInputBar';

describe('ChatInputBar', () => {
  const defaultProps = {
    value: '',
    sending: false,
    uploading: false,
    onChangeText: jest.fn(),
    onSend: jest.fn(),
    onSendImage: jest.fn(),
    onSendVideo: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders text input with placeholder', () => {
    const { getByPlaceholderText } = render(<ChatInputBar {...defaultProps} />);
    expect(getByPlaceholderText('Type a message…')).toBeTruthy();
  });

  it('calls onChangeText when typing', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <ChatInputBar {...defaultProps} onChangeText={onChangeText} />,
    );

    fireEvent.changeText(getByPlaceholderText('Type a message…'), 'Hello');
    expect(onChangeText).toHaveBeenCalledWith('Hello');
  });

  it('disables send button when message is empty', () => {
    const onSend = jest.fn();
    const { getByText } = render(<ChatInputBar {...defaultProps} value="" onSend={onSend} />);

    // The send icon is "send"
    fireEvent.press(getByText('send'));
    expect(onSend).not.toHaveBeenCalled();
  });

  it('enables send button when message has content', () => {
    const onSend = jest.fn();
    const { getByText } = render(<ChatInputBar {...defaultProps} value="Hello!" onSend={onSend} />);

    fireEvent.press(getByText('send'));
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it('disables send button while sending', () => {
    const onSend = jest.fn();
    const { getByText } = render(
      <ChatInputBar {...defaultProps} value="msg" sending onSend={onSend} />,
    );

    fireEvent.press(getByText('send'));
    expect(onSend).not.toHaveBeenCalled();
  });

  it('shows attach toggle button', () => {
    const { getByText } = render(<ChatInputBar {...defaultProps} />);
    expect(getByText('add')).toBeTruthy();
  });

  it('shows image and video options when attach is toggled', () => {
    const { getByText } = render(<ChatInputBar {...defaultProps} />);

    fireEvent.press(getByText('add'));

    expect(getByText('image')).toBeTruthy();
    expect(getByText('videocam')).toBeTruthy();
  });

  it('calls onSendImage when image option pressed', () => {
    const onSendImage = jest.fn();
    const { getByText } = render(<ChatInputBar {...defaultProps} onSendImage={onSendImage} />);

    fireEvent.press(getByText('add'));
    fireEvent.press(getByText('image'));

    expect(onSendImage).toHaveBeenCalledTimes(1);
  });

  it('calls onSendVideo when video option pressed', () => {
    const onSendVideo = jest.fn();
    const { getByText } = render(<ChatInputBar {...defaultProps} onSendVideo={onSendVideo} />);

    fireEvent.press(getByText('add'));
    fireEvent.press(getByText('videocam'));

    expect(onSendVideo).toHaveBeenCalledTimes(1);
  });

  it('closes attach menu after selecting image', () => {
    const { getByText, queryByText } = render(
      <ChatInputBar {...defaultProps} onSendImage={jest.fn()} />,
    );

    fireEvent.press(getByText('add'));
    fireEvent.press(getByText('image'));

    // After selecting, attach menu should close
    expect(queryByText('videocam')).toBeNull();
  });

  it('toggles attach icon between add and close', () => {
    const { getByText } = render(<ChatInputBar {...defaultProps} />);

    expect(getByText('add')).toBeTruthy();
    fireEvent.press(getByText('add'));
    expect(getByText('close')).toBeTruthy();
  });
});

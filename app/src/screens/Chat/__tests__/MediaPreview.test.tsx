import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MediaPreview from '../MediaPreview';

jest.mock('expo-video', () => {
  const mockReact = require('react');
  const { View } = require('react-native');
  return {
    useVideoPlayer: () => ({
      play: jest.fn(),
      pause: jest.fn(),
    }),
    VideoView: ({ testID, ...props }: { testID?: string }) =>
      mockReact.createElement(View, { testID: testID || 'video-view', ...props }),
  };
});

describe('MediaPreview', () => {
  const defaultProps = {
    visible: true,
    uri: 'https://cdn.example.com/image.jpg',
    type: 'IMAGE' as const,
    onClose: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders image when type is IMAGE', () => {
    const { UNSAFE_getByType } = render(<MediaPreview {...defaultProps} />);
    const { Image } = require('react-native');
    const img = UNSAFE_getByType(Image);
    expect(img.props.source.uri).toBe('https://cdn.example.com/image.jpg');
  });

  it('renders video view when type is VIDEO', () => {
    const { getByTestId } = render(
      <MediaPreview
        {...defaultProps}
        type="VIDEO"
        uri="https://cdn.example.com/video.mp4"
      />,
    );
    expect(getByTestId('video-view')).toBeTruthy();
  });

  it('calls onClose when close button pressed', () => {
    const onClose = jest.fn();
    const { getByText } = render(
      <MediaPreview {...defaultProps} onClose={onClose} />,
    );

    fireEvent.press(getByText('close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders as modal', () => {
    const { UNSAFE_getByType } = render(<MediaPreview {...defaultProps} />);
    const { Modal } = require('react-native');
    const modal = UNSAFE_getByType(Modal);
    expect(modal.props.visible).toBe(true);
    expect(modal.props.transparent).toBe(true);
  });

  it('does not render content when not visible', () => {
    const { UNSAFE_getByType } = render(
      <MediaPreview {...defaultProps} visible={false} />,
    );
    const { Modal } = require('react-native');
    const modal = UNSAFE_getByType(Modal);
    expect(modal.props.visible).toBe(false);
  });
});

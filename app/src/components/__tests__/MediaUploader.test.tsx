import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MediaUploader from '../MediaUploader';
import type { MediaItem } from '../MediaUploader';

// Mock useImageKitUpload
const mockPickImage = jest.fn();
const mockPickVideo = jest.fn();

jest.mock('../../hooks/useImageKitUpload', () => ({
  useImageKitUpload: () => ({
    pickAndUploadImage: mockPickImage,
    pickAndUploadVideo: mockPickVideo,
    uploading: false,
    progress: 0,
  }),
}));

describe('MediaUploader', () => {
  const defaultProps = {
    mediaItems: [] as MediaItem[],
    onMediaChange: jest.fn(),
    folder: '/pods',
    maxItems: 10,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders media count text', () => {
    const { getByText } = render(<MediaUploader {...defaultProps} />);
    expect(getByText('0/10 media')).toBeTruthy();
  });

  it('renders Photo and Video add buttons when no items', () => {
    const { getByText } = render(<MediaUploader {...defaultProps} />);
    expect(getByText('Photo')).toBeTruthy();
    expect(getByText('Video')).toBeTruthy();
  });

  it('displays uploaded media thumbnails', () => {
    const items: MediaItem[] = [
      { url: 'https://cdn.example.com/1.jpg', type: 'image' },
      { url: 'https://cdn.example.com/2.mp4', type: 'video' },
    ];
    const { getByText } = render(
      <MediaUploader {...defaultProps} mediaItems={items} />,
    );
    expect(getByText('2/10 media')).toBeTruthy();
  });

  it('calls pickAndUploadImage on Photo button press', async () => {
    mockPickImage.mockResolvedValue({
      url: 'https://cdn.example.com/new.jpg',
      type: 'image',
    });

    const onMediaChange = jest.fn();
    const { getByText } = render(
      <MediaUploader {...defaultProps} onMediaChange={onMediaChange} />,
    );

    await fireEvent.press(getByText('Photo'));

    expect(mockPickImage).toHaveBeenCalledWith('/pods');
  });

  it('calls pickAndUploadVideo on Video button press', async () => {
    mockPickVideo.mockResolvedValue({
      url: 'https://cdn.example.com/new.mp4',
      type: 'video',
    });

    const onMediaChange = jest.fn();
    const { getByText } = render(
      <MediaUploader {...defaultProps} onMediaChange={onMediaChange} />,
    );

    await fireEvent.press(getByText('Video'));

    expect(mockPickVideo).toHaveBeenCalledWith('/pods');
  });

  it('removes media item on close button press', () => {
    const items: MediaItem[] = [
      { url: 'https://cdn.example.com/1.jpg', type: 'image' },
      { url: 'https://cdn.example.com/2.jpg', type: 'image' },
    ];
    const onMediaChange = jest.fn();
    const { getAllByText } = render(
      <MediaUploader {...defaultProps} mediaItems={items} onMediaChange={onMediaChange} />,
    );

    // close icon renders MaterialIcons with name "close"
    const closeButtons = getAllByText('close');
    fireEvent.press(closeButtons[0]);

    expect(onMediaChange).toHaveBeenCalledWith([
      { url: 'https://cdn.example.com/2.jpg', type: 'image' },
    ]);
  });

  it('hides add buttons when max items reached', () => {
    const items: MediaItem[] = Array.from({ length: 3 }, (_, i) => ({
      url: `https://cdn.example.com/${i}.jpg`,
      type: 'image' as const,
    }));
    const { queryByText } = render(
      <MediaUploader {...defaultProps} mediaItems={items} maxItems={3} />,
    );

    expect(queryByText('Photo')).toBeNull();
    expect(queryByText('Video')).toBeNull();
  });

  it('updates count text correctly with custom maxItems', () => {
    const items: MediaItem[] = [
      { url: 'https://cdn.example.com/1.jpg', type: 'image' },
    ];
    const { getByText } = render(
      <MediaUploader {...defaultProps} mediaItems={items} maxItems={5} />,
    );
    expect(getByText('1/5 media')).toBeTruthy();
  });

  it('handles null/undefined mediaItems gracefully', () => {
    const { getByText } = render(
      <MediaUploader
        mediaItems={undefined as unknown as MediaItem[]}
        onMediaChange={jest.fn()}
        folder="/test"
      />,
    );
    expect(getByText('0/10 media')).toBeTruthy();
  });
});

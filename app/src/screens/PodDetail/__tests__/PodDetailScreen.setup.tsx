/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render } from '@testing-library/react-native';
import { useQuery, useMutation } from '@apollo/client';
import PodDetailScreen from '../PodDetailScreen';

jest.mock('expo-video', () => {
  const mockReact = require('react');
  const { View } = require('react-native');
  return {
    useVideoPlayer: jest.fn(() => ({
      play: jest.fn(),
      pause: jest.fn(),
      addListener: jest.fn(() => ({ remove: jest.fn() })),
    })),
    VideoView: (props: Record<string, unknown>) =>
      mockReact.createElement(View, { ...props, testID: 'video-view' }),
  };
});

jest.mock('../../../components/Skeleton', () => ({
  SkeletonDetail: () => {
    const mockReact = require('react');
    return mockReact.createElement(
      require('react-native').View,
      { testID: 'skeleton-detail' },
    );
  },
}));

jest.mock('../../../components/SafeImage', () => {
  const mockReact = require('react');
  return {
    __esModule: true,
    default: (props: Record<string, unknown>) => {
      return mockReact.createElement(
        require('react-native').View,
        { testID: 'safe-image', ...props },
      );
    },
  };
});

export const mockPod = {
  id: 'pod1',
  title: 'Weekend Hike',
  description: 'A fun mountain hike for everyone',
  category: 'Adventure',
  dateTime: new Date(Date.now() + 86400000).toISOString(),
  location: 'Himalayas, India',
  feePerPerson: 1500,
  maxSeats: 10,
  currentSeats: 2,
  status: 'ACTIVE',
  imageUrl: 'https://example.com/hike.jpg',
  mediaUrls: ['https://example.com/hike.jpg'],
  refundPolicy: 'Full refund up to 24 hours before',
  rating: 4.5,
  reviewCount: 12,
  latitude: 0,
  longitude: 0,
  host: {
    id: 'host1',
    name: 'Adventure Guide',
    username: 'guide',
    avatar: 'https://example.com/guide.jpg',
    isVerifiedHost: true,
  },
  attendees: [
    { id: 'a1', name: 'Alice', avatar: null },
    { id: 'a2', name: 'Bob', avatar: null },
  ],
};

export const mockRefetch = jest.fn();
export const mockDeletePod = jest.fn().mockResolvedValue({ data: {} });

export const defaultProps = {
  podId: 'pod1',
  onBack: jest.fn(),
  onCheckout: jest.fn(),
  onReviews: jest.fn(),
  onGoLive: jest.fn(),
  onUserProfile: jest.fn(),
};

export function setupMocks(opts?: { isHost?: boolean }): void {
  const meId = opts?.isHost ? 'host1' : 'user1';
  (useQuery as jest.Mock).mockReturnValue({
    data: {
      pod: mockPod,
      me: { id: meId },
      appConfig: [{ key: 'google_maps_api_key', value: 'test-key' }],
    },
    loading: false,
    error: null,
    refetch: mockRefetch,
  });
  (useMutation as jest.Mock).mockReturnValue([
    mockDeletePod,
    { loading: false },
  ]);
}

export function renderPodDetail(
  props: Partial<typeof defaultProps> = {},
) {
  return render(<PodDetailScreen {...defaultProps} {...props} />);
}

/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render } from '@testing-library/react-native';
import { useQuery } from '@apollo/client';
import HomeScreen from '../HomeScreen';

jest.mock('../../../components/CategoryChip', () => ({
  CategoryChip: ({
    label,
    selected,
    onPress,
  }: {
    label: string;
    selected: boolean;
    onPress: () => void;
  }) => {
    const mockReact = require('react');
    const { TouchableOpacity, Text } = require('react-native');
    return mockReact.createElement(
      TouchableOpacity,
      { onPress, testID: `chip-${label}` },
      mockReact.createElement(Text, null, label),
    );
  },
}));

jest.mock('../../../components/EventCard', () => ({
  EventCard: ({
    title,
    id,
    onPress,
  }: {
    title: string;
    id: string;
    onPress: (id: string) => void;
  }) => {
    const mockReact = require('react');
    const { TouchableOpacity, Text } = require('react-native');
    return mockReact.createElement(
      TouchableOpacity,
      { onPress: () => onPress(id), testID: `event-${title}` },
      mockReact.createElement(Text, null, title),
    );
  },
}));

jest.mock('../../../components/Skeleton', () => ({
  SkeletonFeed: () => {
    const mockReact = require('react');
    return mockReact.createElement(require('react-native').View, { testID: 'skeleton-feed' });
  },
}));

jest.mock('../../../hooks/useDebounce', () => ({
  useDebounce: (val: string) => val,
}));

jest.mock('../../../hooks/useLocation', () => ({
  useLocation: () => ({
    location: { city: 'Delhi', pincode: '110001' },
    loading: false,
    requestLocation: jest.fn(),
    requestCachedLocation: jest.fn(),
    searchByPincode: jest.fn(),
  }),
}));

export const mockPods = [
  {
    id: 'p1',
    title: 'Hiking Day',
    description: 'Mountain hiking',
    category: 'Adventure',
    dateTime: new Date(Date.now() + 86400000).toISOString(),
    location: 'Mountains',
    feePerPerson: 500,
    imageUrl: 'https://example.com/pod.jpg',
    maxSeats: 10,
    currentSeats: 2,
    attendees: [],
    rating: 4.5,
    status: 'ACTIVE',
    mediaUrls: [],
    host: { id: 'h1', name: 'Host', avatar: null },
  },
];

export const mockRefetch = jest.fn();
export const mockFetchMore = jest.fn();

export const defaultProps = {
  onPodPress: jest.fn(),
  onMenuPress: jest.fn(),
  onNotificationPress: jest.fn(),
  onChatbotPress: jest.fn(),
};

export function setupMocks(): void {
  (useQuery as jest.Mock).mockReturnValue({
    data: {
      me: { id: 'u1', name: 'User' },
      pods: { items: mockPods, total: 1, page: 1, totalPages: 1 },
    },
    loading: false,
    error: null,
    refetch: mockRefetch,
    fetchMore: mockFetchMore,
  });
}

export function renderHomeScreen(props: Partial<typeof defaultProps> = {}) {
  return render(<HomeScreen {...defaultProps} {...props} />);
}

/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render } from '@testing-library/react-native';
import { useQuery } from '@apollo/client';
import HomeScreen from '../HomeScreen';
import {
  GET_ME,
  GET_ACTIVE_CATEGORIES,
  GET_ACTIVE_SLIDERS,
  GET_PODS,
} from '../../../graphql/queries';

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

jest.mock('../../../components/SubCategoryBar', () => ({
  SubCategoryBar: () => {
    const mockReact = require('react');
    const { View } = require('react-native');
    return mockReact.createElement(View, { testID: 'subcategory-bar' });
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

jest.mock('../../../components/HomeSlider', () => {
  const mockReact = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: () => mockReact.createElement(View, { testID: 'home-slider' }),
  };
});

jest.mock('../LocationSelector', () => {
  const mockReact = require('react');
  const { Modal, View, Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ visible }: { visible: boolean }) =>
      visible
        ? mockReact.createElement(
            Modal,
            { visible: true, testID: 'location-selector' },
            mockReact.createElement(
              View,
              null,
              mockReact.createElement(Text, null, 'Location Selector'),
            ),
          )
        : null,
  };
});

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

export const mockCategories = [
  {
    id: 'c1',
    name: 'Social',
    iconUrl: 'https://example.com/social.png',
    imageUrl: null,
    subcategories: [
      { id: 'sc1', name: 'Meetups' },
      { id: 'sc2', name: 'Networking' },
    ],
  },
  {
    id: 'c2',
    name: 'Learning',
    iconUrl: null,
    imageUrl: null,
    subcategories: [],
  },
];

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

const queryResults: Record<string, Record<string, unknown>> = {
  GET_ME: {
    data: { me: { id: 'u1', name: 'User', avatar: null } },
    loading: false,
    error: null,
  },
  GET_ACTIVE_CATEGORIES: {
    data: { activeCategories: mockCategories },
    loading: false,
    error: null,
  },
  GET_ACTIVE_SLIDERS: {
    data: { activeSliders: [] },
    loading: false,
    error: null,
  },
  GET_PODS: {
    data: { pods: { items: mockPods, total: 1, page: 1, totalPages: 1 } },
    loading: false,
    error: null,
    refetch: mockRefetch,
    fetchMore: mockFetchMore,
  },
};

function getQueryName(doc: unknown): string {
  const node = doc as { definitions?: Array<{ name?: { value?: string } }> };
  return node?.definitions?.[0]?.name?.value ?? '';
}

export function setupMocks(overrides?: Partial<typeof queryResults>): void {
  const merged = { ...queryResults, ...overrides };
  (useQuery as jest.Mock).mockImplementation((doc: unknown) => {
    const name = getQueryName(doc);
    if (doc === GET_ME || name === 'GetMe') return merged.GET_ME;
    if (doc === GET_ACTIVE_CATEGORIES || name === 'GetActiveCategories')
      return merged.GET_ACTIVE_CATEGORIES;
    if (doc === GET_ACTIVE_SLIDERS || name === 'GetActiveSliders') return merged.GET_ACTIVE_SLIDERS;
    if (doc === GET_PODS || name === 'GetPods') return merged.GET_PODS;
    return { data: null, loading: false, error: null };
  });
}

export function renderHomeScreen(props: Partial<typeof defaultProps> = {}) {
  return render(<HomeScreen {...defaultProps} {...props} />);
}

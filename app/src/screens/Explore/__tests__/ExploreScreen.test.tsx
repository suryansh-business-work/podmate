import React from 'react';
import { ActivityIndicator } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { useQuery } from '@apollo/client';
import ExploreScreen from '../ExploreScreen';

jest.mock('@react-navigation/bottom-tabs', () => ({
  useBottomTabBarHeight: () => 49,
}));

jest.mock('../PodCard', () => {
  const mockReact = require('react');
  const { Text, TouchableOpacity } = require('react-native');
  const MockPodCard = ({ item, onPress }: { item: { title: string }; onPress: () => void }) =>
    mockReact.createElement(
      TouchableOpacity,
      { onPress, testID: `pod-card-${item.title}` },
      mockReact.createElement(Text, null, item.title),
    );
  return { __esModule: true, default: MockPodCard };
});

const mockPods = [
  {
    id: 'p1',
    title: 'Hiking Adventure',
    category: 'Adventure',
    date: new Date().toISOString(),
    location: 'Mountains',
    fee: 500,
    imageUrl: 'https://example.com/pod.jpg',
    maxSeats: 8,
    attendees: [],
    host: { id: 'h1', name: 'Host' },
  },
];

const mockRefetch = jest.fn();
const mockFetchMore = jest.fn();

/** Helper: ExploreScreen calls useQuery twice per render (GET_ME, GET_PODS).
 *  We cycle: even index → GET_ME result, odd index → GET_PODS result. */
function setupQueryMock(meResult: Record<string, unknown>, podsResult: Record<string, unknown>) {
  let qCall = 0;
  (useQuery as jest.Mock).mockReset().mockImplementation(() => {
    const idx = qCall++;
    return idx % 2 === 0 ? meResult : podsResult;
  });
}

describe('ExploreScreen', () => {
  const defaultProps = {
    onPodPress: jest.fn(),
    onCheckout: jest.fn(),
  };

  beforeEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
    setupQueryMock(
      { data: { me: { id: 'u1' } } },
      {
        data: { pods: { items: mockPods, total: 1, page: 1, totalPages: 1 } },
        loading: false,
        error: null,
        refetch: mockRefetch,
        fetchMore: mockFetchMore,
      },
    );
  });

  it('shows loading indicator', () => {
    setupQueryMock(
      { data: null },
      {
        data: null,
        loading: true,
        error: null,
        refetch: mockRefetch,
        fetchMore: mockFetchMore,
      },
    );
    const { UNSAFE_getByType } = render(<ExploreScreen {...defaultProps} />);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    expect(UNSAFE_getByType(ActivityIndicator as any)).toBeTruthy();
  });

  it('shows error state', () => {
    setupQueryMock(
      { data: null },
      {
        data: null,
        loading: false,
        error: new Error('Network error'),
        refetch: mockRefetch,
        fetchMore: mockFetchMore,
      },
    );
    const { getByText } = render(<ExploreScreen {...defaultProps} />);
    expect(getByText(/Failed to load/i)).toBeTruthy();
  });

  it('shows empty state when no pods', () => {
    setupQueryMock(
      { data: null },
      {
        data: { pods: { items: [], total: 0, page: 1, totalPages: 1 } },
        loading: false,
        error: null,
        refetch: mockRefetch,
        fetchMore: mockFetchMore,
      },
    );
    const { getByText } = render(<ExploreScreen {...defaultProps} />);
    expect(getByText('No pods found')).toBeTruthy();
  });

  it('renders pod cards', () => {
    const { getByText } = render(<ExploreScreen {...defaultProps} />);
    expect(getByText('Hiking Adventure')).toBeTruthy();
  });
});

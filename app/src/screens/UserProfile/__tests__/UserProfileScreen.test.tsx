import React from 'react';
import { ActivityIndicator } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { useQuery, useMutation } from '@apollo/client';
import UserProfileScreen from '../UserProfileScreen';

const mockUser = {
  id: 'u1',
  name: 'Jane Doe',
  username: 'janedoe',
  avatar: 'https://example.com/avatar.jpg',
  bio: 'Event lover',
};

const mockPods = [
  {
    id: 'p1',
    title: 'Fun Pod',
    description: 'Fun event',
    imageUrl: 'https://example.com/pod.jpg',
    rating: 4.5,
  },
];

const mockFollowStats = {
  followersCount: 10,
  followingCount: 5,
  isFollowing: false,
};

const mockRefetchFollow = jest.fn();
const mockFollowUser = jest.fn().mockResolvedValue({});
const mockUnfollowUser = jest.fn().mockResolvedValue({});

describe('UserProfileScreen', () => {
  const defaultProps = {
    userId: 'u1',
    onBack: jest.fn(),
    onPodPress: jest.fn(),
    onFollowers: jest.fn(),
    onFollowing: jest.fn(),
  };

  /** UserProfileScreen calls useQuery 3 times (GET_USER_PROFILE, GET_USER_PODS,
   *  GET_FOLLOW_STATS) and useMutation 2 times (FOLLOW, UNFOLLOW) per render.
   *  We use cycling mockImplementation to survive React 19 re-renders. */
  function setupQueryMock(
    result0: Record<string, unknown>,
    result1: Record<string, unknown>,
    result2: Record<string, unknown>,
  ) {
    let qCall = 0;
    const results = [result0, result1, result2];
    (useQuery as jest.Mock).mockReset().mockImplementation(() => {
      const idx = qCall++;
      return results[idx % 3];
    });
  }

  function setupMutationMock() {
    let mCall = 0;
    (useMutation as jest.Mock).mockReset().mockImplementation(() => {
      mCall++;
      return (mCall - 1) % 2 === 0 ? [mockFollowUser] : [mockUnfollowUser];
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
    setupQueryMock(
      { data: { userProfile: mockUser }, loading: false, refetch: mockRefetchFollow },
      { data: { userPods: mockPods } },
      { data: { followStats: mockFollowStats }, refetch: mockRefetchFollow },
    );
    setupMutationMock();
  });

  it('renders user name', () => {
    const { getAllByText } = render(<UserProfileScreen {...defaultProps} />);
    expect(getAllByText('Jane Doe').length).toBeGreaterThanOrEqual(1);
  });

  it('calls onBack when back button pressed', () => {
    const { getByText } = render(<UserProfileScreen {...defaultProps} />);
    fireEvent.press(getByText('arrow-back'));
    expect(defaultProps.onBack).toHaveBeenCalled();
  });

  it('shows loading indicator when loading', () => {
    setupQueryMock(
      { data: null, loading: true },
      { data: null },
      { data: null, refetch: jest.fn() },
    );
    setupMutationMock();
    const { UNSAFE_getByType } = render(<UserProfileScreen {...defaultProps} />);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    expect(UNSAFE_getByType(ActivityIndicator as any)).toBeTruthy();
  });

  it('renders followers count', () => {
    const { getByText } = render(<UserProfileScreen {...defaultProps} />);
    expect(getByText('10')).toBeTruthy();
  });

  it('renders following count', () => {
    const { getByText } = render(<UserProfileScreen {...defaultProps} />);
    expect(getByText('5')).toBeTruthy();
  });

  it('shows Follow button when not following', () => {
    const { getByText } = render(<UserProfileScreen {...defaultProps} />);
    expect(getByText('Follow')).toBeTruthy();
  });

  it('renders pod cards', () => {
    const { getByText } = render(<UserProfileScreen {...defaultProps} />);
    expect(getByText('Fun Pod')).toBeTruthy();
  });

  it('calls onFollowers when followers tapped', () => {
    const { getByText } = render(<UserProfileScreen {...defaultProps} />);
    fireEvent.press(getByText('Followers'));
    expect(defaultProps.onFollowers).toHaveBeenCalled();
  });

  it('calls onFollowing when following tapped', () => {
    const { getByText } = render(<UserProfileScreen {...defaultProps} />);
    fireEvent.press(getByText('Following'));
    expect(defaultProps.onFollowing).toHaveBeenCalled();
  });
});

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

  beforeEach(() => {
    jest.clearAllMocks();
    (useQuery as jest.Mock).mockReturnValue({
      data: {
        userProfile: mockUser,
        userPods: mockPods,
        followStats: mockFollowStats,
      },
      loading: false,
      refetch: mockRefetchFollow,
    });
    (useMutation as jest.Mock)
      .mockReturnValueOnce([mockFollowUser])
      .mockReturnValueOnce([mockUnfollowUser]);
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
    (useQuery as jest.Mock).mockReset()
      .mockReturnValueOnce({ data: null, loading: true })
      .mockReturnValueOnce({ data: null })
      .mockReturnValueOnce({ data: null, refetch: jest.fn() });
    (useMutation as jest.Mock).mockReset()
      .mockReturnValueOnce([jest.fn()])
      .mockReturnValueOnce([jest.fn()]);
    const { UNSAFE_getByType } = render(
      <UserProfileScreen {...defaultProps} />,
    );
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
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

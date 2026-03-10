import React from 'react';
import { ActivityIndicator } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { useQuery, useMutation } from '@apollo/client';
import FollowListScreen from '../FollowListScreen';

const mockFollowers = [
  {
    id: 'f1',
    follower: { id: 'u1', name: 'Alice', username: 'alice', avatar: null },
    following: null,
    createdAt: new Date().toISOString(),
  },
];
const mockFollowing = [
  {
    id: 'f2',
    follower: null,
    following: { id: 'u2', name: 'Bob', username: 'bob', avatar: null },
    createdAt: new Date().toISOString(),
  },
];

const mockRefetch = jest.fn();
const mockFollowUser = jest.fn().mockResolvedValue({});
const mockUnfollowUser = jest.fn().mockResolvedValue({});

describe('FollowListScreen', () => {
  const defaultProps = {
    userId: 'user1',
    userName: 'TestUser',
    initialTab: 'followers' as const,
    onBack: jest.fn(),
    onUserPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useQuery as jest.Mock).mockImplementation((query, opts) => {
      if (opts?.skip) {
        return { data: null, loading: false, refetch: mockRefetch };
      }
      return {
        data: {
          followers: { items: mockFollowers, total: mockFollowers.length },
          following: { items: mockFollowing, total: mockFollowing.length },
        },
        loading: false,
        refetch: mockRefetch,
      };
    });
    let mutCall = 0;
    (useMutation as jest.Mock).mockImplementation(() => {
      mutCall++;
      return (mutCall - 1) % 2 === 0 ? [mockFollowUser] : [mockUnfollowUser];
    });
  });

  it('renders user name in header', () => {
    const { getByText } = render(<FollowListScreen {...defaultProps} />);
    expect(getByText('TestUser')).toBeTruthy();
  });

  it('calls onBack when back button pressed', () => {
    const { getByText } = render(<FollowListScreen {...defaultProps} />);
    fireEvent.press(getByText('arrow-back'));
    expect(defaultProps.onBack).toHaveBeenCalled();
  });

  it('shows followers tab by default', () => {
    const { getByText } = render(<FollowListScreen {...defaultProps} />);
    expect(getByText(/Followers/i)).toBeTruthy();
  });

  it('shows loading indicator when loading', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
      refetch: mockRefetch,
    });
    let mutCall = 0;
    (useMutation as jest.Mock).mockReset().mockImplementation(() => {
      mutCall++;
      return (mutCall - 1) % 2 === 0 ? [mockFollowUser] : [mockUnfollowUser];
    });
    const { UNSAFE_getByType } = render(<FollowListScreen {...defaultProps} />);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    expect(UNSAFE_getByType(ActivityIndicator as any)).toBeTruthy();
  });

  it('shows empty state for followers', () => {
    (useQuery as jest.Mock).mockImplementation((query, opts) => {
      if (opts?.skip) {
        return { data: null, loading: false, refetch: mockRefetch };
      }
      return { data: { followers: { items: [], total: 0 } }, loading: false, refetch: mockRefetch };
    });
    let mutCall = 0;
    (useMutation as jest.Mock).mockReset().mockImplementation(() => {
      mutCall++;
      return (mutCall - 1) % 2 === 0 ? [mockFollowUser] : [mockUnfollowUser];
    });
    const { getByText } = render(<FollowListScreen {...defaultProps} />);
    expect(getByText(/No followers yet/i)).toBeTruthy();
  });

  it('renders follower names', () => {
    const { getByText } = render(<FollowListScreen {...defaultProps} />);
    expect(getByText('Alice')).toBeTruthy();
  });

  it('switches to following tab', () => {
    const { getByText } = render(<FollowListScreen {...defaultProps} />);
    fireEvent.press(getByText(/Following/i));
    expect(getByText(/Following/i)).toBeTruthy();
  });
});

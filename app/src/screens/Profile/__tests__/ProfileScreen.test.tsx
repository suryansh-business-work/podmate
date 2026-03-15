import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useQuery, useMutation } from '@apollo/client';
import ProfileScreen from '../ProfileScreen';

jest.mock('../../../components/Skeleton', () => {
  const mockReact = require('react');
  const { View } = require('react-native');
  return {
    SkeletonProfile: () => mockReact.createElement(View, { testID: 'skeleton-profile' }),
  };
});

jest.mock('../../../contexts/ThemeContext', () => ({
  useThemeMode: () => ({
    isDark: false,
    toggleTheme: jest.fn(),
  }),
}));

const mockUser = {
  id: '1',
  name: 'John Doe',
  username: 'johndoe',
  phone: '+919876543210',
  avatar: 'https://example.com/avatar.jpg',
  isVerifiedHost: true,
  roles: ['HOST', 'USER'],
  activeRole: 'HOST',
};

const mockRefetchMe = jest.fn();
const mockRefetchPods = jest.fn();
const mockRefetchFollow = jest.fn();
const mockRefetchMoments = jest.fn();

describe('ProfileScreen', () => {
  const defaultProps = {
    onLogout: jest.fn(),
    onNavigate: jest.fn(),
    onCreateMoment: jest.fn(),
    onFollowers: jest.fn(),
    onFollowing: jest.fn(),
  };

  /**
   * ProfileScreen calls useQuery 4 times per render:
   * 0 → GET_ME, 1 → GET_MY_PODS, 2 → GET_FOLLOW_STATS, 3 → GET_USER_MOMENTS
   */
  function setupQueryMock(
    meResult: Record<string, unknown>,
    podsResult: Record<string, unknown>,
    followResult?: Record<string, unknown>,
    momentsResult?: Record<string, unknown>,
  ) {
    let qCall = 0;
    const defaults = [
      meResult,
      podsResult,
      followResult ?? {
        data: { followStats: { followersCount: 5, followingCount: 10 } },
        refetch: mockRefetchFollow,
      },
      momentsResult ?? {
        data: { userMoments: { items: [], total: 0 } },
        refetch: mockRefetchMoments,
      },
    ];
    (useQuery as jest.Mock).mockReset().mockImplementation(() => {
      const idx = qCall++;
      return defaults[idx % defaults.length];
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
    setupQueryMock(
      {
        data: { me: mockUser },
        loading: false,
        error: null,
        refetch: mockRefetchMe,
      },
      {
        data: { myPods: [{ id: '1' }, { id: '2' }] },
        refetch: mockRefetchPods,
      },
    );
  });

  it('renders user name', () => {
    const { getByText } = render(<ProfileScreen {...defaultProps} />);
    expect(getByText('John Doe')).toBeTruthy();
  });

  it('renders user phone', () => {
    const { getByText } = render(<ProfileScreen {...defaultProps} />);
    expect(getByText('+919876543210')).toBeTruthy();
  });

  it('shows skeleton when loading', () => {
    setupQueryMock(
      { data: null, loading: true, error: null, refetch: mockRefetchMe },
      { data: null, refetch: mockRefetchPods },
    );
    const { getByTestId } = render(<ProfileScreen {...defaultProps} />);
    expect(getByTestId('skeleton-profile')).toBeTruthy();
  });

  it('shows error state', () => {
    setupQueryMock(
      {
        data: null,
        loading: false,
        error: new Error('Network error'),
        refetch: mockRefetchMe,
      },
      { data: null, refetch: mockRefetchPods },
    );
    const { getByText } = render(<ProfileScreen {...defaultProps} />);
    expect(getByText(/Failed to load profile/i)).toBeTruthy();
  });

  it('calls onLogout when log out button pressed', () => {
    const { getByText } = render(<ProfileScreen {...defaultProps} />);
    fireEvent.press(getByText('menu'));
    fireEvent.press(getByText('Log Out'));
    expect(defaultProps.onLogout).toHaveBeenCalled();
  });

  it('calls onNavigate when menu item pressed', () => {
    const { getByText, getAllByText } = render(<ProfileScreen {...defaultProps} />);
    fireEvent.press(getByText('menu'));
    const editProfileItems = getAllByText('Edit Profile');
    const menuItem =
      editProfileItems.find((el) => el.parent?.parent?.props?.accessibilityRole !== 'button') ??
      editProfileItems[editProfileItems.length - 1];
    fireEvent.press(menuItem);
    expect(defaultProps.onNavigate).toHaveBeenCalled();
  });

  it('renders version text on menu tab', () => {
    const { getByText } = render(<ProfileScreen {...defaultProps} />);
    fireEvent.press(getByText('menu'));
    expect(getByText(/PartyWings v/i)).toBeTruthy();
  });

  it('renders empty grid state with upload button', () => {
    const { getByText } = render(<ProfileScreen {...defaultProps} />);
    expect(getByText('No posts yet')).toBeTruthy();
    expect(getByText('Share your first moment')).toBeTruthy();
  });

  it('renders follower and following stats', () => {
    const { getByText } = render(<ProfileScreen {...defaultProps} />);
    expect(getByText('5')).toBeTruthy();
    expect(getByText('10')).toBeTruthy();
    expect(getByText('Followers')).toBeTruthy();
    expect(getByText('Following')).toBeTruthy();
  });
});

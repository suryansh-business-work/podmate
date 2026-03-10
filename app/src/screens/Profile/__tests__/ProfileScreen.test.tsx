import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useQuery } from '@apollo/client';
import ProfileScreen from '../ProfileScreen';

jest.mock('../../../components/Skeleton', () => {
  const mockReact = require('react');
  const { View } = require('react-native');
  return {
    SkeletonProfile: () => mockReact.createElement(View, { testID: 'skeleton-profile' }),
  };
});

const mockUser = {
  id: '1',
  name: 'John Doe',
  username: 'johndoe',
  phone: '+919876543210',
  avatar: 'https://example.com/avatar.jpg',
  isVerifiedHost: true,
  role: 'HOST',
};

const mockRefetchMe = jest.fn();
const mockRefetchPods = jest.fn();

describe('ProfileScreen', () => {
  const defaultProps = {
    onLogout: jest.fn(),
    onNavigate: jest.fn(),
  };

  /** ProfileScreen calls useQuery 2 times (GET_ME, GET_MY_PODS) per render.
   *  Cycle: even → GET_ME result, odd → GET_MY_PODS result. */
  function setupQueryMock(meResult: Record<string, unknown>, podsResult: Record<string, unknown>) {
    let qCall = 0;
    (useQuery as jest.Mock).mockReset().mockImplementation(() => {
      const idx = qCall++;
      return idx % 2 === 0 ? meResult : podsResult;
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
    fireEvent.press(getByText('Log Out'));
    expect(defaultProps.onLogout).toHaveBeenCalled();
  });

  it('calls onNavigate when menu item pressed', () => {
    const { getByText } = render(<ProfileScreen {...defaultProps} />);
    const editProfile = getByText('Edit Profile');
    fireEvent.press(editProfile);
    expect(defaultProps.onNavigate).toHaveBeenCalled();
  });

  it('renders version text', () => {
    const { getByText } = render(<ProfileScreen {...defaultProps} />);
    expect(getByText(/PartyWings v/i)).toBeTruthy();
  });
});

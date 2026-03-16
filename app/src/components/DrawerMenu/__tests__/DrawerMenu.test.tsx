import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useQuery } from '@apollo/client';
import DrawerMenu from '../DrawerMenu';

describe('DrawerMenu', () => {
  const defaultProps = {
    onClose: jest.fn(),
    onNavigate: jest.fn(),
    onLogout: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useQuery as jest.Mock).mockReturnValue({
      data: {
        me: {
          name: 'Suryansh',
          phone: '+919876543210',
          avatar: 'https://cdn.example.com/avatar.jpg',
          isVerifiedHost: true,
          roles: ['HOST', 'USER'],
          activeRole: 'USER',
        },
      },
      loading: false,
      error: null,
    });
  });

  it('renders user name from query data', () => {
    const { getByText } = render(<DrawerMenu {...defaultProps} />);
    expect(getByText('Suryansh')).toBeTruthy();
  });

  it('renders user phone number', () => {
    const { getByText } = render(<DrawerMenu {...defaultProps} />);
    expect(getByText('+919876543210')).toBeTruthy();
  });

  it('renders active role badge label', () => {
    const { getByText } = render(<DrawerMenu {...defaultProps} />);
    expect(getByText('User')).toBeTruthy();
  });

  it('renders USER role menu items (conditionally based on roles)', () => {
    const { getByText, queryByText } = render(<DrawerMenu {...defaultProps} />);
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Explore')).toBeTruthy();
    expect(getByText('Moments')).toBeTruthy();
    expect(queryByText('Notifications')).toBeNull();
    /* User already has HOST role → "Be a Pod Owner" hidden */
    expect(queryByText('Be a Pod Owner')).toBeNull();
    /* User does NOT have VENUE_OWNER role → "Register a Venue" shown */
    expect(getByText('Register a Venue')).toBeTruthy();
    expect(getByText('Profile Settings')).toBeTruthy();
  });

  it('renders HOST role menu when activeRole is HOST', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: {
        me: {
          name: 'Suryansh',
          phone: '+919876543210',
          avatar: null,
          isVerifiedHost: true,
          roles: ['HOST', 'USER'],
          activeRole: 'HOST',
        },
      },
      loading: false,
      error: null,
    });
    const { getByText, queryByText } = render(<DrawerMenu {...defaultProps} />);
    expect(getByText('Create a Pod')).toBeTruthy();
    expect(getByText('Profile')).toBeTruthy();
    expect(getByText('Withdrawal')).toBeTruthy();
    expect(queryByText('Home')).toBeNull();
  });

  it('renders VENUE_OWNER role menu when activeRole is VENUE_OWNER', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: {
        me: {
          name: 'Suryansh',
          phone: '+919876543210',
          avatar: null,
          isVerifiedHost: false,
          roles: ['VENUE_OWNER'],
          activeRole: 'VENUE_OWNER',
        },
      },
      loading: false,
      error: null,
    });
    const { getByText, queryByText } = render(<DrawerMenu {...defaultProps} />);
    expect(getByText('Your Venues')).toBeTruthy();
    expect(getByText('Menus')).toBeTruthy();
    expect(getByText('Manage Orders')).toBeTruthy();
    expect(getByText('Payments History')).toBeTruthy();
    expect(getByText('Venues Moments')).toBeTruthy();
    expect(getByText('Withdrawal')).toBeTruthy();
    expect(queryByText('Switch Role')).toBeNull();
  });

  it('shows Switch Role when user has multiple roles', () => {
    const { getByText } = render(<DrawerMenu {...defaultProps} />);
    expect(getByText('Switch Role')).toBeTruthy();
  });

  it('hides Switch Role when user has single role', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: {
        me: {
          name: 'Suryansh',
          phone: '+919876543210',
          avatar: null,
          isVerifiedHost: false,
          roles: ['USER'],
          activeRole: 'USER',
        },
      },
      loading: false,
      error: null,
    });
    const { queryByText } = render(<DrawerMenu {...defaultProps} />);
    expect(queryByText('Switch Role')).toBeNull();
  });

  it('expands role options when Switch Role is pressed', () => {
    const { getByText } = render(<DrawerMenu {...defaultProps} />);
    fireEvent.press(getByText('Switch Role'));
    expect(getByText('Host')).toBeTruthy();
  });

  it('renders Logout button', () => {
    const { getByText } = render(<DrawerMenu {...defaultProps} />);
    expect(getByText('Logout')).toBeTruthy();
  });

  it('calls onClose then onNavigate when menu item is pressed', () => {
    const onClose = jest.fn();
    const onNavigate = jest.fn();
    const { getByText } = render(
      <DrawerMenu {...defaultProps} onClose={onClose} onNavigate={onNavigate} />,
    );

    fireEvent.press(getByText('Explore'));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith('Explore');
  });

  it('calls onLogout when Logout is pressed', () => {
    const onLogout = jest.fn();
    const { getByText } = render(<DrawerMenu {...defaultProps} onLogout={onLogout} />);

    fireEvent.press(getByText('Logout'));

    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('shows loading indicator when user data is loading', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    const { queryByText } = render(<DrawerMenu {...defaultProps} />);
    expect(queryByText('Suryansh')).toBeNull();
  });

  it('shows fallback name when user data is absent', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: { me: null },
      loading: false,
      error: null,
    });

    const { getByText } = render(<DrawerMenu {...defaultProps} />);
    expect(getByText('PartyWings User')).toBeTruthy();
  });

  it('navigates to Profile when profile section is pressed', () => {
    const onNavigate = jest.fn();
    const onClose = jest.fn();
    const { getByText } = render(
      <DrawerMenu {...defaultProps} onClose={onClose} onNavigate={onNavigate} />,
    );

    fireEvent.press(getByText('Suryansh'));

    expect(onClose).toHaveBeenCalled();
    expect(onNavigate).toHaveBeenCalledWith('Profile');
  });

  it('renders footer text', () => {
    const { getByText } = render(<DrawerMenu {...defaultProps} />);
    expect(getByText('PartyWings v1.0')).toBeTruthy();
  });
});

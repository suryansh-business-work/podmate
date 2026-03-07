import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useQuery } from '@apollo/client';
import DrawerMenu from '../DrawerMenu/DrawerMenu';

jest.mock('../../contexts/ThemeContext', () => ({
  useThemeMode: () => ({
    isDark: false,
    toggleTheme: jest.fn(),
  }),
}));

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
          role: 'HOST',
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

  it('renders user role badge', () => {
    const { getByText } = render(<DrawerMenu {...defaultProps} />);
    expect(getByText('HOST')).toBeTruthy();
  });

  it('renders main navigation items', () => {
    const { getByText } = render(<DrawerMenu {...defaultProps} />);
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Explore')).toBeTruthy();
    expect(getByText('Chat')).toBeTruthy();
    expect(getByText('Notifications')).toBeTruthy();
  });

  it('renders quick action items', () => {
    const { getByText } = render(<DrawerMenu {...defaultProps} />);
    expect(getByText('Register a Venue')).toBeTruthy();
    expect(getByText('Create a Pod')).toBeTruthy();
    expect(getByText('Go Live')).toBeTruthy();
  });

  it('renders account items', () => {
    const { getByText } = render(<DrawerMenu {...defaultProps} />);
    expect(getByText('Profile')).toBeTruthy();
    expect(getByText('My Pods')).toBeTruthy();
    expect(getByText('Payments')).toBeTruthy();
  });

  it('renders Dark Mode toggle', () => {
    const { getByText } = render(<DrawerMenu {...defaultProps} />);
    expect(getByText('Dark Mode')).toBeTruthy();
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

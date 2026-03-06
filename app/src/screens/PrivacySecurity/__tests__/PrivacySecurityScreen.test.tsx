import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PrivacySecurityScreen from '../PrivacySecurityScreen';

jest.mock('../PrivacySecurity.types', () => ({
  PRIVACY_SETTINGS: [
    { key: 'profile_visibility', label: 'Profile Visibility', icon: 'visibility' },
    { key: 'hide_location', label: 'Hide Location', icon: 'location-off' },
  ],
  SECURITY_SETTINGS: [
    { key: 'two_factor_auth', label: 'Two-Factor Auth', icon: 'security' },
  ],
  ACCOUNT_ACTIONS: [
    { key: 'delete_account', label: 'Delete Account', icon: 'delete-forever' },
    { key: 'download_data', label: 'Download Data', icon: 'cloud-download' },
  ],
}));

describe('PrivacySecurityScreen', () => {
  const defaultProps = { onBack: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders header title', () => {
    const { getByText } = render(
      <PrivacySecurityScreen {...defaultProps} />,
    );
    expect(getByText('Privacy & Security')).toBeTruthy();
  });

  it('calls onBack when back button is pressed', () => {
    const { getByText } = render(
      <PrivacySecurityScreen {...defaultProps} />,
    );
    const backIcon = getByText('arrow-back');
    fireEvent.press(backIcon);
    expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
  });

  it('renders privacy section', () => {
    const { getByText } = render(
      <PrivacySecurityScreen {...defaultProps} />,
    );
    expect(getByText('Privacy')).toBeTruthy();
  });

  it('renders security section', () => {
    const { getByText } = render(
      <PrivacySecurityScreen {...defaultProps} />,
    );
    expect(getByText('Security')).toBeTruthy();
  });

  it('renders account section', () => {
    const { getByText } = render(
      <PrivacySecurityScreen {...defaultProps} />,
    );
    expect(getByText('Account')).toBeTruthy();
  });

  it('renders toggle rows for privacy settings', () => {
    const { getByText } = render(
      <PrivacySecurityScreen {...defaultProps} />,
    );
    expect(getByText('Profile Visibility')).toBeTruthy();
    expect(getByText('Hide Location')).toBeTruthy();
  });

  it('renders action rows for account section', () => {
    const { getByText } = render(
      <PrivacySecurityScreen {...defaultProps} />,
    );
    expect(getByText('Delete Account')).toBeTruthy();
    expect(getByText('Download Data')).toBeTruthy();
  });
});

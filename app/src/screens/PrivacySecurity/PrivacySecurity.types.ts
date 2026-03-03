export interface PrivacySecurityScreenProps {
  onBack: () => void;
}

export interface SettingRowItem {
  icon: string;
  label: string;
  subtitle: string;
  type: 'toggle' | 'link';
  key: string;
}

export const PRIVACY_SETTINGS: SettingRowItem[] = [
  {
    icon: 'visibility',
    label: 'Profile Visibility',
    subtitle: 'Control who can see your profile',
    type: 'toggle',
    key: 'profile_visibility',
  },
  {
    icon: 'location-off',
    label: 'Hide Location',
    subtitle: 'Don\'t share your precise location',
    type: 'toggle',
    key: 'hide_location',
  },
  {
    icon: 'notifications-off',
    label: 'Marketing Notifications',
    subtitle: 'Receive promotional updates',
    type: 'toggle',
    key: 'marketing_notifications',
  },
];

export const SECURITY_SETTINGS: SettingRowItem[] = [
  {
    icon: 'phonelink-lock',
    label: 'Two-Factor Authentication',
    subtitle: 'Add an extra layer of security',
    type: 'toggle',
    key: 'two_factor_auth',
  },
  {
    icon: 'devices',
    label: 'Active Sessions',
    subtitle: 'Manage your login sessions',
    type: 'link',
    key: 'active_sessions',
  },
];

export const ACCOUNT_ACTIONS: SettingRowItem[] = [
  {
    icon: 'download',
    label: 'Download My Data',
    subtitle: 'Get a copy of your personal data',
    type: 'link',
    key: 'download_data',
  },
  {
    icon: 'delete-outline',
    label: 'Delete Account',
    subtitle: 'Permanently delete your account and data',
    type: 'link',
    key: 'delete_account',
  },
];

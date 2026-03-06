export interface ProfileScreenProps {
  onLogout: () => void;
  onNavigate?: (screen: string) => void;
}

export interface MenuItem {
  icon: string;
  label: string;
  subtitle: string;
  action: string;
}

export const MENU_ITEMS: MenuItem[] = [
  { icon: 'person', label: 'Edit Profile', subtitle: 'Name, photo, bio', action: 'EditProfile' },
  {
    icon: 'confirmation-number',
    label: 'My Pods',
    subtitle: 'Joined & hosted pods',
    action: 'MyPods',
  },
  {
    icon: 'credit-card',
    label: 'Payments',
    subtitle: 'Transactions & payouts',
    action: 'Payments',
  },
  {
    icon: 'notifications',
    label: 'Notifications',
    subtitle: 'Manage preferences',
    action: 'Notifications',
  },
  {
    icon: 'feedback',
    label: 'Feedback',
    subtitle: 'Report bugs, suggest features',
    action: 'Feedback',
  },
  {
    icon: 'emoji-objects',
    label: 'Pod Ideas',
    subtitle: 'Suggest & vote on ideas',
    action: 'PodIdeas',
  },
  {
    icon: 'security',
    label: 'Privacy & Security',
    subtitle: 'Account settings',
    action: 'Privacy',
  },
  { icon: 'help', label: 'Help & Support', subtitle: 'FAQs, contact us', action: 'Help' },
];

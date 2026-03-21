import { ComponentProps } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

export interface ProfileScreenProps {
  onLogout: () => void;
  onNavigate?: (screen: string) => void;
  onCreateMoment?: () => void;
  onFollowers?: (userId: string, userName: string) => void;
  onFollowing?: (userId: string, userName: string) => void;
  onRoleSwitch?: (role: string) => void;
}

export type ProfileTab = 'grid' | 'menu';

export interface MenuItem {
  icon: ComponentProps<typeof MaterialIcons>['name'];
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
    icon: 'account-balance-wallet',
    label: 'Payments History',
    subtitle: 'Transactions & payouts',
    action: 'Payments',
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
  { icon: 'help', label: 'Help & FAQs', subtitle: 'FAQs, contact us', action: 'Help' },
  {
    icon: 'support-agent',
    label: 'Support',
    subtitle: 'Get help from our team',
    action: 'Support',
  },
  {
    icon: 'security',
    label: 'Privacy & Security',
    subtitle: 'Account settings',
    action: 'Privacy',
  },
];

export function getStartEarningItems(roles: string[]): MenuItem[] {
  const items: MenuItem[] = [];
  if (!roles.includes('HOST')) {
    items.push({
      icon: 'campaign',
      label: 'Be a Pod Owner',
      subtitle: 'Host pods & start earning',
      action: 'RequestMeeting:POD_OWNER',
    });
  }
  if (!roles.includes('VENUE_OWNER')) {
    items.push({
      icon: 'store',
      label: 'Register a Venue',
      subtitle: 'List your venue & earn',
      action: 'RequestMeeting:VENUE_OWNER',
    });
  }
  return items;
}

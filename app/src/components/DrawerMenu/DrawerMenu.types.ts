import { ComponentProps } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme';

export type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

export interface DrawerMenuProps {
  onClose: () => void;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export interface NavItem {
  id: string;
  icon: MaterialIconName;
  label: string;
  color?: string;
}

export const MAIN_NAV: NavItem[] = [
  { id: 'Home', icon: 'home', label: 'Home', color: '#F50247' },
  { id: 'Explore', icon: 'explore', label: 'Explore', color: '#9333EA' },
  { id: 'Chat', icon: 'chat-bubble', label: 'Chat', color: '#2563EB' },
  { id: 'Notifications', icon: 'notifications', label: 'Notifications', color: '#F59E0B' },
];

export const QUICK_ACTIONS: NavItem[] = [
  { id: 'RegisterPlace', icon: 'store', label: 'Register a Venue', color: '#10B981' },
  { id: 'CreatePod', icon: 'add-circle', label: 'Create a Pod', color: '#F50247' },
  { id: 'GoLive', icon: 'videocam', label: 'Go Live', color: '#EF4444' },
];

export const ACCOUNT_ITEMS: NavItem[] = [
  { id: 'Profile', icon: 'person', label: 'Profile', color: '#6366F1' },
  { id: 'MyPods', icon: 'confirmation-number', label: 'My Pods', color: '#EC4899' },
  { id: 'Payments', icon: 'account-balance-wallet', label: 'Payments', color: '#14B8A6' },
  { id: 'Feedback', icon: 'feedback', label: 'Feedback', color: '#F59E0B' },
  { id: 'PodIdeas', icon: 'emoji-objects', label: 'Pod Ideas', color: '#10B981' },
  { id: 'Help', icon: 'help-outline', label: 'Help & FAQs', color: '#8B5CF6' },
  { id: 'Support', icon: 'support-agent', label: 'Support', color: colors.primary },
];

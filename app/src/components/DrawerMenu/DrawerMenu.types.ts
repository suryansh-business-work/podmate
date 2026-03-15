import { ComponentProps } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

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

/* ── User role menu ─── */
export const USER_NAV: NavItem[] = [
  { id: 'Home', icon: 'home', label: 'Home', color: '#F50247' },
  { id: 'Explore', icon: 'explore', label: 'Explore', color: '#9333EA' },
  { id: 'Moments', icon: 'auto-awesome', label: 'Moments', color: '#2563EB' },
  { id: 'Notifications', icon: 'notifications', label: 'Notifications', color: '#F59E0B' },
  { id: 'RegisterPlace', icon: 'store', label: 'Register a Venue', color: '#10B981' },
  { id: 'CreatePod', icon: 'add-circle', label: 'Be a Pod Owner', color: '#F50247' },
  { id: 'Profile', icon: 'person', label: 'Profile Settings', color: '#6366F1' },
];

/* ── Venue Owner role menu ─── */
export const VENUE_OWNER_NAV: NavItem[] = [
  { id: 'Dashboard', icon: 'dashboard', label: 'Dashboard', color: '#F50247' },
  { id: 'YourVenues', icon: 'store', label: 'Your Venues', color: '#10B981' },
  { id: 'Menus', icon: 'restaurant-menu', label: 'Menus', color: '#F59E0B' },
  { id: 'ManageOrders', icon: 'receipt-long', label: 'Manage Orders', color: '#2563EB' },
  { id: 'Payments', icon: 'account-balance-wallet', label: 'Payments History', color: '#14B8A6' },
  { id: 'VenueMoments', icon: 'auto-awesome', label: 'Venues Moments', color: '#9333EA' },
  { id: 'Withdrawal', icon: 'savings', label: 'Withdrawal', color: '#EC4899' },
];

/* ── Host role menu ─── */
export const HOST_NAV: NavItem[] = [
  { id: 'Dashboard', icon: 'dashboard', label: 'Dashboard', color: '#F50247' },
  { id: 'CreatePod', icon: 'add-circle', label: 'Create a Pod', color: '#F50247' },
  { id: 'Profile', icon: 'person', label: 'Profile', color: '#6366F1' },
  { id: 'Withdrawal', icon: 'savings', label: 'Withdrawal', color: '#EC4899' },
];

export const ROLE_MENUS: Record<string, NavItem[]> = {
  USER: USER_NAV,
  VENUE_OWNER: VENUE_OWNER_NAV,
  HOST: HOST_NAV,
  ADMIN: USER_NAV,
};

export const ROLE_LABELS: Record<string, string> = {
  USER: 'User',
  VENUE_OWNER: 'Venue Owner',
  HOST: 'Host',
  ADMIN: 'Admin',
};

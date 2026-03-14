import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import PolicyIcon from '@mui/icons-material/Policy';
import PlaceIcon from '@mui/icons-material/Place';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import SettingsIcon from '@mui/icons-material/Settings';
import FlagIcon from '@mui/icons-material/Flag';
import PaymentIcon from '@mui/icons-material/Payment';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PhoneCallbackIcon from '@mui/icons-material/PhoneCallback';
import CodeIcon from '@mui/icons-material/Code';
import FeedbackIcon from '@mui/icons-material/Feedback';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export const DRAWER_WIDTH = 240;

export interface AdminLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

export interface NavItemConfig {
  icon: React.ReactElement;
  label: string;
  path: string;
}

export interface NavGroupConfig {
  label: string;
  items: NavItemConfig[];
}

export const topNavItems: NavItemConfig[] = [
  { icon: <DashboardIcon />, label: 'Dashboard', path: '/dashboard' },
];

export const navGroups: NavGroupConfig[] = [
  {
    label: 'Core Business',
    items: [
      { icon: <PeopleIcon />, label: 'Users', path: '/users' },
      { icon: <EventIcon />, label: 'Pods', path: '/pods' },
      { icon: <PlaceIcon />, label: 'Places', path: '/places' },
      { icon: <ViewCarouselIcon />, label: 'Sliders', path: '/sliders' },
      { icon: <LocationCityIcon />, label: 'Locations', path: '/locations' },
      { icon: <ContentCopyIcon />, label: 'Pod Templates', path: '/pod-templates' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { icon: <PaymentIcon />, label: 'Payments', path: '/payments' },
      { icon: <AccountBalanceIcon />, label: 'Finance', path: '/finance' },
    ],
  },
  {
    label: 'Communication',
    items: [{ icon: <NotificationsIcon />, label: 'Notifications', path: '/notifications' }],
  },
  {
    label: 'Support',
    items: [
      { icon: <SupportAgentIcon />, label: 'Tickets', path: '/support' },
      { icon: <PhoneCallbackIcon />, label: 'Callbacks', path: '/callbacks' },
    ],
  },
  {
    label: 'App Settings',
    items: [
      { icon: <SettingsIcon />, label: 'Settings', path: '/settings' },
      { icon: <PolicyIcon />, label: 'Policies', path: '/policies' },
      { icon: <FlagIcon />, label: 'Feature Flags', path: '/feature-flags' },
      { icon: <FeedbackIcon />, label: 'Feedback', path: '/feedback' },
      { icon: <LightbulbIcon />, label: 'Pod Ideas', path: '/pod-ideas' },
      { icon: <CodeIcon />, label: 'Dev Tools', path: '/configuration' },
    ],
  },
  {
    label: 'AI',
    items: [{ icon: <SmartToyIcon />, label: 'AI / Chatbot', path: '/ai' }],
  },
];

/** Flattened list for backward compatibility */
export const navItems: NavItemConfig[] = [...topNavItems, ...navGroups.flatMap((g) => g.items)];

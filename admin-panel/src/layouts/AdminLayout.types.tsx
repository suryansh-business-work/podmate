import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import PolicyIcon from '@mui/icons-material/Policy';
import PlaceIcon from '@mui/icons-material/Place';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import SettingsIcon from '@mui/icons-material/Settings';
import TuneIcon from '@mui/icons-material/Tune';
import FlagIcon from '@mui/icons-material/Flag';
import PaymentIcon from '@mui/icons-material/Payment';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

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

export const navItems: NavItemConfig[] = [
  { icon: <DashboardIcon />, label: 'Dashboard', path: '/dashboard' },
  { icon: <PeopleIcon />, label: 'Users', path: '/users' },
  { icon: <EventIcon />, label: 'Pods', path: '/pods' },
  { icon: <PlaceIcon />, label: 'Places', path: '/places' },
  { icon: <PolicyIcon />, label: 'Policies', path: '/policies' },
  { icon: <PaymentIcon />, label: 'Payments', path: '/payments' },
  { icon: <AccountBalanceIcon />, label: 'Finance', path: '/finance' },
  { icon: <NotificationsIcon />, label: 'Notifications', path: '/notifications' },
  { icon: <SmartToyIcon />, label: 'AI / Chatbot', path: '/ai' },
  { icon: <SupportAgentIcon />, label: 'Support', path: '/support' },
  { icon: <FlagIcon />, label: 'Feature Flags', path: '/feature-flags' },
  { icon: <SettingsIcon />, label: 'Settings', path: '/settings' },
  { icon: <TuneIcon />, label: 'Configuration', path: '/configuration' },
];

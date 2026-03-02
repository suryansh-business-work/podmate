import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import PolicyIcon from '@mui/icons-material/Policy';
import PlaceIcon from '@mui/icons-material/Place';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import SettingsIcon from '@mui/icons-material/Settings';
import TuneIcon from '@mui/icons-material/Tune';

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
  { icon: <SupportAgentIcon />, label: 'Support', path: '/support' },
  { icon: <SettingsIcon />, label: 'Settings', path: '/settings' },
  { icon: <TuneIcon />, label: 'Configuration', path: '/configuration' },
];

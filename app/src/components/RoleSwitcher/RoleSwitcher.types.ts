export interface RoleSwitcherProps {
  visible: boolean;
  roles: string[];
  activeRole: string;
  onSwitch: (role: string) => void;
  onClose: () => void;
}

export const ROLE_LABELS: Record<string, string> = {
  USER: 'User',
  VENUE_OWNER: 'Venue Owner',
  HOST: 'Host',
  ADMIN: 'Admin',
};

export const ROLE_ICONS: Record<string, string> = {
  USER: 'person',
  VENUE_OWNER: 'store',
  HOST: 'mic',
  ADMIN: 'admin-panel-settings',
};

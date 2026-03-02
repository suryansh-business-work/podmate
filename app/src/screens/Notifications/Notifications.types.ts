export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface NotificationsScreenProps {
  onBack: () => void;
}

export const NOTIFICATION_ICON_MAP: Record<string, { name: string; family: 'material' | 'community' }> = {
  pod_join: { name: 'group', family: 'material' },
  pod_update: { name: 'confirmation-number', family: 'material' },
  invite: { name: 'email', family: 'material' },
  system: { name: 'notifications', family: 'material' },
  payment: { name: 'attach-money', family: 'material' },
};

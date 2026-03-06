import { ComponentProps } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationsScreenProps {
  onBack: () => void;
}

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

export const NOTIFICATION_ICON_MAP: Record<
  string,
  { name: MaterialIconName; family: 'material' | 'community' }
> = {
  POD_JOIN: { name: 'group', family: 'material' },
  POD_LEAVE: { name: 'group-remove', family: 'material' },
  SUPPORT_REPLY: { name: 'support-agent', family: 'material' },
  GENERAL: { name: 'notifications', family: 'material' },
  pod_join: { name: 'group', family: 'material' },
  pod_update: { name: 'confirmation-number', family: 'material' },
  invite: { name: 'email', family: 'material' },
  system: { name: 'notifications', family: 'material' },
  payment: { name: 'attach-money', family: 'material' },
};

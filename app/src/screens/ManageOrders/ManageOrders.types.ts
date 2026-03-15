import { ComponentProps } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

export type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

export interface ManageOrdersScreenProps {
  onBack: () => void;
  onPodPress?: (podId: string) => void;
}

export type BookingFilter = 'ALL' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED';

export const BOOKING_FILTERS: { key: BookingFilter; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'UPCOMING', label: 'Upcoming' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

export interface BookingItem {
  id: string;
  title: string;
  hostName: string;
  hostAvatar: string;
  dateTime: string;
  currentSeats: number;
  maxSeats: number;
  feePerPerson: number;
  status: string;
  venueName: string;
  imageUrl: string;
}

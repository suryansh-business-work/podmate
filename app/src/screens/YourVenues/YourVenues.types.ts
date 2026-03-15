import { ComponentProps } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

export type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

export type VenueStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface VenueItem {
  id: string;
  name: string;
  address: string;
  city: string;
  imageUrl: string;
  status: VenueStatus;
  isVerified: boolean;
  category: string;
  createdAt: string;
}

export interface YourVenuesScreenProps {
  onBack: () => void;
  onRegisterVenue: () => void;
  onVenuePress?: (venueId: string) => void;
}

export type FilterTab = 'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED';

export const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'REJECTED', label: 'Rejected' },
];

export const STATUS_CONFIG: Record<VenueStatus, { color: string; icon: MaterialIconName }> = {
  APPROVED: { color: '#10B981', icon: 'check-circle' },
  PENDING: { color: '#F59E0B', icon: 'schedule' },
  REJECTED: { color: '#EF4444', icon: 'cancel' },
};

import { ComponentProps } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

export type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

export interface DashboardScreenProps {
  onBack: () => void;
  onProfilePress: () => void;
  onNotificationPress: () => void;
  onRegisterVenue: () => void;
}

export interface HostAnalyticsData {
  hostAnalytics: {
    numberOfPodHosts: number;
    cancelledPods: number;
    totalEarning: number;
    perPodAverageEarning: number;
    rating: number;
    hostProfileHealth: number;
  };
}

export interface VenueAnalyticsData {
  venueAnalytics: {
    totalRegisteredVenues: number;
    totalUpcomingPartyRequests: number;
    acceptedVenuePartyRequests: number;
    cancelledVenues: number;
    venueRating: number;
    totalEarnings: number;
  };
}

export interface AnalyticsCardProps {
  icon: MaterialIconName;
  iconColor: string;
  title: string;
  value: string | number;
  hint: string;
  loading?: boolean;
}

export interface HostAnalytics {
  numberOfPodHosts: number;
  cancelledPods: number;
  totalEarning: number;
  perPodAverageEarning: number;
  rating: number;
  hostProfileHealth: number;
}

export interface VenueAnalytics {
  totalRegisteredVenues: number;
  totalUpcomingPartyRequests: number;
  acceptedVenuePartyRequests: number;
  cancelledVenues: number;
  venueRating: number;
  totalEarnings: number;
}

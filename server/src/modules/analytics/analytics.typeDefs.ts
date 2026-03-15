const analyticsTypeDefs = `#graphql
  type HostAnalytics {
    numberOfPodHosts: Int!
    cancelledPods: Int!
    totalEarning: Float!
    perPodAverageEarning: Float!
    rating: Float!
    hostProfileHealth: Int!
  }

  type VenueAnalytics {
    totalRegisteredVenues: Int!
    totalUpcomingPartyRequests: Int!
    acceptedVenuePartyRequests: Int!
    cancelledVenues: Int!
    venueRating: Float!
    totalEarnings: Float!
  }
`;

export default analyticsTypeDefs;

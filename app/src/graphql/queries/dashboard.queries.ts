import { gql } from '@apollo/client';

export const GET_HOST_ANALYTICS = gql`
  query GetHostAnalytics {
    hostAnalytics {
      numberOfPodHosts
      cancelledPods
      totalEarning
      perPodAverageEarning
      rating
      hostProfileHealth
    }
  }
`;

export const GET_VENUE_ANALYTICS = gql`
  query GetVenueAnalytics {
    venueAnalytics {
      totalRegisteredVenues
      totalUpcomingPartyRequests
      acceptedVenuePartyRequests
      cancelledVenues
      venueRating
      totalEarnings
    }
  }
`;

import analyticsResolvers from '../analytics.resolvers';
import * as analyticsService from '../analytics.services';
import type { GraphQLContext } from '../../auth/auth.models';
import { UserRole } from '../../user/user.models';

jest.mock('../analytics.services');

const mockContext: GraphQLContext = {
  user: { userId: 'u1', phone: '+91999', roles: [UserRole.HOST] },
};

const unauthContext: GraphQLContext = { user: null };

describe('analytics.resolvers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns host analytics for authenticated user', async () => {
    const mockData = {
      numberOfPodHosts: 5,
      cancelledPods: 1,
      totalEarning: 1000,
      perPodAverageEarning: 500,
      rating: 4.2,
      hostProfileHealth: 80,
    };
    (analyticsService.getHostAnalytics as jest.Mock).mockResolvedValue(mockData);

    const result = await analyticsResolvers.Query.hostAnalytics(undefined, undefined, mockContext);

    expect(result).toEqual(mockData);
    expect(analyticsService.getHostAnalytics).toHaveBeenCalledWith('u1');
  });

  it('returns venue analytics for authenticated user', async () => {
    const mockData = {
      totalRegisteredVenues: 3,
      totalUpcomingPartyRequests: 2,
      acceptedVenuePartyRequests: 1,
      cancelledVenues: 0,
      venueRating: 4.0,
      totalEarnings: 5000,
    };
    (analyticsService.getVenueAnalytics as jest.Mock).mockResolvedValue(mockData);

    const result = await analyticsResolvers.Query.venueAnalytics(undefined, undefined, mockContext);

    expect(result).toEqual(mockData);
    expect(analyticsService.getVenueAnalytics).toHaveBeenCalledWith('u1');
  });

  it('throws for unauthenticated hostAnalytics', () => {
    expect(() =>
      analyticsResolvers.Query.hostAnalytics(undefined, undefined, unauthContext),
    ).toThrow();
  });

  it('throws for unauthenticated venueAnalytics', () => {
    expect(() =>
      analyticsResolvers.Query.venueAnalytics(undefined, undefined, unauthContext),
    ).toThrow();
  });
});

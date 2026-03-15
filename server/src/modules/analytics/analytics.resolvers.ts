import type { GraphQLContext } from '../auth/auth.models';
import { requireAuth } from '../auth/auth.services';
import * as analyticsService from './analytics.services';

const analyticsResolvers = {
  Query: {
    hostAnalytics: (_: unknown, __: unknown, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return analyticsService.getHostAnalytics(auth.userId);
    },

    venueAnalytics: (_: unknown, __: unknown, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return analyticsService.getVenueAnalytics(auth.userId);
    },
  },
};

export default analyticsResolvers;

import type { GraphQLContext } from '../auth/auth.models';
import type { CreatePlaceInput, UpdatePlaceInput } from './place.models';
import { PlaceStatus } from './place.models';
import { UserRole } from '../user/user.models';
import { requireAuth, requireRole } from '../auth/auth.services';
import * as placeService from './place.services';
import { createPlaceSchema, updatePlaceSchema } from './place.validators';

const placeResolvers = {
  Query: {
    places: (
      _: unknown,
      args: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        sortBy?: string;
        order?: string;
      },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return placeService.getPaginatedPlaces({
        page: args.page ?? 1,
        limit: args.limit ?? 20,
        search: args.search,
        status: args.status as PlaceStatus | undefined,
        sortBy: args.sortBy,
        order: (args.order as 'ASC' | 'DESC') ?? 'DESC',
      });
    },

    place: (_: unknown, args: { id: string }) => {
      return placeService.getPlaceById(args.id) ?? null;
    },

    myPlaces: (_: unknown, __: unknown, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return placeService.getPlacesByOwner(auth.userId);
    },

    approvedPlaces: (_: unknown, args: { search?: string }, context: GraphQLContext) => {
      requireAuth(context);
      return placeService.getApprovedPlaces(args.search);
    },
  },

  Mutation: {
    createPlace: (_: unknown, args: { input: CreatePlaceInput }, context: GraphQLContext) => {
      const auth = requireAuth(context);
      const validated = createPlaceSchema.parse(args.input);
      return placeService.createPlace(validated, auth.userId);
    },

    adminCreatePlace: (
      _: unknown,
      args: { input: CreatePlaceInput; ownerId: string },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      const validated = createPlaceSchema.parse(args.input);
      return placeService.adminCreatePlace(validated, args.ownerId);
    },

    updatePlace: (
      _: unknown,
      args: { id: string; input: UpdatePlaceInput },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      const validated = updatePlaceSchema.parse(args.input);
      return placeService.updatePlace(args.id, validated);
    },

    approvePlace: (_: unknown, args: { id: string }, context: GraphQLContext) => {
      requireRole(context, UserRole.ADMIN);
      return placeService.approvePlace(args.id);
    },

    rejectPlace: (_: unknown, args: { id: string }, context: GraphQLContext) => {
      requireRole(context, UserRole.ADMIN);
      return placeService.rejectPlace(args.id);
    },

    deletePlace: (_: unknown, args: { id: string }, context: GraphQLContext) => {
      requireRole(context, UserRole.ADMIN);
      return placeService.deletePlace(args.id);
    },

    bulkDeletePlaces: (_: unknown, args: { ids: string[] }, context: GraphQLContext) => {
      requireRole(context, UserRole.ADMIN);
      return placeService.bulkDeletePlaces(args.ids);
    },
  },

  Place: {
    owner: (place: { ownerId: string }) => placeService.resolveOwner(place.ownerId),
  },
};

export default placeResolvers;

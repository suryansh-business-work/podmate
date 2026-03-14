import type { GraphQLContext } from '../auth/auth.models';
import { CreateCityInput, UpdateCityInput, CreateAreaInput } from './location.models';
import * as locationService from './location.services';
import { validateCreateCity, validateUpdateCity, validateCreateArea } from './location.validators';

const locationResolvers = {
  Query: {
    cities: async (
      _: unknown,
      args: { page?: number; limit?: number; search?: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user || ctx.user.role !== 'ADMIN') throw new Error('Admin access required');
      return locationService.getCities(args.page ?? 1, args.limit ?? 50, args.search);
    },
    activeCities: async () => {
      return locationService.getActiveCities();
    },
    topCities: async () => {
      return locationService.getTopCities();
    },
    city: async (_: unknown, { id }: { id: string }) => {
      return locationService.getCityById(id);
    },
    resolveLocation: async (
      _: unknown,
      { latitude, longitude }: { latitude: number; longitude: number },
    ) => {
      const result = await locationService.resolveLocationByCoords(latitude, longitude);
      if (!result) throw new Error('Unable to resolve location');
      return result;
    },
    resolveLocationByPincode: async (
      _: unknown,
      { pincode, country }: { pincode: string; country?: string },
    ) => {
      const result = await locationService.resolveLocationByPincode(pincode, country);
      if (!result) throw new Error('Unable to resolve pincode');
      return result;
    },
    searchGooglePlaces: async (
      _: unknown,
      { input, sessionToken }: { input: string; sessionToken?: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) throw new Error('Authentication required');
      return locationService.searchGooglePlaces(input, sessionToken);
    },
    googlePlaceDetails: async (
      _: unknown,
      { placeId }: { placeId: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) throw new Error('Authentication required');
      return locationService.resolveGooglePlaceDetails(placeId);
    },
  },
  Mutation: {
    createCity: async (_: unknown, { input }: { input: CreateCityInput }, ctx: GraphQLContext) => {
      if (!ctx.user || ctx.user.role !== 'ADMIN') throw new Error('Admin access required');
      const err = validateCreateCity(input);
      if (err) throw new Error(err);
      return locationService.createCity(input);
    },
    updateCity: async (
      _: unknown,
      { id, input }: { id: string; input: UpdateCityInput },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user || ctx.user.role !== 'ADMIN') throw new Error('Admin access required');
      const err = validateUpdateCity(input);
      if (err) throw new Error(err);
      const updated = await locationService.updateCity(id, input);
      if (!updated) throw new Error('City not found');
      return updated;
    },
    deleteCity: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      if (!ctx.user || ctx.user.role !== 'ADMIN') throw new Error('Admin access required');
      return locationService.deleteCity(id);
    },
    addArea: async (_: unknown, { input }: { input: CreateAreaInput }, ctx: GraphQLContext) => {
      if (!ctx.user || ctx.user.role !== 'ADMIN') throw new Error('Admin access required');
      const err = validateCreateArea(input);
      if (err) throw new Error(err);
      return locationService.addArea(input);
    },
    removeArea: async (
      _: unknown,
      { cityId, areaId }: { cityId: string; areaId: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user || ctx.user.role !== 'ADMIN') throw new Error('Admin access required');
      return locationService.removeArea(cityId, areaId);
    },
    addPincodeToCity: async (
      _: unknown,
      { cityId, pincode }: { cityId: string; pincode: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user || ctx.user.role !== 'ADMIN') throw new Error('Admin access required');
      if (!pincode.trim()) throw new Error('Pincode is required');
      const result = await locationService.addPincodeToCity(cityId, pincode);
      if (!result) throw new Error('City not found');
      return result;
    },
    removePincodeFromCity: async (
      _: unknown,
      { cityId, pincode }: { cityId: string; pincode: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user || ctx.user.role !== 'ADMIN') throw new Error('Admin access required');
      const result = await locationService.removePincodeFromCity(cityId, pincode);
      if (!result) throw new Error('City not found');
      return result;
    },
    addPincodeToArea: async (
      _: unknown,
      { cityId, areaId, pincode }: { cityId: string; areaId: string; pincode: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user || ctx.user.role !== 'ADMIN') throw new Error('Admin access required');
      if (!pincode.trim()) throw new Error('Pincode is required');
      const result = await locationService.addPincodeToArea(cityId, areaId, pincode);
      if (!result) throw new Error('City or area not found');
      return result;
    },
    removePincodeFromArea: async (
      _: unknown,
      { cityId, areaId, pincode }: { cityId: string; areaId: string; pincode: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user || ctx.user.role !== 'ADMIN') throw new Error('Admin access required');
      const result = await locationService.removePincodeFromArea(cityId, areaId, pincode);
      if (!result) throw new Error('City or area not found');
      return result;
    },
  },
};

export default locationResolvers;

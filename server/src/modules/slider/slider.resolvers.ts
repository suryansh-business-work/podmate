import type { GraphQLContext } from '../auth/auth.models';
import { CreateSliderInput, UpdateSliderInput } from './slider.models';
import * as sliderService from './slider.services';
import { validateCreateSlider, validateUpdateSlider } from './slider.validators';

const sliderResolvers = {
  Query: {
    sliders: async (
      _: unknown,
      args: { page?: number; limit?: number; search?: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user || ctx.user.role !== 'ADMIN') throw new Error('Admin access required');
      return sliderService.getSliders(args.page ?? 1, args.limit ?? 20, args.search);
    },
    activeSliders: async (_: unknown, args: { city?: string }) => {
      return sliderService.getActiveSliders(args.city);
    },
  },
  Mutation: {
    createSlider: async (_: unknown, { input }: { input: CreateSliderInput }, ctx: GraphQLContext) => {
      if (!ctx.user || ctx.user.role !== 'ADMIN') throw new Error('Admin access required');
      const err = validateCreateSlider(input);
      if (err) throw new Error(err);
      return sliderService.createSlider(input);
    },
    updateSlider: async (
      _: unknown,
      { id, input }: { id: string; input: UpdateSliderInput },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user || ctx.user.role !== 'ADMIN') throw new Error('Admin access required');
      const err = validateUpdateSlider(input);
      if (err) throw new Error(err);
      const updated = await sliderService.updateSlider(id, input);
      if (!updated) throw new Error('Slider not found');
      return updated;
    },
    deleteSlider: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      if (!ctx.user || ctx.user.role !== 'ADMIN') throw new Error('Admin access required');
      return sliderService.deleteSlider(id);
    },
  },
};

export default sliderResolvers;

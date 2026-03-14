import type { GraphQLContext } from '../auth/auth.models';
import { CreateSliderInput, UpdateSliderInput, SliderModel } from './slider.models';
import * as sliderService from './slider.services';
import { validateCreateSlider, validateUpdateSlider } from './slider.validators';

const MAX_SLIDERS = 8;

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
      const count = await SliderModel.countDocuments();
      if (count >= MAX_SLIDERS) {
        throw new Error(`Maximum ${MAX_SLIDERS} sliders allowed. Please delete one before adding a new slider.`);
      }
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
    reorderSliders: async (
      _: unknown,
      { orderedIds }: { orderedIds: string[] },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user || ctx.user.role !== 'ADMIN') throw new Error('Admin access required');
      if (!orderedIds || orderedIds.length === 0) throw new Error('orderedIds is required');
      return sliderService.reorderSliders(orderedIds);
    },
  },
};

export default sliderResolvers;

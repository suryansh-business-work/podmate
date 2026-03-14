import {
  SliderModel,
  toSlider,
  Slider,
  PaginatedSliders,
  CreateSliderInput,
  UpdateSliderInput,
} from './slider.models';

export async function getSliders(
  page: number,
  limit: number,
  search?: string,
  city?: string,
): Promise<PaginatedSliders> {
  const filter: Record<string, unknown> = {};
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { subtitle: { $regex: search, $options: 'i' } },
    ];
  }
  if (city) {
    filter.$or = [{ locationCity: { $regex: city, $options: 'i' } }, { locationCity: '' }];
  }
  const total = await SliderModel.countDocuments(filter);
  const totalPages = Math.ceil(total / limit) || 1;
  const docs = await SliderModel.find(filter)
    .sort({ sortOrder: 1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return {
    items: docs.map((d) => toSlider(d)!),
    total,
    page,
    limit,
    totalPages,
  };
}

export async function getActiveSliders(city?: string): Promise<Slider[]> {
  const filter: Record<string, unknown> = { isActive: true };
  if (city) {
    filter.$or = [{ locationCity: { $regex: city, $options: 'i' } }, { locationCity: '' }];
  }
  const docs = await SliderModel.find(filter).sort({ sortOrder: 1 }).lean();
  return docs.map((d) => toSlider(d)!);
}

export async function getSliderById(id: string): Promise<Slider | null> {
  const doc = await SliderModel.findById(id).lean();
  return toSlider(doc);
}

export async function createSlider(input: CreateSliderInput): Promise<Slider> {
  const doc = await SliderModel.create({
    title: input.title.trim(),
    subtitle: input.subtitle?.trim() ?? '',
    imageUrl: input.imageUrl.trim(),
    ctaText: input.ctaText?.trim() ?? '',
    ctaLink: input.ctaLink?.trim() ?? '',
    category: input.category?.trim() ?? '',
    locationCity: input.locationCity?.trim() ?? '',
    sortOrder: input.sortOrder ?? 0,
    isActive: input.isActive ?? true,
  });
  return toSlider(doc.toObject())!;
}

export async function updateSlider(id: string, input: UpdateSliderInput): Promise<Slider | null> {
  const updateData: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (input.title !== undefined) updateData.title = input.title.trim();
  if (input.subtitle !== undefined) updateData.subtitle = input.subtitle.trim();
  if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl.trim();
  if (input.ctaText !== undefined) updateData.ctaText = input.ctaText.trim();
  if (input.ctaLink !== undefined) updateData.ctaLink = input.ctaLink.trim();
  if (input.category !== undefined) updateData.category = input.category.trim();
  if (input.locationCity !== undefined) updateData.locationCity = input.locationCity.trim();
  if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;
  if (input.isActive !== undefined) updateData.isActive = input.isActive;

  const doc = await SliderModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
  return toSlider(doc);
}

export async function deleteSlider(id: string): Promise<boolean> {
  const result = await SliderModel.findByIdAndDelete(id);
  return !!result;
}

export async function reorderSliders(orderedIds: string[]): Promise<boolean> {
  const ops = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { sortOrder: index, updatedAt: new Date().toISOString() } },
    },
  }));
  await SliderModel.bulkWrite(ops);
  return true;
}
